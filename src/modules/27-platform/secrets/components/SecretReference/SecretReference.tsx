/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Icon, SelectOption, Text, Button, Container, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Select } from '@blueprintjs/select'
import { MenuItem } from '@blueprintjs/core'
import cx from 'classnames'
import {
  ListSecretsV2QueryParams,
  Failure,
  listSecretsV2Promise,
  SecretDTOV2,
  ResponsePageSecretResponseWrapper,
  ConnectorInfoDTO
} from 'services/cd-ng'
import { EntityReference } from '@common/exports'
import {
  EntityReferenceResponse,
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import { useStrings } from 'framework/strings'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { SecretMultiSelectProps } from '@secrets/utils/SecretField'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import SecretEmptyState from '../../pages/secrets/secrets-empty-state.png'
import type { SecretFormData, SecretIdentifiers } from '../CreateUpdateSecret/CreateUpdateSecret'
import css from './SecretReference.module.scss'

const CustomSelect = Select.ofType<SelectOption>()
export interface SecretRef extends SecretDTOV2 {
  scope: Scope
}

export const enum SecretTypeEnum {
  SECRET_TEXT = 'SecretText',
  SSH_KEY = 'SSHKey',
  WINRM = 'WinRmCredentials',
  SECRET_FILE = 'SecretFile'
}

interface SceretTypeDropDownProps {
  secretType?: SelectOption
  setSecretType?: (val: SelectOption) => void
}
export interface SecretReferenceProps extends SceretTypeDropDownProps, SecretMultiSelectProps {
  onSelect: (secret: SecretRef) => void
  accountIdentifier: string
  projectIdentifier?: string
  orgIdentifier?: string
  defaultScope?: Scope
  type?: ListSecretsV2QueryParams['type']
  mock?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
  onCancel?: () => void
  handleInlineSSHSecretCreation?: (record?: SecretRef) => void
  handleInlineWinRmSecretCreation?: (record?: SecretRef) => void
  selectedSecret?: string
  identifiersFilter?: ScopeAndIdentifier[]
}

const getIdentifiersOfScope = (scopeAndIdentifiers?: ScopeAndIdentifier[], scope?: Scope): string[] | undefined => {
  if (!Array.isArray(scopeAndIdentifiers) || !scopeAndIdentifiers.length) return
  if (!scope) return scopeAndIdentifiers.map(({ identifier }) => identifier)

  return scopeAndIdentifiers.filter(sI => sI.scope === scope).map(({ identifier }) => identifier)
}

const fetchRecords = (
  pageIndex: number,
  setPagedSecretData: (data: ResponsePageSecretResponseWrapper) => void,
  search: string | undefined,
  done: (records: EntityReferenceResponse<SecretRef>[]) => void,
  type: ListSecretsV2QueryParams['type'],
  accountIdentifier: string,
  projectIdentifier?: string,
  scope?: Scope,
  orgIdentifier?: string,
  mock?: ResponsePageSecretResponseWrapper,
  connectorTypeContext?: ConnectorInfoDTO['type'],
  allTabSelected?: boolean,
  identifiersFilter?: ScopeAndIdentifier[]
): void => {
  const secretManagerTypes: ConnectorInfoDTO['type'][] = [
    'AwsKms',
    'AzureKeyVault',
    'Vault',
    'AwsSecretManager',
    'GcpKms'
  ]
  const identifiers = getIdentifiersOfScope(identifiersFilter, allTabSelected ? undefined : scope)

  let sourceCategory: ListSecretsV2QueryParams['source_category'] | undefined
  if (connectorTypeContext && secretManagerTypes.includes(connectorTypeContext)) {
    sourceCategory = 'SECRET_MANAGER'
  }

  listSecretsV2Promise({
    queryParams: {
      accountIdentifier,
      type,
      searchTerm: search?.trim(),
      projectIdentifier: scope === Scope.PROJECT || allTabSelected ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG || allTabSelected ? orgIdentifier : undefined,
      source_category: sourceCategory,
      pageIndex: pageIndex,
      pageSize: 10,
      includeAllSecretsAccessibleAtScope: !scope && allTabSelected,
      identifiers
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    mock
  })
    .then(responseData => {
      if (responseData?.data?.content) {
        const secrets = responseData.data.content
        setPagedSecretData(responseData)
        const response: EntityReferenceResponse<SecretRef>[] = []
        secrets.forEach(secret => {
          response.push({
            name: secret.secret.name || '',
            identifier: secret.secret.identifier || '',
            record: { ...secret.secret, scope: getScopeFromDTO(secret.secret) }
          })
        })
        done(response)
      } else {
        done([])
      }
    })
    .catch((err: Failure) => {
      throw err.message
    })
}

const SelectTypeDropdown: React.FC<SceretTypeDropDownProps> = props => {
  const { getString } = useStrings()
  const secretTypeOptions: SelectOption[] = [
    {
      label: getString('platform.secrets.secret.labelText'),
      value: 'SecretText'
    },
    {
      label: getString('platform.secrets.secret.labelFile'),
      value: 'SecretFile'
    }
  ]

  return (
    <Container flex={{ alignItems: 'baseline' }}>
      <Text margin={{ left: 'medium', right: 'xsmall' }}>{getString('platform.secrets.secret.labelSecretType')}</Text>
      <CustomSelect
        items={secretTypeOptions}
        filterable={false}
        itemRenderer={(item, { handleClick }) => (
          <MenuItem className={css.popoverWidth} key={item.value as string} text={item.label} onClick={handleClick} />
        )}
        onItemSelect={item => {
          props.setSecretType?.(item)
        }}
        popoverProps={{ minimal: true, popoverClassName: css.popoverWidth }}
      >
        <Button
          className={css.selectButton}
          width={60}
          inline
          minimal
          rightIcon="chevron-down"
          text={props.secretType?.label}
        />
      </CustomSelect>
    </Container>
  )
}

const SecretReference: React.FC<SecretReferenceProps> = props => {
  const {
    defaultScope,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    type,
    mock,
    connectorTypeContext,
    selectedSecret: selectedSecretProp,
    selectedSecrets = [],
    isMultiSelect = false,
    onMultiSelect,
    identifiersFilter
  } = props
  const { getString } = useStrings()
  const [pagedSecretData, setPagedSecretData] = useState<ResponsePageSecretResponseWrapper>({})
  const [pageNo, setPageNo] = useState(0)

  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: data => {
      if (isMultiSelect) return

      props.onSelect({
        ...data,
        spec: {},
        scope: getScopeFromDTO<SecretFormData>(data)
      })
    }
  })

  const selectedSecret = useMemo(() => {
    if (!(typeof selectedSecretProp === 'string' && selectedSecretProp)) return

    return { scope: getScopeFromValue(selectedSecretProp), identifier: getIdentifierFromValue(selectedSecretProp) }
  }, [selectedSecretProp])

  const handleEdit = (item: EntityReferenceResponse<SecretRef>) => {
    switch (item.record.type) {
      case 'SSHKey':
        return props.handleInlineSSHSecretCreation?.(item.record)
      case 'WinRmCredentials':
        return props.handleInlineWinRmSecretCreation?.(item.record)
      case 'SecretFile':
      case 'SecretText':
        return openCreateSecretModal(item.record.type, {
          identifier: item.identifier,
          projectIdentifier: item.record.projectIdentifier,
          orgIdentifier: item.record.orgIdentifier
        } as SecretIdentifiers)
    }
  }

  return (
    <Container className={css.secretRefContainer}>
      <EntityReference<SecretRef>
        onSelect={(secret, scope) => {
          secret.scope = scope
          props.onSelect(secret)
        }}
        onMultiSelect={onMultiSelect}
        selectedRecord={selectedSecret}
        selectedRecords={selectedSecrets}
        isMultiSelect={isMultiSelect}
        defaultScope={defaultScope}
        noDataCard={{
          image: SecretEmptyState,
          message: getString('platform.secrets.secret.noSecretsFound'),
          containerClassName: css.noDataCardContainerSecret,
          className: css.noDataCardContainerSecret
        }}
        fetchRecords={(done, search, page, scope, _signal, allTabSelected) => {
          const selectedType = type || (props.secretType?.value as SecretDTOV2['type'])
          fetchRecords(
            page || 0,
            setPagedSecretData,
            search,
            done,
            selectedType,
            accountIdentifier,
            projectIdentifier,
            scope,
            orgIdentifier,
            mock,
            connectorTypeContext,
            allTabSelected,
            identifiersFilter
          )
        }}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onCancel={props.onCancel}
        noRecordsText={getString('platform.secrets.secret.noSecretsFound')}
        searchInlineComponent={
          !type ? <SelectTypeDropdown secretType={props.secretType} setSecretType={props.setSecretType} /> : undefined
        }
        showAllTab
        input={!type ? type || (props.secretType?.value as SecretDTOV2['type']) : undefined}
        renderTabSubHeading
        pagination={{
          itemCount: pagedSecretData?.data?.totalItems || 0,
          pageSize: pagedSecretData?.data?.pageSize || 10,
          pageCount: pagedSecretData?.data?.totalPages || -1,
          pageIndex: pageNo || 0,
          gotoPage: pageIndex => setPageNo(pageIndex)
        }}
        disableCollapse={true}
        recordRender={({ item, selectedScope, selected }) => {
          return (
            <>
              <Layout.Horizontal className={css.item} flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Layout.Horizontal spacing="medium" className={css.leftInfo}>
                  <Icon
                    className={cx(css.iconCheck, { [css.iconChecked]: selected })}
                    size={14}
                    name="pipeline-approval"
                  />
                  <Layout.Horizontal flex={{ alignItems: 'center' }}>
                    {item.record.type === SecretTypeEnum.SECRET_TEXT ||
                    item.record.type === SecretTypeEnum.SECRET_FILE ? (
                      <Icon
                        name={item.record.type === SecretTypeEnum.SECRET_TEXT ? 'text' : 'file'}
                        size={24}
                        className={css.secretIcon}
                      />
                    ) : null}
                    <Layout.Vertical padding={{ left: 'small' }}>
                      <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.BLACK}>
                        {item.record.name}
                      </Text>
                      <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
                        {`${getString('common.ID')}: ${item.identifier}`}
                      </Text>
                    </Layout.Vertical>
                  </Layout.Horizontal>
                </Layout.Horizontal>

                {!isMultiSelect && (
                  <RbacButton
                    minimal
                    className={css.editBtn}
                    onClick={() => handleEdit(item)}
                    permission={{
                      permission: PermissionIdentifier.UPDATE_SECRET,
                      resource: {
                        resourceType: ResourceType.SECRET,
                        resourceIdentifier: item.identifier
                      },
                      resourceScope: {
                        accountIdentifier,
                        orgIdentifier:
                          selectedScope === Scope.ORG || selectedScope === Scope.PROJECT ? orgIdentifier : undefined,
                        projectIdentifier: selectedScope === Scope.PROJECT ? projectIdentifier : undefined
                      }
                    }}
                    text={<Icon size={16} name={'Edit'} color={Color.GREY_600} />}
                  />
                )}
              </Layout.Horizontal>
            </>
          )
        }}
      />
    </Container>
  )
}

export default SecretReference
