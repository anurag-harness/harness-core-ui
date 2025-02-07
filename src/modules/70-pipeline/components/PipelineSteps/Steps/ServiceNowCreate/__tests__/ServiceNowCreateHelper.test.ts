/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { MultiSelectOption } from '@harness/uicore'
import type { ServiceNowFieldAllowedValueNG, ServiceNowFieldValueNG } from 'services/cd-ng'
import { setAllowedValuesOptions } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { convertTemplateFieldsForDisplay, omitDescNShortDesc, processFormData } from '../helper'
import type { ServiceNowCreateData, ServiceNowCreateFieldType } from '../types'
import { FieldType, ServiceNowStaticFields } from '../types'

describe('ServiceNow Create process form data tests', () => {
  test('if duplicate fields are not sent', () => {
    const formValues: ServiceNowCreateData = {
      name: 'serviceNowCreate',
      identifier: 'jcr',
      timeout: '10m',
      type: 'ServiceNowCreate',
      spec: {
        connectorRef: 'conn',
        fieldType: FieldType.ConfigureFields,
        useServiceNowTemplate: false,
        ticketType: { label: 'Incident', value: 'INCIDENT', key: 'INCIDENT' },
        fields: [
          {
            name: 'f1',
            value: 'v1'
          },
          {
            name: 'f2',
            value: { label: 'vb2', value: 'vb2' }
          }
        ],
        selectedFields: [
          {
            name: 'f2',
            value: { label: 'vb2', value: 'vb2' },
            key: 'f2',
            allowedValues: [],
            schema: {
              typeStr: '',
              type: 'string'
            }
          },
          {
            name: 'f3',
            value: [
              { label: 'v3', value: 'v3' },
              { label: 'v32', value: 'v32' }
            ],
            key: 'f3',
            allowedValues: [],
            schema: {
              typeStr: '',
              type: 'string'
            }
          }
        ]
      }
    }

    const returned = processFormData(formValues)
    expect(returned).toStrictEqual({
      name: 'serviceNowCreate',
      identifier: 'jcr',
      timeout: '10m',
      type: 'ServiceNowCreate',
      spec: {
        useServiceNowTemplate: false,
        connectorRef: 'conn',
        delegateSelectors: undefined,
        ticketType: {
          key: 'INCIDENT',
          label: 'Incident',
          value: 'INCIDENT'
        },
        fields: [
          {
            name: 'description',
            value: ''
          },
          {
            name: 'short_description',
            value: ''
          },
          {
            name: 'f2',
            value: 'vb2'
          },
          {
            name: 'f3',
            value: 'v3,v32'
          },
          {
            name: 'f1',
            value: 'v1'
          }
        ]
      }
    })
  })

  test('if runtime values work', () => {
    const formValues: ServiceNowCreateData = {
      name: 'serviceNowCreate',
      identifier: 'jcr',
      timeout: '10m',
      type: 'ServiceNowCreate',
      spec: {
        fieldType: FieldType.ConfigureFields,
        useServiceNowTemplate: false,
        connectorRef: '<+input>',
        delegateSelectors: undefined,
        ticketType: '<+input>',
        fields: [
          {
            name: 'f1',
            value: '<+a.b>'
          }
        ],
        selectedFields: [
          {
            name: 'f2',
            value: '<+x.y>',
            key: 'f2',
            allowedValues: [],
            schema: {
              typeStr: '',
              type: 'string'
            }
          }
        ]
      }
    }

    const returned = processFormData(formValues)
    expect(returned).toStrictEqual({
      name: 'serviceNowCreate',
      identifier: 'jcr',
      timeout: '10m',
      type: 'ServiceNowCreate',
      spec: {
        useServiceNowTemplate: false,
        connectorRef: '<+input>',
        delegateSelectors: undefined,
        ticketType: '<+input>',
        fields: [
          {
            name: 'description',
            value: ''
          },
          {
            name: 'short_description',
            value: ''
          },
          {
            name: 'f2',
            value: '<+x.y>'
          },
          {
            name: 'f1',
            value: '<+a.b>'
          }
        ]
      }
    })
  })

  test('when useServiceNowTemplate is true', () => {
    const formValues: ServiceNowCreateData = {
      name: 'serviceNowCreate',
      identifier: 'sncr',
      timeout: '10m',
      type: 'ServiceNowCreate',
      spec: {
        connectorRef: 'conn',
        fieldType: FieldType.CreateFromTemplate,
        useServiceNowTemplate: true,
        ticketType: { label: 'Incident', value: 'INCIDENT', key: 'INCIDENT' },
        fields: [],
        selectedFields: [],
        templateName: 'snowCreateTemplate'
      }
    }

    const returned = processFormData(formValues)
    expect(returned).toStrictEqual({
      name: 'serviceNowCreate',
      identifier: 'sncr',
      timeout: '10m',
      type: 'ServiceNowCreate',
      spec: {
        connectorRef: 'conn',
        delegateSelectors: undefined,
        useServiceNowTemplate: true,
        ticketType: { label: 'Incident', value: 'INCIDENT', key: 'INCIDENT' },
        fields: [],
        templateName: 'snowCreateTemplate'
      }
    })
  })

  test('omitShortDescNDesc function', () => {
    const fields: ServiceNowCreateFieldType[] = [
      { name: ServiceNowStaticFields.description, value: 'desc' },
      { name: ServiceNowStaticFields.short_description, value: 'short desc' },
      { name: 'test1', value: '1' },
      { name: 'test2', value: '2' }
    ]
    const returned: ServiceNowCreateFieldType[] = omitDescNShortDesc(fields)
    expect(returned.length).toEqual(2)
  })
  test('setServiceNowAllowedValuesOption', () => {
    const fields: ServiceNowFieldAllowedValueNG[] = [
      { id: 'id1', value: 'value' },
      { id: 'id2', name: 'name' }
    ]
    const returned: MultiSelectOption[] = setAllowedValuesOptions(fields)
    expect(returned).toEqual([
      { label: 'value', value: 'value' },
      { label: 'name', value: 'name' }
    ])
  })
  test('convertTemplateFieldsForDisplay', () => {
    const fields: {
      [key: string]: ServiceNowFieldValueNG
    } = { field1: { displayValue: 'field1', value: 'field1' } }
    const returned: ServiceNowFieldValueNG[] = convertTemplateFieldsForDisplay(fields)
    expect(returned).toEqual([{ displayValue: 'field1', value: 'field1' }])
  })
})
