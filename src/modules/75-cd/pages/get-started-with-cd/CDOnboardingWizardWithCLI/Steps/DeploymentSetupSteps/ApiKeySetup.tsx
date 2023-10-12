/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import cx from 'classnames'
import { Text, TextInput, Button, ButtonVariation, Icon, Layout } from '@harness/uicore'
import { Callout } from '@blueprintjs/core'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { useStrings, String } from 'framework/strings'
import { CopyText } from '@common/components/CopyText/CopyText'
import { useDeepCompareEffect } from '@common/hooks'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  TokenAggregateDTO,
  useCreateApiKey,
  useCreateToken,
  useListAggregatedApiKeys,
  useListAggregatedTokens,
  useDeleteToken
} from 'services/cd-ng'

import { DEFAULT_IDENTIFIER, DEFAULT_TOKEN_IDENTIFIER, API_KEY_TYPE, TOKEN_MASK } from '../../Constants'
import type { ApiKeySetupProps, PipelineSetupState } from '../../types'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export default function ApiKeySetup({
  onKeyGenerate,
  state
}: ApiKeySetupProps & { state: PipelineSetupState }): JSX.Element {
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<ProjectPathProps>()
  const [token, setToken] = React.useState<string | undefined>()
  const { mutate: createApiKey } = useCreateApiKey({ queryParams: { accountIdentifier: accountId } })
  const { mutate: createToken, loading: creatingApiToken } = useCreateToken({
    queryParams: { accountIdentifier: accountId }
  })
  const { data } = useListAggregatedApiKeys({
    queryParams: {
      accountIdentifier: accountId,
      apiKeyType: API_KEY_TYPE,
      parentIdentifier: currentUserInfo.uuid
    }
  })
  const {
    refetch: refetchToken,
    loading: tokensFetching,
    data: tokenData
  } = useListAggregatedTokens({
    queryParams: {
      accountIdentifier: accountId,

      apiKeyType: API_KEY_TYPE,
      parentIdentifier: currentUserInfo.uuid,
      apiKeyIdentifier: ''
    },
    lazy: true
  })

  const existingToken = React.useMemo(() => {
    let validToken = ''
    tokenData?.data?.content?.forEach((tokenDetails: TokenAggregateDTO) => {
      if (tokenDetails.token.valid) {
        validToken = tokenDetails.token?.identifier
      }
    })
    return validToken
  }, [tokenData])

  const apiKey = React.useMemo(() => {
    return data?.data?.content?.[0]?.apiKey?.identifier
  }, [data])
  useEffect(() => {
    apiKey &&
      refetchToken({
        queryParams: {
          apiKeyIdentifier: apiKey,
          accountIdentifier: accountId,
          apiKeyType: API_KEY_TYPE,
          parentIdentifier: currentUserInfo.uuid
        }
      })
  }, [apiKey])

  const { mutate: deleteToken } = useDeleteToken({
    queryParams: {
      accountIdentifier: accountId,
      apiKeyType: API_KEY_TYPE,
      parentIdentifier: currentUserInfo.uuid,
      apiKeyIdentifier: apiKey as string
    }
  })

  const createApiKeyHandler = async (): Promise<void> => {
    if (!apiKey) {
      const created = await createApiKey({
        accountIdentifier: accountId,
        apiKeyType: API_KEY_TYPE,
        defaultTimeToExpireToken: moment().add('30', 'd').unix() * 1000,
        identifier: DEFAULT_IDENTIFIER,
        name: DEFAULT_IDENTIFIER,
        parentIdentifier: currentUserInfo.uuid
      })
      if (created) {
        await createApiToken(DEFAULT_IDENTIFIER || apiKey)
      }
    } else {
      await createApiToken(DEFAULT_IDENTIFIER || apiKey)
    }
  }

  const createApiToken = async (apikeyid = apiKey): Promise<void> => {
    const validTo = moment().add('30', 'd').unix() * 1000
    const tokenId = `${getIdentifierFromName(DEFAULT_TOKEN_IDENTIFIER)}_${validTo}`
    await createToken({
      accountIdentifier: accountId,
      apiKeyIdentifier: apikeyid as string,
      apiKeyType: 'USER',
      name: DEFAULT_TOKEN_IDENTIFIER,
      identifier: tokenId,
      parentIdentifier: currentUserInfo.uuid,
      validTo
    }).then(res => {
      setToken(res?.data as string)
      deleteToken(existingToken)
      return res
    })
  }
  useDeepCompareEffect(() => {
    token && onKeyGenerate({ ...state, apiKey: token as string })
  }, [token])

  if (tokensFetching || creatingApiToken) {
    return (
      <Layout.Horizontal padding="large">
        <Icon size={16} name="steps-spinner" color={Color.BLUE_800} style={{ marginRight: '12px' }} />
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.prepareStep.fetchingApiKeys"
        />
      </Layout.Horizontal>
    )
  }

  const generateOrUpdateToken = (): Promise<void> => {
    return existingToken ? createApiToken() : createApiKeyHandler()
  }

  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} padding={{ top: 'large', bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.prepareStep.title"
        />
      </Text>
      {token ? (
        <TokenValueRenderer
          hideMessage={Boolean(existingToken) && !token}
          maskToken={Boolean(existingToken) && !token}
          token={Boolean(existingToken) && !token ? TOKEN_MASK : (token as string)}
          rotateSecretCallback={createApiToken}
        />
      ) : (
        <Button
          margin={{ left: 'xlarge' }}
          width={250}
          variation={ButtonVariation.PRIMARY}
          onClick={generateOrUpdateToken}
        >
          <String
            className={css.marginBottomLarge}
            stringID={
              existingToken
                ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.prepareStep.regenerateButton'
                : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.prepareStep.generateButton'
            }
          />
        </Button>
      )}
    </Layout.Vertical>
  )
}

interface TokenValueRendererProps {
  token: string
  textInputClass?: string
  copyTextClass?: string
  hideMessage?: boolean
  maskToken?: boolean
  rotateSecretCallback?: () => void
  width?: number
}

export const TokenValueRenderer: React.FC<TokenValueRendererProps> = props => {
  const { getString } = useStrings()
  const { token, textInputClass, copyTextClass, hideMessage, maskToken, rotateSecretCallback } = props
  return (
    <Layout.Vertical spacing="small" margin={{ bottom: 'medium' }} className={css.secretInput}>
      <Callout intent="success">
        <Text>{getString('valueLabel')}</Text>
        <Layout.Horizontal>
          <TextInput className={cx(css.textbox, textInputClass)} value={token} disabled />

          {!maskToken && (
            <CopyText
              className={cx(copyTextClass, css.buttons, css.copyButton)}
              iconName="duplicate"
              textToCopy={token}
              iconAlwaysVisible
            />
          )}

          {rotateSecretCallback && (
            <div className={cx(css.rotateButton, css.relative, css.buttons)}>
              <Button
                minimal
                tooltip={getString('rbac.token.rotateLabel')}
                onClick={rotateSecretCallback}
                icon="reset"
              />
            </div>
          )}
        </Layout.Horizontal>
        {!hideMessage && <Text>{getString('rbac.token.form.tokenMessage')}</Text>}
      </Callout>
    </Layout.Vertical>
  )
}
