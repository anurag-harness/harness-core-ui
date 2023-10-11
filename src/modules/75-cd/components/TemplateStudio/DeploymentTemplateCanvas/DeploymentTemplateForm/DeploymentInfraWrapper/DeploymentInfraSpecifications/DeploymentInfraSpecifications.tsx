/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { FormikProps, FieldArray } from 'formik'
import {
  Button,
  ButtonVariation,
  FormikForm,
  FormInput,
  Label,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Select,
  Text,
  AllowedTypesWithRunTime,
  ButtonSize,
  HarnessDocTooltip
} from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'

import { defaultTo, get, isEmpty } from 'lodash-es'
import { String as StringGlobal, useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { JsonNode } from 'services/pipeline-ng'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import {
  FETCH_INSTANCE_SCRIPT_DEFAULT_TEXT,
  useDeploymentContext
} from '@cd/context/DeploymentContext/DeploymentContextProvider'
import { CustomVariablesEditableStage } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariablesEditableStage'
import { useTemplateVariables } from '@pipeline/components/TemplateVariablesContext/TemplateVariablesContext'
import { YamlProperties } from 'services/template-ng'
import { getDTInfraVariablesValidationField, InstanceScriptTypes } from '../DeploymentInfraUtils'
import css from './DeploymentInfraSpecifications.module.scss'

export enum VariableType {
  String = 'String',
  Secret = 'Secret',
  Number = 'Number',
  Connector = 'Connector'
}

export default function DeploymentInfraSpecifications(props: { formik: FormikProps<JsonNode> }): React.ReactElement {
  const { formik } = props
  const { allowableTypes, isReadOnly } = useDeploymentContext()
  const { values: formValues, setFieldValue } = formik
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { metadataMap, variablesTemplate } = useTemplateVariables()
  const infraAllowableTypes: AllowedTypesWithRunTime[] = [MultiTypeInputType.FIXED]

  const scriptType: ScriptType = 'Bash'
  const instanceScriptTypes = React.useMemo(
    () => [
      { label: getString('inline'), value: InstanceScriptTypes.Inline },
      { label: getString('resourcePage.fileStore'), value: InstanceScriptTypes.FileStore }
    ],
    [getString]
  )
  const fetchInstanceScriptType = formValues?.fetchInstancesScript?.store?.type

  const onSelectChange = (item: SelectOption): void => {
    const fieldName = 'fetchInstancesScript.store'
    setFieldValue(fieldName, {
      type: item.value,
      spec:
        item.value === InstanceScriptTypes.Inline
          ? {
              content: formValues?.fetchInstancesScript?.store?.spec?.content || FETCH_INSTANCE_SCRIPT_DEFAULT_TEXT
            }
          : {
              files: !isEmpty(formValues?.fetchInstancesScript?.store?.spec?.files)
                ? formValues?.fetchInstancesScript?.store?.spec?.files
                : ['']
            }
    })
  }

  const fetchScriptWidgetTitle = useMemo(
    (): JSX.Element => (
      <Layout.Vertical>
        <Label className={cx(css.configLabel, 'ng-tooltip-native')} data-tooltip-id="fetchInstanceScriptDT">
          {getString('pipeline.customDeployment.fetchInstanceScriptHeader')}
        </Label>
      </Layout.Vertical>
    ),
    [getString]
  )

  const getYamlPropertiesForVariables = useMemo(
    (): YamlProperties[] =>
      defaultTo(
        (get(variablesTemplate, 'infrastructure.variables', []) as AllNGVariables[])?.map?.(variable =>
          get(metadataMap[defaultTo(variable.value, '')], 'yamlProperties', {})
        ),
        []
      ),
    [metadataMap, variablesTemplate]
  )

  return (
    <FormikForm>
      <CardWithOuterTitle
        title={getString('common.variables')}
        className={css.infraSections}
        headerClassName={css.headerText}
        dataTooltipId="infraVariablesTitleDT"
      >
        <Layout.Vertical>
          <Text className={cx(css.labelText, 'ng-tooltip-native')} inline={true} data-tooltip-id="infraVariablesDT">
            {getString('pipeline.customDeployment.infraVariablesTitle')}
            <HarnessDocTooltip tooltipId="infraVariablesDT" useStandAlone={true} />
          </Text>
          <Layout.Horizontal spacing="large">
            <CustomVariablesEditableStage
              className={css.infraVariableSection}
              formName="editInfraVariables"
              initialValues={{
                variables: defaultTo(formValues?.variables, []) as AllNGVariables[],
                canAddVariable: true
              }}
              allowableTypes={allowableTypes}
              readonly={isReadOnly}
              onUpdate={values => {
                setFieldValue('variables', values.variables)
              }}
              allowedVarialblesTypes={[
                VariableType.String,
                VariableType.Secret,
                VariableType.Number,
                VariableType.Connector
              ]}
              enableValidation={true}
              addVariableLabel={'platform.variables.newVariable'}
              validationSchema={getDTInfraVariablesValidationField}
              isDrawerMode={true}
              yamlProperties={getYamlPropertiesForVariables}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </CardWithOuterTitle>

      <CardWithOuterTitle
        title={getString('pipeline.customDeployment.fetchInstancesScript')}
        className={css.infraSections}
        headerClassName={css.headerText}
        dataTooltipId="fetchInstancesScriptTitleDT"
      >
        <div>
          <Layout.Horizontal flex={{ alignItems: 'flex-start' }} margin={{ top: 'medium', bottom: 'medium' }}>
            {fetchInstanceScriptType === InstanceScriptTypes.Inline && (
              <div className={css.halfWidth}>
                <MultiTypeFieldSelector
                  name="fetchInstancesScript.store.spec.content"
                  label={fetchScriptWidgetTitle}
                  defaultValueToReset=""
                  disabled={isReadOnly}
                  allowedTypes={infraAllowableTypes}
                  disableTypeSelection={true} // to hide type selection as only fixed value allowed
                  skipRenderValueInExpressionLabel
                  expressionRender={() => {
                    return (
                      <ShellScriptMonacoField
                        name="fetchInstancesScript.store.spec.content"
                        scriptType={scriptType}
                        disabled={isReadOnly}
                        expressions={expressions}
                      />
                    )
                  }}
                >
                  <ShellScriptMonacoField
                    name="fetchInstancesScript.store.spec.content"
                    scriptType={scriptType}
                    disabled={isReadOnly}
                    expressions={expressions}
                  />
                </MultiTypeFieldSelector>
              </div>
            )}
            {fetchInstanceScriptType === InstanceScriptTypes.FileStore && (
              <MultiConfigSelectField
                name="fetchInstancesScript.store.spec.files"
                allowableTypes={infraAllowableTypes}
                fileType={FILE_TYPE_VALUES.FILE_STORE}
                formik={formik}
                expressions={expressions}
                fileUsage={FileUsage.SCRIPT}
                values={formValues?.fetchInstancesScript?.store?.spec?.files || ['']}
                multiTypeFieldSelectorProps={{
                  disableTypeSelection: true,
                  label: fetchScriptWidgetTitle
                }}
                addFileLabel={getString('common.plusNewName', { name: getString('common.file') })}
                restrictToSingleEntry={true}
              />
            )}
          </Layout.Horizontal>

          <Select
            name="fetchInstancesScript.store.type"
            items={instanceScriptTypes}
            className={css.templateDropdown}
            defaultSelectedItem={instanceScriptTypes.find(
              type => type.value === get(formValues, 'fetchInstancesScript.store.type')
            )}
            onChange={onSelectChange}
            disabled={isReadOnly}
          />
        </div>
      </CardWithOuterTitle>

      <CardWithOuterTitle
        title={getString('pipeline.customDeployment.instanceObjectArrayPath')}
        className={css.infraSections}
        headerClassName={css.headerText}
        dataTooltipId="instanceObjectArrayPathDT"
      >
        <Layout.Vertical width={'50%'} margin={{ bottom: 0 }}>
          <FormInput.MultiTextInput
            name="instancesListPath"
            className={css.halfWidth}
            placeholder={getString('cd.specifyTargetHost')}
            label=""
            multiTextInputProps={{ expressions, disabled: isReadOnly, allowableTypes: infraAllowableTypes }}
            disabled={isReadOnly}
          />
        </Layout.Vertical>
      </CardWithOuterTitle>

      <CardWithOuterTitle
        title={getString('pipeline.customDeployment.instanceAttributes')}
        className={css.instanceAttributes}
        headerClassName={css.headerText}
        dataTooltipId="instanceAttributesDT"
      >
        <MultiTypeFieldSelector
          name="instanceAttributes"
          label=""
          defaultValueToReset={[{ name: 'instancename', jsonPath: '', description: '', id: uuid() }]}
          disableTypeSelection
        >
          <FieldArray
            name="instanceAttributes"
            render={({ push, remove }) => {
              return (
                <div className={cx(css.instanceAttributesVariables)}>
                  <div className={cx(css.tableRow, css.headerRow, 'variablesTableRow')}>
                    <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                      {getString('pipeline.customDeployment.fieldNameLabel')}
                    </Text>
                    <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                      {getString('pipeline.customDeployment.jsonPathRelativeLabel')}
                    </Text>
                    <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                      {`${getString('description')} ${getString('common.optionalLabel')}`}
                    </Text>
                  </div>

                  {formValues.instanceAttributes?.map?.(({ id }: { id: string }, index: number) => {
                    return (
                      <div key={id} className={cx(css.tableRow, 'variablesTableRow')}>
                        <FormInput.Text
                          name={`instanceAttributes[${index}].name`}
                          placeholder={getString('pipeline.customDeployment.fieldNamePlaceholder')}
                          disabled={isReadOnly || index === 0}
                        />
                        <FormInput.MultiTextInput
                          name={`instanceAttributes[${index}].jsonPath`}
                          placeholder={getString('common.valuePlaceholder')}
                          disabled={isReadOnly}
                          multiTextInputProps={{
                            allowableTypes: infraAllowableTypes,
                            expressions,
                            disabled: isReadOnly
                          }}
                          label=""
                        />
                        <FormInput.Text
                          name={`instanceAttributes[${index}].description`}
                          placeholder={getString('common.descriptionPlaceholder')}
                          disabled={isReadOnly}
                        />

                        <div className={css.actionButtons}>
                          {!isReadOnly && index > 0 ? (
                            <Button
                              variation={ButtonVariation.ICON}
                              icon="main-trash"
                              data-testid={`remove-instanceAttriburteVar-${index}`}
                              tooltip={<StringGlobal className={css.tooltip} stringID="common.removeThisVariable" />}
                              onClick={() => remove(index)}
                              minimal
                            />
                          ) : /* istanbul ignore next */ null}
                        </div>
                      </div>
                    )
                  })}

                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-instanceAttriburteVar"
                    onClick={() => push({ name: '', jsonPath: '', description: '', id: uuid() })}
                    disabled={isReadOnly}
                    className={css.addButton}
                    size={ButtonSize.SMALL}
                    text={getString('pipeline.customDeployment.newAttribute')}
                  />
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </CardWithOuterTitle>
    </FormikForm>
  )
}
