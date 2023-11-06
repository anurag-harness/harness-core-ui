/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef, Fragment, useEffect, useState } from 'react'
import {
  Accordion,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  parseStringToTime
} from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  ServiceNowApprovalData,
  ServiceNowApprovalStepModeProps,
  ServiceNowFormContentInterface,
  ServiceNowTicketTypeSelectOption,
  resetForm
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isApprovalStepFieldDisabled } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ApprovalRejectionCriteriaType } from '@pipeline/components/PipelineSteps/Steps/Common/types'
import {
  ServiceNowFieldNG,
  useGetServiceNowIssueCreateMetadata,
  useGetServiceNowTicketTypes,
  useGetServiceNowTicketTypesV2
} from 'services/cd-ng'
import {
  getApprovalRejectionCriteriaForInitialValues,
  getGenuineValue
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/helper'
import { StringKeys, useStrings } from 'framework/strings'
import { ConnectorRefSchema } from '@common/utils/Validation'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { Connectors } from '@platform/connectors/constants'
import { ServiceNowApprovalRejectionCriteria } from './ServiceNowApprovalRejectionCriteria'
import { ServiceNowApprovalChangeWindow } from './ServiceNowApprovalChangeWindow'
import css from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/ServiceNowApproval.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import { checkIfFixedAndValidString } from '../JiraApproval/helper'

const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'

function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  getServiceNowTicketTypesQuery,
  getServiceNowTicketTypesV2Query,
  getServiceNowIssueCreateMetadataQuery
}: ServiceNowFormContentInterface): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [count, setCount] = useState(0)
  const [fieldList, setFieldList] = useState<ServiceNowFieldNG[]>([])
  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)

  const ticketTypeKeyFixedValue =
    getMultiTypeFromValue(formik.values.spec.ticketType) === MultiTypeInputType.FIXED &&
    !isEmpty(formik.values.spec.ticketType)
      ? formik.values.spec.ticketType
      : undefined

  const serviceNowTicketTypesOptions: ServiceNowTicketTypeSelectOption[] =
    connectorRefFixedValue &&
    connectorValueType === MultiTypeInputType.FIXED &&
    (!getServiceNowTicketTypesQuery.loading || !getServiceNowTicketTypesV2Query.loading)
      ? (getServiceNowTicketTypesQuery.data?.data || getServiceNowTicketTypesV2Query.data?.data)?.map(ticketType => ({
          label: defaultTo(ticketType.name, ''),
          value: defaultTo(ticketType.key, ''),
          key: defaultTo(ticketType.key, '')
        })) || []
      : []

  useDeepCompareEffect(() => {
    if (connectorRefFixedValue && ticketTypeKeyFixedValue) {
      // When creating new approval step , this effect fetches data from createMetadata API
      if (isEmpty(getServiceNowIssueCreateMetadataQuery.data?.data)) {
        getServiceNowIssueCreateMetadataQuery.refetch({
          queryParams: {
            ...commonParams,
            connectorRef: connectorRefFixedValue.toString(),
            ticketType: ticketTypeKeyFixedValue.toString()
          }
        })
      } else {
        setFieldList(getServiceNowIssueCreateMetadataQuery.data?.data as ServiceNowFieldNG[])
        const approvalCriteria = getApprovalRejectionCriteriaForInitialValues(
          formik.values.spec.approvalCriteria,
          getServiceNowIssueCreateMetadataQuery.data?.data
        )
        formik.setFieldValue('spec.approvalCriteria', approvalCriteria)
        const rejectionCriteria = getApprovalRejectionCriteriaForInitialValues(
          formik.values.spec.rejectionCriteria,
          getServiceNowIssueCreateMetadataQuery.data?.data
        )
        formik.setFieldValue('spec.rejectionCriteria', rejectionCriteria)
      }
    }
  }, [connectorRefFixedValue, ticketTypeKeyFixedValue, getServiceNowIssueCreateMetadataQuery.data?.data])

  useEffect(() => {
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      getServiceNowTicketTypesV2Query.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  const ticketTypesLoading = getServiceNowTicketTypesQuery.loading || getServiceNowTicketTypesV2Query.loading

  return (
    <Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: isApprovalStepFieldDisabled(readonly)
            }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeDurationProps={{
            expressions,
            enableConfigureOptions: true,
            allowableTypes
          }}
        />
      </div>

      <div className={stepCss.divider} />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('pipeline.serviceNowApprovalStep.connectorRef')}
          width={390}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          setRefValue
          type="ServiceNow"
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(value: any, _unused, multiType) => {
            // Clear dependent fields
            setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              resetForm(formik, 'connectorRef')
              setCount(count + 1)
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 8 }}
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
              type: Connectors.SERVICE_NOW,
              label: getString('pipeline.serviceNowApprovalStep.connectorRef'),
              disabled: readonly,
              gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </div>
      <Fragment key={count}>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            tooltipProps={{
              dataTooltipId: 'serviceNowApprovalTicketType'
            }}
            selectItems={
              ticketTypesLoading
                ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                : serviceNowTicketTypesOptions
            }
            label={getString('pipeline.serviceNowApprovalStep.ticketType')}
            name="spec.ticketType"
            placeholder={
              ticketTypesLoading
                ? getString(fetchingTicketTypesPlaceholder)
                : getServiceNowTicketTypesQuery.error?.message || getString('select')
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
              allowableTypes,
              expressions,
              onChange: (value: unknown, _valueType, type) => {
                // When ticketType value is fixed and changed we refetch the createMetadata call to get latest data
                if (type === MultiTypeInputType.FIXED && !isEmpty(get(value, 'value'))) {
                  getServiceNowIssueCreateMetadataQuery.refetch({
                    queryParams: {
                      ...commonParams,
                      connectorRef: (connectorRefFixedValue as string).toString(),
                      ticketType: (get(value, 'value') as string).toString()
                    }
                  })
                }
                // Clear dependent fields
                if (
                  type === MultiTypeInputType.FIXED &&
                  !isEmpty(value) &&
                  (value as ServiceNowTicketTypeSelectOption) !== ticketTypeKeyFixedValue
                ) {
                  resetForm(formik, 'ticketType')
                  setCount(count + 1)
                }
              }
            }}
          />
        </div>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTextInput
            tooltipProps={{
              dataTooltipId: 'serviceNowApprovalTicketNumber'
            }}
            label={getString('pipeline.serviceNowApprovalStep.issueNumber')}
            name="spec.ticketNumber"
            placeholder={getString('pipeline.serviceNowApprovalStep.issueNumberPlaceholder')}
            disabled={isApprovalStepFieldDisabled(readonly)}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.ticketNumber) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values.spec.ticketNumber}
              type="String"
              variableName="spec.ticketNumber"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.ticketNumber', value)}
              isReadonly={readonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
        </div>
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            name="spec.retryInterval"
            label={getString('pipeline.customApprovalStep.retryInterval')}
            multiTypeDurationProps={{ enableConfigureOptions: true, expressions, disabled: readonly, allowableTypes }}
            className={stepCss.duration}
            disabled={readonly}
          />
        </div>
        <ServiceNowApprovalRejectionCriteria
          fieldList={fieldList}
          title={getString('pipeline.approvalCriteria.approvalCriteria')}
          isFetchingFields={getServiceNowIssueCreateMetadataQuery?.loading}
          mode="approvalCriteria"
          values={formik.values.spec.approvalCriteria}
          onChange={values => formik.setFieldValue('spec.approvalCriteria', values)}
          formik={formik}
          readonly={readonly}
        />
      </Fragment>
      <div className={stepCss.noLookDivider} />
      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <Layout.Vertical spacing="medium">
              <ServiceNowApprovalRejectionCriteria
                fieldList={fieldList}
                title={getString('pipeline.approvalCriteria.rejectionCriteria')}
                isFetchingFields={false}
                mode="rejectionCriteria"
                values={formik.values.spec.rejectionCriteria}
                onChange={values => formik.setFieldValue('spec.rejectionCriteria', values)}
                formik={formik}
                readonly={readonly}
              />
              <ServiceNowApprovalChangeWindow
                formik={formik}
                readonly={!!readonly}
                fieldList={fieldList}
                getServiceNowIssueCreateMetadataQuery={getServiceNowIssueCreateMetadataQuery}
              />
            </Layout.Vertical>
          }
        />
      </Accordion>
    </Fragment>
  )
}

function ServiceNowApprovalStepMode(
  props: ServiceNowApprovalStepModeProps,
  formikRef: StepFormikFowardRef<ServiceNowApprovalData>
): JSX.Element {
  const { onUpdate, readonly, isNewStep, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    branch,
    repoIdentifier
  }
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

  const getServiceNowIssueCreateMetadataQuery = useGetServiceNowIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  return (
    <Formik<ServiceNowApprovalData>
      onSubmit={values => {
        const timeoutString = (formikRef as React.MutableRefObject<FormikProps<ServiceNowApprovalData>>)?.current
          ?.values?.timeout
        const retryIntervalString = (formikRef as React.MutableRefObject<FormikProps<ServiceNowApprovalData>>)?.current
          ?.values?.spec?.retryInterval
        if (checkIfFixedAndValidString(timeoutString || '') && checkIfFixedAndValidString(retryIntervalString)) {
          const retryInterval = parseStringToTime(retryIntervalString)
          const timeout = parseStringToTime(timeoutString || '')
          if (retryInterval > timeout)
            (formikRef as React.MutableRefObject<FormikProps<ServiceNowApprovalData>>)?.current?.setFieldError(
              'spec.retryInterval',
              getString('pipeline.jiraApprovalStep.validations.retryIntervalExceedingTimeout')
            )
        }
        onUpdate?.(values)
      }}
      formName="serviceNowApproval"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(data)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: ConnectorRefSchema(getString, {
            requiredErrorMsg: getString('pipeline.serviceNowApprovalStep.validations.connectorRef')
          }),
          retryInterval: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('pipeline.customApprovalStep.validation.minimumRetryIntervalIs10Secs')
          ),
          ticketType: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.ticketType')),
          ticketNumber: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.issueNumber')),
          approvalCriteria: Yup.object().shape({
            spec: Yup.object().when('type', {
              is: ApprovalRejectionCriteriaType.KeyValues,
              then: Yup.object().shape({
                conditions: Yup.array()
                  .min(1, getString('pipeline.approvalCriteria.validations.approvalCriteriaCondition'))
                  .of(
                    Yup.object().shape({
                      key: Yup.string().required(getString('common.validation.fieldIsRequired', { name: 'Field' })),
                      value: Yup.string().trim().required(getString('common.validation.valueIsRequired'))
                    })
                  )
              }),
              otherwise: Yup.object().shape({
                expression: Yup.string().trim().required(getString('pipeline.approvalCriteria.validations.expression'))
              })
            })
          }),
          changeWindow: Yup.object().shape(
            {
              startField: Yup.string().when('endField', {
                is: endField => !!endField,
                then: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.windowStart'))
              }),
              endField: Yup.string().when('startField', {
                is: startField => !!startField,
                then: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.windowEnd'))
              })
            },
            [['startField', 'endField']]
          )
        })
      })}
    >
      {(formik: FormikProps<ServiceNowApprovalData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
              getServiceNowTicketTypesQuery={getServiceNowTicketTypesQuery}
              getServiceNowTicketTypesV2Query={getServiceNowTicketTypesV2Query}
              getServiceNowIssueCreateMetadataQuery={getServiceNowIssueCreateMetadataQuery}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
const ServiceNowApprovalStepModeWithRef = forwardRef(ServiceNowApprovalStepMode)
export default ServiceNowApprovalStepModeWithRef
