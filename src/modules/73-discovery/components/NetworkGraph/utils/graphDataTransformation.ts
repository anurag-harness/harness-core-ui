/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Node, Edge } from 'reactflow'
import { NodeTypes, nodeGroupOptions, nodeOptions } from '@discovery/components/NetworkGraph/constants'
import type { ApiListCustomServiceConnection, ApiListK8sCustomService } from 'services/servicediscovery'
import type { ServiceEdgeData, ServiceNodeData } from '@discovery/components/NetworkGraph/types'

export function getGraphNodesFromServiceList(
  serviceList: ApiListK8sCustomService | null
): Node<ServiceNodeData, NodeTypes>[] {
  if (!serviceList) return []

  const namespaces = new Set<string>()
  const graphNodes: Node<ServiceNodeData, NodeTypes>[] = []

  serviceList.items?.map(service => {
    if (service.namespace && !namespaces.has(service.namespace)) {
      namespaces.add(service.namespace)
    }

    if (service.id)
      graphNodes.push({
        id: service.id,
        data: service,
        parentNode: service.namespace,
        ...nodeOptions
      })
  })

  namespaces.forEach(value => {
    graphNodes.push({
      id: value,
      data: { name: value },
      ...nodeGroupOptions
    })
  })

  return graphNodes
}

export function getGraphEdgesFromServiceConnections(
  connectionList: ApiListCustomServiceConnection | null
): Edge<ServiceEdgeData>[] {
  if (!connectionList) return []

  const graphEdges: Edge<ServiceEdgeData>[] = []

  connectionList.items?.map(connection => {
    if (connection.id && connection.sourceID && connection.destinationID)
      graphEdges.push({
        id: connection.id,
        source: connection.sourceID,
        target: connection.destinationID,
        data: { parentNode: connection.sourceNamespace, ...connection }
      })
  })

  return graphEdges
}
