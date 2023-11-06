/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import type { InstanceGroupedByArtifact, ServiceDefinition } from 'services/cd-ng'

export type PostProdRollbackStatusType = InstanceGroupedByArtifact['rollbackStatus']
export interface PostProdTableData {
  artifact?: string
  envId?: string
  envName?: string
  infrastructureId?: string
  infrastructureName?: string
  clusterId?: string
  instanceCount?: number
  lastDeployedAt?: number
  showInfra?: boolean
  showEnv?: boolean
  showArtifact?: boolean
  pipelineId?: string
  pipelineName?: string
  planexecutionId?: string
  stageExecutionId?: string
  stageId?: string
  rollbackStatus?: PostProdRollbackStatusType
  infrastructureMappingId?: string
  instanceKey?: string
}

export interface PostProdRollbackListTableProps {
  data: PostProdTableData[]
  isEnvGroup: boolean
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D>
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

export type CellType = Renderer<CellTypeWithActions<PostProdTableData>>
export type CellProps = CellTypeWithActions<PostProdTableData>

export const supportedDeploymentTypesForPostProdRollback: ServiceDefinition['type'][] = [
  'Kubernetes',
  'TAS',
  'ECS',
  'Asg'
]

export const columnWidth = {
  envs: {
    haveEnvGroup: '13%',
    noEnvGroup: '0%'
  },
  infras: {
    haveEnvGroup: '15%',
    noEnvGroup: '18%'
  },
  artifacts: {
    haveEnvGroup: '20%',
    noEnvGroup: '25%'
  },
  instancesCount: {
    haveEnvGroup: '10%',
    noEnvGroup: '10%'
  },
  execution: {
    haveEnvGroup: '17%',
    noEnvGroup: '20%'
  },
  status: {
    haveEnvGroup: '12%',
    noEnvGroup: '15%'
  },
  lastDeployedTime: {
    haveEnvGroup: '13%',
    noEnvGroup: '12%'
  }
}

export const getRollbackStatusFromResponse = (
  status: PostProdRollbackStatusType
): PostProdRollbackStatusType | undefined => {
  switch (status) {
    case 'NOT_STARTED':
      return 'NOT_STARTED'
    case 'FAILURE':
    case 'STARTED':
    case 'SUCCESS':
      return 'STARTED'
    default:
      return undefined
  }
}
