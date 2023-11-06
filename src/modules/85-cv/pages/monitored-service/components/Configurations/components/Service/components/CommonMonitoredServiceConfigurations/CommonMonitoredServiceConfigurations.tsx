/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Tab, Tabs, Views } from '@harness/uicore'
import React from 'react'
import { FormikContextType, useFormikContext } from 'formik'
import { useHistory, useParams } from 'react-router-dom'
import type { ChangeSourceDTO, MonitoredServiceDTO } from 'services/cv'
import type { MonitoredServiceConfig } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.types'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import SaveAndDiscardButton from '@cv/components/SaveAndDiscardButton/SaveAndDiscardButton'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { isUpdated, showDependencies } from '@cv/pages/monitored-service/components/Configurations/Configurations.utils'
import { useStrings } from 'framework/strings'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { CETAgentConfig } from '@cet/pages/CETAgentConfig'
import { ModuleName } from 'framework/types/ModuleName'
import { getSearchString } from '@cv/utils/CommonUtils'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import {
  getIsAgentConfigSectionHidden,
  getIsChangeSrcSectionHidden,
  getIsHealthSrcSectionHidden,
  getIsNotifcationsSectionHidden,
  onSave,
  shouldShowSaveAndDiscard,
  updateMonitoredServiceDTOOnTypeChange
} from '../../Service.utils'
import ChangeSourceTableContainer from '../ChangeSourceTableContainer/ChangeSourceTableContainer'
import HealthSourceTableContainer from '../HealthSourceTableContainer/HealthSourceTableContainer'
import type { MonitoredServiceForm } from '../../Service.types'
import MonitoredServiceOverview from '../MonitoredServiceOverview/MonitoredServiceOverview'
import MonitoredServiceNotificationsContainer from '../MonitoredServiceNotificationsContainer/MonitoredServiceNotificationsContainer'
import Dependency from '../../../Dependency/Dependency'
import { MonitoredServiceConfigurationsTabsEnum } from './CommonMonitoredServiceConfigurations.constants'
import css from './CommonMonitoredServiceConfigurations.module.scss'

export interface CommonMonitoredServiceConfigurationsProps {
  config?: MonitoredServiceConfig
  identifier: string
  hideDrawer: () => void
  showDrawer: (data: ChangeSourceDTO[]) => void
  isTemplate?: boolean
  expressions?: string[]
  initialValues: MonitoredServiceForm
  onSuccess: (val: MonitoredServiceForm) => Promise<void>
  onDependencySuccess: (val: MonitoredServiceForm) => Promise<void>
  onSuccessChangeSource: (data: ChangeSourceDTO[]) => void
  openChangeSourceDrawer: ({
    formik,
    onSuccessChangeSource
  }: {
    formik: FormikContextType<MonitoredServiceForm>
    onSuccessChangeSource: (data: ChangeSourceDTO[]) => void
  }) => Promise<void>
  isEdit: boolean
  onChangeMonitoredServiceType: (updatedValues: MonitoredServiceForm) => void
  cachedInitialValues?: MonitoredServiceForm | null
  onDiscard?: () => void
  setDBData?: (val: MonitoredServiceForm) => void
  dependencyTabformRef?: unknown
}
export default function CommonMonitoredServiceConfigurations(
  props: CommonMonitoredServiceConfigurationsProps
): JSX.Element {
  const {
    config,
    identifier,
    hideDrawer,
    showDrawer,
    onSuccessChangeSource,
    openChangeSourceDrawer,
    isTemplate,
    expressions,
    initialValues,
    onSuccess,
    isEdit,
    onChangeMonitoredServiceType,
    cachedInitialValues,
    onDiscard,
    setDBData,
    dependencyTabformRef,
    onDependencySuccess
  } = props
  const formik = useFormikContext<MonitoredServiceForm>()
  const { licenseInformation } = useLicenseStore()
  const { CET_PLATFORM_MONITORED_SERVICE } = useFeatureFlags()
  const isCETLicensePresentAndActive = licenseInformation[ModuleName.CET]?.status === LICENSE_STATE_VALUES.ACTIVE
  const isChangeSrcSectionHidden = getIsChangeSrcSectionHidden(config, identifier)
  const isHealthSrcSectionHidden = getIsHealthSrcSectionHidden(config, identifier)
  const isAgentConfigSectionHidden = getIsAgentConfigSectionHidden(
    config,
    identifier,
    isCETLicensePresentAndActive,
    CET_PLATFORM_MONITORED_SERVICE
  )
  const { getString } = useStrings()
  const isNotificationsSectionHidden = getIsNotifcationsSectionHidden(isTemplate, config, identifier)
  const isSRMLicensePresentAndActive = licenseInformation[ModuleName.CV]?.status === LICENSE_STATE_VALUES.ACTIVE
  const {
    tab = MonitoredServiceEnum.SLOs,
    subTab = MonitoredServiceConfigurationsTabsEnum.MONITORED_SERVICE_OVERVIEW,
    view,
    notificationTime
  } = useQueryParams<{
    tab?: MonitoredServiceEnum
    view?: Views.GRID
    notificationTime?: number
    subTab: MonitoredServiceConfigurationsTabsEnum
  }>()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const history = useHistory()

  const handleMonitoredServiceTypeChange = (type: MonitoredServiceDTO['type']): void => {
    if (type === formik.values.type) {
      return
    }
    formik.setFieldValue('type', type)
    onChangeMonitoredServiceType({
      isEdit,
      ...updateMonitoredServiceDTOOnTypeChange(type, formik.values)
    })
  }

  const onTabChange = (nextTab: MonitoredServiceEnum): void => {
    if (nextTab !== tab) {
      history.push({
        pathname: routes.toCVAddMonitoringServicesEdit({
          accountId,
          orgIdentifier,
          projectIdentifier,
          identifier,
          module: 'cv'
        }),
        search: getSearchString({ view, tab, subTab: nextTab, notificationTime })
      })
    }
  }

  return (
    <Container className={css.configurationTabs}>
      <Tabs id={'monitoredServiceConfigurations'} defaultSelectedTabId={subTab} onChange={onTabChange}>
        <Tab
          id={MonitoredServiceConfigurationsTabsEnum.MONITORED_SERVICE_OVERVIEW}
          title={getString('overview')}
          panel={
            <>
              <Container className={css.saveDiscardButton}>
                {shouldShowSaveAndDiscard(isTemplate) ? (
                  <SaveAndDiscardButton
                    isUpdated={isUpdated(formik.dirty, initialValues, cachedInitialValues)}
                    onSave={() => onSave({ formik, onSuccess })}
                    onDiscard={() => {
                      formik.resetForm()
                      onDiscard?.()
                    }}
                    RbacPermission={{
                      permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                      resource: {
                        resourceType: ResourceType.MONITOREDSERVICE,
                        resourceIdentifier: projectIdentifier
                      }
                    }}
                  />
                ) : null}
              </Container>
              <MonitoredServiceOverview
                formikProps={formik}
                isEdit={isEdit}
                onChangeMonitoredServiceType={handleMonitoredServiceTypeChange}
                config={config}
              />
            </>
          }
        />
        {isHealthSrcSectionHidden ? null : (
          <Tab
            id={MonitoredServiceConfigurationsTabsEnum.HEALTH_SOURCE}
            title={getString('platform.connectors.cdng.healthSources.label')}
            panel={
              <HealthSourceTableContainer
                healthSourceListFromAPI={initialValues.sources?.healthSources}
                serviceFormFormik={formik}
                isTemplate={isTemplate}
                expressions={expressions}
                onSave={
                  /* istanbul ignore next */ data => {
                    onSave({
                      formik: {
                        ...formik,
                        values: {
                          ...(formik?.values || {}),
                          sources: { ...formik.values?.sources, healthSources: data }
                        }
                      },
                      onSuccess
                    })
                  }
                }
              />
            }
          />
        )}
        {isChangeSrcSectionHidden ? null : (
          <Tab
            id={MonitoredServiceConfigurationsTabsEnum.CHANGE_SOURCE}
            title={getString('cv.navLinks.adminSideNavLinks.activitySources')}
            panel={
              <ChangeSourceTableContainer
                onEdit={values => {
                  showDrawer({ ...values, hideDrawer })
                }}
                onAddNewChangeSource={
                  /* istanbul ignore next */ () => {
                    openChangeSourceDrawer({ formik, onSuccessChangeSource })
                  }
                }
                value={formik.values?.sources?.changeSources}
                onSuccess={onSuccessChangeSource}
              />
            }
          />
        )}
        {isAgentConfigSectionHidden ? null : (
          <Tab
            id={MonitoredServiceConfigurationsTabsEnum.AGENT_CONFIG}
            title={getString('cet.monitoredservice.agentconfig')}
            panel={
              <CETAgentConfig serviceRef={formik.values?.serviceRef} environmentRef={formik.values?.environmentRef} />
            }
          />
        )}
        {showDependencies(isTemplate as boolean, config, isSRMLicensePresentAndActive) && (
          <Tab
            id={MonitoredServiceConfigurationsTabsEnum.DEPENDENCIES}
            title={getString('pipelines-studio.dependenciesGroupTitle')}
            panel={
              <Dependency
                value={initialValues}
                dependencyTabformRef={dependencyTabformRef}
                onSuccess={onDependencySuccess}
                cachedInitialValues={cachedInitialValues}
                setDBData={setDBData}
                onDiscard={onDiscard}
              />
            }
          />
        )}
        {isNotificationsSectionHidden ? null : (
          <Tab
            id={MonitoredServiceConfigurationsTabsEnum.NOTIFICATIONS}
            title={getString('rbac.notifications.name')}
            panel={
              <>
                <Container className={css.saveDiscardButton}>
                  <SaveAndDiscardButton
                    isUpdated={isUpdated(formik.dirty, initialValues, cachedInitialValues)}
                    onSave={() => onSave({ formik, onSuccess })}
                    onDiscard={() => {
                      formik.resetForm()
                      onDiscard?.()
                    }}
                    RbacPermission={{
                      permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                      resource: {
                        resourceType: ResourceType.MONITOREDSERVICE,
                        resourceIdentifier: projectIdentifier
                      }
                    }}
                  />
                </Container>
                <MonitoredServiceNotificationsContainer
                  setFieldValue={formik?.setFieldValue}
                  notificationRuleRefs={formik?.values?.notificationRuleRefs}
                  identifier={identifier}
                />
              </>
            }
          />
        )}
      </Tabs>
    </Container>
  )
}
