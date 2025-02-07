/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  StepProps,
  Container,
  Formik,
  FormikForm,
  Button,
  Text,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Layout
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'

import { SecretRequestWrapper, usePostSecret, usePutSecret, SecretDTOV2, WinRmAuthDTO } from 'services/cd-ng'
import type { KerberosConfigDTO, SSHKeySpecDTO, WinRmCommandParameter } from 'services/cd-ng'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { buildAuthConfig } from '@secrets/utils/WinRmAuthUtils'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGovernanceMetaDataModal } from '@governance/hooks/useGovernanceMetaDataModal'
import WinRmAuthFormFields from '@secrets/components/WinRmAuthFormFields/WinRmAuthFormFields'
import type { WinRmCredSharedObj } from '../CreateWinRmCredWizard'

export interface WinRmConfigFormData {
  domain: string
  authScheme: WinRmAuthDTO['type']
  tgtGenerationMethod?: KerberosConfigDTO['tgtGenerationMethod'] | 'None'
  username: string
  port: number
  principal: string
  realm: string
  password?: SecretReference
  keyPath: string
  useSSL: boolean
  skipCertChecks: boolean
  useNoProfile: boolean
  parameters?: WinRmCommandParameter[]
}

interface StepAuthenticationProps {
  onSuccess?: (secret: SecretDTOV2) => void
}

const StepAuthentication: React.FC<StepProps<WinRmCredSharedObj> & StepAuthenticationProps & WinRmCredSharedObj> = ({
  prevStepData,
  nextStep,
  previousStep,
  onSuccess
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [saving, setSaving] = useState(false)
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const { conditionallyOpenGovernanceErrorModal } = useGovernanceMetaDataModal({
    considerWarningAsError: false,
    errorHeaderMsg: 'platform.secrets.policyEvaluations.failedToSave',
    warningHeaderMsg: 'platform.secrets.policyEvaluations.warning'
  })
  const { mutate: createSecret } = usePostSecret({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const { mutate: editSecret } = usePutSecret({
    identifier: prevStepData?.detailsData?.identifier || '',
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const isEdit = prevStepData?.isEdit
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const handleSubmit = async (formData: WinRmConfigFormData): Promise<void> => {
    setSaving(true)
    try {
      const authConfig = buildAuthConfig(formData)
      // build final data to submit
      const dataToSubmit: SecretRequestWrapper = {
        secret: {
          type: 'WinRmCredentials',
          name: prevStepData?.detailsData?.name as string,
          identifier: prevStepData?.detailsData?.identifier as string,
          description: prevStepData?.detailsData?.description,
          tags: prevStepData?.detailsData?.tags,
          projectIdentifier,
          orgIdentifier,
          spec: {
            auth: {
              type: formData.authScheme,
              spec: authConfig
            },
            port: formData.port,
            parameters: formData.parameters
          } as SSHKeySpecDTO
        }
      }
      // finally create the connector
      const response = isEdit ? await editSecret(dataToSubmit) : await createSecret(dataToSubmit)
      setSaving(false)
      conditionallyOpenGovernanceErrorModal(response?.data?.governanceMetadata, () => {
        isEdit ? showSuccess(getString('ssh.editmessageSuccess')) : showSuccess(getString('ssh.createmessageSuccess'))
        onSuccess?.(dataToSubmit.secret)
        nextStep?.({ ...prevStepData, authData: formData, isEdit: true })
      })
    } catch (err) {
      setSaving(false)
      modalErrorHandler?.show(err.data)
    }
  }
  const validationSchema = Yup.object().shape({
    port: Yup.string().trim().required(getString('common.smtp.portRequired')),
    domain: Yup.string().when('authScheme', {
      is: 'NTLM',
      then: Yup.string().trim().required(getString('platform.secrets.createWinRmCredWizard.validateDomain'))
    }),
    username: Yup.string().when('authScheme', {
      is: 'NTLM',
      then: Yup.string().trim().required(getString('platform.secrets.createSSHCredWizard.validateUsername'))
    }),
    password: Yup.string().when(['authScheme', 'tgtGenerationMethod'], {
      is: (authScheme, tgtGenerationMethod) =>
        authScheme === 'NTLM' || (authScheme === 'Kerberos' && tgtGenerationMethod == 'Password'),
      then: Yup.string().required(getString('platform.secrets.createWinRmCredWizard.validatePassword'))
    }),
    principal: Yup.string().when('authScheme', {
      is: 'Kerberos',
      then: Yup.string().trim().required(getString('platform.secrets.createSSHCredWizard.validatePrincipal'))
    }),
    realm: Yup.string().when('authScheme', {
      is: 'Kerberos',
      then: Yup.string().trim().required(getString('platform.secrets.createSSHCredWizard.validateRealm'))
    }),
    keyPath: Yup.string().when(['authScheme', 'tgtGenerationMethod'], {
      is: (authScheme, tgtGenerationMethod) => authScheme === 'Kerberos' && tgtGenerationMethod == 'KeyTabFilePath',
      then: Yup.string().trim().required(getString('platform.secrets.createSSHCredWizard.validateKeypath'))
    }),
    tgtGenerationMethod: Yup.string().when('authScheme', {
      is: 'Kerberos',
      then: Yup.string()
        .trim()
        .required(getString?.('fieldRequired', { field: getString('platform.secrets.sshAuthFormFields.labelTGT') }))
    }),
    parameters: Yup.lazy((parameters: any): Yup.Schema<unknown> => {
      return Yup.array().of(
        Yup.mixed().test({
          test(currentParams: WinRmCommandParameter): boolean | Yup.ValidationError {
            const currentIndex = +this.path.slice(11, this.path.length - 1)

            if (!currentParams?.parameter) {
              return this.createError({
                message: `${getString('platform.secrets.winRmAuthFormFields.parameterError')}`
              })
            }
            if (
              parameters.find(
                (params: WinRmCommandParameter, i: number) =>
                  params.parameter === currentParams.parameter && i !== currentIndex
              )
            ) {
              return this.createError({
                message: `${getString('platform.secrets.winRmAuthFormFields.parameterDuplicatedError')}`
              })
            }
            return true
          }
        })
      )
    })
  })

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Container padding="small" width={400} style={{ minHeight: '500px' }}>
        <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
          {getString('platform.secrets.createSSHCredWizard.titleAuth')}
        </Text>
        <Formik<WinRmConfigFormData>
          onSubmit={formData => {
            modalErrorHandler?.hide()
            handleSubmit(formData)
          }}
          formName="stepAuthenticationForm"
          validationSchema={validationSchema}
          initialValues={{
            authScheme: 'NTLM',
            domain: '',
            principal: '',
            realm: '',
            useNoProfile: false,
            skipCertChecks: false,
            tgtGenerationMethod: undefined,
            useSSL: false,
            username: '',
            keyPath: '',
            port: 5985,
            parameters: [],
            ...prevStepData?.authData
          }}
        >
          {formik => {
            return (
              <FormikForm>
                <WinRmAuthFormFields formik={formik} secretName={prevStepData?.detailsData?.name} />
                <Layout.Horizontal spacing="small">
                  <Button
                    text={getString('back')}
                    onClick={() => previousStep?.({ ...prevStepData, authData: formik.values })}
                  />
                  <Button
                    type="submit"
                    intent="primary"
                    text={
                      saving
                        ? getString('platform.secrets.createSSHCredWizard.btnSaving')
                        : getString('saveAndContinue')
                    }
                    disabled={saving}
                  />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </>
  )
}

export default StepAuthentication
