/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo } from 'react'
import { Layout, Container, Text, Icon, PageError, NoDataCard } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Divider, Classes } from '@blueprintjs/core'
import { useParams, Link } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ExecutionNode } from 'services/pipeline-ng'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetSRMAnalysisSummary } from 'services/cv'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { getActivityId } from '../ExecutionVerification/ExecutionVerificationView.utils'
import CVProgressBar from '../ExecutionVerification/components/DeploymentProgressAndNodes/components/CVProgressBar/CVProgressBar'
import VerificationStatusCard from '../ExecutionVerification/components/DeploymentProgressAndNodes/components/VerificationStatusCard/VerificationStatusCard'
import { StopAnalysisButton } from './components/StopAnalysisButton'
import { calculateProgressPercentage, createDetailsData } from './AnalyzeDeploymentImpact.utils'
import { POLLING_INTERVAL } from '../ExecutionVerification/components/DeploymentMetrics/DeploymentMetrics.constants'
import { AnalysisStatus } from './AnalyzeDeploymentImpact.constants'
import css from './AnalyzeDeploymentImpact.module.scss'

interface AnalyzeDeploymentImpactViewProps {
  step: ExecutionNode
  isConsoleView?: boolean
}

export default function AnalyzeDeploymentImpact(props: AnalyzeDeploymentImpactViewProps): JSX.Element {
  const { step, isConsoleView } = props
  const { getString } = useStrings()
  const [pollingIntervalId, setPollingIntervalId] = useState(-1)
  const params = useParams<ProjectPathProps>()

  const { accountId } = params
  const { status, failureInfo } = step
  const hasError = Boolean(failureInfo?.responseMessages?.length)
  const activityId = useMemo(() => getActivityId(step), [step])

  const { error, data, loading, refetch } = useGetSRMAnalysisSummary({
    executionDetailId: activityId,
    queryParams: { accountId }
  })

  const loadingClass = loading ? Classes.SKELETON : ''
  const { detailsData, resource, linkTo, showStopAnalysis } = createDetailsData({
    activityId,
    data,
    params,
    getString
  })
  const { analysisStatus, executionDetailIdentifier } = resource || {}

  const progressPercentage = useMemo(() => calculateProgressPercentage(data), [data])

  useEffect(() => {
    if (!activityId) {
      setPollingIntervalId(oldIntervalId => {
        clearInterval(oldIntervalId)
        return -1
      })
      return
    }

    let intervalId = pollingIntervalId
    clearInterval(intervalId)

    if (analysisStatus === AnalysisStatus.RUNNING) {
      // eslint-disable-next-line
      // @ts-ignore
      intervalId = setInterval(refetch, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }

    if (activityId) {
      refetch?.()
    }

    return () => clearInterval(intervalId)
  }, [activityId, analysisStatus])

  let content = <></>

  if (!activityId) {
    content = hasError ? (
      <Container margin={'xlarge'} data-testid={'errorContainer'} flex={{ justifyContent: 'center' }} height={500}>
        <NoDataCard
          message={
            <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'center' }}>
              {failureInfo?.responseMessages?.map(item => (
                <Text key={item.message}>{item.message}</Text>
              ))}
            </Layout.Vertical>
          }
          icon="warning-sign"
        />
      </Container>
    ) : (
      <Container margin={'xlarge'} data-testid={'errorContainer'} flex={{ justifyContent: 'center' }} height={500}>
        <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
      </Container>
    )
  } else if (error) {
    if (status === ExecutionStatusEnum.Skipped) {
      content = (
        <Container margin={'xlarge'} data-testid={'errorContainer'}>
          <PageError message={failureInfo?.responseMessages?.[0]?.message} />
        </Container>
      )
    } else {
      content = (
        <Container margin={'xlarge'} data-testid={'errorContainer'}>
          <PageError message={getErrorMessage(error)} />
        </Container>
      )
    }
  } else {
    content = (
      <Layout.Vertical margin={isConsoleView ? '' : 'xlarge'} spacing={'small'}>
        <Layout.Horizontal spacing={'small'} className={css.statusContainer}>
          <Layout.Vertical spacing={'small'}>
            {detailsData.map(item => {
              return (
                <Layout.Horizontal key={item.label} margin={'xsmall'} spacing={'small'}>
                  <Text className={loadingClass}>{item.label} : </Text>
                  <Text className={loadingClass}>{item.value}</Text>
                </Layout.Horizontal>
              )
            })}
          </Layout.Vertical>
          <Layout.Horizontal spacing={'small'} flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <VerificationStatusCard status={analysisStatus} />
            {showStopAnalysis && <StopAnalysisButton eventId={executionDetailIdentifier as string} refetch={refetch} />}
          </Layout.Horizontal>
        </Layout.Horizontal>
        <CVProgressBar value={progressPercentage} status={analysisStatus} className={css.progressBar} />
        <Link to={linkTo} target="_blank" className={css.redirectLink}>
          <Layout.Horizontal spacing="small">
            <Text font={{ weight: 'semi-bold', size: 'normal' }} color={Color.PRIMARY_7}>
              {getString('cv.analyzeDeploymentImpact.redirectLabel')}
            </Text>
            <Icon name="share" size={14} flex={{ alignItems: 'center' }} color={Color.PRIMARY_7} />
          </Layout.Horizontal>
        </Link>
      </Layout.Vertical>
    )
  }

  return isConsoleView ? (
    <Container margin={'xlarge'}>
      <Text font={{ variation: FontVariation.H4 }} margin={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>
      {content}
    </Container>
  ) : (
    <Container>
      <Divider />
      {content}
    </Container>
  )
}
