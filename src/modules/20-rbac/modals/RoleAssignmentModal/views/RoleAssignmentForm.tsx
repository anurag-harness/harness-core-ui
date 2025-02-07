/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import {
  Container,
  Layout,
  Text,
  FieldArray,
  Select,
  SelectOption,
  Button,
  ButtonVariation,
  useToaster,
  SortMethod
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { defaultTo } from 'lodash-es'
import { useGetRoleList, useBulkDeleteRoleAssignment } from 'services/rbac'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetResourceGroupListV2 } from 'services/resourcegroups'
import { errorCheck } from '@common/utils/formikHelpers'
import { getScopeBasedDefaultResourceGroup, isAccountBasicRole, isAssignmentFieldDisabled } from '@rbac/utils/utils'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import NewUserRoleDropdown from '@rbac/components/NewUserRoleDropdown/NewUserRoleDropdown'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { Assignment, RoleOption, UserRoleAssignmentValues } from './UserRoleAssigment'
import type { RoleAssignmentValues } from './RoleAssignment'
import type { UserGroupRoleAssignmentValues } from './AssignRoles'
import css from './RoleAssignmentForm.module.scss'

export enum InviteType {
  ADMIN_INITIATED = 'ADMIN_INITIATED_INVITE',
  USER_INITIATED = 'USER_INITIATED_INVITE'
}

interface RoleAssignmentFormProps {
  noRoleAssignmentsText: string
  formik: FormikProps<UserRoleAssignmentValues | RoleAssignmentValues | UserGroupRoleAssignmentValues>
  onSuccess?: () => void
  onCancel?: () => void
  disabled?: boolean
}

const RoleAssignmentForm: React.FC<RoleAssignmentFormProps> = ({
  noRoleAssignmentsText,
  formik,
  onCancel,
  disabled
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [deletedRoleAssignments, setDeletedRoleAssignments] = useState<Assignment[]>([])
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const scope = getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
  const defaultResourceGroup = getScopeBasedDefaultResourceGroup(scope, getString)

  const { data: roleList } = useGetRoleList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageSize: 100,
      sortOrders: [SortMethod.NameAsc]
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' }
  })

  const { data: resourceGroupList } = useGetResourceGroupListV2({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageSize: 100,
      sortOrders: [SortMethod.NameAsc]
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' }
  })

  const { mutate: deleteRoleAssignments, loading: loadingDeleteRoleAssignments } = useBulkDeleteRoleAssignment({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const handleDeleteRoleAssignment = async (): Promise<void> => {
    try {
      const deleted = await deleteRoleAssignments(
        deletedRoleAssignments.map(assignment => assignment?.role.assignmentIdentifier || ''),
        {
          headers: { 'content-type': 'application/json' }
        }
      )
      if (deleted) {
        showSuccess(getString('rbac.roleAssignment.deleteSuccess'))
      } else {
        showError(getString('rbac.roleAssignment.deleteFailure'))
      }
    } catch (err) {
      showError(getRBACErrorMessage(err))
    }
  }

  const roles: RoleOption[] = useMemo(
    () =>
      roleList?.data?.content?.reduce((acc: RoleOption[], response) => {
        if (!isAccountBasicRole(response.role.identifier)) {
          acc.push({
            label: response.role.name,
            value: response.role.identifier,
            managed: defaultTo(response.harnessManaged, false),
            managedRoleAssignment: false
          })
        }
        return acc
      }, []) || [],
    [roleList]
  )

  const resourceGroups: SelectOption[] = useMemo(
    () =>
      resourceGroupList?.data?.content?.map(response => ({
        label: defaultTo(response.resourceGroup.name, ''),
        value: defaultTo(response.resourceGroup.identifier, '')
      })) || [],
    [resourceGroupList]
  )

  return (
    <>
      <Container className={css.roleAssignments}>
        <FieldArray
          label={getString('rbac.roleBindings')}
          name="assignments"
          placeholder={noRoleAssignmentsText}
          insertRowAtBeginning={false}
          isDeleteOfRowAllowed={row => !(row as Assignment).role.managedRoleAssignment}
          onDeleteOfRow={async row => {
            const deletedAssignmentIndex = formik.values.assignments.findIndex(
              assignment =>
                assignment.resourceGroup.assignmentIdentifier === row?.resourceGroup?.assignmentIdentifier &&
                assignment.role.assignmentIdentifier === row?.role?.assignmentIdentifier
            )
            formik.setFieldValue(
              'assignments',
              formik.values.assignments.filter((_, index) => index !== deletedAssignmentIndex)
            )
            if (row?.resourceGroup?.assignmentIdentifier) {
              setDeletedRoleAssignments?.([...deletedRoleAssignments, row as Assignment])
            }
            return true
          }}
          containerProps={{ className: css.containerProps }}
          fields={[
            {
              name: 'role',
              label: getString('roles'),
              // eslint-disable-next-line react/display-name
              renderer: (value, _index, handleChange, error) => (
                <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                  <NewUserRoleDropdown value={value} handleChange={handleChange} roles={roles} />
                  {errorCheck('assignments', formik) && error ? (
                    <Text intent="danger" font="xsmall">
                      {getString('rbac.usersPage.validation.role')}
                    </Text>
                  ) : null}
                </Layout.Vertical>
              )
            },
            {
              name: 'resourceGroup',
              label: getString('resourceGroups'),
              defaultValue: defaultResourceGroup,
              // eslint-disable-next-line react/display-name
              renderer: (value, _index, handleChange, error) => {
                return (
                  <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                    <Select
                      items={resourceGroups}
                      value={value}
                      disabled={isAssignmentFieldDisabled(value)}
                      popoverClassName={css.selectPopover}
                      usePortal={true}
                      inputProps={{
                        placeholder: getString('rbac.usersPage.selectResourceGroup'),
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        'data-testid': `resourceGroup-${_index}`
                      }}
                      onChange={handleChange}
                    />
                    {errorCheck('assignments', formik) && error ? (
                      <Text intent="danger" font="xsmall">
                        {getString('rbac.usersPage.validation.resourceGroup')}
                      </Text>
                    ) : null}
                  </Layout.Vertical>
                )
              }
            }
          ]}
        />
      </Container>
      <Layout.Horizontal spacing="small">
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('common.apply')}
          type="button"
          disabled={disabled || loadingDeleteRoleAssignments}
          onClick={async () => {
            if (deletedRoleAssignments.length > 0) {
              await handleDeleteRoleAssignment()
            }
            formik.submitForm()
          }}
        />
        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
      </Layout.Horizontal>
    </>
  )
}

export default RoleAssignmentForm
