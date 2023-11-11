/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as UseFetchReportList from '@cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/UseFetchReportsList'
import { UseFetchReportsListValue } from '@cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/UseFetchReportsList'
import ReportsTableCard from '../ReportsTableCard'
import { reportListMock } from './ReportsTable.mock'

const props = {
  endTime: 0,
  startTime: 0,
  showDrawer: jest.fn()
}

describe('Reports Table', () => {
  test('load with no data', () => {
    jest.spyOn(UseFetchReportList, 'useFetchReportsList').mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: jest.fn()
    } as UseFetchReportsListValue)

    const { getByText } = render(
      <TestWrapper>
        <ReportsTableCard {...props} />
      </TestWrapper>
    )
    expect(getByText('cv.monitoredServices.noAvailableData')).toBeInTheDocument()
  })

  test('load with data', async () => {
    jest.spyOn(UseFetchReportList, 'useFetchReportsList').mockReturnValue({
      data: { resource: { content: reportListMock } },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as UseFetchReportsListValue)

    const { getByText, container } = render(
      <TestWrapper>
        <ReportsTableCard {...props} />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(container.querySelectorAll('.TableV2--body [role="row"]').length).toEqual(reportListMock.length)
    )
    reportListMock.map(item => {
      expect(getByText(item.stepName)).toBeInTheDocument()
    })
  })

  test('should render with loading state', async () => {
    jest.spyOn(UseFetchReportList, 'useFetchReportsList').mockReturnValue({
      data: {},
      loading: true,
      error: null,
      refetch: jest.fn()
    } as UseFetchReportsListValue)
    const { container } = render(
      <TestWrapper>
        <ReportsTableCard {...props} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('span[data-icon="steps-spinner"]')).toBeTruthy())
  })

  test('should render with error state', async () => {
    jest.spyOn(UseFetchReportList, 'useFetchReportsList').mockReturnValue({
      data: {},
      loading: false,
      error: { message: 'error in service', data: {} },
      refetch: jest.fn()
    } as UseFetchReportsListValue)
    const { getByTestId } = render(
      <TestWrapper>
        <ReportsTableCard {...props} />
      </TestWrapper>
    )
    await expect(getByTestId('page-error')).toBeInTheDocument()
  })
})
