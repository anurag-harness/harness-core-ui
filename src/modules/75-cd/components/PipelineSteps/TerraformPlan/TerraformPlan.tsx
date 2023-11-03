/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Accordion,
  Button,
  ButtonVariation,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  IconName,
  Icon,
  Label,
  Layout,
  MultiTypeInputType,
  Text,
  StepWizard,
  AllowedTypes,
  Checkbox
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Classes, Dialog, IOptionProps, IDialogProps } from '@blueprintjs/core'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { cloneDeep, isEmpty, set, unset, get, isUndefined, noop } from 'lodash-es'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
// import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  setFormikRef,
  StepFormikFowardRef,
  StepViewType,
  ValidateInputSetProps
} from '@pipeline/components/AbstractSteps/Step'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useStrings } from 'framework/strings'

import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { FormMultiTypeCheckboxField } from '@common/components'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { TerraformVarFileWrapper } from 'services/cd-ng'

import type { StringsMap } from 'stringTypes'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

import GitDetailsStep from '@platform/connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ConnectorDetailsStep from '@platform/connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import ConnectorTestConnection from '@platform/connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import StepGitAuthentication from '@platform/connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGitlabAuthentication from '@platform/connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import StepGithubAuthentication from '@platform/connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@platform/connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import DelegateSelectorStep from '@platform/connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import StepArtifactoryAuthentication from '@platform/connectors/components/CreateConnector/ArtifactoryConnector/StepAuth/StepArtifactoryAuthentication'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@platform/connectors/constants'

import { isMultiTypeRuntime } from '@common/utils/utils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import StepAWSAuthentication from '@platform/connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import {
  BackendConfigurationTypes,
  CommandTypes,
  getTFPlanInitialValues,
  onSubmitTFPlanData,
  provisionerIdentifierValidation,
  TerraformPlanProps,
  TerraformPlanVariableStepProps,
  TFPlanFormData
} from '../Common/Terraform/TerraformInterfaces'
import TerraformInputStep from './TfPlanInputStep'
import { TerraformVariableStep } from './TfPlanVariableView'
import { TFMonaco } from '../Common/Terraform/Editview/TFMonacoEditor'
import {
  ConnectorMap,
  ConnectorTypes,
  getBuildPayload,
  getConfigFilePath,
  getPath
} from '../Common/ConfigFileStore/ConfigFileStoreHelper'
import { ConfigFileStoreStepTwo } from '../Common/ConfigFileStore/ConfigFileStoreStepTwo'
import { ConfigFileStoreStepOne } from '../Common/ConfigFileStore/ConfigFileStoreStepOne'
import { AmazonS3Store } from '../Common/ConfigFileStore/AmazonS3Store/AmazonS3Store'

import VarFileList from '../Common/VarFile/VarFileList'
import TerraformCommandFlags from '../Common/TerraformCommandFlags/TerraformCommandFlags'
import { AmazonS3StoreDataType, formatAmazonS3Data } from '../Common/ConfigFileStore/AmazonS3Store/AmazonS3StoreHelper'

import { ArtifactoryForm } from '../Common/VarFile/ArtifactoryForm'
import { formatArtifactoryData } from '../Common/VarFile/helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../Common/Terraform/TerraformStep.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

function TerraformPlanWidget(
  props: TerraformPlanProps,
  formikRef: StepFormikFowardRef<TFPlanFormData>
): React.ReactElement {
  const { initialValues, onUpdate, onChange, allowableTypes, isNewStep, readonly = false, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [connectorView, setConnectorView] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<ConnectorTypes | ''>('')
  const formikRefValues = React.useRef<FormikProps<unknown> | null>(null)
  const commandTypeOptions: IOptionProps[] = [
    { label: getString('filters.apply'), value: CommandTypes.Apply },
    { label: getString('pipelineSteps.destroy'), value: CommandTypes.Destroy }
  ]

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''

  const [showRemoteWizard, setShowRemoteWizard] = useState(false)
  const [showBackendConfigRemoteWizard, setShowBackendConfigRemoteWizard] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const onCloseOfRemoteWizard = (): void => {
    setConnectorView(false)
    setShowRemoteWizard(false)
    setIsEditMode(false)
  }

  const onCloseBackendConfigRemoteWizard = (): void => {
    setConnectorView(false)
    setShowBackendConfigRemoteWizard(false)
    setIsEditMode(false)
  }

  /* istanbul ignore next */
  const getNewConnectorSteps = (): React.ReactElement => {
    const connectorType = ConnectorMap[selectedConnector]
    const buildPayload = getBuildPayload(connectorType)
    const gitTypeStoreAuthenticationProps = {
      name: getString('credentials'),
      isEditMode,
      setIsEditMode,
      accountId,
      orgIdentifier,
      projectIdentifier,
      connectorInfo: undefined,
      onConnectorCreated: noop
    }
    const authenticationStepProps = {
      ...gitTypeStoreAuthenticationProps,
      identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER
    }
    return (
      <StepWizard title={getString('platform.connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={connectorType}
          name={getString('overview')}
          isEditMode={isEditMode}
          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
        />
        {connectorType !== Connectors.ARTIFACTORY && connectorType !== Connectors.AWS ? (
          <GitDetailsStep
            type={connectorType}
            name={getString('details')}
            isEditMode={isEditMode}
            connectorInfo={undefined}
          />
        ) : null}
        {connectorType === Connectors.GIT ? <StepGitAuthentication {...authenticationStepProps} /> : null}
        {connectorType === Connectors.GITHUB ? <StepGithubAuthentication {...authenticationStepProps} /> : null}
        {connectorType === Connectors.BITBUCKET ? <StepBitbucketAuthentication {...authenticationStepProps} /> : null}
        {connectorType === Connectors.GITLAB ? <StepGitlabAuthentication {...authenticationStepProps} /> : null}
        {connectorType === Connectors.ARTIFACTORY ? (
          <StepArtifactoryAuthentication {...authenticationStepProps} />
        ) : null}
        {connectorType === Connectors.AWS ? <StepAWSAuthentication {...authenticationStepProps} /> : null}
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          buildPayload={buildPayload}
          connectorInfo={undefined}
        />
        <ConnectorTestConnection
          name={getString('platform.connectors.stepThreeName')}
          connectorInfo={undefined}
          isStep={true}
          isLastStep={false}
          type={connectorType}
        />
      </StepWizard>
    )
  }

  /* istanbul ignore next */
  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 1) {
      setConnectorView(false)
    }
  }

  const onSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void,
    fieldPath: string
  ): void => {
    const fieldName = `spec.${fieldPath}.backendConfig`
    if (e.target.value === BackendConfigurationTypes.Inline) {
      setFieldValue(fieldName, {
        type: BackendConfigurationTypes.Inline,
        spec: {
          content: ''
        }
      })
    } else if (e.target.value === BackendConfigurationTypes.Remote) {
      setFieldValue(fieldName, {
        type: BackendConfigurationTypes.Remote,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: undefined,
              gitFetchType: 'Branch'
            }
          }
        }
      })
    }
  }

  const getTitle = (isBackendConfig: boolean): React.ReactElement => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }} margin={{ bottom: 'xlarge' }}>
      <Icon name="service-terraform" size={50} padding={{ bottom: 'large' }} />
      <Text color={Color.WHITE}>
        {isBackendConfig ? getString('cd.backendConfigFileStoreTitle') : getString('cd.configFileStoreTitle')}
      </Text>
    </Layout.Vertical>
  )

  const newConfigFileComponent = (
    formik: any,
    isConfig: boolean,
    isBackendConfig: boolean,
    isTerraformPlan: boolean,
    fieldPath: string
  ) => {
    return (
      <StepWizard title={getTitle(isBackendConfig)} className={css.configWizard} onStepChange={onStepChange}>
        <ConfigFileStoreStepOne
          name={isBackendConfig ? getString('cd.backendConfigFileStepOne') : getString('cd.terraformConfigFileStepOne')}
          data={formik.values}
          isBackendConfig={isBackendConfig}
          isTerraformPlan
          isReadonly={readonly}
          isEditMode={isEditMode}
          allowableTypes={allowableTypes}
          setConnectorView={setConnectorView}
          selectedConnector={selectedConnector}
          setSelectedConnector={setSelectedConnector}
          isTerragrunt={false}
          fieldPath={fieldPath}
        />
        {connectorView ? getNewConnectorSteps() : null}
        {
          /* istanbul ignore next */ selectedConnector === Connectors.ARTIFACTORY ? (
            <ArtifactoryForm
              isConfig={isConfig}
              isTerraformPlan
              isBackendConfig={isBackendConfig}
              allowableTypes={allowableTypes}
              fieldPath={fieldPath}
              name={isBackendConfig ? getString('cd.backendConfigFileDetails') : getString('cd.configFileDetails')}
              onSubmitCallBack={(data: any, prevStepData: any) => {
                const path = getPath(isTerraformPlan, false, isBackendConfig, fieldPath)
                const configObject = get(prevStepData?.formValues, path)

                const valObj = formatArtifactoryData(
                  prevStepData,
                  data,
                  configObject,
                  formik,
                  isBackendConfig ? `spec.${fieldPath}.backendConfig.spec` : `spec.${fieldPath}.configFiles`
                )
                set(valObj, path, { ...configObject })
                formik.setValues(valObj)
                setConnectorView(false)
                setShowRemoteWizard(false)
                setShowBackendConfigRemoteWizard(false)
              }}
            />
          ) : selectedConnector === 'S3' ? (
            <AmazonS3Store
              isConfig={isConfig}
              isBackendConfig={isBackendConfig}
              isTerraformPlan
              allowableTypes={allowableTypes}
              fieldPath={fieldPath}
              isReadonly={readonly}
              specFieldPath={`spec.${fieldPath}`}
              name={isBackendConfig ? getString('cd.backendConfigFileDetails') : getString('cd.configFileDetails')}
              onSubmitCallBack={(data: AmazonS3StoreDataType, prevStepData: any) => {
                const path = getPath(true, false, isBackendConfig, fieldPath)
                const configStoreObject = get(prevStepData?.formValues, path)
                const valObj = formatAmazonS3Data(prevStepData, data, configStoreObject, formik, path)

                set(valObj, path, { ...configStoreObject })
                formik.setValues(valObj)
                setConnectorView(false)
                setShowRemoteWizard(false)
                setShowBackendConfigRemoteWizard(false)
              }}
            />
          ) : (
            <ConfigFileStoreStepTwo
              name={isBackendConfig ? getString('cd.backendConfigFileDetails') : getString('cd.configFileDetails')}
              isTerraformPlan
              isBackendConfig={isBackendConfig}
              isReadonly={readonly}
              allowableTypes={allowableTypes}
              fieldPath={fieldPath}
              onSubmitCallBack={(data: any, prevStepData: any) => {
                const path = getPath(isTerraformPlan, false, isBackendConfig, fieldPath)
                const configObject = get(data, path) || {
                  store: {}
                }
                if (data?.store?.type === 'Harness') {
                  configObject.store = data?.store
                } else {
                  configObject.moduleSource = isTerraformPlan
                    ? get(data.spec, `${fieldPath}.configFiles.moduleSource`)
                    : get(data.spec, `${fieldPath}.spec.configFiles.moduleSource`)

                  if (configObject?.store?.type === 'S3') {
                    unset(configObject?.store?.spec, 'region')
                    unset(configObject?.store?.spec, 'bucketName')
                    unset(configObject?.store?.spec, 'paths')
                  }

                  if (prevStepData.identifier && prevStepData.identifier !== data?.identifier) {
                    configObject.store.spec.connectorRef = prevStepData?.identifier
                  }
                  if (configObject?.store.spec.gitFetchType === 'Branch') {
                    unset(configObject.store.spec, 'commitId')
                  } else if (configObject?.store.spec.gitFetchType === 'Commit') {
                    unset(configObject.store.spec, 'branch')
                  }
                  if (configObject?.store?.spec?.artifactPaths) {
                    unset(configObject?.store?.spec, 'artifactPaths')
                    unset(configObject?.store?.spec, 'repositoryName')
                  }
                  if (configObject?.store?.spec?.files) {
                    unset(configObject?.store?.spec, 'files')
                  }
                  if (configObject?.store?.spec?.secretFiles) {
                    unset(configObject?.store?.spec, 'secretFiles')
                  }
                }
                const valObj = cloneDeep(formik.values)
                configObject.store.type = prevStepData?.selectedType
                set(valObj, path, { ...configObject })
                formik.setValues(valObj)
                setConnectorView(false)
                setShowRemoteWizard(false)
                setShowBackendConfigRemoteWizard(false)
              }}
            />
          )
        }
      </StepWizard>
    )
  }

  const inlineBackendConfig = (formik: FormikProps<TFPlanFormData>, fieldPath: string): React.ReactElement => (
    <div className={cx(stepCss.formGroup, css.addMarginBottom)}>
      <MultiTypeFieldSelector
        name={`spec.${fieldPath}.backendConfig.spec.content`}
        label={
          <Text style={{ color: 'rgb(11, 11, 13)' }}>
            {getString('optionalField', { name: getString('cd.backEndConfig') })}
          </Text>
        }
        defaultValueToReset=""
        allowedTypes={allowableTypes}
        skipRenderValueInExpressionLabel
        disabled={readonly}
        expressionRender={() => {
          return (
            <TFMonaco
              name={`spec.${fieldPath}.backendConfig.spec.content`}
              formik={formik as FormikProps<unknown>}
              expressions={expressions}
              title={getString('cd.backEndConfig')}
            />
          )
        }}
      >
        <TFMonaco
          name={`spec.${fieldPath}.backendConfig.spec.content`}
          formik={formik as FormikProps<unknown>}
          expressions={expressions}
          title={getString('cd.backEndConfig')}
        />
      </MultiTypeFieldSelector>
      {getMultiTypeFromValue(get(formik.values?.spec, `${fieldPath}.backendConfig.spec.content`)) ===
        MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          value={get(formik.values?.spec, `${fieldPath}.backendConfig.spec.content`) as string}
          type="String"
          variableName={`spec.${fieldPath}.backendConfig.spec.content`}
          showRequiredField={false}
          showDefaultField={false}
          onChange={value => formik.setFieldValue(`spec.${fieldPath}.backendConfig.spec.content`, value)}
          isReadonly={readonly}
        />
      )}
    </div>
  )
  const [enableCloudCli, setEnableCloudCli] = React.useState<boolean | undefined>(undefined)

  useEffect(() => {
    setEnableCloudCli(prevEnableCloudCli => {
      if (isUndefined(prevEnableCloudCli)) {
        return (
          !isEmpty((formikRefValues?.current?.values as TFPlanFormData)?.spec?.cloudCliConfiguration) &&
          !isUndefined((formikRefValues?.current?.values as TFPlanFormData)?.spec?.cloudCliConfiguration)
        )
      }
      return prevEnableCloudCli
    })
  }, [])

  const fieldPath = enableCloudCli ? 'cloudCliConfiguration' : 'configuration'
  return (
    <Formik<TFPlanFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      validate={values => {
        onChange?.(values)
      }}
      formName={`terraformPlanEditView-tfPlan-${sectionId}`}
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: !enableCloudCli
          ? Yup.object().shape({
              provisionerIdentifier: provisionerIdentifierValidation(getString),
              configuration: Yup.object().shape({
                command: Yup.string().required(getString('pipelineSteps.commandRequired')),
                secretManagerRef: Yup.string().required(getString('cd.secretManagerRequired')).nullable()
              })
            })
          : Yup.object().shape({
              provisionerIdentifier: provisionerIdentifierValidation(getString),
              cloudCliConfiguration: Yup.object().shape({
                command: Yup.string().required(getString('pipelineSteps.commandRequired'))
              })
            })
      })}
    >
      {(formik: FormikProps<TFPlanFormData>) => {
        const { values, setFieldValue } = formik
        formikRefValues.current = formik as FormikProps<unknown> | null
        setFormikRef(formikRef, formik)

        const configFile = get(values.spec, `${fieldPath}.configFiles`)
        const configFilePath = getConfigFilePath(configFile)
        const backendConfigFile =
          get(values.spec, `${fieldPath}.backendConfig.type`) === BackendConfigurationTypes.Remote
            ? get(values.spec, `${fieldPath}.backendConfig`)
            : undefined
        const backendConfigFilePath = getConfigFilePath(backendConfigFile?.spec)

        return (
          <>
            <>
              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{
                      placeholder: getString('pipeline.stepNamePlaceholder'),
                      disabled: readonly
                    }}
                  />
                </div>
              )}

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
                  disabled={readonly}
                />
              </div>

              <div className={css.divider} />
              <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                <Checkbox
                  label={getString('pipeline.terraformStep.runOnRemote')}
                  checked={enableCloudCli}
                  onChange={e => {
                    setEnableCloudCli((e.target as any).checked)
                    unset(values, (e.target as any).checked ? 'spec.configuration' : 'spec.cloudCliConfiguration')
                  }}
                />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.RadioGroup
                  name={`spec.${fieldPath}.command`}
                  label={getString('commandLabel')}
                  radioGroup={{ inline: true }}
                  items={commandTypeOptions}
                  className={css.radioBtns}
                  disabled={readonly}
                  key={fieldPath}
                />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.MultiTextInput
                  name="spec.provisionerIdentifier"
                  placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
                  label={getString('pipelineSteps.provisionerIdentifier')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(values.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.spec?.provisionerIdentifier as string}
                    type="String"
                    variableName="spec.provisionerIdentifier"
                    showRequiredField={false}
                    showDefaultField={false}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    onChange={
                      /* istanbul ignore next */ value => {
                        setFieldValue('spec.provisionerIdentifier', value)
                      }
                    }
                    isReadonly={readonly}
                  />
                )}
              </div>
              {!enableCloudCli && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormMultiTypeConnectorField
                    label={getString('platform.connectors.title.secretManager')}
                    category={'SECRET_MANAGER'}
                    setRefValue
                    width={280}
                    name="spec.configuration.secretManagerRef"
                    placeholder={getString('select')}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    style={{ marginBottom: 10 }}
                    multiTypeProps={{ expressions, allowableTypes }}
                    gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    disabled={readonly}
                    isRecordDisabled={selectedRecord => (selectedRecord as any)?.spec?.readOnly}
                    renderRecordDisabledWarning={
                      <Text
                        icon="warning-icon"
                        iconProps={{ size: 18, color: Color.RED_800, padding: { right: 'xsmall' } }}
                        className={css.warningMessage}
                      >
                        {getString('common.readOnlyConnectorWarning')}
                      </Text>
                    }
                  />
                </div>
              )}

              <Layout.Vertical>
                <Label
                  style={{ color: Color.GREY_900 }}
                  className={css.configLabel}
                  data-tooltip-id="tfConfigurationFile"
                >
                  {getString('cd.configurationFile')}
                  <HarnessDocTooltip useStandAlone={true} tooltipId="tfConfigurationFile" />
                </Label>
                <div className={cx(css.configFile, css.addMarginBottom)}>
                  <div className={css.configField}>
                    {!configFilePath && (
                      <a
                        data-testid="editConfigButton"
                        className={css.configPlaceHolder}
                        data-name="config-edit"
                        onClick={() => setShowRemoteWizard(true)}
                      >
                        {getString('cd.configFilePlaceHolder')}
                      </a>
                    )}
                    {configFilePath && (
                      <Text font="normal" lineClamp={1} width={200} data-testid={configFilePath}>
                        /{configFilePath}
                      </Text>
                    )}
                    {configFilePath ? (
                      <Button
                        minimal
                        icon="Edit"
                        withoutBoxShadow
                        iconProps={{ size: 16 }}
                        onClick={() => setShowRemoteWizard(true)}
                        data-name="config-edit"
                        withoutCurrentColor={true}
                        className={css.editBtn}
                      />
                    ) : null}
                  </div>
                </div>
              </Layout.Vertical>
              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="step-1"
                  summary={getString('common.optionalConfig')}
                  details={
                    <>
                      {!enableCloudCli && (
                        <>
                          <div className={cx(stepCss.formGroup, stepCss.md)}>
                            <FormInput.MultiTextInput
                              name={`spec.${fieldPath}.workspace`}
                              placeholder={getString('pipeline.terraformStep.workspace')}
                              label={getString('pipelineSteps.workspace')}
                              multiTextInputProps={{ expressions, allowableTypes }}
                              isOptional={true}
                              disabled={readonly}
                            />
                            {getMultiTypeFromValue(formik.values.spec?.configuration?.workspace) ===
                              MultiTypeInputType.RUNTIME && (
                              <ConfigureOptions
                                value={formik.values?.spec?.configuration?.workspace as string}
                                type="String"
                                variableName={`spec.${fieldPath}.workspace`}
                                showRequiredField={false}
                                showDefaultField={false}
                                allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                                onChange={value => {
                                  /* istanbul ignore else */
                                  formik.setFieldValue(`spec.${fieldPath}.workspace`, value)
                                }}
                                isReadonly={readonly}
                              />
                            )}
                          </div>
                          <div className={css.divider} />
                        </>
                      )}
                      <VarFileList<TFPlanFormData, TerraformVarFileWrapper>
                        formik={formik}
                        isReadonly={readonly}
                        allowableTypes={allowableTypes}
                        selectedConnector={selectedConnector}
                        setSelectedConnector={setSelectedConnector}
                        getNewConnectorSteps={getNewConnectorSteps}
                        varFilePath={`spec.${fieldPath}.varFiles`}
                        isTerraformPlan
                      />

                      <div className={cx(css.divider, css.addMarginBottom)} />
                      <>
                        <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
                          {get(values.spec, `${fieldPath}.backendConfig.type`) === BackendConfigurationTypes.Remote && (
                            <Layout.Vertical>
                              <Label
                                data-tooltip-id={'TF-plan-remoteBackendConfiguration'}
                                style={{ color: Color.GREY_900 }}
                                className={css.configLabel}
                              >
                                {getString('cd.backendConfigurationFile')}
                                <HarnessDocTooltip
                                  useStandAlone={true}
                                  tooltipId="TF-plan-remoteBackendConfiguration"
                                />
                              </Label>
                            </Layout.Vertical>
                          )}
                          <div className={css.fileSelect}>
                            <select
                              className={css.fileDropdown}
                              name={`spec.${fieldPath}.backendConfig.type`}
                              disabled={readonly}
                              value={
                                get(values.spec, `${fieldPath}.backendConfig.type`) || BackendConfigurationTypes.Inline
                              }
                              onChange={e => {
                                /* istanbul ignore next */
                                onSelectChange(e, setFieldValue, fieldPath)
                              }}
                              data-testid="backendConfigurationOptions"
                            >
                              <option value={BackendConfigurationTypes.Inline}>{getString('inline')}</option>
                              <option value={BackendConfigurationTypes.Remote}>{getString('remote')}</option>
                            </select>
                          </div>
                        </Layout.Horizontal>
                        {get(values.spec, `${fieldPath}.backendConfig.type`) === BackendConfigurationTypes.Remote ? (
                          <div
                            className={cx(css.configFile, css.configField, css.addMarginTop, css.addMarginBottom)}
                            onClick={() => {
                              /* istanbul ignore next */
                              setShowBackendConfigRemoteWizard(true)
                            }}
                            data-testid="remoteTemplate"
                          >
                            <>
                              {!backendConfigFilePath && (
                                <a
                                  className={css.configPlaceHolder}
                                  onClick={() => setShowBackendConfigRemoteWizard(true)}
                                >
                                  {getString('cd.backendConfigFilePlaceHolder')}
                                </a>
                              )}
                              {backendConfigFilePath && (
                                <>
                                  <Text font="normal" lineClamp={1} width={200}>
                                    /{backendConfigFilePath}
                                  </Text>
                                  <Button
                                    minimal
                                    icon="Edit"
                                    withoutBoxShadow
                                    iconProps={{ size: 16 }}
                                    data-name="backend-config-edit"
                                    withoutCurrentColor={true}
                                  />
                                </>
                              )}
                            </>
                          </div>
                        ) : (
                          inlineBackendConfig(formik, fieldPath)
                        )}
                      </>
                      <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                        <MultiTypeList
                          name={`spec.${fieldPath}.targets`}
                          placeholder={getString('cd.enterTragets')}
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                              item => !isMultiTypeRuntime(item)
                            ) as AllowedTypes
                          }}
                          multiTypeFieldSelectorProps={{
                            label: (
                              <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                                {getString('optionalField', { name: getString('pipeline.targets.title') })}
                              </Text>
                            )
                          }}
                          style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
                          disabled={readonly}
                        />
                      </div>
                      <div className={css.divider} />
                      <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                        <MultiTypeMap
                          name={`spec.${fieldPath}.environmentVariables`}
                          valueMultiTextInputProps={{
                            expressions,
                            allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                              item => !isMultiTypeRuntime(item)
                            ) as AllowedTypes
                          }}
                          multiTypeFieldSelectorProps={{
                            disableTypeSelection: true,
                            label: (
                              <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                                {getString('optionalField', { name: getString('environmentVariables') })}
                              </Text>
                            )
                          }}
                          disabled={readonly}
                        />
                      </div>
                      {!enableCloudCli && (
                        <>
                          <div className={cx(stepCss.formGroup, css.addMarginTop)}>
                            <FormMultiTypeCheckboxField
                              formik={formik as FormikProps<unknown>}
                              name={'spec.configuration.exportTerraformPlanJson'}
                              label={getString('cd.exportTerraformPlanJson')}
                              multiTypeTextbox={{ expressions, allowableTypes }}
                              disabled={readonly}
                            />
                            {getMultiTypeFromValue(formik.values?.spec?.configuration?.exportTerraformPlanJson) ===
                              MultiTypeInputType.RUNTIME && (
                              <ConfigureOptions
                                value={(formik.values?.spec?.configuration?.exportTerraformPlanJson || '') as string}
                                type="String"
                                variableName="spec.configuration.exportTerraformPlanJson"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={
                                  /* istanul ignore next */
                                  value => formik.setFieldValue('spec.configuration.exportTerraformPlanJson', value)
                                }
                                style={{ alignSelf: 'center' }}
                                isReadonly={readonly}
                              />
                            )}
                          </div>
                          <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                            <FormMultiTypeCheckboxField
                              formik={formik as FormikProps<unknown>}
                              name={'spec.configuration.exportTerraformHumanReadablePlan'}
                              label={getString('cd.exportTerraformHumanReadablePlan')}
                              multiTypeTextbox={{ expressions, allowableTypes }}
                              disabled={readonly}
                            />
                            {getMultiTypeFromValue(
                              formik.values?.spec?.configuration?.exportTerraformHumanReadablePlan
                            ) === MultiTypeInputType.RUNTIME && (
                              <ConfigureOptions
                                value={
                                  (formik.values?.spec?.configuration?.exportTerraformHumanReadablePlan || '') as string
                                }
                                type="String"
                                variableName="spec.configuration.exportTerraformHumanReadablePlan"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={
                                  /* istnbul ignore next */
                                  value =>
                                    formik.setFieldValue('spec.configuration.exportTerraformHumanReadablePlan', value)
                                }
                                style={{ alignSelf: 'center' }}
                                isReadonly={readonly}
                              />
                            )}
                          </div>
                        </>
                      )}
                    </>
                  }
                />
                <Accordion.Panel
                  id="step-2"
                  summary={getString('cd.commandLineOptions')}
                  details={
                    <>
                      {!enableCloudCli && (
                        <div className={cx(stepCss.formGroup, css.addMarginTop)}>
                          <FormMultiTypeCheckboxField
                            formik={formik as FormikProps<unknown>}
                            name={'spec.configuration.skipRefreshCommand'}
                            label={getString('cd.skipRefreshCommand')}
                            multiTypeTextbox={{ expressions, allowableTypes }}
                            disabled={readonly}
                            setToFalseWhenEmpty
                          />
                          {getMultiTypeFromValue(formik.values?.spec?.configuration?.skipRefreshCommand) ===
                            MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={(formik.values?.spec?.configuration?.skipRefreshCommand || '') as string}
                              type="String"
                              variableName="spec.configuration.skipRefreshCommand"
                              showRequiredField={false}
                              showDefaultField={false}
                              onChange={
                                /* istanul ignore next */
                                value => formik.setFieldValue('spec.configuration.skipRefreshCommand', value)
                              }
                              style={{ alignSelf: 'center' }}
                              isReadonly={readonly}
                            />
                          )}
                        </div>
                      )}

                      <div>
                        <TerraformCommandFlags
                          formik={formik}
                          stepType="PLAN"
                          configType={fieldPath}
                          allowableTypes={allowableTypes}
                          path={`spec.${fieldPath}.commandFlags`}
                        />
                      </div>
                    </>
                  }
                />
              </Accordion>
            </>
            {showRemoteWizard && (
              <Dialog
                {...DIALOG_PROPS}
                isOpen={true}
                isCloseButtonShown
                onClose={() => {
                  setConnectorView(false)
                  setShowRemoteWizard(false)
                }}
                className={cx(css.modal, Classes.DIALOG)}
              >
                <div className={css.createTfWizard}>{newConfigFileComponent(formik, true, false, true, fieldPath)}</div>
                <Button
                  variation={ButtonVariation.ICON}
                  icon="cross"
                  iconProps={{ size: 18 }}
                  onClick={onCloseOfRemoteWizard}
                  data-testid={'close-wizard'}
                  className={css.crossIcon}
                />
              </Dialog>
            )}
            {showBackendConfigRemoteWizard && (
              <Dialog
                {...DIALOG_PROPS}
                isOpen={true}
                isCloseButtonShown
                onClose={() => {
                  setConnectorView(false)
                  setShowBackendConfigRemoteWizard(false)
                }}
                className={cx(css.modal, Classes.DIALOG)}
              >
                <div className={css.createTfWizard}>{newConfigFileComponent(formik, false, true, true, fieldPath)}</div>
                <Button
                  variation={ButtonVariation.ICON}
                  icon="cross"
                  iconProps={{ size: 18 }}
                  onClick={onCloseBackendConfigRemoteWizard}
                  data-testid={'close-wizard'}
                  className={css.crossIcon}
                />
              </Dialog>
            )}
          </>
        )
      }}
    </Formik>
  )
}

const TerraformPlanWidgetWithRef = React.forwardRef(TerraformPlanWidget)
export class TerraformPlan extends PipelineStep<TFPlanFormData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerraformPlan
  protected defaultValues: TFPlanFormData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.TerraformPlan,
    spec: {
      provisionerIdentifier: ''
    }
  }
  protected stepIcon: IconName = 'terraform-plan'
  protected stepName = 'Terraform Plan'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TerraformPlan'
  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<TFPlanFormData>): FormikErrors<TFPlanFormData> {
    /* istanbul ignore next */
    const errors = {} as any
    /* istanbul ignore next */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    /* istanbul ignore next */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore next */
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })
      /* istanbul ignore next */
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

  processFormData(data: any): TFPlanFormData {
    return onSubmitTFPlanData(data)
  }

  renderStep(props: StepProps<TFPlanFormData, TerraformPlanVariableStepProps>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      customStepProps,
      formikRef,
      isNewStep
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <TerraformInputStep
          initialValues={getTFPlanInitialValues(initialValues)}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          onChange={data => onChange?.(this.processFormData(data))}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          allValues={inputSetData?.allValues}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={inputSetData?.path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerraformVariableStep
          {...(customStepProps as TerraformPlanVariableStepProps)}
          initialValues={getTFPlanInitialValues(initialValues)}
          onUpdate={(data: any) => onUpdate?.(this.processFormData(data))}
          fieldPath={
            customStepProps?.variablesData?.spec?.cloudCliConfiguration ? 'cloudCliConfiguration' : 'configuration'
          }
        />
      )
    }
    return (
      <TerraformPlanWidgetWithRef
        initialValues={getTFPlanInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        stepType={StepType.TerraformPlan}
        readonly={props.readonly}
      />
    )
  }
}
