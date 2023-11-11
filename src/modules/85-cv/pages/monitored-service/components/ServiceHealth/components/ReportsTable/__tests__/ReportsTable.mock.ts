/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { SRMAnalysisStepDetailDTO } from 'services/cv'

export const reportListMock = [
  {
    accountId: 'kmpySmUISimoRrJL6NL73w',
    orgIdentifier: 'default',
    projectIdentifier: 'dummyPro',
    analysisStartTime: 1691389415067,
    analysisEndTime: 1691389430338,
    analysisDuration: 432000,
    analysisStatus: 'COMPLETED',
    monitoredServiceIdentifier: 'DummyService_testenv',
    serviceIdentifier: 'DummyService',
    serviceName: 'DummyService',
    envIdentifier: 'testenv',
    environmentName: 'testenv',
    executionDetailIdentifier: 'NZUc3uHITu2u_fR5MERtkA',
    stepName: 'AnalyzeDeploymentImpact_1'
  },
  {
    accountId: 'kmpySmUISimoRrJL6NL73w',
    orgIdentifier: 'default',
    projectIdentifier: 'dummyPro',
    analysisStartTime: 1691389415067,
    analysisEndTime: 1691389430338,
    analysisDuration: 432000,
    analysisStatus: 'ABORTED',
    monitoredServiceIdentifier: 'DummyService_testenv',
    serviceIdentifier: 'DummyService',
    serviceName: 'DummyService',
    envIdentifier: 'testenv',
    environmentName: 'testenv',
    executionDetailIdentifier: 'NZUc3uHITu2u_fR5MERtkA',
    stepName: 'AnalyzeDeploymentImpact_2'
  },
  {
    accountId: 'kmpySmUISimoRrJL6NL73w',
    orgIdentifier: 'default',
    projectIdentifier: 'dummyPro',
    analysisStartTime: 1691389415067,
    analysisEndTime: 1691389430338,
    analysisDuration: 432000,
    analysisStatus: 'RUNNING',
    monitoredServiceIdentifier: 'DummyService_testenv',
    serviceIdentifier: 'DummyService',
    serviceName: 'DummyService',
    envIdentifier: 'testenv',
    environmentName: 'testenv',
    executionDetailIdentifier: 'NZUc3uHITu2u_fR5MERtkA',
    stepName: 'AnalyzeDeploymentImpact_3'
  }
] as SRMAnalysisStepDetailDTO[]

export const accountLevelMock = reportListMock.map(item => {
  item.stepName = `Account_${item.stepName}`
  return item
})
