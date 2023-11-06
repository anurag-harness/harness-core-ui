/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Fragment, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { EXECUTION_TIME_INPUT_VALUE, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings, StringKeys } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  useGetServiceNowIssueCreateMetadata,
  useGetServiceNowTicketTypes,
  useGetServiceNowTicketTypesV2
} from 'services/cd-ng'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { ServiceNowTicketTypeSelectOption, SnowApprovalDeploymentModeProps } from './types'
import { getDateTimeOptions } from './ServiceNowApprovalChangeWindow'
import { getGenuineValue } from './helper'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import css from './ServiceNowApproval.module.scss'

const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'

function FormContent(formContentProps: SnowApprovalDeploymentModeProps): JSX.Element {
  const { inputSetData, initialValues, allowableTypes, formik, stepViewType } = formContentProps
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const runTimeTicketType = get(formik?.values, `${prefix}spec.ticketType`)
  const fixedTicketType = inputSetData?.allValues?.spec?.ticketType
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const { expressions } = useVariablesExpression()
  const connectorRefFixedValue =
    template?.spec?.connectorRef === EXECUTION_TIME_INPUT_VALUE
      ? get(formik?.values, `${prefix}spec.connectorRef`)
      : getGenuineValue(initialValues.spec?.connectorRef || (inputSetData?.allValues?.spec?.connectorRef as string))

  const getServiceNowTicketTypesQuery = useGetServiceNowTicketTypes({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const getServiceNowTicketTypesV2Query = useGetServiceNowTicketTypesV2({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const serviceNowTicketTypesOptions: ServiceNowTicketTypeSelectOption[] =
    (getServiceNowTicketTypesQuery.data?.data || getServiceNowTicketTypesV2Query.data?.data)?.map(ticketType => ({
      label: defaultTo(ticketType.name, ''),
      value: defaultTo(ticketType.key, ''),
      key: defaultTo(ticketType.key, '')
    })) || []

  const getServiceNowIssueCreateMetadataQuery = useGetServiceNowIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  useEffect(() => {
    if (
      !isEmpty(connectorRefFixedValue) &&
      getMultiTypeFromValue(connectorRefFixedValue) === MultiTypeInputType.FIXED
    ) {
      getServiceNowTicketTypesV2Query.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue?.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    if (runTimeTicketType || (fixedTicketType && getMultiTypeFromValue(fixedTicketType) === MultiTypeInputType.FIXED)) {
      getServiceNowIssueCreateMetadataQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue?.toString(),
          ticketType: runTimeTicketType?.toString() || fixedTicketType?.toString()
        }
      })
    }
  }, [runTimeTicketType, fixedTicketType])

  const commonMultiTypeInputProps = (placeholder: string) => {
    const selectOptions = getDateTimeOptions(getServiceNowIssueCreateMetadataQuery.data?.data || [])
    return {
      selectItems: selectOptions,
      placeholder: getServiceNowIssueCreateMetadataQuery.loading
        ? getString('pipeline.serviceNowApprovalStep.fetching')
        : getServiceNowIssueCreateMetadataQuery.error?.message || `${getString('select')} ${placeholder}`,
      useValue: true,
      multiTypeInputProps: {
        selectProps: {
          addClearBtn: true,
          items: selectOptions
        },
        allowableTypes,
        expressions
      }
    }
  }

  const ticketTypesLoading = getServiceNowTicketTypesQuery.loading || getServiceNowTicketTypesV2Query.loading

  return (
    <Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <TimeoutFieldInputSetView
          name={`${prefix}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          className={css.deploymentViewMedium}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: isApprovalStepFieldDisabled(readonly)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          fieldPath="timeout"
          template={template}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeConnectorField
          name={`${prefix}spec.connectorRef`}
          label={getString('pipeline.serviceNowApprovalStep.connectorRef')}
          selected={(initialValues?.spec?.connectorRef as string) || ''}
          placeholder={getString('common.entityPlaceholderText')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={385}
          setRefValue
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          type={'ServiceNow'}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          templateProps={{
            isTemplatizedView: true,
            templateValue: template?.spec?.connectorRef
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.ticketType) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          tooltipProps={{
            dataTooltipId: 'serviceNowApprovalTicketType'
          }}
          selectItems={
            ticketTypesLoading
              ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
              : serviceNowTicketTypesOptions
          }
          name={`${prefix}spec.ticketType`}
          label={getString('pipeline.serviceNowApprovalStep.ticketType')}
          className={css.deploymentViewMedium}
          placeholder={
            ticketTypesLoading
              ? getString(fetchingTicketTypesPlaceholder)
              : getServiceNowTicketTypesQuery.error?.message ||
                getServiceNowTicketTypesQuery.error?.message ||
                getString('select')
          }
          useValue
          disabled={isApprovalStepFieldDisabled(readonly, ticketTypesLoading)}
          multiTypeInputProps={{
            selectProps: {
              addClearBtn: true,
              allowCreatingNewItems: true,
              items: ticketTypesLoading
                ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                : serviceNowTicketTypesOptions
            },
            allowableTypes
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.ticketNumber) === MultiTypeInputType.RUNTIME ? (
        <TextFieldInputSetView
          label={getString('pipeline.serviceNowApprovalStep.issueNumber')}
          name={`${prefix}spec.ticketNumber`}
          multiTextInputProps={{
            disabled: isApprovalStepFieldDisabled(readonly),
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          className={css.deploymentViewMedium}
          fieldPath="spec.ticketNumber"
          template={template}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.retryInterval) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          label={getString('pipeline.customApprovalStep.retryInterval')}
          name={`${prefix}spec.retryInterval`}
          disabled={readonly}
          fieldPath={'spec.retryInterval'}
          template={template}
          className={css.deploymentViewMedium}
        />
      )}

      {getMultiTypeFromValue(template?.spec?.approvalCriteria?.spec?.expression) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeTextAreaField
          className={css.deploymentViewMedium}
          label={getString('pipeline.approvalCriteria.jexlExpressionLabelApproval')}
          name={`${prefix}spec.approvalCriteria.spec.expression`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeTextArea={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            expressions,
            allowableTypes
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.rejectionCriteria?.spec?.expression) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeTextAreaField
          className={css.deploymentViewMedium}
          label={getString('pipeline.approvalCriteria.jexlExpressionLabelRejection')}
          name={`${prefix}spec.rejectionCriteria.spec.expression`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeTextArea={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            expressions,
            allowableTypes
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.changeWindow?.startField) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          className={css.deploymentViewMedium}
          name={`${prefix}spec.changeWindow.startField`}
          label={getString('pipeline.serviceNowApprovalStep.windowStart')}
          {...commonMultiTypeInputProps(getString('pipeline.serviceNowApprovalStep.windowStart'))}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.changeWindow?.endField) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          className={css.deploymentViewMedium}
          name={`${prefix}spec.changeWindow.endField`}
          label={getString('pipeline.serviceNowApprovalStep.windowEnd')}
          {...commonMultiTypeInputProps(getString('pipeline.serviceNowApprovalStep.windowEnd'))}
        />
      ) : null}
    </Fragment>
  )
}

/*
Used for iput sets and deployment form
Provide values for all runtime fields in approval step
Open the same form in readonly view while viewing already run executions
*/
export default function ServiceNowApprovalDeploymentMode(props: SnowApprovalDeploymentModeProps): JSX.Element {
  return <FormContent {...props} />
}
