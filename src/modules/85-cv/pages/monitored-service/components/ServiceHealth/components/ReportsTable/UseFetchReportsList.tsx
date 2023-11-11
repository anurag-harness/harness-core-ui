/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { GetDataError } from 'restful-react'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { RestResponsePageSRMAnalysisStepDetailDTO, useReportListAccount, useReportListProject } from 'services/cv'

interface UseFetchReportsListInterface {
  startTime: number
  endTime: number
}

export interface UseFetchReportsListValue {
  data: RestResponsePageSRMAnalysisStepDetailDTO | null
  loading: boolean
  error: GetDataError<unknown> | null
  refetch: () => Promise<void>
}

export const useFetchReportsList = (props: UseFetchReportsListInterface): UseFetchReportsListValue => {
  const { startTime, endTime } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId

  const accountLevelReportList = useReportListAccount({
    accountIdentifier: accountId,
    queryParams: { startTime, endTime }
  })

  const reportList = useReportListProject({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    queryParams: { startTime, endTime }
  })

  return isAccountLevel ? { ...accountLevelReportList } : { ...reportList }
}
