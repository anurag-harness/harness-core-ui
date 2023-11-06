/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Scope } from '@common/interfaces/SecretsInterface'
import type { ConnectorResponse } from 'services/cd-ng'

export const getConnectorValue = (connector?: ConnectorResponse): string => {
  const connectorIdentifier = connector?.connector?.identifier
  const orgIdentifier = connector?.connector?.orgIdentifier
  const projectIdentifier = connector?.connector?.projectIdentifier
  const accountIdentifierValue = `${Scope.ACCOUNT}.${connectorIdentifier}`
  const orgIdentifierValue = `${Scope.ORG}.${connectorIdentifier}`

  return (
    `${
      orgIdentifier && projectIdentifier
        ? connectorIdentifier
        : orgIdentifier
        ? orgIdentifierValue
        : accountIdentifierValue
    }` || ''
  )
}
export const getConnectorName = (connector?: ConnectorResponse): string => {
  const connectorType = connector?.connector?.type
  const connectorName = connector?.connector?.name
  const orgIdentifier = connector?.connector?.orgIdentifier
  const projectIdentifier = connector?.connector?.projectIdentifier
  const connectorNameBasedOnOrgNProjectId = `${connectorType}: ${connectorName}`
  const connectorNameBasedOnOrg = `${connectorType}[Org]: ${connectorName}`
  const connectorNameBasedOnAccount = `${connectorType}[Account]: ${connectorName}`
  return (
    `${
      orgIdentifier && projectIdentifier
        ? connectorNameBasedOnOrgNProjectId
        : orgIdentifier
        ? connectorNameBasedOnOrg
        : connectorNameBasedOnAccount
    }` || ''
  )
}

export const barrierDocLink =
  'https://developer.harness.io/docs/continuous-delivery/x-platform-cd-features/cd-steps/flow-control/synchronize-deployments-using-barriers/'
