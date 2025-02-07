/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, isEmpty } from 'lodash-es'
import moment from 'moment'
import { RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import { moduleToModuleNameMapping } from 'framework/types/ModuleName'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { parseInput } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'
import type { GitQueryParams, Module } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { Connectors, connectorUrlType } from '@platform/connectors/constants'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ConnectorRefWidth } from './constants'

// Returns first 7 letters of commit ID
export function getShortCommitId(commitId: string): string {
  return commitId.slice(0, 7)
}
const cloneCodebaseKeyRef = 'stage.spec.cloneCodebase'

export enum CodebaseTypes {
  BRANCH = 'branch',
  TAG = 'tag',
  PR = 'PR'
}

// TODO: Add singular forms, better using i18n because they have support for it
export function getTimeAgo(timeStamp: number): string {
  const currentDate = moment(new Date())
  const timeStampAsDate = moment(timeStamp)

  if (currentDate.diff(timeStampAsDate, 'days') > 30) {
    return `on ${timeStampAsDate.format('MMM D')}`
  } else if (currentDate.diff(timeStampAsDate, 'days') === 1) {
    return 'yesterday'
  } else if (currentDate.diff(timeStampAsDate, 'days') === 0) {
    if (currentDate.diff(timeStampAsDate, 'minutes') >= 60) {
      return `${currentDate.diff(timeStampAsDate, 'hours')} hours ago`
    } else {
      return `${currentDate.diff(timeStampAsDate, 'minutes')} minutes ago`
    }
  } else {
    return `${currentDate.diff(timeStampAsDate, 'days')} days ago`
  }
}

export function useGitScope(): GitFilterScope | undefined {
  const gitDetails = usePipelineContext()?.state?.gitDetails
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  if (!isEmpty(gitDetails)) {
    return {
      repo: gitDetails.repoIdentifier!,
      branch: gitDetails.branch!,
      getDefaultFromOtherRepo: true
    }
  } else if (!!repoIdentifier && !!branch) {
    return {
      repo: repoIdentifier,
      branch,
      getDefaultFromOtherRepo: true
    }
  }
}

export const getAllowedValuesFromTemplate = (template: Record<string, any>, fieldPath: string): SelectOption[] => {
  if (!template || !fieldPath) {
    return []
  }
  const value = get(template, fieldPath, '')
  const type = get(template, fieldPath.substring(0, fieldPath.lastIndexOf('.')))?.type
  const parsedInput = parseInput(value, { variableType: type })
  const items: SelectOption[] = defaultTo(parsedInput?.allowedValues?.values, []).map(item => ({
    label: item,
    value: item
  }))

  return items
}

export const getHasValuesAsRuntimeInputFromTemplate = ({
  template,
  templateFieldName
}: {
  template?: Record<string, any>
  templateFieldName?: string
}): boolean => {
  if (!template || !templateFieldName) {
    return false
  }
  return Object.values(get(template, templateFieldName, {})).includes(RUNTIME_INPUT_VALUE)
}

export const shouldRenderRunTimeInputView = (value: any): boolean => {
  if (!value) {
    return false
  }
  if (typeof value === 'object') {
    return Object.keys(value).some(key => typeof value[key] === 'string' && value[key].startsWith(RUNTIME_INPUT_VALUE))
  } else {
    return typeof value === 'string' && value.startsWith(RUNTIME_INPUT_VALUE)
  }
}

export const shouldRenderRunTimeInputViewWithAllowedValues = (
  fieldPath: string,
  template?: Record<string, any>
): boolean => {
  if (!template || !fieldPath) {
    return false
  }
  const allowedValues = get(template, fieldPath, '')
  const type = get(template, fieldPath.substring(0, fieldPath.lastIndexOf('.')))?.type
  const parsedInput = parseInput(allowedValues, { variableType: type })
  return shouldRenderRunTimeInputView(allowedValues) && !!parsedInput?.allowedValues?.values
}

export const getConnectorRefWidth = (viewType: StepViewType | string): number =>
  Object.entries(ConnectorRefWidth).find(key => key[0] === viewType)?.[1] || ConnectorRefWidth.DefaultView

export const isRuntimeInput = (str: unknown): boolean => typeof str === 'string' && str?.includes(RUNTIME_INPUT_VALUE)

// need to check if this is enabled at least one stage in regular or in paralle
export const isCloneCodebaseEnabledAtLeastOneStage = (pipeline?: PipelineInfoConfig): boolean =>
  !!pipeline?.stages?.some(
    stage =>
      get(stage, cloneCodebaseKeyRef) || stage.parallel?.some(parallelStage => get(parallelStage, cloneCodebaseKeyRef))
  )

export const isCodebaseFieldsRuntimeInputs = (template?: PipelineInfoConfig): boolean =>
  Object.keys(template?.properties?.ci?.codebase || {}).filter(x => x !== 'build')?.length > 0 // show codebase when more fields needed

export const getPipelineWithoutCodebaseInputs = (values: { [key: string]: any }): { [key: string]: any } => {
  if (values?.pipeline) {
    const newPipeline: any = {
      ...values.pipeline
    }
    if (newPipeline?.template?.templateInputs?.properties) {
      delete newPipeline.template.templateInputs.properties
    }
    return newPipeline
  } else {
    const newValues: any = {
      ...values
    }
    if (newValues?.template?.templateInputs?.properties) {
      delete newValues.template.templateInputs.properties
    }
    return newValues
  }
}

export const getCodebaseRepoNameFromConnector = (codebaseConnector: ConnectorInfoDTO): string => {
  let repoName = ''
  const connectorGitScope = get(codebaseConnector, 'spec.type', '')
  if (connectorGitScope === connectorUrlType.REPO) {
    const repoURL: string = get(codebaseConnector, 'spec.url')
    repoName = extractRepoNameFromUrl(repoURL)
  } else if (connectorGitScope === connectorUrlType.ACCOUNT || connectorGitScope === connectorUrlType.PROJECT) {
    repoName = get(codebaseConnector, 'spec.validationRepo', '')
  }
  return repoName
}

const GIT_REPO_URL_REGEX = /(http|https|git|ssh)(:\/\/|@)([^/:]+(:d+)?)[/:](vd\/)?([^/:]+)\/(.+)?(.git)?/gm

export const extractRepoNameFromUrl = (repoURL: string): string => {
  if (!repoURL || !repoURL.match(GIT_REPO_URL_REGEX)) {
    return ''
  }
  if (repoURL.includes('/')) {
    // A valid git repo url should have a protocol, a namespace/project and actual repo name, all separated by '/'.
    // Some git providers can have other metadata in the middle as well, but the last token has to be repo name if it matches above regex
    const tokens = repoURL.split('/')
    const repoName = tokens.length > 0 ? tokens[tokens.length - 1] : ''
    return repoName.endsWith(GIT_EXTENSION) ? repoName.replace(GIT_EXTENSION, '') : repoName
  }
  return ''
}

export const getGitUrl = (
  getString: UseStringsReturn['getString'],
  connectorType?: ConnectorInfoDTO['type']
): string => {
  if (!connectorType) {
    return ''
  }
  switch (connectorType) {
    case Connectors.GITHUB:
      return getString('platform.connectors.gitProviderURLs.github')
    case Connectors.BITBUCKET:
      return getString('platform.connectors.gitProviderURLs.bitbucket')
    case Connectors.GITLAB:
      return getString('platform.connectors.gitProviderURLs.gitlab')
    case Connectors.AZURE_REPO:
      return getString('platform.connectors.gitProviderURLs.azureRepos')
    default:
      return ''
  }
}

export const getIsFailureStrategyDisabled = ({
  stageType,
  stepType
}: {
  stageType?: StageType
  stepType?: StepType
}): boolean => stageType === StageType.BUILD && stepType === StepType.Background

export const GIT_EXTENSION = '.git'

export const isSimplifiedYAMLEnabledForCI = (module?: Module, isSimpliedYAMLFFEnabled?: boolean): boolean => {
  return isSimpliedYAMLFFEnabled
    ? module?.valueOf().toLowerCase() === moduleToModuleNameMapping.ci.toLowerCase()
    : false
}

export enum YAMLVersion {
  V0 = 'v0',
  V1 = 'v1'
}
