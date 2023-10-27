/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { NodeMetadataProvider } from '@pipeline/components/PipelineDiagram/Nodes/NodeMetadataContext'
import { CustomStage } from '../CustomStage'
import { getDummyPipelineContextValue } from './CustomStageHelper'

jest.mock('@harness/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))
jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  }),
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

function WrapperComponent({
  mockData,
  minimal = false
}: {
  mockData: PipelineContextInterface
  minimal?: boolean
}): JSX.Element {
  return (
    <TestWrapper>
      <PipelineContext.Provider value={mockData}>
        <NodeMetadataProvider>
          <CustomStage
            minimal={minimal}
            stageProps={{}}
            name={''}
            type={''}
            icon={'nav-harness'}
            isDisabled={false}
            isApproval={false}
            title="My custom stage"
            description={''}
          />
        </NodeMetadataProvider>
      </PipelineContext.Provider>
    </TestWrapper>
  )
}

describe('Custom stage shell view', () => {
  test('Setup shell view tests when Env Infra FF is off', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByDisplayValue, getByText, getAllByText, rerender } = render(
      <WrapperComponent mockData={pipelineContextMockValue} minimal={true} />
    )

    rerender(<WrapperComponent mockData={pipelineContextMockValue} minimal={false} />)

    act(() => {
      fireEvent.click(getByText('overview'))
    })
    act(() => {
      fireEvent.change(getByDisplayValue('CustomStep'), { target: { value: 'changedstagename' } })
    })
    expect(container).toMatchSnapshot('Overview Tab')

    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Move to next tab
    act(() => {
      fireEvent.click(getByText('next'))
    })
    await waitFor(() => expect(pipelineContextMockValue.updatePipeline).toBeCalled())

    // Switch back to first tab
    act(() => {
      fireEvent.click(getByText('overview'))
    })

    await waitFor(() => expect(pipelineContextMockValue.updatePipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Click on execution tab and check the shallow render of graph
    act(() => {
      fireEvent.click(getByText('executionText'))
    })

    // Click on execution tab and check the shallow render of graph
    act(() => {
      fireEvent.click(getAllByText('advancedTitle')[0])
    })

    // Click on the checkbox that enables us to enter when condition
    act(() => {
      fireEvent.click(getByText('pipeline.conditionalExecution.condition'))
    })

    // Call the update methods if the when condition changes
    await waitFor(() => expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Click on add button for failure strategy
    act(() => {
      fireEvent.click(getByText('add'))
    })

    // Call the update methods
    await waitFor(() => expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())
  })

  test('Setup shell view tests when Env Infra FF is enabled', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_CUSTOM_STAGE_WITH_ENV_INFRA: true
    })

    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { getByDisplayValue, getByText } = render(<WrapperComponent mockData={pipelineContextMockValue} />)

    expect(getByText('environment')).toBeInTheDocument()

    act(() => {
      fireEvent.click(getByText('environment'))
    })

    // Since Env/Infra is optional
    await waitFor(() => expect(pipelineContextMockValue.updateStage).not.toBeCalled())

    // Move to next tab
    act(() => {
      fireEvent.click(getByText('overview'))
    })
    act(() => {
      fireEvent.change(getByDisplayValue('CustomStep'), { target: { value: 'changedstagename' } })
    })

    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())
  })

  test('readonly view should work when FF is off', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_CUSTOM_STAGE_WITH_ENV_INFRA: false
    })
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByText } = render(
      <WrapperComponent mockData={{ ...pipelineContextMockValue, isReadonly: true }} />
    )

    act(() => {
      fireEvent.click(getByText('overview'))
    })

    expect(container).toMatchSnapshot('readonly view custom step overview')
  })
})
