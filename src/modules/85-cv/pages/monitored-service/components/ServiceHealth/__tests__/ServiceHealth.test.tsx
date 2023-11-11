/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
//xxx
import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import type { StringKeys } from 'framework/strings'
import type { RiskData } from 'services/cv'
import { RiskValues } from '@cv/utils/CommonUtils'
import ServiceHealth from '../ServiceHealth'
import {
  getTimeFormat,
  getTimeInHrs,
  getTimePeriods,
  getTimestampsForPeriod,
  calculateStartAndEndTimes,
  calculateLowestHealthScoreBar,
  isInTheRange,
  getSliderDimensions,
  getDimensionsAsPerContainerWidth
} from '../ServiceHealth.utils'
import type { ServiceHealthProps } from '../ServiceHealth.types'
import { TimePeriodEnum } from '../ServiceHealth.constants'
import {
  mockedHealthScoreData,
  timePeriodsMockData,
  mockedTimestamps,
  mockedHealthScoreDataForLowestHealthScore,
  mockRiskValue,
  expectedTimelineForGetTimestampsForPeriod
} from './ServiceHealth.mock'
import { changeSummaryWithPositiveChange } from '../components/ChangesSourceCard/__tests__/ChangeSourceCard.mock'

const WrapperComponent = (props: ServiceHealthProps): JSX.Element => {
  return (
    <TestWrapper>
      <ServiceHealth {...props} />
    </TestWrapper>
  )
}

function getString(key: StringKeys): StringKeys {
  return key
}

const fetchHealthScore = jest.fn()

jest.mock('highcharts-react-official', () => () => <></>)

jest.mock('services/cv', () => ({
  useGetMonitoredServiceScoresFromServiceAndEnvironment: jest.fn().mockImplementation(() => ({
    data: { currentHealthScore: { riskStatus: RiskValues.HEALTHY, healthScore: 100 } },
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetMonitoredServiceOverAllHealthScore: jest.fn().mockImplementation(() => {
    return { data: mockedHealthScoreData, refetch: fetchHealthScore, error: null, loading: false }
  }),
  useGetServiceDependencyGraph: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useSetHealthMonitoringFlag: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteMonitoredService: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetAnomaliesSummary: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useChangeEventSummary: jest.fn().mockImplementation(() => {
    return {
      data: { resource: { ...changeSummaryWithPositiveChange } },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useChangeEventList: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useChangeEventTimeline: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useChangeEventTimelineForAccount: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useChangeEventListForAccount: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useGetMonitoredServiceChangeTimeline: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useGetAllHealthSourcesForMonitoredServiceIdentifier: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useGetTimeSeriesMetricData: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  })
}))

jest.mock('@cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/UseFetchReportsList', () => ({
  useFetchReportsList: jest.fn().mockReturnValue({ data: {}, loading: false })
}))

describe('Unit tests for ServiceHealth', () => {
  const props = {
    monitoredServiceIdentifier: 'monitored_service_identifier',
    serviceIdentifier: 'service-identifier',
    environmentIdentifier: 'env-identifier',
    hasChangeSource: true
  }
  test('Verify if all the fields are rendered correctly inside ServiceHealth and with correct document title', async () => {
    render(<WrapperComponent {...props} />)
    expect(document.title).toBe('cv.srmTitle | cv.monitoredServices.title | harness')
  })

  test('Verify if reset functionality works correctly', async () => {
    const { getByText, getByTestId } = render(<WrapperComponent {...props} />)

    // Clicking on the slider to set the selected timeline and display the slider
    await act(async () => {
      fireEvent.click(getByTestId('HealthScoreChartContainer'))
    })

    // clicking on the reset button to reset the slider
    await act(async () => {
      fireEvent.click(getByText('reset'))
    })

    // Now again the message to select the timeline for metrics/logs should be displayed.
    expect(getByText('cv.monitoredServices.serviceHealth.selectTimeline')).toBeInTheDocument()
  })

  test('Verify if getTimeInHrs method gives correct results', async () => {
    expect(getTimeInHrs(TimePeriodEnum.FOUR_HOURS)).toEqual(4)
    expect(getTimeInHrs(TimePeriodEnum.TWENTY_FOUR_HOURS)).toEqual(24)
    expect(getTimeInHrs(TimePeriodEnum.THREE_DAYS)).toEqual(24 * 3)
    expect(getTimeInHrs(TimePeriodEnum.SEVEN_DAYS)).toEqual(24 * 7)
    expect(getTimeInHrs(TimePeriodEnum.THIRTY_DAYS)).toEqual(24 * 30)
    expect(getTimeInHrs('default')).toEqual(24)
  })

  test('Verify if getTimePeriods method gives correct data', async () => {
    expect(getTimePeriods(getString)).toEqual(timePeriodsMockData)
  })

  test('Verify if correct number of data points are returned from getTimestampsForPeriod method', async () => {
    const timeLineDataPoints = getTimestampsForPeriod(mockRiskValue as RiskData[])
    expect(timeLineDataPoints).toEqual(expectedTimelineForGetTimestampsForPeriod)
  })

  test('Verify if correct timeformat is returned from getTimeFormat method', async () => {
    expect(getTimeFormat(TimePeriodEnum.FOUR_HOURS)).toEqual('hours')
    expect(getTimeFormat(TimePeriodEnum.TWENTY_FOUR_HOURS)).toEqual('hours')
    expect(getTimeFormat(TimePeriodEnum.THREE_DAYS)).toEqual('days')
    expect(getTimeFormat(TimePeriodEnum.SEVEN_DAYS)).toEqual('days')
    expect(getTimeFormat(TimePeriodEnum.THIRTY_DAYS)).toEqual('days')
    expect(getTimeFormat('default')).toEqual('hours')
  })

  test('Verify if correct start and endtime is returned from calculateStartAndEndTimes method', async () => {
    const startXPercentage = 0.3122977346278317
    const endXPercentage = 0.35275080906148865

    expect(calculateStartAndEndTimes(startXPercentage, endXPercentage, mockedTimestamps)).toEqual([
      1630863300338, 1630887300649
    ])
  })

  test('Verify if correct lowestHealthScore is returned from calculateLowestHealthScoreBar method', async () => {
    const startTime = 1630863277338
    const endTime = 1630887233649
    expect(
      calculateLowestHealthScoreBar(startTime, endTime, mockedHealthScoreDataForLowestHealthScore as RiskData[])
    ).toEqual({
      healthScore: 0,
      riskStatus: RiskValues.UNHEALTHY,
      timeRangeParams: { endTime: 1630893600, startTime: 1630881000 }
    })
  })

  test('Verify if isInTheRange method returns correct result', async () => {
    const dataPoint = {
      healthScore: 100,
      riskStatus: RiskValues.HEALTHY,
      timeRangeParams: {
        startTime: 1630666800,
        endTime: 1630679400
      }
    }
    const startTime = 1630863277338
    const endTime = 1630887233649
    expect(isInTheRange(dataPoint as RiskData, startTime, endTime)).toEqual(false)
  })

  test('Verify if getSliderDimensions method gives correct slider dimensions', async () => {
    const containerWidth = 1336
    const expectedDimensions = {
      maxWidth: 304,
      minWidth: 76
    }
    expect(getSliderDimensions(containerWidth, TimePeriodEnum.TWENTY_FOUR_HOURS)).toEqual(expectedDimensions)
  })

  test('Verify if getSliderDimensions method gives max slider width to be 3 bars when selected time period is seven days or 30days', async () => {
    const containerWidth = 1336
    const expectedDimensions = {
      maxWidth: 76,
      minWidth: 76
    }
    expect(getSliderDimensions(containerWidth, TimePeriodEnum.SEVEN_DAYS)).toEqual(expectedDimensions)
    expect(getSliderDimensions(containerWidth, TimePeriodEnum.THIRTY_DAYS)).toEqual(expectedDimensions)
  })

  test('Verify if getSliderDimensions method gives max slider width to be 12 bars when selected time period is in hours or 3 days', async () => {
    const containerWidth = 1336
    const expectedDimensions = {
      maxWidth: 304,
      minWidth: 76
    }
    expect(getSliderDimensions(containerWidth, TimePeriodEnum.FOUR_HOURS)).toEqual(expectedDimensions)
    expect(getSliderDimensions(containerWidth, TimePeriodEnum.TWENTY_FOUR_HOURS)).toEqual(expectedDimensions)
    expect(getSliderDimensions(containerWidth, TimePeriodEnum.THREE_DAYS)).toEqual(expectedDimensions)
  })

  test('Verify if getDimensionsAsPerContainerWidth method gives correct results when containerWidth is present', async () => {
    const defaultMaxSliderWidth = 1336
    const selectedTimePeriod = {
      value: TimePeriodEnum.TWENTY_FOUR_HOURS,
      label: getString('cv.monitoredServices.serviceHealth.last24Hrs')
    }
    const containerWidth = 800
    expect(getDimensionsAsPerContainerWidth(defaultMaxSliderWidth, selectedTimePeriod, containerWidth)).toEqual({
      maxWidth: 170,
      minWidth: 42.5
    })
  })

  test('Verify if getDimensionsAsPerContainerWidth method gives correct results when containerWidth is not present', async () => {
    const defaultMaxSliderWidth = 1336
    const selectedTimePeriod = {
      value: TimePeriodEnum.TWENTY_FOUR_HOURS,
      label: getString('cv.monitoredServices.serviceHealth.last24Hrs')
    }
    expect(getDimensionsAsPerContainerWidth(defaultMaxSliderWidth, selectedTimePeriod)).toEqual({
      maxWidth: 1336,
      minWidth: 75
    })
  })

  test('Verify ChangesSourceCard does not loads', async () => {
    const newProps = {
      monitoredServiceIdentifier: 'monitored_service_identifier',
      serviceIdentifier: '',
      environmentIdentifier: '',
      hasChangeSource: true
    }
    const { container } = render(<WrapperComponent {...newProps} />)
    await waitFor(() => expect(container.querySelectorAll('.tickerValue[data-test="tickerValue"]').length).toEqual(0))
  })

  test('it should call useGetMonitoredServiceChangeTimeline', async () => {
    const refetch = jest.fn()
    jest
      .spyOn(cvService, 'useGetMonitoredServiceChangeTimeline')
      .mockReturnValue({ data: {}, refetch, cancel: jest.fn() } as any)

    const newProps = {
      monitoredServiceIdentifier: 'monitored_service_identifier',
      serviceIdentifier: '',
      environmentIdentifier: '',
      hasChangeSource: true
    }

    render(<WrapperComponent {...newProps} />)

    await waitFor(() => {
      expect(refetch).toHaveBeenLastCalledWith({
        queryParams: expect.objectContaining({
          accountId: undefined,
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          monitoredServiceIdentifier: 'monitored_service_identifier',
          changeSourceTypes: [],
          duration: TimePeriodEnum.TWENTY_FOUR_HOURS
        })
      })
    })
  })
})
