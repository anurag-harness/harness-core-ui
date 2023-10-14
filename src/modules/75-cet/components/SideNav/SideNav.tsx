/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import NavExpandable from '@common/navigation/NavExpandable/NavExpandable'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ProjectSelector, ProjectSelectorProps } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useAnyEnterpriseLicense } from '@common/hooks/useModuleLicenses'

export default function ETSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  const history = useHistory()
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const canUsePolicyEngine = useAnyEnterpriseLicense()

  const projectSelectHandler: ProjectSelectorProps['onSelect'] = data => {
    updateAppStore({ selectedProject: data })

    history.push(routes.toCET({ accountId }))
  }

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector onSelect={projectSelectHandler} />
      {projectIdentifier && orgIdentifier && (
        <React.Fragment>
          <SidebarLink
            label="Events Summary"
            to={routes.toCETEventsSummary({
              projectIdentifier,
              orgIdentifier,
              accountId
            })}
          />
          <SidebarLink
            label="Monitored Services"
            to={routes.toCETMonitoredServices({
              projectIdentifier,
              orgIdentifier,
              accountId
            })}
          />
          <NavExpandable title={getString('common.projectSetup')} route={'undefined'}>
            <Layout.Vertical spacing="small">
              <SidebarLink
                label={'Tokens'}
                to={routes.toCETAgentsTokens({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={'Agents'}
                to={routes.toCETAgents({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('connectorsLabel')}
                to={routes.toCETConnectors({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('common.secrets')}
                to={routes.toCETSecrets({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('accessControl')}
                to={routes.toCETAccessControl({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('delegate.delegates')}
                to={routes.toCETDelegates({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              {canUsePolicyEngine && (
                <SidebarLink
                  label={getString('common.governance')}
                  to={routes.toGovernance({
                    accountId,
                    orgIdentifier,
                    projectIdentifier,
                    module: 'cet'
                  })}
                />
              )}
              <SidebarLink
                label={getString('common.defaultSettings')}
                to={routes.toCETDefaultSettings({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
            </Layout.Vertical>
          </NavExpandable>
        </React.Fragment>
      )}
    </Layout.Vertical>
  )
}
