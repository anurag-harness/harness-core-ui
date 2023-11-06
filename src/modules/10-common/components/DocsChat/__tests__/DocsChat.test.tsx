import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import DocsChat from '../DocsChat'
import mockResponse from './DocsChat.mock.json'
import css from '../DocsChat.module.scss'

jest.mock('services/notifications', () => ({
  useHarnessSupportBot: jest.fn().mockImplementation(() => {
    return {
      mutate: () => mockResponse,
      data: mockResponse,
      loading: false
    }
  })
}))

jest.mock('@common/components/ResourceCenter/SubmitTicketModal/SubmitTicketModal', () => ({
  SubmitTicketModal: jest.fn().mockImplementation(() => <div>SubmitTicketModal</div>)
}))

jest.mock('@common/hooks', () => ({
  useDeepCompareEffect: jest.fn().mockImplementation(jest.fn()),
  useLocalStorage: jest.fn().mockImplementation((_key, defaultVal) => [defaultVal, jest.fn()])
}))

describe('DocsChat', () => {
  test('should render correctly', async () => {
    const user = userEvent.setup()
    const { findByText } = render(
      <TestWrapper>
        <DocsChat />
      </TestWrapper>
    )
    expect(findByText('common.csBot.title')).toBeTruthy()
    expect(findByText('common.csBot.subtitle')).toBeTruthy()
    const $menuButton = document.querySelector('.' + css.chatMenuButton)
    expect($menuButton).toBeTruthy()
    await user.click($menuButton!)
    const $menu = findPopoverContainer()
    expect($menu).toBeTruthy()
    expect(findByText('Clear History')).toBeTruthy()
  })

  test('should post messages', async () => {
    const user = userEvent.setup()
    const { getByPlaceholderText, container } = render(
      <TestWrapper>
        <DocsChat />
      </TestWrapper>
    )
    const $input = getByPlaceholderText('common.csBot.placeholder')

    await user.type($input, 'test')
    expect($input).toHaveValue('test')

    await user.type($input, '{enter}')
    expect($input).toHaveValue('')

    const messages = container.querySelectorAll('.' + css.messageContainer)
    expect(messages.length).toBe(3)
    expect(messages[0].textContent).toBe('Hi, I can search the Harness Docs for you. How can I help you?')
    expect(messages[1].textContent).toBe('test')
    expect(messages[2].textContent).toBe(mockResponse.data.response)
  })
})
