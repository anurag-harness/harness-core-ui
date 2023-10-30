/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useParams } from 'react-router-dom'
import { Page, PageSpinner } from '@harness/uicore'
import { ApiListDiscoveredServiceConnection, useListDiscoveredService } from 'services/servicediscovery'
import type { DiscoveryPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  getGraphEdgesFromServiceConnections,
  getGraphNodesFromServiceList
} from '@discovery/components/NetworkGraph/utils/graphDataTransformation'
import NetworkGraph from '@discovery/components/NetworkGraph/NetworkGraph'
import { useStrings } from 'framework/strings'
import css from './DiscoveredResourcesGraph.module.scss'

interface DiscoveredResourcesGraphProps {
  connectionList: ApiListDiscoveredServiceConnection | null
  search?: string
  namespace?: string
}

export default function DiscoveredResourcesGraph({
  connectionList
}: DiscoveredResourcesGraphProps): React.ReactElement {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & DiscoveryPathProps>()
  const { getString } = useStrings()

  const { data: serviceList } = useListDiscoveredService({
    agentIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      page: 0,
      limit: 0,
      all: true
    }
  })

  const graphNodes = getGraphNodesFromServiceList(serviceList)
  const graphEdges = getGraphEdgesFromServiceConnections(connectionList)

  if (graphNodes.length === 0 || !connectionList) {
    return (
      <Page.Body>
        <PageSpinner message={getString('discovery.discoveringSpinnerMessage')} />
      </Page.Body>
    )
  }

  return (
    <div className={css.graphContainer}>
      <ReactFlowProvider>
        <NetworkGraph nodes={graphNodes} edges={graphEdges} />
      </ReactFlowProvider>
    </div>
  )
}
