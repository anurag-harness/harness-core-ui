/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Module, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import { RouteWithLayout } from '@common/router'
import routesV1 from '@common/RouteDefinitions'
import routesV2 from '@common/RouteDefinitionsV2'
import { accountPathProps, connectorPathProps, projectPathProps } from '@common/utils/routeUtils'
import ConnectorsPage from '@platform/connectors/pages/connectors/ConnectorsPage'
import ConnectorDetailsPage from '@platform/connectors/pages/connectors/ConnectorDetailsPage/ConnectorDetailsPage'
import CreateConnectorFromYamlPage from '@platform/connectors/pages/createConnectorFromYaml/CreateConnectorFromYamlPage'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { String } from 'framework/strings'
import { AccountSideNavProps } from '@common/RouteDestinations'
import type { AuditEventData, ResourceDTO } from 'services/audit'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { SettingType } from '@common/constants/Utils'
import { DefaultSettingConnectorField } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import ConnectorResourceModalBody from './components/ConnectorResourceModalBody/ConnectorResourceModalBody'
import ConnectorAttributeModalBody from './components/ConnectorAttributeModalBody/ConnectorAttributeModalBody'
import ConnectorAttributeRenderer from './components/ConnectorAttributeRenderer/ConnectorAttributeRenderer'
import ConnectorResourceRenderer from './components/ConnectorResourceRenderer/ConnectorResourceRenderer'
import { Connectors } from './constants'

RbacFactory.registerResourceTypeHandler(ResourceType.CONNECTOR, {
  icon: 'res-connectors',
  label: 'connectorsLabel',
  labelSingular: 'connector',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_CONNECTOR]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_CONNECTOR]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_CONNECTOR]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.ACCESS_CONNECTOR]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <ConnectorResourceModalBody {...props} />,
  addAttributeModalBody: props => <ConnectorAttributeModalBody {...props} />,
  staticResourceRenderer: props => <ConnectorResourceRenderer {...props} />,
  attributeRenderer: props => <ConnectorAttributeRenderer {...props} />
})

const platformLabel = 'common.resourceCenter.ticketmenu.platform'
AuditTrailFactory.registerResourceHandler('CONNECTOR', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'connector',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    const routes = isNewNav ? routesV2 : routesV1

    return routes.toConnectorDetails({
      orgIdentifier,
      accountId: accountIdentifier,
      connectorId: resource.identifier,
      projectIdentifier
    })
  }
})

DefaultSettingsFactory.registerSettingHandler(SettingType.DEFAULT_CONNECTOR_FOR_GIT_EXPERIENCE, {
  label: 'platform.defaultSettings.defaultGitConnector',
  settingRenderer: props => (
    <DefaultSettingConnectorField
      {...props}
      type={[Connectors.GITHUB, Connectors.BITBUCKET, Connectors.AZURE_REPO, Connectors.GITLAB]}
    />
  ),
  settingCategory: 'GIT_EXPERIENCE'
})

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toConnectors({ ...accountPathProps })} exact>
      <ConnectorsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toConnectorDetails({ ...accountPathProps, ...connectorPathProps })}
      exact
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toCreateConnectorFromYaml({ ...accountPathProps })}
      exact
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
  </>
)

export const ConnectorRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => (
  <>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toConnectors({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
      pageName={PAGE_NAME.ConnectorsPage}
    >
      <ConnectorsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toCreateConnectorFromYaml({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
      pageName={PAGE_NAME.CreateConnectorFromYamlPage}
    >
      <CreateConnectorFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toConnectorDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...connectorPathProps,
        ...moduleParams
      })}
      pageName={PAGE_NAME.ConnectorDetailsPage}
    >
      <ConnectorDetailsPage />
    </RouteWithLayout>
  </>
)
