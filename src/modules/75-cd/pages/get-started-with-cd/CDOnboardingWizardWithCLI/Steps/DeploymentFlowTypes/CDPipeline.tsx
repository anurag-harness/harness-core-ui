/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { Layout, Text, Button, ButtonVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import VerifyDelegateConnection from '@delegates/pages/delegates/delegateCommandLineCreation/components/VerifyDelegateConnection'
import { DelegateCommonProblemTypes } from '@delegates/constants'
import DelegateModal, { DelgateDetails } from '../../DelegateModal'
import type { WhereAndHowToDeployType } from '../../types'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
export interface CDPipelineProps {
  state: WhereAndHowToDeployType
  closeDelegateDialog: (data: DelgateDetails) => void
  openDelagateDialog: () => void
  isDrawerOpen: boolean
  onDelegateFail: () => void
  onDelegateSuccess: () => void
  onVerificationStart?: () => void
}
export default function CDPipeline({
  state,
  isDrawerOpen,
  closeDelegateDialog,
  openDelagateDialog,
  onDelegateFail,
  onDelegateSuccess,
  onVerificationStart
}: CDPipelineProps): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.title')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.description1')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xxlarge' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.delegateDescription2')}
      </Text>
      {!state.isDelegateVerified && (
        <Button variation={ButtonVariation.PRIMARY} width={'fit-content'} onClick={openDelagateDialog}>
          {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdPipeline.installButton')}
        </Button>
      )}
      <Layout.Vertical margin={{ bottom: 'large' }}>
        <DelegateModal
          delegateName={state.delegateName}
          delegateProblemType={state?.delegateProblemType as string}
          onClose={closeDelegateDialog}
          hideDocker
          isOpen={isDrawerOpen}
          checkAndSuggestDelegateName
        />
      </Layout.Vertical>

      {state?.delegateName && state?.delegateType && !isDrawerOpen && (
        <VerifyDelegateConnection
          delegateType={state?.delegateProblemType as DelegateCommonProblemTypes}
          name={state.delegateName as string}
          onSuccessHandler={onDelegateSuccess}
          showDoneButton={false}
          onDone={() => {
            //
          }}
          onErrorHandler={onDelegateFail}
          onVerificationStart={onVerificationStart}
        />
      )}
    </Layout.Vertical>
  )
}
