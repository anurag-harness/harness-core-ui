/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Layout, CardSelect, Text, Icon, IconName } from '@harness/uicore'
import { StringsMap } from 'stringTypes'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { String, useStrings } from 'framework/strings'
import {
  DEPLOYMENT_STRATEGY_TYPES,
  DEPLOYMENT_TYPE_MAP,
  DEPLOYMENT_TYPE_TO_DIR_MAP,
  DEPLOYMENT_TYPE_TO_FILE_MAPS,
  StrategyVideoByType
} from '../../Constants'
import { CDOnboardingSteps, DeploymentStrategyTypes, WhatToDeployType } from '../../types'
import { useOnboardingStore } from '../../Store/OnboardingStore'
import VerifyPipeline from '../VerificationComponents/VerifyPipeline'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

interface DeploymentStrategySelectionProps {
  updateState: (data?: DeploymentStrategyTypes) => void
  saveProgress: (stepId: string, data: any) => void
}
export default function DeploymentStrategySelection({
  updateState,
  saveProgress
}: DeploymentStrategySelectionProps): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const [state, setState] = React.useState<DeploymentStrategyTypes | undefined>(() => {
    const preSavedStrategy = stepsProgress[CDOnboardingSteps.DEPLOYMENT_STEPS]?.stepData?.strategyId
    const artifactSubType = stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData?.artifactSubType?.id
    const artifactType = stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData?.artifactType?.id
    const [firstDeploymentType] = DEPLOYMENT_TYPE_MAP[artifactSubType || artifactType]

    if (preSavedStrategy && preSavedStrategy !== firstDeploymentType) {
      return DEPLOYMENT_STRATEGY_TYPES[firstDeploymentType]
    } else if (!preSavedStrategy) {
      return DEPLOYMENT_STRATEGY_TYPES[firstDeploymentType]
    }

    return DEPLOYMENT_STRATEGY_TYPES[preSavedStrategy]
  })
  const { getString } = useStrings()
  const deploymentData = React.useMemo((): WhatToDeployType => {
    return stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData
  }, [stepsProgress])

  const deploymentStrategies = React.useMemo((): DeploymentStrategyTypes[] => {
    return Object.values(DEPLOYMENT_STRATEGY_TYPES).filter((data: DeploymentStrategyTypes) => {
      const artifactSubType = deploymentData.artifactSubType?.id
      const artifactType = deploymentData.artifactType?.id
      let isSupportedStrategy = true
      if (artifactSubType && !DEPLOYMENT_TYPE_MAP[artifactSubType].includes(data.id)) {
        isSupportedStrategy = false
      } else if (artifactType && !artifactSubType && !DEPLOYMENT_TYPE_MAP[artifactType].includes(data.id)) {
        isSupportedStrategy = false
      }
      return isSupportedStrategy
    })
  }, [])

  React.useEffect(() => {
    updateState(state)
  }, [state])

  const setDeploymentStrategy = (selected: DeploymentStrategyTypes): void => {
    setState(selected)
    saveProgress(CDOnboardingSteps.DEPLOYMENT_STEPS, { ...state, pipelineVerified: false })
  }
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'large' }}>
        <String
          color={Color.BLACK}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.deploymentStrategyStep.title"
          vars={{
            num:
              (stepsProgress[CDOnboardingSteps.WHAT_TO_DEPLOY].stepData as WhatToDeployType)?.svcType?.id ===
              'KubernetesService'
                ? 3
                : 4
          }}
        />
      </Text>
      <Text color={Color.BLACK} padding={{ bottom: 'xlarge' }}>
        <String
          color={Color.BLACK}
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.deploymentStrategyStep.description"
        />
      </Text>

      <CardSelect<DeploymentStrategyTypes>
        data={deploymentStrategies}
        cornerSelected
        className={cx(css.serviceTypeCards, css.deploymentStrategyCards)}
        renderItem={(item: DeploymentStrategyTypes) => (
          <Layout.Vertical flex spacing={'xlarge'}>
            <Icon name={item?.icon as IconName} size={30} />
            <Text
              className={cx({ [css.bold]: state?.id === item.id })}
              font={{
                variation: FontVariation.BODY2
              }}
              color={state?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.label}
            </Text>
            <Text
              margin={{ top: 'small' }}
              font={{
                variation: FontVariation.BODY2_SEMI
              }}
              color={Color.GREY_800}
            >
              {getString(item.subtitle as keyof StringsMap)}
            </Text>
          </Layout.Vertical>
        )}
        selected={state}
        onChange={setDeploymentStrategy}
      />

      {state && (
        <Layout.Vertical margin={{ bottom: 'xlarge' }}>
          <PipelineCommandStep strategy={state} />
          <Layout.Horizontal>
            <video key={state.id} loop={true} className={css.videoPlayer} autoPlay={true} data-testid="videoPlayer">
              <source src={StrategyVideoByType[state.id]} type="video/mp4"></source>
              <Text tooltipProps={{ dataTooltipId: 'videoNotSupportedError' }}>
                {getString('common.videoNotSupportedError')}
              </Text>
            </video>
            <Layout.Vertical className={css.deploymentStrategySteps}>
              {DEPLOYMENT_STRATEGY_TYPES[state.id].steps?.map((stepText, index) => {
                return (
                  <Layout.Vertical key={index} className={css.deploymentStrategyStep}>
                    <Text color={Color.BLACK} className={css.bold}>
                      {stepText.title}:
                    </Text>
                    <Text color={Color.BLACK}>{getString(stepText.description as keyof StringsMap)}</Text>
                  </Layout.Vertical>
                )
              })}
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Vertical>
      )}

      <VerifyPipeline key={state?.id} saveProgress={saveProgress} />
    </Layout.Vertical>
  )
}

function PipelineCommandStep({ strategy }: { strategy: DeploymentStrategyTypes }): JSX.Element {
  const { getString } = useStrings()

  const { stepsProgress } = useOnboardingStore()
  const deploymentData = React.useMemo((): WhatToDeployType => {
    return stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData
  }, [stepsProgress])

  const dirPath = DEPLOYMENT_TYPE_TO_DIR_MAP[deploymentData.artifactType?.id as string]
  const pipelineFileName = DEPLOYMENT_TYPE_TO_FILE_MAPS[deploymentData.artifactSubType?.id as string]?.[strategy.id]

  return (
    <Layout.Vertical margin={{ bottom: 'xlarge', top: 'large' }}>
      <CommandBlock
        darkmode
        allowCopy={true}
        commandSnippet={getString(strategy.pipelineCommand, {
          type: dirPath,
          pipeline: pipelineFileName || strategy.pipelineName
        })}
        ignoreWhiteSpaces={false}
        downloadFileProps={{ downloadFileName: 'harness-cli-setup', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
    </Layout.Vertical>
  )
}
