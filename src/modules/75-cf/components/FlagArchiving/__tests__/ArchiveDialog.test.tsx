import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { cloneDeep } from 'lodash-es'
import * as yup from 'yup'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import type { GitRepo } from 'services/cf'
import mockFeature from '@cf/components/EditFlagTabs/__tests__/mockFeature'
import mockGitSync, { mockDisabledGitSync } from '@cf/utils/testData/data/mockGitSync'
import { FFGitSyncProvider } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import ArchiveDialog, { ArchiveDialogProps } from '../ArchiveDialog'
import { buildMockDependentFlags } from './__data__/dependentFlagsMock'

const queryParamsMock = {
  accountIdentifier: 'mockAccountIdentifier',
  orgIdentifier: 'mockOrgIdentifier',
  projectIdentifier: 'mockProjectIdentifier',
  forceDelete: false,
  commitMsg: ''
}

const renderComponent = (props: Partial<ArchiveDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper>
      <FFGitSyncProvider>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <ArchiveDialog
            archiveFlag={jest.fn()}
            flagIdentifier={mockFeature.identifier}
            flagName={mockFeature.name}
            gitSync={mockDisabledGitSync}
            onSuccess={jest.fn()}
            queryParams={queryParamsMock}
            setShowArchiveDialog={jest.fn()}
            {...props}
          />
        </Formik>
      </FFGitSyncProvider>
    </TestWrapper>
  )
}

describe('ArchiveDialog', () => {
  const useGetDependentFeaturesMock = jest.spyOn(cfServices, 'useGetDependentFeatures')

  jest.spyOn(cfServices, 'useGetGitRepo').mockReturnValue({
    loading: false,
    refetch: jest.fn(),
    data: { repoSet: false }
  } as any)

  beforeEach(() => {
    useGetDependentFeaturesMock.mockReturnValue({
      data: buildMockDependentFlags(0, false),
      error: null,
      refetch: jest.fn()
    } as any)

    jest.clearAllMocks()
  })

  test('it should display CannotArchiveWarning component if there are dependent flags associated with selected flag', async () => {
    const isDependentFlagResponse = true

    useGetDependentFeaturesMock.mockReturnValue({
      data: buildMockDependentFlags(2, isDependentFlagResponse),
      error: null,
      refetch: jest.fn()
    } as any)

    const dependentFlagsResponse = buildMockDependentFlags(2, isDependentFlagResponse)

    renderComponent()

    expect(screen.getByText('cf.featureFlags.archiving.cannotArchive')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.archiving.removeFlag')).toBeInTheDocument()

    expect(screen.getAllByRole('link')).toHaveLength(dependentFlagsResponse.features.length)

    const flagId = screen.getAllByTestId('flagIdentifierLabel')

    expect(flagId[0]).toHaveTextContent(dependentFlagsResponse.features[0].identifier)
    expect(flagId[1]).toHaveTextContent(dependentFlagsResponse.features[1].identifier)

    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'archive' })).not.toBeInTheDocument()
    expect(screen.queryByText('cf.featureFlags.archiving.warningDescription')).not.toBeInTheDocument()
  })

  test('it should display paginated CannotArchiveWarning component if number of dependents exceeds 15', async () => {
    const isDependentFlagResponse = true

    useGetDependentFeaturesMock.mockReturnValue({
      data: buildMockDependentFlags(20, isDependentFlagResponse),
      error: null,
      refetch: jest.fn(),
      loading: false
    } as any)

    renderComponent()

    expect(screen.getByText('cf.featureFlags.archiving.cannotArchive')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.archiving.removeFlag')).toBeInTheDocument()

    // Pagination component
    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'archive' })).not.toBeInTheDocument()
    expect(screen.queryByText('cf.featureFlags.archiving.warningDescription')).not.toBeInTheDocument()
  })

  test('it should validate the flag identifier and prevent submission if the flag identifier does not match', async () => {
    const incorrectFlagIdentifier = 'foobar'
    const pastedText = 'hello world'

    renderComponent()

    await userEvent.type(screen.getByRole('textbox'), incorrectFlagIdentifier)

    const archiveFlagTextbox = screen.getByRole('textbox')
    const archiveBtn = screen.getByRole('button', { name: 'archive' })

    expect(archiveFlagTextbox).toHaveValue(incorrectFlagIdentifier)
    expect(screen.getByText('cf.featureFlags.archiving.mismatchIdentifierError')).toBeInTheDocument()
    expect(archiveBtn).toBeDisabled()

    await userEvent.clear(archiveFlagTextbox)

    // checking user cannot paste into textbox so they have to manually type in the flag identifier
    fireEvent.paste(archiveFlagTextbox, pastedText)
    expect(archiveFlagTextbox).not.toHaveValue(pastedText)

    await userEvent.clear(archiveFlagTextbox)
    await userEvent.type(archiveFlagTextbox, mockFeature.identifier)

    expect(screen.queryByText('cf.featureFlags.archiving.mismatchIdentifierError')).not.toBeInTheDocument()
    expect(archiveBtn).toBeEnabled()
  })

  test('it should allow user to archive a flag', async () => {
    const archiveFeatureFlagMock = jest.fn()
    const onSuccessMock = jest.fn()

    renderComponent({ archiveFlag: archiveFeatureFlagMock, onSuccess: onSuccessMock })

    expect(screen.queryByRole('button', { name: 'Prev' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

    await userEvent.type(screen.getByRole('textbox'), mockFeature.identifier)
    await userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => {
      expect(archiveFeatureFlagMock).toHaveBeenCalledWith(mockFeature.identifier, {
        queryParams: { ...queryParamsMock }
      })
      expect(onSuccessMock).toHaveBeenCalled()
    })
  })

  test('it should display a loading spinner when component is loading dependent flags', async () => {
    useGetDependentFeaturesMock.mockReturnValue({
      data: null,
      error: null,
      refetch: jest.fn(),
      loading: true
    } as any)

    renderComponent()

    expect(document.querySelector('.bp3-spinner')).toBeInTheDocument()
  })

  test('it should display a correct error state', async () => {
    const error = 'FAIL TO LOAD DEPENDENT FLAGS'
    const refetchMock = jest.fn()

    useGetDependentFeaturesMock.mockReturnValue({
      data: null,
      error,
      refetch: refetchMock,
      loading: false
    } as any)

    renderComponent()

    expect(screen.getByText(error)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetchMock).toBeCalled()
  })

  test('it should handle errors if it fails to archive a flag', async () => {
    const archiveFeatureFlagMock = jest.fn()
    const onSuccessMock = jest.fn()

    const error = 'FAIL TO ARCHIVE'

    archiveFeatureFlagMock.mockRejectedValue({ message: error })
    renderComponent({ archiveFlag: archiveFeatureFlagMock, onSuccess: onSuccessMock })

    await userEvent.type(screen.getByRole('textbox'), mockFeature.identifier)

    await userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => {
      expect(screen.getByText(error)).toBeInTheDocument()
      expect(onSuccessMock).not.toHaveBeenCalled()
    })
  })
})

describe('ArchiveDialog with Git', () => {
  const setUseGitRepoMock = (repoDetails: Partial<GitRepo> = {}, repoSet = true): void => {
    jest.spyOn(cfServices, 'useGetGitRepo').mockReturnValue({
      loading: false,
      refetch: jest.fn(),
      data: {
        repoDetails: {
          autoCommit: repoDetails.autoCommit || false,
          branch: repoDetails.branch || 'main',
          enabled: repoDetails.enabled ?? true,
          filePath: repoDetails.filePath || '/flags.yaml',
          repoIdentifier: repoDetails.repoIdentifier || 'harnesstest',
          rootFolder: repoDetails.rootFolder || '/.harness/',
          yamlError: repoDetails.yamlError || ''
        },
        repoSet: repoSet
      }
    } as any)
  }

  test('it should open Git Modal if project is integrated with Git', async () => {
    const customCommitMessage = 'MY COMMIT MESSAGE'
    const archiveFlagMock = jest.fn()

    setUseGitRepoMock({ autoCommit: false })

    renderComponent({ archiveFlag: archiveFlagMock, gitSync: mockGitSync })

    await userEvent.type(screen.getByRole('textbox'), mockFeature.identifier)

    await userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => expect(screen.getByTestId('save-flag-to-git-modal-body')).toBeInTheDocument())

    const commitMessageTextbox = screen.getByPlaceholderText('common.git.commitMessage')

    await userEvent.clear(commitMessageTextbox)
    await userEvent.type(commitMessageTextbox, customCommitMessage)

    expect(commitMessageTextbox).toHaveValue(customCommitMessage)

    // click confirm save to git button
    await userEvent.click(screen.getByRole('button', { name: 'save' }))

    await waitFor(() => {
      expect(archiveFlagMock).toHaveBeenCalledWith('Test_Bool_Flag', {
        queryParams: {
          accountIdentifier: 'mockAccountIdentifier',
          commitMsg: customCommitMessage,
          forceDelete: false,
          orgIdentifier: 'mockOrgIdentifier',
          projectIdentifier: 'mockProjectIdentifier'
        }
      })
    })
  })

  test('it should autocommit with default commit message if git autocommit is toggled on', async () => {
    const defaultGitCommitMessage = 'DEFAULT GIT COMMIT MESSAGE'

    const mockAutoCommitGitSync = cloneDeep(mockGitSync)
    mockAutoCommitGitSync.isAutoCommitEnabled = true

    mockAutoCommitGitSync.getGitSyncFormMeta = jest.fn(() => ({
      gitSyncInitialValues: {
        gitDetails: {
          commitMsg: defaultGitCommitMessage,
          branch: 'main',
          filePath: '/flags.yaml',
          repoIdentifier: 'harnesstest',
          rootFolder: '/.harness/'
        },
        autoCommit: true
      },
      gitSyncValidationSchema: yup.object().shape({
        commitMsg: yup.string()
      })
    }))

    const archiveFlagMock = jest.fn()

    setUseGitRepoMock({ autoCommit: true })

    renderComponent({ archiveFlag: archiveFlagMock, gitSync: mockAutoCommitGitSync })

    await userEvent.type(screen.getByRole('textbox'), mockFeature.identifier)

    await userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => {
      expect(screen.queryByTestId('save-flag-to-git-modal-body')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'save' })).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(archiveFlagMock).toHaveBeenCalledWith('Test_Bool_Flag', {
        queryParams: {
          accountIdentifier: 'mockAccountIdentifier',
          commitMsg: defaultGitCommitMessage,
          forceDelete: false,
          orgIdentifier: 'mockOrgIdentifier',
          projectIdentifier: 'mockProjectIdentifier'
        }
      })
    })
  })
})
