/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FormikForm, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { connect, FormikContextType } from 'formik'
import type { TerraformBackendConfigSpec } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components'
import List from '@common/components/List/List'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { isValueRuntimeInput } from '@common/utils/utils'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import TgPlanConfigSection from './TgPlanConfigSection'
import TgPlanVarFiles from './TgPlanVarFiles'
import type { TerragruntPlanProps } from '../../Common/Terragrunt/TerragruntInterface'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../../Common/Terraform/TerraformStep.module.scss'

function TgPlanInputStep(props: TerragruntPlanProps & { formik?: FormikContextType<any> }): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, initialValues, allowableTypes, stepViewType } = props
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const template = inputSetData?.template
  const inputSet = get(template, 'spec.configuration')
  const pathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`

  return (
    <FormikForm>
      {isValueRuntimeInput(get(template, 'spec.provisionerIdentifier')) && (
        <TextFieldInputSetView
          name={`${pathPrefix}spec.provisionerIdentifier`}
          placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
          fieldPath={'spec.provisionerIdentifier'}
          template={template}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {isValueRuntimeInput(get(template, 'timeout')) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${pathPrefix}timeout`}
            disabled={readonly}
            fieldPath={'timeout'}
            template={template}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
          />
        </div>
      )}

      {isValueRuntimeInput(inputSet?.secretManagerRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            label={getString('platform.connectors.title.secretManager')}
            accountIdentifier={accountId}
            selected={get(initialValues, 'spec.configuration.secretManagerRef', '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            width={388}
            multiTypeProps={{ allowableTypes, expressions }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            category={'SECRET_MANAGER'}
            name={`${pathPrefix}spec.configuration.secretManagerRef`}
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
        </div>
      )}

      {isValueRuntimeInput(get(inputSetData?.template, 'spec.configuration.moduleConfig.path')) && (
        <TextFieldInputSetView
          placeholder={'Enter path'}
          label={getString('common.path')}
          name={`${pathPrefix}spec.configuration.moduleConfig.path`}
          disabled={readonly}
          template={inputSetData?.template}
          fieldPath={'spec.configuration.moduleConfig.path'}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}

      <TgPlanConfigSection {...props} />
      {
        /* istanbul ignore next */ inputSet?.varFiles && inputSet?.varFiles?.length > 0 ? (
          <TgPlanVarFiles {...props} />
        ) : null
      }
      {isValueRuntimeInput((inputSet?.backendConfig?.spec as TerraformBackendConfigSpec)?.content) && (
        <div
          className={cx(stepCss.formGroup, stepCss.md)}
          // needed to prevent the run pipeline to get triggered on pressing enter within TFMonaco editor
          onKeyDown={
            /* istanbul ignore next */ e => {
              e.stopPropagation()
            }
          }
        >
          <MultiTypeFieldSelector
            name={`${pathPrefix}spec.configuration.backendConfig.spec.content`}
            label={getString('cd.backEndConfig')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            expressionRender={
              /* istanbul ignore next */ () => {
                return (
                  <MonacoTextField
                    name={`${pathPrefix}spec.configuration.backendConfig.spec.content`}
                    expressions={expressions}
                    height={300}
                    disabled={readonly}
                    fullScreenAllowed
                    fullScreenTitle={getString('cd.backEndConfig')}
                  />
                )
              }
            }
          >
            <MonacoTextField
              name={`${pathPrefix}spec.configuration.backendConfig.spec.content`}
              expressions={expressions}
              height={300}
              disabled={readonly}
              fullScreenAllowed
              fullScreenTitle={getString('cd.backEndConfig')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}

      {isValueRuntimeInput(inputSet?.workspace) && (
        <TextFieldInputSetView
          name={`${pathPrefix}spec.configuration.workspace`}
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
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
          fieldPath={'spec.configuration.workspace'}
        />
      )}
      <TgPlanConfigSection isBackendConfig={true} {...props} />

      {isValueRuntimeInput(inputSet?.targets as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <List
            name={`${pathPrefix}spec.configuration.targets`}
            label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
          />
        </div>
      )}
      {isValueRuntimeInput(inputSet?.exportTerragruntPlanJson) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${pathPrefix}spec.configuration.exportTerraformPlanJson`}
            label={getString('cd.exportTerraformPlanJson')}
            multiTypeTextbox={{ expressions, allowableTypes }}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
          />
        </div>
      )}
    </FormikForm>
  )
}

const TerragruntPlanInputStep = connect(TgPlanInputStep)
export default TerragruntPlanInputStep
