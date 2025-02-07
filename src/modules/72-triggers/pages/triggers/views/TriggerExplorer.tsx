/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { BaseSyntheticEvent, useMemo } from 'react'
import {
  ExpandingSearchInput,
  Layout,
  Text,
  Button,
  ButtonVariation,
  TableV2,
  Page,
  Card,
  Container,
  Icon
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import { capitalize, defaultTo, get, isEmpty } from 'lodash-es'
import { Column } from 'react-table'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  NGTriggerEventHistoryResponse,
  NGTriggerSourceV2,
  useTriggerHistoryEventCorrelationV2
} from 'services/pipeline-ng'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { COMMON_PAGE_SIZE_OPTIONS } from '@common/constants/Pagination'
import { usePrevious } from '@common/hooks/usePrevious'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import routes from '@common/RouteDefinitions'
import { CellType, PayloadDrawer, RenderColumnEventId, RenderColumnPayload } from '../utils/TriggerActivityUtils'
import TriggerExplorerEmptyState from '../TriggerLandingPage/images/trigger_explorer_empty_state.svg'
import { WebhookTriggerHelpPanel } from '../TriggerExplorerHelpPanel/WebhookTriggerHelpPanel'
import css from './TriggerExplorer.module.scss'

const RenderColumnMessage: CellType = ({ row }) => {
  return (
    <Text color={Color.BLACK} lineClamp={1} width="90%" tooltipProps={{ isDark: true }}>
      {row.original.message}
    </Text>
  )
}

const RenderColumnStatus: CellType = ({ row }) => {
  const data = row.original.triggerEventStatus
  const { status, message } = defaultTo(data, {})
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
      <ExecutionStatusLabel status={capitalize(status) as ExecutionStatus} />
      <div className={css.statusMessage}>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500} lineClamp={1}>
          {message}
        </Text>
      </div>
    </Layout.Vertical>
  )
}

const RenderTriggerName: CellType = ({ row }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { orgIdentifier = '', projectIdentifier = '', targetIdentifier = '', triggerIdentifier = '' } = row.original
  return (
    <Layout.Horizontal>
      <Link
        to={routes.toTriggersActivityHistoryPage({
          accountId,
          orgIdentifier: orgIdentifier,
          projectIdentifier: projectIdentifier,
          pipelineIdentifier: targetIdentifier,
          triggerIdentifier: triggerIdentifier
        })}
        target="_blank"
      >
        <Text
          font={{ variation: FontVariation.LEAD }}
          color={Color.PRIMARY_7}
          tooltipProps={{ isDark: true }}
          lineClamp={1}
        >
          {triggerIdentifier}
        </Text>
      </Link>
    </Layout.Horizontal>
  )
}

const RegisteredTriggers: React.FC = (): React.ReactElement => {
  const [searchId, setSearchId] = React.useState('')
  const { getRBACErrorMessage } = useRBACError()
  const previousSearchId = usePrevious(searchId)
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const {
    data: triggerData,
    loading,
    refetch,
    error
  } = useTriggerHistoryEventCorrelationV2({
    eventCorrelationId: searchId,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })
  const { content, totalElements, totalPages, pageable } = defaultTo(triggerData?.data, {})

  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(totalElements, 0),
    pageSize: COMMON_PAGE_SIZE_OPTIONS[0],
    pageCount: defaultTo(totalPages, -1),
    pageIndex: get(pageable, 'pageNumber', 0)
  })

  const [showPayload, setShowPayload] = React.useState<boolean>(true)
  const [selectedPayloadRow, setSelectedPayloadRow] = React.useState<string | undefined>()
  const [triggerType, setTriggerType] = React.useState<NGTriggerSourceV2['type']>('Webhook')
  const [showHelpPanel, setShowHelpPanel] = React.useState<boolean>(true)

  React.useEffect(() => {
    if (content) {
      setShowHelpPanel(false)
    } else {
      setShowHelpPanel(true)
    }
  }, [content])

  const columns: Column<NGTriggerEventHistoryResponse>[] = useMemo(
    () => [
      {
        Header: getString('triggers.activityHistory.eventCorrelationId'),
        id: 'eventCorrelationId',
        width: '22%',
        Cell: RenderColumnEventId
      },
      {
        Header: getString('common.triggerName'),
        id: 'name',
        width: '20%',
        Cell: RenderTriggerName
      },
      {
        Header: getString('triggers.activityHistory.triggerStatus'),
        id: 'status',
        width: '18%',
        Cell: RenderColumnStatus
      },
      {
        Header: getString('message'),
        id: 'message',
        width: '35%',
        Cell: RenderColumnMessage
      },
      {
        Header: getString('common.payload'),
        width: '5%',
        id: 'payload',
        Cell: RenderColumnPayload,
        setShowPayload,
        setSelectedPayloadRow
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <Layout.Vertical padding={'xlarge'}>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <Text font={{ weight: 'semi-bold', variation: FontVariation.BODY }}>
          {getString('triggers.triggerExplorer.pageSubHeading')}
        </Text>
        <Button onClick={() => setShowHelpPanel(!showHelpPanel)} intent="none" minimal data-testid="panel">
          {showHelpPanel
            ? getString('triggers.triggerExplorer.hidePanel')
            : getString('triggers.triggerExplorer.showPanel')}
        </Button>
      </Layout.Horizontal>
      <Container padding={{ top: 'medium', bottom: 'medium' }}>
        {showHelpPanel
          ? triggerType === 'Webhook' && (
              <Card className={css.helpPanel} data-testid="helpPanelCard">
                <Layout.Horizontal>
                  <Icon name="info-message" size={24} className={css.infoMessage} padding={{ right: 'xsmall' }} />
                  <Text font={{ weight: 'semi-bold', variation: FontVariation.H5 }}>
                    {getString('triggers.triggerExplorer.tabName')}
                  </Text>
                </Layout.Horizontal>
                <Text
                  font={{ weight: 'semi-bold', variation: FontVariation.BODY }}
                  padding={{ top: 'small', left: 'xlarge' }}
                >
                  {getString('triggers.triggerExplorer.pageSubHeading')}
                </Text>
                <WebhookTriggerHelpPanel />
              </Card>
            )
          : null}
      </Container>
      <Layout.Vertical border={{ radius: 8, color: Color.GREY_100 }} background={Color.WHITE} padding={'large'}>
        <Text font={{ weight: 'semi-bold', variation: FontVariation.H5 }} padding={{ bottom: 'medium' }}>
          {getString('triggers.triggerExplorer.searchTriggers')}
        </Text>
        <RadioGroup
          inline
          selectedValue={triggerType}
          onChange={(e: BaseSyntheticEvent) => {
            setTriggerType(e.target.value)
          }}
          label={getString('triggers.triggerExplorer.selectTriggerType')}
        >
          <Radio value={'Webhook'} label={getString('execution.triggerType.WEBHOOK')} />
          <Radio value={'Artifact'} label={getString('pipeline.artifactTriggerConfigPanel.artifact')} disabled />
        </RadioGroup>
        {triggerType === 'Webhook' && (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing={'medium'}>
            <Text font={{ weight: 'semi-bold', variation: FontVariation.H6 }}>
              {getString('triggers.triggerExplorer.searchPlaceholder')}
            </Text>
            <ExpandingSearchInput
              alwaysExpanded
              width={300}
              name="eventCorrelationIdSearch"
              placeholder={getString('triggers.triggerExplorer.searchPlaceholder')}
              onChange={text => {
                setSearchId(text.trim())
              }}
              throttle={200}
            />
            <Button
              small
              variation={ButtonVariation.PRIMARY}
              data-testid="searchBasedOnEventCorrelationId"
              text={getString('search')}
              onClick={() => {
                if (previousSearchId !== searchId) {
                  refetch()
                }
              }}
              disabled={isEmpty(searchId)}
            />
          </Layout.Horizontal>
        )}
      </Layout.Vertical>

      <Page.Body
        loading={loading}
        error={error ? getRBACErrorMessage(error) : ''}
        retryOnError={() => refetch()}
        noData={{
          when: () => Array.isArray(content) && isEmpty(content),
          image: TriggerExplorerEmptyState,
          messageTitle: getString('triggers.triggerExplorer.emptyStateMessage')
        }}
        className={css.pageBody}
      >
        {!isEmpty(content) && searchId && (
          <TableV2<NGTriggerEventHistoryResponse>
            className={css.table}
            columns={columns}
            data={content as NGTriggerEventHistoryResponse[]}
            name="TriggerExplorerView"
            pagination={paginationProps}
          />
        )}
      </Page.Body>

      {showPayload && selectedPayloadRow && (
        <PayloadDrawer onClose={() => setShowPayload(false)} selectedPayloadRow={selectedPayloadRow} />
      )}
    </Layout.Vertical>
  )
}

export default RegisteredTriggers
