/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import type { FormikProps } from 'formik'
import {
  Accordion,
  AllowedTypes,
  Container,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text
} from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { MultiTypeListType } from '@common/components/MultiTypeList/MultiTypeList'
import type { MapValue } from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { AwsSamDeployStepInitialValues } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConnectorRef } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { NameTimeoutField } from '../../Common/GenericExecutionStep/NameTimeoutField'
import { serverlessStepAllowedConnectorTypes } from '../../Common/utils/utils'
import { AwsSamServerlessStepCommonOptionalFieldsEdit } from '../../Common/AwsSamServerlessStepCommonOptionalFields/AwsSamServerlessStepCommonOptionalFieldsEdit'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../AwsSamBuildDeployStep.module.scss'

export interface AwsSamDeployStepFormikValues extends StepElementConfig {
  spec: {
    connectorRef: ConnectorRef
    image?: string
    samVersion?: string
    deployCommandOptions?: MultiTypeListType
    stackName?: string
    privileged?: boolean
    imagePullPolicy?: string
    runAsUser?: string
    resources?: {
      limits?: {
        memory?: string
        cpu?: string
      }
    }
    envVariables?: MapValue
  }
}
export interface AwsSamDeployStepProps {
  initialValues: AwsSamDeployStepInitialValues
  onUpdate?: (data: AwsSamDeployStepFormikValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AwsSamDeployStepFormikValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const AwsSamDeployStepEdit = (
  props: AwsSamDeployStepProps,
  formikRef: StepFormikFowardRef<AwsSamDeployStepFormikValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType, onChange } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const validationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      connectorRef: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.connectorLabel') })
      ),
      stackName: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('cd.cloudFormation.stackName') })
      ),
      envVariables: Yup.array().of(
        Yup.object().shape({
          key: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('keyLabel') })),
          value: Yup.string().required(
            getString('common.validation.fieldIsRequired', { name: getString('valueLabel') })
          )
        })
      )
    })
  })

  const getInitialValues = (): AwsSamDeployStepFormikValues => {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        deployCommandOptions:
          typeof initialValues.spec.deployCommandOptions === 'string'
            ? initialValues.spec.deployCommandOptions
            : initialValues.spec.deployCommandOptions?.map(deployCommandOption => ({
                id: uuid('', nameSpace()),
                value: deployCommandOption
              })),
        envVariables: Object.keys(defaultTo(initialValues.spec.envVariables, {})).map(envKey => {
          const envValue = initialValues.spec.envVariables?.[envKey]
          return {
            id: uuid('', nameSpace()),
            key: envKey,
            value: defaultTo(envValue, '')
          }
        })
      }
    }
  }

  return (
    <>
      <Formik<AwsSamDeployStepFormikValues>
        onSubmit={values => {
          onUpdate?.(values)
        }}
        formName="AwsSamDeployStepEdit"
        initialValues={getInitialValues()}
        validate={formValues => {
          onChange?.(formValues)
        }}
        validationSchema={validationSchema}
      >
        {(formik: FormikProps<AwsSamDeployStepFormikValues>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <Text className={css.containerConfiguration} tooltipProps={{ dataTooltipId: 'containerConfiguration' }}>
                {getString('cd.steps.containerStepsCommon.containerConfigurationText')}
              </Text>

              <Container className={stepCss.formGroup}>
                <FormMultiTypeConnectorField
                  width={510}
                  name="spec.connectorRef"
                  label={getString('pipelineSteps.connectorLabel')}
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  multiTypeProps={{ expressions, allowableTypes }}
                  type={serverlessStepAllowedConnectorTypes}
                  enableConfigureOptions={false}
                  selected={formik.values.spec.connectorRef}
                  setRefValue
                  disabled={readonly}
                  gitScope={{ repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <ConnectorConfigureOptions
                    style={{ marginTop: 6 }}
                    value={formik.values.spec.connectorRef as string}
                    type="String"
                    variableName="spec.connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('spec.connectorRef', value)}
                    isReadonly={readonly}
                    connectorReferenceFieldProps={{
                      accountIdentifier: accountId,
                      projectIdentifier,
                      orgIdentifier,
                      type: serverlessStepAllowedConnectorTypes,
                      label: getString('pipelineSteps.connectorLabel'),
                      disabled: readonly,
                      gitScope: { repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }
                    }}
                  />
                )}
              </Container>

              <Container className={stepCss.formGroup}>
                <FormInput.MultiTextInput
                  name="spec.image"
                  label={getString('imageLabel')}
                  placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
                  disabled={readonly}
                  isOptional={true}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(formik.values.spec.image) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.spec?.image as string}
                    type="String"
                    variableName="spec.image"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('spec.image', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </Container>

              <Container className={stepCss.formGroup}>
                <FormInput.MultiTextInput
                  name="spec.stackName"
                  label={getString('cd.cloudFormation.stackName')}
                  placeholder={getString('common.enterPlaceholder', { name: getString('cd.cloudFormation.stackName') })}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue((formik.values as AwsSamDeployStepFormikValues).spec.stackName) ===
                  MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={(formik.values as AwsSamDeployStepFormikValues).spec?.stackName as string}
                      type="String"
                      variableName="spec.stackName"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('spec.stackName', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
              </Container>

              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="aws-sam-deploy-optional-accordion"
                  data-testid={'aws-sam-deploy-optional-accordion'}
                  summary={getString('common.optionalConfig')}
                  details={
                    <Container margin={{ top: 'medium' }}>
                      <AwsSamServerlessStepCommonOptionalFieldsEdit
                        allowableTypes={allowableTypes}
                        readonly={readonly}
                        formik={formik}
                        versionFieldName={'spec.samVersion'}
                        versionFieldLabel={getString('cd.samVersionLabel')}
                        commandOptionsFieldName={'spec.deployCommandOptions'}
                        commandOptionsFieldLabel={getString('cd.steps.awsSamDeployStep.awsSamDeployCommandOptions')}
                      />
                    </Container>
                  }
                />
              </Accordion>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const AwsSamDeployStepEditRef = React.forwardRef(AwsSamDeployStepEdit)
