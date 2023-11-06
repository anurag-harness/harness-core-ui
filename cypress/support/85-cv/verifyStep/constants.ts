const accountId = 'accountId'
const project = 'project1'
const org = 'default'
const pipelineIdentifier = 'testPipeline_Cypress'
const ENV = 'prod'

export const deploymentActivitySummaryAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-activity-summary?routingId=${accountId}&accountId=${accountId}`
export const deploymentTimeseriesDataAPI = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=*&anomalousNodesOnly=*&pageNumber=0&pageSize=10`
export const deploymentTimeseriesDataWithNodeFilterAPI = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=*&anomalousNodesOnly=*&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10`
export const healthSourceAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/healthSources?routingId=${accountId}&accountId=${accountId}`
export const healthSourceMetricsAPI = `/cv/api/account/${accountId}/orgs/${org}/projects/${project}/verifications/GZNwefkdR2aBhc7owmJ1-w/health-sources?*`
export const nodeNamesFilterAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-node-names?routingId=${accountId}&accountId=${accountId}`
export const transactionsFilterAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-transaction-names?routingId=${accountId}&accountId=${accountId}`
export const deploymentTimeseriesDataWithFilters = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=true&anomalousNodesOnly=true&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10&healthSources=appd_prod%2Fappdtest&transactionNames=%2Ftodolist%2Fregister`
export const strategies = `/ng/api/pipelines/configuration/strategies?routingId=${accountId}`
export const strategiesYamlSnippets = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=${accountId}&serviceDefinitionType=Kubernetes&strategyType=Rolling`
export const variables = `/pipeline/api/pipelines/v2/variables?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const strategiesYamlSnippets2 = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=${accountId}&strategyType=Rolling`
export const strategiesYamlSnippets3 = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=accountId&serviceDefinitionType=Kubernetes&strategyType=Rolling`
export const pipelineSteps = `/pipeline/api/pipelines/v2/steps?routingId=${accountId}&accountId=${accountId}`
export const monitoresServices = `/cv/api/monitored-service/service-environment?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&environmentIdentifier=*&serviceIdentifier=*`
export const createMonitoredService = `/cv/api/monitored-service/create-default?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&environmentIdentifier=testEnv&serviceIdentifier=testService`
export const updateMonitoredService = `/cv/api/monitored-service/testEnv_testService?routingId=${accountId}&accountId=${accountId}`
export const servicesCall = `/ng/api/servicesV2?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const servicesCallV2 = `/ng/api/servicesV2/list/access?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const stagesExecutionList = `/pipeline/api/pipeline/execute/stagesExecutionList?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&pipelineIdentifier=${pipelineIdentifier}`
export const inputSetsCall = `/pipeline/api/inputSets/template?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&pipelineIdentifier=${pipelineIdentifier}`
export const applyTemplatesCall = `/template/api/templates/applyTemplates?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&pipelineIdentifier=${pipelineIdentifier}&projectIdentifier=${project}&getDefaultFromOtherRepo=true`
export const pipelineDetailsCall = `/pipeline/api/pipelines/${pipelineIdentifier}?accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const pipelineDetailsWithRoutingIdCall = `/pipeline/api/pipelines/${pipelineIdentifier}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const templateResolvedPipeline = `/pipeline/api/pipelines/testPipeline_Cypress?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&getTemplatesResolvedPipeline=true`
export const inputSetsTemplateCall = `/pipeline/api/inputSets/template?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&pipelineIdentifier=${pipelineIdentifier}&projectIdentifier=${project}`
export const pipelineSummaryCall = `/pipeline/api/pipelines/summary/${pipelineIdentifier}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const inputSetTemplateForRuntimeServiceCall = `/cv/api/verify-step/input-set-template?accountId=${accountId}`
export const serviceEnvironmentTest1Call = `/cv/api/monitored-service/service-environment?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&environmentIdentifier=${ENV}&serviceIdentifier=testService`
export const serviceEnvironmentTest2Call = `/cv/api/monitored-service/service-environment?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1&environmentIdentifier=prod&serviceIdentifier=testService2`
export const serviceEnvironmentTest3Call = `/cv/api/monitored-service/service-environment?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&environmentIdentifier=${ENV}&serviceIdentifier=testService3`
export const overviewCall = `/cv/api/account/${accountId}/orgs/default/projects/${project}/verifications/GZNwefkdR2aBhc7owmJ1-w/overview?routingId=${accountId}`
export const metricsCallSimpleVerification = `/cv/api/account/accountId/orgs/default/projects/project1/verifications/GZNwefkdR2aBhc7owmJ1-w/analysis/metrics?*`
export const updateBaselineCall = `/cv/api/account/${accountId}/orgs/default/projects/${project}/verifications/GZNwefkdR2aBhc7owmJ1-w/baseline?routingId=${accountId}`

// Jira calls
export const jiraProjectsCall = `/ticket-service/api/metadata/projects?*`
export const jiraPrioritiesCall = `/ticket-service/api/metadata/priorities?*`
export const jiraIssueTypesCall = `/ticket-service/api/metadata/projects/*`
export const jiraTicketDetailsCall = `/ticket-service/api/tickets/*`
export const jiraCreatePostCall = `/cv/api/account/accountId/org/default/project/project1/log-feedback/abc/ticket?*`

export const pipelinesFetchCall = `/pipeline/api/pipelines/NG_Docker_Image?*`
export const pipelinesSummaryFetchCall = `/pipeline/api/pipelines/summary/NG_Docker_Image?*`
export const pipelinesYamlFetchCall = `/pipeline/api/yaml-schema?*`
// git sync call
export const gitSyncCall = `/ng/api/git-sync?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const aggregateProjectsCall = `/ng/api/aggregate/projects?routingId=${accountId}&accountIdentifier=${accountId}&pageIndex=0&pageSize=50&*`
export const sourceCodeManagerCall = `/ng/api/source-code-manager?routingId=${accountId}&accountIdentifier=${accountId}`

// logs initial call
export const logsListCall = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&minAngle=0&maxAngle=360&clusterTypes=UNKNOWN_EVENT&clusterTypes=UNEXPECTED_FREQUENCY`
export const logsListCallForNoBaseline = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&minAngle=0&maxAngle=360`
export const logsRadarChartDataCall = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-clusters?routingId=${accountId}&accountId=${accountId}&clusterTypes=UNKNOWN_EVENT&clusterTypes=UNEXPECTED_FREQUENCY`
export const logsRadarChartDataNoFiltersCall = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-clusters?routingId=${accountId}&accountId=${accountId}`

// logs node filter call
export const logsListNodeFilterCall = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&hostNames=harness-deployment-canary-7445f86dbf-ml857&minAngle=0&maxAngle=360&clusterTypes=UNKNOWN_EVENT&clusterTypes=UNEXPECTED_FREQUENCY`
export const logsRadarChartDataNodeFilterCall = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-clusters?routingId=${accountId}&accountId=${accountId}&hostNames=harness-deployment-canary-7445f86dbf-ml857&clusterTypes=UNKNOWN_EVENT&clusterTypes=UNEXPECTED_FREQUENCY`

// logs cluster type filter call
export const logsListCLusterFilterCall = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&minAngle=0&maxAngle=360&clusterTypes=UNEXPECTED_FREQUENCY`
export const logsRadarChartDataCLusterFilterCall = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-clusters?routingId=${accountId}&accountId=${accountId}&clusterTypes=UNEXPECTED_FREQUENCY`

// logs min slider filter
export const logsListMinSliderFilterCall = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&minAngle=30&maxAngle=360&clusterTypes=UNEXPECTED_FREQUENCY`

// log feedback call
export const feedbackHistory = `/cv/api/account/accountId/org/${org}/project/${project}/log-feedback/abc/history?*`

export const strategiesResponse = {
  status: 'SUCCESS',
  data: { Kubernetes: ['Rolling', 'BlueGreen', 'Canary', 'Default'], NativeHelm: ['Rolling', 'Default'] },
  metaData: null,
  correlationId: 'b4f7260b-9bed-4a21-a2a5-02c23dd573d8'
}
export const strategiesYamlSnippetsResponse = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - step:\n          name: "Rollout Deployment"\n          identifier: rolloutDeployment\n          type: K8sRollingDeploy\n          timeout: 10m\n          spec:\n            skipDryRun: false\n    rollbackSteps:\n      - step:\n          name: "Rollback Rollout Deployment"\n          identifier: rollbackRolloutDeployment\n          type: K8sRollingRollback\n          timeout: 10m\n          spec: {}\n',
  metaData: null,
  correlationId: '8f395970-533d-43ba-a6c1-0d8a8b6019fb'
}

export const variablesPostResponse = {
  status: 'SUCCESS',
  data: {
    yaml: '---\npipeline:\n  name: "d0XP7wPYS92z7RNPJXBxBQ"\n  identifier: "test"\n  allowStageExecutions: "iAtVkGtNTfuApiM1y4pz7w"\n  projectIdentifier: "cNeuGlV-SxGBenQQnjirmw"\n  orgIdentifier: "GaWiGX3KStWLsidc-pmC2A"\n  description: "aHMFuVqQQXiIJrcyKJ0F1g"\n  tags:\n    __uuid: "ZZzfrY0xRe2TQUxD4zXQcg"\n  stages:\n  - stage:\n      name: "FpiyiPgnRta6m9VKPc6Vbg"\n      identifier: "test"\n      description: "4ohKeTljQ8uoVDK5NZXelA"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "HKHACGfEScK1RcgpU4N7tA"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n              __uuid: "M4d9qLcXRNm38IQl7AynrQ"\n            __uuid: "udO8BaK6RB2L8Ri3I4GfHg"\n          __uuid: "ZnH8Xo_rR3SffIcBRhJeKA"\n        infrastructure:\n          environmentRef: "t989wKT2Tcu10voxjpaLVw"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "K5JSINa9QxmC9OcJFRFD-Q"\n              namespace: "RJnwaHacRL-V4QvMi0A-Gg"\n              releaseName: "jJnmTM44SYuEXn0gfVKUDQ"\n              __uuid: "NDFruwtPQaG2Zfn4TYl-kA"\n            __uuid: "KAU4ecz2QQyqH9BmZhs0jw"\n          allowSimultaneousDeployments: "ZMT--U0oQEGNm2NmRKX4vg"\n          __uuid: "0Luzc_eKRWGURvqYH46WKw"\n        execution:\n          steps: []\n          rollbackSteps: []\n          __uuid: "UM7Uj0OdS5anWwnRkkJeFQ"\n        __uuid: "BpxR-OwMSQKPmeUj7CUgPQ"\n      tags:\n        __uuid: "WVfC96NfQqSLMMiuDrFvGg"\n      failureStrategies:\n      - onFailure:\n          errors: "NQoDZc7_QlOxvVYZtM_9zg"\n          action:\n            type: "StageRollback"\n            __uuid: "XOTP_IvkT9mrjNx2B_9spw"\n          __uuid: "UDGod4TVQLS_qVtVzirmhg"\n        __uuid: "LnqpJ5NoRYat8rERBHJQDA"\n      __uuid: "akWnlMAwRYWWIPuZifTxTQ"\n    __uuid: "gDAS3m1MTxqm07sAeILKpw"\n  __uuid: "f0614r79QC2FN73Ttzne8w"\n__uuid: "z6jIOZP5SRq_q3QNreHGAA"\n',
    metadataMap: {
      d0XP7wPYS92z7RNPJXBxBQ: {
        yamlProperties: {
          fqn: 'pipeline.name',
          localName: 'pipeline.name'
        },
        yamlOutputProperties: null
      },
      f0614r79QC2FN73Ttzne8w: {
        yamlProperties: {
          fqn: 'pipeline',
          localName: 'pipeline'
        },
        yamlOutputProperties: null
      },
      aHMFuVqQQXiIJrcyKJ0F1g: {
        yamlProperties: {
          fqn: 'pipeline.description',
          localName: 'pipeline.description'
        },
        yamlOutputProperties: null
      },
      akWnlMAwRYWWIPuZifTxTQ: {
        yamlProperties: {
          fqn: 'pipeline.stages.test',
          localName: 'stage'
        },
        yamlOutputProperties: null
      },
      FpiyiPgnRta6m9VKPc6Vbg: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.name',
          localName: 'stage.name'
        },
        yamlOutputProperties: null
      },
      '0Luzc_eKRWGURvqYH46WKw': {
        yamlProperties: {
          fqn: 'infrastructure',
          localName: ''
        },
        yamlOutputProperties: null
      },
      'RJnwaHacRL-V4QvMi0A-Gg': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.namespace',
          localName: 'infrastructure.infrastructureDefinition.spec.namespace'
        },
        yamlOutputProperties: null
      },
      HKHACGfEScK1RcgpU4N7tA: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.serviceConfig.serviceRef',
          localName: 'serviceConfig.serviceRef'
        },
        yamlOutputProperties: null
      },
      'K5JSINa9QxmC9OcJFRFD-Q': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.connectorRef',
          localName: 'infrastructure.infrastructureDefinition.spec.connectorRef'
        },
        yamlOutputProperties: null
      },
      '4ohKeTljQ8uoVDK5NZXelA': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.description',
          localName: 'stage.description'
        },
        yamlOutputProperties: null
      },
      ZnH8Xo_rR3SffIcBRhJeKA: {
        yamlProperties: {
          fqn: 'serviceConfig',
          localName: ''
        },
        yamlOutputProperties: null
      },
      t989wKT2Tcu10voxjpaLVw: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.environmentRef',
          localName: 'infrastructure.environmentRef'
        },
        yamlOutputProperties: null
      },
      jJnmTM44SYuEXn0gfVKUDQ: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.releaseName',
          localName: 'infrastructure.infrastructureDefinition.spec.releaseName'
        },
        yamlOutputProperties: null
      }
    },
    errorResponses: null,
    serviceExpressionPropertiesList: []
  },
  metaData: null,
  correlationId: 'fa70b7e0-bee4-404c-82b5-9eb09759fb0d'
}
export const variablesV2PostResponse = {
  status: 'SUCCESS',
  data: {
    yaml: '---\npipeline:\n  name: "x52Xrz5BSZ-ckdWRwfsMww"\n  identifier: "test"\n  projectIdentifier: "piHF9zptQTyonoEJphQyYQ"\n  orgIdentifier: "nwPJLY29QO2j5tjdr5Va_Q"\n  description: "8LLlShTRQh2gX_RA-PUqlQ"\n  tags:\n    __uuid: "vik35xpNSr-PqSymogVOsQ"\n  stages:\n  - stage:\n      name: "7am3z0odRDSUSyncafo55A"\n      identifier: "testStage"\n      description: "VizT_CrBSoCnUoqw7mA56g"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "rDTqDHIDShKcQQm9z4H_wg"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n              __uuid: "-EGvxgSMRzmILcNjV4YrMg"\n            __uuid: "gaEzi70mTLij9390k94Bsg"\n          __uuid: "CUywuYhiQXO6OQH1-qctQg"\n        infrastructure:\n          environmentRef: "WXMHm4XpTn-NVo_iTQbcRQ"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            __uuid: "2qrP1TeJSsWBhGfKgoOw5A"\n          allowSimultaneousDeployments: "U60cOAXMRfev4IIqaDKo0g"\n          __uuid: "0outuzElSA23LsD-SeqvVQ"\n        __uuid: "L_yNZ7nDRxuSO7jMXt8DbA"\n      tags:\n        __uuid: "WDh9yVb5QKuW0ukTZIMLew"\n      failureStrategies:\n      - onFailure:\n          errors: "v4KPoINyR7WzDxt1--U8tQ"\n          action:\n            type: "StageRollback"\n            __uuid: "el_033ZoSlmzlQV_JTGgdg"\n          __uuid: "bMOdOpkwSLyMi9A5sg0qBw"\n        __uuid: "iZ-uUkA0RC6Q-WTLU3Ogrw"\n      __uuid: "DX-0-mXHSn2mPhB_oVAVrQ"\n    __uuid: "zlZbUozRSnum8HjCPenOoQ"\n  __uuid: "QVdl321CSIq3RWzYOxIVVQ"\n__uuid: "LHYW-b81RKSPkEATVhUSyQ"\n',
    metadataMap: {
      'x52Xrz5BSZ-ckdWRwfsMww': {
        yamlProperties: {
          fqn: 'pipeline.name',
          localName: 'pipeline.name',
          variableName: 'name',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      'vik35xpNSr-PqSymogVOsQ': {
        yamlProperties: {
          fqn: 'pipeline.tags',
          localName: 'pipeline.tags',
          variableName: 'tags',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      QVdl321CSIq3RWzYOxIVVQ: {
        yamlProperties: {
          fqn: 'pipeline',
          localName: 'pipeline',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      '8LLlShTRQh2gX_RA-PUqlQ': {
        yamlProperties: {
          fqn: 'pipeline.description',
          localName: 'pipeline.description',
          variableName: 'description',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      '0outuzElSA23LsD-SeqvVQ': {
        yamlProperties: {
          fqn: 'infrastructure',
          localName: '',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      rDTqDHIDShKcQQm9z4H_wg: {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage.spec.serviceConfig.serviceRef',
          localName: 'serviceConfig.serviceRef',
          variableName: 'serviceRef',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      'DX-0-mXHSn2mPhB_oVAVrQ': {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage',
          localName: 'stage',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      '7am3z0odRDSUSyncafo55A': {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage.name',
          localName: 'stage.name',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      'WXMHm4XpTn-NVo_iTQbcRQ': {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage.spec.infrastructure.environmentRef',
          localName: 'infrastructure.environmentRef',
          variableName: 'environmentRef',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      'CUywuYhiQXO6OQH1-qctQg': {
        yamlProperties: {
          fqn: 'serviceConfig',
          localName: '',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      VizT_CrBSoCnUoqw7mA56g: {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage.description',
          localName: 'stage.description',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      }
    },
    errorResponses: null,
    serviceExpressionPropertiesList: [
      { serviceName: 'trigger', expression: 'trigger.targetBranch' },
      { serviceName: 'trigger', expression: 'trigger.sourceBranch' },
      { serviceName: 'trigger', expression: 'trigger.prNumber' },
      { serviceName: 'trigger', expression: 'trigger.prTitle' }
    ]
  },
  metaData: null,
  correlationId: 'a93159ac-9077-4f7d-832d-d89ef2a636ee'
}

export const pipelineStepsResponse = {
  status: 'SUCCESS',
  data: {
    name: 'Library',
    stepsData: [],
    stepCategories: [
      {
        name: 'Continuous Deployment',
        stepsData: [],
        stepCategories: [
          {
            name: 'Kubernetes',
            stepsData: [
              {
                name: 'BG Swap Services',
                type: 'K8sBGSwapServices',
                disabled: false,
                featureRestrictionName: 'K8S_BG_SWAP_SERVICES'
              },
              {
                name: 'Stage Deployment',
                type: 'K8sBlueGreenDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_BLUE_GREEN_DEPLOY'
              },
              { name: 'Apply', type: 'K8sApply', disabled: false, featureRestrictionName: 'K8S_APPLY' },
              { name: 'Delete', type: 'K8sDelete', disabled: false, featureRestrictionName: 'K8S_DELETE' },
              {
                name: 'Canary Delete',
                type: 'K8sCanaryDelete',
                disabled: false,
                featureRestrictionName: 'K8S_CANARY_DELETE'
              },
              {
                name: 'Rolling Deployment',
                type: 'K8sRollingDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_ROLLING_DEPLOY'
              },
              {
                name: 'Canary Deployment',
                type: 'K8sCanaryDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_CANARY_DEPLOY'
              },
              { name: 'Scale', type: 'K8sScale', disabled: false, featureRestrictionName: 'K8S_SCALE' },
              {
                name: 'Rolling Rollback',
                type: 'K8sRollingRollback',
                disabled: false,
                featureRestrictionName: 'K8S_ROLLING_ROLLBACK'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Terraform',
            stepsData: [
              {
                name: 'Terraform Destroy',
                type: 'TerraformDestroy',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_DESTROY'
              },
              {
                name: 'Terraform Rollback',
                type: 'TerraformRollback',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_ROLLBACK'
              },
              {
                name: 'Terraform Apply',
                type: 'TerraformApply',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_APPLY'
              },
              {
                name: 'Terraform Plan',
                type: 'TerraformPlan',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_PLAN'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Utilities',
            stepsData: [],
            stepCategories: [
              {
                name: 'Scripted',
                stepsData: [
                  { name: 'Shell Script', type: 'ShellScript', disabled: false, featureRestrictionName: null }
                ],
                stepCategories: []
              },
              {
                name: 'Non-Scripted',
                stepsData: [{ name: 'Http', type: 'Http', disabled: false, featureRestrictionName: null }],
                stepCategories: []
              }
            ]
          },
          {
            name: 'Approval',
            stepsData: [
              {
                name: 'Harness Approval',
                type: 'HarnessApproval',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_HARNESS_UI'
              },
              {
                name: 'Jira Approval',
                type: 'JiraApproval',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Jira',
            stepsData: [
              {
                name: 'Jira Create',
                type: 'JiraCreate',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              },
              {
                name: 'Jira Update',
                type: 'JiraUpdate',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              }
            ],
            stepCategories: []
          },
          {
            name: 'FlowControl',
            stepsData: [],
            stepCategories: [
              {
                name: 'Barrier',
                stepsData: [{ name: 'Barrier', type: 'Barrier', disabled: false, featureRestrictionName: null }],
                stepCategories: []
              }
            ]
          }
        ]
      },
      {
        name: 'Continuous Verification',
        stepsData: [],
        stepCategories: [
          {
            name: 'Continuous Verification',
            stepsData: [{ name: 'Verify', type: 'Verify', disabled: false, featureRestrictionName: null }],
            stepCategories: []
          },
          {
            name: 'Service Reliability',
            stepsData: [
              {
                name: 'Analyze Deployment Impact',
                type: 'AnalyzeDeploymentImpact',
                disabled: false,
                featureRestrictionName: 'ANALYZE_DEPLOYMENT_STEP'
              }
            ],
            stepCategories: []
          }
        ]
      }
    ]
  },
  metaData: null,
  correlationId: '8f5b8513-dc74-4bf7-a36c-228fe7e3c4c4'
}

export const monitoresServicesResponse = {
  status: 'SUCCESS',
  data: {
    createdAt: 1641552686531,
    lastModifiedAt: 1642054520322,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'shaswat',
      identifier: 'appd_prod',
      name: 'appd_prod',
      type: 'Application',
      description: '',
      serviceRef: 'appd',
      environmentRef: 'prod',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'appd-test',
            identifier: 'appdtest',
            type: 'AppDynamics',
            spec: {
              connectorRef: 'appdtest',
              feature: 'Application Monitoring',
              applicationName: 'cv-app',
              tierName: '1415279',
              metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
              metricDefinitions: []
            }
          }
        ],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'd986946a-3521-4648-a787-53150e21aed7'
}

export const emptyMonitoresServicesResponse = {
  status: 'SUCCESS',
  data: null,
  metaData: null,
  correlationId: 'e0d5d43a-21f7-41a3-bb59-6e953bcee461'
}

export const createMonitoredServiceResponse = {
  metaData: {},
  resource: {
    createdAt: 1661770505538,
    lastModifiedAt: 1661770505538,
    monitoredService: {
      orgIdentifier: 'CVNG',
      projectIdentifier: 'Signoff',
      identifier: 'testEnv_testService',
      name: 'testEnv_testService',
      type: 'Application',
      description: 'Default Monitored Service',
      serviceRef: 'testService',
      environmentRef: 'testEnv',
      environmentRefList: ['testEnv'],
      tags: {},
      sources: { healthSources: [], changeSources: [] },
      dependencies: [],
      notificationRuleRefs: [],
      template: null,
      enabled: false
    }
  },
  responseMessages: []
}

export const monitoresServicesResponseWithNoHealthSource = {
  status: 'SUCCESS',
  data: {
    createdAt: 1641552686531,
    lastModifiedAt: 1642054520322,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'shaswat',
      identifier: 'appd_prod',
      name: 'appd_prod',
      type: 'Application',
      description: '',
      serviceRef: 'appd',
      environmentRef: 'prod',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'd986946a-3521-4648-a787-53150e21aed7'
}

export const serviceEnvironmentNoMonitoredServicesResponse = {
  status: 'SUCCESS',
  data: null,
  metaData: null,
  correlationId: 'c8c2a3e5-4f73-4c03-8193-1dc7d99858d1'
}

export const stagesExecutionListResponse = {
  status: 'SUCCESS',
  data: [],
  metaData: null,
  correlationId: 'abe8947c-2acf-4905-bac1-732540adf73c'
}

export const inputSetsResponse = {
  status: 'SUCCESS',
  data: { totalPages: 0, totalItems: 0, pageItemCount: 0, pageSize: 100, content: [], pageIndex: 0, empty: true },
  metaData: null,
  correlationId: '21c2bd0f-b40d-4b8b-8cdf-c7b734ed2699'
}

export const inputSetsTemplateCallResponse = {
  status: 'SUCCESS',
  data: { modules: ['cd'], hasInputSets: false },
  metaData: null,
  correlationId: '570b47b8-1237-401a-bf63-9e1b01575cc6'
}

export const applyTemplatesResponse = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'name: "testPipeline_Cypress"\nidentifier: "testPipeline_Cypress"\nallowStageExecutions: false\nprojectIdentifier: "project1"\norgIdentifier: "CVNG"\ntags: {}\nstages:\n- stage:\n    name: "testStage_Cypress"\n    identifier: "testStage_Cypress"\n    description: ""\n    type: "Deployment"\n    spec:\n      serviceConfig:\n        serviceRef: "appd"\n        serviceDefinition:\n          type: "Kubernetes"\n          spec:\n            variables: []\n      infrastructure:\n        environmentRef: "prod"\n        infrastructureDefinition:\n          type: "KubernetesDirect"\n          spec:\n            connectorRef: "testk8s"\n            namespace: "testStage_Cypress"\n            releaseName: "release-<+INFRA_KEY>"\n        allowSimultaneousDeployments: false\n      execution:\n        steps:\n        - step:\n            name: "Rollout Deployment"\n            identifier: "rolloutDeployment"\n            type: "K8sRollingDeploy"\n            timeout: "10m"\n            spec:\n              skipDryRun: false\n        - step:\n            type: "Verify"\n            name: "testStage_Cypress"\n            identifier: "testStage_Cypress"\n            spec:\n              type: "Rolling"\n              spec:\n                sensitivity: "HIGH"\n                duration: "5m"\n                deploymentTag: "<+serviceConfig.artifacts.primary.tag>"\n            timeout: "2h"\n            failureStrategies:\n            - onFailure:\n                errors:\n                - "Verification"\n                action:\n                  type: "ManualIntervention"\n                  spec:\n                    timeout: "2h"\n                    onTimeout:\n                      action:\n                        type: "StageRollback"\n            - onFailure:\n                errors:\n                - "Unknown"\n                action:\n                  type: "ManualIntervention"\n                  spec:\n                    timeout: "2h"\n                    onTimeout:\n                      action:\n                        type: "Ignore"\n        rollbackSteps:\n        - step:\n            name: "Rollback Rollout Deployment"\n            identifier: "rollbackRolloutDeployment"\n            type: "K8sRollingRollback"\n            timeout: "10m"\n            spec: {}\n    tags: {}\n    failureStrategies:\n    - onFailure:\n        errors:\n        - "AllErrors"\n        action:\n          type: "StageRollback"\n',
    templateReferenceSummaries: []
  },
  metaData: null,
  correlationId: '689276a7-cb66-4c8e-af74-de05cedb37ee'
}

export const applyTemplatesResponseForServiceRuntime = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'name: "testPipeline_Cypress"\nidentifier: "testPipeline_Cypress"\nallowStageExecutions: false\nprojectIdentifier: "Dummy_Pipeline"\norgIdentifier: "CVNG"\ntags: {}\nstages:\n- stage:\n    name: "testStage_Cypress"\n    identifier: "testStage_Cypress"\n    description: ""\n    type: "Deployment"\n    spec:\n      serviceConfig:\n        serviceRef: "<+input>"\n        serviceDefinition:\n          type: "Kubernetes"\n          spec:\n            variables: []\n      infrastructure:\n        environmentRef: "prod"\n        infrastructureDefinition:\n          type: "KubernetesDirect"\n          spec:\n            connectorRef: "testk8s"\n            namespace: "testStage_Cypress"\n            releaseName: "release-<+INFRA_KEY>"\n        allowSimultaneousDeployments: false\n      execution:\n        steps:\n        - step:\n            name: "Rollout Deployment"\n            identifier: "rolloutDeployment"\n            type: "K8sRollingDeploy"\n            timeout: "10m"\n            spec:\n              skipDryRun: false\n        - step:\n            type: "Verify"\n            name: "testStage_Cypress"\n            identifier: "testStage_Cypress"\n            spec:\n              type: "Rolling"\n              spec:\n                sensitivity: "HIGH"\n                duration: "5m"\n                deploymentTag: "<+serviceConfig.artifacts.primary.tag>"\n            timeout: "2h"\n            failureStrategies:\n            - onFailure:\n                errors:\n                - "Verification"\n                action:\n                  type: "ManualIntervention"\n                  spec:\n                    timeout: "2h"\n                    onTimeout:\n                      action:\n                        type: "StageRollback"\n            - onFailure:\n                errors:\n                - "Unknown"\n                action:\n                  type: "ManualIntervention"\n                  spec:\n                    timeout: "2h"\n                    onTimeout:\n                      action:\n                        type: "Ignore"\n        rollbackSteps:\n        - step:\n            name: "Rollback Rollout Deployment"\n            identifier: "rollbackRolloutDeployment"\n            type: "K8sRollingRollback"\n            timeout: "10m"\n            spec: {}\n    tags: {}\n    failureStrategies:\n    - onFailure:\n        errors:\n        - "AllErrors"\n        action:\n          type: "StageRollback"\n',
    templateReferenceSummaries: []
  },
  metaData: null,
  correlationId: '18de0752-2b9c-4a97-8229-b8e8d229f3b9'
}

export const pipelineSaveResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: testPipeline_Cypress\n    identifier: testPipeline_Cypress\n    allowStageExecutions: false\n    projectIdentifier: project1\n    orgIdentifier: CVNG\n    tags: {}\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: testk8s\n                              namespace: testStage_Cypress\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: testStage_Cypress\n                                identifier: testStage_Cypress\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n',
    version: 3,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: 'd0779a1a-ddcf-4ef0-a83f-fec0e894c180'
}

export const pipelineSaveServiceRuntimeResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: testPipeline_Cypress\n    identifier: testPipeline_Cypress\n    allowStageExecutions: false\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: account.ccm744xxng\n                              namespace: verify-step\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: test-verify\n                                identifier: testverify\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n    projectIdentifier: test_Projectddd\n    orgIdentifier: aa2ndOrgSunny\n    tags: {}\n',
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: '604df445-22b0-4bb2-a560-f72b06342156'
}

export const inputSetsTemplateResponse = {
  status: 'SUCCESS',
  data: {
    inputSetTemplateYaml:
      'pipeline:\n  identifier: "testPipeline_Cypress"\n  stages:\n  - stage:\n      identifier: "testStage_Cypress"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n',
    modules: ['cd']
  },
  metaData: null,
  correlationId: '4c2742f8-7354-4627-896f-445a144eadc6'
}

export const inputSetsTemplateResponse2 = {
  status: 'SUCCESS',
  data: {
    inputSetTemplateYaml:
      'pipeline:\n  identifier: "test2"\n  stages:\n  - stage:\n      identifier: "testStage_Cypress"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n',
    modules: ['cd'],
    hasInputSets: false
  },
  metaData: null,
  correlationId: '3008ef61-8f0b-4a4f-8b7b-64897d4ba9d0'
}

export const pipelineDetailsWithRoutingIDResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: testPipeline_Cypress\n    identifier: testPipeline_Cypress\n    allowStageExecutions: false\n    projectIdentifier: Dummy_Pipeline\n    orgIdentifier: CVNG\n    tags: {}\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: testk8s\n                              namespace: testStage_Cypress\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: testStage_Cypress\n                                identifier: testStage_Cypress\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n',
    version: 3,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: 'd580f15a-c831-439b-82e0-dda58ce0b40f'
}

export const pipelineSummaryResponse = {
  status: 'SUCCESS',
  data: {
    name: 'testPipeline_Cypress',
    identifier: 'testPipeline_Cypress',
    tags: {},
    version: 3,
    numOfStages: 1,
    createdAt: 1645768746144,
    lastUpdatedAt: 1645781212062,
    modules: ['cd'],
    recentExecutionsInfo: [],
    filters: {
      cd: {
        deploymentTypes: ['Kubernetes'],
        environmentNames: ['prod'],
        serviceNames: [],
        infrastructureTypes: ['KubernetesDirect']
      }
    },
    stageNames: ['test2'],
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null }
  },
  metaData: null,
  correlationId: 'b306db34-72a0-4bfc-8fb1-2c18b2021b2a'
}

export const servicesV2AccessResponse = {
  status: 'SUCCESS',
  data: [
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    },
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService2',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService2',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    },
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService3',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService3',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    }
  ],
  metaData: null,
  correlationId: 'dbfcc921-47f3-4841-b67a-7a4f85b7d5f3'
}

export const inputSetTemplateRuntimeServiceResponse = {
  status: 'SUCCESS',
  data: {
    inputSetTemplateYaml:
      '---\npipeline:\n  identifier: "testPipeline_Cypress"\n  stages:\n  - stage:\n      identifier: "testStage_Cypress"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n        execution:\n          steps:\n          - step:\n              identifier: "testverify"\n              type: "Verify"\n'
  },
  metaData: null,
  correlationId: 'c4d605ed-f80d-485e-a4eb-9bac5e0f4551'
}

export const logsListCallResponse = {
  metaData: {},
  resource: {
    totalClusters: 1,
    eventCounts: [
      {
        clusterType: 'KNOWN_EVENT',
        count: 1,
        displayName: 'Known'
      },
      {
        clusterType: 'UNEXPECTED_FREQUENCY',
        count: 0,
        displayName: 'Unexpected Frequency'
      },
      {
        clusterType: 'UNKNOWN_EVENT',
        count: 0,
        displayName: 'Unknown'
      },
      {
        clusterType: 'BASELINE',
        count: 1,
        displayName: 'Baseline'
      }
    ],
    logAnalysisRadarCharts: {
      totalPages: 1,
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 10,
      content: [
        {
          message: 'test 1',
          clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1c',
          label: 0,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 8,
          testHostFrequencyData: [
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 1.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host1'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 2.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host2'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 2.0
                },
                {
                  timeStamp: 1672845660,
                  count: 2.0
                }
              ],
              host: 'host3'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 4.0
                },
                {
                  timeStamp: 1672845660,
                  count: 4.0
                }
              ],
              host: 'host4'
            }
          ],
          totalTestFrequencyData: [
            {
              timeStamp: 1672845420,
              count: 3.0
            },
            {
              timeStamp: 1672845480,
              count: 0.0
            },
            {
              timeStamp: 1672845540,
              count: 0.0
            },
            {
              timeStamp: 1672845600,
              count: 6.0
            },
            {
              timeStamp: 1672845660,
              count: 6.0
            }
          ],
          averageControlFrequencyData: [
            {
              timeStamp: 1672845060,
              count: 1
            },
            {
              timeStamp: 1672845120,
              count: 2
            },
            {
              timeStamp: 1672845180,
              count: 1
            },
            {
              timeStamp: 1672845240,
              count: 3
            },
            {
              timeStamp: 1672845300,
              count: 10
            }
          ],
          feedbackApplied: {
            feedbackScore: 'HIGH_RISK',
            description:
              'Some applied reason Some applied reason Some applied reason Some applied reason Some applied reasonSome applied reason',
            createdBy: 'pranesh@harness.io',
            createdAt: 1677414780069,
            updatedBy: 'pranesh@harness.io',
            updatedAt: 1677414840933,
            feedbackId: 'abc'
          },
          feedback: {
            feedbackScore: 'MEDIUM_RISK',
            description: 'Some reason',
            createdBy: 'pranesh@harness.io',
            createdAt: 1677414780069,
            updatedBy: 'pranesh@harness.io',
            updatedAt: 1677414840933,
            feedbackId: 'abc'
          }
        },
        {
          message: 'test 2',
          clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1a',
          label: 0,
          risk: 'HEALTHY',
          clusterType: 'UNKNOWN_EVENT',
          count: 8,
          testHostFrequencyData: [
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 1.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host1'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 2.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host2'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 2.0
                },
                {
                  timeStamp: 1672845660,
                  count: 2.0
                }
              ],
              host: 'host3'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 4.0
                },
                {
                  timeStamp: 1672845660,
                  count: 4.0
                }
              ],
              host: 'host4'
            }
          ],
          totalTestFrequencyData: [
            {
              timeStamp: 1672845420,
              count: 3.0
            },
            {
              timeStamp: 1672845480,
              count: 0.0
            },
            {
              timeStamp: 1672845540,
              count: 0.0
            },
            {
              timeStamp: 1672845600,
              count: 6.0
            },
            {
              timeStamp: 1672845660,
              count: 6.0
            }
          ],
          averageControlFrequencyData: [
            {
              timeStamp: 1672845060,
              count: 1
            },
            {
              timeStamp: 1672845120,
              count: 2
            },
            {
              timeStamp: 1672845180,
              count: 1
            },
            {
              timeStamp: 1672845240,
              count: 3
            },
            {
              timeStamp: 1672845300,
              count: 10
            }
          ]
        },
        {
          message: 'test 2',
          clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1d',
          label: 0,
          risk: 'HEALTHY',
          clusterType: 'UNEXPECTED_FREQUENCY',
          count: 8,
          testHostFrequencyData: [
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 1.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host1'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 2.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host2'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 2.0
                },
                {
                  timeStamp: 1672845660,
                  count: 2.0
                }
              ],
              host: 'host3'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 4.0
                },
                {
                  timeStamp: 1672845660,
                  count: 4.0
                }
              ],
              host: 'host4'
            }
          ],
          totalTestFrequencyData: [
            {
              timeStamp: 1672845420,
              count: 3.0
            },
            {
              timeStamp: 1672845480,
              count: 0.0
            },
            {
              timeStamp: 1672845540,
              count: 0.0
            },
            {
              timeStamp: 1672845600,
              count: 6.0
            },
            {
              timeStamp: 1672845660,
              count: 6.0
            }
          ],
          averageControlFrequencyData: [
            {
              timeStamp: 1672845060,
              count: 1
            },
            {
              timeStamp: 1672845120,
              count: 2
            },
            {
              timeStamp: 1672845180,
              count: 1
            },
            {
              timeStamp: 1672845240,
              count: 3
            },
            {
              timeStamp: 1672845300,
              count: 10
            }
          ]
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

export const logsListCallResponseWithTicket = {
  metaData: {},
  resource: {
    totalClusters: 1,
    eventCounts: [
      {
        clusterType: 'KNOWN_EVENT',
        count: 1,
        displayName: 'Known'
      },
      {
        clusterType: 'UNEXPECTED_FREQUENCY',
        count: 0,
        displayName: 'Unexpected Frequency'
      },
      {
        clusterType: 'UNKNOWN_EVENT',
        count: 0,
        displayName: 'Unknown'
      },
      {
        clusterType: 'BASELINE',
        count: 1,
        displayName: 'Baseline'
      }
    ],
    logAnalysisRadarCharts: {
      totalPages: 1,
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 10,
      content: [
        {
          message: 'test 1',
          clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1c',
          label: 0,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 8,
          testHostFrequencyData: [
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 1.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host1'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 2.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host2'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 2.0
                },
                {
                  timeStamp: 1672845660,
                  count: 2.0
                }
              ],
              host: 'host3'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 4.0
                },
                {
                  timeStamp: 1672845660,
                  count: 4.0
                }
              ],
              host: 'host4'
            }
          ],
          totalTestFrequencyData: [
            {
              timeStamp: 1672845420,
              count: 3.0
            },
            {
              timeStamp: 1672845480,
              count: 0.0
            },
            {
              timeStamp: 1672845540,
              count: 0.0
            },
            {
              timeStamp: 1672845600,
              count: 6.0
            },
            {
              timeStamp: 1672845660,
              count: 6.0
            }
          ],
          averageControlFrequencyData: [
            {
              timeStamp: 1672845060,
              count: 1
            },
            {
              timeStamp: 1672845120,
              count: 2
            },
            {
              timeStamp: 1672845180,
              count: 1
            },
            {
              timeStamp: 1672845240,
              count: 3
            },
            {
              timeStamp: 1672845300,
              count: 10
            }
          ],
          feedbackApplied: {
            feedbackScore: 'HIGH_RISK',
            description:
              'Some applied reason Some applied reason Some applied reason Some applied reason Some applied reasonSome applied reason',
            createdBy: 'pranesh@harness.io',
            createdAt: 1677414780069,
            updatedBy: 'pranesh@harness.io',
            updatedAt: 1677414840933,
            feedbackId: 'abc'
          },
          feedback: {
            feedbackScore: 'MEDIUM_RISK',
            description: 'Some reason',
            createdBy: 'pranesh@harness.io',
            createdAt: 1677414780069,
            updatedBy: 'pranesh@harness.io',
            updatedAt: 1677414840933,
            feedbackId: 'abc',
            ticket: {
              id: '123',
              externalId: 'SRM-123',
              url: 'abc.com'
            }
          }
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

export const logsRadarChartDataCallResponse = {
  metaData: {},
  resource: [
    {
      label: 0,
      message: 'Test Message',
      risk: 'UNHEALTHY',
      radius: 1.664038103272266,
      clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1c',
      angle: 0.0,
      baseline: {
        label: 0,
        message: '< Transfer-Encoding: chunked\r\n',
        risk: 'NO_ANALYSIS',
        radius: 0.7284758929526032,
        angle: 0.0,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'UNEXPECTED_FREQUENCY',
      hasControlData: true,
      cluterId: 1
    },
    {
      label: 30003,
      message:
        '2022-02-10 07:22:59 UTC | TRACE | INFO | (pkg/trace/info/stats.go:104 in LogStats) | No data received\n',
      risk: 'UNHEALTHY',
      radius: 2.390506479391404,
      angle: 12.413793103448276,
      baseline: null,
      clusterType: 'UNKNOWN_EVENT',
      hasControlData: false
    },
    {
      label: 30001,
      message:
        '  A v e r a g e   S p e e d       T i m  e         T i m e        D lToiamde    UCpuload   Trorteanlt \n',
      risk: 'UNHEALTHY',
      radius: 2.893341160200387,
      angle: 24.82758620689655,
      baseline: null,
      clusterType: 'UNKNOWN_EVENT',
      hasControlData: false,
      cluterId: 2
    },
    {
      label: 30002,
      message:
        '  % Total    % Received % Xferd  Average Spee d   %  TTimoet a  l  T i m e%   R e c eTiivmeed   %C uXrfreerndt \n',
      risk: 'UNHEALTHY',
      radius: 2.749641708001546,
      angle: 37.241379310344826,
      baseline: null,
      clusterType: 'UNKNOWN_EVENT',
      hasControlData: false
    },
    {
      label: 30000,
      message:
        '    \r     0          D0l o a d   Up0l o a d    0  T   o0 t a l    S p0e n t     L   e0f t       0S p-e-e:d-\n',
      risk: 'UNHEALTHY',
      radius: 2.3594828023066827,
      angle: 49.6551724137931,
      baseline: null,
      clusterType: 'UNKNOWN_EVENT',
      hasControlData: false,
      cluterId: 3
    },
    {
      label: 11,
      message: '{ [2938 bytes data]\n',
      risk: 'HEALTHY',
      radius: 1.4753724935052714,
      angle: 62.06896551724138,
      baseline: {
        label: 11,
        message: '{ [2938 bytes data]\n',
        risk: 'NO_ANALYSIS',
        radius: 0.7435991129150041,
        angle: 62.06896551724138,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 4
    },
    {
      label: 98,
      message:
        '</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/8.5.41</h3></body></html><!doctype html><html lang="en"><head><title>HTTP Status 500 – Internal Server Error</title><style type="text/css">h1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} h2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} h3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} body {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} b {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} p {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;} a {color:black;} a.name {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.</p><p><b>Exception</b></p><pre>java.lang.NullPointerException\n',
      risk: 'HEALTHY',
      radius: 1.114701392021402,
      angle: 74.48275862068965,
      baseline: {
        label: 98,
        message:
          '</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/8.5.41</h3></body></html><!doctype html><html lang="en"><head><title>HTTP Status 500 – Internal Server Error</title><style type="text/css">h1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} h2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} h3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} body {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} b {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} p {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;} a {color:black;} a.name {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.</p><p><b>Exception</b></p><pre>java.lang.NullPointerException\n',
        risk: 'NO_ANALYSIS',
        radius: 0.624414806316096,
        angle: 74.48275862068965,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 5
    },
    {
      label: 112,
      message: '< Location: display.jsp\r\n',
      risk: 'HEALTHY',
      radius: 1.2743624821383874,
      angle: 86.89655172413792,
      baseline: {
        label: 112,
        message: '< Location: display.jsp\r\n',
        risk: 'NO_ANALYSIS',
        radius: 0.7819754958788627,
        angle: 86.89655172413792,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 6
    },
    {
      label: 80,
      message: '< Date: Thu, 10 Feb 2022 07:22:58 GMT\r\n',
      risk: 'HEALTHY',
      radius: 1.191633119402034,
      angle: 99.31034482758619,
      baseline: {
        label: 80,
        message: '< Date: Thu, 10 Feb 2022 07:22:58 GMT\r\n',
        risk: 'NO_ANALYSIS',
        radius: 0.747427073093925,
        angle: 99.31034482758619,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 7
    },
    {
      label: 89,
      message: '* upload completely sent off: 47 out of 47 bytes\n',
      risk: 'HEALTHY',
      radius: 1.858619157500502,
      angle: 111.72413793103446,
      baseline: {
        label: 89,
        message: '* upload completely sent off: 47 out of 47 bytes\n',
        risk: 'NO_ANALYSIS',
        radius: 0.8340526408266267,
        angle: 111.72413793103446,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 8
    },
    {
      label: 92,
      message: '* TCP_NODELAY set\n',
      risk: 'HEALTHY',
      radius: 1.593751154844217,
      angle: 124.13793103448273,
      baseline: {
        label: 92,
        message: '* TCP_NODELAY set\n',
        risk: 'NO_ANALYSIS',
        radius: 0.6157422250847977,
        angle: 124.13793103448273,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 9
    },
    {
      label: 5,
      message: '* Re-using existing connection! (#0) with host localhost\n',
      risk: 'HEALTHY',
      radius: 1.8772513437726532,
      angle: 136.55172413793102,
      baseline: {
        label: 5,
        message: '* Re-using existing connection! (#0) with host localhost\n',
        risk: 'NO_ANALYSIS',
        radius: 0.7562558045246719,
        angle: 136.55172413793102,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 10
    }
  ],
  responseMessages: []
}

export const inputSetTemplateNoInput = {
  status: 'SUCCESS',
  data: { modules: ['cd'], hasInputSets: false },
  metaData: null,
  correlationId: '386785c4-4313-4ee5-b4cf-d6a269e3befb'
}

export const templateResolvedPipelineResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: test2\n    identifier: test2\n    allowStageExecutions: false\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: eeeee\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: account.ccm744xxng\n                              namespace: nss\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: test\n                                identifier: test\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n    projectIdentifier: test_Projectddd\n    orgIdentifier: aa2ndOrgSunny\n    tags: {}\n',
    resolvedTemplatesPipelineYaml:
      'pipeline:\n  name: "test2"\n  identifier: "test2"\n  allowStageExecutions: false\n  stages:\n  - stage:\n      name: "testStage_Cypress"\n      identifier: "testStage_Cypress"\n      description: ""\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "eeeee"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n        infrastructure:\n          environmentRef: "prod"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "account.ccm744xxng"\n              namespace: "nss"\n              releaseName: "release-<+INFRA_KEY>"\n          allowSimultaneousDeployments: false\n        execution:\n          steps:\n          - step:\n              name: "Rollout Deployment"\n              identifier: "rolloutDeployment"\n              type: "K8sRollingDeploy"\n              timeout: "10m"\n              spec:\n                skipDryRun: false\n          - step:\n              type: "Verify"\n              name: "test"\n              identifier: "test"\n              spec:\n                type: "Rolling"\n                spec:\n                  sensitivity: "HIGH"\n                  duration: "5m"\n                  deploymentTag: "<+serviceConfig.artifacts.primary.tag>"\n              timeout: "2h"\n              failureStrategies:\n              - onFailure:\n                  errors:\n                  - "Verification"\n                  action:\n                    type: "ManualIntervention"\n                    spec:\n                      timeout: "2h"\n                      onTimeout:\n                        action:\n                          type: "StageRollback"\n              - onFailure:\n                  errors:\n                  - "Unknown"\n                  action:\n                    type: "ManualIntervention"\n                    spec:\n                      timeout: "2h"\n                      onTimeout:\n                        action:\n                          type: "Ignore"\n          rollbackSteps:\n          - step:\n              name: "Rollback Rollout Deployment"\n              identifier: "rollbackRolloutDeployment"\n              type: "K8sRollingRollback"\n              timeout: "10m"\n              spec: {}\n      tags: {}\n      failureStrategies:\n      - onFailure:\n          errors:\n          - "AllErrors"\n          action:\n            type: "StageRollback"\n  projectIdentifier: "test_Projectddd"\n  orgIdentifier: "aa2ndOrgSunny"\n  tags: {}\n',
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: 'b113202a-508a-458e-a9e1-a42d5849558d'
}

export const strategiesYAMLResponse = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - step:\n          name: "Rollout Deployment"\n          identifier: rolloutDeployment\n          type: K8sRollingDeploy\n          timeout: 10m\n          spec:\n            skipDryRun: false\n    rollbackSteps:\n      - step:\n          name: "Rollback Rollout Deployment"\n          identifier: rollbackRolloutDeployment\n          type: K8sRollingRollback\n          timeout: 10m\n          spec: {}\n',
  metaData: null,
  correlationId: '4cc32df2-42f5-45a3-977f-500c1c9c9a2d'
}

export const savePipelineGetResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: testPipeline_Cypress\n    identifier: testPipeline_Cypress\n    allowStageExecutions: false\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: account.ccm744xxng\n                              namespace: ns\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: test-verify\n                                identifier: testverify\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n    projectIdentifier: test_Projectddd\n    orgIdentifier: aa2ndOrgSunny\n    tags: {}\n',
    resolvedTemplatesPipelineYaml:
      'pipeline:\n  name: "testPipeline_Cypress"\n  identifier: "testPipeline_Cypress"\n  allowStageExecutions: false\n  stages:\n  - stage:\n      name: "testStage_Cypress"\n      identifier: "testStage_Cypress"\n      description: ""\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n        infrastructure:\n          environmentRef: "prod"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "account.ccm744xxng"\n              namespace: "ns"\n              releaseName: "release-<+INFRA_KEY>"\n          allowSimultaneousDeployments: false\n        execution:\n          steps:\n          - step:\n              name: "Rollout Deployment"\n              identifier: "rolloutDeployment"\n              type: "K8sRollingDeploy"\n              timeout: "10m"\n              spec:\n                skipDryRun: false\n          - step:\n              type: "Verify"\n              name: "test-verify"\n              identifier: "testverify"\n              spec:\n                type: "Rolling"\n                spec:\n                  sensitivity: "HIGH"\n                  duration: "5m"\n                  deploymentTag: "<+serviceConfig.artifacts.primary.tag>"\n              timeout: "2h"\n              failureStrategies:\n              - onFailure:\n                  errors:\n                  - "Verification"\n                  action:\n                    type: "ManualIntervention"\n                    spec:\n                      timeout: "2h"\n                      onTimeout:\n                        action:\n                          type: "StageRollback"\n              - onFailure:\n                  errors:\n                  - "Unknown"\n                  action:\n                    type: "ManualIntervention"\n                    spec:\n                      timeout: "2h"\n                      onTimeout:\n                        action:\n                          type: "Ignore"\n          rollbackSteps:\n          - step:\n              name: "Rollback Rollout Deployment"\n              identifier: "rollbackRolloutDeployment"\n              type: "K8sRollingRollback"\n              timeout: "10m"\n              spec: {}\n      tags: {}\n      failureStrategies:\n      - onFailure:\n          errors:\n          - "AllErrors"\n          action:\n            type: "StageRollback"\n  projectIdentifier: "test_Projectddd"\n  orgIdentifier: "aa2ndOrgSunny"\n  tags: {}\n',
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: '129fe201-d9fe-4145-8d63-997a004d4ab3'
}

export const inputSetsTemplateServiceRunTimeInputResponse = {
  status: 'SUCCESS',
  data: {
    inputSetTemplateYaml:
      'pipeline:\n  identifier: "testPipeline_Cypress"\n  stages:\n  - stage:\n      identifier: "testStage_Cypress"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n',
    modules: ['cd'],
    hasInputSets: false
  },
  metaData: null,
  correlationId: '9691f646-56a0-467e-bdc4-a66c6df6a59d'
}

export const configurableMonitoredServicesResponse = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'hgfhgfghfhgf_ddscsdcdsc',
      name: 'hgfhgfghfhgf',
      healthSources: [{ name: 'appd', identifier: 'appd' }]
    },
    {
      identifier: 'orders_prod',
      name: 'orders_prod',
      healthSources: [
        { name: 'template_appdcustom_dev', identifier: 'template_appdcustom_dev' },
        { name: 'et', identifier: 'et' },
        { name: 'template_java_stacktraces_dev', identifier: 'template_java_stacktraces_dev' }
      ]
    }
  ],
  metaData: null,
  correlationId: '18ed89a1-6457-4f05-92ff-8252601861ba'
}

export const monitoredServiceResponse = {
  status: 'SUCCESS',
  data: {
    createdAt: 1643115344068,
    lastModifiedAt: 1649221457431,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      identifier: 'orders_prod',
      name: 'orders_prod',
      type: 'Application',
      description: '',
      serviceRef: 'orders',
      environmentRef: 'prod',
      environmentRefList: ['prod'],
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'template_java_stacktraces_dev',
            identifier: 'template_java_stacktraces_dev',
            type: 'Splunk',
            spec: {
              connectorRef: 'splunk',
              feature: 'Splunk Cloud Logs',
              queries: [{ name: 'SPLUNK Logs Query', query: '*', serviceInstanceIdentifier: 'host' }]
            }
          },
          {
            name: 'et',
            identifier: 'et',
            type: 'ErrorTracking',
            spec: { connectorRef: 'error_t', feature: 'ERROR_TRACKING' }
          },
          {
            name: 'template_appdcustom_dev',
            identifier: 'template_appdcustom_dev',
            type: 'AppDynamics',
            spec: {
              connectorRef: 'account.appdtest',
              feature: 'Application Monitoring',
              applicationName: 'cv-app',
              tierName: 'docker-tier',
              metricPacks: [{ identifier: 'Performance', metricThresholds: null }],
              metricDefinitions: []
            }
          }
        ],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: [],
      notificationRuleRefs: [],
      template: null,
      enabled: false
    }
  },
  metaData: null,
  correlationId: 'd9e488b4-0411-41ce-9a8e-bb909a1884c6'
}

export const templatesAPIResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        identifier: 'Verify_step_mon_template',
        name: 'Verify step mon template',
        description: '',
        tags: {},
        yaml: 'template:\n    name: Verify step mon template\n    identifier: Verify_step_mon_template\n    versionLabel: "1.0"\n    type: MonitoredService\n    projectIdentifier: chidemo\n    orgIdentifier: CVNG\n    tags: {}\n    spec:\n        serviceRef: <+input>\n        environmentRef: <+input>\n        type: Application\n        sources:\n            healthSources:\n                - name: Appd\n                  identifier: Appd\n                  type: AppDynamics\n                  spec:\n                      applicationName: <+input>\n                      tierName: <+input>\n                      metricData:\n                          Errors: true\n                          Performance: true\n                      metricDefinitions:\n                          - identifier: appdMetric\n                            metricName: appdMetric\n                            baseFolder: ""\n                            metricPath: ""\n                            completeMetricPath: <+input>\n                            groupName: group-1\n                            sli:\n                                enabled: true\n                            analysis:\n                                riskProfile:\n                                    category: Errors\n                                    metricType: ERROR\n                                    thresholdTypes:\n                                        - ACT_WHEN_HIGHER\n                                liveMonitoring:\n                                    enabled: true\n                                deploymentVerification:\n                                    enabled: true\n                                    serviceInstanceMetricPath: <+input>\n                      feature: Application Monitoring\n                      connectorRef: <+input>\n                      metricPacks:\n                          - identifier: Errors\n                          - identifier: Performance\n        name: <+monitoredService.serviceRef> <+monitoredService.environmentRef>\n        identifier: <+monitoredService.serviceRef>_<+monitoredService.environmentRef>\n        variables:\n            - name: connectorVariable\n              type: String\n              value: <+input>\n',
        versionLabel: '1.0',
        templateEntityType: 'MonitoredService',
        childType: 'Application',
        templateScope: 'project',
        version: 3,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        lastUpdatedAt: 1655874265454,
        createdAt: 1655798290591,
        stableTemplate: true
      }
    ],
    pageable: {
      sort: { sorted: true, unsorted: false, empty: false },
      pageSize: 20,
      pageNumber: 0,
      offset: 0,
      unpaged: false,
      paged: true
    },
    totalPages: 1,
    totalElements: 1,
    last: true,
    sort: { sorted: true, unsorted: false, empty: false },
    number: 0,
    first: true,
    numberOfElements: 1,
    size: 20,
    empty: false
  },
  metaData: null,
  correlationId: '0c7feae3-92c2-4159-86aa-e804ef33c295'
}

export const allTemplatesResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        identifier: 'Verify_step_mon_template',
        name: 'Verify step mon template',
        description: '',
        tags: {},
        yaml: 'template:\n    name: Verify step mon template\n    identifier: Verify_step_mon_template\n    versionLabel: "1.0"\n    type: MonitoredService\n    projectIdentifier: chidemo\n    orgIdentifier: CVNG\n    tags: {}\n    spec:\n        serviceRef: <+input>\n        environmentRef: <+input>\n        type: Application\n        sources:\n            healthSources:\n                - name: Appd\n                  identifier: Appd\n                  type: AppDynamics\n                  spec:\n                      applicationName: <+input>\n                      tierName: <+input>\n                      metricData:\n                          Errors: true\n                          Performance: true\n                      metricDefinitions:\n                          - identifier: appdMetric\n                            metricName: appdMetric\n                            baseFolder: ""\n                            metricPath: ""\n                            completeMetricPath: <+input>\n                            groupName: group-1\n                            sli:\n                                enabled: true\n                            analysis:\n                                riskProfile:\n                                    category: Errors\n                                    metricType: ERROR\n                                    thresholdTypes:\n                                        - ACT_WHEN_HIGHER\n                                liveMonitoring:\n                                    enabled: true\n                                deploymentVerification:\n                                    enabled: true\n                                    serviceInstanceMetricPath: <+input>\n                      feature: Application Monitoring\n                      connectorRef: <+input>\n                      metricPacks:\n                          - identifier: Errors\n                          - identifier: Performance\n        name: <+monitoredService.serviceRef> <+monitoredService.environmentRef>\n        identifier: <+monitoredService.serviceRef>_<+monitoredService.environmentRef>\n        variables:\n            - name: connectorVariable\n              type: String\n              value: <+input>\n',
        versionLabel: '1.0',
        templateEntityType: 'MonitoredService',
        childType: 'Application',
        templateScope: 'project',
        version: 3,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: null,
          repoName: null,
          commitId: null,
          fileUrl: null
        },
        entityValidityDetails: { valid: true, invalidYaml: null },
        lastUpdatedAt: 1655874265454,
        createdAt: 1655798290591,
        stableTemplate: true
      }
    ],
    pageable: {
      sort: { sorted: true, unsorted: false, empty: false },
      pageSize: 25,
      pageNumber: 0,
      offset: 0,
      unpaged: false,
      paged: true
    },
    totalPages: 1,
    last: true,
    totalElements: 1,
    sort: { sorted: true, unsorted: false, empty: false },
    number: 0,
    first: true,
    numberOfElements: 1,
    size: 25,
    empty: false
  },
  metaData: null,
  correlationId: 'c0c1c67b-44e7-4410-a822-530e029a6ba6'
}

export const templateInputsResponse = {
  status: 'SUCCESS',
  data: 'identifier: "Verify_step_mon_template"\ntype: "Application"\nserviceRef: "<+input>"\nenvironmentRef: "<+input>"\nsources:\n  healthSources:\n  - identifier: "appd"\n    type: "AppDynamics"\n    spec:\n      applicationName: "<+input>"\n      tierName: "<+input>"\n      connectorRef: "<+input>"\n',
  metaData: null,
  correlationId: 'ad14eff4-dc40-464b-8dcf-fd10de02c838'
}

export const applyTemplatesResponseData = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'name: "Verify step mon template"\nidentifier: "Verify_step_mon_template"\nversionLabel: "1.0"\ntype: "MonitoredService"\nprojectIdentifier: "chidemo"\norgIdentifier: "CVNG"\ntags: {}\nspec:\n  serviceRef: "<+input>"\n  environmentRef: "<+input>"\n  type: "Application"\n  sources:\n    healthSources:\n    - name: "Appd"\n      identifier: "Appd"\n      type: "AppDynamics"\n      spec:\n        applicationName: "<+input>"\n        tierName: "<+input>"\n        metricData:\n          Errors: true\n          Performance: true\n        metricDefinitions:\n        - identifier: "appdMetric"\n          metricName: "appdMetric"\n          baseFolder: ""\n          metricPath: ""\n          completeMetricPath: "<+input>"\n          groupName: "group-1"\n          sli:\n            enabled: true\n          analysis:\n            riskProfile:\n              category: "Errors"\n              metricType: "ERROR"\n              thresholdTypes:\n              - "ACT_WHEN_HIGHER"\n            liveMonitoring:\n              enabled: true\n            deploymentVerification:\n              enabled: true\n              serviceInstanceMetricPath: "<+input>"\n        feature: "Application Monitoring"\n        connectorRef: "<+input>"\n        metricPacks:\n        - identifier: "Errors"\n        - identifier: "Performance"\n  name: "<+monitoredService.serviceRef> <+monitoredService.environmentRef>"\n  identifier: "<+monitoredService.serviceRef>_<+monitoredService.environmentRef>"\n  variables:\n  - name: "connectorVariable"\n    type: "String"\n    value: "<+input>"\n',
    templateReferenceSummaries: []
  },
  metaData: null,
  correlationId: '180d3d87-c93e-49fb-8ac7-37ed20d36213'
}

export const specificTemplatesResponse = {
  status: 'SUCCESS',
  data: {
    accountId: 'accountId',
    orgIdentifier: 'default',
    projectIdentifier: 'project1',
    identifier: 'Verify_step_mon_template',
    name: 'Verify step mon template',
    description: '',
    tags: {},
    yaml: 'template:\n    name: Verify step mon template\n    identifier: Verify_step_mon_template\n    versionLabel: "1.0"\n    type: MonitoredService\n    projectIdentifier: Template_Testing\n    orgIdentifier: SRM\n    tags: {}\n    spec:\n        serviceRef: <+input>\n        environmentRef: <+input>\n        type: Application\n        sources:\n            changeSources:\n                - name: Harness CD Next Gen\n                  identifier: harness_cd_next_gen\n                  type: HarnessCDNextGen\n                  enabled: true\n                  category: Deployment\n                  spec: {}\n            healthSources:\n                - name: appd\n                  identifier: appd\n                  type: AppDynamics\n                  spec:\n                      applicationName: <+input>\n                      tierName: <+input>\n                      metricData:\n                          Errors: true\n                          Performance: true\n                      metricDefinitions: []\n                      feature: Application Monitoring\n                      connectorRef: <+input>\n                      metricPacks:\n                          - identifier: Errors\n                          - identifier: Performance\n        name: <+monitoredService.serviceRef> <+monitoredService.environmentRef>\n        identifier: <+monitoredService.serviceRef>_<+monitoredService.environmentRef>\n',
    versionLabel: '1.0',
    templateEntityType: 'MonitoredService',
    childType: 'Application',
    templateScope: 'project',
    version: 1,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null,
      commitId: null,
      fileUrl: null,
      repoUrl: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    lastUpdatedAt: 1657789960909,
    storeType: 'INLINE',
    stableTemplate: true
  },
  metaData: null,
  correlationId: 'be48a466-dfb9-48bf-889c-30e7ddce7029'
}

export const variablesResponse = {
  status: 'SUCCESS',
  data: {
    yaml: '---\nstep:\n  type: "Verify"\n  timeout: "iiZJhFyhS9OpSavMLsP0ug"\n  spec:\n    monitoredServiceRef: "RE6nybPLR4WoBWA_ZO7ang"\n    type: ""\n    healthSources: []\n    monitoredService:\n      type: "Default"\n      spec:\n        __uuid: "q72n7aZFS0y-7N_M87as1w"\n      __uuid: "F7IaHOfFTbCKYsS1StetuQ"\n    spec:\n      sensitivity: "NJmU_GETQY6lBCgCPxiryQ"\n      duration: "-W24V6CDQNqLHf_40S0sNA"\n      baseline: "VpyaQQvFSQO2ZW2GfvgH7A"\n      trafficsplit: "SCHE4jg_TwmNw7P1kdB1YQ"\n      deploymentTag: "J-Mdb4Z9SBKXvmPWuRs8TQ"\n      __uuid: "j1Be3P5GQAqMm0dqmuKN5w"\n    __uuid: "eDcqY2sZS7yNKJu97mlmpw"\n  failureStrategies:\n  - onFailure:\n      errors: "ez6Kpwf-TKOQDsQttKC6CA"\n      action:\n        type: "ManualIntervention"\n        spec:\n          timeout: "8xGt1kayTNyi5LzP_z53HQ"\n          onTimeout:\n            action:\n              type: "StageRollback"\n              __uuid: "tWjP1witQ7CiNdwme7w7qA"\n            __uuid: "zUJ-2P3WQCm1TXpenGbjxQ"\n          __uuid: "A4gGwHtXSSaAn8wgZcU9xQ"\n        __uuid: "zwrPqiYJSs6A-LS5TeZ7zA"\n      __uuid: "DBM3SDzRQr6lWj-rtphCnA"\n    __uuid: "gq-D3NwQRDqXC8GlcS4ESQ"\n  - onFailure:\n      errors: "xyFRlwqnQQydQ6nFNJWIAw"\n      action:\n        type: "ManualIntervention"\n        spec:\n          timeout: "c7FqrXWeTKOw7FOdsLU-Wg"\n          onTimeout:\n            action:\n              type: "Ignore"\n              __uuid: "EKzQwsS1TpSj9FwQmoD4Jw"\n            __uuid: "wBQXYYU7TCO1OYO6nZnZzg"\n          __uuid: "f1ePZewPR2ijLhe_TKmcYw"\n        __uuid: "IM9ZmMvcT462lo1CQEk-Sw"\n      __uuid: "1SbZ_-OgTIWlfVPS_tX1gQ"\n    __uuid: "q26n83zXTTO54zPcmpKeew"\n  identifier: "templateInputs"\n  name: "Zl1rFYchTGujdFBDtgzG4w"\n  __uuid: "cX3uSmYdR-KXT_CcH4qYXg"\n__uuid: "i2X_BxfOQjK7ImY6VPUMeA"\n',
    metadataMap: {
      'cX3uSmYdR-KXT_CcH4qYXg': {
        yamlProperties: {
          fqn: '',
          localName: 'step',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      },
      'J-Mdb4Z9SBKXvmPWuRs8TQ': {
        yamlProperties: {
          fqn: 'spec.spec.deploymentTag',
          localName: 'spec.spec.deploymentTag',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      },
      SCHE4jg_TwmNw7P1kdB1YQ: {
        yamlProperties: {
          fqn: 'spec.spec.trafficsplit',
          localName: 'spec.spec.trafficsplit',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      },
      RE6nybPLR4WoBWA_ZO7ang: {
        yamlProperties: {
          fqn: 'spec.monitoredServiceRef',
          localName: 'spec.monitoredServiceRef',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      },
      VpyaQQvFSQO2ZW2GfvgH7A: {
        yamlProperties: {
          fqn: 'spec.spec.baseline',
          localName: 'spec.spec.baseline',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      },
      '-W24V6CDQNqLHf_40S0sNA': {
        yamlProperties: {
          fqn: 'spec.spec.duration',
          localName: 'spec.spec.duration',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      },
      iiZJhFyhS9OpSavMLsP0ug: {
        yamlProperties: {
          fqn: 'timeout',
          localName: 'timeout',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      },
      Zl1rFYchTGujdFBDtgzG4w: {
        yamlProperties: {
          fqn: 'name',
          localName: 'name',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      },
      NJmU_GETQY6lBCgCPxiryQ: {
        yamlProperties: {
          fqn: 'spec.spec.sensitivity',
          localName: 'spec.spec.sensitivity',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: {
          fqn: '',
          localName: ''
        },
        yamlExtraProperties: { properties: [], outputproperties: [] }
      }
    },
    errorResponses: [],
    serviceExpressionPropertiesList: [
      { serviceName: 'trigger', expression: 'trigger.targetBranch' },
      { serviceName: 'trigger', expression: 'trigger.sourceBranch' },
      { serviceName: 'trigger', expression: 'trigger.prNumber' },
      { serviceName: 'trigger', expression: 'trigger.prTitle' }
    ]
  },
  metaData: null,
  correlationId: '0a187e1c-7422-4b16-bbfd-8063098a0690'
}

export const overviewCallResponse = {
  spec: {
    analysedServiceIdentifier: 'promService',
    analysedEnvIdentifier: 'promEnv',
    monitoredServiceType: 'DEFAULT',
    monitoredServiceIdentifier: 'promService_promEnv',
    analysisType: 'CANARY',
    sensitivity: 'HIGH',
    durationInMinutes: 5,
    isFailOnNoAnalysis: true
  },
  appliedDeploymentAnalysisType: 'NO_ANALYSIS',
  verificationStatus: 'VERIFICATION_FAILED',
  verificationProgressPercentage: 100,
  verificationStartTimestamp: 1675795194203,
  testNodes: {
    nodeType: 'CANARY',
    nodes: [
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'harness-deployment-canary-7445f86dbf-ml857',
        verificationResult: 'NO_ANALYSIS',
        failedMetrics: 0,
        failedLogClusters: 0
      },
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'manager-54c5cbb474-fq28j',
        verificationResult: 'NO_ANALYSIS',
        failedMetrics: 0,
        failedLogClusters: 0
      },
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'manager-54c5cbb474-bzddb',
        verificationResult: 'NO_ANALYSIS',
        failedMetrics: 0,
        failedLogClusters: 0
      },
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'manager-54c5cbb474-tjs4x',
        verificationResult: 'NO_ANALYSIS',
        failedMetrics: 0,
        failedLogClusters: 0
      },
      {
        type: 'DEPLOYMENT_NODE',
        nodeIdentifier: 'manager-54c5cbb474-6hckp',
        verificationResult: 'NO_ANALYSIS',
        failedMetrics: 0,
        failedLogClusters: 0
      }
    ]
  },
  controlNodes: {
    nodeType: 'PRIMARY',
    nodes: [
      { type: 'DEPLOYMENT_NODE', nodeIdentifier: 'harness-deployment-canary-7445f86dbf-ml857' },
      { type: 'DEPLOYMENT_NODE', nodeIdentifier: 'manager-54c5cbb474-fq28j' },
      { type: 'DEPLOYMENT_NODE', nodeIdentifier: 'manager-54c5cbb474-bzddb' },
      { type: 'DEPLOYMENT_NODE', nodeIdentifier: 'manager-54c5cbb474-tjs4x' },
      { type: 'DEPLOYMENT_NODE', nodeIdentifier: 'manager-54c5cbb474-6hckp' }
    ]
  },
  metricsAnalysis: { healthy: 0, warning: 0, unhealthy: 0, noAnalysis: 336 },
  logClusters: { knownClustersCount: 0, unknownClustersCount: 0, unexpectedFrequencyClustersCount: 0 },
  errorClusters: { knownClustersCount: 0, unknownClustersCount: 0, unexpectedFrequencyClustersCount: 0 }
}

export const overviewCallResponseWithBaseline = {
  baselineVerificationJobInstaceId: 'WL22sR0mSIyvdN0K_7JMhw',
  spec: {
    analysedServiceIdentifier: 'mock_server_fancy_graphs',
    analysedEnvIdentifier: 'prod',
    monitoredServiceType: 'DEFAULT',
    monitoredServiceIdentifier: 'mock_server_fancy_graphs_prod',
    analysisType: 'TEST',
    sensitivity: 'HIGH',
    durationInMinutes: 10,
    isFailOnNoAnalysis: false
  },
  baselineOverview: {
    applicableForBaseline: true,
    baseline: false,
    baselineExpired: false,
    baselineVerificationJobInstanceId: 'WL22sR0mSIyvdN0K_7JMhw',
    baselineExpiryTimestamp: 1676545440000
  },
  appliedDeploymentAnalysisType: 'TEST',
  verificationStatus: 'VERIFICATION_PASSED',
  verificationProgressPercentage: 100,
  verificationStartTimestamp: 1683600225550,
  testNodes: {
    nodeType: 'CURRENT_TEST',
    nodes: [
      {
        type: 'LOAD_TEST_NODE',
        deploymentTag: 'null',
        testStartTimestamp: 1683600240000
      }
    ]
  },
  controlNodes: {
    nodeType: 'BASELINE_TEST',
    nodes: [
      {
        type: 'LOAD_TEST_NODE',
        deploymentTag: 'null',
        testStartTimestamp: 1683599400000
      }
    ]
  },
  metricsAnalysis: {
    healthy: 3,
    warning: 0,
    unhealthy: 0,
    noAnalysis: 0
  },
  logClusters: {
    knownClustersCount: 0,
    unknownClustersCount: 0,
    unexpectedFrequencyClustersCount: 0
  },
  errorClusters: {
    knownClustersCount: 0,
    unknownClustersCount: 0,
    unexpectedFrequencyClustersCount: 0
  }
}

export const overviewCallResponseWithSimpleVerification = {
  spec: {
    analysedServiceIdentifier: 'svc1',
    analysedEnvIdentifier: 'env1',
    monitoredServiceType: 'DEFAULT',
    monitoredServiceIdentifier: 'svc1_env1',
    analysisType: 'SIMPLE',
    sensitivity: 'MEDIUM',
    durationInMinutes: 5,
    isFailOnNoAnalysis: false,
    baselineType: 'LAST'
  },
  appliedDeploymentAnalysisType: 'SIMPLE',
  verificationStatus: 'VERIFICATION_PASSED',
  verificationProgressPercentage: 100,
  verificationStartTimestamp: 1691045715314,
  metricsAnalysis: {
    healthy: 0,
    warning: 0,
    unhealthy: 1,
    noAnalysis: 0
  },
  logClusters: {
    knownClustersCount: 0,
    unknownClustersCount: 0,
    unexpectedFrequencyClustersCount: 0
  },
  errorClusters: {
    knownClustersCount: 0,
    unknownClustersCount: 0,
    unexpectedFrequencyClustersCount: 0
  },
  testDataStartTimestamp: 1691044800000
}

export const metricsResponseWithSimpleVerification = {
  totalPages: 1,
  totalItems: 1,
  pageItemCount: 1,
  pageSize: 10,
  content: [
    {
      metricIdentifier: 'm1',
      metricName: 'm1',
      transactionGroup: 'g1',
      metricType: 'PERFORMANCE_OTHER',
      healthSource: {
        identifier: 'svc1_env1/slm',
        name: 'sl-m',
        type: 'SumologicMetrics',
        providerType: 'METRICS'
      },
      thresholds: [],
      analysisResult: 'HEALTHY',
      testDataNodes: [
        {
          nodeIdentifier: 'Current-test',
          analysisResult: 'HEALTHY',
          analysisReason: 'ML_ANALYSIS',
          controlDataType: 'MINIMUM_DEVIATION',
          controlNodeIdentifier: 'control-host-1',
          testData: [
            {
              timestampInMillis: 1691044920000,
              value: 147.0
            },
            {
              timestampInMillis: 1691044980000,
              value: 224.0
            },
            {
              timestampInMillis: 1691044800000,
              value: 185.0
            },
            {
              timestampInMillis: 1691045040000,
              value: 193.0
            },
            {
              timestampInMillis: 1691044860000,
              value: 195.0
            }
          ],
          normalisedControlData: [
            {
              value: 29.0
            },
            {
              value: 27.0
            }
          ],
          normalisedTestData: [
            {
              timestampInMillis: 1691044890000,
              value: 203.0
            },
            {
              timestampInMillis: 1691045070000,
              value: 163.0
            }
          ]
        }
      ]
    }
  ],
  pageIndex: 0,
  empty: false
}

export const feedbackHistoryResponse = {
  metaData: {},
  resource: [
    {
      updatedBy: 'pranesh.g@harness.io',
      logFeedback: {
        feedbackScore: 'NO_RISK_CONSIDER_FREQUENCY',
        description: 'It is not an issue',
        updatedAt: 1672845660
      }
    }
  ]
}

// Jira mocks
export const jiraProjectsMock = {
  projects: [
    {
      key: 'OIP',
      name: 'Observability Integrations Platform'
    },
    {
      key: 'IE',
      name: 'Infrastructure Evolution'
    }
  ]
}

export const jiraPrioritiesMock = {
  priorities: [
    {
      id: '1',
      name: 'P1'
    },
    {
      id: '2',
      name: 'P2'
    }
  ]
}

export const jiraIssueTypeMock = {
  key: 'SRM',
  name: 'Service Reliability Management',
  ticketTypes: [
    {
      id: '10100',
      name: 'Story',
      isSubtask: false
    },
    {
      id: '10321',
      name: 'RCA-Subtask',
      isSubtask: true
    }
  ]
}

export const jiraCreatePayload = {
  identifiers: {
    Key1: ['value1']
  },
  description: 'Some description',
  priority: '1',
  issueType: 'Story',
  projectKey: 'OIP',
  title: 'Issue to be fixed'
}

export const jiraTicketGetResponse = {
  accountId: 'abcdef1234567890ghijkl',
  assignee: {
    displayName: 'John Doe',
    email: 'john.doe@example.com'
  },
  created: 1651578240,
  description: 'This is the very long ticket description...',
  exists: false,
  externalId: 'ABC-1234',
  id: 'abcdef1234567890ghijkl',
  identifiers: {
    idName: ['value1', 'value2', 'value3']
  },
  issueType: 'Bug',
  lastModified: 1651578240,
  module: 'sto',
  orgId: 'example_org',
  priority: 'High',
  projectId: 'example_project',
  projectKey: 'ABC',
  projectName: 'Jira Project',
  status: 'To Do',
  statusColor: '#42526E',
  title: 'A new ticket',
  url: 'https://example.atlassian.net/browse/ABCD-1234'
}

export const logsListResponseWithNoBaselineAnalysis = {
  metaData: {},
  resource: {
    totalClusters: 1,
    eventCounts: [{ clusterType: 'NO_BASELINE_AVAILABLE', count: 1, displayName: 'New' }],
    logAnalysisRadarCharts: {
      totalPages: 1,
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 10,
      content: [
        {
          message: 'some other log message',
          clusterId: '67b09b91-6dcc-3731-be99-622ccaad5bb0',
          label: 0,
          risk: 'HEALTHY',
          previousRisk: 'HEALTHY',
          clusterType: 'NO_BASELINE_AVAILABLE',
          count: 6,
          testHostFrequencyData: [
            {
              frequencies: [
                { timeStamp: 1689152160, count: 0.0 },
                { timeStamp: 1689152220, count: 0.0 },
                { timeStamp: 1689152280, count: 0.0 },
                { timeStamp: 1689152340, count: 0.0 },
                { timeStamp: 1689152400, count: 6.0 }
              ],
              host: 'dummy'
            }
          ],
          totalTestFrequencyData: [
            { timeStamp: 1689152160, count: 0.0 },
            { timeStamp: 1689152220, count: 0.0 },
            { timeStamp: 1689152280, count: 0.0 },
            { timeStamp: 1689152340, count: 0.0 },
            { timeStamp: 1689152400, count: 6.0 }
          ],
          averageControlFrequencyData: [],
          hasControlData: false
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

export const overviewDataWithNoBaselineData = {
  controlNodes: {
    nodeType: 'BASELINE_TEST',
    nodes: [
      {
        type: 'LOAD_TEST_NODE'
      }
    ]
  }
}

export const healthSourcesResponse = [
  {
    identifier: 'svc1_env1/slm',
    name: 'sl-m',
    type: 'SumologicMetrics',
    providerType: 'METRICS'
  }
]

export const healthSourcesResponseWithLogs = [
  {
    identifier: 'svc1_env1/slm',
    name: 'sl-m2',
    type: 'SumologicLogs',
    providerType: 'LOGS'
  }
]
