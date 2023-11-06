/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { statusToColorMappingAnalysisReport } from '../ReportsTable.utils'
import { AnalysisStatus, DefaultStatus, SuccessStatus, AbortedStatus, RunningStatus } from '../ReportsTable.constants'

describe('Verify Utils', () => {
  test('validate statusToColorMappingAnalysisReport', () => {
    expect(statusToColorMappingAnalysisReport()).toEqual(DefaultStatus)
    expect(statusToColorMappingAnalysisReport(AnalysisStatus.COMPLETED)).toEqual(SuccessStatus)
    expect(statusToColorMappingAnalysisReport(AnalysisStatus.RUNNING)).toEqual(RunningStatus)
    expect(statusToColorMappingAnalysisReport(AnalysisStatus.ABORTED)).toEqual(AbortedStatus)
  })
})
