/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get, isEmpty, merge, noop, omit } from 'lodash-es'
import {
  Layout,
  NestedAccordionProvider,
  Text,
  PageHeader,
  PageBody,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  Popover,
  Button,
  ButtonVariation,
  Container
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { Classes, Menu, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { flushSync } from 'react-dom'
import type { InputSetResponse, PipelineConfig, PipelineInfoConfig } from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import {
  useGetTemplateFromPipeline,
  useGetPipeline,
  useCreateInputSetForPipeline,
  useGetInputSetForPipeline,
  useUpdateInputSetForPipeline,
  ResponseInputSetResponse,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  ResponsePMSPipelineResponseDTO,
  ResponseInputSetTemplateWithReplacedExpressionsResponse
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type {
  GitQueryParams,
  InputSetGitQueryParams,
  InputSetPathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { parse, stringify, yamlParse } from '@common/utils/YamlHelperMethods'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { InputSetDTO, InputSetType, Pipeline, InputSet } from '@pipeline/utils/types'
import { hasStoreTypeMismatch, isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import NoEntityFound from '@pipeline/pages/utils/NoEntityFound/NoEntityFound'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { useGetResolvedChildPipeline } from '@pipeline/hooks/useGetResolvedChildPipeline'
import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import useDiffDialog from '@common/hooks/useDiffDialog'
import { usePermission } from '@rbac/hooks/usePermission'

import GitPopover from '../GitPopover/GitPopover'
import { FormikInputSetForm } from './FormikInputSetForm'
import { useSaveInputSet } from './useSaveInputSet'
import { PipelineVariablesContextProvider } from '../PipelineVariablesContext/PipelineVariablesContext'
import { OutOfSyncErrorStrip } from '../InputSetErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip'
import {
  EntityCachedCopy,
  EntityCachedCopyHandle
} from '../PipelineStudio/PipelineCanvas/EntityCachedCopy/EntityCachedCopy'
import css from './InputSetForm.module.scss'

const getDefaultInputSet = (
  template: PipelineInfoConfig,
  orgIdentifier: string,
  projectIdentifier: string
): InputSetDTO => ({
  name: '',
  identifier: '',
  description: undefined,
  orgIdentifier,
  projectIdentifier,
  pipeline: template,
  repo: '',
  branch: ''
})

export interface InputSetFormProps {
  executionView?: boolean

  // Props to support embedding InputSetForm (create new) in a modal
  // @see src/modules/70-pipeline/components/InputSetForm/NewInputSetModal.tsx
  inputSetInitialValue?: InputSetDTO
  isNewInModal?: boolean
  className?: string
  onCancel?: () => void
  onCreateSuccess?: (response: ResponseInputSetResponse) => void
}

const getInputSet = (
  orgIdentifier: string,
  projectIdentifier: string,
  inputSetResponse: ResponseInputSetResponse | null,
  template: ResponseInputSetTemplateWithReplacedExpressionsResponse | null,
  mergeTemplate?: string,
  isGitSyncEnabled = false
): InputSetDTO | InputSetType => {
  if (inputSetResponse?.data) {
    const inputSetObj = inputSetResponse?.data

    const parsedInputSetObj = parse<InputSet>(defaultTo(inputSetObj?.inputSetYaml, ''))
    /*
      Context of the below if block
      We need to populate existing values of input set in the form.
      The values are to be filled come from 'merge' API i.e. mergeTemplate object
      But if the merge API fails (due to invalid input set or any other reason) - we populate the value from the input set response recevied (parsedInputSetObj).
    */
    const parsedPipelineWithValues = mergeTemplate
      ? defaultTo(parse<Pipeline>(defaultTo(mergeTemplate, ''))?.pipeline, {} as PipelineInfoConfig)
      : parsedInputSetObj?.inputSet?.pipeline

    if (isGitSyncEnabled && parsedInputSetObj && parsedInputSetObj.inputSet) {
      return {
        name: parsedInputSetObj.inputSet.name,
        tags: parsedInputSetObj.inputSet.tags,
        identifier: parsedInputSetObj.inputSet.identifier,
        description: parsedInputSetObj.inputSet.description,
        orgIdentifier: parsedInputSetObj.inputSet.orgIdentifier,
        projectIdentifier: parsedInputSetObj.inputSet.projectIdentifier,
        pipeline: clearRuntimeInput(parsedPipelineWithValues),
        gitDetails: defaultTo(inputSetObj.gitDetails, {}),
        connectorRef: defaultTo(inputSetObj.connectorRef, ''),
        inputSetErrorWrapper: defaultTo(inputSetObj.inputSetErrorWrapper, {}),
        entityValidityDetails: defaultTo(inputSetObj.entityValidityDetails, {}),
        outdated: inputSetObj.outdated
      }
    }
    return {
      name: inputSetObj.name,
      tags: inputSetObj.tags,
      identifier: defaultTo(inputSetObj.identifier, ''),
      description: inputSetObj?.description,
      orgIdentifier,
      projectIdentifier,
      pipeline: clearRuntimeInput(parsedPipelineWithValues),
      gitDetails: defaultTo(inputSetObj.gitDetails, {}),
      connectorRef: defaultTo(inputSetObj.connectorRef, ''),
      inputSetErrorWrapper: defaultTo(inputSetObj.inputSetErrorWrapper, {}),
      entityValidityDetails: defaultTo(inputSetObj.entityValidityDetails, {}),
      outdated: inputSetObj.outdated,
      cacheResponse: inputSetObj.cacheResponse,
      storeType: inputSetObj.storeType
    }
  }
  return getDefaultInputSet(
    clearRuntimeInput(parse<Pipeline>(defaultTo(template?.data?.inputSetTemplateYaml, ''))?.pipeline),
    orgIdentifier,
    projectIdentifier
  )
}

function InputSetForm(props: InputSetFormProps): React.ReactElement {
  const { executionView, inputSetInitialValue, isNewInModal, className, onCancel, onCreateSuccess = noop } = props
  const { getString } = useStrings()
  const [isEdit, setIsEdit] = React.useState(false)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, inputSetIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const {
    repoIdentifier,
    branch,
    inputSetRepoIdentifier,
    inputSetBranch,
    connectorRef,
    inputSetConnectorRef,
    repoName,
    inputSetRepoName,
    storeType
  } = useQueryParams<InputSetGitQueryParams>()

  const defaultLoadFromCacheHeader = Boolean(inputSetRepoName).toString()
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = React.useContext(AppStoreContext)
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [inputSetUpdateResponse, setInputSetUpdateResponse] = React.useState<ResponseInputSetResponse>()
  const [filePath, setFilePath] = React.useState<string>()
  const [loadFromCache, setLoadFromCache] = React.useState<string>(defaultLoadFromCacheHeader)
  const {
    refetch: refetchTemplate,
    data: template,
    loading: loadingTemplate
  } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    },
    body: {
      stageIdentifiers: []
    },
    requestOptions: { headers: { 'Load-From-Cache': loadFromCache } },
    lazy: true
  })

  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [formErrors, setFormErrors] = React.useState<Record<string, any>>({})
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [resolvedPipeline, setResolvedPipeline] = React.useState<PipelineInfoConfig | undefined>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const getBranchQueryParams = (isMerge?: boolean): { branch?: string; loadFromFallbackBranch?: boolean } => {
    if (isGitSyncEnabled) {
      return { branch: inputSetBranch }
    } else if (repoName === inputSetRepoName) {
      // Even for same repo, while coming from NoEntityFound InputSet and pipeline branch may be different for 1st render too
      return isMerge ? { branch } : { branch: inputSetBranch || branch }
    } else {
      return inputSetBranch ? { branch: inputSetBranch } : { loadFromFallbackBranch: true }
    }
  }

  const getInputSetDefaultQueryParam = () => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      ...(isGitSyncEnabled
        ? {
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch
          }
        : {}),
      repoIdentifier: isGitSyncEnabled ? inputSetRepoIdentifier : inputSetRepoName,
      ...getBranchQueryParams()
    }
  }

  const {
    data: inputSetResponse,
    refetch,
    loading: loadingInputSet,
    error: inputSetError
  } = useGetInputSetForPipeline({
    queryParams: getInputSetDefaultQueryParam(),
    inputSetIdentifier: defaultTo(inputSetIdentifier, ''),
    lazy: true
  })

  const [mergeTemplate, setMergeTemplate] = React.useState<string>()
  const { mutate: mergeInputSet, loading: loadingMerge } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch,
      repoIdentifier: isGitSyncEnabled ? inputSetRepoIdentifier : inputSetRepoName,
      ...getBranchQueryParams(true),
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    },
    requestOptions: { headers: { 'Load-From-Cache': loadFromCache } }
  })

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
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

  const {
    data: pipeline,
    loading: loadingPipeline,
    refetch: refetchPipeline
  } = useGetPipeline({
    pipelineIdentifier,
    lazy: true,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      getTemplatesResolvedPipeline: true,
      parentEntityConnectorRef: connectorRef,
      parentEntityRepoName: repoName
    }
  })

  const { handleSubmit } = useSaveInputSet({
    createInputSet,
    updateInputSet,
    inputSetResponse,
    isEdit,
    setFormErrors,
    onCreateSuccess
  })

  const handleMenu = (state: boolean): void => {
    setMenuOpen(state)
  }

  const inputSet: InputSetDTO | InputSetType = React.useMemo(() => {
    if (inputSetUpdateResponse) {
      return getInputSet(
        orgIdentifier,
        projectIdentifier,
        inputSetUpdateResponse,
        template,
        mergeTemplate,
        isGitSyncEnabled
      )
    }
    return getInputSet(orgIdentifier, projectIdentifier, inputSetResponse, template, mergeTemplate, isGitSyncEnabled)
  }, [
    mergeTemplate,
    inputSetResponse?.data,
    template?.data?.inputSetTemplateYaml,
    isGitSyncEnabled,
    inputSetUpdateResponse
  ])

  const [disableVisualView, setDisableVisualView] = React.useState(inputSet.entityValidityDetails?.valid === false)

  const formikRef = React.useRef<FormikProps<InputSetDTO & GitContextProps & StoreMetadata>>()

  const inputSetUpdateResponseHandler = (responseData: InputSetResponse): void => {
    setInputSetUpdateResponse({
      data: {
        ...responseData,
        inputSetYaml: responseData?.inputSetYaml
      }
    })
  }

  const parsedPipeline: PipelineInfoConfig | undefined = React.useMemo(
    () => yamlParse<PipelineConfig>(defaultTo(pipeline?.data?.yamlPipeline, ''))?.pipeline,
    [pipeline?.data?.yamlPipeline]
  )

  const parsedInputSetObj = parse<InputSet>(defaultTo(inputSetResponse?.data?.inputSetYaml, ''))

  const latestYamlPipeline = React.useMemo(() => {
    if (selectedView === SelectedView.YAML) {
      const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
      return stringify(parse<InputSet>(yaml)?.inputSet?.pipeline)
    }
  }, [selectedView, yamlHandler])

  const { open: openDiffModal } = useDiffDialog({
    originalYaml: stringify(parsedInputSetObj?.inputSet?.pipeline),
    updatedYaml:
      selectedView === SelectedView.VISUAL ? stringify(formikRef?.current?.values?.pipeline) : latestYamlPipeline ?? '',
    title: getString('pipeline.inputSetDiffTitle')
  })

  React.useEffect(() => {
    setResolvedPipeline(
      yamlParse<PipelineConfig>(defaultTo(pipeline?.data?.resolvedTemplatesPipelineYaml, ''))?.pipeline
    )
  }, [pipeline?.data?.resolvedTemplatesPipelineYaml])

  const { loadingResolvedChildPipeline, resolvedMergedPipeline } = useGetResolvedChildPipeline(
    { accountId, repoIdentifier: defaultTo(repoName, repoIdentifier), branch, connectorRef },
    parsedPipeline,
    resolvedPipeline
  )

  React.useEffect(() => {
    if (!isEmpty(inputSet)) setFilePath(getFilePath(inputSet))
    if (!isInputSetInvalid(inputSet) && !hasStoreTypeMismatch(storeType, inputSetResponse?.data?.storeType, isEdit)) {
      setSelectedView(SelectedView.VISUAL)
    } else {
      setSelectedView(SelectedView.YAML)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSet, inputSet.entityValidityDetails?.valid, storeType, isEdit])

  React.useEffect(() => {
    if (
      inputSet.entityValidityDetails?.valid === false ||
      inputSet.outdated ||
      hasStoreTypeMismatch(storeType, inputSetResponse?.data?.storeType, isEdit)
    ) {
      setDisableVisualView(true)
    } else {
      setDisableVisualView(false)
    }
  }, [inputSet.entityValidityDetails?.valid, inputSet.outdated, storeType, inputSetResponse?.data?.storeType, isEdit])

  React.useEffect(() => {
    if (inputSetIdentifier !== '-1' && !isNewInModal) {
      setIsEdit(true)
      refetch({
        pathParams: { inputSetIdentifier: inputSetIdentifier },
        requestOptions: { headers: { 'Load-From-Cache': loadFromCache } }
      })
      refetchTemplate()
      refetchPipeline({ requestOptions: { headers: { 'Load-From-Cache': loadFromCache } } })
    } else {
      refetchTemplate()
      refetchPipeline({ requestOptions: { headers: { 'Load-From-Cache': loadFromCache } } })

      setIsEdit(false)
    }
  }, [inputSetIdentifier])

  React.useEffect(() => {
    if (!loadingInputSet && inputSetResponse && !isInputSetInvalid(inputSet)) {
      // Merge only if inputset is valid
      mergeInputSet({
        inputSetReferences: [inputSetIdentifier]
      })
        .then(response => {
          setMergeTemplate(response.data?.pipelineYaml)
          setLoadFromCache(defaultLoadFromCacheHeader)
        })
        .catch(e => {
          setMergeTemplate(undefined)
          showError(getRBACErrorMessage(e), undefined, 'pipeline.get.template')
        })
    }
  }, [inputSetIdentifier, loadingInputSet])

  useDocumentTitle(
    isNewInModal
      ? document.title
      : [
          defaultTo(
            parse<Pipeline>(defaultTo(pipeline?.data?.yamlPipeline, ''))?.pipeline?.name,
            getString('pipelines')
          ),
          isEdit ? defaultTo(inputSetResponse?.data?.name, '') : getString('inputSets.newInputSetLabel')
        ]
  )

  const getFilePath = React.useCallback(
    (inputSetYamlVisual: InputSetDTO) => {
      if (inputSet.gitDetails?.filePath) {
        return inputSet.gitDetails?.filePath
      }
      if (filePath) {
        return filePath
      }
      return inputSetYamlVisual.identifier ? `.harness/${inputSetYamlVisual.identifier}.yaml` : ''
    },
    [inputSet, filePath]
  )

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
        const inputSetYamlVisual = parse<InputSet>(yaml).inputSet
        if (inputSetYamlVisual) {
          inputSet.name = inputSetYamlVisual.name
          inputSet.identifier = inputSetYamlVisual.identifier
          inputSet.description = inputSetYamlVisual.description
          inputSet.pipeline = inputSetYamlVisual.pipeline

          formikRef.current?.setValues({
            ...omit(inputSet, 'gitDetails', 'entityValidityDetails', 'outdated', 'inputSetErrorWrapper'),
            repo: defaultTo(repoIdentifier || repoName, ''),
            branch: defaultTo(branch, ''),
            connectorRef: defaultTo(connectorRef, ''),
            repoName: defaultTo(repoName, ''),
            storeType: defaultTo(storeType, StoreType.INLINE),
            filePath: getFilePath(inputSetYamlVisual)
          })
          setFilePath(getFilePath(inputSetYamlVisual))
        }
      } else {
        setFilePath(formikRef.current?.values.filePath)
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, inputSet]
  )

  const [isFormDirty, setIsFormDirty] = React.useState(false)
  // Form dirty and isSaveEnabled are different
  // form dirty is determined on formvalues.pipeline and save is enabled on ipset identifier
  const [isSaveEnabled, setIsSaveEnabled] = React.useState(false)

  const handleFormDirty = (dirty: boolean): void => {
    setIsFormDirty(dirty)
  }
  const child = React.useCallback(
    () => (
      <PipelineVariablesContextProvider
        pipeline={resolvedMergedPipeline}
        enablePipelineTemplatesResolution={false}
        storeMetadata={{ storeType, connectorRef, repoName, branch, filePath }}
      >
        <FormikInputSetForm
          inputSet={isNewInModal && inputSetInitialValue ? merge(inputSet, inputSetInitialValue) : inputSet}
          template={template}
          pipeline={pipeline}
          resolvedPipeline={resolvedMergedPipeline}
          handleSubmit={handleSubmit}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          yamlHandler={yamlHandler}
          setYamlHandler={setYamlHandler}
          formikRef={formikRef}
          selectedView={selectedView}
          executionView={executionView}
          isEdit={isEdit}
          isGitSyncEnabled={isGitSyncEnabled}
          supportingGitSimplification={supportingGitSimplification}
          className={className}
          onCancel={onCancel}
          filePath={filePath}
          handleFormDirty={handleFormDirty}
          setIsSaveEnabled={setIsSaveEnabled}
        />
      </PipelineVariablesContextProvider>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      inputSet,
      template,
      pipeline,
      resolvedMergedPipeline,
      handleSubmit,
      formErrors,
      setFormErrors,
      yamlHandler,
      setYamlHandler,
      formikRef,
      selectedView,
      executionView,
      isEdit,
      isGitSyncEnabled,
      updateInputSetLoading,
      filePath
    ]
  )

  if (executionView) {
    return child()
  }

  if (supportingGitSimplification && !loadingInputSet && inputSetError) {
    return (
      <NoEntityFound
        identifier={inputSetIdentifier}
        entityType={'inputSet'}
        entityConnectorRef={inputSetConnectorRef}
        gitDetails={{ ...inputSet?.gitDetails, repoName: inputSetRepoName, branch: inputSetBranch }}
        errorObj={inputSetError.data as Error}
      />
    )
  }

  if (loadingInputSet || loadingPipeline || loadingTemplate || loadingMerge || loadingResolvedChildPipeline) {
    return <ContainerSpinner height={'100vh'} flex={{ align: 'center-center' }} />
  }

  const branchChangeHandler = (selectedBranch?: string): void => {
    if (selectedBranch) {
      refetch({
        pathParams: { inputSetIdentifier: inputSetIdentifier },
        queryParams: {
          ...getInputSetDefaultQueryParam(),
          loadFromFallbackBranch: false,
          branch: selectedBranch
        },
        requestOptions: { headers: { 'Load-From-Cache': loadFromCache } }
      })
    }
  }

  function handleReloadFromCache(): void {
    flushSync(() => {
      setLoadFromCache('false')
    })
    refetch({
      pathParams: { inputSetIdentifier: inputSetIdentifier },
      requestOptions: { headers: { 'Load-From-Cache': 'false' } }
    })
    refetchTemplate({
      body: {
        stageIdentifiers: []
      },
      requestOptions: { headers: { 'Load-From-Cache': 'false' } }
    })
    refetchPipeline({ requestOptions: { headers: { 'Load-From-Cache': 'false' } } })
  }

  return (
    <InputSetFormWrapper
      loading={!isGitSyncEnabled && (createInputSetLoading || updateInputSetLoading)}
      isEdit={isEdit}
      selectedView={selectedView}
      handleModeSwitch={handleModeSwitch}
      inputSet={inputSet}
      pipeline={pipeline}
      isGitSyncEnabled={isGitSyncEnabled}
      disableVisualView={disableVisualView}
      inputSetUpdateResponseHandler={inputSetUpdateResponseHandler}
      menuOpen={menuOpen}
      handleMenu={handleMenu}
      onBranchChange={branchChangeHandler}
      handleReloadFromCache={handleReloadFromCache}
      openDiffModal={openDiffModal}
      isFormDirty={isFormDirty}
      onCancel={onCancel}
      isSaveEnabled={isSaveEnabled}
      formikRef={formikRef}
    >
      {child()}
    </InputSetFormWrapper>
  )
}

export interface InputSetFormWrapperProps {
  isEdit: boolean
  children: React.ReactNode
  selectedView: SelectedView
  loading: boolean
  handleModeSwitch(mode: SelectedView): void
  inputSet: InputSetDTO
  pipeline: ResponsePMSPipelineResponseDTO | null
  isGitSyncEnabled?: boolean
  disableVisualView: boolean
  inputSetUpdateResponseHandler?: (responseData: InputSetResponse) => void
  menuOpen: boolean
  handleMenu: (state: boolean) => void
  onBranchChange?: (branch?: string) => void
  handleReloadFromCache?: (loadFromCache?: boolean) => void
  openDiffModal: any
  isFormDirty: boolean
  onCancel?: () => void
  isSaveEnabled?: boolean
  formikRef: React.MutableRefObject<FormikProps<InputSetDTO & GitContextProps & StoreMetadata> | undefined>
}

export function InputSetFormWrapper(props: InputSetFormWrapperProps): React.ReactElement {
  const {
    isEdit,
    children,
    selectedView,
    handleModeSwitch,
    loading,
    inputSet,
    pipeline,
    isGitSyncEnabled,
    disableVisualView,
    inputSetUpdateResponseHandler,
    menuOpen,
    formikRef,
    handleMenu,
    onBranchChange,
    handleReloadFromCache = noop,
    onCancel,
    isFormDirty = false
  } = props

  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { connectorRef, repoIdentifier, repoName, branch, storeType } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams()
  const inputCachedCopyRef = React.useRef<EntityCachedCopyHandle | null>(null)

  function showReloadFromGitoption(): boolean {
    return Boolean(inputSet?.storeType === StoreType.REMOTE)
  }

  function handleReloadFromGitClick(): void {
    inputCachedCopyRef.current?.showConfirmationModal()
  }

  const [hasEditPermission] = usePermission(
    {
      resourceScope: {
        projectIdentifier,
        orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const inputSetStoreType = isGitSyncEnabled ? undefined : inputSet.storeType

  const isEditable =
    hasEditPermission && (isGitSyncEnabled ? true : !hasStoreTypeMismatch(storeType, inputSetStoreType, isEdit))

  return (
    <React.Fragment>
      <GitSyncStoreProvider>
        <PageHeader
          className={css.pageHeaderStyles}
          title={
            <Layout.Horizontal width="42%">
              <Text
                lineClamp={1}
                color={Color.GREY_800}
                font={{ weight: 'bold', variation: FontVariation.H4 }}
                margin={{ right: 'medium' }}
              >
                {isEdit
                  ? getString('inputSets.editTitle', { name: inputSet.name })
                  : getString('inputSets.newInputSetLabel')}
              </Text>
              {isGitSyncEnabled && isEdit && (
                <GitPopover
                  data={defaultTo(inputSet.gitDetails, {})}
                  iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
                />
              )}
              {isEdit && inputSet?.storeType === StoreType.REMOTE && (
                <Container className={cx(css.gitRemoteDetails, inputSet?.cacheResponse ? '' : css.noCacheDetails)}>
                  <GitRemoteDetails
                    connectorRef={inputSet?.connectorRef}
                    repoName={inputSet?.gitDetails?.repoName}
                    branch={inputSet?.gitDetails?.branch}
                    flags={{ borderless: true, showRepo: false, normalInputStyle: true }}
                    onBranchChange={item => {
                      flushSync(() => {
                        updateQueryParams({ inputSetBranch: item?.branch })
                      })
                      onBranchChange?.(item?.branch)
                    }}
                  />

                  {!loading && (
                    <EntityCachedCopy
                      ref={inputCachedCopyRef}
                      reloadContent={getString('inputSets.inputSetLabel')}
                      cacheResponse={inputSet?.cacheResponse}
                      reloadFromCache={handleReloadFromCache}
                    />
                  )}
                </Container>
              )}
              <div className={css.optionBtns}>
                <VisualYamlToggle
                  selectedView={selectedView}
                  onChange={nextMode => {
                    handleModeSwitch(nextMode)
                  }}
                  disableToggle={disableVisualView}
                  disableToggleReasonIcon={'danger-icon'}
                  showDisableToggleReason={!hasStoreTypeMismatch(storeType, inputSet?.storeType, isEdit)}
                />
              </div>

              <div className={css.reconcileMenu}>
                {isFormDirty ? (
                  <>
                    <Button
                      variation={ButtonVariation.LINK}
                      padding={'small'}
                      className={css.unsavedChanges}
                      onClick={props.openDiffModal}
                    >
                      {getString('unsavedChanges')}
                    </Button>
                  </>
                ) : null}
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  disabled={!isEditable}
                  text={getString('save')}
                  onClick={async e => {
                    e.preventDefault()
                    formikRef?.current?.submitForm()
                  }}
                />
                <Button
                  variation={ButtonVariation.TERTIARY}
                  onClick={onCancel || history.goBack}
                  text={getString('cancel')}
                  style={{ marginLeft: '10px' }}
                />

                <Popover
                  className={cx(Classes.DARK)}
                  position={Position.LEFT}
                  isOpen={menuOpen}
                  onInteraction={nextOpenState => {
                    handleMenu(nextOpenState)
                  }}
                >
                  <Button
                    variation={ButtonVariation.ICON}
                    icon="Options"
                    aria-label="input set menu actions"
                    onClick={() => handleMenu(true)}
                  />
                  <Menu style={{ backgroundColor: 'unset' }}>
                    <OutOfSyncErrorStrip
                      inputSet={inputSet}
                      pipelineGitDetails={get(pipeline, 'data.gitDetails')}
                      fromInputSetForm
                      inputSetUpdateResponseHandler={inputSetUpdateResponseHandler}
                      closeReconcileMenu={() => handleMenu(false)}
                    />

                    {showReloadFromGitoption() ? (
                      <RbacMenuItem
                        icon="repeat"
                        text={getString('common.reloadFromGit')}
                        onClick={handleReloadFromGitClick}
                        permission={{
                          resourceScope: {
                            accountIdentifier: accountId,
                            orgIdentifier,
                            projectIdentifier
                          },
                          resource: {
                            resourceType: ResourceType.PIPELINE,
                            resourceIdentifier: inputSet?.identifier
                          },
                          permission: PermissionIdentifier.VIEW_PIPELINE
                        }}
                      />
                    ) : null}
                  </Menu>
                </Popover>
              </div>
            </Layout.Horizontal>
          }
          breadcrumbs={
            <NGBreadcrumbs
              links={[
                {
                  url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
                  label: getString('pipelines')
                },
                {
                  url: routes.toInputSetList({
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    pipelineIdentifier,
                    module,
                    connectorRef,
                    repoIdentifier: isGitSyncEnabled ? pipeline?.data?.gitDetails?.repoIdentifier : repoIdentifier,
                    repoName,
                    branch: isGitSyncEnabled ? pipeline?.data?.gitDetails?.branch : branch,
                    storeType
                  }),
                  label: defaultTo(parse<Pipeline>(defaultTo(pipeline?.data?.yamlPipeline, ''))?.pipeline.name, '')
                }
              ]}
            />
          }
        />
      </GitSyncStoreProvider>
      <PageBody loading={loading}>{children}</PageBody>
    </React.Fragment>
  )
}

export function EnhancedInputSetForm(props: InputSetFormProps): React.ReactElement {
  return (
    <NestedAccordionProvider>
      <InputSetForm {...props} />
    </NestedAccordionProvider>
  )
}
