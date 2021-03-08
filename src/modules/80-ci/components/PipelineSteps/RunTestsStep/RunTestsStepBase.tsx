import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { FormMultiTypeCheckboxField } from '@common/components'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { PipelineContext } from '@pipeline/exports'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/exports'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import StepCommonFields /*,{ /*usePullOptions }*/ from '@pipeline/components/StepCommonFields/StepCommonFields'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { RunTestsStepProps, RunTestsStepData, RunTestsStepDataUI } from './RunTestsStep'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './RunTestsStepFunctionConfigs'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunTestsStepBase = (
  { initialValues, onUpdate }: RunTestsStepProps,
  formikRef: StepFormikFowardRef<RunTestsStepData>
): JSX.Element => {
  const {
    state: { pipelineView },
    updatePipelineView,
    getStageFromPipeline
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { stage: currentStage } = getStageFromPipeline(pipelineView.splitViewData.selectedStageId || '')

  const buildToolOptions = [
    { label: 'Bazel', value: 'bazel' },
    { label: 'Gradle', value: 'gradle' },
    { label: 'Maven', value: 'maven' }
  ]
  const languageOptions = [{ label: 'Java', value: 'java' }]

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<RunTestsStepData, RunTestsStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })
  const handleCancelClick = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: { type: DrawerTypes.StepConfig }
    })
  }

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RunTestsStepData, RunTestsStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { buildToolOptions, languageOptions }
      )}
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: RunTestsStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RunTestsStepDataUI, RunTestsStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RunTestsStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <div className={css.fieldsSection}>
              <FormInput.InputWithIdentifier
                inputName="name"
                idName="identifier"
                isIdentifierEditable={isEmpty(initialValues.identifier)}
                inputLabel={getString('pipelineSteps.stepNameLabel')}
              />
              <FormMultiTypeTextAreaField
                className={css.removeBpLabelMargin}
                name="description"
                label={<Text margin={{ bottom: 'xsmall' }}>{getString('description')}</Text>}
                multiTypeTextArea={{ expressions }}
              />
              <FormMultiTypeConnectorField
                label={
                  <Text style={{ display: 'flex', alignItems: 'center' }}>
                    {getString('pipelineSteps.connectorLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('pipelineSteps.connectorInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                type={['Gcp', 'Aws', 'DockerRegistry']}
                width={
                  getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560
                }
                name="spec.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                multiTypeProps={{ expressions }}
                style={{ marginBottom: 0, marginTop: 'var(--spacing-small)' }}
              />
              <MultiTypeTextField
                name="spec.image"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('imageLabel')}
                    <Button icon="question" minimal tooltip={getString('imageInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTextInputProps={{
                  placeholder: getString('imagePlaceholder'),
                  multiTextInputProps: { expressions }
                }}
              />
              <MultiTypeTextField
                name="spec.args"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('argsLabel')}
                    <Button icon="question" minimal tooltip={getString('runTestsArgsInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions }
                }}
              />
              <MultiTypeSelectField
                name="spec.buildTool"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('buildToolLabel')}
                    <Button icon="question" minimal tooltip={getString('buildToolInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: buildToolOptions,
                  multiTypeInputProps: { expressions }
                }}
              />
              <MultiTypeSelectField
                name="spec.language"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('languageLabel')}
                    <Button icon="question" minimal tooltip={getString('languageInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: languageOptions,
                  multiTypeInputProps: { expressions }
                }}
              />
              <MultiTypeTextField
                name="spec.packages"
                label={
                  <Text margin={{ top: 'small' }}>
                    {getString('packagesLabel')}
                    <Button icon="question" minimal tooltip={getString('packagesInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions }
                }}
              />
            </div>
            <div className={css.fieldsSection}>
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
              <FormMultiTypeCheckboxField
                name="spec.runOnlySelectedTests"
                label={getString('runOnlySelectedTestsLabel')}
                multiTypeTextbox={{ expressions }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <MultiTypeTextField
                name="spec.testAnnotations"
                label={
                  <Text>
                    {getString('testAnnotationsLabel')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('testAnnotationsInfo')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                multiTextInputProps={{
                  multiTextInputProps: { expressions }
                }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <FormMultiTypeTextAreaField
                className={css.removeBpLabelMargin}
                name="spec.preCommand"
                label={
                  <Text style={{ display: 'flex', alignItems: 'center' }}>
                    {getString('preCommandLabel')}
                    <Button icon="question" minimal tooltip={getString('preCommandInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                placeholder={getString('commandPlaceholder')}
                multiTypeTextArea={{ expressions }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <FormMultiTypeTextAreaField
                className={css.removeBpLabelMargin}
                name="spec.postCommand"
                label={
                  <Text style={{ display: 'flex', alignItems: 'center' }}>
                    {getString('postCommandLabel')}
                    <Button icon="question" minimal tooltip={getString('postCommandInfo')} iconProps={{ size: 14 }} />
                  </Text>
                }
                placeholder={getString('commandPlaceholder')}
                multiTypeTextArea={{ expressions }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <MultiTypeList
                name="spec.reportPaths"
                placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('pipelineSteps.reportPathsLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.reportPathsInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  )
                }}
                multiTextInputProps={{ expressions }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <MultiTypeMap
                name="spec.envVariables"
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('environmentVariables')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('environmentVariablesInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  )
                }}
                valueMultiTextInputProps={{ expressions }}
                style={{ marginBottom: 'var(--spacing-small)' }}
              />
              <MultiTypeList
                name="spec.outputVariables"
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('pipelineSteps.outputVariablesLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.outputVariablesInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  )
                }}
                multiTextInputProps={{ expressions }}
              />
              <StepCommonFields />
            </div>
            <div className={css.buttonsWrapper}>
              <Button
                intent="primary"
                type="submit"
                text={getString('save')}
                margin={{ right: 'xxlarge' }}
                data-testid={'submit'}
              />
              <Button text={getString('cancel')} minimal onClick={handleCancelClick} />
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RunTestsStepBaseWithRef = React.forwardRef(RunTestsStepBase)
