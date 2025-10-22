import test from 'ava'

import Binance from 'index'

import { checkFields } from '../utils'

const client = Binance({ proxy: 'http://188.245.226.105:8911' })

// Note: Liquidation streams are skipped as they may not always have active liquidations to test

test.skip('[WS] futuresLiquidations - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresLiquidations('BTCUSDT', liquidation => {
            checkFields(t, liquidation, [
                'symbol',
                'price',
                'origQty',
                'lastFilledQty',
                'accumulatedQty',
                'averagePrice',
                'status',
                'timeInForce',
                'type',
                'side',
                'time',
            ])
            t.is(liquidation.symbol, 'BTCUSDT')
            t.truthy(typeof liquidation.price === 'string')
            t.truthy(typeof liquidation.origQty === 'string')
            clean()
            resolve()
        })
    })
})

test.skip('[WS] futuresLiquidations - multiple symbols', t => {
    return new Promise(resolve => {
        const symbols = ['BTCUSDT', 'ETHUSDT']

        const clean = client.ws.futuresLiquidations(symbols, liquidation => {
            checkFields(t, liquidation, [
                'symbol',
                'price',
                'origQty',
                'lastFilledQty',
                'accumulatedQty',
                'averagePrice',
                'status',
                'timeInForce',
                'type',
                'side',
                'time',
            ])
            t.truthy(symbols.includes(liquidation.symbol))
            clean()
            resolve()
        })
    })
})

test.skip('[WS] futuresLiquidations - raw data', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresLiquidations(
            'BTCUSDT',
            liquidation => {
                // Raw data should contain the 'o' object wrapper
                t.truthy(liquidation.o)
                t.truthy(liquidation.o.s)
                t.truthy(liquidation.o.p)
                t.truthy(liquidation.o.q)
                clean()
                resolve()
            },
            false,
        )
    })
})

test.skip('[WS] futuresAllLiquidations', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresAllLiquidations(liquidation => {
            checkFields(t, liquidation, [
                'symbol',
                'price',
                'origQty',
                'lastFilledQty',
                'accumulatedQty',
                'averagePrice',
                'status',
                'timeInForce',
                'type',
                'side',
                'time',
            ])
            t.truthy(liquidation.symbol)
            clean()
            resolve()
        })
    })
})

test.skip('[WS] futuresAllLiquidations - raw data', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresAllLiquidations(liquidation => {
            // Raw data should contain the 'o' object wrapper
            t.truthy(liquidation.o)
            t.truthy(liquidation.o.s)
            t.truthy(liquidation.o.p)
            clean()
            resolve()
        }, false)
    })
})

test.skip('[WS] futuresAllLiquidations - cleanup function', t => {
    const clean = client.ws.futuresAllLiquidations(() => {
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
