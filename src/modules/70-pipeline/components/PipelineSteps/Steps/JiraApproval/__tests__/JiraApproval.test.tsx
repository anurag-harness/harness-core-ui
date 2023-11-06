/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useGetJiraProjects } from 'services/cd-ng'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import { JiraApproval } from '../JiraApproval'
import { getDefaultCriterias } from '../helper'
import {
  getJiraApprovalInputVariableModeProps,
  getJiraApprovalDeploymentModeProps,
  mockConnectorResponse,
  mockProjectMetadataResponse,
  mockProjectsErrorResponse,
  mockProjectsResponse,
  getJiraApprovalEditModeProps,
  getJiraApprovalEditModePropsWithValues,
  getJiraApprovalEditModePropsWithConnectorId
} from './JiraApprovalTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetJiraProjects: jest.fn(),
  useGetJiraIssueCreateMetadata: () => mockProjectMetadataResponse
}))
describe('Jira Approval fetch projects', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetJiraProjects.mockImplementation(() => mockProjectsErrorResponse)
  })
  beforeEach(() => {
    factory.registerStep(new JiraApproval())
  })
  test('show error if failed to fetch projects', () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraApprovalEditModePropsWithConnectorId()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Jira Approval tests', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetJiraProjects.mockImplementation(() => mockProjectsResponse)
  })
  beforeEach(() => {
    factory.registerStep(new JiraApproval())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getJiraApprovalDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )

    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getJiraApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot('jira-approval-deploymentform')
  })

  test('deploymentform mode - readonly', async () => {
    const props = getJiraApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('jira-approval-deploymentform readonly')
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getJiraApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        template={{ spec: { approvalCriteria: getDefaultCriterias(), rejectionCriteria: getDefaultCriterias() } }}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot('jira-approval-inputset-noruntime')
  })

  test('Basic snapshot - input variable view', () => {
    const props = getJiraApprovalInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        template={{ spec: { approvalCriteria: getDefaultCriterias(), rejectionCriteria: getDefaultCriterias() } }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('jira-approval-input variable view')
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraApprovalEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    await act(() => ref.current?.submitForm()!)
    expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jira approval step' } })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()

    await act(() => ref.current?.submitForm()!)

    await waitFor(() => {
      expect(queryByText('pipeline.jiraApprovalStep.validations.issueKey')).toBeTruthy()
      expect(queryByText('pipeline.approvalCriteria.validations.approvalCriteriaCondition')).toBeTruthy()
    })

    fireEvent.click(getByText('add'))
    await waitFor(() =>
      expect(queryByText('pipeline.approvalCriteria.validations.approvalCriteriaCondition')).toBeNull()
    )

    fireEvent.click(getByText('common.jexlExpression'))
    await waitFor(() => expect(queryByText('pipeline.approvalCriteria.validations.expression')).toBeTruthy())
  })

  test('Edit stage - readonly', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraApprovalEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )

    expect(container).toMatchSnapshot('edit stage view readonly')
  })

  test('Open a saved jira approval step - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJiraApprovalEditModePropsWithValues()
    const { container, getByText, queryByDisplayValue } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JiraApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jira approval step' } })
    expect(queryByDisplayValue('10m')).toBeTruthy()

    expect(queryByDisplayValue('pid1')).toBeTruthy()
    expect(queryByDisplayValue('tdc-2345')).toBeTruthy()
    expect(queryByDisplayValue('itd1')).toBeTruthy()

    expect(queryByDisplayValue('somevalue for f1')).toBeTruthy()

    fireEvent.click(getByText('common.optionalConfig'))
    expect(queryByDisplayValue("<+status> == 'Blocked'")).toBeTruthy()

    await act(() => ref.current?.submitForm()!)
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'jira_approval_step',
      timeout: '10m',
      type: 'JiraApproval',
      spec: {
        connectorRef: 'c1d1',
        projectKey: 'pid1',
        issueKey: 'tdc-2345',
        retryInterval: '1m',
        issueType: 'itd1',
        approvalCriteria: {
          type: 'KeyValues',
          spec: {
            matchAnyCondition: true,
            conditions: [
              {
                key: 'Status',
                operator: 'in',
                value: 'Done,todo'
              },
              {
                key: 'f1',
                operator: 'equals',
                value: 'somevalue for f1'
              }
            ]
          }
        },
        rejectionCriteria: {
          type: 'Jexl',
          spec: {
            expression: "<+status> == 'Blocked'"
          }
        }
      },
      name: 'jira approval step'
    })
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new JiraApproval().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'JiraApproval',
        spec: {
          connectorRef: '',
          projectKey: '',
          issueType: '',
          issueKey: '',
          approvalCriteria: getDefaultCriterias(),
          rejectionCriteria: getDefaultCriterias(),
          retryInterval: '1m'
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: 'JiraApproval',
        spec: {
          connectorRef: '',
          projectKey: '',
          issueType: '',
          issueKey: '',
          approvalCriteria: getDefaultCriterias(),
          rejectionCriteria: getDefaultCriterias(),
          retryInterval: '1m'
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })
})
