/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, waitFor, screen } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import {
  LogTypes,
  SLOLogContentProps,
  VerifyStepLogContentProps
} from '@cv/hooks/useLogContentHook/useLogContentHook.types'
import { ExecutionVerificationView } from '../ExecutionVerificationView'
import { getActivityId, getDefaultTabId } from '../ExecutionVerificationView.utils'

jest.mock('../components/DeploymentMetrics/DeploymentMetrics', () => ({
  ...(jest.requireActual('../components/DeploymentMetrics/DeploymentMetrics') as any),
  DeploymentMetrics: () => <div className="deploymentMetrics" />
}))

jest.mock('../components/ExecutionVerificationSummary/ExecutionVerificationSummary', () => ({
  ExecutionVerificationSummary: () => <div className="summary" />
}))

jest.mock('../components/LogAnalysisContainer/LogAnalysisView.container', () => ({
  __esModule: true,
  default: () => <div className="LogAnalysisContainer" />
}))

jest.mock('@cv/hooks/useLogContentHook/views/VerifyStepLogContent', () => ({
  __esModule: true,
  default: (props: VerifyStepLogContentProps) => <div>{props.logType}</div>
}))

jest.mock('@cv/hooks/useLogContentHook/views/SLOLogContent', () => ({
  __esModule: true,
  default: (props: SLOLogContentProps) => <div>{props.logType}</div>
}))

jest.mock('highcharts-react-official', () => () => <></>)

describe('Unit tests for ExecutionVerificationView unit tests', () => {
  test('Ensure tabs are rendered', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="bp3-tabs"]')).not.toBeNull())
    expect(getByText('pipeline.verification.analysisTab.logs')).not.toBeNull()
    expect(getByText('pipeline.verification.analysisTab.metrics')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })
  test('Ensure no analysis state is rendered when activity id does not exist', async () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationView step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="noAnalysis"]')))
    expect(container.querySelector('[class*="bp3-tabs"]')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('Ensure correct activityId is returned when getActivityId utils method is called with activityId being present in progressdata and not in outputdata', async () => {
    const step = {
      progressData: {
        activityId: 'activityId-from-step-progressData'
      }
    }
    expect(getActivityId(step as unknown as ExecutionNode)).toEqual('activityId-from-step-progressData')
  })

  test('Ensure correct activityId is returned when getActivityId utils method is called with activityId is not present in progressdata but present in output data', async () => {
    const step = {
      outcomes: {
        output: {
          activityId: 'activityId-from-step-outputdata'
        }
      }
    }
    expect(getActivityId(step as unknown as ExecutionNode)).toEqual('activityId-from-step-outputdata')
  })

  test('Ensure correct tabId is returned  ', () => {
    expect(getDefaultTabId({ getString: key => key, canEnableLogsTab: false, canEnableMetricsTab: true })).toEqual(
      'pipeline.verification.analysisTab.metrics'
    )

    expect(
      getDefaultTabId({
        getString: key => key,
        tabName: 'pipeline.verification.analysisTab.logs',
        canEnableLogsTab: true,
        canEnableMetricsTab: true
      })
    ).toEqual('pipeline.verification.analysisTab.logs')

    expect(
      getDefaultTabId({ getString: (item: string) => item, canEnableMetricsTab: false, canEnableLogsTab: true })
    ).toEqual('pipeline.verification.analysisTab.logs')
  })

  test('Ensure correct tabs are rendered via queryParams', async () => {
    const LogsContainer = render(
      <TestWrapper queryParams={{ type: 'pipeline.verification.analysisTab.logs' }}>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )
    expect(LogsContainer.container.querySelector('.LogAnalysisContainer')).toBeInTheDocument()
    expect(LogsContainer.container.querySelector('.summary')).toBeInTheDocument()
    expect(LogsContainer.container.querySelector('.deploymentMetrics')).not.toBeInTheDocument()
    expect(LogsContainer.container).toMatchSnapshot()

    const MetricsContainer = render(
      <TestWrapper queryParams={{ type: 'pipeline.verification.analysisTab.metrics' }}>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )
    expect(MetricsContainer.container.querySelector('.LogAnalysisContainer')).not.toBeInTheDocument()
    expect(MetricsContainer.container.querySelector('.deploymentMetrics')).toBeInTheDocument()
    expect(MetricsContainer.container).toMatchSnapshot()
  })

  test('should open the LogContent modal and render VerifyStepLog with type ExecutionLog by clicking the Execution Logs button', async () => {
    render(
      <TestWrapper>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )

    expect(screen.getByText('cv.executionLogs')).toBeInTheDocument()

    await userEvent.click(screen.getByText('cv.executionLogs'))

    const dialog = findDialogContainer()

    await waitFor(() => {
      expect(screen.getByText(LogTypes.ExecutionLog)).toBeInTheDocument()
      expect(screen.queryByText(LogTypes.ApiCallLog)).not.toBeInTheDocument()
    })

    await userEvent.click(dialog?.querySelector('[data-icon="Stroke"]')!)
  })

  test('should open the LogContent modal and render VerifyStepLog with typ ApiCallLog by clicking the Execution Logs button', async () => {
    render(
      <TestWrapper>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )

    expect(screen.getByText('cv.externalAPICalls')).toBeInTheDocument()

    await userEvent.click(screen.getByText('cv.externalAPICalls'))

    const dialog = findDialogContainer()

    await waitFor(() => {
      expect(screen.getByText(LogTypes.ApiCallLog)).toBeInTheDocument()
      expect(screen.queryByText(LogTypes.ExecutionLog)).not.toBeInTheDocument()
    })

    await userEvent.click(dialog?.querySelector('[data-icon="Stroke"]')!)
  })
})
