/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'

import { TabNavigation } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import routesv1 from '@common/RouteDefinitions'
import routesv2 from '@common/RouteDefinitionsV2'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'

export default function WebhooksTabs(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { CDS_NAV_2_0: newLeftNav } = useFeatureFlags()
  const routes = newLeftNav ? routesv2 : routesv1

  return (
    <TabNavigation
      size={'small'}
      links={[
        {
          label: getString('common.webhooks'),
          to: routes.toWebhooks({
            accountId,
            orgIdentifier,
            projectIdentifier,
            module
          }),
          exact: true
        },
        {
          label: getString('events'),
          to: routes.toWebhooksEvents({
            accountId,
            orgIdentifier,
            projectIdentifier,
            module
          })
        }
      ]}
    />
  )
}
