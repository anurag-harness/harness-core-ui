/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { isNil, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import produce from 'immer'

import {
  AllowedTypes,
  ButtonSize,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  ModalDialog,
  MultiTypeInputType,
  SelectOption,
  useToggleOpen
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type { EnvironmentYaml } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { isMultiTypeExpression, isMultiTypeFixed } from '@common/utils/utils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'

import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { getAllowableTypesWithoutExpression } from '@pipeline/utils/runPipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { MultiTypeEnvironmentField } from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { DeployEnvironmentEntityFormState } from '../types'
import AddEditEnvironmentModal from '../AddEditEnvironmentModal'

import css from './DeployEnvironment.module.scss'

interface EnvironmentSelectionProps {
  isMultiEnvironment: boolean
  isUnderEnvGroup?: boolean
  uniquePathForEnvironments: React.MutableRefObject<string>
  readonly: boolean
  loading: boolean
  environmentsType: MultiTypeInputType
  setEnvironmentsType: React.Dispatch<React.SetStateAction<MultiTypeInputType>>
  setSelectedEnvironments: React.Dispatch<React.SetStateAction<string[]>>
  allowableTypes: AllowedTypes
  gitOpsEnabled: boolean
  environmentsList: EnvironmentYaml[]
  prependEnvironmentToEnvironmentList(newEnvironmentInfo: EnvironmentYaml): void
  updateFormikAndLocalState(newFormValues: DeployEnvironmentEntityFormState): void
  canPropagateFromStage?: boolean
  isServiceOverridesEnabled?: boolean
}

function getSelectedEnvironmentsFromOptions(items: SelectOption | SelectOption[]): string[] {
  if (Array.isArray(items)) {
    return items.map(item => item.value as string)
    /** If single environment, then items should contain some value.
     * If it's empty or runtime or expression return empty array */
  } else if (items && getMultiTypeFromValue(items) === MultiTypeInputType.FIXED) {
    return [items.value as string]
  }

  return []
}

export default function EnvironmentSelection({
  isMultiEnvironment,
  isUnderEnvGroup,
  uniquePathForEnvironments,
  readonly,
  loading,
  environmentsType,
  setEnvironmentsType,
  setSelectedEnvironments,
  allowableTypes,
  gitOpsEnabled,
  environmentsList,
  prependEnvironmentToEnvironmentList,
  updateFormikAndLocalState,
  canPropagateFromStage,
  isServiceOverridesEnabled
}: EnvironmentSelectionProps): React.ReactElement {
  const { getString } = useStrings()
  const { CDS_OrgAccountLevelServiceEnvEnvGroup } = useFeatureFlags()
  const { isOpen: isAddNewModalOpen, open: openAddNewModal, close: closeAddNewModal } = useToggleOpen()
  const { expressions } = useVariablesExpression()
  const { values, setFieldValue, setFieldTouched } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const isFixed = isMultiTypeFixed(environmentsType)

  const disabled = readonly || (isFixed && loading)

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(environmentsList)) {
      return environmentsList.map(environment => ({ label: environment.name, value: environment.identifier }))
    }

    return []
  }, [environmentsList])

  let placeHolderForEnvironments =
    Array.isArray(values.environments) && values.environments
      ? getString('environments')
      : isUnderEnvGroup
      ? getString('common.allEnvironments')
      : getString('cd.pipelineSteps.environmentTab.selectEnvironments')

  if (loading) {
    placeHolderForEnvironments = getString('loading')
  }

  const placeHolderForEnvironment = loading
    ? getString('loading')
    : getString('cd.pipelineSteps.environmentTab.selectEnvironment')

  const commonProps = {
    name: isMultiEnvironment ? uniquePathForEnvironments.current : 'environment',
    tooltipProps: isMultiEnvironment
      ? { dataTooltipId: 'specifyYourEnvironments' }
      : { dataTooltipId: 'specifyYourEnvironment' },
    label: isMultiEnvironment
      ? getString('cd.pipelineSteps.environmentTab.specifyYourEnvironments')
      : getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment'),
    disabled: disabled
  }

  const updateEnvironmentsList = (newEnvironmentInfo: EnvironmentYaml): void => {
    prependEnvironmentToEnvironmentList(newEnvironmentInfo)
    closeAddNewModal()

    const scopedEnvRef = getScopedValueFromDTO({
      projectIdentifier,
      orgIdentifier,
      identifier: newEnvironmentInfo.identifier
    })

    const newFormValues = produce(values, draft => {
      if (draft.environments && Array.isArray(draft.environments)) {
        draft.environments.push({ label: newEnvironmentInfo.name, value: scopedEnvRef })
        if (gitOpsEnabled && draft.clusters) {
          if (draft.infrastructures) {
            delete draft.infrastructures
          }
        } else if (!gitOpsEnabled && draft.infrastructures) {
          if (draft.clusters) {
            delete draft.clusters
          }
        }
        set(draft, uniquePathForEnvironments.current, draft.environments)
      } else {
        draft.environment = scopedEnvRef
        if (gitOpsEnabled) {
          draft.cluster = ''
        } else {
          draft.infrastructure = ''
        }
      }
    })

    updateFormikAndLocalState(newFormValues)
  }

  const onMultiSelectChangeForEnvironments = (items: SelectOption[]): void => {
    setFieldTouched(uniquePathForEnvironments.current, true)
    if (items?.at(0)?.value === 'All') {
      setFieldValue(`environments`, undefined)
      setSelectedEnvironments([])
    } else {
      setFieldValue(`environments`, items)
      setSelectedEnvironments(getSelectedEnvironmentsFromOptions(items))
    }
  }

  return (
    <Layout.Horizontal
      spacing="medium"
      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
      className={canPropagateFromStage ? css.mainContent : css.inputField}
      margin={{ bottom: isMultiEnvironment ? 'medium' : 'none' }}
    >
      {isMultiEnvironment ? (
        CDS_OrgAccountLevelServiceEnvEnvGroup && !isUnderEnvGroup ? (
          /*** This condition is added as entities one step down the entity tree
                will be following the parent scope so no need of the new component here ***/
          <MultiTypeEnvironmentField
            {...commonProps}
            placeholder={placeHolderForEnvironments}
            openAddNewModal={openAddNewModal}
            isMultiSelect
            onMultiSelectChange={onMultiSelectChangeForEnvironments}
            multitypeInputValue={environmentsType}
            isNewConnectorLabelVisible
            onChange={item => {
              onMultiSelectChangeForEnvironments(item as SelectOption[])
            }}
            width={300}
            multiTypeProps={{
              expressions,
              onTypeChange: setEnvironmentsType,
              allowableTypes: getAllowableTypesWithoutExpression(allowableTypes)
            }}
          />
        ) : (
          <FormMultiTypeMultiSelectDropDown
            {...commonProps}
            dropdownProps={{
              placeholder: placeHolderForEnvironments,
              items: selectOptions,
              // Field disabled
              disabled,
              isAllSelectionSupported: isUnderEnvGroup
            }}
            onChange={onMultiSelectChangeForEnvironments}
            multiTypeProps={{
              onTypeChange: setEnvironmentsType,
              width: 280,
              allowableTypes: getAllowableTypesWithoutExpression(allowableTypes)
            }}
          />
        )
      ) : CDS_OrgAccountLevelServiceEnvEnvGroup ? (
        <MultiTypeEnvironmentField
          {...commonProps}
          placeholder={placeHolderForEnvironment}
          setRefValue={true}
          openAddNewModal={openAddNewModal}
          isNewConnectorLabelVisible
          onChange={(item, _valueType, type) => {
            if (isMultiTypeExpression(type as MultiTypeInputType)) {
              setSelectedEnvironments([])
            } else if (getMultiTypeFromValue(item) === MultiTypeInputType.FIXED && (item as string)?.length) {
              setSelectedEnvironments([item as string])
            } else setSelectedEnvironments([])
          }}
          width={300}
          multiTypeProps={{
            onTypeChange: setEnvironmentsType,
            expressions,
            allowableTypes: gitOpsEnabled ? getAllowableTypesWithoutExpression(allowableTypes) : allowableTypes,
            defaultValueToReset: ''
          }}
        />
      ) : (
        <FormInput.MultiTypeInput
          {...commonProps}
          useValue
          placeholder={placeHolderForEnvironment}
          multiTypeInputProps={{
            onTypeChange: setEnvironmentsType,
            width: 300,
            selectProps: { items: selectOptions },
            allowableTypes: gitOpsEnabled ? getAllowableTypesWithoutExpression(allowableTypes) : allowableTypes,
            defaultValueToReset: '',
            onChange: item => {
              setSelectedEnvironments(getSelectedEnvironmentsFromOptions(item as SelectOption))
            },
            expressions
          }}
          selectItems={selectOptions}
        />
      )}
      {isFixed && !isUnderEnvGroup && (
        <RbacButton
          margin={{ top: 'xlarge' }}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          disabled={readonly}
          onClick={openAddNewModal}
          permission={{
            resource: {
              resourceType: ResourceType.ENVIRONMENT
            },
            permission: PermissionIdentifier.EDIT_ENVIRONMENT
          }}
          text={getString('common.plusNewName', { name: getString('environment') })}
          id={'add-new-environment'}
        />
      )}

      <ModalDialog
        isOpen={isAddNewModalOpen}
        onClose={closeAddNewModal}
        title={getString('newEnvironment')}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        enforceFocus={false}
        lazy
        width={1128}
        height={isServiceOverridesEnabled ? 600 : 840}
        className={css.dialogStyles}
      >
        <AddEditEnvironmentModal
          data={{}}
          onCreateOrUpdate={updateEnvironmentsList}
          closeModal={closeAddNewModal}
          isEdit={false}
          isServiceOverridesEnabled={isServiceOverridesEnabled}
        />
      </ModalDialog>
    </Layout.Horizontal>
  )
}
