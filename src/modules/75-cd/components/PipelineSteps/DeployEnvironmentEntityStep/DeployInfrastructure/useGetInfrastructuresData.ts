/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty, isEqual } from 'lodash-es'

import { shouldShowError, useToaster } from '@harness/uicore'

import { useMutateAsGet } from '@common/hooks'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { yamlParse } from '@common/utils/YamlHelperMethods'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import {
  AccessControlCheckError,
  ServiceDefinition,
  TemplateLinkConfig,
  useGetInfrastructureList,
  useGetInfrastructureYamlAndRuntimeInputs
} from 'services/cd-ng'

import type { InfrastructureData, InfrastructureYaml } from '../types'

export interface UseGetInfrastructuresDataProps {
  environmentIdentifier: string
  infrastructureIdentifiers: string[]
  deploymentType: ServiceDefinition['type']
  deploymentTemplateIdentifier?: TemplateLinkConfig['templateRef']
  versionLabel?: TemplateLinkConfig['versionLabel']
  lazyInfrastructure?: boolean
}

export interface UseGetInfrastructuresDataReturn {
  /** Contains list of infrastructure config objects */
  infrastructuresList: InfrastructureYaml[]
  /** Contains list of infrastructure objects with inputs */
  infrastructuresData: InfrastructureData[]
  loadingInfrastructuresList: boolean
  loadingInfrastructuresData: boolean
  /** Used only for loading state while updating data */
  updatingInfrastructuresData: boolean
  refetchInfrastructuresList(): void
  refetchInfrastructuresData(): void
  /** Used to prepend data to `environmentsList` */
  prependInfrastructureToInfrastructureList(newInfrastructureInfo: InfrastructureYaml): void
  nonExistingInfrastructureIdentifiers: string[]
}

export function useGetInfrastructuresData({
  environmentIdentifier,
  infrastructureIdentifiers,
  deploymentType,
  deploymentTemplateIdentifier,
  versionLabel,
  lazyInfrastructure
}: UseGetInfrastructuresDataProps): UseGetInfrastructuresDataReturn {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  // State
  const [infrastructuresList, setInfrastructuresList] = useState<InfrastructureYaml[]>([])
  const [infrastructuresData, setInfrastructuresData] = useState<InfrastructureData[]>([])
  const [nonExistingInfrastructureIdentifiers, setNonExistingInfrastructureIdentifiers] = useState<string[]>([])

  const {
    data: infrastructuresListResponse,
    error: infrastructuresListError,
    loading: loadingInfrastructuresList,
    refetch: refetchInfrastructuresList
  } = useGetInfrastructureList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      deploymentType,
      ...(deploymentTemplateIdentifier && {
        deploymentTemplateIdentifier,
        versionLabel
      })
    },
    lazy: lazyInfrastructure
  })

  const sortedInfrastructureIdentifiers = useMemo(
    () => [...infrastructureIdentifiers].sort(),
    [infrastructureIdentifiers]
  )

  const {
    data: infrastructuresDataResponse,
    error: infrastructuresDataError,
    initLoading: loadingInfrastructuresData,
    loading: updatingInfrastructuresData,
    refetch: refetchInfrastructuresData
  } = useMutateAsGet(useGetInfrastructureYamlAndRuntimeInputs, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    },
    body: { infrastructureIdentifiers: sortedInfrastructureIdentifiers },
    lazy: sortedInfrastructureIdentifiers.length === 0
  })

  const loading = loadingInfrastructuresList || loadingInfrastructuresData

  useEffect(() => {
    if (
      !loading &&
      (sortedInfrastructureIdentifiers?.length > 0 || infrastructuresListResponse?.data?.content?.length)
    ) {
      let _infrastructuresList: InfrastructureYaml[] = []
      let _infrastructuresData: InfrastructureData[] = []

      /* istanbul ignore else */
      if (infrastructuresListResponse?.data?.content?.length) {
        _infrastructuresList = infrastructuresListResponse.data.content.map(
          infrastructureResponse =>
            ({
              name: defaultTo(infrastructureResponse.infrastructure?.name, ''),
              identifier: defaultTo(infrastructureResponse.infrastructure?.identifier, ''),
              description: infrastructureResponse.infrastructure?.description,
              tags: infrastructureResponse.infrastructure?.tags

              // TODO: Remove this any when you have a clearly defined type for infrastructure
            } as any)
        )
      }

      const yamlMetadataList = infrastructuresDataResponse?.data?.infrastructureYamlMetadataList
      /* istanbul ignore else */
      if (yamlMetadataList?.length) {
        _infrastructuresData = yamlMetadataList.map(row => {
          const infrastructureYaml = defaultTo(row.infrastructureYaml, '{}')
          const infrastructureDefinition =
            yamlParse<Pick<InfrastructureData, 'infrastructureDefinition'>>(infrastructureYaml).infrastructureDefinition
          infrastructureDefinition.yaml = infrastructureYaml
          const infrastructureInputs = yamlParse<Pick<InfrastructureData, 'infrastructureInputs'>>(
            defaultTo(row.inputSetTemplateYaml, '{}')
          ).infrastructureInputs

          /* istanbul ignore else */
          if (infrastructureDefinition) {
            const existsInList = _infrastructuresList.find(
              infrastructureInList => infrastructureInList.identifier === row.infrastructureIdentifier
            )

            if (!existsInList) {
              _infrastructuresList.unshift(infrastructureDefinition)
            }
          }

          return { infrastructureDefinition, infrastructureInputs }
        })
      }

      setInfrastructuresList(_infrastructuresList)
      setInfrastructuresData(_infrastructuresData)

      if (!isEqual(_infrastructuresList, infrastructuresList)) {
        setInfrastructuresList(_infrastructuresList)
      }

      _infrastructuresData.sort((infrastructureData1, infrastructureData2) => {
        const id1 = infrastructureData1.infrastructureDefinition?.identifier
        const id2 = infrastructureData2.infrastructureDefinition?.identifier

        const index1 = infrastructureIdentifiers.indexOf(id1)
        const index2 = infrastructureIdentifiers.indexOf(id2)

        return index1 - index2
      })
      if (!isEqual(_infrastructuresData, infrastructuresData)) {
        setInfrastructuresData(_infrastructuresData)
      }

      const infrastructureListIdentifiers = _infrastructuresList.map(infraInList => infraInList.identifier)
      const _nonExistingInfrastructureIdentifiers = infrastructureIdentifiers.filter(
        infraInList => infraInList && infrastructureListIdentifiers.indexOf(infraInList) === -1
      )
      if (!isEqual(_nonExistingInfrastructureIdentifiers, nonExistingInfrastructureIdentifiers)) {
        setNonExistingInfrastructureIdentifiers(_nonExistingInfrastructureIdentifiers)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loading,
    infrastructuresListResponse?.data,
    infrastructuresDataResponse?.data?.infrastructureYamlMetadataList,
    sortedInfrastructureIdentifiers
  ])

  useEffect(() => {
    /* istanbul ignore else */
    if (infrastructuresListError?.message && shouldShowError(infrastructuresListError)) {
      const { code, failedPermissionChecks } = infrastructuresListError.data as AccessControlCheckError

      const environmentViewFailedPermssionCheck = failedPermissionChecks?.find(
        failedCheck => failedCheck.permission === PermissionIdentifier.VIEW_ENVIRONMENT
      )
      const isRbacError = code === 'NG_ACCESS_DENIED'

      // custom handling for environment view access error till rbac framework supports the change
      if (isRbacError && !isEmpty(environmentViewFailedPermssionCheck)) {
        showError(
          `Unable to list infrastructure(s). Missing view permissions on environment '${environmentViewFailedPermssionCheck?.resourceIdentifier}'`
        )
      } else {
        showError(getRBACErrorMessage(infrastructuresListError))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructuresListError])

  useEffect(() => {
    /* istanbul ignore else */
    if (infrastructuresDataError?.message) {
      /* istanbul ignore else */
      if (shouldShowError(infrastructuresDataError)) {
        showError(getRBACErrorMessage(infrastructuresDataError))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructuresDataError])

  const prependInfrastructureToInfrastructureList = useCallback((newInfrastructureInfo: InfrastructureYaml) => {
    setInfrastructuresList(previousInfrastructuresList => [
      newInfrastructureInfo,
      ...(previousInfrastructuresList || [])
    ])
  }, [])

  return {
    infrastructuresList,
    infrastructuresData,
    loadingInfrastructuresList,
    loadingInfrastructuresData,
    updatingInfrastructuresData,
    refetchInfrastructuresList,
    refetchInfrastructuresData,
    prependInfrastructureToInfrastructureList,
    nonExistingInfrastructureIdentifiers
  }
}
