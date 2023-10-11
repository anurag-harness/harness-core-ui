/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum TimePeriodEnum {
  FOUR_HOURS = 'FOUR_HOURS',
  TWENTY_FOUR_HOURS = 'TWENTY_FOUR_HOURS',
  THREE_DAYS = 'THREE_DAYS',
  SEVEN_DAYS = 'SEVEN_DAYS',
  THIRTY_DAYS = 'THIRTY_DAYS'
}

export const NUMBER_OF_DATA_POINTS = 48
export const LEFT_TEXTFIELD_WIDTH = 120
export const MIN_BARS_TO_SHOW = 3
export const MAX_BARS_TO_SHOW = 12
export const DEFAULT_MIN_SLIDER_WIDTH = 75
export const DEFAULT_MAX_SLIDER_WIDTH = 300

export const HOURS = 'hours'
export const DAYS = 'days'
export const hoursTimeFormat = 'hh:mma'
export const daysTimeFormat = 'DoMMM hh:mma'

export const ServiceDependencyDialogProps = {
  isOpen: true,
  style: {
    height: 610,
    width: 900,
    padding: 15
  }
}
