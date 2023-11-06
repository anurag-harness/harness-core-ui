/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  JiraFieldSchemaNG,
  ResponseConnectorResponse,
  ResponseJiraIssueCreateMetadataNG,
  ResponseListJiraProjectBasicNG,
  ResponsePageConnectorResponse
} from 'services/cd-ng'
import { ApprovalRejectionCriteriaType } from '@pipeline/components/PipelineSteps/Steps/Common/types'
import type { JiraApprovalDeploymentModeProps, JiraApprovalStepModeProps } from '../types'
import { getDefaultCriterias } from '../helper'

export const getJiraApprovalEditModeProps = (): JiraApprovalStepModeProps => ({
  initialValues: {
    timeout: '5s',
    name: '',
    type: StepType.JiraApproval,
    identifier: '',
    spec: {
      retryInterval: '1m',
      connectorRef: '',
      projectKey: '',
      issueKey: '',
      issueType: '',
      approvalCriteria: getDefaultCriterias(),
      rejectionCriteria: getDefaultCriterias()
    }
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getJiraApprovalEditModePropsWithConnectorId = (): JiraApprovalStepModeProps => ({
  initialValues: {
    timeout: '5s',
    name: '',
    type: StepType.JiraApproval,
    identifier: '',
    spec: {
      retryInterval: '1m',
      connectorRef: 'cid',
      projectKey: '',
      issueKey: '',
      issueType: '',
      approvalCriteria: getDefaultCriterias(),
      rejectionCriteria: getDefaultCriterias()
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepViewType: StepViewType.Edit
})

export const getJiraApprovalEditModePropsWithValues = (): JiraApprovalStepModeProps => ({
  initialValues: {
    timeout: '10m',
    name: '',
    type: StepType.JiraApproval,
    identifier: '',
    spec: {
      retryInterval: '1m',
      connectorRef: 'c1d1',
      projectKey: 'pid1',
      issueKey: 'tdc-2345',
      issueType: 'itd1',
      approvalCriteria: {
        type: ApprovalRejectionCriteriaType.KeyValues,
        spec: {
          matchAnyCondition: true,
          conditions: [
            {
              key: 'Status',
              operator: 'in',
              value: 'Done,todo'
            },
            {
              key: 'f1',
              operator: 'equals',
              value: 'somevalue for f1'
            }
          ]
        }
      },
      rejectionCriteria: {
        type: ApprovalRejectionCriteriaType.Jexl,
        spec: {
          expression: "<+status> == 'Blocked'"
        }
      }
    }
  },
  onUpdate: jest.fn(),
  onChange: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getJiraApprovalDeploymentModeProps = (): JiraApprovalDeploymentModeProps => ({
  stepViewType: StepViewType.InputSet,
  initialValues: {
    name: '',
    type: StepType.JiraApproval,
    identifier: '',
    spec: {
      connectorRef: '',
      projectKey: '',
      issueKey: '',
      issueType: '',
      retryInterval: '1m',
      approvalCriteria: getDefaultCriterias(),
      rejectionCriteria: getDefaultCriterias()
    }
  },
  inputSetData: {
    path: '/ab/',
    template: {
      name: '',
      type: StepType.JiraApproval,
      identifier: '',
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        projectKey: RUNTIME_INPUT_VALUE,
        issueKey: RUNTIME_INPUT_VALUE,
        issueType: RUNTIME_INPUT_VALUE,
        retryInterval: RUNTIME_INPUT_VALUE,
        approvalCriteria: getDefaultCriterias(),
        rejectionCriteria: getDefaultCriterias()
      }
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getJiraApprovalInputVariableModeProps = () => ({
  initialValues: {
    spec: {}
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.name',
          localName: 'step.approval.name'
        }
      },
      'step-identifier': {
        yamlExtraProperties: {
          properties: [
            {
              fqn: 'pipeline.stages.qaStage.execution.steps.approval.identifier',
              localName: 'step.approval.identifier',
              variableName: 'identifier'
            }
          ]
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.timeout',
          localName: 'step.approval.timeout'
        }
      },
      'step-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.connectorRef',
          localName: 'step.approval.spec.connectorRef'
        }
      },
      'step-projectKey': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.projectKey',
          localName: 'step.approval.spec.projectKey'
        }
      },
      'step-issueKey': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.issueKey',
          localName: 'step.approval.spec.issueKey'
        }
      },
      'step-issueType': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.issueType',
          localName: 'step.approval.spec.issueType'
        }
      }
    },
    variablesData: {
      type: StepType.JiraApproval,
      __uuid: 'step-identifier',
      identifier: 'jira_approval',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        projectKey: 'step-projectKey',
        issueKey: 'step-issueKey',
        issueType: 'step-issueType'
      }
    }
  },
  onUpdate: jest.fn()
})

export const mockConnectorResponse: UseGetMockData<ResponseConnectorResponse> = {
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      connector: { name: 'c1', identifier: 'cid1', type: 'Jira', spec: {} }
    }
  }
}

export const mockConnectorsResponse: ResponsePageConnectorResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: {
    content: [
      { connector: { name: 'c1', identifier: 'cid1', type: 'Jira', spec: {} } },
      { connector: { name: 'c2', identifier: 'cid2', type: 'Jira', spec: {} } }
    ]
  }
}

export const mockProjectsResponse: UseGetMockData<ResponseListJiraProjectBasicNG> = {
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: [
      {
        id: 'pid1',
        key: 'pid1',
        name: 'p1'
      },
      {
        id: 'pid2',
        key: 'pid2',
        name: 'p2'
      },
      {
        id: 'pid3',
        key: 'pid3',
        name: 'p3'
      }
    ]
  }
}

export const mockProjectsErrorResponse: ResponseListJiraProjectBasicNG = {
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  error: {
    message: 'Failed to fetch: 400 Bad Request',
    data: {
      code: 'INVALID_REQUEST',
      correlationId: '',
      status: 'ERROR',
      metaData: null,
      message: 'mockMessage',
      responseMessages: [
        {
          code: 'INVALID_REQUEST',
          level: 'ERROR',
          message: 'mockMessage',
          exception: null,
          failureTypes: []
        }
      ]
    },
    status: '400'
  }
}

export const mockProjectMetadataResponse: UseGetMockData<ResponseJiraIssueCreateMetadataNG> = {
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      projects: {
        pid1: {
          id: 'pid1',
          key: 'pid1',
          name: 'p1',
          // eslint-disable-next-line
          // @ts-ignore
          issuetypes: [
            {
              id: 'itd1',
              name: 'it1',
              statuses: [
                {
                  name: 'todo',
                  id: 'todo'
                },
                {
                  name: 'Done',
                  id: 'Done'
                }
              ],
              fields: {
                field1: {
                  key: 'f1',
                  name: 'f1',
                  allowedValues: [],
                  schema: {
                    type: 'string' as JiraFieldSchemaNG['type'],
                    typeStr: ''
                  }
                },
                field2: {
                  key: 'f2',
                  name: 'f2',
                  allowedValues: [
                    {
                      id: 'av1',
                      name: 'av1',
                      value: 'av1'
                    },
                    {
                      id: 'av2',
                      name: 'av2'
                    }
                  ],
                  schema: {
                    type: 'string' as JiraFieldSchemaNG['type'],
                    typeStr: ''
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}
