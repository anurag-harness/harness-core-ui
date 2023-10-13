import React from 'react'
import { Button, Icon, Layout, ButtonVariation } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String } from 'framework/strings'
import css from '../CDOnboardingWizardWithCLI.module.scss'
export default function MissingSwimlane({ url }: { url: string }): JSX.Element {
  return (
    <Layout.Vertical className={css.missingSwimlanes} padding="large" spacing="large">
      <Layout.Horizontal color={Color.BLACK} margin={{ bottom: 'large' }}>
        <Icon name="stopwatch" margin={{ right: 'large' }} />
        <String className={css.bold} stringID="cd.getStartedWithCD.nopath" />
      </Layout.Horizontal>
      <Layout.Horizontal color={Color.BLACK}>
        <String stringID="cd.getStartedWithCD.checkdocs" />
      </Layout.Horizontal>
      <Button width={220} target="_blank" href={url} variation={ButtonVariation.PRIMARY}>
        <Layout.Horizontal color={Color.WHITE} flex={{ alignItems: 'center' }} spacing="small">
          <String stringID="cd.getStartedWithCD.docLink" />
          <Icon size={12} name="share" />
        </Layout.Horizontal>
      </Button>
    </Layout.Vertical>
  )
}
