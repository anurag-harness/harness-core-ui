/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Color } from '@harness/design-system'
import { FilterProps, TableFilters } from '@cf/components/TableFilters/TableFilters'
import type { Features } from 'services/cf'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FeatureFlagStatus } from '../FlagStatus'
export interface FlagTableFiltersProps {
  features: Features | null
  currentFilter: FilterProps | Record<string, any>
  updateTableFilter: (filter: FilterProps | Record<string, any>) => void
}

export enum FlagFilterKeys {
  LIFETIME = 'lifetime',
  STATUS = 'status',
  ENABLED = 'enabled',
  ARCHIVED = 'archived'
}

export const FlagFilterValues = {
  ...FeatureFlagStatus,
  ACTIVE: 'active',
  PERMANENT: 'permanent'
}

export const featureFlagFilters = (features: Features | null): Array<FilterProps> => [
  {
    queryProps: {},
    label: 'cf.flagFilters.allFlags',
    total: features?.featureCounts?.totalFeatures || 0,
    tooltipId: 'ff_flagFilters_allFlags'
  },
  {
    queryProps: { key: FlagFilterKeys.ENABLED, value: 'true' },
    label: 'cf.flagFilters.enabled',
    total: features?.featureCounts?.totalEnabled || 0,
    tooltipId: 'ff_flagFilters_enabledFlags'
  },
  {
    queryProps: { key: FlagFilterKeys.LIFETIME, value: FlagFilterValues.PERMANENT },
    label: 'cf.flagFilters.permanent',
    total: features?.featureCounts?.totalPermanent || 0,
    tooltipId: 'ff_flagFilters_permanentFlags'
  },
  {
    queryProps: { key: FlagFilterKeys.STATUS, value: FlagFilterValues.RECENTLY_ACCESSED },
    label: 'cf.flagFilters.recentlyAccessed',
    total: features?.featureCounts?.totalRecentlyAccessed || 0,
    tooltipId: 'ff_flagFilters_recentlyAccessed'
  },
  {
    queryProps: { key: FlagFilterKeys.STATUS, value: FlagFilterValues.ACTIVE },
    label: 'cf.flagFilters.active',
    total: features?.featureCounts?.totalActive || 0,
    tooltipId: 'ff_flagFilters_activeFlags',
    filterTotalColor: Color.PRIMARY_5
  },
  {
    queryProps: { key: FlagFilterKeys.STATUS, value: FlagFilterValues.POTENTIALLY_STALE },
    label: 'cf.flagFilters.potentiallyStale',
    total: features?.featureCounts?.totalPotentiallyStale || 0,
    tooltipId: 'ff_flagFilters_potentiallyStaleFlags',
    filterTotalColor: Color.ORANGE_800
  },
  {
    queryProps: { key: FlagFilterKeys.ARCHIVED, value: 'true' },
    label: 'cf.flagFilters.archivedFlags',
    total: features?.featureCounts?.totalArchived || 0,
    filterTotalColor: Color.GREY_700,
    tooltipId: 'ff_flagFilters_archivedFlags'
  }
]

export const FlagTableFilters: FC<FlagTableFiltersProps> = ({ features, currentFilter, updateTableFilter }) => {
  const {
    FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW: DISPLAY_ACTIVE_FILTER,
    FFM_7921_ARCHIVING_FEATURE_FLAGS: ARCHIVING_FEATURE_FLAGS
  } = useFeatureFlags()
  let filters = featureFlagFilters(features)

  // remove 'Active Flags' filter card if feature flag FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW is not enabled
  if (!DISPLAY_ACTIVE_FILTER) {
    filters = filters.filter(filter => filter.label !== 'cf.flagFilters.active')
  }

  // remove 'Archived Flags' filter card if Archiving FF is toggled OFF
  if (!ARCHIVING_FEATURE_FLAGS) {
    filters = filters.filter(filter => filter.label !== 'cf.flagFilters.archivedFlags')
  }

  return <TableFilters filters={filters} currentFilter={currentFilter} updateTableFilter={updateTableFilter} />
}
