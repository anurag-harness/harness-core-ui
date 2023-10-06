/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { RouteWithLayout } from '@common/router'
import routesV1 from '@common/RouteDefinitions'
import routesV2 from '@common/RouteDefinitionsV2'
import {
  accountPathProps,
  rolePathProps,
  resourceGroupPathProps,
  userGroupPathProps,
  userPathProps,
  serviceAccountProps,
  projectPathProps
} from '@common/utils/routeUtils'

import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import UserGroups from '@rbac/pages/UserGroups/UserGroups'
import Roles from '@rbac/pages/Roles/Roles'
import ResourceGroups from '@rbac/pages/ResourceGroups/ResourceGroups'
import { String } from 'framework/strings'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import UserGroupDetails from '@rbac/pages/UserGroupDetails/UserGroupDetails'
import ResourceGroupDetails from '@rbac/pages/ResourceGroupDetails/ResourceGroupDetails'
import RbacFactory from '@rbac/factories/RbacFactory'
import type {
  AccountPathProps,
  Module,
  ModulePathParams,
  PipelineType,
  ProjectPathProps
} from '@common/interfaces/RouteInterfaces'
import UserDetails from '@rbac/pages/UserDetails/UserDetails'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { AccountSideNavProps } from '@common/RouteDestinations'
import ServiceAccountsPage from '@rbac/pages/ServiceAccounts/ServiceAccounts'
import ServiceAccountDetails from '@rbac/pages/ServiceAccountDetails/ServiceAccountDetails'
import ResourceGroupsResourceModalBody from '@rbac/components/ResourceGroupsRenderer/ResourceGroupsResourceModalBody'
import ResourceGroupsResourceRenderer from '@rbac/components/ResourceGroupsRenderer/ResourceGroupsResourceRenderer'
import UserGroupsResourceModalBody from '@rbac/components/UserGroupsRenderer/UserGroupsResourceModalBody'
import UserGroupsResourceRenderer from '@rbac/components/UserGroupsRenderer/UserGroupsResourceRenderer'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { AuditEventData, ResourceDTO } from 'services/audit'
import { MinimalLayout } from '@common/layouts'
import ServiceAccountsResourceModalBody from './components/ServiceAccountsRenderer/ServiceAccountsResourceModalBody'
import ServiceAccountsResourceRenderer from './components/ServiceAccountsRenderer/ServiceAccountsResourceRenderer'

RbacFactory.registerResourceCategory(ResourceCategory.SHARED_RESOURCES, {
  icon: 'support-tour',
  label: 'rbac.categoryLabels.sharedResources'
})

RbacFactory.registerResourceCategory(ResourceCategory.ADMINSTRATIVE_FUNCTIONS, {
  icon: 'support-account',
  label: 'adminFunctions'
})

RbacFactory.registerResourceTypeHandler(ResourceType.USER, {
  icon: 'res-users',
  label: 'users',
  labelSingular: 'common.userLabel',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_USER]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.MANAGE_USER]: <String stringID="rbac.permissionLabels.manage" />,
    [PermissionIdentifier.INVITE_USER]: <String stringID="rbac.permissionLabels.invite" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.USERGROUP, {
  icon: 'res-userGroups',
  label: 'common.userGroups',
  labelSingular: 'common.userGroup',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_USERGROUP]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.MANAGE_USERGROUP]: <String stringID="rbac.permissionLabels.manage" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <UserGroupsResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <UserGroupsResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.RESOURCEGROUP, {
  icon: 'res-resourceGroups',
  label: 'resourceGroups',
  labelSingular: 'common.resourceGroupLabel',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_RESOURCEGROUP]: <String stringID="rbac.permissionLabels.delete" />
  },
  addResourceModalBody: props => <ResourceGroupsResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <ResourceGroupsResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.ROLE, {
  icon: 'res-roles',
  label: 'roles',
  labelSingular: 'common.role',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_ROLE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_ROLE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_ROLE]: <String stringID="rbac.permissionLabels.delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.AUTHSETTING, {
  icon: 'nav-settings',
  label: 'platform.authSettings.authenticationSettings',
  labelSingular: 'common.singularLabels.authenticationSetting',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_AUTHSETTING]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_AUTHSETTING]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_AUTHSETTING]: <String stringID="rbac.permissionLabels.delete" />
  }
})

const platformLabel = 'common.resourceCenter.ticketmenu.platform'
RbacFactory.registerResourceCategory(ResourceCategory.SEI, {
  icon: 'sei-main',
  label: 'common.purpose.sei.fullName'
})

AuditTrailFactory.registerResourceHandler('USER_GROUP', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'common.userGroup',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    const routes = isNewNav ? routesV2 : routesV1
    return routes.toUserGroupDetails({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier,
      userGroupIdentifier: resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('USER', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'common.userLabel',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    const routes = isNewNav ? routesV2 : routesV1

    const userId = resource.labels?.userId
    if (userId) {
      return routes.toUserDetails({
        orgIdentifier,
        accountId: accountIdentifier,
        projectIdentifier,
        userIdentifier: resource.labels?.userId || resource.identifier
      })
    }
    return undefined
  }
})

AuditTrailFactory.registerResourceHandler('ROLE', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'common.role',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    const routes = isNewNav ? routesV2 : routesV1

    return routes.toRoleDetails({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier,
      roleIdentifier: resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('SERVICE_ACCOUNT', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'serviceAccount',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    const routes = isNewNav ? routesV2 : routesV1

    return routes.toServiceAccountDetails({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier,
      serviceAccountIdentifier: resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('RESOURCE_GROUP', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'common.resourceGroupLabel',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    const routes = isNewNav ? routesV2 : routesV1

    return routes.toResourceGroupDetails({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier,
      resourceGroupIdentifier: resource.identifier
    })
  }
})

const RedirectToAccessControlHome = (): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  return <Redirect to={routesV1.toUsers({ accountId })} />
}

export default function RbacRoutes(): React.ReactElement {
  RbacFactory.registerResourceTypeHandler(ResourceType.SERVICEACCOUNT, {
    icon: 'nav-settings',
    label: 'rbac.serviceAccounts.label',
    labelSingular: 'serviceAccount',
    category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
    permissionLabels: {
      [PermissionIdentifier.VIEW_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.EDIT_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.DELETE_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.delete" />,
      [PermissionIdentifier.MANAGE_SERVICEACCOUNT]: <String stringID="rbac.permissionLabels.manage" />
    },

    // eslint-disable-next-line react/display-name
    addResourceModalBody: props => <ServiceAccountsResourceModalBody {...props} />,
    // eslint-disable-next-line react/display-name
    staticResourceRenderer: props => <ServiceAccountsResourceRenderer {...props} />
  })
  return (
    <>
      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routesV1.toAccessControl({ ...accountPathProps })}
        exact
      >
        <RedirectToAccessControlHome />
      </RouteWithLayout>

      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routesV1.toServiceAccounts({ ...accountPathProps })}
        exact
      >
        <AccessControlPage>
          <ServiceAccountsPage />
        </AccessControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routesV1.toServiceAccountDetails({ ...accountPathProps, ...serviceAccountProps })}
        exact
      >
        <ServiceAccountDetails />
      </RouteWithLayout>

      <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toUsers({ ...accountPathProps })} exact>
        <AccessControlPage>
          <UsersPage />
        </AccessControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routesV1.toUserDetails({ ...accountPathProps, ...userPathProps })}
        exact
      >
        <UserDetails />
      </RouteWithLayout>

      <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toUserGroups({ ...accountPathProps })} exact>
        <AccessControlPage>
          <UserGroups />
        </AccessControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routesV1.toUserGroupDetails({ ...accountPathProps, ...userGroupPathProps })}
        exact
      >
        <UserGroupDetails />
      </RouteWithLayout>

      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routesV1.toResourceGroups({ ...accountPathProps })}
        exact
      >
        <AccessControlPage>
          <ResourceGroups />
        </AccessControlPage>
      </RouteWithLayout>

      <RouteWithLayout sidebarProps={AccountSideNavProps} path={routesV1.toRoles({ ...accountPathProps })} exact>
        <AccessControlPage>
          <Roles />
        </AccessControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routesV1.toRoleDetails({ ...accountPathProps, ...rolePathProps })}
        exact
      >
        <RoleDetails />
      </RouteWithLayout>
      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routesV1.toResourceGroupDetails({ ...accountPathProps, ...resourceGroupPathProps })}
        exact
      >
        <ResourceGroupDetails />
      </RouteWithLayout>
    </>
  )
}

const RedirectToModuleAccessControlHome = (): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()

  return <Redirect to={routesV1.toUsers({ accountId, projectIdentifier, orgIdentifier, module })} />
}

export const AccessControlRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
  layout?: React.ComponentType
}> = ({ moduleParams, licenseRedirectData, sidebarProps, layout: Layout = MinimalLayout }) => (
  <>
    <RouteWithLayout
      layout={Layout}
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={[routesV1.toAccessControl({ ...projectPathProps, ...moduleParams })]}
      exact
    >
      <RedirectToModuleAccessControlHome />
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={[routesV1.toUsers({ ...projectPathProps, ...moduleParams })]}
      exact
      pageName={PAGE_NAME.UsersPage}
    >
      <AccessControlPage>
        <UsersPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toUserDetails({ ...projectPathProps, ...moduleParams, ...userPathProps })}
      pageName={PAGE_NAME.UserDetails}
    >
      <UserDetails />
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={[routesV1.toUserGroups({ ...projectPathProps, ...moduleParams })]}
      pageName={PAGE_NAME.UserGroups}
    >
      <AccessControlPage>
        <UserGroups />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toUserGroupDetails({ ...projectPathProps, ...moduleParams, ...userGroupPathProps })}
      pageName={PAGE_NAME.UserGroupDetails}
    >
      <UserGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toServiceAccounts({ ...projectPathProps, ...moduleParams })}
      pageName={PAGE_NAME.ServiceAccountsPage}
    >
      <AccessControlPage>
        <ServiceAccountsPage />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toServiceAccountDetails({ ...projectPathProps, ...moduleParams, ...serviceAccountProps })}
      pageName={PAGE_NAME.ServiceAccountDetails}
    >
      <ServiceAccountDetails />
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={[routesV1.toResourceGroups({ ...projectPathProps, ...moduleParams })]}
      pageName={PAGE_NAME.ResourceGroups}
    >
      <AccessControlPage>
        <ResourceGroups />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={[routesV1.toRoles({ ...projectPathProps, ...moduleParams })]}
      pageName={PAGE_NAME.Roles}
    >
      <AccessControlPage>
        <Roles />
      </AccessControlPage>
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={[routesV1.toRoleDetails({ ...projectPathProps, ...moduleParams, ...rolePathProps })]}
      pageName={PAGE_NAME.RoleDetails}
    >
      <RoleDetails />
    </RouteWithLayout>
    <RouteWithLayout
      layout={Layout}
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={[routesV1.toResourceGroupDetails({ ...projectPathProps, ...moduleParams, ...resourceGroupPathProps })]}
      pageName={PAGE_NAME.ResourceGroupDetails}
    >
      <ResourceGroupDetails />
    </RouteWithLayout>
  </>
)
