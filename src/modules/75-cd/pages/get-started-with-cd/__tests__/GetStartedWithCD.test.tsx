/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GetStartedWithCD from '../GetStartedWithCD'

jest.mock('@harnessio/ff-react-client-sdk')

jest.mock('nanoid', () => ({
  customAlphabet: () => {
    const retnFn = (): string => 'bsadfd'
    return retnFn
  }
}))

const trackEventMock = jest.fn()
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))

describe('Test Get Started With CD', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('initial render and should fire telemetry event', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('getStarted')
    expect(createPipelineBtn).toBeInTheDocument()
    fireEvent.click(createPipelineBtn)
    expect(trackEventMock).toHaveBeenCalled()
  })
})
