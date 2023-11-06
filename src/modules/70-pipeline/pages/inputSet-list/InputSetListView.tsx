/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Container, Icon, IconName, Layout, Popover, TableV2, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import { useParams } from 'react-router-dom'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { get } from 'lodash-es'
import type {
  PageInputSetSummaryResponse,
  InputSetSummaryResponse,
  ResponseInputSetTemplateWithReplacedExpressionsResponse
} from 'services/pipeline-ng'
import { TagsPopover } from '@common/components'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, Module } from '@common/interfaces/RouteInterfaces'
import GitDetailsColumn from '@common/components/Table/GitDetailsColumn/GitDetailsColumn'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType as GitResourceType } from '@common/interfaces/GitSyncInterface'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import { CodeSourceCell } from '@pipeline/pages/pipeline-list/PipelineListTable/PipelineListCells'
import { OutOfSyncErrorStrip } from '@pipeline/components/InputSetErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip'
import useMigrateResource from '@pipeline/components/MigrateResource/useMigrateResource'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { MigrationType } from '@pipeline/components/MigrateResource/MigrateUtils'
import useEditGitMetadata from '@pipeline/components/MigrateResource/useEditGitMetadata'
import useDeleteConfirmationDialog from '../utils/DeleteConfirmDialog'
import { Badge } from '../utils/Badge/Badge'
import { INPUT_SETS_PAGE_SIZE } from './Util'
import css from './InputSetList.module.scss'

interface InputSetListViewProps {
  data?: PageInputSetSummaryResponse
  goToInputSetDetail?: (inputSet?: InputSetSummaryResponse) => void
  refetchInputSet?: () => void
  canUpdate?: boolean
  pipelineHasRuntimeInputs?: boolean
  isPipelineInvalid?: boolean
  pipelineStoreType?: StoreType
  onDeleteInputSet: (commitMsg: string) => Promise<void>
  onDelete: (inputSet: InputSetSummaryResponse) => void
  template?: ResponseInputSetTemplateWithReplacedExpressionsResponse | null
}

export interface InputSetLocal extends InputSetSummaryResponse {
  action?: string
  lastUpdatedBy?: string
  createdBy?: string
  inputFieldSummary?: string
}

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  goToInputSetDetail?: (inputSet?: InputSetSummaryResponse) => void
  refetchInputSet?: () => void
  onDeleteInputSet?: (commitMsg: string) => Promise<void>
  onDelete?: (inputSet: InputSetSummaryResponse) => void
  template?: ResponseInputSetTemplateWithReplacedExpressionsResponse | null
  pipelineStoreType?: StoreType
}

const getIconByType = (type: InputSetSummaryResponse['inputSetType']): IconName => {
  return type === 'OVERLAY_INPUT_SET' ? 'step-group' : 'yaml-builder-input-sets'
}

const showMoveToGitOption = (
  pipelineStoreType: StoreMetadata['storeType'],
  inputSetStoreType: StoreMetadata['storeType']
): boolean => {
  return pipelineStoreType === StoreType.REMOTE && (inputSetStoreType === StoreType.INLINE || !inputSetStoreType)
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnInputSet: Renderer<CellProps<InputSetLocal>> = ({ row }) => {
  const { getString } = useStrings()
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <Icon
        name={getIconByType(data.inputSetType)}
        color={data.inputSetType === 'INPUT_SET' ? Color.BLACK : Color.BLUE_500}
        size={30}
      />
      <Layout.Horizontal
        flex={{ alignItems: 'center' }}
        spacing="small"
        style={{ flexShrink: 1 }}
        padding={{ right: 'medium' }}
      >
        <div>
          <Layout.Horizontal spacing="small" data-testid={data.identifier}>
            <Text lineClamp={1} color={Color.BLACK}>
              {data.name}
            </Text>
            {data.tags && Object.keys(data.tags || {}).length ? <TagsPopover tags={data.tags} /> : null}
          </Layout.Horizontal>
          <Text lineClamp={1} color={Color.GREY_400}>
            {getString('idLabel', { id: data.identifier })}
          </Text>
        </div>
        {isInputSetInvalid(data) && (
          <Container padding={{ left: 'large' }}>
            <Badge
              text={'common.invalid'}
              iconName="error-outline"
              showTooltip={false}
              entityName={data.name}
              entityType={data.inputSetType === 'INPUT_SET' ? 'Input Set' : 'Overlay Input Set'}
              uuidToErrorResponseMap={data.inputSetErrorDetails?.uuidToErrorResponseMap}
              overlaySetErrorDetails={data.overlaySetErrorDetails}
            />
          </Container>
        )}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnDescription: Renderer<CellProps<InputSetLocal>> = ({ row }) => {
  const data = row.original
  return (
    <Text padding={{ right: 'medium' }} lineClamp={2} color={Color.BLACK}>
      {data.description}
    </Text>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnMenu: Renderer<CellProps<InputSetLocal>> = ({ row, column }) => {
  const data = row.original
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()
  const isPipelineInvalid = (column as any)?.isPipelineInvalid
  const pipelineStoreType = (column as CustomColumn<InputSetLocal>)?.pipelineStoreType

  const { showMigrateResourceModal: showMoveResourceModal } = useMigrateResource({
    resourceType: GitResourceType.INPUT_SETS,
    modalTitle: getString('common.moveEntitytoGit', { resourceType: getString('inputSets.inputSetLabel') }),
    migrationType: MigrationType.INLINE_TO_REMOTE,
    extraQueryParams: {
      pipelineIdentifier: data.pipelineIdentifier,
      name: data?.name,
      inputSetIdentifier: data.identifier
    },
    onSuccess: () => (column as CustomColumn<InputSetLocal>).refetchInputSet?.()
  })

  const { showEditGitMetadataModal: showEditGitMetadataModal } = useEditGitMetadata({
    resourceType: GitResourceType.INPUT_SETS,
    identifier: data.identifier || '',
    metadata: {
      connectorRef: data?.connectorRef,
      repo: data?.gitDetails?.repoName,
      filePath: data?.gitDetails?.filePath
    },
    extraQueryParams: { pipelineIdentifier: data.pipelineIdentifier },
    modalTitle: getString('pipeline.editGitDetailsTitle', {
      entity: `${getString('inputSets.inputSetLabel')}[${data.identifier}]`
    }),
    onSuccess: () => (column as CustomColumn<InputSetLocal>).refetchInputSet?.()
  })

  const { confirmDelete } = useDeleteConfirmationDialog(
    data,
    data.inputSetType === 'OVERLAY_INPUT_SET' ? 'overlayInputSet' : 'inputSet',
    (column as any).onDeleteInputSet
  )

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          className={css.actionButton}
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu
          className={css.listItemMenu}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        >
          <Menu.Item
            icon="edit"
            text={getString('edit')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).goToInputSetDetail?.(data)
              setMenuOpen(false)
            }}
            disabled={!(column as any).canUpdate || isPipelineInvalid}
          />
          {showMoveToGitOption(pipelineStoreType, data.storeType) ? (
            <Menu.Item
              icon="git-merge"
              text={getString('common.moveToGit')}
              onClick={() => {
                showMoveResourceModal()
                setMenuOpen(false)
              }}
              disabled={!(column as any).canUpdate}
            />
          ) : null}
          <Menu.Item
            icon="trash"
            text={getString('delete')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).onDelete?.(data)
              confirmDelete()
              setMenuOpen(false)
            }}
            disabled={!(column as any).canUpdate}
          />
          {data?.storeType === StoreType.REMOTE ? (
            <Menu.Item
              icon="edit"
              text={getString('pipeline.editGitDetails')}
              onClick={() => {
                showEditGitMetadataModal()
              }}
              data-testid="editGitMetadata"
            />
          ) : null}
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnActions: Renderer<CellProps<InputSetLocal>> = ({ row, column }) => {
  const rowData = row.original
  const isPipelineInvalid = (column as any)?.isPipelineInvalid
  const isGitSyncEnabled = (column as any)?.isGitSyncEnabled
  const pipelineStoreType = (column as CustomColumn<InputSetLocal>)?.pipelineStoreType

  const { pipelineIdentifier } = useParams<{
    pipelineIdentifier: string
    module: Module
  }>()

  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const runPipeline = (): void => {
    openRunPipelineModal()
  }

  const getRunPipelineTooltip = (): string => {
    let tooltipText = ''
    if (isPipelineInvalid) {
      tooltipText = getString('pipeline.cannotRunInvalidPipeline')
    } else if (showMoveToGitOption(pipelineStoreType, rowData.storeType)) {
      tooltipText = getString('pipeline.inputSetWithInvalidStoreType')
    }
    return tooltipText
  }

  const { openRunPipelineModal } = useRunPipelineModal({
    inputSetSelected: [
      {
        type: rowData.inputSetType || /* istanbul ignore next */ 'INPUT_SET',
        value: rowData.identifier || /* istanbul ignore next */ '',
        label: rowData.name || /* istanbul ignore next */ '',
        gitDetails: isGitSyncEnabled
          ? rowData.gitDetails
          : { repoIdentifier: rowData.gitDetails?.repoName, branch: branch }
      }
    ],
    pipelineIdentifier: (rowData.pipelineIdentifier || '') as string,
    repoIdentifier: isGitSyncEnabled ? repoIdentifier : repoName,
    branch,
    connectorRef,
    storeType
  })

  return isInputSetInvalid(row.original) ? (
    <OutOfSyncErrorStrip
      inputSet={row.original}
      onlyReconcileButton={true}
      hideInputSetButton={true}
      isOverlayInputSet={get(row.original, 'inputSetType') === 'OVERLAY_INPUT_SET'}
      fromInputSetForm={false}
      fromInputSetListView={true}
      refetchInputSets={(column as any)?.refetchInputSet}
    />
  ) : (
    <RbacButton
      disabled={
        !(column as any)?.pipelineHasRuntimeInputs ||
        isPipelineInvalid ||
        showMoveToGitOption(pipelineStoreType, rowData.storeType)
      }
      tooltip={getRunPipelineTooltip()}
      icon="run-pipeline"
      variation={ButtonVariation.PRIMARY}
      intent="success"
      text={getString('runPipeline')}
      onClick={e => {
        e.stopPropagation()
        runPipeline()
      }}
      featuresProps={getFeaturePropsForRunPipelineButton({
        modules: (column as any).template?.data?.modules,
        getString
      })}
      permission={{
        resource: {
          resourceType: ResourceType.PIPELINE,
          resourceIdentifier: pipelineIdentifier
        },
        permission: PermissionIdentifier.EXECUTE_PIPELINE
      }}
    />
  )
}

export function InputSetListView({
  data,
  goToInputSetDetail,
  refetchInputSet,
  canUpdate = true,
  pipelineHasRuntimeInputs,
  isPipelineInvalid,
  pipelineStoreType,
  onDeleteInputSet,
  onDelete,
  template
}: InputSetListViewProps): React.ReactElement {
  const { getString } = useStrings()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const totalItems = get(data, 'totalItems', 0)
  const pageSize = get(data, 'pageSize', PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : INPUT_SETS_PAGE_SIZE)
  const totalPages = get(data, 'totalPages', -1)
  const pageIndex = get(data, 'pageIndex', 0)
  const columns: CustomColumn<InputSetLocal>[] = React.useMemo(
    () => [
      {
        Header: getString('pipeline.inputSets.inputSetNameLabel').toUpperCase(),
        accessor: 'name',
        width: '25%',
        Cell: RenderColumnInputSet
      },
      {
        Header: getString('pipeline.codeSource'),
        accessor: 'storeType',
        width: '15%',
        disableSortBy: true,
        Cell: CodeSourceCell
      },
      {
        Header: getString('description').toUpperCase(),
        accessor: 'description',
        width: '30%',
        Cell: RenderColumnDescription,
        disableSortBy: true
      },
      {
        Header: getString('common.gitSync.repoDetails').toUpperCase(),
        accessor: 'gitDetails',
        width: '25%',
        Cell: GitDetailsColumn,
        disableSortBy: true
      },
      {
        Header: getString('action').toUpperCase(),
        accessor: 'identifier',
        width: isGitSyncEnabled ? '15%' : '30%',
        Cell: RenderColumnActions,
        disableSortBy: true,
        goToInputSetDetail,
        pipelineHasRuntimeInputs,
        isPipelineInvalid,
        pipelineStoreType,
        template,
        isGitSyncEnabled,
        refetchInputSet
      },
      {
        Header: '',
        accessor: 'action',
        width: '5%',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        isPipelineInvalid,
        pipelineStoreType,
        goToInputSetDetail,
        refetchInputSet,
        canUpdate,
        onDeleteInputSet,
        onDelete
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goToInputSetDetail, refetchInputSet, pipelineStoreType, pipelineHasRuntimeInputs, data]
  )

  if (!isGitSyncEnabled) {
    columns.splice(3, 1)
  } else {
    columns.splice(1, 1)
  }

  const paginationProps = useDefaultPaginationProps({
    itemCount: totalItems,
    pageSize: pageSize,
    pageCount: totalPages,
    pageIndex: pageIndex
  })

  return (
    <TableV2<InputSetLocal>
      className={css.table}
      columns={columns}
      data={get(data, 'content', [])}
      onRowClick={item => !isPipelineInvalid && pipelineHasRuntimeInputs && goToInputSetDetail?.(item)}
      pagination={paginationProps}
    />
  )
}
