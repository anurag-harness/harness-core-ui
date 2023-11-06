/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'

import cx from 'classnames'
import { Icon } from '@harness/icons'
import { Button, ButtonVariation, useToggleOpen } from '@harness/uicore'
import { Drawer } from '@blueprintjs/core'
import MainNav from '@common/navigation/MainNav'
import SideNav from '@common/navigation/SideNav'
import { useSidebar } from '@common/navigation/SidebarProvider'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { TrialLicenseBanner } from '@common/layouts/TrialLicenseBanner'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { usePage } from '@common/pages/pageContext/PageProvider'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import DocsChat from '@common/components/DocsChat/DocsChat'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { String } from 'framework/strings'
import FeatureBanner from './FeatureBanner'

import css from './layouts.module.scss'

export function DefaultLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { title, subtitle, icon, navComponent: NavComponent, launchButtonText, launchButtonRedirectUrl } = useSidebar()

  const { pageName } = usePage()
  const { module } = useModuleInfo()
  const { trackPage, identifyUser } = useTelemetry()
  const { currentUserInfo } = useAppStore()
  const { isOpen, open, close } = useToggleOpen(false)
  const chatEnabled = useFeatureFlag(FeatureFlag.PL_AI_SUPPORT_CHATBOT)

  useEffect(() => {
    if (pageName) {
      identifyUser(currentUserInfo.email)
      trackPage(pageName, { module: module || '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName])

  return (
    <div className={cx(css.main, css.flex)} data-layout="default">
      <MainNav />
      {NavComponent && (
        <SideNav
          title={title}
          subtitle={subtitle}
          icon={icon}
          launchButtonText={launchButtonText}
          launchButtonRedirectUrl={launchButtonRedirectUrl}
          data-testid="side-nav"
        >
          <NavComponent />
        </SideNav>
      )}

      <div className={css.rhs}>
        {module && <TrialLicenseBanner />}
        {module && <FeatureBanner />}
        <div className={css.children}>{props.children}</div>
      </div>

      {chatEnabled ? (
        <div className={css.aux}>
          <ul className={css.list}>
            <li>
              <Drawer isOpen={isOpen} onClose={close} size={488}>
                <>
                  <Button
                    icon="cross"
                    iconProps={{
                      size: 24
                    }}
                    variation={ButtonVariation.PRIMARY}
                    onClick={close}
                    className={css.closeChat}
                  />
                  <DocsChat />
                </>
              </Drawer>
              <button className={cx(css.listItem, css.copilot, { [css.open]: isOpen })} onClick={open}>
                <Icon name="harness-copilot" size={24} />
                <String stringID="common.csBot.aida" className={css.label} />
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}
