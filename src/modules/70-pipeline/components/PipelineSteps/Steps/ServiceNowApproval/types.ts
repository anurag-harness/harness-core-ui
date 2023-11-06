/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'

import type { UseGetReturn } from 'restful-react'
import type {
  ResponseListServiceNowTicketTypeDTO,
  StepElementConfig,
  Failure,
  ResponseListServiceNowFieldNG,
  GetServiceNowTicketTypesQueryParams,
  GetServiceNowIssueCreateMetadataQueryParams,
  GetServiceNowTicketTypesV2QueryParams
} from 'services/cd-ng'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getDefaultCriterias } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import type { ApprovalRejectionCriteria } from '@pipeline/components/PipelineSteps/Steps/Common/types'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface ServiceNowApprovalData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    ticketType: string | ServiceNowTicketTypeSelectOption
    ticketNumber: string
    retryInterval: string
    approvalCriteria: ApprovalRejectionCriteria
    rejectionCriteria: ApprovalRejectionCriteria
    changeWindow?: {
      startField: string
      endField: string
    }
  }
}
export interface ServiceNowTicketTypeSelectOption extends SelectOption {
  key: string
}
export interface ServiceNowTicketFieldSelectOption extends SelectOption {
  key: string
}

export interface SnowApprovalVariableListModeProps {
  variablesData: ServiceNowApprovalData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface SnowApprovalDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: ServiceNowApprovalData
  allowableTypes: AllowedTypes
  onUpdate?: (data: ServiceNowApprovalData) => void
  inputSetData?: InputSetData<ServiceNowApprovalData>
  formik?: any
}

export interface ServiceNowApprovalStepModeProps {
  stepViewType: StepViewType
  initialValues: ServiceNowApprovalData
  allowableTypes: AllowedTypes
  onUpdate?: (data: ServiceNowApprovalData) => void
  onChange?: (data: ServiceNowApprovalData) => void
  isNewStep?: boolean
  readonly?: boolean
}
export interface ServiceNowFormContentInterface {
  formik: FormikProps<ServiceNowApprovalData>
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  isNewStep?: boolean
  readonly?: boolean
  getServiceNowTicketTypesQuery: UseGetReturn<
    ResponseListServiceNowTicketTypeDTO,
    Failure | Error,
    GetServiceNowTicketTypesQueryParams,
    unknown
  >
  getServiceNowTicketTypesV2Query: UseGetReturn<
    ResponseListServiceNowTicketTypeDTO,
    Failure | Error,
    GetServiceNowTicketTypesV2QueryParams,
    unknown
  >
  getServiceNowIssueCreateMetadataQuery: UseGetReturn<
    ResponseListServiceNowFieldNG,
    Failure | Error,
    GetServiceNowIssueCreateMetadataQueryParams,
    unknown
  >
}
export const resetForm = (formik: FormikProps<ServiceNowApprovalData>, parent: string): void => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.ticketType', '')
    formik.setFieldValue('spec.ticketNumber', '')
    formik.setFieldValue('spec.approvalCriteria', getDefaultCriterias())
    formik.setFieldValue('spec.rejectionCriteria', getDefaultCriterias())
  }
  if (parent === 'ticketType') {
    formik.setFieldValue('spec.ticketNumber', '')
    formik.setFieldValue('spec.approvalCriteria', getDefaultCriterias())
    formik.setFieldValue('spec.rejectionCriteria', getDefaultCriterias())
  }
}
