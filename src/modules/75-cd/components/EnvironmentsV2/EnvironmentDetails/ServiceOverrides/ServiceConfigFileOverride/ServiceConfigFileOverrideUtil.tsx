/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ConfigFilesMap } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import type { ConfigFileType } from '@pipeline/components/ConfigFilesSelection/ConfigFilesInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { ServiceDefinition } from 'services/cd-ng'

export const AllowedConfigStoresTypes = [ConfigFilesMap.Harness]
export const OverrideGitStores = [
  ConfigFilesMap.Github,
  ConfigFilesMap.Git,
  ConfigFilesMap.Bitbucket,
  ConfigFilesMap.GitLab
]

export function getAllowedConfigStores(): ConfigFileType[] {
  return [...AllowedConfigStoresTypes, ...OverrideGitStores]
}

export const shouldShowGitConfigStores = (deploymentType: ServiceDefinition['type']): boolean => {
  return [
    ServiceDeploymentType.WinRm,
    ServiceDeploymentType.Ssh,
    ServiceDeploymentType.TAS,
    ServiceDeploymentType.Kubernetes,
    ServiceDeploymentType.AzureWebApp,
    ServiceDeploymentType.NativeHelm,
    ServiceDeploymentType.AwsLambda,
    ServiceDeploymentType.Asg,
    ServiceDeploymentType.GoogleCloudFunctions,
    ServiceDeploymentType.ECS,
    ServiceDeploymentType.Elastigroup,
    ServiceDeploymentType.ServerlessAwsLambda
  ].includes(deploymentType as ServiceDeploymentType)
}
