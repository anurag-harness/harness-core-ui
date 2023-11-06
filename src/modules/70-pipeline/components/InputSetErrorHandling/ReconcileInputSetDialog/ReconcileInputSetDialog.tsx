/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Layout, PageSpinner, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO } from '@pipeline/utils/types'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { YamlDiffView } from '@common/components/YamlDiffView/YamlDiffView'

interface ReconcileInputSetDialogProps {
  inputSet: InputSetDTO
  overlayInputSetIdentifier?: string
  oldYaml: string
  newYaml: string
  error: any
  refetchYamlDiff: () => void
  updateLoading: boolean
  onClose: () => void
  hideReconcileDialog: () => void
  isOverlayInputSet?: boolean
  handleSubmit: (inputSetObjWithGitInfo: InputSetDTO, storeMetadata?: StoreMetadata) => Promise<void>
  yamlDiffGitDetails?: EntityGitDetails
}

export function ReconcileInputSetDialog({
  inputSet,
  overlayInputSetIdentifier,
  oldYaml,
  newYaml,
  error,
  refetchYamlDiff,
  updateLoading,
  onClose,
  hideReconcileDialog,
  isOverlayInputSet,
  handleSubmit,
  yamlDiffGitDetails
}: ReconcileInputSetDialogProps): React.ReactElement {
  const { getString } = useStrings()
  const [renderCount, setRenderCount] = useState<boolean>(true)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { branch, connectorRef, repoName, storeType, inputSetBranch, inputSetConnectorRef, inputSetRepoName } =
    useQueryParams<InputSetGitQueryParams>()
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)

  const updatedObj: any = yamlParse(newYaml)
  const identifier = overlayInputSetIdentifier ?? get(inputSet, 'identifier')
  const defaultFilePath = identifier ? `.harness/${identifier}.yaml` : ''
  const storeMetadata = {
    branch: get(yamlDiffGitDetails, 'branch') ?? defaultTo(get(inputSet, 'gitDetails.branch', inputSetBranch), branch),
    connectorRef: defaultTo(get(inputSet, 'connectorRef', inputSetConnectorRef), connectorRef),
    repoName:
      get(yamlDiffGitDetails, 'repoName') ??
      defaultTo(get(inputSet, 'gitDetails.repoName', inputSetRepoName), repoName),
    storeType: get(inputSet, 'storeType', storeType),
    filePath: get(yamlDiffGitDetails, 'filePath') ?? get(inputSet, 'gitDetails.filePath', defaultFilePath)
  }

  useEffect(() => {
    setRenderCount(false)
  }, [])

  useEffect(() => {
    /* istanbul ignore next */ if (!renderCount && !updateLoading) onClose()
  }, [updateLoading])

  const handleClick = (): void => {
    handleSubmit(isOverlayInputSet ? get(updatedObj, 'overlayInputSet', {}) : get(updatedObj, 'inputSet', {}), {
      ...storeMetadata
    })
    if (isGitSyncEnabled || storeMetadata.storeType === StoreType.REMOTE) hideReconcileDialog()
  }

  return (
    <Container>
      {updateLoading && <PageSpinner />}
      <Layout.Vertical>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <Text font={{ variation: FontVariation.H4 }}>
            {getString('pipeline.inputSetErrorStrip.reconcileDialogTitle', {
              type: isOverlayInputSet ? 'OVERLAY INPUT SET' : 'INPUT SET'
            })}
          </Text>
        </Container>
        <Container
          style={{ flex: 1 }}
          width={'100%'}
          background={Color.FORM_BG}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'xxxlarge', left: 'xxxlarge' }}
        >
          <YamlDiffView
            originalYaml={oldYaml}
            refreshedYaml={newYaml}
            error={error}
            refetchYamlDiff={refetchYamlDiff}
            templateErrorUtils={{ isTemplateResolved: true, isYamlDiffForTemplate: false }}
          />
        </Container>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <RbacButton
            text={getString('pipeline.inputSets.removeInvalidFields')}
            width={232}
            intent="danger"
            disabled={!!error}
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
            onClick={handleClick}
            loading={updateLoading}
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
