/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button } from '@harness/uicore'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { Stepper } from '../Stepper'
import { StepList } from './Stepper.mock'

const Wrapped = ({
  isStepValid,
  runValidationOnMount
}: {
  isStepValid: (stepId: string) => boolean
  runValidationOnMount?: boolean
}): React.ReactElement => {
  const [validateAll, setValidateAll] = useState(runValidationOnMount)
  return (
    <>
      <Stepper id="createSLOTabs" isStepValid={isStepValid} runValidationOnMount={validateAll} stepList={StepList} />
      <Button text="save" onClick={() => setValidateAll(true)} />
    </>
  )
}

describe('Validate Stepper', () => {
  test('render in create mode', async () => {
    const isStepValid = jest.fn().mockReturnValue(true)
    const { container, getByText } = render(
      <TestWrapper>
        <Wrapped isStepValid={isStepValid} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-testid="steptitle_Step1"] [data-icon="Edit"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="ring"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="ring"]')).toBeInTheDocument()
    expect(screen.getByText('next')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="backButton"]')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('next'))
    expect(getByText('Preview Panel Step 1')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [data-icon="Edit"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="ring"]')).toBeInTheDocument()
    expect(screen.getByText('back')).toBeInTheDocument()
    expect(screen.getByText('next')).toBeInTheDocument()
    await userEvent.click(screen.getByText('next'))
    expect(getByText('Preview Panel Step 2')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [data-icon="Edit"]')).toBeInTheDocument()
    expect(screen.getByText('back')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="nextButton"]')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('save'))

    // goto step 1 ( edit icon not visible on selected one as status is available )
    await userEvent.click(container.querySelector('[data-testid="steptitle_Step1"]')!)
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="tick-circle"]')).toBeInTheDocument()
    await userEvent.click(container.querySelector('[data-testid="steptitle_Step2"]')!)
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="tick-circle"]')).toBeInTheDocument()
    await userEvent.click(container.querySelector('[data-testid="steptitle_Step3"]')!)
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()

    // Back button works as expected
    await userEvent.click(screen.getByText('back'))
    expect(getByText('Panel Step 2')).toBeInTheDocument()
    await userEvent.click(screen.getByText('back'))
    expect(getByText('Panel Step 1')).toBeInTheDocument()
  })

  test('On clicking save in create mode all steps status is updated ', async () => {
    const isStepValid = jest.fn().mockReturnValue(true)
    const { container } = render(
      <TestWrapper>
        <Wrapped isStepValid={isStepValid} />
      </TestWrapper>
    )
    await userEvent.click(screen.getByText('save'))
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
  })

  test('render in edit mode', async () => {
    const isStepValid = (stepId: string): boolean => {
      if (stepId === 'Step3') {
        return false
      } else {
        return true
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <Wrapped isStepValid={isStepValid} runValidationOnMount={true} />
      </TestWrapper>
    )

    // load with status with status
    expect(container.querySelector('[data-testid="steptitle_Step1"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step2"] [icon="tick-circle"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Step3"] [icon="warning-sign"]')).toBeInTheDocument()

    // directly jump to step 3 in error state
    await userEvent.click(container.querySelector('[data-testid="steptitle_Step3"]')!)
    expect(getByText('Panel Step 3')).toBeInTheDocument()
    await userEvent.click(screen.getByText('back'))
    expect(getByText('Panel Step 2')).toBeInTheDocument()
    await userEvent.click(screen.getByText('back'))
    expect(getByText('Panel Step 1')).toBeInTheDocument()
  })

  test('Render with empty step list', () => {
    const { container } = render(
      <TestWrapper>
        <Stepper id="createSLOTabs" isStepValid={jest.fn()} runValidationOnMount={false} stepList={[]} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-testid="Stepper_main"]')).toBeInTheDocument()
  })
})
