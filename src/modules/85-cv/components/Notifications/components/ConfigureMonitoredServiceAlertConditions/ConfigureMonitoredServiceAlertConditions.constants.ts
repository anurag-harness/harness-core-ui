/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'

export enum Condition {
  CHANGE_IMPACT = 'ChangeImpact',
  HEALTH_SCORE = 'HealthScore',
  CHANGE_OBSERVED = 'ChangeObserved',
  CODE_ERRORS = 'CodeErrors',
  DEPLOYMENT_IMPACT_REPORT = 'DeploymentImpactReport'
}

export enum ChangeType {
  DEPLOYMENT = 'Deployment',
  INFRASTRUCTURE = 'Infrastructure',
  INCIDENT = 'Alert',
  FEATURE_FLAG = 'FeatureFlag',
  CHAOS_EXPERIMENT = 'ChaosExperiment'
}

export enum EventStatus {
  NEW_EVENTS = 'NewEvents',
  CRITICAL_EVENTS = 'CriticalEvents',
  RESURFACED_EVENTS = 'ResurfacedEvents'
}

export enum EventType {
  ALL_EVENTS = 'AllEvents',
  EXCEPTIONS = 'Exceptions',
  LOG_ERRORS = 'LogErrors',
  HTTP_ERRORS = 'HttpErrors',
  CUSTOM_ERRORS = 'CustomErrors',
  TIMEOUT_ERRORS = 'TimeoutErrors'
}

export const conditionOptions: SelectOption[] = [
  { label: 'Change Impact', value: Condition.CHANGE_IMPACT },
  { label: 'Health Score', value: Condition.HEALTH_SCORE },
  { label: 'Change Observed', value: Condition.CHANGE_OBSERVED },
  { label: 'Analyze Impact Report', value: Condition.DEPLOYMENT_IMPACT_REPORT },
  { label: 'Code Errors', value: Condition.CODE_ERRORS }
]

export const changeTypeOptions: SelectOption[] = [
  { label: 'Deployment', value: ChangeType.DEPLOYMENT },
  { label: 'Infrastructure', value: ChangeType.INFRASTRUCTURE },
  { label: 'Incident', value: ChangeType.INCIDENT },
  { label: 'Feature Flag', value: ChangeType.FEATURE_FLAG },
  { label: 'Chaos Experiment', value: ChangeType.CHAOS_EXPERIMENT }
]

export const eventStatusOptions: SelectOption[] = [
  { label: 'New Events', value: EventStatus.NEW_EVENTS },
  { label: 'Critical Events', value: EventStatus.CRITICAL_EVENTS },
  { label: 'Resurfaced Events', value: EventStatus.RESURFACED_EVENTS }
]

export const allEventsTypeOption = { label: 'Any', value: EventType.ALL_EVENTS }

export const eventTypeOptions: SelectOption[] = [
  allEventsTypeOption,
  { label: 'Exceptions', value: EventType.EXCEPTIONS },
  { label: 'Log Errors', value: EventType.LOG_ERRORS },
  { label: 'HTTP Errors', value: EventType.HTTP_ERRORS },
  { label: 'Custom Errors', value: EventType.CUSTOM_ERRORS },
  { label: 'Timeout Errors', value: EventType.TIMEOUT_ERRORS }
]
