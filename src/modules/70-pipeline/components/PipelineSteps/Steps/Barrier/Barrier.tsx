/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  AllowedTypes,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Icon,
  IconName,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { FormikProps, yupToFormErrors } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { parse } from '@common/utils/YamlHelperMethods'
import {
  StepFormikFowardRef,
  setFormikRef,
  StepViewType,
  ValidateInputSetProps
} from '@pipeline/components/AbstractSteps/Step'
import {
  PipelineInfoConfig,
  useGetPipeline,
  VariableMergeServiceResponse,
  StepElementConfig
} from 'services/pipeline-ng'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { String, useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'

import type {
  GitQueryParams,
  InputSetPathProps,
  PipelineType,
  ProjectPathProps
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { StringsMap } from 'stringTypes'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useGetTemplate } from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'

import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import css from './Barrier.module.scss'

type BarrierData = StepElementConfig

export interface BarrierVariableStepProps {
  initialValues: BarrierData
  stageIdentifier: string
  onUpdate?(data: BarrierData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: BarrierData
}

interface BarrierProps {
  initialValues: BarrierData
  onUpdate?: (data: BarrierData) => void
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  isNewStep?: boolean
  inputSetData?: {
    template?: BarrierData
    path?: string
    readonly?: boolean
  }
  onChange?: (data: BarrierData) => void
  isReadonly?: boolean
}

const processBarrierFormData = (values: BarrierData): BarrierData => {
  return {
    ...values,
    spec: {
      ...values?.spec,
      barrierRef:
        getMultiTypeFromValue(values?.spec?.barrierRef as SelectOption) === MultiTypeInputType.FIXED
          ? (values?.spec?.barrierRef as SelectOption)?.value?.toString()
          : values?.spec?.barrierRef
    }
  }
}

function BarrierWidget(props: BarrierProps, formikRef: StepFormikFowardRef<BarrierData>): React.ReactElement {
  const {
    state: { pipeline }
  } = usePipelineContext()
  const { initialValues, onUpdate, isNewStep = true, onChange, stepViewType, allowableTypes } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  let barriers: SelectOption[] = []
  if (pipeline?.flowControl?.barriers?.length) {
    barriers = pipeline?.flowControl?.barriers?.map(barrier => ({
      label: barrier.name,
      value: barrier.identifier
    }))
  }

  const processForFormValues = (values: BarrierData): BarrierData => {
    return {
      ...values,
      spec: {
        ...values?.spec,
        barrierRef:
          getMultiTypeFromValue(values.spec?.barrierRef as SelectOption) === MultiTypeInputType.FIXED
            ? barriers?.find(opt => opt.value === values.spec?.barrierRef)
            : values?.spec?.barrierRef
      }
    }
  }

  const [initialValuesFormik, setInitialValuesFormik] = useState<BarrierData>(processForFormValues(initialValues))

  useEffect(() => {
    if (initialValues?.spec?.barrierRef) {
      const updatedValues = processForFormValues(initialValues)
      setInitialValuesFormik(updatedValues)
    }
  }, [initialValues?.spec?.barrierRef])

  return (
    <>
      <Formik<BarrierData>
        onSubmit={(values: BarrierData) => {
          onUpdate?.(processBarrierFormData(values))
        }}
        formName="barrierStep"
        initialValues={{ ...initialValuesFormik }}
        validate={data => {
          onChange?.(processBarrierFormData(data))
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            barrierRef: Yup.string().required(getString('pipeline.barrierStep.barrierReferenceRequired'))
          })
        })}
      >
        {(formik: FormikProps<BarrierData>) => {
          setFormikRef(formikRef, formik)
          return (
            <>
              <Layout.Horizontal
                spacing={'small'}
                border={{ radius: 2, color: Color.GREY_200 }}
                margin={{ bottom: 'xlarge' }}
                padding={'medium'}
                className={css.infoContainer}
              >
                <Icon name={'info'} />
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.H6 }}>
                  <String stringID="pipeline.barrierStep.helpText" />
                  <a rel="noreferrer" target="_blank" href={getString('pipeline.barrierStep.infoLink')}>
                    {`[${getString('common.forMoreInfo')}]`}
                  </a>
                </Text>
              </Layout.Horizontal>

              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
                </div>
              )}

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{
                    enableConfigureOptions: true,
                    allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                      item => item !== MultiTypeInputType.EXPRESSION
                    ) as AllowedTypes
                  }}
                />
              </div>

              <div className={stepCss.divider} />

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormInput.MultiTypeInput
                  label={getString('pipeline.barrierStep.barrierReference')}
                  name="spec.barrierRef"
                  placeholder={getString('pipeline.barrierStep.barrierReferencePlaceholder')}
                  selectItems={barriers}
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                      item => item !== MultiTypeInputType.EXPRESSION
                    ) as AllowedTypes
                  }}
                />
                {getMultiTypeFromValue(formik?.values?.spec?.barrierRef) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    value={formik?.values?.spec?.barrierRef as string}
                    type={getString('string')}
                    variableName="spec.barrierRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik?.setFieldValue('spec.barrierRef', value)}
                    isReadonly={props.isReadonly}
                    options={barriers}
                    loading={false}
                  />
                )}
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

function BarrierInputStep({ inputSetData, allowableTypes, stepViewType }: BarrierProps): React.ReactElement {
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch, connectorRef, repoName } = useQueryParams<GitQueryParams>()
  const projectQueryParams = useParams<ProjectPathProps>()

  const { expressions } = useVariablesExpression()

  const [pipeline, setPipeline] = React.useState<{ pipeline: PipelineInfoConfig } | undefined>()
  const pipelineTemplateVersionLabel = defaultTo(pipeline?.pipeline?.template?.versionLabel, '')
  const {
    state: { storeMetadata }
  } = usePipelineContext()
  const { data: pipelineResponse, loading } = useGetPipeline({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    }
  })
  const templateScope = getScopeFromValue(defaultTo(pipeline?.pipeline?.template?.templateRef, ''))

  const {
    data: pipelineTemplateResponse,
    refetch: refetchPipelineTemplate,
    loading: pipelineTemplateLoading
  } = useGetTemplate({
    templateIdentifier: getIdentifierFromValue(pipeline?.pipeline?.template?.templateRef || ''),
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    queryParams: {
      ...getScopeBasedProjectPathParams(projectQueryParams, templateScope),
      versionLabel: pipelineTemplateVersionLabel,
      ...getGitQueryParamsWithParentScope({
        storeMetadata,
        params: projectQueryParams,
        repoIdentifier,
        branch
      })
    },
    lazy: true
  })

  React.useEffect(() => {
    if (pipelineResponse?.data?.yamlPipeline) {
      setPipeline(parse(pipelineResponse?.data?.yamlPipeline))
    }
  }, [pipelineResponse?.data?.yamlPipeline])

  React.useEffect(() => {
    if (pipeline?.pipeline?.template?.templateRef) {
      refetchPipelineTemplate()
    }
  }, [pipeline?.pipeline?.template?.templateRef])

  const pipelineTemplate = React.useMemo(() => {
    if (pipelineTemplateResponse?.data && !pipelineTemplateLoading) {
      const templateSpec = parse<{ template: { spec: StepElementConfig } }>(
        defaultTo(pipelineTemplateResponse?.data?.yaml, '')
      )
      return templateSpec as any
    }
    return undefined
  }, [pipelineTemplateResponse?.data, pipelineTemplateLoading])

  const { getString } = useStrings()
  let barriers: SelectOption[] = []
  if (pipeline?.pipeline?.flowControl?.barriers?.length && !pipelineTemplateResponse) {
    barriers = pipeline.pipeline?.flowControl?.barriers?.map(barrier => ({
      label: barrier.name,
      value: barrier.identifier
    }))
  } else if ((pipelineTemplate?.template as any)?.spec?.flowControl?.barriers?.length) {
    barriers =
      (pipelineTemplate?.template as any)?.spec?.flowControl?.barriers?.map((barrier: any) => ({
        label: barrier.name,
        value: barrier.identifier
      })) || []
  }
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.barrierRef) === MultiTypeInputType.RUNTIME && (
        <SelectInputSetView
          label={getString('pipeline.barrierStep.barrierReference')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}`}.spec.barrierRef`}
          useValue={true}
          fieldPath={'spec.barrierRef'}
          template={inputSetData?.template}
          selectItems={barriers}
          multiTypeInputProps={{
            expressions,
            disabled: inputSetData?.readonly || pipelineTemplateLoading || loading,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          disabled={loading}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          disabled={inputSetData?.readonly}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            expressions,
            disabled: inputSetData?.readonly,
            allowableTypes
          }}
          fieldPath={'timeout'}
          template={inputSetData?.template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
    </>
  )
}

function BarrierVariableStep({
  variablesData,
  metadataMap,
  initialValues
}: BarrierVariableStepProps): React.ReactElement {
  return (
    <VariablesListTable
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
      className={pipelineVariablesCss.variablePaddingL3}
    />
  )
}

const BarrierWidgetWithRef = React.forwardRef(BarrierWidget)
export class BarrierStep extends PipelineStep<BarrierData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  renderStep(props: StepProps<BarrierData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <BarrierInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <BarrierVariableStep
          {...(customStepProps as BarrierVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <BarrierWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={stepViewType || StepViewType.Edit}
        ref={formikRef}
        isReadonly={readonly}
        onChange={onChange}
        allowableTypes={allowableTypes}
      />
    )
  }
  validateInputSet({ data, template, getString, viewType }: ValidateInputSetProps<BarrierData>): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (isEmpty(data?.timeout) && getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  processFormData(values: BarrierData): BarrierData {
    return processBarrierFormData(values)
  }

  protected type = StepType.Barrier
  protected stepName = 'Synchronization Barrier'
  protected stepIcon: IconName = 'barrier-open'
  protected referenceId = 'barrierStep'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Barrier'

  protected defaultValues: BarrierData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.Barrier
  }
}
