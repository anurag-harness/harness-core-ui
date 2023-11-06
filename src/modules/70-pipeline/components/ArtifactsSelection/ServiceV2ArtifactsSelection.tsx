/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { get, set, defaultTo, isEmpty, merge, unset, some, isUndefined } from 'lodash-es'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import { RUNTIME_INPUT_VALUE, shouldShowError, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import type { IconProps } from '@harness/icons'

import {
  ArtifactConfig,
  ArtifactListConfig,
  ArtifactSource,
  PageConnectorResponse,
  PrimaryArtifact,
  SidecarArtifact,
  SidecarArtifactWrapper,
  useGetConnectorListV2
} from 'services/cd-ng'
import type { TemplateStepNode, TemplateLinkConfig } from 'services/pipeline-ng'
import { getTemplateInputSetYamlPromise } from 'services/template-ng'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { GitQueryParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { ArtifactActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { parse } from '@common/utils/YamlHelperMethods'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@platform/connectors/constants'
import {
  ArtifactConnectorStepDataToLastStep,
  useArtifactSelectionLastSteps
} from '@pipeline/components/ArtifactsSelection/hooks/useArtifactSelectionLastSteps'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ArtifactConfigDrawer } from '@pipeline/components/ArtifactsSelection/ArtifactConfigDrawer/ArtifactConfigDrawer'
import type {
  StepOrStepGroupOrTemplateStepData,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { createTemplate } from '@pipeline/utils/templateUtils'
import type { StepFormikRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useGetLastStepConnectorValue } from '@pipeline/hooks/useGetLastStepConnectorValue'
// eslint-disable-next-line no-restricted-imports
import { TemplateType, TemplateUsage } from '@templates-library/utils/templatesUtils'
import { isSshOrWinrmDeploymentType } from '@pipeline/utils/stageHelpers'
import ArtifactWizard from './ArtifactWizard/ArtifactWizard'
import ArtifactListView from './ArtifactListView/ArtifactListView'
import type {
  AmazonS3InitialValuesType,
  ArtifactsSelectionProps,
  ArtifactType,
  ConnectorRefLabelType,
  ImagePathProps,
  ImagePathTypes,
  InitialArtifactDataType,
  JenkinsArtifactType,
  GoogleArtifactRegistryInitialValuesType,
  CustomArtifactSource,
  GithubPackageRegistryInitialValuesType,
  Nexus2InitialValuesType,
  AzureArtifactsInitialValues,
  GoogleCloudStorageInitialValuesType,
  GoogleCloudSourceRepositoriesInitialValuesType
} from './ArtifactInterface'
import {
  allowedArtifactTypes,
  ArtifactIconByType,
  ArtifactTitleIdByType,
  ENABLED_ARTIFACT_TYPES,
  getInitialSelectedArtifactValue,
  isSidecarAllowed,
  ModalViewFor,
  showArtifactStoreStepDirectly
} from './ArtifactHelper'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import { showConnectorStep } from './ArtifactUtils'
import css from './ArtifactsSelection.module.scss'

const checkDuplicateStep = (
  formikRef: any,
  artifactsList: ArtifactSource[] | SidecarArtifactWrapper[] | undefined,
  artifactContext: ModalViewFor,
  getString: UseStringsReturn['getString'],
  artifactIndex: number
): boolean => {
  const values = formikRef.current?.getValues() as Values
  if (values && formikRef.current?.setFieldError) {
    const isDuplicate = some(artifactsList, (artifactData, index: number) => {
      const artifactIdentifier =
        artifactContext === ModalViewFor.PRIMARY
          ? (artifactData as ArtifactSource).identifier
          : (artifactData as SidecarArtifactWrapper)?.sidecar?.identifier

      return artifactIdentifier === values.identifier && index !== artifactIndex
    })

    if (isDuplicate) {
      formikRef.current?.setFieldError('identifier', getString('pipeline.uniqueIdentifier'))
      return true
    }
  }
  return false
}

const getUpdatedTemplate = (
  artifactSourceConfigNodeTemplate?: TemplateLinkConfig,
  formikValues?: TemplateLinkConfig
) => {
  const latestTemplateInputs = get(formikValues, 'templateInputs.artifacts.primary')
  return {
    templateRef: artifactSourceConfigNodeTemplate?.templateRef,
    versionLabel: artifactSourceConfigNodeTemplate?.versionLabel,
    templateInputs: !isEmpty(latestTemplateInputs) ? latestTemplateInputs : undefined
  }
}

export default function ServiceV2ArtifactsSelection({
  deploymentType,
  readonly,
  availableArtifactTypes
}: ArtifactsSelectionProps): React.ReactElement | null {
  const {
    state: {
      selectionState: { selectedStageId },
      gitDetails,
      storeMetadata
    },
    getStageFromPipeline,
    updateStage,
    allowableTypes
  } = usePipelineContext()

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactType | null>(
    getInitialSelectedArtifactValue(deploymentType, availableArtifactTypes)
  )
  const [connectorView, setConnectorView] = useState(false)
  const [artifactContext, setArtifactContext] = useState(ModalViewFor.PRIMARY)
  const [artifactIndex, setEditIndex] = useState(0)
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = useState<PageConnectorResponse | undefined>()
  const { getTemplate } = useTemplateSelector()
  const [artifactSourceConfigNode, setArtifactSourceConfigNode] = React.useState<TemplateStepNode>()
  const [isArtifactSourceDrawerOpen, setIsArtifactSourceDrawerOpen] = React.useState(false)
  const formikRef = React.useRef<StepFormikRef | null>(null)

  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { expressions } = useVariablesExpression()

  const { CDS_GITHUB_PACKAGES, CDS_SERVERLESS_V2 } = useFeatureFlags()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const [artifactTypes, setArtifactTypes] = useState<ArtifactType[]>(allowedArtifactTypes[deploymentType])

  useEffect(() => {
    if (!CDS_GITHUB_PACKAGES && isSshOrWinrmDeploymentType(deploymentType)) {
      setArtifactTypes(
        artifactTypes.filter((artifact: string) => artifact !== ENABLED_ARTIFACT_TYPES.GithubPackageRegistry)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentType])

  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const defaultQueryParams = {
    pageIndex: 0,
    pageSize: 10,
    searchTerm: '',
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    includeAllConnectorsAvailableAtScope: true
  }
  const { mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const artifacts = useMemo((): ArtifactListConfig => {
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  const artifactsList = useMemo(() => {
    if (!isEmpty(artifacts)) {
      if (artifactContext === ModalViewFor.PRIMARY) {
        return defaultTo(artifacts.primary?.sources, [])
      }
      return defaultTo(artifacts.sidecars, [])
    }
    return []
  }, [artifactContext, artifacts, artifacts?.primary, artifacts?.sidecars, stage])

  const [isArtifactEditMode, setIsArtifactEditMode] = useState(artifactIndex < artifactsList.length)

  useEffect(() => {
    setIsArtifactEditMode(artifactIndex < artifactsList.length)
  }, [artifactsList, artifactsList.length, artifactIndex])

  const getArtifactsPath = useCallback((type: ModalViewFor) => {
    if (type === ModalViewFor.PRIMARY) {
      return 'primary.sources'
    }
    return 'sidecars'
  }, [])

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    title: '',
    style: { width: 1100, height: 550, borderLeft: 'none', paddingBottom: 0, position: 'relative' }
  }

  const getPrimaryConnectorList = useCallback((): Array<{ scope: Scope; identifier: string }> => {
    return defaultTo(
      artifacts?.primary?.sources?.map((data: ArtifactSource) => ({
        scope: getScopeFromValue(data?.spec?.connectorRef),
        identifier: getIdentifierFromValue(data?.spec?.connectorRef)
      })),
      []
    )
  }, [artifacts?.primary?.sources])

  const getSidecarConnectorList = useCallback((): Array<{ scope: Scope; identifier: string }> => {
    return defaultTo(
      artifacts?.sidecars?.map((data: SidecarArtifactWrapper) => ({
        scope: getScopeFromValue(data?.sidecar?.spec?.connectorRef),
        identifier: getIdentifierFromValue(data?.sidecar?.spec?.connectorRef)
      })),
      []
    )
  }, [artifacts?.sidecars])

  const refetchConnectorList = useCallback(async (): Promise<void> => {
    try {
      const primaryConnectorList = getPrimaryConnectorList()
      const sidecarConnectorList = getSidecarConnectorList()
      const connectorIdentifiers = [...primaryConnectorList, ...sidecarConnectorList].map(item => item.identifier)
      if (connectorIdentifiers.length) {
        const response = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
        if (response?.data) {
          setFetchedConnectorResponse(response?.data)
        }
      }
    } catch (e) {
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e))
      }
    }
  }, [fetchConnectors, getPrimaryConnectorList, getRBACErrorMessage, getSidecarConnectorList, showError])

  useDeepCompareEffect(() => {
    refetchConnectorList()
  }, [stage])

  const setTelemetryEvent = useCallback((): void => {
    const isCreateMode = artifactIndex === artifactsList?.length

    let telemetryEventName
    if (isCreateMode) {
      telemetryEventName =
        artifactContext === ModalViewFor.PRIMARY
          ? ArtifactActions.SavePrimaryArtifactOnPipelinePage
          : ArtifactActions.SaveSidecarArtifactOnPipelinePage
    } else {
      telemetryEventName =
        artifactContext === ModalViewFor.PRIMARY
          ? ArtifactActions.UpdatePrimaryArtifactOnPipelinePage
          : ArtifactActions.UpdateSidecarArtifactOnPipelinePage
    }
    trackEvent(telemetryEventName, {})
  }, [artifactIndex, artifactsList?.length, trackEvent, artifactContext])

  const setPrimaryArtifactData = useCallback(
    (artifactObj: PrimaryArtifact): void => {
      const artifactObject = get(artifacts, getArtifactsPath(artifactContext))
      if (artifactObject?.length) {
        artifactObject.splice(artifactIndex, 1, artifactObj)
      } else {
        set(artifacts, 'primary.primaryArtifactRef', RUNTIME_INPUT_VALUE)
        set(artifacts, 'primary.sources', [artifactObj])
      }
    },
    [artifactContext, artifactIndex, artifacts, getArtifactsPath]
  )

  const setSidecarArtifactData = useCallback(
    (artifactObj: PrimaryArtifact): void => {
      const artifactObject = get(artifacts, getArtifactsPath(artifactContext))
      if (artifactObject?.length) {
        artifactObject.splice(artifactIndex, 1, { sidecar: artifactObj })
      } else {
        set(artifacts, 'sidecars', [{ sidecar: artifactObj }])
      }
    },
    [artifactContext, artifactIndex, artifacts, getArtifactsPath]
  )

  const addArtifact = useCallback(
    (artifactObj: ArtifactConfig): void => {
      merge(artifactObj, { type: ENABLED_ARTIFACT_TYPES[selectedArtifact as ArtifactType] })

      if (artifactContext === ModalViewFor.PRIMARY) {
        setPrimaryArtifactData(artifactObj as ArtifactSource)
      } else {
        setSidecarArtifactData(artifactObj as SidecarArtifact)
      }
      if (stage) {
        const newStage = produce(stage, draft => {
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', artifacts)
        }).stage
        if (newStage) {
          updateStage(newStage)
        }
      }
      setTelemetryEvent()
      hideConnectorModal()
      setSelectedArtifact(null)
      refetchConnectorList()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artifactContext, artifacts, refetchConnectorList, selectedArtifact, stage,artifactIndex]
  )

  const removeArtifactObject = (type: ModalViewFor, index: number): void => {
    const artifactObject = get(artifacts, getArtifactsPath(type))
    artifactObject.splice(index, 1)

    setSelectedArtifact(null)
    if (stage) {
      const newStage = produce(stage, draft => {
        set(
          draft,
          `stage.spec.serviceConfig.serviceDefinition.spec.artifacts.${getArtifactsPath(type)}`,
          artifactObject
        )
        if (type === ModalViewFor.PRIMARY && !artifactObject.length) {
          unset(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.primaryArtifactRef')
        }
      }).stage
      if (newStage) {
        updateStage(newStage)
      }
    }
  }

  const getLastStepInitialData = useCallback((): any => {
    if (artifactContext === ModalViewFor.PRIMARY) {
      return (artifactsList as ArtifactSource[])?.[artifactIndex]
    } else {
      return (artifactsList as SidecarArtifactWrapper[])?.[artifactIndex]?.sidecar
    }
  }, [artifactContext, artifactsList, artifactIndex])

  const getArtifactInitialValues = useMemo((): InitialArtifactDataType => {
    let spec, artifactType
    if (artifactContext === ModalViewFor.PRIMARY) {
      artifactType = (artifactsList as ArtifactSource[])?.[artifactIndex]?.type
      spec = (artifactsList as ArtifactSource[])?.[artifactIndex]?.spec
    } else {
      artifactType = (artifactsList as SidecarArtifactWrapper[])?.[artifactIndex]?.sidecar?.type
      spec = (artifactsList as SidecarArtifactWrapper[])?.[artifactIndex]?.sidecar?.spec
    }

    if (!spec) {
      return {
        submittedArtifact: selectedArtifact,
        connectorId: undefined
      }
    }
    return {
      submittedArtifact: artifactType,
      connectorId: spec?.connectorRef
    }
  }, [artifactContext, artifactsList, artifactIndex, selectedArtifact])

  const initialValues = getLastStepInitialData()
  const initialConnectorRef = initialValues?.spec?.connectorRef

  const { selectedConnector } = useGetLastStepConnectorValue({
    connectorList: fetchedConnectorResponse?.content,
    initialConnectorRef,
    isEditMode: isArtifactEditMode
  })

  const addOrUpdateArtifactSourceTemplate = async (): Promise<void> => {
    await handleUseArtifactSourceTemplate(artifactContext, true)
  }

  const handleUseArtifactSourceTemplate = async (viewType: ModalViewFor, isEdit?: boolean): Promise<void> => {
    if (!isEdit) {
      setArtifactContext(viewType)
      const artifactObject = get(artifacts, getArtifactsPath(viewType))
      setEditIndex(defaultTo(artifactObject?.length, 0))
    }

    try {
      const { template } = await getTemplate({
        templateType: TemplateType.ArtifactSource,
        allowedUsages: [TemplateUsage.USE],
        filterProperties: {
          childTypes: defaultTo(allowedArtifactTypes[deploymentType], [])
        },
        gitDetails,
        storeMetadata
      })

      const templateInputYaml = await getTemplateInputSetYamlPromise({
        templateIdentifier: template.identifier as string,
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: template.orgIdentifier,
          projectIdentifier: template.projectIdentifier,
          versionLabel: template.versionLabel || ''
        },
        requestOptions: { headers: { 'Load-From-Cache': 'true' } }
      })

      const artifactSourceTemplateInputs = templateInputYaml?.data
        ? parse(templateInputYaml?.data as string)
        : undefined
      const processNode = createTemplate(
        {
          name: '',
          identifier: '',
          template: { templateInputs: artifactSourceTemplateInputs }
        } as StepOrStepGroupOrTemplateStepData,
        template
      ) as TemplateStepNode

      setArtifactSourceConfigNode(processNode)
      setIsArtifactSourceDrawerOpen(true)
    } catch (e) {
      // no update is required
    }
  }

  const addNewArtifact = (viewType: ModalViewFor): void => {
    setArtifactContext(viewType)
    setConnectorView(false)
    const artifactObject = get(artifacts, getArtifactsPath(viewType))
    setEditIndex(defaultTo(artifactObject?.length, 0))
    setSelectedArtifact(getInitialSelectedArtifactValue(deploymentType, availableArtifactTypes))
    showConnectorModal()
    refetchConnectorList()
  }

  const editArtifact = (viewType: ModalViewFor, type?: ArtifactType, index?: number): void => {
    const artifactObjList = get(artifacts, getArtifactsPath(viewType))
    const artifactDetails = !isUndefined(index) && artifactObjList[index]
    const artifactSourceTemplateNode = (
      viewType === ModalViewFor.PRIMARY ? artifactDetails : artifactDetails?.sidecar
    ) as TemplateStepNode

    setArtifactContext(viewType)
    setEditIndex(index as number)

    if (!isEmpty(artifactSourceTemplateNode?.template)) {
      setArtifactSourceConfigNode(artifactSourceTemplateNode)
      setIsArtifactSourceDrawerOpen(true)
    } else {
      setConnectorView(false)
      setSelectedArtifact(type as ArtifactType)
      showConnectorModal()
      refetchConnectorList()
    }
  }

  const handleApplyChanges = async (): Promise<void> => {
    if (checkDuplicateStep(formikRef, artifactsList, artifactContext, getString, artifactIndex)) {
      return
    }
    // form has been submitted so that errors can be populated and on the basis of that node gets updated in yaml
    await formikRef?.current?.submitForm()
    if (!isEmpty(formikRef.current?.getErrors())) {
      return
    } else {
      // update the node
      const artifactSourceConfigValues = formikRef.current?.getValues() as ArtifactSource | SidecarArtifact
      const updatedArtifactSourceConfigValues = produce(artifactSourceConfigValues, draft => {
        set(
          draft,
          'template',
          getUpdatedTemplate(artifactSourceConfigNode?.template, artifactSourceConfigValues?.template)
        )
      })
      if (artifactContext === ModalViewFor.PRIMARY) {
        setPrimaryArtifactData(updatedArtifactSourceConfigValues as ArtifactSource)
      } else {
        setSidecarArtifactData(updatedArtifactSourceConfigValues as SidecarArtifact)
      }
      if (stage) {
        const newStage = produce(stage, draft => {
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', artifacts)
        }).stage
        if (newStage) {
          updateStage(newStage)
        }
      }

      setArtifactSourceConfigNode(undefined)
      setIsArtifactSourceDrawerOpen(false)
    }
  }

  const handleCloseDrawer = (): void => {
    setIsArtifactSourceDrawerOpen(false)
  }

  const getIconProps = useMemo((): IconProps | undefined => {
    if (selectedArtifact) {
      const iconProps: IconProps = {
        name: ArtifactIconByType[selectedArtifact]
      }
      if (
        selectedArtifact === ENABLED_ARTIFACT_TYPES.DockerRegistry ||
        selectedArtifact === ENABLED_ARTIFACT_TYPES.CustomArtifact ||
        selectedArtifact === ENABLED_ARTIFACT_TYPES.Acr
      ) {
        iconProps.color = Color.WHITE
      }
      return iconProps
    }
  }, [selectedArtifact])

  const artifactLastStepProps = useMemo((): ImagePathProps<
    ImagePathTypes &
      AmazonS3InitialValuesType &
      JenkinsArtifactType &
      GoogleArtifactRegistryInitialValuesType &
      CustomArtifactSource &
      GithubPackageRegistryInitialValuesType &
      Nexus2InitialValuesType &
      AzureArtifactsInitialValues &
      GoogleCloudStorageInitialValuesType &
      GoogleCloudSourceRepositoriesInitialValuesType
  > => {
    return {
      key: getString('platform.connectors.stepFourName'),
      name: getString('platform.connectors.stepFourName'),
      context: artifactContext,
      expressions,
      allowableTypes,
      initialValues: getLastStepInitialData(),
      handleSubmit: (data: any) => {
        addArtifact(data)
      },
      artifactIdentifiers: defaultTo(
        artifactsList?.map((item: ArtifactSource | SidecarArtifactWrapper) =>
          artifactContext === ModalViewFor.PRIMARY
            ? (item as ArtifactSource).identifier
            : ((item as SidecarArtifactWrapper).sidecar?.identifier as string)
        ),
        ['']
      ),
      isReadonly: readonly,
      selectedArtifact,
      selectedDeploymentType: deploymentType,
      isMultiArtifactSource: true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    artifactContext,
    expressions,
    allowableTypes,
    getLastStepInitialData,
    artifactsList,
    selectedArtifact,
    deploymentType
  ])

  const artifactPrevStepData = useMemo((): { editArtifactModePrevStepData: ArtifactConnectorStepDataToLastStep } => {
    return {
      editArtifactModePrevStepData: {
        submittedArtifact: initialValues?.type,
        connectorId: selectedConnector
      }
    }
  }, [initialValues, selectedConnector])

  const getLabels = useMemo((): ConnectorRefLabelType => {
    return {
      firstStepName: getString('platform.connectors.specifyArtifactRepoType'),
      secondStepName: `${selectedArtifact && getString(ArtifactTitleIdByType[selectedArtifact])} ${getString(
        'repository'
      )}`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtifact])

  /******************************************************************Connector Steps************************************************************** */
  const connectorDetailStepProps = {
    name: getString('overview'),
    isEditMode,
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
  }
  const authenticationStepProps = {
    identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined
  }
  const delegateStepProps = {
    name: getString('delegate.DelegateselectionLabel'),
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }

  const connectivityStepProps = {
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true },
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }

  const ConnectorTestConnectionProps = {
    name: getString('platform.connectors.stepThreeName'),
    connectorInfo: undefined,
    isStep: true,
    isLastStep: false
  }
  /******************************************************************Connector Steps************************************************************** */

  const artifactSelectionLastSteps = useArtifactSelectionLastSteps({
    selectedArtifact,
    artifactLastStepProps,
    artifactPrevStepData,
    isArtifactEditMode,
    selectedConnector: selectedConnector
  })

  const changeArtifactType = useCallback((selectedArtifactType: ArtifactType | null): void => {
    setSelectedArtifact(selectedArtifactType)
  }, [])

  const handleConnectorViewChange = useCallback((isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }, [])

  // This function decides which step to show first when artifact wizard is opened
  const getArtifactWizardInitialStepNumber = (): number => {
    // In edit mode, show 2nd or 3rd step depending on how many steps are there in total
    if (isArtifactEditMode && showConnectorStep(selectedArtifact as ArtifactType)) {
      return 3
    }
    if (isArtifactEditMode && !showConnectorStep(selectedArtifact as ArtifactType)) {
      return 2
    }
    // For create mode, if we need to show 2nd step directly
    if (showArtifactStoreStepDirectly(selectedArtifact)) {
      return 2
    }
    return 1
  }

  const renderExistingArtifact = (): JSX.Element => {
    return (
      <ArtifactWizard
        artifactInitialValue={getArtifactInitialValues}
        iconsProps={getIconProps}
        types={availableArtifactTypes ?? artifactTypes}
        expressions={expressions}
        allowableTypes={allowableTypes}
        lastSteps={artifactSelectionLastSteps}
        labels={getLabels}
        isReadonly={readonly}
        selectedArtifact={selectedArtifact}
        changeArtifactType={changeArtifactType}
        newConnectorView={connectorView}
        newConnectorProps={{
          auth: authenticationStepProps,
          connector: connectorDetailStepProps,
          connectivity: connectivityStepProps,
          delegate: delegateStepProps,
          verify: ConnectorTestConnectionProps
        }}
        handleViewChange={handleConnectorViewChange}
        showConnectorStep={showConnectorStep(selectedArtifact as ArtifactType)}
        artifactWizardInitialStep={getArtifactWizardInitialStepNumber()}
        showArtifactSelectionStep={true}
      />
    )
  }

  const [showConnectorModal, hideConnectorModal] = useModalHook(
    () => (
      <Dialog
        onClose={() => {
          hideConnectorModal()
          setConnectorView(false)
          setIsEditMode(false)
          setSelectedArtifact(null)
        }}
        {...DIALOG_PROPS}
        className={cx(css.modal, Classes.DIALOG)}
      >
        {renderExistingArtifact()}
      </Dialog>
    ),
    [
      artifactContext,
      selectedArtifact,
      connectorView,
      artifactIndex,
      expressions,
      allowableTypes,
      isEditMode,
      isArtifactEditMode,
      artifactLastStepProps,
      renderExistingArtifact,
      artifactTypes
    ]
  )

  return (
    <>
      <ArtifactListView
        deploymentType={deploymentType}
        stage={stage}
        primaryArtifact={artifacts?.primary?.sources as ArtifactSource[]}
        sideCarArtifact={artifacts?.sidecars}
        addNewArtifact={addNewArtifact}
        handleUseArtifactSourceTemplate={handleUseArtifactSourceTemplate}
        editArtifact={editArtifact}
        removeArtifactSource={index => removeArtifactObject(ModalViewFor.PRIMARY, index)}
        removeSidecar={index => removeArtifactObject(ModalViewFor.SIDECAR, index)}
        fetchedConnectorResponse={fetchedConnectorResponse}
        accountId={accountId}
        refetchConnectors={refetchConnectorList}
        isReadonly={readonly}
        isSidecarAllowed={isSidecarAllowed(deploymentType, readonly, { CDS_SERVERLESS_V2 })}
        isMultiArtifactSource
      />
      <ArtifactConfigDrawer
        onCloseDrawer={handleCloseDrawer}
        artifactSourceConfigNode={artifactSourceConfigNode}
        isDrawerOpened={isArtifactSourceDrawerOpen}
        isNewStep={true}
        onApplyChanges={handleApplyChanges}
        addOrUpdateTemplate={addOrUpdateArtifactSourceTemplate}
        formikRef={formikRef}
        serviceIdentifier={serviceId}
      />
    </>
  )
}
