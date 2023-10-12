/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useEffect } from 'react'
import { Intent, Spinner } from '@blueprintjs/core'
import { parse } from 'yaml'
import cx from 'classnames'
import { clone, defaultTo, set } from 'lodash-es'

import { AllowedTypes, ConfirmationDialog, ModalDialog, SelectOption, useToggleOpen } from '@harness/uicore'

import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { useFormikContext } from 'formik'
import produce from 'immer'
import { useStrings } from 'framework/strings'

import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import type {
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState,
  EnvironmentData
} from '../types'
import AddEditEnvironmentModal from '../AddEditEnvironmentModal'
import { EnvironmentEntityCard } from './EnvironmentEntityCard/EnvironmentEntityCard'

import { getAllFixedEnvironments } from '../utils/utils'
import css from './EnvironmentEntitiesList.module.scss'

export interface EnvironmentEntitiesListProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  loading: boolean
  environmentsData: EnvironmentData[]
  readonly: boolean
  allowableTypes: AllowedTypes
  onEnvironmentEntityUpdate: () => void
  onRemoveEnvironmentFromList: (id: string) => void
  initialValues: DeployEnvironmentEntityFormState
  setSelectedEnvironments?: Dispatch<SetStateAction<string[]>>
  isServiceOverridesEnabled?: boolean
}

export default function EnvironmentEntitiesList({
  loading,
  environmentsData,
  readonly,
  allowableTypes,
  onEnvironmentEntityUpdate,
  onRemoveEnvironmentFromList,
  serviceIdentifiers,
  stageIdentifier,
  deploymentType,
  customDeploymentRef,
  gitOpsEnabled,
  initialValues,
  setSelectedEnvironments,
  isServiceOverridesEnabled
}: EnvironmentEntitiesListProps): React.ReactElement {
  const { getString } = useStrings()
  const { values, setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()

  const [environmentToEdit, setEnvironmentToEdit] = React.useState<EnvironmentData | null>(null)
  const [environmentToDelete, setEnvironmentToDelete] = React.useState<EnvironmentData | null>(null)

  const {
    isOpen: isDeleteConfirmationOpen,
    open: openDeleteConfirmation,
    close: closeDeleteConfirmation
  } = useToggleOpen()

  useEffect(() => {
    if (environmentToDelete) {
      openDeleteConfirmation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentToDelete])

  const handleDeleteConfirmation = (confirmed: boolean): void => {
    if (environmentToDelete && confirmed) {
      onRemoveEnvironmentFromList(getScopedValueFromDTO(environmentToDelete.environment))
    }
    setEnvironmentToDelete(null)
    closeDeleteConfirmation()
  }

  const closeEditModal = (): void => {
    setEnvironmentToEdit(null)
  }

  const handleEnvironmentEntityUpdate = (): void => {
    closeEditModal()
    onEnvironmentEntityUpdate()
  }

  function onDragEnd(result: DropResult): void {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    if (sourceIndex === destinationIndex) return

    const environmentsList = clone(values.environments) as SelectOption[]
    const itemToMove = environmentsList.splice(sourceIndex, 1)
    environmentsList.splice(destinationIndex, 0, itemToMove[0])

    setFieldValue('environments', environmentsList)

    setSelectedEnvironments &&
      setSelectedEnvironments(
        getAllFixedEnvironments(
          produce(values, draft => {
            set(draft, `environments`, environmentsList)
          })
        )
      )
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'environmentDropper'}>
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cx(css.cardsContainer, { [css.draggingOver]: snapshot.isDraggingOver })}
              >
                {environmentsData.map((row, index: number) => {
                  return (
                    <EnvironmentEntityCard
                      key={row.environment.identifier}
                      environment={row.environment}
                      environmentInputs={row.environmentInputs}
                      serviceOverrideInputs={row.serviceOverrideInputs}
                      onDeleteClick={setEnvironmentToDelete}
                      onEditClick={setEnvironmentToEdit}
                      allowableTypes={allowableTypes}
                      readonly={readonly}
                      stageIdentifier={stageIdentifier}
                      gitOpsEnabled={gitOpsEnabled}
                      deploymentType={deploymentType}
                      customDeploymentRef={customDeploymentRef}
                      initialValues={initialValues}
                      serviceIdentifiers={serviceIdentifiers}
                      envIndex={index}
                      totalLength={environmentsData?.length}
                    />
                  )
                })}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </DragDropContext>

      <ModalDialog
        isOpen={!!environmentToEdit}
        onClose={closeEditModal}
        title={getString('editEnvironment')}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        enforceFocus={false}
        lazy
        width={1128}
        height={isServiceOverridesEnabled ? 600 : 840}
        className={css.dialogStyles}
      >
        <AddEditEnvironmentModal
          data={{
            ...parse(defaultTo(environmentToEdit?.environment?.yaml, '{}'))
          }}
          onCreateOrUpdate={handleEnvironmentEntityUpdate}
          closeModal={closeEditModal}
          isEdit={true}
          isServiceOverridesEnabled={isServiceOverridesEnabled}
        />
      </ModalDialog>

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        titleText={getString('cd.pipelineSteps.environmentTab.deleteEnvironmentFromListDialogTitleText')}
        contentText={getString('cd.pipelineSteps.environmentTab.deleteEnvironmentFromListConfirmationText', {
          name: environmentToDelete?.environment.name
        })}
        confirmButtonText={getString('common.remove')}
        cancelButtonText={getString('cancel')}
        onClose={handleDeleteConfirmation}
        intent={Intent.WARNING}
      />
    </>
  )
}
