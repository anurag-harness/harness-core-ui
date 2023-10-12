import React, { FC, useMemo, useState } from 'react'
import {
  FormError,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  ModalDialog,
  PageError,
  Pagination,
  Text
} from '@harness/uicore'
import { Spinner } from '@blueprintjs/core'
import { FormikErrors } from 'formik'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import { useModalHook } from '@harness/use-modal'
import { useToaster } from '@common/exports'
import { GitSyncFormValues, UseGitSync } from '@cf/hooks/useGitSync'
import { GIT_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import { String, useStrings } from 'framework/strings'
import { DeleteFeatureFlagQueryParams, useGetDependentFeatures, Features } from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import useResponseError from '@cf/hooks/useResponseError'
import SaveFlagToGitModal from '../SaveFlagToGitModal/SaveFlagToGitModal'
import ArchiveFlagButtons from './ArchiveFlagButtons'
import CannotArchiveWarning from './CannotArchiveWarning'

export interface ArchiveDialogProps {
  archiveFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  flagIdentifier: string
  flagName: string
  gitSync: UseGitSync
  onSuccess: () => void
  queryParams: DeleteFeatureFlagQueryParams
  setShowArchiveDialog: (value: boolean) => void
}

const ArchiveDialog: FC<ArchiveDialogProps> = ({
  archiveFlag,
  flagIdentifier,
  flagName,
  gitSync,
  onSuccess,
  queryParams,
  setShowArchiveDialog
}) => {
  const [pageNumber, setPageNumber] = useState<number>(0)

  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const { handleResponseError } = useResponseError()

  const {
    data: dependentFlagsResponse,
    loading: dependentFlagsLoading,
    error: dependentFlagsError,
    refetch: refetchDependentFlags
  } = useGetDependentFeatures({
    queryParams: { ...queryParams, pageNumber, pageSize: CF_DEFAULT_PAGE_SIZE },
    identifier: flagIdentifier
  })

  enum STATUS {
    'error',
    'hasDependentFlags',
    'hasNoDependentFlags',
    'loading',
    'ok'
  }

  const state = useMemo<STATUS>(() => {
    if (dependentFlagsError) {
      return STATUS.error
    } else if (dependentFlagsLoading) {
      return STATUS.loading
    } else if (dependentFlagsResponse?.features?.length && !dependentFlagsLoading) {
      return STATUS.hasDependentFlags
    } else if (!dependentFlagsResponse?.features?.length && !dependentFlagsLoading) {
      return STATUS.hasNoDependentFlags
    }
    return STATUS.ok
  }, [
    dependentFlagsResponse,
    dependentFlagsError,
    dependentFlagsLoading,
    STATUS.error,
    STATUS.hasDependentFlags,
    STATUS.hasNoDependentFlags,
    STATUS.loading,
    STATUS.ok
  ])

  const { gitSyncInitialValues, gitSyncValidationSchema } = gitSync.getGitSyncFormMeta(
    GIT_COMMIT_MESSAGES.ARCHIVED_FLAG
  )

  const [showGitModal, hideGitModal] = useModalHook(() => {
    return (
      <SaveFlagToGitModal
        flagName={flagName}
        flagIdentifier={flagIdentifier}
        gitSyncInitialValues={gitSyncInitialValues}
        gitSyncValidationSchema={gitSyncValidationSchema}
        onSubmit={handleArchive}
        onClose={hideGitModal}
      />
    )
  }, [flagName, flagIdentifier])

  const handleArchive = async (gitSyncFormValues?: GitSyncFormValues): Promise<void> => {
    let commitMsg

    if (gitSync.isGitSyncEnabled && gitSync.isAutoCommitEnabled) {
      commitMsg = gitSyncInitialValues.gitDetails.commitMsg
    } else {
      commitMsg = gitSyncFormValues?.gitDetails.commitMsg || ''
    }

    try {
      await archiveFlag(flagIdentifier, { queryParams: { ...queryParams, forceDelete: false, commitMsg } })

      if (gitSync.isGitSyncEnabled && gitSyncFormValues?.autoCommit) {
        await gitSync.handleAutoCommit(gitSyncFormValues?.autoCommit)
      }

      showSuccess(getString('cf.featureFlags.archiving.archiveSuccess'))
      onSuccess()
      setShowArchiveDialog(false)
    } catch (e) {
      handleResponseError(e)
    }
  }

  interface FlagIdentifierValues {
    flagIdentifier: string
  }

  const handleValidation = (values: FlagIdentifierValues): FormikErrors<FlagIdentifierValues> => {
    const errors: { flagIdentifier?: string } = {}

    if (values?.flagIdentifier !== flagIdentifier) {
      errors.flagIdentifier = getString('cf.featureFlags.archiving.mismatchIdentifierError')
    }
    return errors
  }

  return (
    <Formik
      formName="archive-flag-form"
      onSubmit={() => {
        if (gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled) {
          showGitModal()
        } else {
          handleArchive()
        }
      }}
      initialValues={{ flagIdentifier: '' }}
      validate={handleValidation}
    >
      {({ dirty, errors, handleSubmit, isSubmitting, isValid }) => (
        <ModalDialog
          enforceFocus={false}
          isOpen
          onClose={() => setShowArchiveDialog(false)}
          title={getString('cf.featureFlags.archiving.archiveFlag')}
          footer={
            <>
              {state === STATUS.hasNoDependentFlags && (
                <Layout.Horizontal spacing="small">
                  <ArchiveFlagButtons
                    onClick={handleSubmit}
                    onClose={() => setShowArchiveDialog(false)}
                    disabled={isSubmitting || !isValid || !dirty}
                  />
                </Layout.Horizontal>
              )}
              {state === STATUS.hasDependentFlags && dependentFlagsResponse && (
                <Pagination
                  gotoPage={setPageNumber}
                  itemCount={dependentFlagsResponse.itemCount || 0}
                  pageCount={dependentFlagsResponse.pageCount || 0}
                  pageIndex={pageNumber}
                  pageSize={CF_DEFAULT_PAGE_SIZE}
                  showPagination={dependentFlagsResponse.pageCount > 1}
                />
              )}
            </>
          }
        >
          <FormikForm>
            {state === STATUS.error && (
              <PageError message={dependentFlagsError} onClick={() => refetchDependentFlags()} />
            )}

            {state === STATUS.loading && <Spinner size={24} />}

            {state === STATUS.hasDependentFlags && (
              <CannotArchiveWarning flagName={flagName} dependentFlagsResponse={dependentFlagsResponse as Features} />
            )}

            {state === STATUS.hasNoDependentFlags && (
              <Layout.Vertical spacing="small">
                <String stringID="cf.featureFlags.archiving.warningDescription" vars={{ flagIdentifier }} useRichText />
                <Text>{getString('cf.featureFlags.archiving.confirmFlag')}</Text>
                <FormInput.Text
                  aria-label={getString('cf.featureFlags.archiving.confirmFlag')}
                  placeholder={flagIdentifier}
                  name="flagIdentifier"
                />
              </Layout.Vertical>
            )}
            <FormError name="mismatchFlagIdentifierError" errorMessage={errors.flagIdentifier} />
          </FormikForm>
        </ModalDialog>
      )}
    </Formik>
  )
}

export default ArchiveDialog
