/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, getMultiTypeFromValue, MultiTypeInputType, Text, Icon, AllowedTypes } from '@harness/uicore'
import { isEmpty, get, defaultTo, set, omit } from 'lodash-es'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import type { DeploymentStageConfig } from 'services/cd-ng'
import type {
  PipelineInfoConfig,
  StageElementWrapperConfig,
  StageElementConfig,
  PipelineStageConfig
} from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import DelegateSelectorPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/DelegateSelectorPanel/DelegateSelectorPanel'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { PubSubPipelineActions } from '@pipeline/factories/PubSubPipelineAction'
import { PipelineActions } from '@pipeline/factories/PubSubPipelineAction/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useDeepCompareEffect } from '@common/hooks'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { StageFormContextProvider } from '@pipeline/context/StageFormContext'
import { StageType } from '@pipeline/utils/stageHelpers'
import { ConfigureOptionsContextProvider } from '@common/components/ConfigureOptions/ConfigureOptionsContext'
import { stageTypeToIconMap } from '@pipeline/utils/constants'
import { isCloneCodebaseEnabledAtLeastOneStage } from '@pipeline/utils/CIUtils'
import { StageInputSetForm } from './StageInputSetForm'
import { StageAdvancedInputSetForm } from './StageAdvancedInputSetForm'
import { CICodebaseInputSetForm } from './CICodebaseInputSetForm'
import { StepWidget } from '../AbstractSteps/StepWidget'
import factory from '../PipelineSteps/PipelineStepFactory'
import type {
  CustomVariablesData,
  CustomVariableInputSetExtraProps
} from '../PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AbstractStepFactory } from '../AbstractSteps/AbstractStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'
import { getStageFromPipeline, getTemplatePath } from '../PipelineStudio/StepUtil'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import { getFilteredAllowableTypes, StageSelectionData } from '../../utils/runPipelineUtils'
import {
  ChainedPipelineInfoPopover,
  ChainedPipelineInputSetFormProps,
  ChildPipelineMetadataType,
  getChildPipelineMetadata
} from './ChainedPipelineInputSetUtils'
import { OutputPanelInputSetView } from '../CommonPipelineStages/PipelineStage/PipelineStageOutputSection/OutputPanelInputSetView'
import css from './PipelineInputSetForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface PipelineInputSetFormProps {
  originalPipeline: PipelineInfoConfig
  template: PipelineInfoConfig
  path?: string
  executionIdentifier?: string
  readonly?: boolean
  maybeContainerClass?: string
  viewType: StepViewType
  isRunPipelineForm?: boolean
  listOfSelectedStages?: string[]
  isRetryFormStageSelected?: boolean
  allowableTypes: AllowedTypes
  viewTypeMetadata?: Record<string, boolean>
  gitAwareForTriggerEnabled?: boolean
  selectedStageData?: StageSelectionData
  disableRuntimeInputConfigureOptions?: boolean
  childPipelineMetadata?: ChildPipelineMetadataType
  chainedPipelineStagePath?: string
  stageTooltip?: {
    [key in StageType]?: string
  }
}
const allowedViewTypeForTemplateUpdate = [StepViewType.DeploymentForm, StepViewType.InputSet, StepViewType.TriggerForm]

export function StageFormInternal({
  allValues,
  path,
  template,
  readonly,
  viewType,
  stageClassName = '',
  allowableTypes,
  executionIdentifier,
  childPipelineMetadata,
  viewTypeMetadata
}: {
  allValues?: StageElementWrapperConfig
  template?: StageElementWrapperConfig
  path: string
  readonly?: boolean
  viewType: StepViewType
  stageClassName?: string
  allowableTypes: AllowedTypes
  executionIdentifier?: string
  childPipelineMetadata?: ChildPipelineMetadataType
  viewTypeMetadata?: Record<string, boolean>
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <div className={cx(css.topAccordion, stageClassName)}>
      {template?.stage?.variables && (
        <div id={`Stage.${allValues?.stage?.identifier}.Variables`} className={cx(css.accordionSummary)}>
          <Text font={{ weight: 'semi-bold' }} padding={{ top: 'medium', bottom: 'medium' }}>
            {getString('common.variables')}
          </Text>
          <div className={css.nestedAccordions}>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (allValues?.stage?.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              allowableTypes={getFilteredAllowableTypes(allowableTypes, viewType)}
              type={StepType.CustomVariable}
              readonly={readonly}
              stepViewType={viewType}
              customStepProps={{
                template: { variables: template?.stage?.variables as AllNGVariables[] },
                path,
                executionIdentifier,
                allValues: { variables: (allValues?.stage?.variables || []) as AllNGVariables[] }
              }}
            />
          </div>
        </div>
      )}
      {template?.stage?.type !== StageType.PIPELINE && template?.stage?.spec && (
        <StageInputSetForm
          stageIdentifier={defaultTo(allValues?.stage?.identifier, '')}
          stageType={template?.stage?.type as StageType}
          path={`${path}.spec`}
          deploymentStageTemplate={template?.stage?.spec as DeploymentStageConfig}
          deploymentStage={allValues?.stage?.spec as DeploymentStageConfig}
          readonly={readonly}
          viewType={viewType}
          executionIdentifier={executionIdentifier}
          allowableTypes={allowableTypes}
          childPipelineMetadata={childPipelineMetadata}
          viewTypeMetadata={viewTypeMetadata}
        />
      )}
      {(!isEmpty(template?.stage?.when) ||
        !isEmpty(template?.stage?.delegateSelectors) ||
        !isEmpty(template?.stage?.strategy) ||
        !isEmpty(template?.stage?.skipInstances) ||
        !isEmpty(template?.stage?.failureStrategies)) && (
        <StageAdvancedInputSetForm
          stageIdentifier={allValues?.stage?.identifier}
          path={path}
          deploymentStageTemplate={(template as StageElementWrapperConfig).stage}
          readonly={readonly}
          allowableTypes={allowableTypes}
          delegateSelectors={template?.stage?.delegateSelectors}
          skipInstances={template?.stage?.skipInstances}
          stageType={template?.stage?.type as StageType}
          viewType={viewType}
        />
      )}
    </div>
  )
}

export function StageForm({
  allValues,
  path,
  template,
  readonly,
  viewType,
  hideTitle = false,
  stageClassName = '',
  allowableTypes,
  executionIdentifier,
  childPipelineMetadata,
  viewTypeMetadata,
  stageTooltip
}: {
  allValues?: StageElementWrapperConfig
  template?: StageElementWrapperConfig
  path: string
  readonly?: boolean
  viewType: StepViewType
  hideTitle?: boolean
  stageClassName?: string
  executionIdentifier?: string
  allowableTypes: AllowedTypes
  childPipelineMetadata?: ChildPipelineMetadataType
  viewTypeMetadata?: Record<string, boolean>
  stageTooltip?: {
    [key in StageType]?: string
  }
}): JSX.Element {
  const [stageFormTemplate, setStageFormTemplate] = React.useState(template)
  const isTemplateStage = !!stageFormTemplate?.stage?.template
  const type = isTemplateStage
    ? (stageFormTemplate?.stage?.template?.templateInputs as StageElementConfig)?.type
    : stageFormTemplate?.stage?.type

  function getStageFormTemplate<T>(pathToUpdate: string): T | PipelineInfoConfig {
    const templatePath = getTemplatePath(pathToUpdate, path)
    return get(stageFormTemplate, `stage.${templatePath}`)
  }

  function updateStageFormTemplate<T>(updatedData: T, pathToUpdate: string): void {
    const templatePath = getTemplatePath(pathToUpdate, path)
    setStageFormTemplate(oldStageFormTemplate =>
      produce(oldStageFormTemplate, draft => {
        if (draft) {
          set(draft, `stage.${templatePath}`, updatedData)
        }
      })
    )

    if (allowedViewTypeForTemplateUpdate.includes(viewType)) {
      // Pipeline studio inputs should not dispatch template update event as it is specific to RPF
      dispatchEvent(
        new CustomEvent('UPDATE_INPUT_SET_TEMPLATE', {
          detail: {
            path: isEmpty(path) ? templatePath : `${path}.${templatePath}`,
            data: updatedData
          }
        })
      )
    }
  }

  return (
    <div id={`Stage.${allValues?.stage?.identifier}`}>
      {!hideTitle && (
        <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
          {childPipelineMetadata && (
            <>
              <ChainedPipelineInfoPopover childPipelineMetadata={childPipelineMetadata}>
                <Icon name={stageTypeToIconMap[StageType.PIPELINE]} size={18} style={{ cursor: 'pointer' }} />
              </ChainedPipelineInfoPopover>
              <Icon name={'chevron-right'} size={18} color={Color.GREY_450} className={css.middleStageIcon} />
            </>
          )}
          {type && (
            <Icon
              name={stageTypeToIconMap[type]}
              size={18}
              className={cx({ [css.childPipelineStageIcon]: !!childPipelineMetadata })}
            />
          )}
          <Text
            color={Color.BLACK_100}
            font={{ weight: 'semi-bold' }}
            className={cx({ [css.childPipelineStageName]: !!childPipelineMetadata })}
            tooltipProps={{ dataTooltipId: stageTooltip && type ? stageTooltip[type as StageType] : '' }}
          >
            Stage: {defaultTo(allValues?.stage?.name, defaultTo(allValues?.stage?.identifier, ''))}
          </Text>
        </Layout.Horizontal>
      )}
      <StageFormContextProvider
        getStageFormTemplate={getStageFormTemplate}
        updateStageFormTemplate={updateStageFormTemplate}
      >
        <StageFormInternal
          template={
            isTemplateStage
              ? { stage: stageFormTemplate?.stage?.template?.templateInputs as StageElementConfig }
              : stageFormTemplate
          }
          allValues={
            allValues?.stage?.template
              ? { stage: allValues?.stage?.template?.templateInputs as StageElementConfig }
              : allValues
          }
          path={isTemplateStage ? `${path}.${TEMPLATE_INPUT_PATH}` : path}
          readonly={readonly}
          viewType={viewType}
          allowableTypes={allowableTypes}
          stageClassName={stageClassName}
          executionIdentifier={executionIdentifier}
          childPipelineMetadata={childPipelineMetadata}
          viewTypeMetadata={viewTypeMetadata}
        />
      </StageFormContextProvider>
    </div>
  )
}

export function ChainedPipelineInputSetForm(props: ChainedPipelineInputSetFormProps): JSX.Element {
  const {
    stageObj,
    inputPath,
    outputPath,
    stagePath,
    viewType,
    allowableTypes,
    allValues,
    readonly,
    executionIdentifier,
    maybeContainerClass,
    viewTypeMetadata,
    disableRuntimeInputConfigureOptions
  } = props
  const originalPipeline = (allValues?.stage?.spec as PipelineStageConfig)?.inputs as PipelineInfoConfig
  const pipelineStageTemplate = (stageObj?.stage?.spec as PipelineStageConfig)?.inputs as PipelineInfoConfig
  const pipelineStageOutputs = (stageObj?.stage?.spec as PipelineStageConfig)?.outputs
  const childPipelineMetadata = React.useMemo(() => getChildPipelineMetadata(allValues), [allValues])
  const showChainedPipelineStageForm = (): boolean =>
    !!stageObj?.stage?.variables ||
    !isEmpty(stageObj?.stage?.when) ||
    !isEmpty(stageObj?.stage?.delegateSelectors) ||
    !isEmpty(stageObj?.stage?.strategy) ||
    !isEmpty(stageObj?.stage?.skipInstances) ||
    !isEmpty(stageObj?.stage?.failureStrategies)

  return (
    <>
      <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
        <ChainedPipelineInfoPopover
          childPipelineMetadata={omit(childPipelineMetadata, 'parentPipelineName') as ChildPipelineMetadataType}
        >
          <Icon name={stageTypeToIconMap[StageType.PIPELINE]} size={18} style={{ cursor: 'pointer' }} />
        </ChainedPipelineInfoPopover>
        <Text color={Color.BLACK_100} font={{ weight: 'semi-bold' }}>
          Stage: {defaultTo(allValues?.stage?.name, '')}
        </Text>
      </Layout.Horizontal>
      {pipelineStageOutputs && pipelineStageOutputs.length > 0 && (
        <OutputPanelInputSetView
          allowableTypes={getFilteredAllowableTypes(allowableTypes, viewType)}
          readonly={readonly}
          template={{ outputs: pipelineStageOutputs }}
          path={outputPath}
        />
      )}
      {/* For showing chained pipeline stage variable, runtime delegate selector & failure strategy */}
      {showChainedPipelineStageForm() && (
        <StageForm
          template={stageObj}
          allValues={allValues}
          path={stagePath}
          readonly={readonly}
          viewType={viewType}
          allowableTypes={allowableTypes}
          executionIdentifier={executionIdentifier}
          hideTitle
          viewTypeMetadata={viewTypeMetadata}
        />
      )}
      <PipelineInputSetFormInternal
        originalPipeline={originalPipeline}
        template={pipelineStageTemplate}
        path={inputPath}
        readonly={readonly}
        viewType={viewType}
        maybeContainerClass={maybeContainerClass}
        executionIdentifier={executionIdentifier}
        viewTypeMetadata={viewTypeMetadata}
        allowableTypes={allowableTypes}
        disableRuntimeInputConfigureOptions={disableRuntimeInputConfigureOptions}
        childPipelineMetadata={childPipelineMetadata}
        chainedPipelineStagePath={stagePath}
      />
    </>
  )
}

export function PipelineInputSetFormInternal(props: PipelineInputSetFormProps): React.ReactElement {
  const {
    originalPipeline,
    template,
    path = '',
    readonly,
    viewType,
    maybeContainerClass = '',
    executionIdentifier,
    viewTypeMetadata,
    allowableTypes,
    selectedStageData,
    disableRuntimeInputConfigureOptions: disableConfigureOptions,
    childPipelineMetadata,
    chainedPipelineStagePath,
    stageTooltip
  } = props
  const { getString } = useStrings()
  const isTemplatePipeline = !!template?.template
  const finalTemplate = isTemplatePipeline ? (template?.template?.templateInputs as PipelineInfoConfig) : template
  const finalPath = isTemplatePipeline
    ? !isEmpty(path)
      ? `${path}.template.templateInputs`
      : 'template.templateInputs'
    : path

  const { expressions } = useVariablesExpression()

  const isInputStageDisabled = (stageId: string): boolean => {
    /* In retry pipeline form all the fields are disabled until any stage is selected,
      and once the stage is selected, the stage before the selected stage should be disabled */

    if (props.isRetryFormStageSelected) {
      return !!props.listOfSelectedStages?.includes(stageId)
    } else if (props.isRetryFormStageSelected === false) {
      return !props.listOfSelectedStages?.length
    }
    return readonly as boolean
  }

  const isCloneCodebaseEnabledAtLeastAtOneChildPipelineStage =
    childPipelineMetadata && isCloneCodebaseEnabledAtLeastOneStage(originalPipeline)

  return (
    <Layout.Vertical
      spacing="medium"
      className={cx(css.container, {
        [maybeContainerClass]: !childPipelineMetadata,
        [css.pipelineStageForm]: !!childPipelineMetadata
      })}
    >
      {getMultiTypeFromValue(finalTemplate?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            className={stepCss.checkbox}
            label={getString('pipelineSteps.timeoutLabel')}
            name={!isEmpty(finalPath) ? `${finalPath}.timeout` : 'timeout'}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(finalTemplate?.delegateSelectors) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm, stepCss.delegate)}>
          <DelegateSelectorPanel
            isReadonly={readonly || false}
            allowableTypes={allowableTypes}
            name={!isEmpty(finalPath) ? `${finalPath}.delegateSelectors` : 'delegateSelectors'}
          />
        </div>
      ) : null}
      {finalTemplate?.variables && finalTemplate?.variables?.length > 0 && (
        <>
          <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
            <Text
              color={Color.BLACK_100}
              font={{ weight: 'semi-bold' }}
              icon={'pipeline-variables'}
              iconProps={{ size: 18, color: Color.PRIMARY_7 }}
            >
              {getString('customVariables.pipelineVariablesTitle')}
            </Text>
          </Layout.Horizontal>
          <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
            factory={factory as unknown as AbstractStepFactory}
            initialValues={{
              variables: (originalPipeline?.variables || []) as AllNGVariables[],
              canAddVariable: true
            }}
            allowableTypes={getFilteredAllowableTypes(allowableTypes, viewType)}
            readonly={readonly}
            type={StepType.CustomVariable}
            stepViewType={viewType}
            customStepProps={{
              template: { variables: (finalTemplate?.variables || []) as AllNGVariables[] },
              path: finalPath,
              executionIdentifier,
              allValues: { variables: (originalPipeline?.variables || []) as AllNGVariables[] }
            }}
          />
        </>
      )}
      {(!childPipelineMetadata || isCloneCodebaseEnabledAtLeastAtOneChildPipelineStage) && (
        <CICodebaseInputSetForm
          path={finalPath}
          readonly={readonly}
          originalPipeline={props.originalPipeline}
          template={template}
          viewType={viewType}
          viewTypeMetadata={viewTypeMetadata}
          selectedStageData={selectedStageData}
          chainedPipelineStagePath={chainedPipelineStagePath}
        />
      )}
      {
        <>
          {finalTemplate?.stages?.map((stageObj, index) => {
            const pathPrefix = !isEmpty(finalPath) ? `${finalPath}.` : ''
            if (stageObj.stage) {
              const allValues = getStageFromPipeline(stageObj.stage?.identifier || '', originalPipeline)

              return (
                <Layout.Vertical key={stageObj?.stage?.identifier || index}>
                  {stageObj.stage?.type === StageType.PIPELINE ? (
                    <>
                      <ChainedPipelineInputSetForm
                        stageObj={stageObj}
                        inputPath={`${pathPrefix}stages[${index}].stage.spec.inputs`}
                        outputPath={`${pathPrefix}stages[${index}].stage.spec.outputs`}
                        stagePath={`${pathPrefix}stages[${index}].stage`}
                        viewType={viewType}
                        allowableTypes={allowableTypes}
                        allValues={allValues}
                        readonly={readonly}
                        executionIdentifier={executionIdentifier}
                        maybeContainerClass={maybeContainerClass}
                        viewTypeMetadata={viewTypeMetadata}
                        disableRuntimeInputConfigureOptions={disableConfigureOptions}
                      />
                    </>
                  ) : (
                    <StageForm
                      template={stageObj}
                      allValues={allValues}
                      path={`${pathPrefix}stages[${index}].stage`}
                      readonly={isInputStageDisabled(stageObj?.stage?.identifier)}
                      viewType={viewType}
                      allowableTypes={allowableTypes}
                      executionIdentifier={executionIdentifier}
                      childPipelineMetadata={childPipelineMetadata}
                      viewTypeMetadata={viewTypeMetadata}
                      stageTooltip={stageTooltip}
                    />
                  )}
                </Layout.Vertical>
              )
            } else if (stageObj.parallel) {
              return stageObj.parallel.map((stageP, indexp) => {
                const allValues = getStageFromPipeline(stageP?.stage?.identifier || '', originalPipeline)

                return (
                  <Layout.Vertical key={`${stageObj?.stage?.identifier}-${stageP.stage?.identifier}-${indexp}`}>
                    {stageP.stage?.type === StageType.PIPELINE ? (
                      <>
                        <ChainedPipelineInputSetForm
                          stageObj={stageP}
                          inputPath={`${pathPrefix}stages[${index}].parallel[${indexp}].stage.spec.inputs`}
                          outputPath={`${pathPrefix}stages[${index}].parallel[${indexp}].stage.spec.outputs`}
                          stagePath={`${pathPrefix}stages[${index}].parallel[${indexp}].stage`}
                          viewType={viewType}
                          allowableTypes={allowableTypes}
                          allValues={allValues}
                          readonly={readonly}
                          executionIdentifier={executionIdentifier}
                          maybeContainerClass={maybeContainerClass}
                          viewTypeMetadata={viewTypeMetadata}
                          disableRuntimeInputConfigureOptions={disableConfigureOptions}
                        />
                      </>
                    ) : (
                      <StageForm
                        template={stageP}
                        allValues={allValues}
                        path={`${pathPrefix}stages[${index}].parallel[${indexp}].stage`}
                        readonly={isInputStageDisabled(stageP?.stage?.identifier as string)}
                        viewType={viewType}
                        allowableTypes={allowableTypes}
                        childPipelineMetadata={childPipelineMetadata}
                        viewTypeMetadata={viewTypeMetadata}
                        stageTooltip={stageTooltip}
                      />
                    )}
                  </Layout.Vertical>
                )
              })
            } else {
              return null
            }
          })}
        </>
      }
    </Layout.Vertical>
  )
}

export function PipelineInputSetForm(props: Omit<PipelineInputSetFormProps, 'allowableTypes'>): React.ReactElement {
  const { disableRuntimeInputConfigureOptions: disableConfigureOptions, isRunPipelineForm } = props
  const [template, setTemplate] = React.useState(props.template)
  const accountPathProps = useParams<AccountPathProps>()
  const { NG_EXECUTION_INPUT } = useFeatureFlags()

  useDeepCompareEffect(() => {
    if (isRunPipelineForm) {
      PubSubPipelineActions.publish(PipelineActions.RunPipeline, {
        pipeline: props.originalPipeline,
        accountPathProps,
        template: props.template
      }).then(data => {
        setTemplate(Object.assign(props.template, ...data))
      })
    }
  }, [props?.template])

  return (
    <ConfigureOptionsContextProvider disableConfigureOptions={!!disableConfigureOptions}>
      <PipelineInputSetFormInternal
        {...props}
        template={template}
        allowableTypes={
          NG_EXECUTION_INPUT
            ? [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.EXECUTION_TIME]
            : [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
        }
      />
    </ConfigureOptionsContextProvider>
  )
}
