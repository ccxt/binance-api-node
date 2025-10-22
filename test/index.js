import test from 'ava'

import Binance, { ErrorCodes } from 'index'
import { candleFields, deliveryCandleFields } from 'http-client'
import { userEventHandler } from 'websocket'

import { checkFields, createHttpServer } from './utils'

const client = Binance()

test('[MISC] Some error codes are defined', t => {
    t.truthy(ErrorCodes, 'The map is there')
    t.truthy(ErrorCodes.TOO_MANY_ORDERS, 'And we have this')
})

test('[REST] ping', async t => {
    t.truthy(await client.ping(), 'A simple ping should work')
})

test('[REST] time', async t => {
    const ts = await client.time()
    t.truthy(new Date(ts).getTime() > 0, 'The returned timestamp should be valid')
})

test('[REST] exchangeInfo', async t => {
    const res = await client.exchangeInfo()
    checkFields(t, res, ['timezone', 'serverTime', 'rateLimits', 'symbols'])
})

test('[REST] book', async t => {
    try {
        await client.book()
    } catch (e) {
        t.is(e.message, 'You need to pass a payload object.')
    }

    try {
        await client.book({})
    } catch (e) {
        t.is(e.message, 'Method book requires symbol parameter.')
    }

    const book = await client.book({ symbol: 'ETHBTC' })
    t.truthy(book.lastUpdateId)
    t.truthy(book.asks.length)
    t.truthy(book.bids.length)

    const [bid] = book.bids
    t.truthy(typeof bid.price === 'string')
    t.truthy(typeof bid.quantity === 'string')
})

test('[REST] candles', async t => {
    try {
        await client.candles({})
    } catch (e) {
        t.is(e.message, 'Method candles requires symbol parameter.')
    }

    const candles = await client.candles({ symbol: 'ETHBTC' })

    t.truthy(candles.length)

    const [candle] = candles
    checkFields(t, candle, candleFields)
})

test('[REST] aggTrades', async t => {
    try {
        await client.aggTrades({})
    } catch (e) {
        t.is(e.message, 'Method aggTrades requires symbol parameter.')
    }

    const trades = await client.aggTrades({ symbol: 'ETHBTC' })
    t.truthy(trades.length)

    const [trade] = trades
    t.truthy(trade.aggId)
    t.truthy(trade.symbol)
})

test('[REST] trades', async t => {
    const trades = await client.trades({ symbol: 'ETHBTC' })
    t.is(trades.length, 500)
})

test('[REST] dailyStats', async t => {
    const res = await client.dailyStats({ symbol: 'ETHBTC' })
    t.truthy(res)
    checkFields(t, res, ['highPrice', 'lowPrice', 'volume', 'priceChange'])
})

test('[REST] prices', async t => {
    const prices = await client.prices()
    t.truthy(prices)
    t.truthy(prices.ETHBTC)
})

test('[REST] individual price', async t => {
    const prices = await client.prices({ symbol: 'ETHUSDT' })
    t.truthy(prices)
    t.truthy(prices.ETHUSDT)
})

test('[REST] avgPrice', async t => {
    const res = await client.avgPrice({ symbol: 'ETHBTC' })
    t.truthy(res)
    checkFields(t, res, ['mins', 'price'])
})

test('[REST] allBookTickers', async t => {
    const tickers = await client.allBookTickers()
    t.truthy(tickers)
    t.truthy(tickers.ETHBTC)
})

test('[REST] Signed call without creds', async t => {
    try {
        await client.accountInfo()
    } catch (e) {
        t.is(e.message, 'You need to pass an API key and secret to make authenticated calls.')
    }
})

test('[REST] Signed call without creds - attempt getting tradeFee', async t => {
    try {
        await client.tradeFee()
    } catch (e) {
        t.is(e.message, 'You need to pass an API key and secret to make authenticated calls.')
    }
})

test('[REST] Server-side JSON error', async t => {
    const server = createHttpServer((req, res) => {
        res.statusCode = 500
        res.write(
            JSON.stringify({
                msg: 'Server unkown error',
                code: -1337,
            }),
        )
        res.end()
    })
    const localClient = Binance({ httpBase: server.url })

    try {
        await server.start()
        await localClient.ping()
        t.fail('did not throw')
    } catch (e) {
        t.is(e.message, 'Server unkown error')
        t.is(e.code, -1337)
    } finally {
        await server.stop()
    }
})

test('[REST] Server-side HTML error', async t => {
    const serverReponse = '<html>Server Internal Error</html>'
    const server = createHttpServer((req, res) => {
        res.statusCode = 500
        res.write(serverReponse)
        res.end()
    })
    const localClient = Binance({ httpBase: server.url })

    try {
        await server.start()
        await localClient.ping()
        t.fail('did not throw')
    } catch (e) {
        t.is(e.message, `500 Internal Server Error ${serverReponse}`)
        t.truthy(e.response)
        t.is(e.responseText, serverReponse)
    } finally {
        await server.stop()
    }
})

test('[WS] depth', t => {
    return new Promise(resolve => {
        client.ws.depth('ETHBTC', depth => {
            checkFields(t, depth, [
                'eventType',
                'eventTime',
                'firstUpdateId',
                'finalUpdateId',
                'symbol',
                'bidDepth',
                'askDepth',
            ])
            resolve()
        })
    })
})

test('[WS] depth with update speed', t => {
    return new Promise(resolve => {
        client.ws.depth('ETHBTC@100ms', depth => {
            checkFields(t, depth, [
                'eventType',
                'eventTime',
                'firstUpdateId',
                'finalUpdateId',
                'symbol',
                'bidDepth',
                'askDepth',
            ])
            resolve()
        })
    })
})

test('[WS] partial depth', t => {
    return new Promise(resolve => {
        client.ws.partialDepth({ symbol: 'ETHBTC', level: 10 }, depth => {
            checkFields(t, depth, ['lastUpdateId', 'bids', 'asks'])
            resolve()
        })
    })
})

test('[WS] partial depth with update speed', t => {
    return new Promise(resolve => {
        client.ws.partialDepth({ symbol: 'ETHBTC@100ms', level: 10 }, depth => {
            checkFields(t, depth, ['lastUpdateId', 'bids', 'asks'])
            resolve()
        })
    })
})

test('[WS] ticker', t => {
    return new Promise(resolve => {
        client.ws.ticker('ETHBTC', ticker => {
            checkFields(t, ticker, ['open', 'high', 'low', 'eventTime', 'symbol', 'volume'])
            resolve()
        })
    })
})

test('[WS] allTicker', t => {
    return new Promise(resolve => {
        client.ws.allTickers(tickers => {
            t.truthy(Array.isArray(tickers))
            t.is(tickers[0].eventType, '24hrTicker')
            checkFields(t, tickers[0], ['symbol', 'priceChange', 'priceChangePercent'])
            resolve()
        })
    })
})

test('[WS] miniTicker', t => {
    return new Promise(resolve => {
        client.ws.miniTicker('ETHBTC', ticker => {
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
            resolve()
        })
    })
})

test('[WS] allMiniTickers', t => {
    return new Promise(resolve => {
        client.ws.allMiniTickers(tickers => {
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
            resolve()
        })
    })
})

test('[WS] candles', t => {
    try {
        client.ws.candles('ETHBTC', d => d)
    } catch (e) {
        t.is(e.message, 'Please pass a symbol, interval and callback.')
    }

    return new Promise(resolve => {
        client.ws.candles(['ETHBTC', 'BNBBTC', 'BNTBTC'], '5m', candle => {
            checkFields(t, candle, [
                'open',
                'high',
                'low',
                'close',
                'volume',
                'trades',
                'quoteVolume',
            ])
            resolve()
        })
    })
})

test('[WS] trades', t => {
    return new Promise(resolve => {
        client.ws.trades(['BNBBTC', 'ETHBTC', 'BNTBTC'], trade => {
            checkFields(t, trade, [
                'eventType',
                'tradeId',
                'tradeTime',
                'quantity',
                'price',
                'symbol',
                // 'buyerOrderId',
                // 'sellerOrderId',
            ])
            resolve()
        })
    })
})

test('[WS] aggregate trades', t => {
    return new Promise(resolve => {
        client.ws.aggTrades(['BNBBTC', 'ETHBTC', 'BNTBTC'], trade => {
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
            resolve()
        })
    })
})

test.skip('[WS] liquidations', t => {
    return new Promise(resolve => {
        client.ws.futuresLiquidations('ETHBTC', liquidation => {
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
            resolve()
        })
    })
})

test.skip('[FUTURES-WS] all liquidations', t => {
    return new Promise(resolve => {
        client.ws.futuresAllLiquidations(liquidation => {
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
            resolve()
        })
    })
})

test('[WS] userEvents', t => {
    const accountPayload = {
        e: 'outboundAccountInfo',
        E: 1499405658849,
        m: 0,
        t: 0,
        b: 0,
        s: 0,
        T: true,
        W: true,
        D: true,
        u: 1499405658849,
        B: [
            {
                a: 'LTC',
                f: '17366.18538083',
                l: '0.00000000',
            },
            {
                a: 'BTC',
                f: '10537.85314051',
                l: '2.19464093',
            },
            {
                a: 'ETH',
                f: '17902.35190619',
                l: '0.00000000',
            },
            {
                a: 'BNC',
                f: '1114503.29769312',
                l: '0.00000000',
            },
            {
                a: 'NEO',
                f: '0.00000000',
                l: '0.00000000',
            },
        ],
    }

    userEventHandler(res => {
        t.deepEqual(res, {
            eventType: 'account',
            eventTime: 1499405658849,
            makerCommissionRate: 0,
            takerCommissionRate: 0,
            buyerCommissionRate: 0,
            sellerCommissionRate: 0,
            canTrade: true,
            canWithdraw: true,
            canDeposit: true,
            lastAccountUpdate: 1499405658849,
            balances: {
                LTC: { available: '17366.18538083', locked: '0.00000000' },
                BTC: { available: '10537.85314051', locked: '2.19464093' },
                ETH: { available: '17902.35190619', locked: '0.00000000' },
                BNC: { available: '1114503.29769312', locked: '0.00000000' },
                NEO: { available: '0.00000000', locked: '0.00000000' },
            },
        })
    })({ data: JSON.stringify(accountPayload) })

    const orderPayload = {
        e: 'executionReport',
        E: 1499405658658,
        s: 'ETHBTC',
        c: 'mUvoqJxFIILMdfAW5iGSOW',
        S: 'BUY',
        o: 'LIMIT',
        f: 'GTC',
        q: '1.00000000',
        p: '0.10264410',
        P: '0.10285410',
        F: '0.00000000',
        g: -1,
        C: 'null',
        x: 'NEW',
        X: 'NEW',
        r: 'NONE',
        i: 4293153,
        l: '0.00000000',
        z: '0.00000000',
        L: '0.00000000',
        n: '0',
        N: null,
        T: 1499405658657,
        t: -1,
        I: 8641984,
        w: true,
        m: false,
        M: false,
        O: 1499405658657,
        Q: 0,
        Y: 0,
        Z: '0.00000000',
    }

    userEventHandler(res => {
        t.deepEqual(res, {
            commission: '0',
            commissionAsset: null,
            creationTime: 1499405658657,
            eventTime: 1499405658658,
            eventType: 'executionReport',
            executionType: 'NEW',
            icebergQuantity: '0.00000000',
            isBuyerMaker: false,
            isOrderWorking: true,
            lastQuoteTransacted: 0,
            lastTradeQuantity: '0.00000000',
            newClientOrderId: 'mUvoqJxFIILMdfAW5iGSOW',
            orderId: 4293153,
            orderListId: -1,
            orderRejectReason: 'NONE',
            orderStatus: 'NEW',
            orderTime: 1499405658657,
            orderType: 'LIMIT',
            originalClientOrderId: 'null',
            price: '0.10264410',
            priceLastTrade: '0.00000000',
            quantity: '1.00000000',
            quoteOrderQuantity: 0,
            side: 'BUY',
            stopPrice: '0.10285410',
            symbol: 'ETHBTC',
            timeInForce: 'GTC',
            totalQuoteTradeQuantity: '0.00000000',
            totalTradeQuantity: '0.00000000',
            tradeId: -1,
            trailingDelta: undefined,
            trailingTime: undefined,
        })
    })({ data: JSON.stringify(orderPayload) })

    const tradePayload = {
        e: 'executionReport',
        E: 1499406026404,
        s: 'ETHBTC',
        c: '1hRLKJhTRsXy2ilYdSzhkk',
        S: 'BUY',
        o: 'LIMIT',
        f: 'GTC',
        q: '22.42906458',
        p: '0.10279999',
        P: '0.10280001',
        F: '0.00000000',
        g: -1,
        C: 'null',
        x: 'TRADE',
        X: 'FILLED',
        r: 'NONE',
        i: 4294220,
        l: '17.42906458',
        z: '22.42906458',
        L: '0.10279999',
        n: '0.00000001',
        N: 'BNC',
        T: 1499406026402,
        t: 77517,
        I: 8644124,
        w: false,
        m: false,
        M: true,
        O: 1499405658657,
        Q: 0,
        Y: 0,
        Z: '2.30570761',
    }

    userEventHandler(res => {
        t.deepEqual(res, {
            eventType: 'executionReport',
            eventTime: 1499406026404,
            symbol: 'ETHBTC',
            newClientOrderId: '1hRLKJhTRsXy2ilYdSzhkk',
            originalClientOrderId: 'null',
            side: 'BUY',
            orderType: 'LIMIT',
            timeInForce: 'GTC',
            quantity: '22.42906458',
            price: '0.10279999',
            stopPrice: '0.10280001',
            executionType: 'TRADE',
            icebergQuantity: '0.00000000',
            orderStatus: 'FILLED',
            orderRejectReason: 'NONE',
            orderId: 4294220,
            orderTime: 1499406026402,
            lastTradeQuantity: '17.42906458',
            totalTradeQuantity: '22.42906458',
            priceLastTrade: '0.10279999',
            commission: '0.00000001',
            commissionAsset: 'BNC',
            tradeId: 77517,
            isOrderWorking: false,
            isBuyerMaker: false,
            creationTime: 1499405658657,
            totalQuoteTradeQuantity: '2.30570761',
            lastQuoteTransacted: 0,
            orderListId: -1,
            quoteOrderQuantity: 0,
            trailingDelta: undefined,
            trailingTime: undefined,
        })
    })({ data: JSON.stringify(tradePayload) })

    const listStatusPayload = {
        e: 'listStatus',
        E: 1661588112531,
        s: 'TWTUSDT',
        g: 73129826,
        c: 'OCO',
        l: 'EXEC_STARTED',
        L: 'EXECUTING',
        r: 'NONE',
        C: 'Y3ZgLMRPHZFNqEVSZwoJI7',
        T: 1661588112530,
        O: [
            {
                s: 'TWTUSDT',
                i: 209259206,
                c: 'electron_f675d1bdea454cd4afeac5664be',
            },
            {
                s: 'TWTUSDT',
                i: 209259207,
                c: 'electron_38d852a65a89486c98e59879327',
            },
        ],
    }

    userEventHandler(res => {
        t.deepEqual(res, {
            eventType: 'listStatus',
            eventTime: 1661588112531,
            symbol: 'TWTUSDT',
            orderListId: 73129826,
            contingencyType: 'OCO',
            listStatusType: 'EXEC_STARTED',
            listOrderStatus: 'EXECUTING',
            listRejectReason: 'NONE',
            listClientOrderId: 'Y3ZgLMRPHZFNqEVSZwoJI7',
            transactionTime: 1661588112530,
            orders: [
                {
                    symbol: 'TWTUSDT',
                    orderId: 209259206,
                    clientOrderId: 'electron_f675d1bdea454cd4afeac5664be',
                },
                {
                    symbol: 'TWTUSDT',
                    orderId: 209259207,
                    clientOrderId: 'electron_38d852a65a89486c98e59879327',
                },
            ],
        })
    })({ data: JSON.stringify(listStatusPayload) })

    const newEvent = { e: 'totallyNewEvent', yolo: 42 }

    userEventHandler(res => {
        t.deepEqual(res, { type: 'totallyNewEvent', yolo: 42 })
    })({ data: JSON.stringify(newEvent) })
})

// FUTURES TESTS

test('[FUTURES-REST] ping', async t => {
    t.truthy(await client.futuresPing(), 'A simple ping should work')
})

test('[FUTURES-REST] time', async t => {
    const ts = await client.futuresTime()
    t.truthy(new Date(ts).getTime() > 0, 'The returned timestamp should be valid')
})

test('[FUTURES-REST] exchangeInfo', async t => {
    const res = await client.futuresExchangeInfo()
    checkFields(t, res, ['timezone', 'serverTime', 'rateLimits', 'symbols'])
})

test('[FUTURES-REST] book', async t => {
    try {
        await client.futuresBook()
    } catch (e) {
        t.is(e.message, 'You need to pass a payload object.')
    }

    try {
        await client.futuresBook({})
    } catch (e) {
        t.is(e.message, 'Method book requires symbol parameter.')
    }

    const book = await client.futuresBook({ symbol: 'BTCUSDT' })
    t.truthy(book.lastUpdateId)
    t.truthy(book.asks.length)
    t.truthy(book.bids.length)

    const [bid] = book.bids
    t.truthy(typeof bid.price === 'string')
    t.truthy(typeof bid.quantity === 'string')
})

test('[FUTURES-REST] markPrice', async t => {
    const res = await client.futuresMarkPrice()
    t.truthy(Array.isArray(res))
    checkFields(t, res[0], ['symbol', 'markPrice', 'lastFundingRate', 'nextFundingTime', 'time'])
})

test.skip('[FUTURES-REST] allForceOrders', async t => {
    const res = await client.futuresAllForceOrders()
    t.truthy(Array.isArray(res))
    t.truthy(res.length === 100)
    checkFields(t, res[0], [
        'symbol',
        'price',
        'origQty',
        'executedQty',
        'averagePrice',
        'timeInForce',
        'type',
        'side',
        'time',
    ])
})

test('[FUTURES-REST] candles', async t => {
    try {
        await client.futuresCandles({})
    } catch (e) {
        t.is(e.message, 'Method candles requires symbol parameter.')
    }

    const candles = await client.futuresCandles({ symbol: 'BTCUSDT' })

    t.truthy(candles.length)

    const [candle] = candles
    checkFields(t, candle, candleFields)
})

test('[FUTURES-REST] mark price candles', async t => {
    try {
        await client.futuresMarkPriceCandles({})
    } catch (e) {
        t.is(e.message, 'Method candles requires symbol parameter.')
    }

    const candles = await client.futuresMarkPriceCandles({ symbol: 'BTCUSDT' })

    t.truthy(candles.length)

    const [candle] = candles
    checkFields(t, candle, candleFields)
})

test('[FUTURES-REST] index price candles', async t => {
    try {
        await client.futuresIndexPriceCandles({})
    } catch (e) {
        t.is(e.message, 'Method candles requires pair parameter.')
    }

    const candles = await client.futuresIndexPriceCandles({ pair: 'BTCUSDT' })

    t.truthy(candles.length)

    const [candle] = candles
    checkFields(t, candle, candleFields)
})

test('[FUTURES-REST] trades', async t => {
    const trades = await client.futuresTrades({ symbol: 'BTCUSDT', limit: 10 })
    t.is(trades.length, 10)
    checkFields(t, trades[0], ['id', 'price', 'qty', 'quoteQty', 'time'])
})

test('[FUTURES-REST] dailyStats', async t => {
    const res = await client.futuresDailyStats({ symbol: 'BTCUSDT' })
    t.truthy(res)
    checkFields(t, res, ['highPrice', 'lowPrice', 'volume', 'priceChange'])
})

test('[FUTURES-REST] prices', async t => {
    const prices = await client.futuresPrices()
    t.truthy(prices)
    t.truthy(prices.BTCUSDT)
})

test('[FUTURES-REST] allBookTickers', async t => {
    const tickers = await client.futuresAllBookTickers()
    t.truthy(tickers)
    t.truthy(tickers.BTCUSDT)
})

test('[FUTURES-REST] aggTrades', async t => {
    try {
        await client.futuresAggTrades({})
    } catch (e) {
        t.is(e.message, 'Method aggTrades requires symbol parameter.')
    }

    const trades = await client.futuresAggTrades({ symbol: 'BTCUSDT' })
    t.truthy(trades.length)

    const [trade] = trades
    t.truthy(trade.aggId)
})

test('[FUTURES-REST] fundingRate', async t => {
    const fundingRate = await client.futuresFundingRate({ symbol: 'BTCUSDT' })
    checkFields(t, fundingRate[0], ['symbol', 'fundingTime', 'fundingRate'])
    t.is(fundingRate.length, 100)
})

// DELIVERY TESTS

test('[DELIVERY-REST] ping', async t => {
    t.truthy(await client.deliveryPing(), 'A simple ping should work')
})

test('[DELIVERY-REST] time', async t => {
    const ts = await client.deliveryTime()
    t.truthy(new Date(ts).getTime() > 0, 'The returned timestamp should be valid')
})

test('[DELIVERY-REST] exchangeInfo', async t => {
    const res = await client.deliveryExchangeInfo()
    checkFields(t, res, ['timezone', 'serverTime', 'rateLimits', 'exchangeFilters', 'symbols'])
})

test('[DELIVERY-REST] book', async t => {
    try {
        await client.deliveryBook()
    } catch (e) {
        t.is(e.message, 'You need to pass a payload object.')
    }

    try {
        await client.deliveryBook({})
    } catch (e) {
        t.is(e.message, 'Method book requires symbol parameter.')
    }

    const book = await client.deliveryBook({ symbol: 'TRXUSD_perp' })
    t.truthy(book.lastUpdateId)
    t.truthy(book.asks.length)
    t.truthy(book.bids.length)

    const [bid] = book.bids
    t.truthy(typeof bid.price === 'string')
    t.truthy(typeof bid.quantity === 'string')
})

test('[DELIVERY-REST] markPrice', async t => {
    const res = await client.deliveryMarkPrice()
    t.truthy(Array.isArray(res))
    checkFields(t, res[0], [
        'symbol',
        'pair',
        'markPrice',
        'indexPrice',
        'estimatedSettlePrice',
        'time',
    ])
})

test('[DELIVERY-REST] candles', async t => {
    try {
        await client.deliveryCandles({})
    } catch (e) {
        t.is(e.message, 'Method candles requires symbol parameter.')
    }

    const candles = await client.deliveryCandles({ symbol: 'TRXUSD_perp' })

    t.truthy(candles.length)

    const [candle] = candles
    checkFields(t, candle, deliveryCandleFields)
})

test('[DELIVERY-REST] mark price candles', async t => {
    try {
        await client.deliveryMarkPriceCandles({})
    } catch (e) {
        t.is(e.message, 'Method candles requires symbol parameter.')
    }

    const candles = await client.deliveryMarkPriceCandles({ symbol: 'TRXUSD_perp' })

    t.truthy(candles.length)

    const [candle] = candles
    checkFields(t, candle, deliveryCandleFields)
})

test('[DELIVERY-REST] index price candles', async t => {
    try {
        await client.deliveryIndexPriceCandles({})
    } catch (e) {
        t.is(e.message, 'Method candles requires pair parameter.')
    }

    const candles = await client.deliveryIndexPriceCandles({ pair: 'TRXUSD' })

    t.truthy(candles.length)

    const [candle] = candles
    checkFields(t, candle, deliveryCandleFields)
})

test('[DELIVERY-REST] trades', async t => {
    const trades = await client.deliveryTrades({ symbol: 'TRXUSD_perp', limit: 10 })
    t.is(trades.length, 10)
    checkFields(t, trades[0], ['id', 'price', 'qty', 'baseQty', 'time'])
})

test('[DELIVERY-REST] dailyStats', async t => {
    const res = await client.deliveryDailyStats({ symbol: 'TRXUSD_perp' })
    t.truthy(res)
    // Note : delivery API always returns an array hence the res[0]
    checkFields(t, res[0], ['pair', 'highPrice', 'lowPrice', 'volume', 'priceChange'])
})

test('[DELIVERY-REST] prices', async t => {
    const prices = await client.deliveryPrices()
    t.truthy(prices)
    t.truthy(prices.TRXUSD_PERP)
})

test('[DELIVERY-REST] allBookTickers', async t => {
    const tickers = await client.deliveryAllBookTickers()
    t.truthy(tickers)
    t.truthy(tickers.TRXUSD_PERP)
})

test('[DELIVERY-REST] aggTrades', async t => {
    try {
        await client.deliveryAggTrades({})
    } catch (e) {
        t.is(e.message, 'Method aggTrades requires symbol parameter.')
    }

    const trades = await client.deliveryAggTrades({ symbol: 'TRXUSD_perp' })
    t.truthy(trades.length)

    const [trade] = trades
    t.truthy(trade.aggId)
})

test('[DELIVERY-REST] fundingRate', async t => {
    const fundingRate = await client.deliveryFundingRate({ symbol: 'TRXUSD_perp' })
    checkFields(t, fundingRate[0], ['symbol', 'fundingTime', 'fundingRate'])
    t.assert(fundingRate.length >= 100)
})
