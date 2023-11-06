/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import {
  DefaultStableVersionValue,
  VersionsDropDown,
  VersionsDropDownProps
} from '@pipeline/components/VersionsDropDown/VersionsDropDown'

const baseProps: VersionsDropDownProps = {
  items: [
    {
      label: 'v1',
      value: 'v1'
    },
    {
      label: 'v2',
      value: 'v2'
    },
    {
      label: 'Always use stable version',
      value: DefaultStableVersionValue
    }
  ],
  onChange: jest.fn(),
  stableVersion: 'v1',
  value: 'v1'
}

describe('test <VersionsDropDown/>', () => {
  test('should match snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <VersionsDropDown {...baseProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should match snapshot when always using stable version is selected', () => {
    const { container } = render(
      <TestWrapper>
        <VersionsDropDown {...baseProps} value={DefaultStableVersionValue} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should call onChange with correct params', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <VersionsDropDown {...baseProps} />
      </TestWrapper>
    )

    const selectVersionButton = getByTestId('dropdown-button')
    act(() => {
      fireEvent.click(selectVersionButton)
    })

    const popover = findPopoverContainer() as HTMLElement
    await waitFor(() => popover)

    const menuItems = popover.querySelectorAll('[class*="menuItem"]')
    expect(menuItems?.length).toBe(3)

    act(() => {
      fireEvent.click(menuItems[1])
    })
    expect(baseProps.onChange).toBeCalledWith({ label: 'v2', value: 'v2' }, expect.anything())

    act(() => {
      fireEvent.click(menuItems[2])
    })
    expect(baseProps.onChange).toBeCalledWith(
      { label: 'Always use stable version', value: DefaultStableVersionValue },
      expect.anything()
    )
  })
})
