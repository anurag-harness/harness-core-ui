/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes } from '@blueprintjs/core'
import userEvent from '@testing-library/user-event'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { SRMAnalysisStepDetailDTO } from 'services/cv'
import AnalyzeDeploymentImpact from '../AnalyzeDeploymentImpact'
import { stepMock, summaryMock } from './AnalyzeDeploymentImpact.mock'
import AnalyzeDeploymentImpactConsoleView from '../AnalyzeDeploymentImpactConsoleView'
import { calculateProgressPercentage } from '../AnalyzeDeploymentImpact.utils'

Date.now = jest.fn(() => 1689424620000)

const refetchSummary = jest.fn()
const stopAnalysis = jest.fn()

jest.mock('services/cv', () => ({
  useGetSRMAnalysisSummary: jest.fn().mockImplementation(() => {
    return { data: { resource: { ...summaryMock } }, refetch: refetchSummary }
  }),
  useStopSRMAnalysisStep: jest.fn().mockImplementation(() => {
    return { mutate: stopAnalysis }
  })
}))

describe('AnalyzeDeploymentImpact', () => {
  test('should render in Running state', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <AnalyzeDeploymentImpact step={stepMock} />
      </TestWrapper>
    )
    expect(getByText('Jul 15, 2023 4:37 PM')).toBeInTheDocument()
    expect(getByText('1 cv.day')).toBeInTheDocument()
    expect(getByText('1d 4h 16s')).toBeInTheDocument()
    expect(getByTestId('stopBtn')).toBeInTheDocument()
    expect(container.querySelector('.redirectLink')).toHaveAttribute(
      'href',
      '/account/undefined/cv/orgs/undefined/projects/undefined/monitoringservices/edit/datadoglogs_version1?tab=ServiceHealth&eventId=yRYl-h8PQeqvmLmaNUmI4g'
    )

    await userEvent.click(getByTestId('stopBtn'))
    waitFor(() => expect(stopAnalysis).toHaveBeenCalled())
    waitFor(() => expect(refetchSummary).toHaveBeenCalled())
  })

  test('should render in Running state for console view', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <AnalyzeDeploymentImpactConsoleView step={stepMock} />
      </TestWrapper>
    )
    expect(getByText('details')).toBeInTheDocument()
    expect(getByText('Jul 15, 2023 4:37 PM')).toBeInTheDocument()
    expect(getByText('1 cv.day')).toBeInTheDocument()
    expect(getByText('1d 4h 16s')).toBeInTheDocument()
    expect(getByTestId('stopBtn')).toBeInTheDocument()
    expect(container.querySelector('.redirectLink')).toHaveAttribute(
      'href',
      '/account/undefined/cv/orgs/undefined/projects/undefined/monitoringservices/edit/datadoglogs_version1?tab=ServiceHealth&eventId=yRYl-h8PQeqvmLmaNUmI4g'
    )

    await userEvent.click(getByTestId('stopBtn'))
    waitFor(() => expect(stopAnalysis).toHaveBeenCalled())
    waitFor(() => expect(refetchSummary).toHaveBeenCalled())
  })

  test('should render in sucsess', () => {
    jest.spyOn(cvService, 'useGetSRMAnalysisSummary').mockImplementation(() => {
      return { data: { resource: { ...summaryMock, analysisStatus: 'Success' } } } as any
    })

    const { queryByTestId } = render(
      <TestWrapper>
        <AnalyzeDeploymentImpact step={stepMock} />
      </TestWrapper>
    )

    expect(queryByTestId('stopBtn')).not.toBeInTheDocument()
  })

  test('should render in loading and Error', async () => {
    jest.spyOn(cvService, 'useGetSRMAnalysisSummary').mockImplementation(() => {
      return { data: {}, loading: true } as any
    })

    const { container, rerender, getByTestId } = render(
      <TestWrapper>
        <AnalyzeDeploymentImpact step={stepMock} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll(`[class*="${Classes.SKELETON}"]`).length).toBe(6))

    const refetchOnFail = jest.fn()
    jest.spyOn(cvService, 'useGetSRMAnalysisSummary').mockImplementation(() => {
      return { data: {}, loading: false, error: { messaage: 'Analysis Summary Error' }, refetch: refetchOnFail } as any
    })

    rerender(
      <TestWrapper>
        <AnalyzeDeploymentImpact step={stepMock} />
      </TestWrapper>
    )

    expect(getByTestId('errorContainer')).toBeInTheDocument()
  })

  test('should render with No Analysis', async () => {
    jest.spyOn(cvService, 'useGetSRMAnalysisSummary').mockImplementation(() => {
      return { data: {}, loading: false } as any
    })

    const { getByText } = render(
      <TestWrapper>
        <AnalyzeDeploymentImpact step={{}} />
      </TestWrapper>
    )

    expect(getByText('pipeline.verification.logs.noAnalysis')).toBeInTheDocument()
  })

  test('calculateProgressPercentage', () => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1689487675000)
    const data = { resource: summaryMock as unknown as SRMAnalysisStepDetailDTO }
    // no data
    expect(calculateProgressPercentage(null)).toEqual(0)
    // running state
    expect(calculateProgressPercentage(data)).toEqual(56.3)
    // complete
    jest.spyOn(global.Date, 'now').mockReturnValue(1689525436318)
    expect(calculateProgressPercentage(data)).toEqual(100)
    // past event
    jest.spyOn(global.Date, 'now').mockReturnValue(1689574075000)
    expect(calculateProgressPercentage(data)).toEqual(100)
  })
})
