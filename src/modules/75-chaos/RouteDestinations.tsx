/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { OverviewChartsWithToggle } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { String as LocaleString } from 'framework/strings'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { ConnectorReferenceField } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { SecretRouteDestinations } from '@secrets/RouteDestinations'
import PipelineStudioFactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import ExecFactory from '@pipeline/factories/ExecutionFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import ChaosEnvironments from '@chaos/pages/environments/EnvironmentsPage'
import { MinimalLayout } from '@common/layouts'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { RedirectToSubscriptionsFactory } from '@common/Redirects'
import { Duration } from '@common/exports'
import SchedulePanel from '@common/components/SchedulePanel/SchedulePanel'
import { UserGroupsInput } from '@rbac/components/UserGroupsInput/UserGroupsInput'
import { ScheduleFreezeForm } from '@freeze-windows/components/ScheduleFreezeForm/ScheduleFreezeForm'
import { DiscoveryRouteDestinations } from '@discovery/RouteDestinations'
import { VariableRouteDestinations } from '@variables/RouteDestinations'
import { DelegateRouteDestinations } from '@delegates/RouteDestinations'
import { ConnectorRouteDestinations } from '@platform/connectors/RouteDestinations'
import { DefaultSettingsRouteDestinations } from '@default-settings/RouteDestinations'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ChaosHomePage from './pages/home/ChaosHomePage'
import type { ChaosCustomMicroFrontendProps } from './interfaces/Chaos.types'
import ChaosSideNav from './components/ChaosSideNav/ChaosSideNav'
import ChaosTrialHomePage from './pages/home/ChaosTrialHomePage'
import { ChaosExperimentStep } from './components/PipelineSteps/ChaosExperimentStep/ChaosExperimentStep'
import ChaosExperimentExecView from './components/PipelineSteps/ChaosExperimentExecutionView/ChaosExperimentExecView'

// eslint-disable-next-line import/no-unresolved
const ChaosMicroFrontend = React.lazy(() => import('chaos/MicroFrontendApp'))

export const ChaosSideNavProps: SidebarContext = {
  navComponent: ChaosSideNav,
  subtitle: 'Chaos',
  title: 'Engineering',
  icon: 'chaos-main'
}

const chaosModuleParams: ModulePathParams = {
  module: ':module(chaos)'
}
const module = 'chaos'

// Pipeline step registration
ExecFactory.registerStepDetails(StepType.ChaosExperiment, {
  component: React.memo(ChaosExperimentExecView)
})

// AuditTrail registrations
AuditTrailFactory.registerResourceHandler('CHAOS_HUB', {
  moduleIcon: {
    name: 'chaos-main'
  },
  moduleLabel: 'chaos.chaosHub',
  resourceLabel: 'chaos.chaosHub',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

    return routes.toChaosHub({
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      identifier: resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('CHAOS_EXPERIMENT', {
  moduleIcon: {
    name: 'chaos-main'
  },
  moduleLabel: 'chaos.chaosExperiment',
  resourceLabel: 'chaos.chaosExperiment',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

    return routes.toChaosExperiment({
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      identifier: resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('CHAOS_INFRASTRUCTURE', {
  moduleIcon: {
    name: 'chaos-main'
  },
  moduleLabel: 'chaos.chaosInfrastructure',
  resourceLabel: 'chaos.chaosInfrastructure',
  resourceUrl: (_: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

    return routes.toChaosEnvironments({
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('CHAOS_GAMEDAY', {
  moduleIcon: {
    name: 'chaos-main'
  },
  moduleLabel: 'chaos.chaosGameday',
  resourceLabel: 'chaos.chaosGameday',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

    return routes.toChaosGameDay({
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      identifier: resource.identifier
    })
  }
})

AuditTrailFactory.registerResourceHandler('CHAOS_SECURITY_GOVERNANCE', {
  moduleIcon: {
    name: 'chaos-main'
  },
  moduleLabel: 'chaos.chaosGuardRule',
  resourceLabel: 'chaos.chaosGuardRule',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

    return routes.toSecurityGovernanceRuleDetails({
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      identifier: resource.identifier
    })
  }
})

// if project is selected redirects to project dashboard, else to module homepage
const RedirectToChaosProject = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()
  if (selectedProject) {
    return (
      <Redirect
        to={routes.toProjectOverview({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier,
          module
        })}
      />
    )
  } else {
    return <Redirect to={routes.toModuleHome({ accountId, module })} />
  }
}

// redirect to trial page, to be used by license redirect
const RedirectToModuleTrialHome = (): React.ReactElement => {
  const { accountId } = useParams<{
    accountId: string
  }>()

  return (
    <Redirect
      to={routes.toModuleTrialHome({
        accountId,
        module: 'chaos'
      })}
    />
  )
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CHAOS_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHome,
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.CHAOS)
}

export default function ChaosRoutes(): React.ReactElement {
  // feature flags to control RBAC registrations
  const { CHAOS_SECURITY_GOVERNANCE, PL_DISCOVERY_ENABLE, CHAOS_NEW_ENVIRONMENTS_PAGE } = useFeatureFlags()

  // Pipeline registrations
  PipelineStudioFactory.registerStep(new ChaosExperimentStep())

  // RBAC registrations
  RbacFactory.registerResourceCategory(ResourceCategory.CHAOS, {
    icon: 'chaos-main',
    label: 'common.purpose.chaos.chaos'
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_HUB, {
    icon: 'chaos-main',
    label: 'chaos.chaosHub',
    category: ResourceCategory.CHAOS,
    permissionLabels: {
      [PermissionIdentifier.VIEW_CHAOS_HUB]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.EDIT_CHAOS_HUB]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.DELETE_CHAOS_HUB]: <LocaleString stringID="rbac.permissionLabels.delete" />
    }
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_EXPERIMENT, {
    icon: 'chaos-main',
    label: 'chaos.chaosExperiment',
    category: ResourceCategory.CHAOS,
    permissionLabels: {
      [PermissionIdentifier.VIEW_CHAOS_EXPERIMENT]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.EDIT_CHAOS_EXPERIMENT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.DELETE_CHAOS_EXPERIMENT]: <LocaleString stringID="rbac.permissionLabels.delete" />,
      [PermissionIdentifier.EXECUTE_CHAOS_EXPERIMENT]: <LocaleString stringID="rbac.permissionLabels.execute" />
    }
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_INFRASTRUCTURE, {
    icon: 'chaos-main',
    label: 'chaos.chaosInfrastructure',
    category: ResourceCategory.CHAOS,
    permissionLabels: {
      [PermissionIdentifier.VIEW_CHAOS_INFRASTRUCTURE]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.EDIT_CHAOS_INFRASTRUCTURE]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.DELETE_CHAOS_INFRASTRUCTURE]: <LocaleString stringID="rbac.permissionLabels.delete" />
    }
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_GAMEDAY, {
    icon: 'chaos-main',
    label: 'chaos.chaosGameday',
    category: ResourceCategory.CHAOS,
    permissionLabels: {
      [PermissionIdentifier.VIEW_CHAOS_GAMEDAY]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.EDIT_CHAOS_GAMEDAY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.DELETE_CHAOS_GAMEDAY]: <LocaleString stringID="rbac.permissionLabels.delete" />
    }
  })

  if (CHAOS_SECURITY_GOVERNANCE)
    RbacFactory.registerResourceTypeHandler(ResourceType.CHAOS_SECURITY_GOVERNANCE, {
      icon: 'chaos-main',
      label: 'chaos.chaosGuardRule',
      category: ResourceCategory.CHAOS,
      permissionLabels: {
        [PermissionIdentifier.VIEW_CHAOS_SECURITY_GOVERNANCE]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_CHAOS_SECURITY_GOVERNANCE]: (
          <LocaleString stringID="rbac.permissionLabels.createEdit" />
        ),
        [PermissionIdentifier.DELETE_CHAOS_SECURITY_GOVERNANCE]: (
          <LocaleString stringID="rbac.permissionLabels.delete" />
        )
      }
    })

  return (
    <>
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={ChaosSideNavProps}
        path={routes.toChaos({ ...accountPathProps })}
        exact
      >
        <RedirectToChaosProject />
      </RouteWithLayout>

      {/* Chaos Routes */}
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={ChaosSideNavProps}
        path={routes.toModuleHome({ ...accountPathProps, ...chaosModuleParams })}
        exact
        pageName={PAGE_NAME.ChaosHomePage}
      >
        <ChaosHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        layout={MinimalLayout}
        path={routes.toModuleTrialHome({ ...accountPathProps, module: 'chaos' })}
        exact
        pageName={PAGE_NAME.ChaosTrialHomePage}
      >
        <ChaosTrialHomePage />
      </RouteWithLayout>

      {/* new environment page now resides in mfe so this route would no longer be required and removed later */}
      {!CHAOS_NEW_ENVIRONMENTS_PAGE && (
        <RouteWithLayout
          licenseRedirectData={licenseRedirectData}
          exact
          sidebarProps={ChaosSideNavProps}
          path={routes.toChaosEnvironments({ ...projectPathProps, ...chaosModuleParams })}
          pageName={PAGE_NAME.Environments}
        >
          <ChaosEnvironments />
        </RouteWithLayout>
      )}

      {/* Common platform routes */}
      {PL_DISCOVERY_ENABLE &&
        DiscoveryRouteDestinations({
          moduleParams: chaosModuleParams,
          sidebarProps: ChaosSideNavProps
        })?.props.children}

      {
        SecretRouteDestinations({
          moduleParams: chaosModuleParams,
          sidebarProps: ChaosSideNavProps
        })?.props.children
      }

      {
        VariableRouteDestinations({
          moduleParams: chaosModuleParams,
          sidebarProps: ChaosSideNavProps
        })?.props.children
      }

      {
        DelegateRouteDestinations({
          moduleParams: chaosModuleParams,
          sidebarProps: ChaosSideNavProps
        })?.props.children
      }

      {
        ConnectorRouteDestinations({
          moduleParams: chaosModuleParams,
          sidebarProps: ChaosSideNavProps
        })?.props.children
      }

      {
        DefaultSettingsRouteDestinations({
          moduleParams: chaosModuleParams,
          sidebarProps: ChaosSideNavProps
        })?.props.children
      }

      {
        AccessControlRouteDestinations({
          moduleParams: chaosModuleParams,
          sidebarProps: ChaosSideNavProps
        })?.props.children
      }

      {
        GovernanceRouteDestinations({
          sidebarProps: ChaosSideNavProps,
          pathProps: { ...accountPathProps, ...projectPathProps, ...chaosModuleParams }
        })?.props.children
      }

      {/* Loads the Chaos MicroFrontend */}
      <RouteWithLayout
        licenseRedirectData={licenseRedirectData}
        sidebarProps={ChaosSideNavProps}
        path={routes.toChaosMicroFrontend({ ...projectPathProps })}
      >
        <ChildAppMounter<ChaosCustomMicroFrontendProps>
          ChildApp={ChaosMicroFrontend}
          customComponents={{
            ConnectorReferenceField,
            OverviewChartsWithToggle,
            Duration,
            NavigationCheck,
            SchedulePanel,
            UserGroupsInput,
            ScheduleFreezeForm
          }}
        />
      </RouteWithLayout>
    </>
  )
}
