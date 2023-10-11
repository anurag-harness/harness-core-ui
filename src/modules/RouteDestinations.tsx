/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import GitOpsRoutes from '@gitops/RouteDestinations'
import auditTrailRoutes from '@audit-trail/RouteDestinations'
import delegatesRoutes from '@delegates/RouteDestinations'
import commonRoutes from '@common/RouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import AuthSettingsRoutes from '@auth-settings/RouteDestinations'
import secretsRoutes from '@secrets/RouteDestinations'
import discoveryRoutes from '@discovery/RouteDestinations'
import variableRoutes from '@variables/RouteDestinations'
import fileStoreRoutes from '@filestore/RouteDestinations'
import RbacRoutes from '@rbac/RouteDestinations'
import projectsOrgsRoutes from '@projects-orgs/RouteDestinations'
import connectorRoutes from '@platform/connectors/RouteDestinations'
import tempatesRoutes from '@templates-library/RouteDestinations'
import freezeWindowRoutes from '@freeze-windows/RouteDestinations'
import userProfileRoutes from '@user-profile/RouteDestinations'
import '@pipeline/RouteDestinations'
import CDRoutes from '@cd/RouteDestinations'
import CIRoutes from '@ci/RouteDestinations'
import SSCARoutes from '@ssca/RouteDestinations'
import { SRMRoutes, SRMMFERoutes } from '@cv/RouteDestinations'
import CFRoutes from '@cf/RouteDestinations'
import CERoutes from '@ce/RouteDestinations'
import STORoutes from '@sto/RouteDestinations'
import IDPRoutes from '@idp/RouteDestinations'
import GovernanceRoutes from '@governance/RouteDestinations'
import IACMRoutes from '@iacm/RouteDestinations'
import ChaosRoutes from '@chaos/RouteDestinations'
import { CdbMfeRoutes, CdbNonMfeRoutes } from '@dashboards/RouteDestinations'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import DefaultSettingsRoutes from '@default-settings/RouteDestinations'
import CODERouteDestinations from '@code/RouteDestinations'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import ETRoutes from '@cet/RouteDestinations'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

export default function RouteDestinations(): React.ReactElement {
  const {
    CVNG_ENABLED,
    CODE_ENABLED,
    IACM_ENABLED,
    SSCA_ENABLED,
    IDP_ENABLED,
    CET_ENABLED,
    CDB_MFE_ENABLED,
    PL_DISCOVERY_ENABLE
  } = useFeatureFlags()
  const { licenseInformation } = useLicenseStore()

  const isCVModuleEnabled =
    licenseInformation[ModuleName.CV]?.status === LICENSE_STATE_VALUES.ACTIVE ||
    licenseInformation[ModuleName.CD]?.status === LICENSE_STATE_VALUES.ACTIVE ||
    CVNG_ENABLED

  return (
    <Switch>
      {commonRoutes.props.children}
      {secretsRoutes.props.children}
      {variableRoutes.props.children}
      {PL_DISCOVERY_ENABLE && discoveryRoutes.props.children}
      {auditTrailRoutes.props.children}
      {RbacRoutes().props.children}
      {DefaultSettingsRoutes().props.children}
      {delegatesRoutes.props.children}
      {fileStoreRoutes.props.children}
      {projectsOrgsRoutes.props.children}
      {GovernanceRoutes.props.children}
      {CODE_ENABLED ? CODERouteDestinations().props.children : null}
      {connectorRoutes.props.children}
      {tempatesRoutes.props.children}
      {freezeWindowRoutes.props.children}
      {userProfileRoutes.props.children}
      {ChaosRoutes().props.children}
      {CIRoutes.props.children}
      {CDRoutes.props.children}
      {isCVModuleEnabled ? SRMRoutes.props.children : null}
      {isCVModuleEnabled ? (
        <Route path="/account/:accountId/:module(cv)">
          <SRMMFERoutes />
        </Route>
      ) : null}
      {GitOpsRoutes.props.children}
      {IDP_ENABLED ? IDPRoutes().props.children : null}
      {STORoutes.props.children}
      <Route path="/account/:accountId/settings">
        <AuthSettingsRoutes />
      </Route>
      <Route path="/account/:accountId/:module(ce)">
        <CERoutes />
      </Route>
      {CDB_MFE_ENABLED ? CdbMfeRoutes.props.children : CdbNonMfeRoutes.props.children}
      {CFRoutes({})?.props.children}
      {IACM_ENABLED ? IACMRoutes().props.children : null}
      {SSCA_ENABLED ? SSCARoutes.props.children : null}
      {CET_ENABLED ? ETRoutes({})?.props.children : null}
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
