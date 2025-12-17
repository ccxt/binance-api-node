import test from 'ava'
import nock from 'nock'
import Binance, { ErrorCodes } from 'index'

// Warning: For now these tests can't run in parallel due to nock interceptors
const binance = Binance({
    apiKey: 'testkey',
    apiSecret: 'test',
})
const demoBinance = Binance({
    testnet: true,
})

function urlToObject(queryString) {
    const params = new URLSearchParams(queryString)
    const obj = Object.fromEntries(params.entries())
    return obj
}

let interceptedUrl = null
let interceptedBody = null

test.serial.beforeEach(t => {
    interceptedUrl = null
    interceptedBody = null
    nock(/.*/)
        .get(/.*/)
        .reply(200, function (uri, requestBody) {
            interceptedUrl = `${this.req.options.proto}://${this.req.options.hostname}${uri}`
            interceptedBody = requestBody
            return { success: true }
        })
    nock(/.*/)
        .post(/.*/)
        .reply(200, function (uri, requestBody) {
            interceptedUrl = `${this.req.options.proto}://${this.req.options.hostname}${uri}`
            interceptedBody = requestBody
            return { success: true }
        })
    nock(/.*/)
        .put(/.*/)
        .reply(200, function (uri, requestBody) {
            interceptedUrl = `${this.req.options.proto}://${this.req.options.hostname}${uri}`
            interceptedBody = requestBody
            return { success: true }
        })
    nock(/.*/)
        .delete(/.*/)
        .reply(200, function (uri, requestBody) {
            interceptedUrl = `${this.req.options.proto}://${this.req.options.hostname}${uri}`
            interceptedBody = requestBody
            return { success: true }
        })
})

test.serial('[Rest] Spot demo url', async t => {
    await demoBinance.time()
    t.is(interceptedUrl, 'https://demo-api.binance.com/api/v3/time')
})

test.serial('[Rest] Futures demo url', async t => {
    await demoBinance.futuresTime()
    t.is(interceptedUrl, 'https://demo-fapi.binance.com/fapi/v1/time')
})

test.serial('[REST] Prices no symbol', async t => {
    await binance.prices()
    t.is(interceptedUrl, 'https://api.binance.com/api/v3/ticker/price')
})

test.serial('[REST] Futures Prices no symbol', async t => {
    await binance.futuresPrices()
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/ticker/price')
})

test.serial('[REST] Orderbook', async t => {
    try {
        await binance.book({ symbol: 'BTCUSDT' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://api.binance.com/api/v3/depth?symbol=BTCUSDT')
})

test.serial('[REST] Futures Orderbook', async t => {
    try {
        await binance.futuresBook({ symbol: 'BTCUSDT' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT')
})

test.serial('[REST] OHLCVS', async t => {
    try {
        await binance.candles({ symbol: 'BTCUSDT' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.true(
        interceptedUrl.startsWith(
            'https://api.binance.com/api/v3/klines?interval=5m&symbol=BTCUSDT',
        ),
    )
})

test.serial('[REST] Futures OHLCVS', async t => {
    try {
        await binance.futuresCandles({ symbol: 'BTCUSDT', interval: '30m' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/klines?interval=30m&symbol=BTCUSDT')
})

test.serial('[REST] Recent Trades', async t => {
    await binance.trades({ symbol: 'BTCUSDT', limit: 500 })
    t.is(interceptedUrl, 'https://api.binance.com/api/v3/trades?symbol=BTCUSDT&limit=500')
})

test.serial('[REST] Agg Trades', async t => {
    try {
        await binance.aggTrades({ symbol: 'BTCUSDT' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://api.binance.com/api/v3/aggTrades?symbol=BTCUSDT')
})

test.serial('[REST] FuturesTrades', async t => {
    try {
        await binance.futuresTrades({ symbol: 'BTCUSDT' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/trades?symbol=BTCUSDT')
})

test.serial('[REST] FuturesAggTrades', async t => {
    try {
        await binance.futuresAggTrades({ symbol: 'BTCUSDT' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/aggTrades?symbol=BTCUSDT')
})

test.serial('[REST] PositionRisk V2', async t => {
    await binance.futuresPositionRisk()
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v2/positionRisk'))
})

test.serial('[REST] CancelOrder', async t => {
    await binance.cancelOrder({ symbol: 'LTCUSDT', orderId: '34234234' })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
    const obj = urlToObject(interceptedUrl.replace('https://api.binance.com/api/v3/order', ''))
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.orderId, '34234234')
})

test.serial('[REST] Futures CancelOrder', async t => {
    await binance.futuresCancelOrder({ symbol: 'LTCUSDT', orderId: '34234234' })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
    const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order', ''))
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.orderId, '34234234')
})

const CONTRACT_PREFIX = 'x-ftGmvgAN'
const SPOT_PREFIX = 'x-B3AUXNYV'

test.serial('[REST] MarketBuy', async t => {
    await binance.order({ symbol: 'LTCUSDT', side: 'BUY', type: 'MARKET', quantity: 0.5 })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
    const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
    const obj = urlToObject(body)
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'MARKET')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(SPOT_PREFIX))
})

test.serial('[REST] MarketSell', async t => {
    await binance.order({ symbol: 'LTCUSDT', side: 'SELL', type: 'MARKET', quantity: 0.5 })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
    const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
    const obj = urlToObject(body)
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'SELL')
    t.is(obj.type, 'MARKET')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(SPOT_PREFIX))
})

test.serial('[REST] LimitBuy', async t => {
    await binance.order({
        symbol: 'LTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 0.5,
        price: 100,
    })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
    const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
    const obj = urlToObject(body)
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'LIMIT')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(SPOT_PREFIX))
})

test.serial('[REST] LimitSell', async t => {
    await binance.order({
        symbol: 'LTCUSDT',
        side: 'SELL',
        type: 'LIMIT',
        quantity: 0.5,
        price: 100,
    })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
    const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
    const obj = urlToObject(body)
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'SELL')
    t.is(obj.type, 'LIMIT')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(SPOT_PREFIX))
})

test.serial('[REST] Futures MarketBuy', async t => {
    await binance.futuresOrder({ symbol: 'LTCUSDT', side: 'BUY', type: 'MARKET', quantity: 0.5 })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
    const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'MARKET')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(CONTRACT_PREFIX))
})

test.serial('[REST] Futures MarketSell', async t => {
    await binance.futuresOrder({ symbol: 'LTCUSDT', side: 'SELL', type: 'MARKET', quantity: 0.5 })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
    const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'SELL')
    t.is(obj.type, 'MARKET')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(CONTRACT_PREFIX))
})

test.serial('[REST] Futures LimitBuy', async t => {
    await binance.futuresOrder({
        symbol: 'LTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 0.5,
        price: 100,
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
    const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'LIMIT')
    t.is(obj.quantity, '0.5')
})

test.serial('[REST] Futures LimitSell', async t => {
    await binance.futuresOrder({
        symbol: 'LTCUSDT',
        side: 'SELL',
        type: 'LIMIT',
        quantity: 0.5,
        price: 100,
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
    const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'SELL')
    t.is(obj.type, 'LIMIT')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(CONTRACT_PREFIX))
})

test.serial('[REST] Futures update/edit order', async t => {
    await binance.futuresUpdateOrder({
        symbol: 'LTCUSDT',
        side: 'SELL',
        type: 'LIMIT',
        quantity: 0.5,
        price: 100,
        orderId: 1234,
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
    const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'SELL')
    t.is(obj.type, 'LIMIT')
    t.is(obj.quantity, '0.5')
    t.is(obj.orderId, '1234')
})

test.serial('[REST] Futures cancel order', async t => {
    await binance.futuresCancelOrder({ symbol: 'LTCUSDT', orderId: '34234234' })
    const url = 'https://fapi.binance.com/fapi/v1/order'
    t.true(interceptedUrl.startsWith(url))
    const obj = urlToObject(interceptedUrl.replace(url, ''))
    t.is(obj.orderId, '34234234')
    t.is(obj.symbol, 'LTCUSDT')
})

test.serial('[REST] MarketBuy test', async t => {
    await binance.orderTest({ symbol: 'LTCUSDT', side: 'BUY', type: 'MARKET', quantity: 0.5 })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order/test'))
    const body = interceptedUrl.replace('https://api.binance.com/api/v3/order/test', '')
    const obj = urlToObject(body)
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'MARKET')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(SPOT_PREFIX))
})

test.serial('[REST] update spot order', async t => {
    await binance.updateOrder({
        symbol: 'LTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: 0.5,
        cancelOrderId: 1234,
    })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order/cancelReplace'))
    const body = interceptedUrl.replace('https://api.binance.com/api/v3/order/cancelReplace', '')
    const obj = urlToObject(body)
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'MARKET')
    t.is(obj.quantity, '0.5')
    t.is(obj.cancelReplaceMode, 'STOP_ON_FAILURE')
    t.is(obj.cancelOrderId, '1234')
    t.true(obj.newClientOrderId.startsWith(SPOT_PREFIX))
})

test.serial('[REST] spot open orders', async t => {
    await binance.openOrders({ symbol: 'LTCUSDT' })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/openOrders'))
})

test.serial('[REST] margin open orders', async t => {
    await binance.marginOpenOrders({ symbol: 'LTCUSDT' })
    t.true(interceptedUrl.startsWith('https://api.binance.com/sapi/v1/margin/openOrders'))
})

test.serial('[REST] Margin MarketBuy order', async t => {
    await binance.marginOrder({ symbol: 'LTCUSDT', side: 'BUY', type: 'MARKET', quantity: 0.5 })
    t.true(interceptedUrl.startsWith('https://api.binance.com/sapi/v1/margin/order'))
    const body = interceptedUrl.replace('https://api.binance.com/sapi/v1/margin/order', '')
    const obj = urlToObject(body)
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'MARKET')
    t.is(obj.quantity, '0.5')
    t.true(obj.newClientOrderId.startsWith(SPOT_PREFIX))
})

test.serial('[REST] spot order with custom clientorderId', async t => {
    await binance.order({
        symbol: 'LTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 0.5,
        price: 100,
        newClientOrderId: 'myid',
    })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
    const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
    const obj = urlToObject(body)
    t.is(obj.symbol, 'LTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'LIMIT')
    t.is(obj.quantity, '0.5')
    t.is(obj.price, '100')
    t.is(obj.newClientOrderId, 'myid')
})

test.serial('[REST] delivery OrderBook', async t => {
    try {
        await binance.deliveryBook({ symbol: 'BTCUSD_PERP' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://dapi.binance.com/dapi/v1/depth?symbol=BTCUSD_PERP')
})

test.serial('[REST] futures set leverage', async t => {
    try {
        await binance.futuresLeverage({ symbol: 'BTCUSDT', leverage: 5 })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.true(
        interceptedUrl.startsWith(
            'https://fapi.binance.com/fapi/v1/leverage?symbol=BTCUSDT&leverage=5',
        ),
    )
})

test.serial('[REST] delivery MarketBuy', async t => {
    await binance.deliveryOrder({
        symbol: 'BTCUSD_PERP',
        side: 'BUY',
        type: 'MARKET',
        quantity: 0.1,
    })
    t.true(interceptedUrl.startsWith('https://dapi.binance.com/dapi/v1/order'))
    const obj = urlToObject(interceptedUrl.replace('https://dapi.binance.com/dapi/v1/order', ''))
    t.is(obj.symbol, 'BTCUSD_PERP')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'MARKET')
    t.is(obj.quantity, '0.1')
    t.true(obj.newClientOrderId.startsWith(CONTRACT_PREFIX))
})

// Algo order tests
test.serial('[REST] Futures Create Algo Order', async t => {
    await binance.futuresCreateAlgoOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'STOP_MARKET',
        quantity: '1',
        triggerPrice: '50000',
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/algoOrder'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/algoOrder?', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'STOP_MARKET')
    t.is(obj.quantity, '1')
    t.is(obj.triggerPrice, '50000')
    t.is(obj.algoType, 'CONDITIONAL')
    t.true(obj.clientAlgoId.startsWith(CONTRACT_PREFIX))
})

test.serial('[REST] Futures Cancel Algo Order', async t => {
    await binance.futuresCancelAlgoOrder({
        symbol: 'BTCUSDT',
        algoId: '12345',
    })
    const url = 'https://fapi.binance.com/fapi/v1/algoOrder'
    t.true(interceptedUrl.startsWith(url))
    const obj = urlToObject(interceptedUrl.replace(url, ''))
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.algoId, '12345')
})

test.serial('[REST] Futures Get Algo Order', async t => {
    await binance.futuresGetAlgoOrder({
        symbol: 'BTCUSDT',
        algoId: '12345',
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/algoOrder'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/algoOrder', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.algoId, '12345')
})

test.serial('[REST] Futures Get Open Algo Orders', async t => {
    await binance.futuresGetOpenAlgoOrders({
        symbol: 'BTCUSDT',
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/openAlgoOrders'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/openAlgoOrders', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
})

test.serial('[REST] Futures Get All Algo Orders', async t => {
    await binance.futuresGetAllAlgoOrders({
        symbol: 'BTCUSDT',
        startTime: '1609459200000',
        endTime: '1609545600000',
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/allAlgoOrders'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/allAlgoOrders', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.startTime, '1609459200000')
    t.is(obj.endTime, '1609545600000')
})

test.serial('[REST] Futures Cancel All Algo Open Orders', async t => {
    await binance.futuresCancelAllAlgoOpenOrders({
        symbol: 'BTCUSDT',
    })
    const url = 'https://fapi.binance.com/fapi/v1/algoOpenOrders'
    t.true(interceptedUrl.startsWith(url))
    const obj = urlToObject(interceptedUrl.replace(url, ''))
    t.is(obj.symbol, 'BTCUSDT')
})

test.serial('[REST] Futures Order Auto-routes STOP_MARKET to Algo', async t => {
    await binance.futuresOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'STOP_MARKET',
        quantity: '1',
        stopPrice: '50000',
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/algoOrder'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/algoOrder?', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'STOP_MARKET')
    t.is(obj.quantity, '1')
    t.is(obj.triggerPrice, '50000')
    t.is(obj.algoType, 'CONDITIONAL')
    t.true(obj.clientAlgoId.startsWith(CONTRACT_PREFIX))
    t.is(obj.newClientOrderId, undefined)
})

test.serial('[REST] Futures Order Auto-routes TAKE_PROFIT_MARKET to Algo', async t => {
    await binance.futuresOrder({
        symbol: 'BTCUSDT',
        side: 'SELL',
        type: 'TAKE_PROFIT_MARKET',
        quantity: '1',
        stopPrice: '60000',
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/algoOrder'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/algoOrder?', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.side, 'SELL')
    t.is(obj.type, 'TAKE_PROFIT_MARKET')
    t.is(obj.quantity, '1')
    t.is(obj.triggerPrice, '60000')
    t.is(obj.algoType, 'CONDITIONAL')
})

test.serial('[REST] Futures Order Auto-routes TRAILING_STOP_MARKET to Algo', async t => {
    await binance.futuresOrder({
        symbol: 'BTCUSDT',
        side: 'SELL',
        type: 'TRAILING_STOP_MARKET',
        quantity: '1',
        callbackRate: '1.0',
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/algoOrder'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/algoOrder?', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.side, 'SELL')
    t.is(obj.type, 'TRAILING_STOP_MARKET')
    t.is(obj.quantity, '1')
    t.is(obj.callbackRate, '1.0')
    t.is(obj.algoType, 'CONDITIONAL')
})

test.serial('[REST] Futures GetOrder with conditional parameter', async t => {
    await binance.futuresGetOrder({
        symbol: 'BTCUSDT',
        algoId: '12345',
        conditional: true,
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/algoOrder'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/algoOrder', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.algoId, '12345')
    t.is(obj.conditional, undefined)
})

test.serial('[REST] Futures CancelOrder with conditional parameter', async t => {
    await binance.futuresCancelOrder({
        symbol: 'BTCUSDT',
        algoId: '12345',
        conditional: true,
    })
    const url = 'https://fapi.binance.com/fapi/v1/algoOrder'
    t.true(interceptedUrl.startsWith(url))
    const obj = urlToObject(interceptedUrl.replace(url, ''))
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.algoId, '12345')
    t.is(obj.conditional, undefined)
})

test.serial('[REST] Futures OpenOrders with conditional parameter', async t => {
    await binance.futuresOpenOrders({
        symbol: 'BTCUSDT',
        conditional: true,
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/openAlgoOrders'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/openAlgoOrders', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.conditional, undefined)
})

test.serial('[REST] Futures AllOrders with conditional parameter', async t => {
    await binance.futuresAllOrders({
        symbol: 'BTCUSDT',
        conditional: true,
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/allAlgoOrders'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/allAlgoOrders', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.conditional, undefined)
})

test.serial('[REST] Futures CancelAllOpenOrders with conditional parameter', async t => {
    await binance.futuresCancelAllOpenOrders({
        symbol: 'BTCUSDT',
        conditional: true,
    })
    const url = 'https://fapi.binance.com/fapi/v1/algoOpenOrders'
    t.true(interceptedUrl.startsWith(url))
    const obj = urlToObject(interceptedUrl.replace(url, ''))
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.conditional, undefined)
})

test.serial('[REST] Futures RPI Depth', async t => {
    try {
        await binance.futuresRpiDepth({ symbol: 'BTCUSDT', limit: 100 })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/rpiDepth?symbol=BTCUSDT&limit=100')
})

test.serial('[REST] Futures RPI Depth no limit', async t => {
    try {
        await binance.futuresRpiDepth({ symbol: 'ETHUSDT' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/rpiDepth?symbol=ETHUSDT')
})

test.serial('[REST] Futures Symbol ADL Risk', async t => {
    await binance.futuresSymbolAdlRisk({ symbol: 'BTCUSDT' })
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/symbolAdlRisk?symbol=BTCUSDT')
})

test.serial('[REST] Futures Symbol ADL Risk all symbols', async t => {
    await binance.futuresSymbolAdlRisk()
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/symbolAdlRisk')
})

test.serial('[REST] Futures Commission Rate', async t => {
    await binance.futuresCommissionRate({ symbol: 'BTCUSDT' })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/commissionRate'))
    const obj = urlToObject(
        interceptedUrl.replace('https://fapi.binance.com/fapi/v1/commissionRate?', ''),
    )
    t.is(obj.symbol, 'BTCUSDT')
})

test.serial('[REST] Futures RPI Order', async t => {
    await binance.futuresOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 0.001,
        price: 50000,
        timeInForce: 'RPI',
    })
    t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
    const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
    t.is(obj.symbol, 'BTCUSDT')
    t.is(obj.side, 'BUY')
    t.is(obj.type, 'LIMIT')
    t.is(obj.quantity, '0.001')
    t.is(obj.price, '50000')
    t.is(obj.timeInForce, 'RPI')
    t.true(obj.newClientOrderId.startsWith(CONTRACT_PREFIX))
})
