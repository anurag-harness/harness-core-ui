/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import type { GetDataError } from 'restful-react'
import cx from 'classnames'
import { Icon, IconName, Layout, useToggleOpen, ConfirmationDialog, Button, ButtonVariation } from '@harness/uicore'
import { Intent, Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import type { CacheResponseMetadata, Failure } from 'services/pipeline-ng'
import css from './EntityCachedCopy.module.scss'

export interface EntityCachedCopyProps {
  reloadContent: string
  cacheResponse?: CacheResponseMetadata
  reloadFromCache: (loadFromCache?: boolean) => void
  fetchError?: GetDataError<Failure | Error> | null
  readonly?: boolean
  className?: string
  inlineReload?: boolean
}

export interface EntityCachedCopyHandle {
  showConfirmationModal(): void
}

const cacheStateToIconMap: Record<CacheResponseMetadata['cacheState'], IconName> = {
  VALID_CACHE: 'success-tick',
  STALE_CACHE: 'stale-cache',
  UNKNOWN: 'danger-icon'
}

function EntityCachedCopyInner(
  props: EntityCachedCopyProps,
  ref?: React.ForwardedRef<EntityCachedCopyHandle>
): React.ReactElement {
  const { reloadContent, cacheResponse, fetchError, reloadFromCache, readonly, className, inlineReload = true } = props
  const { getString } = useStrings()
  const { isOpen: isModalOpen, close: hideModal, open: showConfirmationModal } = useToggleOpen(false)
  const { isOpen: isErrorModalOpen, close: hideErrorModal, open: showErrorModal } = useToggleOpen(false)

  useEffect(() => {
    if (!isEmpty(fetchError) && !readonly) {
      showErrorModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError])

  function reloadEntity(): void {
    reloadFromCache()
  }

  const tooltipContent = (
    <div className={css.popover}>
      <span>{getString('pipeline.pipelineCachedCopy.cachedCopyText')}</span>:{' '}
      {cacheResponse?.lastUpdatedAt && formatDatetoLocale(cacheResponse.lastUpdatedAt)}
      {inlineReload && (
        <Icon
          name="refresh"
          color={Color.PRIMARY_4}
          onClick={showConfirmationModal}
          padding={{ left: 'small' }}
          className={css.reload}
        />
      )}
    </div>
  )

  React.useImperativeHandle(ref, () => ({
    showConfirmationModal
  }))

  function handleReconcileConfirmClick(confirm: boolean): void {
    if (confirm) {
      reloadEntity()
    }

    hideModal()
  }

  function handleReconcileRetryClick(confirm: boolean): void {
    if (confirm) {
      reloadEntity()
    }

    hideErrorModal()
  }

  return (
    <>
      {cacheResponse && (
        <div className={cx(css.cachedcopy, className)}>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }} spacing="small">
            <Button
              minimal
              variation={ButtonVariation.ICON}
              icon={cacheStateToIconMap[cacheResponse.cacheState]}
              withoutCurrentColor
              tooltipProps={{ isDark: true, interactionKind: 'hover', position: 'bottom' }}
              tooltip={tooltipContent}
            />
          </Layout.Horizontal>
        </div>
      )}
      <ConfirmationDialog
        intent={Intent.WARNING}
        isOpen={isModalOpen}
        onClose={handleReconcileConfirmClick}
        titleText={getString('pipeline.pipelineCachedCopy.reloadPipeline', { pageType: reloadContent })}
        contentText={getString('pipeline.pipelineCachedCopy.reloadPipelineContent', { pageType: reloadContent })}
        confirmButtonText={getString('confirm')}
        cancelButtonText={getString('cancel')}
      />
      <ConfirmationDialog
        intent={Intent.DANGER}
        isOpen={isErrorModalOpen}
        onClose={handleReconcileRetryClick}
        titleText={getString('pipeline.pipelineCachedCopy.cacheUpdateFailed')}
        contentText={getString('pipeline.pipelineCachedCopy.reloadPipelineContent', { pageType: reloadContent })}
        confirmButtonText={getString('common.tryAgain')}
        cancelButtonText={getString('cancel')}
      />
    </>
  )
}

export const EntityCachedCopy = React.forwardRef(EntityCachedCopyInner)
