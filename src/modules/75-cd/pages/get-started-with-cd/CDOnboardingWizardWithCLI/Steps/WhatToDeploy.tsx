/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { FontVariation, Color } from '@harness/design-system'
import { Layout, CardSelect, Text, Icon, IconName } from '@harness/uicore'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings } from 'framework/strings'
import {
  SERVICE_TYPES,
  INFRA_TYPES,
  INFRA_SUB_TYPES,
  ARTIFACT_STRINGS_MAP_BY_TYPE,
  SWIMLANE_DOCS_LINK
} from '../Constants'
import { useOnboardingStore } from '../Store/OnboardingStore'
import { CDOnboardingSteps, EntityType, WhatToDeployType } from '../types'
import MissingSwimlane from './MissingSwimlane'
import { ONBOARDING_INTERACTIONS, WIZARD_STEP_OPEN } from '../TrackingConstants'
import css from '../CDOnboardingWizardWithCLI.module.scss'
interface WhatToDeployProps {
  saveProgress: (stepId: string, data: any) => void
}
function WhatToDeploy({ saveProgress }: WhatToDeployProps): JSX.Element {
  const { stepsProgress } = useOnboardingStore()
  const { trackEvent } = useTelemetry()
  const [state, setState] = React.useState<WhatToDeployType>(() => {
    return stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData || {}
  })

  const { getString } = useStrings()
  const setSvc = (selected: EntityType): void => {
    if (selected !== state.svcType) {
      setState({ ...state, svcType: selected, artifactType: undefined, artifactSubType: undefined })
      trackEvent(ONBOARDING_INTERACTIONS.CD_ONBOARDING_BRANCH_SELECTED, {
        question: getString('cd.getStartedWithCD.flowByQuestions.what.aboutSvc'),
        answer: selected.label
      })
    }
  }
  const setInfra = (selected: EntityType): void => {
    setState({ ...state, artifactType: selected, artifactSubType: undefined })

    trackEvent(ONBOARDING_INTERACTIONS.CD_ONBOARDING_BRANCH_SELECTED, {
      question: getString(ARTIFACT_STRINGS_MAP_BY_TYPE[state?.svcType?.id as string]?.svcrep),
      answer: selected.label
    })
  }

  const setInfraSubType = (selected: EntityType): void => {
    setState({ ...state, artifactSubType: selected })

    trackEvent(ONBOARDING_INTERACTIONS.CD_ONBOARDING_BRANCH_SELECTED, {
      question: getString(ARTIFACT_STRINGS_MAP_BY_TYPE[state?.artifactType?.id as string]?.artifact),
      answer: selected.label
    })
  }
  const svcTypes = React.useMemo((): EntityType[] => {
    return Object.values(SERVICE_TYPES).map((data: EntityType) => {
      return data
    })
  }, [])

  const infraTypes = React.useMemo((): EntityType[] => {
    let infraTypesList: EntityType[] = []
    if (!state.svcType) return infraTypesList
    const infraTypeObj = INFRA_TYPES[state?.svcType?.id]
    infraTypesList = INFRA_TYPES[state?.svcType?.id]
      ? Object.values(infraTypeObj)?.map((data: EntityType) => {
          return data
        })
      : infraTypesList
    return infraTypesList
  }, [state.svcType])

  const infraSubTypes = React.useMemo((): EntityType[] => {
    let infraSubTypesList: EntityType[] = []
    if (!state.artifactType) return infraSubTypesList
    const infraTypeObj = INFRA_SUB_TYPES[state?.artifactType?.id]
    infraSubTypesList = INFRA_SUB_TYPES[state?.artifactType?.id]
      ? Object.values(infraTypeObj)?.map((data: EntityType) => {
          return data
        })
      : infraSubTypesList
    return infraSubTypesList
  }, [state.artifactType])
  React.useEffect(() => {
    trackEvent(WIZARD_STEP_OPEN.WHAT_STEP_OPENED, {})
  }, [])
  React.useEffect(() => {
    saveProgress(CDOnboardingSteps.WHAT_TO_DEPLOY, state)
  }, [state])
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} margin={{ bottom: 'xlarge' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.what.samplesvc')}
      </Text>
      <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'xxlarge' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.what.aboutSvc')}
      </Text>

      <CardSelect<EntityType>
        data={svcTypes}
        cornerSelected
        className={cx(css.serviceTypeCards, css.infraCards)}
        renderItem={(item: EntityType) => (
          <Layout.Vertical flex spacing={'xlarge'}>
            <Icon name={item?.icon as IconName} className={item.className} size={30} />
            <Text
              font={{
                variation: FontVariation.BODY
              }}
              color={state.artifactType?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.label}
            </Text>
          </Layout.Vertical>
        )}
        selected={state.svcType}
        onChange={setSvc}
      />
      {state.svcType && !isEmpty(infraTypes) && (
        <>
          {ARTIFACT_STRINGS_MAP_BY_TYPE?.[state.svcType?.id]?.svcrep && (
            <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
              {getString(ARTIFACT_STRINGS_MAP_BY_TYPE[state.svcType?.id]?.svcrep)}
            </Text>
          )}
          {ARTIFACT_STRINGS_MAP_BY_TYPE?.[state.svcType?.id]?.svcsubtext && (
            <Text color={Color.BLACK} margin={{ bottom: 'xxlarge' }}>
              {getString(ARTIFACT_STRINGS_MAP_BY_TYPE[state.svcType?.id]?.svcsubtext)}
            </Text>
          )}
          <CardSelect<EntityType>
            data={infraTypes}
            cornerSelected
            className={cx(css.serviceTypeCards, css.infraCards)}
            renderItem={(item: EntityType) => (
              <Layout.Vertical flex spacing={'xlarge'}>
                <Icon name={item?.icon as IconName} size={30} />
                <Text
                  font={{
                    variation: FontVariation.BODY
                  }}
                  color={state.artifactType?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
                >
                  {item.label}
                </Text>
              </Layout.Vertical>
            )}
            selected={state.artifactType}
            onChange={setInfra}
          />
        </>
      )}
      {state.artifactType && SWIMLANE_DOCS_LINK[state.artifactType.id]?.isInComplete && (
        <MissingSwimlane url={SWIMLANE_DOCS_LINK[state.artifactType.id]?.link} />
      )}
      {state.artifactType && !isEmpty(infraSubTypes) && (
        <>
          {ARTIFACT_STRINGS_MAP_BY_TYPE?.[state.artifactType?.id]?.artifact && (
            <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
              {getString(ARTIFACT_STRINGS_MAP_BY_TYPE?.[state.artifactType?.id]?.artifact)}
            </Text>
          )}
          <CardSelect<EntityType>
            data={infraSubTypes}
            cornerSelected
            className={cx(css.serviceTypeCards, css.infraCards)}
            renderItem={(item: EntityType) => (
              <Layout.Vertical flex spacing={'xlarge'}>
                <Icon name={item?.icon as IconName} size={30} />
                <Text
                  font={{
                    variation: FontVariation.BODY
                  }}
                  color={state.artifactSubType?.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
                >
                  {item.label}
                </Text>
              </Layout.Vertical>
            )}
            selected={state.artifactSubType}
            onChange={setInfraSubType}
          />
        </>
      )}
      {state.artifactSubType && SWIMLANE_DOCS_LINK[state.artifactSubType.id]?.isInComplete && (
        <MissingSwimlane url={SWIMLANE_DOCS_LINK[state.artifactSubType.id]?.link} />
      )}
    </Layout.Vertical>
  )
}

export default WhatToDeploy
