import {
  pipelineExecutionAPI,
  pipelineExecutionForNodeAPI,
  pipelineExecutionSummaryAPI,
  pipelineListAPI
} from '../../../support/70-pipeline/constants'
import { featureFlagsCall } from '../../../support/85-cv/common'

import {
  aggregateProjectsCall,
  deploymentTimeseriesDataAPI,
  deploymentTimeseriesDataWithFilters,
  deploymentTimeseriesDataWithNodeFilterAPI,
  feedbackHistory,
  feedbackHistoryResponse,
  gitSyncCall,
  healthSourceAPI,
  healthSourceMetricsAPI,
  healthSourcesResponse,
  healthSourcesResponseWithLogs,
  jiraCreatePayload,
  jiraCreatePostCall,
  jiraIssueTypeMock,
  jiraIssueTypesCall,
  jiraPrioritiesCall,
  jiraPrioritiesMock,
  jiraProjectsCall,
  jiraProjectsMock,
  jiraTicketDetailsCall,
  jiraTicketGetResponse,
  logsListCall,
  logsListCallForNoBaseline,
  logsListCallResponse,
  logsListCallResponseWithTicket,
  logsListCLusterFilterCall,
  logsListMinSliderFilterCall,
  logsListNodeFilterCall,
  logsListResponseWithNoBaselineAnalysis,
  logsRadarChartDataCall,
  logsRadarChartDataCallResponse,
  logsRadarChartDataCLusterFilterCall,
  logsRadarChartDataNodeFilterCall,
  logsRadarChartDataNoFiltersCall,
  metricsCallSimpleVerification,
  metricsResponseWithSimpleVerification,
  nodeNamesFilterAPI,
  overviewCall,
  overviewCallResponse,
  overviewCallResponseWithBaseline,
  overviewCallResponseWithSimpleVerification,
  overviewDataWithNoBaselineData,
  pipelinesFetchCall,
  pipelinesSummaryFetchCall,
  pipelinesYamlFetchCall,
  sourceCodeManagerCall,
  transactionsFilterAPI,
  updateBaselineCall
} from '../../../support/85-cv/verifyStep/constants'

describe('Verify step', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'SRM_LOG_FEEDBACK_ENABLE_UI',
            enabled: true,
            lastUpdatedAt: 0
          },
          {
            uuid: null,
            name: 'SRM_ENABLE_JIRA_INTEGRATION',
            enabled: true,
            lastUpdatedAt: 0
          },
          {
            uuid: null,
            name: 'SRM_ENABLE_BASELINE_BASED_VERIFICATION',
            enabled: true,
            lastUpdatedAt: 0
          },
          {
            uuid: null,
            name: 'SRM_ENABLE_SIMPLE_VERIFICATION',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.intercept('POST', pipelineListAPI, { fixture: '/pipeline/api/pipelines/getPipelineList' }).as('pipelineList')
    cy.intercept('GET', pipelinesSummaryFetchCall, { fixture: '/pipeline/api/pipelines/pipelineSummary' }).as(
      'pipelineSummary'
    )
    cy.intercept('GET', pipelinesFetchCall, { fixture: '/pipeline/api/pipelines/getPipelineDetails' }).as(
      'pipelineDetails'
    )
    cy.intercept('POST', pipelineExecutionSummaryAPI, {
      fixture: '/pipeline/api/pipelines/getExecutionSummary'
    }).as('pipelineExecutionSumary')
    cy.intercept('GET', pipelineExecutionAPI, { fixture: '/pipeline/api/pipelines/getExecutionDetails' }).as(
      'pipelineExecution'
    )
    cy.intercept('GET', pipelineExecutionForNodeAPI, { fixture: '/pipeline/api/pipelines/getNodeExecutionDetails' }).as(
      'pipelineExecutionForNode'
    )

    cy.intercept('GET', overviewCall, overviewCallResponse).as('overviewCall')

    cy.intercept('GET', deploymentTimeseriesDataAPI, { fixture: '/cv/verifyStep/getDeploymentTimeseriesData' }).as(
      'deploymentTimeseriesData'
    )
    cy.intercept('GET', healthSourceAPI, { fixture: '/cv/verifyStep/getHealthSourceFilters' }).as('healthSource')
    cy.intercept('GET', nodeNamesFilterAPI, { fixture: '/cv/verifyStep/getNodeNameFilters' }).as('nodeNames')
    cy.intercept('GET', transactionsFilterAPI, { fixture: '/cv/verifyStep/getTransactionNameFilters' }).as(
      'transactions'
    )

    cy.intercept('GET', deploymentTimeseriesDataWithNodeFilterAPI, {
      fixture: '/cv/verifyStep/getDeploumentTimeseriesNoData'
    }).as('deploymentTimeseriesDataWithNodeFilter')

    cy.intercept('GET', deploymentTimeseriesDataWithFilters, {
      fixture: '/cv/verifyStep/getDeploumentTimeseriesNoData'
    }).as('deploymentTimeseriesDataWithFilters')

    cy.intercept('GET', gitSyncCall, {}).as('gitSyncCall')
    cy.intercept('GET', pipelinesYamlFetchCall, {}).as('pipelinesYamlFetchCall')
    cy.intercept('GET', sourceCodeManagerCall, {}).as('sourceCodeManagerCall')
    cy.intercept('GET', aggregateProjectsCall, {}).as('aggregateProjectsCall')

    cy.login('test', 'test')
    cy.visitPageAssertion('[class^=SideNav-module_main]')
    cy.contains('p', 'Projects').click()
    cy.contains('p', 'Project 1').click()
    cy.contains('p', 'Deployments').click()
    cy.contains('p', 'Pipelines').click()

    cy.wait('@pipelineList')
    cy.wait('@aggregateProjectsCall')
  })

  it('should verify logs screen', () => {
    cy.intercept('GET', logsListCall, logsListCallResponse).as('logsListCall')
    cy.intercept('GET', logsRadarChartDataCall, logsRadarChartDataCallResponse).as('logsRadarChartDataCall')
    cy.intercept('GET', logsListNodeFilterCall, logsListCallResponse).as('logsListNodeFilterCall')
    cy.intercept('GET', logsRadarChartDataNodeFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataNodeFilterCall'
    )

    cy.intercept('GET', healthSourceMetricsAPI, healthSourcesResponseWithLogs).as('healthSource')

    cy.intercept('GET', logsListCLusterFilterCall, logsListCallResponse).as('logsListCLusterFilterCall')
    cy.intercept('GET', logsRadarChartDataCLusterFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataCLusterFilterCall'
    )
    cy.intercept('GET', logsListMinSliderFilterCall, logsListCallResponse).as('logsListMinSliderFilterCall')
    cy.intercept('GET', feedbackHistory, feedbackHistoryResponse).as('feedbackHistory')

    cy.findByText('NG Docker Image').click()

    cy.wait('@sourceCodeManagerCall')
    cy.wait('@gitSyncCall')
    cy.wait('@pipelinesYamlFetchCall')

    cy.wait('@pipelineSummary')
    cy.wait('@pipelineDetails')

    cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

    cy.findByRole('link', { name: /Execution History/i }).click()

    cy.wait('@pipelineExecutionSumary')
    cy.wait('@pipelineSummary')

    cy.findByText(/(Execution Id: 5)/i)
      .scrollIntoView()
      .click()

    cy.wait('@pipelineExecution')
    cy.wait('@pipelineExecutionForNode')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

    cy.findByTestId(/Logs/i).click()

    cy.wait('@overviewCall')
    cy.wait('@logsListCall')
    cy.wait('@logsRadarChartDataCall')

    cy.url().should(
      'include',
      '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline?storeType=INLINE&view=log&type=Logs&filterAnomalous=true'
    )

    cy.findAllByTestId(/logs-data-row/i).should('have.length', 3)

    cy.findAllByTestId(/logs-data-row/i)
      .first()
      .click()

    cy.findByTestId(/LogAnalysis_detailsDrawer/i).should('exist')

    cy.findByTestId(/ActivityHeadingContent_eventType/i).should('have.text', 'Known')
    cy.findByTestId(/ActivityHeadingContent_count/i).should('have.text', '8')

    cy.findAllByTestId(/activityHeadingContent-chart/i).should('have.length', '4')

    cy.findByTestId(/updatedFeedbackDisplay/).should('exist')
    cy.findByTestId(/appliedFeedbackDisplay/).should('exist')

    cy.findByTestId(/updatedFeedbackRisk/).should('have.text', 'Medium risk')
    cy.findByTestId(/appliedFeedbackRisk/).should('have.text', 'High risk')

    cy.findByTestId(/updatedFeedbackDetails/).should('include.text', ' Updated by pranesh@harness.io on 02/26/2023')
    cy.findByTestId(/appliedFeedbackDetails/).should('include.text', ' Updated by pranesh@harness.io on 02/26/2023')

    cy.findByTestId(/updateEventPreferenceButton-Drawer/).click()

    cy.wait('@feedbackHistory')

    cy.get('input[name="eventPriority"]').should('have.value', 'Medium risk')
    cy.get('textarea[name="reason"]').should('have.value', 'Some reason')

    cy.findByTestId(/updatePreferenceDrawerSubmit_button/).click()

    cy.findByTestId(/DrawerClose_button/i).click()

    cy.findByTestId(/LogAnalysis_detailsDrawer/i).should('not.exist')

    // By clicking on the node graph, it should apply the same filter in nodes dropdown
    cy.findByTestId(/canaryNode-0/).click()

    cy.wait('@logsListNodeFilterCall')
    cy.wait('@logsRadarChartDataNodeFilterCall')

    cy.findByTestId(/node_name_filter/i).click()
    cy.findByRole('checkbox', { name: 'harness-deployment-canary-7445f86dbf-ml857' }).should('be.checked')
    cy.findByTestId(/canaryNode-0/).click({ force: true })
    cy.findByText(/Nodes: All/i).should('be.visible')
    cy.get('.MultiSelectDropDown--dropdownButton').click({ force: true })

    // should make correct filter call

    cy.findByTestId('Unknown').should('exist')
    cy.findByTestId('Unknown').should('be.checked')
    cy.findByTestId('Unknown').click({ force: true })

    cy.wait('@logsListCLusterFilterCall')
    cy.wait('@logsRadarChartDataCLusterFilterCall')

    cy.get('.highcharts-scatter-series').should('have.length', 24)

    cy.findByTestId('MinMaxSlider_MinInput').invoke('val', 20).trigger('change', { force: true })

    cy.wait('@logsListMinSliderFilterCall').then(interceptor => {
      expect(interceptor.request.url).includes('minAngle=30')
    })
    cy.get('.highcharts-scatter-series').should('have.length', 18)

    // if we come via Console view log, filter call should include KNOWN cluster type
    cy.get('.bp3-switch').click()
    // clicking again to go to verify step page
    cy.get('.bp3-switch').click()

    cy.wait('@healthSource')

    cy.get('div[data-tab-id="Logs"][aria-disabled="false"]')
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })

    cy.wait('@nodeNames')

    cy.url().should(
      'include',
      'pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline?storeType=INLINE&view=log&type=Metrics&filterAnomalous=false'
    )

    cy.findByTestId('Known').should('exist')
    cy.findByTestId('Known').should('be.checked')
  })

  it('should verify create jira functionalty', () => {
    cy.intercept('GET', logsListCall, logsListCallResponse).as('logsListCall')
    cy.intercept('GET', logsRadarChartDataCall, logsRadarChartDataCallResponse).as('logsRadarChartDataCall')
    cy.intercept('GET', logsListNodeFilterCall, logsListCallResponse).as('logsListNodeFilterCall')
    cy.intercept('GET', logsRadarChartDataNodeFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataNodeFilterCall'
    )

    cy.intercept('GET', logsListCLusterFilterCall, logsListCallResponse).as('logsListCLusterFilterCall')
    cy.intercept('GET', logsRadarChartDataCLusterFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataCLusterFilterCall'
    )
    cy.intercept('GET', logsListMinSliderFilterCall, logsListCallResponse).as('logsListMinSliderFilterCall')
    cy.intercept('GET', feedbackHistory, feedbackHistoryResponse).as('feedbackHistory')

    cy.intercept('GET', jiraProjectsCall, jiraProjectsMock).as('jiraProjectsCall')
    cy.intercept('GET', jiraPrioritiesCall, jiraPrioritiesMock).as('jiraPrioritiesCall')
    cy.intercept('GET', jiraIssueTypesCall, jiraIssueTypeMock).as('jiraIssueTypesCall')
    cy.intercept('POST', jiraCreatePostCall).as('jiraCreatePostCall')

    cy.findByText('NG Docker Image').click()

    cy.wait('@sourceCodeManagerCall')
    cy.wait('@gitSyncCall')
    cy.wait('@pipelinesYamlFetchCall')

    cy.wait('@pipelineSummary')
    cy.wait('@pipelineDetails')

    cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

    cy.findByRole('link', { name: /Execution History/i }).click()

    cy.wait('@pipelineExecutionSumary')
    cy.wait('@pipelineSummary')

    cy.findByText(/(Execution Id: 5)/i)
      .scrollIntoView()
      .click()

    cy.wait('@pipelineExecution')
    cy.wait('@pipelineExecutionForNode')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

    cy.findByTestId(/Logs/i).click()

    cy.wait('@overviewCall')
    cy.wait('@logsListCall')
    cy.wait('@logsRadarChartDataCall')

    cy.url().should(
      'include',
      '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline?storeType=INLINE&view=log&type=Logs&filterAnomalous=true'
    )

    cy.findAllByTestId(/logs-data-row/i).should('have.length', 3)

    cy.findAllByTestId(/logs-data-row/i)
      .first()
      .click()

    cy.findByTestId(/LogAnalysis_detailsDrawer/i).should('exist')

    cy.findByTestId(/jiraCreationButton-Drawer/i)
      .should('exist')
      .click()

    cy.wait('@jiraProjectsCall')
    cy.wait('@jiraPrioritiesCall')

    cy.findByTestId(/addJiraField/)
      .should('exist')
      .click()

    cy.findByTestId(/jiraDrawerSubmit_button/)
      .should('exist')
      .click({ force: true })

    cy.findByText(/Project is required/).should('exist')
    cy.findByText(/Issue type is required/).should('exist')
    cy.findByText(/Ticket summary is required/).should('exist')
    cy.findByText(/Description is required/).should('exist')
    cy.findByText(/Key is required/).should('exist')
    cy.findByText(/Value is required/).should('exist')

    cy.get('input[name="projectKey"]').click()
    cy.contains('p', 'Observability Integrations Platform').click({ force: true })

    cy.wait('@jiraIssueTypesCall')

    cy.get('input[name="issueType"]').click()
    cy.contains('p', 'Story').click({ force: true })

    cy.get('input[name="priority"]').click()
    cy.contains('p', 'P1').click({ force: true })

    cy.fillField('title', 'Issue to be fixed')
    cy.fillField('description', 'Some description')

    cy.findByPlaceholderText(/Enter Key/)
      .should('exist')
      .type('Key1')

    cy.findByPlaceholderText(/Type and press enter to create a tag/)
      .should('exist')
      .type('value1')
      .blur()

    cy.findByTestId(/addJiraField/)
      .should('exist')
      .click()

    cy.get('span[data-icon="main-trash"]').last().click()

    cy.findByTestId(/jiraDrawerSubmit_button/)
      .should('exist')
      .click({ force: true })

    cy.wait('@jiraCreatePostCall').then(interception => {
      expect(interception.request.body).to.deep.equal(jiraCreatePayload)
    })

    cy.findByTestId(/DrawerClose_button/)
      .should('exist')
      .click()

    cy.wait('@logsListCall')
  })

  it('should verify view jira functionalty', () => {
    cy.intercept('GET', logsListCall, logsListCallResponseWithTicket).as('logsListCall')
    cy.intercept('GET', logsRadarChartDataCall, logsRadarChartDataCallResponse).as('logsRadarChartDataCall')
    cy.intercept('GET', logsListNodeFilterCall, logsListCallResponse).as('logsListNodeFilterCall')
    cy.intercept('GET', logsRadarChartDataNodeFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataNodeFilterCall'
    )

    cy.intercept('GET', logsListCLusterFilterCall, logsListCallResponse).as('logsListCLusterFilterCall')
    cy.intercept('GET', logsRadarChartDataCLusterFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataCLusterFilterCall'
    )
    cy.intercept('GET', logsListMinSliderFilterCall, logsListCallResponse).as('logsListMinSliderFilterCall')
    cy.intercept('GET', feedbackHistory, feedbackHistoryResponse).as('feedbackHistory')

    cy.intercept('GET', jiraProjectsCall, jiraProjectsMock).as('jiraProjectsCall')
    cy.intercept('GET', jiraPrioritiesCall, jiraPrioritiesMock).as('jiraPrioritiesCall')
    cy.intercept('GET', jiraIssueTypesCall, jiraIssueTypeMock).as('jiraIssueTypesCall')
    cy.intercept('GET', jiraTicketDetailsCall, jiraTicketGetResponse).as('jiraTicketDetailsCall')
    cy.intercept('POST', jiraCreatePostCall).as('jiraCreatePostCall')

    cy.findByText('NG Docker Image').click()

    cy.wait('@sourceCodeManagerCall')
    cy.wait('@gitSyncCall')
    cy.wait('@pipelinesYamlFetchCall')

    cy.wait('@pipelineSummary')
    cy.wait('@pipelineDetails')

    cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

    cy.findByRole('link', { name: /Execution History/i }).click()

    cy.wait('@pipelineExecutionSumary')
    cy.wait('@pipelineSummary')

    cy.findByText(/(Execution Id: 5)/i)
      .scrollIntoView()
      .click()

    cy.wait('@pipelineExecution')
    cy.wait('@pipelineExecutionForNode')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

    cy.findByTestId(/Logs/i).click()

    cy.wait('@overviewCall')
    cy.wait('@logsListCall')
    cy.wait('@logsRadarChartDataCall')

    cy.url().should(
      'include',
      '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline?storeType=INLINE&view=log&type=Logs&filterAnomalous=true'
    )

    cy.findByTestId(/createdJiraTicketIdDisplay/).should('exist')

    cy.findAllByTestId(/logs-data-row/i)
      .first()
      .click()

    cy.findByTestId(/LogAnalysis_detailsDrawer/i).should('exist')

    cy.findByTestId(/jiraCreationButton-Drawer/i).should('have.text', 'View ticket')

    cy.findByTestId(/jiraCreationButton-Drawer/i)
      .should('exist')
      .click()

    cy.wait('@jiraTicketDetailsCall')

    cy.findByText(/Jira Project/).should('be.visible')
    cy.findByText(/A new ticket/).should('be.visible')
    cy.findByText(/This is the very long ticket description.../).should('be.visible')
    cy.findByText(/John Doe/).should('be.visible')
  })

  it('should verify baseline based verification', () => {
    cy.intercept('GET', logsListCall, logsListCallResponseWithTicket).as('logsListCall')
    cy.intercept('GET', logsRadarChartDataCall, logsRadarChartDataCallResponse).as('logsRadarChartDataCall')
    cy.intercept('GET', logsListNodeFilterCall, logsListCallResponse).as('logsListNodeFilterCall')
    cy.intercept('GET', logsRadarChartDataNodeFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataNodeFilterCall'
    )

    cy.intercept('GET', logsListCLusterFilterCall, logsListCallResponse).as('logsListCLusterFilterCall')
    cy.intercept('GET', logsRadarChartDataCLusterFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataCLusterFilterCall'
    )
    cy.intercept('GET', logsListMinSliderFilterCall, logsListCallResponse).as('logsListMinSliderFilterCall')
    cy.intercept('GET', feedbackHistory, feedbackHistoryResponse).as('feedbackHistory')

    cy.intercept('GET', jiraProjectsCall, jiraProjectsMock).as('jiraProjectsCall')
    cy.intercept('GET', jiraPrioritiesCall, jiraPrioritiesMock).as('jiraPrioritiesCall')
    cy.intercept('GET', jiraIssueTypesCall, jiraIssueTypeMock).as('jiraIssueTypesCall')
    cy.intercept('GET', jiraTicketDetailsCall, jiraTicketGetResponse).as('jiraTicketDetailsCall')
    cy.intercept('POST', jiraCreatePostCall).as('jiraCreatePostCall')

    cy.intercept('GET', overviewCall, overviewCallResponseWithBaseline).as('overviewCallForBaseline')

    cy.intercept('POST', updateBaselineCall, {}).as('updateBaselineCall')

    cy.findByText('NG Docker Image').click()

    cy.wait('@sourceCodeManagerCall')
    cy.wait('@gitSyncCall')
    cy.wait('@pipelinesYamlFetchCall')

    cy.wait('@pipelineSummary')
    cy.wait('@pipelineDetails')

    cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

    cy.findByRole('link', { name: /Execution History/i }).click()

    cy.wait('@pipelineExecutionSumary')
    cy.wait('@pipelineSummary')

    cy.findByText(/(Execution Id: 5)/i)
      .scrollIntoView()
      .click()

    cy.wait('@pipelineExecution')
    cy.wait('@pipelineExecutionForNode')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

    cy.findByTestId(/Logs/i).click()

    cy.wait('@overviewCallForBaseline')
    cy.wait('@logsListCall')
    cy.wait('@logsRadarChartDataCall')

    cy.findByTestId(/pinBaselineButton/)
      .should('exist')
      .should('contain.text', 'Pin baseline')

    cy.findByTestId(/pinBaselineButton/)
      .scrollIntoView()
      .click()

    cy.findByTestId(/pinBaslineButton_confirmationButton/).should('exist')

    cy.findByTestId(/pinBaslineButton_confirmationButton/)
      .scrollIntoView()
      .click()

    cy.wait('@updateBaselineCall')

    cy.findByTestId(/pinBaselineButton/)
      .should('exist')
      .should('contain.text', 'Unpin baseline')
  })

  describe('No baseline analysis', () => {
    it('Should not render the radar chart and show correct legends for the first time baseline analysis', () => {
      cy.intercept('GET', logsListCallForNoBaseline, logsListResponseWithNoBaselineAnalysis).as('logsListCall')
      cy.intercept('GET', logsRadarChartDataNoFiltersCall, logsRadarChartDataCallResponse).as('logsRadarChartDataCall')
      cy.intercept('GET', logsListNodeFilterCall, logsListCallResponse).as('logsListNodeFilterCall')

      cy.intercept('GET', overviewCall, overviewDataWithNoBaselineData).as('overviewCallForBaseline')

      cy.findByText('NG Docker Image').click()

      cy.wait('@sourceCodeManagerCall')
      cy.wait('@gitSyncCall')
      cy.wait('@pipelinesYamlFetchCall')

      cy.wait('@pipelineSummary')
      cy.wait('@pipelineDetails')

      cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

      cy.findByRole('link', { name: /Execution History/i }).click()

      cy.wait('@pipelineExecutionSumary')
      cy.wait('@pipelineSummary')

      cy.findByText(/(Execution Id: 5)/i)
        .scrollIntoView()
        .click()

      cy.wait('@pipelineExecution')
      cy.wait('@pipelineExecutionForNode')

      cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

      cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

      cy.findByTestId(/Logs/i).click()

      cy.wait('@overviewCallForBaseline')
      cy.wait('@logsListCall')
      cy.wait('@logsRadarChartDataCall')

      cy.url().should(
        'include',
        '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline?storeType=INLINE&view=log&type=Logs&filterAnomalous=true'
      )

      cy.findByTestId(/newBaselineEventMessage/).should('be.visible')

      cy.findByTestId(/logs-data-row/).should('be.visible')
      cy.findByTestId(/logs-data-row/).click()

      cy.findByText(/New events/).should('be.visible')
    })
  })

  describe('Simple verification', () => {
    it('should verify simple verification features', () => {
      cy.intercept('GET', feedbackHistory, feedbackHistoryResponse).as('feedbackHistory')
      cy.intercept('GET', healthSourceMetricsAPI, healthSourcesResponse).as('healthSource')
      cy.intercept('GET', overviewCall, overviewCallResponseWithSimpleVerification).as('overviewCallForBaseline')
      cy.intercept('GET', metricsCallSimpleVerification, metricsResponseWithSimpleVerification).as(
        'overviewCallForBaseline'
      )

      cy.intercept('POST', updateBaselineCall, {}).as('updateBaselineCall')

      cy.findByText('NG Docker Image').click()

      cy.wait('@sourceCodeManagerCall')
      cy.wait('@gitSyncCall')
      cy.wait('@pipelinesYamlFetchCall')

      cy.wait('@pipelineSummary')
      cy.wait('@pipelineDetails')

      cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

      cy.findByRole('link', { name: /Execution History/i }).click()

      cy.wait('@pipelineExecutionSumary')
      cy.wait('@pipelineSummary')

      cy.findByText(/(Execution Id: 5)/i)
        .scrollIntoView()
        .click()

      cy.wait('@pipelineExecution')
      cy.wait('@pipelineExecutionForNode')

      cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

      cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

      cy.findByTestId(/Metrics/i).click()

      cy.findByText(
        /A simple verification analysis has been applied. Change the verification type if you wish to apply Harness machine learning to the analysis./
      ).should('be.visible')

      cy.findByTestId(/g1-m1-SumologicMetrics-panel/)
        .should('be.visible')
        .scrollIntoView()
        .click()

      cy.findByText(/Service: Current-test/).should('be.visible')

      cy.get('input[name="data"]').should('have.value', 'Raw').should('be.disabled')
    })
  })
})
