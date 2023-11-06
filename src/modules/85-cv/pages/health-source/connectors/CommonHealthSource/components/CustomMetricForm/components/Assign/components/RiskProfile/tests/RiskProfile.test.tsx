/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import * as formik from 'formik'
import { render, waitFor } from '@testing-library/react'
import { Classes } from '@blueprintjs/core'
import { Formik, FormikForm } from '@harness/uicore'
import type { useGetRiskCategoryForCustomHealthMetric } from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import CommonHealthSourceProvider from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import { RiskProfile } from '../RiskProfile'
import { riskProfileResponse } from '../../../__tests__/AssignQuery.mock'
import { getRiskCategoryOptionsV2 } from '../RiskProfile.utils'
import { healthSourceConfigMock } from './RiskProfile.mock'

const showErrorMock = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError: showErrorMock, showSuccess: jest.fn(), clear: jest.fn() }))
}))

const WrapperComponent = ({
  data,
  isTemplate,
  serviceInstanceField,
  continuousVerificationEnabled,
  isQueryRuntimeOrExpression
}: {
  data: ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>
  isTemplate?: boolean
  serviceInstanceField?: string
  continuousVerificationEnabled?: boolean
  isQueryRuntimeOrExpression?: boolean
}): JSX.Element => {
  return (
    <TestWrapper>
      <Formik initialValues={{ serviceInstanceField }} onSubmit={noop} formName="">
        {() => (
          <SetupSourceTabsContext.Provider
            value={{ isTemplate, expression: ['expression 1'], sourceData: { connectorRef: 'sumologic' } } as any}
          >
            <CommonHealthSourceProvider
              isQueryRuntimeOrExpression={isQueryRuntimeOrExpression}
              updateParentFormik={jest.fn()}
              parentFormValues={{} as any}
            >
              <FormikForm>
                <RiskProfile
                  riskProfileResponse={data}
                  serviceInstanceField={serviceInstanceField}
                  continuousVerificationEnabled={continuousVerificationEnabled}
                  healthSourceConfig={healthSourceConfigMock}
                  recordProps={{
                    sampleRecords: []
                  }}
                />
              </FormikForm>
            </CommonHealthSourceProvider>
          </SetupSourceTabsContext.Provider>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for RiskProfile', () => {
  beforeEach(() => {
    showErrorMock.mockClear()
  })
  test('Ensure that api result is rendered correctly', async () => {
    const { getByText } = render(
      <WrapperComponent
        data={riskProfileResponse as unknown as ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>}
      />
    )

    await waitFor(() => expect(getByText('Performance/Other')).not.toBeNull())
    getByText('Performance/Throughput')
    getByText('Errors')
    getByText('Infrastructure')
    getByText('Performance/Response Time')
  })

  test('Service intance renders', async () => {
    const { container } = render(
      <WrapperComponent
        data={riskProfileResponse as unknown as ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>}
        serviceInstanceField={'sourceHost'}
        continuousVerificationEnabled
      />
    )

    await waitFor(() => expect(container.querySelector('[name="serviceInstanceField"]')).toHaveValue('sourceHost'))
  })

  test('Ensure form errors are visible', async () => {
    jest.spyOn(formik, 'useFormikContext').mockReturnValue({
      errors: {
        [CustomMetricFormFieldNames.LOWER_BASELINE_DEVIATION]: 'Deviation Error',
        [CustomMetricFormFieldNames.RISK_CATEGORY]: 'Risk category Error'
      },
      touched: {
        [CustomMetricFormFieldNames.RISK_CATEGORY]: true,
        [CustomMetricFormFieldNames.LOWER_BASELINE_DEVIATION]: true
      }
    } as unknown as any)
    const { getByText } = render(
      <WrapperComponent
        data={riskProfileResponse as unknown as ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>}
      />
    )

    expect(getByText('Deviation Error')).toBeInTheDocument()
    expect(getByText('Risk category Error')).toBeInTheDocument()
  })

  test('Ensure that loading state is rendered correctly', async () => {
    const { container } = render(
      <WrapperComponent
        data={{ loading: true } as unknown as ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>}
      />
    )

    await waitFor(() => expect(container.querySelectorAll(`.${Classes.SKELETON}`).length).toBe(4))
  })

  test('Ensure that when an error occurs, the error is displayed', async () => {
    render(
      <WrapperComponent
        data={
          { error: { data: { detailedMessage: 'someError' } } } as unknown as ReturnType<
            typeof useGetRiskCategoryForCustomHealthMetric
          >
        }
      />
    )

    await waitFor(() => expect(showErrorMock).toBeCalledWith('someError', 7000))
  })

  test('Renders in template mode', async () => {
    const { container: containerExpression } = render(
      <WrapperComponent
        data={{} as unknown as ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>}
        isTemplate
        continuousVerificationEnabled
        serviceInstanceField=""
        isQueryRuntimeOrExpression
      />
    )
    expect(containerExpression.querySelector('[data-icon="fixed-input"]')).toBeInTheDocument()
    const { container, rerender } = render(
      <WrapperComponent data={{} as unknown as ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>} isTemplate />
    )
    rerender(
      <WrapperComponent
        data={{} as unknown as ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>}
        isTemplate
        continuousVerificationEnabled
      />
    )
    expect(container.querySelector('[data-icon="fixed-input"]')).toBeInTheDocument()
    rerender(
      <WrapperComponent
        data={{} as unknown as ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>}
        isTemplate
        serviceInstanceField="<+input>"
        isQueryRuntimeOrExpression
        continuousVerificationEnabled
      />
    )
    expect(container.querySelector('[name="serviceInstanceField"]')).toHaveValue('<+input>')
  })

  test('validate getRiskCategoryOptionsV2', () => {
    expect(getRiskCategoryOptionsV2()).toEqual([])
    expect(getRiskCategoryOptionsV2([])).toEqual([])
    expect(getRiskCategoryOptionsV2([{}] as any)).toEqual([])
    expect(getRiskCategoryOptionsV2([{ displayName: 'Id 101' }] as any)).toEqual([])
    expect(getRiskCategoryOptionsV2([{ identifier: 'id101' }] as any)).toEqual([])
    expect(getRiskCategoryOptionsV2([{ identifier: 'id101', displayName: 'Id 101' }] as any)).toEqual([
      { label: 'Id 101', value: 'id101', tooltipId: 'RiskCategory_id101' }
    ])
  })
})
