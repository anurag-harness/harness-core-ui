/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { Layout, useToaster } from '@harness/uicore'
import cx from 'classnames'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import { SavedProjectDetails, useAppStore } from 'framework/AppStore/AppStoreContext'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useGetProject } from 'services/cd-ng'
import routes, { CODEPathProps } from '../../RouteDefinitions'
import css from './SideNav.module.scss'

export default function CODESideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, repoName } = useParams<CODEPathProps>()
  const history = useHistory()
  const { showError } = useToaster()
  const { path } = useRouteMatch()
  const { updateAppStore } = useAppStore()
  const { preference: savedProject } = usePreferenceStore<SavedProjectDetails>(PreferenceScope.USER, 'savedProject')

  const {
    data: projectData,
    loading,
    error
  } = useGetProject({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier
    },
    lazy: !projectIdentifier || (savedProject && savedProject.projectIdentifier === projectIdentifier)
  })

  const isFiles =
    path.endsWith(':repoName') || path.includes(':repoName/files/') || path.endsWith(':gitRef*/~/:resourcePath*')
  const isCommit = path.includes(':repoName/commits/') || path.endsWith('/commit/:commitRef*')

  useEffect(() => {
    if (projectData?.data?.project) {
      updateAppStore({ selectedProject: projectData?.data?.project })
    }
  }, [projectData]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) {
      showError(error?.message)
    }
  }, [error]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <></>
  }

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CODE}
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          history.push(
            routes.toCODERepositories({ space: [accountId, data.orgIdentifier as string, data.identifier].join('/') })
          )
        }}
      />

      {projectIdentifier && orgIdentifier && (
        <>
          <SidebarLink
            label={getString('repositories')}
            to={routes.toCODERepositories({ space: [accountId, orgIdentifier, projectIdentifier].join('/') })}
            {...(repoName ? { activeClassName: '' } : {})}
          />

          {repoName && (
            <SidebarLink
              data-code-repo-section="files"
              className={css.subNav}
              icon="code-file-light"
              textProps={{
                iconProps: {
                  size: 18
                }
              }}
              label={getString('common.files')}
              to={routes.toCODERepository({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
              {...(isFiles ? {} : { activeClassName: '' })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="commits"
              className={cx(css.subNav, { [css.selected]: isCommit })}
              icon="git-commit"
              textProps={{
                iconProps: {
                  size: 16
                }
              }}
              label={getString('commits')}
              to={routes.toCODECommits({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/'),
                commitRef: ''
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="branches"
              className={css.subNav}
              icon="git-branch"
              textProps={{
                iconProps: {
                  size: 14
                }
              }}
              label={getString('code.branches')}
              to={routes.toCODEBranches({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="tags"
              className={css.subNav}
              icon="code-tag"
              textProps={{
                iconProps: {
                  size: 18,
                  className: css.tagIcon
                }
              }}
              label={getString('tagsLabel')}
              to={routes.toCODETags({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="pull-requests"
              className={css.subNav}
              icon="git-pull"
              textProps={{
                iconProps: {
                  size: 14
                }
              }}
              label={getString('code.pullRequests')}
              to={routes.toCODEPullRequests({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}

          {repoName && (
            <SidebarLink
              data-code-repo-section="branches"
              className={cx(css.subNav, css.webhooks)}
              icon="code-webhook"
              textProps={{
                iconProps: {
                  size: 20
                }
              }}
              label={getString('code.webhooks')}
              to={routes.toCODEWebhooks({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}
          {repoName && (
            <SidebarLink
              data-code-repo-section="settings"
              className={cx(css.subNav, css.webhooks)}
              icon="code-settings"
              textProps={{
                iconProps: {
                  size: 20
                }
              }}
              label={getString('settingsLabel')}
              to={routes.toCODESettings({
                repoPath: [accountId, orgIdentifier, projectIdentifier, repoName].join('/')
              })}
            />
          )}
        </>
      )}
    </Layout.Vertical>
  )
}
