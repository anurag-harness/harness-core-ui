/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps } from '@common/utils/routeUtils'
import { String as LocaleString } from 'framework/strings'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import RbacFactory from '@rbac/factories/RbacFactory'
import { LicenseRedirectProps, LICENSE_STATE_NAMES } from 'framework/LicenseStore/LicenseStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MinimalLayout } from '@common/layouts'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import SideNav from '@common/navigation/SideNav'
import NavExpandable from '@common/navigation/NavExpandable/NavExpandable'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import { NameSchema } from '@common/utils/Validation'
import { SEICustomMicroFrontendProps } from './SEICustomMicroFrontendProps.types'

// eslint-disable-next-line import/no-unresolved
const SEIMicroFrontend = React.lazy(() => import('sei/MicroFrontendApp'))

export default function SEIRoutes(): React.ReactElement {
  const isSEIEnabled = useFeatureFlag(FeatureFlag.SEI_ENABLED)
  const { accountId } = useParams<ProjectPathProps>()

  if (isSEIEnabled) {
    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_CONFIGURATION_SETTINGS, {
      icon: 'res-users',
      label: 'sei.configurationSettings',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_CONFIGURATIONSETTINGS]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_CONFIGURATIONSETTINGS]: <LocaleString stringID="rbac.permissionLabels.edit" />,
        [PermissionIdentifier.CREATE_SEI_CONFIGURATIONSETTINGS]: (
          <LocaleString stringID="rbac.permissionLabels.create" />
        ),
        [PermissionIdentifier.DELETE_SEI_CONFIGURATIONSETTINGS]: (
          <LocaleString stringID="rbac.permissionLabels.delete" />
        )
      }
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_COLLECTIONS, {
      icon: 'res-users',
      label: 'common.purpose.sei.collections',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_COLLECTIONS]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_COLLECTIONS]: <LocaleString stringID="rbac.permissionLabels.edit" />,
        [PermissionIdentifier.CREATE_SEI_COLLECTIONS]: <LocaleString stringID="rbac.permissionLabels.create" />,
        [PermissionIdentifier.DELETE_SEI_COLLECTIONS]: <LocaleString stringID="rbac.permissionLabels.delete" />
      }
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_INSIGHTS, {
      icon: 'res-users',
      label: 'sei.insights',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_INSIGHTS]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_INSIGHTS]: <LocaleString stringID="rbac.permissionLabels.edit" />,
        [PermissionIdentifier.CREATE_SEI_INSIGHTS]: <LocaleString stringID="rbac.permissionLabels.create" />,
        [PermissionIdentifier.DELETE_SEI_INSIGHTS]: <LocaleString stringID="rbac.permissionLabels.delete" />
      }
    })

    RbacFactory.registerResourceTypeHandler(ResourceType.SEI_TRELLIS_SCORE, {
      icon: 'res-users',
      label: 'sei.trellisScore',
      category: ResourceCategory.SEI,
      permissionLabels: {
        [PermissionIdentifier.VIEW_SEI_TRELLISSCORE]: <LocaleString stringID="rbac.permissionLabels.view" />,
        [PermissionIdentifier.EDIT_SEI_TRELLISSCORE]: <LocaleString stringID="rbac.permissionLabels.edit" />
      }
    })
  }
  const RedirectToModuleTrialHome = (): React.ReactElement => {
    return (
      <Redirect
        to={routes.toModuleTrialHome({
          accountId,
          module: 'sei'
        })}
      />
    )
  }

  const RedirectToSubscriptions = (): React.ReactElement => {
    return (
      <Redirect
        to={routes.toSubscriptions({
          accountId,
          moduleCard: 'sei'
        })}
      />
    )
  }
  const licenseRedirectData: LicenseRedirectProps = {
    licenseStateName: LICENSE_STATE_NAMES.CD_LICENSE_STATE,
    startTrialRedirect: RedirectToModuleTrialHome,
    expiredTrialRedirect: RedirectToSubscriptions
  }
  return (
    <RouteWithLayout
      layout={MinimalLayout}
      licenseRedirectData={licenseRedirectData}
      path={routes.toSEI({ ...accountPathProps })}
    >
      <ChildAppMounter<SEICustomMicroFrontendProps>
        ChildApp={SEIMicroFrontend}
        customComponents={{
          ProjectSelector,
          NavExpandable,
          HarnessSideNav: SideNav,
          HomePageTemplate
        }}
        cdServices={{
          useGetLicensesAndSummary
        }}
        customRoutes={routes}
        customUtils={{ NameSchema }}
      />
    </RouteWithLayout>
  )
}
