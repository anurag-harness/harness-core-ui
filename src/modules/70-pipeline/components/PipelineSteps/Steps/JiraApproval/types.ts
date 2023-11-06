/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  Failure,
  ResponseJiraIssueCreateMetadataNG,
  ResponseListJiraProjectBasicNG,
  StepElementConfig,
  UseGetJiraIssueCreateMetadataProps,
  UseGetJiraProjectsProps
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { ApprovalRejectionCriteria } from '@pipeline/components/PipelineSteps/Steps/Common/types'

export interface JiraApprovalData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    projectKey: string | JiraProjectSelectOption
    issueType: string | JiraProjectSelectOption
    issueKey: string
    approvalCriteria: ApprovalRejectionCriteria
    rejectionCriteria: ApprovalRejectionCriteria
    retryInterval: string
  }
}

export interface JiraApprovalVariableListModeProps {
  variablesData: JiraApprovalData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface JiraApprovalDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: JiraApprovalData
  allowableTypes: AllowedTypes
  onUpdate?: (data: JiraApprovalData) => void
  inputSetData?: InputSetData<JiraApprovalData>
  formik?: any
}

export interface JiraApprovalStepModeProps {
  stepViewType: StepViewType
  initialValues: JiraApprovalData
  allowableTypes: AllowedTypes
  onUpdate?: (data: JiraApprovalData) => void
  onChange?: (data: JiraApprovalData) => void
  isNewStep?: boolean
  readonly?: boolean
}

export interface JiraProjectSelectOption extends SelectOption {
  key: string
}

export interface JiraFormContentInterface {
  formik: FormikProps<JiraApprovalData>
  refetchProjects: (props: UseGetJiraProjectsProps) => Promise<void>
  refetchProjectMetadata: (props: UseGetJiraIssueCreateMetadataProps) => Promise<void>
  refetchIssueMetadata: (props: UseGetJiraIssueCreateMetadataProps) => Promise<void>
  fetchingProjects: boolean
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  fetchingProjectMetadata: boolean
  projectsResponse: ResponseListJiraProjectBasicNG | null
  projectMetaResponse: ResponseJiraIssueCreateMetadataNG | null
  issueMetaResponse: ResponseJiraIssueCreateMetadataNG | null
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
  issueMetadataFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
  readonly?: boolean
}
