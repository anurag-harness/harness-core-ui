import {
  getArtifactPaths,
  getJenkinsBuild,
  inputSetsTemplateCall,
  jobDetailsCall,
  pipelineDetails,
  pipelineDetailsWithRoutingIdCall,
  pipelineStudioRoute
} from '../../support/70-pipeline/constants'
import { getTriggerListAPI } from './constants'

describe.skip('Jenkins Trigger', () => {
  const visitTriggersPageWithAssertion = (): void => {
    cy.visit(pipelineStudioRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
  }

  beforeEach(() => {
    cy.initializeRoute()

    cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/triggers/jenkinsPipelineDetails.json' }).as(
      'pipelineDetails'
    )

    cy.intercept('POST', inputSetsTemplateCall, {
      fixture: 'pipeline/api/triggers/jenkinsInputSetTemplate.json'
    }).as('inputSetsTemplateCall')

    cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
      fixture: 'pipeline/api/triggers/jenkinsPipelineDetailsWithRoutingId.json'
    }).as('pipelineDetailsWithRoutingIdCall')

    cy.intercept('GET', jobDetailsCall, { fixture: 'pipeline/api/jenkinsStep/jobDetails.json' }).as('jobDetailsCall')

    cy.intercept('GET', getArtifactPaths, {
      fixture: 'pipeline/api/triggers/jenkinsArtifactPath.json'
    }).as('getArtifactPaths')

    cy.intercept('GET', getJenkinsBuild, {
      fixture: 'pipeline/api/triggers/jenkinsBuilds.json'
    }).as('getArtifactPaths')

    visitTriggersPageWithAssertion()
  })

  it('testing jenkins trigger - when filePathRegex is runtime', () => {
    cy.contains('a', 'Triggers').click()
    cy.wait(1000)
    cy.contains('span', '+ New Trigger').click()
    cy.get('section[data-cy="Artifact_Jenkins"]').click()
    cy.findByPlaceholderText('Enter Name').clear().type('jenkinsTrigger')
    cy.contains('p', '+ Select Artifact').click()
    cy.get('.TableV2--cells').eq(0).click()
    cy.contains('span', 'Select').click()
    cy.wait(1000)
    cy.contains('span', 'Apply').click()
    cy.contains('span', 'Continue').click()
    cy.contains('span', 'Continue').click()
    cy.contains('span', 'Create Trigger').click()
    cy.intercept('GET', getTriggerListAPI, {
      fixture: 'pipeline/api/triggers/triggersList.json'
    }).as('getTriggerList')
    cy.wait('@getTriggerList')
    cy.contains('p', 'jenkinsTrigger').should('be.visible')
  })
})
