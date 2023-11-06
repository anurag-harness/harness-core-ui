/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  SelectOption,
  Text,
  useConfirmationDialog,
  VisualYamlSelectedView as SelectedView
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { isEmpty, isNil } from 'lodash-es'
import { Dialog, Spinner } from '@blueprintjs/core'
import classNames from 'classnames'

import {
  Fields,
  ModalProps,
  PromiseExtraArgs,
  Intent,
  TemplateConfigModalWithRef
} from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { TagsPopover, useToaster } from '@common/components'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type {
  GitQueryParams,
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import routes from '@common/RouteDefinitions'
import { NGTemplateInfoConfig, useUpdateStableTemplate } from 'services/template-ng'
import { useStrings } from 'framework/strings'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import StudioGitPopover from '@pipeline/components/PipelineStudio/StudioGitPopover'
import { VersionsDropDown } from '@pipeline/components/VersionsDropDown/VersionsDropDown'
import { GitPopoverV2 } from '@common/components/GitPopoverV2/GitPopoverV2'
import {
  EntityCachedCopy,
  EntityCachedCopyHandle
} from '@pipeline/components/PipelineStudio/PipelineCanvas/EntityCachedCopy/EntityCachedCopy'
import { StoreType } from '@common/constants/GitSyncTypes'
import { isNewTemplate } from '@templates-library/components/TemplateStudio/TemplateStudioUtils'
import css from './TemplateStudioSubHeaderLeftView.module.scss'

/**
 * While creating no field should be disabled.
 * Without permission, all fields should be disabled.
 * With edit  permission, only Identifier and VersionLabel should be disabled.
 */
const getDisabledFields = (templateIdentifier: string, isReadonly: boolean): Array<Fields> => {
  if (isNewTemplate(templateIdentifier)) {
    return []
  } else if (isReadonly) {
    return [Fields.VersionLabel, Fields.Identifier, Fields.Name, Fields.Description, Fields.Tags]
  } else {
    return [Fields.VersionLabel, Fields.Identifier]
  }
}

export interface TemplateStudioSubHeaderLeftViewProps {
  onGitBranchChange?: (selectedFilter: GitFilterScope) => void
}

export interface TemplateStudioSubHeaderLeftViewHandle {
  openReconcileConfirmation(): void
}

export function TemplateStudioSubHeaderLeftView(
  props: TemplateStudioSubHeaderLeftViewProps,
  ref: React.ForwardedRef<TemplateStudioSubHeaderLeftViewHandle>
): React.ReactElement {
  const { onGitBranchChange } = props
  const {
    state,
    updateTemplate,
    deleteTemplateCache,
    fetchTemplate,
    view,
    isReadonly,
    updateGitDetails,
    updateStoreMetadata,
    updateTemplateView
  } = React.useContext(TemplateContext)
  const {
    template,
    versions,
    stableVersion,
    isUpdated,
    gitDetails,
    storeMetadata,
    templateYamlError,
    templateView,
    cacheResponseMetadata: cacheResponse
  } = state
  const { accountId, projectIdentifier, orgIdentifier, module, templateIdentifier } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { updateQueryParams } = useUpdateQueryParams<TemplateStudioQueryParams>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingTemplatesGitx
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const isYaml = view === SelectedView.YAML
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const pipelineCachedCopyRef = React.useRef<EntityCachedCopyHandle | null>(null)

  const { mutate: updateStableTemplate, loading: updateStableTemplateLoading } = useUpdateStableTemplate({
    templateIdentifier: template.identifier,
    versionLabel: template.versionLabel,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch
    },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  React.useImperativeHandle(ref, () => ({
    openReconcileConfirmation() {
      pipelineCachedCopyRef.current?.showConfirmationModal()
    }
  }))

  const reloadFromCache = React.useCallback((): void => {
    updateTemplateView({ ...templateView, isYamlEditable: false })
    fetchTemplate({ forceFetch: true, forceUpdate: true, loadFromCache: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateView])

  const navigateToTemplatesListPage = React.useCallback(() => {
    history.push(routes.toTemplates({ orgIdentifier, projectIdentifier, accountId, module }))
  }, [history, routes.toTemplates, orgIdentifier, projectIdentifier, accountId, module])

  const [showConfigModal, hideConfigModal] = useModalHook(() => {
    const onCloseCreate = () => {
      if (template.identifier === DefaultNewTemplateId) {
        navigateToTemplatesListPage()
      }
      hideConfigModal()
    }

    return (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        className={classNames(css.createTemplateDialog, {
          [css.gitCreateTemplateDialog]: supportingTemplatesGitx
        })}
      >
        {modalProps && <TemplateConfigModalWithRef {...modalProps} onClose={onCloseCreate} />}
      </Dialog>
    )
  }, [template.identifier, navigateToTemplatesListPage, modalProps])

  const onSubmit = React.useCallback(
    async (data: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs): Promise<UseSaveSuccessResponse> => {
      const { updatedGitDetails } = extraInfo
      template.name = data.name
      template.description = data.description
      template.identifier = data.identifier
      template.tags = data.tags ?? {}
      template.versionLabel = data.versionLabel
      template.orgIdentifier = data.orgIdentifier
      template.projectIdentifier = data.projectIdentifier
      template.icon = data.icon

      try {
        await updateTemplate(template)

        if (extraInfo.storeMetadata) {
          updateStoreMetadata(extraInfo.storeMetadata, updatedGitDetails)
        } else {
          updateGitDetails(isEmpty(updatedGitDetails) ? {} : { ...gitDetails, ...updatedGitDetails }).then(() => {
            updateQueryParams(
              { repoIdentifier: updatedGitDetails?.repoIdentifier, branch: updatedGitDetails?.branch },
              { skipNulls: true }
            )
          })
        }

        return { status: 'SUCCESS' }
      } catch (error) {
        return { status: 'ERROR' }
      }
    },
    [template, gitDetails]
  )

  const goToTemplateVersion = async (versionLabel: string): Promise<void> => {
    if (versionLabel !== DefaultNewVersionLabel && versionLabel !== template.versionLabel) {
      await deleteTemplateCache()
      history.replace(
        routes.toTemplateStudio({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType: template.type,
          templateIdentifier: template.identifier,
          versionLabel: versionLabel,
          repoIdentifier,
          branch
        })
      )
    }
  }

  const { openDialog: openConfirmationDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('templatesLibrary.setAsStableText', { version: template.versionLabel }),
    titleText: getString('templatesLibrary.setAsStableTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        updateStableLabel()
      }
    }
  })

  const updateStableLabel = async (): Promise<void> => {
    try {
      await updateStableTemplate()
      showSuccess(getString('common.template.updateTemplate.templateUpdated'))
      await fetchTemplate({ forceFetch: true, forceUpdate: true })
    } catch (error) {
      showError(
        getRBACErrorMessage(error as RBACError) || getString('common.template.updateTemplate.errorWhileUpdating'),
        undefined,
        'template.save.template.error'
      )
    }
  }

  React.useEffect(() => {
    const newVersionOption: SelectOption[] = versions.map(item => {
      return {
        label: item === stableVersion ? item + ' (Stable)' : item,
        value: item
      }
    })
    newVersionOption.sort((a, b) => a.label.localeCompare(b.label))
    setVersionOptions(newVersionOption)
  }, [versions])

  React.useEffect(() => {
    if (template.identifier === DefaultNewTemplateId && !isEmpty(template.type)) {
      hideConfigModal()
      setModalProps({
        initialValues: template,
        promise: onSubmit,
        title: getString('templatesLibrary.createNewModal.heading', {
          entity: templateFactory.getTemplateLabel(template.type)
        }),
        intent: Intent.START,
        allowScopeChange: true,
        storeMetadata,
        gitDetails
      })
      showConfigModal()
    }
  }, [template.identifier, showConfigModal, template.type, onSubmit])

  return (
    <Container className={css.subHeaderLeftView}>
      <Layout.Horizontal spacing={'medium'} padding={{ right: 'medium' }} flex={{ alignItems: 'center' }}>
        <Container>
          <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
            <Icon name="template-library" size={20} />
            <Text
              className={classNames(css.templateName, {
                [css.shortened]: storeMetadata?.storeType === StoreType.REMOTE
              })}
              color={Color.GREY_700}
              font={{ weight: 'bold' }}
              tooltip={template?.name}
            >
              {template.name}
            </Text>
            {!isNil(template?.tags) && !isEmpty(template?.tags) && <TagsPopover tags={template.tags} />}
            {isGitSyncEnabled && onGitBranchChange && (
              <StudioGitPopover
                connectorRef={storeMetadata?.connectorRef}
                gitDetails={gitDetails}
                identifier={templateIdentifier}
                isReadonly={isReadonly}
                entityData={template}
                onGitBranchChange={onGitBranchChange}
                entityType={getString('common.template.label')}
              />
            )}
            {!isYaml && (
              <Button
                variation={ButtonVariation.ICON}
                icon="Edit"
                iconProps={{
                  color: Color.GREY_800
                }}
                withoutCurrentColor
                onClick={() => {
                  setModalProps({
                    initialValues: template,
                    promise: onSubmit,
                    ...(!isNewTemplate(templateIdentifier) && { gitDetails }),
                    title: getString('templatesLibrary.createNewModal.editHeading', {
                      entity: templateFactory.getTemplateLabel(template.type)
                    }),
                    intent: isNewTemplate(templateIdentifier) ? Intent.START : Intent.EDIT,
                    disabledFields: getDisabledFields(templateIdentifier, isReadonly),
                    allowScopeChange: isNewTemplate(templateIdentifier),
                    storeMetadata,
                    gitDetails
                  })
                  showConfigModal()
                }}
              />
            )}
          </Layout.Horizontal>
        </Container>
        {!isNewTemplate(templateIdentifier) && (
          <VersionsDropDown
            onChange={item => goToTemplateVersion(item.value.toString())}
            items={versionOptions}
            value={template.versionLabel}
            className={css.versionDropDown}
            stableVersion={stableVersion}
            popoverClassName={css.dropdown}
          />
        )}
        {updateStableTemplateLoading ? (
          <Container padding={{ right: 'large', left: 'large' }}>
            <Spinner size={Spinner.SIZE_SMALL} />
          </Container>
        ) : (
          template.versionLabel !== stableVersion &&
          !isUpdated &&
          !templateYamlError && (
            <Button
              onClick={openConfirmationDialog}
              variation={ButtonVariation.LINK}
              size={ButtonSize.SMALL}
              disabled={isReadonly}
              text={getString('common.setAsStable')}
            />
          )
        )}
        {storeMetadata?.storeType === StoreType.REMOTE && (
          <>
            <span className={css.separator}></span>
            <Layout.Horizontal flex={{ alignItems: 'center' }}>
              <GitPopoverV2
                storeMetadata={storeMetadata}
                gitDetails={gitDetails}
                branchChangeDisabled={isNewTemplate(templateIdentifier)}
                onGitBranchChange={onGitBranchChange!}
                btnClassName={css.gitBtn}
                customIcon={
                  !isEmpty(cacheResponse) ? (
                    <EntityCachedCopy
                      ref={pipelineCachedCopyRef}
                      reloadContent={getString('common.template.label')}
                      cacheResponse={cacheResponse}
                      reloadFromCache={reloadFromCache}
                      fetchError={templateYamlError as any}
                      className={css.cacheIcon}
                    />
                  ) : undefined
                }
              />
            </Layout.Horizontal>
          </>
        )}
      </Layout.Horizontal>
    </Container>
  )
}

export const TemplateStudioSubHeaderLeftViewWithRef = React.forwardRef(TemplateStudioSubHeaderLeftView)
