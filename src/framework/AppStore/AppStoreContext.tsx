/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useEffect } from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'

import { defaultTo, fromPairs } from 'lodash-es'
import { withFeatureFlags } from '@harnessio/ff-react-client-sdk'

// useToaster not imported from '@common/exports' to prevent circular dependency
import { PageSpinner, useToaster } from '@harness/uicore'

import { useQueryParams } from '@common/hooks'
import {
  Project,
  getProjectPromise,
  useGetCurrentUserInfo,
  UserInfo,
  isGitSyncEnabledPromise,
  GitEnabledDTO,
  Organization,
  useGetOrganization,
  useGetAccountNG,
  AccountDTO
} from 'services/cd-ng'
import { useGetFeatureFlags } from 'services/portal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { FeatureFlag } from '@common/featureFlags'
import { useTelemetryInstance } from '@common/hooks/useTelemetryInstance'
import type { Module } from 'framework/types/ModuleName'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import routes from '@common/RouteDefinitions'
import type { Error } from 'services/cd-ng'
import { getLocationPathName } from 'framework/utils/WindowLocation'
import SecureStorage from 'framework/utils/SecureStorage'
import { getModuleToDefaultURLMap } from 'framework/LicenseStore/licenseStoreUtil'

export type FeatureFlagMap = Partial<Record<FeatureFlag, boolean>>

/**
 * Application Store - essential application-level states which are shareable
 * across Framework and Modules. These states are writeable within Frameworks.
 * Modules are allowed to read only.
 */
export interface AppStoreContextProps {
  readonly selectedProject?: Project
  readonly selectedOrg?: Organization
  readonly isGitSyncEnabled?: boolean
  readonly isGitSimplificationEnabled?: boolean // DB state for a project
  readonly supportingGitSimplification?: boolean // Computed value based on multiple flags
  readonly gitSyncEnabledOnlyForFF?: boolean
  readonly supportingTemplatesGitx?: boolean
  readonly connectivityMode?: GitEnabledDTO['connectivityMode'] //'MANAGER' | 'DELEGATE'
  readonly currentUserInfo: UserInfo
  readonly accountInfo: AccountDTO
  /** feature flags */
  readonly featureFlags: FeatureFlagMap

  updateAppStore(
    data: Partial<
      Pick<
        AppStoreContextProps,
        'selectedOrg' | 'selectedProject' | 'isGitSyncEnabled' | 'connectivityMode' | 'currentUserInfo' | 'accountInfo'
      >
    >
  ): void
}

export interface SavedProjectDetails {
  projectIdentifier: string
  orgIdentifier: string
  name?: string
}

export const AppStoreContext = React.createContext<AppStoreContextProps>({
  featureFlags: {},
  currentUserInfo: { uuid: '' },
  isGitSyncEnabled: false,
  connectivityMode: undefined,
  accountInfo: {},
  updateAppStore: () => void 0
})

const MAX_RECENT_PROJECTS_COUNT = 5

export function useAppStore(): AppStoreContextProps {
  return React.useContext(AppStoreContext)
}

const getIdentifiersFromSavedProj = (savedProject: SavedProjectDetails): SavedProjectDetails => {
  return {
    projectIdentifier: defaultTo(savedProject?.projectIdentifier, ''),
    orgIdentifier: defaultTo(savedProject?.orgIdentifier, '')
  }
}

const getRedirectionUrl = (accountId: string, source: string | undefined): string => {
  const baseUrl = getLocationPathName().replace(/\/ng\//, '/')
  const dashboardUrl = `${baseUrl}#/account/${accountId}/dashboard`
  const onboardingUrl = `${baseUrl}#/account/${accountId}/onboarding`
  return source === 'signup' ? onboardingUrl : dashboardUrl
}

export const AppStoreProvider = withFeatureFlags<React.PropsWithChildren<unknown>>(function AppStoreProvider({
  children,
  flags: featureFlags,
  loading: loadingFeatureFlags
}): ReactElement {
  const { showError } = useToaster()
  const history = useHistory()

  const {
    accountId,
    projectIdentifier: projectIdentifierFromPath,
    orgIdentifier: orgIdentifierFromPath
  } = useParams<ProjectPathProps>()
  let projectIdentifier = projectIdentifierFromPath
  let orgIdentifier = orgIdentifierFromPath

  const {
    preference: savedProject,
    setPreference: setSavedProject,
    clearPreference: clearSavedProject
  } = usePreferenceStore<SavedProjectDetails>(PreferenceScope.USER, 'savedProject')

  const { preference: recentProjects = [], setPreference: setRecentProjects } = usePreferenceStore<
    SavedProjectDetails[]
  >(PreferenceScope.ACCOUNT, 'recentProjects')

  const [state, setState] = React.useState<Omit<AppStoreContextProps, 'updateAppStore' | 'strings'>>({
    featureFlags: {},
    currentUserInfo: { uuid: '' },
    isGitSyncEnabled: false,
    isGitSimplificationEnabled: undefined,
    supportingGitSimplification: true,
    gitSyncEnabledOnlyForFF: false,
    supportingTemplatesGitx: false,
    connectivityMode: undefined,
    accountInfo: {}
  })

  if (!projectIdentifier && !orgIdentifier) {
    const identifiersFromSavedProj = getIdentifiersFromSavedProj(savedProject)
    projectIdentifier = identifiersFromSavedProj.projectIdentifier
    orgIdentifier = identifiersFromSavedProj.orgIdentifier
  }

  const {
    data: legacyFeatureFlags,
    loading: legacyFeatureFlagsLoading,
    refetch: fetchLegacyFeatureFlags
  } = useGetFeatureFlags({
    accountId,
    pathParams: { accountId },
    lazy: true
  })

  const { refetch: refetchOrg, data: orgDetails } = useGetOrganization({
    identifier: orgIdentifier,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const { data: userInfo, loading: userInfoLoading } = useGetCurrentUserInfo({
    queryParams: { accountIdentifier: accountId }
  })

  const { source, module } = useQueryParams<{ source?: string; module?: Module }>()

  const isPurposePage = useRouteMatch(
    routes.toPurpose({
      accountId
    })
  )

  const { data: accountData } = useGetAccountNG({ accountIdentifier: accountId })

  useEffect(() => {
    if (accountData?.data) {
      const accountInfo = accountData?.data
      setState(prevState => ({
        ...prevState,
        accountInfo
      }))

      if (accountInfo?.sessionTimeoutInMinutes) {
        SecureStorage.set('sessionTimeOutInMinutes', accountInfo.sessionTimeoutInMinutes)
      }
    }
  }, [accountData])

  const redirectUserToModuleHome = (featureFlagsMap: Partial<Record<FeatureFlag, boolean>>): void => {
    if (featureFlagsMap.CREATE_DEFAULT_PROJECT && source === 'signup' && module && !isPurposePage) {
      const moduleUrlWithDefaultProject = getModuleToDefaultURLMap(accountId, module)[module]
      history.push(moduleUrlWithDefaultProject ? (moduleUrlWithDefaultProject as string) : routes.toHome({ accountId }))
    }
  }
  const showErrorAndRedirect = (getProjectResponse: Error): void => {
    if (projectIdentifierFromPath && orgIdentifierFromPath) {
      showError(getProjectResponse?.message)

      // send the user to Projects Listing
      history.push(routes.toProjects({ accountId }))
    }
  }

  useEffect(() => {
    const currentAccount = userInfo?.data?.accounts?.find(account => account.uuid === accountId)
    // don't redirect on local because it goes into infinite loop
    // because there may be no current gen to go to
    if (!__DEV__ && currentAccount && !currentAccount.nextGenEnabled) {
      window.location.href = getRedirectionUrl(accountId, source)
    }
    if (currentAccount) {
      localStorage.setItem('defaultExperience', currentAccount.defaultExperience || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.data?.accounts])

  // here we don't use hook useTelemetry to avoid circular dependencies
  const telemetry = useTelemetryInstance()
  useEffect(() => {
    if (userInfo?.data?.email && telemetry.initialized) {
      telemetry.identify({ userId: userInfo?.data?.email })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.data?.email, telemetry])

  // update feature flags in context
  useEffect(() => {
    // TODO: Handle better if fetching feature flags fails
    if (legacyFeatureFlags) {
      const featureFlagsMap: FeatureFlagMap = fromPairs(
        legacyFeatureFlags?.resource?.map(flag => {
          return [flag.name, !!flag.enabled]
        })
      )

      if (__DEV__ && DEV_FF) {
        Object.assign(featureFlagsMap, DEV_FF)
      }

      setState(prevState => ({
        ...prevState,
        featureFlags: featureFlagsMap
      }))

      redirectUserToModuleHome(featureFlagsMap)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacyFeatureFlags])

  useEffect(() => {
    if (window.featureFlagsConfig.useLegacyFeatureFlags) {
      fetchLegacyFeatureFlags()
    }
  }, [fetchLegacyFeatureFlags])

  useEffect(() => {
    if (!window.featureFlagsConfig.useLegacyFeatureFlags && !loadingFeatureFlags) {
      const featureFlagsMap = { ...featureFlags }

      if (__DEV__ && DEV_FF) {
        Object.assign(featureFlagsMap, DEV_FF)
      }

      setState(prevState => ({
        ...prevState,
        featureFlags: featureFlagsMap
      }))
      redirectUserToModuleHome(featureFlagsMap)
    }
  }, [featureFlags, loadingFeatureFlags])

  useEffect(() => {
    if (
      state.featureFlags &&
      Object.keys(state.featureFlags).length > 0 &&
      typeof state.isGitSimplificationEnabled === 'boolean'
    ) {
      if (state.isGitSimplificationEnabled && state.isGitSyncEnabled) {
        // Old git experience and git simplification should never be true together
        // logging to bugsnag if it happens
        window.bugsnagClient?.notify?.(new Error(`Inconsistent git sync state for account ${accountId}`))
      }
    }
  }, [state.featureFlags, state.isGitSimplificationEnabled, state.isGitSyncEnabled])

  // Update gitSyncEnabled when selectedProject changes
  useEffect(() => {
    // For gitSync, using path params instead of project/org from PreferenceFramework
    // Need to check oldGitSync is enabled or not irrespective of USE_OLD_GIT_SYNC FF
    // Should wait for featureFlags API response to avoid duplicate calls again
    if (projectIdentifierFromPath && Object.keys(state.featureFlags)?.length) {
      isGitSyncEnabledPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: orgIdentifierFromPath,
          projectIdentifier: projectIdentifierFromPath
        }
      }).then((response: GitEnabledDTO) => {
        const gitXEnabled = !!response?.gitSimplificationEnabled
        const oldGitSyncEnabled = !!response?.gitSyncEnabled
        const gitSyncEnabledOnlyForFF = !!response?.gitSyncEnabledOnlyForFF
        const supportingGitSimplification =
          ((gitXEnabled || !state.featureFlags['USE_OLD_GIT_SYNC']) && !oldGitSyncEnabled) || gitSyncEnabledOnlyForFF
        setState(prevState => ({
          ...prevState,
          isGitSyncEnabled: oldGitSyncEnabled,
          connectivityMode: response?.connectivityMode,
          isGitSimplificationEnabled: gitXEnabled,
          supportingGitSimplification,
          gitSyncEnabledOnlyForFF: gitSyncEnabledOnlyForFF,
          supportingTemplatesGitx: supportingGitSimplification
        }))
      })
    } else {
      setState(prevState => ({
        ...prevState,
        isGitSyncEnabled: false,
        connectivityMode: undefined,
        isGitSimplificationEnabled: false,
        supportingGitSimplification: true,
        supportingTemplatesGitx: !state.featureFlags['USE_OLD_GIT_SYNC'],
        gitSyncEnabledOnlyForFF: false
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.selectedProject,
    projectIdentifierFromPath,
    orgIdentifierFromPath,
    state.isGitSyncEnabled,
    state.featureFlags['USE_OLD_GIT_SYNC']
  ])

  // set selectedOrg when orgDetails are fetched
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedOrg: orgDetails?.data?.organization
    }))
  }, [orgDetails?.data?.organization])

  // When projectIdentifier in URL changes, fetch projectDetails, and update selectedProject & savedProject-preference
  useEffect(() => {
    if (projectIdentifier && orgIdentifier) {
      getProjectPromise({
        identifier: projectIdentifier,
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier
        }
      })
        .then(response => {
          const project = response?.data?.project

          if (project) {
            setState(prevState => ({
              ...prevState,
              selectedProject: project
            }))
            const indexInRecentProjects = recentProjects.findIndex(item => item.projectIdentifier === projectIdentifier)
            const recentProjectsCopy = [...recentProjects]

            if (indexInRecentProjects > -1) {
              recentProjectsCopy.splice(indexInRecentProjects, 1)
            } else if (recentProjectsCopy.length === MAX_RECENT_PROJECTS_COUNT) {
              recentProjectsCopy.splice(recentProjectsCopy.length - 1, 1)
            }

            setSavedProject({ projectIdentifier, orgIdentifier })
            setRecentProjects([{ projectIdentifier, orgIdentifier, name: project.name }, ...recentProjectsCopy])
          } else {
            // if no project was fetched, clear preference
            clearSavedProject()
            setState(prevState => ({
              ...prevState,
              selectedOrg: undefined,
              selectedProject: undefined
            }))
            // if user is on a URL with projectId and orgId in path, show toast error & redirect
            showErrorAndRedirect(response as Error)
          }
        })
        .catch(err => {
          showError(err?.message)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier, orgIdentifier])
  // update selectedOrg when orgidentifier in url changes
  useEffect(() => {
    if (orgIdentifier) {
      refetchOrg()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgIdentifier])
  // clear selectedProject selectedOrg when accountId changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedProject: undefined,
      selectedOrg: undefined
    }))
  }, [accountId])

  React.useEffect(() => {
    if (userInfo?.data) {
      const user = userInfo.data
      setState(prevState => ({
        ...prevState,
        currentUserInfo: user
      }))
    }
    //TODO: Logout if we don't have userInfo???
  }, [userInfo?.data])

  function updateAppStore(
    data: Partial<
      Pick<
        AppStoreContextProps,
        'selectedOrg' | 'selectedProject' | 'isGitSyncEnabled' | 'connectivityMode' | 'currentUserInfo' | 'accountInfo'
      >
    >
  ): void {
    setState(prevState => ({
      ...prevState,
      selectedOrg: data.selectedOrg,
      selectedProject: data.selectedProject,
      isGitSyncEnabled: defaultTo(data.isGitSyncEnabled, prevState?.isGitSyncEnabled),
      connectivityMode: defaultTo(data.connectivityMode, prevState?.connectivityMode),
      currentUserInfo: defaultTo(data.currentUserInfo, prevState?.currentUserInfo),
      accountInfo: defaultTo(data.accountInfo, prevState?.accountInfo)
    }))
  }

  return (
    <AppStoreContext.Provider
      value={{
        ...state,
        updateAppStore
      }}
    >
      {loadingFeatureFlags || legacyFeatureFlagsLoading || userInfoLoading ? <PageSpinner /> : children}
    </AppStoreContext.Provider>
  )
})
