import { UseStringsReturn } from 'framework/strings'
import { DEPLOYMENT_TYPE_TO_FILE_MAPS } from './Constants'
import { StepsProgress } from './Store/OnboardingStore'
import { BRANCH_LEVEL } from './TrackingConstants'
import { CDOnboardingSteps, WhatToDeployType } from './types'
interface GetCommandsParam {
  getString: UseStringsReturn['getString']
  dirPath: string
  accountId: string
  githubUsername?: string
  apiKey?: string
  delegateName?: string
  githubPat?: string
  artifactSubtype?: string
}
export const getCommandStrWithNewline = (cmd: string[]): string => cmd.join(' \n')

export const getCommandsByDeploymentType = ({
  getString,
  dirPath,
  githubUsername,
  githubPat,
  accountId,
  apiKey,
  delegateName,
  artifactSubtype
}: GetCommandsParam): string => {
  const { service, infrastructure, env } = DEPLOYMENT_TYPE_TO_FILE_MAPS[artifactSubtype as string] || {}

  return getCommandStrWithNewline([
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.cloneRepo'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.clonecmd', {
      gitUser:
        githubUsername ||
        getString(
          'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitusernamePlaceholder'
        )
    }),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.cdDir'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.cddir'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.login'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.logincmd', {
      accId: accountId,
      apiKey: apiKey
    }),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSecret'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createsecret', {
      gitPat:
        githubPat ||
        getString(
          'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitpatPlaceholder'
        ),
      type: dirPath
    }),

    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitIcon'
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createGithubcon',
      {
        gitUser:
          githubUsername ||
          getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitusernamePlaceholder'
          ),
        type: dirPath
      }
    ),

    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createK8scon'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createk8scon', {
      delegateName,
      type: dirPath
    }),

    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSvc'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createsvccmd', {
      type: dirPath,
      service: service || 'service'
    }),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createEnv'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createenvcmd', {
      type: dirPath,
      environment: env || 'environment'
    }),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createInfra'
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createinfracmd',
      {
        type: dirPath,
        infrastructureDefinition: infrastructure || 'infrastructure-definition'
      }
    )
  ])
}

export const getBranchingProps = (state: StepsProgress): { [key: string]: string | undefined } => {
  const branchDetails: { [key: string]: string | undefined } = {
    [BRANCH_LEVEL.BRANCH_LEVEL_1]: (state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.svcType
      ?.label,
    [BRANCH_LEVEL.BRANCH_LEVEL_2]: (state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)
      ?.artifactType?.label
  }
  if ((state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.artifactSubType?.label) {
    branchDetails[BRANCH_LEVEL.BRANCH_LEVEL_3] = (
      state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType
    )?.artifactSubType?.label
  }

  return branchDetails
}
