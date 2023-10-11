/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  Accordion,
  Button,
  IconName,
  Formik,
  FormikForm,
  RUNTIME_INPUT_VALUE,
  Text,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  ButtonVariation,
  VisualYamlSelectedView as SelectedView,
  Container,
  SelectOption
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { isEmpty, get, set, unset } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'

import { Classes, Dialog } from '@blueprintjs/core'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import type { MultiTypeSelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import {
  ConnectorInfoDTO,
  getConnectorPromise,
  getTestConnectionResultPromise,
  getTestGitRepoConnectionResultPromise,
  useGetConnector
} from 'services/cd-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import type { ConnectorReferenceFieldProps } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getPrCloneStrategyOptions, sslVerifyOptions } from '@pipeline/utils/constants'
import { getOptionalSubLabel } from '@pipeline/components/Volumes/Volumes'
import { ConnectionType } from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import type { PipelineType, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { Connectors } from '@platform/connectors/constants'
import { useQueryParams } from '@common/hooks'
import { useAnyEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import { isRuntimeInput } from '@pipeline/utils/CIUtils'
import { PipelineContextType, usePipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes } from '../PipelineContext/PipelineActions'
import { RightDrawer } from '../RightDrawer/RightDrawer'
import { blankspacesRegex, renderConnectorAndRepoName, validateCIForm } from './RightBarUtils'
import css from './RightBar.module.scss'

export interface CodebaseRuntimeInputsInterface {
  connectorRef?: boolean
  repoName?: boolean
}

interface CodebaseValues {
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
  depth?: string
  sslVerify?: boolean
  prCloneStrategy?: MultiTypeSelectOption
  memoryLimit?: string
  cpuLimit?: string
}

enum CodebaseStatuses {
  ZeroState = 'zeroState',
  NotConfigured = 'notConfigured',
  Valid = 'valid',
  Invalid = 'invalid',
  Validating = 'validating'
}

const codebaseIcons: Record<CodebaseStatuses, IconName> = {
  [CodebaseStatuses.ZeroState]: 'codebase-zero-state',
  [CodebaseStatuses.NotConfigured]: 'codebase-not-configured',
  [CodebaseStatuses.Valid]: 'codebase-valid',
  [CodebaseStatuses.Invalid]: 'codebase-invalid',
  [CodebaseStatuses.Validating]: 'codebase-validating'
}

declare global {
  interface WindowEventMap {
    OPEN_PIPELINE_TEMPLATE_RIGHT_DRAWER: CustomEvent
  }
}

export function RightBar(): JSX.Element {
  const {
    state: {
      pipeline,
      pipelineView,
      isLoading,
      pipelineView: {
        drawerData: { type }
      },
      isUpdated
    },
    contextType,
    isReadonly,
    view,
    updatePipeline,
    updatePipelineView
  } = usePipelineContext()
  const codebase = pipeline?.properties?.ci?.codebase
  const [codebaseStatus, setCodebaseStatus] = React.useState<CodebaseStatuses>(CodebaseStatuses.ZeroState)
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [isCodebaseDialogOpen, setIsCodebaseDialogOpen] = React.useState(false)

  const [codebaseRuntimeInputs, setCodebaseRuntimeInputs] = React.useState<CodebaseRuntimeInputsInterface>({
    ...(isRuntimeInput(codebase?.connectorRef) && { connectorRef: true, repoName: true })
  })
  const prCloneStrategyOptions = getPrCloneStrategyOptions(getString)
  const codebaseInitialValues: CodebaseValues = {
    connectorRef: codebase?.connectorRef,
    repoName: codebase?.repoName,
    depth: codebase?.depth !== undefined ? String(codebase.depth) : undefined,
    sslVerify: codebase?.sslVerify,
    memoryLimit: codebase?.resources?.limits?.memory,
    prCloneStrategy:
      getMultiTypeFromValue(codebase?.prCloneStrategy) === MultiTypeInputType.FIXED
        ? prCloneStrategyOptions.find(option => option.value === codebase?.prCloneStrategy)
        : codebase?.prCloneStrategy,
    cpuLimit: codebase?.resources?.limits?.cpu
  }

  const isYaml = view === SelectedView.YAML
  const isPipelineTemplateContextType = contextType === PipelineContextType.PipelineTemplate

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')
  const { expressions } = useVariablesExpression()
  const canUsePolicyEngine = useAnyEnterpriseLicense()

  const {
    data: connector,
    loading,
    refetch
  } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
      ...(repoIdentifier && branch ? { repoIdentifier, branch, getDefaultFromOtherRepo: true } : {})
    },
    lazy: true,
    debounce: 300
  })

  const [connectionType, setConnectionType] = React.useState<string>('')
  const [connectorUrl, setConnectorUrl] = React.useState<string>('')

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    codebaseInitialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  React.useEffect(() => {
    if (!isEmpty(codebase?.connectorRef) && !isRuntimeInput(codebase?.connectorRef)) {
      refetch()
    }
  }, [codebase?.connectorRef])

  React.useEffect(() => {
    if (connector?.data?.connector) {
      setConnectionType(
        connector?.data?.connector?.type === Connectors.GIT
          ? connector?.data?.connector.spec.connectionType
          : connector?.data?.connector.spec.type
      )
      setConnectorUrl(connector?.data?.connector.spec.url)
    }
  }, [
    connector?.data?.connector,
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setConnectionType,
    setConnectorUrl
  ])

  React.useEffect(() => {
    if (!codebase?.connectorRef) {
      setCodebaseStatus(CodebaseStatuses.NotConfigured)
    } else if (isRuntimeInput(codebase?.connectorRef)) {
      setCodebaseStatus(CodebaseStatuses.Valid)
    } else {
      const validate = async () => {
        setCodebaseStatus(CodebaseStatuses.Validating)

        const connectorResult = await getConnectorPromise({
          identifier: connectorId,
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
            projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
          }
        })

        if (connectorResult?.data?.connector?.spec.type === ConnectionType.Account) {
          try {
            const response = await getTestGitRepoConnectionResultPromise({
              identifier: connectorId,
              queryParams: {
                accountIdentifier: accountId,
                orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
                projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
                repoURL:
                  (connectorResult?.data?.connector?.spec.url[connectorResult?.data?.connector?.spec.url.length - 1] ===
                  '/'
                    ? connectorResult?.data?.connector?.spec.url
                    : connectorResult?.data?.connector?.spec.url + '/') + codebase?.repoName
              },
              body: undefined
            })

            if (response?.data?.status === 'SUCCESS') {
              setCodebaseStatus(CodebaseStatuses.Valid)
            } else {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          } catch (error) {
            setCodebaseStatus(CodebaseStatuses.Invalid)
          }
        } else {
          try {
            const response = await getTestConnectionResultPromise({
              identifier: connectorId,
              queryParams: {
                accountIdentifier: accountId,
                orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
                projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
              },
              body: undefined
            })

            if (response?.data?.status === 'SUCCESS') {
              setCodebaseStatus(CodebaseStatuses.Valid)
            } else {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          } catch (error) {
            setCodebaseStatus(CodebaseStatuses.Invalid)
          }
        }
      }

      validate()
    }
  }, [codebase?.connectorRef, codebase?.repoName])

  const openCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(true)
  }, [setIsCodebaseDialogOpen])

  const closeCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(false)

    if (!connector?.data?.connector?.spec.type && !connector?.data?.connector?.spec.url) {
      setConnectionType('')
      setConnectorUrl('')
    }
  }, [
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setIsCodebaseDialogOpen,
    setConnectionType,
    setConnectorUrl
  ])

  const openVariablesPanel = () => {
    if (isPipelineTemplateContextType) {
      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: false,
        splitViewData: {}
      })
      window.dispatchEvent(
        new CustomEvent('OPEN_PIPELINE_TEMPLATE_RIGHT_DRAWER', { detail: DrawerTypes.PipelineVariables })
      )
    } else {
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: true,
        drawerData: { type: DrawerTypes.PipelineVariables },
        isSplitViewOpen: false,
        splitViewData: {}
      })
    }
  }

  const openTemplatesInputDrawer = () => {
    updatePipelineView({
      ...pipelineView,
      isSplitViewOpen: false,
      splitViewData: {}
    })
    window.dispatchEvent(new CustomEvent('OPEN_PIPELINE_TEMPLATE_RIGHT_DRAWER', { detail: DrawerTypes.TemplateInputs }))
  }

  if (isLoading) {
    return <div className={css.rightBar}></div>
  }

  return (
    <div className={css.rightBar}>
      {isPipelineTemplateContextType && (
        <Button
          className={cx(css.iconButton, { [css.selected]: type === DrawerTypes.TemplateInputs })}
          onClick={openTemplatesInputDrawer}
          variation={ButtonVariation.TERTIARY}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="template-inputs"
          withoutCurrentColor={true}
          iconProps={{ size: 28 }}
          text={getString('pipeline.templateInputs')}
          data-testid="template-inputs"
          disabled={isUpdated}
        />
      )}
      <Button
        className={cx(css.iconButton, { [css.selected]: type === DrawerTypes.PipelineVariables })}
        onClick={openVariablesPanel}
        variation={ButtonVariation.TERTIARY}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        icon="pipeline-variables"
        withoutCurrentColor={true}
        iconProps={{ size: 28 }}
        text={getString('common.variables')}
        data-testid="input-variable"
      />
      {!pipeline?.template && (
        <Button
          className={cx(css.iconButton, {
            [css.selected]: type === DrawerTypes.PipelineNotifications
          })}
          variation={ButtonVariation.TERTIARY}
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: {
                type: DrawerTypes.PipelineNotifications
              },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="pipeline-deploy"
          iconProps={{ size: 24 }}
          text={getString('rbac.notifications.pipelineName')}
          withoutCurrentColor={true}
        />
      )}

      {!pipeline?.template && (
        <Button
          className={cx(css.iconButton, {
            [css.selected]: type === DrawerTypes.FlowControl
          })}
          variation={ButtonVariation.TERTIARY}
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: { type: DrawerTypes.FlowControl },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="settings"
          withoutCurrentColor={true}
          iconProps={{ size: 20 }}
          text={getString('pipeline.barriers.flowControl')}
        />
      )}

      {canUsePolicyEngine && contextType === PipelineContextType.Pipeline && (
        <Button
          className={cx(css.iconButton, {
            [css.selected]: type === DrawerTypes.PolicySets
          })}
          text={getString('common.policy.policysets')}
          variation={ButtonVariation.TERTIARY}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="governance"
          iconProps={{ size: 20 }}
          minimal
          withoutCurrentColor
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: { type: DrawerTypes.PolicySets },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
        />
      )}

      {!pipeline?.template && !isYaml && (
        <Button
          className={css.iconButton}
          text={getString('codebase')}
          variation={ButtonVariation.TERTIARY}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon={codebaseIcons[codebaseStatus]}
          iconProps={{ size: 20 }}
          minimal
          withoutCurrentColor
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: { type: DrawerTypes.AddStep },
              isSplitViewOpen: false,
              splitViewData: {}
            })
            openCodebaseDialog()
          }}
        />
      )}

      {!pipeline?.template && (
        <Button
          className={cx(css.iconButton, {
            [css.selected]: type === DrawerTypes.AdvancedOptions
          })}
          variation={ButtonVariation.TERTIARY}
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: { type: DrawerTypes.AdvancedOptions },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="pipeline-advanced"
          withoutCurrentColor={true}
          iconProps={{ size: 24 }}
          text={getString('pipeline.advancedOptions')}
        />
      )}
      <div />
      {isCodebaseDialogOpen && (
        <Dialog
          isOpen={true}
          enforceFocus={false}
          title={
            codebaseStatus === CodebaseStatuses.NotConfigured
              ? getString('pipelineSteps.build.create.configureCodebase')
              : getString('pipeline.rightBar.editCodebaseConfiguration')
          }
          onClose={closeCodebaseDialog}
        >
          <Formik
            formName="rightBarForm"
            enableReinitialize
            initialValues={codebaseInitialValues}
            validationSchema={Yup.lazy((values: CodebaseValues): any =>
              Yup.object().shape({
                connectorRef: Yup.mixed().notRequired(),
                ...((connectionType === ConnectionType.Account || !values.connectorRef) &&
                  !codebaseRuntimeInputs.repoName && {
                    repoName: Yup.string()
                      .required(getString('common.validation.repositoryName'))
                      .matches(blankspacesRegex, getString('common.validation.blankRepositoryName'))
                  })
              })
            )}
            validate={values => validateCIForm({ values, getString })}
            onSubmit={(values): void => {
              const pipelineData = produce(pipeline, draft => {
                set(draft, 'properties.ci.codebase', {
                  connectorRef:
                    typeof values.connectorRef === 'string' ? values.connectorRef : values.connectorRef?.value,
                  ...(values.repoName && { repoName: values.repoName }),
                  build: RUNTIME_INPUT_VALUE
                })

                // if connectorRef is empty string (can happen if fixed value changed to runtime input then back to fixed value)
                if (typeof values.connectorRef === 'string' && values.connectorRef === '') {
                  unset(draft, 'properties.ci.codebase.connectorRef')
                }

                // Repo level connectors should not have repoName
                if (
                  connectionType === ConnectionType.Repo &&
                  (draft as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
                ) {
                  unset(draft, 'properties.ci.codebase.repoName')
                }

                if (get(draft, 'properties.ci.codebase.depth') !== values.depth) {
                  const depthValue =
                    getMultiTypeFromValue(values.depth) === MultiTypeInputType.FIXED
                      ? values.depth
                        ? Number.parseInt(values.depth)
                        : undefined
                      : values.depth
                  set(draft, 'properties.ci.codebase.depth', depthValue)
                }

                if (get(draft, 'properties.ci.codebase.sslVerify') !== values.sslVerify) {
                  if (typeof values.sslVerify === 'string' && values.sslVerify === '') {
                    unset(draft, 'properties.ci.codebase.sslVerify')
                  } else {
                    set(draft, 'properties.ci.codebase.sslVerify', values.sslVerify)
                  }
                }

                if (get(draft, 'properties.ci.codebase.prCloneStrategy') !== values.prCloneStrategy) {
                  set(
                    draft,
                    'properties.ci.codebase.prCloneStrategy',
                    typeof values.prCloneStrategy === 'string' ? values.prCloneStrategy : values.prCloneStrategy?.value
                  )
                }

                if (get(draft, 'properties.ci.codebase.resources.limits.memory') !== values.memoryLimit) {
                  set(draft, 'properties.ci.codebase.resources.limits.memory', values.memoryLimit)
                }

                if (get(draft, 'properties.ci.codebase.resources.limits.cpu') !== values.cpuLimit) {
                  set(draft, 'properties.ci.codebase.resources.limits.cpu', values.cpuLimit)
                }
              })

              updatePipeline(pipelineData)

              closeCodebaseDialog()
            }}
          >
            {({ values, submitForm, errors, setFieldValue }) => (
              <>
                <div className={Classes.DIALOG_BODY}>
                  <FormikForm>
                    {renderConnectorAndRepoName({
                      values,
                      setFieldValue,
                      connectorUrl,
                      connectionType,
                      setConnectionType,
                      setConnectorUrl,
                      connector: connector?.data?.connector,
                      getString,
                      errors,
                      loading,
                      accountId,
                      projectIdentifier,
                      orgIdentifier,
                      repoIdentifier,
                      branch,
                      expressions,
                      isReadonly,
                      setCodebaseRuntimeInputs,
                      codebaseRuntimeInputs,
                      allowableTypes: [
                        MultiTypeInputType.FIXED,
                        MultiTypeInputType.EXPRESSION,
                        MultiTypeInputType.RUNTIME
                      ],
                      configureOptionsProps: { hideExecutionTimeField: true }
                    })}
                    <Accordion>
                      <Accordion.Panel
                        id="advanced"
                        summary={
                          <Layout.Horizontal>
                            <Text font={{ weight: 'bold' }}>{getString('advancedTitle')}</Text>&nbsp;
                          </Layout.Horizontal>
                        }
                        details={
                          <div>
                            <Container className={css.bottomMargin5}>
                              <MultiTypeTextField
                                label={
                                  <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                                    <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
                                      {getString('pipeline.depth')}
                                    </Text>
                                    &nbsp;
                                    {getOptionalSubLabel(getString, 'depth')}
                                  </Layout.Horizontal>
                                }
                                name="depth"
                                multiTextInputProps={{
                                  multiTextInputProps: {
                                    expressions,
                                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                                  },
                                  disabled: isReadonly
                                }}
                              />
                            </Container>
                            <Container className={css.bottomMargin5}>
                              <MultiTypeSelectField
                                name="sslVerify"
                                label={
                                  <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                                    <Text
                                      className={css.inpLabel}
                                      color={Color.GREY_600}
                                      font={{ size: 'small', weight: 'semi-bold' }}
                                    >
                                      {getString('pipeline.sslVerify')}
                                    </Text>
                                    &nbsp;
                                    {getOptionalSubLabel(getString, 'sslVerify')}
                                  </Layout.Horizontal>
                                }
                                multiTypeInputProps={{
                                  selectItems: sslVerifyOptions as unknown as SelectOption[],
                                  placeholder: getString('select'),
                                  multiTypeInputProps: {
                                    expressions,
                                    selectProps: {
                                      addClearBtn: true,
                                      items: sslVerifyOptions as unknown as SelectOption[]
                                    },
                                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                                  },
                                  disabled: isReadonly
                                }}
                                useValue
                                disabled={isReadonly}
                              />
                            </Container>
                            <Container className={css.bottomMargin5}>
                              <MultiTypeSelectField
                                name="prCloneStrategy"
                                label={
                                  <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                                    <Text
                                      className={css.inpLabel}
                                      color={Color.GREY_600}
                                      font={{ size: 'small', weight: 'semi-bold' }}
                                    >
                                      {getString('pipeline.ciCodebase.prCloneStrategy')}
                                    </Text>
                                    &nbsp;
                                    {getOptionalSubLabel(getString, 'prCloneStrategy')}
                                  </Layout.Horizontal>
                                }
                                multiTypeInputProps={{
                                  selectItems: prCloneStrategyOptions,
                                  placeholder: getString('select'),
                                  multiTypeInputProps: {
                                    expressions,
                                    selectProps: { addClearBtn: true, items: prCloneStrategyOptions },
                                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                                  },
                                  disabled: isReadonly
                                }}
                                disabled={isReadonly}
                              />
                            </Container>
                            <Layout.Vertical spacing="medium">
                              <Text
                                className={css.inpLabel}
                                color={Color.GREY_600}
                                font={{ size: 'small', weight: 'semi-bold' }}
                                tooltipProps={{ dataTooltipId: 'setContainerResources' }}
                              >
                                {getString('pipelineSteps.setContainerResources')}
                              </Text>
                              <Layout.Horizontal spacing="small">
                                <MultiTypeTextField
                                  name="memoryLimit"
                                  label={
                                    <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                                      <Text
                                        className={css.inpLabel}
                                        color={Color.GREY_600}
                                        font={{ size: 'small', weight: 'semi-bold' }}
                                      >
                                        {getString('pipelineSteps.limitMemoryLabel')}
                                      </Text>
                                      &nbsp;
                                      {getOptionalSubLabel(getString, 'limitMemory')}
                                    </Layout.Horizontal>
                                  }
                                  multiTextInputProps={{
                                    multiTextInputProps: {
                                      expressions,
                                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                                    },
                                    disabled: isReadonly
                                  }}
                                  configureOptionsProps={{ variableName: 'spec.limit.memory' }}
                                  style={{ flexGrow: 1, flexBasis: '50%' }}
                                />
                                <MultiTypeTextField
                                  name="cpuLimit"
                                  label={
                                    <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                                      <Text
                                        className={css.inpLabel}
                                        color={Color.GREY_600}
                                        font={{ size: 'small', weight: 'semi-bold' }}
                                      >
                                        {getString('pipelineSteps.limitCPULabel')}
                                      </Text>
                                      &nbsp;
                                      {getOptionalSubLabel(getString, 'limitCPULabel')}
                                    </Layout.Horizontal>
                                  }
                                  multiTextInputProps={{
                                    multiTextInputProps: {
                                      expressions,
                                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                                    },
                                    disabled: isReadonly
                                  }}
                                  configureOptionsProps={{ variableName: 'spec.limit.cpu' }}
                                  style={{ flexGrow: 1, flexBasis: '50%' }}
                                />
                              </Layout.Horizontal>
                            </Layout.Vertical>
                          </div>
                        }
                      />
                    </Accordion>
                  </FormikForm>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={getString('applyChanges')}
                    onClick={submitForm}
                    disabled={isReadonly}
                  />{' '}
                  &nbsp; &nbsp;
                  <Button
                    variation={ButtonVariation.TERTIARY}
                    text={getString('cancel')}
                    onClick={closeCodebaseDialog}
                  />
                </div>
              </>
            )}
          </Formik>
        </Dialog>
      )}
      <RightDrawer />
    </div>
  )
}
