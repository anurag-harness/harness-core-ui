/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  ButtonSize,
  ButtonVariation,
  Container,
  Dialog,
  useConfirmationDialog,
  useToaster,
  Button
} from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, isNil, pick } from 'lodash-es'
import type { InputSetDTO } from '@pipeline/utils/types'
import { ReconcileInputSetDialog } from '@pipeline/components/InputSetErrorHandling/ReconcileInputSetDialog/ReconcileInputSetDialog'
import {
  EntityGitDetails,
  InputSetResponse,
  useDeleteInputSetForPipeline,
  useUpdateInputSetForPipeline,
  useUpdateOverlayInputSetForPipeline,
  useYamlDiffForInputSet
} from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import routes from '@common/RouteDefinitions'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { OverlayInputSetDTO } from '@pipeline/components/OverlayInputSetForm/OverlayInputSetForm'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { useSaveInputSetOrOverlayInpSet } from '../utils'
import css from './OutOfSyncErrorStrip.module.scss'

interface OutOfSyncErrorStripProps {
  inputSet: InputSetDTO | OverlayInputSetDTO
  pipelineGitDetails?: EntityGitDetails
  overlayInputSetRepoIdentifier?: string
  overlayInputSetBranch?: string
  overlayInputSetIdentifier?: string
  onlyReconcileButton?: boolean
  refetch?: () => Promise<void>
  inputSetUpdateResponseHandler?: (responseData: InputSetResponse) => void
  hideInputSetButton?: boolean
  hideForm?: () => void
  isOverlayInputSet?: boolean
  fromInputSetForm?: boolean
  onReconcile?: (identifier: string) => void
  fromInputSetListView?: boolean
  refetchInputSets?: () => void
  closeReconcileMenu?: () => void
}

export function OutOfSyncErrorStrip(props: OutOfSyncErrorStripProps): React.ReactElement {
  const {
    inputSet,
    pipelineGitDetails,
    overlayInputSetRepoIdentifier,
    overlayInputSetBranch,
    overlayInputSetIdentifier,
    onlyReconcileButton,
    refetch,
    hideInputSetButton,
    hideForm,
    isOverlayInputSet,
    fromInputSetForm,
    onReconcile,
    fromInputSetListView,
    refetchInputSets,
    closeReconcileMenu
  } = props
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const history = useHistory()

  const { isGitSyncEnabled } = useAppStore()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const {
    repoIdentifier,
    branch,
    inputSetRepoIdentifier,
    inputSetBranch,
    inputSetConnectorRef,
    inputSetRepoName,
    connectorRef,
    repoName,
    storeType
  } = useQueryParams<InputSetGitQueryParams>()

  const goToInputSetList = (): void => {
    const route = routes.toInputSetList({
      orgIdentifier,
      projectIdentifier,
      accountId,
      pipelineIdentifier,
      module,
      connectorRef,
      repoIdentifier: isGitSyncEnabled ? get(pipelineGitDetails, 'repoIdentifier', '') : repoIdentifier,
      repoName,
      branch: isGitSyncEnabled ? get(pipelineGitDetails, 'branch', '') : branch,
      storeType
    })
    history.push(route)
  }

  const gitParams = get(inputSet, 'gitDetails.objectId')
    ? {
        ...pick(get(inputSet, 'gitDetails'), ['filePath', 'rootFolder']),
        lastObjectId: get(inputSet, 'gitDetails.objectId')
      }
    : {}

  const { mutate: updateInputSet, loading: updateInputSetLoading } = useUpdateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { mutate: updateOverlayInputSet, loading: updateOverlayInputSetLoading } = useUpdateOverlayInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const reconcileBranch = isGitSyncEnabled ? overlayInputSetBranch ?? inputSetBranch : branch

  const {
    data: yamlDiffResponse,
    refetch: refetchYamlDiff,
    loading,
    error
  } = useYamlDiffForInputSet({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier: pipelineIdentifier ?? get(inputSet, 'pipelineIdentifier'),
      repoIdentifier: isGitSyncEnabled
        ? overlayInputSetRepoIdentifier ?? inputSetRepoIdentifier
        : defaultTo(get(inputSet, 'gitDetails.repoName', inputSetRepoName), repoName),
      connectorRef: defaultTo(get(inputSet, 'connectorRef', inputSetConnectorRef), connectorRef),
      storeType: get(inputSet, 'storeType', storeType),
      ...gitParams,
      ...(isGitSyncEnabled
        ? {
            pipelineRepoID: repoIdentifier
          }
        : {}),
      pipelineBranch: reconcileBranch,
      ...(get(inputSet, 'gitDetails.repoName') === repoName
        ? { branch: defaultTo(get(inputSet, 'gitDetails.branch', inputSetBranch), branch) }
        : { branch: get(inputSet, 'gitDetails.branch', inputSetBranch) })
    },
    inputSetIdentifier: overlayInputSetIdentifier ?? get(inputSet, 'identifier', ''),
    lazy: true
  })

  const { mutate: deleteInputSet } = useDeleteInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, pipelineIdentifier }
  })

  const { handleSubmit } = useSaveInputSetOrOverlayInpSet({
    updateInputSet,
    updateOverlayInputSet,
    inputSet,
    _isOverlayInputSet: !!isOverlayInputSet,
    refetch,
    fromInputSetForm,
    hideForm,
    inpSetGitDetails: get(yamlDiffResponse, 'data.gitDetails', ''),
    onReconcile,
    refetchInputSets,
    closeReconcileMenu
  })

  const { openDialog: openDeleteInputSetModal, closeDialog: closeDeleteInputSetModal } = useConfirmationDialog({
    contentText: getString(
      isOverlayInputSet
        ? isNil(overlayInputSetIdentifier)
          ? 'pipeline.inputSets.invalidOverlayISDesc2'
          : 'pipeline.inputSets.invalidOverlayISDesc1'
        : fromInputSetForm
        ? 'pipeline.inputSets.invalidInputSetDesc1'
        : fromInputSetListView
        ? 'pipeline.inputSets.invalidInputSetDesc3'
        : 'pipeline.inputSets.invalidInputSetDesc2'
    ),
    titleText: getString(
      isOverlayInputSet ? 'pipeline.inputSets.invalidOverlayIS' : 'pipeline.inputSets.invalidInputSet'
    ),
    customButtons: (
      <Container style={{ display: 'flex', justifyContent: 'flexStart' }}>
        <RbacButton
          text={getString(
            isOverlayInputSet ? 'pipeline.inputSets.deleteOverlayIS' : 'pipeline.inputSets.deleteInputSet'
          )}
          intent="danger"
          permission={{
            resourceScope: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier
            },
            resource: {
              resourceType: ResourceType.PIPELINE,
              resourceIdentifier: pipelineIdentifier
            },
            permission: PermissionIdentifier.EDIT_PIPELINE
          }}
          onClick={async () => {
            try {
              const response = await deleteInputSet(
                defaultTo(overlayInputSetIdentifier ?? get(inputSet, 'identifier'), ''),
                {
                  queryParams: {
                    accountIdentifier: accountId,
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier: pipelineIdentifier ?? get(inputSet, 'pipelineIdentifier'),
                    commitMsg: get(inputSet, 'gitDetails.objectId')
                      ? `${getString('delete')} ${get(inputSet, 'name', '')}`
                      : '',
                    repoIdentifier: get(inputSet, 'gitDetails.repoIdentifier', ''),
                    branch: get(inputSet, 'gitDetails.branch', ''),
                    ...gitParams
                  },
                  headers: { 'content-type': 'application/json' }
                }
              )

              closeDeleteInputSetModal()
              closeReconcileMenu?.()
              !onlyReconcileButton && (!isOverlayInputSet ? goToInputSetList() : hideForm?.())

              if (get(response, 'status') === 'SUCCESS') {
                showSuccess(getString('inputSets.inputSetDeleted', { name: get(inputSet, 'name', '') }))
                refetch?.()
                refetchInputSets?.()
              } else {
                throw getString('somethingWentWrong')
              }
            } catch (err) {
              showError(getRBACErrorMessage(err), undefined, 'pipeline.delete.inputset.error')
            }
          }}
        />
        {/* Will be added as a Future Enhancement */}
        {/* {!yamlDiffResponse?.data?.noUpdatePossible && !onlyReconcileButton && !isOverlayInputSet && (
          <Button
            variation={ButtonVariation.TERTIARY}
            style={{ marginLeft: 'var(--spacing-8)' }}
            text={getString('pipeline.inputSetErrorStrip.updateRuntimeFields')}
            onClick={() => {
              const omittedInputSet = omit(
                inputSet,
                'pipeline',
                'gitDetails',
                'entityValidityDetails',
                'outdated',
                'inputSetErrorWrapper'
              )
              inputSetUpdateResponseHandler?.(omittedInputSet)
              closeDeleteInputSetModal()
            }}
          />
        )} */}
        {!hideInputSetButton && (
          <Button
            variation={ButtonVariation.TERTIARY}
            style={{ marginLeft: 'var(--spacing-8)' }}
            text={getString(
              fromInputSetForm ? 'pipeline.inputSets.goBackToInputSetList' : 'pipeline.inputSetErrorStrip.goToInpSetBtn'
            )}
            onClick={goToInputSetList}
          />
        )}
      </Container>
    ),
    onCloseDialog: () => {
      closeReconcileMenu?.()
    },
    intent: Intent.DANGER,
    showCloseButton: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false
  })

  const handleReconcileClick = (): void => {
    refetchYamlDiff()
    showSuccess(getString('pipeline.outOfSyncErrorStrip.reconcileStarted'))
  }

  const [showReconcileDialog, hideReconcileDialog] = useModalHook(() => {
    const onClose = (): void => {
      hideReconcileDialog()
      closeReconcileMenu?.()
    }

    return (
      <Dialog isOpen={true} onClose={onClose} enforceFocus={false} className={css.reconcileDialog}>
        <ReconcileInputSetDialog
          inputSet={inputSet}
          overlayInputSetIdentifier={overlayInputSetIdentifier}
          oldYaml={yamlStringify(yamlParse(defaultTo(yamlDiffResponse?.data?.oldYAML, '')))}
          newYaml={yamlStringify(yamlParse(defaultTo(yamlDiffResponse?.data?.newYAML, '')))}
          error={error}
          refetchYamlDiff={refetchYamlDiff}
          updateLoading={updateInputSetLoading || updateOverlayInputSetLoading}
          onClose={onClose}
          hideReconcileDialog={hideReconcileDialog}
          isOverlayInputSet={isOverlayInputSet}
          handleSubmit={handleSubmit}
          yamlDiffGitDetails={get(yamlDiffResponse, 'data.gitDetails', '')}
        />
      </Dialog>
    )
  }, [yamlDiffResponse, updateInputSetLoading, updateOverlayInputSetLoading, handleSubmit])

  useEffect(() => {
    if (error && isEmpty(inputSet.identifier)) {
      // User click reconcile button while creating input-set / overlay-input-set
      showError(getRBACErrorMessage(error))
      closeReconcileMenu?.()
    } else if (
      (!get(yamlDiffResponse, 'data.inputSetEmpty') &&
        get(yamlDiffResponse, 'data.oldYAML') &&
        get(yamlDiffResponse, 'data.newYAML')) ||
      error
    ) {
      showReconcileDialog()
    } else if (get(yamlDiffResponse, 'data.inputSetEmpty')) {
      hideReconcileDialog() // If the error object becomes empty after clicking the retry button, the reconcile dialogue should be closed
      openDeleteInputSetModal()
    }
  }, [yamlDiffResponse, error])

  return (
    <>
      {onlyReconcileButton ? (
        <Button
          text={getString('pipeline.outOfSyncErrorStrip.reconcile')}
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          onClick={e => {
            if (fromInputSetListView) e.stopPropagation()
            return refetchYamlDiff()
          }}
          loading={loading}
          className={fromInputSetListView ? css.reconcileButtonListView : css.reconcileButton}
        />
      ) : (
        <RbacMenuItem
          icon="refresh"
          text={getString('pipeline.outOfSyncErrorStrip.reconcile')}
          onClick={e => {
            if (fromInputSetForm || isOverlayInputSet) e.stopPropagation()
            handleReconcileClick()
          }}
          permission={{
            resourceScope: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier
            },
            resource: {
              resourceType: ResourceType.PIPELINE,
              resourceIdentifier: pipelineIdentifier
            },
            permission: PermissionIdentifier.EDIT_PIPELINE
          }}
        />
      )}
    </>
  )
}
