/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { TableV2, Text } from '@harness/uicore'
import { Column } from 'react-table'
import { useStrings } from 'framework/strings'
import { SRMAnalysisStepDetailDTO } from 'services/cv'
import { RenderDateTime, RenderStepName, RenderImpact, RenderStatus } from './RenderTable.utils'

interface ReportsTableInterface {
  data: SRMAnalysisStepDetailDTO[]
  showDrawer: () => void
}

export default function ReportsTable({ data, showDrawer }: ReportsTableInterface): JSX.Element {
  const { getString } = useStrings()

  const columns: Column<SRMAnalysisStepDetailDTO>[] = [
    {
      Header: getString('timeLabel'),
      Cell: RenderDateTime,
      accessor: 'analysisStartTime',
      width: '15%'
    },
    {
      Header: getString('name'),
      Cell: RenderStepName,
      accessor: 'stepName',
      width: '30%'
    },
    {
      Header: getString('cv.monitoredServices.changesTable.impact'),
      Cell: RenderImpact,
      accessor: 'monitoredServiceIdentifier',
      width: '20%'
    },
    {
      Header: getString('source'),
      Cell: () => <Text>Analyse Impact</Text>,
      width: '20%'
    },
    {
      Header: getString('typeLabel'),
      width: '15%',
      accessor: 'analysisStatus',
      Cell: RenderStatus
    }
  ]
  return <TableV2<SRMAnalysisStepDetailDTO> sortable data={data} columns={columns} onRowClick={showDrawer} />
}
