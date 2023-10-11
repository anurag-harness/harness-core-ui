/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  Container,
  Formik,
  FormikForm,
  Button,
  Switch,
  RUNTIME_INPUT_VALUE,
  IconName,
  MultiTypeInputType
} from '@harness/uicore'
import * as Yup from 'yup'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, isEmpty, set, unset } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikErrors } from 'formik'
import { produce } from 'immer'
import { parse } from 'yaml'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import type { ConnectorReferenceFieldProps } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { NameId, NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { IdentifierSchemaWithoutHook, NameSchemaWithoutHook } from '@common/utils/Validation'
import { Scope } from '@common/interfaces/SecretsInterface'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useGitScope, isRuntimeInput } from '@pipeline/utils/CIUtils'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { TemplateDetailsResponseWrapper, createTemplate, getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, StageActions } from '@common/constants/TrackingConstants'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'

import {
  renderConnectorAndRepoName,
  CodebaseRuntimeInputsInterface,
  blankspacesRegex
} from '@pipeline/components/PipelineStudio/RightBar/RightBarUtils'
import css from './EditStageView.module.scss'

export interface EditStageView {
  data?: StageElementWrapper<BuildStageElementConfig>
  template?: TemplateDetailsResponseWrapper
  onSubmit?: (
    values: StageElementWrapper<BuildStageElementConfig>,
    identifier: string,
    pipeline?: PipelineInfoConfig
  ) => void
  onChange?: (values: Values) => void
  moduleIcon?: IconName
}

interface Values {
  identifier: string
  name: string
  description?: string
  tags?: { [key: string]: string }
  cloneCodebase?: boolean
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
}

export const EditStageView: React.FC<EditStageView> = ({
  data,
  template,
  onSubmit,
  onChange,
  moduleIcon
}): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')
  const [connectorType, setConnectorType] = React.useState('')
  const gitScope = useGitScope()
  const repositoryNameLabel = getString('common.repositoryName')

  const icon: IconName = moduleIcon ? moduleIcon : 'ci-main'

  const {
    state: { pipeline, gitDetails },
    contextType,
    isReadonly
  } = usePipelineContext()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch, repoName } = useQueryParams<GitQueryParams>()
  const parentTemplateBranch = defaultTo(gitDetails?.branch, branch)
  const parentTemplateRepo = defaultTo(defaultTo(gitDetails?.repoName, gitDetails?.repoIdentifier), repoName)

  const initialValues: Values = {
    identifier: data?.stage?.identifier || '',
    name: data?.stage?.name || '',
    description: data?.stage?.description,
    tags: data?.stage?.tags,
    cloneCodebase: defaultTo(
      template
        ? parse(defaultTo(template.yaml, '')).template.spec.spec.cloneCodebase
        : data?.stage?.spec?.cloneCodebase,
      true
    )
  }

  const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  const [codebaseRuntimeInputs, setCodebaseRuntimeInputs] = React.useState<CodebaseRuntimeInputsInterface>({
    ...(isRuntimeInput(codebase?.connectorRef) && { connectorRef: true, repoName: true })
  })

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
      ...(gitScope?.repo && gitScope.branch
        ? { repoIdentifier: gitScope.repo, branch: gitScope.branch, getDefaultFromOtherRepo: true }
        : {})
    },
    lazy: true,
    debounce: 300
  })

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    initialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  React.useEffect(() => {
    if (!isEmpty(codebase?.connectorRef)) {
      refetch()
    }
  }, [codebase?.connectorRef])

  const validationSchema = () =>
    Yup.lazy((values: Values): any =>
      Yup.object().shape({
        ...(isContextTypeNotStageTemplate(contextType) && {
          name: NameSchemaWithoutHook(getString, {
            requiredErrorMsg: getString('fieldRequired', { field: getString('stageNameLabel') })
          }),
          identifier: IdentifierSchemaWithoutHook(getString)
        }),
        ...(!codebase &&
          isContextTypeNotStageTemplate(contextType) &&
          values.cloneCodebase && {
            connectorRef: Yup.mixed().notRequired(),
            ...((connectionType === 'Account' || !values.connectorRef) && {
              repoName: Yup.string()
                .required(getString('fieldRequired', { field: repositoryNameLabel }))
                .matches(blankspacesRegex, getString('common.validation.blankRepositoryName'))
            })
          })
      })
    )

  const handleValidate = (values: Values): FormikErrors<Values> => {
    const errors: { name?: string } = {}
    if (isDuplicateStageId(values.identifier, pipeline?.stages || [])) {
      errors.name = getString('validation.identifierDuplicate')
    }
    if (data) {
      onChange?.(values)
    }
    return errors
  }

  const handleSubmit = (values: Values): void => {
    if (data?.stage) {
      // TODO: Add Codebase verification
      let pipelineData: PipelineInfoConfig | undefined = undefined
      if (values.cloneCodebase) {
        pipelineData = produce<PipelineInfoConfig>(pipeline, draft => {
          set(draft, 'properties.ci.codebase', {
            connectorRef: typeof values.connectorRef === 'string' ? values.connectorRef : values.connectorRef?.value,
            ...(values.repoName && { repoName: values.repoName }),
            build: RUNTIME_INPUT_VALUE
          })

          // if connectorRef is empty string (can happen if fixed value changed to runtime input then back to fixed value)
          if (typeof values.connectorRef === 'string' && values.connectorRef === '') {
            unset(draft, 'properties.ci.codebase.connectorRef')
          }

          // Repo level connectors should not have repoName
          if (connectionType === 'Repo' && (draft as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
            delete (draft as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
          }
        })
      }

      if (template) {
        onSubmit?.(
          { stage: createTemplate(values, template, parentTemplateBranch, parentTemplateRepo) },
          values.identifier,
          pipelineData
        )
      } else {
        data.stage.identifier = values.identifier
        data.stage.name = values.name
        if (values.description) data.stage.description = values.description
        if (values.tags) data.stage.tags = values.tags
        if (!data.stage.spec) data.stage.spec = {} as any
        set(data, 'stage.spec.cloneCodebase', values.cloneCodebase)
        onSubmit?.(data, values.identifier, pipelineData)
      }
    }
  }
  const { trackEvent } = useTelemetry()
  React.useEffect(() => {
    trackEvent(StageActions.LoadEditStageView, {
      category: Category.STAGE
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={css.stageCreate}>
      <Container padding="medium">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          validate={handleValidate}
          formName="ciEditStage"
          onSubmit={handleSubmit}
        >
          {formikProps => (
            <FormikForm>
              <Text
                style={{ fontVariant: FontVariation.H5, color: Color.GREY_800 }}
                icon={icon}
                iconProps={{ size: 24, margin: { right: 'xsmall' } }}
                margin={{ bottom: 'medium' }}
                className={css.addStageHeading}
              >
                {getString('pipelineSteps.build.create.aboutYourStage')}
              </Text>
              {isContextTypeNotStageTemplate(contextType) &&
                (template ? (
                  <NameId
                    identifierProps={{
                      inputLabel: getString('stageNameLabel'),
                      inputGroupProps: {
                        disabled: isReadonly,
                        placeholder: getString('pipeline.aboutYourStage.stageNamePlaceholder')
                      }
                    }}
                  />
                ) : (
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{
                      inputLabel: getString('stageNameLabel'),
                      inputGroupProps: {
                        disabled: isReadonly,
                        placeholder: getString('pipeline.aboutYourStage.stageNamePlaceholder')
                      }
                    }}
                    descriptionProps={{ disabled: isReadonly }}
                    tagsProps={{ disabled: isReadonly }}
                  />
                ))}
              {template ? (
                <Text
                  icon={'template-library'}
                  margin={{ top: 'medium', bottom: 'medium' }}
                  font={{ size: 'small' }}
                  iconProps={{ size: 12, margin: { right: 'xsmall' } }}
                  color={Color.BLACK}
                >
                  {`Using Template: ${getTemplateNameWithLabel(template)}`}
                </Text>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-small)' }}>
                  <Switch
                    label={getString('cloneCodebaseLabel')}
                    onChange={e => formikProps.setFieldValue('cloneCodebase', e.currentTarget.checked)}
                    defaultChecked={formikProps.values.cloneCodebase}
                    disabled={isReadonly}
                    tooltipProps={{ tooltipId: 'cloneCodebase' }}
                  />
                </div>
              )}
              {/* We don't need to configure CI Codebase if it is already configured or we are skipping Clone Codebase step */}
              {!codebase && formikProps.values.cloneCodebase && isContextTypeNotStageTemplate(contextType) && (
                <div className={css.configureCodebase}>
                  <Text
                    font={{ size: 'normal', weight: 'semi-bold' }}
                    icon="cog"
                    iconProps={{ size: 16 }}
                    margin={{ bottom: 'medium' }}
                    style={{ color: 'var(--grey-700)' }}
                  >
                    {getString('pipelineSteps.build.create.configureCodebase')}
                  </Text>
                  <Text margin={{ bottom: 'medium' }}>
                    {getString('pipelineSteps.build.create.configureCodebaseHelperText')}
                  </Text>
                  {renderConnectorAndRepoName({
                    values: formikProps.values,
                    setFieldValue: formikProps.setFieldValue,
                    connectorUrl,
                    connectionType,
                    setConnectionType,
                    setConnectorUrl,
                    getString,
                    errors: formikProps.errors,
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
                    connectorWidth: 366,
                    fixRepoNameWidth: true,
                    setConnectorType,
                    connectorType,
                    allowableTypes: [
                      MultiTypeInputType.FIXED,
                      MultiTypeInputType.EXPRESSION,
                      MultiTypeInputType.RUNTIME
                    ],
                    configureOptionsProps: { hideExecutionTimeField: true }
                  })}
                </div>
              )}
              <Button
                type="submit"
                intent="primary"
                text={getString('pipelineSteps.build.create.setupStage')}
                margin={{ top: 'small' }}
              />
            </FormikForm>
          )}
        </Formik>
      </Container>
    </div>
  )
}
