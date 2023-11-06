/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Editions, TimeType } from '@common/constants/SubscriptionTypes'
import {
  getRenewDate,
  getTitleByModule,
  getSubscriptionBreakdownsByModuleAndFrequency,
  getProductPrices
} from '../subscriptionUtils'

const billingContactInfo = {
  name: 'Jane Doe',
  email: 'jane.doe@test.com',
  billingAddress: 'billing address',
  city: 'dallas',
  state: 'TX',
  country: 'US',
  zipCode: '79809',
  companyName: 'Harness'
}

const paymentMethodInfo = {
  paymentMethodId: '1',
  cardType: 'visa',
  expireDate: 'Jan 30 2023',
  last4digits: '1234',
  nameOnCard: 'Jane Doe'
}

const productPrices = {
  monthly: [
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3IB74lUSX',
      currency: 'usd',
      unitAmount: 100,
      lookupKey: 'FF_TEAM_MAU_MONTHLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'MAUS'
      },
      active: true
    },
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3IB74lUSz',
      currency: 'usd',
      unitAmount: 200,
      lookupKey: 'FF_TEAM_DEVELOPERS_MONTHLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'DEVELOPERS'
      },
      active: true
    }
  ],
  yearly: [
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3uzYZEPws',
      currency: 'usd',
      unitAmount: 300 * 12,
      lookupKey: 'FF_TEAM_MAU_YEARLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'MAUS'
      },
      active: true
    },
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3IB74lUSw',
      currency: 'usd',
      unitAmount: 400 * 12,
      lookupKey: 'FF_TEAM_DEVELOPERS_YEARLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'DEVELOPERS'
      },
      active: true
    }
  ]
}

const subscriptionDetails = {
  edition: Editions.TEAM,
  premiumSupport: false,
  paymentFreq: TimeType.MONTHLY,
  subscriptionId: '1',
  billingContactInfo,
  paymentMethodInfo,
  productPrices,
  quantities: {
    featureFlag: {
      numberOfDevelopers: 25,
      numberOfMau: 12
    }
  },
  isValid: false
}

describe.skip('subscriptionUtils', () => {
  test('getRenewDate', () => {
    let today = new Date()
    const monthlyRenewDate = getRenewDate(TimeType.MONTHLY)
    const oneMonthLater = new Date(today.setMonth(today.getMonth() + 1)).toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    expect(monthlyRenewDate).toStrictEqual(oneMonthLater)

    today = new Date()
    const yearlyRenewDate = getRenewDate(TimeType.YEARLY)
    const oneYearLater = new Date(today.setFullYear(today.getFullYear() + 1)).toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    expect(yearlyRenewDate).toStrictEqual(oneYearLater)
  })

  describe.skip('getProductPrices', () => {
    const newProductPrices = {
      monthly: [
        {
          unitAmount: 100,
          lookupKey: 'DEVELOPERS_ENTERPRISE'
        }
      ],
      yearly: [
        {
          unitAmount: 200,
          lookupKey: 'DEVELOPERS_ENTERPRISE'
        }
      ]
    }

    const newProductPrices2 = {
      monthly: [
        {
          unitAmount: 100,
          lookupKey: 'DEVELOPERS_TEAM'
        }
      ],
      yearly: [
        {
          unitAmount: 200,
          lookupKey: 'DEVELOPERS_TEAM'
        }
      ]
    }
    test('yearly', () => {
      const monthly = getProductPrices(Editions.ENTERPRISE, TimeType.YEARLY, newProductPrices)
      expect(monthly).toStrictEqual([
        {
          unitAmount: 200,
          lookupKey: 'DEVELOPERS_ENTERPRISE'
        }
      ])
    })

    test('yearly empty', () => {
      const monthly = getProductPrices(Editions.ENTERPRISE, TimeType.YEARLY, newProductPrices2)
      expect(monthly).toStrictEqual([])
    })

    test('monthly', () => {
      const monthly = getProductPrices(Editions.ENTERPRISE, TimeType.MONTHLY, newProductPrices)
      expect(monthly).toStrictEqual([
        {
          unitAmount: 100,
          lookupKey: 'DEVELOPERS_ENTERPRISE'
        }
      ])
    })
    test('monthly empty', () => {
      const monthly = getProductPrices(Editions.ENTERPRISE, TimeType.MONTHLY, newProductPrices2)
      expect(monthly).toStrictEqual([])
    })
  })

  describe.skip('getTitleByModule', () => {
    test('getTitleByModule', () => {
      const cf = getTitleByModule('cf')
      expect(cf).toStrictEqual({
        icon: 'ff-solid',
        description: 'common.purpose.cf.continuous',
        title: 'common.purpose.cf.continuous'
      })

      const cd = getTitleByModule('cd')
      expect(cd).toStrictEqual({
        icon: 'cd-solid',
        description: 'common.purpose.cd.continuous',
        title: ''
      })

      const ci = getTitleByModule('ci')
      expect(ci).toStrictEqual({
        icon: 'ci-solid',
        description: 'common.purpose.ci.continuous',
        title: ''
      })

      const ce = getTitleByModule('ce')
      expect(ce).toStrictEqual({
        icon: 'ccm-solid',
        description: 'common.purpose.ce.continuous',
        title: ''
      })

      const cv = getTitleByModule('cv')
      expect(cv).toStrictEqual({
        icon: 'cv-solid',
        description: 'common.purpose.cv.continuous',
        title: ''
      })

      const sto = getTitleByModule('sto')
      expect(sto).toStrictEqual({
        icon: 'sto-color-filled',
        description: 'common.purpose.sto.continuous',
        title: ''
      })

      const chaos = getTitleByModule('chaos')
      expect(chaos).toStrictEqual({
        icon: 'chaos-solid',
        description: 'common.purpose.chaos.continuous',
        title: ''
      })
    })
  })

  describe.skip('getSubscriptionBreakdownsByModuleAndFrequency', () => {
    test('cf monthly', () => {
      const res = getSubscriptionBreakdownsByModuleAndFrequency({
        module: 'cf',
        subscriptionDetails
      })

      expect(res).toStrictEqual([
        {
          paymentFrequency: 'monthly',
          description: 'common.subscriptions.usage.developers',
          unitDescription: 'common.perDeveloper',
          quantity: 25,
          unitPrice: 2
        },
        {
          paymentFrequency: 'monthly',
          description: 'platform.authSettings.costCalculator.maus',
          unitDescription: 'platform.authSettings.costCalculator.mau.perkMau',
          underComment: 'platform.authSettings.costCalculator.mau.kMauFree',
          quantity: 12,
          unitPrice: 1
        }
      ])
    })

    test('cf monthly no quantities', () => {
      const res = getSubscriptionBreakdownsByModuleAndFrequency({
        module: 'cf',
        subscriptionDetails: {
          ...subscriptionDetails,
          quantities: {}
        }
      })

      expect(res).toStrictEqual([
        {
          paymentFrequency: 'monthly',
          description: 'common.subscriptions.usage.developers',
          unitDescription: 'common.perDeveloper',
          quantity: 0,
          unitPrice: 2
        },
        {
          paymentFrequency: 'monthly',
          description: 'platform.authSettings.costCalculator.maus',
          unitDescription: 'platform.authSettings.costCalculator.mau.perkMau',
          underComment: 'platform.authSettings.costCalculator.mau.kMauFree',
          quantity: 0,
          unitPrice: 1
        }
      ])
    })

    test('cf yearly', () => {
      const res = getSubscriptionBreakdownsByModuleAndFrequency({
        module: 'cf',
        subscriptionDetails: {
          ...subscriptionDetails,
          paymentFreq: TimeType.YEARLY
        }
      })

      expect(res).toStrictEqual([
        {
          paymentFrequency: 'Yearly',
          description: 'common.subscriptions.usage.developers',
          unitDescription: 'common.perDeveloper',
          quantity: 25,
          unitPrice: 4
        },
        {
          paymentFrequency: 'Yearly',
          description: 'platform.authSettings.costCalculator.maus',
          unitDescription: 'platform.authSettings.costCalculator.mau.permMau',
          underComment: 'platform.authSettings.costCalculator.mau.mMauFree',
          quantity: 12,
          unitPrice: 3
        }
      ])
    })

    test('cf yearly no quantities', () => {
      const res = getSubscriptionBreakdownsByModuleAndFrequency({
        module: 'cf',
        subscriptionDetails: {
          ...subscriptionDetails,
          quantities: {},
          paymentFreq: TimeType.YEARLY
        }
      })

      expect(res).toStrictEqual([
        {
          paymentFrequency: 'Yearly',
          description: 'common.subscriptions.usage.developers',
          unitDescription: 'common.perDeveloper',
          quantity: 0,
          unitPrice: 4
        },
        {
          paymentFrequency: 'Yearly',
          description: 'platform.authSettings.costCalculator.maus',
          unitDescription: 'platform.authSettings.costCalculator.mau.permMau',
          underComment: 'platform.authSettings.costCalculator.mau.mMauFree',
          quantity: 0,
          unitPrice: 3
        }
      ])
    })

    test('default', () => {
      const res = getSubscriptionBreakdownsByModuleAndFrequency({
        module: 'cd',
        subscriptionDetails
      })

      expect(res).toStrictEqual([])
    })
  })
})
