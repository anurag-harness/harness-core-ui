/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'

import { useHistory, useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { PageError, PageSpinner } from '@harness/uicore'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { HomePageTemplate } from '@projects-orgs/pages/HomePageTemplate/HomePageTemplate'
import routes from '@common/RouteDefinitions'
import { GetLicensesAndSummaryQueryParams, Project, useGetLicensesAndSummary } from 'services/cd-ng'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import bgImageURL from './images/sei.png'

const SEIHomePage: React.FC = () => {
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()
  const history = useHistory()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const { accountId } = useParams<AccountPathProps>()
  const moduleType = ModuleName.SEI
  const module = 'sei'

  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG

  const { data, error, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType: moduleType as GetLicensesAndSummaryQueryParams['moduleType'] },
    accountIdentifier: accountId,
    lazy: true
  })

  const expiryTime = data?.data?.maxExpiryTime
  const updatedLicenseInfo = data?.data && {
    ...licenseInformation?.[ModuleName.SEI],
    ...pick(data?.data, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    const message = (error?.data as Error)?.message || error?.message
    return <PageError message={message} onClick={() => refetch()} />
  }

  const showTrialPages = createdFromNG || NG_LICENSES_ENABLED

  if (showTrialPages && data?.status === 'SUCCESS' && !data.data) {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module
      })
    )
  }

  // projectCreateSuccessHandler: redirects to the project dashboard upon selection from new project modal
  const projectCreateSuccessHandler = (project?: Project): void => {
    if (project) {
      history.push(
        routes.toProjectOverview({
          projectIdentifier: project.identifier,
          orgIdentifier: project.orgIdentifier || '',
          accountId,
          module
        })
      )
    }
  }

  return (
    <HomePageTemplate
      title={getString('common.purpose.sei.fullName')}
      bgImageUrl={bgImageURL}
      projectCreateSuccessHandler={projectCreateSuccessHandler}
      subTitle={getString('common.purpose.sei.descriptionOnly')}
      documentText={getString('sei.learnMore')}
      documentURL={'https://www.harness.io/products/software-engineering-insights'}
    />
  )
}

export default SEIHomePage
