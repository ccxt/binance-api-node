import test from 'ava'

import Binance from 'index'

import { checkFields } from '../utils'

const client = Binance({ proxy: 'http://188.245.226.105:8911' })

test('[WS] candles - missing parameters', t => {
    try {
        client.ws.candles('ETHBTC', d => d)
        t.fail('Should have thrown an error')
    } catch (e) {
        t.is(e.message, 'Please pass a symbol, interval and callback.')
    }
})

test('[WS] candles - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.candles('ETHBTC', '5m', candle => {
            checkFields(t, candle, [
                'open',
                'high',
                'low',
                'close',
                'volume',
                'trades',
                'quoteVolume',
            ])
            t.is(candle.symbol, 'ETHBTC')
            t.is(candle.interval, '5m')
            clean()
            resolve()
        })
    })
})

test('[WS] candles - multiple symbols', t => {
    return new Promise(resolve => {
        const symbols = ['ETHBTC', 'BNBBTC', 'BNTBTC']

        const clean = client.ws.candles(symbols, '5m', candle => {
            checkFields(t, candle, [
                'open',
                'high',
                'low',
                'close',
                'volume',
                'trades',
                'quoteVolume',
            ])
            t.truthy(symbols.includes(candle.symbol))
            clean()
            resolve()
        })
    })
})

test('[WS] candles - raw data without transform', t => {
    return new Promise(resolve => {
        const clean = client.ws.candles(
            'ETHBTC',
            '1m',
            candle => {
                // Raw data should have the structure with 'k' key
                t.truthy(candle.e)
                t.truthy(candle.E)
                t.truthy(candle.s)
                t.truthy(candle.k)
                clean()
                resolve()
            },
            false,
        )
    })
})

test('[WS] candles - transformed data', t => {
    return new Promise(resolve => {
        const clean = client.ws.candles(
            'ETHBTC',
            '1m',
            candle => {
                // Transformed data should have camelCase field names
                t.truthy(candle.eventType)
                t.truthy(candle.eventTime)
                t.truthy(candle.symbol)
                t.truthy(candle.open)
                t.truthy(candle.close)
                // Should NOT have raw field names
                t.falsy(candle.k)
                clean()
                resolve()
            },
            true,
        )
    })
})

test('[WS] futuresCandles - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresCandles('BTCUSDT', '5m', candle => {
            checkFields(t, candle, [
                'open',
                'high',
                'low',
                'close',
                'volume',
                'trades',
                'quoteVolume',
            ])
            t.is(candle.symbol, 'BTCUSDT')
            t.is(candle.interval, '5m')
            clean()
            resolve()
        })
    })
})

test.skip('[WS] deliveryCandles - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.deliveryCandles('TRXUSD_PERP', '5m', candle => {
            checkFields(t, candle, [
                'open',
                'high',
                'low',
                'close',
                'volume',
                'trades',
                'baseVolume',
            ])
            t.is(candle.symbol, 'TRXUSD_PERP')
            t.is(candle.interval, '5m')
            // Delivery candles have baseVolume instead of quoteVolume
            t.truthy(candle.baseVolume)
            t.falsy(candle.quoteVolume)
            clean()
            resolve()
        })
    })
})
