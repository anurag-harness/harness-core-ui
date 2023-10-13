/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { StringsMap } from 'stringTypes'
import BlueGreenVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Blue-Green-deployment.mp4'
import CanaryVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Canary-deployment.mp4'
import RollingUpdateVideo from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Rolling-Update-deployment.mp4'
import HelmDeploymentBasic from '@pipeline/components/PipelineStudio/ExecutionStrategy/resources/Helm-Deployment-basic.mp4'
import { KubernetesType } from '@delegates/constants'
import type { EntityMap, DeploymentStrategyTypes, DeploymentFlowType } from './types'
import css from './CDOnboardingWizardWithCLI.module.scss'
interface KVPair {
  [key: string]: string
}
export const SERVICE_TYPES: EntityMap = {
  KubernetesService: { id: 'KubernetesService', label: 'Kubernetes Service', icon: 'app-kubernetes' },
  ServerlessFunction: {
    id: 'ServerlessFunction',
    label: 'Serverless Function',
    icon: 'serverless-deploy-step',
    className: css.blueIcons
  },
  TraditionalApp: { id: 'TraditionalApp', label: 'Traditional App', icon: 'chaos-cube', className: css.blueIcons }
}

export enum SERVERLESS_FUNCTIONS {
  AWS_LAMBDA_FUNCTION = 'AWS_LAMBDA_FUNCTION',
  GOOGLE_CLOUD_FUNCTION = 'GOOGLE_CLOUD_FUNCTION'
}
export const INFRA_TYPES: { [key: string]: EntityMap } = {
  KubernetesService: {
    KubernetesManifest: {
      id: KubernetesType.KUBERNETES_MANIFEST,
      label: 'Kubernetes Manifest',
      icon: 'app-kubernetes'
    },
    HelmChart: { id: KubernetesType.HELM_CHART, label: 'Helm Chart', icon: 'service-helm' },
    Kustomize: { id: 'Kustomize', label: 'Kustomize', icon: 'kustamize' }
  },
  ServerlessFunction: {
    AWSLambda: {
      id: SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION,
      label: 'AWS Lambda Function',
      icon: 'service-aws-lamda'
    },
    GCPFunction: {
      id: SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION,
      label: 'Google Cloud Function',
      icon: 'service-google-functions'
    }
  },
  TraditionalApp: {
    TraditionalAWS: {
      id: 'TraditionalAWS',
      label: 'Traditional AWS',
      icon: 'service-ec2'
    },
    TraditionalPhysical: {
      id: 'TraditionalPhysical',
      label: 'Physical Data Center',
      icon: 'chaos-cube'
    }
  }
}
export const INFRA_SUB_TYPES: { [key: string]: EntityMap } = {
  [KubernetesType.HELM_CHART]: {
    K8sHelm: {
      id: 'K8sHelm',
      label: 'Kubernetes with Helm',
      icon: 'app-kubernetes'
    },
    NativeHelm: { id: 'NativeHelm', label: 'Native Helm', icon: 'service-helm' }
  },
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: {
    ServerLessLambda: {
      id: 'ServerLessLambda',
      label: 'Serverless Function',
      icon: 'service-serverless'
    },
    NativeAWSLambda: {
      id: 'NativeAWSLambda',
      label: 'Native AWS Lambda',
      icon: 'service-aws-lamda'
    }
  },
  [SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION]: {
    GCPGen1: {
      id: 'GCPGen1',
      label: 'Google Cloud Function Gen 1',
      icon: 'service-google-functions'
    },
    GCPGen2: {
      id: 'GCPGen2',
      label: 'Google Cloud Function Gen 2',
      icon: 'service-google-functions'
    }
  }
}

export enum DEPLOYMENT_FLOW_ENUMS {
  CDPipeline = 'cd-pipeline',
  Gitops = 'gitops'
}
export enum DEPLOYMENT_STRATEGY_ENUMS {
  Canary = 'Canary',
  BlueGreen = 'BlueGreen',
  Rolling = 'Rolling'
}

export const DEPLOYMENT_STRATEGY_TYPES: {
  [key: string]: DeploymentStrategyTypes
} = {
  Canary: {
    id: 'Canary',
    label: 'Canary',
    icon: 'canary-icon',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.deploymentStrategies.canary.subtitle',
    steps: [
      {
        title: 'Canary deployment',
        description: 'pipeline.executionStrategy.strategies.canary.steps.step1.description'
      },
      { title: 'Canary delete', description: 'pipeline.executionStrategy.strategies.canary.steps.step2.description' },
      { title: 'Rolling Update', description: 'pipeline.executionStrategy.strategies.canary.steps.step3.description' }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createpipeline.createcanarycmd',
    pipelineName: 'canary-pipeline'
  },
  BlueGreen: {
    id: 'BlueGreen',
    label: 'Blue Green',
    icon: 'blue-green',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.deploymentStrategies.blueGreen.subtitle',
    steps: [
      { title: 'Step 1', description: 'pipeline.executionStrategy.strategies.rolling.steps.step1.description' },
      { title: 'Step 2', description: 'pipeline.executionStrategy.strategies.rolling.steps.step2.description' },
      {
        title: 'Step 3',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createpipeline.createbluegreencmd',
    pipelineName: 'bluegreen-pipeline'
  },
  Rolling: {
    id: 'Rolling',
    label: 'Rolling Update',
    icon: 'rolling-update',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.deploymentStrategies.rolling.subtitle',
    steps: [
      { title: 'Step 1', description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step1.description' },
      { title: 'Step 2', description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step2.description' },
      {
        title: 'Step 3',
        description: 'pipeline.executionStrategy.strategies.blueGreen.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createpipeline.createrollingcmd',
    pipelineName: 'rolling-pipeline'
  },
  Basic: {
    id: 'Basic',
    label: 'Basic Deployment',
    icon: 'basic-deployment',
    subtitle:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.deploymentStrategies.rolling.subtitle',
    steps: [
      { title: 'Step 1', description: 'pipeline.executionStrategy.strategies.rolling.steps.step1.description' },
      { title: 'Step 2', description: 'pipeline.executionStrategy.strategies.rolling.steps.step2.description' },
      {
        title: 'Step 3',
        description: 'pipeline.executionStrategy.strategies.rolling.steps.step3.description'
      }
    ],
    pipelineCommand:
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createpipeline.createrollingcmd'
  }
}
export const DEPLOYMENT_TYPE_MAP: { [key: string]: string[] } = {
  K8sHelm: ['Canary', 'BlueGreen'],
  NativeHelm: ['Rolling'],
  [KubernetesType.KUBERNETES_MANIFEST]: ['Canary', 'BlueGreen', 'Rolling'],
  Kustomize: ['Canary', 'BlueGreen', 'Rolling'],
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: ['Canary', 'BlueGreen', 'Rolling'],
  GCPGen2: ['Canary', 'BlueGreen', 'Rolling'],
  GCPGen1: ['Canary', 'BlueGreen', 'Rolling']
}

export const DEPLOYMENT_FLOW_TYPES: { [key in DEPLOYMENT_FLOW_ENUMS]: DeploymentFlowType } = {
  [DEPLOYMENT_FLOW_ENUMS.Gitops]: {
    id: DEPLOYMENT_FLOW_ENUMS.Gitops,
    label: 'CD Gitops',
    icon: 'slot-deployment',
    subtitle: 'Connect with a GitOps agent'
  },
  [DEPLOYMENT_FLOW_ENUMS.CDPipeline]: {
    id: DEPLOYMENT_FLOW_ENUMS.CDPipeline,
    label: 'CD Pipeline',
    icon: 'ci-build-pipeline',
    subtitle: 'Connect with a Kubernetes Delegate '
  }
}

export const StrategyVideoByType: KVPair = {
  BlueGreen: BlueGreenVideo,
  Rolling: RollingUpdateVideo,
  Canary: CanaryVideo,
  Basic: HelmDeploymentBasic
}

export const MAX_DELETAGE_POLL_COUNT = 10
export const DELETAGE_POLL_COUNT_INTERVAL_MS = 3000

export const PIPELINE_TO_STRATEGY_MAP: KVPair = {
  Canary: 'guestbook_canary_pipeline',
  BlueGreen: 'guestbook_bluegreen_pipeline',
  Rolling: 'guestbook_rolling_pipeline'
}

export const DEFAULT_IDENTIFIER = 'default'
export const API_KEY_TYPE = 'USER'
export const DEFAULT_TOKEN_IDENTIFIER = 'default-token'
export const TOKEN_MASK = 'XXXXXXX.XXXX.XXXXXX'

export const SYSTEM_ARCH_TYPES: KVPair = {
  ARM: 'ARM',
  AMD: 'AMD'
}

export const DEPLOYMENT_TYPE_TO_DIR_MAP: KVPair = {
  Kustomize: 'kustomize-guestbook',
  [KubernetesType.HELM_CHART]: 'helm-guestbook',
  [KubernetesType.KUBERNETES_MANIFEST]: 'guestbook',
  GCPGen1: 'google_cloud_function/firstgen',
  GCPGen2: 'google_cloud_function/secondgen'
}

export const DEPLOYMENT_TYPE_TO_FILE_MAPS: { [key: string]: KVPair } = {
  K8sHelm: {
    service: 'service-blucan',
    infrastructure: 'infrastructure-definition-blucan',
    [DEPLOYMENT_STRATEGY_ENUMS.BlueGreen]: 'bluegreen-pipeline',
    [DEPLOYMENT_STRATEGY_ENUMS.Canary]: 'canary-pipeline',
    env: 'environment-blucan'
  },
  NativeHelm: {
    service: 'service-rolling',
    infrastructure: 'infrastructure-definition-rolling',
    [DEPLOYMENT_STRATEGY_ENUMS.Rolling]: 'rolling-pipeline',
    env: 'environment-rolling'
  }
}

export const ARTIFACT_STRINGS_MAP_BY_TYPE: { [key: string]: { [key: string]: keyof StringsMap } } = {
  KubernetesService: {
    svcrep: 'cd.getStartedWithCD.flowByQuestions.what.K8sSteps.k8sSvcRep',
    svcsubtext: 'cd.getStartedWithCD.flowByQuestions.what.K8sSteps.artifact'
  },
  ServerlessFunction: {
    svcrep: 'cd.getStartedWithCD.flowByQuestions.what.ServerlessSteps.svcrep'
  },
  [KubernetesType.HELM_CHART]: {
    artifact: 'cd.getStartedWithCD.flowByQuestions.what.K8sSteps.k8sHelm'
  },
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: {
    artifact: 'cd.getStartedWithCD.flowByQuestions.what.ServerlessSteps.artifactaws'
  },
  [SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION]: {
    artifact: 'cd.getStartedWithCD.flowByQuestions.what.ServerlessSteps.artifactgcf'
  },
  TraditionalApp: {
    svcrep: 'cd.getStartedWithCD.flowByQuestions.what.TraditionalApp.artifact'
  }
}

export const SWIMLANE_DOCS_LINK: {
  [key: string]: {
    isInComplete: boolean
    link: string
  }
} = {
  TraditionalAWS: {
    isInComplete: true,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/vm/aws'
  },
  ServerLessLambda: {
    isInComplete: true,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/serverless/aws-lambda'
  },
  NativeAWSLambda: {
    isInComplete: true,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/serverless/aws-lambda'
  },
  GCPGen1: {
    isInComplete: true,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/serverless/gcp-cloud-func'
  },
  GCPGen2: {
    isInComplete: true,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/serverless/gcp-cloud-func'
  },
  TraditionalPhysical: {
    isInComplete: true,
    link: 'https://developer.harness.io/tutorials/cd-pipelines/vm/pdc'
  }
}
