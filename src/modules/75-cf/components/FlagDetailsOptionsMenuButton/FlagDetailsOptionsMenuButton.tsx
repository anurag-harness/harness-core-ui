/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { MutateMethod, MutateRequestOptions } from 'restful-react/dist/Mutate'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type {
  DeleteFeatureFlagQueryParams,
  Feature,
  FeatureResponseMetadata,
  GitSyncPatchOperation,
  PatchFeaturePathParams,
  PatchFeatureQueryParams
} from 'services/cf'
import type { UseGitSync } from '@cf/hooks/useGitSync'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { RbacMenuItemProps } from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import routes from '@common/RouteDefinitions'
import useDeleteFlagModal from '../FlagActivation/hooks/useDeleteFlagModal'
import ArchiveDialog from '../FlagArchiving/ArchiveDialog'
import useRestoreFlagDialog from '../FlagArchiving/useRestoreFlagDialog'
import useEditFlagDetailsModal from '../FlagActivation/hooks/useEditFlagDetailsModal'

export interface FlagDetailsOptionsMenuButtonProps {
  featureFlag: Feature
  gitSync: UseGitSync
  refetchFlag: () => void
  deleteFeatureFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  submitPatch: MutateMethod<
    FeatureResponseMetadata,
    GitSyncPatchOperation,
    PatchFeatureQueryParams,
    PatchFeaturePathParams
  >
  queryParams: DeleteFeatureFlagQueryParams
  setGovernanceMetadata: (governanceMetadata: any) => void
}

const FlagDetailsOptionsMenuButton: FC<FlagDetailsOptionsMenuButtonProps> = ({
  featureFlag,
  gitSync,
  queryParams,
  refetchFlag,
  submitPatch,
  deleteFeatureFlag,
  setGovernanceMetadata
}) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { withActiveEnvironment, activeEnvironment } = useActiveEnvironment()
  const { FFM_7921_ARCHIVING_FEATURE_FLAGS } = useFeatureFlags()
  const [showArchiveDialog, setShowArchiveDialog] = useState<boolean>()

  const featureFlagListURL = withActiveEnvironment(
    routes.toCFFeatureFlags({
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      accountId
    })
  )

  const { confirmDeleteFlag } = useDeleteFlagModal({
    featureFlag,
    gitSync,
    queryParams,
    deleteFeatureFlag,
    onSuccess: () => history.push(featureFlagListURL)
  })

  const openRestoreFlagDialog = useRestoreFlagDialog({
    flagData: featureFlag,
    gitSync,
    queryParams,
    onRestore: () => refetchFlag()
  })

  const { openEditDetailsModal } = useEditFlagDetailsModal({
    featureFlag,
    gitSync,
    refetchFlag,
    submitPatch,
    setGovernanceMetadata
  })

  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  const options: Record<string, RbacMenuItemProps> = {
    archive: {
      icon: 'archive',
      text: getString('archive'),
      onClick: () => setShowArchiveDialog(true),
      permission: {
        resource: { resourceType: ResourceType.FEATUREFLAG },
        permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
      },
      ...planEnforcementProps
    },
    delete: {
      icon: 'trash',
      text: getString('delete'),
      onClick: confirmDeleteFlag,
      permission: {
        resource: { resourceType: ResourceType.FEATUREFLAG },
        permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
      },
      ...planEnforcementProps
    },
    restore: {
      icon: 'redo',
      text: getString('cf.featureFlags.archiving.restore'),
      onClick: openRestoreFlagDialog,
      permission: {
        resource: { resourceType: ResourceType.FEATUREFLAG },
        permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
      },
      ...planEnforcementProps
    },
    edit: {
      icon: 'edit',
      text: getString('edit'),
      onClick: openEditDetailsModal,
      permission: {
        permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG,
        resource: activeEnvironment
          ? { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment }
          : { resourceType: ResourceType.FEATUREFLAG }
      },
      ...planEnforcementProps
    }
  }

  const getMenuItems = (
    archivingFlags: boolean,
    flag: Feature,
    menuOptions: Record<string, RbacMenuItemProps>
  ): RbacMenuItemProps[] => {
    if (archivingFlags) {
      if (flag.archived) {
        return [menuOptions.restore, menuOptions.delete]
      } else {
        return [menuOptions.edit, menuOptions.archive]
      }
    } else {
      return [menuOptions.edit, menuOptions.delete]
    }
  }

  return (
    <>
      {showArchiveDialog && (
        <ArchiveDialog
          archiveFlag={deleteFeatureFlag}
          flagIdentifier={featureFlag.identifier}
          flagName={featureFlag.name}
          onSuccess={() => history.push(featureFlagListURL)}
          gitSync={gitSync}
          queryParams={queryParams}
          setShowArchiveDialog={setShowArchiveDialog}
        />
      )}

      <RbacOptionsMenuButton items={getMenuItems(!!FFM_7921_ARCHIVING_FEATURE_FLAGS, featureFlag, options)} />
    </>
  )
}

export default FlagDetailsOptionsMenuButton
