import React from 'react'

import { Button, Dialog } from '@harness/uicore'
import { Drawer, Position } from '@blueprintjs/core'
import DelegateCommandLineCreation from '@delegates/pages/delegates/delegateCommandLineCreation/DelegateCommandLineCreation'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { DelegateCommandLineTypes, DelegateDefaultName } from '@delegates/constants'
import { ONBOARDING_INTERACTIONS } from './TrackingConstants'
import { getBranchingProps } from './utils'
import { useOnboardingStore } from './Store/OnboardingStore'
import css from './CDOnboardingWizardWithCLI.module.scss'
export interface DelgateDetails {
  delegateName?: DelegateDefaultName
  delegateType?: DelegateCommandLineTypes
  delegateProblemType?: string
}
export interface useCreateDelegateViaCommandsModalProps {
  oldDelegateCreation?: () => void
  hideDocker?: boolean
  onClose: (data: DelgateDetails) => void
  isOpen?: boolean
  delegateProblemType?: string
  delegateName?: string
  checkAndSuggestDelegateName?: boolean
}

export default function DelegateModal(props: useCreateDelegateViaCommandsModalProps): JSX.Element {
  const { trackEvent } = useTelemetry()
  const { stepsProgress } = useOnboardingStore()
  const [delgateDetails, setDelegateDetails] = React.useState<DelgateDetails>({})
  const onClose = (): void => {
    trackEvent(DelegateActions.DelegateCommandLineCreationClosed, {
      category: Category.DELEGATE
    })
    props.onClose(delgateDetails)
  }
  const onDelegateConfigChange = (data: DelgateDetails): void => {
    setDelegateDetails(data)
  }

  const onVerificationStart = (): void => {
    trackEvent(ONBOARDING_INTERACTIONS.DELEGATE_VERIFICATION_START, {
      ...getBranchingProps(stepsProgress),
      delegateName: delgateDetails?.delegateName,
      delegateType: delgateDetails?.delegateType
    })
  }
  return (
    <Dialog enforceFocus={false} isOpen={Boolean(props.isOpen)}>
      <Drawer position={Position.RIGHT} isOpen={true} isCloseButtonShown={true} size={'86%'}>
        <Button minimal className={css.almostFullScreenCloseBtn} icon="cross" withoutBoxShadow onClick={onClose} />

        <DelegateCommandLineCreation
          delegateName={props?.delegateName}
          onDone={onClose}
          hideDocker={props?.hideDocker}
          oldDelegateCreation={props?.oldDelegateCreation}
          onDelegateConfigChange={onDelegateConfigChange}
          checkAndSuggestDelegateName={props?.checkAndSuggestDelegateName}
          onVerificationStart={onVerificationStart}
        />
      </Drawer>
    </Dialog>
  )
}
