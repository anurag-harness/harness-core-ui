/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act, findByRole } from '@testing-library/react'
import { cloneDeep, defaultTo, noop } from 'lodash-es'
import { VisualYamlSelectedView as SelectedView } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import * as usePermission from '@rbac/hooks/usePermission'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  pipelineModuleParams,
  inputSetFormPathProps,
  pipelinePathProps
} from '@common/utils/routeUtils'
import * as pipelineng from 'services/pipeline-ng'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@platform/connectors/mocks/mock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { InputSetDTO, Pipeline } from '@pipeline/utils/types'
import type { ResponseInputSetTemplateWithReplacedExpressionsResponse } from 'services/pipeline-ng'
import type { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { StoreType } from '@common/constants/GitSyncTypes'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { GetInputSetYamlDiffInline } from '@pipeline/components/InputSetErrorHandling/__tests__/InputSetErrorHandlingMocks'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { EnhancedInputSetForm } from '../InputSetForm'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetInputSetEdit,
  MergeInputSetResponse,
  GetOverlayInputSetEdit,
  MergedPipelineResponse
} from './InputSetMocks'
import { FormikInputSetForm, isYamlPresent, showPipelineInputSetForm } from '../FormikInputSetForm'
import NewInputSetModal from '../NewInputSetModal'

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS' })
function YamlMock({ children, bind }: { children: JSX.Element; bind: YamlBuilderProps['bind'] }): React.ReactElement {
  const handler = React.useMemo(
    () =>
      ({
        getLatestYaml: () => GetInputSetEdit.data?.data?.inputSetYaml || '',
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

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => YamlMock)

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')

jest.useFakeTimers({ advanceTimers: true })
const branches = { data: ['master', 'devBranch', 'feature'], status: 'SUCCESS' }

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))
const fetchBranches = jest.fn(() => Promise.resolve(branches))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useCreatePR: jest.fn(() => noop),
  useCreatePRV2: jest.fn(() => noop),
  useGetFileContent: jest.fn(() => noop),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: branches, refetch: fetchBranches, error: null, loading: false }
  }),
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { allowDifferentRepoSettings: { data: { value: 'false' } }, loading: false } }
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
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEdit),
  useCreateVariablesV2: () => jest.fn(() => ({})),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => MergeInputSetResponse),
  useGetPipeline: jest.fn(() => PipelineResponse),
  useSanitiseInputSet: jest.fn(() => PipelineResponse),
  useDeleteInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useGetTemplateFromPipeline: jest.fn(() => TemplateResponse),
  useGetStagesExecutionList: jest.fn(() => ({})),
  useGetOverlayInputSetForPipeline: jest.fn(() => GetOverlayInputSetEdit),
  useCreateInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsResponse),
  useGetSchemaYaml: jest.fn(() => ({})),
  useYamlDiffForInputSet: jest.fn(() => GetInputSetYamlDiffInline)
}))

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const TEST_INPUT_SET_PATH = routes.toInputSetList({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})

const TEST_INPUT_SET_FORM_PATH = routes.toInputSetForm({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

const renderSetup = (form = <EnhancedInputSetForm />) =>
  render(
    <TestWrapper
      path={TEST_INPUT_SET_FORM_PATH}
      pathParams={{
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        inputSetIdentifier: '-1',
        module: 'cd'
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
        {form}
      </PipelineContext.Provider>
    </TestWrapper>
  )

const renderRemoteSetup = (form = <EnhancedInputSetForm />) =>
  render(
    <TestWrapper
      path={TEST_INPUT_SET_FORM_PATH}
      pathParams={{
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        inputSetIdentifier: '-1',
        module: 'cd'
      }}
      queryParams={{
        repoName: 'gitSyncRepo',
        branch: 'feature',
        connectorRef: 'ValidGithubRepo',
        storeType: StoreType.REMOTE
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
        {form}
      </PipelineContext.Provider>
    </TestWrapper>
  )

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Render Forms - Snapshot Testing', () => {
  test('render Input Set Form view', async () => {
    const { getByText, container } = renderRemoteSetup()
    jest.runOnlyPendingTimers()
    // // Switch Mode
    // fireEvent.click(getByText('YAML'))
    // await waitFor(() => getAllByText('Yaml View'))
    // // Switch Mode
    // fireEvent.click(getByText('visual'))
    // const stages = container.querySelector('.header')
    // fireEvent.click(stages as Element)
    // Close Form
    fireEvent.click(getByText('cancel'))
    expect(container).toMatchSnapshot()
  })

  test('when executionView is true', async () => {
    const { getByText } = render(
      <TestWrapper
        path={TEST_INPUT_SET_FORM_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          inputSetIdentifier: '-1',
          module: 'cd'
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
          <EnhancedInputSetForm executionView={true} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    expect(getByText('save')).toBeInTheDocument()
    expect(getByText('cancel')).toBeInTheDocument()
    fireEvent.click(getByText('cancel'))
  })

  test('name id validation on save click', async () => {
    const { getByText, getAllByDisplayValue } = renderRemoteSetup()
    jest.runOnlyPendingTimers()

    // find the name field and clear the existing name
    act(() => {
      fireEvent.change(getAllByDisplayValue('asd')[0], { target: { value: '' } })
    })

    // click save
    act(() => {
      fireEvent.click(getByText('save'))
    })
    // wait for the error
    await waitFor(() => expect(getByText('common.errorCount')).toBeTruthy())
  })
  test('render Edit Input Set Form view', async () => {
    const { getAllByText, getByText, container } = render(
      <TestWrapper
        path={TEST_INPUT_SET_FORM_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          inputSetIdentifier: 'asd',
          module: 'cd'
        }}
        queryParams={{
          repoName: 'gitSyncRepo',
          branch: 'feature',
          connectorRef: 'ValidGithubRepo',
          storeType: StoreType.REMOTE
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
    jest.runOnlyPendingTimers()
    // const stagePanel = container.querySelector('[data-testid="Stage.asd-summary"]')
    // act(() => {
    //   fireEvent.click(stagePanel as Element)
    // })
    // const infraPanel = container.querySelector('[data-testid="Stage.asd.Infrastructure-summary"]')
    // fireEvent.click(infraPanel as Element)
    expect(container).toMatchSnapshot('expanded')
    await waitFor(() => getAllByText('tesa1'))
    fireEvent.click(getByText('save'))
    // Switch Mode
    fireEvent.click(getByText('YAML'))
    await waitFor(() => getAllByText('Yaml View'))
    const saveBtn = await findByRole(container, 'button', { name: 'save' })
    fireEvent.click(saveBtn)
    expect(container).toMatchSnapshot()
  })
  test('showPipelineInputSetForm function', async () => {
    const templateData = cloneDeep(TemplateResponse.data)
    const parsedPipeline = yamlParse<Pipeline>(
      defaultTo(PipelineResponse?.data?.data?.resolvedTemplatesPipelineYaml, '')
    )?.pipeline
    let returnVal = showPipelineInputSetForm(
      parsedPipeline,
      templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse
    )
    expect(returnVal).toBeTruthy()
    delete templateData?.data
    returnVal = showPipelineInputSetForm(
      parsedPipeline,
      templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse
    )
    expect(returnVal).toBeFalsy()
    returnVal = showPipelineInputSetForm(parsedPipeline, null)
    expect(returnVal).toBeFalsy()
    delete MergedPipelineResponse.data?.data
    returnVal = showPipelineInputSetForm(
      parsedPipeline,
      templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse
    )
    expect(returnVal).toBeFalsy()
    returnVal = showPipelineInputSetForm(undefined, null)
    expect(returnVal).toBeFalsy()
  })

  test('isYamlPresent function', async () => {
    const templateData = cloneDeep(TemplateResponse.data)
    let returnVal = isYamlPresent(
      templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse,
      PipelineResponse.data
    )
    expect(returnVal).toBe(PipelineResponse.data?.data?.yamlPipeline)
    delete PipelineResponse.data?.data
    returnVal = isYamlPresent(
      templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse,
      PipelineResponse.data
    )
    expect(returnVal).toBe(undefined)
    returnVal = isYamlPresent(templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse, null)
    expect(returnVal).toBe(undefined)
    delete templateData?.data
    returnVal = isYamlPresent(
      templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse,
      PipelineResponse.data
    )
    expect(returnVal).toBe(undefined)
    returnVal = isYamlPresent(null, null)
    expect(returnVal).toBe(undefined)
  })

  test('FormikInputSetForm in YAML view', async () => {
    jest.spyOn(usePermission, 'usePermission').mockReturnValue([true])
    const templateData = cloneDeep(TemplateResponse.data)
    const { container, getByText } = render(
      <TestWrapper
        path={TEST_INPUT_SET_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FormikInputSetForm
          template={templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse}
          pipeline={PipelineResponse.data}
          inputSet={{
            description: 'asd',
            entityValidityDetails: {
              valid: false
            },
            gitDetails: {
              branch: 'feature',
              filePath: 'asd.yaml',
              objectId: '4471ec3aa40c26377353974c29a6670d998db06g',
              repoIdentifier: 'gitSyncRepo',
              rootFolder: '/rootFolderTest/.harness/'
            },
            identifier: 'asd56',
            name: 'asd',
            orgIdentifier: 'Harness11',
            pipelineIdentifier: 'testqqq',
            pipeline: { identifier: 'testqqq', name: '' },
            outdated: false
          }}
          selectedView={SelectedView.YAML}
          handleSubmit={jest.fn()}
          isEdit={true}
          setFormErrors={jest.fn()}
          setYamlHandler={jest.fn()}
          formErrors={{}}
          formikRef={jest.fn() as any}
          yamlHandler={{
            getLatestYaml: jest.fn(),
            getYAMLValidationErrorMap: () => new Map(),
            setLatestYaml: () => ''
          }}
          handleFormDirty={jest.fn()}
          setIsSaveEnabled={jest.fn()}
        />
      </TestWrapper>
    )
    const editorDiv = container.querySelector('.editor')
    await waitFor(() => expect(editorDiv).toBeTruthy())

    // click cancel
    fireEvent.click(getByText('cancel'))
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test('FormikInputSetForm in VISUAL view with formError', async () => {
    jest.spyOn(usePermission, 'usePermission').mockReturnValue([true])
    const ref = React.createRef<FormikProps<InputSetDTO & GitContextProps> | undefined>()
    const handleSubmit = jest.fn()
    const templateData = cloneDeep(TemplateResponse.data)
    const { container, getByText } = render(
      <TestWrapper
        path={TEST_INPUT_SET_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FormikInputSetForm
          template={templateData as ResponseInputSetTemplateWithReplacedExpressionsResponse}
          pipeline={PipelineResponse.data}
          inputSet={{
            description: 'asd',
            entityValidityDetails: {
              valid: false
            },
            identifier: 'asd56',
            orgIdentifier: 'Harness11',
            pipelineIdentifier: 'testqqq',
            pipeline: { identifier: 'testqqq', name: '' }
          }}
          selectedView={SelectedView.VISUAL}
          handleSubmit={handleSubmit}
          isEdit={true}
          setFormErrors={jest.fn()}
          setYamlHandler={jest.fn()}
          formErrors={{ name: 'required' }}
          formikRef={ref as any}
          yamlHandler={{
            getLatestYaml: jest.fn(),
            getYAMLValidationErrorMap: () => new Map(),
            setLatestYaml: () => ''
          }}
          handleFormDirty={jest.fn()}
          setIsSaveEnabled={jest.fn()}
        />
      </TestWrapper>
    )
    act(() => {
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'asd56' } })
    })
    await act(() => ref.current?.submitForm()!)
    expect(handleSubmit).toHaveBeenCalledWith(
      {
        branch: '',
        description: 'asd',
        identifier: 'asd56',
        name: 'asd56',
        orgIdentifier: 'Harness11',
        pipelineIdentifier: 'testqqq',
        repo: '',
        connectorRef: '',
        repoName: '',
        storeType: 'INLINE',
        pipeline: { identifier: 'testqqq', name: '' }
      },
      { branch: '', repoIdentifier: '', repoName: '' },
      { branch: '', connectorRef: '', filePath: undefined, repoName: '', storeType: 'INLINE' }
    )
    //ErrorStrip
    await waitFor(() => expect(getByText('common.errorCount')).toBeTruthy())
  })

  test('render inputset with no inputSetResponse and check Yaml toggle ', async () => {
    jest.spyOn(pipelineng, 'useGetInputSetForPipeline').mockImplementation((): any => {
      return { data: {}, error: null, loading: false }
    })
    jest.spyOn(pipelineng, 'useGetMergeInputSetFromPipelineTemplateWithListInput').mockImplementation((): any => {
      return { mutate: () => Promise.resolve(), loading: false }
    })
    jest.spyOn(pipelineng, 'useGetPipeline').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          data: {
            ...PipelineResponse
          }
        },
        loading: false,
        refetch: jest.fn()
      }
    })
    const { container, getByText } = renderSetup()

    // Check for Yaml toggle - YAML view
    fireEvent.click(getByText('YAML'))
    const editorDiv = container.querySelector('.editor')
    await waitFor(() => expect(editorDiv).toBeTruthy())

    // Back to VISUAL View
    fireEvent.click(getByText('VISUAL'))

    // click save
    act(() => {
      fireEvent.click(getByText('save'))
    })
    expect(container).toMatchSnapshot()
  })

  test('render NewInputSetModal', async () => {
    renderSetup(
      <NewInputSetModal
        inputSetInitialValue={
          {
            pipeline: {
              properties: {
                ci: {
                  codebase: {
                    build: { type: 'branch', spec: { branch: '<+trigger.branch>' } }
                  }
                }
              }
            }
          } as unknown as InputSetDTO
        }
        isModalOpen={true}
        closeModal={jest.fn()}
        onCreateSuccess={jest.fn()}
      />
    )

    expect(document.body.querySelector('.bp3-portal')).toMatchSnapshot()
  })
})
