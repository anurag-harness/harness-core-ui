/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import { EXECUTION_TIME_INPUT_VALUE, MultiSelectOption, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { NGVariable } from 'services/pipeline-ng'
import type { StringKeys } from 'framework/strings'
import { yamlParse } from '@common/utils/YamlHelperMethods'

export enum Validation {
  None = 'None',
  AllowedValues = 'AllowedValues',
  Regex = 'Regex'
}

export interface FormValues {
  isRequired?: boolean
  defaultValue?: string | number
  allowedValues: string[] | MultiSelectOption[]
  regExValues: string
  validation: Validation
  isExecutionInput?: boolean
}

export interface ValidationSchemaReturnType {
  validation: Yup.StringSchema<string>
  regExValues: Yup.StringSchema<string | undefined>
  defaultValue: Yup.StringSchema<string | undefined>
  isAdvanced: Yup.BooleanSchema<boolean | undefined>
  advancedValue: Yup.StringSchema<string | undefined>
  allowedValues: Yup.NotRequiredArraySchema<string | undefined>
}

export interface AllowedValuesCustomComponentProps {
  onChange?: (values: MultiSelectOption[]) => void
}

export const ValidationSchema = (
  getString: (key: StringKeys, vars?: Record<string, any>) => string
): ValidationSchemaReturnType => {
  return {
    validation: Yup.string().required(),
    regExValues: Yup.string().when('validation', {
      is: Validation.Regex,
      then: Yup.string()
        .trim()
        .test({
          test(val: string): boolean | Yup.ValidationError {
            if (isEmpty(val)) {
              return this.createError({
                message: getString('common.configureOptions.validationErrors.regExIsRequired')
              })
            }
            let isValid = true
            try {
              val?.length > 0 && new RegExp(val)
            } catch (_e) {
              isValid = false
            }
            if (!isValid) {
              return this.createError({
                message: getString('common.configureOptions.validationErrors.regExNotValid')
              })
            }
            return true
          }
        })
    }),
    defaultValue: Yup.string()
      .trim()
      .when('validation', {
        is: Validation.Regex,
        then: Yup.string()
          .trim()
          .test({
            test(val: string): boolean | Yup.ValidationError {
              if (!isEmpty(this.parent.regExValues) && val?.length > 0 && !this.parent.isAdvanced) {
                try {
                  const reg = new RegExp(this.parent.regExValues)
                  if (!reg.test(val)) {
                    return this.createError({
                      message: getString('common.configureOptions.validationErrors.defaultRegExValid')
                    })
                  }
                } catch (_e) {
                  // Do nothing
                }
              }
              return true
            }
          })
      }),
    isAdvanced: Yup.boolean(),
    advancedValue: Yup.string().when(['validation', 'isAdvanced'], {
      is: (validation: Validation, isAdv: boolean) => validation === Validation.AllowedValues && isAdv,
      then: Yup.string().required(getString('common.configureOptions.validationErrors.jexlExpressionRequired'))
    }),
    allowedValues: Yup.array(Yup.string()).when(['validation', 'isAdvanced'], {
      is: (validation: Validation, isAdv: boolean) => validation === Validation.AllowedValues && !isAdv,
      then: Yup.array(Yup.string()).min(1, getString('common.configureOptions.validationErrors.minOneAllowedValue'))
    })
  }
}

export enum InputSetFunction {
  ALLOWED_VALUES = 'allowedValues',
  EXECUTION_INPUT = 'executionInput',
  REGEX = 'regex',
  DEFAULT = 'default'
}

export interface InputSetFunctionMatcher {
  name: InputSetFunction
  hasParameters: boolean
}

export const INPUT_EXPRESSION_REGEX_STRING = `<\\+input>(?:(\\.(${Object.values(InputSetFunction).join(
  '|'
)})\\((.*?)\\))*)`

export const INPUT_EXPRESSION_SPLIT_REGEX = new RegExp(`\\.(?=${Object.values(InputSetFunction).join('|')})`)

export const JEXL_REGEXP = /jexl\((.*?)\)/
export const JEXL = 'jexl'

export interface ParsedInput {
  [InputSetFunction.ALLOWED_VALUES]: {
    values: string[] | null
  } | null
  [InputSetFunction.EXECUTION_INPUT]: boolean
  [InputSetFunction.REGEX]: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [InputSetFunction.DEFAULT]: any | null
}

export function isExecutionInput(input: string): boolean {
  // split the string based on functions
  const splitData = input.split(INPUT_EXPRESSION_SPLIT_REGEX).slice(1)

  return splitData.some(val => val.startsWith(InputSetFunction.EXECUTION_INPUT))
}

export function parseInputStringWithCommas(input: string): string[] {
  const values: string[] = []
  let startPosition = 0
  let isInSingleQuotes = false
  let isInDoubleQuotes = false

  if (!input) {
    return []
  }

  if (typeof input !== 'string') {
    return input
  }

  for (let currentPosition = 0; currentPosition < input.length; currentPosition++) {
    // Checking if the current position has substring \'
    if (
      currentPosition + 1 < input.length &&
      input.charAt(currentPosition) == '\\' &&
      input.charAt(currentPosition + 1) == "'"
    ) {
      isInSingleQuotes = !isInSingleQuotes
    }
    // Checking if the current position has substring \"
    else if (
      currentPosition + 1 < input.length &&
      input.charAt(currentPosition) == '\\' &&
      input.charAt(currentPosition + 1) == '"'
    ) {
      isInDoubleQuotes = !isInDoubleQuotes
    }
    // If current char is , and it's not within single or double quotes, then add the substring to the list
    else if (input.charAt(currentPosition) == ',' && !isInSingleQuotes && !isInDoubleQuotes) {
      values.push(input.substring(startPosition, currentPosition).trim())
      startPosition = currentPosition + 1
    }
  }

  // Add last value after the last comma to the list
  const lastValue = input.substring(startPosition)
  values.push(lastValue.trim())

  // remove outer quotes from \" ... \" and \' ... \'
  for (let i = 0; i < values.length; i++) {
    if (
      (values[i].startsWith('\\"') && values[i].endsWith('\\"')) ||
      (values[i].startsWith("\\'") && values[i].endsWith("\\'"))
    ) {
      values[i] = values[i].substring(2, values[i].length - 2)
    }
  }

  return values
}

interface parseInputOptions {
  variableType?: NGVariable['type']
}

export function parseInput(input: string, options?: parseInputOptions): ParsedInput | null {
  if (typeof input !== 'string') {
    return null
  }

  const { variableType } = defaultTo(options, {})

  const INPUT_EXPRESSION_REGEX = new RegExp(`^${INPUT_EXPRESSION_REGEX_STRING}$`, 'g')

  const match = input.match(INPUT_EXPRESSION_REGEX)

  if (!match) {
    return null
  }

  // split the string based on functions
  const splitData = input.split(INPUT_EXPRESSION_SPLIT_REGEX).slice(1)

  const parsedInput: ParsedInput = {
    [InputSetFunction.ALLOWED_VALUES]: null,
    [InputSetFunction.EXECUTION_INPUT]: false,
    [InputSetFunction.REGEX]: null,
    [InputSetFunction.DEFAULT]: null
  }

  splitData.forEach(fn => {
    /* istanbul ignore else */
    if (fn.startsWith(InputSetFunction.EXECUTION_INPUT)) {
      parsedInput[InputSetFunction.EXECUTION_INPUT] = true
    } else if (fn.startsWith(InputSetFunction.ALLOWED_VALUES)) {
      // slice the function name along with surrounding parenthesis
      const fnArgs = fn.slice(InputSetFunction.ALLOWED_VALUES.length + 1).slice(0, -1)
      const split = parseInputStringWithCommas(fnArgs)
      parsedInput[InputSetFunction.ALLOWED_VALUES] = {
        // do not parse numbers if present under a string variables to support existing pipelines
        values: split.map(fnArg => {
          try {
            if (variableType && variableType === 'Number') {
              const value = yamlParse(fnArg)
              return value as unknown as string
            }
            return fnArg
          } catch {
            return fnArg
          }
        })
      }
    } else if (fn.startsWith(InputSetFunction.REGEX)) {
      // slice the function name along with surrounding parenthesis
      const fnArgs = fn.slice(InputSetFunction.REGEX.length + 1).slice(0, -1)

      parsedInput[InputSetFunction.REGEX] = fnArgs
    } else if (fn.startsWith(InputSetFunction.DEFAULT)) {
      // slice the function name along with surrounding parenthesis
      const fnArgs = fn.slice(InputSetFunction.DEFAULT.length + 1).slice(0, -1)

      try {
        parsedInput[InputSetFunction.DEFAULT] = variableType
          ? variableType === 'Number'
            ? yamlParse(fnArgs)
            : fnArgs
          : yamlParse(fnArgs)
      } catch (_) {
        parsedInput[InputSetFunction.DEFAULT] = fnArgs
      }
    }
  })

  return parsedInput
}

/**
 *
 * getStringValueWithComma -
 * this converts the string values containing comma to a accepted format (containing delimiters), which helps to retain this value as single value and prevent spliting on comma
 */
export const getStringValueWithComma = (
  value?: string | number | MultiSelectOption
): string | number | MultiSelectOption | undefined => {
  if (typeof value === 'string') {
    return value.includes(',') ? `\\'${value}\\'` : value
  }
  return value
}

export const getInputStr = (data: FormValues, shouldUseNewDefaultFormat: boolean): string => {
  let inputStr = RUNTIME_INPUT_VALUE

  if (data.isExecutionInput) {
    inputStr = EXECUTION_TIME_INPUT_VALUE
  }

  if (shouldUseNewDefaultFormat && data.defaultValue) {
    inputStr += `.${InputSetFunction.DEFAULT}(${getStringValueWithComma(data.defaultValue)})`
  }

  if (data.validation === Validation.AllowedValues && data.allowedValues?.length > 0) {
    inputStr += `.${InputSetFunction.ALLOWED_VALUES}(${data.allowedValues.map((str: string | MultiSelectOption) =>
      getStringValueWithComma(str)
    )})`
  } /* istanbul ignore else */ else if (data.validation === Validation.Regex && data.regExValues?.length > 0) {
    inputStr += `.${InputSetFunction.REGEX}(${data.regExValues})`
  }
  return inputStr
}
