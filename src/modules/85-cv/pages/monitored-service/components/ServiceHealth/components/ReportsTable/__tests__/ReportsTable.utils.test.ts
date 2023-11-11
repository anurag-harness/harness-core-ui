import { statusToColorMappingAnalysisReport } from '../RenderTable.utils'
import { AnalysisStatus, DefaultStatus, SuccessStatus, AbortedStatus, RunningStatus } from '../ReportsTable.constants'

describe('Verify Utils', () => {
  test('validate statusToColorMappingAnalysisReport', () => {
    expect(statusToColorMappingAnalysisReport()).toEqual(DefaultStatus)
    expect(statusToColorMappingAnalysisReport(AnalysisStatus.COMPLETED)).toEqual(SuccessStatus)
    expect(statusToColorMappingAnalysisReport(AnalysisStatus.RUNNING)).toEqual(RunningStatus)
    expect(statusToColorMappingAnalysisReport(AnalysisStatus.ABORTED)).toEqual(AbortedStatus)
  })
})
