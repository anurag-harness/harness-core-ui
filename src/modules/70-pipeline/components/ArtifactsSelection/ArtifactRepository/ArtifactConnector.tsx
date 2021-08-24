import React, { useCallback } from 'react'
import {
  Text,
  Formik,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  ButtonVariation
} from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { set } from 'lodash-es'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useQueryParams } from '@common/hooks'
import { ArtifactConnectorLabelMap, ArtifactToConnectorMap } from '../ArtifactHelper'
import type { ArtifactType, InitialArtifactDataType } from '../ArtifactInterface'

import css from './ArtifactConnector.module.scss'
interface ArtifactConnectorProps {
  handleViewChange: () => void
  expressions: string[]
  stepName: string
  isReadonly: boolean
  initialValues: InitialArtifactDataType
  selectedArtifact: ArtifactType | null
}

export const ArtifactConnector: React.FC<StepProps<ConnectorConfigDTO> & ArtifactConnectorProps> = props => {
  const {
    handleViewChange,
    previousStep,
    prevStepData,
    nextStep,
    initialValues,
    stepName,
    expressions,
    selectedArtifact,
    isReadonly
  } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()

  const connectorType = ArtifactToConnectorMap[selectedArtifact as ArtifactType]
  const selectedConnectorLabel = ArtifactConnectorLabelMap[selectedArtifact as ArtifactType]

  const newConnectorLabel = `${getString('newLabel')} ${selectedConnectorLabel} ${getString('connector')}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  const primarySchema = Yup.object().shape({
    connectorId: Yup.string()
      .trim()
      .required(`${connectorType} ${getString('pipelineSteps.build.create.connectorRequiredError')}`)
  })

  const submitFirstStep = async (formData: any): Promise<void> => {
    nextStep?.({ ...formData })
  }
  const getInitialValues = useCallback((): InitialArtifactDataType => {
    if (prevStepData?.connectorId !== undefined) {
      set(initialValues, 'connectorId', prevStepData?.connectorId)
    }
    return initialValues
  }, [initialValues, prevStepData?.connectorId])

  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep}>
      <div className={css.heading}>{stepName}</div>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={primarySchema}
        formName="artifactConnForm"
        onSubmit={formData => {
          submitFirstStep(formData)
        }}
      >
        {formik => (
          <Form>
            <div className={css.connectorForm}>
              <div className={css.connectorContainer}>
                <FormMultiTypeConnectorField
                  name="connectorId"
                  label={
                    <Text style={{ marginBottom: 8 }}>{`${selectedConnectorLabel} ${getString('connector')}`}</Text>
                  }
                  placeholder={`${getString('select')} ${selectedConnectorLabel} ${getString('connector')}`}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={410}
                  multiTypeProps={{ expressions }}
                  isNewConnectorLabelVisible={false}
                  type={connectorType}
                  enableConfigureOptions={false}
                  selected={formik?.values?.connectorId}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.connectorId) === MultiTypeInputType.RUNTIME ? (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      value={formik.values.connectorId as unknown as string}
                      type={connectorType}
                      variableName="connectorRef"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('connectorId', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                ) : (
                  <Button
                    variation={ButtonVariation.LINK}
                    id="new-artifact-connector"
                    text={newConnectorLabel}
                    icon="plus"
                    disabled={isReadonly || !canCreate}
                    onClick={() => {
                      handleViewChange()
                      nextStep?.()
                    }}
                    className={css.addNewArtifact}
                  />
                )}
              </div>
            </div>
            <Layout.Horizontal spacing="xxlarge">
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                onClick={() => previousStep?.(prevStepData)}
              />
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('continue')}
                rightIcon="chevron-right"
                disabled={
                  getMultiTypeFromValue(formik.values.connectorId) === MultiTypeInputType.FIXED &&
                  !(formik.values.connectorId as ConnectorSelectedValue)?.connector
                }
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
