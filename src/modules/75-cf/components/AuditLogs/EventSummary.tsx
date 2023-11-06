/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useMemo, useState } from 'react'
import { Drawer, IDrawerProps, Classes } from '@blueprintjs/core'
import { get } from 'lodash-es'
import cx from 'classnames'
import { Layout, Container, Text, Button, useToggle, Heading, PageError } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { MonacoDiffEditorProps } from 'react-monaco-editor'
import {
  CF_LOCAL_STORAGE_ENV_KEY,
  DEFAULT_ENV,
  AuditLogAction,
  formatDate,
  formatTime,
  AUDIT_LOG_EMPTY_ENTRY_ID,
  getErrorMessage
} from '@cf/utils/CFUtils'
import MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import { useLocalStorage } from '@common/hooks'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { AuditTrail, Feature, useGetOSByID } from 'services/cf'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { translateEvents } from './AuditLogsUtils'
import css from './EventSummary.module.scss'

const drawerStates: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  hasBackdrop: true,
  usePortal: true,
  isOpen: true,
  size: 1000,
  backdropClassName: css.backdrop,
  className: css.container
}

const DIFF_VIEWER_OPTIONS: MonacoDiffEditorProps['options'] = {
  ignoreTrimWhitespace: true,
  minimap: { enabled: false },
  codeLens: false,
  readOnly: true,
  renderSideBySide: true,
  lineNumbers: 'off' as const,
  inDiffEditor: true,
  scrollBeyondLastLine: false,
  smartSelect: {
    selectLeadingAndTrailingWhitespace: false
  }
}

export interface EventSummaryProps {
  flagData: Feature
  data: AuditTrail
  onClose: () => void
}

export const EventSummary: FC<EventSummaryProps> = ({ data, flagData, onClose }) => {
  const { getString } = useStrings()
  const [environment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)
  const { selectedProject } = useAppStore()
  let text = getString('cf.auditLogs.createdMessageFF')
  const [showDiff, toggleShowDiff] = useToggle(false)
  const { objectBefore, objectAfter } = data
  const isNewObject = objectBefore === AUDIT_LOG_EMPTY_ENTRY_ID

  const {
    data: diffData,
    loading,
    error,
    refetch
  } = useGetOSByID({
    identifiers: isNewObject ? [objectAfter] : [objectBefore, objectAfter],
    lazy: !showDiff
  })
  const eventStrings = translateEvents(data.instructionSet, getString)

  switch (data.action) {
    case AuditLogAction.FeatureActivationCreated:
      text = getString('cf.auditLogs.flagCreated')
      break
    case AuditLogAction.FeatureActivationArchived:
      text = getString('cf.auditLogs.flagArchived')
      break
    case AuditLogAction.FeatureActivationRestored:
      text = getString('cf.auditLogs.flagRestored')
      break
    case AuditLogAction.SegmentCreated:
      text = getString('cf.auditLogs.segmentCreated')
      break
    case AuditLogAction.FeatureActivationPatched:
      text = getString('cf.auditLogs.flagUpdated')
      break
  }

  const date = `${formatDate(data.executedOn)}, ${formatTime(data.executedOn)} PST`

  const [valueBefore, setValueBefore] = useState<string | undefined>()
  const [valueAfter, setValueAfter] = useState<string | undefined>()
  const [buttonClientY, setButtonClientY] = useState(0)
  const editorHeight = useMemo(() => `calc(100vh - ${buttonClientY + 60}px)`, [buttonClientY])

  useEffect(() => {
    const _before = isNewObject ? undefined : get(diffData, 'data.objectsnapshots[0].value')
    const _after = get(diffData, `data.objectsnapshots[${isNewObject ? 0 : 1}].value`)

    if (_before) {
      setValueBefore(yamlStringify(_before))
    }
    if (_after) {
      setValueAfter(yamlStringify(_after))
    }
  }, [diffData, isNewObject])

  return (
    <Drawer
      className={css.container}
      {...drawerStates}
      onClose={onClose}
      title={<header>{getString('auditTrail.eventSummary')}</header>}
    >
      <Container className={cx(Classes.DRAWER_BODY, css.body)} padding="xlarge">
        <Container className={css.eventSection} padding="large">
          <Layout.Vertical spacing="medium">
            <Text color={Color.GREY_400} font={{ variation: FontVariation.H6 }}>
              {date}
            </Text>
            <Text color={Color.GREY_400}>
              {getString('cf.auditLogs.summaryHeading', {
                project: selectedProject?.name,
                environment: environment?.label
              })}
            </Text>
          </Layout.Vertical>
          <Container style={{ marginTop: 'var(--spacing-xxlarge)' }}>
            <Text icon="person" iconProps={{ size: 16 }}>
              <strong>{data.actor}</strong>
              <span style={{ padding: '0 var(--spacing-xsmall)' }}>{text}</span>
              <strong>{flagData.name}</strong>
            </Text>
          </Container>

          <Heading
            color={Color.GREY_800}
            level={4}
            font={{ variation: FontVariation.TINY_SEMI }}
            style={{ padding: 'var(--spacing-xlarge) 0 0 var(--spacing-large)' }}
          >
            {getString('cf.auditLogs.changeDetails').toLocaleUpperCase()}
          </Heading>
          <ul>
            {eventStrings.map(message => (
              <li key={message}>
                <Text>{message}</Text>
              </li>
            ))}
          </ul>

          <Container margin={{ top: 'small' }}>
            <Button
              data-testId="yaml-diff-btn"
              className={css.yamlDiffBtn}
              minimal
              rightIcon={showDiff ? 'chevron-up' : 'chevron-down'}
              text={getString('auditTrail.yamlDifference').toLocaleUpperCase()}
              onClick={e => {
                e.persist()
                setButtonClientY(e.clientY)
                toggleShowDiff()
                refetch()
              }}
            />
            {showDiff && (
              <Container margin={{ top: 'xsmall', left: 'small', right: 'small' }} height={editorHeight}>
                {!!diffData && (
                  <MonacoDiffEditor
                    width="100%"
                    height={editorHeight}
                    language="yaml"
                    original={valueBefore}
                    value={valueAfter}
                    options={DIFF_VIEWER_OPTIONS}
                    editorDidMount={editor => {
                      setTimeout(() => {
                        ;(
                          editor as unknown as {
                            setSelection: (param: Record<string, number>) => void
                          }
                        ).setSelection({
                          startLineNumber: 0,
                          startColumn: 0,
                          endLineNumber: 0,
                          endColumn: 0,
                          selectionStartLineNumber: 0,
                          selectionStartColumn: 0,
                          positionLineNumber: 0,
                          positionColumn: 0
                        })
                      }, 0)
                    }}
                  />
                )}

                {error && (
                  <PageError
                    message={getErrorMessage(error)}
                    onClick={() => {
                      refetch()
                    }}
                  />
                )}

                {loading && <ContainerSpinner />}
              </Container>
            )}
          </Container>
        </Container>
      </Container>
    </Drawer>
  )
}
