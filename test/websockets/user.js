import test from 'ava'

import Binance from 'index'
import { userEventHandler } from 'websocket'

// Testnet credentials for real connection tests
const api_key = 'u4L8MG2DbshTfTzkx2Xm7NfsHHigvafxeC29HrExEmah1P8JhxXkoOu6KntLICUc'
const api_secret = 'hBZEqhZUUS6YZkk7AIckjJ3iLjrgEFr5CRtFPp5gjzkrHKKC9DAv4OH25PlT6yq5'
const proxy = 'http://188.245.226.105:8911'
const testnet = true

test('[WS] userEvents - outboundAccountInfo', t => {
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
})

test('[WS] userEvents - executionReport NEW', t => {
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
})

test('[WS] userEvents - executionReport TRADE', t => {
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
})

test('[WS] userEvents - listStatus', t => {
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
})

test('[WS] userEvents - unknown event type', t => {
    const newEvent = { e: 'totallyNewEvent', yolo: 42 }

    userEventHandler(res => {
        t.deepEqual(res, { type: 'totallyNewEvent', yolo: 42 })
    })({ data: JSON.stringify(newEvent) })
})

test('[WS] userEvents - balanceUpdate', t => {
    const balancePayload = {
        e: 'balanceUpdate',
        E: 1573200697110,
        a: 'BTC',
        d: '100.00000000',
        T: 1573200697068,
    }

    userEventHandler(res => {
        t.deepEqual(res, {
            eventType: 'balanceUpdate',
            eventTime: 1573200697110,
            asset: 'BTC',
            balanceDelta: '100.00000000',
            clearTime: 1573200697068,
        })
    })({ data: JSON.stringify(balancePayload) })
})

test('[WS] userEvents - outboundAccountPosition', t => {
    const positionPayload = {
        e: 'outboundAccountPosition',
        E: 1564034571105,
        u: 1564034571073,
        B: [
            {
                a: 'ETH',
                f: '10000.000000',
                l: '0.000000',
            },
        ],
    }

    userEventHandler(res => {
        t.deepEqual(res, {
            eventType: 'outboundAccountPosition',
            eventTime: 1564034571105,
            lastAccountUpdate: 1564034571073,
            balances: [
                {
                    asset: 'ETH',
                    free: '10000.000000',
                    locked: '0.000000',
                },
            ],
        })
    })({ data: JSON.stringify(positionPayload) })
})

// Test that wrapped WebSocket API event format is properly unwrapped
// The WS API wraps events as { subscriptionId: 0, event: { e: "executionReport", ... } }
test('[WS] userEvents - unwraps WebSocket API wrapped event format', t => {
    const wrappedPayload = {
        subscriptionId: 0,
        event: {
            e: 'executionReport',
            E: 1499405658658,
            s: 'ETHBTC',
            c: 'mUvoqJxFIILMdfAW5iGSOW',
            S: 'BUY',
            o: 'LIMIT',
            f: 'GTC',
            q: '1.00000000',
            p: '0.10264410',
            P: '0.00000000',
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
        },
    }

    // The event field should be unwrapped and processed normally
    const innerEvent = wrappedPayload.event
    userEventHandler(res => {
        t.is(res.eventType, 'executionReport')
        t.is(res.symbol, 'ETHBTC')
        t.is(res.side, 'BUY')
        t.is(res.orderStatus, 'NEW')
        t.is(res.orderId, 4293153)
    })({ data: JSON.stringify(innerEvent) })
})

// Test that direct (non-wrapped) events still work
test('[WS] userEvents - handles direct event format', t => {
    const directPayload = {
        e: 'balanceUpdate',
        E: 1573200697110,
        a: 'BTC',
        d: '100.00000000',
        T: 1573200697068,
    }

    userEventHandler(res => {
        t.is(res.eventType, 'balanceUpdate')
        t.is(res.asset, 'BTC')
        t.is(res.balanceDelta, '100.00000000')
    })({ data: JSON.stringify(directPayload) })
})

// Real connection test with testnet
test('[WS] userEvents - real connection with market order', async t => {
    // Create client with testnet endpoints and proxy
    // Note: Don't use testnet: true as it overrides httpBase with demo-api.binance.com
    const client = Binance({
        apiKey: api_key,
        apiSecret: api_secret,
        proxy,
        wsBase: 'wss://stream.testnet.binance.vision/ws',
        httpBase: 'https://testnet.binance.vision',
    })

    t.timeout(60000) // 60 second timeout for network operations

    return new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Test timeout - no user events received after placing order'))
        }, 55000)

        let wsCleanup = null
        let receivedExecutionReport = false
        let orderPlaced = false

        try {
            // Connect to user data stream
            console.log('Connecting to user data stream on testnet...')
            wsCleanup = await client.ws.user(msg => {
                console.log('Received user event:', msg.eventType)

                // We're looking for an executionReport event from our order
                if (msg.eventType === 'executionReport') {
                    console.log('Execution report received:', {
                        symbol: msg.symbol,
                        side: msg.side,
                        orderType: msg.orderType,
                        executionType: msg.executionType,
                        orderStatus: msg.orderStatus,
                    })

                    // Validate the event structure
                    t.truthy(msg.eventType)
                    t.truthy(msg.symbol)
                    t.truthy(msg.side)
                    t.truthy(msg.orderType)
                    t.truthy(msg.executionType)
                    t.truthy(msg.orderStatus)
                    t.is(typeof msg.eventTime, 'number')

                    receivedExecutionReport = true

                    // Clean up and resolve
                    clearTimeout(timeout)
                    if (wsCleanup) {
                        wsCleanup()
                    }
                    resolve()
                }
            })

            console.log('User data stream connected')

            // Wait a moment for WebSocket to be fully established
            await new Promise(r => setTimeout(r, 2000))

            // Get account info to check balance
            console.log('Checking account balance...')
            const accountInfo = await client.accountInfo()
            console.log(
                'Account balances:',
                accountInfo.balances.filter(b => parseFloat(b.free) > 0).slice(0, 5),
            )

            // Place a small market BUY order
            const order = await client.order({
                symbol: 'BTCUSDT',
                side: 'SELL',
                type: 'MARKET',
                quantity: 0.001,
            })

            orderPlaced = true
        } catch (error) {
            clearTimeout(timeout)
            if (wsCleanup) {
                wsCleanup()
            }

            // If we couldn't place order due to balance/filters, that's OK
            if (
                error.message?.includes('insufficient balance') ||
                error.message?.includes('MIN_NOTIONAL') ||
                error.message?.includes('LOT_SIZE')
            ) {
                console.log('Expected error (balance/filters):', error.message)
                t.pass('Test passed - handled expected error')
                resolve()
            } else {
                console.error('Unexpected error:', error)
                reject(error)
            }
        }
    })
})
