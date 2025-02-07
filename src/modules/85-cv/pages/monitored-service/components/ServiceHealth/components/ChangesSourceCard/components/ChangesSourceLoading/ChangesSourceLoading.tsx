/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes } from '@blueprintjs/core'
import { Container } from '@harness/uicore'
import React, { useMemo } from 'react'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { NUM_OF_LOADING_BLOCKS_TO_SHOW, NUM_OF_LOADING_BLOCKS_TO_SHOW_WITH_CE } from './ChangesSourceLoading.constants'
import css from './ChangesSourceLoading.module.scss'

export default function ChangesSourceLoading(): JSX.Element {
  const isChaosFEEnabled = useFeatureFlag(FeatureFlag.SRM_INTERNAL_CHANGE_SOURCE_CE)

  const LoadingBlock = (): JSX.Element => {
    return (
      <Container data-testid="loading-block" className={css.loadingBlock}>
        <Container height={30} width={30} className={Classes.SKELETON} margin={{ right: 'small' }} />
        <Container>
          <Container height={5} width={72} className={Classes.SKELETON} margin={{ top: 'xsmall', bottom: 'xsmall' }} />
          <Container height={5} width={28} className={Classes.SKELETON} />
        </Container>
      </Container>
    )
  }

  const loadingBlocks = useMemo(() => {
    const loadingFields: JSX.Element[] = []
    for (
      let i = 1;
      i <= (isChaosFEEnabled ? NUM_OF_LOADING_BLOCKS_TO_SHOW_WITH_CE : NUM_OF_LOADING_BLOCKS_TO_SHOW);
      i++
    ) {
      loadingFields.push(<LoadingBlock key={i} />)
    }
    return loadingFields
  }, [])

  return <Container className={css.loadingContainer}>{loadingBlocks}</Container>
}
