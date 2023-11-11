/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { IconName, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Renderer, CellProps } from 'react-table'
import { SRMAnalysisStepDetailDTO } from 'services/cv'
import { dateFormat, timeFormat, AnalysisStatus } from './ReportsTable.constants'
import css from './ReportsTable.module.scss'

const statusToColorMappingAnalysisReport = (
  status: SRMAnalysisStepDetailDTO['analysisStatus']
): {
  icon?: IconName
  label: string
  color: string
  iconColor?: string
  backgroundColor: string
} => {
  switch (status) {
    case AnalysisStatus.COMPLETED:
      return {
        icon: 'success-tick',
        label: AnalysisStatus.COMPLETED,
        color: Color.GREEN_600,
        backgroundColor: Color.GREEN_100
      }
    case AnalysisStatus.ABORTED:
      return {
        icon: 'circle-stop',
        label: AnalysisStatus.ABORTED,
        color: Color.BLACK,
        backgroundColor: Color.GREY_200
      }
    case AnalysisStatus.RUNNING:
      return {
        icon: 'loading',
        label: AnalysisStatus.RUNNING,
        color: Color.WHITE,
        iconColor: Color.WHITE,
        backgroundColor: Color.PRIMARY_7
      }
    default:
      return {
        label: '',
        color: Color.GREY_500,
        backgroundColor: Color.GREY_50
      }
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
  const { color, backgroundColor, label, icon, iconColor } =
    statusToColorMappingAnalysisReport(rowdata.analysisStatus) || {}
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
