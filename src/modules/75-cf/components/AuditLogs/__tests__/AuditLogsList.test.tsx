/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, screen, render, RenderResult, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import * as cfServices from 'services/cf'
import { AuditLogsList } from '../AuditLogsList'
import { mockAuditData, mockNoAuditData } from './__data__/mockAuditData'
import { mockAuditEventActions } from './__data__/mockAuditEventActions'

const startDate = new Date()
const endDate = new Date()

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper>
      <AuditLogsList startDate={startDate} endDate={endDate} flagData={mockFeature} objectType="FeatureActivation" />
    </TestWrapper>
  )

describe('AuditLogsList', () => {
  beforeEach(() => {
    useGetAuditByParamsMock.mockReturnValue({
      loading: false,
      data: mockAuditData,
      refetch: jest.fn(),
      error: null
    } as any)
  })

  const useGetAuditByParamsMock = jest.spyOn(cfServices, 'useGetAuditByParams')

  test('it should render correct empty state', async () => {
    useGetAuditByParamsMock.mockReturnValue({
      loading: false,
      data: mockNoAuditData,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()

    await waitFor(() => expect(screen.getByText('cf.auditLogs.empty')).toBeInTheDocument())
  })

  test('it should render error correctly', async () => {
    const error = { message: 'ERROR FETCHING AUDIT LOGS' }
    const refetch = jest.fn()

    useGetAuditByParamsMock.mockReturnValue({
      loading: false,
      data: undefined,
      refetch,
      error
    } as any)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(error.message)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(refetch).toHaveBeenCalled())
  })

  test('it should render table and rows', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.queryByText('cf.auditLogs.timePST')).toBeInTheDocument()
      expect(screen.queryByText('cf.auditLogs.user')).toBeInTheDocument()
      expect(screen.queryByText('cf.auditLogs.action')).toBeInTheDocument()

      // + 1 to include the row of columns
      expect(screen.getAllByRole('row')).toHaveLength(mockAuditData.data.auditTrails.length + 1)
    })
  })

  test('it should render the correct user-friendly message for each audit action', async () => {
    useGetAuditByParamsMock.mockReturnValue({
      loading: false,
      data: mockAuditEventActions,
      refetch: jest.fn(),
      error: null
    } as any)

    renderComponent()

    mockAuditEventActions.data.auditTrails.forEach(auditTrail => {
      switch (auditTrail.action) {
        case 'FeatureActivationCreated':
          expect(screen.getByText('cf.auditLogs.flagCreated')).toBeInTheDocument()
          break
        case 'SegmentCreated':
          expect(screen.getByText('cf.auditLogs.segmentCreated')).toBeInTheDocument()
          break
        case 'FeatureActivationRestored':
          expect(screen.getByText('cf.auditLogs.flagRestored')).toBeInTheDocument()
          break
        case 'FeatureActivationArchived':
          expect(screen.getByText('cf.auditLogs.flagArchived')).toBeInTheDocument()
          break
      }
    })
  })

  test('it should render the correct user-friendly message for each audit instruction set', async () => {
    renderComponent()

    mockAuditData.data.auditTrails.forEach(trail => {
      switch (trail.instructionSet[0]?.Kind) {
        case 'addClause':
          expect(screen.queryByText('cf.auditLogs.events.addClause')).toBeInTheDocument()
          break

        case 'addToIncludeList':
          expect(screen.queryByText('cf.auditLogs.events.addToIncludeList')).toBeInTheDocument()
          break

        case 'addToExcludeList':
          expect(screen.queryByText('cf.auditLogs.events.addToExcludeList')).toBeInTheDocument()
          break

        case 'removeFromIncludeList':
          expect(screen.queryByText('cf.auditLogs.events.removeFromIncludeList')).toBeInTheDocument()
          break

        case 'removeFromExcludeList':
          expect(screen.queryByText('cf.auditLogs.events.removeFromExcludeList')).toBeInTheDocument()
          break

        case 'updateClause':
          expect(screen.queryByText('cf.auditLogs.events.updateClause')).toBeInTheDocument()
          break

        case 'removeClause':
          expect(screen.queryByText('cf.auditLogs.events.removeClause')).toBeInTheDocument()
          break

        case 'addRule':
          expect(screen.queryByText('cf.auditLogs.events.addPercentageRollout')).toBeInTheDocument()
          break

        case 'updateRule':
          expect(screen.queryByText('cf.auditLogs.events.updateRule')).toBeInTheDocument()
          break

        case 'removeRule':
          expect(screen.queryByText('cf.auditLogs.events.removeRule')).toBeInTheDocument()
          break

        case 'reorderRules':
          expect(screen.queryByText('cf.auditLogs.events.reorderRules')).toBeInTheDocument()
          break

        case 'updateDefaultServe':
          expect(screen.queryByText('cf.auditLogs.events.updateDefaultServe.bucketBy')).toBeInTheDocument()
          expect(screen.queryByText('cf.auditLogs.events.updateDefaultServe.variation')).toBeInTheDocument()
          break

        //Uses the same string as the addTargetToFlagsVariationTargetMap
        case 'addTargetsToVariationTargetMap':
          expect(screen.getAllByText('cf.auditLogs.events.targetAddedForVariation')[0]).toBeInTheDocument()
          break

        //Uses the same string as the addTargetsToVariationTargetMap
        case 'addTargetToFlagsVariationTargetMap':
          expect(screen.getAllByText('cf.auditLogs.events.targetAddedForVariation')[1]).toBeInTheDocument()
          break

        case 'updateDescription':
          expect(screen.queryByText('cf.auditLogs.events.updateDescription')).toBeInTheDocument()
          break

        case 'updateName':
          expect(screen.queryByText('cf.auditLogs.events.updateName')).toBeInTheDocument()
          break

        case 'updatePermanent':
          expect(screen.queryByText('cf.auditLogs.events.updatePermanent')).toBeInTheDocument()
          break

        case 'addVariation':
          expect(screen.queryByText('cf.auditLogs.events.addVariation')).toBeInTheDocument()
          break

        case 'updateVariation':
          expect(screen.queryByText('cf.auditLogs.events.updateVariation')).toBeInTheDocument()
          break

        case 'deleteVariation':
          expect(screen.queryByText('cf.auditLogs.events.deleteVariation')).toBeInTheDocument()
          break

        case 'setDefaultOnVariation':
          expect(screen.queryByText('cf.auditLogs.events.setDefaultOnVariation')).toBeInTheDocument()
          break
        case 'setDefaultOffVariation':
          expect(screen.queryByText('cf.auditLogs.events.setDefaultOffVariation')).toBeInTheDocument()
          break

        case 'addSegmentToVariationTargetMap':
          expect(screen.queryByText('cf.auditLogs.events.addSegmentToVariationTargetMap')).toBeInTheDocument()
          break

        case 'clearVariationTargetMapping':
          expect(screen.queryByText('cf.auditLogs.events.clearVariationTargetMapping')).toBeInTheDocument()
          break

        case 'addPrerequisite':
          expect(screen.queryByText('cf.auditLogs.events.addPrerequisite')).toBeInTheDocument()
          break

        case 'updatePrerequisite':
          expect(screen.queryByText('cf.auditLogs.events.updatePrerequisite')).toBeInTheDocument()
          break

        case 'removePrerequisite':
          expect(screen.queryByText('cf.auditLogs.events.removePrerequisite')).toBeInTheDocument()
          break

        case 'removeTargetsToVariationTargetMap':
          expect(screen.queryByText('cf.auditLogs.events.removeTargetsToVariationTargetMap')).toBeInTheDocument()
          break

        case 'updateOffVariation':
          expect(screen.queryByText('cf.auditLogs.events.updateOffVariation')).toBeInTheDocument()
          break

        case 'removeService':
          expect(screen.queryByText('cf.auditLogs.events.removeService')).toBeInTheDocument()
          break

        case 'addService':
          expect(screen.queryByText('cf.auditLogs.events.addService')).toBeInTheDocument()
          break

        case 'setFeatureFlagState':
          expect(screen.queryByText('cf.auditLogs.events.setFeatureFlagStateOn')).toBeInTheDocument()
          expect(screen.queryByText('cf.auditLogs.events.setFeatureFlagStateOn')).toBeInTheDocument()
          break

        case 'addTag':
          expect(screen.queryAllByText('cf.auditLogs.events.tagUpdated')[0]).toBeInTheDocument()
          break

        case 'updateTag':
          expect(screen.queryAllByText('cf.auditLogs.events.tagUpdated')[1]).toBeInTheDocument()
          break
      }
    })
  })

  test('it should open and close Event Summary drawer', async () => {
    renderComponent()

    const viewEventSummaryButton = document.querySelectorAll('[data-icon="main-notes"]')[0]

    fireEvent.mouseOver(viewEventSummaryButton)
    await waitFor(() => expect(screen.getByText('cf.auditLogs.viewEventSummary')).toBeInTheDocument())

    await userEvent.click(viewEventSummaryButton)

    expect(await screen.findByRole('heading', { name: 'auditTrail.eventSummary' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'CF.AUDITLOGS.CHANGEDETAILS' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AUDITTRAIL.YAMLDIFFERENCE' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByText('auditTrail.eventSummary')).not.toBeInTheDocument()
      expect(screen.queryByText('CF.AUDITLOGS.CHANGEDETAILS')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'AUDITTRAIL.YAMLDIFFERENCE' })).not.toBeInTheDocument()
    })
  })
})
