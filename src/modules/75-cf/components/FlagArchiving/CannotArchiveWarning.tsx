/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import routes from '@common/RouteDefinitions'
import { useStrings, String } from 'framework/strings'
import type { Features } from 'services/cf'
import { ItemContainer } from '../ItemContainer/ItemContainer'
import css from './useArchiveFlagDialog.module.scss'

export interface CannotArchiveWarningProps {
  dependentFlagsResponse: Features
  flagName: string
}

export const CannotArchiveWarning: FC<CannotArchiveWarningProps> = ({ dependentFlagsResponse, flagName }) => {
  const { getString } = useStrings()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()

  return (
    <Layout.Vertical spacing="small">
      <String
        className={css.cannotArchiveMessage}
        stringID="cf.featureFlags.archiving.cannotArchive"
        useRichText
        vars={{ flagName }}
      />
      {dependentFlagsResponse?.features?.map(dependentFlag => (
        <ItemContainer data-testid="dependent-flag-row" key={dependentFlag.identifier}>
          <Link
            to={withActiveEnvironment(
              routes.toCFFeatureFlagsDetail({
                accountId,
                orgIdentifier,
                projectIdentifier,
                featureFlagIdentifier: dependentFlag.identifier
              })
            )}
          >
            {dependentFlag.name}
          </Link>
          <Text data-testId="flagIdentifierLabel">
            {getString('common.ID')}: {dependentFlag.identifier}
          </Text>
        </ItemContainer>
      ))}
      <Text padding={{ top: 'medium' }} color={Color.GREY_500} font={{ variation: FontVariation.BODY2 }}>
        {getString('cf.featureFlags.archiving.removeFlag')}
      </Text>
    </Layout.Vertical>
  )
}

export default CannotArchiveWarning
