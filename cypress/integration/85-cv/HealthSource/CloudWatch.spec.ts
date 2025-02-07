import {
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse,
  riskCategoryMock
} from '../../../support/85-cv/monitoredService/constants'
import { Connectors } from '../../../utils/connctors-utils'
import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  awsRegionsCall,
  awsRegionsResponse,
  monitoredServicePostCall,
  riskCategoryCall,
  sampleDataCall,
  sampleDataMockResponse
} from '../../../support/85-cv/monitoredService/health-sources/CloudWatch/constants'

describe('Cloud watch health source', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'CVNG_METRIC_THRESHOLD',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('should render Cloud watch health source type, if the feature flag is enabled', () => {
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.contains('span', 'Add New Health Source').click()

    cy.findByText(/CloudWatch/).should('exist')
  })

  it('should add cloud watch health source, if correct values are given', () => {
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', awsRegionsCall, awsRegionsResponse).as('regionsCall')
    cy.intercept('GET', sampleDataCall, sampleDataMockResponse).as('sampleDataCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.populateDefineHealthSource(Connectors.AWS, 'testAWS', 'CloudWatch Metrics')

    cy.contains('span', 'Next').click()

    cy.wait('@regionsCall')

    cy.findByText(/Configuration/).should('have.attr', 'aria-selected', 'true')

    cy.get('input[name="region"]').click()
    cy.contains('p', 'region 1').click({ force: true })

    cy.findByTestId(/addCustomMetricButton/).should('not.be.disabled')

    cy.findByTestId(/addCustomMetricButton/).click()

    cy.findByTestId(/addCustomMetricButton/).should('be.disabled')

    cy.get('input[name="customMetrics.0.metricName"]').should('have.value', 'customMetric 1')

    cy.get('textarea[name="customMetrics.0.expression"]').type('SELECT * test')

    cy.contains('button', 'Fetch data').should('exist')
    cy.contains('button', 'Fetch data').should('not.be.disabled')
    cy.contains('button', 'Fetch data').click({ force: true })

    cy.findByText('Current query yields too many records. Please change query to yield one record.').should('exist')

    cy.get('textarea[name="customMetrics.0.expression"]').clear().type('SELECT *')

    cy.get('input[name="customMetrics.0.groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.get('input[name="customMetrics.0.groupName"]').should('have.value', 'group 1')

    cy.contains('div', 'Assign').scrollIntoView().click({ force: true })
    cy.get('input[name="customMetrics.0.sli.enabled"]').click({ force: true })

    cy.findByText(/Risk Category/).should('not.exist')
    cy.findByText(/Deviation Compared to Baseline/).should('not.exist')
    cy.findByText(/Service Instance Identifier/).should('not.exist')

    cy.get('input[name="customMetrics.0.analysis.liveMonitoring.enabled"]').click({ force: true })

    cy.findByText(/Service Instance Identifier/).should('not.exist')

    cy.get('input[name="customMetrics.0.analysis.deploymentVerification.enabled"]').click({ force: true })

    cy.findByText(/Risk Category/).should('exist')
    cy.findByText(/^Deviation Compared to Baseline$/).should('exist')

    cy.findByText(/Performance\/Other/).should('exist')
    cy.findByText(/Performance\/Other/).click()

    cy.findByText(/Higher value is higher risk/).should('exist')
    cy.findByText(/Higher value is higher risk/).click()

    cy.findByText(/Service Instance Identifier/).should('exist')

    cy.get('input[name="customMetrics.0.responseMapping.serviceInstanceJsonPath"]').type('test path')

    cy.findByRole('button', { name: /Submit/i }).click()

    // ✍🏻 Edit

    cy.findByText(/CloudWatch Metrics/).click()

    cy.get('span[data-icon="service-aws"]').should('exist')

    cy.get('input[name="healthSourceName"]').should('have.value', 'CloudWatch Metrics')

    cy.wait(100)

    cy.contains('span', 'Next').click()

    cy.wait('@regionsCall')

    cy.findByText(/Configuration/, { timeout: 2000 }).should('have.attr', 'aria-selected', 'true')

    cy.contains('p', 'AWS Region', { timeout: 4000 }).should('exist')

    cy.get('input[name="customMetrics.0.groupName"]').should('have.value', 'group 1')
    cy.get('input[name="customMetrics.0.metricName"]').should('have.value', 'customMetric 1')
    cy.get('textarea[name="customMetrics.0.expression"]').should('have.value', 'SELECT *')
    cy.contains('div', 'Assign').scrollIntoView().click({ force: true })

    cy.get('input[name="customMetrics.0.sli.enabled"]').should('be.checked')

    cy.get('input[name="customMetrics.0.analysis.liveMonitoring.enabled"]').should('be.checked')

    cy.get('input[name="customMetrics.0.analysis.higherBaselineDeviation"]').scrollIntoView().should('be.checked')

    // ➕ Adding custom metric

    cy.findByTestId(/addCustomMetricButton/).click()

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.get('input[name="customMetrics.1.metricName"]').should('have.value', 'customMetric 2')

    cy.get('input[name="customMetrics.1.metricName"]').clear().type('customMetric 1')

    cy.contains('div', 'Assign').scrollIntoView().click({ force: true })

    cy.findByText(/Metric identifier must be unique./).should('exist')
    cy.findByText(/Group Name is required./).should('exist')
    cy.findByText(/Expression is required/).should('exist')
    cy.findByText(/One selection is required./).should('exist')

    cy.get('input[name="customMetrics.1.metricName"]').type('customMetric 2')

    cy.get('span[data-icon="main-delete"]').eq(1).click({ force: true })

    cy.findByText(/customMetric 2/).should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.intercept('POST', monitoredServicePostCall).as('monitoredServicePostCall')

    cy.findByRole('button', { name: /Save/i }).click()

    cy.wait('@monitoredServicePostCall').then(intercept => {
      const { sources } = intercept.request.body

      // Response assertion
      expect(sources?.healthSources?.[0]?.type).equals('CloudWatchMetrics')
      expect(sources?.healthSources?.[0]?.name).equals('CloudWatch Metrics')
      expect(sources?.healthSources?.[0]?.identifier).equals('CloudWatch_Metrics')
      expect(sources?.healthSources?.[0]?.spec?.region).equals('region 1')
      expect(sources?.healthSources?.[0]?.spec?.connectorRef).equals('testAWS')
      expect(sources?.healthSources?.[0]?.spec?.feature).equals('CloudWatch Metrics')
      expect(sources?.healthSources?.[0]?.spec?.metricDefinitions?.[0]?.expression).equals('SELECT *')
      expect(sources?.healthSources?.[0]?.spec?.metricDefinitions?.[0]?.groupName).equals('group 1')
      expect(sources?.healthSources?.[0]?.spec?.metricDefinitions?.[0]?.identifier).equals('customMetric_1')
      expect(sources?.healthSources?.[0]?.spec?.metricDefinitions?.[0]?.metricName).equals('customMetric 1')
    })
  })

  describe('Metric thresholds', () => {
    it('should render metric thresholds only if any group is created', () => {
      cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
      cy.intercept('GET', awsRegionsCall, awsRegionsResponse).as('regionsCall')
      cy.intercept('GET', sampleDataCall, sampleDataMockResponse).as('sampleDataCall')

      cy.addNewMonitoredServiceWithServiceAndEnv()

      cy.populateDefineHealthSource(Connectors.AWS, 'testAWS', 'CloudWatch Metrics')
      cy.contains('span', 'Next').click()

      cy.wait('@regionsCall')

      cy.findByText(/Configuration/).should('have.attr', 'aria-selected', 'true')

      cy.get('input[name="region"]').click()
      cy.contains('p', 'region 1').click({ force: true })

      cy.findByTestId(/addCustomMetricButton/).should('not.be.disabled')

      cy.findByTestId(/addCustomMetricButton/).click()

      cy.get('input[name="customMetrics.0.metricName"]').should('have.value', 'customMetric 1')

      cy.get('input[name="customMetrics.0.groupName"]').click()
      cy.contains('p', '+ Add New').click({ force: true })
      cy.get('.bp3-overlay input[name="name"]').type('group 1')
      cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

      cy.get('input[name="customMetrics.0.groupName"]').should('have.value', 'group 1')

      cy.contains('.Accordion--label', 'Advanced (Optional)').should('not.exist')

      cy.contains('div', 'Assign').scrollIntoView().click({ force: true })

      cy.get('input[name="customMetrics.0.analysis.deploymentVerification.enabled"]').click({ force: true })

      cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')
    })

    it('should render metric thresholds and perform its features', () => {
      cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
      cy.intercept('GET', awsRegionsCall, awsRegionsResponse).as('regionsCall')
      cy.intercept('GET', sampleDataCall, sampleDataMockResponse).as('sampleDataCall')

      cy.addNewMonitoredServiceWithServiceAndEnv()

      cy.populateDefineHealthSource(Connectors.AWS, 'testAWS', 'CloudWatch Metrics')
      cy.contains('span', 'Next').click()

      cy.wait('@regionsCall')

      cy.findByText(/Configuration/).should('have.attr', 'aria-selected', 'true')

      cy.get('input[name="region"]').click()
      cy.contains('p', 'region 1').click({ force: true })

      cy.findByTestId(/addCustomMetricButton/).should('not.be.disabled')

      cy.findByTestId(/addCustomMetricButton/).click()

      cy.get('input[name="customMetrics.0.metricName"]').should('have.value', 'customMetric 1')

      cy.get('input[name="customMetrics.0.groupName"]').click()
      cy.contains('p', '+ Add New').click({ force: true })
      cy.get('.bp3-overlay input[name="name"]').type('group 1')
      cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

      cy.get('input[name="customMetrics.0.groupName"]').should('have.value', 'group 1')

      cy.contains('.Accordion--label', 'Advanced (Optional)').should('not.exist')

      cy.contains('div', 'Assign').scrollIntoView().click({ force: true })

      cy.get('input[name="customMetrics.0.analysis.deploymentVerification.enabled"]').click({ force: true })

      cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

      cy.findByTestId('AddThresholdButton').click()

      cy.contains('div', 'Ignore Thresholds (1)').should('exist')

      cy.get("input[name='ignoreThresholds.0.metricType']").should('be.disabled')
      cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Custom')

      // validations
      cy.findByRole('button', { name: /Submit/i }).click()

      cy.findAllByText('Required').should('have.length', 3)

      cy.get("input[name='ignoreThresholds.0.metricName']").click()

      cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'customMetric 1')

      cy.get('.Select--menuItem:nth-child(1)').click()

      // testing criteria

      cy.get("input[name='ignoreThresholds.0.criteria.type']").should('have.value', 'Absolute Value')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('exist')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

      // greater than should be smaller than lesser than value
      cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").type('12')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('1')

      cy.get("input[name='ignoreThresholds.0.criteria.type']").click()
      cy.contains('p', 'Percentage Deviation').click()

      cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('not.exist')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('12')

      // Fail fast thresholds
      cy.contains('div', 'Fail-Fast Thresholds (0)').click()

      cy.findByTestId('AddThresholdButton').click()

      cy.get("input[name='failFastThresholds.0.metricName']").click()

      cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'customMetric 1')

      cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('be.disabled')

      cy.get("input[name='failFastThresholds.0.spec.action']").click()
      cy.contains('p', 'Fail after multiple occurrences').click()
      cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('not.be.disabled')
      cy.get("input[name='failFastThresholds.0.spec.spec.count']").type('4')

      cy.get("input[name='failFastThresholds.0.criteria.spec.greaterThan']").type('21')
      cy.get("input[name='failFastThresholds.0.criteria.spec.lessThan']").type('78')
    })
  })
})
