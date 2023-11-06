/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { screen, render, RenderResult, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import * as cfServices from 'services/cf'
import { EventSummary, EventSummaryProps } from '../EventSummary'
import { mockAuditData } from './__data__/mockAuditData'
import { mockAuditEventActions } from './__data__/mockAuditEventActions'

const renderComponent = (props: Partial<EventSummaryProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <EventSummary data={mockAuditData.data.auditTrails[0]} flagData={mockFeature} onClose={jest.fn()} {...props} />
    </TestWrapper>
  )

describe('EventSummary', () => {
  const useGetOSByIDMock = jest.spyOn(cfServices, 'useGetOSByID')

  test('it should render the error state correctly', async () => {
    const message = 'ERROR FETCHING YAML DIFFERENCE'
    const refetchMock = jest.fn()

    useGetOSByIDMock.mockReturnValue({
      data: null,
      loading: false,
      refetch: refetchMock,
      error: { message }
    } as any)

    renderComponent()

    await userEvent.click(screen.getByRole('button', { name: 'AUDITTRAIL.YAMLDIFFERENCE' }))

    expect(await screen.findByText(message)).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(refetchMock).toHaveBeenCalled())
  })

  test('it should render a spinner when loading', async () => {
    useGetOSByIDMock.mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()

    await userEvent.click(screen.getByRole('button', { name: 'AUDITTRAIL.YAMLDIFFERENCE' }))

    expect(await screen.findByTestId('page-spinner')).toBeInTheDocument()
  })

  test.each([
    ['cf.auditLogs.flagRestored', mockAuditEventActions.data.auditTrails[0]],
    ['cf.auditLogs.flagArchived', mockAuditEventActions.data.auditTrails[1]],
    ['cf.auditLogs.flagCreated', mockAuditEventActions.data.auditTrails[2]],
    ['cf.auditLogs.flagUpdated', mockAuditEventActions.data.auditTrails[3]],
    ['cf.auditLogs.segmentCreated', mockAuditEventActions.data.auditTrails[4]]
  ])('it should display %s message for audit action %s', async (userMessage, auditActionType) => {
    renderComponent({ data: auditActionType })

    expect(screen.getByRole('heading', { name: 'auditTrail.eventSummary' })).toBeInTheDocument()

    expect(await screen.findByText(userMessage)).toBeInTheDocument()
  })
})
