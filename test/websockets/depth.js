import test from 'ava'

import Binance from 'index'

import { checkFields } from '../utils'

const client = Binance({proxy: "http://188.245.226.105:8911"})

test('[WS] depth - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.depth('ETHBTC', depth => {
            checkFields(t, depth, [
                'eventType',
                'eventTime',
                'firstUpdateId',
                'finalUpdateId',
                'symbol',
                'bidDepth',
                'askDepth',
            ])
            t.is(depth.symbol, 'ETHBTC')
            clean()
            resolve()
        })
    })
})

test('[WS] depth - with update speed', t => {
    return new Promise(resolve => {
        const clean = client.ws.depth('ETHBTC@100ms', depth => {
            checkFields(t, depth, [
                'eventType',
                'eventTime',
                'firstUpdateId',
                'finalUpdateId',
                'symbol',
                'bidDepth',
                'askDepth',
            ])
            t.is(depth.symbol, 'ETHBTC')
            clean()
            resolve()
        })
    })
})

test('[WS] partialDepth - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.partialDepth({ symbol: 'ETHBTC', level: 10 }, depth => {
            checkFields(t, depth, ['lastUpdateId', 'bids', 'asks', 'symbol', 'level'])
            t.is(depth.symbol, 'ETHBTC')
            t.is(depth.level, 10)
            t.truthy(Array.isArray(depth.bids))
            t.truthy(Array.isArray(depth.asks))
            clean()
            resolve()
        })
    })
})

test('[WS] partialDepth - with update speed', t => {
    return new Promise(resolve => {
        const clean = client.ws.partialDepth({ symbol: 'ETHBTC@100ms', level: 10 }, depth => {
            checkFields(t, depth, ['lastUpdateId', 'bids', 'asks'])
            t.truthy(Array.isArray(depth.bids))
            t.truthy(Array.isArray(depth.asks))
            clean()
            resolve()
        })
    })
})

test('[WS] futuresDepth - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresDepth('BTCUSDT', depth => {
            checkFields(t, depth, [
                'eventType',
                'eventTime',
                'transactionTime',
                'symbol',
                'firstUpdateId',
                'finalUpdateId',
                'prevFinalUpdateId',
                'bidDepth',
                'askDepth',
            ])
            t.is(depth.symbol, 'BTCUSDT')
            t.truthy(depth.prevFinalUpdateId !== undefined)
            clean()
            resolve()
        })
    })
})

test('[WS] futuresPartialDepth - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresPartialDepth({ symbol: 'BTCUSDT', level: 10 }, depth => {
            checkFields(t, depth, [
                'level',
                'eventType',
                'eventTime',
                'transactionTime',
                'symbol',
                'firstUpdateId',
                'finalUpdateId',
                'prevFinalUpdateId',
                'bidDepth',
                'askDepth',
            ])
            t.is(depth.symbol, 'BTCUSDT')
            t.is(depth.level, 10)
            clean()
            resolve()
        })
    })
})

test.skip('[WS] deliveryDepth - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.deliveryDepth('TRXUSD_PERP', depth => {
            checkFields(t, depth, [
                'eventType',
                'eventTime',
                'transactionTime',
                'symbol',
                'pair',
                'firstUpdateId',
                'finalUpdateId',
                'prevFinalUpdateId',
                'bidDepth',
                'askDepth',
            ])
            t.is(depth.symbol, 'TRXUSD_PERP')
            t.truthy(depth.pair)
            clean()
            resolve()
        })
    })
})

test.skip('[WS] deliveryPartialDepth - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.deliveryPartialDepth(
            { symbol: 'TRXUSD_PERP', level: 10 },
            depth => {
                checkFields(t, depth, [
                    'level',
                    'eventType',
                    'eventTime',
                    'transactionTime',
                    'symbol',
                    'pair',
                    'firstUpdateId',
                    'finalUpdateId',
                    'prevFinalUpdateId',
                    'bidDepth',
                    'askDepth',
                ])
                t.is(depth.symbol, 'TRXUSD_PERP')
                t.is(depth.level, 10)
                t.truthy(depth.pair)
                clean()
                resolve()
            },
        )
    })
})
