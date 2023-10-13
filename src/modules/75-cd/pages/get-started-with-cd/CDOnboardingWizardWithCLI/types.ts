import type { IconName } from '@harness/icons'
import type { DelegateCommonProblemTypes } from '@delegates/constants'
import type { StringsMap } from 'stringTypes'
export interface EntityType {
  id: string
  label: string
  icon?: IconName
  className?: string
}
export interface DeploymentStrategyTypes extends EntityType {
  subtitle?: keyof StringsMap
  steps?: { title: string; description: keyof StringsMap }[]
  pipelineCommand: keyof StringsMap
  pipelineName?: string
}
export interface EntityMap {
  [key: string]: EntityType
}
export interface DeploymentFlowType extends EntityType {
  subtitle: string
}

export enum CDOnboardingSteps {
  WHAT_TO_DEPLOY = 'whatToDeploy',
  HOW_N_WHERE_TO_DEPLOY = 'howNwhere',
  DEPLOYMENT_STEPS = 'deploymentSteps',
  REVIEW_AND_RUN_PIPELINE = 'reviewAndRunPipeline'
}
export interface WhatToDeployType {
  svcType?: EntityType
  artifactType?: EntityType
  artifactSubType?: EntityType
}
export type DelegateStatus = 'PENDING' | 'TRYING' | 'SUCCESS' | 'FAILED'
export interface WhereAndHowToDeployType {
  type?: DeploymentFlowType
  delegateName?: string
  delegateType?: DelegateCommonProblemTypes
  delegateProblemType?: string
  isDelegateVerified?: boolean
  installDelegateTried?: boolean
  delegateStatus: DelegateStatus
}

export interface PipelineSetupState {
  apiKey: string
  githubUsername?: string
  githubPat?: string
  strategyId?: string
  pipelineVerified?: boolean
}

export interface ApiKeySetupProps {
  onKeyGenerate: (data: PipelineSetupState) => void
}
