/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, omit, defaultTo } from 'lodash-es'
import * as Yup from 'yup'
import {
  Container,
  Formik,
  FormikForm,
  Button,
  ButtonVariation,
  useToaster,
  FormInput,
  SelectOption,
  Layout,
  Text
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { HideModal } from '@harness/use-modal'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { Error, ResponseInputSetMoveConfigResponseDTO } from 'services/pipeline-ng'
import {
  moveTemplateConfigsPromise,
  TemplateSummaryResponse,
  TemplateMetadataSummaryResponse,
  ResponseTemplateMoveConfigResponse
} from 'services/template-ng'

import { GitSyncForm } from '@gitsync/components/GitSyncForm/GitSyncForm'
import type { ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { yamlPathRegex } from '@common/utils/StringUtils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { DefaultStableVersionValue, VersionsDropDown } from '@pipeline/components/VersionsDropDown/VersionsDropDown'

import { ExtraQueryParams, getDisableFields, MigrationType } from '@pipeline/components/MigrateResource/MigrateUtils'

import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type { NameIdDescriptionTagsType } from '@common/utils/Validation'

import css from './MoveTemplateResource.module.scss'

export type InitialValuesType = NameIdDescriptionTagsType & StoreMetadata & { versionLabel: string; commitMsg?: string }
export type ModifiedInitialValuesType = Omit<InitialValuesType, 'repoName'> & { repo?: string; baseBranch?: string }

export interface MoveResourceProps {
  migrationType: MigrationType
  resourceType: ResourceType
  initialValues?: InitialValuesType
  onCancelClick?: HideModal
  onSuccess?: () => void
  onFailure?: () => void
  extraQueryParams?: ExtraQueryParams
  template?: any
  supportingTemplatesGitx?: boolean
  isGitSyncEnabled?: boolean
  isStandAlone?: boolean
  disableVersionChange?: boolean
  templates: TemplateSummaryResponse[] | TemplateMetadataSummaryResponse[]
  versionOptions: SelectOption[]
}

export default function MoveTemplateResource({
  initialValues = {
    identifier: '',
    name: '',
    description: '',
    tags: {},
    repoName: '',
    branch: '',
    connectorRef: '',
    versionLabel: ''
  },
  migrationType,
  resourceType,
  onCancelClick,
  onSuccess,
  onFailure,
  disableVersionChange = false,
  templates = [],
  versionOptions = []
}: MoveResourceProps): JSX.Element {
  const [errorResponse, setErrorResponse] = useState<ResponseMessage[]>()
  const [isLoading, setIsLoading] = useState<boolean>()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelinePathProps>()
  const { showError, clear, showSuccess } = useToaster()
  const { getString } = useStrings()
  const formikRef = useRef<FormikProps<ModifiedInitialValuesType>>(null)

  const stableVersion = React.useMemo(() => {
    return (templates as TemplateSummaryResponse[])?.find(item => item.stableTemplate && !isEmpty(item.versionLabel))
      ?.versionLabel
  }, [templates])

  const getResourceTypeText = useCallback((): string => {
    if (resourceType === ResourceType.TEMPLATE) {
      return getString('common.template.label')
    }
    return getString('common.resourceLabel')
  }, [getString, resourceType])

  const handleResponse = (
    response: ResponseTemplateMoveConfigResponse | ResponseInputSetMoveConfigResponseDTO
  ): void => {
    if (response.status === 'SUCCESS') {
      setIsLoading(false)
      showSuccess(getString('pipeline.moveSuccessMessage', { resourceType: getResourceTypeText() }))
      onSuccess?.()
    } else {
      handleError(response)
    }
  }

  const handleError = (err: Error): void => {
    setIsLoading(false)
    if (!isEmpty(err.responseMessages)) {
      setErrorResponse(err.responseMessages)
      onFailure?.()
    } else {
      clear()
      showError(err.message ?? getString('somethingWentWrong'))
      onFailure?.()
    }
  }

  const moveTemplate = (formValues: ModifiedInitialValuesType): void => {
    const { identifier, connectorRef, repo, branch, filePath, commitMsg, versionLabel, baseBranch } = formValues
    setIsLoading(true)
    moveTemplateConfigsPromise({
      templateIdentifier: identifier,
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        connectorRef: typeof connectorRef === 'string' ? connectorRef : (connectorRef as any).value,
        repoName: repo,
        branch,
        filePath,
        moveConfigType: migrationType as MigrationType.INLINE_TO_REMOTE,
        ...(baseBranch ? { isNewBranch: true, baseBranch } : { isNewBranch: false }),
        versionLabel,
        commitMsg
      },
      requestOptions: {
        headers: {
          'content-type': 'application/json'
        }
      },
      body: undefined
    })
      .then(handleResponse)
      .catch(handleError)
  }

  const validationSchema = Yup.object().shape({
    versionLabel: Yup.string()
      .trim()
      .required(
        getString('common.validation.fieldIsRequired', {
          name: getString('common.versionLabel')
        })
      ),

    repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    branch: Yup.string().trim().required(getString('common.git.validation.branchRequired')),
    connectorRef: Yup.string().trim().required(getString('validation.sshConnectorRequired')),
    filePath: Yup.mixed().when([], {
      is: migrationType === MigrationType.INLINE_TO_REMOTE,
      then: Yup.string()
        .trim()
        .required(getString('gitsync.gitSyncForm.yamlPathRequired'))
        .matches(yamlPathRegex, getString('gitsync.gitSyncForm.yamlPathInvalid'))
    }),
    commitMsg: Yup.mixed().when([], {
      is: migrationType === MigrationType.INLINE_TO_REMOTE,
      then: Yup.string().trim().required(getString('common.git.validation.commitMessage'))
    })
  })

  const modifiedInitialValues = React.useMemo(() => {
    return {
      ...omit(initialValues, 'repoName'),
      repo: initialValues.repoName,
      commitMsg: getString('pipeline.defaultMoveCommitMsg', {
        resourceType: getResourceTypeText(),
        name: initialValues.name
      })
    }
  }, [initialValues, getString, getResourceTypeText])

  return (
    <Container className={css.migrateTemplateResourceForm}>
      <Formik<ModifiedInitialValuesType>
        initialValues={modifiedInitialValues}
        formName="moveTemplateConfig"
        validationSchema={validationSchema}
        onSubmit={moveTemplate}
        innerRef={formikRef}
      >
        {formikProps => {
          return (
            <FormikForm>
              {isLoading ? (
                <ContainerSpinner />
              ) : (
                <>
                  <NameId inputGroupProps={{ disabled: true }} identifierProps={{ isIdentifierEditable: false }} />
                  {!isEmpty(versionOptions) ? (
                    <Layout.Vertical className={css.versionlabel} spacing={'small'} margin={{ bottom: 'medium' }}>
                      <Text style={{ fontSize: 13 }} font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
                        {getString('common.versionLabel')}
                      </Text>
                      <VersionsDropDown
                        items={versionOptions}
                        value={defaultTo(formikProps.values.versionLabel, DefaultStableVersionValue)}
                        onChange={option => {
                          if (option.value) {
                            formikProps.setFieldValue('versionLabel', option.value)
                          }
                        }}
                        width={350}
                        popoverClassName={css.dropdown}
                        stableVersion={stableVersion}
                        disabled={disableVersionChange}
                      />
                    </Layout.Vertical>
                  ) : null}

                  <GitSyncForm
                    formikProps={formikProps as any}
                    initialValues={{
                      filePath: formikProps.submitCount > 0 ? formikProps.values?.filePath : ''
                    }}
                    isEdit={false}
                    errorData={errorResponse}
                    disableFields={getDisableFields(resourceType)}
                    supportNewBranch
                    className={css.gitSyncForm}
                  />
                  <FormInput.TextArea
                    className={css.commitMessage}
                    label={getString('common.git.commitMessage')}
                    name="commitMsg"
                  />

                  <Container padding={{ top: 'xlarge' }}>
                    <Button variation={ButtonVariation.PRIMARY} type="submit" text={getString('common.moveToGit')} />
                    &nbsp; &nbsp;
                    <Button
                      variation={ButtonVariation.TERTIARY}
                      text={getString('cancel')}
                      onClick={() => {
                        onCancelClick?.()
                      }}
                    />
                  </Container>
                </>
              )}
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}
