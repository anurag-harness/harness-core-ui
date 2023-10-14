/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import { useQueryParams } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import * as cvService from 'services/cv'
import { DeploymentMetrics } from '../DeploymentMetrics'
import { overviewDataMock, transactionNameMock, verifyStepNodeNameMock } from './DeploymentMetrics.mock'

jest.useFakeTimers({ advanceTimers: true })

const ApiResponse = {
  totalPages: 1,
  totalItems: 1,
  pageItemCount: 1,
  pageSize: 10,
  content: [
    {
      metricIdentifier: 'Performance_metric',
      metricName: 'Performance metric',
      transactionGroup: 'Performance group',
      metricType: 'PERFORMANCE_OTHER',
      healthSource: {
        identifier: 'KQE5GbbKTD6w39T6_jwUog/Templatised_sumologic_metrics_health_source',
        name: 'Templatised sumologic metrics health source',
        type: 'SumologicMetrics',
        providerType: 'METRICS'
      },
      thresholds: [
        {
          id: '6L6gbC9oRlCS8ypbtCi0rA',
          thresholdType: 'IGNORE',
          isUserDefined: false,
          action: 'Ignore',
          criteria: {
            measurementType: 'ratio',
            lessThanThreshold: 0
          }
        },
        {
          id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
          thresholdType: 'IGNORE',
          isUserDefined: false,
          action: 'Ignore',
          criteria: {
            measurementType: 'delta',
            lessThanThreshold: 0
          }
        }
      ],
      analysisResult: 'HEALTHY',
      testDataNodes: [
        {
          nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
          analysisResult: 'HEALTHY',
          analysisReason: 'ML_ANALYSIS',
          controlDataType: 'MINIMUM_DEVIATION',
          controlNodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
          controlData: [
            {
              timestampInMillis: 1674145020000,
              value: 81.25
            },
            {
              timestampInMillis: 1674145140000,
              value: 67.5
            },
            {
              timestampInMillis: 1674145080000,
              value: 76.5
            },
            {
              timestampInMillis: 1674145260000,
              value: 76.66666666666667
            },
            {
              timestampInMillis: 1674145200000,
              value: 75.75
            }
          ],
          testData: [
            {
              timestampInMillis: 1674145440000,
              value: 89.5
            },
            {
              timestampInMillis: 1674145380000,
              value: 70.75
            },
            {
              timestampInMillis: 1674145500000,
              value: 59.5
            },
            {
              timestampInMillis: 1674145620000,
              value: 75.5
            },
            {
              timestampInMillis: 1674145560000,
              value: 78.75
            }
          ],
          normalisedControlData: [
            {
              value: 75.08333333333333
            },
            {
              value: 76.20833333333334
            }
          ],
          normalisedTestData: [
            {
              value: 73.25
            },
            {
              value: 77.125
            }
          ]
        }
      ]
    }
  ],
  pageIndex: 0,
  empty: false
}

const HealthSourcesResponse: cvService.HealthSourceV2[] = [
  {
    identifier: 'KQE5GbbKTD6w39T6_jwUog/Templatised_sumologic_metrics_health_source',
    name: 'Templatised sumologic metrics health source',
    type: 'SumologicMetrics',
    providerType: 'METRICS'
  },
  {
    identifier: 'KQE5GbbKTD6w39T6_jwUog/Templatised_sumologic_logs_health_source',
    name: 'Templatised sumologic logs health source',
    type: 'SumologicLogs',
    providerType: 'LOGS'
  }
]

const MockExecutionNode: ExecutionNode = {
  progressData: {
    activityId: '1234_activityId' as any
  },
  status: 'Failed',
  stepParameters: {
    environmentIdentifier: '1234_env' as any,
    serviceIdentifier: '1234_service' as any
  }
} as ExecutionNode

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: jest.fn(() => ({}))
}))

describe('Unit tests for Deployment metrics ', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
    jest.runAllTimers()
  })

  test('Ensure api is called with non anomalous filter', async () => {
    const useGetHealthSourcesSpy = jest.fn()

    const useGetDeploymentMetricsSpy = jest
      .spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId')
      .mockReturnValue({
        data: ApiResponse,
        refetch: jest.fn() as unknown
      } as any)

    const useGetTransactionGroupsForVerifyStepExecutionIdSpy = jest
      .spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId')
      .mockReturnValue({
        data: transactionNameMock,
        refetch: jest.fn() as unknown
      } as any)

    const useGetVerifyStepNodeNamesSpy = jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(useGetHealthSourcesSpy).toHaveBeenCalled()
    expect(useGetVerifyStepNodeNamesSpy).toHaveBeenCalled()
    expect(useGetTransactionGroupsForVerifyStepExecutionIdSpy).toHaveBeenCalled()
    expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
      accountIdentifier: undefined,
      orgIdentifier: undefined,
      projectIdentifier: undefined,
      queryParamStringifyOptions: {
        arrayFormat: 'repeat'
      },
      queryParams: {
        anomalousMetricsOnly: false,
        healthSources: undefined,
        pageSize: 10,
        node: undefined,
        pageIndex: 0,
        transactionGroup: undefined
      },
      verifyStepExecutionId: '1234_activityId'
    })

    fireEvent.click(screen.getByLabelText('pipeline.verification.anomalousMetricsFilterLabel'))

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        accountIdentifier: undefined,
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        },
        queryParams: {
          anomalousMetricsOnly: true,
          healthSources: undefined,
          pageSize: 10,
          node: undefined,
          pageIndex: 0,
          transactionGroup: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )
  })

  test('Ensure api is called with filter and selected page', async () => {
    const useGetHealthSourcesSpy = jest.fn()

    const useGetDeploymentMetricsSpy = jest
      .spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId')
      .mockReturnValue({
        data: ApiResponse,
        refetch: jest.fn() as unknown
      } as any)

    jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // render all filters
    expect(screen.getByTestId(/transaction_name_filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/node_name_filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/HealthSource_MultiSelect_DropDown/)).toBeInTheDocument()

    // add a filter
    fireEvent.click(screen.getByTestId(/node_name_filter/))
    await waitFor(() => expect(document.querySelector('[class*="menuItem"]')).not.toBeNull())
    fireEvent.click(screen.getByText('V'))

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        accountIdentifier: undefined,
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        },
        queryParams: {
          anomalousMetricsOnly: false,
          healthSources: undefined,
          pageSize: 10,
          node: ['V'],
          pageIndex: 0,
          transactionGroup: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )
  })

  test('Ensure loading state is rendered', async () => {
    const useGetHealthSourcesSpy = jest.fn()

    jest.spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId').mockReturnValue({
      loading: true,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="loading"]')).not.toBeNull())
  })

  test('Ensure error state is rendred', async () => {
    const useGetHealthSourcesSpy = jest.fn()

    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId').mockReturnValue({
      error: { data: { message: 'mockError' } } as any,
      refetch: refetchFn as unknown
    } as any)

    jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    getByText('mockError')

    fireEvent.click(getByText('Retry'))
    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(1))
  })

  test('Ensure no data state is rendered', async () => {
    const useGetHealthSourcesSpy = jest.fn()

    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId').mockReturnValue({
      data: { resource: { content: [] } } as any,
      refetch: refetchFn as unknown,
      loading: false
    } as any)

    jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(getByText('cv.monitoredServices.noMatchingData')).not.toBeNull()
  })

  test('Ensure that when new activityId is passed as prop view is reset', async () => {
    const useGetHealthSourcesSpy = jest.fn()

    const refetchFn = jest.fn()
    const useGetDeploymentMetricsSpy = jest
      .spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId')
      .mockReturnValue({
        data: ApiResponse,
        refetch: refetchFn as unknown
      } as any)

    jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
      accountIdentifier: undefined,
      orgIdentifier: undefined,
      projectIdentifier: undefined,
      queryParamStringifyOptions: {
        arrayFormat: 'repeat'
      },
      queryParams: {
        anomalousMetricsOnly: false,
        healthSources: undefined,
        pageSize: 10,
        node: undefined,
        pageIndex: 0,
        transactionGroup: undefined
      },
      verifyStepExecutionId: '1234_activityId'
    })
  })

  test('Ensure polling works correctly', async () => {
    const useGetHealthSourcesSpy = jest.fn()

    const refetchFn = jest.fn()
    const clonedNode = cloneDeep(MockExecutionNode)
    clonedNode.status = 'Running'

    jest.spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId').mockReturnValue({
      data: ApiResponse,
      refetch: refetchFn as unknown
    } as any)

    jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={clonedNode}
          activityId={clonedNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // for next call
    const clonedResponse = cloneDeep(ApiResponse)
    clonedResponse.content = [
      {
        metricIdentifier: 'Performance_metric1',
        metricName: 'Performance metric 1',
        transactionGroup: 'Performance group',
        metricType: 'PERFORMANCE_OTHER',
        healthSource: {
          identifier: 'KQE5GbbKTD6w39T6_jwUog/Templatised_sumologic_metrics_health_source',
          name: 'Templatised sumologic metrics health source',
          type: 'SumologicMetrics',
          providerType: 'METRICS'
        },
        thresholds: [
          {
            id: '6L6gbC9oRlCS8ypbtCi0rA',
            thresholdType: 'IGNORE',
            isUserDefined: false,
            action: 'Ignore',
            criteria: {
              measurementType: 'ratio',
              lessThanThreshold: 0
            }
          },
          {
            id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
            thresholdType: 'IGNORE',
            isUserDefined: false,
            action: 'Ignore',
            criteria: {
              measurementType: 'delta',
              lessThanThreshold: 0
            }
          }
        ],
        analysisResult: 'HEALTHY',
        testDataNodes: [
          {
            nodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
            analysisResult: 'HEALTHY',
            analysisReason: 'ML_ANALYSIS',
            controlDataType: 'MINIMUM_DEVIATION',
            controlNodeIdentifier: 'Ansuman Satapathy.3c061712-021c-4dcb-a6aa-159fb7c46f02',
            controlData: [
              {
                timestampInMillis: 1674145020000,
                value: 81.25
              },
              {
                timestampInMillis: 1674145140000,
                value: 67.5
              },
              {
                timestampInMillis: 1674145080000,
                value: 76.5
              },
              {
                timestampInMillis: 1674145260000,
                value: 76.66666666666667
              },
              {
                timestampInMillis: 1674145200000,
                value: 75.75
              }
            ],
            testData: [
              {
                timestampInMillis: 1674145440000,
                value: 89.5
              },
              {
                timestampInMillis: 1674145380000,
                value: 70.75
              },
              {
                timestampInMillis: 1674145500000,
                value: 59.5
              },
              {
                timestampInMillis: 1674145620000,
                value: 75.5
              },
              {
                timestampInMillis: 1674145560000,
                value: 78.75
              }
            ],
            normalisedControlData: [
              {
                value: 75.08333333333333
              },
              {
                value: 76.20833333333334
              }
            ],
            normalisedTestData: [
              {
                value: 73.25
              },
              {
                value: 77.125
              }
            ]
          }
        ]
      }
    ]

    jest.spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId').mockReturnValue({
      data: clonedResponse,
      refetch: refetchFn as unknown
    } as any)

    jest.runOnlyPendingTimers()

    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(1))
  })

  test('should render accordion to display metrics', () => {
    const useGetHealthSourcesSpy = jest.fn()

    jest.spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId').mockReturnValue({
      data: ApiResponse,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    const { getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    expect(getByText('Performance metric')).toBeInTheDocument()
  })

  test('should check whether the anomalous checkbox is checked by default if it has filterAnomalous query param set to true', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useQueryParams.mockImplementation(() => ({ filterAnomalous: 'true' }))

    const useGetHealthSourcesSpy = jest.fn()

    const useGetDeploymentMetricsSpy = jest
      .spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId')
      .mockReturnValue({
        data: ApiResponse,
        refetch: jest.fn() as unknown
      } as any)

    jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
      data: transactionNameMock,
      refetch: jest.fn() as unknown
    } as any)

    jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
      data: verifyStepNodeNameMock,
      refetch: jest.fn() as unknown
    } as any)

    render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
          overviewData={null}
          healthSourceDetails={{
            healthSourcesError: null,
            fetchHealthSources: useGetHealthSourcesSpy,
            healthSourcesData: HealthSourcesResponse,
            healthSourcesLoading: false
          }}
        />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        accountIdentifier: undefined,
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        },
        queryParams: {
          anomalousMetricsOnly: true,
          healthSources: undefined,
          pageSize: 10,
          node: undefined,
          pageIndex: 0,
          transactionGroup: undefined
        },
        verifyStepExecutionId: '1234_activityId'
      })
    )
  })

  describe('Simple verification changes', () => {
    test('should not render nodes filter', () => {
      const useGetHealthSourcesSpy = jest.fn()

      jest.spyOn(cvService, 'useGetMetricsAnalysisForVerifyStepExecutionId').mockReturnValue({
        data: ApiResponse,
        refetch: jest.fn() as unknown
      } as any)

      jest.spyOn(cvService, 'useGetTransactionGroupsForVerifyStepExecutionId').mockReturnValue({
        data: transactionNameMock,
        refetch: jest.fn() as unknown
      } as any)

      jest.spyOn(cvService, 'useGetVerifyStepNodeNames').mockReturnValue({
        data: verifyStepNodeNameMock,
        refetch: jest.fn() as unknown
      } as any)

      render(
        <TestWrapper>
          <DeploymentMetrics
            step={MockExecutionNode}
            activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
            overviewData={overviewDataMock}
            healthSourceDetails={{
              healthSourcesError: null,
              fetchHealthSources: useGetHealthSourcesSpy,
              healthSourcesData: HealthSourcesResponse,
              healthSourcesLoading: false
            }}
          />
        </TestWrapper>
      )

      expect(screen.queryByTestId(/metrics_legend/)).not.toBeInTheDocument()

      expect(screen.getByText(/pipeline.verification.anomalousMetricsFilterWithoutNodesLabel/)).toBeInTheDocument()

      expect(screen.queryByText(/pipeline.verification.tableHeaders.nodes/)).not.toBeInTheDocument()

      expect(document.querySelector('input[name="data"]')).toBeDisabled()
    })
  })
})
