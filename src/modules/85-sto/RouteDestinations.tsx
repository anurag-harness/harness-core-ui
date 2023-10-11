/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { lazy } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { ConnectorRouteDestinations } from '@platform/connectors/RouteDestinations'
import { DelegateRouteDestinations } from '@delegates/RouteDestinations'
import { GitSyncRouteDestinations } from '@gitsync/RouteDestinations'
import { PipelineRouteDestinations } from '@pipeline/RouteDestinations'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { TemplateRouteDestinations } from '@templates-library/RouteDestinations'
import { TriggersRouteDestinations } from '@triggers/RouteDestinations'
import { VariableRouteDestinations } from '@variables/RouteDestinations'
import PipelineStudio from '@pipeline/components/PipelineStudio/PipelineStudio'
import { GovernanceRouteDestinations } from '@governance/RouteDestinations'
import { SecretRouteDestinations } from '@secrets/RouteDestinations'
import { UserLabel } from '@common/components'
import { MinimalLayout } from '@common/layouts'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import executionFactory from '@pipeline/factories/ExecutionFactory'
import { StageType } from '@pipeline/utils/stageHelpers'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import STOSideNav from '@sto/components/STOSideNav/STOSideNav'
import STOExecutionCardSummary from '@sto/components/STOExecutionCardSummary/STOExecutionCardSummary'
import '@sto/components/PipelineStages/SecurityTestsStage'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String as LocaleString } from 'framework/strings'
import { DefaultSettingsRouteDestinations } from '@default-settings/RouteDestinations'
import AuditTrailFactory from 'framework/AuditTrail/AuditTrailFactory'
import {
  getActiveUsageNumber,
  getPercentageNumber,
  isFeatureCountActive,
  isFeatureLimitBreachedIncludesExceeding,
  isFeatureLimitMet,
  isFeatureOveruseActive,
  isFeatureWarningActive,
  isFeatureWarningActiveIncludesLimit
} from '@common/layouts/FeatureBanner'
import { BannerType } from '@common/layouts/Constants'
import featureFactory from 'framework/featureStore/FeaturesFactory'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { LICENSE_STATE_NAMES, LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import { RedirectToModuleTrialHomeFactory, RedirectToSubscriptionsFactory } from '@common/Redirects'
import { ModuleName } from 'framework/types/ModuleName'
import { PipelineDeploymentList } from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import ExternalTicketSettings from '@sto/components/ExternalTickets/Settings/ExternalTicketSettings'
import STOTrialHomePage from '@sto/pages/home/trialPage/STOTrialHomePage'

const STOSideNavProps: SidebarContext = {
  navComponent: STOSideNav,
  title: 'Security Tests',
  icon: 'sto-color-filled'
}

const moduleParams: ModulePathParams = {
  module: ':module(sto)'
}

// License

const licenseRedirectData: LicenseRedirectProps = {
  licenseStateName: LICENSE_STATE_NAMES.STO_LICENSE_STATE,
  startTrialRedirect: RedirectToModuleTrialHomeFactory(ModuleName.STO),
  expiredTrialRedirect: RedirectToSubscriptionsFactory(ModuleName.STO)
}

featureFactory.registerFeaturesByModule('sto', {
  features: [FeatureIdentifier.MAX_TOTAL_SCANS, FeatureIdentifier.MAX_SCANS_PER_MONTH, FeatureIdentifier.DEVELOPERS],
  renderMessage: (props, getString, additionalLicenseProps = {}) => {
    const {
      isFreeEdition: isSTOFree,
      isTeamEdition: isSTOTeam,
      isEnterpriseEdition: isSTOEnterprise
    } = additionalLicenseProps
    const isTeamOrEnterprise = isSTOEnterprise || isSTOTeam
    const featuresMap = props.features
    const maxTotalScansFeatureDetail = featuresMap.get(FeatureIdentifier.MAX_TOTAL_SCANS) // tested both
    const maxScansPerMonthFeatureDetail = featuresMap.get(FeatureIdentifier.MAX_SCANS_PER_MONTH)
    const activeDevelopersFeatureDetail = featuresMap.get(FeatureIdentifier.DEVELOPERS)

    // Check for limit breach
    const isMaxScansPerMonthBreached = isFeatureLimitBreachedIncludesExceeding(maxScansPerMonthFeatureDetail)
    let limitBreachMessageString = ''
    if (isMaxScansPerMonthBreached) {
      limitBreachMessageString = getString('pipeline.featureRestriction.maxScansPerMonth100PercentLimit')
    }

    if (limitBreachMessageString) {
      return {
        message: () => limitBreachMessageString,
        bannerType: BannerType.LEVEL_UP
      }
    }

    // Checking for limit overuse warning
    let overuseMessageString = ''
    const isActiveDevelopersOveruseActive = isFeatureOveruseActive(activeDevelopersFeatureDetail)

    if (isActiveDevelopersOveruseActive && isTeamOrEnterprise) {
      overuseMessageString = getString('pipeline.featureRestriction.subscriptionExceededLimit')
    }
    if (overuseMessageString) {
      return {
        message: () => overuseMessageString,
        bannerType: BannerType.OVERUSE
      }
    }

    // Checking for limit usage warning
    let warningMessageString = ''
    const isMaxScansPerMonthCountActive = isFeatureCountActive(maxScansPerMonthFeatureDetail)
    const isMaxTotalScansWarningActive = isFeatureWarningActive(maxTotalScansFeatureDetail)
    const isMaxTotalScansLimitMet = isFeatureLimitMet(maxTotalScansFeatureDetail)
    const isActiveDevelopersWarningActive = isFeatureWarningActiveIncludesLimit(activeDevelopersFeatureDetail)

    if (
      isSTOFree &&
      isMaxTotalScansLimitMet &&
      isMaxScansPerMonthCountActive &&
      typeof maxScansPerMonthFeatureDetail?.featureDetail?.count !== 'undefined'
    ) {
      warningMessageString = getString('pipeline.featureRestriction.numMonthlyBuilds', {
        count: maxScansPerMonthFeatureDetail.featureDetail.count,
        limit: maxScansPerMonthFeatureDetail.featureDetail.limit
      })
    } else if (
      isSTOFree &&
      isMaxTotalScansWarningActive &&
      maxTotalScansFeatureDetail?.featureDetail?.count &&
      maxTotalScansFeatureDetail.featureDetail.limit
    ) {
      const usagePercent = getActiveUsageNumber(maxTotalScansFeatureDetail)

      warningMessageString = getString('pipeline.featureRestriction.maxTotalBuilds90PercentLimit', {
        usagePercent
      })
    } else if (
      isActiveDevelopersWarningActive &&
      activeDevelopersFeatureDetail?.featureDetail?.count &&
      activeDevelopersFeatureDetail.featureDetail.limit &&
      isTeamOrEnterprise
    ) {
      const usagePercent = getPercentageNumber(maxTotalScansFeatureDetail)

      warningMessageString = getString('pipeline.featureRestriction.subscription90PercentLimit', { usagePercent })
    }

    if (warningMessageString) {
      return {
        message: () => warningMessageString,
        bannerType: BannerType.INFO
      }
    }

    // If neither of limit breach/ warning/ overuse needs to be shown, return with an empty string.
    // This will ensure no banner is shown
    return {
      message: () => '',
      bannerType: BannerType.LEVEL_UP
    }
  }
})

// RBAC

RbacFactory.registerResourceCategory(ResourceCategory.STO, {
  icon: 'sto-color-filled',
  label: 'common.purpose.sto.continuous'
})

RbacFactory.registerResourceTypeHandler(ResourceType.STO_TESTTARGET, {
  icon: 'sto-color-filled',
  label: 'sto.targets.testTargets',
  labelSingular: 'common.singularLabels.testTarget',
  category: ResourceCategory.STO,
  permissionLabels: {
    [PermissionIdentifier.VIEW_STO_TESTTARGET]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_STO_TESTTARGET]: <LocaleString stringID="rbac.permissionLabels.createEdit" />
  }
})
RbacFactory.registerResourceTypeHandler(ResourceType.STO_EXEMPTION, {
  icon: 'sto-color-filled',
  label: 'sto.exemptions',
  labelSingular: 'sto.stoExemption',
  category: ResourceCategory.STO,
  permissionLabels: {
    [PermissionIdentifier.VIEW_STO_EXEMPTION]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.CREATE_STO_EXEMPTION]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.APPROVE_STO_EXEMPTION]: <LocaleString stringID="rbac.permissionLabels.approveReject" />
  }
})
RbacFactory.registerResourceTypeHandler(ResourceType.STO_SCAN, {
  icon: 'sto-color-filled',
  label: 'sto.scans',
  labelSingular: 'common.singularLabels.scan',
  category: ResourceCategory.STO,
  permissionLabels: {
    [PermissionIdentifier.VIEW_STO_SCAN]: <LocaleString stringID="rbac.permissionLabels.view" />
  }
})
RbacFactory.registerResourceTypeHandler(ResourceType.STO_ISSUE, {
  icon: 'sto-color-filled',
  label: 'sto.issues',
  labelSingular: 'common.singularLabels.issue',
  category: ResourceCategory.STO,
  permissionLabels: {
    [PermissionIdentifier.VIEW_STO_ISSUE]: <LocaleString stringID="rbac.permissionLabels.view" />
  }
})
RbacFactory.registerResourceTypeHandler(ResourceType.TICKET, {
  icon: 'sto-color-filled',
  label: 'common.tickets.externalTickets',
  labelSingular: 'common.singularLabels.ticket',
  category: ResourceCategory.STO,
  permissionLabels: {
    [PermissionIdentifier.VIEW_STO_TICKET]: <LocaleString stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_STO_TICKET]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_STO_TICKET]: <LocaleString stringID="rbac.permissionLabels.delete" />
  }
})

// Audit Trail

AuditTrailFactory.registerResourceHandler('STO_TARGET', {
  moduleIcon: {
    name: 'sto-grey'
  },
  moduleLabel: 'common.module.sto',
  // Using existing "Target" string to avoid yamlStringsCheck error
  resourceLabel: 'pipelineSteps.targetLabel'
})

AuditTrailFactory.registerResourceHandler('STO_EXEMPTION', {
  moduleIcon: {
    name: 'sto-grey'
  },
  moduleLabel: 'common.module.sto',
  resourceLabel: 'sto.stoExemption'
})

executionFactory.registerCardInfo(StageType.SECURITY, {
  icon: 'sto-color-filled',
  component: STOExecutionCardSummary
})

const RedirectToProjectOverviewPage = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject) {
    return (
      <Redirect
        to={routes.toSTOProjectOverview({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || '',
          projectIdentifier: selectedProject.identifier
        })}
      />
    )
  } else {
    return <Redirect to={routes.toSTOOverview({ accountId })} />
  }
}

const RemoteSTOApp = lazy(() => import(`stoV2/App`))

export default (
  <>
    <RouteWithLayout exact licenseRedirectData={licenseRedirectData} path={routes.toSTO({ ...accountPathProps })}>
      <RedirectToProjectOverviewPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={STOSideNavProps}
      path={[
        routes.toSTOOverview({ ...accountPathProps }),
        routes.toSTOProjectOverview({ ...accountPathProps, ...projectPathProps })
      ]}
    >
      <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ ExecutionCard, CardRailView }} />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={STOSideNavProps}
      path={[
        routes.toSTOIssues({ ...accountPathProps }),
        routes.toSTOProjectIssues({ ...accountPathProps, ...projectPathProps })
      ]}
    >
      <ChildAppMounter ChildApp={RemoteSTOApp} />
    </RouteWithLayout>

    <RouteWithLayout
      layout={MinimalLayout}
      path={routes.toModuleTrialHome({ ...accountPathProps, module: 'sto' })}
      exact
    >
      <STOTrialHomePage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={STOSideNavProps}
      path={[
        routes.toSTOTargets({ ...accountPathProps }),
        routes.toSTOProjectTargets({ ...accountPathProps, ...projectPathProps })
      ]}
    >
      <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={STOSideNavProps}
      path={[
        routes.toSTOSecurityReview({ ...accountPathProps }),
        routes.toSTOProjectSecurityReview({ ...accountPathProps, ...projectPathProps })
      ]}
    >
      <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={STOSideNavProps}
      path={[
        routes.toSTOGettingStarted({ ...accountPathProps }),
        routes.toSTOProjectGettingStarted({ ...accountPathProps, ...projectPathProps })
      ]}
    >
      <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={STOSideNavProps}
      layout={MinimalLayout}
      path={[routes.toSTOProjectTicketSummary({ ...accountPathProps, ...projectPathProps, issueId: ':issueId' })]}
    >
      <ChildAppMounter ChildApp={RemoteSTOApp} customComponents={{ UserLabel }} />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={STOSideNavProps}
      licenseRedirectData={licenseRedirectData}
      path={[routes.toProjectTicketSettings({ ...accountPathProps, ...projectPathProps, ...moduleParams })]}
    >
      <ExternalTicketSettings />
    </RouteWithLayout>

    {
      PipelineRouteDestinations({
        pipelineStudioComponent: PipelineStudio,
        pipelineDeploymentListComponent: PipelineDeploymentList,
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      AccessControlRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      ConnectorRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      DefaultSettingsRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      SecretRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      VariableRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      DelegateRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      TemplateRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      GitSyncRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      TriggersRouteDestinations({
        moduleParams,
        licenseRedirectData,
        sidebarProps: STOSideNavProps
      })?.props.children
    }
    {
      GovernanceRouteDestinations({
        sidebarProps: STOSideNavProps,
        pathProps: { ...accountPathProps, ...projectPathProps, ...moduleParams }
      })?.props.children
    }
  </>
)
