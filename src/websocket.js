import zip from 'lodash.zipobject'
import JSONbig from 'json-bigint'

import httpMethods from 'http-client'
import _openWebSocket from 'open-websocket'
import { createHmacSignature, createAsymmetricSignature } from 'signature'

const endpoints = {
    base: 'wss://stream.binance.com:9443/ws',
    futures: 'wss://fstream.binance.com/ws',
    delivery: 'wss://dstream.binance.com/ws',
}

const wsOptions = {}

function openWebSocket(url) {
    return _openWebSocket(url, wsOptions)
}

const depthTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const futuresDepthTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const deliveryDepthTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    pair: m.ps,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const depth = (payload, cb, transform = true, variator) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const [symbolName, updateSpeed] = symbol.toLowerCase().split('@')
        const w = openWebSocket(
            `${variator ? endpoints[variator] : endpoints.base}/${symbolName}@depth${
                updateSpeed ? `@${updateSpeed}` : ''
            }`,
        )
        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)

            cb(
                transform
                    ? variator === 'futures'
                        ? futuresDepthTransform(obj)
                        : variator === 'delivery'
                          ? deliveryDepthTransform(obj)
                          : depthTransform(obj)
                    : obj,
            )
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const futuresRpiDepth = (payload, cb, transform = true) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const symbolName = symbol.toLowerCase()
        const w = openWebSocket(`${endpoints.futures}/${symbolName}@rpiDepth@500ms`)
        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)
            cb(transform ? futuresDepthTransform(obj) : obj)
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const partialDepthTransform = (symbol, level, m) => ({
    symbol,
    level,
    lastUpdateId: m.lastUpdateId,
    bids: m.bids.map(b => zip(['price', 'quantity'], b)),
    asks: m.asks.map(a => zip(['price', 'quantity'], a)),
})

const futuresPartDepthTransform = (level, m) => ({
    level,
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const deliveryPartDepthTransform = (level, m) => ({
    level,
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    pair: m.ps,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const partialDepth = (payload, cb, transform = true, variator) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(({ symbol, level }) => {
        const [symbolName, updateSpeed] = symbol.toLowerCase().split('@')
        const w = openWebSocket(
            `${variator ? endpoints[variator] : endpoints.base}/${symbolName}@depth${level}${
                updateSpeed ? `@${updateSpeed}` : ''
            }`,
        )
        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)

            cb(
                transform
                    ? variator === 'futures'
                        ? futuresPartDepthTransform(level, obj)
                        : variator === 'delivery'
                          ? deliveryPartDepthTransform(level, obj)
                          : partialDepthTransform(symbol, level, obj)
                    : obj,
            )
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const candleTransform = m => ({
    startTime: m.t,
    closeTime: m.T,
    firstTradeId: m.f,
    lastTradeId: m.L,
    open: m.o,
    high: m.h,
    low: m.l,
    close: m.c,
    volume: m.v,
    trades: m.n,
    interval: m.i,
    isFinal: m.x,
    quoteVolume: m.q,
    buyVolume: m.V,
    quoteBuyVolume: m.Q,
})

const deliveryCandleTransform = m => ({
    startTime: m.t,
    closeTime: m.T,
    firstTradeId: m.f,
    lastTradeId: m.L,
    open: m.o,
    high: m.h,
    low: m.l,
    close: m.c,
    volume: m.v,
    trades: m.n,
    interval: m.i,
    isFinal: m.x,
    baseVolume: m.q,
    buyVolume: m.V,
    baseBuyVolume: m.Q,
})

const candles = (payload, interval, cb, transform = true, variator) => {
    if (!interval || !cb) {
        throw new Error('Please pass a symbol, interval and callback.')
    }

    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const w = openWebSocket(
            `${
                variator ? endpoints[variator] : endpoints.base
            }/${symbol.toLowerCase()}@kline_${interval}`,
        )
        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)
            const { e: eventType, E: eventTime, s: symbol, k: tick } = obj

            cb(
                transform
                    ? {
                          eventType,
                          eventTime,
                          symbol,
                          ...(variator === 'delivery'
                              ? deliveryCandleTransform(tick)
                              : candleTransform(tick)),
                      }
                    : obj,
            )
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const bookTickerTransform = m => ({
    updateId: m.u,
    symbol: m.s,
    bestBid: m.b,
    bestBidQnt: m.B,
    bestAsk: m.a,
    bestAskQnt: m.A,
})

const miniTickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    curDayClose: m.c,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeQuote: m.q,
})

const deliveryMiniTickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    pair: m.ps,
    curDayClose: m.c,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeBase: m.q,
})

const tickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    priceChange: m.p,
    priceChangePercent: m.P,
    weightedAvg: m.w,
    prevDayClose: m.x,
    curDayClose: m.c,
    closeTradeQuantity: m.Q,
    bestBid: m.b,
    bestBidQnt: m.B,
    bestAsk: m.a,
    bestAskQnt: m.A,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeQuote: m.q,
    openTime: m.O,
    closeTime: m.C,
    firstTradeId: m.F,
    lastTradeId: m.L,
    totalTrades: m.n,
})

const futuresTickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    priceChange: m.p,
    priceChangePercent: m.P,
    weightedAvg: m.w,
    curDayClose: m.c,
    closeTradeQuantity: m.Q,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeQuote: m.q,
    openTime: m.O,
    closeTime: m.C,
    firstTradeId: m.F,
    lastTradeId: m.L,
    totalTrades: m.n,
})

const deliveryTickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    pair: m.ps,
    priceChange: m.p,
    priceChangePercent: m.P,
    weightedAvg: m.w,
    curDayClose: m.c,
    closeTradeQuantity: m.Q,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeBase: m.q,
    openTime: m.O,
    closeTime: m.C,
    firstTradeId: m.F,
    lastTradeId: m.L,
    totalTrades: m.n,
})

const bookTicker = (payload, cb, transform = true) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const w = openWebSocket(`${endpoints.base}/${symbol.toLowerCase()}@bookTicker`)

        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)
            cb(transform ? bookTickerTransform(obj) : obj)
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const ticker = (payload, cb, transform = true, variator) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const w = openWebSocket(
            `${
                variator === 'futures'
                    ? endpoints.futures
                    : variator === 'delivery'
                      ? endpoints.delivery
                      : endpoints.base
            }/${symbol.toLowerCase()}@ticker`,
        )

        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)
            cb(
                transform
                    ? variator === 'futures'
                        ? futuresTickerTransform(obj)
                        : variator === 'delivery'
                          ? deliveryTickerTransform(obj)
                          : tickerTransform(obj)
                    : obj,
            )
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const allTickers = (cb, transform = true, variator) => {
    const w = new openWebSocket(
        `${
            variator === 'futures'
                ? endpoints.futures
                : variator === 'delivery'
                  ? endpoints.delivery
                  : endpoints.base
        }/!miniTicker@arr`,
    )

    w.onmessage = msg => {
        const arr = JSONbig.parse(msg.data)
        cb(
            transform
                ? variator === 'futures'
                    ? arr.map(m => futuresTickerTransform(m))
                    : variator === 'delivery'
                      ? arr.map(m => deliveryTickerTransform(m))
                      : arr.map(m => tickerTransform(m))
                : arr,
        )
    }

    return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

const allTickersDeprecated = (cb, transform = true, variator) => {
    const w = new openWebSocket(
        `${
            variator === 'futures'
                ? endpoints.futures
                : variator === 'delivery'
                  ? endpoints.delivery
                  : endpoints.base
        }/!ticker@arr`,
    )

    w.onmessage = msg => {
        const arr = JSONbig.parse(msg.data)
        cb(
            transform
                ? variator === 'futures'
                    ? arr.map(m => futuresTickerTransform(m))
                    : variator === 'delivery'
                      ? arr.map(m => deliveryTickerTransform(m))
                      : arr.map(m => tickerTransform(m))
                : arr,
        )
    }

    return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

const miniTicker = (payload, cb, transform = true, variator) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const w = openWebSocket(`${endpoints.base}/${symbol.toLowerCase()}@miniTicker`)

        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)
            cb(
                transform
                    ? variator === 'delivery'
                        ? deliveryMiniTickerTransform(obj)
                        : miniTickerTransform(obj)
                    : obj,
            )
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const allMiniTickers = (cb, transform = true, variator) => {
    const w = openWebSocket(`${endpoints.base}/!miniTicker@arr`)

    w.onmessage = msg => {
        const arr = JSONbig.parse(msg.data)
        cb(
            transform
                ? arr.map(
                      variator === 'delivery' ? deliveryMiniTickerTransform : miniTickerTransform,
                  )
                : arr,
        )
    }

    return options => w =>
        w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

const customSubStream = (payload, cb, variator) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(sub => {
        const w = openWebSocket(
            `${
                variator === 'futures'
                    ? endpoints.futures
                    : variator === 'delivery'
                      ? endpoints.delivery
                      : endpoints.base
            }/${sub}`,
        )

        w.onmessage = msg => {
            const data = JSONbig.parse(msg.data)
            cb(data)
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const aggTradesTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    timestamp: m.T,
    symbol: m.s,
    price: m.p,
    quantity: m.q,
    isBuyerMaker: m.m,
    wasBestPrice: m.M,
    aggId: m.a,
    firstId: m.f,
    lastId: m.l,
})

const futuresAggTradesTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    aggId: m.a,
    price: m.p,
    quantity: m.q,
    firstId: m.f,
    lastId: m.l,
    timestamp: m.T,
    isBuyerMaker: m.m,
})

const aggTrades = (payload, cb, transform = true, variator) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const w = openWebSocket(
            `${
                variator === 'futures'
                    ? endpoints.futures
                    : variator === 'delivery'
                      ? endpoints.delivery
                      : endpoints.base
            }/${symbol.toLowerCase()}@aggTrade`,
        )
        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)

            cb(
                transform
                    ? variator === 'futures' || variator === 'delivery'
                        ? futuresAggTradesTransform(obj)
                        : aggTradesTransform(obj)
                    : obj,
            )
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const futuresLiqsTransform = m => ({
    symbol: m.s,
    price: m.p,
    origQty: m.q,
    lastFilledQty: m.l,
    accumulatedQty: m.z,
    averagePrice: m.ap,
    status: m.X,
    timeInForce: m.f,
    type: m.o,
    side: m.S,
    time: m.T,
})

const futuresLiquidations = (payload, cb, transform = true) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const w = openWebSocket(`${endpoints.futures}/${symbol.toLowerCase()}@forceOrder`)
        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)

            cb(transform ? futuresLiqsTransform(obj.o) : obj)
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const futuresAllLiquidations = (cb, transform = true) => {
    const w = new openWebSocket(`${endpoints.futures}/!forceOrder@arr`)

    w.onmessage = msg => {
        const obj = JSONbig.parse(msg.data)
        cb(transform ? futuresLiqsTransform(obj.o) : obj)
    }

    return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

const tradesTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    tradeTime: m.T,
    symbol: m.s,
    price: m.p,
    quantity: m.q,
    isBuyerMaker: m.m,
    maker: m.M,
    tradeId: m.t,
    buyerOrderId: m.b,
    sellerOrderId: m.a,
})

const trades = (payload, cb, transform = true) => {
    const cache = (Array.isArray(payload) ? payload : [payload]).map(symbol => {
        const w = openWebSocket(`${endpoints.base}/${symbol.toLowerCase()}@trade`)
        w.onmessage = msg => {
            const obj = JSONbig.parse(msg.data)
            cb(transform ? tradesTransform(obj) : obj)
        }

        return w
    })

    return options =>
        cache.forEach(w =>
            w.close(1000, 'Close handle was called', { keepClosed: true, ...options }),
        )
}

const userTransforms = {
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#balance-update
    balanceUpdate: m => ({
        asset: m.a,
        balanceDelta: m.d,
        clearTime: m.T,
        eventTime: m.E,
        eventType: 'balanceUpdate',
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#account-update
    outboundAccountInfo: m => ({
        eventType: 'account',
        eventTime: m.E,
        makerCommissionRate: m.m,
        takerCommissionRate: m.t,
        buyerCommissionRate: m.b,
        sellerCommissionRate: m.s,
        canTrade: m.T,
        canWithdraw: m.W,
        canDeposit: m.D,
        lastAccountUpdate: m.u,
        balances: m.B.reduce((out, cur) => {
            out[cur.a] = { available: cur.f, locked: cur.l }
            return out
        }, {}),
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#account-update
    outboundAccountPosition: m => ({
        balances: m.B.map(({ a, f, l }) => ({ asset: a, free: f, locked: l })),
        eventTime: m.E,
        eventType: 'outboundAccountPosition',
        lastAccountUpdate: m.u,
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#order-update
    executionReport: m => ({
        eventType: 'executionReport',
        eventTime: m.E,
        symbol: m.s,
        newClientOrderId: m.c,
        originalClientOrderId: m.C,
        side: m.S,
        orderType: m.o,
        timeInForce: m.f,
        quantity: m.q,
        price: m.p,
        executionType: m.x,
        stopPrice: m.P,
        trailingDelta: m.d,
        icebergQuantity: m.F,
        orderStatus: m.X,
        orderRejectReason: m.r,
        orderId: m.i,
        orderTime: m.T,
        lastTradeQuantity: m.l,
        totalTradeQuantity: m.z,
        priceLastTrade: m.L,
        commission: m.n,
        commissionAsset: m.N,
        tradeId: m.t,
        isOrderWorking: m.w,
        isBuyerMaker: m.m,
        creationTime: m.O,
        totalQuoteTradeQuantity: m.Z,
        orderListId: m.g,
        quoteOrderQuantity: m.Q,
        lastQuoteTransacted: m.Y,
        trailingTime: m.D,
    }),
    listStatus: m => ({
        eventType: 'listStatus',
        eventTime: m.E,
        symbol: m.s,
        orderListId: m.g,
        contingencyType: m.c,
        listStatusType: m.l,
        listOrderStatus: m.L,
        listRejectReason: m.r,
        listClientOrderId: m.C,
        transactionTime: m.T,
        orders: m.O.map(o => ({
            symbol: o.s,
            orderId: o.i,
            clientOrderId: o.c,
        })),
    }),
}

const futuresUserTransforms = {
    // https://binance-docs.github.io/apidocs/futures/en/#close-user-data-stream-user_stream
    listenKeyExpired: function USER_DATA_STREAM_EXPIRED(m) {
        return {
            eventTime: m.E,
            eventType: 'USER_DATA_STREAM_EXPIRED',
        }
    },
    // https://binance-docs.github.io/apidocs/futures/en/#event-margin-call
    MARGIN_CALL: m => ({
        eventTime: m.E,
        crossWalletBalance: m.cw,
        eventType: 'MARGIN_CALL',
        positions: m.p.map(cur => ({
            symbol: cur.s,
            positionSide: cur.ps,
            positionAmount: cur.pa,
            marginType: cur.mt,
            isolatedWallet: cur.iw,
            markPrice: cur.mp,
            unrealizedPnL: cur.up,
            maintenanceMarginRequired: cur.mm,
        })),
    }),
    // https://binance-docs.github.io/apidocs/futures/en/#event-balance-and-position-update
    ACCOUNT_UPDATE: m => ({
        eventTime: m.E,
        transactionTime: m.T,
        eventType: 'ACCOUNT_UPDATE',
        eventReasonType: m.a.m,
        balances: m.a.B.map(b => ({
            asset: b.a,
            walletBalance: b.wb,
            crossWalletBalance: b.cw,
            balanceChange: b.bc,
        })),
        positions: m.a.P.map(p => ({
            symbol: p.s,
            positionAmount: p.pa,
            entryPrice: p.ep,
            accumulatedRealized: p.cr,
            unrealizedPnL: p.up,
            marginType: p.mt,
            isolatedWallet: p.iw,
            positionSide: p.ps,
        })),
    }),
    // https://binance-docs.github.io/apidocs/futures/en/#event-order-update
    ORDER_TRADE_UPDATE: m => ({
        eventType: 'ORDER_TRADE_UPDATE',
        eventTime: m.E,
        transactionTime: m.T,
        symbol: m.o.s,
        clientOrderId: m.o.c,
        side: m.o.S,
        orderType: m.o.o,
        timeInForce: m.o.f,
        quantity: m.o.q,
        price: m.o.p,
        averagePrice: m.o.ap,
        stopPrice: m.o.sp,
        executionType: m.o.x,
        orderStatus: m.o.X,
        orderId: m.o.i,
        lastTradeQuantity: m.o.l,
        totalTradeQuantity: m.o.z,
        priceLastTrade: m.o.L,
        commissionAsset: m.o.N,
        commission: m.o.n,
        orderTime: m.o.T,
        tradeId: m.o.t,
        bidsNotional: m.o.b,
        asksNotional: m.o.a,
        isMaker: m.o.m,
        isReduceOnly: m.o.R,
        workingType: m.o.wt,
        originalOrderType: m.o.ot,
        positionSide: m.o.ps,
        closePosition: m.o.cp,
        activationPrice: m.o.AP,
        callbackRate: m.o.cr,
        realizedProfit: m.o.rp,
    }),
    // https://binance-docs.github.io/apidocs/futures/en/#event-account-configuration-update-previous-leverage-update
    ACCOUNT_CONFIG_UPDATE: m => ({
        eventType: 'ACCOUNT_CONFIG_UPDATE',
        eventTime: m.E,
        transactionTime: m.T,
        type: m.ac ? 'ACCOUNT_CONFIG' : 'MULTI_ASSETS',
        ...(m.ac
            ? {
                  symbol: m.ac.s,
                  leverage: m.ac.l,
              }
            : {
                  multiAssets: m.ai.j,
              }),
    }),
}

export const userEventHandler =
    (cb, transform = true, variator) =>
    msg => {
        const { e: type, ...rest } = JSONbig.parse(msg.data)

        cb(
            variator === 'futures' || variator === 'delivery'
                ? transform && futuresUserTransforms[type]
                    ? futuresUserTransforms[type](rest)
                    : { type, ...rest }
                : transform && userTransforms[type]
                  ? userTransforms[type](rest)
                  : { type, ...rest },
        )
    }

const userOpenHandler =
    (cb, transform = true) =>
    () => {
        cb({ [transform ? 'eventType' : 'type']: 'open' })
    }

const userErrorHandler =
    (cb, transform = true) =>
    error => {
        cb({ [transform ? 'eventType' : 'type']: 'error', error })
    }

const STREAM_METHODS = ['get', 'keep', 'close']

const capitalize = (str, check) => (check ? `${str[0].toUpperCase()}${str.slice(1)}` : str)

const getStreamMethods = (opts, variator = '') => {
    const methods = httpMethods(opts)

    return STREAM_METHODS.reduce(
        (acc, key) => [...acc, methods[`${variator}${capitalize(`${key}DataStream`, !!variator)}`]],
        [],
    )
}

export const keepStreamAlive = (method, listenKey) => method({ listenKey })

const userWebSocketApi = opts => (cb, transform) => {
    const isTestnet = opts.testnet || (opts.httpBase && opts.httpBase.includes('testnet'))
    const wsApiUrl = isTestnet
        ? opts.wsApiTestnet || 'wss://ws-api.testnet.binance.vision/ws-api/v3'
        : opts.wsApi || 'wss://ws-api.binance.com:443/ws-api/v3'

    let requestId = 1
    const errorHandler = userErrorHandler(cb, transform)
    const w = openWebSocket(wsApiUrl)

    const sendSubscribe = () => {
        const timestamp = opts.getTime ? opts.getTime() : Date.now()
        const paramsStr = `apiKey=${opts.apiKey}&timestamp=${timestamp}`

        const doSend = signature => {
            w.send(
                JSONbig.stringify({
                    id: requestId++,
                    method: 'userDataStream.subscribe.signature',
                    params: {
                        apiKey: opts.apiKey,
                        timestamp,
                        signature,
                    },
                }),
            )
        }

        if (opts.apiSecret) {
            createHmacSignature(paramsStr, opts.apiSecret).then(doSend)
        } else if (opts.privateKey) {
            doSend(createAsymmetricSignature(paramsStr, opts.privateKey))
        }
    }

    return new Promise((resolve, reject) => {
        let resolved = false

        w.onopen = () => {
            sendSubscribe()
            if (opts.emitSocketOpens) {
                userOpenHandler(cb, transform)()
            }
        }

        w.onmessage = msg => {
            const data = JSONbig.parse(msg.data)

            // Control response (subscription/unsubscription)
            if ('id' in data) {
                if (data.error) {
                    const err = new Error(data.error.msg || 'WebSocket API error')
                    err.code = data.error.code
                    if (!resolved) {
                        resolved = true
                        reject(err)
                    } else if (opts.emitStreamErrors) {
                        errorHandler(err)
                    }
                } else if (!resolved) {
                    resolved = true
                    resolve(options => {
                        try {
                            w.send(
                                JSONbig.stringify({
                                    id: requestId++,
                                    method: 'userDataStream.unsubscribe',
                                }),
                            )
                        } catch (e) {
                            // Ignore send errors during close
                        }
                        w.close(1000, 'Close handle was called', {
                            keepClosed: true,
                            ...options,
                        })
                    })
                }
                return
            }

            // User data event - unwrap if in wrapped format
            let eventData = data
            if (data.event && typeof data.event === 'object') {
                eventData = data.event
            }

            if (eventData.e) {
                userEventHandler(cb, transform)({ data: JSONbig.stringify(eventData) })
            }
        }

        w.onerror = event => {
            const error = event.error || event.message || new Error('WebSocket error')
            if (opts.emitSocketErrors) {
                errorHandler(typeof error === 'string' ? new Error(error) : error)
            }
        }
    })
}

const user = (opts, variator) => (cb, transform) => {
    const [getDataStream, keepDataStream, closeDataStream] = getStreamMethods(opts, variator)

    let currentListenKey = null
    let int = null
    let w = null
    let keepClosed = false
    const errorHandler = userErrorHandler(cb, transform)

    const keepAlive = isReconnecting => {
        if (currentListenKey) {
            keepStreamAlive(keepDataStream, currentListenKey).catch(err => {
                closeStream({}, true)

                if (isReconnecting) {
                    setTimeout(() => makeStream(true), 30e3)
                } else {
                    makeStream(true)
                }

                if (opts.emitStreamErrors) {
                    errorHandler(err)
                }
            })
        }
    }

    const closeStream = (options, catchErrors, setKeepClosed = false) => {
        keepClosed = setKeepClosed

        if (!currentListenKey) {
            return Promise.resolve()
        }

        clearInterval(int)

        const p = closeDataStream({ listenKey: currentListenKey })

        if (catchErrors) {
            p.catch(f => f)
        }

        w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
        currentListenKey = null

        return p
    }

    const makeStream = isReconnecting => {
        return (
            !keepClosed &&
            getDataStream()
                .then(({ listenKey }) => {
                    if (keepClosed) {
                        return closeDataStream({ listenKey }).catch(f => f)
                    }

                    w = openWebSocket(
                        `${
                            variator === 'futures'
                                ? endpoints.futures
                                : variator === 'delivery'
                                  ? endpoints.delivery
                                  : endpoints.base
                        }/${listenKey}`,
                    )

                    w.onmessage = msg => userEventHandler(cb, transform, variator)(msg)
                    if (opts.emitSocketOpens) {
                        w.onopen = () => userOpenHandler(cb, transform)()
                    }
                    if (opts.emitSocketErrors) {
                        w.onerror = ({ error }) => errorHandler(error)
                    }

                    currentListenKey = listenKey

                    int = setInterval(() => keepAlive(false), 50e3)

                    keepAlive(true)

                    return options => closeStream(options, false, true)
                })
                .catch(err => {
                    if (isReconnecting) {
                        if (!keepClosed) {
                            setTimeout(() => makeStream(true), 30e3)
                        }

                        if (opts.emitStreamErrors) {
                            errorHandler(err)
                        }
                    } else {
                        throw err
                    }
                })
        )
    }

    return makeStream(false)
}

const futuresAllMarkPricesTransform = m =>
    m.map(x => ({
        eventType: x.e,
        eventTime: x.E,
        symbol: x.s,
        markPrice: x.p,
        indexPrice: x.i,
        settlePrice: x.P,
        fundingRate: x.r,
        nextFundingRate: x.T,
    }))

const futuresAllMarkPrices = (payload, cb, transform = true) => {
    const variant = payload.updateSpeed === '1s' ? '!markPrice@arr@1s' : '!markPrice@arr'

    const w = openWebSocket(`${endpoints.futures}/${variant}`)

    w.onmessage = msg => {
        const arr = JSONbig.parse(msg.data)
        cb(transform ? futuresAllMarkPricesTransform(arr) : arr)
    }

    return options => w.close(1000, 'Close handle was called', { keepClosed: true, ...options })
}

export default opts => {
    if (opts && opts.wsBase) endpoints.base = opts.wsBase
    if (opts && opts.wsFutures) endpoints.futures = opts.wsFutures
    if (opts && opts.wsDelivery) endpoints.delivery = opts.wsDelivery

    if (opts && opts.proxy) {
        wsOptions.proxy = opts.proxy
    }

    return {
        depth,
        partialDepth,
        candles,
        trades,
        aggTrades,
        bookTicker,
        ticker,
        allTickers,
        allTickersDeprecated,
        miniTicker,
        allMiniTickers,
        customSubStream,
        user: userWebSocketApi(opts),

        marginUser: user(opts, 'margin'),

        futuresDepth: (payload, cb, transform) => depth(payload, cb, transform, 'futures'),
        deliveryDepth: (payload, cb, transform) => depth(payload, cb, transform, 'delivery'),
        futuresRpiDepth,
        futuresPartialDepth: (payload, cb, transform) =>
            partialDepth(payload, cb, transform, 'futures'),
        deliveryPartialDepth: (payload, cb, transform) =>
            partialDepth(payload, cb, transform, 'delivery'),
        futuresCandles: (payload, interval, cb, transform) =>
            candles(payload, interval, cb, transform, 'futures'),
        deliveryCandles: (payload, interval, cb, transform) =>
            candles(payload, interval, cb, transform, 'delivery'),
        futuresTicker: (payload, cb, transform) => ticker(payload, cb, transform, 'futures'),
        deliveryTicker: (payload, cb, transform) => ticker(payload, cb, transform, 'delivery'),
        futuresAllTickers: (cb, transform) => allTickers(cb, transform, 'futures'),
        deliveryAllTickers: (cb, transform) => allTickers(cb, transform, 'delivery'),
        futuresAggTrades: (payload, cb, transform) => aggTrades(payload, cb, transform, 'futures'),
        deliveryAggTrades: (payload, cb, transform) =>
            aggTrades(payload, cb, transform, 'delivery'),
        futuresLiquidations,
        futuresAllLiquidations,
        futuresUser: user(opts, 'futures'),
        deliveryUser: user(opts, 'delivery'),
        futuresCustomSubStream: (payload, cb) => customSubStream(payload, cb, 'futures'),
        deliveryCustomSubStream: (payload, cb) => customSubStream(payload, cb, 'delivery'),
        futuresAllMarkPrices: (payload, cb) => futuresAllMarkPrices(payload, cb),
    }
}
