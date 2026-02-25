import type { BinanceRest } from '../index.d'
import { OrderType, OrderSide, TimeInForce } from '../types/base'
import test from 'ava'

// This type represents all methods from http-client.js
type HttpClientMethods = {
    getInfo: () => Promise<any>
    ping: () => Promise<boolean>
    time: () => Promise<{ serverTime: number }>
    exchangeInfo: (payload?: any) => Promise<any>
    book: (payload: { symbol: string }) => Promise<any>
    aggTrades: (payload: { symbol: string }) => Promise<any>
    candles: (payload: { symbol: string; interval: string }) => Promise<any>
    trades: (payload: { symbol: string }) => Promise<any>
    tradesHistory: (payload: { symbol: string }) => Promise<any>
    dailyStats: (payload: { symbol: string }) => Promise<any>
    prices: () => Promise<any>
    avgPrice: (payload: { symbol: string }) => Promise<any>
    allBookTickers: () => Promise<any>
    order: (payload: any) => Promise<any>
    orderOco: (payload: any) => Promise<any>
    orderTest: (payload: any) => Promise<any>
    getOrder: (payload: any) => Promise<any>
    getOrderOco: (payload: any) => Promise<any>
    cancelOrder: (payload: any) => Promise<any>
    cancelOrderOco: (payload: any) => Promise<any>
    cancelOpenOrders: (payload: any) => Promise<any>
    openOrders: (payload?: any) => Promise<any>
    allOrders: (payload: any) => Promise<any>
    allOrdersOCO: (payload: any) => Promise<any>
    accountInfo: (payload?: any) => Promise<any>
    myTrades: (payload: any) => Promise<any>
    withdraw: (payload: any) => Promise<any>
    withdrawHistory: (payload: any) => Promise<any>
    depositHistory: (payload: any) => Promise<any>
    depositAddress: (payload: any) => Promise<any>
    tradeFee: (payload: any) => Promise<any>
    assetDetail: (payload: any) => Promise<any>
    accountSnapshot: (payload: any) => Promise<any>
    universalTransfer: (payload: any) => Promise<any>
    universalTransferHistory: (payload: any) => Promise<any>
    dustLog: (payload?: any) => Promise<any>
    dustTransfer: (payload: any) => Promise<any>
    accountCoins: (payload?: any) => Promise<any>
    getBnbBurn: (payload?: any) => Promise<any>
    setBnbBurn: (payload: any) => Promise<any>
    capitalConfigs: () => Promise<any>

    // User Data Stream endpoints
    getDataStream: () => Promise<any>
    keepDataStream: (payload: any) => Promise<any>
    closeDataStream: (payload: any) => Promise<any>
    marginGetListenToken: (payload?: any) => Promise<any>
    futuresGetDataStream: () => Promise<any>
    futuresKeepDataStream: (payload: any) => Promise<any>
    futuresCloseDataStream: (payload: any) => Promise<any>
    deliveryGetDataStream: () => Promise<any>
    deliveryKeepDataStream: (payload: any) => Promise<any>
    deliveryCloseDataStream: (payload: any) => Promise<any>

    // Futures endpoints
    futuresPing: () => Promise<boolean>
    futuresTime: () => Promise<{ serverTime: number }>
    futuresExchangeInfo: () => Promise<any>
    futuresBook: (payload: any) => Promise<any>
    futuresAggTrades: (payload: any) => Promise<any>
    futuresMarkPrice: (payload: any) => Promise<any>
    futuresAllForceOrders: (payload: any) => Promise<any>
    futuresLongShortRatio: (payload: any) => Promise<any>
    futuresCandles: (payload: any) => Promise<any>
    futuresMarkPriceCandles: (payload: any) => Promise<any>
    futuresIndexPriceCandles: (payload: any) => Promise<any>
    futuresTrades: (payload: any) => Promise<any>
    futuresDailyStats: (payload: any) => Promise<any>
    futuresPrices: (payload: any) => Promise<any>
    futuresAllBookTickers: () => Promise<any>
    futuresFundingRate: (payload: any) => Promise<any>
    futuresOrder: (payload: any) => Promise<any>
    futuresBatchOrders: (payload: any) => Promise<any>
    futuresGetOrder: (payload: any) => Promise<any>
    futuresCancelOrder: (payload: any) => Promise<any>
    futuresCancelAllOpenOrders: (payload: any) => Promise<any>
    futuresCancelBatchOrders: (payload: any) => Promise<any>
    futuresOpenOrders: (payload: any) => Promise<any>
    futuresAllOrders: (payload: any) => Promise<any>
    futuresPositionRisk: (payload: any) => Promise<any>
    futuresLeverageBracket: (payload: any) => Promise<any>
    futuresAccountBalance: (payload?: any) => Promise<any>
    futuresAccountInfo: (payload?: any) => Promise<any>
    futuresUserTrades: (payload: any) => Promise<any>
    futuresPositionMode: (payload: any) => Promise<any>
    futuresPositionModeChange: (payload: any) => Promise<any>
    futuresLeverage: (payload: any) => Promise<any>
    futuresMarginType: (payload: any) => Promise<any>
    futuresPositionMargin: (payload: any) => Promise<any>
    futuresMarginHistory: (payload: any) => Promise<any>
    futuresIncome: (payload: any) => Promise<any>
    getMultiAssetsMargin: (payload: any) => Promise<any>
    setMultiAssetsMargin: (payload: any) => Promise<any>

    // Delivery endpoints
    deliveryPing: () => Promise<boolean>
    deliveryTime: () => Promise<{ serverTime: number }>
    deliveryExchangeInfo: () => Promise<any>
    deliveryBook: (payload: any) => Promise<any>
    deliveryAggTrades: (payload: any) => Promise<any>
    deliveryMarkPrice: (payload: any) => Promise<any>
    deliveryAllForceOrders: (payload: any) => Promise<any>
    deliveryLongShortRatio: (payload: any) => Promise<any>
    deliveryCandles: (payload: any) => Promise<any>
    deliveryMarkPriceCandles: (payload: any) => Promise<any>
    deliveryIndexPriceCandles: (payload: any) => Promise<any>
    deliveryTrades: (payload: any) => Promise<any>
    deliveryDailyStats: (payload: any) => Promise<any>
    deliveryPrices: () => Promise<any>
    deliveryAllBookTickers: () => Promise<any>
    deliveryFundingRate: (payload: any) => Promise<any>
    deliveryOrder: (payload: any) => Promise<any>
    deliveryBatchOrders: (payload: any) => Promise<any>
    deliveryGetOrder: (payload: any) => Promise<any>
    deliveryCancelOrder: (payload: any) => Promise<any>
    deliveryCancelAllOpenOrders: (payload: any) => Promise<any>
    deliveryCancelBatchOrders: (payload: any) => Promise<any>
    deliveryOpenOrders: (payload: any) => Promise<any>
    deliveryAllOrders: (payload: any) => Promise<any>
    deliveryPositionRisk: (payload: any) => Promise<any>
    deliveryLeverageBracket: (payload: any) => Promise<any>
    deliveryAccountBalance: (payload?: any) => Promise<any>
    deliveryAccountInfo: (payload?: any) => Promise<any>
    deliveryUserTrades: (payload: any) => Promise<any>
    deliveryPositionMode: (payload: any) => Promise<any>
    deliveryPositionModeChange: (payload: any) => Promise<any>
    deliveryLeverage: (payload: any) => Promise<any>
    deliveryMarginType: (payload: any) => Promise<any>
    deliveryPositionMargin: (payload: any) => Promise<any>
    deliveryMarginHistory: (payload: any) => Promise<any>
    deliveryIncome: (payload: any) => Promise<any>

    // PAPI endpoints
    papiPing: () => Promise<any>
    papiUmOrder: (payload: any) => Promise<any>
    papiUmConditionalOrder: (payload: any) => Promise<any>
    papiCmOrder: (payload: any) => Promise<any>
    papiCmConditionalOrder: (payload: any) => Promise<any>
    papiMarginOrder: (payload: any) => Promise<any>
    papiMarginLoan: (payload: any) => Promise<any>
    papiRepayLoan: (payload: any) => Promise<any>
    papiMarginOrderOco: (payload: any) => Promise<any>
    papiUmCancelOrder: (payload: any) => Promise<any>
    papiUmCancelAllOpenOrders: (payload: any) => Promise<any>
    papiUmCancelConditionalOrder: (payload: any) => Promise<any>
    papiUmCancelConditionalAllOpenOrders: (payload: any) => Promise<any>
    papiCmCancelOrder: (payload: any) => Promise<any>
    papiCmCancelAllOpenOrders: (payload: any) => Promise<any>
    papiCmCancelConditionalOrder: (payload: any) => Promise<any>
    papiCmCancelConditionalAllOpenOrders: (payload: any) => Promise<any>
    papiMarginCancelOrder: (payload: any) => Promise<any>
    papiMarginCancelOrderList: (payload: any) => Promise<any>
    papiMarginCancelAllOpenOrders: (payload: any) => Promise<any>
    papiUmUpdateOrder: (payload: any) => Promise<any>
    papiCmUpdateOrder: (payload: any) => Promise<any>
    papiUmGetOrder: (payload: any) => Promise<any>
    papiUmGetAllOrders: (payload: any) => Promise<any>
    papiUmGetOpenOrder: (payload: any) => Promise<any>
    papiUmGetOpenOrders: (payload: any) => Promise<any>
    papiUmGetConditionalAllOrders: (payload: any) => Promise<any>
    papiUmGetConditionalOpenOrders: (payload: any) => Promise<any>
    papiUmGetConditionalOpenOrder: (payload: any) => Promise<any>
    papiUmGetConditionalOrderHistory: (payload: any) => Promise<any>
    papiCmGetOrder: (payload: any) => Promise<any>
    papiCmGetAllOrders: (payload: any) => Promise<any>
    papiCmGetOpenOrder: (payload: any) => Promise<any>
    papiCmGetOpenOrders: (payload: any) => Promise<any>
    papiCmGetConditionalOpenOrders: (payload: any) => Promise<any>
    papiCmGetConditionalOpenOrder: (payload: any) => Promise<any>
    papiCmGetConditionalAllOrders: (payload: any) => Promise<any>
    papiCmGetConditionalOrderHistory: (payload: any) => Promise<any>
    papiUmGetForceOrders: (payload: any) => Promise<any>
    papiCmGetForceOrders: (payload: any) => Promise<any>
    papiUmGetOrderAmendment: (payload: any) => Promise<any>
    papiCmGetOrderAmendment: (payload: any) => Promise<any>
    papiMarginGetForceOrders: (payload: any) => Promise<any>
    papiUmGetUserTrades: (payload: any) => Promise<any>
    papiCmGetUserTrades: (payload: any) => Promise<any>
    papiUmGetAdlQuantile: (payload: any) => Promise<any>
    papiCmGetAdlQuantile: (payload: any) => Promise<any>
    papiUmFeeBurn: (payload: any) => Promise<any>
    papiUmGetFeeBurn: (payload: any) => Promise<any>
    papiMarginGetOrder: (payload: any) => Promise<any>
    papiMarginGetOpenOrders: (payload: any) => Promise<any>
    papiMarginGetAllOrders: (payload: any) => Promise<any>
    papiMarginGetOrderList: (payload: any) => Promise<any>
    papiMarginGetAllOrderList: (payload: any) => Promise<any>
    papiMarginGetOpenOrderList: (payload: any) => Promise<any>
    papiMarginGetMyTrades: (payload: any) => Promise<any>
    papiMarginRepayDebt: (payload: any) => Promise<any>

    // Margin endpoints
    marginOrder: (payload: any) => Promise<any>
    marginOrderOco: (payload: any) => Promise<any>
    marginGetOrder: (payload: any) => Promise<any>
    marginGetOrderOco: (payload: any) => Promise<any>
    marginCancelOrder: (payload: any) => Promise<any>
    marginOpenOrders: (payload: any) => Promise<any>
    marginCancelOpenOrders: (payload: any) => Promise<any>
    marginAccountInfo: (payload: any) => Promise<any>
    marginRepay: (payload: any) => Promise<any>
    marginLoan: (payload: any) => Promise<any>
    marginIsolatedAccount: (payload: any) => Promise<any>
    marginMaxBorrow: (payload: any) => Promise<any>
    marginCreateIsolated: (payload: any) => Promise<any>
    marginIsolatedTransfer: (payload: any) => Promise<any>
    marginIsolatedTransferHistory: (payload: any) => Promise<any>
    disableMarginAccount: (payload: any) => Promise<any>
    enableMarginAccount: (payload: any) => Promise<any>
    marginAccount: () => Promise<any>

    // Portfolio margin endpoints
    portfolioMarginAccountInfo: () => Promise<any>
    portfolioMarginCollateralRate: () => Promise<any>
    portfolioMarginLoan: (payload: any) => Promise<any>
    portfolioMarginLoanRepay: (payload: any) => Promise<any>
    portfolioMarginInterestHistory: (payload: any) => Promise<any>

    // Savings endpoints
    savingsProducts: (payload: any) => Promise<any>
    savingsPurchase: (payload: any) => Promise<any>
    savingsRedeem: (payload: any) => Promise<any>
    savingsRedemptionQuota: (payload: any) => Promise<any>
    fundingWallet: (payload: any) => Promise<any>
    convertTradeFlow: (payload: any) => Promise<any>
    rebateTaxQuery: () => Promise<any>
    payTradeHistory: (payload: any) => Promise<any>
    apiRestrictions: (payload: any) => Promise<any>
    savingsAccount: () => Promise<any>

    // Mining endpoints
    miningHashrateResaleRequest: (payload: any) => Promise<any>
    miningHashrateResaleCancel: (payload: any) => Promise<any>
    miningStatistics: (payload: any) => Promise<any>

    // Utility endpoints
    privateRequest: (method: string, url: string, payload: any) => Promise<any>
    publicRequest: (method: string, url: string, payload: any) => Promise<any>
}

// This test will fail at compile time if the types are incorrect
test('types should compile correctly', async t => {
    // Create a typed instance
    const Binance = (await import('..')).default
    const client: BinanceRest = Binance({
        apiKey: 'dummy',
        apiSecret: 'dummy',
    })

    // Test base/generic endpoints
    const info = client.getInfo()
    const ping = client.ping()
    const time = client.time()
    const exchangeInfo = client.exchangeInfo()

    // Test market data endpoints
    const book = client.book({ symbol: 'BTCUSDT' })
    const aggTrades = client.aggTrades({ symbol: 'BTCUSDT' })
    const candles = client.candles({ symbol: 'BTCUSDT', interval: '1m' })
    const trades = client.trades({ symbol: 'BTCUSDT' })
    const tradesHistory = client.tradesHistory({ symbol: 'BTCUSDT' })
    const dailyStats = client.dailyStats({ symbol: 'BTCUSDT' })
    const prices = client.prices()
    const avgPrice = client.avgPrice({ symbol: 'BTCUSDT' })
    const allBookTickers = client.allBookTickers()

    // Test order endpoints
    const order = client.order({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
        timeInForce: TimeInForce.GTC,
    })
    const orderOco = client.orderOco({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        quantity: '1',
        price: '50000',
        stopPrice: '51000',
    })
    const orderTest = client.orderTest({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
    })
    const getOrder = client.getOrder({ symbol: 'BTCUSDT', orderId: 12345 })
    const getOrderOco = client.getOrderOco({ orderListId: 12345 })
    const cancelOrder = client.cancelOrder({ symbol: 'BTCUSDT', orderId: 12345 })
    const cancelOrderOco = client.cancelOrderOco({ symbol: 'BTCUSDT', orderListId: 12345 })
    const cancelOpenOrders = client.cancelOpenOrders({ symbol: 'BTCUSDT' })
    const openOrders = client.openOrders({ symbol: 'BTCUSDT' })
    const allOrders = client.allOrders({ symbol: 'BTCUSDT' })
    const allOrdersOCO = client.allOrdersOCO({ fromId: 12345 })

    // Test account endpoints
    const accountInfo = client.accountInfo()
    const myTrades = client.myTrades({ symbol: 'BTCUSDT' })
    const withdraw = client.withdraw({ coin: 'BTC', address: 'address', amount: '1' })
    const withdrawHistory = client.withdrawHistory({ coin: 'BTC' })
    const depositHistory = client.depositHistory({ coin: 'BTC' })
    const depositAddress = client.depositAddress({ coin: 'BTC' })
    const tradeFee = client.tradeFee({ symbol: 'BTCUSDT' })
    const assetDetail = client.assetDetail({ asset: 'BTC' })
    const accountSnapshot = client.accountSnapshot({ type: 'SPOT' })
    const universalTransfer = client.universalTransfer({
        type: 'MAIN_UMFUTURE',
        asset: 'BTC',
        amount: '1',
    })
    const universalTransferHistory = client.universalTransferHistory({ type: 'MAIN_UMFUTURE' })
    const dustLog = client.dustLog()
    const dustTransfer = client.dustTransfer({ asset: ['BTC', 'ETH'] })
    const accountCoins = client.accountCoins()
    const getBnbBurn = client.getBnbBurn()
    const setBnbBurn = client.setBnbBurn({ spotBNBBurn: true })

    // Test user data stream endpoints
    const getDataStream = client.getDataStream()
    const keepDataStream = client.keepDataStream({ listenKey: 'key' })
    const closeDataStream = client.closeDataStream({ listenKey: 'key' })
    const marginGetListenToken = client.marginGetListenToken()
    const marginGetListenTokenIsolated = client.marginGetListenToken({ isIsolated: true, symbol: 'BTCUSDT' })
    const futuresGetDataStream = client.futuresGetDataStream()
    const futuresKeepDataStream = client.futuresKeepDataStream({ listenKey: 'key' })
    const futuresCloseDataStream = client.futuresCloseDataStream({ listenKey: 'key' })
    const deliveryGetDataStream = client.deliveryGetDataStream()
    const deliveryKeepDataStream = client.deliveryKeepDataStream({ listenKey: 'key' })
    const deliveryCloseDataStream = client.deliveryCloseDataStream({ listenKey: 'key' })

    // Test futures endpoints
    const futuresPing = client.futuresPing()
    const futuresTime = client.futuresTime()
    const futuresExchangeInfo = client.futuresExchangeInfo()
    const futuresBook = client.futuresBook({ symbol: 'BTCUSDT' })
    const futuresAggTrades = client.futuresAggTrades({ symbol: 'BTCUSDT' })
    const futuresMarkPrice = client.futuresMarkPrice({ symbol: 'BTCUSDT' })
    const futuresAllForceOrders = client.futuresAllForceOrders({ symbol: 'BTCUSDT' })
    const futuresLongShortRatio = client.futuresLongShortRatio({ symbol: 'BTCUSDT' })
    const futuresCandles = client.futuresCandles({ symbol: 'BTCUSDT', interval: '1m' })
    const futuresMarkPriceCandles = client.futuresMarkPriceCandles({
        symbol: 'BTCUSDT',
        interval: '1m',
    })
    const futuresIndexPriceCandles = client.futuresIndexPriceCandles({
        pair: 'BTCUSDT',
        interval: '1m',
    })
    const futuresTrades = client.futuresTrades({ symbol: 'BTCUSDT' })
    const futuresDailyStats = client.futuresDailyStats({ symbol: 'BTCUSDT' })
    const futuresPrices = client.futuresPrices({ symbol: 'BTCUSDT' })
    const futuresAllBookTickers = client.futuresAllBookTickers()
    const futuresFundingRate = client.futuresFundingRate({ symbol: 'BTCUSDT' })
    const futuresOrder = client.futuresOrder({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
    })
    const futuresBatchOrders = client.futuresBatchOrders({
        batchOrders: [
            {
                symbol: 'BTCUSDT',
                side: OrderSide.BUY,
                type: OrderType.LIMIT,
                quantity: '1',
                price: '50000',
            },
        ],
    })
    const futuresGetOrder = client.futuresGetOrder({ symbol: 'BTCUSDT', orderId: 12345 })
    const futuresCancelOrder = client.futuresCancelOrder({ symbol: 'BTCUSDT', orderId: 12345 })
    const futuresCancelAllOpenOrders = client.futuresCancelAllOpenOrders({ symbol: 'BTCUSDT' })
    const futuresCancelBatchOrders = client.futuresCancelBatchOrders({
        symbol: 'BTCUSDT',
        orderIdList: [12345],
    })
    const futuresOpenOrders = client.futuresOpenOrders({ symbol: 'BTCUSDT' })
    const futuresAllOrders = client.futuresAllOrders({ symbol: 'BTCUSDT' })
    const futuresPositionRisk = client.futuresPositionRisk({ symbol: 'BTCUSDT' })
    const futuresLeverageBracket = client.futuresLeverageBracket({ symbol: 'BTCUSDT' })
    const futuresAccountBalance = client.futuresAccountBalance()
    const futuresAccountInfo = client.futuresAccountInfo()
    const futuresUserTrades = client.futuresUserTrades({ symbol: 'BTCUSDT' })
    const futuresPositionMode = client.futuresPositionMode({ dualSidePosition: true })
    const futuresPositionModeChange = client.futuresPositionModeChange({ dualSidePosition: true })
    const futuresLeverage = client.futuresLeverage({ symbol: 'BTCUSDT', leverage: 10 })
    const futuresMarginType = client.futuresMarginType({
        symbol: 'BTCUSDT',
        marginType: 'ISOLATED',
    })
    const futuresPositionMargin = client.futuresPositionMargin({
        symbol: 'BTCUSDT',
        positionSide: 'BOTH',
        amount: '1',
        type: 1,
    })
    const futuresMarginHistory = client.futuresMarginHistory({ symbol: 'BTCUSDT' })
    const futuresIncome = client.futuresIncome({ symbol: 'BTCUSDT' })
    const getMultiAssetsMargin = client.getMultiAssetsMargin({ multiAssetsMargin: true })
    const setMultiAssetsMargin = client.setMultiAssetsMargin({ multiAssetsMargin: true })

    // Test delivery endpoints
    const deliveryPing = client.deliveryPing()
    const deliveryTime = client.deliveryTime()
    const deliveryExchangeInfo = client.deliveryExchangeInfo()
    const deliveryBook = client.deliveryBook({ symbol: 'BTCUSD_PERP' })
    const deliveryAggTrades = client.deliveryAggTrades({ symbol: 'BTCUSD_PERP' })
    const deliveryMarkPrice = client.deliveryMarkPrice({ symbol: 'BTCUSD_PERP' })
    const deliveryAllForceOrders = client.deliveryAllForceOrders({ symbol: 'BTCUSD_PERP' })
    const deliveryLongShortRatio = client.deliveryLongShortRatio({ symbol: 'BTCUSD_PERP' })
    const deliveryCandles = client.deliveryCandles({ symbol: 'BTCUSD_PERP', interval: '1m' })
    const deliveryMarkPriceCandles = client.deliveryMarkPriceCandles({
        symbol: 'BTCUSD_PERP',
        interval: '1m',
    })
    const deliveryIndexPriceCandles = client.deliveryIndexPriceCandles({
        pair: 'BTCUSD',
        interval: '1m',
    })
    const deliveryTrades = client.deliveryTrades({ symbol: 'BTCUSD_PERP' })
    const deliveryDailyStats = client.deliveryDailyStats({ symbol: 'BTCUSD_PERP' })
    const deliveryPrices = client.deliveryPrices()
    const deliveryAllBookTickers = client.deliveryAllBookTickers()
    const deliveryFundingRate = client.deliveryFundingRate({ symbol: 'BTCUSD_PERP' })
    const deliveryOrder = client.deliveryOrder({
        symbol: 'BTCUSD_PERP',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
    })
    const deliveryBatchOrders = client.deliveryBatchOrders({
        batchOrders: [
            {
                symbol: 'BTCUSD_PERP',
                side: OrderSide.BUY,
                type: OrderType.LIMIT,
                quantity: '1',
                price: '50000',
            },
        ],
    })
    const deliveryGetOrder = client.deliveryGetOrder({ symbol: 'BTCUSD_PERP', orderId: 12345 })
    const deliveryCancelOrder = client.deliveryCancelOrder({
        symbol: 'BTCUSD_PERP',
        orderId: 12345,
    })
    const deliveryCancelAllOpenOrders = client.deliveryCancelAllOpenOrders({
        symbol: 'BTCUSD_PERP',
    })
    const deliveryCancelBatchOrders = client.deliveryCancelBatchOrders({
        symbol: 'BTCUSD_PERP',
        orderIdList: [12345],
    })
    const deliveryOpenOrders = client.deliveryOpenOrders({ symbol: 'BTCUSD_PERP' })
    const deliveryAllOrders = client.deliveryAllOrders({ symbol: 'BTCUSD_PERP' })
    const deliveryPositionRisk = client.deliveryPositionRisk({ symbol: 'BTCUSD_PERP' })
    const deliveryLeverageBracket = client.deliveryLeverageBracket({ symbol: 'BTCUSD_PERP' })
    const deliveryAccountBalance = client.deliveryAccountBalance()
    const deliveryAccountInfo = client.deliveryAccountInfo()
    const deliveryUserTrades = client.deliveryUserTrades({ symbol: 'BTCUSD_PERP' })
    const deliveryPositionMode = client.deliveryPositionMode({ dualSidePosition: true })
    const deliveryPositionModeChange = client.deliveryPositionModeChange({ dualSidePosition: true })
    const deliveryLeverage = client.deliveryLeverage({ symbol: 'BTCUSD_PERP', leverage: 10 })
    const deliveryMarginType = client.deliveryMarginType({
        symbol: 'BTCUSD_PERP',
        marginType: 'ISOLATED',
    })
    const deliveryPositionMargin = client.deliveryPositionMargin({
        symbol: 'BTCUSD_PERP',
        positionSide: 'BOTH',
        amount: '1',
        type: 1,
    })
    const deliveryMarginHistory = client.deliveryMarginHistory({ symbol: 'BTCUSD_PERP' })
    const deliveryIncome = client.deliveryIncome({ symbol: 'BTCUSD_PERP' })

    // Test PAPI endpoints
    const papiPing = client.papiPing()
    const papiUmOrder = client.papiUmOrder({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
    })
    const papiUmConditionalOrder = client.papiUmConditionalOrder({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
        stopPrice: '51000',
    })
    const papiCmOrder = client.papiCmOrder({
        symbol: 'BTCUSD_PERP',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
    })
    const papiCmConditionalOrder = client.papiCmConditionalOrder({
        symbol: 'BTCUSD_PERP',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
        stopPrice: '51000',
    })
    const papiMarginOrder = client.papiMarginOrder({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
    })
    const papiMarginLoan = client.papiMarginLoan({ asset: 'BTC', amount: '1' })
    const papiRepayLoan = client.papiRepayLoan({ asset: 'BTC', amount: '1' })
    const papiMarginOrderOco = client.papiMarginOrderOco({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        quantity: '1',
        price: '50000',
        stopPrice: '51000',
    })
    const papiUmCancelOrder = client.papiUmCancelOrder({ symbol: 'BTCUSDT', orderId: 12345 })
    const papiUmCancelAllOpenOrders = client.papiUmCancelAllOpenOrders({ symbol: 'BTCUSDT' })
    const papiUmCancelConditionalOrder = client.papiUmCancelConditionalOrder({
        symbol: 'BTCUSDT',
        orderId: 12345,
    })
    const papiUmCancelConditionalAllOpenOrders = client.papiUmCancelConditionalAllOpenOrders({
        symbol: 'BTCUSDT',
    })
    const papiCmCancelOrder = client.papiCmCancelOrder({ symbol: 'BTCUSD_PERP', orderId: 12345 })
    const papiCmCancelAllOpenOrders = client.papiCmCancelAllOpenOrders({ symbol: 'BTCUSD_PERP' })
    const papiCmCancelConditionalOrder = client.papiCmCancelConditionalOrder({
        symbol: 'BTCUSD_PERP',
        orderId: 12345,
    })
    const papiCmCancelConditionalAllOpenOrders = client.papiCmCancelConditionalAllOpenOrders({
        symbol: 'BTCUSD_PERP',
    })

    // Test margin endpoints
    const marginOrder = client.marginOrder({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        quantity: '1',
        price: '50000',
    })
    const marginOrderOco = client.marginOrderOco({
        symbol: 'BTCUSDT',
        side: OrderSide.BUY,
        quantity: '1',
        price: '50000',
        stopPrice: '51000',
    })
    const marginGetOrder = client.marginGetOrder({ symbol: 'BTCUSDT', orderId: '12345' })
    const marginGetOrderOco = client.marginGetOrderOco({ symbol: 'BTCUSDT', orderListId: 12345 })
    const marginCancelOrder = client.marginCancelOrder({ symbol: 'BTCUSDT', orderId: 12345 })
    const marginOpenOrders = client.marginOpenOrders({ symbol: 'BTCUSDT' })
    const marginCancelOpenOrders = client.marginCancelOpenOrders({ symbol: 'BTCUSDT' })
    const marginAccountInfo = client.marginAccountInfo()
    const marginRepay = client.marginRepay({ asset: 'BTC', amount: '1' })
    const marginLoan = client.marginLoan({ asset: 'BTC', amount: '1' })
    const marginIsolatedAccount = client.marginIsolatedAccount({ symbols: 'BTCUSDT' })
    const marginMaxBorrow = client.marginMaxBorrow({ asset: 'BTC' })
    const marginCreateIsolated = client.marginCreateIsolated({ base: 'BTC', quote: 'USDT' })
    const marginIsolatedTransfer = client.marginIsolatedTransfer({
        asset: 'BTC',
        symbol: 'BTCUSDT',
        transFrom: 'SPOT',
        transTo: 'ISOLATED_MARGIN',
        amount: '1',
    })
    const marginIsolatedTransferHistory = client.marginIsolatedTransferHistory({
        symbol: 'BTCUSDT',
    })
    const disableMarginAccount = client.disableMarginAccount({ symbol: 'BTCUSDT' })
    const enableMarginAccount = client.enableMarginAccount({ symbol: 'BTCUSDT' })
    const marginAccount = client.marginAccount()

    // Test portfolio margin endpoints
    const portfolioMarginAccountInfo = client.portfolioMarginAccountInfo()
    const portfolioMarginCollateralRate = client.portfolioMarginCollateralRate()
    const portfolioMarginLoan = client.portfolioMarginLoan({ asset: 'BTC', amount: '1' })
    const portfolioMarginLoanRepay = client.portfolioMarginLoanRepay({ asset: 'BTC', amount: '1' })
    const portfolioMarginInterestHistory = client.portfolioMarginInterestHistory({ asset: 'BTC' })

    // Test savings endpoints
    const savingsProducts = client.savingsProducts({ type: 'ACTIVITY' })
    const savingsPurchase = client.savingsPurchase({ productId: '123', amount: '1' })
    const savingsRedeem = client.savingsRedeem({ productId: '123', amount: '1', type: 'FAST' })
    const savingsRedemptionQuota = client.savingsRedemptionQuota({ productId: '123', type: 'FAST' })
    const savingsAccount = client.savingsAccount()

    // Test mining endpoints
    const miningHashrateResaleRequest = client.miningHashrateResaleRequest({
        userName: 'user',
        coinName: 'BTC',
        algo: 'sha256',
        startDate: 1234567890,
        endDate: 1234567890,
        pageIndex: 1,
        pageSize: 10,
    })
    const miningHashrateResaleCancel = client.miningHashrateResaleCancel({
        configId: 123,
        userName: 'user',
    })
    const miningStatistics = client.miningStatistics({ userName: 'user', algo: 'sha256' })

    // Test utility endpoints
    const privateRequest = client.privateRequest('GET', '/api/v3/account', {})
    const publicRequest = client.publicRequest('GET', '/api/v3/ticker/price', {})
})
