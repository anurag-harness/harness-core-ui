/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ECSBlueGreenSwapTargetGroupsStep } from '../ECSBlueGreenSwapTargetGroupsStep'

factory.registerStep(new ECSBlueGreenSwapTargetGroupsStep())

const existingInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  timeout: '20m',
  type: StepType.EcsBlueGreenSwapTargetGroups
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('EcsBlueGreenSwapTargetGroupsStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.EcsBlueGreenSwapTargetGroups}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    await userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    await userEvent.clear(timeoutInput!)
    await userEvent.type(timeoutInput!, '30m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('30m'))

    // by default, downsizeOldServiceDelayInSecs should not be displayed
    const downsizeOldServiceDelayInSecsInput = queryByNameAttribute(
      'spec.downsizeOldServiceDelayInSecs',
      container
    ) as HTMLInputElement
    expect(downsizeOldServiceDelayInSecsInput).toBeInTheDocument()
    expect(downsizeOldServiceDelayInSecsInput.value).toBe('')
    fireEvent.change(downsizeOldServiceDelayInSecsInput, { target: { value: '50' } })

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '30m',
        type: StepType.EcsBlueGreenSwapTargetGroups,
        spec: {
          doNotDownsizeOldService: false,
          downsizeOldServiceDelayInSecs: 50
        }
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          type: StepType.EcsBlueGreenSwapTargetGroups
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.EcsBlueGreenSwapTargetGroups
        }}
        type={StepType.EcsBlueGreenSwapTargetGroups}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    await userEvent.type(timeoutInput!, '20m')
    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      type: StepType.EcsBlueGreenSwapTargetGroups
    })
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.EcsBlueGreenSwapTargetGroups}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Step 1': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.EcsBlueGreenSwapTargetGroups.name',
                localName: 'step.EcsBlueGreenSwapTargetGroups.name'
              }
            },
            '20m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.EcsBlueGreenSwapTargetGroups.timeout',
                localName: 'step.EcsBlueGreenSwapTargetGroups.timeout'
              }
            }
          }
        }}
      />
    )

    expect(getByText('name')).toBeVisible()
    expect(getByText('timeout')).toBeVisible()
    expect(getByText('Step 1')).toBeVisible()
    expect(getByText('20m')).toBeVisible()
  })
})
