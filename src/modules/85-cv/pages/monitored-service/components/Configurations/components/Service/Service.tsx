/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useRef } from 'react'
import { defaultTo, noop } from 'lodash-es'
import * as Yup from 'yup'
import type { FormikContextType } from 'formik'
import { useParams } from 'react-router-dom'
import { Container, Formik, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ChangeSourceDTO, MonitoredServiceDTO } from 'services/cv'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import { ChangeSourceDrawer } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer'
import type { MonitoredServiceConfig } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.types'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import SaveAndDiscardButton from '@cv/components/SaveAndDiscardButton/SaveAndDiscardButton'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { MonitoredServiceForm } from './Service.types'
import {
  getIsChangeSrcSectionHidden,
  getIsHealthSrcSectionHidden,
  getIsNotifcationsSectionHidden,
  onSave,
  shouldShowSaveAndDiscard,
  updateMonitoredServiceDTOOnTypeChange
} from './Service.utils'
import { getImperativeHandleRef, isUpdated } from '../../Configurations.utils'
import CommonMonitoredServiceConfigurations from './components/CommonMonitoredServiceConfigurations/CommonMonitoredServiceConfigurations'
import ChangeSourceTableContainer from './components/ChangeSourceTableContainer/ChangeSourceTableContainer'
import MonitoredServiceNotificationsContainer from './components/MonitoredServiceNotificationsContainer/MonitoredServiceNotificationsContainer'
import HealthSourceTableContainer from './components/HealthSourceTableContainer/HealthSourceTableContainer'
import MonitoredServiceOverview from './components/MonitoredServiceOverview/MonitoredServiceOverview'
import css from './Service.module.scss'

function Service(
  {
    value: initialValues,
    onSuccess,
    onDependencySuccess,
    cachedInitialValues,
    setDBData,
    onDiscard,
    serviceTabformRef,
    onChangeMonitoredServiceType,
    isTemplate,
    expressions,
    updateTemplate,
    config,
    dependencyTabformRef
  }: {
    value: MonitoredServiceForm
    onSuccess: (val: MonitoredServiceForm) => Promise<void>
    onDependencySuccess: (val: MonitoredServiceForm) => Promise<void>
    cachedInitialValues?: MonitoredServiceForm | null
    setDBData?: (val: MonitoredServiceForm) => void
    onDiscard?: () => void
    serviceTabformRef?: any
    onChangeMonitoredServiceType: (updatedValues: MonitoredServiceForm) => void
    isTemplate?: boolean
    updateTemplate?: (template: MonitoredServiceForm) => void
    expressions?: string[]
    config?: MonitoredServiceConfig
    dependencyTabformRef?: unknown
  },
  formikRef?: TemplateFormRef
): JSX.Element {
  const { getString } = useStrings()
  const { identifier, serviceIdentifier, environmentIdentifier } = useParams<
    ProjectPathProps & { identifier: string; serviceIdentifier?: string; environmentIdentifier?: string }
  >()
  const isEdit = !!identifier
  const ref = useRef<any | null>()
  const { SRM_COMMON_MONITORED_SERVICE } = useFeatureFlags()
  const isChangeSrcSectionHidden = getIsChangeSrcSectionHidden(config, identifier)
  const isHealthSrcSectionHidden = getIsHealthSrcSectionHidden(config, identifier)
  const { projectIdentifier } = useParams<ProjectPathProps & { identifier: string }>()
  const isNotificationsSectionHidden = getIsNotifcationsSectionHidden(isTemplate, config, identifier)

  React.useImperativeHandle(getImperativeHandleRef(isTemplate, formikRef), () => ({
    resetForm() {
      return ref?.current?.resetForm()
    },
    submitForm() {
      return ref?.current?.submitForm()
    },
    getErrors() {
      return defaultTo(ref?.current.errors, {})
    }
  }))

  const updateChangeSource = useCallback(
    (data: any, formik: FormikContextType<MonitoredServiceForm>): void => {
      formik.setFieldValue('sources', {
        ...formik.values?.sources,
        changeSources: data
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit]
  )

  const createChangeSourceDrawerHeader = useCallback(() => {
    return (
      <>
        <Text
          className={css.breadCrumbLink}
          icon={'arrow-left'}
          iconProps={{ color: Color.PRIMARY_7, margin: { right: 'small' } }}
          color={Color.PRIMARY_7}
          onClick={() => hideDrawer()}
        >
          {getString('cv.healthSource.backtoMonitoredService')}
        </Text>
        <div className="ng-tooltip-native">
          <p>{isEdit ? getString('cv.changeSource.editChangeSource') : getString('cv.changeSource.addChangeSource')}</p>
        </div>
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  const { showDrawer, hideDrawer } = useDrawer({
    createHeader: createChangeSourceDrawerHeader,
    createDrawerContent: props => <ChangeSourceDrawer {...props} />
  })

  const openChangeSourceDrawer = useCallback(
    async ({
      formik,
      onSuccessChangeSource
    }: {
      formik: FormikContextType<MonitoredServiceForm>
      onSuccessChangeSource: (data: ChangeSourceDTO[]) => void
    }) => {
      // has required fields
      if (formik?.values.environmentRef && formik?.values.serviceRef && formik?.values.name) {
        showDrawer({
          hideDrawer,
          tableData: formik?.values?.sources?.changeSources || [],
          onSuccess: onSuccessChangeSource,
          monitoredServiceType: formik.values.type
        })
      } else {
        formik.submitForm()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <Formik<MonitoredServiceForm>
      formName="MonitoredServiceForm"
      initialValues={cachedInitialValues || initialValues}
      onSubmit={noop}
      validationSchema={Yup.object().shape({
        name: Yup.string().nullable().required(getString('cv.monitoredServices.nameValidation')),
        type: Yup.string().nullable().required(getString('common.validation.typeIsRequired')),
        serviceRef: Yup.string().nullable().required(getString('cv.monitoredServices.serviceValidation')),
        environmentRef: Yup.string().nullable().required(getString('cv.monitoredServices.environmentValidation'))
      })}
      enableReinitialize
    >
      {formik => {
        serviceTabformRef.current = formik
        ref.current = formik
        if (formik.dirty && !isTemplate) {
          setDBData?.(formik.values)
        }
        const onSuccessChangeSource = (data: ChangeSourceDTO[]): void => {
          updateChangeSource(data, formik)
          formik.setFieldValue('sources', {
            ...formik.values?.sources,
            changeSources: data
          })
          if (!isTemplate) {
            onSave({
              formik: {
                ...formik,
                values: {
                  ...(formik?.values || {}),
                  sources: { ...(formik?.values?.sources || {}), changeSources: data }
                }
              },
              onSuccess
            })
          }
          hideDrawer()
        }
        if (isTemplate && formik.dirty) {
          updateTemplate?.(formik.values)
        }

        if (SRM_COMMON_MONITORED_SERVICE) {
          return (
            <CommonMonitoredServiceConfigurations
              config={config}
              identifier={identifier}
              hideDrawer={hideDrawer}
              showDrawer={showDrawer}
              openChangeSourceDrawer={openChangeSourceDrawer}
              onSuccessChangeSource={onSuccessChangeSource}
              isTemplate={isTemplate}
              expressions={expressions}
              onSuccess={onSuccess}
              initialValues={initialValues}
              isEdit={isEdit}
              onChangeMonitoredServiceType={onChangeMonitoredServiceType}
              onDiscard={onDiscard}
              cachedInitialValues={cachedInitialValues}
              setDBData={setDBData}
              dependencyTabformRef={dependencyTabformRef}
              onDependencySuccess={onDependencySuccess}
            />
          )
        } else {
          return (
            <>
              <Container className={css.saveDiscardButton}>
                {shouldShowSaveAndDiscard(isTemplate) ? (
                  <SaveAndDiscardButton
                    isUpdated={isUpdated(formik.dirty, initialValues, cachedInitialValues)}
                    onSave={() => onSave({ formik, onSuccess })}
                    onDiscard={() => {
                      formik.resetForm()
                      onDiscard?.()
                    }}
                    RbacPermission={{
                      permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                      resource: {
                        resourceType: ResourceType.MONITOREDSERVICE,
                        resourceIdentifier: projectIdentifier
                      }
                    }}
                  />
                ) : null}
              </Container>
              <MonitoredServiceOverview
                formikProps={formik}
                isEdit={isEdit}
                onChangeMonitoredServiceType={(type: MonitoredServiceDTO['type']) => {
                  if (type === formik.values.type) {
                    return
                  }
                  formik.setFieldValue('type', type)
                  onChangeMonitoredServiceType({
                    isEdit,
                    ...updateMonitoredServiceDTOOnTypeChange(type, formik.values)
                  })
                }}
                config={config}
                serviceIdentifier={serviceIdentifier}
                environmentIdentifier={environmentIdentifier}
              />
              {!isHealthSrcSectionHidden || !isChangeSrcSectionHidden ? (
                <Text color={Color.BLACK} className={css.sourceTableLabel}>
                  {getString('cv.healthSource.defineYourSource')}
                </Text>
              ) : null}
              {isChangeSrcSectionHidden ? null : (
                <ChangeSourceTableContainer
                  onEdit={values => {
                    showDrawer({ ...values, hideDrawer })
                  }}
                  onAddNewChangeSource={() => {
                    openChangeSourceDrawer({ formik, onSuccessChangeSource })
                  }}
                  value={formik.values?.sources?.changeSources}
                  onSuccess={onSuccessChangeSource}
                />
              )}
              {isHealthSrcSectionHidden ? null : (
                <HealthSourceTableContainer
                  healthSourceListFromAPI={initialValues.sources?.healthSources}
                  serviceFormFormik={formik}
                  isTemplate={isTemplate}
                  expressions={expressions}
                  onSave={data => {
                    onSave({
                      formik: {
                        ...formik,
                        values: {
                          ...(formik?.values || {}),
                          sources: { ...formik.values?.sources, healthSources: data }
                        }
                      },
                      onSuccess
                    })
                  }}
                />
              )}
              {isNotificationsSectionHidden ? null : (
                <MonitoredServiceNotificationsContainer
                  setFieldValue={formik?.setFieldValue}
                  notificationRuleRefs={formik?.values?.notificationRuleRefs}
                  identifier={identifier}
                />
              )}
            </>
          )
        }
      }}
    </Formik>
  )
}

export default Service
export const ServiceWithRef = React.forwardRef(Service)
