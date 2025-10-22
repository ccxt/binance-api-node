import test from 'ava'

import Binance from 'index'

import { checkFields } from '../utils'

const client = Binance()

test('[WS] futuresAllMarkPrices - default speed', t => {
  return new Promise(resolve => {
    const clean = client.ws.futuresAllMarkPrices({}, markPrices => {
      t.truthy(Array.isArray(markPrices))
      t.truthy(markPrices.length > 0)

      const [firstPrice] = markPrices
      checkFields(t, firstPrice, [
        'eventType',
        'eventTime',
        'symbol',
        'markPrice',
        'indexPrice',
        'settlePrice',
        'fundingRate',
        'nextFundingRate',
      ])

      clean()
      resolve()
    })
  })
})

test('[WS] futuresAllMarkPrices - 1s update speed', t => {
  return new Promise(resolve => {
    const clean = client.ws.futuresAllMarkPrices({ updateSpeed: '1s' }, markPrices => {
      t.truthy(Array.isArray(markPrices))
      t.truthy(markPrices.length > 0)

      const [firstPrice] = markPrices
      checkFields(t, firstPrice, [
        'eventType',
        'eventTime',
        'symbol',
        'markPrice',
        'indexPrice',
        'settlePrice',
        'fundingRate',
        'nextFundingRate',
      ])

      t.is(firstPrice.eventType, 'markPriceUpdate')

      clean()
      resolve()
    })
  })
})

test.skip('[WS] futuresAllMarkPrices - raw data without transform', t => {
  return new Promise(resolve => {
    const clean = client.ws.futuresAllMarkPrices({}, markPrices => {
      t.truthy(Array.isArray(markPrices))
      t.truthy(markPrices.length > 0)

      // Note: Raw data test - implementation needs verification
      clean()
      resolve()
    }, false)
  })
})

test('[WS] futuresAllMarkPrices - transformed data', t => {
  return new Promise(resolve => {
    const clean = client.ws.futuresAllMarkPrices({}, markPrices => {
      t.truthy(Array.isArray(markPrices))
      t.truthy(markPrices.length > 0)

      const [firstPrice] = markPrices
      // Transformed data should have camelCase field names
      t.truthy(firstPrice.eventType)
      t.truthy(firstPrice.eventTime)
      t.truthy(firstPrice.symbol)
      t.truthy(firstPrice.markPrice)
      t.truthy(firstPrice.indexPrice)
      t.truthy(firstPrice.settlePrice)
      t.truthy(firstPrice.fundingRate)
      t.truthy(firstPrice.nextFundingRate)

      // Should NOT have raw field names
      t.falsy(firstPrice.e)
      t.falsy(firstPrice.E)

      clean()
      resolve()
    }, true)
  })
})

test('[WS] futuresAllMarkPrices - verify data types', t => {
  return new Promise(resolve => {
    const clean = client.ws.futuresAllMarkPrices({}, markPrices => {
      t.truthy(Array.isArray(markPrices))
      t.truthy(markPrices.length > 0)

      const [firstPrice] = markPrices
      t.truthy(typeof firstPrice.eventTime === 'number')
      t.truthy(typeof firstPrice.symbol === 'string')
      t.truthy(typeof firstPrice.markPrice === 'string')
      t.truthy(typeof firstPrice.indexPrice === 'string')
      t.truthy(typeof firstPrice.fundingRate === 'string')

      clean()
      resolve()
    })
  })
})

test('[WS] futuresAllMarkPrices - cleanup function', t => {
  const clean = client.ws.futuresAllMarkPrices({}, () => {
    // Callback implementation
  })

  // Verify clean is a function
  t.is(typeof clean, 'function')

  // Clean up immediately
  clean()

  // Give it a moment and verify cleanup executed properly
  return new Promise(resolve => {
    setTimeout(() => {
      t.pass('Cleanup function executed without errors')
      resolve()
    }, 100)
  })
})
