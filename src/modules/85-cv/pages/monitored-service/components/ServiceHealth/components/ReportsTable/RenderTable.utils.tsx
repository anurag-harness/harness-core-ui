/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { IconName, Text } from '@harness/uicore'
import { Renderer, CellProps } from 'react-table'
import { SRMAnalysisStepDetailDTO } from 'services/cv'
import {
  dateFormat,
  timeFormat,
  AnalysisStatus,
  DefaultStatus,
  SuccessStatus,
  AbortedStatus,
  RunningStatus
} from './ReportsTable.constants'
import css from './ReportsTable.module.scss'

export const statusToColorMappingAnalysisReport = (
  status?: SRMAnalysisStepDetailDTO['analysisStatus']
): {
  icon?: IconName
  label: string
  color: string
  iconColor?: string
  backgroundColor: string
} => {
  switch (status) {
    case AnalysisStatus.COMPLETED:
      return SuccessStatus
    case AnalysisStatus.ABORTED:
      return AbortedStatus
    case AnalysisStatus.RUNNING:
      return RunningStatus
    default:
      return DefaultStatus
  }
}

export const RenderDateTime: Renderer<CellProps<SRMAnalysisStepDetailDTO>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  const date = moment(rowdata.analysisStartTime).format(dateFormat)
  const time = moment(rowdata.analysisStartTime).format(timeFormat)
  return (
    <>
      <Text font={{ size: 'small' }}>{date}</Text>
      <Text font={{ size: 'xsmall' }}>{time}</Text>
    </>
  )
}

export const RenderStepName: Renderer<CellProps<SRMAnalysisStepDetailDTO>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <Text tooltip={rowdata.stepName} font={{ size: 'small' }}>
      {rowdata.stepName}
    </Text>
  )
}

export const RenderImpact: Renderer<CellProps<SRMAnalysisStepDetailDTO>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <>
      <Text font={{ size: 'small' }}>{rowdata.serviceName}</Text>
      <Text font={{ size: 'xsmall' }}>{rowdata.environmentName}</Text>
    </>
  )
}

export const RenderStatus: Renderer<CellProps<SRMAnalysisStepDetailDTO>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  const { color, backgroundColor, label, icon, iconColor } = statusToColorMappingAnalysisReport(rowdata.analysisStatus)
  const iconColorProp = iconColor ? { color: iconColor } : {}
  const iconProps = { ...iconColorProp, iconSize: 12 }
  return (
    <Text
      className={css.statusCard}
      icon={icon as IconName}
      background={backgroundColor}
      color={color}
      iconProps={iconProps}
    >
      {label}
    </Text>
  )
}
