/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Container,
  FormInput,
  FormikForm,
  Layout,
  Switch,
  Text,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import classNames from 'classnames'
import { useParams } from 'react-router-dom'
import NetworkMap from '@discovery/images/NetworkMap.svg'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormConnectorReferenceField } from '@platform/connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import List from '@discovery/components/List/List'
import { DatabaseK8sConnectorRequest, useCreateAgent } from 'services/servicediscovery'
import NumberedList from '@discovery/components/NumberedList/NumberedList'
import SchedulePanel from '@common/components/SchedulePanel/SchedulePanel'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ExpressionBreakdownInterface, getBreakdownValues } from '@common/components/SchedulePanel/components/utils'
import css from './CreateDAgent.module.scss'

interface FormValues extends ExpressionBreakdownInterface {
  discoveryAgentName: string
  discoveryNamespace: string
  nodeAgentSelector: string
  detectNetworkTrace?: boolean
  blacklistedNamespaces?: string[]
  duration: number | undefined
  connectorRef: string | undefined
  identifier: string | undefined
}

export interface DrawerProps {
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  refetchDAgent?: () => void
}

const CreateDAgent: React.FC<DrawerProps> = /* istanbul ignore next */ ({ setDrawerOpen, refetchDAgent }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [isNetworkTraceDetected, setIsNetworkTraceDetected] = React.useState<boolean>(false)
  const dAgentFormRef = React.useRef<FormikProps<FormValues>>()

  const { mutate: infraMutate } = useCreateAgent({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const initialCronExpression = '0/15 * * * *'

  const initialValues: FormValues = {
    discoveryAgentName: '',
    discoveryNamespace: '',
    nodeAgentSelector: '',
    connectorRef: undefined,
    identifier: undefined,
    expression: initialCronExpression,
    ...getBreakdownValues(initialCronExpression),
    duration: 5,
    minutes: '15',
    blacklistedNamespaces: ['kube-node-lease', 'kube-public', 'kube-system'],
    detectNetworkTrace: isNetworkTraceDetected
  }

  return (
    <>
      <Layout.Horizontal
        width="100%"
        height="60px"
        flex={{ justifyContent: 'space-between' }}
        border={{ bottom: true }}
        padding={'large'}
      >
        <Text font={{ variation: FontVariation.H3, weight: 'semi-bold' }}>
          {getString('discovery.createNewDiscoveryAgent')}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'}>
          <Button
            variation={ButtonVariation.TERTIARY}
            text={getString('cancel')}
            onClick={() => setDrawerOpen(false)}
          />
          <RbacButton
            type="submit"
            variation={ButtonVariation.PRIMARY}
            intent="success"
            text={getString('discovery.createDiscoveryAgent')}
            onClick={() => dAgentFormRef.current?.handleSubmit()}
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.NETWORK_MAP,
                resourceIdentifier: ResourceCategory.DISCOVERY
              },
              permission: PermissionIdentifier.CREATE_NETWORK_MAP
            }}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Layout.Horizontal width="100%" height="100%">
        <Container background={Color.PRIMARY_BG} className={css.overviewContainer} border={{ right: true }}>
          <Formik<FormValues>
            innerRef={dAgentFormRef as React.Ref<FormikProps<FormValues>>}
            initialValues={initialValues}
            validationSchema={Yup.object().shape({
              discoveryAgentName: Yup.string()
                .trim()
                .matches(/^[^-].*$/, getString('discovery.dAgentValidation.nameStart'))
                .matches(/^.*[^-]$/, getString('discovery.dAgentValidation.nameEnd'))
                .max(50, getString('discovery.dAgentValidation.nameStart'))
                .required(getString('discovery.dAgentValidation.nameRequired')),
              connectorRef: Yup.string().trim().required(getString('discovery.dAgentValidation.connectConnector')),
              discoveryNamespace: Yup.string().trim().required(getString('discovery.dAgentValidation.selectNamespace')),
              duration: Yup.number()
                .min(1, getString('discovery.dAgentValidation.durationMaxMin'))
                .max(10, getString('discovery.dAgentValidation.durationMaxMin')),
              nodeAgentSelector: Yup.string().trim(),
              minute: Yup.number().min(15)
            })}
            onSubmit={async values => {
              if (values.minutes && parseInt(values.minutes) < 15) {
                showError(getString('discovery.dAgentCronError'))
                return
              }

              const k8sConnector: DatabaseK8sConnectorRequest = {
                accountIdentifier: accountId,
                projectIdentifier,
                orgIdentifier,
                id: values.connectorRef
              }
              if (values.connectorRef?.startsWith('org.')) {
                delete k8sConnector.projectIdentifier
                k8sConnector.id = values.connectorRef.slice(4)
              } else if (values.connectorRef?.startsWith('account.')) {
                delete k8sConnector.orgIdentifier
                delete k8sConnector.projectIdentifier
                k8sConnector.id = values.connectorRef.slice(8)
              }

              try {
                await infraMutate({
                  k8sConnectorID: k8sConnector.id ?? '',
                  k8sConnector: k8sConnector,
                  name: values.discoveryAgentName,
                  identity: values.identifier ?? '',
                  config: {
                    data: {
                      blacklistedNamespaces: values.blacklistedNamespaces,
                      enableNodeAgent: isNetworkTraceDetected,
                      cron: {
                        expression: values.expression
                      },
                      collectionWindowInMin: values.duration,
                      nodeAgentSelector: values.nodeAgentSelector
                    },
                    kubernetes: {
                      namespace: values.discoveryNamespace
                    }
                  }
                })
                setDrawerOpen(false)
                refetchDAgent?.()
              } catch (error) {
                showError(error.data?.description || error.data?.message)
              }
            }}
          >
            {formikProps => {
              return (
                <FormikForm className={css.form}>
                  <Layout.Vertical className={classNames(css.formContainer, css.gap2)} padding="xxlarge" width={'60%'}>
                    <NumberedList
                      index={1}
                      showLine
                      content={
                        <Layout.Vertical width={'900px'}>
                          <Text
                            font={{ variation: FontVariation.H5, weight: 'semi-bold' }}
                            margin={{ bottom: 'large' }}
                          >
                            {getString('discovery.selectAConnector')}
                          </Text>
                          <Text
                            width="100%"
                            font={{ variation: FontVariation.BODY }}
                            margin={{ top: 'medium', bottom: 'large' }}
                          >
                            {getString('discovery.selectAConnectorDescription')}
                          </Text>
                          <Container className={css.boxContainer} background={Color.WHITE} padding="medium">
                            <FormConnectorReferenceField
                              width={400}
                              type={'K8sCluster'}
                              name={'connectorRef'}
                              label={
                                <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                                  {getString('platform.connectors.selectConnector')}
                                </Text>
                              }
                              accountIdentifier={accountId}
                              projectIdentifier={projectIdentifier}
                              orgIdentifier={orgIdentifier}
                              placeholder={getString('platform.connectors.selectConnector')}
                              tooltipProps={{ dataTooltipId: 'selectNetworkMapConnector' }}
                            />

                            <div data-testid="input" style={{ width: '400px' }}>
                              <FormInput.InputWithIdentifier
                                inputName="discoveryAgentName"
                                idName="identifier"
                                isIdentifierEditable
                                inputLabel={getString('discovery.dAgentName')}
                              />
                              <FormInput.Text
                                name="discoveryNamespace"
                                placeholder={getString('discovery.discoveryNamespacePlaceholder')}
                                label={getString('common.namespace')}
                              />
                            </div>
                          </Container>
                        </Layout.Vertical>
                      }
                    />

                    <NumberedList
                      index={2}
                      margin={{ bottom: 'large' }}
                      content={
                        <Layout.Vertical width={'900px'} className={css.margin2}>
                          <Text
                            font={{ variation: FontVariation.H5, weight: 'semi-bold' }}
                            margin={{ bottom: 'large' }}
                          >
                            {`${getString('discovery.dataCollectionSettings')} ${getString('common.optionalLabel')}`}
                          </Text>
                          <Text
                            width="100%"
                            font={{ variation: FontVariation.BODY }}
                            margin={{ top: 'medium', bottom: 'large' }}
                          >
                            {getString('discovery.dataCollectionSettingsDesc')}
                          </Text>

                          <Container className={css.boxContainer} background={Color.WHITE} padding="medium">
                            <Switch
                              name="detectNetworkTrace"
                              label={getString('discovery.detectNetworkTrace')}
                              font={{ weight: 'semi-bold', size: 'normal' }}
                              color={Color.GREY_900}
                              margin={{ bottom: 'medium' }}
                              onChange={() => setIsNetworkTraceDetected(prev => !prev)}
                              checked={isNetworkTraceDetected}
                            />

                            <FormInput.Text name="nodeAgentSelector" label={getString('discovery.nodeAgentSelector')} />

                            <FormInput.TagInput
                              name="blacklistedNamespaces"
                              label={`${getString('discovery.blacklistedNamespaces')} ${getString(
                                'common.optionalLabel'
                              )}`}
                              itemFromNewTag={tag => tag}
                              items={[]}
                              tagInputProps={{
                                showClearAllButton: true,
                                allowNewTag: true,
                                showAddTagButton: false
                              }}
                              labelFor={tag => tag as string}
                            />

                            <SchedulePanel
                              renderFormTitle={false}
                              hideSeconds
                              formikProps={formikProps}
                              isQuartsExpressionSupported={false}
                            />

                            <FormInput.Text
                              name="duration"
                              inputGroup={{ type: 'number' }}
                              label={getString('discovery.forADurationOf')}
                            />
                          </Container>
                        </Layout.Vertical>
                      }
                    />
                  </Layout.Vertical>
                </FormikForm>
              )
            }}
          </Formik>
        </Container>

        <div className={css.details}>
          <Layout.Vertical
            width="100%"
            padding={{ top: 'xxlarge', left: 'xlarge', right: 'xlarge', bottom: 'xxlarge' }}
          >
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }} margin={{ bottom: 'large' }}>
              <Text font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>{getString('common.networkMap')}</Text>
              <Text
                font={{ variation: FontVariation.SMALL_BOLD }}
                color={Color.PRIMARY_7}
                rightIcon="main-share"
                rightIconProps={{ color: Color.PRIMARY_7, size: 10 }}
              >
                {getString('learnMore')}
              </Text>
            </Layout.Horizontal>
            <img src={NetworkMap} alt="Network Map" className={css.image} />
            <List
              title={getString('discovery.whatIsServiceDiscovery')}
              content={getString('discovery.whatIsServiceDiscoveryDesc')}
              margin={{ top: 'medium', bottom: 'xlarge' }}
            />
            <List
              title={getString('discovery.whatIsNetworkMap')}
              content={getString('discovery.networkMapDescription')}
              margin={{ top: 'medium', bottom: 'xlarge' }}
            />
            <List
              title={getString('discovery.howToCreateNetworkMap')}
              content={getString('discovery.howToCreateNetworkMapDesc')}
              margin={{ top: 'medium' }}
            />
          </Layout.Vertical>
        </div>
      </Layout.Horizontal>
    </>
  )
}

export default CreateDAgent
