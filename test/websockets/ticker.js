import test from 'ava'

import Binance from 'index'

import { checkFields } from '../utils'

const client = Binance()

test('[WS] ticker - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.ticker('ETHBTC', ticker => {
            checkFields(t, ticker, [
                'eventType',
                'eventTime',
                'symbol',
                'priceChange',
                'priceChangePercent',
                'weightedAvg',
                'prevDayClose',
                'curDayClose',
                'closeTradeQuantity',
                'bestBid',
                'bestBidQnt',
                'bestAsk',
                'bestAskQnt',
                'open',
                'high',
                'low',
                'volume',
                'volumeQuote',
                'openTime',
                'closeTime',
                'firstTradeId',
                'lastTradeId',
                'totalTrades',
            ])
            t.is(ticker.symbol, 'ETHBTC')
            clean()
            resolve()
        })
    })
})

test('[WS] ticker - multiple symbols', t => {
    return new Promise(resolve => {
        let count = 0
        const symbols = ['ETHBTC', 'BTCUSDT', 'BNBBTC']
        const receivedSymbols = {}

        const clean = client.ws.ticker(symbols, ticker => {
            checkFields(t, ticker, [
                'symbol',
                'eventType',
                'eventTime',
                'priceChange',
                'open',
                'high',
            ])
            t.truthy(symbols.includes(ticker.symbol))
            receivedSymbols[ticker.symbol] = true
            count++

            // Once we've received at least one message for each symbol, we're done
            if (Object.keys(receivedSymbols).length === symbols.length || count >= 10) {
                clean()
                resolve()
            }
        })
    })
})

test('[WS] ticker - raw data without transform', t => {
    return new Promise(resolve => {
        const clean = client.ws.ticker(
            'ETHBTC',
            ticker => {
                // Raw data should have lowercase field names (e, E, s, p, etc.)
                t.truthy(ticker.e)
                t.truthy(ticker.E)
                t.truthy(ticker.s)
                t.is(ticker.s, 'ETHBTC')
                clean()
                resolve()
            },
            false,
        )
    })
})

test('[WS] ticker - transformed data', t => {
    return new Promise(resolve => {
        const clean = client.ws.ticker(
            'ETHBTC',
            ticker => {
                // Transformed data should have camelCase field names
                t.truthy(ticker.eventType)
                t.truthy(ticker.eventTime)
                t.truthy(ticker.symbol)
                t.is(ticker.eventType, '24hrTicker')
                t.is(ticker.symbol, 'ETHBTC')
                // Should NOT have raw field names
                t.falsy(ticker.e)
                t.falsy(ticker.E)
                t.falsy(ticker.s)
                clean()
                resolve()
            },
            true,
        )
    })
})

test('[WS] ticker - cleanup function', t => {
    const clean = client.ws.ticker('ETHBTC', () => {
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

test('[WS] allTickers', t => {
    return new Promise(resolve => {
        const clean = client.ws.allTickers(tickers => {
            t.truthy(Array.isArray(tickers))
            t.is(tickers[0].eventType, '24hrTicker')
            checkFields(t, tickers[0], ['symbol', 'priceChange', 'priceChangePercent'])
            clean()
            resolve()
        })
    })
})

test('[WS] miniTicker - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.miniTicker('ETHBTC', ticker => {
            checkFields(t, ticker, [
                'open',
                'high',
                'low',
                'curDayClose',
                'eventTime',
                'symbol',
                'volume',
                'volumeQuote',
            ])
            t.is(ticker.symbol, 'ETHBTC')
            clean()
            resolve()
        })
    })
})

test('[WS] allMiniTickers', t => {
    return new Promise(resolve => {
        const clean = client.ws.allMiniTickers(tickers => {
            t.truthy(Array.isArray(tickers))
            t.is(tickers[0].eventType, '24hrMiniTicker')
            checkFields(t, tickers[0], [
                'open',
                'high',
                'low',
                'curDayClose',
                'eventTime',
                'symbol',
                'volume',
                'volumeQuote',
            ])
            clean()
            resolve()
        })
    })
})

test('[WS] futuresTicker - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresTicker('BTCUSDT', ticker => {
            checkFields(t, ticker, [
                'eventType',
                'eventTime',
                'symbol',
                'priceChange',
                'priceChangePercent',
                'weightedAvg',
                'curDayClose',
                'closeTradeQuantity',
                'open',
                'high',
                'low',
                'volume',
                'volumeQuote',
                'openTime',
                'closeTime',
                'firstTradeId',
                'lastTradeId',
                'totalTrades',
            ])
            t.is(ticker.symbol, 'BTCUSDT')
            // Futures ticker should NOT have prevDayClose, bestBid, bestBidQnt, bestAsk, bestAskQnt
            t.falsy(ticker.prevDayClose)
            t.falsy(ticker.bestBid)
            clean()
            resolve()
        })
    })
})

test.skip('[WS] deliveryTicker - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.deliveryTicker('TRXUSD_PERP', ticker => {
            checkFields(t, ticker, [
                'eventType',
                'eventTime',
                'symbol',
                'pair',
                'priceChange',
                'priceChangePercent',
                'weightedAvg',
                'curDayClose',
                'closeTradeQuantity',
                'open',
                'high',
                'low',
                'volume',
                'volumeBase',
                'openTime',
                'closeTime',
                'firstTradeId',
                'lastTradeId',
                'totalTrades',
            ])
            t.is(ticker.symbol, 'TRXUSD_PERP')
            t.truthy(ticker.pair)
            // Delivery ticker has volumeBase instead of volumeQuote
            t.truthy(ticker.volumeBase)
            t.falsy(ticker.volumeQuote)
            clean()
            resolve()
        })
    })
})
