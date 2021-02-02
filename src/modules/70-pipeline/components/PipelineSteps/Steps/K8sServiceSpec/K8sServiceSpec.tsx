import React from 'react'
import get from 'lodash-es/get'
import isEmpty from 'lodash-es/isEmpty'
import set from 'lodash-es/set'
import parseInt from 'lodash-es/parseInt'
import produce from 'immer'
import {
  IconName,
  Tabs,
  Tab,
  Layout,
  Text,
  Color,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  Icon,
  NestedAccordionPanel,
  SelectOption
} from '@wings-software/uicore'
import { parse } from 'yaml'
import { useParams } from 'react-router-dom'
import { FormGroup, Tooltip, Menu } from '@blueprintjs/core'
import memoize from 'lodash-es/memoize'
import { useGetPipeline } from 'services/pipeline-ng'
import type { PipelineType, InputSetPathProps } from '@common/interfaces/RouteInterfaces'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { StepViewType } from '@pipeline/exports'
import {
  ServiceSpec,
  NgPipeline,
  ConnectorInfoDTO,
  useGetBuildDetailsForDocker,
  useGetBuildDetailsForGcr
} from 'services/cd-ng'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { useStrings, UseStringsReturn, String } from 'framework/exports'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'

import { StepType } from '../../PipelineStepInterface'
import type { CustomVariableInputSetExtraProps } from '../CustomVariables/CustomVariableInputSet'
import { K8sServiceSpecVariablesForm, K8sServiceSpecVariablesFormProps } from './K8sServiceSpecVariablesForm'

import css from './K8sServiceSpec.module.scss'
export const ARTIFACT_TYPE_TO_CONNECTOR_MAP: { [key: string]: string } = {
  Dockerhub: 'DockerRegistry',
  Gcr: 'Gcp'
}
export const getNonRuntimeFields = (spec: { [key: string]: any } = {}, template: { [key: string]: any }) => {
  const fields: { [key: string]: any } = {}

  Object.entries(spec).forEach(([key]): void => {
    if (getMultiTypeFromValue(template?.[key]) !== MultiTypeInputType.RUNTIME) {
      fields[key] = spec[key]
    }
  })
  return JSON.stringify(fields, null, 2)
}
export interface LastQueryData {
  path?: string
  imagePath?: string
  connectorRef?: string
  connectorType?: string
  registryHostname?: string
}
interface KubernetesServiceInputFormProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  factory?: AbstractStepFactory
  path?: string
}

const setupMode = {
  PROPAGATE: 'PROPAGATE',
  DIFFERENT: 'DIFFRENT'
}
const KubernetesServiceSpecEditable: React.FC<KubernetesServiceInputFormProps> = ({
  initialValues: { stageIndex = 0, setupModeType, handleTabChange },
  factory
}) => {
  const { getString } = useStrings()
  return (
    <Tabs id="serviceSpecifications" onChange={handleTabChange}>
      <Tab
        id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
        title={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
        panel={
          <ArtifactsSelection
            isForOverrideSets={false}
            isForPredefinedSets={stageIndex > 0 && setupModeType === setupMode.PROPAGATE}
          />
        }
      />
      <Tab
        id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
        title={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
        panel={
          <ManifestSelection
            isForOverrideSets={false}
            isForPredefinedSets={stageIndex > 0 && setupModeType === setupMode.PROPAGATE}
          />
        }
      />
      <Tab
        id={getString('variablesText')}
        title={getString('variablesText')}
        panel={
          <WorkflowVariables
            factory={factory as any}
            isForOverrideSets={false}
            isForPredefinedSets={stageIndex > 0 && setupModeType === setupMode.PROPAGATE}
          />
        }
      />
    </Tabs>
  )
}

const KubernetesServiceSpecInputForm: React.FC<KubernetesServiceInputFormProps> = ({
  template,
  path,
  factory,
  initialValues,
  onUpdate
}) => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const [pipeline, setPipeline] = React.useState<NgPipeline>()
  const [tagListMap, setTagListMap] = React.useState<{ [key: string]: {}[] | {} }>({ sidecars: [], primary: {} })
  const [lastQueryData, setLastQueryData] = React.useState<LastQueryData>({})
  const { data: pipelineResponse } = useGetPipeline({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const { data: dockerdata, loading: dockerLoading, refetch: refetchDockerBuildData } = useGetBuildDetailsForDocker({
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: lastQueryData.connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  const { data: gcrdata, loading: gcrLoading, refetch: refetchGcrBuildData } = useGetBuildDetailsForGcr({
    queryParams: {
      imagePath: lastQueryData.imagePath || '',
      connectorRef: lastQueryData.connectorRef || '',
      registryHostname: lastQueryData.registryHostname || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })
  React.useEffect(() => {
    if (pipelineResponse?.data?.yamlPipeline) {
      setPipeline(parse(pipelineResponse?.data?.yamlPipeline))
    }
  }, [pipelineResponse?.data?.yamlPipeline])
  React.useEffect(() => {
    if (Array.isArray(dockerdata?.data?.buildDetailsList)) {
      let tagList: any[] = dockerdata?.data?.buildDetailsList as []
      tagList = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
      setTagListMap(
        produce(tagListMap, draft => {
          set(draft, `${lastQueryData.path}.tags`, tagList)
        })
      )
    } else if (Array.isArray(gcrdata?.data?.buildDetailsList)) {
      let tagList: any[] = gcrdata?.data?.buildDetailsList as []
      tagList = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
      setTagListMap(
        produce(tagListMap, draft => {
          set(draft, `${lastQueryData.path}.tags`, tagList)
        })
      )
    }
  }, [dockerdata, gcrdata])
  React.useEffect(() => {
    if (lastQueryData.connectorRef) {
      lastQueryData.connectorType === 'Dockerhub' ? refetchDockerBuildData() : refetchGcrBuildData()
    }
  }, [lastQueryData])
  const getSelectItems = (tagsPath: string): SelectOption[] => {
    return get(tagListMap, `${tagsPath}.tags`, []) as SelectOption[]
  }

  const fetchTags = ({
    path: tagsPath = '',
    imagePath = '',
    connectorRef = '',
    connectorType = '',
    registryHostname
  }: LastQueryData) => {
    if (connectorType === 'Dockerhub') {
      if (
        imagePath?.length &&
        connectorRef?.length &&
        (lastQueryData?.imagePath !== imagePath ||
          lastQueryData?.connectorRef !== connectorRef ||
          lastQueryData.path !== tagsPath)
      ) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, registryHostname })
      }
    } else {
      if (
        imagePath?.length &&
        connectorRef?.length &&
        registryHostname?.length &&
        (lastQueryData?.imagePath !== imagePath ||
          lastQueryData?.connectorRef !== connectorRef ||
          lastQueryData?.registryHostname !== registryHostname ||
          lastQueryData.path !== tagsPath)
      ) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, registryHostname })
      }
    }
  }
  const stageIndex = parseInt(get(get(path?.match(/stages\[\d\]/g), '[0]', '').match(/\d/), '[0]', ''))
  const stageIdentifier = get(pipeline, `pipeline.stages[${stageIndex}].stage.identifier`, '')
  const artifacts = get(
    pipeline,
    `pipeline.stages[${stageIndex}].stage.spec.serviceConfig.serviceDefinition.spec.artifacts`,
    {}
  )
  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={dockerLoading || gcrLoading}
        onClick={handleClick}
      />
    </div>
  ))
  const isTagSelectionDisabled = (connectorType: string, index = -1): boolean => {
    let imagePath, connectorRef, registryHostname

    if (index > -1) {
      imagePath =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath
      connectorRef =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef
      registryHostname = artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname
    } else {
      imagePath =
        getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.imagePath
          : initialValues.artifacts?.primary?.spec?.imagePath
      connectorRef =
        getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.connectorRef
          : initialValues.artifacts?.primary?.spec?.connectorRef
    }
    if (connectorType === 'Dockerhub') {
      return !imagePath?.length || !connectorRef?.length
    } else {
      return !imagePath?.length || !connectorRef?.length || !registryHostname?.length
    }
  }
  return (
    <Layout.Vertical spacing="medium">
      <NestedAccordionPanel
        isDefaultOpen
        addDomId
        id={`Stage.${stageIdentifier}.Service.Artifacts`}
        summary={
          <div className={css.stagesTreeBulletCircle}>
            <String stringID="pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts" />
          </div>
        }
        details={
          <>
            {template?.artifacts?.primary && (
              <Text className={css.sectionHeader}>
                {getString('primaryArtifactText')}
                {!isEmpty(
                  getNonRuntimeFields(
                    get(pipeline, `${path}.artifacts.primary.spec`),
                    get(template, 'artifacts.primary.spec')
                  )
                ) && (
                  <Tooltip
                    position="top"
                    content={getNonRuntimeFields(
                      get(pipeline, `${path}.artifacts.primary.spec`),
                      get(template, 'artifacts.primary.spec')
                    )}
                  >
                    <Icon name="info" />
                  </Tooltip>
                )}
              </Text>
            )}
            {template?.artifacts?.primary && (
              <Layout.Vertical key="primary" className={css.inputWidth}>
                {getMultiTypeFromValue(get(template, `artifacts.primary.spec.connectorRef`, '')) ===
                  MultiTypeInputType.RUNTIME && (
                  <FormGroup
                    labelFor={'connectorRef'}
                    label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                  >
                    <ConnectorReferenceField
                      name={`connectorRef`}
                      label={''}
                      selected={get(initialValues, 'artifacts.primary.spec.connectorRef', '')}
                      placeholder={''}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      width={450}
                      type={ARTIFACT_TYPE_TO_CONNECTOR_MAP[artifacts?.primary?.type] as ConnectorInfoDTO['type']}
                      onChange={(record, scope) => {
                        const connectorRef =
                          scope === Scope.ORG || scope === Scope.ACCOUNT
                            ? `${scope}.${record?.identifier}`
                            : record?.identifier
                        set(initialValues, 'artifacts.primary.spec.connectorRef', connectorRef)
                        onUpdate?.({
                          ...initialValues
                        })
                      }}
                    />
                  </FormGroup>
                )}
                {getMultiTypeFromValue(get(template, `artifacts.primary.spec.imagePath`, '')) ===
                  MultiTypeInputType.RUNTIME && (
                  <FormGroup labelFor="imagePath" label={getString('pipelineSteps.deploy.inputSet.imagePath')}>
                    <FormInput.Text style={{ width: 400 }} name={`${path}.artifacts.primary.spec.imagePath`} />
                  </FormGroup>
                )}
                {getMultiTypeFromValue(artifacts?.primary?.spec?.tag) === MultiTypeInputType.RUNTIME && (
                  <div
                    onClick={() => {
                      const imagePath =
                        getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
                          ? artifacts?.primary?.spec?.imagePath
                          : initialValues.artifacts?.primary?.spec?.imagePath
                      const connectorRef =
                        getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
                          ? artifacts?.primary?.spec?.connectorRef
                          : initialValues.artifacts?.primary?.spec?.connectorRef
                      const tagsPath = `primary`
                      !isTagSelectionDisabled(artifacts?.primary?.type) &&
                        fetchTags({
                          path: tagsPath,
                          imagePath,
                          connectorRef,
                          connectorType: artifacts?.primary?.type,
                          registryHostname: artifacts?.primary?.spec?.registryHostname
                        })
                    }}
                  >
                    <FormInput.Select
                      disabled={isTagSelectionDisabled(artifacts?.primary?.type)}
                      items={
                        dockerLoading || gcrLoading
                          ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                          : getSelectItems('primary')
                      }
                      selectProps={{
                        defaultSelectedItem: initialValues?.artifacts?.primary?.spec?.tag
                          ? {
                              label: initialValues?.artifacts?.primary?.spec?.tag,
                              value: initialValues?.artifacts?.primary?.spec?.tag
                            }
                          : undefined,
                        addClearBtn: true,
                        noResults: (
                          <span className={css.padSmall}>{getString('pipelineSteps.deploy.errors.notags')}</span>
                        ),
                        itemRenderer: itemRenderer,
                        allowCreatingNewItems: true
                      }}
                      name={`${path}.artifacts.primary.spec.tag`}
                    />
                  </div>
                )}
                {getMultiTypeFromValue(artifacts?.primary?.spec?.tagRegex) === MultiTypeInputType.RUNTIME && (
                  <FormInput.Text label={getString('tagRegex')} name={`${path}.artifacts.primary.spec.tagRegex`} />
                )}
              </Layout.Vertical>
            )}

            {template?.artifacts?.sidecars?.length && (
              <Text className={css.sectionHeader}>{getString('sidecarArtifactText')}</Text>
            )}
            {template?.artifacts?.sidecars?.map(
              (
                {
                  sidecar: {
                    identifier,
                    spec: { connectorRef, imagePath }
                  }
                }: any,
                index: number
              ) => {
                const currentSidecarSpec = initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec
                return (
                  <Layout.Vertical key={identifier} className={css.inputWidth}>
                    <Text className={css.subSectonHeader}>
                      {identifier}
                      {!isEmpty(
                        getNonRuntimeFields(
                          get(pipeline, `${path}.artifacts.sidecars[${index}].sidecar.spec`),
                          get(template, 'artifacts.primary.spec')
                        )
                      ) && (
                        <Tooltip
                          position="top"
                          content={getNonRuntimeFields(
                            get(pipeline, `${path}.artifacts.sidecars[${index}].sidecar.spec`),
                            get(template, `artifacts.sidecars[${index}].sidecar.spec`)
                          )}
                        >
                          <Icon name="info" />
                        </Tooltip>
                      )}
                    </Text>
                    {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                      <FormGroup
                        labelFor={'connectorRef'}
                        label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                      >
                        <ConnectorReferenceField
                          name={`${path}.artifacts.sidecars[${index}].sidecar.spec.connectorRef`}
                          selected={get(initialValues, `artifacts.sidecars[${index}].sidecar.spec.connectorRef`, '')}
                          label={''}
                          placeholder={''}
                          accountIdentifier={accountId}
                          projectIdentifier={projectIdentifier}
                          orgIdentifier={orgIdentifier}
                          width={450}
                          type={
                            ARTIFACT_TYPE_TO_CONNECTOR_MAP[
                              artifacts?.sidecars?.[index]?.sidecar?.type
                            ] as ConnectorInfoDTO['type']
                          }
                          onChange={(record, scope) => {
                            const connectorRefSelected =
                              scope === Scope.ORG || scope === Scope.ACCOUNT
                                ? `${scope}.${record?.identifier}`
                                : record?.identifier
                            set(
                              initialValues,
                              `artifacts.sidecars[${index}].sidecar.spec.connectorRef`,
                              connectorRefSelected
                            )
                            onUpdate?.({
                              ...initialValues
                            })
                          }}
                        />
                      </FormGroup>
                    )}
                    {getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME && (
                      <FormGroup labelFor="imagePath" label={getString('pipelineSteps.deploy.inputSet.imagePath')}>
                        <FormInput.Text
                          style={{ width: 450 }}
                          name={`${path}.artifacts.sidecars[${index}].sidecar.spec.imagePath`}
                        />
                      </FormGroup>
                    )}
                    {getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.tag) ===
                      MultiTypeInputType.RUNTIME && (
                      <div
                        onClick={() => {
                          const imagePathCurrent =
                            getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath) !==
                            MultiTypeInputType.RUNTIME
                              ? artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath
                              : currentSidecarSpec?.imagePath
                          const connectorRefCurrent =
                            getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef) !==
                            MultiTypeInputType.RUNTIME
                              ? artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef
                              : currentSidecarSpec?.connectorRef
                          const tagsPath = `sidecars[${index}]`
                          !isTagSelectionDisabled(artifacts?.sidecars?.[index]?.sidecar?.type, index) &&
                            fetchTags({
                              path: tagsPath,
                              imagePath: imagePathCurrent,
                              connectorRef: connectorRefCurrent,
                              connectorType: artifacts?.sidecars?.[index]?.sidecar?.type,
                              registryHostname: artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname
                            })
                        }}
                      >
                        <FormInput.Select
                          disabled={isTagSelectionDisabled(artifacts?.sidecars?.[index]?.sidecar?.type, index)}
                          items={
                            dockerLoading || gcrLoading
                              ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                              : getSelectItems(`sidecars[${index}]`)
                          }
                          selectProps={{
                            addClearBtn: true,
                            defaultSelectedItem: currentSidecarSpec?.tag
                              ? { label: currentSidecarSpec.tag, value: currentSidecarSpec?.tag }
                              : undefined,
                            noResults: (
                              <span className={css.padSmall}>{getString('pipelineSteps.deploy.errors.notags')}</span>
                            ),
                            itemRenderer: itemRenderer,
                            allowCreatingNewItems: true
                          }}
                          name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`}
                        />
                      </div>
                    )}
                    {getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.tagRegex) ===
                      MultiTypeInputType.RUNTIME && (
                      <FormInput.Text
                        label={getString('tagRegex')}
                        name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.tagRegex`}
                      />
                    )}
                  </Layout.Vertical>
                )
              }
            )}
          </>
        }
      />
      <NestedAccordionPanel
        isDefaultOpen
        addDomId
        id={`Stage.${stageIdentifier}.Service.Manifests`}
        summary={
          <div className={css.stagesTreeBulletCircle}>
            <String stringID="pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests" />
          </div>
        }
        details={
          <>
            {template?.manifests?.length && (
              <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15, fontWeight: 'bold' }}>
                {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
              </Text>
            )}
            {template?.manifests?.map?.(
              (
                {
                  manifest: {
                    identifier,
                    spec: {
                      store: {
                        spec: { branch, connectorRef }
                      }
                    }
                  }
                }: any,
                index: number
              ) => {
                return (
                  <Layout.Vertical key={identifier}>
                    <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15 }}>{identifier}</Text>
                    {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                      <FormGroup
                        labelFor={'connectorRef'}
                        label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                      >
                        <FormMultiTypeConnectorField
                          name={`${path}.manifests[${index}].manifest.spec.store.spec.connectorRef`}
                          label={''}
                          placeholder={''}
                          accountIdentifier={accountId}
                          projectIdentifier={projectIdentifier}
                          orgIdentifier={orgIdentifier}
                          width={450}
                          isNewConnectorLabelVisible={false}
                          category={'CODE_REPO'}
                          enableConfigureOptions={false}
                        />
                      </FormGroup>
                    )}
                    {getMultiTypeFromValue(branch) === MultiTypeInputType.RUNTIME && (
                      <FormGroup labelFor={'branch'} label={getString('pipelineSteps.deploy.inputSet.branch')}>
                        <FormInput.Text
                          style={{ width: 450 }}
                          name={`${path}.manifests[${index}].manifest.spec.store.spec.branch`}
                        />
                      </FormGroup>
                    )}
                  </Layout.Vertical>
                )
              }
            )}
          </>
        }
      />
      <NestedAccordionPanel
        isDefaultOpen
        addDomId
        id={`Stage.${stageIdentifier}.Service.Variables`}
        summary={
          <div className={css.stagesTreeBulletCircle}>
            <String stringID="variablesText" />
          </div>
        }
        details={
          <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
            factory={(factory as unknown) as AbstractStepFactory}
            initialValues={{
              variables: initialValues.variables || [],
              canAddVariable: true
            }}
            type={StepType.CustomVariable}
            stepViewType={StepViewType.InputSet}
            onUpdate={({ variables }: CustomVariablesData) => {
              onUpdate?.({
                ...pipeline,
                variables: variables as any
              })
            }}
            customStepProps={{
              template: { variables: template?.variables || [] },
              path
            }}
          />
        }
      />
    </Layout.Vertical>
  )
}

export interface K8SDirectServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
}

export class KubernetesServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.K8sServiceSpec
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'service-kubernetes'
  protected stepName = 'Deplyment Service'
  protected stepPaletteVisible = false
  protected _hasStepVariables = true

  validateInputSet(
    data: K8SDirectServiceStep,
    template?: ServiceSpec,
    getString?: UseStringsReturn['getString']
  ): object {
    const errors: K8SDirectServiceStep = {}
    if (
      isEmpty(data?.artifacts?.primary?.spec?.connectorRef) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.connectorRef', getString?.('fieldRequired', { field: 'ConnectorRef' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.imagePath) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.imagePath) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.imagePath', getString?.('fieldRequired', { field: 'Image Path' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.tag) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tag) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.tag', getString?.('fieldRequired', { field: 'Tag' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.tagRegex) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tagRegex) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.tagRegex', getString?.('fieldRequired', { field: 'Tag Regex' }))
    }
    data?.artifacts?.sidecars?.forEach((sidecar, index) => {
      const currentSidecarTemplate = get(template, `artifacts.sidecars[${index}].sidecar.spec`, '')
      if (
        isEmpty(sidecar?.sidecar?.spec?.connectorRef) &&
        getMultiTypeFromValue(currentSidecarTemplate?.connectorRef) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.connectorRef`,
          getString?.('fieldRequired', { field: 'Artifact Server' })
        )
      }
      if (
        isEmpty(sidecar?.sidecar?.spec?.imagePath) &&
        getMultiTypeFromValue(currentSidecarTemplate?.imagePath) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.imagePath`,
          getString?.('fieldRequired', { field: 'Image Path' })
        )
      }

      if (
        isEmpty(sidecar?.sidecar?.spec?.tag) &&
        getMultiTypeFromValue(currentSidecarTemplate?.tag) === MultiTypeInputType.RUNTIME
      ) {
        set(errors, `artifacts.sidecars[${index}].sidecar.spec.tag`, getString?.('fieldRequired', { field: 'Tag' }))
      }
      if (
        isEmpty(sidecar?.sidecar?.spec?.tagRegex) &&
        getMultiTypeFromValue(currentSidecarTemplate?.tagRegex) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.tagRegex`,
          getString?.('fieldRequired', { field: 'Tag Regex' })
        )
      }
    })

    data?.manifests?.forEach((manifest, index) => {
      const currentManifestTemplate = get(template, `manifests[${index}].manifest.spec.store.spec`, '')
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.connectorRef) &&
        getMultiTypeFromValue(currentManifestTemplate?.connectorRef) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.connectorRef`,
          getString?.('fieldRequired', { field: 'Artifact Server' })
        )
      }
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.branch) &&
        getMultiTypeFromValue(currentManifestTemplate?.branch) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.branch`,
          getString?.('fieldRequired', { field: 'Branch' })
        )
      }
    })

    return errors
  }

  renderStep(props: StepProps<K8SDirectServiceStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, factory, customStepProps } = props

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sServiceSpecVariablesForm
          {...(customStepProps as K8sServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          stepsFactory={factory}
          onUpdate={onUpdate}
        />
      )
    }

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <KubernetesServiceSpecInputForm
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          path={inputSetData?.path}
          factory={factory}
        />
      )
    }

    return (
      <KubernetesServiceSpecEditable
        factory={factory}
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        path={inputSetData?.path}
      />
    )
  }
}
