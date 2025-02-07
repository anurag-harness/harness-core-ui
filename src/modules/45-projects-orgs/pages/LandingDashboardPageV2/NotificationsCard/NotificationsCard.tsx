/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Layout, Text, Popover, Icon, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { String, useStrings } from 'framework/strings'
import {
  DeploymentsOverview,
  useGetDeploymentStatsOverview,
  GetDeploymentStatsOverviewQueryParams,
  PipelineExecutionInfo
} from 'services/dashboard-service'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { TimeRangeFilterType } from '@common/types'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import { getGroupByFromTimeRange } from '@projects-orgs/utils/utils'
import { usePolling } from '@common/hooks/usePolling'
import DeployOverviewPopover, { FailedStatus } from './DeploymentOverviewPopover'
import ErrorCard, { ErrorCardSize } from '../ErrorCard/ErrorCard'
import css from './NotificationsCard.module.scss'

const getBadge = (type: string, deployStat: PipelineExecutionInfo[], isLastIndex: boolean): JSX.Element | null => {
  const stat = deployStat.length
  if (stat <= 0) {
    return null
  }

  const badgeClass = cx(css.badge, { [css.lastBadge]: isLastIndex })
  switch (type) {
    case 'pendingManualInterventionExecutions':
      return (
        <Popover interactionKind="hover" popoverClassName={css.popoverStyle} autoFocus={false}>
          <div className={badgeClass} key={type}>
            <Icon name="status-pending" size={16} color={Color.ORANGE_700} />
            <Text className={css.badgeText}>
              {`${stat} `}
              {stat > 1 ? (
                <String stringID={'pipeline.dashboardDeploymentsWidget.pendingManualIntervention.plural'} />
              ) : (
                <String stringID={'pipeline.dashboardDeploymentsWidget.pendingManualIntervention.singular'} />
              )}
            </Text>
          </div>
          <DeployOverviewPopover overview={deployStat} status={['InterventionWaiting']} />
        </Popover>
      )
    case 'pendingApprovalExecutions':
      return (
        <Popover interactionKind="hover" popoverClassName={css.popoverStyle} autoFocus={false}>
          <div className={badgeClass} key={type}>
            <Icon name="status-pending" size={16} color={Color.ORANGE_700} />
            <Text className={css.badgeText}>
              {`${stat} `}
              {stat > 1 ? (
                <String stringID={'pipeline.dashboardDeploymentsWidget.pendingApproval.plural'} />
              ) : (
                <String stringID={'pipeline.dashboardDeploymentsWidget.pendingApproval.singular'} />
              )}
            </Text>
          </div>
          <DeployOverviewPopover overview={deployStat} status={['ApprovalWaiting']} />
        </Popover>
      )
    case 'failed24HrsExecutions':
      return (
        <Popover interactionKind="hover" popoverClassName={css.popoverStyle} autoFocus={false}>
          <div className={cx(badgeClass, css.failed24HrsExecutionsBadge)} key={type}>
            <Icon name="warning-sign" size={12} color={Color.RED_600} />
            <Text className={css.badgeText}>
              {`${stat} `}
              {stat > 1 ? (
                <String stringID={'pipeline.dashboardDeploymentsWidget.failed24Hrs.plural'} />
              ) : (
                <String stringID={'pipeline.dashboardDeploymentsWidget.failed24Hrs.singular'} />
              )}
            </Text>
          </div>
          <DeployOverviewPopover overview={deployStat} status={Object.keys(FailedStatus)} />
        </Popover>
      )
    case 'runningExecutions':
      return (
        <Popover interactionKind="hover" popoverClassName={css.popoverStyle} autoFocus={false}>
          <div className={cx(badgeClass, css.runningExecutions)} key={type}>
            <Icon name="status-running" size={16} color={Color.PRIMARY_7} />
            <Text className={css.badgeText}>
              {`${stat} `}
              {stat > 1 ? (
                <String stringID={'pipeline.dashboardDeploymentsWidget.runningPipeline.plural'} />
              ) : (
                <String stringID={'pipeline.dashboardDeploymentsWidget.runningPipeline.singular'} />
              )}
            </Text>
          </div>
          <DeployOverviewPopover overview={deployStat} status={['Running']} />
        </Popover>
      )
    default:
      return null
  }
}

const showBadgesCard = (deploymentsOverview: DeploymentsOverview): boolean => {
  const deploymentsOverviewKeys = Object.keys(deploymentsOverview)
  if (Object.keys(deploymentsOverviewKeys).length === 0) {
    return false
  }
  const nonZeroDeploymentsOverviewKeys = deploymentsOverviewKeys.filter(
    key => (deploymentsOverview as any)[key].length > 0
  )
  return nonZeroDeploymentsOverviewKeys.length > 0
}

interface NotificationsCardProps {
  timeRange: TimeRangeFilterType
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({ timeRange }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [pollingStarted, setIsPollingStarted] = useState<boolean>(false)
  const { showError } = useToaster()

  const { data, refetch, loading, error } = useGetDeploymentStatsOverview({
    queryParams: {
      accountIdentifier: accountId,
      startTime: getGMTStartDateTime(timeRange.from),
      endTime: getGMTEndDateTime(timeRange.to),
      groupBy: getGroupByFromTimeRange(timeRange) as GetDeploymentStatsOverviewQueryParams['groupBy'],
      sortBy: 'DEPLOYMENTS'
    }
  })

  usePolling(
    () => {
      refetch()
      setIsPollingStarted(true)
      if (error) {
        return Promise.reject()
      }

      return Promise.resolve()
    },
    { startPolling: !error, pollingInterval: 3000 }
  )

  useEffect(() => {
    if (error) {
      showError('Error fetching Notifications')
    }
  }, [error])

  const response = data?.data?.response

  const renderBadges = () => {
    if (error) {
      return (
        <ErrorCard
          size={ErrorCardSize.MEDIUM}
          onRetry={() => {
            refetch()
          }}
        />
      )
    }

    if (response?.deploymentsOverview && showBadgesCard(response?.deploymentsOverview)) {
      const badgesArr = Object.keys(response?.deploymentsOverview)
      return badgesArr.map((key, index) =>
        getBadge(key, (response?.deploymentsOverview as any)[key], index === badgesArr.length - 1)
      )
    }

    return (
      <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} padding="small">
        {getString('common.noNotifications')}
      </Text>
    )
  }

  return (
    <Layout.Vertical className={css.container}>
      <>
        <Container className={css.header}>
          <Text color={Color.GREY_800} font={{ variation: FontVariation.CARD_TITLE }}>
            {getString('common.notification')}
          </Text>
        </Container>
        <Container className={css.badgesContainer}>
          {loading && !pollingStarted ? (
            <Container flex={{ justifyContent: 'center' }} className={css.loadingContainer}>
              <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
            </Container>
          ) : (
            renderBadges()
          )}
        </Container>
      </>
    </Layout.Vertical>
  )
}

export default NotificationsCard
