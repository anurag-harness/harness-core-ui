/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, PageSpinner, Text } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import React from 'react'
import { useStrings } from 'framework/strings'
import { useGetServiceForDiscoveredService, useGetDiscoveredService } from 'services/servicediscovery'
import { DiscoveryPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ListItems from './ListItems'
import css from './ServiceDetails.module.scss'

interface OverviewProps {
  infraId: string
  serviceId: string
}

export default function Overview({ infraId, serviceId }: OverviewProps): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & DiscoveryPathProps>()
  const { getString } = useStrings()
  const { data: serviceData, loading: getServiceLoading } = useGetServiceForDiscoveredService({
    agentIdentity: infraId,
    dsvc_id: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const { data: serviceWorkloadData, loading: getServiceWorkloadLoading } = useGetDiscoveredService({
    agentIdentity: infraId,
    dsvc_id: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })
  const workloads = serviceWorkloadData?.spec.kubernetes?.workloads

  let totalReplicas = 0
  workloads?.forEach(workload => {
    totalReplicas += workload.replicas ? workload.replicas.length : 0
  })

  return (
    <Layout.Horizontal spacing="medium" flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      {(getServiceLoading || getServiceWorkloadLoading) && <PageSpinner />}

      {serviceData && (
        <Layout.Vertical style={{ width: '48%' }}>
          <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
            {getString('common.serviceDetails')}
          </Text>

          <Layout.Vertical background={Color.WHITE} spacing="medium" className={css.serviceDetails}>
            <ListItems
              title={getString('common.namespace')}
              content={
                <Text icon={'kubernetes-harness'} color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.namespace}
                </Text>
              }
            />
            <Divider />
            <ListItems
              title={getString('discovery.serviceDrawer.ipFamily')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.spec?.ipFamilies?.map(ipFamily => ipFamily).join(', ')}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <ListItems
              title={'IP Address'}
              content={
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.spec?.clusterIPs?.map(clusterIP => clusterIP).join(', ')}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            <ListItems
              title={getString('common.smtp.port')}
              content={
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.spec?.ports?.map(ports => ports.port).join(', ')}
                </Text>
              }
              padding={{ top: 'medium' }}
            />

            <ListItems
              title={'Target Port'}
              content={
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.spec?.ports?.map(ports => ports.targetPort).join(', ')}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            {serviceData?.spec?.selector ? (
              <ListItems
                title={getString('discovery.serviceDrawer.selector')}
                content={
                  <>
                    <Layout.Vertical width={'60%'}>
                      {Object.entries(serviceData?.spec?.selector).map(([key, value]) => {
                        return (
                          <Text
                            color={Color.GREY_700}
                            font={{ variation: FontVariation.BODY2 }}
                            lineClamp={1}
                            key={key}
                          >
                            {key}:{value}
                          </Text>
                        )
                      })}
                    </Layout.Vertical>
                  </>
                }
                padding={{ top: 'medium' }}
              />
            ) : (
              <></>
            )}
          </Layout.Vertical>
        </Layout.Vertical>
      )}
      {serviceWorkloadData && (
        <Layout.Vertical style={{ width: '48%' }}>
          <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
            {getString('discovery.serviceDrawer.workloads')}
          </Text>

          <Layout.Vertical
            spacing="medium"
            background={Color.WHITE}
            style={{
              boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
              padding: '36px',
              borderRadius: '4px'
            }}
          >
            <ListItems
              title={getString('name')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {workloads?.[0]?.identity?.name ?? ''}
                </Text>
              }
            />
            <ListItems
              title={getString('common.namespace')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {workloads?.[0]?.identity?.namespace ?? ''}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            <ListItems
              title={getString('kind')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {workloads?.[0]?.identity?.kind ?? ''}
                </Text>
              }
            />
            <ListItems
              title={getString('platform.delegates.commandLineCreation.replicas')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {totalReplicas}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            {workloads?.[0]?.podLabels ? (
              <>
                <ListItems
                  title={getString('pipelineSteps.labelsLabel')}
                  content={
                    <Layout.Vertical width={'60%'}>
                      {Object.entries(workloads[0].podLabels).map(([key, value]) => {
                        return (
                          <Text
                            color={Color.GREY_700}
                            font={{ variation: FontVariation.BODY2 }}
                            lineClamp={1}
                            key={key}
                          >
                            {key}:{value}
                          </Text>
                        )
                      })}
                    </Layout.Vertical>
                  }
                  padding={{ top: 'medium' }}
                />
                <Divider />
              </>
            ) : (
              <></>
            )}
            {workloads?.[0]?.podAnnotations ? (
              <ListItems
                title={getString('common.annotations')}
                content={
                  <Layout.Vertical width={'60%'}>
                    {Object.entries(workloads[0].podAnnotations).map(([key, value]) => {
                      return (
                        <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }} lineClamp={1} key={key}>
                          {key}:{value}
                        </Text>
                      )
                    })}
                  </Layout.Vertical>
                }
                padding={{ top: 'medium' }}
              />
            ) : (
              <></>
            )}
          </Layout.Vertical>
        </Layout.Vertical>
      )}
    </Layout.Horizontal>
  )
}
