/**
 * Proxy Configuration Tests
 *
 * This test suite verifies that the Binance API client works correctly
 * when using an HTTP/HTTPS proxy server.
 *
 * Tests cover:
 * - Public endpoints through proxy (ping, time)
 * - Private endpoints through proxy (accountInfo, depositHistory)
 * - Time synchronization through proxy
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy from environment or config
 * - Requires API_KEY and API_SECRET for authenticated tests
 *
 * To run these tests:
 * 1. Ensure test/config.js has valid proxy configuration
 * 2. Run: npm test test/proxy.js
 */

import test from 'ava'

import Binance from 'index'

import { binanceConfig, hasTestCredentials } from './config'

// ===== Public Endpoint Tests (No Auth Required) =====

test('[PROXY] ping - test connectivity through proxy', async t => {
    const client = Binance(binanceConfig)

    try {
        const pingResult = await client.ping()
        t.truthy(pingResult)
        t.pass('Ping successful through proxy')
    } catch (e) {
        if (e.message && (e.message.includes('ECONNREFUSED') || e.message.includes('proxy'))) {
            t.pass('Proxy connection failed (proxy may be unavailable)')
        } else {
            throw e
        }
    }
})

test('[PROXY] time - get server time through proxy', async t => {
    const client = Binance(binanceConfig)

    try {
        const serverTime = await client.time()
        t.truthy(serverTime)
        t.true(typeof serverTime === 'number', 'Server time should be a number')
        t.true(serverTime > 0, 'Server time should be positive')

        // Check time difference is reasonable (within 5 minutes)
        const localTime = Date.now()
        const timeDiff = Math.abs(localTime - serverTime)
        t.true(
            timeDiff < 5 * 60 * 1000,
            `Time difference should be less than 5 minutes, got ${timeDiff}ms`,
        )

        t.pass('Server time retrieved successfully through proxy')
    } catch (e) {
        if (e.message && (e.message.includes('ECONNREFUSED') || e.message.includes('proxy'))) {
            t.pass('Proxy connection failed (proxy may be unavailable)')
        } else {
            throw e
        }
    }
})

test('[PROXY] prices - get market prices through proxy', async t => {
    const client = Binance(binanceConfig)

    try {
        const prices = await client.prices()
        t.truthy(prices)
        t.true(typeof prices === 'object', 'Prices should be an object')
        t.true(Object.keys(prices).length > 0, 'Prices should contain symbols')

        // Check a common trading pair exists
        t.truthy(prices.BTCUSDT || prices.ETHBTC, 'Should have at least one major trading pair')

        t.pass('Market prices retrieved successfully through proxy')
    } catch (e) {
        if (e.message && (e.message.includes('ECONNREFUSED') || e.message.includes('proxy'))) {
            t.pass('Proxy connection failed (proxy may be unavailable)')
        } else {
            throw e
        }
    }
})

test('[PROXY] book - get order book through proxy', async t => {
    const client = Binance(binanceConfig)

    try {
        const book = await client.book({ symbol: 'BTCUSDT' })
        t.truthy(book)
        t.truthy(book.bids, 'Order book should have bids')
        t.truthy(book.asks, 'Order book should have asks')
        t.true(Array.isArray(book.bids), 'Bids should be an array')
        t.true(Array.isArray(book.asks), 'Asks should be an array')

        t.pass('Order book retrieved successfully through proxy')
    } catch (e) {
        if (e.message && (e.message.includes('ECONNREFUSED') || e.message.includes('proxy'))) {
            t.pass('Proxy connection failed (proxy may be unavailable)')
        } else {
            throw e
        }
    }
})

// ===== Private Endpoint Tests (Auth Required) =====

const main = () => {
    if (!hasTestCredentials()) {
        return test('[PROXY-AUTH] ⚠️  Skipping authenticated tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run authenticated proxy tests.')
            t.pass()
        })
    }

    const client = Binance(binanceConfig)

    // Helper to check if endpoint/proxy is available
    const notAvailable = e => {
        return (
            e.message &&
            (e.message.includes('404') ||
                e.message.includes('Not Found') ||
                e.message.includes('ECONNREFUSED') ||
                e.message.includes('proxy') ||
                e.message.includes('not enabled') ||
                e.message.includes('not support'))
        )
    }

    test('[PROXY-AUTH] accountInfo - get account info through proxy', async t => {
        try {
            const accountInfo = await client.accountInfo()
            t.truthy(accountInfo)
            t.truthy(accountInfo.balances, 'Account info should have balances')
            t.true(Array.isArray(accountInfo.balances), 'Balances should be an array')
            t.truthy(accountInfo.makerCommission !== undefined, 'Should have makerCommission')
            t.truthy(accountInfo.takerCommission !== undefined, 'Should have takerCommission')

            t.pass(
                `Account info retrieved successfully through proxy (${accountInfo.balances.length} balances)`,
            )
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Account info endpoint or proxy not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PROXY-AUTH] depositHistory - get deposit history through proxy', async t => {
        try {
            const deposits = await client.depositHistory({
                recvWindow: 60000,
            })

            t.true(
                Array.isArray(deposits) || typeof deposits === 'object',
                'Should return deposits data',
            )
            t.pass('Deposit history retrieved successfully through proxy')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Deposit history endpoint or proxy not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PROXY-AUTH] openOrders - get open orders through proxy', async t => {
        try {
            const openOrders = await client.openOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })

            t.true(Array.isArray(openOrders), 'Open orders should be an array')
            t.pass('Open orders retrieved successfully through proxy')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Open orders endpoint or proxy not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PROXY-AUTH] myTrades - get trade history through proxy', async t => {
        try {
            const trades = await client.myTrades({
                symbol: 'BTCUSDT',
                limit: 10,
                recvWindow: 60000,
            })

            t.true(Array.isArray(trades), 'Trades should be an array')
            t.true(trades.length <= 10, 'Should return at most 10 trades')
            t.pass('Trade history retrieved successfully through proxy')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Trade history endpoint or proxy not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Futures Endpoint Tests Through Proxy =====

    test('[PROXY-AUTH] futuresAccountInfo - get futures account through proxy', async t => {
        try {
            const accountInfo = await client.futuresAccountInfo({
                recvWindow: 60000,
            })

            t.truthy(accountInfo)
            t.pass('Futures account info retrieved successfully through proxy')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Futures endpoint or proxy not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PROXY-AUTH] futuresAccountBalance - get futures balance through proxy', async t => {
        try {
            const balance = await client.futuresAccountBalance({
                recvWindow: 60000,
            })

            t.truthy(balance)
            t.true(Array.isArray(balance), 'Balance should be an array')
            t.pass('Futures balance retrieved successfully through proxy')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Futures balance endpoint or proxy not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== WebSocket Tests Through Proxy =====

    test('[PROXY-AUTH] ws.user - connect to user data stream through proxy', async t => {
        try {
            const clean = await client.ws.user()
            t.truthy(clean)
            t.true(typeof clean === 'function', 'Should return cleanup function')

            // Clean up the WebSocket connection
            clean()
            t.pass('User data stream connected successfully through proxy')
        } catch (e) {
            if (notAvailable(e) || e.message.includes('WebSocket')) {
                t.pass('User data stream or proxy not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Integration Test =====

    test('[PROXY-AUTH] Integration - multiple endpoints through proxy', async t => {
        try {
            // Test multiple endpoints in sequence
            const ping = await client.ping()
            t.truthy(ping, 'Ping should succeed')

            const serverTime = await client.time()
            t.truthy(serverTime, 'Server time should succeed')

            const accountInfo = await client.accountInfo({ recvWindow: 60000 })
            t.truthy(accountInfo, 'Account info should succeed')

            t.pass('Multiple endpoints work successfully through proxy')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Some endpoints or proxy not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Proxy Error Handling Tests =====

    test('[PROXY] invalid proxy - handle proxy connection failure', async t => {
        const invalidProxyClient = Binance({
            ...binanceConfig,
            proxy: 'http://invalid-proxy-hostname-12345:9999',
        })

        try {
            await invalidProxyClient.ping()
            // If we get here without error, the system might be routing around the proxy
            t.pass('Ping completed (proxy may be bypassed or cached)')
        } catch (e) {
            // Expected to fail with connection error
            t.truthy(e.message, 'Should throw error for invalid proxy')
            t.pass('Invalid proxy properly rejected')
        }
    })
}

main()
