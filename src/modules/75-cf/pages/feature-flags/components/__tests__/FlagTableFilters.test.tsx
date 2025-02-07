/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getByTestId, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeatureFlags from '../../__tests__/mockFeatureFlags'
import { FlagTableFilters, FlagTableFiltersProps } from '../FlagTableFilters'

const renderComponent = (
  flagEnabled: boolean,
  archivingFFEnabled: boolean,
  props?: Partial<FlagTableFiltersProps>
): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      defaultFeatureFlagValues={{
        FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW: flagEnabled,
        FFM_7921_ARCHIVING_FEATURE_FLAGS: archivingFFEnabled
      }}
    >
      <FlagTableFilters
        features={mockFeatureFlags as any}
        currentFilter={{}}
        updateTableFilter={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

const permanentFlagsFilter = {
  queryProps: { key: 'lifetime', value: 'permanent' },
  label: 'cf.flagFilters.permanent',
  total: mockFeatureFlags.featureCounts.totalPermanent,
  tooltipId: 'ff_flagFilters_permanentFlags'
}

describe('FlagTableFilters', () => {
  test('It should render correctly the filters for feature flags', async () => {
    const flagEnabled = true
    const archivingFFEnabled = false

    renderComponent(flagEnabled, archivingFFEnabled)

    const { featureCounts } = mockFeatureFlags

    const filterCards = screen.getAllByTestId('filter-card')
    expect(filterCards).toHaveLength(6)

    // All Flags
    expect(getByTestId(filterCards[0], 'filter-label')).toHaveTextContent('cf.flagFilters.allFlags')
    expect(getByTestId(filterCards[0], 'filter-total')).toHaveTextContent(`${featureCounts.totalFeatures}`)
    expect(filterCards[0]).toHaveClass('Card--selected')

    // Enabled Flags
    expect(getByTestId(filterCards[1], 'filter-label')).toHaveTextContent('cf.flagFilters.enabled')
    expect(getByTestId(filterCards[1], 'filter-total')).toHaveTextContent(`${featureCounts.totalEnabled}`)

    // Permanent Flags
    expect(getByTestId(filterCards[2], 'filter-label')).toHaveTextContent('cf.flagFilters.permanent')
    expect(getByTestId(filterCards[2], 'filter-total')).toHaveTextContent(`${featureCounts.totalPermanent}`)

    // Recently Accessed Flags
    expect(getByTestId(filterCards[3], 'filter-label')).toHaveTextContent('cf.flagFilters.recentlyAccessed')
    expect(getByTestId(filterCards[3], 'filter-total')).toHaveTextContent(`${featureCounts.totalRecentlyAccessed}`)

    // Active Flags
    expect(getByTestId(filterCards[4], 'filter-label')).toHaveTextContent('cf.flagFilters.active')
    expect(getByTestId(filterCards[4], 'filter-total')).toHaveTextContent(`${featureCounts.totalActive}`)

    // Potentially Stale Flags
    expect(getByTestId(filterCards[5], 'filter-label')).toHaveTextContent('cf.flagFilters.potentiallyStale')
    expect(getByTestId(filterCards[5], 'filter-total')).toHaveTextContent(`${featureCounts.totalPotentiallyStale}`)
  })

  test('It should apply selected style to the filter card that matches currentFilter', async () => {
    const flagEnabled = true
    const archivingFFEnabled = false

    renderComponent(flagEnabled, archivingFFEnabled, { currentFilter: permanentFlagsFilter })

    expect(screen.getByText('cf.flagFilters.allFlags')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.enabled')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.permanent')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.permanent').closest('div[data-testid="filter-card"]')).toHaveClass(
      'Card--selected'
    )
    expect(screen.getByText('cf.flagFilters.recentlyAccessed')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.active')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.potentiallyStale')).toBeVisible()
  })

  test('It should call update filter method on click of a filter card', async () => {
    const flagEnabled = true
    const archivingFFEnabled = false

    const updateTableFilter = jest.fn()

    renderComponent(flagEnabled, archivingFFEnabled, { updateTableFilter })

    expect(screen.getByText('cf.flagFilters.allFlags')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.enabled')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.permanent')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.recentlyAccessed')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.active')).toBeVisible()
    expect(screen.getByText('cf.flagFilters.potentiallyStale')).toBeVisible()

    await userEvent.click(screen.getByText('cf.flagFilters.permanent'))

    await waitFor(() => {
      expect(updateTableFilter).toBeCalledWith(permanentFlagsFilter)
    })
  })

  test('It should display totals as 0 when there are no feature flags', async () => {
    const flagEnabled = true
    const archivingFFEnabled = false

    renderComponent(flagEnabled, archivingFFEnabled, { features: null })

    const filterCards = screen.getAllByTestId('filter-card')
    expect(filterCards).toHaveLength(6)
    // first card selected (all/default)
    expect(getByTestId(filterCards[0], 'filter-label')).toHaveTextContent('cf.flagFilters.allFlags')
    expect(getByTestId(filterCards[0], 'filter-total')).toHaveTextContent('0')
    expect(filterCards[0]).toHaveClass('Card--selected')

    // rest of cards
    expect(getByTestId(filterCards[1], 'filter-total')).toHaveTextContent('0')
    expect(getByTestId(filterCards[2], 'filter-total')).toHaveTextContent('0')
    expect(getByTestId(filterCards[3], 'filter-total')).toHaveTextContent('0')
    expect(getByTestId(filterCards[4], 'filter-total')).toHaveTextContent('0')
    expect(getByTestId(filterCards[5], 'filter-total')).toHaveTextContent('0')
  })

  test('It should not show Active Flags card if FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW is disabled', async () => {
    const flagEnabled = false
    const archivingFFEnabled = false

    renderComponent(flagEnabled, archivingFFEnabled)

    const filterCards = screen.getAllByTestId('filter-card')
    expect(filterCards).toHaveLength(5)

    // All Flags
    expect(getByTestId(filterCards[0], 'filter-label')).toHaveTextContent('cf.flagFilters.allFlags')
    expect(getByTestId(filterCards[1], 'filter-label')).toHaveTextContent('cf.flagFilters.enabled')
    expect(getByTestId(filterCards[2], 'filter-label')).toHaveTextContent('cf.flagFilters.permanent')
    expect(getByTestId(filterCards[3], 'filter-label')).toHaveTextContent('cf.flagFilters.recentlyAccessed')
    expect(getByTestId(filterCards[4], 'filter-label')).toHaveTextContent('cf.flagFilters.potentiallyStale')

    // Check 'Active Flags' filter does not exist
    expect(screen.queryByText('cf.flagFilters.active')).not.toBeInTheDocument()
  })

  test('It should show Archived card if FFM_7921_ARCHIVING_FEATURE_FLAGS is toggled ON', async () => {
    const flagEnabled = false
    const archivingFFEnabled = true

    renderComponent(flagEnabled, archivingFFEnabled)

    const filterCards = screen.getAllByTestId('filter-card')
    expect(filterCards).toHaveLength(6)

    // All Flags
    expect(getByTestId(filterCards[0], 'filter-label')).toHaveTextContent('cf.flagFilters.allFlags')
    expect(getByTestId(filterCards[1], 'filter-label')).toHaveTextContent('cf.flagFilters.enabled')
    expect(getByTestId(filterCards[2], 'filter-label')).toHaveTextContent('cf.flagFilters.permanent')
    expect(getByTestId(filterCards[3], 'filter-label')).toHaveTextContent('cf.flagFilters.recentlyAccessed')
    expect(getByTestId(filterCards[4], 'filter-label')).toHaveTextContent('cf.flagFilters.potentiallyStale')
    expect(getByTestId(filterCards[5], 'filter-label')).toHaveTextContent('cf.flagFilters.archivedFlags')
  })

  test('It should not show Archived card if FFM_7921_ARCHIVING_FEATURE_FLAGS is toggled OFF', async () => {
    const flagEnabled = false
    const archivingFFEnabled = false

    renderComponent(flagEnabled, archivingFFEnabled)

    const filterCards = screen.getAllByTestId('filter-card')
    expect(filterCards).toHaveLength(5)

    expect(getByTestId(filterCards[0], 'filter-label')).toHaveTextContent('cf.flagFilters.allFlags')
    expect(getByTestId(filterCards[1], 'filter-label')).toHaveTextContent('cf.flagFilters.enabled')
    expect(getByTestId(filterCards[2], 'filter-label')).toHaveTextContent('cf.flagFilters.permanent')
    expect(getByTestId(filterCards[3], 'filter-label')).toHaveTextContent('cf.flagFilters.recentlyAccessed')
    expect(getByTestId(filterCards[4], 'filter-label')).toHaveTextContent('cf.flagFilters.potentiallyStale')

    expect(screen.queryByText('cf.flagFilters.archivedFlags')).not.toBeInTheDocument()
  })

  test('It should still show Archived card if there are no archived flags', async () => {
    const mockFeaturesFlagWithNoArchivedFlags = Object.assign(
      { ...mockFeatureFlags.featureCounts },
      { totalArchived: 0 }
    ) as any

    mockFeaturesFlagWithNoArchivedFlags.features = [...mockFeatureFlags.features]

    const flagEnabled = false
    const archivingFFEnabled = true
    renderComponent(flagEnabled, archivingFFEnabled, { features: mockFeaturesFlagWithNoArchivedFlags })

    const filterCards = screen.getAllByTestId('filter-card')
    expect(filterCards).toHaveLength(6)

    expect(getByTestId(filterCards[0], 'filter-label')).toHaveTextContent('cf.flagFilters.allFlags')
    expect(getByTestId(filterCards[1], 'filter-label')).toHaveTextContent('cf.flagFilters.enabled')
    expect(getByTestId(filterCards[2], 'filter-label')).toHaveTextContent('cf.flagFilters.permanent')
    expect(getByTestId(filterCards[3], 'filter-label')).toHaveTextContent('cf.flagFilters.recentlyAccessed')
    expect(getByTestId(filterCards[4], 'filter-label')).toHaveTextContent('cf.flagFilters.potentiallyStale')
    expect(getByTestId(filterCards[5], 'filter-label')).toHaveTextContent('cf.flagFilters.archivedFlags')
  })
})
