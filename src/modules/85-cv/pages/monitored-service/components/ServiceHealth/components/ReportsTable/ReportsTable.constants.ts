/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { IconName } from '@harness/uicore'

export const dateFormat = 'MMM DD, YYYY'
export const timeFormat = 'hh:mm A'

export enum AnalysisStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  ABORTED = 'ABORTED'
}

export const DefaultStatus = {
  label: '',
  color: Color.GREY_500,
  backgroundColor: Color.GREY_50
}

export const SuccessStatus = {
  icon: 'success-tick' as IconName,
  label: AnalysisStatus.COMPLETED,
  color: Color.GREEN_600,
  backgroundColor: Color.GREEN_100
}

export const AbortedStatus = {
  icon: 'circle-stop' as IconName,
  label: AnalysisStatus.ABORTED,
  color: Color.BLACK,
  backgroundColor: Color.GREY_200
}

export const RunningStatus = {
  icon: 'loading' as IconName,
  label: AnalysisStatus.RUNNING,
  color: Color.WHITE,
  iconColor: Color.WHITE,
  backgroundColor: Color.PRIMARY_7
}
