/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, useParams, Redirect } from 'react-router-dom'
import PipelineStudio from '@pipeline/components/PipelineStudio/PipelineStudio'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { RouteWithLayout } from '@common/router'
import { EmptyLayout, MinimalLayout } from '@common/layouts'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import {
  accountPathProps,
  projectPathProps,
  servicePathProps,
  environmentGroupPathProps,
  environmentPathProps,
  orgPathProps
} from '@common/utils/routeUtils'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import {
  RedirectToModuleTrialHomeFactory,
  RedirectToSubscriptionsFactory,
  RedirectToProjectFactory
} from '@common/Redirects'

import { String as LocaleString } from 'framework/strings'
import featureFactory, { RenderMessageReturn } from 'framework/featureStore/FeaturesFactory'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import CDSideNav from '@cd/components/CDSideNav/CDSideNav'
import CDHomePage from '@cd/pages/home/CDHomePage'
import CDDashboardPage from '@cd/pages/dashboard/CDDashboardPage'
import { ConnectorRouteDestinations } from '@platform/connectors/RouteDestinations'
import { FileStoreRouteDestinations } from '@filestore/RouteDestinations'
import { DelegateRouteDestinations } from '@delegates/RouteDestinations'
import { GitSyncRouteDestinations } from '@gitsync/RouteDestinations'
import { PipelineRouteDestinations } from '@pipeline/RouteDestinations'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { TemplateRouteDestinations } from '@templates-library/RouteDestinations'
import { FreezeWindowRouteDestinations } from '@freeze-windows/RouteDestinations'
import { TriggersRouteDestinations } from '@triggers/RouteDestinations'
import { VariableRouteDestinations } from '@variables/RouteDestinations'
import { SecretRouteDestinations } from '@secrets/RouteDestinations'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { Services } from '@cd/components/Services/Services'
import './components/Templates'
import './components/PipelineSteps'
import './components/PipelineStudio/DeployStage'
import executionFactory from '@pipeline/factories/ExecutionFactory'
import { StageType } from '@pipeline/utils/stageHelpers'
import RbacFactory from '@rbac/factories/RbacFactory'
import { TriggerFormType } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory/index'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import { TemplateStudio } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { useGetCommunity } from '@common/utils/utils'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { ModuleListCardProps } from '@projects-orgs/components/ModuleListCard/ModuleListCard'
import { FeatureFlag } from '@common/featureFlags'
import { DefaultSettingsRouteDestinations } from '@default-settings/RouteDestinations'
import { AccountSideNavProps, MainDashboardSideNavProps } from '@common/RouteDestinations'
import { ProjectDetailsSideNavProps } from '@projects-orgs/RouteDestinations'
import { PipelineDeploymentList } from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import { Environments } from './components/Environments/Environments'
import { Environments as EnvironmentsV2 } from './components/EnvironmentsV2/Environments'
import EnvironmentDetails from './components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetails'
import EnvironmentGroups from './components/EnvironmentGroups/EnvironmentGroups'
import EnvironmentGroupDetails from './components/EnvironmentGroups/EnvironmentGroupDetails/EnvironmentGroupDetails'
import ServiceOverrides from './components/ServiceOverrides/ServiceOverrides'

import CDTrialHomePage from './pages/home/CDTrialHomePage'

import { CDExecutionCardSummary } from './components/CDExecutionCardSummary/CDExecutionCardSummary'
import { CDExecutionSummary } from './components/CDExecutionSummary/CDExecutionSummary'
import { CDStageDetails } from './components/CDStageDetails/CDStageDetails'

import artifactSourceBaseFactory from './factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { KubernetesArtifacts } from './components/PipelineSteps/K8sServiceSpec/KubernetesArtifacts/KubernetesArtifacts'
import { KubernetesManifests } from './components/PipelineSteps/K8sServiceSpec/KubernetesManifests/KubernetesManifests'
import manifestSourceBaseFactory from './factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { getBannerText } from './utils/renderMessageUtils'
import ServiceStudio from './components/Services/ServiceStudio/ServiceStudio'
import CDOnboardingWizard from './pages/get-started-with-cd/CDOnboardingWizard'
import CDOnboardingWizardWithCLI from './pages/get-started-with-cd/CDOnboardingWizardWithCLI/CDOnboardingWizard'
import GetStartedWithCDV2 from './pages/get-started-with-cd/GetStartedWithCDv2'

RbacFactory.registerResourceCategory(ResourceCategory.GITOPS, {
  icon: 'gitops-blue-circle',
  label: 'cd.gitOps'
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_AGENT, {
  icon: 'gitops-agents-blue-circle',
  label: 'common.agents',
  labelSingular: 'common.agent',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_AGENT]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_AGENT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_AGENT]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_APP, {
  icon: 'gitops-applications-blue-circle',
  label: 'applications',
  labelSingular: 'common.application',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_APPLICATION]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_APPLICATION]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_APPLICATION]: <LocaleString stringID="delete" />,
    [PermissionIdentifier.SYNC_GITOPS_APPLICATION]: <LocaleString stringID="common.sync" />,
    [PermissionIdentifier.OVERRIDE_GITOPS_APPLICATION]: <LocaleString stringID="override" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_CERT, {
  icon: 'gitops-repository-certificates-blue-circle',
  label: 'common.repositoryCertificates',
  labelSingular: 'common.singularLabels.repositoryCertificate',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_CERT]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_CERT]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_CERT]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_CLUSTER, {
  icon: 'gitops-clusters-blue-circle',
  label: 'common.clusters',
  labelSingular: 'common.cluster',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_CLUSTER]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_CLUSTER]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_CLUSTER]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_GPGKEY, {
  icon: 'gitops-gnupg-key-blue-circle',
  label: 'common.gnupgKeys',
  labelSingular: 'common.singularLabels.gnupgKey',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_GPGKEY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_GPGKEY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_GPGKEY]: <LocaleString stringID="delete" />
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.GITOPS_REPOSITORY, {
  icon: 'gitops-repository-blue-circle',
  label: 'repositories',
  labelSingular: 'repository',
  category: ResourceCategory.GITOPS,
  permissionLabels: {
    [PermissionIdentifier.VIEW_GITOPS_REPOSITORY]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_GITOPS_REPOSITORY]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_GITOPS_REPOSITORY]: <LocaleString stringID="delete" />
  }
})

executionFactory.registerCardInfo(StageType.DEPLOY, {
  icon: 'cd-main',
  component: CDExecutionCardSummary
})

executionFactory.registerSummary(StageType.DEPLOY, {
  component: CDExecutionSummary
})

executionFactory.registerStageDetails(StageType.DEPLOY, {
  component: CDStageDetails
})

featureFactory.registerFeaturesByModule('cd', {
  features: [
    FeatureIdentifier.DEPLOYMENTS_PER_MONTH,
    FeatureIdentifier.SERVICES,
    FeatureIdentifier.INITIAL_DEPLOYMENTS
  ],
  renderMessage: (props, getString, additionalLicenseProps = {}): RenderMessageReturn => {
    const featuresMap = props.features
    const serviceFeatureDetail = featuresMap.get(FeatureIdentifier.SERVICES)
    const dpmFeatureDetail = featuresMap.get(FeatureIdentifier.DEPLOYMENTS_PER_MONTH)
    const initialDeploymentsFeatureDetail = featuresMap.get(FeatureIdentifier.INITIAL_DEPLOYMENTS)

    return getBannerText(
      getString,
      additionalLicenseProps,
      serviceFeatureDetail,
      dpmFeatureDetail,
      initialDeploymentsFeatureDetail
    )
  }
})

const RedirectToCDProject = RedirectToProjectFactory(ModuleName.CD, routes.toCDHome)

const CDDashboardPageOrRedirect = (): React.ReactElement => {
  const params = useParams<ProjectPathProps & ModuleListCardProps>()
  const { module } = params
  const { selectedProject } = useAppStore()
  const isCommunity = useGetCommunity()

  if (!isCommunity) {
    return <CDDashboardPage />
  } else if (
    selectedProject?.modules?.includes(ModuleName.CD) ||
    (module && module.toUpperCase() === ModuleName.CD.toUpperCase())
  ) {
    return <Redirect to={routes.toDeployments({ ...params, module: 'cd' })} />
  } else {
    return <Redirect to={routes.toCDHome(params)} />
  }
}

const RedirectToSubscriptions = RedirectToSubscriptionsFactory(ModuleName.CD)

const EnvironmentsPage = (): React.ReactElement | null => {
  const isSvcEnvEntityEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)

  if (isSvcEnvEntityEnabled) {
    return <EnvironmentsV2 />
  } else {
    return <Environments />
  }
}

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.CD_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.CD),
  expiredTrialRedirect: RedirectToSubscriptions
}

export const CDSideNavProps: SidebarContext = {
  navComponent: CDSideNav,
  subtitle: 'Continuous',
  title: 'Delivery',
  icon: 'cd-main',
  launchButtonText: 'cd.cdLaunchText',
  launchButtonRedirectUrl: '#/account/{replaceAccountId}/dashboard'
}

const moduleParams: ModulePathParams = {
  module: ':module(cd)'
}

TriggerFactory.registerTriggerForm(TriggerFormType.Manifest, {
  component: KubernetesManifests,
  baseFactory: manifestSourceBaseFactory
})

TriggerFactory.registerTriggerForm(TriggerFormType.Artifact, {
  component: KubernetesArtifacts,
  baseFactory: artifactSourceBaseFactory
})
const CDOnboardingWizardComponent = (): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const PLG_CD_CLI_WIZARD_ENABLED = useFeatureFlag(FeatureFlag.PLG_CD_CLI_WIZARD_ENABLED)

  return PLG_CD_CLI_WIZARD_ENABLED ? (
    <Redirect to={routes.toCDOnboardingWizardWithCLI({ accountId, projectIdentifier, orgIdentifier, module: 'cd' })} />
  ) : (
    <CDOnboardingWizard />
  )
}
const ServiceDetails = (): React.ReactElement => {
  const isCommunity = useGetCommunity()

  return !isCommunity ? <ServiceStudio /> : <Services />
}

export default (
  <>
    <Route licenseRedirectData={licenseRedirectData} path={routes.toCD({ ...accountPathProps })} exact>
      <RedirectToCDProject />
    </Route>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      pageName={PAGE_NAME.GetStartedWithCD}
      path={routes.toGetStartedWithCD({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
    >
      <GetStartedWithCDV2 />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      layout={EmptyLayout}
      licenseRedirectData={licenseRedirectData}
      path={routes.toCDOnboardingWizard({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
      pageName={PAGE_NAME.CDOnboardingWizard}
    >
      <CDOnboardingWizardComponent />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toCDOnboardingWizardWithCLI({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
      pageName={PAGE_NAME.CDOnboardingWizard}
    >
      <CDOnboardingWizardWithCLI />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toCDHome({ ...accountPathProps })}
      exact
      pageName={PAGE_NAME.CDHomePage}
    >
      <CDHomePage />
    </RouteWithLayout>
    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'cd' })}
      exact
      pageName={PAGE_NAME.CDTrialHomePage}
    >
      <CDTrialHomePage />
    </RouteWithLayout>
    <RouteWithLayout
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toProjectOverview({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
      exact
    >
      <CDDashboardPageOrRedirect />
    </RouteWithLayout>

    {/* Services */}
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toServices({ ...projectPathProps, ...moduleParams })]}
      pageName={PAGE_NAME.Services}
    >
      <Services showServicesDashboard />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toServices({ ...projectPathProps })}
      pageName={PAGE_NAME.Services}
    >
      <Services />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toServices({ ...orgPathProps })}
      pageName={PAGE_NAME.Services}
    >
      <Services />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toServices({ ...accountPathProps, accountRoutePlacement: 'settings' })}
      pageName={PAGE_NAME.Services}
    >
      <Services />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={MainDashboardSideNavProps}
      path={routes.toServices({ ...accountPathProps, accountRoutePlacement: 'dashboard' })}
      pageName={PAGE_NAME.Services}
    >
      <Services />
    </RouteWithLayout>

    {/* ServiceDetails */}
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[
        routes.toServiceStudio({ ...projectPathProps, ...moduleParams, ...environmentPathProps, ...servicePathProps })
      ]}
      pageName={PAGE_NAME.ServiceDetails}
    >
      <ServiceDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toServiceStudio({ ...projectPathProps, ...environmentPathProps, ...servicePathProps })}
      pageName={PAGE_NAME.ServiceDetails}
    >
      <ServiceDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toServiceStudio({ ...orgPathProps, ...environmentPathProps, ...servicePathProps })}
      pageName={PAGE_NAME.ServiceDetails}
    >
      <ServiceDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toServiceStudio({
        ...accountPathProps,
        ...environmentPathProps,
        ...servicePathProps,
        accountRoutePlacement: 'settings'
      })}
      pageName={PAGE_NAME.ServiceDetails}
    >
      <ServiceDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={MainDashboardSideNavProps}
      path={routes.toServiceStudio({
        ...accountPathProps,
        ...environmentPathProps,
        ...servicePathProps,
        accountRoutePlacement: 'dashboard'
      })}
      pageName={PAGE_NAME.ServiceDetails}
    >
      <ServiceDetails />
    </RouteWithLayout>

    {/* EnvironmentsPage */}
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toEnvironment({ ...projectPathProps, ...moduleParams })]}
      pageName={PAGE_NAME.Environments}
    >
      <EnvironmentsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toEnvironment({ ...projectPathProps })}
      pageName={PAGE_NAME.Environments}
    >
      <EnvironmentsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toEnvironment({ ...orgPathProps })}
      pageName={PAGE_NAME.Environments}
    >
      <EnvironmentsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toEnvironment({ ...accountPathProps, accountRoutePlacement: 'settings' })}
      pageName={PAGE_NAME.Environments}
    >
      <EnvironmentsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={MainDashboardSideNavProps}
      path={routes.toEnvironment({ ...accountPathProps, accountRoutePlacement: 'dashboard' })}
      pageName={PAGE_NAME.Environments}
    >
      <EnvironmentsPage />
    </RouteWithLayout>

    {/* EnvironmentDetails */}
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toEnvironmentDetails({ ...projectPathProps, ...moduleParams, ...environmentPathProps })]}
      pageName={PAGE_NAME.EnvironmentDetails}
    >
      <EnvironmentDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toEnvironmentDetails({ ...projectPathProps, ...environmentPathProps })}
      pageName={PAGE_NAME.EnvironmentDetails}
    >
      <EnvironmentDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toEnvironmentDetails({ ...orgPathProps, ...environmentPathProps })}
      pageName={PAGE_NAME.EnvironmentDetails}
    >
      <EnvironmentDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toEnvironmentDetails({
        ...accountPathProps,
        ...environmentPathProps,
        accountRoutePlacement: 'settings'
      })}
      pageName={PAGE_NAME.EnvironmentDetails}
    >
      <EnvironmentDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={MainDashboardSideNavProps}
      path={routes.toEnvironmentDetails({
        ...accountPathProps,
        ...environmentPathProps,
        accountRoutePlacement: 'dashboard'
      })}
      pageName={PAGE_NAME.EnvironmentDetails}
    >
      <EnvironmentDetails />
    </RouteWithLayout>

    {/* EnvironmentGroups */}
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toEnvironmentGroups({ ...projectPathProps, ...moduleParams })]}
      pageName={PAGE_NAME.EnvironmentGroups}
    >
      <EnvironmentGroups />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toEnvironmentGroups({ ...projectPathProps })}
      pageName={PAGE_NAME.EnvironmentGroups}
    >
      <EnvironmentGroups />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toEnvironmentGroups({ ...orgPathProps })}
      pageName={PAGE_NAME.EnvironmentGroups}
    >
      <EnvironmentGroups />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toEnvironmentGroups({ ...accountPathProps, accountRoutePlacement: 'settings' })}
      pageName={PAGE_NAME.EnvironmentGroups}
    >
      <EnvironmentGroups />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={MainDashboardSideNavProps}
      path={routes.toEnvironmentGroups({ ...accountPathProps, accountRoutePlacement: 'dashboard' })}
      pageName={PAGE_NAME.EnvironmentGroups}
    >
      <EnvironmentGroups />
    </RouteWithLayout>

    {/* EnvironmentGroupDetails */}
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={[routes.toEnvironmentGroupDetails({ ...projectPathProps, ...moduleParams, ...environmentGroupPathProps })]}
      pageName={PAGE_NAME.EnvironmentGroupDetails}
    >
      <EnvironmentGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={routes.toEnvironmentGroupDetails({ ...projectPathProps, ...environmentGroupPathProps })}
      pageName={PAGE_NAME.EnvironmentGroupDetails}
    >
      <EnvironmentGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toEnvironmentGroupDetails({ ...orgPathProps, ...environmentGroupPathProps })}
      pageName={PAGE_NAME.EnvironmentGroupDetails}
    >
      <EnvironmentGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toEnvironmentGroupDetails({
        ...accountPathProps,
        ...environmentGroupPathProps,
        accountRoutePlacement: 'settings'
      })}
      pageName={PAGE_NAME.EnvironmentGroupDetails}
    >
      <EnvironmentGroupDetails />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={MainDashboardSideNavProps}
      path={routes.toEnvironmentGroupDetails({
        ...accountPathProps,
        ...environmentGroupPathProps,
        accountRoutePlacement: 'dashboard'
      })}
      pageName={PAGE_NAME.EnvironmentGroupDetails}
    >
      <EnvironmentGroupDetails />
    </RouteWithLayout>

    {/* ServiceOverrides Page */}
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={CDSideNavProps}
      path={routes.toServiceOverrides({ ...projectPathProps, ...moduleParams })}
      pageName={PAGE_NAME.ServiceOverrides}
    >
      <ServiceOverrides />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={ProjectDetailsSideNavProps}
      path={[routes.toServiceOverrides({ ...projectPathProps })]}
      pageName={PAGE_NAME.ServiceOverrides}
    >
      <ServiceOverrides />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toServiceOverrides({ ...orgPathProps })}
      pageName={PAGE_NAME.ServiceOverrides}
    >
      <ServiceOverrides />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={AccountSideNavProps}
      path={routes.toServiceOverrides({ ...accountPathProps, accountRoutePlacement: 'settings' })}
      pageName={PAGE_NAME.ServiceOverrides}
    >
      <ServiceOverrides />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      sidebarProps={MainDashboardSideNavProps}
      path={routes.toServiceOverrides({ ...accountPathProps, accountRoutePlacement: 'dashboard' })}
      pageName={PAGE_NAME.ServiceOverrides}
    >
      <ServiceOverrides />
    </RouteWithLayout>

    {
      DefaultSettingsRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      PipelineRouteDestinations({
        pipelineStudioComponent: PipelineStudio,
        pipelineStudioPageName: PAGE_NAME.CDPipelineStudio,
        pipelineDeploymentListComponent: PipelineDeploymentList,
        pipelineDeploymentListPageName: PAGE_NAME.CDPipelineDeploymentList,
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      ConnectorRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      SecretRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      VariableRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      DelegateRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      TriggersRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      AccessControlRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      GitSyncRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      TemplateRouteDestinations({
        templateStudioComponent: TemplateStudio,
        templateStudioPageName: PAGE_NAME.CDTemplateStudioWrapper,
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      FreezeWindowRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
    {
      GovernanceRouteDestinations({
        sidebarProps: CDSideNavProps,
        pathProps: { ...accountPathProps, ...projectPathProps, ...moduleParams }
      })?.props.children
    }
    {
      FileStoreRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: CDSideNavProps
      })?.props.children
    }
  </>
)
