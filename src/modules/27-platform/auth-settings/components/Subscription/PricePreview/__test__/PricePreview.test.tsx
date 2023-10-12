/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { Module } from 'framework/types/ModuleName'
import { Editions, TimeType } from '@common/constants/SubscriptionTypes'
import PricePreview from '../PricePreview'
import { getOtherRenewDate, getOtherRenewPrevDate, getRenewDate, getProductPrices } from '../../subscriptionUtils'

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
      unitAmount: 9000,
      lookupKey: 'FF_TEAM_MAU_MONTHLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'MAUS'
      },
      active: true
    }
  ],
  yearly: [
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3uzYZEPws',
      currency: 'usd',
      unitAmount: 90000,
      lookupKey: 'FF_TEAM_MAU_YEARLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'MAUS'
      },
      active: true
    }
  ]
}

const subscriptionDetails = {
  edition: Editions.TEAM,
  premiumSupport: true,
  paymentFreq: TimeType.YEARLY,
  subscriptionId: '1',
  billingContactInfo,
  taxAmount: 1000,
  paymentMethodInfo,
  productPrices,
  sampleDetails: {
    minValue: 0,
    sampleUnit: 'K',
    sampleMultiplier: 0
  },
  quantities: {
    featureFlag: {
      numberOfDevelopers: 25,
      numberOfMau: 12
    },
    ci: {
      numberOfDevelopers: 200
    }
  },
  isValid: false
}

const invoiceData = {
  totalAmount: 1000
}

describe('PricePreview', () => {
  const setSubscriptionDetailsMock = jest.fn()
  const props = {
    subscriptionDetails,
    setSubscriptionDetails: setSubscriptionDetailsMock,
    subscriptionProps: {
      edition: Editions.TEAM,
      premiumSupport: true,
      paymentFreq: TimeType.MONTHLY,
      subscriptionId: 'sdas',
      billingContactInfo: {
        name: 'sdad',
        email: 'sadadsad',
        billingAddress: 'asddsada',
        city: 'asdadsa',
        state: 'sdsas',
        country: 'adsda',
        zipCode: 'adsasd',
        companyName: 'sdasd'
      },
      paymentMethodInfo: {
        paymentMethodId: 'asdadas',
        cardType: 'VISA',
        expireDate: '23/05/29',
        last4digits: '2342',
        nameOnCard: 'sdasd'
      },
      productPrices: { monthly: [], yearly: [] },
      isValid: true
    },
    module: 'cf' as Module
  }

  test('render', async () => {
    const { container } = render(
      <TestWrapper>
        <PricePreview {...props} />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test.skip('setSubscriptionDetails toggle monthly', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <PricePreview {...props} />
      </TestWrapper>
    )
    await userEvent.click(getByTestId('toggle'))
    await waitFor(() => {
      expect(setSubscriptionDetailsMock).toHaveBeenCalledWith({
        ...subscriptionDetails,
        paymentFreq: TimeType.MONTHLY,
        premiumSupport: false
      })
    })
  })

  test.skip('setSubscriptionDetails toggle yearly', async () => {
    const newProps = {
      subscriptionDetails: {
        ...subscriptionDetails,
        paymentFreq: TimeType.MONTHLY
      },
      subscriptionProps: {
        edition: Editions.TEAM,
        premiumSupport: true,
        paymentFreq: TimeType.MONTHLY,
        subscriptionId: 'sdas',
        billingContactInfo: {
          name: 'sdad',
          email: 'sadadsad',
          billingAddress: 'asddsada',
          city: 'asdadsa',
          state: 'sdsas',
          country: 'adsda',
          zipCode: 'adsasd',
          companyName: 'sdasd'
        },
        paymentMethodInfo: {
          paymentMethodId: 'asdadas',
          cardType: 'VISA',
          expireDate: '23/05/29',
          last4digits: '2342',
          nameOnCard: 'sdasd'
        },
        productPrices: { monthly: [], yearly: [] },
        isValid: true
      },
      setSubscriptionDetails: setSubscriptionDetailsMock,
      module: 'cf' as Module
    }
    const { getByTestId } = render(
      <TestWrapper>
        <PricePreview {...newProps} />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('toggle'))
    expect(setSubscriptionDetailsMock).toBeCalled()
  })
})
describe('PricePreview ci credit card', () => {
  const setSubscriptionDetailsMock = jest.fn()
  const props = {
    subscriptionDetails,
    setSubscriptionDetails: setSubscriptionDetailsMock,
    invoiceData,
    subscriptionProps: {
      edition: Editions.TEAM,
      premiumSupport: true,
      paymentFreq: TimeType.MONTHLY,
      subscriptionId: 'sdas',
      billingContactInfo: {
        name: 'sdad',
        email: 'sadadsad',
        billingAddress: 'asddsada',
        city: 'asdadsa',
        state: 'sdsas',
        country: 'adsda',
        zipCode: 'adsasd',
        companyName: 'sdasd'
      },
      paymentMethodInfo: {
        paymentMethodId: 'asdadas',
        cardType: 'VISA',
        expireDate: '23/05/29',
        last4digits: '2342',
        nameOnCard: 'sdasd'
      },
      productPrices: { monthly: [], yearly: [] },
      isValid: true
    },
    module: 'ci' as Module
  }

  test('render ci', async () => {
    const { container } = render(
      <TestWrapper>
        <PricePreview {...props} />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test('getOtherRenewDate util method ', () => {
    jest.useFakeTimers({ advanceTimers: true })
    jest.setSystemTime(new Date('2023-04-10'))
    const prevData = new Date()
    const returnedDate = getOtherRenewDate(TimeType.MONTHLY, prevData)
    expect(returnedDate.valueOf() === 'May 10, 2023').toBe(true)
    const returnedDateYearly = getOtherRenewDate(TimeType.YEARLY, prevData)
    expect(returnedDateYearly.valueOf() === 'May 10, 2024').toBe(true)
  })
  test('getOtherRenewPrevDate util method ', () => {
    jest.useFakeTimers({ advanceTimers: true })
    jest.setSystemTime(new Date('2023-04-10'))
    const prevData = new Date()
    const returnedDate = getOtherRenewPrevDate(TimeType.MONTHLY, prevData)
    expect(returnedDate.valueOf() === 'Apr 10, 2023').toBe(true)
    const returnedDateYearly = getOtherRenewPrevDate(TimeType.YEARLY, prevData)
    expect(returnedDateYearly.valueOf() === 'Apr 10, 2023').toBe(true)
  })
  test('getRenewDate util method ', () => {
    jest.useFakeTimers({ advanceTimers: true })
    jest.setSystemTime(new Date('2023-04-10'))
    const returnedDate = getRenewDate(TimeType.MONTHLY)
    expect(returnedDate.valueOf() === 'May 10, 2023').toBe(true)
  })
  test('getProductPrices util method ', () => {
    const returnedResult = getProductPrices(Editions.TEAM, TimeType.MONTHLY, {
      monthly: [{ metaData: { edition: Editions.TEAM } }],
      yearly: [{ metaData: { edition: Editions.TEAM } }]
    })
    const result = returnedResult[0]?.metaData?.edition === 'TEAM'
    expect(result).toBe(true)
    const returnedResultYearly = getProductPrices(Editions.ENTERPRISE, TimeType.YEARLY, {
      monthly: [{ metaData: { edition: Editions.TEAM } }],
      yearly: [{ metaData: { edition: Editions.ENTERPRISE, timeType: 'YEARLY' } }]
    })
    const resultYearly = returnedResultYearly[0]?.metaData?.edition === 'ENTERPRISE'
    expect(resultYearly).toBe(true)
  })
})
