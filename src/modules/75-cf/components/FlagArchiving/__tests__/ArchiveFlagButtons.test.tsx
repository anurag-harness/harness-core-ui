import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import ArchiveFlagButtons, { ArchiveFlagButtonsProps } from '../ArchiveFlagButtons'

const renderComponent = (props: Partial<ArchiveFlagButtonsProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <ArchiveFlagButtons disabled={false} onClick={jest.fn()} onClose={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('ArchiveFlagButtons', () => {
  test('it should disable the Archive button if the user types in a mismatching flag Identifier', async () => {
    const onClickMock = jest.fn()

    renderComponent({ disabled: true, onClick: onClickMock })

    expect(screen.getByRole('button', { name: 'archive' })).toBeDisabled()

    userEvent.click(screen.getByRole('button', { name: 'archive' }))

    expect(onClickMock).not.toHaveBeenCalled()
  })

  test('it should call onClick callback if user types in matching flag Identifier', async () => {
    const onClickMock = jest.fn()

    renderComponent({ disabled: false, onClick: onClickMock })

    expect(screen.getByRole('button', { name: 'archive' })).toBeEnabled()

    userEvent.click(screen.getByRole('button', { name: 'archive' }))

    await waitFor(() => expect(onClickMock).toHaveBeenCalled())
  })

  test('it should call onCancel callback if user closes the Archive modal', async () => {
    const onCloseMock = jest.fn()

    renderComponent({ onClose: onCloseMock })

    userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await waitFor(() => expect(onCloseMock).toHaveBeenCalled())
  })
})
