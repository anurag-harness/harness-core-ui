/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import {
  dependentFlagsResponse,
  noDependentFlagsResponse
} from '@cf/components/FlagArchiving/__tests__/__data__/dependentFlagsMock'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import * as gitSync from '@cf/hooks/useGitSync'
import * as cfServices from 'services/cf'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import mockArchivedFeature from '@cf/utils/testData/data/archivedFeature.mock'
import type { FlagOptionsMenuButtonProps } from '../FlagOptionsMenuButton'
import FlagOptionsMenuButton from '../FlagOptionsMenuButton'

const renderComponent = (props: Partial<FlagOptionsMenuButtonProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagOptionsMenuButton
        flagData={mockArchivedFeature}
        gitSync={{ ...mockGitSync, isGitSyncEnabled: false }}
        deleteFlag={jest.fn()}
        queryParams={{
          accountIdentifier: 'test_acc',
          orgIdentifier: 'test_org',
          projectIdentifier: 'test_project',
          commitMsg: 'test message'
        }}
        refetchFlags={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}

describe('FlagOptionsMenuButton', () => {
  beforeEach(() => {
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })
    jest.clearAllMocks()
  })

  test('it should render a DELETE and RESTORE button on an archived Flag', async () => {
    renderComponent()

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    expect(document.querySelector('[data-icon="redo"]')).toBeInTheDocument()
    expect(document.querySelector('[data-icon="trash"]')).toBeInTheDocument()

    expect(screen.getByText('cf.featureFlags.archiving.restore')).toBeInTheDocument()
    expect(screen.getByText('delete')).toBeInTheDocument()
  })

  test('it should redirect user to Feature Flags Detail page when user clicks the Edit option on a Flag that has not been archived', async () => {
    renderComponent({ flagData: mockFeature })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)

    expect(document.querySelector('[data-icon="edit"]')).toBeInTheDocument()

    await userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

    expect(screen.getByTestId('location')).toHaveTextContent(
      `/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/${mockFeature.identifier}`
    )
  })

  test('it should render confirm modal correctly when delete option clicked on an archived Flag', async () => {
    renderComponent()

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(screen.getByText('cf.featureFlags.deleteFlag')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.deleteFlagMessage')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.deleteFlagWarning')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
  })

  test('it should close confirm modal when cancel option clicked', async () => {
    renderComponent()

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(screen.getByText('cf.featureFlags.deleteFlag')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.deleteFlagMessage')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    expect(screen.queryByText('cf.featureFlags.deleteFlag')).not.toBeInTheDocument()
  })

  test('it should display plan enforcement popup when limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

    renderComponent()

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)

    fireEvent.mouseOver(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequiredMau')).toBeInTheDocument())
  })

  test('it should call callback when confirm delete button clicked', async () => {
    const deleteFlagMock = jest.fn()

    renderComponent({ deleteFlag: deleteFlagMock })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(await screen.findByRole('button', { name: 'delete' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))

    expect(deleteFlagMock).toBeCalledWith('new_flag', {
      queryParams: {
        accountIdentifier: 'test_acc',
        commitMsg: '',
        orgIdentifier: 'test_org',
        projectIdentifier: 'test_project',
        forceDelete: true
      }
    })
  })

  test('it should show error toaster when callback fails', async () => {
    const deleteFlagMock = jest.fn().mockRejectedValueOnce({ message: 'Failed to Fetch' })
    const refetchFlagMock = jest.fn()

    renderComponent({ deleteFlag: deleteFlagMock, refetchFlags: refetchFlagMock })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))

    //modal closes and error toaster appears
    await waitFor(() => {
      expect(screen.queryByText('cf.featureFlags.deleteFlag')).not.toBeInTheDocument()
      expect(screen.queryByText('Failed to Fetch')).toBeInTheDocument()
      expect(refetchFlagMock).not.toBeCalled()
    })
  })

  test('it should open Git Modal when confirm delete button clicked and Git Sync enabled', async () => {
    jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
    const deleteFlagMock = jest.fn()

    renderComponent({ deleteFlag: deleteFlagMock, gitSync: mockGitSync })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))
    expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()
  })

  test('it should close Git Modal when cancel button clicked', async () => {
    jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
    const deleteFlagMock = jest.fn()

    renderComponent({ deleteFlag: deleteFlagMock, gitSync: mockGitSync })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))
    expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('save-flag-to-git-modal-cancel-button'))

    expect(document.querySelector('#save-flag-to-git-modal-body')).not.toBeInTheDocument()
  })

  test('it should call callback when confirm delete button clicked and Git Sync autocommit enabled', async () => {
    const deleteFlagMock = jest.fn()

    renderComponent({
      deleteFlag: deleteFlagMock,
      gitSync: { ...mockGitSync, isAutoCommitEnabled: true }
    })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))

    expect(deleteFlagMock).toBeCalledWith('new_flag', {
      queryParams: {
        accountIdentifier: 'test_acc',
        commitMsg: '',
        orgIdentifier: 'test_org',
        projectIdentifier: 'test_project',
        forceDelete: true
      }
    })
  })

  test('it should call callback when Git Modal confirm button clicked', async () => {
    jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
    const deleteFlagMock = jest.fn()

    renderComponent({ deleteFlag: deleteFlagMock, gitSync: mockGitSync })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(await screen.findByRole('button', { name: 'delete' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))
    expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()

    // enter a commit message
    const commitTextbox = screen.getByPlaceholderText('common.git.commitMessage')
    await userEvent.type(commitTextbox, 'test commit message')

    // submit
    await userEvent.click(screen.getByTestId('save-flag-to-git-modal-save-button'))

    await waitFor(() =>
      expect(deleteFlagMock).toBeCalledWith('new_flag', {
        queryParams: {
          accountIdentifier: 'test_acc',
          commitMsg: 'test commit message',
          orgIdentifier: 'test_org',
          projectIdentifier: 'test_project',
          forceDelete: true
        }
      })
    )
  })

  test('it should call callback when Git Modal confirm button clicked', async () => {
    jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
    const deleteFlagMock = jest.fn()

    renderComponent({ deleteFlag: deleteFlagMock, gitSync: mockGitSync })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))
    expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()

    // enter a commit message
    const commitTextbox = screen.getByPlaceholderText('common.git.commitMessage')
    await userEvent.type(commitTextbox, 'test commit message')

    // submit
    await userEvent.click(screen.getByTestId('save-flag-to-git-modal-save-button'))

    await waitFor(() =>
      expect(deleteFlagMock).toBeCalledWith('new_flag', {
        queryParams: {
          accountIdentifier: 'test_acc',
          commitMsg: 'test commit message',
          orgIdentifier: 'test_org',
          projectIdentifier: 'test_project',
          forceDelete: true
        }
      })
    )
  })

  test('it should call auto commit endpoint when auto commit value selected in Git Modal', async () => {
    jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
    const deleteFlagMock = jest.fn()
    const handleAutoCommitMock = jest.fn()

    renderComponent({
      deleteFlag: deleteFlagMock,
      gitSync: { ...mockGitSync, handleAutoCommit: handleAutoCommitMock }
    })

    await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

    expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'delete' }))
    expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()

    // enter a commit message
    const commitTextbox = screen.getByPlaceholderText('common.git.commitMessage')
    await userEvent.type(commitTextbox, 'test commit message')

    // toggle autocommit value
    const autoCommitCheckbox = document.querySelector("input[name='autoCommit']") as HTMLInputElement
    await userEvent.click(autoCommitCheckbox)
    expect(autoCommitCheckbox).toBeChecked()

    // submit
    await userEvent.click(screen.getByTestId('save-flag-to-git-modal-save-button'))

    await waitFor(() => expect(handleAutoCommitMock).toBeCalledWith(true))
  })

  describe('Archiving', () => {
    test('it should render an EDIT and ARCHIVE button on a Flag that has not been archived', async () => {
      renderComponent({ flagData: mockFeature })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      expect(document.querySelector('[data-icon="edit"]')).toBeInTheDocument()
      expect(document.querySelector('[data-icon="archive"]')).toBeInTheDocument()

      expect(screen.getAllByText('edit')[1]).toBeInTheDocument()
      expect(screen.getAllByText('archive')[1]).toBeInTheDocument()
    })

    test('it should render archive modal when user clicks on the archive menu button', async () => {
      // archive modal will only render if there are no dependent flags returned from this api call
      jest.spyOn(cfServices, 'useGetDependentFeatures').mockReturnValue({
        refetch: jest.fn(),
        loading: false,
        error: null,
        data: noDependentFlagsResponse
      } as any)

      renderComponent({ flagData: mockFeature })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="archive"]') as HTMLButtonElement)

      await waitFor(() => {
        expect(screen.getByText('cf.featureFlags.archiving.archiveFlag')).toBeInTheDocument()
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })
    })

    test('it should render the CannotArchiveWarning modal when user clicks on the archive menu button on a flag with dependent flags ', async () => {
      jest.spyOn(cfServices, 'useGetDependentFeatures').mockReturnValue({
        refetch: jest.fn(),
        loading: false,
        error: null,
        data: dependentFlagsResponse
      } as any)

      renderComponent({ flagData: mockFeature })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="archive"]') as HTMLButtonElement)

      expect(screen.getByText('cf.featureFlags.archiving.archiveFlag')).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.archiving.cannotArchive')).toBeInTheDocument()

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    test('it should handle error if api fails to return dependent flags', async () => {
      const error = 'FAIL TO GET DEPENDENT FLAGS'

      jest.spyOn(cfServices, 'useGetDependentFeatures').mockReturnValue({
        refetch: jest.fn(),
        loading: false,
        error,
        data: null
      } as any)

      renderComponent({ flagData: mockFeature })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="archive"]') as HTMLButtonElement)

      await waitFor(() => expect(screen.getByText(error)).toBeInTheDocument())
    })

    test('it should render a RESTORE button when the selected flag is an ARCHIVED flag', async () => {
      const archivedFlagMock = cloneDeep(mockArchivedFeature)
      archivedFlagMock.archived = true

      renderComponent({ flagData: archivedFlagMock })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)

      expect(document.querySelector('[data-icon="redo"]')).toBeInTheDocument()
      expect(document.querySelector('[data-icon="trash"]')).toBeInTheDocument()

      expect(screen.getByText('cf.featureFlags.archiving.restore')).toBeInTheDocument()
      expect(screen.getByText('trash')).toBeInTheDocument()
    })
  })
})
