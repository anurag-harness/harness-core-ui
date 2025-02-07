/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'

import EnvironmentDialog, { EnvironmentDialogProps } from '../EnvironmentDialog'

const renderComponent = (props: Partial<EnvironmentDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/chaos/orgs/:orgIdentifier/projects/:projectIdentifier/chaos-project"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <EnvironmentDialog onCreate={jest.fn()} environments={[]} {...props} />
    </TestWrapper>
  )
}

describe('EnvironmentDialog', () => {
  describe('Environment name validation', () => {
    test('it should show appropriate error message if Environment name is empty', async () => {
      renderComponent()

      // open the modal
      await userEvent.click(screen.getByRole('button', { name: 'newEnvironment' }))

      // leave environment name blank and submit form
      await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

      await waitFor(() => expect(screen.getByText('fieldRequired')).toBeInTheDocument())
    })

    test('it should show appropriate error message if Environment name contains a non-ASCII character', async () => {
      renderComponent()

      // open the modal
      await userEvent.click(screen.getByRole('button', { name: 'newEnvironment' }))

      // enter invalid text and submit form
      const environmentNameInputField = screen.getByRole('textbox', { name: '' })
      await userEvent.type(environmentNameInputField, 'à')

      await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

      await waitFor(() => expect(screen.getByText('common.validation.namePatternIsNotValid')).toBeInTheDocument())
    })

    test('it should not show error message if Environment name contains an ASCII character', async () => {
      renderComponent()

      // open the modal
      await userEvent.click(screen.getByRole('button', { name: 'newEnvironment' }))

      // enter valid environment name and submit form
      const environmentNameInputField = screen.getByRole('textbox', { name: '' })
      await userEvent.type(environmentNameInputField, 'my environment name')

      await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

      await waitFor(() => {
        expect(screen.queryByText('common.validation.namePatternIsNotValid')).not.toBeInTheDocument()
        expect(screen.queryByText('fieldRequired')).not.toBeInTheDocument()
      })
    })

    test('it should show error message if there is a duplicated Environment name', async () => {
      // preexisting environment passed in as props
      renderComponent({
        environments: [
          {
            accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
            orgIdentifier: 'default',
            projectIdentifier: 'asdasd',
            identifier: 'mockIdentifier',
            name: 'myEnvName',
            description: undefined,
            color: '#0063F7',
            type: 'PreProduction',
            deleted: false,
            tags: {}
          }
        ]
      })

      // open the modal
      await userEvent.click(screen.getByRole('button', { name: 'newEnvironment' }))

      const environmentNameInputField = screen.getByRole('textbox', { name: '' })

      await userEvent.type(environmentNameInputField, 'myEnvName')
      await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

      await waitFor(() => {
        expect(screen.queryByText('chaos.environments.create.duplicateName')).toBeInTheDocument()
      })
    })
  })
})
