/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Icon, Layout, Switch, Text, TabNavigation } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { Page, useToaster } from '@common/exports'
import { useGetTriggerDetails, useUpdateTrigger, useGetPipelineSummary } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import routes from '@common/RouteDefinitions'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useQueryParams } from '@common/hooks'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import useIsNewGitSyncRemotePipeline from '@triggers/components/Triggers/useIsNewGitSyncRemotePipeline'
import { TriggerBreadcrumbs } from '@triggers/pages/trigger-details/TriggerDetails'
import { useIsTriggerCreatePermission } from '@triggers/components/Triggers/useIsTriggerCreatePermission'
import {
  getEnabledStatusTriggerValues,
  getTriggerIcon,
  isTriggerActivityHistoryDisabled
} from '../utils/TriggersListUtils'
import { clearNullUndefined, ResponseStatus } from '../utils/TriggersWizardPageUtils'
import css from './TriggerLandingPage.module.scss'

const loadingHeaderHeight = 43

export interface ConditionInterface {
  key: string
  operator: string
  value: string
}

const TriggerLandingPage: React.FC = ({ children }) => {
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, triggerIdentifier, module } = useParams<
    PipelineType<
      PipelinePathProps & {
        triggerIdentifier: string
      }
    >
  >()
  const isNewGitSyncRemotePipeline = useIsNewGitSyncRemotePipeline()
  const { CDS_TRIGGER_ACTIVITY_PAGE } = useFeatureFlags()

  const {
    data: triggerResponse,
    refetch: refetchTrigger,
    loading: loadingTrigger
  } = useGetTriggerDetails({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })

  const { mutate: updateTrigger, loading: updateTriggerLoading } = useUpdateTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier,
      ignoreError: true,
      ...(isNewGitSyncRemotePipeline && {
        branch,
        connectorRef,
        repoName,
        storeType
      })
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const isTriggerCreatePermission = useIsTriggerCreatePermission()

  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })
  useDocumentTitle([
    get(pipeline, 'data.name') || getString('pipelines'),
    get(triggerResponse, 'data.name') || getString('common.triggersLabel')
  ])

  const isPipelineInvalid = pipeline?.data?.entityValidityDetails?.valid === false

  const isTriggerRbacDisabled = !isTriggerCreatePermission || isPipelineInvalid

  const routeParams = {
    accountId,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    triggerIdentifier,
    module,
    repoIdentifier,
    branch,
    connectorRef,
    repoName,
    storeType
  }

  const triggerType = triggerResponse?.data?.type

  const triggerLinks = [
    {
      label: getString('details'),
      to: routes.toTriggersDetailPage(routeParams)
    },
    {
      label: getString('activityHistoryLabel'),
      to: routes.toTriggersActivityHistoryPage(routeParams),
      disabled: isTriggerActivityHistoryDisabled(triggerType)
    }
  ]

  return (
    <>
      <Container
        style={{ borderBottom: '1px solid var(--grey-200)', padding: '12px 24px 10px 24px' }}
        padding={{ top: 'xlarge', left: 'xlarge', bottom: 'medium', right: 'xlarge' }}
        background={Color.PRIMARY_1}
      >
        <Layout.Vertical spacing="medium">
          <TriggerBreadcrumbs pipelineResponse={pipeline} />
          {loadingTrigger && <Container height={loadingHeaderHeight} />}
          {triggerResponse && !loadingTrigger && (
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <Icon
                name={
                  triggerResponse.data?.type
                    ? getTriggerIcon({
                        type: triggerResponse.data.type,
                        webhookSourceRepo: get(triggerResponse.data.webhookDetails, 'webhookSourceRepo'),
                        buildType: get(triggerResponse.data.buildDetails, 'buildType')
                      })
                    : 'yaml-builder-trigger'
                }
                size={35}
              />
              <Layout.Horizontal spacing="small" data-testid={triggerResponse.data?.identifier} width={'78%'}>
                <Layout.Vertical padding={{ left: 'small' }}>
                  <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 600 }} color={Color.GREY_700}>
                      {get(triggerResponse.data, 'name')}
                    </Text>
                    <Switch
                      style={{ paddingLeft: '46px' }}
                      label={getString('enabledLabel')}
                      disabled={isTriggerRbacDisabled}
                      checked={triggerResponse.data?.enabled ?? false}
                      onChange={async () => {
                        const { values, error } = getEnabledStatusTriggerValues({
                          data: triggerResponse.data,
                          enabled: !!(triggerResponse.data && !triggerResponse.data.enabled),
                          getString
                        })
                        if (error) {
                          showError(error, undefined, 'pipeline.enable.status.error')
                          return
                        }
                        try {
                          const { status, data } = await updateTrigger(
                            yamlStringify({ trigger: clearNullUndefined(values) }) as any
                          )
                          const { errors, name, enabled } = defaultTo(data, {})
                          const dataEnabled = enabled ? 'enabled' : 'disabled'
                          if (errors && !isEmpty(errors)) {
                            showError(getString('triggers.toast.existingTriggerError'))
                            return
                          } else if (status === ResponseStatus.SUCCESS) {
                            showSuccess(
                              getString('triggers.toast.toggleEnable', {
                                enabled: dataEnabled,
                                name: name
                              })
                            )
                            refetchTrigger()
                          }
                        } catch (err) {
                          showError(err?.data?.message, undefined, 'pipeline.common.trigger.error')
                        }
                      }}
                    />
                  </Layout.Horizontal>
                  <Text>
                    {getString('common.ID')}: {get(triggerResponse.data, 'identifier')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
              {CDS_TRIGGER_ACTIVITY_PAGE && <TabNavigation links={triggerLinks} size={'small'} />}
            </Layout.Horizontal>
          )}
        </Layout.Vertical>
      </Container>
      <Page.Body loading={loadingTrigger || updateTriggerLoading} className={css.main}>
        {children}
      </Page.Body>
    </>
  )
}

export default TriggerLandingPage
