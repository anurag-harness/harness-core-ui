/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Button, ButtonSize, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import React from 'react'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance, UseTableCellProps } from 'react-table'
import { defaultTo } from 'lodash-es'
import { useArtifactnewSbomQuery } from '@harnessio/react-ssca-service-client'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { Artifact, ArtifactsColumnActions } from './ArtifactsTable'
import css from './ArtifactsTable.module.scss'

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  setTimeout(() => {
    URL.revokeObjectURL(url)
    a.remove()
  }, 150)

  a.click()
}

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & ArtifactsColumnActions
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<Artifact>>

export interface CellTypeRegister {
  component: React.ComponentType<UseTableCellProps<Artifact>>
}

export const ArtifactCell: CellType = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall">
      <a href={data.url} target="_blank" rel="noopener noreferrer">
        <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7} lineClamp={1}>
          {data.imageName || data.url}
        </Text>
      </a>
      {data?.tag && (
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} lineClamp={1}>
          {`${getString('common.artifactTag')}: ${data.tag}`}
        </Text>
      )}
    </Layout.Vertical>
  )
}

export const PipelineStepCell: CellType = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall">
      <Text font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1}>
        {data.node?.name}
      </Text>

      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} lineClamp={1}>
        {`${getString('common.stage').toLowerCase()}: ${data.stage}`}
      </Text>
    </Layout.Vertical>
  )
}

export const ViolationsCell: CellType = ({ row, column }) => {
  const { getString } = useStrings()
  const data = row.original

  const totalViolations = defaultTo(data?.allowListViolationCount, 0) + defaultTo(data?.denyListViolationCount, 0)
  return data?.type === 'Sbom' && totalViolations > 0 ? (
    <Button
      className={css.violations}
      variation={ButtonVariation.LINK}
      text={totalViolations}
      size={ButtonSize.SMALL}
      onClick={() => column.showEnforcementViolations(data.stepExecutionId)}
    />
  ) : (
    <Text font={{ variation: FontVariation.SMALL }} lineClamp={2}>
      {data?.type === 'Sbom' && data.node?.stepType === 'SscaEnforcement' ? 0 : getString('na')}
    </Text>
  )
}

export const SbomCell: CellType = ({ row }) => {
  const artifact = row.original
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const query = useArtifactnewSbomQuery(
    {
      artifactId: defaultTo(artifact.id, ''),
      stepExecutionId: defaultTo(artifact.stepExecutionId, ''),
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      }
    },
    {
      onSuccess: _data => {
        const blob = new Blob([_data.content.sbom], { type: 'text/json' })
        downloadBlob(blob, `${artifact.sbomName}_${artifact.tag}_sbom.json`)
      },
      enabled: false,
      retry: false
    }
  )

  const { getString } = useStrings()

  // sbomUrl is exposed as Content-Type: application/octet-stream so browser will download as file automatically
  return artifact.sbomName ? (
    <Button
      className={css.violations}
      variation={ButtonVariation.LINK}
      size={ButtonSize.SMALL}
      onClick={() => query.refetch()}
      loading={query.isInitialLoading}
    >
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
        <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
          {artifact.sbomName}
        </Text>
        <Icon size={12} name="import" color={Color.PRIMARY_7} />
      </Layout.Horizontal>
    </Button>
  ) : (
    <Text font={{ variation: FontVariation.SMALL }}>{getString('na')}</Text>
  )
}

export const TypeCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text font={{ variation: FontVariation.SMALL }} lineClamp={2} className={css.uppercase}>
      {data.type}
    </Text>
  )
}
