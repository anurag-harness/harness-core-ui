/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as customDashboardServices from 'services/custom-dashboards'
import * as useLicenseStore from 'framework/LicenseStore/LicenseStoreContext'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { Editions } from '@common/constants/SubscriptionTypes'
import { ModuleLicenseDTO } from 'services/cd-ng'
import DashboardsPage from '../DashboardsPage'

const defaultLicenseObj: useLicenseStore.LicenseStoreContextProps = {
  versionMap: {},
  CI_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  FF_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  CCM_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  CD_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  CHAOS_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  STO_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  CV_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  CET_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  SEI_LICENSE_STATE: LICENSE_STATE_VALUES.EXPIRED,
  updateLicenseStore: jest.fn(),
  licenseInformation: {}
}

const renderComponent = ({ children }: React.PropsWithChildren<unknown> = {}): RenderResult =>
  render(
    <TestWrapper>
      <DashboardsPage>{children}</DashboardsPage>
    </TestWrapper>
  )

describe('DashboardsPage', () => {
  const useLicenseStoreMock = jest.spyOn(useLicenseStore, 'useLicenseStore')

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(customDashboardServices, 'useSearchFolders').mockImplementation(() => ({ data: {} } as any))
    jest.spyOn(customDashboardServices, 'useGetModelTags').mockImplementation(() => ({ data: { resource: [] } } as any))
  })

  test('it should display the banner when license edition is not enterprise', async () => {
    const licenseObj: useLicenseStore.LicenseStoreContextProps = {
      ...defaultLicenseObj,
      licenseInformation: {
        CD: {
          status: LICENSE_STATE_VALUES.ACTIVE,
          edition: Editions.FREE
        },
        CE: {
          status: LICENSE_STATE_VALUES.DELETED,
          edition: Editions.ENTERPRISE
        },
        CF: {
          status: LICENSE_STATE_VALUES.EXPIRED,
          edition: Editions.ENTERPRISE
        }
      }
    }
    useLicenseStoreMock.mockReturnValue(licenseObj)

    renderComponent()

    expect(screen.getByText('dashboards.upgrade')).toBeInTheDocument()
  })

  test('it should display the banner when license edition is team for all modules except CCM', async () => {
    const activeTeamLicense: ModuleLicenseDTO = {
      status: LICENSE_STATE_VALUES.ACTIVE,
      edition: Editions.TEAM
    }
    const licenseObj: useLicenseStore.LicenseStoreContextProps = {
      ...defaultLicenseObj,
      licenseInformation: {
        CD: { ...activeTeamLicense },
        CI: { ...activeTeamLicense },
        CF: { ...activeTeamLicense },
        CV: { ...activeTeamLicense },
        SRM: { ...activeTeamLicense },
        STO: { ...activeTeamLicense },
        CHAOS: { ...activeTeamLicense },
        CET: { ...activeTeamLicense }
      }
    }
    useLicenseStoreMock.mockReturnValue(licenseObj)

    renderComponent()

    expect(screen.getByText('dashboards.upgrade')).toBeInTheDocument()
  })

  test('it should not show the banner when license is enterprise', async () => {
    const licenseObj: useLicenseStore.LicenseStoreContextProps = {
      ...defaultLicenseObj,
      licenseInformation: {
        CD: {
          status: LICENSE_STATE_VALUES.ACTIVE,
          edition: Editions.ENTERPRISE
        },
        CE: {
          status: LICENSE_STATE_VALUES.DELETED,
          edition: Editions.ENTERPRISE
        },
        CF: {
          status: LICENSE_STATE_VALUES.EXPIRED,
          edition: Editions.ENTERPRISE
        }
      }
    }
    useLicenseStoreMock.mockReturnValue(licenseObj)

    renderComponent()

    expect(screen.queryByText('dashboards.upgrade')).not.toBeInTheDocument()
  })

  test('it should not show the banner when CCM license is team', async () => {
    const licenseObj: useLicenseStore.LicenseStoreContextProps = {
      ...defaultLicenseObj,
      licenseInformation: {
        CE: {
          status: LICENSE_STATE_VALUES.ACTIVE,
          edition: Editions.TEAM
        }
      }
    }
    useLicenseStoreMock.mockReturnValue(licenseObj)

    renderComponent()

    expect(screen.queryByText('dashboards.upgrade')).not.toBeInTheDocument()
  })
})
