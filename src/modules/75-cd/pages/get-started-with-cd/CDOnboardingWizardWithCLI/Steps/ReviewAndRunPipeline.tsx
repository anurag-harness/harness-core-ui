/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonSize, ButtonVariation, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import VerifyDelegateConnection from '@delegates/pages/delegates/delegateCommandLineCreation/components/VerifyDelegateConnection'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { CDOnboardingSteps, DelegateStatus, PipelineSetupState, WhereAndHowToDeployType } from '../types'
import { PIPELINE_TO_STRATEGY_MAP } from '../Constants'
import DelegateModal, { DelgateDetails } from '../DelegateModal'
interface ReviewAndRunPipelineProps {
  saveProgress: (stepId: string, data: any) => void
}
export default function ReviewAndRunPipeline({ saveProgress }: ReviewAndRunPipelineProps): JSX.Element {
  const [isDrawerOpen, setDrawerOpen] = React.useState<boolean>(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { stepsProgress } = useOnboardingStore()
  const { getString } = useStrings()
  const history = useHistory()
  const delegateStepData = React.useMemo((): WhereAndHowToDeployType => {
    return stepsProgress[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY].stepData
  }, [stepsProgress])
  const pipelineStepsdata = React.useMemo((): PipelineSetupState => {
    return stepsProgress[CDOnboardingSteps.DEPLOYMENT_STEPS].stepData
  }, [stepsProgress])

  const onChangeHandler = React.useCallback(
    (delegateStatus: DelegateStatus): void => {
      saveProgress(CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY, { ...delegateStepData, delegateStatus })
    },
    [stepsProgress]
  )

  const onDelegateFail = (): void => {
    onChangeHandler('FAILED')
  }

  const onDelegateSuccess = (): void => {
    onChangeHandler('SUCCESS')
  }
  const closeDelegateDialog = (deldata: DelgateDetails): void => {
    if (deldata?.delegateName && deldata?.delegateType) {
      saveProgress(CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY, {
        ...delegateStepData,
        delegateName: deldata.delegateName as string,
        delegateType: deldata.delegateType as any
      })
    }
    setDrawerOpen(false)
  }
  const openDelagateDialog = (): void => {
    setDrawerOpen(true)
  }

  const isDelegatePending = React.useMemo((): boolean => {
    const delegateStatusArray: DelegateStatus[] = ['FAILED', 'PENDING', 'TRYING']
    return delegateStatusArray.includes(delegateStepData.delegateStatus)
  }, [delegateStepData.delegateStatus])

  const gotoPipelineStudio = (): void => {
    history.push(
      routes.toPipelineStudio({
        module: 'cd',
        projectIdentifier,
        orgIdentifier,
        accountId,
        pipelineIdentifier: PIPELINE_TO_STRATEGY_MAP[pipelineStepsdata?.strategyId as string],
        runPipeline: true
      })
    )
  }

  const renderDelegateVerify = (): JSX.Element | null => {
    if (delegateStepData?.delegateStatus === 'SUCCESS') {
      return (
        <Layout.Vertical background={Color.GREEN_50} margin={{ bottom: 'xlarge' }} padding="large">
          <Text
            icon="tick-circle"
            iconProps={{ color: Color.GREEN_900, padding: { right: 'large' } }}
            color={Color.GREEN_900}
          >
            {getString('cd.getStartedWithCD.flowByQuestions.reviewAndRunStep.delegateSuccess')}
          </Text>
        </Layout.Vertical>
      )
    } else if (delegateStepData?.delegateName && delegateStepData?.delegateType && !isDrawerOpen) {
      return (
        <VerifyDelegateConnection
          verificationInProgressLabel="cd.getStartedWithCD.flowByQuestions.reviewAndRunStep.delegateLoading"
          delegateType={delegateStepData.delegateType}
          name={delegateStepData.delegateName as string}
          onSuccessHandler={onDelegateSuccess}
          onDone={() => {
            //
          }}
          showDoneButton={false}
          onErrorHandler={onDelegateFail}
        />
      )
    }
    return null
  }
  return (
    <Layout.Vertical padding="large">
      {renderDelegateVerify()}
      {delegateStepData?.delegateStatus === 'FAILED' && (
        <Layout.Vertical margin={{ bottom: 'xlarge' }}>
          <Button
            margin={{ bottom: 'large' }}
            width={150}
            onClick={openDelagateDialog}
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
          >
            {getString('cd.getStartedWithCD.flowByQuestions.reviewAndRunStep.checkDelegate')}
          </Button>
          <Text>{getString('cd.getStartedWithCD.flowByQuestions.reviewAndRunStep.continueWithoutDelegate')}</Text>
        </Layout.Vertical>
      )}

      <Button
        width={isDelegatePending ? 380 : 300}
        variation={isDelegatePending ? ButtonVariation.SECONDARY : ButtonVariation.PRIMARY}
        size={ButtonSize.MEDIUM}
        onClick={gotoPipelineStudio}
        rightIcon={isDelegatePending ? 'arrow-right' : undefined}
      >
        {getString(
          isDelegatePending
            ? 'cd.getStartedWithCD.flowByQuestions.reviewAndRunStep.runWithoutDelegate'
            : 'cd.getStartedWithCD.flowByQuestions.reviewAndRunStep.runPipeline'
        )}
      </Button>
      <Layout.Vertical margin={{ bottom: 'large' }}>
        <DelegateModal
          delegateName={delegateStepData.delegateName}
          onClose={closeDelegateDialog}
          hideDocker
          isOpen={isDrawerOpen}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
