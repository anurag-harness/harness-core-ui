/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Button, ButtonSize, Layout, OverlaySpinner, Tab, Tabs, Text } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { getCommandStrWithNewline } from '../../utils'
import ApiKeySetup from './ApiKeySetup'
import { SYSTEM_ARCH_TYPES } from '../../Constants'
import type { ApiKeySetupProps, PipelineSetupState } from '../../types'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export default function CLISetupStep({
  onKeyGenerate,
  state
}: ApiKeySetupProps & { state: PipelineSetupState }): JSX.Element {
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge' }}>
        <Text className={css.bold} color={Color.BLACK} padding={{ top: 'large' }}>
          <String
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.stepsTitle"
          />
        </Text>
        <Text color={Color.BLACK} padding={{ top: 'large', bottom: 'large' }}>
          <String
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.stepsIntro"
            useRichText
            vars={{ sampleAppURL: 'https://github.com/harness-community/harnesscd-example-apps/' }}
          />
        </Text>

        <Text color={Color.BLACK} font={{ variation: FontVariation.FORM_TITLE }}>
          <String
            color={Color.BLACK}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.headsteps.preparation"
          />
        </Text>
      </Layout.Vertical>
      <InstallCLIInfo />
      <ApiKeySetup state={state} onKeyGenerate={onKeyGenerate} />
      <Layout.Vertical>
        <Text className={css.bold} color={Color.BLACK} padding={{ top: 'large' }}>
          <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
            <String
              useRichText
              className={css.marginBottomLarge}
              stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.forkStep.title"
            />
          </Text>
        </Text>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

function InstallCLIInfo(): JSX.Element {
  const [version, setLatestVersion] = useState('')
  const getLatestVersion = async (): Promise<string> => {
    const { tag_name }: { tag_name: string } = await fetch(
      'https://api.github.com/repos/harness/harness-cli/releases/latest'
    ).then(resp => resp.json())

    return tag_name
  }
  const { getString } = useStrings()
  useEffect(() => {
    getLatestVersion().then((tag: string) => setLatestVersion(tag))
  }, [])
  return (
    <OverlaySpinner show={isEmpty(version)}>
      <Layout.Vertical className={css.tabsLine}>
        <Text color={Color.BLACK}>
          <String
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.title"
          />
        </Text>
        <Layout.Vertical padding={{ left: 'medium' }}>
          <Tabs id="selectedOS">
            <Tab
              id="mac"
              title={getString('pipeline.infraSpecifications.osTypes.macos')}
              panel={<CLIDownloadMac version={version} />}
            />
            <Tab
              id="linux"
              title={getString('delegate.cardData.linux.name')}
              panel={<CLIDownloadLinux version={version} />}
            />
            <Tab
              id="win"
              title={getString('pipeline.infraSpecifications.osTypes.windows')}
              panel={<CLIDownloadWin version={version} />}
            />
          </Tabs>
        </Layout.Vertical>
      </Layout.Vertical>
    </OverlaySpinner>
  )
}

const CLIDownloadMac = ({ version }: { version: string }): JSX.Element => {
  const { getString } = useStrings()

  const getCommands = (): string => {
    return getCommandStrWithNewline([
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.mac', {
        version
      }),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.extractmac', {
        version
      }),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.exportMac'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.setPath')
    ])
  }
  return (
    <Layout.Vertical>
      {/* <Text color={Color.BLACK} padding={{ bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.download"
        />
      </Text> */}
      <CommandBlock
        darkmode
        allowCopy
        ignoreWhiteSpaces={false}
        commandSnippet={getCommands()}
        downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
      {/* <Text color={Color.BLACK} padding={{ top: 'large', bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.extract"
        />
      </Text>
      <Text color={Color.BLACK} padding={{ bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.move"
        />
      </Text>
      <CommandBlock
        darkmode
        allowCopy
        ignoreWhiteSpaces={false}
        commandSnippet={getCommands()}
        downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
      <Text color={Color.BLACK} padding={{ top: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.restart"
        />
      </Text> */}
    </Layout.Vertical>
  )
}
const CLIDownloadLinux = ({ version }: { version: string }): JSX.Element => {
  const { getString } = useStrings()
  const [selectedValue, setSelectedValue] = React.useState<string>('ARM')

  const getCommands = (): string => {
    return getCommandStrWithNewline([
      getString(
        selectedValue === SYSTEM_ARCH_TYPES.ARM
          ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.arm'
          : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.amd',
        { version }
      ),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.extractmac', {
        version
      }),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.exportMac'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.setPath')
    ])
  }
  return (
    <Layout.Vertical>
      <Layout.Horizontal>
        <Button
          size={ButtonSize.MEDIUM}
          onClick={() => {
            setSelectedValue(SYSTEM_ARCH_TYPES.ARM)
          }}
          round
          margin={{ right: 'large', bottom: 'large' }}
          intent={selectedValue === SYSTEM_ARCH_TYPES.ARM ? 'primary' : 'none'}
          text={SYSTEM_ARCH_TYPES.ARM}
        />

        <Button
          size={ButtonSize.MEDIUM}
          onClick={() => {
            setSelectedValue(SYSTEM_ARCH_TYPES.AMD)
          }}
          round
          intent={selectedValue === SYSTEM_ARCH_TYPES.AMD ? 'primary' : 'none'}
          text={SYSTEM_ARCH_TYPES.AMD}
        />
      </Layout.Horizontal>

      {/* <Text color={Color.BLACK} padding={{ bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.download"
        />
      </Text> */}
      <CommandBlock
        darkmode
        allowCopy
        ignoreWhiteSpaces={false}
        commandSnippet={getCommands()}
        downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
      {/* <Text color={Color.BLACK} padding={{ top: 'large', bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.extract"
        />
      </Text>
      <Text color={Color.BLACK} padding={{ bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.move"
        />
      </Text>
      <CommandBlock
        darkmode
        allowCopy
        ignoreWhiteSpaces={false}
        commandSnippet={getCommands()}
        downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
      <Text color={Color.BLACK} padding={{ top: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.restart"
        />
      </Text> */}
    </Layout.Vertical>
  )
}

const CLIDownloadWin = ({ version }: { version: string }): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} padding={{ bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.wininstall.description1"
        />
      </Text>
      <CommandBlock
        darkmode
        allowCopy
        ignoreWhiteSpaces={false}
        commandSnippet={getCommandStrWithNewline([
          getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.win', { version })
        ])}
        downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
      <Text color={Color.BLACK} padding={{ top: 'large', bottom: 'large' }}>
        <String stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.extract" />
      </Text>
      <Text color={Color.BLACK} padding={{ bottom: 'large' }}>
        <String stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.move" />
      </Text>
      <CommandBlock
        darkmode
        allowCopy
        ignoreWhiteSpaces={false}
        commandSnippet={getCommandStrWithNewline([
          getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.wininstall.winpathsetup1'),
          getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.wininstall.winpathsetup2')
        ])}
        downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />

      <Text color={Color.BLACK} padding={{ top: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.setupStep.commmonInstallSteps.restart"
        />
      </Text>
    </Layout.Vertical>
  )
}
