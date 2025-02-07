/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { getRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import { DeploymentMetricsAnalysisRow } from '../DeploymentMetricsAnalysisRow'
import { InputData, InputDataWithIgnoreAndFailFastThresholds } from './DeploymentMetricsAnalysisRow.mocks'

describe('Unit tests for DeploymentMetricsAnalysisRow', () => {
  test('Ensure given data is rendered correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentMetricsAnalysisRow {...InputData[0]} />
      </TestWrapper>
    )
    expect(container.querySelector('[class*="graphs"]')?.children.length).toBe(2)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NO_DATA)}"]`).length).toBe(0)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NO_ANALYSIS)}"]`).length).toBe(0)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.HEALTHY)}"]`).length).toBe(6)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.OBSERVE)}"]`).length).toBe(0)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.NEED_ATTENTION)}"]`).length).toBe(0)
    expect(container.querySelectorAll(`path[stroke="${getRiskColorValue(RiskValues.UNHEALTHY)}"]`).length).toBe(0)
  })

  test('should test Ignore thresholds are not rendered when the analysis type is simple verification', async () => {
    render(
      <TestWrapper>
        <DeploymentMetricsAnalysisRow {...InputDataWithIgnoreAndFailFastThresholds[0]} isSimpleVerification />
      </TestWrapper>
    )

    const threholdsAccordion = screen.getByText(/cv.metricsAnalysis.showDetails/)

    await userEvent.click(threholdsAccordion)

    const tableRows = screen.getAllByRole('row')

    expect(tableRows).toHaveLength(2)
  })

  test('should test Ignore thresholds are rendered when the analysis type is not simple verification', async () => {
    render(
      <TestWrapper>
        <DeploymentMetricsAnalysisRow {...InputDataWithIgnoreAndFailFastThresholds[0]} isSimpleVerification={false} />
      </TestWrapper>
    )

    const threholdsAccordion = screen.getByText(/cv.metricsAnalysis.showDetails/)

    await userEvent.click(threholdsAccordion)

    const tableRows = screen.getAllByRole('row')

    expect(tableRows).toHaveLength(4)
  })
})
