/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { factory, TestStepWidget } from '../../__tests__/StepTestUtil'
import { BarrierStep } from '../Barrier'
import pipelineMock from './PipelineWithFlowControl.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => pipelineMock)
}))
describe('Barrier tests', () => {
  beforeEach(() => {
    factory.registerStep(new BarrierStep())
  })

  test('Edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container, getByText, queryByText, findByText } = render(
      <TestStepWidget
        initialValues={{
          timeout: '',
          name: '',
          identifier: 'BarrierStep',
          type: 'Barrier',
          spec: {
            barrierRef: ''
          }
        }}
        type={StepType.Barrier}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    const helpText = await findByText('pipeline.barrierStep.helpText')
    expect(helpText).toBeInTheDocument()

    // Submit empty form
    await act(() => ref.current?.submitForm()!)
    expect(getByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
    await act(() => ref.current?.submitForm()!)

    await waitFor(() => expect(queryByText('pipeline.barrierStep.barrierReferenceRequired')).toBeTruthy())
  })

  test('Edit view with runtime input values', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'Barrier',
          name: 'BarrierStep',
          identifier: 'BarrierStep',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            barrierRef: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.Barrier}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('Edit stage- readonly', async () => {
    const { container } = render(
      <PipelineContext.Provider
        value={
          {
            state: {
              pipeline: {
                flowControl: {
                  barriers: [
                    {
                      name: 'test',
                      identifier: 'test'
                    },
                    {
                      name: 'test2',
                      identifier: 'test2'
                    }
                  ]
                }
              }
            } as any
          } as any
        }
      >
        <TestStepWidget
          initialValues={{
            name: 'BarrierStep',
            identifier: 'BarrierStep',
            type: 'Barrier',
            timeout: '10s'
          }}
          type={StepType.Barrier}
          stepViewType={StepViewType.Edit}
          readonly={true}
        />
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot('edit stage readonly')
  })

  test('Variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'Barrier',
          name: 'BarrierStep',
          identifier: 'BarrierStep',
          timeout: '10m',
          spec: {
            barrierRef: RUNTIME_INPUT_VALUE
          }
        }}
        template={{
          type: 'Barrier',
          name: 'BarrierStep',
          identifier: 'BarrierStep',
          timeout: '10m',
          spec: {
            barrierRef: RUNTIME_INPUT_VALUE
          }
        }}
        allValues={{
          type: 'Barrier',
          name: 'BarrierStep',
          identifier: 'BarrierStep',
          timeout: '10m',
          spec: {
            barrierRef: RUNTIME_INPUT_VALUE
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.barrier.name',
                localName: 'step.barrier.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.barrier.timeout',
                localName: 'step.barrier.timeout'
              }
            },
            'step-barrierRef': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.barrier.barrierRef',
                localName: 'step.barrier.barrierRef'
              }
            }
          },
          variablesData: {
            name: 'step-name',
            identifier: 'BARRIER',
            type: StepType.Barrier,
            timeout: 'step-timeout',
            spec: {
              barrierRef: 'step=barrierRef'
            }
          }
        }}
        type={StepType.Barrier}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Minimum time cannot be less than 10s and process form data', () => {
    const data = {
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '',
        type: 'Barrier',
        spec: {
          barrierReference: ''
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: RUNTIME_INPUT_VALUE,
        type: 'Barrier',
        spec: {
          barrierReference: 'step-barrier'
        }
      },
      viewType: StepViewType.TriggerForm
    }
    const response = new BarrierStep().validateInputSet(data)
    const processFormResponse = new BarrierStep().processFormData(data.template)

    expect(processFormResponse).toMatchSnapshot()
    expect(response).toMatchSnapshot()
  })

  test('Renders Input Set View', () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'Barrier',
          name: 'BarrierStep',
          identifier: 'BarrierStep',
          timeout: '10m',
          spec: {
            barrierRef: 'test'
          }
        }}
        inputSetData={{
          path: ''
        }}
        type={StepType.Barrier}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
