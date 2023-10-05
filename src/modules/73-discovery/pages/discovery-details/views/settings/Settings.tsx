/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Layout, PageSpinner, Text, Toggle } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import React, { useEffect } from 'react'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import { useGetAgent } from 'services/servicediscovery'
import type { DiscoveryPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getConnectorPromise, ResponseConnectorResponse } from 'services/cd-ng'
import { DiscoveryAgentStatus } from '@discovery/components/DelegateAgentStatus/DelegateAgentStatus'
import TagCount from '@discovery/components/TagCount/TagCount'
import ListItems from './ListItems'
import { RenderConnectorStatus } from './ConnectorStatus'

const Settings: React.FC = () => {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & DiscoveryPathProps>()
  const { getString } = useStrings()
  const { data: dAgentData, loading: dAgentDataLoading } = useGetAgent({
    agentIdentity: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const [connectorDetails, setConnectorDetails] = React.useState<ResponseConnectorResponse>()

  const fetchConnectorDetails = async (connectorID: string): Promise<void> => {
    const connectorResult = await getConnectorPromise({
      identifier: connectorID,
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: orgIdentifier,
        projectIdentifier: projectIdentifier
      }
    })
    if (connectorResult.data) {
      setConnectorDetails(connectorResult)
    }
  }

  useEffect(() => {
    if (dAgentData) fetchConnectorDetails(dAgentData?.k8sConnector?.id ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dAgentData])

  const updateTime = (time?: string): string => {
    return time ? moment(time).format('MMM DD, hh:mm A') : getString('na')
  }

  return (
    <Container height={'100%'} width={'100%'}>
      {dAgentDataLoading ? (
        <PageSpinner />
      ) : (
        <Layout.Horizontal
          style={{ paddingLeft: '40px', paddingTop: '20px', paddingRight: '30px' }}
          spacing="medium"
          flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Layout.Vertical style={{ width: '48%' }}>
            <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
              {getString('discovery.discoveryDetails.settings.overviewTitle')}
            </Text>
            <Layout.Vertical
              background={Color.WHITE}
              spacing="medium"
              style={{
                boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                padding: '36px',
                borderRadius: '4px'
              }}
            >
              <Text font={{ variation: FontVariation.CARD_TITLE }}>
                {getString('discovery.discoveryDetails.settings.agentName')}
              </Text>
              <ListItems
                title={getString('name')}
                content={
                  <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY2 }}>
                    {dAgentData?.name}
                  </Text>
                }
                padding={{ top: 'medium' }}
              />
              <ListItems
                title={getString('description')}
                content={
                  <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY2 }}>
                    {dAgentData?.description}
                  </Text>
                }
                padding={{ top: 'medium' }}
              />
              <ListItems
                title={getString('discovery.discoveryDetails.lastDiscovery')}
                content={
                  <Layout.Horizontal flex={{ alignItems: 'center' }}>
                    <Text color={Color.GREY_900} padding={{ right: 'small' }} font={{ variation: FontVariation.BODY2 }}>
                      {updateTime(dAgentData?.installationDetails?.createdAt)} -{' '}
                    </Text>
                    <DiscoveryAgentStatus status={dAgentData?.installationDetails?.delegateTaskStatus} />
                  </Layout.Horizontal>
                }
                padding={{ top: 'medium' }}
              />
              <Divider />
              <Text font={{ variation: FontVariation.CARD_TITLE }}>
                {getString('platform.connectors.connectorDetails')}
              </Text>
              <ListItems
                title={getString('platform.connectors.name')}
                content={
                  <Text icon={'kubernetes-harness'} color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                    {connectorDetails?.data?.connector?.name}
                  </Text>
                }
                padding={{ top: 'medium' }}
              />
              <ListItems
                // eslint-disable-next-line strings-restrict-modules
                title={getString('ce.cloudIntegration.connectorStatus')}
                content={<RenderConnectorStatus status={connectorDetails?.data?.status?.status} />}
                padding={{ top: 'medium' }}
              />
            </Layout.Vertical>
          </Layout.Vertical>
          <Layout.Vertical style={{ width: '48%' }}>
            <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
              {getString('discovery.discoveryDetails.settings.discovertSettings')}
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
                title={getString('discovery.discoveryDetails.settings.detectNetwork')}
                content={<Toggle checked={dAgentData?.config?.data?.enableNodeAgent} />}
              />
              <Divider />
              {dAgentData?.config?.data?.blacklistedNamespaces && (
                <Container>
                  <ListItems
                    title={getString('discovery.blackListedNamespaces')}
                    content={
                      <TagCount
                        tagItems={dAgentData?.config?.data?.blacklistedNamespaces}
                        tagCount={2}
                        tooltipHeader={getString('discovery.blackListedNamespaces')}
                      />
                    }
                    padding={{ bottom: 'medium' }}
                  />
                  <Divider />
                </Container>
              )}
              <Layout.Vertical>
                <Text
                  icon="trash"
                  iconProps={{ color: Color.RED_500 }}
                  font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}
                  color={Color.RED_500}
                  padding={{ top: 'medium' }}
                  style={{ cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                >
                  {getString('discovery.discoveryDetails.settings.disable')}
                </Text>
                <Text padding={{ top: 'medium' }} color={Color.GREY_600} font={{ variation: FontVariation.BODY }}>
                  {getString('discovery.discoveryDetails.settings.disableDescription')}
                </Text>
              </Layout.Vertical>
            </Layout.Vertical>
          </Layout.Vertical>
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default Settings
