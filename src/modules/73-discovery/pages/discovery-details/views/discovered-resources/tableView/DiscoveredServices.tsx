/* eslint-disable strings-restrict-modules */
/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Drawer, Position } from '@blueprintjs/core'
import { Container, Icon, Layout, Page, PageSpinner, TableV2, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import { useHistory, useParams } from 'react-router-dom'
import {
  ApiCustomServiceConnection,
  ApiListCustomServiceConnection,
  DatabaseK8SCustomServiceCollection,
  useListK8SCustomService
} from 'services/servicediscovery'
import type { DiscoveryPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import ServiceDetails from '@discovery/components/ServiceDetails/ServiceDetails'
import routes from '@common/RouteDefinitions'
import { CommonPaginationQueryParams, useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { useQueryParams } from '@common/hooks'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@discovery/interface/filters'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import TagCount from '@discovery/components/TagCount/TagCount'
import css from './DiscoveryServices.module.scss'

export interface ConnectionMap {
  [sourceID: string]: ApiCustomServiceConnection[]
}

export interface K8SCustomService extends DatabaseK8SCustomServiceCollection {
  relatedServices?: ApiCustomServiceConnection[]
}

interface DiscoveredServicesProps {
  connectionList: ApiListCustomServiceConnection | null
  search?: string
  namespace?: string
}

export default function DiscoveredServices({
  connectionList,
  search,
  namespace
}: DiscoveredServicesProps): React.ReactElement {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps>()
  const { getString } = useStrings()

  //States for pagination
  const { page, size } = useQueryParams<CommonPaginationQueryParams>()

  const { data: serviceList, loading: serviceListLoader } = useListK8SCustomService({
    agentIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      namespace: namespace,
      page: page ?? DEFAULT_PAGE_INDEX,
      limit: size ?? DEFAULT_PAGE_SIZE,
      all: false,
      search: search
    }
  })

  const paginationProps = useDefaultPaginationProps({
    itemCount: serviceList?.page?.totalItems ?? 0,
    pageCount: serviceList?.page?.totalPages ?? 1,
    pageIndex: serviceList?.page?.index ?? DEFAULT_PAGE_INDEX,
    pageSize: serviceList?.page?.limit ?? DEFAULT_PAGE_SIZE
  })

  const connectionMap: ConnectionMap = {}

  connectionList?.items?.map(connections => {
    if (connections.sourceID && connections.destinationName) {
      let destinations = connectionMap[connections.sourceID]
      if (destinations === undefined) {
        destinations = [connections]
      } else {
        destinations?.push(connections)
      }
      connectionMap[connections.sourceID] = destinations
    }
  })

  const filteredServices: K8SCustomService[] | undefined = serviceList?.items?.map(services => {
    const relatedServices = connectionMap[services?.id ?? '']
    return {
      ...services,
      relatedServices: relatedServices
    }
  })

  const Name: Renderer<CellProps<K8SCustomService>> = ({ row }) => {
    const [isOpen, setDrawerOpen] = React.useState(false)
    return (
      <>
        <Text
          font={{ size: 'normal', weight: 'semi-bold' }}
          margin={{ left: 'medium' }}
          color={Color.PRIMARY_7}
          style={{ cursor: 'pointer', width: 200 }}
          onClick={() => {
            setDrawerOpen(true)
          }}
          lineClamp={1}
        >
          {row.original.name}
        </Text>
        <Drawer position={Position.RIGHT} isOpen={isOpen} isCloseButtonShown={true} size={'86%'}>
          <ServiceDetails
            serviceName={row.original.name ?? ''}
            serviceId={row.original.id ?? ''}
            infraId={dAgentId ?? ''}
            closeModal={() => setDrawerOpen(false)}
          />
        </Drawer>
      </>
    )
  }

  const Namespace: Renderer<CellProps<K8SCustomService>> = ({ row }) => (
    <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
      <Icon name="app-kubernetes" size={24} margin={{ right: 'small' }} />
      <Text>{row.original.namespace}</Text>
    </Layout.Horizontal>
  )
  const NetworkDetails: Renderer<CellProps<K8SCustomService>> = ({ row }) => (
    <Layout.Vertical>
      <Layout.Horizontal>
        <Text font={{ size: 'small' }} color={Color.GREY_500}>
          {getString('ce.co.gatewayAccess.ip')}:
        </Text>
        <Text padding={{ left: 'small' }} font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_5}>
          {row.original.service?.clusterIP}
        </Text>
      </Layout.Horizontal>

      <Layout.Horizontal>
        <Text font={{ size: 'small' }} color={Color.GREY_500}>
          {getString('discovery.discoveryDetails.discoveredService.portNumber')}:
        </Text>
        <Text padding={{ left: 'small' }} font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_5}>
          {row?.original?.service?.ports?.map(value => value.port).join(', ')}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
  const RelatedServices: Renderer<CellProps<K8SCustomService>> = ({ row }) => {
    const relatedServices: string[] = []
    row.original.relatedServices?.map(services => {
      if (services.destinationName) {
        relatedServices.push(services.destinationName)
      }
    })
    return (
      <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
        {relatedServices.length ? (
          <TagCount
            tagItems={relatedServices}
            icon={'code-settings'}
            tagCount={2}
            tooltipHeader={getString('discovery.relatedService')}
          />
        ) : (
          <Text color={Color.GREY_300}>{getString('discovery.notDetected')}</Text>
        )}
      </Layout.Horizontal>
    )
  }

  const ThreeDotMenu: Renderer<CellProps<K8SCustomService>> = ({ row }) => {
    const history = useHistory()
    const relatedServices: string[] = []
    row.original.relatedServices?.map(services => {
      if (services.destinationName) {
        relatedServices.push(services.destinationName)
      }
    })

    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
        <RbacButton
          minimal
          tooltip={getString('discovery.createNetworkMap')}
          icon="plus"
          permission={{
            resourceScope: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier
            },
            resource: {
              resourceType: ResourceType.NETWORK_MAP
            },
            permission: PermissionIdentifier.CREATE_NETWORK_MAP
          }}
          onClick={() => {
            history.push({
              pathname: routes.toCreateNetworkMap({
                dAgentId: dAgentId,
                accountId,
                orgIdentifier,
                projectIdentifier,
                module: 'chaos'
              }),
              search: `?relatedServices=${relatedServices}`
            })
          }}
        />
      </Layout.Horizontal>
    )
  }

  const discoveryServices: K8SCustomService[] = React.useMemo(() => filteredServices || [], [filteredServices])

  const columns: Column<K8SCustomService>[] = React.useMemo(
    () => [
      {
        Header: getString('common.serviceName'),
        width: '20%',
        Cell: Name
      },
      {
        Header: getString('common.namespace'),
        width: '20%',
        Cell: Namespace
      },
      {
        Header: getString('discovery.networkDetails'),
        width: '20%',
        Cell: NetworkDetails
      },
      {
        Header: getString('discovery.relatedService'),
        width: '30%',
        Cell: RelatedServices
      },
      {
        Header: '',
        id: 'threeDotMenu',
        Cell: ThreeDotMenu
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredServices]
  )

  return (
    <Container>
      <Page.Body>
        {serviceListLoader ? (
          <PageSpinner />
        ) : (
          <Container className={css.tableBody}>
            <TableV2<K8SCustomService> columns={columns} data={discoveryServices} pagination={paginationProps} />
          </Container>
        )}
      </Page.Body>
    </Container>
  )
}
