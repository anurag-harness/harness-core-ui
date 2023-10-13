/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, FC } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Icon, Text, Container, Button, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { HideModal } from '@harness/use-modal'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { useGetDelegatesHeartbeatDetailsV2 } from 'services/portal'
import { DelegateCommonProblemTypes, POLL_INTERVAL, DELEGATE_COMMAND_LINE_TIME_OUT } from '@delegates/constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import type { StringsMap } from 'stringTypes'
import delegateError from './delegateError.svg'
import happyGroup from './happyGroup.svg'
import happyPeople from './happyPeople.svg'
import CommonProblemsForDelegate from './CommonProblemsForDelegate'
import css from '../DelegateCommandLineCreation.module.scss'
interface VerifyDelegateConnectionProps {
  delegateType?: DelegateCommonProblemTypes
  name: string
  onSuccessHandler?: () => void
  onErrorHandler: () => void
  onDone: HideModal
  showDoneButton?: boolean
  verificationInProgressLabel?: keyof StringsMap
  onVerificationStart?: () => void
}

const VerifyDelegateConnection: FC<VerifyDelegateConnectionProps> = props => {
  const {
    name,
    onSuccessHandler,
    delegateType,
    onDone,
    onErrorHandler,
    showDoneButton = true,
    verificationInProgressLabel,
    onVerificationStart
  } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [startTroubleShoot, setStartTroubleShoot] = useState<boolean>(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isHeartBeatVerified, setVerifyHeartBeat] = useState(false)
  const [counter, setCounter] = useState(0)
  const { trackEvent } = useTelemetry()
  const {
    data,
    loading,
    refetch: verifyHeartBeat
  } = useGetDelegatesHeartbeatDetailsV2({
    queryParams: {
      accountId,
      projectId: projectIdentifier,
      orgId: orgIdentifier,
      delegateName: name
    },
    debounce: 200
  })
  React.useEffect(() => {
    if (
      !loading &&
      (!data || (data && data?.resource?.numberOfConnectedDelegates === 0)) &&
      !showError &&
      !showSuccess
    ) {
      const timerId = window.setTimeout(() => {
        setCounter(counter + POLL_INTERVAL)
        verifyHeartBeat()
      }, POLL_INTERVAL)
      if (counter === 0) {
        onVerificationStart?.()
      }
      if (counter >= DELEGATE_COMMAND_LINE_TIME_OUT) {
        window.clearTimeout(timerId)
        setVerifyHeartBeat(true)
        setShowError(true)
        onErrorHandler()
      }

      return () => {
        window.clearTimeout(timerId)
      }
    } else if (data && data?.resource && data?.resource?.numberOfConnectedDelegates !== 0 && !showSuccess) {
      setVerifyHeartBeat(true)
      setShowSuccess(true)
      onSuccessHandler && onSuccessHandler()
    }
  }, [data, verifyHeartBeat, loading, onSuccessHandler])
  const getVerifyDelegateDetails = () => {
    if (showError) {
      return (
        <>
          <Container className={css.delegateErrorContainer} padding="large" margin={{ bottom: 'xlarge' }}>
            <Layout.Vertical spacing="small">
              <Layout.Horizontal spacing="medium">
                <Icon size={18} name="danger-icon" />
                <Text font={{ variation: FontVariation.H6 }} color={Color.RED_700}>
                  {getString('common.delegateFailed')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }} width={'100%'}>
                <Layout.Vertical spacing="medium" width={'85%'}>
                  <Text font={{ variation: FontVariation.SMALL }}>
                    {getString('common.delegateFailText1Part1')}{' '}
                    <a href={getString('common.harnessURL')}>{getString('common.harnessURL')}</a>
                  </Text>
                  <Text font={{ variation: FontVariation.SMALL }}>{getString('common.delegateFailText2')}</Text>
                </Layout.Vertical>
                <img src={delegateError} alt="" height={79} width={79} />
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('platform.delegates.commandLineCreation.retryConnections')}
                  onClick={() => {
                    setShowError(false)
                    setShowSuccess(false)
                    setStartTroubleShoot(false)
                    setCounter(0)
                    verifyHeartBeat()
                    trackEvent(DelegateActions.DelegateCommandLineTroubleShootRetryConnection, {
                      category: Category.DELEGATE
                    })
                  }}
                />
                <Button
                  width={100}
                  variation={ButtonVariation.LINK}
                  text={getString('platform.delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot')}
                  onClick={() => {
                    setStartTroubleShoot(true)
                    trackEvent(DelegateActions.DelegateCommandLineTroubleShoot, {
                      category: Category.DELEGATE
                    })
                  }}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Container>
          {startTroubleShoot && delegateType && <CommonProblemsForDelegate delegateType={delegateType} />}
        </>
      )
    } else if (showSuccess && isHeartBeatVerified) {
      return (
        <Container className={css.delegateSuccessContainer} padding="medium" margin={{ bottom: 'xlarge' }}>
          <Layout.Horizontal
            className={css.delegateSuccessContainer}
            spacing="medium"
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
          >
            <img src={happyGroup} alt="happy" height={30} width={53} />
            <Text font={{ variation: FontVariation.SMALL }} color={Color.GREEN_900}>
              {getString('common.delegateSuccess')}
            </Text>
            <img src={happyPeople} alt="happy people" height={20} width={29} />
          </Layout.Horizontal>
        </Container>
      )
    } else
      return (
        <Layout.Horizontal padding="large">
          <Icon size={16} name="steps-spinner" color={Color.BLUE_800} style={{ marginRight: '12px' }} />
          <Text font="small">
            {getString(
              defaultTo(verificationInProgressLabel, 'platform.delegates.commandLineCreation.clickDoneAndCheckLater')
            )}
          </Text>
        </Layout.Horizontal>
      )
  }

  return (
    <Layout.Vertical spacing="none" margin={{ bottom: 'xxxlarge' }}>
      {((showSuccess && isHeartBeatVerified) || showError) && (
        <Layout.Horizontal margin={{ bottom: 'xlarge' }}>
          <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
            {showSuccess && isHeartBeatVerified && (
              <Icon size={16} color={Color.GREEN_500} name={'execution-success'} />
            )}
            {showError && <Icon size={16} color={Color.RED_500} name={'circle-cross'} />}
            <Text font={{ weight: 'bold' }}>{getString('delegate.successVerification.heartbeatReceived')}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
            {showSuccess && isHeartBeatVerified && (
              <Icon size={16} color={Color.GREEN_500} name={'execution-success'} />
            )}
            {showError && <Icon size={16} name={'circle-cross'} />}
            <Text font={{ weight: 'bold' }}>{getString('delegate.successVerification.delegateInitialized')}</Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
      )}
      {getVerifyDelegateDetails()}
      {showDoneButton && (
        <Button
          text={getString('done')}
          onClick={() => {
            trackEvent(DelegateActions.DelegateCommandLineDone, {
              category: Category.DELEGATE
            })
            onDone()
          }}
          variation={ButtonVariation.PRIMARY}
          width={100}
        />
      )}
    </Layout.Vertical>
  )
}

export default VerifyDelegateConnection
