import test from 'ava'

import Binance from 'index'

import { checkFields } from '../utils'
import { binancePublicConfig } from '../config'

const client = Binance(binancePublicConfig)

test('[WS] trades - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.trades('ETHBTC', trade => {
            checkFields(t, trade, [
                'eventType',
                'tradeId',
                'tradeTime',
                'quantity',
                'price',
                'symbol',
            ])
            t.is(trade.symbol, 'ETHBTC')
            clean()
            resolve()
        })
    })
})

test('[WS] trades - multiple symbols', t => {
    return new Promise(resolve => {
        const symbols = ['BNBBTC', 'ETHBTC', 'BNTBTC']

        const clean = client.ws.trades(symbols, trade => {
            checkFields(t, trade, [
                'eventType',
                'tradeId',
                'tradeTime',
                'quantity',
                'price',
                'symbol',
            ])
            t.truthy(symbols.includes(trade.symbol))
            clean()
            resolve()
        })
    })
})

test('[WS] trades - raw data without transform', t => {
    return new Promise(resolve => {
        const clean = client.ws.trades(
            'ETHBTC',
            trade => {
                // Raw data should have lowercase field names
                t.truthy(trade.e)
                t.truthy(trade.E)
                t.truthy(trade.s)
                t.truthy(trade.t)
                t.truthy(trade.p)
                t.truthy(trade.q)
                clean()
                resolve()
            },
            false,
        )
    })
})

test('[WS] aggTrades - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.aggTrades(['ETHBTC'], trade => {
            checkFields(t, trade, [
                'eventType',
                'aggId',
                'timestamp',
                'quantity',
                'price',
                'symbol',
                'firstId',
                'lastId',
            ])
            t.is(trade.symbol, 'ETHBTC')
            clean()
            resolve()
        })
    })
})

test('[WS] aggTrades - multiple symbols', t => {
    return new Promise(resolve => {
        const symbols = ['BNBBTC', 'ETHBTC', 'BNTBTC']

        const clean = client.ws.aggTrades(symbols, trade => {
            checkFields(t, trade, [
                'eventType',
                'aggId',
                'timestamp',
                'quantity',
                'price',
                'symbol',
                'firstId',
                'lastId',
            ])
            t.truthy(symbols.includes(trade.symbol))
            clean()
            resolve()
        })
    })
})

test('[WS] aggTrades - raw data without transform', t => {
    return new Promise(resolve => {
        const clean = client.ws.aggTrades(
            'ETHBTC',
            trade => {
                // Raw data should have lowercase field names
                t.truthy(trade.e)
                t.truthy(trade.E)
                t.truthy(trade.s)
                t.truthy(trade.a)
                t.truthy(trade.p)
                t.truthy(trade.q)
                clean()
                resolve()
            },
            false,
        )
    })
})

test.skip('[WS] futuresAggTrades - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresAggTrades(['BTCUSDT'], trade => {
            checkFields(t, trade, [
                'eventType',
                'symbol',
                'aggId',
                'price',
                'quantity',
                'firstId',
                'lastId',
                'timestamp',
                'isBuyerMaker',
            ])
            t.is(trade.symbol, 'BTCUSDT')
            clean()
            resolve()
        })
    })
})

test.skip('[WS] deliveryAggTrades - single symbol', t => {
    return new Promise(resolve => {
        const clean = client.ws.deliveryAggTrades('TRXUSD_PERP', trade => {
            checkFields(t, trade, [
                'eventType',
                'eventTime',
                'symbol',
                'aggId',
                'price',
                'quantity',
                'firstId',
                'lastId',
                'timestamp',
                'isBuyerMaker',
            ])
            t.is(trade.symbol, 'TRXUSD_PERP')
            clean()
            resolve()
        })
    })
})
