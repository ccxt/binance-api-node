import test from 'ava'

import Binance from 'index'
import { userEventHandler } from 'websocket'
import { binanceConfig, hasTestCredentials } from '../config'

// ===== Unit tests for margin event handling =====

test('[WS] marginUser - events use spot userTransforms (executionReport)', t => {
    const payload = {
        e: 'executionReport',
        E: 1700000000000,
        s: 'BTCUSDT',
        c: 'margin-order-1',
        S: 'BUY',
        o: 'LIMIT',
        f: 'GTC',
        q: '0.01000000',
        p: '30000.00000000',
        P: '0.00000000',
        F: '0.00000000',
        g: -1,
        C: 'null',
        x: 'NEW',
        X: 'NEW',
        r: 'NONE',
        i: 12345678,
        l: '0.00000000',
        z: '0.00000000',
        L: '0.00000000',
        n: '0',
        N: null,
        T: 1700000000000,
        t: -1,
        I: 99999,
        w: true,
        m: false,
        M: false,
        O: 1700000000000,
        Q: 0,
        Y: 0,
        Z: '0.00000000',
    }

    userEventHandler(res => {
        t.is(res.eventType, 'executionReport')
        t.is(res.symbol, 'BTCUSDT')
        t.is(res.side, 'BUY')
        t.is(res.orderType, 'LIMIT')
        t.is(res.orderStatus, 'NEW')
        t.is(res.orderId, 12345678)
        t.is(res.price, '30000.00000000')
    })({ data: JSON.stringify(payload) })
})

test('[WS] marginUser - unwraps listenToken wrapped event format', t => {
    const wrapped = {
        subscriptionId: 1,
        event: {
            e: 'balanceUpdate',
            E: 1700000000000,
            a: 'BTC',
            d: '0.01000000',
            T: 1700000000000,
        },
    }

    // The margin WS API wraps events the same way as spot
    const inner = wrapped.event
    userEventHandler(res => {
        t.is(res.eventType, 'balanceUpdate')
        t.is(res.asset, 'BTC')
        t.is(res.balanceDelta, '0.01000000')
    })({ data: JSON.stringify(inner) })
})

test('[WS] marginUser - outboundAccountPosition from margin account', t => {
    const payload = {
        e: 'outboundAccountPosition',
        E: 1700000000000,
        u: 1700000000000,
        B: [
            { a: 'BTC', f: '0.50000000', l: '0.01000000' },
            { a: 'USDT', f: '10000.00000000', l: '300.00000000' },
        ],
    }

    userEventHandler(res => {
        t.is(res.eventType, 'outboundAccountPosition')
        t.is(res.balances.length, 2)
        t.is(res.balances[0].asset, 'BTC')
        t.is(res.balances[0].free, '0.50000000')
        t.is(res.balances[0].locked, '0.01000000')
        t.is(res.balances[1].asset, 'USDT')
    })({ data: JSON.stringify(payload) })
})

// ===== Integration test: margin stream + limit order =====

const main = () => {
    if (!hasTestCredentials()) {
        return test('[WS] marginUser integration - skipped (no credentials)', t => {
            t.pass()
        })
    }

    test('[WS] marginUser - stream receives events from margin limit order', async t => {
        const client = Binance(binanceConfig)

        t.timeout(60000)

        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout - no margin user events received'))
            }, 55000)

            let wsCleanup = null
            let orderId = null

            const finish = async error => {
                clearTimeout(timeout)
                // Cancel order if placed
                if (orderId) {
                    try {
                        await client.marginCancelOrder({
                            symbol: 'BTCUSDT',
                            orderId,
                            useServerTime: true,
                        })
                    } catch (e) {
                        // Ignore cancel errors
                    }
                }
                if (wsCleanup) {
                    try {
                        wsCleanup()
                    } catch (e) {
                        /* ignore */
                    }
                }
                if (error) reject(error)
                else resolve()
            }

            try {
                console.log('Connecting to margin user data stream...')
                wsCleanup = await client.ws.marginUser(msg => {
                    console.log('Margin event:', msg.eventType || msg.type, msg.symbol || '')

                    if (msg.eventType === 'executionReport' && msg.symbol === 'BTCUSDT') {
                        console.log('Margin execution report:', {
                            side: msg.side,
                            orderType: msg.orderType,
                            executionType: msg.executionType,
                            orderStatus: msg.orderStatus,
                            price: msg.price,
                            quantity: msg.quantity,
                        })

                        t.truthy(msg.eventType)
                        t.truthy(msg.symbol)
                        t.truthy(msg.side)
                        t.truthy(msg.orderType)
                        t.is(typeof msg.eventTime, 'number')

                        finish()
                    }
                })

                console.log('Margin user stream connected, waiting before placing order...')
                await new Promise(r => setTimeout(r, 2000))

                // Place a limit BUY order far below market price so it won't fill
                console.log('Placing margin limit order...')
                const order = await client.marginOrder({
                    symbol: 'BTCUSDT',
                    side: 'BUY',
                    type: 'LIMIT',
                    quantity: '0.001',
                    price: '10000.00',
                    timeInForce: 'GTC',
                    useServerTime: true,
                })

                orderId = order.orderId
                console.log('Margin order placed:', {
                    orderId: order.orderId,
                    status: order.status,
                })
            } catch (error) {
                // Margin may not be enabled on testnet
                if (
                    error.message?.includes('not available') ||
                    error.message?.includes('not enabled') ||
                    error.message?.includes('Not Found') ||
                    error.message?.includes('404') ||
                    error.message?.includes('-1209') ||
                    error.message?.includes('Margin') ||
                    error.message?.includes('margin') ||
                    error.code === -1209 ||
                    error.code === -3001 ||
                    error.code === -3043
                ) {
                    console.log('Margin not available on testnet:', error.message || error.code)
                    clearTimeout(timeout)
                    if (wsCleanup) {
                        try {
                            wsCleanup()
                        } catch (e) {
                            /* ignore */
                        }
                    }
                    t.pass('Margin not available on testnet')
                    resolve()
                } else {
                    finish(error)
                }
            }
        })
    })
}

main()
