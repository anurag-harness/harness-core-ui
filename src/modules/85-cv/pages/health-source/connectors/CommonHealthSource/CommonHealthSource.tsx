/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Ref, useRef } from 'react'
import { noop } from 'lodash-es'
import { Container, Formik, FormikForm, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import type {
  CommonHealthSourceConfigurations,
  CommonCustomMetricFormikInterface,
  HealthSourceConfig
} from './CommonHealthSource.types'

import { initGroupedCreatedMetrics } from '../../common/CommonCustomMetric/CommonCustomMetric.utils'
import CommonHealthSourceProvider from './components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import { CommonConfigurationsFormFieldNames, DEFAULT_HEALTH_SOURCE_QUERY } from './CommonHealthSource.constants'
import { cleanUpMappedMetrics } from './components/CustomMetricForm/CustomMetricFormContainer.utils'
import CustomMetricFormContainer from './components/CustomMetricForm/CustomMetricFormContainer'
import MetricThresholdContainer from './components/MetricThresholds/MetricThresholdContainer'
import { getMetricNameFilteredMetricThresholds } from '../MonitoredServiceConnector.utils'
import {
  checkIfCurrentCustomMetricFormIsValid,
  getCurrentQueryData,
  getInitialValuesForHealthSourceConfigurations,
  handleValidateCustomMetricForm,
  handleValidateHealthSourceConfigurationsForm
} from './CommonHealthSource.utils'
import css from './CommonHealthSource.module.scss'

export interface CommonHealthSourceProps {
  data: CommonHealthSourceConfigurations
  onSubmit: (configureHealthSourceData: CommonHealthSourceConfigurations) => void
  onPrevious: (formikValues: CommonHealthSourceConfigurations) => void
  isTemplate?: boolean
  expressions?: string[]
  healthSourceConfig: HealthSourceConfig
  connectorRef: string
}

export default function CommonHealthSource({
  data: configurationsPageData,
  onPrevious,
  isTemplate,
  expressions,
  healthSourceConfig,
  onSubmit,
  connectorRef
}: CommonHealthSourceProps): JSX.Element {
  const { getString } = useStrings()

  const healthSourceConfigurationsInitialValues = getInitialValuesForHealthSourceConfigurations(configurationsPageData)
  const customMetricFormRef = useRef<FormikProps<CommonCustomMetricFormikInterface>>()

  return (
    <Formik<CommonHealthSourceConfigurations>
      enableReinitialize
      initialValues={healthSourceConfigurationsInitialValues}
      formName="healthSourceConfigurationsForm"
      validate={formValues =>
        handleValidateHealthSourceConfigurationsForm({
          formValues,
          healthSourceConfig,
          getString
        })
      }
      validateOnMount
      onSubmit={noop}
    >
      {formik => {
        const {
          queryMetricsMap,
          selectedMetric: currentSelectedMetric = '',
          ignoreThresholds,
          failFastThresholds
        } = formik.values

        const createdMetrics = Array.from(queryMetricsMap.keys()) || [DEFAULT_HEALTH_SOURCE_QUERY]
        const groupedCreatedMetrics = initGroupedCreatedMetrics(queryMetricsMap, getString)
        cleanUpMappedMetrics(queryMetricsMap)

        const filterRemovedMetricNameThresholds = (deletedMetricName: string): void => {
          if (deletedMetricName) {
            const metricThresholds = {
              ignoreThresholds,
              failFastThresholds
            }

            const updatedMetricThresholds = getMetricNameFilteredMetricThresholds({
              metricThresholds,
              metricName: deletedMetricName
            })

            formik.setFieldValue(
              CommonConfigurationsFormFieldNames.IGNORE_THRESHOLDS,
              updatedMetricThresholds.ignoreThresholds
            )
            formik.setFieldValue(
              CommonConfigurationsFormFieldNames.FAILFAST_THRESHOLDS,
              updatedMetricThresholds.failFastThresholds
            )
          }
        }

        const customMetricFormInitialValues = getCurrentQueryData(queryMetricsMap, currentSelectedMetric)
        const isQueryRuntimeOrExpression =
          getMultiTypeFromValue(customMetricFormInitialValues?.query) !== MultiTypeInputType.FIXED

        return (
          <>
            <CommonHealthSourceProvider
              updateParentFormik={formik.setFieldValue}
              parentFormValues={formik.values}
              isQueryRuntimeOrExpression={isQueryRuntimeOrExpression}
            >
              <FormikForm>
                <Formik<CommonCustomMetricFormikInterface>
                  enableReinitialize
                  formName={'customMetricForm'}
                  validateOnMount
                  initialValues={customMetricFormInitialValues}
                  onSubmit={noop}
                  validate={values =>
                    handleValidateCustomMetricForm({
                      getString,
                      formData: values,
                      customMetricsConfig: healthSourceConfig.customMetrics,
                      name: healthSourceConfig?.name
                    })
                  }
                  innerRef={customMetricFormRef as Ref<FormikProps<CommonCustomMetricFormikInterface>>}
                >
                  {() => {
                    return (
                      <FormikForm className={css.formFullheight}>
                        <CustomMetricFormContainer
                          mappedMetrics={queryMetricsMap}
                          selectedMetric={currentSelectedMetric}
                          connectorIdentifier={connectorRef}
                          createdMetrics={createdMetrics}
                          isTemplate={isTemplate}
                          expressions={expressions}
                          healthSourceConfig={healthSourceConfig}
                          groupedCreatedMetrics={groupedCreatedMetrics}
                          filterRemovedMetricNameThresholds={filterRemovedMetricNameThresholds}
                        />
                      </FormikForm>
                    )
                  }}
                </Formik>
                <MetricThresholdContainer
                  healthSourceConfig={healthSourceConfig}
                  groupedCreatedMetrics={groupedCreatedMetrics}
                />
              </FormikForm>
              <Container height={120} />
            </CommonHealthSourceProvider>
            <DrawerFooter
              isSubmit
              onPrevious={() => onPrevious(formik.values)}
              onNext={() => {
                formik.submitForm()
                // For showing validation error message purpose
                if (checkIfCurrentCustomMetricFormIsValid(customMetricFormRef) && formik.isValid) {
                  onSubmit(formik.values)
                }
              }}
            />
          </>
        )
      }}
    </Formik>
  )
}
