/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { HealthSourceV2 } from 'services/cv'
import { UseStringsReturn } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import { LogsProviderType, MetricsProviderType } from './ExecutionVerificationView.constants'

export const getActivityId = (step: ExecutionNode): string => {
  return (step?.outcomes?.output?.activityId || step?.progressData?.activityId) as unknown as string
}

export const getDefaultTabId = ({
  getString,
  canEnableMetricsTab,
  canEnableLogsTab,
  tabName
}: {
  getString: UseStringsReturn['getString']
  tabName?: string
  canEnableMetricsTab: boolean
  canEnableLogsTab: boolean
}): string => {
  if (tabName) {
    return tabName
  } else if (canEnableMetricsTab) {
    return getString('pipeline.verification.analysisTab.metrics')
  } else if (canEnableLogsTab) {
    return getString('pipeline.verification.analysisTab.logs')
  } else {
    return getString('pipeline.verification.analysisTab.metrics')
  }
}

const isHealthSourcesPresent = (healthSources: HealthSourceV2[] | null): healthSources is HealthSourceV2[] => {
  return Boolean(healthSources && Array.isArray(healthSources))
}

export const getCanEnableTabByType = (
  healthSources: HealthSourceV2[] | null,
  type: typeof MetricsProviderType | typeof LogsProviderType
): boolean => {
  if (!isHealthSourcesPresent(healthSources)) {
    return false
  }

  return healthSources.some(healthSource => healthSource.providerType === type)
}
