/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Classes } from '@blueprintjs/core'
import { Layout, Dialog, Text, IconName } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { StringsMap } from 'stringTypes'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { CostCalculator } from '@auth-settings/components/Subscription/CostCalculator/CostCalculator'
import { FinalReview } from '@auth-settings/components/Subscription/FinalReview/FinalReview'
import { Success } from '@auth-settings/components/Subscription/Success/Success'
import { BillingInfo } from '@auth-settings/components/Subscription/BillingInfo/BillingInfo'
import type { Module } from 'framework/types/ModuleName'
import { Editions, SubscribeViews, SubscriptionProps, TimeType } from '@common/constants/SubscriptionTypes'
import type { InvoiceDetailDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import PricePreview from '@auth-settings/components/Subscription/PricePreview/PricePreview'
import SubscriptionPoll from '@auth-settings/components/Subscription/PaymentMethod/SubscriptionPoll'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import useRegionList, { Country, StateByCountryMap } from '@common/hooks/useRegionList'
import PaymentMethodStep from '@auth-settings/components/Subscription/PaymentMethod/PaymentMethodStep'
import { getTitleByModule } from '../../components/Subscription/subscriptionUtils'
import { SubscriptionProvider, useSubscriptionContext, getSkewsMap } from './SubscriptionStore'
import css from './useSubscriptionModal.module.scss'

interface UseSubscribeModalReturns {
  openSubscribeModal: ({ _plan, _module, _time }: OpenSubscribeModalProps) => void
  closeSubscribeModal: () => void
}
type SetStateMethod = (props: SubscriptionProps | ((old: SubscriptionProps) => SubscriptionProps)) => void

interface OpenSubscribeModalProps {
  _module: Module
  _time: TimeType
  _plan: Editions
}
interface LabelValue {
  label: string
  value: string
}
interface UseSubscribeModalProps {
  module: Module
  time: TimeType
  plan: Editions
  onClose: () => void
  countries: LabelValue[]
  states: StateByCountryMap
}

interface LeftViewProps {
  module: Module
  subscriptionProps: SubscriptionProps
  invoiceData?: InvoiceDetailDTO
  setSubscriptionProps: (value: SubscriptionProps) => void
  setInvoiceData: (value?: InvoiceDetailDTO) => void
  view: SubscribeViews
  setView: (value: SubscribeViews) => void
  countries: LabelValue[]
  states: StateByCountryMap
  onPriceSkewsLoad: (skews: KVPair[]) => void
}

interface KVPair {
  [key: string]: any
}

const stripePromise = window.stripeApiKey ? loadStripe(window.stripeApiKey) : Promise.resolve(null)

const View: React.FC<UseSubscribeModalProps> = ({ module, plan, time, onClose, countries, states }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  const { email, accounts } = currentUserInfo
  const companyName = accounts?.find(account => account.uuid === accountId)?.companyName || ''
  const [view, setView] = useState(SubscribeViews.CALCULATE)
  const [subscriptionProps, setSubscriptionProps] = useState<SubscriptionProps>({
    edition: plan,
    premiumSupport: false,
    paymentFreq: time,
    subscriptionId: '',
    quantities: {
      featureFlag: {
        numberOfMau: plan === 'TEAM' ? 100 : 1,
        numberOfDevelopers: 1
      },
      ci: { numberOfDevelopers: 1 }
    },
    billingContactInfo: {
      name: '',
      email: email || '',
      billingAddress: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      companyName
    },
    paymentMethodInfo: {
      paymentMethodId: '',
      cardType: '',
      expireDate: '',
      last4digits: '',
      nameOnCard: ''
    },
    productPrices: { monthly: [], yearly: [] },
    sampleDetails: { sampleUnit: '', sampleMultiplier: 0, minValue: 0 },
    isValid: false
  })

  const [invoiceData, setInvoiceData] = useState<InvoiceDetailDTO>()
  const { getString } = useStrings()
  const { updateStore } = useSubscriptionContext()
  const onPriceSkewsLoad = (skews: KVPair[]): void => {
    const skewsMap = getSkewsMap(skews)
    updateStore(skewsMap)
  }

  if (view === SubscribeViews.SUCCESS) {
    return (
      <Success
        module={module}
        subscriptionProps={subscriptionProps}
        invoiceData={invoiceData}
        className={css.success}
        onClose={onClose}
      />
    )
  }

  const { icon, description } = getTitleByModule(module)

  const titleDescr = `${getString(description as keyof StringsMap)} ${getString('common.plans.subscription')}`
  const title: React.ReactElement = (
    <Text
      icon={icon as IconName}
      iconProps={{ size: 24, padding: { right: 'small' } }}
      font={{ variation: FontVariation.H4 }}
      padding={{ bottom: 'large' }}
    >
      {titleDescr}
    </Text>
  )

  return (
    <Layout.Vertical>
      {title}
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }} className={css.view}>
        <LeftView
          countries={countries}
          states={states}
          module={module}
          subscriptionProps={subscriptionProps}
          invoiceData={invoiceData}
          setSubscriptionProps={setSubscriptionProps}
          setInvoiceData={setInvoiceData}
          view={view}
          setView={setView}
          onPriceSkewsLoad={onPriceSkewsLoad}
        />
        <PricePreview
          subscriptionProps={subscriptionProps}
          subscriptionDetails={subscriptionProps}
          setSubscriptionDetails={setSubscriptionProps}
          module={module}
          invoiceData={invoiceData}
          canChangePaymentFrequency={view < SubscribeViews.PAYMENT_METHOD}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const LeftView = ({
  module,
  subscriptionProps,
  invoiceData,
  setInvoiceData,
  setSubscriptionProps,
  view,
  setView,
  countries,
  states,
  onPriceSkewsLoad
}: LeftViewProps): React.ReactElement => {
  switch (view) {
    case SubscribeViews.FINALREVIEW:
      return (
        <FinalReview
          setView={setView}
          invoiceData={invoiceData}
          subscriptionProps={subscriptionProps}
          className={css.leftView}
          module={module}
        />
      )
    case SubscribeViews.PAYMENT_METHOD:
      return invoiceData?.paymentIntent?.clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret: invoiceData?.paymentIntent?.clientSecret }}>
          <PaymentMethodStep
            setView={setView}
            subscriptionProps={subscriptionProps}
            setInvoiceData={setInvoiceData}
            setSubscriptionProps={setSubscriptionProps}
            className={css.leftView}
            module={module}
          />
        </Elements>
      ) : (
        <SubscriptionPoll
          subscriptionProps={subscriptionProps}
          setInvoiceData={setInvoiceData}
          setSubscriptionProps={setSubscriptionProps}
          module={module}
        />
      )
    case SubscribeViews.BILLINGINFO:
      return (
        <BillingInfo
          setView={setView}
          subscriptionProps={subscriptionProps}
          setInvoiceData={setInvoiceData}
          setSubscriptionProps={setSubscriptionProps}
          className={css.leftView}
          countries={countries}
          states={states}
          module={module}
        />
      )
    case SubscribeViews.CALCULATE:
    default:
      return (
        <CostCalculator
          module={module}
          setView={setView}
          subscriptionProps={subscriptionProps}
          setSubscriptionProps={setSubscriptionProps as SetStateMethod}
          className={css.leftView}
          onPriceSkewsLoad={onPriceSkewsLoad}
        />
      )
  }
}

export const useSubscribeModal = ({ onClose }: { onClose?: () => void }): UseSubscribeModalReturns => {
  const [newPlan, setNewPlan] = useState<Editions>(Editions.FREE)
  const [time, setTime] = useState<TimeType>(TimeType.YEARLY)
  const [module, setModule] = useState<Module>('cf')
  const { countries, states } = useRegionList()

  const handleClose = (): void => {
    onClose?.()
    hideModal()
  }
  const countryList = useMemo(
    () => countries.map((country: Country) => ({ label: country.name, value: country.countryCode })),
    [countries]
  )

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={handleClose}
        isOpen
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
        isCloseButtonShown
      >
        <SubscriptionProvider>
          <View
            countries={countryList}
            states={states}
            module={module}
            plan={newPlan}
            time={time}
            onClose={handleClose}
          />
        </SubscriptionProvider>
      </Dialog>
    ),
    [newPlan, time, module]
  )
  const open = React.useCallback(
    ({ _plan, _time, _module }: OpenSubscribeModalProps) => {
      setNewPlan(_plan)
      setTime(_time)
      setModule(_module)
      openModal()
    },
    [openModal]
  )

  return {
    openSubscribeModal: open,
    closeSubscribeModal: hideModal
  }
}
