/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import type { AllowedTypes, SelectOption, DataTooltipInterface } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { get, isEmpty, set } from 'lodash-es'

import TagSelector from '../TagSelector/TagSelector'

interface SelectedTagsType {
  key: string
  value: string
}

interface MultiTypeTagSelectorProps {
  allowableTypes: AllowedTypes
  tags: SelectOption[]
  isLoadingTags?: boolean
  name: string
  errorMessage?: string
  className?: string
  tooltipProps?: DataTooltipInterface
  expressions: string[]
  initialTags?: object | string
  label?: string
}

const MultiTypeTagSelector = ({
  allowableTypes,
  tags,
  name,
  errorMessage,
  className,
  tooltipProps,
  expressions,
  initialTags,
  label
}: MultiTypeTagSelectorProps) => {
  const formik = useFormikContext()
  const [selectedTags, setSelectedTags] = useState([] as SelectedTagsType[])
  const [lastInitialTags, setLastInitialTags] = useState(initialTags)

  useEffect(() => {
    if (typeof initialTags === 'object') {
      const initialTagOptions = Object.entries(initialTags || {}).map(
        entry => ({ key: entry[0], value: entry[1] } as SelectedTagsType)
      )
      initialTagOptions.forEach(tagOption => {
        formik.setFieldValue(`${name}.${tagOption.key}`, tagOption.value)
      })
      setSelectedTags(initialTagOptions)
    } else if (get(formik.values, name, '') === '') {
      formik.setFieldValue(`${name}`, {})
    }
  }, [])

  useEffect(() => {
    const formikTags = get(formik.values, name, {})
    if (
      ((lastInitialTags && typeof lastInitialTags === 'object' && Object.keys(lastInitialTags).length > 0) ||
        !lastInitialTags) &&
      selectedTags.length > 0 &&
      typeof formikTags === 'object' &&
      Object.keys(formikTags).length === 0
    ) {
      setSelectedTags([])
    }
    // console.log(formikTags, 'tags')
    setLastInitialTags(formikTags)
  }, [get(formik.values, name, null)])

  useEffect(() => {
    const tagsObject = {}

    selectedTags.forEach(tag => set(tagsObject, tag.key, tag.value))

    !isEmpty(tagsObject) ? formik.setFieldValue(name, tagsObject) : null
  }, [selectedTags])

  return (
    <TagSelector
      allowableTypes={allowableTypes}
      tags={tags}
      isLoadingTags={false}
      name={name}
      errorMessage={errorMessage}
      className={className}
      tooltipProps={tooltipProps}
      expressions={expressions}
      initialTags={initialTags}
      label={label}
      selectedTags={selectedTags}
      lastInitialTags={lastInitialTags}
      setSelectedTags={setSelectedTags}
    />
  )
}

export default MultiTypeTagSelector
