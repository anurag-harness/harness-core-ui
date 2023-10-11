/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Button, ButtonVariation, IconProps, Layout, Text } from '@harness/uicore'
import { Link, useParams } from 'react-router-dom'
import { String, StringKeys, useStrings } from 'framework/strings'
import type { NGTriggerDetailsResponse, TriggerStatus } from 'services/pipeline-ng'
import { killEvent } from '@common/utils/eventUtils'
import { useQueryParams } from '@common/hooks'
import { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import TriggerStatusErrorModal from './TriggerStatusErrorModal/TriggerStatusErrorModal'
import { isTriggerActivityHistoryDisabled } from '../../utils/TriggersListUtils'
import css from '../TriggersListSection.module.scss'
export interface TriggerStatusProps {
  triggerStatus: TriggerStatus
  triggerIdentifier: NGTriggerDetailsResponse['identifier']
  triggerType: NGTriggerDetailsResponse['type']
}

type TriggerStatusType = Required<TriggerStatus>['status']

const triggerStatusMessagesMap: Record<TriggerStatusType, StringKeys> = {
  SUCCESS: 'success',
  FAILED: 'failed',
  UNKNOWN: 'common.unknown',
  PENDING: 'triggers.pending'
}

const triggerStatusIconPropsMap: Record<TriggerStatusType, IconProps> = {
  SUCCESS: { name: 'full-circle', size: 6, color: Color.GREEN_500 },
  FAILED: { name: 'warning-sign', size: 12, color: Color.RED_500 },
  UNKNOWN: { name: 'gitops-unknown', size: 12, color: Color.YELLOW_500 },
  PENDING: { name: 'status-pending', size: 12, color: Color.YELLOW_500 }
}

export default function TriggerStatusCell({
  triggerStatus,
  triggerIdentifier,
  triggerType
}: TriggerStatusProps): React.ReactElement {
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } =
    useParams<PipelineType<PipelinePathProps>>()
  const { status, detailMessages, lastPolled, lastPollingUpdate } = triggerStatus
  const { getString } = useStrings()
  const [modalOpen, setModalOpen] = useState(false)

  const statusMsg = status && getString(triggerStatusMessagesMap[status])
  const statusIconProps = status && triggerStatusIconPropsMap[status]

  const handleErrorDetailsClick = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    setModalOpen(true)
  }

  const renderTooltip = useCallback(() => {
    const isArtifactOrManifestTrigger =
      triggerType === 'Artifact' || triggerType === 'MultiRegionArtifact' || triggerType === 'Manifest'
    const triggersActivityHistoryPageLink =
      triggerIdentifier &&
      (isTriggerActivityHistoryDisabled(triggerType) ? (
        <Button text={getString('activityHistoryLabel')} variation={ButtonVariation.LINK} disabled />
      ) : (
        <Link
          to={routes.toTriggersActivityHistoryPage({
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
          })}
          style={{ textAlign: 'center' }}
        >
          {getString('activityHistoryLabel')}
        </Link>
      ))

    if (status === 'SUCCESS' && isArtifactOrManifestTrigger) {
      return (
        <Layout.Vertical font={{ variation: FontVariation.SMALL }} spacing="small" padding="medium">
          {lastPollingUpdate && (
            <Text
              font={{ variation: FontVariation.SMALL }}
              color={Color.WHITE}
              lineClamp={2}
              tooltipProps={{ disabled: true }}
            >
              <String
                stringID={
                  triggerType === 'Manifest' ? 'triggers.versionLastCollectedAt' : 'triggers.tagLastCollectedAt'
                }
              />
              <span>:&nbsp;</span>
              <time>{new Date(lastPollingUpdate).toLocaleString()}</time>
            </Text>
          )}
          {lastPolled?.length && (
            <Text font={{ variation: FontVariation.SMALL }} color={Color.WHITE} tooltipProps={{ disabled: true }}>
              <String
                stringID={triggerType === 'Manifest' ? 'triggers.lastCollectedVersion' : 'triggers.lastCollectedTag'}
              />
              <span>:&nbsp;</span>
              {lastPolled.map((tag, idx) => {
                // Show tags/versions in list if more than 1
                if (lastPolled.length === 1) {
                  return <span key={idx}>{tag}</span>
                }

                return <li key={idx}>{tag}</li>
              })}
            </Text>
          )}
          {triggersActivityHistoryPageLink}
        </Layout.Vertical>
      )
    }

    if (status === 'SUCCESS') return

    if (status === 'PENDING' && isArtifactOrManifestTrigger) {
      return (
        <Layout.Vertical font={{ variation: FontVariation.SMALL }} spacing="small" padding="medium">
          <Text font={{ variation: FontVariation.SMALL }} color={Color.WHITE} tooltipProps={{ disabled: true }}>
            {getString(triggerType === 'Manifest' ? 'triggers.waitingForVersion' : 'triggers.waitingForTag')}
          </Text>
          {triggersActivityHistoryPageLink}
        </Layout.Vertical>
      )
    }

    return (
      <Layout.Vertical font={{ variation: FontVariation.SMALL }} spacing="small" padding="medium">
        {detailMessages?.map((error, idx) => (
          <Text
            key={idx}
            font={{ variation: FontVariation.SMALL }}
            color={Color.WHITE}
            lineClamp={2}
            tooltipProps={{ disabled: true }}
          >
            {error}
          </Text>
        ))}
        <Button
          minimal
          text={getString('common.viewErrorDetails')}
          onClick={handleErrorDetailsClick}
          variation={ButtonVariation.LINK}
        />
        {triggersActivityHistoryPageLink}
      </Layout.Vertical>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, detailMessages, triggerStatus])

  return (
    <div onClick={killEvent}>
      <Text
        inline
        icon={statusIconProps?.name}
        iconProps={statusIconProps}
        tooltip={renderTooltip()}
        tooltipProps={{
          isDark: true,
          position: 'bottom',
          popoverClassName: css.tooltip,
          className: css.tooltipWrapper
        }}
      >
        {statusMsg}
      </Text>
      <TriggerStatusErrorModal
        closeDialog={() => setModalOpen(false)}
        isOpen={modalOpen}
        triggerStatus={triggerStatus}
      />
    </div>
  )
}
