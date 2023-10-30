/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { NodeProps, ReactFlowProvider } from 'reactflow'
import { TestWrapper } from '@common/utils/testUtils'
import NetworkMapHexagonNode from '../NetworkMapHexagonNode'

const props: NodeProps = {
  id: 'a1',
  data: { id: 'a1', name: 'a1', kind: 'discoveredservice' },
  isConnectable: true,
  dragging: false,
  selected: false,
  type: 'hexagon',
  xPos: 0,
  yPos: 0,
  zIndex: 1
}

describe('NetworkMapHexagonNode', () => {
  test('render component with mock data', async () => {
    const { container } = render(
      <TestWrapper>
        <ReactFlowProvider>
          <NetworkMapHexagonNode {...props} />
        </ReactFlowProvider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render component with mock data with data field missing name', async () => {
    const newProps = { ...props, data: { ...props.data, name: '' } }
    const { container } = render(
      <TestWrapper>
        <ReactFlowProvider>
          <NetworkMapHexagonNode {...newProps} />
        </ReactFlowProvider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
