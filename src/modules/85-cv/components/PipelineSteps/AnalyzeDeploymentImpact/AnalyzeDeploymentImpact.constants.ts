/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ErrorType, Strategy } from '@pipeline/utils/FailureStrategyUtils'
import type { ManualInterventionFailureActionConfig } from 'services/pipeline-ng'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { AnalyzeDeploymentImpactData } from './AnalyzeDeploymentImpact.types'

export enum MONITORED_SERVICE_TYPE {
  DEFAULT = 'Default',
  CONFIGURED = 'Configured',
  TEMPLATE = 'Template'
}

export enum IdentifierTypes {
  serviceIdentifier = '<+service.identifier>',
  envIdentifier = '<+env.identifier>'
}

export const ANALYSE_DEFAULT_VALUES: AnalyzeDeploymentImpactData = {
  name: 'Analyze Deployment Impact',
  type: 'AnalyzeDeploymentImpact',
  identifier: '',
  timeout: '15m',
  spec: {
    duration: '',
    healthSources: [],
    monitoredService: {
      type: '',
      spec: {}
    }
  },
  failureStrategies: [
    {
      onFailure: {
        errors: [ErrorType.Verification],
        action: {
          type: Strategy.ManualIntervention,
          spec: {
            timeout: '2h',
            onTimeout: {
              action: {
                type: Strategy.StageRollback
              }
            }
          }
        } as ManualInterventionFailureActionConfig
      }
    },
    {
      onFailure: {
        errors: [ErrorType.Unknown],
        action: {
          type: Strategy.ManualIntervention,
          spec: {
            timeout: '2h',
            onTimeout: {
              action: {
                type: Strategy.Ignore
              }
            }
          }
        } as ManualInterventionFailureActionConfig
      }
    }
  ]
}

export const defaultMonitoredServiceSpec = {
  type: MONITORED_SERVICE_TYPE.DEFAULT,
  spec: {}
}

export const monitoredServiceRefPath = 'spec.monitoredService.spec.monitoredServiceRef'

export const V2_HEALTHSOURCES = [
  HealthSourceTypes.SumoLogic,
  HealthSourceTypes.SumologicLogs,
  HealthSourceTypes.SumologicMetrics,
  HealthSourceTypes.Elk,
  HealthSourceTypes.SignalFX,
  HealthSourceTypes.SplunkSignalFXMetrics,
  HealthSourceTypes.GrafanaLoki,
  HealthSourceTypes.GrafanaLokiLogs
]

export const IDENTIFIER = 'identifier'
export const INDEXES = 'indexes'
export const NAME = 'name'
export const METRIC_DEFINITIONS = 'metricDefinitions'
export const QUERY_DEFINITIONS = 'queryDefinitions'
export const NEWRELIC_METRIC_DEFINITIONS = 'newRelicMetricDefinitions'
export const QUERIES = 'queries'
export const CONNECTOR_REF = 'connectorRef'
export const V2 = 'v2'
