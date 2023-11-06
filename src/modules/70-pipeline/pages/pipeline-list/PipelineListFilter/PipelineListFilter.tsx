/* eslint-disable @typescript-eslint/explicit-function-return-type */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef } from 'react'
import { Layout, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { isEmpty, isUndefined } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { isObjectEmpty, UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { StringUtils, useToaster } from '@common/exports'
import { useBooleanStatus, useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { deploymentTypeLabel } from '@pipeline/utils/DeploymentTypeUtils'
import { getBuildType, getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import {
  createRequestBodyPayload,
  getMultiSelectFormOptions,
  getValidFilterArguments,
  PipelineFormType
} from '@pipeline/utils/PipelineFilterRequestUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { useGetEnvironmentListV2, useGetServiceDefinitionTypes, useGetServiceList } from 'services/cd-ng'
import type { FilterDTO, PipelineFilterProperties } from 'services/pipeline-ng'
import { useDeleteFilter, useGetFilterList, usePostFilter, useUpdateFilter } from 'services/pipeline-ng'
import { killEvent } from '@common/utils/eventUtils'
import {
  useFilterWithValidFieldsWithMetaInfo,
  usePipelineListFilterFieldToLabelMapping
} from '@pipeline/pages/utils/Filters/filters'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDActions, Category } from '@common/constants/TrackingConstants'
import { ExecutionListFilterForm } from '../../execution-list/ExecutionListFilterForm/ExecutionListFilterForm'
import type {
  PipelineListPagePathParams,
  PipelineListPageQueryParams,
  ProcessedPipelineListPageQueryParams
} from '../types'
import { usePipelinesQueryParamOptions } from '../PipelineListUtils'

const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)

interface PipelineListFilterProps {
  onFilterListUpdate: (filterList: FilterDTO[] | undefined) => void
}

export function PipelineListFilter({ onFilterListUpdate }: PipelineListFilterProps): React.ReactElement {
  const { getString } = useStrings()
  const filterRef = useRef<FilterRef<FilterDTO> | null>(null)
  const { showError } = useToaster()
  const { trackEvent } = useTelemetry()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<PipelineListPageQueryParams>>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<PipelineListPagePathParams>()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()
  const filterDrawerOpenedRef = useRef(false)
  const { CDS_OrgAccountLevelServiceEnvEnvGroup } = useFeatureFlags()
  const queryParamOptions = usePipelinesQueryParamOptions()
  const queryParams = useQueryParams<ProcessedPipelineListPageQueryParams>(queryParamOptions)
  const { selectedProject } = useAppStore()
  const isCDEnabled = !!selectedProject?.modules?.includes('CD')
  const isCIEnabled = !!selectedProject?.modules?.includes('CI')

  /**Start Data hooks */

  const { data: deploymentTypeResponse, loading: isDeploymentTypesLoading } = useGetServiceDefinitionTypes({
    queryParams: { accountId },
    lazy: !filterDrawerOpenedRef.current
  })

  const { data: servicesResponse, loading: isServicesLoading } = useGetServiceList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      includeAllServicesAccessibleAtScope: CDS_OrgAccountLevelServiceEnvEnvGroup
    },
    lazy: !filterDrawerOpenedRef.current
  })

  const { data: environmentsResponse, loading: isEnvironmentsLoading } = useMutateAsGet(useGetEnvironmentListV2, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      includeAllAccessibleAtScope: CDS_OrgAccountLevelServiceEnvEnvGroup
    },
    body: {
      filterType: 'Environment'
    },
    lazy: !filterDrawerOpenedRef.current
  })

  const { mutate: createFilter, loading: isCreateFilterLoading } = usePostFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateFilter, loading: isUpdateFilterLoading } = useUpdateFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: deleteFilter, loading: isDeleteFilterLoading } = useDeleteFilter({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, type: 'PipelineSetup' }
  })
  const {
    data: filterListData,
    loading: isFilterListLoading,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, type: 'PipelineSetup' },
    lazy: !filterDrawerOpenedRef.current && !queryParams.filterIdentifier
  })

  /**End Data hooks */

  const deploymentTypeSelectOptions = useMemo(() => {
    const options: SelectOption[] =
      deploymentTypeResponse?.data
        ?.filter(deploymentType => deploymentType in deploymentTypeLabel)
        .map(type => ({
          label: getString(deploymentTypeLabel[type]),
          value: type as string
        })) || ([] as SelectOption[])
    return options
  }, [deploymentTypeResponse])

  const filterList = filterListData?.data?.content

  useEffect(() => {
    onFilterListUpdate(filterList)
  }, [filterList, onFilterListUpdate])

  const isMetaDataLoading = isDeploymentTypesLoading || isEnvironmentsLoading || isServicesLoading
  const isFilterCrudLoading =
    isCreateFilterLoading || isUpdateFilterLoading || isDeleteFilterLoading || isFilterListLoading
  const appliedFilter =
    queryParams.filterIdentifier && queryParams.filterIdentifier !== UNSAVED_FILTER_IDENTIFIER
      ? getFilterByIdentifier(queryParams.filterIdentifier, filterList)
      : !isEmpty(queryParams.filters)
      ? ({
          name: UNSAVED_FILTER,
          identifier: UNSAVED_FILTER_IDENTIFIER,
          filterProperties: queryParams.filters,
          filterVisibility: undefined
        } as FilterDTO)
      : null
  const { name = '', filterVisibility, identifier = '', filterProperties } = appliedFilter || {}
  const {
    name: pipelineName,
    pipelineTags: _pipelineTags,
    moduleProperties,
    description
  } = (filterProperties as PipelineFilterProperties) || {}
  const { ci, cd } = moduleProperties || {}
  const { branch, tag, ciExecutionInfoDTO, repoNames: repositoryName } = ci || {}
  const { deploymentTypes, environmentNames, infrastructureTypes, serviceNames } = cd || {}
  const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}
  const buildType = getBuildType(moduleProperties || {})
  const fieldToLabelMapping = usePipelineListFilterFieldToLabelMapping()
  const filterWithValidFieldsWithMetaInfo = useFilterWithValidFieldsWithMetaInfo(
    appliedFilter?.filterProperties,
    fieldToLabelMapping
  )

  /**Start Handlers */

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => {
    killEvent(event)
    updateQueryParams(
      {
        filterIdentifier: option.value ? option.value.toString() : undefined,
        filters: undefined,
        page: DEFAULT_PAGE_INDEX
      },
      { skipNulls: false, strictNullHandling: true }
    )
    option?.value &&
      trackEvent(CDActions.ApplyAdvancedFilter, {
        category: Category.PIPELINE
      })
  }

  const handleFilterClick = (filterIdentifier: string) => {
    if (filterIdentifier !== UNSAVED_FILTER_IDENTIFIER) {
      updateQueryParams(
        {
          filterIdentifier,
          filters: undefined,
          page: DEFAULT_PAGE_INDEX
        },
        { skipNulls: false, strictNullHandling: true }
      )
    }
  }

  const onApply = (inputFormData: FormikProps<PipelineFormType>['values']): void => {
    if (!isObjectEmpty(inputFormData)) {
      const filterFromFormData = getValidFilterArguments({ ...inputFormData }, 'PipelineSetup')
      updateQueryParams(
        { page: undefined, filterIdentifier: undefined, filters: filterFromFormData || {} },
        { skipNulls: false, strictNullHandling: true }
      )
      hideFilterDrawer()
      trackEvent(CDActions.ApplyAdvancedFilter, {
        category: Category.PIPELINE
      })
    } else {
      showError(getString('filters.invalidCriteria'), undefined, 'pipeline.invalid.criteria.error')
    }
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<PipelineFormType, FilterInterface>
  ) => {
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (typeof saveOrUpdateHandler === 'function') {
      const requestBodyPayload = createRequestBodyPayload({
        isUpdate,
        data,
        projectIdentifier,
        orgIdentifier
      })
      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
      updateQueryParams(
        { filters: updatedFilter?.filterProperties || {} },
        { skipNulls: false, strictNullHandling: true }
      )
      refetchFilterList()
      trackEvent(CDActions.ApplyAdvancedFilter, {
        category: Category.PIPELINE
      })
    }
  }

  const handleDelete = async (deleteIdentifier: string) => {
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(deleteIdentifier)
      reset()
      refetchFilterList()
    }
  }

  const pipelineTags = React.useMemo(
    () =>
      _pipelineTags?.reduce(
        (obj, item) => Object.assign(obj, { [item.key]: !isUndefined(item.value) ? item.value : null }),
        {}
      ),
    [_pipelineTags]
  )

  const reset = () => replaceQueryParams({})

  /**End Handlers */

  const filterFormValues = useMemo(() => {
    const formValues = {
      name: pipelineName,
      pipelineTags,
      description,
      branch,
      tag,
      sourceBranch,
      targetBranch,
      buildType,
      repositoryName,
      deploymentType: deploymentTypes,
      infrastructureType: infrastructureTypes ? infrastructureTypes[0] : undefined,
      services: getMultiSelectFormOptions(serviceNames, 'service'),
      environments: getMultiSelectFormOptions(environmentNames, 'environment')
    }
    const stringKeys: (keyof typeof formValues)[] = [
      'name',
      'description',
      'branch',
      'tag',
      'sourceBranch',
      'targetBranch',
      'repositoryName'
    ]

    // When a value changes from a string to undefined the input changes from uncontrolled to controlled, causing input to have stale values.
    // Using '' as the default value for string fields prevents this.
    stringKeys.forEach(key => {
      formValues[key] ??= ''
    })

    return formValues
  }, [
    _pipelineTags,
    branch,
    buildType,
    deploymentTypes,
    description,
    environmentNames,
    infrastructureTypes,
    pipelineName,
    repositoryName,
    serviceNames,
    sourceBranch,
    tag,
    targetBranch
  ])

  return (
    <Layout.Horizontal>
      <FilterSelector<FilterDTO>
        appliedFilter={appliedFilter}
        filters={filterList}
        refetchFilters={refetchFilterList}
        onFilterBtnClick={() => {
          filterDrawerOpenedRef.current = true
          openFilterDrawer()
        }}
        onFilterSelect={handleFilterSelection}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={filterWithValidFieldsWithMetaInfo}
      />
      <Filter<PipelineFormType, FilterDTO>
        isOpen={isFiltersDrawerOpen}
        formFields={
          <ExecutionListFilterForm<PipelineFormType>
            isCDEnabled={isCDEnabled}
            isCIEnabled={isCIEnabled}
            initialValues={{
              environments: getMultiSelectFormOptions(environmentsResponse?.data?.content, 'environment'),
              services: getMultiSelectFormOptions(servicesResponse?.data?.content, 'service'),
              deploymentType: deploymentTypeSelectOptions
            }}
            type="PipelineSetup"
          />
        }
        initialFilter={{
          formValues: filterFormValues,
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filterList}
        isRefreshingFilters={isFilterCrudLoading || isMetaDataLoading}
        onApply={onApply}
        onClose={hideFilterDrawer}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterClick}
        onClear={reset}
        ref={filterRef}
        dataSvcConfig={
          new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
            ['ADD', createFilter],
            ['UPDATE', updateFilter],
            ['DELETE', deleteFilter]
          ])
        }
        onSuccessfulCrudOperation={refetchFilterList}
      />
    </Layout.Horizontal>
  )
}
