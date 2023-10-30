/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation, StyledProps } from '@harness/design-system'
import { Layout, Text } from '@harness/uicore'
import React from 'react'

interface ListItemProps extends StyledProps {
  title: string
  content: JSX.Element
}

export default function ListItems({ title, content, ...rest }: ListItemProps): React.ReactElement {
  return (
    <Layout.Horizontal {...rest}>
      <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY }} style={{ width: '40%' }}>
        {title}
      </Text>
      {content}
    </Layout.Horizontal>
  )
}
