/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, Suspense } from 'react'

import { useParams } from 'react-router-dom'
import { RestfulProvider } from 'restful-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { FocusStyleManager } from '@blueprintjs/core'
import { PageSpinner, useToaster, MULTI_TYPE_INPUT_MENU_LEARN_MORE_STORAGE_KEY } from '@harness/uicore'
import { HELP_PANEL_STORAGE_KEY } from '@harness/help-panel'
import { setAutoFreeze, enableMapSet } from 'immer'
import { debounce } from 'lodash-es'
import SessionToken from 'framework/utils/SessionToken'
import useOpenApiClients from 'framework/hooks/useOpenAPIClients'
import { queryClient } from 'services/queryClient'
import { AppStoreProvider } from 'framework/AppStore/AppStoreContext'
import { PreferenceStoreProvider, PREFERENCES_TOP_LEVEL_KEY } from 'framework/PreferenceStore/PreferenceStoreContext'

import { LicenseStoreProvider } from 'framework/LicenseStore/LicenseStoreContext'
// eslint-disable-next-line aliased-module-imports
import RouteDestinationsWithoutAuth from 'modules/RouteDestinationsWithoutAuth'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { StringsContextProvider } from 'framework/strings/StringsContextProvider'
import { useLogout, ErrorCode } from 'framework/utils/SessionUtils'
import SecureStorage from 'framework/utils/SecureStorage'
import { SideNavProvider } from 'framework/SideNavStore/SideNavContext'
import { useRefreshToken } from 'services/portal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { REFERER_URL } from '@common/utils/utils'
import { PermissionsProvider } from 'framework/rbac/PermissionsContext'
import { FeaturesProvider } from 'framework/featureStore/FeaturesContext'
import { ThirdPartyIntegrations } from '3rd-party/ThirdPartyIntegrations'
import { useGlobalEventListener } from '@common/hooks'
import HelpPanelProvider from 'framework/utils/HelpPanelProvider'
import { ToolTipProvider } from 'framework/tooltip/TooltipContext'
import { FeatureFlagsProvider } from 'framework/FeatureFlags/FeatureFlagsProvider'
import './App.scss'

const RouteDestinations = React.lazy(() => import('modules/RouteDestinations'))

const TOO_MANY_REQUESTS_MESSAGE = 'Too many requests received, please try again later'

const NOT_WHITELISTED_IP_MESSAGE = 'NOT_WHITELISTED_IP_MESSAGE'

FocusStyleManager.onlyShowFocusOnTabs()
SecureStorage.registerCleanupException(PREFERENCES_TOP_LEVEL_KEY)
SecureStorage.registerCleanupException(MULTI_TYPE_INPUT_MENU_LEARN_MORE_STORAGE_KEY)
SecureStorage.registerCleanupException(HELP_PANEL_STORAGE_KEY)
SecureStorage.registerCleanupException(REFERER_URL)
SecureStorage.registerCleanupSessionException(NOT_WHITELISTED_IP_MESSAGE)

// set up Immer
setAutoFreeze(false)
enableMapSet()

interface AppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strings: Record<string, any>
}
const LEAST_REFRESH_TIME_MINUTES = 15
const MAX_REFRESH_TIME_MINUTES = 120
const REFRESH_TIME_PERCENTAGE = 5

export const getRequestOptions = (): Partial<RequestInit> => {
  const token = SessionToken.getToken()
  const headers: RequestInit['headers'] = {}

  if (token && token.length > 0) {
    if (!window.noAuthHeader) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return { headers }
}

const getNotWhitelistedMessage = (res: any): any => {
  return (res?.body || res)?.responseMessages?.find((message: any) => message?.code === 'NOT_WHITELISTED_IP')
}

const notifyBugsnag = (
  errorString: string,
  metadataString: string,
  response: any,
  username: string,
  accountId: string
): void => {
  window.bugsnagClient?.notify?.(
    new Error(errorString),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function (event: any) {
      event.severity = 'error'
      event.setUser(username)
      event.addMetadata(metadataString, {
        url: response.url,
        status: response.status,
        accountId
      })
    }
  )
}

export function AppWithAuthentication(props: AppProps): React.ReactElement {
  const { showError } = useToaster()
  const username = SessionToken.username()
  // always use accountId from URL, and not from local storage
  // if user lands on /, they'll first get redirected to a path with accountId
  const { accountId } = useParams<AccountPathProps>()
  const { forceLogout } = useLogout()
  const globalResponseHandler = (response: Response): void => {
    if (!response.ok) {
      switch (response.status) {
        case 401: {
          response
            .clone()
            .json()
            .then(res => {
              const notWhiteListedMessage = getNotWhitelistedMessage(res)
              if (notWhiteListedMessage) {
                const msg = notWhiteListedMessage.message
                showError(msg)
                // NG-Auth-UI expects to read "NOT_WHITELISTED_IP_MESSAGE" from session
                sessionStorage.setItem(NOT_WHITELISTED_IP_MESSAGE, msg)
                forceLogout(ErrorCode.unauth)
              }
            })
            .catch(() => {
              notifyBugsnag('Error handling 401 status code', '401 Details', response, username, accountId)
            })
            .finally(() => {
              forceLogout()
              return
            })
          break
        }
        case 400: {
          response
            .clone()
            .json()
            .then(res => {
              const notWhiteListedMessage = getNotWhitelistedMessage(res)
              if (notWhiteListedMessage) {
                showError(notWhiteListedMessage.message)
                forceLogout()
              }
            })
            .catch(() => {
              notifyBugsnag('Error handling 400 status code', '400 Details', response, username, accountId)
            })
          return
        }
        case 429: {
          response
            .clone()
            .json()
            .then(res => {
              showError(res.message || TOO_MANY_REQUESTS_MESSAGE)
            })
        }
      }
    }
  }

  useOpenApiClients(globalResponseHandler, accountId)

  const getQueryParams = React.useCallback(() => {
    return {
      routingId: accountId
    }
  }, [accountId])

  const {
    data: refreshTokenResponse,
    refetch: refreshToken,
    loading: refreshingToken
  } = useRefreshToken({
    lazy: true,
    requestOptions: getRequestOptions()
  })

  useEffect(() => {
    SecureStorage.set('acctId', accountId)
  }, [accountId])

  useEffect(() => {
    const token = SessionToken.getToken()
    if (!token) {
      forceLogout()
    }
  }, [forceLogout])

  useEffect(() => {
    if (refreshTokenResponse?.resource) {
      // Token will be auto-set in cookie via the header "set-cookie"
      // [TEMPORARY]: Saving the new token in storage. Can remove this next line after complete migration to cookie
      SecureStorage.set('token', refreshTokenResponse.resource)

      SecureStorage.set('lastTokenSetTime', Date.now())
    }
  }, [refreshTokenResponse])

  //  calling Refreshtoken api on REFRESH_TIME_PERCENTAGE of token expiry time,
  // like if the token expiry time (i.e, difference between expiry time  and issued time ) is
  // 24 hours we would be calling the refresh token api on every 1.2 hours, if refresh time  is below LEAST_REFRESH_TIME
  // we would round it off to LEAST_REFRESH_TIME of  if more than MAX_REFRESH_TIME then will round it off to MAX_REFRESH_TIME
  const checkAndRefreshToken = debounce(function checkAndRefreshTokenFun() {
    const currentTime = Date.now()
    const milliSecondsToMinutes = 1000 * 60 // 1000 milliseconds is equal to 1 second, 60 seconds equal to one minute
    const lastTokenSetTime = SessionToken.getLastTokenSetTime() as number

    let refreshInterval = SessionToken.getSessionTimeOutInMinutes()
    if (refreshInterval) {
      refreshInterval = (refreshInterval / 100) * REFRESH_TIME_PERCENTAGE
      refreshInterval = Math.min(Math.max(refreshInterval, LEAST_REFRESH_TIME_MINUTES), MAX_REFRESH_TIME_MINUTES)

      const differenceInMinutes = (currentTime - lastTokenSetTime) / milliSecondsToMinutes
      if (differenceInMinutes > refreshInterval && !refreshingToken) {
        refreshToken({ queryParams: getQueryParams() as any, requestOptions: getRequestOptions() })
      }
    }
  }, 2000)

  useEffect(() => {
    // considering user to be active when user is either doing mouse or key board events
    document?.addEventListener('mousedown', checkAndRefreshToken)
    document?.addEventListener('keypress', checkAndRefreshToken)

    const removeEventListners = () => {
      document?.removeEventListener('mousedown', checkAndRefreshToken)
      document?.removeEventListener('keypress', checkAndRefreshToken)
    }
    return removeEventListners
  }, [])

  useGlobalEventListener('PROMISE_API_RESPONSE', ({ detail }) => {
    if (detail && detail.response) {
      globalResponseHandler(detail.response)
    }
  })

  return (
    <RestfulProvider
      base="/"
      requestOptions={getRequestOptions}
      queryParams={getQueryParams()}
      queryParamStringifyOptions={{ skipNulls: true }}
      onResponse={globalResponseHandler}
    >
      <QueryClientProvider client={queryClient}>
        <StringsContextProvider initialStrings={props.strings}>
          <ToolTipProvider>
            <PreferenceStoreProvider>
              <FeatureFlagsProvider>
                <AppStoreProvider>
                  <AppErrorBoundary>
                    <FeaturesProvider>
                      <LicenseStoreProvider>
                        <HelpPanelProvider>
                          <PermissionsProvider>
                            <SideNavProvider>
                              <Suspense fallback={<PageSpinner />}>
                                <RouteDestinations />
                              </Suspense>
                            </SideNavProvider>
                          </PermissionsProvider>
                        </HelpPanelProvider>
                        <ThirdPartyIntegrations />
                      </LicenseStoreProvider>
                    </FeaturesProvider>
                  </AppErrorBoundary>
                </AppStoreProvider>
              </FeatureFlagsProvider>
            </PreferenceStoreProvider>
          </ToolTipProvider>
        </StringsContextProvider>
      </QueryClientProvider>
    </RestfulProvider>
  )
}

export function AppWithoutAuthentication(props: AppProps): React.ReactElement {
  const { pathname, hash } = window.location
  const { browserRouterEnabled } = window
  // Redirect from `/#/account/...` to `/account/...`
  if (browserRouterEnabled && hash && (pathname === '/' || pathname.endsWith('/ng') || pathname.endsWith('/ng/'))) {
    const targetUrl = window.location.href.replace('/#/', '/')
    window.location.href = targetUrl
  }

  return (
    <RestfulProvider base="/">
      <QueryClientProvider client={queryClient}>
        <StringsContextProvider initialStrings={props.strings}>
          <AppErrorBoundary>
            <RouteDestinationsWithoutAuth />
          </AppErrorBoundary>
        </StringsContextProvider>
      </QueryClientProvider>
    </RestfulProvider>
  )
}
