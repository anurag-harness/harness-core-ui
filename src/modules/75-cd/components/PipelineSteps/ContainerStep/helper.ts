/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { get, once } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import type { UseStringsReturn } from 'framework/strings'
import type {
  MapType,
  MapUIType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeMapType,
  MultiTypeMapUIType,
  SelectOption
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import {
  generateSchemaForLimitCPU,
  generateSchemaForLimitMemory,
  getNameAndIdentifierSchema
} from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { OsTypes } from '@pipeline/utils/constants'
import type { ContainerK8sInfra } from 'services/pipeline-ng'
import type { ContainerStepData } from './types'
import { getConnectorSchema, getNameSpaceSchema } from '../PipelineStepsUtil'

const getInitialMapValues: (value: MultiTypeMapType) => MultiTypeMapUIType = value => {
  const map =
    typeof value === 'string'
      ? value
      : Object.keys(value || {}).map(key => ({
          id: uuid('', nameSpace()),
          key: key,
          value: value[key]
        }))
  return map
}

const getInitialListValues: (value: MultiTypeListType) => MultiTypeListUIType = value =>
  typeof value === 'string'
    ? value
    : value
        ?.filter((path: string) => !!path)
        ?.map((_value: string) => ({
          id: uuid('', nameSpace()),
          value: _value
        })) || []

export const processInitialValues = (values: ContainerStepData): ContainerStepData => {
  return {
    ...values,
    spec: {
      ...values.spec,
      reports: getInitialListValues((values.spec?.reports as any)?.spec?.paths),
      outputVariables:
        typeof values?.spec?.outputVariables === 'string'
          ? values?.spec?.outputVariables
          : values?.spec?.outputVariables?.map((_value: any) => ({
              id: uuid('', nameSpace()),
              value: _value.name
            })) || [],
      envVariables: getInitialMapValues(values.spec?.envVariables || {}),
      infrastructure: {
        type: values.spec.infrastructure?.type,
        spec: {
          ...values.spec.infrastructure?.spec,
          annotations: getInitialMapValues(values.spec.infrastructure?.spec?.annotations || {}),
          labels: getInitialMapValues(values.spec.infrastructure?.spec?.labels || {}),
          containerSecurityContext: {
            ...values.spec.infrastructure?.spec?.containerSecurityContext,
            capabilities: {
              drop: getInitialListValues(
                (values.spec.infrastructure as ContainerK8sInfra)?.spec?.containerSecurityContext?.capabilities?.drop ||
                  []
              ),
              add: getInitialListValues(
                (values.spec.infrastructure as ContainerK8sInfra)?.spec?.containerSecurityContext?.capabilities?.add ||
                  []
              )
            }
          },
          nodeSelector: getInitialMapValues((values.spec.infrastructure as ContainerK8sInfra)?.spec?.nodeSelector || {})
        }
      }
    }
  }
}

const processMapValues: (value: MapUIType) => MultiTypeMapType = value => {
  const map: MapType = {}
  typeof value === 'string'
    ? value
    : Array.isArray(value)
    ? value.forEach(mapValue => {
        if (mapValue.key) {
          map[mapValue.key] = mapValue.value
        }
      })
    : {}
  return map
}

const processListValues: (value: MultiTypeListUIType) => MultiTypeListType = value =>
  typeof value === 'string' ? value : value?.filter(listValue => !!listValue.value).map(listValue => listValue.value)

export const processFormData = (_values: ContainerStepData): ContainerStepData => {
  const values = Object.assign({}, _values)
  const outputVar = get(values, 'spec.outputVariables') as MultiTypeListUIType
  const outputVarlist =
    typeof outputVar === 'string'
      ? outputVar
      : outputVar
          ?.filter(listValue => !!listValue.value)
          .map(listValue => ({
            name: listValue.value
          }))

  const reportPaths = get(values, 'spec.reports') as MultiTypeListUIType
  const reportPathsList = processListValues(reportPaths)

  return {
    ...values,
    spec: {
      ...values.spec,
      connectorRef: values.spec.connectorRef,
      reports: {
        type: 'JUnit',
        spec: {
          paths: reportPathsList
        }
      },
      outputVariables: outputVarlist,
      envVariables: processMapValues(values.spec?.envVariables),
      infrastructure: {
        type: values.spec.infrastructure?.type,
        spec: {
          ...values.spec.infrastructure?.spec,
          annotations: processMapValues(values.spec.infrastructure?.spec?.annotations),
          labels: processMapValues(values.spec.infrastructure?.spec?.labels),
          containerSecurityContext: {
            ...(values.spec.infrastructure?.spec?.os !== OsTypes.Windows && {
              ...values.spec.infrastructure?.spec?.containerSecurityContext,
              capabilities: {
                drop: processListValues(values.spec.infrastructure?.spec?.containerSecurityContext?.capabilities?.drop),
                add: processListValues(values.spec.infrastructure?.spec?.containerSecurityContext?.capabilities?.add)
              }
            })
          },
          nodeSelector: processMapValues(values.spec.infrastructure?.spec?.nodeSelector)
        }
      }
    }
  }
}

export const getValidationSchema = (getString: UseStringsReturn['getString'], stepViewType: StepViewType) => {
  return Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      connectorRef: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.connectorLabel') })
      ),
      image: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('imageLabel') })),
      command: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('commandLabel') })
      ),
      infrastructure: Yup.object().shape({
        spec: Yup.object().shape({
          connectorRef: getConnectorSchema(getString),
          namespace: getNameSpaceSchema(getString),
          resources: Yup.object().shape({
            limits: Yup.object().shape({
              cpu: generateSchemaForLimitCPU({ getString, isRequired: true }),
              memory: generateSchemaForLimitMemory({ getString, isRequired: true })
            })
          })
        })
      })
    })
  })
}

export const getOsTypes = once((getString: UseStringsReturn['getString']): SelectOption[] => [
  { label: getString('delegate.cardData.linux.name'), value: OsTypes.Linux },
  {
    label: getString('pipeline.infraSpecifications.osTypes.windows'),
    value: OsTypes.Windows
  }
])
