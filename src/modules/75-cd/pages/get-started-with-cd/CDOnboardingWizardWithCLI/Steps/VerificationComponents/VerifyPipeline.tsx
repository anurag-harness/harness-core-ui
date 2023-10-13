/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, ButtonVariation, Button, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useGetPipeline } from 'services/pipeline-ng'
import { CDOnboardingSteps, PipelineSetupState, WhatToDeployType } from '../../types'
import { PIPELINE_TO_STRATEGY_MAP } from '../../Constants'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import { getBranchingProps } from '../../utils'
import { ONBOARDING_INTERACTIONS } from '../../TrackingConstants'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
interface VerifyPipelineProps {
  saveProgress: (stepId: string, data: any) => void
}
export default function VerifyPipeline({ saveProgress }: VerifyPipelineProps): JSX.Element {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { stepsProgress } = useOnboardingStore()
  const { trackEvent } = useTelemetry()

  const pipelineStepsdata = React.useMemo((): PipelineSetupState => {
    return stepsProgress[CDOnboardingSteps.DEPLOYMENT_STEPS]?.stepData
  }, [stepsProgress])
  const { data, refetch, error } = useGetPipeline({
    pipelineIdentifier: PIPELINE_TO_STRATEGY_MAP[pipelineStepsdata?.strategyId as string] || '',
    lazy: true,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  useEffect(() => {
    const pipelineName = PIPELINE_TO_STRATEGY_MAP[pipelineStepsdata?.strategyId as string] || ''
    if (data?.data && !pipelineStepsdata?.pipelineVerified) {
      saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, { ...pipelineStepsdata, pipelineVerified: true })
      trackEvent(ONBOARDING_INTERACTIONS.CONFIG_VERIFICATION_SUCCESS, {
        ...getBranchingProps(stepsProgress),
        pipelineName
      })
    }

    if (error) {
      if (pipelineStepsdata?.pipelineVerified !== false) {
        saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, { ...pipelineStepsdata, pipelineVerified: false })
        trackEvent(ONBOARDING_INTERACTIONS.CONFIG_VERIFICATION_FAIL, {
          ...getBranchingProps(stepsProgress),
          pipelineName
        })
      }
    }
  }, [data, error, pipelineStepsdata])

  const refetchPipeline = async (): Promise<void> => {
    await refetch()
    const pipelineName = PIPELINE_TO_STRATEGY_MAP[pipelineStepsdata?.strategyId as string] || ''
    trackEvent(ONBOARDING_INTERACTIONS.CONFIG_VERIFICATION_START, { ...getBranchingProps(stepsProgress), pipelineName })
  }
  return (
    <Layout.Vertical className={css.verifyPipeline} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
      <Text color={Color.BLACK} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'large' }}>
        <String
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.headsteps.verifyPipeline"
          vars={{
            num:
              (stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData as WhatToDeployType)?.svcType?.id ===
              'KubernetesService'
                ? 4
                : 5
          }}
        />
      </Text>
      {!pipelineStepsdata?.pipelineVerified && !data?.data && !error && (
        <Layout.Horizontal className={css.verifyPipelineText}>
          <Button width={80} onClick={refetchPipeline} variation={ButtonVariation.PRIMARY}>
            {getString('verify')}
          </Button>
        </Layout.Horizontal>
      )}
      {error && !pipelineStepsdata?.pipelineVerified && <TroubleShootPipeline refetchPipeline={refetchPipeline} />}
      {(data?.data || pipelineStepsdata?.pipelineVerified) && <PipelineSuccess />}
    </Layout.Vertical>
  )
}

function PipelineSuccess(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical background={Color.GREEN_50} margin={{ top: 'xlarge', bottom: 'xlarge' }} padding="large">
      <Text
        icon="tick-circle"
        iconProps={{ color: Color.GREEN_900, padding: { right: 'large' } }}
        color={Color.GREEN_900}
      >
        {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.deploymentStrategyStep.pipelinesuccess')}
      </Text>
    </Layout.Vertical>
  )
}

function TroubleShootPipeline({ refetchPipeline }: { refetchPipeline: () => Promise<void> }): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical
      color={Color.ERROR}
      background={Color.RED_50}
      padding="large"
      margin={{ top: 'xlarge', bottom: 'xlarge' }}
    >
      <Text
        padding={{ bottom: 'xlarge' }}
        icon="danger-icon"
        iconProps={{ color: Color.ERROR, padding: { right: 'large' }, className: css.redIcon }}
        color={Color.ERROR}
        className={css.bold}
      >
        {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.deploymentStrategyStep.pipelinenotfound')}
      </Text>
      <Text padding={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.deploymentStrategyStep.recheckpipeline')}
      </Text>
      <Layout.Horizontal spacing="large">
        <Button variation={ButtonVariation.SECONDARY} onClick={refetchPipeline}>{`${getString('retry')} ${getString(
          'common.purpose.cv.verification'
        )}`}</Button>
        {/* to be enabled later */}
        {/* <Button variation={ButtonVariation.LINK}>{`${getString('retry')} ${getString(
          'platform.delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot'
        )}`}</Button> */}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
