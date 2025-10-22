import test from 'ava'

import Binance from 'index'

import { checkFields } from '../utils'

const client = Binance()

test('[WS] bookTicker - single symbol', t => {
  return new Promise(resolve => {
    const clean = client.ws.bookTicker('ETHBTC', ticker => {
      checkFields(t, ticker, ['updateId', 'symbol', 'bestBid', 'bestBidQnt', 'bestAsk', 'bestAskQnt'])
      t.is(ticker.symbol, 'ETHBTC')
      t.truthy(typeof ticker.bestBid === 'string')
      t.truthy(typeof ticker.bestAsk === 'string')
      t.truthy(typeof ticker.bestBidQnt === 'string')
      t.truthy(typeof ticker.bestAskQnt === 'string')
      clean()
      resolve()
    })
  })
})

test('[WS] bookTicker - multiple symbols', t => {
  return new Promise(resolve => {
    const symbols = ['ETHBTC', 'BTCUSDT', 'BNBBTC']

    const clean = client.ws.bookTicker(symbols, ticker => {
      checkFields(t, ticker, ['updateId', 'symbol', 'bestBid', 'bestBidQnt', 'bestAsk', 'bestAskQnt'])
      t.truthy(symbols.includes(ticker.symbol))
      clean()
      resolve()
    })
  })
})

test('[WS] bookTicker - raw data without transform', t => {
  return new Promise(resolve => {
    const clean = client.ws.bookTicker('ETHBTC', ticker => {
      // Raw data should have lowercase field names
      t.truthy(ticker.u)
      t.truthy(ticker.s)
      t.truthy(ticker.b)
      t.truthy(ticker.B)
      t.truthy(ticker.a)
      t.truthy(ticker.A)
      clean()
      resolve()
    }, false)
  })
})

test('[WS] bookTicker - transformed data', t => {
  return new Promise(resolve => {
    const clean = client.ws.bookTicker('ETHBTC', ticker => {
      // Transformed data should have camelCase field names
      t.truthy(ticker.updateId)
      t.truthy(ticker.symbol)
      t.truthy(ticker.bestBid)
      t.truthy(ticker.bestBidQnt)
      t.truthy(ticker.bestAsk)
      t.truthy(ticker.bestAskQnt)
      // Should NOT have raw field names
      t.falsy(ticker.u)
      t.falsy(ticker.s)
      clean()
      resolve()
    }, true)
  })
})

test('[WS] bookTicker - cleanup function', t => {
  const clean = client.ws.bookTicker('ETHBTC', () => {
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
