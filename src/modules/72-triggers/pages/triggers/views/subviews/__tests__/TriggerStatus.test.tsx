/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { TriggerStatus } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import TriggerStatusCell, { TriggerStatusProps } from '../TriggerStatusCell'

const WrapperComponent = ({ triggerStatus, triggerIdentifier, triggerType }: TriggerStatusProps): ReactElement => {
  return (
    <TestWrapper
      path="/account/:accountId/home/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/:pipelineIdentifier/triggers"
      pathParams={{
        accountId: 'default',
        orgIdentifier: 'default',
        projectIdentifier: 'test',
        pipelineIdentifier: 'test-pipeline'
      }}
    >
      <TriggerStatusCell
        triggerStatus={triggerStatus}
        triggerIdentifier={triggerIdentifier}
        triggerType={triggerType}
      />
    </TestWrapper>
  )
}

describe('Test case for trigger status rendering and behavior', () => {
  test('should render SUCCESS status properly', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'SUCCESS', detailMessages: [] }
    const { getByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Webhook" />
      </TestWrapper>
    )

    expect(getByText('success')).toBeDefined()
  })

  test('should render FAILED status properly', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'FAILED', detailMessages: [] }
    const { getByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Webhook" />
      </TestWrapper>
    )

    expect(getByText('failed')).toBeDefined()
  })

  test('should render UNKNOWN status properly', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'UNKNOWN', detailMessages: [] }
    const { getByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Webhook" />
      </TestWrapper>
    )

    expect(getByText('common.unknown')).toBeDefined()
  })

  test('should render without crash if data is not provided', async () => {
    const triggerStatusMock: TriggerStatus = {}
    const { container } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Webhook" />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render without crash if errors are not provided', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'FAILED' }
    const { findByText, getByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Webhook" />
      </TestWrapper>
    )

    userEvent.hover(getByText('failed'))
    expect(await findByText('common.viewErrorDetails')).toBeDefined()
  })

  test('should show popover on mouse over on FAILED status', async () => {
    const triggerStatusMock: TriggerStatus = { status: 'FAILED', detailMessages: ['error 1'] }
    const { getByText, findByText } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Webhook" />
      </TestWrapper>
    )

    userEvent.hover(getByText('failed'))

    expect(await findByText('error 1')).toBeDefined()
    expect(await findByText('common.viewErrorDetails')).toBeDefined()
  })

  test('should open (and close) modal with error messages', async () => {
    const detailMessages = ['error 1', 'error 2']
    const triggerStatusMock: TriggerStatus = { status: 'FAILED', detailMessages }
    const { getByText, findByText, findByRole, findByTestId, queryByTestId, baseElement } = render(
      <TestWrapper>
        <TriggerStatusCell triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Webhook" />
      </TestWrapper>
    )

    // open tooltip
    userEvent.hover(getByText('failed'))

    // open modal
    const btn = await findByRole('button')
    expect(btn).toBeDefined()
    userEvent.click(btn)

    const title = await findByText('errorDetails')
    expect(title).toBeDefined()

    const preEl = await findByTestId('trigger-status-errors')
    expect(preEl).toBeDefined()
    const expectedText = JSON.stringify(detailMessages, null, 1)
    expect(preEl.innerHTML).toMatch(expectedText)

    // close modal
    const closeBtn = baseElement.querySelector('button[aria-label="Close"]')
    userEvent.click(closeBtn!)

    await waitFor(() => expect(queryByTestId('modaldialog-body')).toBeNull())
  })

  test('Should show last collected tags and time for SUCCESS artifact', async () => {
    const lastPolled = 'ecrtriggerstatus-3'
    const triggerStatusMock: TriggerStatus = {
      status: 'SUCCESS',
      detailMessages: [],
      lastPollingUpdate: 1690339427992,
      lastPolled: [lastPolled]
    }
    const { getByText, findByText } = render(
      <WrapperComponent triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Artifact" />
    )

    userEvent.hover(getByText('success'))

    await findByText('triggers.tagLastCollectedAt')

    expect(getByText(new Date(triggerStatusMock.lastPollingUpdate!).toLocaleString())).toBeInTheDocument()

    expect(getByText('triggers.lastCollectedTag')).toBeInTheDocument()
    expect(getByText(lastPolled)).toBeInTheDocument()

    // TODO: Uncomment this once we allow activity history page for Artifact & Manifest
    /*  expect(getByText('activityHistoryLabel')).toHaveAttribute(
      'href',
      '/account/default/home/orgs/default/projects/test/pipelines/test-pipeline/triggers/test-trigger/activity-history'
      ) */
    // TODO: Remove this once we allow activity history page for Artifact & Manifest
    expect(getByText('activityHistoryLabel').parentElement).toBeDisabled()
  })

  test('Should show last collected tags and time for SUCCESS manifest', async () => {
    const lastPolled = 'ecrtriggerstatus-3'
    const triggerStatusMock: TriggerStatus = {
      status: 'SUCCESS',
      detailMessages: [],
      lastPollingUpdate: 1690339427992,
      lastPolled: [lastPolled]
    }
    const { getByText, findByText } = render(
      <WrapperComponent triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Manifest" />
    )

    userEvent.hover(getByText('success'))

    await findByText('triggers.versionLastCollectedAt')

    expect(getByText(new Date(triggerStatusMock.lastPollingUpdate!).toLocaleString())).toBeInTheDocument()

    expect(getByText('triggers.lastCollectedVersion')).toBeInTheDocument()
    expect(getByText(lastPolled)).toBeInTheDocument()
    // TODO: Uncomment this once we allow activity history page for Artifact & Manifest
    /* expect(getByText('activityHistoryLabel')).toHaveAttribute(
      'href',
      '/account/default/home/orgs/default/projects/test/pipelines/test-pipeline/triggers/test-trigger/activity-history'
    ) */
    // TODO: Remove this once we allow activity history page for Artifact & Manifest
    expect(getByText('activityHistoryLabel').parentElement).toBeDisabled()
  })
  test('Should show pending message for PENDING artifact', async () => {
    const triggerStatusMock: TriggerStatus = {
      status: 'PENDING'
    }
    const { getByText, findByText } = render(
      <WrapperComponent triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Artifact" />
    )

    userEvent.hover(getByText('triggers.pending'))

    await findByText('triggers.waitingForTag')

    // TODO: Uncomment this once we allow activity history page for Artifact & Manifest
    /* expect(getByText('activityHistoryLabel')).toHaveAttribute(
      'href',
      '/account/default/home/orgs/default/projects/test/pipelines/test-pipeline/triggers/test-trigger/activity-history'
    ) */
    // TODO: Remove this once we allow activity history page for Artifact & Manifest
    expect(getByText('activityHistoryLabel').parentElement).toBeDisabled()
  })

  test('Should show pending message for PENDING  manifest', async () => {
    const triggerStatusMock: TriggerStatus = {
      status: 'PENDING'
    }
    const { getByText, findByText } = render(
      <WrapperComponent triggerStatus={triggerStatusMock} triggerIdentifier="test-trigger" triggerType="Manifest" />
    )

    userEvent.hover(getByText('triggers.pending'))

    await findByText('triggers.waitingForVersion')

    // TODO: Uncomment this once we allow activity history page for Artifact & Manifest
    /* expect(getByText('activityHistoryLabel')).toHaveAttribute(
      'href',
      '/account/default/home/orgs/default/projects/test/pipelines/test-pipeline/triggers/test-trigger/activity-history'
    ) */
    // TODO: Remove this once we allow activity history page for Artifact & Manifest
    expect(getByText('activityHistoryLabel').parentElement).toBeDisabled()
  })
})
