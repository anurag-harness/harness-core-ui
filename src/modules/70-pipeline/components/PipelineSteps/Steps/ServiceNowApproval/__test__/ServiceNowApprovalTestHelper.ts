/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  ResponseConnectorResponse,
  ResponseListServiceNowFieldNG,
  ResponsePageConnectorResponse,
  ResponseListServiceNowTicketTypeDTO
} from 'services/cd-ng'
import { ApprovalRejectionCriteriaType } from '@pipeline/components/PipelineSteps/Steps/Common/types'
import type { ServiceNowApprovalStepModeProps, SnowApprovalDeploymentModeProps } from '../types'
import { getDefaultCriterias } from '../helper'

export const getServiceNowApprovalEditModeProps = (): ServiceNowApprovalStepModeProps => ({
  initialValues: {
    timeout: '5s',
    name: '',
    type: StepType.ServiceNowApproval,
    identifier: '',
    spec: {
      connectorRef: '',
      ticketType: '',
      retryInterval: '1m',
      ticketNumber: '',
      approvalCriteria: getDefaultCriterias(),
      rejectionCriteria: getDefaultCriterias()
    }
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getServiceNowApprovalEditModePropsWithValues = (): ServiceNowApprovalStepModeProps => ({
  initialValues: {
    timeout: '10m',
    name: '',
    type: StepType.ServiceNowApproval,
    identifier: '',
    spec: {
      connectorRef: 'c1d1',
      ticketType: 'INCIDENT',
      retryInterval: '1m',
      ticketNumber: 'itd1',
      approvalCriteria: {
        type: ApprovalRejectionCriteriaType.KeyValues,
        spec: {
          matchAnyCondition: true,
          conditions: [
            {
              key: 'state',
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
          expression: "<+state> == 'Blocked'"
        }
      }
    }
  },
  onUpdate: jest.fn(),
  onChange: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getServiceNowApprovalDeploymentModeProps = (): SnowApprovalDeploymentModeProps => ({
  stepViewType: StepViewType.InputSet,
  initialValues: {
    name: '',
    type: StepType.ServiceNowApproval,
    identifier: '',
    spec: {
      connectorRef: '',
      retryInterval: '1m',
      ticketType: '',
      ticketNumber: '',
      approvalCriteria: getDefaultCriterias(),
      rejectionCriteria: getDefaultCriterias()
    }
  },
  inputSetData: {
    path: '/ab/',
    template: {
      name: '',
      type: StepType.ServiceNowApproval,
      identifier: '',
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        retryInterval: RUNTIME_INPUT_VALUE,
        ticketType: RUNTIME_INPUT_VALUE,
        ticketNumber: RUNTIME_INPUT_VALUE,
        changeWindow: {
          startField: RUNTIME_INPUT_VALUE,
          endField: RUNTIME_INPUT_VALUE
        },
        approvalCriteria: getDefaultCriterias(),
        rejectionCriteria: getDefaultCriterias()
      }
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getServiceNowApprovalInputVariableModeProps = () => ({
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
      'step-ticketType': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.ticketType',
          localName: 'step.approval.spec.ticketType'
        }
      },
      'step-ticketNumber': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.ticketNumber',
          localName: 'step.approval.spec.ticketNumber'
        }
      }
    },
    variablesData: {
      type: StepType.ServiceNowApproval,
      __uuid: 'step-identifier',
      identifier: 'serviceNow_approval',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        connectorRef: 'step-connectorRef',
        ticketNumber: 'step-ticketNumber',
        ticketType: 'step-ticketType'
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
      connector: { name: 'c1', identifier: 'c1d1', type: 'ServiceNow', spec: {} }
    }
  }
}

export const mockConnectorsResponse: ResponsePageConnectorResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: {
    content: [
      { connector: { name: 'c1', identifier: 'cid1', type: 'ServiceNow', spec: {} } },
      { connector: { name: 'c2', identifier: 'cid2', type: 'ServiceNow', spec: {} } }
    ]
  }
}

export const mockTicketTypesResponse: UseGetMockData<ResponseListServiceNowTicketTypeDTO> = {
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
        key: 'INCIDENT',
        name: 'INCIDENT'
      },
      {
        key: 'CHANGE',
        name: 'CHANGE'
      },
      {
        key: 'CHANGE_TASK',
        name: 'CHANGE_TASK'
      }
    ]
  }
}
export const mockServiceNowCreateMetadataResponse: UseGetMockData<Partial<ResponseListServiceNowFieldNG>> = {
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
        key: 'parent',
        name: 'Parent',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'u_glide_date_3',
        name: 'New Date',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'caused_by',
        name: 'Caused by Change',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'watch_list',
        name: 'Watch list',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'upon_reject',
        name: 'Upon reject',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_updated_on',
        name: 'updated',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'approval_history',
        name: 'Approval history',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'number',
        name: 'Number',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'state',
        name: 'State',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_created_by',
        name: 'Created by',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'knowledge',
        name: 'Knowledge',
        required: false,
        schema: {
          array: false,
          typeStr: 'boolean',
          type: 'boolean'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'order',
        name: 'Order',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'cmdb_ci',
        name: 'Configuration item',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'delivery_plan',
        name: 'Delivery plan',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'impact',
        name: 'impact',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'active',
        name: 'Active',
        required: false,
        schema: {
          array: false,
          typeStr: 'boolean',
          type: 'boolean'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'work_notes_list',
        name: 'Work notes list',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'priority',
        name: 'Priority',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_domain_path',
        name: 'Domain Path',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'business_duration',
        name: 'Business duration',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'group_list',
        name: 'Group list',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'approval_set',
        name: 'Approval set',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'universal_request',
        name: 'Universal Request',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'short_description',
        name: 'Short description',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'correlation_display',
        name: 'Correlation display',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'delivery_task',
        name: 'Delivery task',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'work_start',
        name: 'Actual start',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'additional_assignee_list',
        name: 'Additional assignee list',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'notify',
        name: 'Notify',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_class_name',
        name: 'Task type',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'service_offering',
        name: 'Service offering',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'closed_by',
        name: 'Closed by',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'follow_up',
        name: 'Follow up',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'parent_incident',
        name: 'Parent Incident',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'reopened_by',
        name: 'Last reopened by',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'u_glide_time_7',
        name: 'New Time',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'reassignment_count',
        name: 'Reassignment count',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'u_calendar_date_time_2',
        name: 'New Calendar Date/Time_manju',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'u_calendar_date_time_1',
        name: 'New Calendar Date/Time',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'assigned_to',
        name: 'Assigned to',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sla_due',
        name: 'SLA due',
        required: false,
        schema: {
          array: false,
          typeStr: 'due_date',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'comments_and_work_notes',
        name: 'Comments and Work notes',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'escalation',
        name: 'Escalation',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'upon_approval',
        name: 'Upon approval',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'correlation_id',
        name: 'Correlation ID',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'made_sla',
        name: 'Made SLA',
        required: false,
        schema: {
          array: false,
          typeStr: 'boolean',
          type: 'boolean'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'child_incidents',
        name: 'Child Incidents',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'u_glide_date_time_4',
        name: 'New Date/Time',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'hold_reason',
        name: 'On hold reason',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'task_effective_number',
        name: 'Effective number',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'resolved_by',
        name: 'Resolved by',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_updated_by',
        name: 'Updated by',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'opened_by',
        name: 'Opened by',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'user_input',
        name: 'User input',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_created_on',
        name: 'Created',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_domain',
        name: 'Domain',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'route_reason',
        name: 'Transfer reason',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'calendar_stc',
        name: 'Resolve time',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'closed_at',
        name: 'Closed',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'business_service',
        name: 'Business service',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'rfc',
        name: 'Change Request',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'time_worked',
        name: 'Time worked',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'expected_start',
        name: 'Expected start',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'u_glide_utc_time_8',
        name: 'New UTC Time',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'opened_at',
        name: 'Opened',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'work_end',
        name: 'Actual end',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'resolved_at',
        name: 'Resolved',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'reopened_time',
        name: 'Last reopened at',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'caller_id',
        name: 'Caller',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'subcategory',
        name: 'Subcategory',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'work_notes',
        name: 'Work notes',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'close_code',
        name: 'Resolution code',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'assignment_group',
        name: 'Assignment group',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'business_stc',
        name: 'Business resolve time',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'description',
        name: 'Description',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'calendar_duration',
        name: 'Duration',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'close_notes',
        name: 'Close notes',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_id',
        name: 'Sys ID',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'contact_type',
        name: 'Contact type',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'incident_state',
        name: 'Incident state',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'urgency',
        name: 'Urgency',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'problem_id',
        name: 'Problem',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'u_glide_duration_6',
        name: 'New Duration',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'company',
        name: 'Company',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'activity_due',
        name: 'Activity due',
        required: false,
        schema: {
          array: false,
          typeStr: 'due_date',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'severity',
        name: 'Severity',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'comments',
        name: 'Additional comments',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'approval',
        name: 'Approval',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'u_due_date_5',
        name: 'New Due Date',
        required: false,
        schema: {
          array: false,
          typeStr: 'due_date',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'due_date',
        name: 'Due Date',
        required: false,
        schema: {
          array: false,
          typeStr: 'glide_date_time',
          type: 'glide_date_time'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_mod_count',
        name: 'Updates',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'reopen_count',
        name: 'Reopen count',
        required: false,
        schema: {
          array: false,
          typeStr: 'integer',
          type: 'integer'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'sys_tags',
        name: 'Tags',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'location',
        name: 'Location',
        required: false,
        schema: {
          array: false,
          typeStr: '',
          type: 'unknown'
        },

        allowedValues: [],
        custom: false
      },
      {
        key: 'category',
        name: 'Category',
        required: false,
        schema: {
          array: false,
          typeStr: 'string',
          type: 'string'
        },

        allowedValues: [],
        custom: false
      }
    ]
  }
}

export const ConnectorsResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      content: [
        {
          connector: {
            name: 'cp-snow',
            identifier: 'cpsnow',
            description: '',
            orgIdentifier: 'harness',
            projectIdentifier: 'test',
            tags: {},
            type: 'ServiceNow',
            spec: {
              serviceNowUrl: 'https://abc.com',
              username: 'admin',
              usernameRef: null,
              passwordRef: '',
              delegateSelectors: []
            }
          }
        }
      ]
    }
  }
}

export const mockTicketTypesResponseV2: UseGetMockData<ResponseListServiceNowTicketTypeDTO> = {
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
        key: 'INCIDENT',
        name: 'INCIDENT'
      },
      {
        key: 'CHANGE',
        name: 'CHANGE'
      },
      {
        key: 'CHANGE_TASK',
        name: 'CHANGE_TASK'
      }
    ]
  }
}
