/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import * as cfServices from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockFeatureResponse from '@cf/utils/testData/data/mockFeatureResponse'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import {
  dependentFlagsResponse,
  noDependentFlagsResponse
} from '@cf/components/FlagArchiving/__tests__/__data__/dependentFlagsMock'
import * as gitSync from '@cf/hooks/useGitSync'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { FlagDetailsOptionsMenuButtonProps } from '../FlagDetailsOptionsMenuButton'
import FlagDetailsOptionsMenuButton from '../FlagDetailsOptionsMenuButton'

const renderComponent = (
  isArchivingFFOn = false,
  props: Partial<FlagDetailsOptionsMenuButtonProps> = {}
): RenderResult => {
  return render(
    <TestWrapper
      defaultFeatureFlagValues={{ FFM_7921_ARCHIVING_FEATURE_FLAGS: isArchivingFFOn }}
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagDetailsOptionsMenuButton
        featureFlag={mockFeature}
        gitSync={{ ...mockGitSync, isGitSyncEnabled: false }}
        deleteFeatureFlag={jest.fn()}
        queryParams={{
          accountIdentifier: 'test_acc',
          orgIdentifier: 'test_org',
          projectIdentifier: 'test_project',
          commitMsg: 'test message'
        }}
        refetchFlag={jest.fn()}
        submitPatch={jest.fn(() => Promise.resolve(mockFeatureResponse))}
        setGovernanceMetadata={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}

describe('FlagDetailsOptionsMenuButton', () => {
  beforeEach(() => jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true }))

  describe('FlagDetailsOptionMenuButton - Delete', () => {
    test('it should render a DELETE and EDIT button when FFM_7921_ARCHIVING_FEATURE_FLAGS is toggled OFF', async () => {
      const isArchivingFFOn = false
      renderComponent(isArchivingFFOn)

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      expect(document.querySelector('[data-icon="edit"]')).toBeInTheDocument()
      expect(document.querySelector('[data-icon="trash"]')).toBeInTheDocument()

      expect(screen.getAllByText('edit')[1]).toBeInTheDocument()
      expect(screen.getByText('delete')).toBeInTheDocument()
    })

    test('it should render confirm modal correctly when delete option clicked', async () => {
      renderComponent()

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByText('cf.featureFlags.deleteFlag')).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.deleteFlagMessage')).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.deleteFlagWarning')).toBeInTheDocument()

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
    })

    test('it should display plan enforcement popup when limits reached', async () => {
      jest
        .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
        .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

      renderComponent()

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)

      userEvent.hover(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequiredMau')).toBeInTheDocument())
    })

    test('it should call callback when confirm delete button clicked', async () => {
      const isArchivingFFOn = false
      const deleteFlagMock = jest.fn()

      renderComponent(isArchivingFFOn, { deleteFeatureFlag: deleteFlagMock })

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

    test('it should open Git Modal when confirm delete button clicked and Git Sync enabled', async () => {
      jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
      const deleteFlagMock = jest.fn()
      const isArchivingFFOn = false

      renderComponent(isArchivingFFOn, { deleteFeatureFlag: deleteFlagMock, gitSync: mockGitSync })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'delete' }))
      expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()
    })

    test('it should close Git Modal when cancel button clicked', async () => {
      const isArchivingFFOn = false
      jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)

      renderComponent(isArchivingFFOn, { gitSync: mockGitSync })

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
      const isArchivingFFOn = false

      renderComponent(isArchivingFFOn, {
        deleteFeatureFlag: deleteFlagMock,
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
      const isArchivingFFOn = false

      renderComponent(isArchivingFFOn, { deleteFeatureFlag: deleteFlagMock, gitSync: mockGitSync })

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

    test('it should call callback when Git Modal confirm button clicked', async () => {
      jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
      const deleteFlagMock = jest.fn()
      const isArchivingFFOn = false

      renderComponent(isArchivingFFOn, { deleteFeatureFlag: deleteFlagMock, gitSync: mockGitSync })

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
      const handleAutoCommitMock = jest.fn()
      const isArchivingFFOn = false

      renderComponent(isArchivingFFOn, { gitSync: { ...mockGitSync, handleAutoCommit: handleAutoCommitMock } })

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
  })

  describe('FlagDetailsOptionMenuButton - Archive', () => {
    const isArchivingFFOn = true

    test('it should render an ARCHIVE and EDIT button when FFM_7921_ARCHIVING_FEATURE_FLAGS is toggled ON', async () => {
      jest.spyOn(cfServices, 'useGetDependentFeatures').mockReturnValue({
        data: noDependentFlagsResponse,
        error: null,
        loading: false,
        refetch: jest.fn()
      } as any)

      renderComponent(isArchivingFFOn)

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      expect(document.querySelector('[data-icon="edit"]')).toBeInTheDocument()
      expect(document.querySelector('[data-icon="archive"]')).toBeInTheDocument()

      expect(screen.getAllByText('edit')[1]).toBeInTheDocument()
      expect(screen.getAllByText('archive')[1]).toBeInTheDocument()
    })

    test('it should render archive modal when user clicks archive menu button', async () => {
      jest.spyOn(cfServices, 'useGetDependentFeatures').mockReturnValue({
        data: noDependentFlagsResponse,
        error: null,
        loading: false,
        refetch: jest.fn()
      } as any)

      renderComponent(isArchivingFFOn)

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="archive"]') as HTMLButtonElement)

      await waitFor(() => {
        expect(screen.getByText('cf.featureFlags.archiving.archiveFlag')).toBeInTheDocument()
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })
    })

    test('it should archive a flag correctly', async () => {
      const deleteFlagMock = jest.fn()
      renderComponent(isArchivingFFOn, { deleteFeatureFlag: deleteFlagMock })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="archive"]') as HTMLButtonElement)

      await userEvent.type(screen.getByRole('textbox'), mockFeature.identifier)

      await userEvent.click(screen.getByRole('button', { name: 'archive' }))

      await waitFor(() => expect(deleteFlagMock).toHaveBeenCalled())
    })

    test('it should render a CannotArchiveWarning dialog when the user attempts to archive a flag with dependent flags', async () => {
      jest.spyOn(cfServices, 'useGetDependentFeatures').mockReturnValue({
        data: dependentFlagsResponse,
        error: null,
        loading: false,
        refetch: jest.fn()
      } as any)

      renderComponent(isArchivingFFOn)

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="archive"]') as HTMLButtonElement)

      await waitFor(() => {
        expect(screen.getByText('cf.featureFlags.archiving.cannotArchive')).toBeInTheDocument()
        expect(screen.getAllByRole('link')).toHaveLength(dependentFlagsResponse.features.length)
      })
    })

    test('it should handle any error if api fails to return dependent flags', async () => {
      const error = 'FAILED TO GET DEPENDENT FLAGS'

      jest.spyOn(cfServices, 'useGetDependentFeatures').mockReturnValue({
        error,
        loading: false,
        refetch: jest.fn()
      } as any)

      renderComponent(isArchivingFFOn)

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="archive"]') as HTMLButtonElement)

      expect(screen.getByText(error)).toBeInTheDocument()
    })
  })

  describe('FlagDetailsOptionsMenuButton - Restore', () => {
    const archivedMockFeature = cloneDeep(mockFeature)
    archivedMockFeature.archived = true

    test('it should render a RESTORE and DELETE button when FFM_7921_ARCHIVING_FEATURE_FLAGS is toggled ON and the flag is archived', async () => {
      const isArchivingFFOn = true

      renderComponent(isArchivingFFOn, { featureFlag: archivedMockFeature })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      expect(document.querySelector('[data-icon="redo"]')).toBeInTheDocument()
      expect(document.querySelector('[data-icon="trash"]')).toBeInTheDocument()

      expect(screen.getByText('cf.featureFlags.archiving.restore')).toBeInTheDocument()
      expect(screen.getByText('delete')).toBeInTheDocument()
    })

    test('it should render restore modal when user clicks restore menu button', async () => {
      const isArchivingFFOn = true

      renderComponent(isArchivingFFOn, { featureFlag: archivedMockFeature })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="redo"]') as HTMLButtonElement)

      expect(screen.getByText('cf.featureFlags.archiving.restoreDescription')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'cf.featureFlags.archiving.restore' })).toBeInTheDocument()
    })

    test('it should restore a flag correctly', async () => {
      const isArchivingFFOn = true
      const useRestoreFeatureFlagMock = jest.spyOn(cfServices, 'useRestoreFeatureFlag')
      const restoreFlagMutate = jest.fn()

      useRestoreFeatureFlagMock.mockReturnValue({
        loading: false,
        error: null,
        mutate: restoreFlagMutate,
        cancel: jest.fn()
      })

      renderComponent(isArchivingFFOn, { featureFlag: archivedMockFeature })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="redo"]') as HTMLButtonElement)

      await userEvent.click(screen.getByRole('button', { name: 'cf.featureFlags.archiving.restore' }))

      await waitFor(() => expect(restoreFlagMutate).toHaveBeenCalled())
    })
  })

  describe('FlagDetailsOptionMenuButton - Edit', () => {
    test('it should render edit flag modal correctly on click', async () => {
      renderComponent()

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument()

      expect(screen.getByTestId('edit-flag-form')).toHaveFormValues({
        name: 'new flag',
        description: '',
        permanent: false
      })

      expect(screen.getByText('save')).toBeInTheDocument()
      expect(screen.getByText('cancel')).toBeInTheDocument()
    })

    test('it should call callback correctly on save click', async () => {
      const isArchivingFFOn = false
      const submitPatchMock = jest.fn(() => Promise.resolve(mockFeatureResponse))

      renderComponent(isArchivingFFOn, { submitPatch: submitPatchMock })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      await userEvent.type(document.querySelector("input[name='name']") as HTMLInputElement, ' UPDATED')

      expect(document.querySelector("input[name='name']")).toHaveValue('new flag UPDATED')

      await userEvent.click(screen.getByText('save'))

      await waitFor(() =>
        expect(submitPatchMock).toBeCalledWith({
          instructions: [
            {
              kind: 'updateName',
              parameters: {
                name: 'new flag UPDATED'
              }
            }
          ]
        })
      )

      // assert modal closes
      expect(screen.queryByTestId('edit-flag-form')).not.toBeInTheDocument()
    })

    test('it should close modal on cancel click', async () => {
      const isArchivingFFOn = false
      const submitPatchMock = jest.fn(() => Promise.resolve(mockFeatureResponse))

      renderComponent(isArchivingFFOn, { submitPatch: submitPatchMock })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      await userEvent.click(screen.getByText('cancel'))

      // assert modal closes
      await waitFor(() => expect(screen.queryByTestId('edit-flag-form')).not.toBeInTheDocument())
    })

    test('it should render edit flag modal correctly when Git Sync enabled on click', async () => {
      const isArchivingFFOn = false
      renderComponent(isArchivingFFOn, { gitSync: mockGitSync })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument()

      expect(screen.getByTestId('edit-flag-form')).toHaveFormValues({
        name: 'new flag',
        description: '',
        permanent: false,
        'gitDetails.filePath': '/flags.yaml',
        'gitDetails.rootFolder': '/.harness/',
        'gitDetails.branch': 'main'
      })

      expect(screen.getByText('save')).toBeInTheDocument()
      expect(screen.getByText('cancel')).toBeInTheDocument()
    })

    test('it should call callback correctly on save click when Git Sync enabled', async () => {
      const isArchivingFFOn = false
      const submitPatchMock = jest.fn(() => Promise.resolve(mockFeatureResponse))

      renderComponent(isArchivingFFOn, { gitSync: mockGitSync, submitPatch: submitPatchMock })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      await waitFor(() => expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument())

      await userEvent.type(document.querySelector("input[name='name']") as HTMLInputElement, ' UPDATED')
      await userEvent.type(
        document.querySelector("textarea[name='gitDetails.commitMsg']") as HTMLInputElement,
        'Updating flag name'
      )

      expect(document.querySelector("input[name='name']")).toHaveValue('new flag UPDATED')
      expect(document.querySelector("textarea[name='gitDetails.commitMsg']")).toHaveValue('Updating flag name')

      await userEvent.click(screen.getByText('save'))

      await waitFor(() =>
        expect(submitPatchMock).toBeCalledWith({
          gitDetails: {
            branch: 'main',
            commitMsg: 'Updating flag name',
            filePath: '/flags.yaml',
            repoIdentifier: 'harnesstest',
            rootFolder: '/.harness/'
          },
          instructions: [
            {
              kind: 'updateName',
              parameters: {
                name: 'new flag UPDATED'
              }
            }
          ]
        })
      )

      // assert modal closes
      expect(screen.queryByTestId('edit-flag-form')).not.toBeInTheDocument()
    })

    test('it should call auto commit endpoint when user toggles input', async () => {
      const isArchivingFFOn = false
      const handleAutoCommitMock = jest.fn()
      renderComponent(isArchivingFFOn, { gitSync: { ...mockGitSync, handleAutoCommit: handleAutoCommitMock } })

      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      await userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      await waitFor(() => expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument())

      await userEvent.type(document.querySelector("input[name='name']") as HTMLInputElement, ' UPDATED')
      await userEvent.type(
        document.querySelector("textarea[name='gitDetails.commitMsg']") as HTMLInputElement,
        'Updating flag name'
      )

      expect(document.querySelector("input[name='name']")).toHaveValue('new flag UPDATED')
      expect(document.querySelector("textarea[name='gitDetails.commitMsg']")).toHaveValue('Updating flag name')

      const autoCommitCheckbox = document.querySelector("input[name='autoCommit']") as HTMLInputElement
      await userEvent.click(autoCommitCheckbox)
      expect(autoCommitCheckbox).toBeChecked()

      await userEvent.click(screen.getByText('save'))

      await waitFor(() => expect(handleAutoCommitMock).toBeCalledWith(true))

      // assert modal closes
      expect(screen.queryByTestId('edit-flag-form')).not.toBeInTheDocument()
    })
  })
})
