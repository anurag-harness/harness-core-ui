/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { get, toInteger } from 'lodash-es'
import type { PriceDTO, SubscriptionDetailDTO } from 'services/cd-ng/index'
import type {
  Editions,
  ProductPricesProp,
  SubscriptionProps,
  Product,
  SampleData
} from '@common/constants/SubscriptionTypes'
import { TimeType } from '@common/constants/SubscriptionTypes'
import { getDollarAmount } from '@auth-settings/utils'
import type { Module } from 'framework/types/ModuleName'

export const PLAN_TYPES: { [key: string]: string } = {
  DEVELOPERS: 'DEVELOPERS',
  MAU: 'MAU',
  MAU_SUPPORT: 'MAU_SUPPORT',
  PREMIUM_SUPPORT: 'PREMIUM_SUPPORT',
  DEVELOPERS_SUPPORT: 'DEVELOPERS_SUPPORT'
}
export function getRenewDate(time: TimeType): string {
  const today = new Date()
  if (time === TimeType.MONTHLY) {
    return new Date(today.setMonth(today.getMonth() + 1)).toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return new Date(today.setFullYear(today.getFullYear() + 1)).toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getOtherRenewDate(time: TimeType, prevDate: any): string {
  if (time === TimeType.MONTHLY) {
    return new Date(prevDate.setMonth(prevDate.getMonth() + 1)).toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return new Date(prevDate.setFullYear(prevDate.getFullYear() + 1)).toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
export function getOtherRenewPrevDate(time: TimeType, prevDate: any): string {
  if (time === TimeType.MONTHLY) {
    return new Date(prevDate.setMonth(prevDate.getMonth())).toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return new Date(prevDate.setFullYear(prevDate.getFullYear())).toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getTodayDate(): string {
  const today = new Date()

  return new Date(today.setFullYear(today.getFullYear())).toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getProductPrices(plan: Editions, time: TimeType, productPrices: ProductPricesProp): PriceDTO[] {
  const prices: PriceDTO[] = []

  if (time === TimeType.MONTHLY) {
    productPrices.monthly.forEach(price => {
      if (price.metaData?.edition?.includes(plan)) {
        prices.push(price)
      }
    })
  }

  if (time === TimeType.YEARLY) {
    productPrices.yearly.forEach(price => {
      if (price.metaData?.edition?.includes(plan)) {
        prices.push(price)
      }
    })
  }

  return prices
}

export function getTitleByModule(module: Module): { icon?: string; description?: string; title?: string } {
  let icon, description, title
  switch (module) {
    case 'cf': {
      icon = 'ff-solid'
      description = 'common.purpose.cf.continuous'
      title = 'common.moduleTitles.cf'
      break
    }
    case 'ci': {
      icon = 'ci-solid'
      description = 'common.purpose.ci.continuous'
      title = 'common.purpose.ci.continuous'
      break
    }
  }

  return { icon, description, title }
}

export function getSubscriptionBreakdownsByModuleAndFrequency({
  module,
  subscriptionDetails
}: {
  module: Module
  subscriptionDetails: SubscriptionProps
}): Product[] {
  const { productPrices, quantities, paymentFreq } = subscriptionDetails
  const products: Product[] = []
  switch (module) {
    case 'cf':
      {
        if (paymentFreq === TimeType.MONTHLY) {
          const developerUnitPrice = getDollarAmount(
            productPrices.monthly?.find(product => {
              return isSelectedPlan(product, false, subscriptionDetails.edition, PLAN_TYPES.DEVELOPERS)
            })?.unitAmount
          )
          products.push({
            paymentFrequency: paymentFreq,
            description: 'common.subscriptions.usage.developers',
            unitDescription: 'common.perDeveloper',
            quantity: quantities?.featureFlag?.numberOfDevelopers || 0,
            unitPrice: developerUnitPrice
          })

          const numberOfMauMonthly = quantities?.featureFlag?.numberOfMau || 0
          const mauUnitPrice = getDollarAmount(
            productPrices.monthly?.find(productPrice => {
              const isSamePlan = isSelectedPlan(productPrice, false, subscriptionDetails.edition, PLAN_TYPES.MAU)
              if (isSamePlan) {
                const numMausFromMap = numberOfMauMonthly * toInteger(productPrice.metaData?.sampleMultiplier)
                const priceMin = strToNumber(productPrice.metaData?.min || '')
                const priceMax = strToNumber(productPrice.metaData?.max || '')
                const isValidRange = numMausFromMap >= priceMin && numMausFromMap <= priceMax
                if (isValidRange) {
                  return productPrice
                }
              }
            })?.unitAmount
          )
          products.push({
            paymentFrequency: paymentFreq,
            description: 'platform.authSettings.costCalculator.maus',
            unitDescription: 'platform.authSettings.costCalculator.mau.perkMau',
            underComment: 'platform.authSettings.costCalculator.mau.kMauFree',
            quantity: numberOfMauMonthly,
            unitPrice: mauUnitPrice
          })
        }
        if (paymentFreq === TimeType.YEARLY) {
          const developerUnitPrice = getDollarAmount(
            productPrices.yearly?.find(product => {
              return isSelectedPlan(product, false, subscriptionDetails.edition, PLAN_TYPES.DEVELOPERS)
            })?.unitAmount
          )

          products.push({
            paymentFrequency: paymentFreq,
            description: 'common.subscriptions.usage.developers',
            unitDescription: 'common.perDeveloper',
            quantity: quantities?.featureFlag?.numberOfDevelopers || 0,
            unitPrice: developerUnitPrice
          })
          const numberOfMauYearly = quantities?.featureFlag?.numberOfMau || 0

          const mauUnitPrice = getDollarAmount(
            productPrices.yearly?.find(productPrice => {
              const isSamePlan = isSelectedPlan(productPrice, false, subscriptionDetails.edition, PLAN_TYPES.MAU)
              if (isSamePlan) {
                const numMausFromMap = numberOfMauYearly * toInteger(productPrice.metaData?.sampleMultiplier)
                const priceMin = strToNumber(productPrice.metaData?.min || '')
                const priceMax = strToNumber(productPrice.metaData?.max || '')
                const isValidRange = numMausFromMap >= priceMin && numMausFromMap <= priceMax
                if (isValidRange) {
                  return productPrice
                }
              }
            })?.unitAmount
          )
          products.push({
            paymentFrequency: paymentFreq,
            description: 'platform.authSettings.costCalculator.maus',
            unitDescription: 'platform.authSettings.costCalculator.mau.permMau',
            underComment: 'platform.authSettings.costCalculator.mau.mMauFree',
            quantity: numberOfMauYearly,
            unitPrice: mauUnitPrice
          })
        }
      }
      break
    case 'ci':
      {
        if (paymentFreq === TimeType.MONTHLY) {
          const developerUnitPrice = getDollarAmount(
            productPrices.monthly?.find(product => {
              return isSelectedPlan(product, false, subscriptionDetails.edition, PLAN_TYPES.DEVELOPERS)
            })?.unitAmount
          )
          products.push({
            paymentFrequency: paymentFreq,
            description: 'common.subscriptions.usage.developers',
            unitDescription: 'common.perDeveloper',
            quantity: quantities?.ci?.numberOfDevelopers || 1,
            unitPrice: developerUnitPrice
          })
        }
        if (paymentFreq === TimeType.YEARLY) {
          const developerUnitPrice = getDollarAmount(
            productPrices.yearly?.find(product => {
              return isSelectedPlan(product, false, subscriptionDetails.edition, PLAN_TYPES.DEVELOPERS)
            })?.unitAmount
          )

          products.push({
            paymentFrequency: paymentFreq,
            description: 'common.subscriptions.usage.developers',
            unitDescription: 'common.perDeveloper',
            quantity: quantities?.ci?.numberOfDevelopers || 1,
            unitPrice: developerUnitPrice
          })
        }
      }
      break
  }

  return products
}

export const strToNumber = (str = '0'): number => {
  return Number.parseInt(str.replace(/,/g, ''))
}

export const getPlanType = (plan: string, isSupport?: boolean): string => {
  return isSupport ? `${PLAN_TYPES[plan]}_SUPPORT` : PLAN_TYPES[plan]
}

export const isSelectedPlan = (
  price: PriceDTO,
  premiumSupport: boolean,
  edition: string,
  planType: string
): boolean => {
  const hasSamePlan = price.metaData?.type === getPlanType(planType, premiumSupport)
  const hasSameEdition = price.metaData?.edition === edition
  if (hasSameEdition && hasSamePlan) {
    return true
  }
  return false
}

export const getSampleData = (planType: string, productPrices: PriceDTO[]): SampleData => {
  const sampleData: SampleData = { sampleUnit: '', sampleMultiplier: 0, minValue: 0 }
  productPrices.forEach(price => {
    if (price.metaData?.type === planType) {
      sampleData.sampleMultiplier = toInteger(price.metaData?.sampleMultiplier)
      sampleData.sampleUnit = price.metaData?.sampleUnit
      const currMinValue = toInteger(strToNumber(price.metaData?.min))
      sampleData.minValue = sampleData.minValue === 0 ? currMinValue : Math.min(sampleData.minValue, currMinValue)
    }
  })

  sampleData.minValue =
    (sampleData.minValue - (sampleData.minValue % sampleData.sampleMultiplier)) / sampleData.sampleMultiplier
  return sampleData
}

export const getSubscriptionByPaymentFrequency = (
  data: SubscriptionDetailDTO[]
): { [key: string]: SubscriptionDetailDTO[] } => {
  const subscriptionByPaymentFrequencyMap = {
    [TimeType.YEARLY]: [] as SubscriptionDetailDTO[],
    [TimeType.MONTHLY]: [] as SubscriptionDetailDTO[]
  }
  data.forEach(subs => {
    if (get(subs, 'latestInvoiceDetail.items[1].price.metaData.billed') === TimeType.YEARLY) {
      subscriptionByPaymentFrequencyMap[TimeType.YEARLY].push(subs)
    }
    if (get(subs, 'latestInvoiceDetail.items[1].price.metaData.billed') === TimeType.MONTHLY) {
      subscriptionByPaymentFrequencyMap[TimeType.MONTHLY].push(subs)
    }
  })
  return subscriptionByPaymentFrequencyMap
}

export const toDollars = (num = 0): number => (num === 0 ? 0 : num / 100)

export const getSampleMinValue = (unit?: string): string => (unit === 'K' ? `100K` : `1M`)

export const getQuantityFromValue = (value: string, multiplier: string, unit: string): string => {
  const currValue = toInteger(strToNumber(value))
  const sampleMultiplier = toInteger(strToNumber(multiplier))

  return `${currValue / sampleMultiplier}${unit}`
}
export const getRecommendedNumbers = (
  recommeneded: number,
  sampleMultiplier: number,
  valuesArray: number[]
): number => {
  let recommendedNumber = valuesArray[0]
  const recNum = recommeneded
  for (const value of valuesArray) {
    if (recNum < value * sampleMultiplier) {
      recommendedNumber = value
      break
    }
  }
  return recommendedNumber
}
