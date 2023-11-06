/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, Text, FormInput } from '@harness/uicore'
import { get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikContextType } from 'formik'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components'
import List from '@common/components/List/List'

import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { TerraformBackendConfigSpec } from 'services/cd-ng'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { CommandFlags } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { TFMonaco } from '../Common/Terraform/Editview/TFMonacoEditor'
import type { TerraformPlanProps } from '../Common/Terraform/TerraformInterfaces'
import ConfigInputs from './InputSteps/TfConfigSection'
import TfVarFiles from './InputSteps/TfPlanVarFiles'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../Common/Terraform/TerraformStep.module.scss'

export default function TfPlanInputStep(
  props: TerraformPlanProps & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, initialValues, allowableTypes, stepViewType, formik } = props
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const fieldPath = inputSetData?.template?.spec?.configuration ? 'configuration' : 'cloudCliConfiguration'
  const cmdFlagPath = get(inputSetData?.template?.spec, `${fieldPath}.commandFlags`)

  return (
    <FormikForm className={stepCss.inputWidth}>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.provisionerIdentifier`}
          placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
          fieldPath={'spec.provisionerIdentifier'}
          template={inputSetData?.template}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={inputSetData?.template}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.secretManagerRef) ===
        MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          label={getString('platform.connectors.title.secretManager')}
          accountIdentifier={accountId}
          selected={get(initialValues, 'spec.configuration.secretManagerRef', '')}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ allowableTypes, expressions }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          category={'SECRET_MANAGER'}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.secretManagerRef`}
          placeholder={getString('select')}
          disabled={readonly}
          setRefValue
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
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
      )}
      <ConfigInputs {...props} isConfig />

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.workspace) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.workspace`}
          placeholder={getString('pipeline.terraformStep.workspace')}
          label={getString('pipelineSteps.workspace')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={inputSetData?.template}
          fieldPath={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.workspace`}
        />
      )}

      {get(inputSetData?.template?.spec, `${fieldPath}.varFiles`) &&
      get(inputSetData?.template?.spec, `${fieldPath}.varFiles`)?.length > 0 ? (
        <TfVarFiles {...props} />
      ) : null}
      {
        /* istanbul ignore next */
        getMultiTypeFromValue(
          (get(inputSetData?.template?.spec, `${fieldPath}.backendConfig.spec`) as TerraformBackendConfigSpec)?.content
        ) === MultiTypeInputType.RUNTIME && (
          <div
            // needed to prevent the run pipeline to get triggered on pressing enter within TFMonaco editor
            onKeyDown={e => {
              e.stopPropagation()
            }}
          >
            <MultiTypeFieldSelector
              name={`${
                isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
              }spec.${fieldPath}.backendConfig.spec.content`}
              label={getString('cd.backEndConfig')}
              defaultValueToReset=""
              allowedTypes={allowableTypes}
              skipRenderValueInExpressionLabel
              disabled={readonly}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              expressionRender={() => {
                /* istanbul ignore next */
                return (
                  <TFMonaco
                    name={`${
                      isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
                    }spec.${fieldPath}.backendConfig.spec.content`}
                    formik={formik!}
                    expressions={expressions}
                    title={getString('tagsLabel')}
                  />
                )
              }}
            >
              <TFMonaco
                name={`${
                  isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
                }spec.${fieldPath}.backendConfig.spec.content`}
                formik={formik!}
                expressions={expressions}
                title={getString('tagsLabel')}
              />
            </MultiTypeFieldSelector>
          </div>
        )
      }
      <ConfigInputs isBackendConfig={true} {...props} />

      {getMultiTypeFromValue(get(inputSetData?.template?.spec, `${fieldPath}.targets`) as string) ===
        MultiTypeInputType.RUNTIME && (
        <List
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.${fieldPath}.targets`}
          label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          expressions={expressions}
          isNameOfArrayType
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.exportTerraformPlanJson) ===
        MultiTypeInputType.RUNTIME && (
        <FormMultiTypeCheckboxField
          name={`${
            isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
          }spec.configuration.exportTerraformPlanJson`}
          label={getString('cd.exportTerraformPlanJson')}
          multiTypeTextbox={{ expressions, allowableTypes }}
          enableConfigureOptions={true}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.exportTerraformHumanReadablePlan) ===
        MultiTypeInputType.RUNTIME && (
        <FormMultiTypeCheckboxField
          name={`${
            isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
          }spec.configuration.exportTerraformHumanReadablePlan`}
          label={getString('cd.exportTerraformHumanReadablePlan')}
          multiTypeTextbox={{ expressions, allowableTypes }}
          enableConfigureOptions={true}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
        />
      )}

      {isValueRuntimeInput(inputSetData?.template?.spec?.configuration?.skipRefreshCommand) && (
        <FormMultiTypeCheckboxField
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.skipRefreshCommand`}
          label={getString('cd.skipRefreshCommand')}
          multiTypeTextbox={{ expressions, allowableTypes }}
          enableConfigureOptions={true}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
        />
      )}

      {cmdFlagPath?.map((terraformCommandFlag: CommandFlags, terraformFlagIdx: number) => {
        if (
          isValueRuntimeInput(get(inputSetData?.template, `spec.${fieldPath}.commandFlags[${terraformFlagIdx}].flag`))
        ) {
          return (
            <div key={terraformFlagIdx}>
              <FormInput.MultiTextInput
                name={`${
                  isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
                }spec.${fieldPath}.commandFlags[${terraformFlagIdx}].flag`}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
                label={`${terraformCommandFlag.commandType}: ${getString('flag')}`}
              />
            </div>
          )
        }
      })}
    </FormikForm>
  )
}
