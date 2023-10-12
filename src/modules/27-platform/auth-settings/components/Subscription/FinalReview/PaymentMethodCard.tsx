/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Card, Text, Button, ButtonVariation } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { CreditCard, Category } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { Module } from 'framework/types/ModuleName'
import { SubscribeViews, PaymentMethodProps } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
interface PaymentMethodCardProps {
  paymentMethodInfo: PaymentMethodProps
  setView?: (view: SubscribeViews) => void
  module: Module
  fromPaymentMethodPage?: boolean
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethodInfo,
  setView,
  module,
  fromPaymentMethodPage
}) => {
  const { getString } = useStrings()
  const { last4digits, cardType, expireDate } = paymentMethodInfo
  const paymentDescr = `${cardType} ending in ${last4digits}`
  const expireDescr = `Expires ${expireDate}`
  const { trackEvent } = useTelemetry()
  return (
    <Card>
      <Layout.Vertical>
        <Layout.Horizontal flex={{ justifyContent: 'start', alignItems: 'baseline' }} padding={{ bottom: 'large' }}>
          <Text font={{ variation: FontVariation.H5 }}>
            {getString('platform.authSettings.billingInfo.paymentMethod')}
          </Text>
          {!fromPaymentMethodPage ? (
            <Button
              variation={ButtonVariation.LINK}
              onClick={() => {
                trackEvent(CreditCard.CalculatorReviewStepEditPayment, {
                  category: Category.CREDIT_CARD,
                  module
                })
                setView?.(SubscribeViews.PAYMENT_METHOD)
              }}
            >
              {getString('edit')}
            </Button>
          ) : null}
        </Layout.Horizontal>
        <Layout.Vertical spacing="xsmall">
          <Text>{paymentDescr}</Text>
          <Text font={{ size: 'xsmall' }}>{expireDescr}</Text>
        </Layout.Vertical>
      </Layout.Vertical>
    </Card>
  )
}

export default PaymentMethodCard
