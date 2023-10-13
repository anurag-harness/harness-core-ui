import { isEmpty } from 'lodash-es'
import { CDOnboardingSteps, WhatToDeployType, WhereAndHowToDeployType, PipelineSetupState } from './types'
import { INFRA_SUB_TYPES, SWIMLANE_DOCS_LINK } from './Constants'

function validateWhatToDeployStep(data: WhatToDeployType): boolean {
  let isValidStep = !isEmpty(data?.svcType?.id)
  const isArtifactDisabled = SWIMLANE_DOCS_LINK[data?.artifactType?.id as string]?.isInComplete === true
  if (isEmpty(data?.artifactType?.id) && isArtifactDisabled) {
    isValidStep = false
  }
  const hasArtifactSubtype = INFRA_SUB_TYPES[data?.artifactType?.id as string]
  const isArtifactSubTypeDisabled = SWIMLANE_DOCS_LINK[data?.artifactSubType?.id as string]?.isInComplete === true
  if (hasArtifactSubtype && !data?.artifactSubType?.id) {
    isValidStep = false
  } else if (isArtifactSubTypeDisabled) {
    isValidStep = false
  }

  return isValidStep
}

function validateWhereAndHowToDeployStep(data: WhereAndHowToDeployType): boolean {
  return Boolean(data?.installDelegateTried)
}

function validatePipelineSetupStep(data: PipelineSetupState): boolean {
  return Boolean(data?.pipelineVerified)
}

export const STEP_VALIDATION_MAP: { [key: string]: (data: any) => boolean } = {
  [CDOnboardingSteps.WHAT_TO_DEPLOY]: validateWhatToDeployStep,
  [CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]: validateWhereAndHowToDeployStep,
  [CDOnboardingSteps.DEPLOYMENT_STEPS]: validatePipelineSetupStep
}
