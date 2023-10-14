/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Popover, Position } from '@blueprintjs/core'
import { Icon, Layout, Text, Container } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'

import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import routes from '@common/RouteDefinitions'

import { Scope } from '@common/interfaces/SecretsInterface'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { String } from 'framework/strings'
import { Environment } from 'services/cd-ng'
import css from './CDExecutionSummary.module.scss'

interface EnvironmentsListProps {
  environments: Environment[]
  className?: string
  limit?: number
}

export function EnvironmentsList({ environments, limit = 2, className }: EnvironmentsListProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

  return (
    <div className={cx(css.main, className)}>
      {environments.length > 0 ? (
        <>
          <div className={css.environments}>
            <Icon name="environments" className={css.envIcon} size={14} />
            <Container flex>
              {environments.slice(0, limit).map(env => {
                const envScope = getScopeFromValue(defaultTo(env.identifier, ''))
                return (
                  <Text className={css.envName} lineClamp={1} key={env.identifier} margin={{ right: 'small' }}>
                    <Link
                      to={`${routes.toEnvironmentDetails({
                        accountId,
                        ...(envScope != Scope.ACCOUNT && { orgIdentifier: orgIdentifier }),
                        ...(envScope === Scope.PROJECT && { projectIdentifier: projectIdentifier }),
                        environmentIdentifier: defaultTo(getIdentifierFromScopedRef(defaultTo(env.identifier, '')), ''),
                        module,
                        accountRoutePlacement: 'settings'
                      })}`}
                    >
                      {env.name}
                    </Link>
                  </Text>
                )
              })}
            </Container>
          </div>
          {environments.length > limit ? (
            <>
              ,&nbsp;
              <Popover
                wrapperTagName="div"
                targetTagName="div"
                interactionKind="hover"
                position={Position.RIGHT}
                className={css.serviceWrapper}
              >
                <String
                  tagName="div"
                  className={cx(css.serviceName, css.count)}
                  stringID={'common.plusNumberNoSpace'}
                  vars={{ number: Math.abs(environments.length - limit) }}
                />
                <Layout.Vertical padding="small">
                  {environments.slice(limit).map((environment, index) => (
                    <Text
                      className={css.executionItemDetails}
                      font={{ variation: FontVariation.FORM_LABEL }}
                      key={index}
                    >
                      {defaultTo(environment.name, '')}
                    </Text>
                  ))}
                </Layout.Vertical>
              </Popover>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
