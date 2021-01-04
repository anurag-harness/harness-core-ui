import React from 'react'
import { render, fireEvent, waitFor, getByText as getByTextBody } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uikit'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { ConfigureOptions, ConfigureOptionsProps } from '../ConfigureOptions'

const onChange = jest.fn()
const fetchValuesCalled = jest.fn()

const getProps = (
  value: string,
  type: string | JSX.Element,
  variableName: string,
  isRequired = true,
  defaultValue = '',
  showDefaultField = true,
  showAdvanced = true
): ConfigureOptionsProps => ({
  value,
  isRequired,
  defaultValue,
  variableName,
  type,
  showDefaultField,
  showAdvanced,
  onChange,
  fetchValues: jest.fn().mockImplementation(args => {
    fetchValuesCalled(args)
    return Promise.resolve({})
  })
})

describe('Test ConfigureOptions', () => {
  test('should render configure options', async () => {
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(RUNTIME_INPUT_VALUE, 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
  })

  test('test invalid expression error', async () => {
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps('', 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions')
    fireEvent.click(btn as Element)
    await waitFor(() => getByTextBody(document.body, 'Not a valid input Expression'))
    expect(getByTextBody(document.body, 'Not a valid input Expression')).toBeTruthy()
  })

  test('test regex expression', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(`${RUNTIME_INPUT_VALUE}.regex(^a$)`, 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
    const submitBtn = getByTextBody(dialog, 'Submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.regex(^a$)`, '', true)
  })

  test('test allowed values', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions
          {...getProps(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, 'test', 'var-test')}
          showRequiredField={true}
        />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
    const submitBtn = getByTextBody(dialog, 'Submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, '', true)
  })

  test('test allowed advanced values', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions
          {...getProps(
            `${RUNTIME_INPUT_VALUE}.allowedValues(jexl(\${env.type} == “prod” ? aws1, aws2 : aws3, aws4))`,
            'test',
            'var-test'
          )}
          type={<div>Var Test</div>}
          showDefaultField={false}
        />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
    const submitBtn = getByTextBody(dialog, 'Submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(
      `${RUNTIME_INPUT_VALUE}.allowedValues(jexl(\${env.type} == “prod” ? aws1, aws2 : aws3, aws4))`,
      '',
      true
    )
  })

  test('test dialog open and close', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(RUNTIME_INPUT_VALUE, 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    const closeBtn = dialog.querySelector('[icon="small-cross"]')
    fireEvent.click(closeBtn!)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalled()
  })

  test('test dialog open and cancel btn', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(RUNTIME_INPUT_VALUE, 'test', 'var-test')} fetchValues={undefined} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    onChange.mockReset()
    const cancelBtn = getByTextBody(dialog, 'Cancel')
    fireEvent.click(cancelBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalled()
  })
})
