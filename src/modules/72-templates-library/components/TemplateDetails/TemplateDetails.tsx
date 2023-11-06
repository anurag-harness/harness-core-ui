/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  ButtonSize,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  PageBody,
  PageError,
  SelectOption,
  Tab,
  Tabs,
  Text
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, isEmpty, noop, set, unset } from 'lodash-es'
import produce from 'immer'
import { parse } from 'yaml'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import { PageSpinner } from '@common/components'
import {
  getIconForTemplate,
  getTypeForTemplate,
  TemplateListType
} from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'

import { useDeepCompareEffect, useMutateAsGet } from '@common/hooks'
import {
  CacheResponseMetadata,
  Error,
  TemplateMetadataSummaryResponse,
  TemplateResponse,
  TemplateSummaryResponse,
  useGetTemplate,
  useGetTemplateInputSetYaml,
  useGetTemplateList,
  useGetTemplateMetadataList,
  useGetYamlWithTemplateRefsResolved
} from 'services/template-ng'
import RbacButton from '@rbac/components/Button/Button'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { TemplateYaml } from '@pipeline/components/PipelineStudio/TemplateYaml/TemplateYaml'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getVersionLabelText, TemplateType } from '@templates-library/utils/templatesUtils'
import { TemplateReferenceByTabPanel } from '@templates-library/components/TemplateDetails/TemplateReferenceByTabPanel'
import NoEntityFound, { ErrorPlacement } from '@pipeline/pages/utils/NoEntityFound/NoEntityFound'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { ErrorHandler, ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import { DefaultStableVersionValue, VersionsDropDown } from '@pipeline/components/VersionsDropDown/VersionsDropDown'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { GitPopoverV2 } from '@common/components/GitPopoverV2/GitPopoverV2'
import { ImagePreview } from '@common/components/ImagePreview/ImagePreview'
import { EntityCachedCopy } from '@pipeline/components/PipelineStudio/PipelineCanvas/EntityCachedCopy/EntityCachedCopy'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { TemplateDetailsResponseWrapper } from '@pipeline/utils/templateUtils'
import { TemplateActivityLog } from '../TemplateActivityLog/TemplateActivityLog'
import css from './TemplateDetails.module.scss'

export interface TemplateDetailsProps {
  template: TemplateSummaryResponse
  setTemplate?: (template: TemplateSummaryResponse) => void
  storeMetadata?: StoreMetadata
  isStandAlone?: boolean
  disableVersionChange?: boolean
  loadFromFallbackBranch?: boolean
}

export enum TemplateTabs {
  INPUTS = 'INPUTS',
  YAML = 'YAML',
  REFERENCEDBY = 'REFERENCEDBY'
}

export enum ParentTemplateTabs {
  BASIC = 'BASIC',
  ACTVITYLOG = 'ACTVITYLOG'
}

export const TemplateDetails: React.FC<TemplateDetailsProps> = props => {
  const {
    template,
    setTemplate,
    storeMetadata,
    isStandAlone = false, // when we use template inside pipeline/template studio, then it is set to true
    disableVersionChange = false,
    loadFromFallbackBranch = false
  } = props
  const { getString } = useStrings()
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingTemplatesGitx
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [templates, setTemplates] = React.useState<TemplateSummaryResponse[] | TemplateMetadataSummaryResponse[]>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateDetailsResponseWrapper>()
  const [selectedParentTab, setSelectedParentTab] = React.useState<ParentTemplateTabs>(ParentTemplateTabs.BASIC)
  const [selectedTab, setSelectedTab] = React.useState<TemplateTabs>(TemplateTabs.INPUTS)
  const params = useParams<ProjectPathProps & ModulePathParams>()
  const { accountId, module } = params
  const [selectedBranch, setSelectedBranch] = React.useState<string | undefined>(template?.gitDetails?.branch)

  /* default branch will be sent in template object so as to give reference while creating stage/step template in pipeline studio
  and help us know whether to show gitBranch in yaml or not */
  const [defaultBranch, setDefaultBranch] = React.useState<string | undefined>()

  const stableVersion = React.useMemo(() => {
    return (templates as TemplateSummaryResponse[])?.find(item => item.stableTemplate && !isEmpty(item.versionLabel))
      ?.versionLabel
  }, [templates])

  const repo =
    (selectedTemplate as TemplateSummaryResponse)?.gitDetails?.repoIdentifier ||
    (selectedTemplate as NGTemplateInfoConfigWithGitDetails)?.repo
  const selectedTemplateBranch =
    (selectedTemplate as TemplateSummaryResponse)?.gitDetails?.branch ||
    (selectedTemplate as NGTemplateInfoConfigWithGitDetails)?.branch

  const parentEntityDetails =
    !selectedBranch ||
    (selectedTemplate?.gitDetails?.repoName !== storeMetadata?.repoName &&
      selectedTemplate?.gitDetails?.defaultBranch === selectedBranch)
  const {
    data: templateYamlData,
    refetch: refetchTemplateYaml,
    loading: loadingTemplateYaml,
    error: templateYamlError
  } = useGetTemplate({
    templateIdentifier: defaultTo(selectedTemplate?.identifier, ''),
    queryParams: {
      accountIdentifier: defaultTo(selectedTemplate?.accountId, accountId),
      orgIdentifier: selectedTemplate?.orgIdentifier,
      projectIdentifier: selectedTemplate?.projectIdentifier,
      versionLabel: selectedTemplate?.versionLabel,
      ...getGitQueryParamsWithParentScope({
        storeMetadata,
        params,
        branch: selectedBranch,
        loadFromFallbackBranch,
        sendParentEntityDetails: isStandAlone && !parentEntityDetails ? false : true
      })
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    lazy: true
  })

  const {
    data: templateData,
    refetch: reloadTemplates,
    loading,
    error: templatesError
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

  const templateInputSetFetchParams = useGetTemplateInputSetYaml({
    templateIdentifier: defaultTo(selectedTemplate?.identifier, ''),
    queryParams: {
      accountIdentifier: defaultTo(selectedTemplate?.accountId, accountId),
      orgIdentifier: selectedTemplate?.orgIdentifier,
      projectIdentifier: selectedTemplate?.projectIdentifier,
      versionLabel: defaultTo(selectedTemplate?.versionLabel, ''),
      ...getGitQueryParamsWithParentScope({
        storeMetadata,
        params,
        repoIdentifier: repo,
        /* When isStandalone is true then, if selected branch is undefined, it will pick from storemetadata.
         For diff repo we want storeMetadata bra nch to initially go as in BE we have
        logic to pick default branch of that specfic repo and template*/
        branch: isStandAlone ? selectedBranch : selectedTemplateBranch,
        sendParentEntityDetails: isStandAlone && !parentEntityDetails ? false : true
      })
    },
    lazy: true,
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })
  const { refetch: refetchTemplateInputSetYaml } = templateInputSetFetchParams

  const selectedTemplateSpec = React.useMemo(
    () => parse((selectedTemplate as TemplateSummaryResponse)?.yaml || '')?.template?.spec,
    [selectedTemplate]
  )

  const {
    data: resolvedPipelineResponse,
    loading: loadingResolvedPipeline,
    refetch: refetchResolvedPipeline
  } = useMutateAsGet(useGetYamlWithTemplateRefsResolved, {
    queryParams: {
      accountIdentifier: defaultTo(selectedTemplate?.accountId, accountId),
      orgIdentifier: selectedTemplate?.orgIdentifier,
      pipelineIdentifier: selectedTemplateSpec?.identifier,
      projectIdentifier: selectedTemplate?.projectIdentifier,
      ...getGitQueryParamsWithParentScope({
        storeMetadata,
        params,
        repoIdentifier: repo,
        branch: isStandAlone ? selectedBranch : selectedTemplateBranch
      })
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    body: {
      originalEntityYaml: yamlStringify({ pipeline: selectedTemplateSpec })
    },
    lazy: true
  })

  const templateIconName = React.useMemo(() => getIconForTemplate(getString, selectedTemplate), [selectedTemplate])
  const templateIconUrl = React.useMemo(() => selectedTemplate?.icon, [selectedTemplate?.icon])
  const templateType = React.useMemo(() => getTypeForTemplate(getString, selectedTemplate), [selectedTemplate])

  const templateYamlErrorResponseMessages = (templateYamlError?.data as Error)?.responseMessages ?? []

  React.useEffect(() => {
    if (templateData?.data?.content) {
      const allVersions = [...templateData.data.content]
      if (isStandAlone) {
        const templateStableVersion = { ...allVersions.find(item => item.stableTemplate) }
        delete templateStableVersion.versionLabel
        allVersions.unshift(templateStableVersion)
      }
      setTemplates(allVersions)
    }
  }, [isStandAlone, templateData])

  React.useEffect(() => {
    const newVersionOptions: SelectOption[] = (templates as TemplateSummaryResponse[]).map(item => {
      return {
        label: getVersionLabelText(item, getString),
        value: defaultTo(item.versionLabel, DefaultStableVersionValue)
      } as SelectOption
    })
    setVersionOptions(newVersionOptions)

    const preSelectedTemplate = template?.identifier
      ? template
      : (templates as TemplateSummaryResponse[]).find(item => item.versionLabel === template.versionLabel)

    setSelectedTemplate(preSelectedTemplate)
  }, [templates])

  React.useEffect(() => {
    if (templateYamlError && selectedTemplate) {
      const updatedSelectedTemplate = produce(selectedTemplate, draft => {
        //This make sures yaml is set to empty on branch change which is responsible for rendering of useTemplate button in Template selector component
        if (!isEmpty(draft?.yaml)) {
          set(draft, 'yaml', '')
        }
        if (!isEmpty(draft?.gitDetails)) {
          set(draft, 'gitDetails.fileUrl', undefined)
        }
        if (
          (selectedTemplate as TemplateResponse).storeType === 'REMOTE' &&
          !isEmpty((selectedTemplate as TemplateResponse).cacheResponseMetadata)
        )
          set(draft, 'cacheResponseMetadata', undefined)
      })
      setSelectedTemplate(updatedSelectedTemplate)
    }
  }, [templateYamlError])

  React.useEffect(() => {
    // This check ensures template inputs are fetched once complete template details are available - this is required especially for remote templates
    if (selectedTemplate?.yaml) {
      refetchTemplateInputSetYaml()
    }
  }, [selectedTemplate?.yaml])

  useDeepCompareEffect(() => {
    if (selectedTemplateSpec && selectedTemplate?.templateEntityType === TemplateType.Pipeline) {
      refetchResolvedPipeline()
    }
  }, [selectedTemplateSpec, selectedTemplate?.templateEntityType])

  React.useEffect(() => {
    if (selectedTemplate) {
      const data = produce(selectedTemplate, draft => {
        if (defaultBranch) {
          set(draft, 'gitDetails.defaultBranch', defaultBranch)
        }
      })
      setTemplate?.(data)
      setSelectedTemplate?.(data)
      if (isEmpty(selectedTemplate?.yaml)) {
        refetchTemplateYaml()
      }
    }
  }, [selectedTemplate])

  React.useEffect(() => {
    if (templateYamlData?.data) {
      const templateWithYaml = produce(templateYamlData.data, draft => {
        if (isEmpty(selectedTemplate?.versionLabel)) {
          unset(draft, 'versionLabel')
        }
      })
      setSelectedTemplate(templateWithYaml)
    }
  }, [templateYamlData?.data])

  React.useEffect(() => {
    if (selectedTemplate?.identifier) setSelectedBranch(selectedTemplate?.gitDetails?.branch)
  }, [selectedTemplate?.identifier])

  const onChange = React.useCallback(
    (option: SelectOption): void => {
      setSelectedBranch(undefined)
      const version = defaultTo(option.value?.toString(), '')
      if (version === DefaultStableVersionValue) {
        setSelectedTemplate((templates as TemplateSummaryResponse[]).find(item => !item.versionLabel))
      } else {
        setSelectedTemplate((templates as TemplateSummaryResponse[]).find(item => item.versionLabel === version))
      }
    },
    [templates]
  )

  const handleTabChange = React.useCallback((tab: TemplateTabs) => {
    setSelectedTab(tab)
  }, [])

  const handleParentTabChange = React.useCallback(
    (tab: ParentTemplateTabs) => {
      setSelectedParentTab(tab)
    },
    [setSelectedParentTab]
  )

  const onGitBranchChange = ({ branch }: GitFilterScope, defaultSelected?: boolean): void => {
    setSelectedBranch(branch)
    const newGitDetails = {
      ...selectedTemplate?.gitDetails,
      branch
    }
    setSelectedTemplate({ ...selectedTemplate, gitDetails: newGitDetails })
    if (!defaultSelected) {
      refetchTemplateYaml({
        queryParams: {
          accountIdentifier: defaultTo(selectedTemplate?.accountId, accountId),
          orgIdentifier: selectedTemplate?.orgIdentifier,
          projectIdentifier: selectedTemplate?.projectIdentifier,
          versionLabel: selectedTemplate?.versionLabel,
          branch
        }
      })
      refetchTemplateInputSetYaml({
        queryParams: {
          accountIdentifier: defaultTo(selectedTemplate?.accountId, accountId),
          orgIdentifier: selectedTemplate?.orgIdentifier,
          projectIdentifier: selectedTemplate?.projectIdentifier,
          versionLabel: defaultTo(selectedTemplate?.versionLabel, ''),
          ...getGitQueryParamsWithParentScope({
            storeMetadata,
            params,
            repoIdentifier: repo,
            branch,
            sendParentEntityDetails: isStandAlone && !defaultSelected ? false : true
          })
        }
      })
      if (selectedTemplate?.templateEntityType === TemplateType.Pipeline) {
        refetchResolvedPipeline({
          queryParams: {
            accountIdentifier: defaultTo(selectedTemplate?.accountId, accountId),
            orgIdentifier: selectedTemplate?.orgIdentifier,
            pipelineIdentifier: selectedTemplateSpec?.identifier,
            projectIdentifier: selectedTemplate?.projectIdentifier,
            ...getGitQueryParamsWithParentScope({
              storeMetadata,
              params,
              repoIdentifier: repo,
              branch
            })
          }
        })
      }
    }
  }

  const goToTemplateStudio = (): void => {
    if (selectedTemplate) {
      const url = routes.toTemplateStudio({
        projectIdentifier: selectedTemplate.projectIdentifier,
        orgIdentifier: selectedTemplate.orgIdentifier,
        accountId: defaultTo(selectedTemplate.accountId, ''),
        module,
        templateType: selectedTemplate.templateEntityType,
        templateIdentifier: selectedTemplate.identifier,
        versionLabel: selectedTemplate.versionLabel,
        repoIdentifier: selectedTemplate.gitDetails?.repoIdentifier,
        branch: selectedBranch || storeMetadata?.branch
      })
      if (isStandAlone) {
        window.open(`${windowLocationUrlPartBeforeHash()}#${url}`, '_blank')
      } else {
        history.push(url)
      }
    }
  }

  const ErrorPanel = (
    <Container className={css.errorPanel}>
      {!isStandAlone ? (
        <NoEntityFound
          errorPlacement={ErrorPlacement.BOTTOM}
          identifier={selectedTemplate?.identifier as string}
          entityType={'template'}
          errorObj={templateYamlError?.data as Error}
          gitDetails={{
            connectorRef: (selectedTemplate as TemplateResponse)?.connectorRef,
            repoName: (selectedTemplate as TemplateResponse)?.gitDetails?.repoName,
            branch: selectedBranch,
            onBranchChange: onGitBranchChange
          }}
        />
      ) : (
        <ErrorHandler
          responseMessages={(templateYamlError?.data as Error)?.responseMessages as ResponseMessage[]}
          className={css.errorHandler}
        />
      )}
    </Container>
  )

  const TemplateInputsTabPanel = !isEmpty(templateYamlErrorResponseMessages) ? (
    ErrorPanel
  ) : !isEmpty(selectedTemplate?.yaml) && selectedTemplate ? (
    templateFactory.getTemplate(selectedTemplate.templateEntityType || '')?.renderTemplateInputsForm({
      template: selectedTemplate,
      accountId: defaultTo(template.accountId, ''),
      templateInputSetFetchParams,
      resolvedPipelineFetchParams: {
        resolvedPipelineResponse,
        loadingResolvedPipeline
      },
      shouldUtilizeFullWidth: true
    })
  ) : (
    <PageBody className={css.yamlLoader} loading />
  )

  const TemplateYamlTabPanel = loadingTemplateYaml ? (
    <PageBody className={css.yamlLoader} loading />
  ) : !isEmpty(templateYamlErrorResponseMessages) ? (
    ErrorPanel
  ) : (
    <TemplateYaml templateYaml={defaultTo(selectedTemplate?.yaml, '')} />
  )

  return (
    <Container height={'100%'} className={css.container} data-template-id={template.identifier}>
      <Layout.Vertical flex={{ align: 'center-center' }} height={'100%'}>
        {loading && <PageSpinner />}
        {!loading && templatesError && (
          <PageError
            message={defaultTo((templatesError.data as Error)?.message, templatesError.message)}
            onClick={reloadTemplates}
          />
        )}
        {!templatesError && selectedTemplate && (
          <Container height={'100%'} width={'100%'}>
            <Layout.Vertical height={'100%'}>
              <Layout.Horizontal
                flex={{ alignItems: 'center' }}
                spacing={'huge'}
                padding={{ top: 'large', left: 'xxlarge', bottom: 'large', right: 'xxlarge' }}
                border={{ bottom: true }}
              >
                <Layout.Horizontal className={css.shrink} spacing={'small'} flex={{ alignItems: 'center' }}>
                  <Text
                    lineClamp={1}
                    font={{ size: 'medium', weight: 'bold' }}
                    color={Color.GREY_800}
                    margin={{ right: 'small' }}
                  >
                    {selectedTemplate.name}
                  </Text>
                  {supportingTemplatesGitx && (template as TemplateResponse)?.storeType === 'REMOTE' && (
                    <Layout.Horizontal flex={{ alignItems: 'center' }}>
                      <GitPopoverV2
                        setDefaultBranch={setDefaultBranch}
                        selectedBranch={selectedBranch} // to always show selected branch in popover
                        storeMetadata={{
                          ...storeMetadata,
                          connectorRef:
                            (selectedTemplate as TemplateResponse).connectorRef ||
                            (templateData?.data?.content?.[0] as TemplateMetadataSummaryResponse)?.connectorRef,
                          storeType: (selectedTemplate as TemplateResponse).storeType
                        }}
                        gitDetails={{
                          ...selectedTemplate.gitDetails,
                          repoName: templateData?.data?.content?.[0]?.gitDetails?.repoName
                        }}
                        onGitBranchChange={onGitBranchChange}
                        forceFetch
                        btnClassName={css.gitBtn}
                        customIcon={
                          !isEmpty((selectedTemplate as TemplateResponse)?.cacheResponseMetadata) ? (
                            <EntityCachedCopy
                              reloadContent={getString('common.template.label')}
                              cacheResponse={
                                (selectedTemplate as TemplateResponse)?.cacheResponseMetadata as CacheResponseMetadata
                              }
                              reloadFromCache={noop}
                              fetchError={templateYamlError as any}
                              readonly={true}
                              className={css.cacheIcon}
                            />
                          ) : undefined
                        }
                      />
                    </Layout.Horizontal>
                  )}
                  {isGitSyncEnabled && (
                    <GitPopover
                      data={defaultTo(selectedTemplate.gitDetails, {})}
                      iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
                    />
                  )}
                </Layout.Horizontal>
                <RbacButton
                  text={getString('templatesLibrary.openInTemplateStudio')}
                  variation={ButtonVariation.SECONDARY}
                  size={ButtonSize.SMALL}
                  className={css.openInStudio}
                  onClick={goToTemplateStudio}
                  permission={{
                    permission: PermissionIdentifier.VIEW_TEMPLATE,
                    resource: {
                      resourceType: ResourceType.TEMPLATE
                    }
                  }}
                />
              </Layout.Horizontal>
              <Container background={Color.FORM_BG} className={css.tabsContainer}>
                <Tabs id="template-details-parent" selectedTabId={selectedParentTab} onChange={handleParentTabChange}>
                  <Tab
                    id={ParentTemplateTabs.BASIC}
                    title={getString('details')}
                    panel={
                      <Layout.Vertical height={'100%'}>
                        <Container>
                          <Layout.Vertical
                            className={css.topContainer}
                            spacing={'large'}
                            padding={{ top: 'xlarge', right: 'xxlarge', bottom: 'xlarge', left: 'xxlarge' }}
                          >
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('typeLabel')}
                                </Text>
                                <Container>
                                  <Layout.Horizontal
                                    spacing={'small'}
                                    flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                                  >
                                    {templateIconUrl ? (
                                      <ImagePreview
                                        src={templateIconUrl}
                                        size={20}
                                        alt={getString('common.template.templateIcon')}
                                        fallbackIcon={templateIconName}
                                      />
                                    ) : (
                                      templateIconName && <Icon size={20} name={templateIconName} />
                                    )}
                                    {templateType && <Text color={Color.GREY_900}>{templateType}</Text>}
                                  </Layout.Horizontal>
                                </Container>
                              </Layout.Vertical>
                            </Container>
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('description')}
                                </Text>
                                <Text color={Color.GREY_900}>{defaultTo(selectedTemplate.description, '-')}</Text>
                              </Layout.Vertical>
                            </Container>
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('tagsLabel')}
                                </Text>
                                {selectedTemplate.tags && !isEmpty(selectedTemplate.tags) ? (
                                  <Container>
                                    <TemplateTags tags={selectedTemplate.tags} />
                                  </Container>
                                ) : (
                                  <Text color={Color.GREY_900}>-</Text>
                                )}
                              </Layout.Vertical>
                            </Container>
                            <Container className={css.versionListContainer}>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('common.versionLabel')}
                                </Text>
                                <VersionsDropDown
                                  items={versionOptions}
                                  value={defaultTo(selectedTemplate.versionLabel, DefaultStableVersionValue)}
                                  onChange={onChange}
                                  width={300}
                                  popoverClassName={css.dropdown}
                                  stableVersion={stableVersion}
                                  disabled={disableVersionChange}
                                />
                              </Layout.Vertical>
                            </Container>
                          </Layout.Vertical>
                        </Container>
                        <Container className={css.innerTabsContainer}>
                          <Tabs id="template-details" selectedTabId={selectedTab} onChange={handleTabChange}>
                            <Tab
                              id={TemplateTabs.INPUTS}
                              title={getString('pipeline.templateInputs')}
                              panel={TemplateInputsTabPanel}
                            />
                            <Tab id={TemplateTabs.YAML} title={getString('yaml')} panel={TemplateYamlTabPanel} />
                            <Tab
                              id={TemplateTabs.REFERENCEDBY}
                              title={getString('templatesLibrary.referencedBy')}
                              className={css.referencedByTab}
                              panel={
                                <TemplateReferenceByTabPanel
                                  selectedTemplate={selectedTemplate}
                                  templates={templates}
                                />
                              }
                            />
                          </Tabs>
                        </Container>
                      </Layout.Vertical>
                    }
                  />
                  <Tab
                    id={ParentTemplateTabs.ACTVITYLOG}
                    title={getString('activityLog')}
                    panel={<TemplateActivityLog template={selectedTemplate} />}
                  />
                </Tabs>
              </Container>
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}
