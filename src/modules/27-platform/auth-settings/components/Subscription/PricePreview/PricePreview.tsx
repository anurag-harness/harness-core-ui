/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import { defaultTo, toInteger, isNil } from 'lodash-es'
import { Text, Layout, Toggle } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { TimeType, SubscriptionProps, CurrencyType } from '@common/constants/SubscriptionTypes'
import { Module, ModuleName } from 'framework/types/ModuleName'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { getAmountInCurrency, getDollarAmount } from '@auth-settings/utils'
import type { InvoiceDetailDTO } from 'services/cd-ng'
import { Category, CreditCard } from '@common/constants/TrackingConstants'
import SubcriptionDetails from './SubscriptionDetails'
import {
  getRenewDate,
  getSubscriptionBreakdownsByModuleAndFrequency,
  isSelectedPlan,
  PLAN_TYPES,
  strToNumber,
  getTodayDate,
  getOtherRenewDate,
  getOtherRenewPrevDate
} from '../subscriptionUtils'
import css from './PricePreview.module.scss'

interface PricePreviewProps {
  subscriptionDetails: SubscriptionProps
  setSubscriptionDetails: (value: SubscriptionProps) => void
  module: Module
  canChangePaymentFrequency?: boolean
  invoiceData?: InvoiceDetailDTO
  subscriptionProps: SubscriptionProps
}

const PaymentFrequencyToggle: React.FC<{
  paymentFrequency: TimeType
  setPaymentFrequency: (value: TimeType) => void
  disabled?: boolean
}> = ({ paymentFrequency, setPaymentFrequency, disabled }) => {
  const { getString } = useStrings()
  const monthlyClassName = paymentFrequency === TimeType.MONTHLY ? css.selected : ''
  const yearlyClassName = paymentFrequency === TimeType.YEARLY ? css.selected : ''
  return (
    <Layout.Vertical padding={{ bottom: 'large' }} spacing="small">
      <Text>{getString('common.billed')}</Text>
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'baseline', justifyContent: 'start' }}>
        <Text className={monthlyClassName}>{getString('common.monthly')}</Text>
        <Toggle
          disabled={disabled}
          data-testid="toggle"
          checked={paymentFrequency === TimeType.YEARLY}
          onToggle={isToggled => {
            setPaymentFrequency(isToggled ? TimeType.YEARLY : TimeType.MONTHLY)
          }}
          className={css.paymentFrequency}
        />
        <Layout.Horizontal>
          <Text className={yearlyClassName}>{getString('common.yearly')}</Text>
          <Text className={yearlyClassName}>{getString('platform.authSettings.pricePreview.discount')}</Text>
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const Footer: React.FC<{
  invoiceData?: InvoiceDetailDTO
  payingFrequency: TimeType
  totalAmount: number
  module: Module
}> = ({ invoiceData, payingFrequency, totalAmount, module }) => {
  const { getString } = useStrings()

  const { licenseInformation } = useLicenseStore()
  const frequency = payingFrequency === TimeType.MONTHLY ? getString('common.perMonth') : getString('common.perYear')
  const renewDate = getRenewDate(payingFrequency)
  const todayDate = getTodayDate()
  let otherSubStartDate
  if (licenseInformation['CF']?.edition !== 'FREE' && licenseInformation['CF']?.startTime) {
    otherSubStartDate = new Date(licenseInformation['CF']?.startTime)
  }
  if (licenseInformation['CI']?.edition !== 'FREE' && licenseInformation['CI']?.startTime) {
    otherSubStartDate = new Date(licenseInformation['CI']?.startTime)
  }

  let otherRenewDate = ''
  if (otherSubStartDate !== undefined) {
    otherRenewDate = getOtherRenewDate(payingFrequency, otherSubStartDate)
    if (licenseInformation['CF']?.edition !== 'FREE' && licenseInformation['CF']?.startTime) {
      otherSubStartDate = new Date(licenseInformation['CF']?.startTime)
    }
    if (licenseInformation['CI']?.edition !== 'FREE' && licenseInformation['CI']?.startTime) {
      otherSubStartDate = new Date(licenseInformation['CI']?.startTime)
    }
    otherSubStartDate = getOtherRenewPrevDate(payingFrequency, otherSubStartDate)
  }

  const width = '320px'

  return (
    <Layout.Vertical>
      <Layout.Horizontal
        flex={{ justifyContent: 'space-between' }}
        className={module === ModuleName.CI.toLowerCase() ? css.footerStyleCi : css.footerStyleFf}
      >
        <Text font={{ variation: FontVariation.H2 }}>{getString('common.payNow')}</Text>
        <Text font={{ variation: FontVariation.H2 }}>
          {getAmountInCurrency(
            CurrencyType.USD,
            invoiceData?.amountDue !== undefined ? invoiceData?.amountDue / 100 : totalAmount
          )}
          {frequency}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Text font={{ size: 'xsmall' }}>
          {getString('platform.authSettings.autoRenewal', { date: otherRenewDate !== '' ? otherRenewDate : renewDate })}
        </Text>
      </Layout.Horizontal>
      {otherRenewDate !== '' && renewDate !== otherRenewDate ? (
        <>
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} style={{ marginTop: '10px' }}>
            <Text font={{ size: 'xsmall' }}>{`${otherSubStartDate}`}</Text>
            <Text font={{ size: 'xsmall' }} style={{ marginRight: '128px' }}>{`${todayDate}`}</Text>
            <Text font={{ size: 'xsmall' }}>{`${otherRenewDate}`}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal className={css.parentTime}>
            <Layout.Horizontal
              className={css.parentTimeChild1}
              style={{ borderRight: `${width} solid var(--primary-7)` }}
            ></Layout.Horizontal>
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Text font={{ size: 'xsmall' }}>{getString('platform.authSettings.proRata', { date: todayDate })}</Text>
            <Text font={{ size: 'xsmall' }}>{`-${otherRenewDate}`}</Text>
          </Layout.Horizontal>
        </>
      ) : null}
    </Layout.Vertical>
  )
}

function getColorByModule(module: Module): string | undefined {
  switch (module) {
    case 'cf':
      return css.cf
    case 'ci':
      return css.ci
  }
  return undefined
}

const PricePreview: React.FC<PricePreviewProps> = ({
  module,
  subscriptionDetails,
  setSubscriptionDetails,
  canChangePaymentFrequency,
  invoiceData,
  subscriptionProps
}) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { paymentFreq, productPrices, premiumSupport, quantities, taxAmount } = subscriptionDetails
  const products = useMemo(() => {
    return getSubscriptionBreakdownsByModuleAndFrequency({ module, subscriptionDetails })
  }, [module, subscriptionDetails])
  const numberOfMau = defaultTo(quantities?.featureFlag?.numberOfMau, 0)
  const premiumSupportUnitPriceForDevs = getDollarAmount(
    productPrices.yearly.find(price => {
      const isSamePlan = isSelectedPlan(price, premiumSupport, subscriptionDetails.edition, PLAN_TYPES.DEVELOPERS)
      if (isSamePlan) {
        return price
      }
    })?.unitAmount
  )
  const isPremuiumSupported = subscriptionProps?.premiumSupport || false
  const premiumSupportUnitPriceForMau = getDollarAmount(
    productPrices.yearly.find(price => {
      const isSamePlan = isSelectedPlan(price, premiumSupport, subscriptionDetails.edition, PLAN_TYPES.MAU)
      if (isSamePlan) {
        const numMausFromMap = numberOfMau * toInteger(price.metaData?.sampleMultiplier)
        const priceMin = strToNumber(price.metaData?.min || '')
        const priceMax = strToNumber(price.metaData?.max || '')
        const isValidRange = numMausFromMap >= priceMin && numMausFromMap <= priceMax
        if (isValidRange) {
          return price
        }
      }
    })?.unitAmount
  )
  const colorBorder = getColorByModule(module)
  const premiumSupportUnitPrice = premiumSupportUnitPriceForMau + premiumSupportUnitPriceForDevs * products[0].quantity
  const devAmount = products[0].quantity * products[0].unitPrice
  let totalAmount = devAmount
  if (paymentFreq === TimeType.YEARLY) {
    const mauUnitAmount = getDollarAmount(
      productPrices.yearly.find(price => {
        const isSamePlan = isSelectedPlan(price, false, subscriptionDetails.edition, PLAN_TYPES.MAU)
        if (isSamePlan) {
          const numMausFromMap = numberOfMau * toInteger(price.metaData?.sampleMultiplier)
          const priceMin = strToNumber(price.metaData?.min || '')
          const priceMax = strToNumber(price.metaData?.max || '')
          const isValidRange = numMausFromMap >= priceMin && numMausFromMap <= priceMax
          if (isValidRange) {
            return price
          }
        }
      })?.unitAmount
    )

    totalAmount = premiumSupport ? totalAmount + mauUnitAmount + premiumSupportUnitPrice : totalAmount + mauUnitAmount
    totalAmount = !isNil(taxAmount) ? totalAmount + taxAmount : totalAmount
  } else {
    const mauUnitAmount = getDollarAmount(
      productPrices.monthly.find(price => {
        const isSamePlan = isSelectedPlan(price, false, subscriptionDetails.edition, PLAN_TYPES.MAU)
        if (isSamePlan) {
          const numMausFromMap = numberOfMau * toInteger(price.metaData?.sampleMultiplier)
          const priceMin = strToNumber(price.metaData?.min || '')
          const priceMax = strToNumber(price.metaData?.max || '')
          const isValidRange = numMausFromMap >= priceMin && numMausFromMap <= priceMax
          if (isValidRange) {
            return price
          }
        }
      })?.unitAmount
    )

    totalAmount = premiumSupport ? totalAmount + mauUnitAmount + premiumSupportUnitPrice : totalAmount + mauUnitAmount
    totalAmount = !isNil(taxAmount) ? totalAmount + taxAmount : totalAmount
  }
  return (
    <Layout.Vertical className={cx(css.pricePreview, colorBorder)}>
      <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'large' }}>
        {getString('platform.authSettings.pricePreview.title')}
      </Text>
      <PaymentFrequencyToggle
        disabled={!canChangePaymentFrequency || isPremuiumSupported}
        paymentFrequency={paymentFreq}
        setPaymentFrequency={(value: TimeType) => {
          if (value === TimeType.MONTHLY) {
            trackEvent(CreditCard.MonthlyBillingCycleSelected, {
              category: Category.CREDIT_CARD,
              module
            })
            setSubscriptionDetails({
              ...subscriptionDetails,
              paymentFreq: value,
              premiumSupport: false
            })
          } else {
            trackEvent(CreditCard.YearlyBillingCycleSelected, {
              category: Category.CREDIT_CARD,
              module
            })
            setSubscriptionDetails({
              ...subscriptionDetails,
              paymentFreq: value
            })
          }
        }}
      />
      <SubcriptionDetails
        subscriptionDetails={subscriptionDetails}
        products={products}
        premiumSupportAmount={premiumSupportUnitPrice}
        totalAmount={totalAmount}
      />
      {!isNil(taxAmount) && invoiceData?.totalAmount !== undefined ? (
        <Footer payingFrequency={paymentFreq} invoiceData={invoiceData} totalAmount={totalAmount} module={module} />
      ) : null}
    </Layout.Vertical>
  )
}

export default PricePreview
