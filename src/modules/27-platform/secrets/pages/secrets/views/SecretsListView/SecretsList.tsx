/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useEffect } from 'react'
import { useParams, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { Menu, Position, Classes, Intent } from '@blueprintjs/core'
import type { Column, Renderer, CellProps } from 'react-table'
import {
  Text,
  Layout,
  Icon,
  Button,
  Popover,
  TagsPopover,
  useConfirmationDialog,
  useToaster,
  TableV2,
  ButtonVariation
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { SecretResponseWrapper, useDeleteSecretV2, useGetSettingValue } from 'services/cd-ng'
import type { PageSecretResponseWrapper, SecretTextSpecDTO, SecretDTOV2 } from 'services/cd-ng'
import { getStringForType } from '@secrets/utils/SSHAuthUtils'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import { useVerifyModal as useVerifyModalSSH } from '@secrets/modals/CreateSSHCredModal/useVerifyModal'
import { useVerifyModal as useVerifyModalWinRM } from '@secrets/modals/CreateWinRmCredModal/useVerifyModal'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope, scopeStringKey } from '@common/interfaces/SecretsInterface'
import { getScopeFromValue, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useCreateWinRmCredModal } from '@secrets/modals/CreateWinRmCredModal/useCreateWinRmCredModal'
import { useEntityDeleteErrorHandlerDialog } from '@common/hooks/EntityDeleteErrorHandlerDialog/useEntityDeleteErrorHandlerDialog'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SettingType } from '@common/constants/Utils'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { SECRETS_DEFAULT_PAGE_INDEX, SECRETS_DEFAULT_PAGE_SIZE } from '../../Constants'
import css from './SecretsList.module.scss'

interface SecretsListProps {
  secrets?: PageSecretResponseWrapper
  refetch?: () => void
}

type CustomColumn = Column<SecretResponseWrapper> & {
  refreshSecrets?: (() => void) | undefined
  forceDeleteSupported?: boolean
}

const RenderColumnSecret: Renderer<CellProps<SecretResponseWrapper>> = ({ row }) => {
  const data = row.original.secret
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      {data.type === 'SecretText' || data.type === 'SecretFile' ? (
        <Icon name="key" size={28} margin={{ top: 'xsmall', right: 'small' }} />
      ) : null}
      {data.type === 'SSHKey' ? <Icon name="secret-ssh" size={28} margin={{ top: 'xsmall', right: 'small' }} /> : null}
      {data.type === 'WinRmCredentials' ? (
        <Icon name="command-winrm" size={28} margin={{ top: 'xsmall', right: 'small' }} />
      ) : null}
      <Layout.Vertical>
        <Layout.Horizontal spacing="small" width={230}>
          <Text color={Color.BLACK} lineClamp={1} className={css.secretName} font={{ variation: FontVariation.BODY2 }}>
            {data.name}
          </Text>
          {data.tags && Object.keys(data.tags).length ? <TagsPopover tags={data.tags} /> : null}
        </Layout.Horizontal>
        <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} width={230} lineClamp={1}>
          {`${getString('common.ID')}: ${data.identifier}`}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const RenderColumnDetails: Renderer<CellProps<SecretResponseWrapper>> = ({ row }) => {
  const data = row.original.secret
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const {
    selectedProject,
    selectedOrg,
    currentUserInfo: { accounts = [] }
  } = useAppStore()
  const selectedAccount = accounts.find(account => account.uuid === accountId)
  const scopeFromSMIdentifier = getScopeFromValue((data.spec as SecretTextSpecDTO).secretManagerIdentifier)
  const getScopeName = (): string => {
    switch (scopeFromSMIdentifier) {
      case Scope.ACCOUNT: {
        return `${getString('account')}: ${selectedAccount?.accountName}`
      }
      case Scope.ORG: {
        return `${getString('orgLabel')}: ${selectedOrg?.name}`
      }

      case Scope.PROJECT:
      default: {
        // Special case for stale (or pre-existing data)
        // if scopeFromSMIdentifier is Scope.PROJECT, then use the 'currentScope' from which API is hit
        const currentScope = getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
        const name =
          currentScope === Scope.ACCOUNT
            ? selectedAccount?.accountName
            : currentScope === Scope.ORG
            ? selectedOrg?.name
            : selectedProject?.name
        return `${getString(scopeStringKey[currentScope])}: ${name}`
      }
    }
  }
  return (
    <>
      {data.type === 'SecretText' || data.type === 'SecretFile' ? (
        <>
          <Text color={Color.BLACK} lineClamp={1} width={230}>
            {`${getString('platform.connectors.title.secretManager')}: ${
              (data.spec as SecretTextSpecDTO).secretManagerIdentifier
            }`}
          </Text>
          <Text color={Color.GREY_600} lineClamp={1} font={{ size: 'small' }} width={230}>
            {getScopeName()}
          </Text>
        </>
      ) : null}

      {/* TODO {Abhinav} display SM name */}
      <Text color={Color.GREY_600} font={{ size: 'small' }}>
        {getStringForType(data.type)}
      </Text>
    </>
  )
}

const RenderColumnActivity: Renderer<CellProps<SecretResponseWrapper>> = ({ row }) => {
  const data = row.original
  return data.updatedAt ? (
    <Layout.Horizontal spacing="small" color={Color.GREY_600}>
      <Icon name="activity" />
      <ReactTimeago date={data.updatedAt} />
    </Layout.Horizontal>
  ) : null
}

const RenderColumnStatus: Renderer<CellProps<SecretResponseWrapper>> = ({ row }) => {
  const data = row.original.secret
  const { openVerifyModal: openVerifyModalSSH } = useVerifyModalSSH()
  const { openVerifyModal: openVerifyModalWinRM } = useVerifyModalWinRM()
  if (data.type === 'SecretText' || data.type === 'SecretFile') {
    return row.original.draft ? (
      <Text icon="warning-sign" intent="warning">
        {<String stringID="platform.secrets.incompleteSecret" />}
      </Text>
    ) : null
  }
  if (data.type === 'SSHKey' || data.type === 'WinRmCredentials')
    return (
      <Button
        font="small"
        text={<String stringID="test" />}
        onClick={e => {
          e.stopPropagation()
          if (data.type === 'SSHKey') {
            openVerifyModalSSH(data)
          }
          if (data.type === 'WinRmCredentials') {
            openVerifyModalWinRM(data)
          }
          return
        }}
        withoutBoxShadow
      />
    )

  return null
}
interface SecretMenuItemProps {
  secret: SecretDTOV2
  onSuccessfulEdit: any
  onSuccessfulDelete: any
  setIsReference?: (isReferenceTab: boolean) => void
  forceDeleteSupported?: boolean
}

export const SecretMenuItem: React.FC<SecretMenuItemProps> = ({
  secret,
  onSuccessfulEdit,
  onSuccessfulDelete,
  setIsReference,
  forceDeleteSupported
}) => {
  const data = secret
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess, showError } = useToaster()
  const history = useHistory()
  const [menuOpen, setMenuOpen] = useState(false)

  const { mutate: deleteSecret } = useDeleteSecretV2({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  const { openCreateSSHCredModal } = useCreateSSHCredModal({ onSuccess: onSuccessfulEdit })
  const { openCreateWinRmCredModal } = useCreateWinRmCredModal({
    onSuccess: onSuccessfulEdit
  })
  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: onSuccessfulEdit
  })

  const permissionRequest = {
    resource: {
      resourceType: ResourceType.SECRET,
      resourceIdentifier: data.identifier
    }
  }

  const deleteHandler = async (forceDelete?: boolean): Promise<void> => {
    try {
      await deleteSecret(data.identifier, {
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          forceDelete: Boolean(forceDelete)
        }
      })
      showSuccess(`Secret ${data.name} deleted`)
      onSuccessfulDelete()
    } catch (err) {
      if (err?.data?.code === 'ENTITY_REFERENCE_EXCEPTION') {
        openReferenceErrorDialog()
      } else {
        showError(getRBACErrorMessage(err))
      }
    }
  }

  const isListPage = useRouteMatch(routes.toSecrets({ accountId, projectIdentifier, orgIdentifier, module }))

  const redirectToReferencedBy = (): void => {
    if (isListPage?.isExact) {
      history.push({
        pathname: routes.toSecretDetailsReferences({
          accountId,
          projectIdentifier,
          orgIdentifier,
          secretId: data.identifier,
          module
        })
      })
    } else {
      //We do not need to change routes for Overview and referencedBy page
      closeDialog()
      setIsReference?.(true)
    }
  }

  const { openDialog: openReferenceErrorDialog, closeDialog } = useEntityDeleteErrorHandlerDialog({
    entity: {
      type: ResourceType.SECRET,
      name: defaultTo(data?.name, '')
    },
    redirectToReferencedBy: redirectToReferencedBy,
    forceDeleteCallback: forceDeleteSupported ? () => deleteHandler(true) : undefined
  })

  const { openDialog } = useConfirmationDialog({
    contentText: <String stringID="platform.secrets.confirmDelete" vars={{ name: data.name }} />,
    titleText: <String stringID="platform.secrets.confirmDeleteTitle" />,
    confirmButtonText: <String stringID="delete" />,
    cancelButtonText: <String stringID="cancel" />,
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async didConfirm => {
      if (didConfirm && data.identifier) {
        deleteHandler(false)
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)

    if (data.type === 'SSHKey') {
      openCreateSSHCredModal(data)
    } else if (data.type === 'WinRmCredentials') {
      openCreateWinRmCredModal(data)
    } else {
      openCreateSecretModal(data.type, {
        identifier: data.identifier,
        orgIdentifier: data.orgIdentifier,
        projectIdentifier: data.projectIdentifier
      } as SecretIdentifiers)
    }
  }

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.RIGHT_TOP}
      >
        <Button
          variation={ButtonVariation.ICON}
          icon="Options"
          aria-label="secret menu actions"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          <RbacMenuItem
            icon="edit"
            text="Edit"
            onClick={handleEdit}
            permission={{ ...permissionRequest, permission: PermissionIdentifier.UPDATE_SECRET }}
          />
          <RbacMenuItem
            icon="trash"
            text="Delete"
            onClick={handleDelete}
            permission={{ ...permissionRequest, permission: PermissionIdentifier.DELETE_SECRET }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}
export const RenderColumnAction: Renderer<CellProps<SecretResponseWrapper>> = ({ row, column }) => {
  return (
    <SecretMenuItem
      secret={row.original.secret}
      onSuccessfulEdit={(column as any).refreshSecrets}
      onSuccessfulDelete={(column as any).refreshSecrets}
      forceDeleteSupported={(column as CustomColumn).forceDeleteSupported}
    />
  )
}
const SecretsList: React.FC<SecretsListProps> = ({ secrets, refetch }) => {
  const history = useHistory()
  const { showError } = useToaster()
  const { accountId } = useParams<ProjectPathProps>()
  const data: SecretResponseWrapper[] = useMemo(() => secrets?.content || [], [secrets?.content])
  const { pathname } = useLocation()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const { data: forceDeleteSettings, error: forceDeleteSettingsError } = useGetSettingValue({
    identifier: SettingType.ENABLE_FORCE_DELETE,
    queryParams: { accountIdentifier: accountId },
    lazy: false
  })

  useEffect(() => {
    if (forceDeleteSettingsError) {
      showError(getRBACErrorMessage(forceDeleteSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceDeleteSettingsError])

  const columns: CustomColumn[] = useMemo(
    () => [
      {
        Header: getString('secretType'),
        accessor: row => row.secret.name,
        id: 'name',
        width: '30%',
        Cell: RenderColumnSecret
      },
      {
        Header: getString('details'),
        accessor: row => row.secret.description,
        id: 'details',
        width: '25%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('lastActivity'),
        accessor: 'updatedAt',
        id: 'activity',
        width: '20%',
        Cell: RenderColumnActivity
      },
      {
        Header: '',
        accessor: row => row.secret.type,
        id: 'status',
        width: '20%',
        Cell: RenderColumnStatus,
        refreshSecrets: refetch,
        disableSortBy: true
      },
      {
        Header: '',
        accessor: row => row.secret.identifier,
        id: 'action',
        width: '5%',
        Cell: RenderColumnAction,
        refreshSecrets: refetch,
        forceDeleteSupported: forceDeleteSettings?.data?.value === 'true',
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetch, forceDeleteSettings]
  )

  const paginationProps = useDefaultPaginationProps({
    itemCount: secrets?.totalItems || 0,
    pageSize: secrets?.pageSize || (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : SECRETS_DEFAULT_PAGE_SIZE),
    pageCount: secrets?.totalPages || -1,
    pageIndex: secrets?.pageIndex || SECRETS_DEFAULT_PAGE_INDEX
  })

  return (
    <TableV2<SecretResponseWrapper>
      className={css.table}
      columns={columns}
      data={data}
      name="SecretsListView"
      onRowClick={secret => {
        history.push(`${pathname}/${secret.secret?.identifier}`)
      }}
      pagination={paginationProps}
    />
  )
}

export default SecretsList
