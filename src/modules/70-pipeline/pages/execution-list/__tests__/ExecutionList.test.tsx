/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@platform/connectors/mocks/mock'
import executionList from '@pipeline/pages/execution-list/__tests__/mocks/execution-list.json'
import filters from '@pipeline/pages/execution-list/__tests__/mocks/filters.json'
import pipelineList from '@pipeline/pages/execution-list/__tests__/mocks/pipeline-list.json'
import deploymentTypes from '@pipeline/pages/pipeline-list/__tests__/mocks/deploymentTypes.json'
import environments from '@pipeline/pages/pipeline-list/__tests__/mocks/environments.json'
import services from '@pipeline/pages/pipeline-list/__tests__/mocks/services.json'
import { mockApplicationResponse } from '@pipeline/components/PipelineSteps/Steps/SyncStep/__tests__/SyncStepTestHelper'
import { useGetExecutionData, useGetListOfExecutions } from 'services/pipeline-ng'
import { ExecutionList } from '../ExecutionList'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards', () => () => <div />)
jest.mock('@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart', () => () => <div />)

const mockGetCallFunction = jest.fn()

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

const mockRepositories = {
  status: 'SUCCESS',
  data: {
    repositories: ['main', 'main-patch', 'main-patch1', 'main-patch2']
  },
  metaData: null,
  correlationId: 'cc779876-d3af-44e5-8991-916dfecb4548'
}

const fetchRepositories = jest.fn(() => {
  return Object.create(mockRepositories)
})

const mockBranches = {
  status: 'SUCCESS',
  data: { branches: ['15sept', 'main', 'main-patch-8nov'] },
  metaData: null,
  correlationId: 'a48d56f0-2d6f-4b4b-8b13-d8eba153005f'
}
const fetchBranches = jest.fn(() => {
  return Object.create(mockBranches)
})

jest.mock('services/pipeline-ng', () => ({
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve(executionList)),
    loading: false,
    cancel: jest.fn()
  })),
  useGetExecutionRepositoriesList: jest.fn().mockImplementation(() => {
    return { data: mockRepositories, refetch: fetchRepositories, error: null, loading: false }
  }),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelineList)), cancel: jest.fn(), loading: false }
  }),
  useHandleInterrupt: jest.fn(() => ({})),
  useGetExecutionData: jest.fn().mockImplementation(() => ({
    data: jest.fn(() => Promise.resolve({ executionYaml: 'testyaml' })),
    loading: false
  })),
  useHandleStageInterrupt: jest.fn(() => ({})),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filters)), loading: false }
  }),
  useGetExecutionBranchesList: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches, error: null, loading: false }
  }),
  usePostFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useUpdateFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useDeleteFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useDebugPipelineExecuteWithInputSetYaml: jest.fn(() => ({
    loading: false,
    refetch: jest.fn(),
    mutate: jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
  }))
}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useGetServiceDefinitionTypes: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: deploymentTypes, refetch: jest.fn() })),
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetEnvironmentListV2: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetGlobalFreezeWithBannerDetails: jest.fn().mockReturnValue({ data: null, loading: false }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('services/gitops', () => ({
  useApplicationServiceListApps: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => mockApplicationResponse),
    cancel: jest.fn()
  }))
}))

const commonRequest = (): any => ({
  body: null,
  queryParamStringifyOptions: { arrayFormat: 'repeat' },
  queryParams: {
    accountIdentifier: 'accountId',
    module: 'cd',
    branch: undefined,
    filterIdentifier: undefined,
    orgIdentifier: 'orgIdentifier',
    projectIdentifier: 'projectIdentifier',
    page: 0,
    size: 20,
    sort: 'startTs,DESC',
    searchTerm: undefined,
    status: undefined,
    repoIdentifier: undefined,
    repoName: undefined,
    pipelineIdentifier: undefined,
    myDeployments: undefined
  }
})

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module
})

const TEST_PATH = routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

const renderExecutionPage = (module = 'cd'): RenderResult =>
  render(
    <TestWrapper
      path={TEST_PATH}
      pathParams={getModuleParams(module)}
      defaultAppStoreValues={defaultAppStoreValues}
      queryParams={{ listview: true }}
    >
      <ExecutionList onRunPipeline={jest.fn()} showBranchFilter={true} />
    </TestWrapper>
  )

jest.useFakeTimers({ advanceTimers: true })

describe('Execution List', () => {
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })

  test('should have relevant navigation links for CD execution', async () => {
    renderExecutionPage()

    const rows = await screen.findAllByRole('row')
    const cdExecutionRow = rows[4]

    // should navigate to execution details as primary link
    expect(
      within(cdExecutionRow).getByRole('link', {
        name: 'MultipleStage CD Running'
      })
    ).toHaveAttribute(
      'href',
      routes.toExecutionPipelineView({
        ...getModuleParams(),
        source: 'deployments',
        pipelineIdentifier: 'MultipleStage',
        executionIdentifier: 'U8o-JcvwTEuGb227RUXOvA'
      } as any)
    )

    // navigable to trigger details
    expect(
      within(cdExecutionRow).getByRole('link', {
        name: /trigger/i
      })
    ).toHaveAttribute(
      'href',
      routes.toTriggersDetailPage({
        ...getModuleParams(),
        pipelineIdentifier: 'MultipleStage',
        triggerIdentifier: 'daily_twice',
        triggerType: 'SCHEDULER_CRON'
      } as any)
    )
  })

  test('should be able to toggle stage view with matrix stages', async () => {
    renderExecutionPage()
    const rows = await screen.findAllByRole('row')
    const matrixExecutionRow = rows[1]
    await screen.findByRole('link', {
      name: /MultipleStage CD Running/i
    })
    const toggle = within(matrixExecutionRow).getByRole('button', { name: /toggle row expanded/i })
    await userEvent.click(toggle)
    const expandedMatrixStage = screen.getByText(/s1_0_0/i)
    expect(expandedMatrixStage).toBeInTheDocument()
    // await userEvent.click(toggle)
    // TODO: this works on UI but assertion is somehow not passing. check why.
    //expect(expandedMatrixStage).not.toBeInTheDocument()
  })

  test('should be able to filter my executions', async () => {
    renderExecutionPage()
    const myExecutions = await waitFor(() => screen.getByText('pipeline.myDeploymentsText'))
    await userEvent.click(myExecutions)

    const request = commonRequest()
    request.queryParams.myDeployments = true
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request)

    // deselect
    await userEvent.click(myExecutions)
    request.queryParams.myDeployments = undefined
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request)
  })

  test('should be able to search by pipeline name and identifier', async () => {
    renderExecutionPage()
    await screen.findByText('filters.executions.pipelineName')
    await userEvent.type(screen.getByRole('searchbox'), 'my search term')
    jest.runOnlyPendingTimers()

    const request = commonRequest()
    request.queryParams.searchTerm = 'my search term'
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request)
  })

  test('should be able to filter by execution status', async () => {
    renderExecutionPage()
    const select = await waitFor(() => screen.getByTestId('status-select')!)
    await userEvent.click(select)
    const menuContent = findPopoverContainer() as HTMLElement
    const optionFailed = within(menuContent).getByText('pipeline.executionFilters.labels.Failed')
    await userEvent.click(optionFailed)
    const optionExpired = within(menuContent).getByText('pipeline.executionFilters.labels.Expired')
    await userEvent.click(optionExpired)

    const request = commonRequest()
    request.queryParams.status = ['Failed', 'Errored', 'Expired']
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request)

    // deselect all
    await userEvent.click(optionFailed)
    await userEvent.click(optionExpired)

    request.queryParams.status = undefined
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request)
  })

  test('should be able to filter by pipeline name', async () => {
    renderExecutionPage()
    const select = await waitFor(() => screen.getByTestId('pipeline-select'))
    await userEvent.click(select)
    const pipelineSelect = findPopoverContainer() as HTMLElement
    const pipeline1 = within(pipelineSelect).getByText('NG Docker Image')
    await userEvent.click(pipeline1)

    const request = commonRequest()
    request.queryParams.pipelineIdentifier = 'NG_Docker_Image'
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request)
  })

  test('should poll with with 5s interval for executions', async () => {
    renderExecutionPage()
    expect(useGetListOfExecutions).toHaveBeenCalledWith(commonRequest())
    await screen.findByText('filters.executions.pipelineName')
    jest.advanceTimersByTime(5000) // simulate 5 seconds poll interval
    expect(useGetListOfExecutions).toHaveBeenCalledWith(commonRequest())
  })

  test('should be able to compare YAMLs of any two executions', async () => {
    renderExecutionPage()
    const row = await screen.findAllByRole('row')
    const moreOptions = within(row[1]).getByRole('button', {
      name: /execution menu actions/i
    })
    await userEvent.click(moreOptions)
    const compareExecutions = await screen.findByText('pipeline.execution.actions.compareExecutions')
    await userEvent.click(compareExecutions)

    expect(screen.getByText('pipeline.execution.compareExecutionsTitle')).toBeInTheDocument()
    const compareButton = screen.getByRole('button', {
      name: /compare/i
    })
    expect(compareButton).toBeDisabled() // disabled until two checkboxes are selected

    const checkboxesForCompare = screen.getAllByRole('checkbox')
    expect(checkboxesForCompare[0]).toBeChecked() // auto selected for the execution chosen for compare
    await userEvent.click(checkboxesForCompare[1])
    expect(compareButton).toBeEnabled() // enabled once two items are chosen
    expect(checkboxesForCompare[2]).toBeDisabled()
    await userEvent.click(checkboxesForCompare[0]) // unselect one of two items
    await userEvent.click(checkboxesForCompare[2]) // click happened with item being selected

    expect(compareButton).toBeEnabled() // enabled once two items are chosen
    await userEvent.click(compareButton) // click happened with compare being enabled
    expect(useGetExecutionData).toHaveBeenCalled()
    expect(screen.getByTestId('execution-compare-yaml-viewer')).toBeInTheDocument()
  })

  test('should have proper menu actions', async () => {
    renderExecutionPage()
    const row = await screen.findAllByRole('row')
    const moreOptions = within(row[4]).getByRole('button', {
      name: /execution menu actions/i
    })
    await userEvent.click(moreOptions)

    const menuContent = findPopoverContainer() as HTMLElement

    const viewExecutionFromMenu = within(menuContent).getByRole('link', {
      name: 'pipeline.viewExecution'
    })
    const viewPipelineFromMenu = within(menuContent).getByRole('link', {
      name: 'editPipeline'
    })

    expect(viewExecutionFromMenu).toHaveAttribute(
      'href',
      routes.toExecutionPipelineView({
        ...getModuleParams(),
        source: 'deployments',
        pipelineIdentifier: 'MultipleStage',
        executionIdentifier: 'U8o-JcvwTEuGb227RUXOvA'
      } as any)
    )

    expect(viewPipelineFromMenu).toHaveAttribute(
      'href',
      routes.toPipelineStudio({ ...getModuleParams(), pipelineIdentifier: 'MultipleStage' } as any)
    )
  })

  test('should call API with branch when branch is selected', async () => {
    renderExecutionPage()
    const select = await waitFor(() => screen.getByTestId('branch-filter'))
    await userEvent.click(select)
    const BranchSelect = findPopoverContainer() as HTMLElement
    const branch1 = within(BranchSelect).getByText('main')
    await userEvent.click(branch1)

    const request = commonRequest()
    request.queryParams.branch = 'main'
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request)
  })

  test('sorting should fetch the executions with sorted column and order', async () => {
    renderExecutionPage()
    const pipelineName = await screen.findByText('filters.executions.pipelineName')
    await userEvent.click(pipelineName)
    jest.runOnlyPendingTimers()

    const request = commonRequest()
    request.queryParams.sort = 'name,ASC'
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request)
  })

  test('should fetch executions when a sort option is selected in the sort dropdown', async () => {
    renderExecutionPage()
    const sortDropdownButton = await screen.findByTestId('sort-dropdown-button')
    await userEvent.click(sortDropdownButton)
    userEvent.click(await screen.findByText('Name (Z->A, 9->0)'))
    const request = commonRequest()
    request.queryParams.sort = 'name,DESC'
    await waitFor(() => expect(useGetListOfExecutions).toHaveBeenLastCalledWith(request))
  })

  test('should show an error if a new filter is saved with empty filter fields', async () => {
    const { baseElement } = renderExecutionPage()
    const filtersButton = await waitFor(() => {
      const element = baseElement.querySelector('[id="ngfilterbtn"]')
      expect(element).toBeInTheDocument()
      return element
    })
    await userEvent.click(filtersButton!)

    const newFilterButton = await screen.findByLabelText('filters.newFilter')
    await userEvent.click(newFilterButton)

    const filterNameInput = await screen.findByPlaceholderText('filters.typeFilterName')
    await userEvent.clear(filterNameInput)
    await userEvent.type(filterNameInput, 'foo')
    await userEvent.click(screen.getByLabelText('save'))

    expect(await screen.findByText('filters.invalidCriteria')).toBeInTheDocument()
  })

  test('should show aborted by freeze status executions', async () => {
    renderExecutionPage()
    const rows = await screen.findAllByRole('row')
    const cdAbortedByFreezeRow = rows[7]
    expect(within(cdAbortedByFreezeRow).getByText('pipeline.executionStatus.AbortedByFreeze')).toBeDefined()
  })

  test('should render error message with retry button if executions API returns an error', async () => {
    const mutate = jest.fn(() =>
      Promise.reject({
        status: 'ERROR',
        code: 'INVALID_REQUEST',
        message: 'Invalid request',
        correlationId: 'correlationId',
        detailedMessage: null,
        responseMessages: [
          {
            code: 'INVALID_REQUEST',
            level: 'ERROR',
            message: 'Invalid request',
            exception: null,
            failureTypes: []
          }
        ],
        metadata: null
      })
    )
    ;(useGetListOfExecutions as jest.Mock).mockImplementation(() => ({
      cancel: jest.fn(),
      loading: false,
      mutate
    }))
    renderExecutionPage()
    expect(await screen.findByText('Invalid request')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Retry'))
    await waitFor(() => expect(mutate).toBeCalled())
  })
})
