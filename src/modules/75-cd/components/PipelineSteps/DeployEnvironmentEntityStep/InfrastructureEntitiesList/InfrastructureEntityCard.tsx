/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { defaultTo, isEmpty, isNil, pick } from 'lodash-es'
import { Collapse } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { Color } from '@harness/design-system'
import {
  ButtonVariation,
  Card,
  Text,
  AllowedTypes,
  Container,
  Layout,
  TagsPopover,
  Button,
  ButtonSize,
  Icon
} from '@harness/uicore'

import { Draggable } from 'react-beautiful-dnd'
import { useStrings } from 'framework/strings'
import type { EntityGitDetails, Infrastructure } from 'services/cd-ng'

import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { infraDefinitionTypeMapping } from '@pipeline/utils/stageHelpers'

import { StoreMetadata } from '@modules/10-common/constants/GitSyncTypes'
import GitRemoteDetails from '@modules/10-common/components/GitRemoteDetails/GitRemoteDetails'
import type { DeployEnvironmentEntityFormState, InfrastructureData } from '../types'

import css from './InfrastructureEntitiesList.module.scss'

export interface InfrastructureEntityCardProps extends InfrastructureData {
  readonly: boolean
  allowableTypes: AllowedTypes
  onEditClick: (infrastructure: InfrastructureData) => void
  onDeleteClick: (infrastructure: InfrastructureData) => void
  environmentIdentifier: string
  environmentPermission?: ButtonProps['permission']
  infrastructureIndex: number
  totalLength?: number
  entityGitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
}

export function InfrastructureEntityCard({
  infrastructureDefinition,
  infrastructureInputs,
  entityGitDetails,
  storeMetadata = {},
  readonly,
  allowableTypes,
  onEditClick,
  onDeleteClick,
  environmentIdentifier,
  environmentPermission,
  infrastructureIndex,
  totalLength
}: InfrastructureEntityCardProps): React.ReactElement {
  const { getString } = useStrings()
  const { values } = useFormikContext<DeployEnvironmentEntityFormState>()
  const { name, identifier, tags } = infrastructureDefinition
  const [showInputs, setShowInputs] = useState(false)
  const { storeType, connectorRef } = storeMetadata

  function toggle(): void {
    setShowInputs(show => !show)
  }

  const onlyProvisionerInput = React.useMemo(() => {
    const inputsKeys = Object.keys(defaultTo(infrastructureInputs?.spec, {}))
    return inputsKeys.length === 1 && inputsKeys.includes('provisioner')
  }, [infrastructureInputs])

  const isPropagating = useMemo(() => {
    return !isNil(values.propagateFrom)
  }, [values.propagateFrom])

  return (
    <Draggable draggableId={identifier} index={infrastructureIndex} isDragDisabled={readonly}>
      {provided => {
        return (
          <div {...provided.draggableProps} ref={provided.innerRef} style={{ ...provided.draggableProps.style }}>
            <Card className={css.card}>
              {!readonly && totalLength && totalLength > 1 && (
                <Layout.Horizontal className={css.dragHandle} flex={{ justifyContent: 'center' }}>
                  <Icon name="drag-handle-horizontal" {...provided.dragHandleProps} />
                </Layout.Horizontal>
              )}
              <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Layout.Vertical width={'90%'}>
                  <Layout.Horizontal
                    flex={{ justifyContent: 'space-between', alignItems: 'flex-end' }}
                    spacing="small"
                    margin={{ bottom: 'xsmall' }}
                  >
                    <Text color={Color.PRIMARY_7}>{name}</Text>
                    {!isEmpty(tags) && (
                      <TagsPopover iconProps={{ size: 14, color: Color.GREY_600 }} tags={defaultTo(tags, {})} />
                    )}

                    {storeType === 'REMOTE' ? (
                      <GitRemoteDetails
                        connectorRef={connectorRef}
                        repoName={entityGitDetails?.repoName}
                        branch={entityGitDetails?.branch}
                        filePath={entityGitDetails?.filePath}
                        fileUrl={entityGitDetails?.fileUrl}
                        flags={{
                          readOnly: true,
                          showBranch: true,
                          borderless: true
                        }}
                      />
                    ) : null}
                  </Layout.Horizontal>

                  <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
                    {getString('common.ID')}: {identifier}
                  </Text>
                </Layout.Vertical>

                <Container>
                  {!isPropagating && (
                    <React.Fragment>
                      <RbacButton
                        variation={ButtonVariation.ICON}
                        icon="edit"
                        data-testid={`edit-infrastructure-${identifier}`}
                        disabled={readonly}
                        onClick={() =>
                          onEditClick({
                            infrastructureDefinition,
                            infrastructureInputs,
                            ...pick(storeMetadata, ['storeType', 'connectorRef']),
                            entityGitDetails
                          })
                        }
                        permission={environmentPermission}
                      />
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="remove-minus"
                        data-testid={`delete-infrastructure-${identifier}`}
                        disabled={readonly}
                        onClick={() => onDeleteClick({ infrastructureDefinition, infrastructureInputs })}
                      />
                    </React.Fragment>
                  )}
                </Container>
              </Layout.Horizontal>
              {!onlyProvisionerInput &&
              infrastructureInputs &&
              values.infrastructureInputs?.[environmentIdentifier]?.[identifier] ? (
                <>
                  <Container flex={{ justifyContent: 'center' }}>
                    <Button
                      icon={showInputs ? 'chevron-up' : 'chevron-down'}
                      data-testid="toggle-infrastructure-inputs"
                      text={getString(
                        showInputs
                          ? 'cd.pipelineSteps.environmentTab.hideInfrastructureInputs'
                          : 'cd.pipelineSteps.environmentTab.viewInfrastructureInputs'
                      )}
                      variation={ButtonVariation.LINK}
                      size={ButtonSize.SMALL}
                      onClick={toggle}
                    />
                  </Container>
                  <Collapse keepChildrenMounted={false} isOpen={showInputs}>
                    <Container border={{ top: true }} margin={{ top: 'medium' }} padding={{ top: 'large' }}>
                      <Text
                        color={Color.GREY_800}
                        font={{ size: 'normal', weight: 'bold' }}
                        margin={{ bottom: 'medium' }}
                      >
                        {getString('common.infrastructureInputs')}
                      </Text>
                      <StepWidget<Infrastructure>
                        key={`${environmentIdentifier}_${identifier}`}
                        factory={factory}
                        template={infrastructureInputs.spec}
                        initialValues={{
                          ...(values.infrastructureInputs?.[environmentIdentifier]?.[identifier]?.spec || {}),
                          environmentRef: environmentIdentifier,
                          infrastructureRef: identifier
                        }}
                        allowableTypes={allowableTypes}
                        allValues={{
                          environmentRef: environmentIdentifier,
                          infrastructureRef: identifier
                        }}
                        type={
                          (infraDefinitionTypeMapping[infrastructureInputs.type as StepType] ||
                            infrastructureInputs?.type) as StepType
                        }
                        path={`infrastructureInputs.['${environmentIdentifier}'].${identifier}.spec`}
                        readonly={readonly || isPropagating}
                        stepViewType={StepViewType.TemplateUsage}
                        customStepProps={{
                          // serviceRef: deploymentStage?.service?.serviceRef,
                          environmentRef: environmentIdentifier,
                          infrastructureRef: identifier,
                          gitMetadata: {
                            storeType,
                            connectorRef,
                            ...pick(entityGitDetails, ['repoName', 'branch'])
                          }
                        }}
                      />
                    </Container>
                  </Collapse>
                </>
              ) : null}
            </Card>
          </div>
        )
      }}
    </Draggable>
  )
}
