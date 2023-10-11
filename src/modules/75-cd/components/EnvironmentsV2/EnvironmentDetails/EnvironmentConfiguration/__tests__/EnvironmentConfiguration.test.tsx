/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikForm, VisualYamlSelectedView as SelectedView } from '@harness/uicore'
import * as cdNgServices from 'services/cd-ng'

import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { environmentPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { sourceCodeManagers } from '@platform/connectors/mocks/mock'
import { connectorsData } from '@platform/connectors/pages/connectors/__tests__/mockData'
import EnvironmentConfiguration from '../EnvironmentConfiguration'
import { activeInstanceAPI, envAPI } from '../../EnvironmentDetailSummary/__test__/EnvDetailSummary.mock'

const showErrorMock = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError: showErrorMock, showSuccess: jest.fn(), clear: jest.fn() }))
}))

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

const orgIdentifier = 'dfvds'
const projectIdentifier = 'sdvv'

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: null, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetClusterList: jest.fn().mockReturnValue({
    data: {
      data: {
        content: [
          {
            clusterRef: 'test-cluster-a',
            linkedAt: '123'
          },
          {
            clusterRef: 'test-cluster-b',
            linkedAt: '2'
          }
        ]
      }
    },
    refetch: jest.fn()
  } as any),
  useDeleteCluster: jest.fn().mockReturnValue({} as any),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[1], refetch: fetchConnectors, loading: false }
  }),
  useGetYamlSchema: jest.fn().mockReturnValue({
    data: {
      name: 'testenv',
      identifier: 'test-env',
      lastModifiedAt: ''
    },
    refetch: jest.fn()
  } as any),
  useGetActiveServiceInstancesForEnvironment: jest.fn().mockImplementation(() => {
    return { data: activeInstanceAPI, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetEnvironmentV2: jest.fn().mockImplementation(() => {
    return {
      data: envAPI,
      refetch: jest.fn(),
      loading: false,
      error: false
    }
  }),
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { data: { value: 'false' } } }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

const dummy: cdNgServices.NGEnvironmentInfoConfig = {
  identifier: 'id',
  name: 'name',
  type: 'PreProduction'
}

describe('EnvironmentConfiguration tests', () => {
  test('Initial render', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'dummy',
          orgIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        defaultFeatureFlagValues={{
          CDS_SERVICE_OVERRIDES_2_0: true
        }}
      >
        <Formik initialValues={dummy} onSubmit={() => undefined} formName="TestWrapper">
          {formikProps => (
            <FormikForm>
              <EnvironmentConfiguration
                formikProps={formikProps}
                scope={getScopeFromDTO({ accountIdentifier: 'asfav', orgIdentifier, projectIdentifier })}
                selectedView={SelectedView.VISUAL}
                setSelectedView={jest.fn()}
                data={null}
                isEdit={true}
                isModified={false}
                setYamlHandler={jest.fn()}
              />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )
    await waitFor(() => expect(container).toMatchSnapshot())
  })

  test('Environment Overrides is not visible when Service Override V2 is enabled', async () => {
    jest.spyOn(cdNgServices, 'useGetSettingValue').mockReturnValue({
      data: { data: { value: 'true' } }
    } as any)

    render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'dummy',
          orgIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        defaultFeatureFlagValues={{
          CDS_SERVICE_OVERRIDES_2_0: true
        }}
      >
        <Formik initialValues={dummy} onSubmit={() => undefined} formName="TestWrapper">
          {formikProps => (
            <FormikForm>
              <EnvironmentConfiguration
                formikProps={formikProps}
                scope={getScopeFromDTO({ accountIdentifier: 'asfav', orgIdentifier, projectIdentifier })}
                selectedView={SelectedView.VISUAL}
                setSelectedView={jest.fn()}
                data={null}
                isEdit={true}
                isModified={false}
                setYamlHandler={jest.fn()}
              />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    const element = screen.queryByText('common.environmentOverrides')
    expect(element).toBeNull()
  })

  test('Ensure that when an error occurs, the error is displayed', async () => {
    jest.spyOn(cdNgServices, 'useGetSettingValue').mockImplementation(() => {
      return {
        loading: false,
        error: {
          data: {
            responseMessages: ['error']
          }
        },
        refetch: jest.fn()
      } as any
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'dummy',
          orgIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1'
        }}
        defaultFeatureFlagValues={{
          CDS_SERVICE_OVERRIDES_2_0: true
        }}
      >
        <Formik initialValues={dummy} onSubmit={() => undefined} formName="TestWrapper">
          {formikProps => (
            <FormikForm>
              <EnvironmentConfiguration
                formikProps={formikProps}
                scope={getScopeFromDTO({ accountIdentifier: 'asfav', orgIdentifier, projectIdentifier })}
                selectedView={SelectedView.VISUAL}
                setSelectedView={jest.fn()}
                data={null}
                isEdit={true}
                isModified={false}
                setYamlHandler={jest.fn()}
              />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(showErrorMock).toHaveBeenCalled())
  })
})
