/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Layout, Text, CardSelect, Icon, IconName } from '@harness/uicore'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings } from 'framework/strings'
import {
  CDOnboardingSteps,
  DelegateStatus,
  DeploymentFlowType,
  WhatToDeployType,
  WhereAndHowToDeployType
} from '../types'
import GitopsFlow from './DeploymentFlowTypes/GitopsFlow'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { DEPLOYMENT_FLOW_ENUMS, DEPLOYMENT_FLOW_TYPES } from '../Constants'
import type { DelgateDetails } from '../DelegateModal'
import CDPipeline from './DeploymentFlowTypes/CDPipeline'
import { getBranchingProps } from '../utils'
import { ONBOARDING_INTERACTIONS, WIZARD_STEP_OPEN } from '../TrackingConstants'
import css from '../CDOnboardingWizardWithCLI.module.scss'

interface WhereAndHowToDeployProps {
  saveProgress: (stepId: string, data: any) => void
}
function WhereAndHowToDeploy({ saveProgress }: WhereAndHowToDeployProps): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const { trackEvent } = useTelemetry()
  const deploymentTypeDetails = React.useMemo((): WhatToDeployType => {
    return stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData
  }, [stepsProgress])
  const [state, setState] = React.useState<WhereAndHowToDeployType>(() => {
    return (
      stepsProgress?.[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]?.stepData || {
        isDelegateVerified: false,
        delegateStatus: 'PENDING',
        delegateProblemType: deploymentTypeDetails.artifactType?.id,
        type: DEPLOYMENT_FLOW_TYPES['cd-pipeline']
      }
    )
  })
  const [isDrawerOpen, setDrawerOpen] = React.useState<boolean>(false)

  const { getString } = useStrings()

  React.useEffect(() => {
    trackEvent(WIZARD_STEP_OPEN.HOW_N_WHERE_STEP_OPENED, getBranchingProps(stepsProgress))
  }, [])

  React.useEffect(() => {
    saveProgress(CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY, state)
  }, [state])

  const openDelagateDialog = (): void => {
    !state.installDelegateTried && setState(prevState => ({ ...prevState, installDelegateTried: true }))
    trackEvent(WIZARD_STEP_OPEN.CREATE_DELEGATE_FLYOUT_OPENED, getBranchingProps(stepsProgress))
    setDrawerOpen(true)
  }
  const closeDelegateDialog = (data: DelgateDetails): void => {
    if (data?.delegateName && data?.delegateType && data.delegateProblemType) {
      setState(prevState => ({
        ...prevState,
        delegateName: data.delegateName as string,
        delegateType: data.delegateType as any,
        delegateProblemType: data.delegateProblemType
      }))
    }
    setDrawerOpen(false)
  }
  const onChangeHandler = React.useCallback(
    (delegateStatus: DelegateStatus): void => {
      setState(prevState => ({ ...prevState, isDelegateVerified: state.isDelegateVerified, delegateStatus }))
    },
    [state.isDelegateVerified]
  )

  const onDelegateFail = (): void => {
    onChangeHandler('FAILED')
    trackEvent(ONBOARDING_INTERACTIONS.DELEGATE_VERIFICATION_FAIL, {
      ...getBranchingProps(stepsProgress),
      delegateName: state?.delegateName,
      delegateType: state?.delegateType
    })
  }

  const onDelegateSuccess = (): void => {
    onChangeHandler('SUCCESS')
    trackEvent(ONBOARDING_INTERACTIONS.DELEGATE_VERIFICATION_SUCCESS, {
      ...getBranchingProps(stepsProgress),
      delegateName: state?.delegateName,
      delegateType: state?.delegateType
    })
  }

  const onVerificationStart = (): void => {
    trackEvent(ONBOARDING_INTERACTIONS.DELEGATE_VERIFICATION_START, {
      ...getBranchingProps(stepsProgress),
      delegateName: state?.delegateName,
      delegateType: state?.delegateType
    })
  }
  const setType = (selectedType: DeploymentFlowType): void => {
    setState(prevState => ({ ...prevState, type: selectedType }))
  }
  const deploymentTypes = React.useMemo((): DeploymentFlowType[] => {
    return Object.values(DEPLOYMENT_FLOW_TYPES).map((deploymentType: DeploymentFlowType) => {
      return deploymentType
    })
  }, [])
  return (
    <Layout.Vertical>
      <Layout.Vertical>
        <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
          {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.title')}
        </Text>
        <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
          {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.description')}
        </Text>
        <CardSelect<DeploymentFlowType>
          data={deploymentTypes}
          cornerSelected
          className={cx(css.serviceTypeCards, css.flowcards)}
          renderItem={(item: DeploymentFlowType) => (
            <Layout.Vertical flex spacing={'xlarge'}>
              <Icon name={item?.icon as IconName} size={30} padding={{ bottom: 'xxlarge' }} />
              <Layout.Vertical>
                <Text
                  padding={{ bottom: 'small' }}
                  font={{ variation: FontVariation.BODY }}
                  color={state?.type?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
                >
                  {item.label}
                </Text>
                <Text font={{ variation: FontVariation.BODY2_SEMI }} color={Color.GREY_500}>
                  {item.subtitle}
                </Text>
              </Layout.Vertical>
            </Layout.Vertical>
          )}
          selected={state.type}
          onChange={setType}
        />
        {state.type?.id === DEPLOYMENT_FLOW_ENUMS.CDPipeline && (
          <CDPipeline
            state={state}
            onDelegateSuccess={onDelegateSuccess}
            openDelagateDialog={openDelagateDialog}
            isDrawerOpen={isDrawerOpen}
            closeDelegateDialog={closeDelegateDialog}
            onDelegateFail={onDelegateFail}
            onVerificationStart={onVerificationStart}
          />
        )}
        {state.type?.id === DEPLOYMENT_FLOW_ENUMS.Gitops && <GitopsFlow />}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default WhereAndHowToDeploy
