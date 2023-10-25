/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isNil, set, get, defaultTo } from 'lodash-es'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type {
  ExecutionGraphAddStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { addStepOrGroup } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { ResponseStepCategory, StepCategory, getStepsV2Promise, useGetStepsV2 } from 'services/pipeline-ng'
import { createStepNodeFromTemplate } from '@pipeline/utils/templateUtils'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { getStepPaletteModuleInfosFromStage } from '@pipeline/utils/stepUtils'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { StepType as PipelineStepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import type { DeploymentStageConfig } from 'services/cd-ng'
import { StageType } from '@pipeline/utils/stageHelpers'
import { NodeWrapperEntity } from '@pipeline/components/PipelineDiagram/Nodes/utils'

interface AddStepTemplateReturnType {
  addTemplate: (event: ExecutionGraphAddStepEvent) => Promise<void>
}

interface AddStepTemplate {
  executionRef: ExecutionGraphRefObj | null
}

export const getStepTypesFromCategories = (stepCategories: StepCategory[]): string[] => {
  const validStepTypes: string[] = []
  stepCategories.forEach(category => {
    if (category.stepCategories?.length) {
      validStepTypes.push(...getStepTypesFromCategories(category.stepCategories))
    } else if (category.stepsData?.length) {
      category.stepsData.forEach(stepData => {
        if (stepData.type) {
          validStepTypes.push(stepData.type)
        }
      })
    }
  })
  return validStepTypes
}

export function useAddStepTemplate(props: AddStepTemplate): AddStepTemplateReturnType {
  const { executionRef } = props
  const { accountId } = useParams<ProjectPathProps>()
  const pipelineContext = usePipelineContext()
  const {
    state: {
      pipelineView,
      selectionState: { selectedStageId = '' },
      gitDetails,
      storeMetadata,
      resolvedCustomDeploymentDetailsByRef
    },
    updateStage,
    getStageFromPipeline,
    updatePipelineView
  } = pipelineContext

  const { branch, repoName } = useQueryParams<GitQueryParams>()
  const parentTemplateBranch = defaultTo(gitDetails?.branch, branch)
  //repoName is for pipelines and repoIdentifier for templates
  const parentTemplateRepo = defaultTo(defaultTo(gitDetails?.repoName, gitDetails?.repoIdentifier), repoName)
  const { getTemplate } = useTemplateSelector()
  const { stage: selectedStage } = getStageFromPipeline(selectedStageId)
  const customDeploymentTemplateRef = defaultTo(
    (selectedStage?.stage?.spec as DeploymentStageConfig)?.customDeploymentRef?.templateRef,
    ''
  )

  const resolvedCustomDeploymentDetails = get(
    resolvedCustomDeploymentDetailsByRef,
    customDeploymentTemplateRef,
    {}
  ) as Record<string, string | string[]>

  const { data: stepsData } = useMutateAsGet(useGetStepsV2, {
    queryParams: { accountId },
    body: {
      stepPalleteModuleInfos: getStepPaletteModuleInfosFromStage(selectedStage?.stage?.type, selectedStage?.stage)
    }
  })

  const childTypes = useMemo(() => {
    if (!stepsData?.data?.stepCategories || !Array.isArray(stepsData?.data?.stepCategories)) {
      return []
    }

    const types = getStepTypesFromCategories(stepsData.data?.stepCategories)
    const selectedStageType = selectedStage?.stage?.type

    if (selectedStageType) {
      types.push(selectedStageType)
    }

    // Include step group templates of Custom stages when the selected stage type is Deployment and vice-versa.
    if (selectedStageType === StageType.DEPLOY) {
      types.push(StageType.CUSTOM)
    }
    if (selectedStageType === StageType.CUSTOM) {
      types.push(StageType.DEPLOY)
    }

    return types
  }, [selectedStage?.stage?.type, stepsData?.data?.stepCategories])

  const addTemplate = async (event: ExecutionGraphAddStepEvent, resolvedStepTypes?: string[]): Promise<void> => {
    try {
      const { template, isCopied } = await getTemplate({
        templateType: 'Step',
        filterProperties: {
          childTypes: resolvedStepTypes ?? childTypes,
          ...(event.isLinkedTemplate && {
            templateIdentifiers: get(resolvedCustomDeploymentDetails, 'linkedTemplateRefs') as string[]
          })
        },
        gitDetails,
        storeMetadata
      })
      const stepType =
        template.templateEntityType === PipelineStepType.StepGroup
          ? NodeWrapperEntity.stepGroup
          : NodeWrapperEntity.step
      const newStepData = {
        [stepType]: createStepNodeFromTemplate(template, isCopied, parentTemplateBranch, parentTemplateRepo)
      }

      const { stage: pipelineStage } = cloneDeep(getStageFromPipeline(selectedStageId))
      if (pipelineStage && !pipelineStage.stage?.spec) {
        set(pipelineStage, 'stage.spec', {})
      }
      if (pipelineStage && isNil(pipelineStage.stage?.spec?.execution)) {
        if (event.isRollback) {
          set(pipelineStage, 'stage.spec.execution', { rollbackSteps: [] })
        } else {
          set(pipelineStage, 'stage.spec.execution', { steps: [] })
        }
      }
      executionRef?.stepGroupUpdated?.(newStepData[stepType])
      addStepOrGroup(
        event.entity,
        pipelineStage?.stage?.spec?.execution as any,
        newStepData,
        event.isParallel,
        event.isRollback
      )
      if (pipelineStage?.stage) {
        await updateStage(pipelineStage?.stage)
      }

      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: true,
        drawerData: {
          type: DrawerTypes.StepConfig,
          data: {
            stepConfig: {
              node: newStepData[stepType],
              stepsMap: event.stepsMap,
              onUpdate: executionRef?.stepGroupUpdated,
              isStepGroup: template?.templateEntityType === PipelineStepType.StepGroup,
              addOrEdit: 'edit',
              hiddenAdvancedPanels: [AdvancedPanels.PreRequisites],
              relativeBasePath: event.entity?.relativeBasePath,
              nodeStateMetadata: event?.nodeStateMetadata
            }
          }
        }
      })
    } catch (_) {
      // Do nothing.. user cancelled template selection
    }
  }

  function stepsV2Promise(): Promise<string[]> {
    return new Promise<string[]>(resolve => {
      getStepsV2Promise({
        queryParams: { accountId },
        body: {
          stepPalleteModuleInfos: getStepPaletteModuleInfosFromStage(
            selectedStage?.stage?.type,
            selectedStage?.stage,
            undefined,
            undefined,
            true
          )
        }
      })
        .then((response: ResponseStepCategory) => {
          const stepCategoriesData = response?.data?.stepCategories
          if (stepCategoriesData) {
            const updatedStepTypes = getStepTypesFromCategories(stepCategoriesData)
            resolve(updatedStepTypes)
          } else resolve([])
        })
        .catch(_err => {
          resolve([])
        })
    })
  }

  const addStepTemplate = async (event: ExecutionGraphAddStepEvent): Promise<void> => {
    const isContainerStepGroup: boolean = defaultTo(
      event?.entity?.node?.data?.isContainerStepGroup,
      !!event?.entity?.node?.isContainerStepGroup
    )
    if (isContainerStepGroup) {
      stepsV2Promise().then((resolvedStepTypes: string[]) => {
        addTemplate(event, resolvedStepTypes)
      })
    } else addTemplate(event)
  }

  return { addTemplate: addStepTemplate }
}
