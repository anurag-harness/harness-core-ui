/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import { MinimalLayout } from '@common/layouts'
import routes from '@common/RouteDefinitions'
import { RedirectToSubscriptionsFactory } from '@common/Redirects'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import { Module, ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ConnectorsPage from '@platform/connectors/pages/connectors/ConnectorsPage'
import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateListing from '@delegates/pages/delegates/DelegateListing'
import AccessControlPage from '@rbac/pages/AccessControl/AccessControlPage'
import UsersPage from '@rbac/pages/Users/UsersPage'
import SettingsList from '@default-settings/pages/SettingsList'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import { useQueryParams } from '@common/hooks'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String as LocaleString } from 'framework/strings'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import { CETMonitoredServices } from './pages/CETMonitoredServices'
import SideNav from './components/SideNav/SideNav'
import CETHomePage from './pages/CETHomePage'
import CETTrialPage from './pages/trialPage/CETTrialPage'
import { CETEventsSummary } from './pages/events-summary/CETEventsSummary'
import { CETAgents } from './pages/CET-agent-control/CET-agents/CETAgents'
import CETSettings from './pages/CET-agent-control/CETSettings'

AuditTrailFactory.registerResourceHandler('CET_AGENT_TOKEN', {
  moduleIcon: {
    name: 'cet'
  },
  moduleLabel: 'common.purpose.cet.continuous',
  resourceLabel: 'common.purpose.cet.agentToken',
  resourceUrl: (_resource_: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    const url = routes.toCETAgentsTokens({
      orgIdentifier: orgIdentifier || '',
      accountId: accountIdentifier,
      projectIdentifier: projectIdentifier || ''
    })
    return url
  }
})

AuditTrailFactory.registerResourceHandler('CET_CRITICAL_EVENT', {
  moduleIcon: {
    name: 'cet'
  },
  moduleLabel: 'common.purpose.cet.continuous',
  resourceLabel: 'common.purpose.cet.criticalEvent',
  resourceUrl: (_resource_: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    const url = routes.toCETCriticalEvents({
      orgIdentifier: orgIdentifier || '',
      accountId: accountIdentifier,
      projectIdentifier: projectIdentifier || ''
    })
    return url
  }
})

export const CETSideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'Continuous',
  title: 'Error Tracking',
  icon: 'cet'
}

export const etModuleParams: ModulePathParams = {
  module: ':module(cet)'
}

const RedirectToCETControl = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject && selectedProject?.modules?.includes(ModuleName.CET)) {
    return (
      <Redirect
        to={routes.toCETAgents({
          accountId: params.accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toCETHome(params)} />
  }
}

const RedirectToCETProject = (): React.ReactElement => {
  const params = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject) {
    return (
      <Redirect
        to={routes.toCETEventsSummary({
          accountId: params.accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toCETHome(params)} />
  }
}

export const RedirectToCETEventSummaryDetail = (): React.ReactElement => {
  const params = useParams<ProjectPathProps & { identifier: string }>()
  const query = useQueryParams<any>()
  return (
    <Redirect
      to={routes.toCETEventsSummaryDetail({
        accountId: params.accountId,
        orgIdentifier: params.orgIdentifier || '',
        projectIdentifier: params.projectIdentifier,
        ...query
      })}
    />
  )
}

const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return <Redirect to={routes.toCETHomeTrial({ accountId })} />
}

export const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CET_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.CET)
}

const ETRoutes: FC = () => {
  //RBAC
  RbacFactory.registerResourceCategory(ResourceCategory.CET, {
    icon: 'cet',
    label: 'common.purpose.cet.continuous'
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.CET_AGENT, {
    icon: 'cet',
    label: 'common.agents',
    labelSingular: 'common.agents',
    category: ResourceCategory.CET,

    permissionLabels: {
      [PermissionIdentifier.CET_AGENTS_VIEW]: <LocaleString stringID="rbac.permissionLabels.view" />
    }
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.CET_TOKEN, {
    icon: 'cet',
    label: 'common.tokens',
    labelSingular: 'common.tokens',
    category: ResourceCategory.CET,

    permissionLabels: {
      [PermissionIdentifier.CET_TOKEN_VIEW]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.CET_TOKEN_CREATE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.CET_TOKEN_REVOKE]: <LocaleString stringID="platform.delegates.tokens.revoke" />
    }
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.CET_CRITICAL_EVENT, {
    icon: 'cet',
    label: 'cv.codeErrors.criticalEvents',
    labelSingular: 'cv.codeErrors.criticalEvents',
    category: ResourceCategory.CET,

    permissionLabels: {
      [PermissionIdentifier.CET_CRITICALEVENT_VIEW]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.CET_CRITICALEVENT_CREATE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.CET_CRITICALEVENT_DELETE]: <LocaleString stringID="delete" />
    }
  })

  return (
    <>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        path={routes.toCET({ ...accountPathProps })}
        exact
        pageName={PAGE_NAME.CETHomePage}
      >
        <RedirectToCETProject />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CETSideNavProps}
        path={routes.toCETHome({ ...projectPathProps })}
        exact
        pageName={PAGE_NAME.CETHomePage}
      >
        <CETHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        layout={MinimalLayout}
        path={routes.toModuleTrialHome({ ...accountPathProps, module: ModuleName.CET.toLowerCase() as Module })}
        exact
        pageName={PAGE_NAME.CETTrialPage}
      >
        <CETTrialPage />
      </RouteWithLayout>

      <RouteWithLayout
        layout={MinimalLayout}
        path={routes.toCETHomeTrial({ ...accountPathProps })}
        exact
        pageName={PAGE_NAME.CETTrialPage}
      >
        <CETTrialPage />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CETSideNavProps}
        path={routes.toCETEventsSummary({ ...accountPathProps, ...projectPathProps, ...etModuleParams })}
      >
        <CETEventsSummary />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CETSideNavProps}
        path={routes.toCETEventSummaryOldNotifLink({ ...accountPathProps, ...projectPathProps, ...etModuleParams })}
      >
        <RedirectToCETProject />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETSettings({ ...accountPathProps, ...projectPathProps, ...etModuleParams })]}
      >
        <RedirectToCETControl />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETAgents({ ...accountPathProps, ...projectPathProps, ...etModuleParams })]}
      >
        <CETSettings>
          <CETAgents pathComponentLocation="/agents" />
        </CETSettings>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETAgentsTokens({ ...accountPathProps, ...projectPathProps, ...etModuleParams })]}
      >
        <CETSettings>
          <CETAgents pathComponentLocation="/tokens" />
        </CETSettings>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETConnectors({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <ConnectorsPage />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETSecrets({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <SecretsPage />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETAccessControl({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <AccessControlPage>
          <UsersPage />
        </AccessControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETDelegates({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <DelegatesPage>
          <DelegateListing />
        </DelegatesPage>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETDefaultSettings({ ...accountPathProps, ...projectPathProps, ...orgPathProps })]}
      >
        <SettingsList />
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        exact
        sidebarProps={CETSideNavProps}
        path={[routes.toCETCriticalEvents({ ...accountPathProps, ...projectPathProps, ...etModuleParams })]}
      >
        <CETSettings>
          <CETAgents pathComponentLocation="/criticalevents" />
        </CETSettings>
      </RouteWithLayout>

      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={CETSideNavProps}
        path={routes.toCETMonitoredServices({ ...accountPathProps, ...projectPathProps, ...orgPathProps })}
      >
        <CETMonitoredServices />
      </RouteWithLayout>

      {
        GovernanceRouteDestinations({
          sidebarProps: CETSideNavProps,
          pathProps: { ...accountPathProps, ...projectPathProps, ...etModuleParams }
        })?.props.children
      }
    </>
  )
}

export default ETRoutes
