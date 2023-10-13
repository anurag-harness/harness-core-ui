/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import cx from 'classnames'
import { Text, Icon, Layout, ButtonVariation, Container, ButtonSize } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { useFeatureFlag } from '@harnessio/ff-react-client-sdk'
import { useStrings } from 'framework/strings'
import WithABFFProvider from '@common/components/WithFFProvider/WithFFProvider'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PLG_EXPERIMENTS, EXPOSURE_EVENT } from '@common/components/WithFFProvider/PLGExperiments'
import { FeatureFlag } from '@common/featureFlags'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { PLG_CD_GET_STARTED_VARIANTS } from '@common/components/ConfigureOptions/constants'
import cdOnboardingSteps from '../home/images/cd-onboarding-steps.svg'
import GetStartedWithCDV2 from './GetStartedWithCDv2'
import css from './GetStartedWithCD.module.scss'

function GetStartedWithCD(): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()

  const getStartedClickHandler = (): void => {
    trackEvent(CDOnboardingActions.GetStartedClicked, {})
    history.push(routes.toCDOnboardingWizard({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
  }
  return (
    <Layout.Vertical flex>
      <Container className={cx(css.topPage, css.oldGetStarted)}>
        <Layout.Horizontal flex margin="auto">
          <Layout.Vertical padding="xlarge" style={{ flex: 1, textAlign: 'center' }} className={css.centerAlign}>
            <Icon name="cd-main" size={40} padding="xlarge" />
            <Text font={{ variation: FontVariation.H1 }} className={css.centerAlign}>
              {getString('cd.getStartedWithCD.onboardingTitle')}
            </Text>
            <Text padding="medium" font={{ variation: FontVariation.BODY1 }} className={css.centerAlign}>
              {getString('cd.getStartedWithCD.onBoardingSubTitle')}
            </Text>
            <Container padding="xxlarge" style={{ flex: 1 }} className={css.centerAlign}>
              <Container
                style={{ background: `transparent url(${cdOnboardingSteps}) no-repeat` }}
                className={css.samplePipeline}
              />
            </Container>
            <Container className={css.buttonRow}>
              <RbacButton
                variation={ButtonVariation.PRIMARY}
                size={ButtonSize.LARGE}
                text={getString('getStarted')}
                rightIcon="chevron-right"
                onClick={getStartedClickHandler}
                permission={{
                  permission: PermissionIdentifier.EDIT_PIPELINE,
                  resource: {
                    resourceType: ResourceType.PIPELINE
                  }
                }}
              />
            </Container>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}

const GetStartedWithAB: React.FC = () => {
  const {
    currentUserInfo: { uuid }
  } = useAppStore()
  return (
    <WithABFFProvider
      fallback={<GetStartedWithCDV2 />}
      featureFlagsToken={window.HARNESS_PLG_FF_SDK_KEY}
      config={{ experimentKey: PLG_EXPERIMENTS.CD_GET_STARTED, identifier: uuid }}
    >
      <GetStartedWithHooks />
    </WithABFFProvider>
  )
}

const GetStartedWithHooks: React.FC = () => {
  const FLOW_TYPE = useFeatureFlag(FeatureFlag.PLG_CD_GET_STARTED_AB)
  const trackExposure = useFeatureFlag(FeatureFlag.PLG_GET_STARTED_EXPOSURE_ENABLED)
  const { trackEvent } = useTelemetry()
  useEffect(() => {
    trackExposure &&
      trackEvent(EXPOSURE_EVENT, {
        flag_key: FeatureFlag.PLG_CD_GET_STARTED_AB,
        variant: FLOW_TYPE
      })
  }, [])
  return FLOW_TYPE === PLG_CD_GET_STARTED_VARIANTS.INFO_HEAVY ? <GetStartedWithCDV2 /> : <GetStartedWithCD />
}
export default GetStartedWithAB
