/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
/* eslint-disable */
// This code is autogenerated using @harnessio/oats-cli.
// Please do not modify this code directly.
import type { EntityGitDetails } from '../schemas/EntityGitDetails'

export interface ServiceV2YamlMetadata {
  connectorRef?: string
  entityGitDetails?: EntityGitDetails
  fallbackBranch?: string
  inputSetTemplateYaml?: string
  orgIdentifier?: string
  projectIdentifier?: string
  serviceIdentifier: string
  serviceYaml?: string
  storeType?: 'INLINE' | 'REMOTE'
}
