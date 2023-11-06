/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RadioGroupProps } from '@harness/uicore/dist/components/FormikForm/FormikForm'
import type { RiskCategoryDTO } from 'services/cv'

export function getRiskCategoryOptionsV2(riskCategories?: RiskCategoryDTO[]): RadioGroupProps['items'] {
  if (!Array.isArray(riskCategories) || !riskCategories?.length) {
    return []
  }

  const riskCategoryOptions: RadioGroupProps['items'] = []
  for (const riskCategory of riskCategories) {
    const { identifier, displayName } = riskCategory || {}
    if (identifier && displayName) {
      riskCategoryOptions.push({
        label: displayName,
        value: identifier,
        tooltipId: `RiskCategory_${identifier}`
      })
    }
  }

  return riskCategoryOptions
}
