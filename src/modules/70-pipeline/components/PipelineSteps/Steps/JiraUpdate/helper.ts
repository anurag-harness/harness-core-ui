/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { JiraCreateFieldType, JiraFieldNGWithValue } from '../JiraCreate/types'
import { getkvFieldValue } from '../StepsHelper'
import type { JiraUpdateData } from './types'

export const processFieldsForSubmit = (values: JiraUpdateData): JiraCreateFieldType[] => {
  const toReturn: JiraCreateFieldType[] = []
  values.spec.selectedOptionalFields?.forEach((field: JiraFieldNGWithValue) => {
    const name = field.name
    const value = getkvFieldValue(field)
    // The return value should be comma separated string or a number
    if (value) {
      toReturn.push({ name, value })
    }
  })
  values.spec.fields?.forEach((kvField: JiraCreateFieldType) => {
    const alreadyPresent = toReturn.find(field => field.name === kvField.name)
    const value = getkvFieldValue(kvField)
    if (!alreadyPresent && value) {
      toReturn.push(kvField)
    }
  })
  return toReturn
}

export const processFormData = (values: JiraUpdateData): JiraUpdateData => {
  return {
    ...values,
    spec: {
      connectorRef: values.spec.connectorRef,
      issueKey: values.spec.issueKey,
      transitionTo:
        values.spec.transitionTo?.transitionName || values.spec.transitionTo?.status
          ? {
              transitionName: values.spec.transitionTo.transitionName,
              status: values.spec.transitionTo.status
            }
          : undefined,
      fields: processFieldsForSubmit(values),
      delegateSelectors: values.spec.delegateSelectors
    }
  }
}

export const processInitialValues = (values: JiraUpdateData): JiraUpdateData => {
  return {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      connectorRef: values.spec.connectorRef,
      issueKey: values.spec.issueKey,
      transitionTo: values.spec.transitionTo
        ? {
            status: values.spec.transitionTo.status,
            transitionName: values.spec.transitionTo.transitionName
          }
        : undefined,
      fields: values.spec.fields
    }
  }
}
