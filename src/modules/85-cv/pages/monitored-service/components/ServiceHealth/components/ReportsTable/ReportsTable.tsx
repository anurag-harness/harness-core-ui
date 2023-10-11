/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Container, NoDataCard } from '@harness/uicore'
import noDataImage from '@cv/assets/noChangesData.svg'
import { useStrings } from 'framework/strings'
import css from './ReportsTable.module.scss'

export default function ReportsTable(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Card className={css.reportsTableCard}>
      <Container height={458}>
        <NoDataCard
          image={noDataImage}
          containerClassName={css.noDataContainer}
          message={getString('cv.monitoredServices.noAvailableData')}
        />
      </Container>
    </Card>
  )
}
