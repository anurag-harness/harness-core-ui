/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { isEmpty, trim } from 'lodash-es'
import { Layout, Radio } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type {
  BillingContactProps,
  PaymentMethodProps,
  SubscribeViews,
  SubscriptionProps
} from '@common/constants/SubscriptionTypes'
import { CreditCard, Category } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { Module } from 'framework/types/ModuleName'
import { GetDefaultCardQueryParams, InvoiceDetailDTO, useGetDefaultCard } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { Footer } from './Footer'
import PaymentMethod from './PaymentMethod'
import { Header } from '../Header'
import PaymentMethodCard from '../FinalReview/PaymentMethodCard'
import css from '../BillingInfo/BillingInfo.module.scss'

interface BillingInfoProp {
  subscriptionProps: SubscriptionProps
  setView: (view: SubscribeViews) => void
  setInvoiceData: (value: InvoiceDetailDTO) => void
  setSubscriptionProps: (props: SubscriptionProps) => void
  className: string
  module: Module
}
export default function PaymentMethodStep({
  subscriptionProps,
  setView,
  setInvoiceData,
  setSubscriptionProps,
  className,
  module
}: BillingInfoProp): JSX.Element {
  const { trackEvent } = useTelemetry()
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [addCard, setAddCard] = useState<boolean>(false)
  const [loadPaymentMethodStep, setLoadPaymentMethodStep] = useState<boolean>(false)
  const [useExistingCard, setUseExistingCard] = useState<boolean>(true)
  const canPay = (): boolean => {
    let canPayBill = false
    const {
      billingContactInfo: { companyName, email, billingAddress, country, state, city, zipCode },
      isValid
    } = subscriptionProps
    canPayBill =
      !isEmpty(trim(companyName || '')) &&
      !isEmpty(trim(email || '')) &&
      !isEmpty(trim(billingAddress || '')) &&
      !isEmpty(trim(country || '')) &&
      !isEmpty(trim(state || '')) &&
      !isEmpty(trim(city || '')) &&
      !isEmpty(trim(zipCode || '')) &&
      isValid &&
      savechecked

    return canPayBill
  }
  const queryParams: GetDefaultCardQueryParams = {
    accountIdentifier: accountId
  }

  const { loading: cardLoading, data: fetchedCreditCardData } = useGetDefaultCard({ queryParams })
  const [savechecked, setSaveChecked] = useState<boolean>(false)
  useEffect(() => {
    // call get card api
    // if card exists setAdCard as false and load the existing card scren with details with option for user to use the card or add new card
    // if user used the same card move to final review page
    // if user selects add new card ,move to credit card add page and flow conitnues
    if (fetchedCreditCardData === null) {
      setLoadPaymentMethodStep(true)
    } else {
      setLoadPaymentMethodStep(false)
      setSubscriptionProps({
        ...subscriptionProps,
        paymentMethodInfo: {
          ...subscriptionProps.paymentMethodInfo,
          nameOnCard: fetchedCreditCardData.data?.name || '',
          last4digits: fetchedCreditCardData.data?.last4 || '',
          cardType: fetchedCreditCardData.data?.brand || '',
          expireDate: `${fetchedCreditCardData.data?.expireMonth}/${fetchedCreditCardData.data?.expireYear}`
        }
      })
    }
    trackEvent(CreditCard.CalculatorStripeElementLoaded, {
      category: Category.CREDIT_CARD,
      module
    })
    return () => {
      trackEvent(CreditCard.CalculatorPaymentMethodStepExited, {
        category: Category.CREDIT_CARD,
        module
      })
    }
  }, [fetchedCreditCardData])
  if (cardLoading) {
    return <ContainerSpinner />
  }

  return (
    <Layout.Vertical className={className}>
      <Header step={2} />
      {loadPaymentMethodStep ? (
        <PaymentMethod
          setSaveChecked={(value: boolean) => {
            setSaveChecked(value)
          }}
          nameOnCard={subscriptionProps.paymentMethodInfo?.nameOnCard}
          setNameOnCard={(value: string) => {
            setSubscriptionProps({
              ...subscriptionProps,
              paymentMethodInfo: {
                ...subscriptionProps.paymentMethodInfo,
                nameOnCard: value
              }
            })
          }}
          setValidCard={(value: boolean) => {
            setSubscriptionProps({
              ...subscriptionProps,
              isValid: value
            })
          }}
        />
      ) : (
        <Layout.Vertical>
          <Layout.Horizontal>
            <Radio
              large
              onChange={() => {
                setUseExistingCard(true)
                setAddCard(false)
              }}
              checked={useExistingCard}
              className={css.useExistingCard}
            >
              <PaymentMethodCard
                paymentMethodInfo={subscriptionProps.paymentMethodInfo}
                setView={setView}
                module={module}
                fromPaymentMethodPage={true}
              />
            </Radio>
          </Layout.Horizontal>
          <Radio
            large
            onChange={() => {
              setAddCard(true)
              setUseExistingCard(false)
            }}
            label={getString('common.addNewCreditCard')}
            data-testid={`addNewCard`}
            checked={addCard}
          >
            {' '}
          </Radio>
        </Layout.Vertical>
      )}
      <Footer
        loadPaymentMethodStep={loadPaymentMethodStep}
        setLoadPaymentMethodStep={(value: boolean) => setLoadPaymentMethodStep(value)}
        addCard={addCard}
        canPay={canPay()}
        setView={setView}
        setInvoiceData={setInvoiceData}
        nameOnCard={subscriptionProps.paymentMethodInfo?.nameOnCard}
        billingInfo={subscriptionProps.billingContactInfo}
        subscriptionId={subscriptionProps.subscriptionId}
        setBillingContactInfo={(value: BillingContactProps) => {
          setSubscriptionProps({
            ...subscriptionProps,
            billingContactInfo: value
          })
        }}
        setPaymentMethodInfo={(value: PaymentMethodProps) => {
          setSubscriptionProps({
            ...subscriptionProps,
            paymentMethodInfo: value
          })
        }}
        paymentMethodInfo={subscriptionProps.paymentMethodInfo}
      />
    </Layout.Vertical>
  )
}
