/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Scope } from '@common/interfaces/SecretsInterface'
import { connectorParams } from '../QueryMapping.utils'

const identifierInfo = {
  projectIdentifier: 'projIdentifier',
  orgIdentifier: 'orgIdentifier',
  accountId: 'accIdentifier'
}
const identifier = 'identifier'
const accountIdentifier = `${Scope.ACCOUNT}.${identifier}`
const orgIdentifier = `${Scope.ORG}.${identifier}`
describe('Test suite for connector params', () => {
  test('it should return account id info in query params if type is account', () => {
    expect(connectorParams(accountIdentifier, identifierInfo)).toMatchObject({
      identifier,
      queryParams: {
        accountIdentifier: identifierInfo.accountId
      }
    })
  })

  test('it should return account id, org id info in query params if type is org', () => {
    expect(connectorParams(orgIdentifier, identifierInfo)).toMatchObject({
      identifier,
      queryParams: {
        accountIdentifier: identifierInfo.accountId,
        orgIdentifier: identifierInfo.orgIdentifier
      }
    })
  })

  test('it should return account id, org id and project id info in query params if type is project', () => {
    expect(connectorParams(identifier, identifierInfo)).toMatchObject({
      identifier,
      queryParams: {
        accountIdentifier: identifierInfo.accountId,
        orgIdentifier: identifierInfo.orgIdentifier,
        projectIdentifier: identifierInfo.projectIdentifier
      }
    })
  })
})
