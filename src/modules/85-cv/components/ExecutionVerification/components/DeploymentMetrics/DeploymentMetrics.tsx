/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Container,
  Text,
  Pagination,
  PageError,
  NoDataCard,
  Accordion,
  AccordionHandle,
  Checkbox,
  Layout,
  Button,
  ButtonVariation,
  MultiSelectDropDown,
  MultiSelectOption,
  Icon,
  Select,
  SelectOption
} from '@harness/uicore'
import cx from 'classnames'
import { isEqual } from 'lodash-es'
import { FontVariation, Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { GetDataError } from 'restful-react'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ExecutionNode } from 'services/pipeline-ng'
import {
  AnalysedDeploymentNode,
  GetMetricsAnalysisForVerifyStepExecutionIdQueryParams,
  HealthSourceV2,
  VerificationOverview,
  useGetMetricsAnalysisForVerifyStepExecutionId,
  useGetTransactionGroupsForVerifyStepExecutionId,
  useGetVerifyStepNodeNames
} from 'services/cv'
import type { ExecutionQueryParams } from '@pipeline/utils/executionUtils'
import { VerificationType } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown.constants'
import noDataImage from '@cv/assets/noData.svg'
import { VerificationJobType } from '@cv/constants'
import { POLLING_INTERVAL, PAGE_SIZE, DATA_OPTIONS, INITIAL_PAGE_NUMBER } from './DeploymentMetrics.constants'
import { RefreshViewForNewData } from '../RefreshViewForNewDataButton/RefreshForNewData'
import {
  DeploymentMetricsAnalysisRow,
  DeploymentMetricsAnalysisRowProps
} from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow'
import {
  transformMetricData,
  getErrorMessage,
  getAccordionIds,
  getDropdownItems,
  getInitialNodeName,
  getQueryParamForHostname,
  getQueryParamFromFilters,
  getFilterDisplayText,
  getShouldShowSpinner,
  getShouldShowError,
  isErrorOrLoading,
  isStepRunningOrWaiting,
  generateHealthSourcesOptionsData,
  getPaginationInfo
} from './DeploymentMetrics.utils'
import MetricsAccordionPanelSummary from './components/DeploymentAccordionPanel/MetricsAccordionPanelSummary'
import { HealthSourceMultiSelectDropDown } from '../HealthSourcesMultiSelectDropdown/HealthSourceMultiSelectDropDown'
import DeploymentMetricsLables from './components/DeploymentMetricsLables'
import type { StartTimestampDataType } from './DeploymentMetrics.types'

import css from './DeploymentMetrics.module.scss'

interface HealthSourcesDetailsType {
  healthSourcesData: HealthSourceV2[] | null
  healthSourcesError: GetDataError<unknown> | null
  healthSourcesLoading: boolean
  fetchHealthSources: () => Promise<void>
}

interface DeploymentMetricsProps {
  step: ExecutionNode
  activityId: string
  selectedNode?: AnalysedDeploymentNode
  overviewData: VerificationOverview | null
  overviewLoading?: boolean
  healthSourceDetails: HealthSourcesDetailsType
}

type UpdateViewState = {
  hasNewData: boolean
  shouldUpdateView: boolean
  currentViewData: DeploymentMetricsAnalysisRowProps[]
  showSpinner: boolean
}

export function DeploymentMetrics(props: DeploymentMetricsProps): JSX.Element {
  const {
    step,
    selectedNode,
    activityId,
    overviewData,
    overviewLoading,
    healthSourceDetails: { fetchHealthSources, healthSourcesData, healthSourcesError, healthSourcesLoading }
  } = props
  const { getString } = useStrings()
  const pageParams = useQueryParams<ExecutionQueryParams>()

  const { controlDataStartTimestamp = 0, testDataStartTimestamp = 0, spec: overviewSpec = {} } = overviewData || {}

  const isSimpleVerification = overviewSpec?.analysisType === VerificationJobType.SIMPLE

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const startTimestampData: StartTimestampDataType = {
    controlDataStartTimestamp,
    testDataStartTimestamp,
    durationInMinutes: overviewSpec.durationInMinutes || 0
  }

  const [anomalousMetricsFilterChecked, setAnomalousMetricsFilterChecked] = useState(
    pageParams.filterAnomalous === 'true'
  )
  const [queryParams, setQueryParams] = useState<GetMetricsAnalysisForVerifyStepExecutionIdQueryParams>({
    anomalousMetricsOnly: anomalousMetricsFilterChecked,
    node: getQueryParamForHostname(selectedNode?.hostName),
    pageIndex: INITIAL_PAGE_NUMBER,
    pageSize: PAGE_SIZE
  })

  const accordionRef = useRef<AccordionHandle>(null)
  const [pollingIntervalId, setPollingIntervalId] = useState(-1)
  const [selectedHealthSources, setSelectedHealthSources] = useState<MultiSelectOption[]>([])
  const [selectedNodeName, setSelectedNodeName] = useState<MultiSelectOption[]>(() => getInitialNodeName(selectedNode))
  const [selectedTransactionName, setSelectedTransactionName] = useState<MultiSelectOption[]>([])
  const [selectedDataFormat, setSelectedDataFormat] = useState<SelectOption>(DATA_OPTIONS[0])
  const [{ hasNewData, shouldUpdateView, currentViewData, showSpinner }, setUpdateViewInfo] = useState<UpdateViewState>(
    {
      hasNewData: false,
      showSpinner: true,
      shouldUpdateView: true,
      currentViewData: []
    }
  )
  const { loading, error, data, refetch } = useGetMetricsAnalysisForVerifyStepExecutionId({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    verifyStepExecutionId: activityId,
    queryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })
  const paginationInfo = getPaginationInfo(data)

  const {
    data: transactionGroup,
    loading: transactionNameLoading,
    error: transactionNameError
  } = useGetTransactionGroupsForVerifyStepExecutionId({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    verifyStepExecutionId: activityId
  })

  const {
    data: nodeNames,
    loading: nodeNamesLoading,
    error: nodeNamesError
  } = useGetVerifyStepNodeNames({
    verifyStepExecutionId: activityId,
    queryParams: {
      accountId
    },
    lazy: isSimpleVerification
  })

  const accordionIdsRef = useRef<string[]>([])

  useEffect(() => {
    accordionIdsRef.current = getAccordionIds(currentViewData)
  }, [currentViewData])

  const getFilteredText = useCallback((selectedOptions: MultiSelectOption[] = [], filterText = ' '): string => {
    const baseText = getString(filterText)
    return getFilterDisplayText(selectedOptions, baseText, getString('all'))
  }, [])

  useEffect(() => {
    if (activityId) {
      fetchHealthSources()
    }
    setPollingIntervalId(-1)
    setUpdateViewInfo({ currentViewData: [], hasNewData: false, shouldUpdateView: true, showSpinner: true })
    setQueryParams(oldParams => ({
      ...oldParams,
      node: undefined,
      pageIndex: INITIAL_PAGE_NUMBER
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId])

  useEffect(() => {
    let intervalId = pollingIntervalId
    clearInterval(intervalId)
    if (isStepRunningOrWaiting(step?.status)) {
      // eslint-disable-next-line
      // @ts-ignore
      intervalId = setInterval(refetch, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }

    return () => clearInterval(intervalId)
  }, [step?.status, queryParams])

  useEffect(() => {
    const updatedQueryParams = {
      ...queryParams,
      node: getQueryParamForHostname(selectedNode?.hostName)
    }
    if (!isEqual(updatedQueryParams, queryParams)) {
      setQueryParams(updatedQueryParams)
    }

    setSelectedNodeName(getInitialNodeName(selectedNode))

    setUpdateViewInfo(oldState => ({ ...oldState, shouldUpdateView: true, showSpinner: true }))
  }, [selectedNode])

  useEffect(() => {
    if (isErrorOrLoading({ error, loading, overviewLoading })) {
      return
    }
    const updatedProps = transformMetricData(selectedDataFormat, startTimestampData, data)

    if (shouldUpdateView) {
      setUpdateViewInfo({
        hasNewData: false,
        shouldUpdateView: false,
        currentViewData: updatedProps,
        showSpinner: false
      })
    } else {
      setUpdateViewInfo(prevState => ({
        ...prevState,
        hasNewData: !isEqual(prevState?.currentViewData, updatedProps),
        showSpinner: false
      }))
    }
  }, [data, overviewData, overviewLoading])

  useEffect(() => {
    setQueryParams(oldQueryParams => ({
      ...oldQueryParams,
      pageIndex: INITIAL_PAGE_NUMBER,
      anomalousMetricsOnly: anomalousMetricsFilterChecked
    }))
    setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
  }, [anomalousMetricsFilterChecked])

  useEffect(() => {
    const healthSourceQueryParams = selectedHealthSources.map(item => item.value) as string[]
    const transactionNameParams = selectedTransactionName.map(item => item.value) as string[]
    const nodeNameParams = selectedNodeName.map(item => item.value) as string[]

    setQueryParams(prevQueryParams => ({
      ...prevQueryParams,
      pageIndex: INITIAL_PAGE_NUMBER,
      healthSource: getQueryParamFromFilters(healthSourceQueryParams),
      transactionGroup: getQueryParamFromFilters(transactionNameParams),
      node: getQueryParamFromFilters(nodeNameParams)
    }))
    setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
  }, [selectedHealthSources, selectedTransactionName, selectedNodeName])

  const showClearFilters = useMemo(() => {
    return Boolean(
      selectedHealthSources.length > 0 ||
        selectedTransactionName.length > 0 ||
        selectedNodeName.length > 0 ||
        anomalousMetricsFilterChecked === true
    )
  }, [
    anomalousMetricsFilterChecked,
    selectedHealthSources.length,
    selectedNodeName.length,
    selectedTransactionName.length
  ])

  const handleHealthSourceChange = useCallback(selectedHealthSourceFitlers => {
    setSelectedHealthSources(selectedHealthSourceFitlers)
  }, [])

  const handleTransactionNameChange = useCallback(selectedTransactionNameFitlers => {
    setSelectedTransactionName(selectedTransactionNameFitlers)
  }, [])

  const handleNodeNameChange = useCallback(selectedNodeNameFitlers => {
    setSelectedNodeName(selectedNodeNameFitlers)
  }, [])

  const hanldeDataFormatChange = useCallback(
    dataFormat => {
      const updatedData = transformMetricData(dataFormat, startTimestampData, data)
      setUpdateViewInfo(prevState => ({
        ...prevState,
        currentViewData: updatedData
      }))
      setSelectedDataFormat(dataFormat)
    },
    [data, overviewData]
  )

  const updatedAnomalousMetricsFilter = useCallback(
    () => setAnomalousMetricsFilterChecked(currentFilterStatus => !currentFilterStatus),
    []
  )

  const getNoDataAvailableOrError = (): boolean | null =>
    (!currentViewData?.length && !loading) || getShouldShowError(error, shouldUpdateView)

  const healthSourcesDataOptions = useMemo(
    () => generateHealthSourcesOptionsData(healthSourcesData),
    [healthSourcesData]
  )

  const renderContent = (): JSX.Element => {
    if (getShouldShowSpinner(loading, showSpinner) || overviewLoading) {
      return <Icon name="steps-spinner" className={css.loading} color={Color.GREY_400} size={30} />
    }

    if (getShouldShowError(error, shouldUpdateView)) {
      return <PageError message={getErrorMessage(error)} onClick={() => refetch()} className={css.error} />
    }

    if (!currentViewData?.length) {
      return (
        <Container className={css.noData}>
          <NoDataCard
            onClick={() => refetch()}
            message={getString('cv.monitoredServices.noMatchingData')}
            image={noDataImage}
          />
        </Container>
      )
    }

    return (
      <>
        <DeploymentMetricsLables isSimpleVerification={isSimpleVerification} />
        <Accordion
          allowMultiOpen
          panelClassName={css.deploymentMetricsAccordionPanel}
          summaryClassName={css.deploymentMetricsAccordionSummary}
          ref={accordionRef}
        >
          {currentViewData?.map(analysisRow => {
            const { transactionName, metricName, healthSource } = analysisRow || {}
            const { type } = healthSource || {}
            return (
              <Accordion.Panel
                key={`${transactionName}-${metricName}-${type}`}
                id={`${transactionName}-${metricName}-${type}`}
                summary={
                  <MetricsAccordionPanelSummary analysisRow={analysisRow} isSimpleVerification={isSimpleVerification} />
                }
                details={
                  <DeploymentMetricsAnalysisRow
                    key={`${transactionName}-${metricName}-${type}`}
                    {...analysisRow}
                    selectedDataFormat={selectedDataFormat}
                    className={css.analysisRow}
                    startTimestampData={startTimestampData}
                    isSimpleVerification={isSimpleVerification}
                  />
                }
              />
            )
          })}
        </Accordion>
      </>
    )
  }

  const resetFilters = useCallback(() => {
    setSelectedTransactionName([])
    setSelectedHealthSources([])
    setSelectedNodeName(() => getInitialNodeName(selectedNode))
    setAnomalousMetricsFilterChecked(false)
  }, [selectedNode])

  return (
    <Container className={css.main}>
      <Container className={css.filters}>
        <Icon name="filter" />
        <MultiSelectDropDown
          placeholder={getFilteredText(selectedTransactionName, 'rbac.group')}
          value={selectedTransactionName}
          className={css.filterDropdown}
          items={getDropdownItems(transactionGroup, transactionNameLoading, transactionNameError)}
          onChange={handleTransactionNameChange}
          buttonTestId={'transaction_name_filter'}
        />
        {!isSimpleVerification && (
          <MultiSelectDropDown
            placeholder={getFilteredText(selectedNodeName, 'pipeline.nodesLabel')}
            value={selectedNodeName}
            className={css.filterDropdown}
            items={getDropdownItems(nodeNames?.resource as string[], nodeNamesLoading, nodeNamesError)}
            onChange={handleNodeNameChange}
            buttonTestId="node_name_filter"
          />
        )}
        <HealthSourceMultiSelectDropDown
          data={healthSourcesDataOptions}
          loading={healthSourcesLoading}
          error={healthSourcesError}
          onChange={handleHealthSourceChange}
          verificationType={VerificationType.TIME_SERIES}
          selectedValues={selectedHealthSources}
          className={css.filterDropdown}
        />
        <Select
          name="data"
          className={css.filterDropdown}
          value={selectedDataFormat}
          items={DATA_OPTIONS}
          disabled={isSimpleVerification}
          onChange={hanldeDataFormatChange}
        />
        {showClearFilters ? (
          <Button
            className={css.clearButton}
            variation={ButtonVariation.LINK}
            onClick={resetFilters}
            data-testid="filter-reset"
          >
            {getString('common.filters.clearFilters')}
          </Button>
        ) : null}
      </Container>
      <Checkbox
        onChange={updatedAnomalousMetricsFilter}
        checked={anomalousMetricsFilterChecked}
        label={
          isSimpleVerification
            ? getString('pipeline.verification.anomalousMetricsFilterWithoutNodesLabel')
            : getString('pipeline.verification.anomalousMetricsFilterLabel')
        }
        data-testid="anomalousFilterCheckbox"
        className={css.anomolousCheckbox}
      />
      <Layout.Horizontal className={css.filterSecondRow} border={{ bottom: true }}>
        <Container className={css.accordionToggleButtons}>
          {Boolean(currentViewData.length) && (
            <>
              <Button
                onClick={() => accordionRef.current?.open(accordionIdsRef.current)}
                variation={ButtonVariation.LINK}
                border={{ right: true }}
              >
                {getString('pipeline.verification.expandAll')}
              </Button>
              <Button
                onClick={() => accordionRef.current?.close(accordionIdsRef.current)}
                variation={ButtonVariation.LINK}
              >
                {getString('pipeline.verification.collapseAll')}
              </Button>
            </>
          )}
        </Container>
        <Layout.Horizontal>
          {pollingIntervalId !== -1 && hasNewData && (
            <RefreshViewForNewData
              className={css.refreshButton}
              onClick={() => {
                setUpdateViewInfo(prevState => ({
                  ...prevState,
                  hasNewData: false,
                  currentViewData: transformMetricData(selectedDataFormat, startTimestampData, data)
                }))
              }}
            />
          )}
          {!isSimpleVerification && (
            <Layout.Horizontal className={css.legend} data-testid="metrics_legend">
              <span className={css.predicted} />
              <Text font={{ variation: FontVariation.SMALL }}> {getString('platform.connectors.cdng.baseline')}</Text>
              <span className={css.actualFail} />
              <span className={css.actualWarning} />
              <span className={css.actualObserve} />
              <span className={css.actualHealthy} />
              <Text font={{ variation: FontVariation.SMALL }}>{getString('common.current')}</Text>
            </Layout.Horizontal>
          )}
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Container
        className={cx(css.content, {
          [css.whiteBackground]: getNoDataAvailableOrError()
        })}
      >
        {renderContent()}
      </Container>
      <Pagination
        className={css.metricsPagination}
        pageSize={paginationInfo.pageSize as number}
        pageCount={paginationInfo.totalPages as number}
        itemCount={paginationInfo.totalItems as number}
        pageIndex={paginationInfo.pageIndex}
        gotoPage={selectedPage => {
          setQueryParams(oldQueryParams => ({ ...oldQueryParams, pageIndex: selectedPage }))
          setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
        }}
      />
    </Container>
  )
}
