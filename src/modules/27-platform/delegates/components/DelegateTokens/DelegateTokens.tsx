/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import type { CellProps, Renderer, Column } from 'react-table'
import { Menu, MenuItem, Classes, Position } from '@blueprintjs/core'
import { get } from 'lodash-es'
import {
  Container,
  Layout,
  ExpandingSearchInput,
  PageError,
  shouldShowError,
  Checkbox,
  TableV2,
  Button,
  Popover,
  ButtonVariation,
  Icon,
  NoDataCard,
  Utils,
  useToaster
} from '@harness/uicore'
import { PageSpinner } from '@common/components'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useGetDelegateTokens, GetDelegateTokensQueryParams, DelegateTokenDetails } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import RbacButton from '@rbac/components/Button/Button'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useRevokeTokenModal } from './modals/useRevokeTokenModal'
import { useCreateTokenModal } from './modals/useCreateTokenModal'
import { useMoreTokenInfoModalModal } from './modals/useMoreTokenInfoModal'

import css from './DelegateTokens.module.scss'

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  reload?: () => void
}

const delegatesPerPage = 10

export const DelegateListing: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const [showRevoked, setShowRevoked] = useState<boolean>(false)
  const [searchString, setSearchString] = useState<string>('')
  const { showError, showSuccess } = useToaster()
  const [page, setPage] = useState(0)
  const { getRBACErrorMessage } = useRBACError()
  const {
    data: tokensResponse,
    refetch: getDelegateTokens,
    error: tokenFetchError,
    loading: showLoader
  } = useGetDelegateTokens({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      status: 'ACTIVE'
    } as GetDelegateTokensQueryParams
  })

  const filteredTokens = useMemo(() => {
    const tokens = get(tokensResponse, 'resource', [])
    return tokens.filter(token => token?.name?.toLowerCase().includes(searchString.toLowerCase()))
  }, [tokensResponse, searchString])

  const pageTokens = useMemo(() => {
    return filteredTokens.slice(page * delegatesPerPage, (page + 1) * delegatesPerPage)
  }, [filteredTokens, page])

  const getTokens = () => {
    const queryParams = {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    } as GetDelegateTokensQueryParams
    if (!showRevoked) {
      queryParams.status = 'ACTIVE'
    }
    getDelegateTokens({
      queryParams
    })
  }

  const { openRevokeTokenModal } = useRevokeTokenModal({
    onSuccess: () => {
      setPage(0)
      getTokens()
    }
  })
  const { openMoreTokenInfoModal } = useMoreTokenInfoModalModal({})

  const { openCreateTokenModal } = useCreateTokenModal({ onSuccess: getTokens })
  const {
    data: token,
    refetch: getTokenForCopy,
    error: singleTokenError
  } = useGetDelegateTokens({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier: projectIdentifier
    },
    lazy: true
  })
  useEffect(() => {
    if (singleTokenError) {
      showError(getRBACErrorMessage(singleTokenError as RBACError))
    }
  }, [singleTokenError])

  useEffect(() => {
    if (token?.resource?.length && token?.resource[0].value) {
      showSuccess(getString('platform.delegates.tokens.tokenCopied'))
      Utils.copy(token?.resource[0].value)
    }
  }, [token])
  const RenderColumnName: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={`${css.tokenNameColumn} ${css.tokenCellText}`}>
      <Icon name="key" size={28} margin={{ right: 'small' }} />
      {row.original.name}
    </span>
  )
  const RenderColumnCreatedAt: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={css.tokenCellText}>
      {row.original.createdAt && <ReactTimeago date={row.original.createdAt} />}
    </span>
  )
  const RenderColumnCreatedBy: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={css.tokenCellText}>
      {row.original?.createdByNgUser?.jwtclaims?.username?.toLowerCase?.() || getString('na')}
    </span>
  )
  const RenderColumnStatus: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={css.tokenCellText}>
      {row.original.status === 'ACTIVE' ? getString('active') : getString('platform.delegates.tokens.revoked')}
    </span>
  )
  const RenderColumnActions: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => (
    <span className={css.tokenCellText}>
      {row.original.status !== 'REVOKED' && (
        <RbacButton
          variation={ButtonVariation.SECONDARY}
          onClick={e => {
            e.stopPropagation()
            openRevokeTokenModal(row.original.name || '')
          }}
          text={getString('platform.delegates.tokens.revoke')}
          permission={{
            resourceScope: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier
            },
            permission: PermissionIdentifier.UPDATE_DELEGATE,
            resource: {
              resourceType: ResourceType.DELEGATE
            }
          }}
        />
      )}
    </span>
  )
  const RenderColumnMenu: Renderer<CellProps<DelegateTokenDetails>> = ({ row }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    return (
      <Layout.Horizontal className={css.menuColumn}>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          className={Classes.DARK}
          position={Position.RIGHT_TOP}
        >
          <Button
            minimal
            icon="Options"
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
          />
          <Menu style={{ minWidth: 'unset' }}>
            <MenuItem
              icon="edit"
              text={getString('platform.delegates.tokens.moreInfo')}
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                event.stopPropagation()
                openMoreTokenInfoModal(row.original.name || '')
              }}
            />
            <MenuItem
              icon="clipboard"
              text={getString('platform.delegates.tokens.copytoken')}
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                event.stopPropagation()
                getTokenForCopy({
                  queryParams: {
                    name: row.original.name,
                    accountIdentifier: accountId,
                    orgIdentifier,
                    projectIdentifier
                  }
                })
              }}
            />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const pagination = useMemo(() => {
    const itemCount = filteredTokens.length
    return {
      itemCount,
      pageSize: delegatesPerPage,
      pageCount: Math.ceil(itemCount / delegatesPerPage),
      pageIndex: page,
      gotoPage: setPage
    }
  }, [page, setPage, filteredTokens])

  const columns: CustomColumn<DelegateTokenDetails>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        accessor: 'name',
        id: 'name',
        width: '33%',
        Cell: RenderColumnName
      },
      {
        Header: getString('createdAt').toUpperCase(),
        accessor: 'createdAt',
        id: 'createdAt',
        width: '20%',
        Cell: RenderColumnCreatedAt
      },
      {
        Header: getString('createdBy').toUpperCase(),
        accessor: 'createdBy',
        id: 'createdBy',
        width: '20%',
        Cell: RenderColumnCreatedBy
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: 'status',
        id: 'activity',
        width: '15%',
        Cell: RenderColumnStatus
      },
      {
        Header: '',
        accessor: row => row.value,
        width: '10%',
        id: 'actions',
        Cell: RenderColumnActions,
        reload: getTokens,
        disableSortBy: true
      },
      {
        Header: '',
        width: '3%',
        id: 'menu',
        Cell: RenderColumnMenu,
        reload: getTokens,
        disableSortBy: true
      }
    ],
    []
  )

  useEffect(() => {
    if (page === 0) {
      getTokens()
    } else {
      setPage(0)
    }
  }, [showRevoked])

  const { trackEvent } = useTelemetry()

  return (
    <Container height="100%">
      <Layout.Horizontal className={css.header}>
        <RbacButton
          intent="primary"
          text={getString('rbac.token.createLabel')}
          icon="plus"
          onClick={() => {
            openCreateTokenModal()
            trackEvent(DelegateActions.LoadCreateTokenModal, {
              category: Category.DELEGATE
            })
          }}
          permission={{
            resourceScope: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier
            },
            permission: PermissionIdentifier.UPDATE_DELEGATE,
            resource: {
              resourceType: ResourceType.DELEGATE
            }
          }}
          id="newDelegateBtn"
          data-testid="newDelegateButton"
        />
        <Layout.Horizontal>
          <Checkbox
            onChange={() => {
              setShowRevoked(!showRevoked)
            }}
            checked={showRevoked}
            large
            label={getString('platform.delegates.tokens.showRevoked')}
            className={css.revokeCheckbox}
          />
          <ExpandingSearchInput
            alwaysExpanded
            width={250}
            placeholder={getString('search')}
            throttle={200}
            onChange={text => {
              setSearchString(text)
              setPage(0)
            }}
            className={css.search}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>

      <Layout.Vertical className={css.listBody}>
        {showLoader ? (
          <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
            <PageSpinner />
          </div>
        ) : tokenFetchError && shouldShowError(tokenFetchError) ? (
          <PageError
            message={
              getRBACErrorMessage(tokenFetchError as RBACError) ||
              (tokenFetchError?.data as Error)?.message ||
              tokenFetchError?.message
            }
            onClick={() => {
              getTokens()
            }}
          />
        ) : (
          <Container className={css.delegateListContainer}>
            {filteredTokens.length ? (
              <TableV2<DelegateTokenDetails>
                sortable={true}
                className={css.table}
                columns={columns}
                data={pageTokens}
                name="TokensListView"
                onRowClick={({ name }) => {
                  openMoreTokenInfoModal(name || '')
                }}
                pagination={pagination}
              />
            ) : (
              <NoDataCard icon="resources-icon" message={getString('platform.delegates.tokens.noTokens')}></NoDataCard>
            )}
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}
export default DelegateListing
