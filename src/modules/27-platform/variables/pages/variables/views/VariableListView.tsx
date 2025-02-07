/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, TableV2, Text, useConfirmationDialog, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Intent, PopoverPosition } from '@blueprintjs/core'
import React, { useMemo } from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { Color, FontVariation } from '@harness/design-system'
import { String, useStrings, UseStringsReturn } from 'framework/strings'
import { PageVariableResponseDTO, useDeleteVariable, VariableResponseDTO } from 'services/cd-ng'
import DescriptionPopover from '@common/components/DescriptionPopover.tsx/DescriptionPopover'
import {
  getValueFromVariableAndValidationType,
  VARIABLES_DEFAULT_PAGE_INDEX,
  VARIABLES_DEFAULT_PAGE_SIZE
} from '@variables/utils/VariablesUtils'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import type { UseCreateUpdateVariableModalReturn } from '@variables/modals/CreateEditVariableModal/useCreateEditVariableModal'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import css from './VariableListView.module.scss'

interface SecretsListProps {
  variables?: PageVariableResponseDTO
  refetch?: () => void
  openCreateUpdateVariableModal: UseCreateUpdateVariableModalReturn['openCreateUpdateVariableModal']
}

export const RenderColumnVariable: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
  const data = row.original.variable
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Layout.Vertical>
        <Layout.Horizontal width={230}>
          <Text color={Color.BLACK} lineClamp={1}>
            {data.name}
          </Text>
          {data.description && <DescriptionPopover text={data.description} />}
        </Layout.Horizontal>
        <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} width={230} lineClamp={1}>
          {`${getString('common.ID')}: ${data.identifier}`}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export const RenderColumnType: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
  const data = row.original.variable
  return (
    <Text color={Color.BLACK} font={{ variation: FontVariation.BODY }}>
      {data.type}
    </Text>
  )
}
export const RenderColumnValidation: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
  const data = row.original.variable
  return (
    <Text color={Color.BLACK} font={{ variation: FontVariation.BODY }}>
      {data.spec.valueType}
    </Text>
  )
}

export const RenderColumnValue: Renderer<CellProps<VariableResponseDTO>> = ({ row }) => {
  const data = row.original.variable

  return (
    <Text color={Color.GREY_600} font={{ variation: FontVariation.FORM_INPUT_TEXT }} lineClamp={1}>
      {getValueFromVariableAndValidationType(data)}
    </Text>
  )
}

export function VariableListColumnHeader(getString: UseStringsReturn['getString']): Column<VariableResponseDTO>[] {
  return [
    {
      Header: getString('variableLabel'),
      accessor: row => row.variable.name,
      id: 'name',
      width: '30%',
      Cell: RenderColumnVariable
    },
    {
      Header: getString('typeLabel'),
      accessor: row => row.variable.type,
      id: 'type',
      width: '20%',
      Cell: RenderColumnType
    },
    {
      Header: getString('platform.variables.inputValidation'),
      accessor: row => row.variable.spec.valueType,
      id: 'validation',
      width: '20%',
      Cell: RenderColumnValidation
    },
    {
      Header: getString('valueLabel'),
      accessor: row => row.variable.spec.value,
      id: 'value',
      width: '25%',
      Cell: RenderColumnValue
    }
  ]
}

const RenderColumnAction: Renderer<CellProps<VariableResponseDTO>> = ({ row, column }) => {
  const data = row.original.variable
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess, showError } = useToaster()
  const { mutate: deleteVariable } = useDeleteVariable({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })
  const { openDialog } = useConfirmationDialog({
    contentText: <String stringID="platform.variables.confirmDelete" vars={{ name: data.name }} />,
    titleText: <String stringID="platform.variables.confirmDeleteTitle" />,
    confirmButtonText: <String stringID="delete" />,
    cancelButtonText: <String stringID="cancel" />,
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async didConfirm => {
      if (didConfirm && data.identifier) {
        try {
          await deleteVariable(data.identifier)
          showSuccess(getString('platform.variables.successDelete', { name: data.name }))
          ;(column as any).refetch?.()
        } catch (err) {
          showError(getRBACErrorMessage(err))
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    openDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    ;(column as any).openCreateUpdateVariableModal({ variable: data })
  }

  return (
    <Layout.Horizontal flex={{ alignItems: 'flex-end' }}>
      <RbacOptionsMenuButton
        tooltipProps={{
          position: PopoverPosition.LEFT_TOP,
          isDark: true,
          interactionKind: 'click',
          hasBackdrop: true
        }}
        items={[
          {
            icon: 'edit',
            text: getString('edit'),
            onClick: handleEdit,
            permission: {
              resource: { resourceType: ResourceType.VARIABLE },
              permission: PermissionIdentifier.EDIT_VARIABLE
            }
          },
          {
            icon: 'trash',
            text: getString('delete'),
            onClick: handleDelete,
            permission: {
              resource: { resourceType: ResourceType.VARIABLE },
              permission: PermissionIdentifier.DELETE_VARIABLE
            }
          }
        ]}
      />
    </Layout.Horizontal>
  )
}

const VariableListView: React.FC<SecretsListProps> = props => {
  const { variables, refetch } = props
  const variablesList: VariableResponseDTO[] = useMemo(() => variables?.content || [], [variables?.content])
  const { getString } = useStrings()
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  const columns: Column<VariableResponseDTO>[] = useMemo(
    () => [
      ...VariableListColumnHeader(getString),
      {
        Header: '',
        accessor: row => row.variable.identifier,
        id: 'action',
        width: '5%',
        Cell: RenderColumnAction,
        refetch: refetch,
        openCreateUpdateVariableModal: props.openCreateUpdateVariableModal,
        disableSortBy: true
      }
    ],
    [refetch, props.openCreateUpdateVariableModal, getString]
  )

  const paginationProps = useDefaultPaginationProps({
    itemCount: variables?.totalItems || 0,
    pageSize: variables?.pageSize || (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : VARIABLES_DEFAULT_PAGE_SIZE),
    pageCount: variables?.totalPages || -1,
    pageIndex: variables?.pageIndex || VARIABLES_DEFAULT_PAGE_INDEX
  })

  return (
    <TableV2<VariableResponseDTO>
      className={css.table}
      columns={columns}
      data={variablesList}
      name="VariableListView"
      pagination={paginationProps}
    />
  )
}

export default VariableListView
