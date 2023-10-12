/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, TextInput, Label, Button, ButtonVariation, ButtonSize } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import { String, useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { getCommandsByDeploymentType } from '../../utils'
import { CDOnboardingSteps, PipelineSetupState, WhatToDeployType, WhereAndHowToDeployType } from '../../types'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import ConfigureGCP from './GCP/ConfigureGCP'
import ConfigureAWS from './AWS/ConfigureAWS'
import { DEPLOYMENT_TYPE_TO_DIR_MAP, SERVERLESS_FUNCTIONS } from '../../Constants'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

const INFRATYPE_TO_COMPONENT_MAP: { [key: string]: FunctionComponent } = {
  [SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION]: ConfigureGCP,
  [SERVERLESS_FUNCTIONS.AWS_LAMBDA_FUNCTION]: ConfigureAWS
}

export default function PipelineSetupStep({
  onUpdate,
  state
}: {
  state: PipelineSetupState
  onUpdate: (data: PipelineSetupState) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { stepsProgress } = useOnboardingStore()
  const deploymentData = React.useMemo((): WhatToDeployType => {
    return stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData
  }, [stepsProgress])
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ top: 'xxlarge', bottom: 'xlarge' }}>
        <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
          <String
            useRichText
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.title"
            vars={{ guestBookURL: 'https://github.com/harness-community/harnesscd-example-apps/tree/master/guestbook' }}
          />
        </Text>
        <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
          <String
            useRichText
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.whyGitDetails"
          />
        </Text>
        <Layout.Vertical margin={{ top: 'medium', left: 'xlarge' }}>
          <Layout.Vertical width={400}>
            <Label>
              {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.githubusername')}
            </Label>
            <TextInput
              id="githubusername"
              name="githubusername"
              defaultValue={state.githubUsername}
              placeholder={getString(
                'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.githubusername'
              )}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                onUpdate({ ...state, githubUsername: value })
              }}
            />
          </Layout.Vertical>
          <Layout.Vertical width={400}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Label>{getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.githubpat')}</Label>
              <Button
                target="_blank"
                className={css.alignTitle}
                variation={ButtonVariation.LINK}
                size={ButtonSize.SMALL}
                href="https://docs.github.com/en/enterprise-server@3.6/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
              >
                {getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.whereToFindGitPat')}
              </Button>
            </Layout.Horizontal>

            <TextInput
              defaultValue={state.githubPat}
              id="githubpat"
              name="githubpat"
              placeholder={getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.gitStep.githubpat')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value
                onUpdate({ ...state, githubPat: value })
              }}
            />
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Vertical>
      <InfraDetailsComponent
        infraType={(stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData as WhatToDeployType)?.artifactType?.id}
      />
      <Text color={Color.BLACK} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'large' }}>
        <String
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.headsteps.createEntities"
          vars={{
            num:
              (stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData as WhatToDeployType)?.svcType?.id ===
              'KubernetesService'
                ? 2
                : 3
          }}
        />
      </Text>
      <CLISteps
        getString={getString}
        state={state}
        artifactType={deploymentData?.artifactType?.id as string}
        artifactSubtype={deploymentData?.artifactSubType?.id as string}
        delegateName={
          (stepsProgress[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY].stepData as WhereAndHowToDeployType)?.delegateName
        }
      />
    </Layout.Vertical>
  )
}

function CLISteps({
  getString,
  state,
  delegateName,
  artifactType,
  artifactSubtype
}: {
  getString: UseStringsReturn['getString']
  state: PipelineSetupState
  artifactType: string
  artifactSubtype?: string
  delegateName?: string
}): JSX.Element {
  const { accountId } = useParams<AccountPathProps>()
  const commandSnippet = React.useMemo((): string => {
    const dirPath = DEPLOYMENT_TYPE_TO_DIR_MAP[artifactType]
    return getCommandsByDeploymentType({
      getString,
      dirPath,
      delegateName,
      githubPat: state?.githubPat,
      githubUsername: state?.githubUsername,
      apiKey: state?.apiKey,
      accountId,
      artifactSubtype
    })
  }, [state])

  return (
    <Layout.Vertical margin={{ bottom: 'xlarge' }}>
      <Text color={Color.BLACK} padding={{ bottom: 'large' }}>
        <String
          useRichText
          color={Color.BLACK}
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.createEntitytitle"
        />
      </Text>
      <CommandBlock
        darkmode
        allowCopy={true}
        commandSnippet={commandSnippet}
        ignoreWhiteSpaces={false}
        downloadFileProps={{ downloadFileName: 'harness-cli-setup', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
        commentPrefix="#"
      />
    </Layout.Vertical>
  )
}

export function InfraDetailsComponent({ infraType = '' }): JSX.Element | null {
  const InfraTypeComponent = INFRATYPE_TO_COMPONENT_MAP[infraType] ?? null
  return InfraTypeComponent ? <InfraTypeComponent /> : null
}
