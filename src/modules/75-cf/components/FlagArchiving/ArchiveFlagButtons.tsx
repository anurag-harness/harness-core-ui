import React, { FC } from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export interface ArchiveFlagButtonsProps {
  disabled: boolean
  onClick: () => void
  onClose: () => void
}

const ArchiveFlagButtons: FC<ArchiveFlagButtonsProps> = ({ disabled, onClick, onClose }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start' }}>
      <Button
        type="submit"
        variation={ButtonVariation.PRIMARY}
        disabled={disabled}
        text={getString('archive')}
        intent={Intent.DANGER}
        onClick={onClick}
      />
      <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onClose} />
    </Layout.Horizontal>
  )
}

export default ArchiveFlagButtons
