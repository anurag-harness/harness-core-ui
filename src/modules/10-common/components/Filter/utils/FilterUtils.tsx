/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty, isUndefined, omitBy } from 'lodash-es'
import React from 'react'
import type { FilterDTO } from 'services/cd-ng'

import css from './FilterUtils.module.scss'

type supportedTypes = string | number | boolean | Record<string, any>

const tagSeparator = ':'

interface NGTag {
  key: string
  value: string
}

export const renderItemByType = (data: supportedTypes | Array<supportedTypes> | Record<string, any>): string => {
  if (Array.isArray(data)) {
    return data?.map(item => renderItemByType(item)).join(', ')
  } else if (typeof data === 'object') {
    if (Object.prototype.hasOwnProperty.call(data, 'key') && Object.prototype.hasOwnProperty.call(data, 'value')) {
      const { key, value } = data as NGTag
      return key?.toString().concat(value ? tagSeparator.concat(value.toString()) : '')
    }
    return Object.entries(data)
      .map(([key, value]) => {
        return key?.toString().concat(value ? tagSeparator.concat(value.toString()) : '')
      })
      .join(', ')
  } else if (typeof data === 'number') {
    return data.toString()
  } else if (typeof data === 'boolean') {
    return data ? 'true' : 'false'
  }
  return typeof data === 'string' ? data : ''
}

export const getFilterSummary = (
  fieldToLabelMapping: Map<string, string>,
  fields: Record<string, any>
): JSX.Element => {
  return (
    <ol className={css.noStyleUl}>
      {Object.entries(fields as Record<string, any>).map(([key, value]) => {
        if (fieldToLabelMapping.has(key)) {
          return (
            <li key={key} className={css.summaryItem}>
              <span>{fieldToLabelMapping.get(key)} : </span>
              <span style={{ fontWeight: 'bold' }}>{renderItemByType(value)}</span>
            </li>
          )
        }
      })}
    </ol>
  )
}

export const removeNullAndEmpty = (object: Record<string, any>) => omitBy(omitBy(object, isUndefined), isEmpty)
export const isObjectEmpty = (arg: Record<string, any>): boolean => isEmpty(omitBy(arg, isEmpty))
export const UNSAVED_FILTER = 'Unsaved Filter'
export const MAX_FILTER_NAME_LENGTH = 25

export const flattenObject = (obj: Record<string, any>) => {
  const flattened: {
    [key: string]: string
  } = {}
  Object.keys(obj).forEach((key: string) => {
    if (Object.prototype.toString.call(obj[key]) === '[object Object]' && obj[key] !== null) {
      Object.assign(flattened, flattenObject(obj[key]))
    } else {
      flattened[key as string] = obj[key]
    }
  })
  return flattened
}

export const getFilterSize = (obj: Record<string, any>): number => {
  return Object.keys(flattenObject(obj)).length
}

export const getFilterByIdentifier = (filters: FilterDTO[], identifier: string): FilterDTO | undefined =>
  filters.find((filter: FilterDTO) => filter.identifier?.toLowerCase() === identifier.toLowerCase())
