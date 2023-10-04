/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect, FormikProps } from 'formik'
import { defaultTo, isEmpty, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  Layout,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  SelectOption,
  Text
} from '@harness/uicore'

import { AsgInfrastructure, useAutoScalingGroups } from 'services/cd-ng'
import { useListAwsRegions } from 'services/portal'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { connectorTypes } from '@pipeline/utils/constants'
import ProvisionerSelectField from '@pipeline/components/Provisioner/ProvisionerSelect'
import type { AsgInfraSpecCustomStepProps } from './AsgInfraSpec'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface AsgInfraSpecInputFormProps {
  initialValues: AsgInfrastructure
  allValues: AsgInfrastructure
  onUpdate?: (data: AsgInfrastructure) => void
  readonly?: boolean
  template?: AsgInfrastructure
  allowableTypes: AllowedTypes
  path: string
  formik?: FormikProps<AsgInfrastructure>
  customStepProps: AsgInfraSpecCustomStepProps
}

const AsgInfraSpecInputForm = (props: AsgInfraSpecInputFormProps) => {
  const { template, readonly = false, path, allowableTypes, customStepProps, formik, allValues } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const [asgBaseNames, setAsgBaseNames] = React.useState<SelectOption[]>([])
  const { CDS_BASIC_ASG } = useFeatureFlags()

  const connectorFieldName = isEmpty(path) ? 'connectorRef' : `${path}.connectorRef`
  const regionFieldName = isEmpty(path) ? 'region' : `${path}.region`
  const provisionerName = isEmpty(path) ? 'provisioner' : `${path}.provisioner`
  const baseAsgName = isEmpty(path) ? 'baseAsgName' : `${path}.baseAsgName`

  const {
    data: awsAutoScalingData,
    refetch,
    loading,
    error
  } = useAutoScalingGroups({
    queryParams: {
      accountIdentifier: accountId,
      region: defaultTo(get(formik, regionFieldName), ''),
      awsConnectorRef: defaultTo(get(formik, connectorFieldName), ''),
      projectIdentifier,
      orgIdentifier,
      envId: defaultTo(allValues?.environmentRef, ''),
      infraDefinitionId: defaultTo(allValues?.infrastructureRef, '')
    }
  })

  React.useEffect(() => {
    setAsgBaseNames(
      defaultTo(awsAutoScalingData?.data, []).map((asgBaseOption: string) => ({
        value: asgBaseOption,
        label: asgBaseOption
      }))
    )
  }, [awsAutoScalingData])

  React.useEffect(() => {
    setAsgBaseNames([])
  }, [error])

  const { data: awsRegionsData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions: SelectOption[] = React.useMemo(() => {
    return defaultTo(awsRegionsData?.resource, []).map(region => ({
      value: region.value,
      label: region.name as string
    }))
  }, [awsRegionsData?.resource])

  const getItems = (isFetching: boolean, items: SelectOption[]): SelectOption[] => {
    if (isFetching) {
      const labelStr = getString('common.loadingFieldOptions', { fieldName: 'Asg Base Names' })
      return [{ label: labelStr, value: labelStr }]
    }
    return defaultTo(items, [])
  }

  const handleChangeConnector = (): void => {
    if (CDS_BASIC_ASG) {
      formik?.setFieldValue(baseAsgName, '')
      setAsgBaseNames([])
    }
  }

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.provisioner) === MultiTypeInputType.RUNTIME && customStepProps?.provisioner && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <ProvisionerSelectField name={provisionerName} path={path} provisioners={customStepProps?.provisioner} />
        </div>
      )}
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: 'awsInfraConnector'
            }}
            name={connectorFieldName}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('common.entityPlaceholderText')}
            onChange={handleChangeConnector}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={connectorTypes.Aws}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            name={regionFieldName}
            selectItems={regions}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: regions,
                popoverClassName: cx(stepCss.formGroup, stepCss.md)
              },
              onChange: () => {
                if (CDS_BASIC_ASG) {
                  formik?.setFieldValue(baseAsgName, '')
                  setAsgBaseNames([])
                }
              }
            }}
            label={getString('regionLabel')}
            placeholder={getString('pipeline.regionPlaceholder')}
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.baseAsgName) === MultiTypeInputType.RUNTIME && CDS_BASIC_ASG && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            name={baseAsgName}
            selectItems={getItems(loading, asgBaseNames)}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: asgBaseNames,
                allowCreatingNewItems: true,
                loadingItems: loading,
                noResults: (
                  <Text padding={'small'}>
                    {loading
                      ? getString('common.loadingFieldOptions', { fieldName: 'Base Asg Names' })
                      : get(error, 'data.message', null) || getString('common.filters.noResultsFound')}
                  </Text>
                )
              },

              onClick: () => {
                refetch({
                  queryParams: {
                    accountIdentifier: accountId,
                    region: defaultTo(get(formik?.values, regionFieldName), ''),
                    awsConnectorRef: defaultTo(get(formik?.values, connectorFieldName), ''),
                    projectIdentifier,
                    orgIdentifier,
                    envId: defaultTo(allValues?.environmentRef, ''),
                    infraDefinitionId: defaultTo(allValues?.infrastructureRef, '')
                  }
                })
              }
            }}
            label={getString('cd.baseAsgLabel')}
            placeholder={getString('cd.baseAsgPlaceholder')}
            disabled={readonly}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export const AsgInfraSpecInputSetMode = connect(AsgInfraSpecInputForm)
