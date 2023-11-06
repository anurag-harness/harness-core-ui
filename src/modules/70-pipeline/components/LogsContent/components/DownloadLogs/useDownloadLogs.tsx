/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { getErrorInfoFromErrorObject } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { downloadLogsPromise, getTokenPromise } from 'services/logs'
import { UseStringsReturn, useStrings } from 'framework/strings'
import {
  DownloadActionProps,
  DownloadLogsProps,
  DownloadLogsToaster,
  LogsScope,
  handleDownload,
  getLogPrefix,
  handleToasters,
  makePipelinePrefix
} from './DownloadLogsHelper'

const MAX_RETRIES = 200
const RETRY_DELAY_MS = 3000

const checkStatusAndDownload = async (
  scope: LogsScope,
  toasterKey: string,
  accountID: string,
  prefix: string,
  logsToken: string,
  getString: UseStringsReturn['getString'],
  retries = 0,
  startTime = 0
): Promise<void> => {
  if (retries === 0) {
    startTime = new Date().getTime()
  }

  try {
    // istanbul ignore next
    if (retries >= MAX_RETRIES) {
      handleToasters(toasterKey, true, 'error', getString, getString('pipeline.downloadLogs.apiRetriedExceeded'))
      return
    }

    const response = await downloadLogsPromise({
      queryParams: { accountID, prefix },
      requestOptions: {
        headers: {
          'X-Harness-Token': logsToken
        }
      },
      body: undefined
    })

    if (!response?.status) {
      const errorMsg = response?.error_msg ? `: ${response?.error_msg}` : ''
      throw new Error(`API request failed with an error ${errorMsg}`)
    }

    const currentTime = new Date().getTime()
    const expirationTime = startTime + 30 * 60 * 1000 // expire time set to 30min from start

    if (response?.status === 'success' && response?.link) {
      handleToasters(toasterKey, true, 'success', getString)
      handleDownload(response?.link)
      return
    } else if (response?.status === 'error') {
      handleToasters(
        toasterKey,
        true,
        'error',
        getString,
        getString('pipeline.downloadLogs.downloadRequestFailed', { errorMsg: response?.message || response?.error_msg })
      )
    } else if (currentTime < expirationTime) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      await checkStatusAndDownload(scope, toasterKey, accountID, prefix, logsToken, getString, retries + 1, startTime)
    } else {
      handleToasters(toasterKey, true, 'error', getString, getString('pipeline.downloadLogs.expiredError'))
    }
  } catch (error) {
    handleToasters(toasterKey, true, 'error', getString, getErrorInfoFromErrorObject(error))
  }
}

export function useDownloadLogs(): DownloadLogsProps {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const logsTokenRef = React.useRef('')

  React.useEffect(() => {
    return () => {
      DownloadLogsToaster.clear()
    }
  }, [])

  const downloadLogsAction = async (props: DownloadActionProps): Promise<void> => {
    const { logsScope, state, runSequence, uniqueKey, logBaseKey, logsToken } = props
    const logKeyFromState = getLogPrefix(state)
    const prefix =
      logsScope === LogsScope.Pipeline
        ? makePipelinePrefix(accountId, orgIdentifier, projectIdentifier, uniqueKey, defaultTo(runSequence, 0))
        : logBaseKey || logKeyFromState

    const toasterKey = logsScope === LogsScope.Pipeline ? `${uniqueKey}_${runSequence}` : uniqueKey
    handleToasters(toasterKey, false, 'in_progress', getString)

    // fetch token if not present
    if (!logsToken) {
      const tokenResponse = await getTokenPromise({
        queryParams: { accountID: accountId }
      })
      logsTokenRef.current = tokenResponse as any
    } else {
      logsTokenRef.current = logsToken
    }

    await checkStatusAndDownload(
      logsScope,
      toasterKey,
      accountId,
      defaultTo(prefix, ''),
      logsTokenRef.current,
      getString
    )
  }

  return { downloadLogsAction }
}
