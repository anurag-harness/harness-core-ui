/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef } from 'react'
import { isEmpty } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import {
  Formik,
  Page,
  useToaster,
  Container,
  Layout,
  Button,
  Heading,
  Dialog,
  Text,
  HarnessDocTooltip
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  ServiceLevelObjectiveV2DTO,
  useGetServiceLevelObjectiveV2,
  useSaveSLOV2Data,
  useUpdateSLOV2Data
} from 'services/cv'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import sloReviewChange from '@cv/assets/sloReviewChange.svg'
import {
  createSLOV2RequestPayload,
  getCompositeSLOCustomValidation,
  getIsUserUpdatedSLOData,
  getServiceLevelIndicatorsIdentifierFromResponse,
  getSimpleSLOCustomValidation,
  getSimpleSLOV2FormValidationSchema,
  getSLOV2FormValidationSchema,
  getSLOV2InitialFormData
} from './CVCreateSLOV2.utils'
import { CreateCompositeSloForm } from './components/CreateCompositeSloForm/CreateCompositeSloForm'
import type { SLOV2Form } from './CVCreateSLOV2.types'
import { SLOType } from './CVCreateSLOV2.constants'
import CreateSimpleSLOForm from './components/CreateSimpleSloForm/CreateSimpleSloForm'
import css from './components/CreateCompositeSloForm/CreateCompositeSloForm.module.scss'

const CVCreateSLOV2 = ({ isComposite }: { isComposite?: boolean }): JSX.Element => {
  const history = useHistory()
  const { getString } = useStrings()
  const { SRM_ENABLE_REQUEST_SLO: enableRequestSLO } = useFeatureFlags()
  useDocumentTitle([getString('cv.srmTitle'), getString('cv.slos.title')])

  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
  const pathQueryParams = isAccountLevel ? { accountId } : { accountId, orgIdentifier, projectIdentifier }
  const projectIdentifierRef = useRef<string>()
  const sloPayloadRef = useRef<ServiceLevelObjectiveV2DTO | null>(null)

  useEffect(() => {
    if (!isAccountLevel && projectIdentifierRef.current && projectIdentifierRef.current !== projectIdentifier) {
      history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
      return
    }

    projectIdentifierRef.current = projectIdentifier
  }, [projectIdentifier, accountId, orgIdentifier, history])

  const { mutate: createSLO, loading: createSLOLoading } = useSaveSLOV2Data({ queryParams: { accountId } })

  const { mutate: updateSLO, loading: updateSLOLoading } = useUpdateSLOV2Data({
    identifier,
    queryParams: { ...pathQueryParams }
  })

  const {
    data: SLODataResponse,
    error: SLODataError,
    refetch: refetchSLOData,
    loading: SLODataLoading
  } = useGetServiceLevelObjectiveV2({
    identifier,
    queryParams: {
      ...pathQueryParams
    },
    lazy: true
  })

  useEffect(() => {
    if (identifier) {
      refetchSLOData()
    }
  }, [identifier, refetchSLOData])

  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        className={css.warningModal}
        onClose={closeModal}
      >
        <Layout.Vertical>
          <Layout.Horizontal>
            <Container width="70%" padding={{ right: 'large' }}>
              <Heading level={2} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
                {getString('cv.slos.reviewChanges')}
              </Heading>
              <Text color={Color.GREY_600} font={{ weight: 'light' }} style={{ lineHeight: 'var(--spacing-xlarge)' }}>
                {getString('cv.slos.sloEditWarningMessage')}
              </Text>
            </Container>
            <Container margin={{ top: 'small' }}>
              <img width="170" src={sloReviewChange} />
            </Container>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'xlarge' }}>
            <Button
              text={getString('common.ok')}
              onClick={async () => {
                try {
                  await updateSLO(sloPayloadRef.current as ServiceLevelObjectiveV2DTO)
                  sloPayloadRef.current = null
                  showSuccess(getString('cv.slos.sloUpdated'))
                  handleRedirect()
                } catch (error) {
                  showError(getErrorMessage(error))
                  closeModal()
                }
              }}
              intent="primary"
            />
            <Button
              text={getString('cancel')}
              onClick={() => {
                sloPayloadRef.current = null
                closeModal()
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    ),
    [projectIdentifier, orgIdentifier, accountId]
  )

  const handleRedirect = (): void => {
    isAccountLevel
      ? history.push(routes.toAccountCVSLOs({ accountId }))
      : history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
  }

  const serviceLevelIndicatorsIdentifierFromResponse = getServiceLevelIndicatorsIdentifierFromResponse(
    SLODataResponse,
    isComposite
  )
  const handleSLOV2Submit = async (values: SLOV2Form): Promise<void> => {
    const sloCreateRequestPayload = createSLOV2RequestPayload(
      values,
      orgIdentifier,
      projectIdentifier,
      serviceLevelIndicatorsIdentifierFromResponse
    )

    try {
      if (identifier) {
        if (
          !getIsUserUpdatedSLOData(
            SLODataResponse?.resource?.serviceLevelObjectiveV2 as ServiceLevelObjectiveV2DTO,
            sloCreateRequestPayload
          )
        ) {
          sloPayloadRef.current = sloCreateRequestPayload
          openModal()
        } else {
          await updateSLO(sloCreateRequestPayload)
          const editSuccessMessage = isEmpty(sloCreateRequestPayload.spec?.serviceLevelObjectivesDetails)
            ? getString('cv.slos.sloUpdated')
            : getString('cv.CompositeSLO.compositeSloUpdated')
          showSuccess(editSuccessMessage)
          handleRedirect()
        }
      } else {
        await createSLO(sloCreateRequestPayload)
        const createSuccessMessage = isEmpty(sloCreateRequestPayload.spec?.serviceLevelObjectivesDetails)
          ? getString('cv.slos.sloCreated')
          : getString('cv.CompositeSLO.compositeSloCreated')
        showSuccess(createSuccessMessage)
        handleRedirect()
      }
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const links = [
    {
      url: isAccountLevel
        ? routes.toAccountCVSLOs({ accountId })
        : routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }),
      label: getString('cv.slos.title')
    }
  ]

  const sloType = isComposite ? SLOType.COMPOSITE : SLOType.SIMPLE
  const validationSchema = isComposite ? getSLOV2FormValidationSchema : getSimpleSLOV2FormValidationSchema
  const customValidations = isComposite ? getCompositeSLOCustomValidation : getSimpleSLOCustomValidation
  const initialFormData = getSLOV2InitialFormData(
    sloType,
    SLODataResponse?.resource?.serviceLevelObjectiveV2,
    enableRequestSLO
  )
  return (
    <Container margin={{ bottom: 'large' }}>
      {!identifier && (
        <Page.Header
          breadcrumbs={<NGBreadcrumbs links={links} />}
          title={
            <Layout.Vertical flex={{ justifyContent: 'space-evenly', alignItems: 'flex-start' }} height={45}>
              <Heading level={3} font={{ variation: FontVariation.H4 }}>
                {isComposite ? getString('cv.CompositeSLO.CreateTitle') : getString('cv.slos.createSLO')}
                <HarnessDocTooltip tooltipId={'createCompositeSLO'} useStandAlone />
              </Heading>
              {isComposite && (
                <Text color={Color.GREY_600} font={{ variation: FontVariation.BODY2, weight: 'light' }}>
                  {getString('cv.CompositeSLO.CreateMessage')}
                </Text>
              )}
            </Layout.Vertical>
          }
        />
      )}
      <Formik<SLOV2Form>
        initialValues={initialFormData}
        formName="SLO_form"
        onSubmit={values => {
          handleSLOV2Submit(values)
        }}
        validationSchema={validationSchema(getString)}
        validate={values => customValidations?.(values, getString, enableRequestSLO)}
        enableReinitialize
      >
        {() =>
          isComposite ? (
            <CreateCompositeSloForm
              loading={SLODataLoading}
              error={getErrorMessage(SLODataError)}
              retryOnError={refetchSLOData}
              handleRedirect={handleRedirect}
              runValidationOnMount={Boolean(identifier)}
              loadingSaveButton={createSLOLoading || updateSLOLoading}
            />
          ) : (
            <CreateSimpleSLOForm
              loading={SLODataLoading}
              error={getErrorMessage(SLODataError)}
              retryOnError={refetchSLOData}
              handleRedirect={handleRedirect}
              runValidationOnMount={Boolean(identifier)}
              loadingSaveButton={createSLOLoading || updateSLOLoading}
            />
          )
        }
      </Formik>
    </Container>
  )
}

export default CVCreateSLOV2
