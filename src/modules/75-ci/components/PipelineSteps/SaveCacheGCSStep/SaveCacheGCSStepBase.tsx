import React from 'react'
import { Text, Formik, FormikForm, Accordion } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { Connectors } from '@connectors/constants'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'

import StepCommonFields from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './SaveCacheGCSStepFunctionConfigs'
import type { SaveCacheGCSStepProps, SaveCacheGCSStepData, SaveCacheGCSStepDataUI } from './SaveCacheGCSStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { ArchiveFormatOptions } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SaveCacheGCSStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: SaveCacheGCSStepProps,
  formikRef: StepFormikFowardRef<SaveCacheGCSStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<SaveCacheGCSStepData, SaveCacheGCSStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { archiveFormatOptions: ArchiveFormatOptions }
      )}
      formName="savedCacheGcs"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: SaveCacheGCSStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<SaveCacheGCSStepDataUI, SaveCacheGCSStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<SaveCacheGCSStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              expressions={expressions}
              enableFields={{
                'spec.connectorRef': {
                  label: (
                    <Text
                      style={{ display: 'flex', alignItems: 'center' }}
                      tooltipProps={{ dataTooltipId: 'gcpConnector' }}
                    >
                      {getString('pipelineSteps.gcpConnectorLabel')}
                    </Text>
                  ),
                  type: Connectors.GCP
                },
                'spec.bucket': { tooltipId: 'gcsBucket' },
                'spec.key': { tooltipId: 'saveCacheKey' },
                'spec.sourcePaths': {}
              }}
              formik={formik}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <CIStepOptionalConfig
                      enableFields={{ 'spec.archiveFormat': {}, 'spec.override': {} }}
                      readonly={readonly}
                    />
                    <StepCommonFields disabled={readonly} />
                  </>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const SaveCacheGCSStepBaseWithRef = React.forwardRef(SaveCacheGCSStepBase)
