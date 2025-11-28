import zip from 'lodash.zipobject'
import JSONbig from 'json-bigint'
import { createHmacSignature, createAsymmetricSignature } from './signature'

// Robust environment detection for Node.js vs Browser
const isNode = (() => {
    // Check for Node.js specific features
    if (
        typeof process !== 'undefined' &&
        process.versions !== null &&
        process.versions.node !== null
    ) {
        return true
    }
    // Check for Deno
    /* eslint-disable no-undef */
    if (typeof Deno !== 'undefined' && Deno.version !== null) {
        return true
    }
    /* eslint-enable no-undef */
    // Browser or Web Worker
    return false
})()

// Platform-specific imports
let fetch
let HttpsProxyAgent

if (isNode) {
    // Node.js environment - use node-fetch for proper proxy support
    const nodeFetch = require('node-fetch')
    fetch = nodeFetch.default || nodeFetch
    const proxyAgent = require('https-proxy-agent')
    HttpsProxyAgent = proxyAgent.HttpsProxyAgent || proxyAgent.default || proxyAgent
} else {
    // Browser environment - use native APIs
    /* eslint-disable no-undef */
    fetch = globalThis.fetch?.bind(globalThis) || window.fetch?.bind(window)
    /* eslint-enable no-undef */
}

const getEndpoint = (endpoints, path, testnet) => {
    const isFutures = path.includes('/fapi') || path.includes('/futures')
    const isDelivery = path.includes('/dapi')
    const isPortfolioMargin = path.includes('/papi')

    if (testnet) {
        if (isFutures) return 'https://demo-fapi.binance.com'
        if (isDelivery) return 'https://demo-dapi.binance.com'
        if (isPortfolioMargin) return 'https://demo-papi.binance.com'
        return 'https://demo-api.binance.com'
    }

    if (path.includes('/fapi') || path.includes('/futures'))
        return endpoints.futures || 'https://fapi.binance.com'
    if (path.includes('/dapi')) return endpoints.delivery || 'https://dapi.binance.com'
    if (path.includes('/papi')) return endpoints.portfolioMargin || 'https://papi.binance.com'

    return endpoints.base || 'https://api.binance.com'
}

const getDomainName = url => {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([\w-]+(\.[\w-]+)+)/)
    return match ? match[1] : null
}

const defaultGetTime = () => Date.now()

const uuid22 = a => {
    return a
        ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
        : ([1e7] + 1e3 + 4e3 + 8e5).replace(/[018]/g, uuid22)
}

// Singleton holding header data like rate limits.
const info = {}

/**
 * Build query string for uri encoded url based on json object
 */
const makeQueryString = q =>
    q
        ? `?${Object.keys(q)
              .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
              .join('&')}`
        : ''

/**
 * Get API limits info from headers
 */
const headersMapping = {
    'x-mbx-used-weight-1m': 'usedWeight1m',
    'x-mbx-order-count-10s': 'orderCount10s',
    'x-mbx-order-count-1m': 'orderCount1m',
    'x-mbx-order-count-1h': 'orderCount1h',
    'x-mbx-order-count-1d': 'orderCount1d',
    'x-response-time': 'responseTime',
}

const responseHandler = res => {
    if (!res.headers || !res.url) return

    const domain = getDomainName(res.url)
    if (!info[domain]) info[domain] = {}

    for (const key of Object.keys(headersMapping)) {
        const outKey = headersMapping[key]

        if (res.headers.has(key)) {
            info[domain][outKey] = res.headers.get(key)
        }
    }
}

/**
 * Finalize API response
 */
const sendResult = call =>
    call.then(res => {
        // Get API limits info from headers
        responseHandler(res)

        // If response is ok, we can safely assume it is valid JSON
        if (res.ok) return res.text().then(text => JSONbig.parse(text))

        // Errors might come from the API itself or the proxy Binance is using.
        // For API errors the response will be valid JSON,but for proxy errors
        // it will be HTML
        return res.text().then(text => {
            let error
            try {
                const json = JSONbig.parse(text)
                // The body was JSON parseable, assume it is an API response error
                error = new Error(json.msg || `${res.status} ${res.statusText}`)
                error.code = json.code
                error.url = res.url
            } catch (e) {
                // The body was not JSON parseable, assume it is proxy error
                error = new Error(`${res.status} ${res.statusText} ${text}`)
                error.response = res
                error.responseText = text
            }
            throw error
        })
    })

/**
 * Util to validate existence of required parameter(s)
 */
const checkParams = (name, payload, requires = []) => {
    if (!payload) {
        throw new Error('You need to pass a payload object.')
    }

    requires.forEach(r => {
        if (!payload[r] && isNaN(payload[r])) {
            throw new Error(`Method ${name} requires ${r} parameter.`)
        }
    })

    return true
}

const spotP = () => {
    return `x-B3AUXNYV${uuid22()}`
}

const futuresP = () => {
    return `x-ftGmvgAN${uuid22()}`
}

/**
 * Make public calls against the api
 *
 * @param {string} path Endpoint path
 * @param {object} data The payload to be sent
 * @param {string} method HTTB VERB, GET by default
 * @param {object} headers
 * @returns {object} The api response
 */
const publicCall =
    ({ proxy, endpoints, testnet }) =>
    (path, data, method = 'GET', headers = {}) => {
        const fetchOptions = {
            method,
            json: true,
            headers,
        }

        // Only add proxy agent in Node.js environment
        if (proxy && isNode && HttpsProxyAgent) {
            fetchOptions.agent = new HttpsProxyAgent(proxy)
        }

        return sendResult(
            fetch(
                `${getEndpoint(endpoints, path, testnet)}${path}${makeQueryString(data)}`,
                fetchOptions,
            ),
        )
    }

/**
 * Factory method for partial private calls against the api
 *
 * @param {string} path Endpoint path
 * @param {object} data The payload to be sent
 * @param {string} method HTTB VERB, GET by default
 * @returns {object} The api response
 */
const keyCall =
    ({ apiKey, pubCall }) =>
    (path, data, method = 'GET') => {
        if (!apiKey) {
            throw new Error('You need to pass an API key to make this call.')
        }

        return pubCall(path, data, method, {
            'X-MBX-APIKEY': apiKey,
        })
    }

/**
 * Factory method for private calls against the api
 *
 * @param {string} path Endpoint path
 * @param {object} data The payload to be sent
 * @param {string} method HTTB VERB, GET by default
 * @param {object} headers
 * @returns {object} The api response
 */
const privateCall =
    ({
        apiKey,
        apiSecret,
        privateKey,
        proxy,
        endpoints,
        getTime = defaultGetTime,
        pubCall,
        testnet,
    }) =>
    (path, data = {}, method = 'GET', noData, noExtra) => {
        if (!apiKey || (!apiSecret && !privateKey)) {
            throw new Error(
                'You need to pass an API key and secret/privateKey to make authenticated calls.',
            )
        }

        return (
            data && data.useServerTime
                ? pubCall('/api/v3/time').then(r => r.serverTime)
                : Promise.resolve(getTime())
        )
            .then(timestamp => {
                if (data) {
                    delete data.useServerTime
                }

                const queryString = makeQueryString({ ...data, timestamp })
                const dataToSign = queryString.substr(1)

                // Create signature (async in browser, sync in Node.js)
                if (apiSecret) {
                    return createHmacSignature(dataToSign, apiSecret).then(signature => ({
                        timestamp,
                        signature,
                    }))
                } else if (privateKey) {
                    const sig = createAsymmetricSignature(dataToSign, privateKey)
                    // .then(signature => ({
                    //     timestamp,
                    //     signature,
                    // }))
                    return {
                        timestamp,
                        signature: sig,
                    }
                }
            })
            .then(({ timestamp, signature }) => {
                const newData = noExtra ? data : { ...data, timestamp, signature }

                const fetchOptions = {
                    method,
                    headers: { 'X-MBX-APIKEY': apiKey },
                    json: true,
                }

                // Only add proxy agent in Node.js environment
                if (proxy && isNode && HttpsProxyAgent) {
                    fetchOptions.agent = new HttpsProxyAgent(proxy)
                }

                return sendResult(
                    fetch(
                        `${getEndpoint(endpoints, path, testnet)}${path}${noData ? '' : makeQueryString(newData)}`,
                        fetchOptions,
                    ),
                )
            })
    }

export const candleFields = [
    'openTime',
    'open',
    'high',
    'low',
    'close',
    'volume',
    'closeTime',
    'quoteVolume',
    'trades',
    'baseAssetVolume',
    'quoteAssetVolume',
]

export const deliveryCandleFields = [
    'openTime',
    'open',
    'high',
    'low',
    'close',
    'volume',
    'closeTime',
    'baseVolume',
    'trades',
    'quoteAssetVolume',
    'baseAssetVolume',
]

/**
 * Get candles for a specific pair and interval and convert response
 * to a user friendly collection.
 */
const candles = (pubCall, payload, endpoint = '/api/v3/klines') =>
    checkParams('candles', payload, endpoint.includes('indexPrice') ? ['pair'] : ['symbol']) &&
    pubCall(endpoint, { interval: '5m', ...payload }).then(candles =>
        candles.map(candle =>
            zip(!endpoint.includes('dapi') ? candleFields : deliveryCandleFields, candle),
        ),
    )

const isContractURL = path => {
    const isFutures = path.includes('/fapi') || path.includes('/futures')
    const isDelivery = path.includes('/dapi')
    const isPortfolioMargin = path.includes('/papi')
    return isFutures || isDelivery || isPortfolioMargin
}

/**
 * Create a new order wrapper for market order simplicity
 */
const order = (privCall, payload = {}, url) => {
    const newPayload =
        ['LIMIT', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT'].includes(payload.type) || !payload.type
            ? { timeInForce: 'GTC', ...payload }
            : payload

    const requires = ['symbol', 'side']

    if (
        !(newPayload.type === 'MARKET' && newPayload.quoteOrderQty) &&
        !(newPayload.type === 'STOP_MARKET') &&
        !(newPayload.type === 'TAKE_PROFIT_MARKET') &&
        !(newPayload.type === 'TRAILING_STOP_MARKET')
    ) {
        requires.push('quantity')
    }

    if (newPayload.type === 'TRAILING_STOP_MARKET') {
        requires.push('callbackRate')
    }

    if (!newPayload.newClientOrderId) {
        // check if this is spot or futures/delivery
        const isContract = isContractURL(url)
        if (isContract) {
            newPayload.newClientOrderId = futuresP()
        } else {
            newPayload.newClientOrderId = spotP()
        }
    }

    return (
        checkParams('order', newPayload, requires) &&
        privCall(url, { type: 'LIMIT', ...newPayload }, 'POST')
    )
}

const orderOco = (privCall, payload = {}, url) => {
    const newPayload =
        payload.stopLimitPrice && !payload.stopLimitTimeInForce
            ? { stopLimitTimeInForce: 'GTC', ...payload }
            : payload

    if (!newPayload.listClientOrderId) {
        newPayload.listClientOrderId = spotP()
    }

    return (
        checkParams('order', newPayload, ['symbol', 'side', 'quantity', 'price', 'stopPrice']) &&
        privCall(url, newPayload, 'POST')
    )
}

/**
 * Zip asks and bids reponse from order book
 */
const book = (pubCall, payload, endpoint = '/api/v3/depth') =>
    checkParams('book', payload, ['symbol']) &&
    pubCall(endpoint, payload).then(({ lastUpdateId, asks, bids }) => ({
        lastUpdateId,
        asks: asks.map(a => zip(['price', 'quantity'], a)),
        bids: bids.map(b => zip(['price', 'quantity'], b)),
    }))

const aggTrades = (pubCall, payload, endpoint = '/api/v3/aggTrades') =>
    checkParams('aggTrades', payload, ['symbol']) &&
    pubCall(endpoint, payload).then(trades =>
        trades.map(trade => {
            const transformed = {
                aggId: trade.a,
                symbol: payload.symbol,
                price: trade.p,
                quantity: trade.q,
                firstId: trade.f,
                lastId: trade.l,
                timestamp: trade.T,
                isBuyerMaker: trade.m,
            }
            if (trade.M) transformed.wasBestPrice = trade.M

            return transformed
        }),
    )

export default opts => {
    const endpoints = {
        base: opts && opts.httpBase,
        futures: opts && opts.httpFutures,
        delivery: opts && opts.httpDelivery,
        portfolioMargin: opts && opts.httpPortfolioMargin,
    }

    const pubCall = publicCall({ ...opts, endpoints })
    const deliveryPubCall = publicCall({
        ...opts,
        endpoints: { futures: endpoints.delivery },
    })
    const privCall = privateCall({ ...opts, endpoints, pubCall })
    const kCall = keyCall({ ...opts, pubCall })

    return {
        // Generic endpoints
        getInfo: () => info,
        ping: () => pubCall('/api/v3/ping').then(() => true),
        time: () => pubCall('/api/v3/time').then(r => r.serverTime),
        exchangeInfo: payload => pubCall('/api/v3/exchangeInfo', payload),

        // Market Data endpoints
        book: payload => book(pubCall, payload),
        aggTrades: payload => aggTrades(pubCall, payload),
        candles: payload => candles(pubCall, payload),
        trades: payload =>
            checkParams('trades', payload, ['symbol']) && pubCall('/api/v3/trades', payload),
        tradesHistory: payload =>
            checkParams('tradesHitory', payload, ['symbol']) &&
            kCall('/api/v3/historicalTrades', payload),
        dailyStats: payload => pubCall('/api/v3/ticker/24hr', payload),
        prices: payload =>
            pubCall('/api/v3/ticker/price', payload).then(r =>
                (Array.isArray(r) ? r : [r]).reduce(
                    (out, cur) => ((out[cur.symbol] = cur.price), out),
                    {},
                ),
            ),
        avgPrice: payload => pubCall('/api/v3/avgPrice', payload),
        allBookTickers: () =>
            pubCall('/api/v3/ticker/bookTicker').then(r =>
                (Array.isArray(r) ? r : [r]).reduce(
                    (out, cur) => ((out[cur.symbol] = cur), out),
                    {},
                ),
            ),

        // Order endpoints
        order: payload => order(privCall, payload, '/api/v3/order'),
        orderOco: payload => orderOco(privCall, payload, '/api/v3/order/oco'),
        orderTest: payload => order(privCall, payload, '/api/v3/order/test'),
        getOrder: payload => privCall('/api/v3/order', payload),
        getOrderOco: payload => privCall('/api/v3/orderList', payload),
        cancelOrder: payload => privCall('/api/v3/order', payload, 'DELETE'),
        cancelOrderOco: payload => privCall('/api/v3/orderList', payload, 'DELETE'),
        cancelOpenOrders: payload => privCall('/api/v3/openOrders', payload, 'DELETE'),
        openOrders: payload => privCall('/api/v3/openOrders', payload),
        allOrders: payload => privCall('/api/v3/allOrders', payload),
        allOrdersOCO: payload => privCall('/api/v3/allOrderList', payload),

        // Account endpoints
        accountInfo: payload => privCall('/api/v3/account', payload),
        myTrades: payload => privCall('/api/v3/myTrades', payload),
        withdraw: payload => privCall('/sapi/v1/capital/withdraw/apply', payload, 'POST'),
        withdrawHistory: payload => privCall('/sapi/v1/capital/withdraw/history', payload),
        depositHistory: payload => privCall('/sapi/v1/capital/deposit/hisrec', payload),
        depositAddress: payload => privCall('/sapi/v1/capital/deposit/address', payload),
        tradeFee: payload => privCall('/sapi/v1/asset/tradeFee', payload),
        assetDetail: payload => privCall('/sapi/v1/asset/assetDetail', payload),
        accountSnapshot: payload => privCall('/sapi/v1/accountSnapshot', payload),
        universalTransfer: payload => privCall('/sapi/v1/asset/transfer', payload, 'POST'),
        universalTransferHistory: payload => privCall('/sapi/v1/asset/transfer', payload),
        dustLog: payload => privCall('/sapi/v1/asset/dribblet', payload),
        dustTransfer: payload => privCall('/sapi/v1/asset/dust', payload, 'POST'),
        accountCoins: payload => privCall('/sapi/v1/capital/config/getall', payload),
        getBnbBurn: payload => privCall('/sapi/v1/bnbBurn', payload),
        setBnbBurn: payload => privCall('/sapi/v1/bnbBurn', payload, 'POST'),
        capitalConfigs: () => privCall('/sapi/v1/capital/config/getall'),

        // User Data Stream endpoints
        getDataStream: () => privCall('/api/v3/userDataStream', null, 'POST', true),
        keepDataStream: payload => privCall('/api/v3/userDataStream', payload, 'PUT', false, true),
        closeDataStream: payload =>
            privCall('/api/v3/userDataStream', payload, 'DELETE', false, true),
        marginGetDataStream: () => privCall('/sapi/v1/userDataStream', null, 'POST', true),
        marginKeepDataStream: payload =>
            privCall('/sapi/v1/userDataStream', payload, 'PUT', false, true),
        marginCloseDataStream: payload =>
            privCall('/sapi/v1/userDataStream', payload, 'DELETE', false, true),
        futuresGetDataStream: () => privCall('/fapi/v1/listenKey', null, 'POST', true),
        futuresKeepDataStream: payload =>
            privCall('/fapi/v1/listenKey', payload, 'PUT', false, true),
        futuresCloseDataStream: payload =>
            privCall('/fapi/v1/listenKey', payload, 'DELETE', false, true),
        deliveryGetDataStream: () => privCall('/dapi/v1/listenKey', null, 'POST', true),
        deliveryKeepDataStream: payload =>
            privCall('/dapi/v1/listenKey', payload, 'PUT', false, true),
        deliveryCloseDataStream: payload =>
            privCall('/dapi/v1/listenKey', payload, 'DELETE', false, true),

        // Futures endpoints
        futuresPing: () => pubCall('/fapi/v1/ping').then(() => true),
        futuresTime: () => pubCall('/fapi/v1/time').then(r => r.serverTime),
        futuresExchangeInfo: () => pubCall('/fapi/v1/exchangeInfo'),
        futuresBook: payload => book(pubCall, payload, '/fapi/v1/depth'),
        futuresAggTrades: payload => aggTrades(pubCall, payload, '/fapi/v1/aggTrades'),
        futuresMarkPrice: payload => pubCall('/fapi/v1/premiumIndex', payload),
        futuresAllForceOrders: payload => pubCall('/fapi/v1/allForceOrders', payload),
        futuresLongShortRatio: payload =>
            pubCall('/futures/data/globalLongShortAccountRatio', payload),
        futuresCandles: payload => candles(pubCall, payload, '/fapi/v1/klines'),
        futuresMarkPriceCandles: payload => candles(pubCall, payload, '/fapi/v1/markPriceKlines'),
        futuresIndexPriceCandles: payload => candles(pubCall, payload, '/fapi/v1/indexPriceKlines'),
        futuresTrades: payload =>
            checkParams('trades', payload, ['symbol']) && pubCall('/fapi/v1/trades', payload),
        futuresDailyStats: payload => pubCall('/fapi/v1/ticker/24hr', payload),
        futuresPrices: payload =>
            pubCall('/fapi/v1/ticker/price', payload).then(r =>
                (Array.isArray(r) ? r : [r]).reduce(
                    (out, cur) => ((out[cur.symbol] = cur.price), out),
                    {},
                ),
            ),
        futuresAllBookTickers: () =>
            pubCall('/fapi/v1/ticker/bookTicker').then(r =>
                (Array.isArray(r) ? r : [r]).reduce(
                    (out, cur) => ((out[cur.symbol] = cur), out),
                    {},
                ),
            ),
        futuresFundingRate: payload =>
            checkParams('fundingRate', payload, ['symbol']) &&
            pubCall('/fapi/v1/fundingRate', payload),
        futuresOrder: payload => order(privCall, payload, '/fapi/v1/order'),
        futuresBatchOrders: payload => privCall('/fapi/v1/batchOrders', payload, 'POST'),
        futuresGetOrder: payload => privCall('/fapi/v1/order', payload),
        futuresCancelOrder: payload => privCall('/fapi/v1/order', payload, 'DELETE'),
        futuresCancelAllOpenOrders: payload =>
            privCall('/fapi/v1/allOpenOrders', payload, 'DELETE'),
        futuresCancelBatchOrders: payload => privCall('/fapi/v1/batchOrders', payload, 'DELETE'),
        futuresOpenOrders: payload => privCall('/fapi/v1/openOrders', payload),
        futuresAllOrders: payload => privCall('/fapi/v1/allOrders', payload),
        futuresPositionRisk: payload => privCall('/fapi/v2/positionRisk', payload),
        futuresLeverageBracket: payload => privCall('/fapi/v1/leverageBracket', payload),
        futuresAccountBalance: payload => privCall('/fapi/v2/balance', payload),
        futuresAccountInfo: payload => privCall('/fapi/v2/account', payload),
        futuresUserTrades: payload => privCall('/fapi/v1/userTrades', payload),
        futuresPositionMode: payload => privCall('/fapi/v1/positionSide/dual', payload),
        futuresPositionModeChange: payload =>
            privCall('/fapi/v1/positionSide/dual', payload, 'POST'),
        futuresLeverage: payload => privCall('/fapi/v1/leverage', payload, 'POST'),
        futuresMarginType: payload => privCall('/fapi/v1/marginType', payload, 'POST'),
        futuresPositionMargin: payload => privCall('/fapi/v1/positionMargin', payload, 'POST'),
        futuresMarginHistory: payload => privCall('/fapi/v1/positionMargin/history', payload),
        futuresIncome: payload => privCall('/fapi/v1/income', payload),
        getMultiAssetsMargin: payload => privCall('/fapi/v1/multiAssetsMargin', payload),
        setMultiAssetsMargin: payload => privCall('/fapi/v1/multiAssetsMargin', payload, 'POST'),

        // Delivery endpoints
        deliveryPing: () => pubCall('/dapi/v1/ping').then(() => true),
        deliveryTime: () => pubCall('/dapi/v1/time').then(r => r.serverTime),
        deliveryExchangeInfo: () => pubCall('/dapi/v1/exchangeInfo'),
        deliveryBook: payload => book(pubCall, payload, '/dapi/v1/depth'),
        deliveryAggTrades: payload => aggTrades(pubCall, payload, '/dapi/v1/aggTrades'),
        deliveryMarkPrice: payload => pubCall('/dapi/v1/premiumIndex', payload),
        deliveryAllForceOrders: payload => pubCall('/dapi/v1/allForceOrders', payload),
        deliveryLongShortRatio: payload =>
            deliveryPubCall('/futures/data/globalLongShortAccountRatio', payload),
        deliveryCandles: payload => candles(pubCall, payload, '/dapi/v1/klines'),
        deliveryMarkPriceCandles: payload => candles(pubCall, payload, '/dapi/v1/markPriceKlines'),
        deliveryIndexPriceCandles: payload =>
            candles(pubCall, payload, '/dapi/v1/indexPriceKlines'),
        deliveryTrades: payload =>
            checkParams('trades', payload, ['symbol']) && pubCall('/dapi/v1/trades', payload),
        deliveryDailyStats: payload => pubCall('/dapi/v1/ticker/24hr', payload),
        deliveryPrices: () =>
            pubCall('/dapi/v1/ticker/price').then(r =>
                (Array.isArray(r) ? r : [r]).reduce(
                    (out, cur) => ((out[cur.symbol] = cur.price), out),
                    {},
                ),
            ),
        deliveryAllBookTickers: () =>
            pubCall('/dapi/v1/ticker/bookTicker').then(r =>
                (Array.isArray(r) ? r : [r]).reduce(
                    (out, cur) => ((out[cur.symbol] = cur), out),
                    {},
                ),
            ),
        deliveryFundingRate: payload =>
            checkParams('fundingRate', payload, ['symbol']) &&
            pubCall('/dapi/v1/fundingRate', payload),
        deliveryOrder: payload => order(privCall, payload, '/dapi/v1/order'),
        deliveryBatchOrders: payload => privCall('/dapi/v1/batchOrders', payload, 'POST'),
        deliveryGetOrder: payload => privCall('/dapi/v1/order', payload),
        deliveryCancelOrder: payload => privCall('/dapi/v1/order', payload, 'DELETE'),
        deliveryCancelAllOpenOrders: payload =>
            privCall('/dapi/v1/allOpenOrders', payload, 'DELETE'),
        deliveryCancelBatchOrders: payload => privCall('/dapi/v1/batchOrders', payload, 'DELETE'),
        deliveryOpenOrders: payload => privCall('/dapi/v1/openOrders', payload),
        deliveryAllOrders: payload => privCall('/dapi/v1/allOrders', payload),
        deliveryPositionRisk: payload => privCall('/dapi/v1/positionRisk', payload),
        deliveryLeverageBracket: payload => privCall('/dapi/v1/leverageBracket', payload),
        deliveryAccountBalance: payload => privCall('/dapi/v1/balance', payload),
        deliveryAccountInfo: payload => privCall('/dapi/v1/account', payload),
        deliveryUserTrades: payload => privCall('/dapi/v1/userTrades', payload),
        deliveryPositionMode: payload => privCall('/dapi/v1/positionSide/dual', payload),
        deliveryPositionModeChange: payload =>
            privCall('/dapi/v1/positionSide/dual', payload, 'POST'),
        deliveryLeverage: payload => privCall('/dapi/v1/leverage', payload, 'POST'),
        deliveryMarginType: payload => privCall('/dapi/v1/marginType', payload, 'POST'),
        deliveryPositionMargin: payload => privCall('/dapi/v1/positionMargin', payload, 'POST'),
        deliveryMarginHistory: payload => privCall('/dapi/v1/positionMargin/history', payload),
        deliveryIncome: payload => privCall('/dapi/v1/income', payload),

        // PAPI endpoints
        papiPing: () => privCall('/papi/v1/ping'),
        papiAccount: () => privCall('/papi/v1/account'),
        papiBalance: payload => privCall('/papi/v1/balance', payload),
        papiUmOrder: payload => privCall('/papi/v1/um/order', payload),
        papiUmConditionalOrder: payload =>
            privCall('/papi/v1/um/conditional/order', payload, 'POST'),
        papiCmOrder: payload => privCall('/papi/v1/cm/order', payload, 'POST'),
        papiCmConditionalOrder: payload =>
            privCall('/papi/v1/cm/conditional/order', payload, 'POST'),
        papiMarginOrder: payload => privCall('/papi/v1/margin/order', payload, 'POST'),
        papiMarginLoan: payload => privCall('/papi/v1/marginLoan', payload, 'POST'),
        papiRepayLoan: payload => privCall('/papi/v1/repayLoan', payload, 'POST'),
        papiMarginOrderOco: payload => privCall('/papi/v1/margin/order/oco', payload, 'POST'),
        papiUmCancelOrder: payload => privCall('/papi/v1/um/order', payload, 'DELETE'),
        papiUmCancelAllOpenOrders: payload =>
            privCall('/papi/v1/um/allOpenOrders', payload, 'DELETE'),
        papiUmCancelConditionalOrder: payload =>
            privCall('/papi/v1/um/conditional/order', payload, 'DELETE'),
        papiUmCancelConditionalAllOpenOrders: payload =>
            privCall('/papi/v1/um/conditional/allOpenOrders', payload, 'DELETE'),
        papiCmCancelOrder: payload => privCall('/papi/v1/cm/order', payload, 'DELETE'),
        papiCmCancelAllOpenOrders: payload =>
            privCall('/papi/v1/cm/allOpenOrders', payload, 'DELETE'),
        papiCmCancelConditionalOrder: payload =>
            privCall('/papi/v1/cm/conditional/order', payload, 'DELETE'),
        papiCmCancelConditionalAllOpenOrders: payload =>
            privCall('/papi/v1/cm/conditional/allOpenOrders', payload, 'DELETE'),
        papiMarginCancelOrder: payload => privCall('/papi/v1/margin/order', payload, 'DELETE'),
        papiMarginCancelOrderList: payload =>
            privCall('/papi/v1/margin/orderList', payload, 'DELETE'),
        papiMarginCancelAllOpenOrders: payload =>
            privCall('/papi/v1/margin/allOpenOrders', payload, 'DELETE'),
        papiUmUpdateOrder: payload => privCall('/papi/v1/um/order', payload, 'PUT'),
        papiCmUpdateOrder: payload => privCall('/papi/v1/cm/order', payload, 'PUT'),
        papiUmGetOrder: payload => privCall('/papi/v1/um/order', payload),
        papiUmGetAllOrders: payload => privCall('/papi/v1/um/allOrders', payload),
        papiUmGetOpenOrder: payload => privCall('/papi/v1/um/openOrder', payload),
        papiUmGetOpenOrders: payload => privCall('/papi/v1/um/openOrders', payload),
        papiUmGetConditionalAllOrders: payload =>
            privCall('/papi/v1/um/conditional/allOrders', payload),
        papiUmGetConditionalOpenOrders: payload =>
            privCall('/papi/v1/um/conditional/openOrders', payload),
        papiUmGetConditionalOpenOrder: payload =>
            privCall('/papi/v1/um/conditional/openOrder', payload),
        papiUmGetConditionalOrderHistory: payload =>
            privCall('/papi/v1/um/conditional/orderHistory', payload),
        papiCmGetOrder: payload => privCall('/papi/v1/cm/order', payload),
        papiCmGetAllOrders: payload => privCall('/papi/v1/cm/allOrders', payload),
        papiCmGetOpenOrder: payload => privCall('/papi/v1/cm/openOrder', payload),
        papiCmGetOpenOrders: payload => privCall('/papi/v1/cm/openOrders', payload),
        papiCmGetConditionalOpenOrders: payload =>
            privCall('/papi/v1/cm/conditional/openOrders', payload),
        papiCmGetConditionalOpenOrder: payload =>
            privCall('/papi/v1/cm/conditional/openOrder', payload),
        papiCmGetConditionalAllOrders: payload =>
            privCall('/papi/v1/cm/conditional/allOrders', payload),
        papiCmGetConditionalOrderHistory: payload =>
            privCall('/papi/v1/cm/conditional/orderHistory', payload),
        papiUmGetForceOrders: payload => privCall('/papi/v1/um/forceOrders', payload),
        papiCmGetForceOrders: payload => privCall('/papi/v1/cm/forceOrders', payload),
        papiUmGetOrderAmendment: payload => privCall('/papi/v1/um/orderAmendment', payload),
        papiCmGetOrderAmendment: payload => privCall('/papi/v1/cm/orderAmendment', payload),
        papiMarginGetForceOrders: payload => privCall('/papi/v1/margin/forceOrders', payload),
        papiUmGetUserTrades: payload => privCall('/papi/v1/um/userTrades', payload),
        papiCmGetUserTrades: payload => privCall('/papi/v1/cm/userTrades', payload),
        papiUmGetAdlQuantile: payload => privCall('/papi/v1/um/adlQuantile', payload),
        papiCmGetAdlQuantile: payload => privCall('/papi/v1/cm/adlQuantile', payload),
        papiUmFeeBurn: payload => privCall('/papi/v1/um/feeBurn', payload, 'POST'),
        papiUmGetFeeBurn: payload => privCall('/papi/v1/um/feeBurn', payload),
        papiMarginGetOrder: payload => privCall('/papi/v1/margin/order', payload),
        papiMarginGetOpenOrders: payload => privCall('/papi/v1/margin/openOrders', payload),
        papiMarginGetAllOrders: payload => privCall('/papi/v1/margin/allOrders', payload),
        papiMarginGetOrderList: payload => privCall('/papi/v1/margin/orderList', payload),
        papiMarginGetAllOrderList: payload => privCall('/papi/v1/margin/allOrderList', payload),
        papiMarginGetOpenOrderList: payload => privCall('/papi/v1/margin/openOrderList', payload),
        papiMarginGetMyTrades: payload => privCall('/papi/v1/margin/myTrades', payload),
        papiMarginRepayDebt: payload => privCall('/papi/v1/margin/repay-debt', payload, 'POST'),

        // Margin endpoints
        marginAllOrders: payload => privCall('/sapi/v1/margin/allOrders', payload),
        marginOrder: payload => order(privCall, payload, '/sapi/v1/margin/order'),
        marginOrderOco: payload => orderOco(privCall, payload, '/sapi/v1/margin/order/oco'),
        marginGetOrder: payload => privCall('/sapi/v1/margin/order', payload),
        marginGetOrderOco: payload => privCall('/sapi/v1/margin/orderList', payload),
        marginCancelOrder: payload => privCall('/sapi/v1/margin/order', payload, 'DELETE'),
        marginOpenOrders: payload => privCall('/sapi/v1/margin/openOrders', payload),
        marginCancelOpenOrders: payload =>
            privCall('/sapi/v1/margin/openOrders', payload, 'DELETE'),
        marginAccountInfo: payload => privCall('/sapi/v1/margin/account', payload),
        marginMyTrades: payload => privCall('/sapi/v1/margin/myTrades', payload),
        marginRepay: payload => privCall('/sapi/v1/margin/repay', payload, 'POST'),
        marginLoan: payload => privCall('/sapi/v1/margin/loan', payload, 'POST'),
        marginCapitalFlow: payload => privCall('/sapi/v1/margin/capital-flow', payload),
        marginInterestHistory: payload => privCall('/sapi/v1/margin/interestHistory', payload),
        marginIsolatedAccount: payload => privCall('/sapi/v1/margin/isolated/account', payload),
        marginMaxBorrow: payload => privCall('/sapi/v1/margin/maxBorrowable', payload),
        marginCreateIsolated: payload =>
            privCall('/sapi/v1/margin/isolated/create', payload, 'POST'),
        marginIsolatedTransfer: payload =>
            privCall('/sapi/v1/margin/isolated/transfer', payload, 'POST'),
        marginIsolatedTransferHistory: payload =>
            privCall('/sapi/v1/margin/isolated/transfer', payload),
        disableMarginAccount: payload =>
            privCall('/sapi/v1/margin/isolated/account', payload, 'DELETE'),
        enableMarginAccount: payload =>
            privCall('/sapi/v1/margin/isolated/account', payload, 'POST'),
        isolatedMarginAllPairs: payload => privCall('/sapi/v1/margin/isolated/allPairs', payload),
        isolatedMarginAccount: payload => privCall('/sapi/v1/margin/isolated/account', payload),
        marginAccount: () => privCall('/sapi/v1/margin/account'),

        // Portfolio Margin endpoints
        portfolioMarginAccountInfo: () => privCall('/sapi/v1/portfolio/account'),
        portfolioMarginCollateralRate: () => privCall('/sapi/v1/portfolio/collateralRate'),
        portfolioMarginLoan: payload => privCall('/sapi/v1/portfolio/pmLoan', payload),
        portfolioMarginLoanRepay: payload => privCall('/sapi/v1/portfolio/repay', payload, 'POST'),
        portfolioMarginInterestHistory: payload =>
            privCall('/sapi/v1/portfolio/interest-history', payload),

        // Savings endpoints
        savingsAccount: payload => privCall('/sapi/v1/lending/union/account', payload),
        savingsPurchase: payload => privCall('/sapi/v1/lending/union/purchase', payload, 'POST'),
        savingsRedeem: payload => privCall('/sapi/v1/lending/union/redeem', payload, 'POST'),
        fundingWallet: payload => privCall('/sapi/v1/asset/get-funding-asset', payload, 'POST'),
        convertTradeFlow: payload => privCall('/sapi/v1/convert/tradeFlow', payload),
        rebateTaxQuery: () => privCall('/sapi/v1/rebate/taxQuery'),
        payTradeHistory: payload => privCall('/sapi/v1/pay/transactions', payload),
        apiRestrictions: payload => privCall('/sapi/v1/account/apiRestrictions', payload),

        // Mining endpoints
        miningHashrateResaleRequest: payload =>
            privCall('/sapi/v1/mining/hash-transfer/config', payload, 'POST'),
        miningHashrateResaleCancel: payload =>
            privCall('/sapi/v1/mining/hash-transfer/config/cancel', payload, 'POST'),
        miningStatistics: payload => privCall('/sapi/v1/mining/statistics/user/status', payload),

        // Utility endpoints
        privateRequest: (method, url, payload) => privCall(url, payload, method),
        publicRequest: (method, url, payload) => pubCall(url, payload, method),
    }
}
