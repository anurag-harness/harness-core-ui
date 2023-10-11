/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, getByText, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useStrings } from 'framework/strings'
import {
  findDialogContainer,
  findPopoverContainer,
  findDrawerContainer,
  TestWrapper,
  findTransitionContainer
} from '@common/utils/testUtils'
import type { GetTriggerListForTargetQueryParams } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { pipelinePathProps } from '@common/utils/routeUtils'
import * as useIsTriggerCreatePermission from '@triggers/components/Triggers/useIsTriggerCreatePermission'
import { GetTriggerResponse } from './webhookMockResponses'
import { GetTriggerListForTargetResponse } from './sharedMockResponses'
import { PipelineResponse as PipelineDetailsMockResponse } from './PipelineDetailsMocks'
import TriggersPage from '../TriggersPage'

const mockDelete = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockUpdateTrigger = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockCopy = jest.fn()
const mockGetTriggersFunction = jest.fn()
const fetchTriggerList = jest.fn()
jest.mock('services/pipeline-ng', () => ({
  useGetTriggerListForTarget: jest.fn(args => {
    mockGetTriggersFunction(args)
    return { ...GetTriggerListForTargetResponse, refetch: fetchTriggerList }
  }),
  useGetTrigger: jest.fn(() => GetTriggerResponse),
  useDeleteTrigger: jest.fn().mockImplementation(() => ({ mutate: mockDelete })),
  useUpdateTrigger: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTrigger }))
}))

jest.mock('services/pipeline-rq', () => ({
  useGetPipelineSummaryQuery: jest.fn(() => PipelineDetailsMockResponse)
}))

jest.mock('clipboard-copy', () => (args: string) => mockCopy(args))

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(props: {
  queryParams?: Pick<GetTriggerListForTargetQueryParams, 'searchTerm'>
}): JSX.Element {
  return (
    <TestWrapper
      path={routes.toTriggersPage({ ...pipelinePathProps, module: ':module' })}
      pathParams={{
        projectIdentifier: 'projectIdentifier',
        orgIdentifier: 'orgIdentifier',
        accountId: 'accountId',
        pipelineIdentifier: 'pipelineIdentifier',
        module: 'cd'
      }}
      queryParams={props.queryParams}
    >
      <TriggersPage />
    </TestWrapper>
  )
}

const getCopyTestId = (identifier: string): string => `${identifier}-copy`
const getCopyAsUrlTestId = (identifier: string): string => `${identifier}-copyAsUrl`
const getCopyAsCurlTestId = (identifier: string): string => `${identifier}-copyAsCurl`
const getEnabledTestId = (identifier: string): string => `${identifier}-enabled`
const getMoreTestId = (identifier: string): string => `${identifier}-more-button`
const getEditTestId = (identifier: string): string => `${identifier}-edit-button`
const getDeleteTestId = (identifier: string): string => `${identifier}-delete-button`

describe('TriggersPage Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Shows Trigger List', async () => {
      render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())
      // eslint-disable-next-line no-document-body-snapshot
      expect(document.body).toMatchSnapshot()
    })
    test('Initial Render - New Triggers Drawer', async () => {
      const { container } = render(
        <TestWrapper>
          <TriggersPage />
        </TestWrapper>
      )
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())
      const addTriggerButton = getByText(container, result.current.getString('triggers.newTrigger'))
      if (!addTriggerButton) {
        throw Error('No action button')
      }
      fireEvent.click(addTriggerButton)
      // eslint-disable-next-line no-document-body-snapshot
      expect(document.body).toMatchSnapshot()
    })
  })
  describe('Interactivity', () => {
    const triggerIdentifier = 'WebhookCustom'
    jest.spyOn(useIsTriggerCreatePermission, 'useIsTriggerCreatePermission').mockImplementation(() => true)

    test('Add a trigger redirects to Trigger Wizard', async () => {
      const { container, getByTestId } = render(<WrapperComponent />)
      fireEvent.click(getByText(container, result.current.getString('triggers.newTrigger')))

      const triggerDrawer = findDrawerContainer()
      await waitFor(() => expect(triggerDrawer).toBeInTheDocument())
      fireEvent.click(getByText(triggerDrawer!, 'common.repo_provider.githubLabel'))

      await waitFor(() =>
        expect(getByTestId('location')).toMatchInlineSnapshot(`
            <div
              data-testid="location"
            >
              /account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/pipelineIdentifier/triggers/new?triggerType=Webhook&sourceRepo=Github
            </div>
        `)
      )
    })

    test('Edit a trigger redirects to Trigger Wizard', async () => {
      const { getByTestId } = render(<WrapperComponent />)
      const moreButton = getByTestId(getMoreTestId(triggerIdentifier))
      await waitFor(() => expect(moreButton).toBeInTheDocument())

      // Edit button
      fireEvent.click(moreButton)
      const moreOptionPopover = findPopoverContainer()
      await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
      fireEvent.click(getByTestId(getEditTestId(triggerIdentifier)))

      await waitFor(() =>
        expect(getByTestId('location')).toMatchInlineSnapshot(`
            <div
              data-testid="location"
            >
              /account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/pipelineIdentifier/triggers/${triggerIdentifier}
            </div>
         `)
      )
    })

    test('Disable a trigger', async () => {
      const { getByTestId } = render(<WrapperComponent />)

      // Click disable button
      const toggleButton = getByTestId(getEnabledTestId(triggerIdentifier))
      await waitFor(() => expect(toggleButton).toBeInTheDocument())
      expect(toggleButton).toBeChecked()
      fireEvent.click(toggleButton)

      expect(mockUpdateTrigger).toBeCalledWith(
        `trigger:\n  name: Webhook Custom\n  identifier: ${triggerIdentifier}\n  enabled: false\n  description: ""\n  tags: {}\n  stagesToExecute: []\n  orgIdentifier: default\n  projectIdentifier: Pankaj\n  pipelineIdentifier: dockerdigestissue\n  source:\n    type: Webhook\n    spec:\n      type: Custom\n      spec:\n        payloadConditions: []\n        headerConditions: []\n  inputSetRefs:\n    - Input_Set_1\n`
      )
    })

    test('Enable a trigger', async () => {
      const identifier = 'trigger2'
      const { getByTestId } = render(<WrapperComponent />)

      // Click disable button
      const toggleButton = getByTestId(getEnabledTestId(identifier))
      await waitFor(() => expect(toggleButton).toBeInTheDocument())
      expect(toggleButton).not.toBeChecked()
      fireEvent.click(toggleButton)

      expect(mockUpdateTrigger).toBeCalledWith(
        'trigger:\n  name: trigger-2\n  identifier: trigger2\n  enabled: true\n  description: ""\n  tags: {}\n  stagesToExecute: []\n  orgIdentifier: default\n  projectIdentifier: Pankaj\n  pipelineIdentifier: dockerdigestissue\n  source:\n    type: Webhook\n    spec:\n      type: Custom\n      spec:\n        payloadConditions: []\n        headerConditions: []\n  inputSetRefs:\n    - Input_Set_1\n'
      )
    })

    test('Delete a trigger', async () => {
      const { getByTestId } = render(<WrapperComponent />)
      const moreButton = getByTestId(getMoreTestId(triggerIdentifier))
      await waitFor(() => expect(moreButton).toBeInTheDocument())

      // Delete button
      fireEvent.click(moreButton)
      const moreOptionPopover = findPopoverContainer()
      await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
      fireEvent.click(getByTestId(getDeleteTestId(triggerIdentifier)))

      // Delete Dialog Container
      const deleteConfirmationDialog = findDialogContainer()
      await waitFor(() => expect(deleteConfirmationDialog).toBeInTheDocument())
      const confirmDeleteButton = getByText(deleteConfirmationDialog as HTMLElement, 'delete')
      if (!confirmDeleteButton) {
        throw Error('No error button')
      }
      fireEvent.click(confirmDeleteButton)

      expect(mockDelete).toBeCalledWith(triggerIdentifier, { headers: { 'content-type': 'application/json' } })
    })

    test('Copy Webhook URL & cURL Command', async () => {
      const { getByTestId } = render(<WrapperComponent />)
      const copyButton = getByTestId(getCopyTestId(triggerIdentifier))
      await waitFor(() => expect(copyButton).toBeInTheDocument())

      // Copy Webhook URL
      fireEvent.click(copyButton!)
      const transitionContainer = findTransitionContainer()
      await waitFor(() => expect(transitionContainer).toBeInTheDocument())
      fireEvent.click(getByTestId(getCopyAsUrlTestId(triggerIdentifier)))
      expect(mockCopy).toHaveBeenCalledWith('webhookUrl')

      // Copy cURL Command
      fireEvent.click(copyButton!)
      await waitFor(() => expect(transitionContainer).toBeInTheDocument())
      fireEvent.click(getByTestId(getCopyAsCurlTestId(triggerIdentifier)))
      expect(mockCopy).toHaveBeenCalledWith('webhookCurlCommand')
    })

    // TODO: Fix this test issue and unskip
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Sort the trigger', async () => {
      render(<WrapperComponent />)
      await waitFor(() => expect(screen.getByText('Newest')).toBeInTheDocument())

      const sortDropdown = screen.queryByTestId('dropdown-button')

      // Sort by date created asc
      fireEvent.click(sortDropdown!)
      const sortBtCreatedAsc = screen.queryByText('Oldest')
      fireEvent.click(sortBtCreatedAsc!)

      await waitFor(() =>
        expect(mockGetTriggersFunction).toBeCalledWith({
          queryParams: {
            accountIdentifier: 'accountId',
            orgIdentifier: 'orgIdentifier',
            projectIdentifier: 'projectIdentifier',
            targetIdentifier: 'pipelineIdentifier',
            searchTerm: undefined,
            page: 0,
            size: 20,
            sort: ['createdAt,ASC']
          },
          queryParamStringifyOptions: { arrayFormat: 'repeat' }
        })
      )

      // Sort by date created desc
      fireEvent.click(sortDropdown!)
      const sortByCreatedDesc = screen.queryByText('Newest')
      fireEvent.click(sortByCreatedDesc!)

      await waitFor(() =>
        expect(mockGetTriggersFunction).toBeCalledWith({
          queryParams: {
            accountIdentifier: 'accountId',
            orgIdentifier: 'orgIdentifier',
            projectIdentifier: 'projectIdentifier',
            targetIdentifier: 'pipelineIdentifier',
            searchTerm: undefined,
            page: 0,
            size: 20,
            sort: ['createdAt,DESC']
          },
          queryParamStringifyOptions: { arrayFormat: 'repeat' }
        })
      )

      // Sort by Name Asc
      fireEvent.click(sortDropdown!)
      const sortByNameAsc = screen.queryByText('Name (A->Z, 0->9)')
      fireEvent.click(sortByNameAsc!)

      await waitFor(() =>
        expect(mockGetTriggersFunction).toBeCalledWith({
          queryParams: {
            accountIdentifier: 'accountId',
            orgIdentifier: 'orgIdentifier',
            projectIdentifier: 'projectIdentifier',
            targetIdentifier: 'pipelineIdentifier',
            searchTerm: undefined,
            page: 0,
            size: 20,
            sort: ['name,ASC']
          },
          queryParamStringifyOptions: { arrayFormat: 'repeat' }
        })
      )

      // Sort by Name Desc
      fireEvent.click(sortDropdown!)
      const sortByNameDesc = screen.queryByText('Name (Z->A, 9->0)')
      fireEvent.click(sortByNameDesc!)

      await waitFor(() =>
        expect(mockGetTriggersFunction).toBeCalledWith({
          queryParams: {
            accountIdentifier: 'accountId',
            orgIdentifier: 'orgIdentifier',
            projectIdentifier: 'projectIdentifier',
            targetIdentifier: 'pipelineIdentifier',
            searchTerm: undefined,
            page: 0,
            size: 20,
            sort: ['name,DESC']
          },
          queryParamStringifyOptions: { arrayFormat: 'repeat' }
        })
      )
    })

    test('New Trigger, Copy URL, Toggle, Edit & Delete Button should be disabled if user does not have the required permission', async () => {
      const setOptionsOpen = jest.fn()
      const goToEditWizard = jest.fn()
      const confirmDelete = jest.fn()
      jest.mock('@harness/uicore', () => ({
        ...jest.requireActual('@harness/uicore'),
        useConfirmationDialog: jest.fn().mockImplementation(() => ({
          openDialog: confirmDelete,
          closeDialog: jest.fn()
        }))
      }))

      jest.spyOn(useIsTriggerCreatePermission, 'useIsTriggerCreatePermission').mockImplementation(() => false)

      const { getByText: _getByText, getByTestId } = render(<WrapperComponent />)
      const copyButton = getByTestId(getCopyTestId(triggerIdentifier))
      await waitFor(() => expect(copyButton).toBeInTheDocument())

      // New Trigger Button
      expect(_getByText('triggers.newTrigger').closest('button')).toBeDisabled()

      // Copy Url Icon
      fireEvent.click(getByTestId(getCopyTestId(triggerIdentifier)))
      expect(setOptionsOpen).not.toBeCalled()

      // Enabled toggle
      expect(getByTestId(getEnabledTestId(triggerIdentifier))).toBeDisabled()

      // Edit button
      fireEvent.click(getByTestId(getMoreTestId(triggerIdentifier)))
      const moreOptionPopover = findPopoverContainer()
      await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
      fireEvent.click(getByTestId(getEditTestId(triggerIdentifier)))
      expect(goToEditWizard).not.toBeCalled()

      // Delete button
      fireEvent.click(getByTestId(getMoreTestId(triggerIdentifier)))
      await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
      fireEvent.click(getByTestId(getDeleteTestId(triggerIdentifier)))
      expect(confirmDelete).not.toBeCalled()
    })
  })

  test('Triggers List should update every minutes', async () => {
    jest.useFakeTimers()
    render(<WrapperComponent />)
    jest.advanceTimersByTime(60 * 1000)

    expect(fetchTriggerList).toHaveBeenCalled()
  })
})
