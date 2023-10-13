/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export default function PipelineSetupPreview(): JSX.Element {
  const { getString } = useStrings()

  return (
    <Layout.Vertical>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.deploymentStrategyStep.pipelinesuccess'
          )}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
