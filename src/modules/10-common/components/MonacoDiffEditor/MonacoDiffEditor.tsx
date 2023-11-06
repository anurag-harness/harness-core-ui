/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { editor } from 'monaco-editor'
import React, { forwardRef } from 'react'
import { MonacoDiffEditor as ReactMonacoDiffEditor } from 'react-monaco-editor'
import type { MonacoDiffEditorProps, DiffEditorWillMount, DiffEditorDidMount } from 'react-monaco-editor'
import { suppressHotJarRecording, setForwardedRef } from '@common/utils/utils'

export type MonacoDiffEditorRef = editor.IStandaloneDiffEditor

export interface ExtendedMonacoDiffEditorProps extends MonacoDiffEditorProps {
  name?: string
  'data-testid'?: string
}

const MonacoDiffEditor = forwardRef<MonacoDiffEditorRef, ExtendedMonacoDiffEditorProps>(
  (props: ExtendedMonacoDiffEditorProps, ref): React.ReactElement => {
    const editorWillMount: DiffEditorWillMount = monaco => {
      monaco?.editor?.defineTheme('disable-theme', {
        base: 'vs',
        inherit: true,
        rules: [
          {
            token: '',
            background: 'f3f3fa'
          }
        ],
        colors: {
          'editor.background': '#f3f3fa'
        }
      })

      // Don't allow HotJar to record content in Yaml/Code editor(s)
      suppressHotJarRecording([...document.querySelectorAll('.react-monaco-editor-container')])

      props.editorWillMount?.(monaco)
    }

    const editorDidMount: DiffEditorDidMount = (editor, monaco) => {
      setForwardedRef(ref, editor)

      const remeasureFonts = (): void => monaco?.editor?.remeasureFonts()
      const loaded = document.fonts.check('1em Roboto Mono')

      if (loaded) {
        remeasureFonts()
      } else {
        document.fonts.ready.then(remeasureFonts)
      }

      props.editorDidMount?.(editor, monaco)
    }

    const theme = props.options?.readOnly ? 'disable-theme' : 'vs'

    return (
      <ReactMonacoDiffEditor
        {...props}
        value={props.value ?? ''}
        original={props.original ?? ''}
        theme={theme}
        editorWillMount={editorWillMount}
        editorDidMount={editorDidMount}
      />
    )
  }
)

MonacoDiffEditor.displayName = 'MonacoDiffEditor'

export default MonacoDiffEditor
