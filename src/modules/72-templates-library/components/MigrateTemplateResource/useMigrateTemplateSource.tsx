/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import type { SelectOption } from '@harness/uicore'
import { HideModal, useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import type { ResourceType } from '@common/interfaces/GitSyncInterface'
import { useQueryParams, useMutateAsGet } from '@common/hooks'
import type { GitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { StoreType } from '@common/constants/GitSyncTypes'

import { MigrationType } from '@pipeline/components/MigrateResource/MigrateUtils'
import {
  TemplateSummaryResponse,
  useGetTemplateList,
  useGetTemplateMetadataList,
  TemplateMetadataSummaryResponse
} from 'services/template-ng'
import { DefaultStableVersionValue } from '@pipeline/components/VersionsDropDown/VersionsDropDown'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { getVersionLabelText } from '@templates-library/utils/templatesUtils'

import MoveTemplateResource from './MoveTemplateResource'

interface UseMigrateResourceReturnType {
  showMigrateTemplateResourceModal: (template: any) => void
  hideMigrateTemplateResourceModal: HideModal
  moveDataLoading: boolean
}

interface UseMigrateTemplateResourceProps {
  resourceType: ResourceType
  modalTitle?: string
  onSuccess?: () => void
  onFailure?: () => void
  migrationType?: MigrationType
  isGitSyncEnabled?: boolean
  supportingTemplatesGitx?: boolean
  isStandAlone?: boolean
}

export default function useMigrateTemplateResource(
  props: UseMigrateTemplateResourceProps
): UseMigrateResourceReturnType {
  const {
    resourceType,
    modalTitle,
    onSuccess,
    onFailure,
    migrationType = MigrationType.IMPORT,
    isGitSyncEnabled,
    supportingTemplatesGitx,
    isStandAlone
  } = props

  const { connectorRef, repoName, branch } = useQueryParams<GitQueryParams>()

  const { accountId } = useParams<PipelinePathProps>()

  const { showWarning } = useToaster()

  const [template, setTemplate] = React.useState<TemplateMetadataSummaryResponse | TemplateSummaryResponse>({})
  const [templates, setTemplates] = React.useState<TemplateSummaryResponse[] | TemplateMetadataSummaryResponse[]>([])
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])

  const { getString } = useStrings()

  const onMigrateSuccess = (): void => {
    hideMigrateTemplateResourceModal()
    onSuccess?.()
  }

  const onMigrateFailure = (): void => {
    onFailure?.()
  }

  const {
    data: templateData,
    refetch,
    loading
  } = useMutateAsGet(supportingTemplatesGitx ? useGetTemplateMetadataList : useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateIdentifiers: [template.identifier]
    },
    queryParams: {
      accountIdentifier: defaultTo(template.accountId, accountId),
      orgIdentifier: template.orgIdentifier,
      projectIdentifier: template.projectIdentifier,
      module,
      templateListType: TemplateListType.All,
      size: 100,
      ...(isGitSyncEnabled
        ? { repoIdentifier: template.gitDetails?.repoIdentifier, branch: template.gitDetails?.branch }
        : {})
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const canMoveToRemote = (item: TemplateMetadataSummaryResponse): boolean =>
    item.storeType === StoreType.INLINE || (!isGitSyncEnabled && !item.storeType)

  React.useEffect(() => {
    const newVersionOptions: SelectOption[] = []
    templates.forEach((item: TemplateMetadataSummaryResponse) => {
      if (canMoveToRemote(item)) {
        newVersionOptions.push({
          label: getVersionLabelText(item, getString),
          value: defaultTo(item.versionLabel, DefaultStableVersionValue)
        } as SelectOption)
      }
    })
    setVersionOptions(newVersionOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates])

  React.useEffect(() => {
    if (templateData?.data?.content) {
      if (
        !isEmpty(templateData?.data?.content) &&
        isEmpty(templateData?.data?.content.find((item: TemplateMetadataSummaryResponse) => canMoveToRemote(item)))
      ) {
        return showWarning(getString('templatesLibrary.moveTemplateToRemoteWarning'))
      }
      const allVersions = [...templateData.data.content]
      if (isStandAlone) {
        const templateStableVersion = { ...allVersions.find(item => item.stableTemplate) }
        delete templateStableVersion.versionLabel
        allVersions.unshift(templateStableVersion)
      }
      setTemplates(allVersions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStandAlone, templateData])

  const getModalTitle = (): string => {
    let title = ''
    switch (migrationType) {
      case MigrationType.IMPORT:
        title = getString('common.importFromGit')
        break
      case MigrationType.INLINE_TO_REMOTE:
        title = getString('pipeline.moveInlieToRemote', {
          resource: resourceType
        })
        break
    }

    return modalTitle ?? title
  }

  React.useEffect(() => {
    if (!isEmpty(templates) && !isEmpty(versionOptions)) {
      showMigrateTemplateResourceModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionOptions, templates])

  const [showMigrateTemplateResourceModal, hideMigrateTemplateResourceModal] = useModalHook(() => {
    return (
      <Dialog
        style={{
          width: '800px',
          background: 'var(--form-bg)',
          paddingTop: '36px'
        }}
        enforceFocus={false}
        isOpen={true}
        className={'padded-dialog'}
        onClose={hideMigrateTemplateResourceModal}
        title={getModalTitle()}
      >
        <MoveTemplateResource
          initialValues={{
            identifier: defaultTo(template?.identifier, ''),
            name: defaultTo(template?.name, ''),
            description: '',
            tags: {},
            connectorRef: defaultTo(connectorRef, ''),
            repoName: defaultTo(repoName, ''),
            branch: defaultTo(branch, ''),
            filePath: '',
            versionLabel: (versionOptions[0].value as string) || defaultTo(template?.versionLabel, '')
          }}
          migrationType={migrationType}
          resourceType={resourceType}
          onCancelClick={hideMigrateTemplateResourceModal}
          onSuccess={onMigrateSuccess}
          onFailure={onMigrateFailure}
          isGitSyncEnabled={isGitSyncEnabled}
          supportingTemplatesGitx={supportingTemplatesGitx}
          template={template}
          templates={templates}
          versionOptions={versionOptions}
        />
      </Dialog>
    )
  }, [
    migrationType,
    resourceType,
    modalTitle,
    connectorRef,
    repoName,
    branch,
    onMigrateSuccess,
    onMigrateFailure,
    template,
    templates,
    versionOptions
  ])

  return {
    showMigrateTemplateResourceModal: (templateSource: TemplateMetadataSummaryResponse) => {
      setTemplate(templateSource)
      if (templateSource.identifier === template.identifier) {
        refetch()
      }
    },
    hideMigrateTemplateResourceModal,
    moveDataLoading: loading
  }
}
