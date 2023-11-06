/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import {
  Utils,
  Views,
  SelectOption,
  MultiSelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import type { ResponseListEnvironmentResponse, EnvironmentResponse } from 'services/cd-ng'
import type { StringsMap } from 'stringTypes'
import type { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import type {
  AnalysedDeploymentNode,
  CVNGLogTag,
  ChangeEventDTO,
  MonitoredServiceDetail,
  SloHealthIndicatorDTO
} from 'services/cv'
import { getLocationPathName } from 'framework/utils/WindowLocation'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { ChangeSourceCategoryName } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import { DeploymentImpactAnalysis } from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeEventCard/components/EventCards/SRMStepAnalysis/SRMStepAnalysis.constants'
import { MonitoredServiceConfigurationsTabsEnum } from '@cv/pages/monitored-service/components/Configurations/components/Service/components/CommonMonitoredServiceConfigurations/CommonMonitoredServiceConfigurations.constants'

export enum EVENT_TYPE {
  KNOWN = 'KNOWN',
  UNKNOWN = 'UNKNOWN',
  FREQUENCY = 'UNEXPECTED_FREQUENCY',
  UNEXPECTED = 'UNEXPECTED',
  BASELINE = 'BASELINE',
  NO_BASELINE_AVAILABLE = 'NO_BASELINE_AVAILABLE'
}

export enum RiskValues {
  NO_DATA = 'NO_DATA',
  NO_ANALYSIS = 'NO_ANALYSIS',
  HEALTHY = 'HEALTHY',
  OBSERVE = 'OBSERVE',
  NEED_ATTENTION = 'NEED_ATTENTION',
  WARNING = 'WARNING',
  UNHEALTHY = 'UNHEALTHY',
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  CUSTOMER_DEFINED_UNHEALTHY = 'CUSTOMER_DEFINED_UNHEALTHY'
}

export enum SLOErrorBudget {
  EXHAUSTED = 'EXHAUSTED'
}

// Need to remove once removed from BE.
type OldRiskTypes = 'LOW' | 'MEDIUM' | 'HIGH'
type RiskTypes = keyof typeof RiskValues | OldRiskTypes

export const getRiskColorValue = (
  riskStatus?: RiskTypes | SloHealthIndicatorDTO['errorBudgetRisk'] | AnalysedDeploymentNode['verificationResult'],
  realCSSColor = true,
  dark = true
): string => {
  const COLOR_NO_DATA = dark ? Color.GREY_400 : Color.GREY_100

  switch (riskStatus) {
    case RiskValues.HEALTHY:
    case RiskValues.PASSED:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREEN_700) : Color.GREEN_700
    case RiskValues.OBSERVE:
    case RiskValues.WARNING:
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_900) : Color.YELLOW_900
    case RiskValues.NEED_ATTENTION:
      return realCSSColor ? Utils.getRealCSSColor(Color.ORANGE_700) : Color.ORANGE_700
    case RiskValues.UNHEALTHY:
    case RiskValues.FAILED:
    case RiskValues.CUSTOMER_DEFINED_UNHEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_900) : Color.RED_900
    case SLOErrorBudget.EXHAUSTED:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_900) : Color.RED_900
    default:
      return realCSSColor ? Utils.getRealCSSColor(COLOR_NO_DATA) : COLOR_NO_DATA
  }
}

export const getRiskColorLogo = (riskStatus?: RiskTypes | SloHealthIndicatorDTO['errorBudgetRisk']): string => {
  switch (riskStatus) {
    case RiskValues.HEALTHY:
      return 'heart'
    case RiskValues.OBSERVE:
      return 'warning-icon'
    case RiskValues.NEED_ATTENTION:
      return 'warning-sign'
    case RiskValues.UNHEALTHY:
      return 'heart-broken'
    case SLOErrorBudget.EXHAUSTED:
      return 'remove-minus'
    default:
      return 'grid'
  }
}

export function getSecondaryRiskColorValue(
  riskStatus?: RiskTypes | SloHealthIndicatorDTO['errorBudgetRisk'],
  realCSSColor = true
): string {
  switch (riskStatus) {
    case RiskValues.HEALTHY:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREEN_50) : Color.GREEN_50
    case RiskValues.OBSERVE:
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_100) : Color.YELLOW_100
    case RiskValues.NEED_ATTENTION:
      return realCSSColor ? Utils.getRealCSSColor(Color.ORANGE_100) : Color.ORANGE_100
    case RiskValues.UNHEALTHY:
    case SLOErrorBudget.EXHAUSTED:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_50) : Color.RED_50
    default:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREY_50) : Color.GREY_50
  }
}

export const getRiskLabelStringId = (
  riskStatus?: RiskTypes | SloHealthIndicatorDTO['errorBudgetRisk']
): keyof StringsMap => {
  switch (riskStatus) {
    case RiskValues.NO_DATA:
      return 'noData'
    case RiskValues.NO_ANALYSIS:
      return 'cv.noAnalysis'
    case RiskValues.HEALTHY:
      return 'cd.getStartedWithCD.healthStatus.healthy'
    case RiskValues.OBSERVE:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.observe'
    case RiskValues.WARNING:
      return 'common.warning'
    case RiskValues.NEED_ATTENTION:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.needsAttention'
    case RiskValues.UNHEALTHY:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.unhealthy'
    case SLOErrorBudget.EXHAUSTED:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.exhausted'
    default:
      return 'na'
  }
}

export const getChangeCategory = (
  category: ChangeEventDTO['category'],
  getString: UseStringsReturn['getString']
): string => {
  switch (category) {
    case ChangeSourceCategoryName.INFRASTRUCTURE:
      return getString('infrastructureText')
    case ChangeSourceCategoryName.DEPLOYMENT:
      return getString('deploymentText')
    case ChangeSourceCategoryName.FEATURE_FLAG:
      return getString('common.moduleTitles.cf')
    case ChangeSourceCategoryName.ALERT:
      return getString('cv.changeSource.incident')
    case ChangeSourceCategoryName.CHAOS_EXPERIMENT:
      return getString('chaos.chaosExperiment')
    default:
      return getString('na')
  }
}

export function roundNumber(value: number, precision = 2) {
  if (Number.isInteger(precision) && precision >= 0) {
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
  }
}

export function getErrorMessage(errorObj?: any): string | undefined {
  if (get(errorObj, 'data')) {
    return (
      get(errorObj, 'data.detailedMessage') ||
      get(errorObj, 'data.message') ||
      JSON.stringify(get(errorObj, 'data'), null, '\t')
    )
  }
  return get(errorObj, 'message')
}

export type ParseError = { payload: { message: string; status?: number } }

export function getErrorMessageForReactQuery(errorObj?: ParseError): string | undefined {
  if (get(errorObj, 'payload.message')) {
    return get(errorObj, 'payload.message') || JSON.stringify(get(errorObj, 'payload'), null, '\t')
  }
  return get(errorObj, 'message')
}

interface GetEnvironmentOptionsProps {
  environmentList: ResponseListEnvironmentResponse | null
  loading: boolean
  getString: UseStringsReturn['getString']
  returnAll?: boolean
}

export const getEnvironmentOptions = ({
  environmentList,
  loading,
  getString,
  returnAll = false
}: GetEnvironmentOptionsProps): SelectOption[] => {
  if (loading) {
    return [{ label: getString('loading'), value: 'loading' }]
  }
  if (environmentList?.data?.length) {
    const allOption: SelectOption = { label: getString('all'), value: getString('all') }
    const environmentSelectOption: SelectOption[] =
      environmentList?.data?.map((environmentData: EnvironmentResponse) => {
        const { name = '', identifier = '' } = environmentData?.environment || {}
        const scopedIdentifier = getScopedValueFromDTO(environmentData?.environment || {})
        return {
          label: name,
          value: scopedIdentifier || identifier
        }
      }) || []
    return returnAll ? [allOption, ...environmentSelectOption] : environmentSelectOption
  }
  return []
}

interface GetCVMonitoringServicesSearchParamProps {
  view?: Views
  tab?: MonitoredServiceEnum
  subTab?: MonitoredServiceConfigurationsTabsEnum
  redirectToSLO?: boolean
  sloIdentifier?: string
  monitoredServiceIdentifier?: string
  templateRef?: string
  eventId?: string
}

export const getCVMonitoringServicesSearchParam = (props: GetCVMonitoringServicesSearchParamProps): string => {
  return (
    '?' +
    Object.entries(props)
      .filter(param => param[1] !== undefined)
      .map(param => `${param[0]}=${param[1]}`)
      .join('&')
  )
}

export function getSearchString(params: { [key: string]: unknown }): string {
  return (
    '?' +
    Object.entries(params)
      .filter(param => param[1] !== undefined)
      .map(param => `${param[0]}=${param[1]}`)
      .join('&')
  )
}

export const prepareFilterInfo = (data?: MultiSelectOption[]): Array<string | number> => {
  return data ? data.map((d: MultiSelectOption) => d.value as string) : []
}

export const isNumeric = (val: string): boolean => {
  return /^-?\d+$/.test(val)
}

export function getEventTypeColor(eventType?: string, realCSSColor = true): string {
  switch (eventType) {
    case EVENT_TYPE.UNKNOWN:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_800) : Color.RED_800
    case EVENT_TYPE.KNOWN:
      return realCSSColor ? Utils.getRealCSSColor(Color.PRIMARY_7) : Color.PRIMARY_7
    case EVENT_TYPE.FREQUENCY:
    case 'UNEXPECTED':
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_800) : Color.YELLOW_800
    case EVENT_TYPE.BASELINE:
    case EVENT_TYPE.NO_BASELINE_AVAILABLE:
    default:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREY_700) : Color.GREY_700
  }
}

export function getEventTypeLightColor(eventType?: string, realCSSColor = true): string {
  switch (eventType) {
    case EVENT_TYPE.UNKNOWN:
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_50) : Color.RED_50
    case EVENT_TYPE.KNOWN:
      return realCSSColor ? Utils.getRealCSSColor(Color.PRIMARY_2) : Color.PRIMARY_2
    case EVENT_TYPE.FREQUENCY:
    case 'UNEXPECTED':
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_200) : Color.YELLOW_200
    case EVENT_TYPE.BASELINE:
    case EVENT_TYPE.NO_BASELINE_AVAILABLE:
    default:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREY_200) : Color.GREY_200
  }
}

export function getEventTypeChartColor(eventType?: string, realCSSColor = true): string {
  switch (eventType) {
    case EVENT_TYPE.UNKNOWN:
    case 'UNKNOWN_EVENT':
      return realCSSColor ? Utils.getRealCSSColor(Color.RED_400) : Color.RED_400
    case EVENT_TYPE.KNOWN:
    case 'KNOWN_EVENT':
      return realCSSColor ? Utils.getRealCSSColor(Color.PRIMARY_5) : Color.PRIMARY_5
    case EVENT_TYPE.FREQUENCY:
    case 'UNEXPECTED_FREQUENCY':
    case 'UNEXPECTED':
      return realCSSColor ? Utils.getRealCSSColor(Color.YELLOW_700) : Color.YELLOW_700
    case EVENT_TYPE.BASELINE:
    case EVENT_TYPE.NO_BASELINE_AVAILABLE:
    default:
      return realCSSColor ? Utils.getRealCSSColor(Color.GREY_300) : Color.GREY_300
  }
}

export const getTags = (tags?: CVNGLogTag[]) => {
  const result = {} as any
  const formatDatesFor = ['startTime', 'endTime']
  tags
    ?.filter(tag => tag.type === 'STRING' || tag.type === 'TIMESTAMP')
    .forEach(tag => {
      if (!tag.key) {
        return
      }
      if (formatDatesFor.includes(tag.key)) {
        result[tag.key] = tag.value ? formatDatetoLocale(+tag.value) : ''
      } else {
        result[tag.key] = tag.value
      }
    })

  return JSON.stringify(result)
}

export const getDetailsLabel = (key: string, getString: UseStringsReturn['getString']): string => {
  switch (key) {
    case 'artifactType':
      return getString('pipeline.artifactsSelection.artifactType')
    case 'artifactTag':
      return getString('platform.connectors.cdng.artifactTag')
    case 'executedBy':
      return getString('common.executedBy')
    case 'eventType':
      return getString('pipeline.verification.logs.eventType')
    case 'updatedBy':
      return getString('common.updatedBy')
    case 'externalLinkToEntity':
      return getString('cv.changesPage.externalLink')
    case DeploymentImpactAnalysis:
      return getString('cv.changeSource.DeploymentImpactAnalysis')
    default:
      return key
  }
}

export const getIsValidPrimitive = <T>(value: T): value is NonNullable<T> => {
  return value !== undefined && value !== null
}

export const getMonitoredServiceIdentifiers = (
  isAccountLevel: boolean,
  monitoredServiceDetails?: MonitoredServiceDetail[]
): string[] =>
  monitoredServiceDetails?.map(serviceDetails => {
    return isAccountLevel
      ? `PROJECT.${serviceDetails.projectParams?.accountIdentifier}.${serviceDetails.projectParams?.orgIdentifier}.${serviceDetails.projectParams?.projectIdentifier}.${serviceDetails.monitoredServiceIdentifier}`
      : serviceDetails.monitoredServiceIdentifier ?? ''
  }) || []

export const getTypeOfInput = (value: SelectOption | string) => {
  const selectedItem = typeof value === 'string' ? value : value?.label
  if (getMultiTypeFromValue(selectedItem) === MultiTypeInputType.RUNTIME) {
    return MultiTypeInputType.RUNTIME
  }
  if (/^</.test(selectedItem)) {
    return MultiTypeInputType.EXPRESSION
  }
  return MultiTypeInputType.FIXED
}

export const openWindowInNewTab = (url?: string): void => {
  const targetUrl = `${window.location.origin}${getLocationPathName()}#${url}`
  if (url) {
    window.open(targetUrl, '_blank')
  }
}

export const getMonitoredServiceIdentifierProp = (
  isAccountLevel: boolean,
  isCompositeSLO: boolean,
  monitoredServiceIdentifiers?: string[],
  monitoredServiceIdentifier?: string
) => {
  if (isAccountLevel) {
    return { scopedMonitoredServiceIdentifiers: monitoredServiceIdentifiers }
  } else if (monitoredServiceIdentifiers?.length && isCompositeSLO) {
    return { monitoredServiceIdentifiers }
  } else if (monitoredServiceIdentifier) {
    return { monitoredServiceIdentifiers: [monitoredServiceIdentifier] }
  }
  return {}
}

export const nearestMinutes = (interval: number, someMoment: moment.Moment) => {
  const roundedMinutes = Math.ceil(someMoment.clone().minute() / interval) * interval
  return someMoment.clone().minute(roundedMinutes).second(0)
}

export function isNotAValidNumber(numberValue?: number): boolean {
  return numberValue === undefined || isNaN(numberValue as number)
}
