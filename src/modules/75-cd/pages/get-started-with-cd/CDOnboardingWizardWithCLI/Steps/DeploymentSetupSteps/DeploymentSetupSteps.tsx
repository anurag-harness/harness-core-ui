/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import CLISetupStep from './CLISetupStep'
import PipelineSetupStep from './PipelineSetupStep'
import DeploymentStrategySelection from './DeploymentStrategyStep'
import { CDOnboardingSteps, DeploymentStrategyTypes, PipelineSetupState } from '../../types'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import { WIZARD_STEP_OPEN } from '../../TrackingConstants'
import { getBranchingProps } from '../../utils'
interface DeploymentSetupStepsProps {
  saveProgress: (stepId: string, data: any) => void
}
export default function DeploymentSetupSteps({ saveProgress }: DeploymentSetupStepsProps): JSX.Element {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { stepsProgress } = useOnboardingStore()
  const [state, setState] = React.useState<PipelineSetupState>(() => {
    const defaultState = {
      apiKey: getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.prepareStep.apiKeyPlacholder')
    }
    return stepsProgress?.[CDOnboardingSteps.DEPLOYMENT_STEPS]?.stepData || defaultState
  })
  React.useEffect(() => {
    saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, {
      ...state,
      pipelineVerified: stepsProgress?.pipelineVerified,
      apiKey: undefined,
      githubPat: undefined
    })
  }, [state])

  const onUpdate = (data: PipelineSetupState): void => {
    setState({ ...state, ...data })
  }
  React.useEffect(() => {
    trackEvent(WIZARD_STEP_OPEN.Configuration_STEP_OPENED, getBranchingProps(stepsProgress))
  }, [])
  const setDeploymentStrategy = (strategy?: DeploymentStrategyTypes): void => {
    setState({ ...state, strategyId: strategy?.id })
  }
  return (
    <>
      <CLISetupStep state={state} onKeyGenerate={onUpdate} />
      <PipelineSetupStep state={state} onUpdate={onUpdate} />
      <DeploymentStrategySelection updateState={setDeploymentStrategy} saveProgress={saveProgress} />
    </>
  )
}
