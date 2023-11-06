/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  authFieldsTransformConfig,
  authFieldsValidationConfig,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  imageFieldsValidationConfig,
  ingestionFieldValidationConfig,
  INGESTION_SCAN_MODE,
  USER_PASSWORD_AUTH_TYPE,
  sbomFieldsTransformConfig,
  sbomFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { BlackduckStepData } from './BlackduckStep'

const extraAuthFieldsTransformConfig = (data: BlackduckStepData) =>
  data.spec.mode !== 'ingestion'
    ? [
        {
          name: 'spec.auth.domain',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.ssl',
          type: TransformValuesTypes.Boolean
        },
        {
          name: 'spec.auth.type',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.access_id',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.version',
          type: TransformValuesTypes.Text
        }
      ]
    : []

const toolFieldsTransformConfig = (data: BlackduckStepData) =>
  data.spec.mode !== INGESTION_SCAN_MODE.value
    ? [
        {
          name: 'spec.tool.project_name',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.tool.project_version',
          type: TransformValuesTypes.Text
        }
      ]
    : []

export const transformValuesFieldsConfig = (data: BlackduckStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...authFieldsTransformConfig(data),
    ...toolFieldsTransformConfig(data),
    ...extraAuthFieldsTransformConfig(data),
    ...sbomFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

const toolFieldsValidationConfig = (
  data: BlackduckStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode !== INGESTION_SCAN_MODE.value || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.tool.project_name',
          type: ValidationFieldTypes.Text,
          label: 'projectCard.projectName',
          isRequired: true
        },
        {
          name: 'spec.tool.project_version',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.tool.projectVersion',
          isRequired: true
        }
      ]
    : []

const extraAuthFieldsValidationConfig = (
  data: BlackduckStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode !== 'ingestion' || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.auth.domain',
          type: ValidationFieldTypes.Text,
          label: 'platform.secrets.winRmAuthFormFields.domain',
          isRequired: true
        },
        {
          name: 'spec.auth.ssl',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authSsl'
        },
        {
          name: 'spec.auth.type',
          type: ValidationFieldTypes.Text,
          label: 'typeLabel',
          isRequired: true
        },
        {
          name: 'spec.auth.version',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authVersion'
        },
        {
          name: 'spec.auth.access_id',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authAccessId',
          isRequired: data.spec.auth?.type === USER_PASSWORD_AUTH_TYPE.value
        }
      ]
    : []

export const editViewValidateFieldsConfig = (data: BlackduckStepData) => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data),
    ...toolFieldsValidationConfig(data),
    ...extraAuthFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...sbomFieldValidationConfig(),
    ...additionalFieldsValidationConfigEitView
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: BlackduckStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data, StepViewType.InputSet),
    ...toolFieldsValidationConfig(data, StepViewType.InputSet),
    ...ingestionFieldValidationConfig(data, StepViewType.InputSet),
    ...extraAuthFieldsValidationConfig(data, StepViewType.InputSet),
    ...imageFieldsValidationConfig(data, StepViewType.InputSet),
    ...sbomFieldValidationConfig(),
    ...additionalFieldsValidationConfigInputSet
  ]

  return inputSetViewValidateFieldsConfig
}
