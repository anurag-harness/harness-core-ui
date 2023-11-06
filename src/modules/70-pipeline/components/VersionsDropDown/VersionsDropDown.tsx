/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, DropDown, Layout, Tag, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { DropDownProps } from '@harness/uicore/dist/components/DropDown/DropDown'
import { useStrings } from 'framework/strings'
import css from './VersionsDropDown.module.scss'

export const DefaultStableVersionValue = '-1'

export interface VersionsDropDownProps extends DropDownProps {
  stableVersion?: string
}

export function VersionsDropDown(props: VersionsDropDownProps): React.ReactElement {
  const { stableVersion, ...rest } = props
  const { getString } = useStrings()
  const getCustomLabel = React.useCallback(
    item => (
      <Container className={css.container}>
        <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text lineClamp={1} font={{ variation: FontVariation.BODY }}>
            {item.value === DefaultStableVersionValue ? item.label : item.value}
          </Text>
          {(item.value as string) === stableVersion && (
            <Tag className={css.tag}>{getString('common.stable').toUpperCase()}</Tag>
          )}
        </Layout.Horizontal>
      </Container>
    ),
    [stableVersion]
  )
  return <DropDown filterable={false} getCustomLabel={getCustomLabel} {...rest} />
}
