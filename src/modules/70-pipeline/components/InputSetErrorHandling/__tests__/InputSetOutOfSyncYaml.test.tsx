/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText as findByTextBody, RenderResult, waitFor, screen, findByRole } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { noop } from 'lodash-es'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import * as pipelineng from 'services/pipeline-ng'
import { accountPathProps, pipelineModuleParams, inputSetFormPathProps } from '@common/utils/routeUtils'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@platform/connectors/mocks/mock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import mockImport from 'framework/utils/mockImport'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import { StoreType } from '@common/constants/GitSyncTypes'
import gitSyncListResponse from '@common/utils/__tests__/mocks/gitSyncRepoListMock.json'
import { gitHubMock } from '@gitsync/components/gitSyncRepoForm/__tests__/mockData'
import { EnhancedInputSetForm } from '../../InputSetForm/InputSetForm'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  MergeInputSetResponse,
  MergedPipelineResponse
} from '../../InputSetForm/__tests__/InputSetMocks'
import {
  GetInputSetsInlineResponse,
  GetInputSetsOldGitSyncResponse,
  GetInputSetsRemoteGitSyncResponse,
  GetInputSetYamlDiffInline,
  GetInputSetYamlDiffOldGitSync,
  GetInputSetYamlDiffRemote,
  GetInvalidInputSetInline,
  GetInvalidInputSetOldGitSync,
  GetInvalidInputSetRemote,
  GetInvalidOverlayISInline,
  GetYamlDiffDelResponse,
  mockBranches,
  mockErrorMessage,
  mockRepos
} from './InputSetErrorHandlingMocks'

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS', data: {} })
jest.mock('@common/utils/YamlUtils', () => ({}))

function YamlMock({ children, bind }: { children: JSX.Element; bind: YamlBuilderProps['bind'] }): React.ReactElement {
  const handler = React.useMemo(
    () =>
      ({
        getLatestYaml: () => GetInvalidInputSetInline.data?.data?.inputSetYaml || '',
        getYAMLValidationErrorMap: () => new Map()
      } as YamlBuilderHandlerBinding),
    []
  )

  React.useEffect(() => {
    bind?.(handler)
  }, [bind, handler])
  return (
    <div>
      <span>Yaml View</span>
      {children}
    </div>
  )
}

YamlMock.YamlBuilderMemo = YamlMock

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => YamlMock)

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))
const getGitConnector = jest.fn(() => Promise.resolve(gitHubMock))
const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useCreatePR: jest.fn(() => noop),
  useCreatePRV2: jest.fn(() => noop),
  useGetSettingValue: jest.fn(() => noop),
  useGetSettingsList: jest.fn().mockImplementation(() => {
    return { data: { data: [] } }
  }),
  useGetFileContent: jest.fn(() => noop),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(gitHubMock)),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: mockRepos, refetch: fetchRepos, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  }),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(props => {
    if (props.name === 'useGetYamlWithTemplateRefsResolved') {
      return MergedPipelineResponse
    } else {
      return TemplateResponse
    }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetForPipeline: jest.fn(() => GetInvalidInputSetInline),
  useCreateVariablesV2: () => jest.fn(() => ({})),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => MergeInputSetResponse),
  useGetPipeline: jest.fn(() => PipelineResponse),
  useDeleteInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useGetTemplateFromPipeline: jest.fn(() => TemplateResponse),
  useGetStagesExecutionList: jest.fn(() => ({})),
  useGetOverlayInputSetForPipeline: jest.fn(() => GetInvalidOverlayISInline),
  useCreateInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsInlineResponse),
  useGetSchemaYaml: jest.fn(() => ({})),
  useGetStaticSchemaYaml: jest.fn(() => ({})),
  useYamlDiffForInputSet: jest.fn(() => GetInputSetYamlDiffInline)
}))

const mockSuccessHandler = jest.fn()
const mockErrorHandler = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: mockSuccessHandler,
    showError: jest.fn()
  })
}))

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const TEST_INPUT_SET_FORM_PATH = routes.toInputSetForm({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

const clickOnReconcileButton = async (): Promise<void> => {
  const reconcileMenuOption = await screen.findByRole('button', {
    name: /input set menu actions/i
  })
  await userEvent.click(reconcileMenuOption)
  const reconcileBtn = await screen.findByText('pipeline.outOfSyncErrorStrip.reconcile')
  await userEvent.click(reconcileBtn)
  expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()
}

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path={TEST_INPUT_SET_FORM_PATH}
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        pipelineIdentifier: 'testpip',
        inputSetIdentifier: 'test_input_set',
        module: 'cd'
      }}
      queryParams={{
        storeType: 'INLINE'
      }}
      defaultAppStoreValues={defaultAppStoreValues}
    >
      <PipelineContext.Provider
        value={
          {
            state: { pipeline: { name: '', identifier: '' } } as any,
            getStageFromPipeline: jest.fn((_stageId, pipeline) => ({
              stage: pipeline.stages[0],
              parent: undefined
            }))
          } as any
        }
      >
        <EnhancedInputSetForm />
      </PipelineContext.Provider>
    </TestWrapper>
  )
}

const renderGitSyncComponent = (): RenderResult => {
  return render(
    <GitSyncTestWrapper
      path={TEST_INPUT_SET_FORM_PATH}
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        pipelineIdentifier: 'testpip',
        inputSetIdentifier: 'test_input_set',
        module: 'cd'
      }}
      queryParams={{
        repoIdentifier: 'oldgitsyncharness',
        branch: 'master'
      }}
      defaultAppStoreValues={{ ...defaultAppStoreValues, isGitSyncEnabled: true }}
    >
      <EnhancedInputSetForm />
    </GitSyncTestWrapper>
  )
}

const renderGitSimpComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path={TEST_INPUT_SET_FORM_PATH}
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        pipelineIdentifier: 'testpip',
        inputSetIdentifier: 'test_input_set',
        module: 'cd'
      }}
      queryParams={{
        repoName: 'git-sync-harness',
        branch: 'master',
        connectorRef: 'Eric_Git_Con',
        storeType: StoreType.REMOTE
      }}
      defaultAppStoreValues={{
        ...defaultAppStoreValues,
        supportingGitSimplification: true
      }}
    >
      <EnhancedInputSetForm />
    </TestWrapper>
  )
}

describe('Inline Input Set Error Exp', () => {
  test('should render input set menu action button', async () => {
    renderComponent()
    expect(
      screen.getByRole('button', {
        name: /input set menu actions/i
      })
    ).toBeDefined()
  })

  test('should not open reconcile dialog on clicking reconcile button, when loading state is true', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn(),
        error: null
      }
    })
    renderComponent()

    await clickOnReconcileButton()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await waitFor(() => expect(reconcileDialog).toBeFalsy())
  })

  test('should open reconcile dialog on clicking reconcile button, when loading state is false & input set is not empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetInputSetYamlDiffInline)
    renderComponent()

    await clickOnReconcileButton()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await findByTextBody(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.removeInvalidFields' })

    await userEvent.click(removeInvalidFieldBtn)
    await waitFor(() => expect(pipelineng.useUpdateInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled())
  })

  test('should open delete input set modal on clicking reconcile button, if input set is empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetYamlDiffDelResponse)
    jest.spyOn(pipelineng, 'useDeleteInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.resolve({
            status: 'SUCCESS'
          })
      }
    })
    renderComponent()

    await clickOnReconcileButton()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidInputSetDesc1')
    const deleteInputSetBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.deleteInputSet' })

    await userEvent.click(deleteInputSetBtn)
    await waitFor(() => expect(pipelineng.useDeleteInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled())
  })

  test('should navigate to input set list view on clicking go back to input set list button', async () => {
    const { getByTestId } = renderComponent()
    await clickOnReconcileButton()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidInputSetDesc1')

    const goBackToInputSetListBtn = screen.getByRole('button', { name: 'pipeline.inputSets.goBackToInputSetList' })
    await userEvent.click(goBackToInputSetListBtn)

    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent(
      '/account/dummy/cd/orgs/dummy/projects/dummy/pipelines/testpip/input-sets?storeType=INLINE'
    )
  })

  test('should not delete input set as status is FAILURE', async () => {
    jest.spyOn(pipelineng, 'useDeleteInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.resolve({
            status: 'FAILURE',
            message: 'somethingWentWrong'
          })
      }
    })
    renderComponent()

    await clickOnReconcileButton()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidInputSetDesc1')
    const deleteInputSetBtn = screen.getByRole('button', { name: 'pipeline.inputSets.deleteInputSet' })
    await userEvent.click(deleteInputSetBtn)
    await waitFor(() => expect(pipelineng.useDeleteInputSetForPipeline).toHaveBeenCalled())
  })

  test('should not delete input set as status is ERROR', async () => {
    jest.spyOn(pipelineng, 'useDeleteInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.reject({
            status: 'ERROR'
          })
      }
    })
    mockImport('@harness/uicore', {
      ...jest.requireActual('@harness/uicore'),
      useToaster: () => ({
        showSuccess: jest.fn(),
        showError: mockErrorHandler
      })
    })
    renderComponent()

    await clickOnReconcileButton()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidInputSetDesc1')
    const deleteInputSetBtn = screen.getByRole('button', { name: 'pipeline.inputSets.deleteInputSet' })
    await userEvent.click(deleteInputSetBtn)
    await waitFor(() => expect(pipelineng.useDeleteInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockErrorHandler).toHaveBeenCalled())
  })

  test('should not update input set as status is ERROR', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetInputSetYamlDiffInline)
    jest.spyOn(pipelineng, 'useUpdateInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.reject({
            status: 'ERROR'
          })
      }
    })
    renderComponent()

    await clickOnReconcileButton()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await findByTextBody(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = screen.getByRole('button', { name: 'pipeline.inputSets.removeInvalidFields' })
    await userEvent.click(removeInvalidFieldBtn)
    await waitFor(() => expect(pipelineng.useUpdateInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockErrorHandler).toHaveBeenCalled())
  })

  test('should display the retry button when an error occurs', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => {
      return { loading: false, refetch: jest.fn(), error: mockErrorMessage }
    })
    renderComponent()

    await clickOnReconcileButton()

    const reconcileDialog = findDialogContainer() as HTMLElement
    const retryBtn = await screen.findByRole('button', { name: /retry/i })
    const removeInvalidFieldBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.removeInvalidFields' })

    expect(removeInvalidFieldBtn).toBeDisabled()
    await userEvent.click(retryBtn)
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()
    await waitFor(() => expect(reconcileDialog).toBeTruthy())
  })

  test('should not update input set, when loading state is true', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetInputSetYamlDiffInline)
    jest.spyOn(pipelineng, 'useUpdateInputSetForPipeline').mockImplementation((): any => {
      return { loading: true, refetch: jest.fn(), data: {} }
    })
    renderComponent()

    await clickOnReconcileButton()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await findByTextBody(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = screen.getByRole('button', { name: 'pipeline.inputSets.removeInvalidFields' })
    await userEvent.click(removeInvalidFieldBtn)
    expect(pipelineng.useUpdateInputSetForPipeline).toHaveBeenCalled()
    const loadingMessage = await findByTextBody(reconcileDialog, 'Loading, please wait...')
    await waitFor(() => expect(loadingMessage).toBeInTheDocument())
  })
})

describe('Old Git Sync Input Set Error Exp', () => {
  beforeAll(() => {
    jest.mock('services/pipeline-ng', () => ({
      useGetInputSetForPipeline: jest.fn(() => GetInvalidInputSetOldGitSync),
      useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsOldGitSyncResponse)
    }))
    jest.mock('@harness/uicore', () => ({
      ...jest.requireActual('@harness/uicore'),
      useToaster: () => ({
        showSuccess: mockSuccessHandler,
        showError: jest.fn()
      })
    }))
  })

  test('should open reconcile dialog on clicking reconcile button, when loading state is false & input set is not empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetInputSetYamlDiffOldGitSync)
    jest.spyOn(pipelineng, 'useUpdateInputSetForPipeline').mockImplementation((): any => {
      return { loading: false, refetch: jest.fn(), data: {}, status: 'SUCCESS' }
    })
    renderGitSyncComponent()

    await clickOnReconcileButton()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await findByTextBody(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.removeInvalidFields' })
    await userEvent.click(removeInvalidFieldBtn)
    let gitSaveBtn: HTMLElement
    await waitFor(async () => {
      const portalDiv = findDialogContainer() as HTMLElement
      const savePipelinesToGitHeader = await screen.findByText('common.git.saveResourceLabel')
      expect(savePipelinesToGitHeader).toBeInTheDocument()
      const gitSave = await findByTextBody(portalDiv, 'save')
      gitSaveBtn = gitSave.parentElement as HTMLElement
      expect(gitSaveBtn).toBeInTheDocument()
    })
    await userEvent.click(gitSaveBtn!)
    await waitFor(() => expect(pipelineng.useUpdateInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled())
  })

  test('should open delete input set modal on clicking reconcile button, if input set is empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetYamlDiffDelResponse)
    jest.spyOn(pipelineng, 'useDeleteInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.resolve({
            status: 'SUCCESS'
          })
      }
    })
    renderGitSyncComponent()

    await clickOnReconcileButton()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidInputSetDesc1')
    const deleteInputSetBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.deleteInputSet' })
    await userEvent.click(deleteInputSetBtn)
    await waitFor(() => expect(pipelineng.useDeleteInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled())
  })

  test('should navigate to input set list view on clicking go back to input set list button', async () => {
    const { getByTestId } = renderGitSyncComponent()
    await clickOnReconcileButton()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidInputSetDesc1')

    const goBackToInputSetListBtn = screen.getByRole('button', { name: 'pipeline.inputSets.goBackToInputSetList' })
    await userEvent.click(goBackToInputSetListBtn)

    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent(
      '/account/dummy/cd/orgs/dummy/projects/dummy/pipelines/testpip/input-sets?repoIdentifier=oldgitsyncharness&branch=master'
    )
  })
})

describe('Remote Git Sync Input Set Error Exp', () => {
  beforeAll(() => {
    jest.mock('services/pipeline-ng', () => ({
      useGetInputSetForPipeline: jest.fn(() => GetInvalidInputSetRemote),
      useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsRemoteGitSyncResponse)
    }))
    jest.mock('services/cd-ng', () => ({
      useGetConnector: jest.fn().mockImplementation(() => {
        return { data: gitHubMock.data.content[0], refetch: getGitConnector, loading: false }
      })
    }))

    jest.mock('services/cd-ng-rq', () => ({
      useListGitSyncQuery: jest.fn().mockImplementation(() => {
        return { data: gitSyncListResponse, refetch: getListGitSync, loading: false }
      })
    }))
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should open reconcile dialog on clicking reconcile button, when loading state is false & input set is not empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetInputSetYamlDiffRemote)
    renderGitSimpComponent()

    await clickOnReconcileButton()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await findByTextBody(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.removeInvalidFields' })
    await userEvent.click(removeInvalidFieldBtn)
    let gitSaveBtn: HTMLElement
    await waitFor(async () => {
      const portalDiv = findDialogContainer() as HTMLElement
      const savePipelinesToGitHeader = await findByTextBody(portalDiv, 'common.git.saveResourceLabel')
      expect(savePipelinesToGitHeader).toBeInTheDocument()
      gitSaveBtn = await findByRole(portalDiv, 'button', { name: 'save' })
      expect(gitSaveBtn).toBeInTheDocument()
    })
    await userEvent.click(gitSaveBtn!)
    await waitFor(() => expect(pipelineng.useUpdateInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled())
  })

  test('should open delete input set modal on clicking reconcile button, if input set is empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetYamlDiffDelResponse)
    jest.spyOn(pipelineng, 'useDeleteInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.resolve({
            status: 'SUCCESS'
          })
      }
    })
    renderGitSimpComponent()

    await clickOnReconcileButton()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidInputSetDesc1')
    const deleteInputSetBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.deleteInputSet' })
    await userEvent.click(deleteInputSetBtn)
    await waitFor(() => expect(pipelineng.useDeleteInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled())
  })
  test('should navigate to input set list view on clicking go back to input set list button', async () => {
    const { getByTestId } = renderGitSimpComponent()
    await clickOnReconcileButton()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidInputSetDesc1')

    const goBackToInputSetListBtn = screen.getByRole('button', { name: 'pipeline.inputSets.goBackToInputSetList' })
    await userEvent.click(goBackToInputSetListBtn)

    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location')).toHaveTextContent(
      '/account/dummy/cd/orgs/dummy/projects/dummy/pipelines/testpip/input-sets?connectorRef=Eric_Git_Con&repoName=git-sync-harness&branch=master&storeType=REMOTE'
    )
  })
})
