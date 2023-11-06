/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, defaultTo, get, isEmpty, set, unset, uniqBy } from 'lodash-es'
import { AllowedTypes, MultiTypeInputType, IconName, SelectOption, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import produce from 'immer'
import { getStageFromPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/helpers'
import type { AllNGVariables, Pipeline } from '@pipeline/utils/types'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { FeaturesProps } from 'framework/featureStore/featureStoreUtil'
import type { UseStringsReturn } from 'framework/strings'
import type { InputSetErrorResponse, PipelineInfoConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import { parseInput } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isMultiTypeExpression, isMultiTypeFixed, isMultiTypeRuntime } from '@common/utils/utils'
import cdExecutionListIllustration from '../pages/execution-list/images/cd-execution-illustration.svg'
import ciExecutionListIllustration from '../pages/execution-list/images/ci-execution-illustration.svg'
import stoExecutionListIllustration from '../pages/execution-list/images/sto-execution-illustration.svg'
import executionListIllustration from '../pages/execution-list/images/execution-illustration.svg'

export interface MergeStageProps {
  stage: StageElementWrapperConfig
  inputSetPortion: Pipeline
  allValues: Pipeline
  shouldUseDefaultValues: boolean
}

export function walkObjectRecursively(
  obj: unknown,
  callback: (key: string, value: unknown, path: string[]) => void,
  path: string[] = []
): void {
  if (typeof obj === 'object' && obj !== null) {
    // if we have both default key and <+input>.default() then use the later else use default provided as key
    if (
      get(obj, 'default') &&
      typeof get(obj, 'value') === 'string' &&
      get(obj, 'value')?.startsWith(RUNTIME_INPUT_VALUE) &&
      !get(obj, 'value')?.includes('default')
    ) {
      set(obj, 'value', get(obj, 'default'))
    }

    Object.entries(obj).forEach(([key, value]) => {
      callback(key, value, [...path, key])
      walkObjectRecursively(value, callback, [...path, key])
    })
  }
}

const RUNTIME_COLLECTION_FIELDS_WHITE_LIST = ['files', 'encryptedFiles', 'hostAttributes', 'artifactPaths']
const RUNTIME_FIELD_REMOVAL_LIST = ['when', 'failureStrategies', 'strategy']

/**
 * Loops over the pipeline and clears all the runtime inputs i.e. <+input>
 */
export function clearRuntimeInput<T = PipelineInfoConfig>(template: T, shouldAlsoClearRuntimeInputs?: boolean): T {
  return produce(template, draft => {
    walkObjectRecursively(draft, (key, value, path) => {
      if (typeof value === 'string' && value.startsWith(RUNTIME_INPUT_VALUE)) {
        const isCollectionField = RUNTIME_COLLECTION_FIELDS_WHITE_LIST.includes(key)

        if (RUNTIME_FIELD_REMOVAL_LIST.includes(key)) {
          unset(draft, path)
          return
        }

        const pathToType = [...path]
        pathToType[path.length - 1] = 'type'
        const variableType = get(template, pathToType)

        const parsed = parseInput(value, { variableType })

        if (!parsed) {
          return
        }

        if (parsed.executionInput && !shouldAlsoClearRuntimeInputs) {
          return value
        }

        if (parsed.default !== null) {
          set(draft as any, path, parsed.default)
          return
        }

        set(draft as any, path, isCollectionField ? [''] : '')
      }
    })
  })
}

function mergeStage(props: MergeStageProps): StageElementWrapperConfig {
  const { stage, inputSetPortion, allValues, shouldUseDefaultValues } = props
  const stageIdToBeMatched = defaultTo(stage.stage?.identifier, '')
  const matchedStageInInputSet = getStageFromPipeline(stageIdToBeMatched, inputSetPortion.pipeline)

  if (matchedStageInInputSet.stage) {
    const matchedStageInAllValues = getStageFromPipeline(stageIdToBeMatched, allValues.pipeline)
    const isStageTemplate = !isEmpty(stage.stage?.template)
    const templateStageDefaultPath = `stage.template.templateInputs`
    const serviceVariablePath = `spec.serviceConfig.serviceDefinition.spec.variables`

    const stageVariables = isStageTemplate
      ? get(stage, `${templateStageDefaultPath}.variables`)
      : get(stage, `stage.variables`)
    const stageInputSetVariables = matchedStageInInputSet.stage?.stage?.template
      ? get(matchedStageInInputSet.stage, `${templateStageDefaultPath}.variables`)
      : get(matchedStageInInputSet.stage, `stage.variables`)

    if (stageVariables || stageInputSetVariables) {
      const updatedStageVars = getMergedVariables({
        variables: defaultTo(stageVariables, []) as AllNGVariables[],
        inputSetVariables: defaultTo(stageInputSetVariables, []) as AllNGVariables[],
        allVariables: defaultTo(matchedStageInAllValues.stage?.stage?.variables, []) as AllNGVariables[],
        shouldUseDefaultValues
      })
      set(
        matchedStageInInputSet,
        matchedStageInInputSet.stage.stage?.template
          ? `stage.${templateStageDefaultPath}.variables`
          : 'stage.stage.variables',
        updatedStageVars
      )
    }
    // This is to set default value for Service variables in formik
    const serviceVariables = isStageTemplate
      ? get(stage, `${templateStageDefaultPath}.${serviceVariablePath}`)
      : get(stage, `stage.${serviceVariablePath}`)
    const inputSetServiceVariables = matchedStageInInputSet.stage?.stage?.template
      ? get(matchedStageInInputSet.stage, `${templateStageDefaultPath}.${serviceVariablePath}`)
      : get(matchedStageInInputSet.stage, `stage.${serviceVariablePath}`)

    if (serviceVariables || inputSetServiceVariables) {
      const updatedStageServiceVars = getMergedVariables({
        variables: defaultTo(serviceVariables, []) as AllNGVariables[],
        inputSetVariables: defaultTo(inputSetServiceVariables, []) as AllNGVariables[],
        allVariables: defaultTo(get(matchedStageInAllValues.stage?.stage, serviceVariablePath), []) as AllNGVariables[],
        shouldUseDefaultValues
      })
      set(
        matchedStageInInputSet,
        matchedStageInInputSet.stage.stage?.template
          ? `stage.${templateStageDefaultPath}.${serviceVariablePath}`
          : `stage.stage.${serviceVariablePath}`,
        updatedStageServiceVars
      )
    }

    return matchedStageInInputSet.stage
  }

  return stage
}

export interface MergeTemplateWithInputSetDataProps {
  templatePipeline: Pipeline
  /**
   * Input set to merged. In case of no input sets,
   * just pass all values in place of input sets
   */
  inputSetPortion: Pipeline
  allValues: Pipeline
  shouldUseDefaultValues: boolean
}

export const mergeTemplateWithInputSetData = (props: MergeTemplateWithInputSetDataProps): Pipeline => {
  const { templatePipeline, inputSetPortion, allValues, shouldUseDefaultValues } = props
  // Replace all the matching stages in parsedTemplate with the stages received in input set portion
  // cloneDeep the stages values are we are processing the states for parallel stages
  const stages = cloneDeep(
    templatePipeline.pipeline?.template
      ? (templatePipeline.pipeline.template.templateInputs as PipelineInfoConfig)?.stages
      : templatePipeline.pipeline?.stages
  )
  const mergedStages = stages?.map(stage => {
    if (stage.parallel) {
      /*
      This stage is parallel. Now loop over all the children stages, and check if any of them match in input set portion
      We update all the parallel stages with the ones matching in the input set portion
      and then finally return the new 'updatedParallelStages' object
      */
      const updatedParallelStages = stage.parallel.map(parallelStage =>
        mergeStage({ stage: parallelStage, inputSetPortion, allValues, shouldUseDefaultValues })
      )
      // Finally setting the updatedParallelStages in the original object, so that the 'mergedStages' will have the updated values
      stage.parallel = updatedParallelStages
      return stage
    }

    /*
    This block will be executed if there are no parallel stages.
    Simply loop over the stages and keep matching and replacing
    */
    return mergeStage({ stage, inputSetPortion, allValues, shouldUseDefaultValues })
  })

  const toBeUpdated = cloneDeep(templatePipeline)
  if (toBeUpdated.pipeline?.template) {
    if (Array.isArray(mergedStages)) {
      set(toBeUpdated, 'pipeline.template.templateInputs.stages', mergedStages)
    }

    if ((inputSetPortion.pipeline?.template?.templateInputs as PipelineInfoConfig)?.properties?.ci) {
      set(
        toBeUpdated,
        'pipeline.template.templateInputs.properties.ci',
        (inputSetPortion.pipeline?.template?.templateInputs as PipelineInfoConfig).properties?.ci
      )
    }
    if ((inputSetPortion.pipeline?.template?.templateInputs as PipelineInfoConfig)?.variables) {
      set(
        toBeUpdated,
        'pipeline.template.templateInputs.variables',
        getMergedVariables({
          variables: defaultTo(
            (toBeUpdated.pipeline?.template?.templateInputs as PipelineInfoConfig)?.variables,
            []
          ) as AllNGVariables[],
          inputSetVariables: defaultTo(
            (inputSetPortion.pipeline?.template?.templateInputs as PipelineInfoConfig)?.variables,
            []
          ) as AllNGVariables[],
          allVariables: defaultTo(allValues.pipeline?.variables, []) as AllNGVariables[],
          shouldUseDefaultValues
        })
      )
    }

    if ((inputSetPortion.pipeline?.template?.templateInputs as PipelineInfoConfig)?.delegateSelectors) {
      set(
        toBeUpdated,
        'pipeline.template.templateInputs.delegateSelectors',
        (inputSetPortion.pipeline?.template?.templateInputs as PipelineInfoConfig).delegateSelectors
      )
    }
  } else {
    if (Array.isArray(mergedStages)) {
      toBeUpdated.pipeline.stages = mergedStages
    }

    if (inputSetPortion.pipeline?.properties?.ci) {
      if (!toBeUpdated.pipeline.properties) {
        toBeUpdated.pipeline.properties = {}
      }
      toBeUpdated.pipeline.properties.ci = inputSetPortion.pipeline.properties.ci
    }

    /*
    Below portion adds variables to the pipeline.
    If your input sets has variables, use them.
    Eventually in run pipeline form -
    If input sets are selected, we will supply the variables from 'toBeUpdated' pipleine
    This is why 'toBeUpdated' pipeline should have the variables
    */

    if (inputSetPortion.pipeline?.variables) {
      // If we have variables saved in input set, pick them and update

      toBeUpdated.pipeline.variables = getMergedVariables({
        variables: defaultTo(toBeUpdated.pipeline?.variables, []) as AllNGVariables[],
        inputSetVariables: defaultTo(inputSetPortion.pipeline.variables, []) as AllNGVariables[],
        allVariables: defaultTo(allValues.pipeline?.variables, []) as AllNGVariables[],
        shouldUseDefaultValues
      })
    }

    if (inputSetPortion.pipeline?.delegateSelectors) {
      toBeUpdated.pipeline.delegateSelectors = inputSetPortion.pipeline.delegateSelectors
    }
  }
  return toBeUpdated
}

// Used in Input Set form and save as input set call in run pipeline
export const getFormattedErrors = (apiErrorMap?: { [key: string]: InputSetErrorResponse }): Record<string, any> => {
  const toReturn: Record<string, any> = {}
  if (apiErrorMap) {
    const apiErrorKeys = Object.keys(apiErrorMap)
    apiErrorKeys.forEach(apiErrorKey => {
      const errorsForKey = apiErrorMap[apiErrorKey].errors || []
      if (errorsForKey[0].fieldName) {
        toReturn[errorsForKey[0].fieldName] = `${errorsForKey[0].fieldName}: ${errorsForKey[0].message}`
      }
    })
  }
  return toReturn
}

export const getOverlayErrors = (invalidReferences: Record<string, string>): Record<string, any> => {
  const toReturn: Record<string, any> = {}
  if (invalidReferences) {
    Object.keys(invalidReferences).forEach(invalidReferenceKey => {
      toReturn[invalidReferenceKey] = `${invalidReferenceKey}: ${invalidReferences[invalidReferenceKey]}`
    })
  }

  return toReturn
}

export interface GetMergedVariablesProps {
  variables: AllNGVariables[]
  inputSetVariables: AllNGVariables[]
  allVariables: AllNGVariables[]
  shouldUseDefaultValues: boolean
}

export const getMergedVariables = (props: GetMergedVariablesProps): AllNGVariables[] => {
  const { inputSetVariables, variables, allVariables, shouldUseDefaultValues } = props
  // create a map of input set variables values for easier lookup
  // we use "name" of the varibale as the key
  const variablesMap: Record<string, AllNGVariables> = variables.reduce(
    (acc, curr) => ({ ...acc, [defaultTo(curr.name, '')]: curr }),
    {}
  )
  const inputSetVariablesMap: Record<string, AllNGVariables> = inputSetVariables.reduce(
    (acc, curr) => ({ ...acc, [defaultTo(curr.name, '')]: curr }),
    {}
  )
  const allVariablesMap: Record<string, AllNGVariables> = allVariables.reduce(
    (acc, curr) => ({ ...acc, [defaultTo(curr.name, '')]: curr }),
    {}
  )

  // find all the unique variables from both template and the input set values
  // There might be case where a variable is missing in either of them
  // This scenario will happen only when variables are added or removed after an execution
  // and the user is trying to re-run an old execution
  const mergedVariableNames = uniqBy([...variables, ...inputSetVariables], v => v.name)
    .filter(v => v.name)
    .map(v => v.name) as string[]

  // loop over all the uniq variables and update their values from input sets
  const finalVariables: AllNGVariables[] = mergedVariableNames.map((name): AllNGVariables => {
    const variable = variablesMap[name]
    const type = defaultTo(variable?.type, 'String')

    if (variable) {
      if (name in inputSetVariablesMap) {
        // copy the variable data
        const varFromInpuSet: AllNGVariables = { ...inputSetVariablesMap[name] }
        const varFromAllVars: AllNGVariables = allVariablesMap[name]

        // remove the variable from input set variables
        delete inputSetVariablesMap[name]

        // use new value if the type of varibale is same else use the current value
        let value = varFromInpuSet.type === type ? varFromInpuSet.value : variable.value

        // fallback to default value, if the flag is true, the value is empty and
        // the variable has a default value defined in pipeline
        if (shouldUseDefaultValues && !value && typeof varFromAllVars?.default !== 'undefined') {
          value = varFromAllVars.default
        }

        value = defaultTo(value, '')

        return {
          name,
          type,
          value
        } as AllNGVariables
      }
      return variable
    }
    return inputSetVariablesMap[name]
  })

  return finalVariables
}

export const getRbacButtonModules = (module?: string): string[] => {
  const rbacButtonModules = []
  if (module?.includes('cd')) {
    rbacButtonModules.push('cd')
  }
  if (module?.includes('ci')) {
    rbacButtonModules.push('ci')
  }
  return rbacButtonModules
}
/*
  Get features restriction to pass to 'run/ retry' pipeline button based on the modules the pipeline supports
*/
export const getFeaturePropsForRunPipelineButton = ({
  modules,
  getString
}: {
  modules?: string[]
  getString: UseStringsReturn['getString']
}): FeaturesProps | undefined => {
  if (!modules || !modules?.length) {
    return undefined
  }
  const featureIdentifiers: FeatureIdentifier[] = []
  const additionalFeaturesProps: { warningMessage?: string } = {}
  if (modules.includes('cd')) {
    featureIdentifiers.push(FeatureIdentifier.DEPLOYMENTS_PER_MONTH)
  }
  if (modules.includes('ci')) {
    featureIdentifiers.push(FeatureIdentifier.BUILDS)
    additionalFeaturesProps.warningMessage = getString('pipeline.featureRestriction.unlimitedBuildsRequiredPlan')
  }
  return {
    featuresRequest: {
      featureNames: featureIdentifiers
    },
    ...additionalFeaturesProps
  }
}

export interface SelectedStageData {
  stageIdentifier?: string
  stagesRequired?: string[]
  stageName?: string
  message?: string
}
export interface StageSelectionData {
  selectedStages: SelectedStageData[]
  allStagesSelected: boolean
  selectedStageItems: SelectOption[]
}

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */

export const ALL_STAGE_VALUE = 'all'

export const getAllStageData = (getString: UseStringsReturn['getString']): SelectedStageData => ({
  stageIdentifier: ALL_STAGE_VALUE,
  stagesRequired: [],
  stageName: getString('pipeline.allStages')
})

export const getAllStageItem = (getString: UseStringsReturn['getString']): SelectOption => ({
  label: getString('pipeline.allStages'),
  value: ALL_STAGE_VALUE
})

export function getStageIdentifierFromStageData(selectedStageData: StageSelectionData): string[] {
  return selectedStageData.allStagesSelected
    ? []
    : selectedStageData.selectedStageItems.map(stageData => stageData.value as string)
}

export function getFilteredAllowableTypes(allowableTypes: AllowedTypes, viewType: StepViewType): AllowedTypes {
  return viewType === StepViewType.TemplateUsage
    ? allowableTypes
    : ((allowableTypes as MultiTypeInputType[]).filter(allowedType => !isMultiTypeRuntime(allowedType)) as AllowedTypes)
}

export function getAllowableTypesWithoutFixedValue(allowableTypes: MultiTypeInputType[]): AllowedTypes {
  return allowableTypes.filter(type => !isMultiTypeFixed(type)) as AllowedTypes
}

export function getAllowableTypesWithoutExpression(allowableTypes: MultiTypeInputType[]): AllowedTypes {
  return allowableTypes.filter(type => !isMultiTypeExpression(type)) as AllowedTypes
}

export const isExecutionTimeFieldDisabled = (viewType?: StepViewType): boolean => {
  return viewType === StepViewType.DeploymentForm
}
export const getModuleRunType = (module = '') =>
  ({
    [module]: 'executions',
    ci: 'builds',
    cd: 'deployments',
    sto: 'security test runs'
  }[module])

export const getModuleRunTypeDetails = (module = '') =>
  ({
    [module]: { icon: 'cd-main' as IconName, illustration: executionListIllustration },
    ci: { icon: 'ci-main' as IconName, illustration: ciExecutionListIllustration },
    cd: { icon: 'cd-main' as IconName, illustration: cdExecutionListIllustration },
    sto: { icon: 'sto-color-filled' as IconName, illustration: stoExecutionListIllustration }
  }[module])
