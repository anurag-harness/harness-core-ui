/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { CETMonitoredServices } from '@cet/pages/CETMonitoredServices'
import * as hooks from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'

export const testWrapperProps: TestWrapperProps = {
  path: routes.toErrorTracking({ ...accountPathProps, ...orgPathProps, ...projectPathProps }),
  pathParams: {
    accountId: 'test_accountId',
    projectIdentifier: 'test_project',
    orgIdentifier: 'test_org'
  }
}

const WrapperComponent = (): React.ReactElement => {
  return (
    <TestWrapper {...testWrapperProps}>
      <CETMonitoredServices />
    </TestWrapper>
  )
}

describe('Unit tests for CETMonitoredServices', () => {
  test('Verify CETMonitoredServices page renders and matches snapshot', async () => {
    const container = render(<WrapperComponent />)
    expect(container).toMatchSnapshot()
  })

  test('Verify CETMonitoredServices page enabled is not empty ', async () => {
    const useFeatureFlags = jest.spyOn(hooks, 'useFeatureFlag')
    useFeatureFlags.mockReturnValue(true)
    const container = render(<WrapperComponent />)
    expect(container).not.toBeNull()
  })
})
