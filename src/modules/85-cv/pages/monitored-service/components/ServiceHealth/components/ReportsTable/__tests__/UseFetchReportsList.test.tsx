/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { useFetchReportsList } from '../UseFetchReportsList'
import { accountLevelMock, reportListMock } from './ReportsTable.mock'

const props = {
  endTime: 0,
  startTime: 0
}

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn()
}))

jest.mock('services/cv', () => ({
  useReportListProject: jest.fn().mockImplementation(() => ({
    data: { resource: { content: reportListMock } },
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useReportListAccount: jest.fn().mockImplementation(() => ({
    data: { resource: { content: accountLevelMock } },
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('UseFetchReportsList', () => {
  test('should work for project level', () => {
    ;(useParams as any).mockReturnValue({
      accountId: 'mock-account',
      orgIdentifier: 'mock-org',
      projectIdentifier: 'mock-project'
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useFetchReportsList({ ...props }), { wrapper })

    expect(result.current).toEqual(
      expect.objectContaining({
        data: { resource: { content: reportListMock } },
        error: null,
        loading: false
      })
    )
  })

  test('should work for account level', () => {
    ;(useParams as any).mockReturnValue({
      accountId: 'mock-account'
    })
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useFetchReportsList({ ...props }), { wrapper })

    expect(result.current).toEqual(
      expect.objectContaining({
        data: { resource: { content: accountLevelMock } },
        error: null,
        loading: false
      })
    )
  })
})
