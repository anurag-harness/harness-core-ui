import { HealthSourceV2 } from 'services/cv'

export const HealthSourcesResponse: HealthSourceV2[] = [
  {
    identifier: 'a',
    name: 'Templatised sumologic metrics health source',
    type: 'SumologicMetrics',
    providerType: 'METRICS'
  },
  {
    identifier: 'b',
    name: 'Templatised sumologic logs health source',
    type: 'SumologicLogs',
    providerType: 'LOGS'
  }
]

export const expectedHealthSourcesParams = {
  accountIdentifier: 'acc',
  lazy: false,
  orgIdentifier: 'org',
  projectIdentifier: 'project',
  verifyStepExecutionId: '1234_activityId'
}

export const expectedHealthSourcesParamsWithMetrics = {
  ...expectedHealthSourcesParams,
  lazy: true
}
