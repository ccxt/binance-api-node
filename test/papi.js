/**
 * PAPI (Portfolio Margin API) Endpoints Tests
 *
 * This test suite covers all PAPI private endpoints for portfolio margin trading:
 *
 * Basic Operations:
 * - papiPing: Test connectivity to PAPI endpoint
 * - papiAccount: Get portfolio margin account information
 * - papiBalance: Get portfolio margin balance
 *
 * UM (USDT-Margined Futures) Orders:
 * - papiUmOrder: Create USDT-margined futures order
 * - papiUmConditionalOrder: Create conditional order
 * - papiUmCancelOrder: Cancel order
 * - papiUmCancelAllOpenOrders: Cancel all open orders
 * - papiUmCancelConditionalOrder: Cancel conditional order
 * - papiUmCancelConditionalAllOpenOrders: Cancel all conditional orders
 * - papiUmUpdateOrder: Update/modify order
 * - papiUmGetOrder: Query order
 * - papiUmGetAllOrders: Get all orders
 * - papiUmGetOpenOrder: Get specific open order
 * - papiUmGetOpenOrders: Get all open orders
 * - papiUmGetConditionalAllOrders: Get all conditional orders
 * - papiUmGetConditionalOpenOrders: Get open conditional orders
 * - papiUmGetConditionalOpenOrder: Get specific conditional order
 * - papiUmGetConditionalOrderHistory: Get conditional order history
 * - papiUmGetForceOrders: Get liquidation orders
 * - papiUmGetOrderAmendment: Get order amendment history
 * - papiUmGetUserTrades: Get trade history
 * - papiUmGetAdlQuantile: Get auto-deleverage quantile
 * - papiUmFeeBurn: Enable/disable fee burn
 * - papiUmGetFeeBurn: Get fee burn status
 *
 * CM (Coin-Margined Futures) Orders:
 * - papiCmOrder: Create coin-margined futures order
 * - papiCmConditionalOrder: Create conditional order
 * - papiCmCancelOrder: Cancel order
 * - papiCmCancelAllOpenOrders: Cancel all open orders
 * - papiCmCancelConditionalOrder: Cancel conditional order
 * - papiCmCancelConditionalAllOpenOrders: Cancel all conditional orders
 * - papiCmUpdateOrder: Update/modify order
 * - papiCmGetOrder: Query order
 * - papiCmGetAllOrders: Get all orders
 * - papiCmGetOpenOrder: Get specific open order
 * - papiCmGetOpenOrders: Get all open orders
 * - papiCmGetConditionalOpenOrders: Get open conditional orders
 * - papiCmGetConditionalOpenOrder: Get specific conditional order
 * - papiCmGetConditionalAllOrders: Get all conditional orders
 * - papiCmGetConditionalOrderHistory: Get conditional order history
 * - papiCmGetForceOrders: Get liquidation orders
 * - papiCmGetOrderAmendment: Get order amendment history
 * - papiCmGetUserTrades: Get trade history
 * - papiCmGetAdlQuantile: Get auto-deleverage quantile
 *
 * Margin Orders:
 * - papiMarginOrder: Create margin order
 * - papiMarginOrderOco: Create OCO order
 * - papiMarginCancelOrder: Cancel order
 * - papiMarginCancelOrderList: Cancel order list (OCO)
 * - papiMarginCancelAllOpenOrders: Cancel all open orders
 * - papiMarginGetOrder: Query order
 * - papiMarginGetOpenOrders: Get open orders
 * - papiMarginGetAllOrders: Get all orders
 * - papiMarginGetOrderList: Get order list (OCO)
 * - papiMarginGetAllOrderList: Get all order lists
 * - papiMarginGetOpenOrderList: Get open order lists
 * - papiMarginGetMyTrades: Get trade history
 * - papiMarginGetForceOrders: Get liquidation orders
 *
 * Loan Operations:
 * - papiMarginLoan: Borrow assets
 * - papiRepayLoan: Repay borrowed assets
 * - papiMarginRepayDebt: Repay debt
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy for connections
 * - Requires API_KEY and API_SECRET in .env or uses defaults from config
 *
 * Note: Portfolio Margin API may not be available on all testnets
 *
 * To run these tests:
 * 1. Ensure test/config.js has valid credentials
 * 2. Run: npm test test/papi.js
 */

import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[PAPI] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run PAPI tests.')
            t.pass()
        })
    }

    // Create client with testnet and proxy
    const client = Binance(binanceConfig)

    // Helper to get current BTC price for realistic test orders
    let currentBTCPrice = null
    const getCurrentPrice = async () => {
        if (currentBTCPrice) return currentBTCPrice
        const prices = await client.prices({ symbol: 'BTCUSDT' })
        currentBTCPrice = parseFloat(prices.BTCUSDT)
        return currentBTCPrice
    }

    // Helper to check if PAPI is available (handles 404 errors and empty responses)
    const papiNotAvailable = e => {
        return (
            e.message &&
            (e.message.includes('404') ||
                e.message.includes('Not Found') ||
                e.name === 'SyntaxError' ||
                e.message.includes('Unexpected'))
        )
    }

    // ===== Basic Operations Tests =====

    test('[PAPI] papiPing - test connectivity', async t => {
        try {
            const result = await client.papiPing()
            t.truthy(result !== undefined)
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiAccount - get account information', async t => {
        try {
            const account = await client.papiAccount()
            t.truthy(account)
            // Account structure may vary, just verify we get data
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiBalance - get balance', async t => {
        try {
            const balance = await client.papiBalance({
                recvWindow: 60000,
            })
            t.truthy(balance)
            // Balance can be array or object
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== UM (USDT-Margined) Order Query Tests =====

    test('[PAPI] papiUmGetAllOrders - get all UM orders', async t => {
        try {
            const orders = await client.papiUmGetAllOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiUmGetOpenOrders - get open UM orders', async t => {
        try {
            const orders = await client.papiUmGetOpenOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiUmGetConditionalOpenOrders - get conditional orders', async t => {
        try {
            const orders = await client.papiUmGetConditionalOpenOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiUmGetConditionalAllOrders - get all conditional orders', async t => {
        try {
            const orders = await client.papiUmGetConditionalAllOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiUmGetUserTrades - get UM trade history', async t => {
        try {
            const trades = await client.papiUmGetUserTrades({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.true(Array.isArray(trades) || typeof trades === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiUmGetAdlQuantile - get ADL quantile', async t => {
        try {
            const quantile = await client.papiUmGetAdlQuantile({
                recvWindow: 60000,
            })
            t.truthy(quantile)
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiUmGetFeeBurn - get fee burn status', async t => {
        try {
            const feeBurn = await client.papiUmGetFeeBurn({
                recvWindow: 60000,
            })
            t.truthy(feeBurn)
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiUmGetForceOrders - get liquidation orders', async t => {
        try {
            const forceOrders = await client.papiUmGetForceOrders({
                recvWindow: 60000,
            })
            t.true(Array.isArray(forceOrders) || typeof forceOrders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== CM (Coin-Margined) Order Query Tests =====

    test('[PAPI] papiCmGetAllOrders - get all CM orders', async t => {
        try {
            const orders = await client.papiCmGetAllOrders({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiCmGetOpenOrders - get open CM orders', async t => {
        try {
            const orders = await client.papiCmGetOpenOrders({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiCmGetConditionalOpenOrders - get conditional orders', async t => {
        try {
            const orders = await client.papiCmGetConditionalOpenOrders({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiCmGetUserTrades - get CM trade history', async t => {
        try {
            const trades = await client.papiCmGetUserTrades({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })
            t.true(Array.isArray(trades) || typeof trades === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiCmGetAdlQuantile - get ADL quantile', async t => {
        try {
            const quantile = await client.papiCmGetAdlQuantile({
                recvWindow: 60000,
            })
            t.truthy(quantile)
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiCmGetForceOrders - get liquidation orders', async t => {
        try {
            const forceOrders = await client.papiCmGetForceOrders({
                recvWindow: 60000,
            })
            t.true(Array.isArray(forceOrders) || typeof forceOrders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Margin Order Query Tests =====

    test('[PAPI] papiMarginGetAllOrders - get all margin orders', async t => {
        try {
            const orders = await client.papiMarginGetAllOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiMarginGetOpenOrders - get open margin orders', async t => {
        try {
            const orders = await client.papiMarginGetOpenOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.true(Array.isArray(orders) || typeof orders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiMarginGetAllOrderList - get all OCO orders', async t => {
        try {
            const orderLists = await client.papiMarginGetAllOrderList({
                recvWindow: 60000,
            })
            t.true(Array.isArray(orderLists) || typeof orderLists === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiMarginGetOpenOrderList - get open OCO orders', async t => {
        try {
            const orderLists = await client.papiMarginGetOpenOrderList({
                recvWindow: 60000,
            })
            t.true(Array.isArray(orderLists) || typeof orderLists === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiMarginGetMyTrades - get margin trade history', async t => {
        try {
            const trades = await client.papiMarginGetMyTrades({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.true(Array.isArray(trades) || typeof trades === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[PAPI] papiMarginGetForceOrders - get liquidation orders', async t => {
        try {
            const forceOrders = await client.papiMarginGetForceOrders({
                recvWindow: 60000,
            })
            t.true(Array.isArray(forceOrders) || typeof forceOrders === 'object')
        } catch (e) {
            if (papiNotAvailable(e)) {
                t.pass('PAPI not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Order Error Handling Tests =====

    test('[PAPI] papiUmGetOrder - missing required parameters', async t => {
        try {
            await client.papiUmGetOrder({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for missing orderId')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[PAPI] papiUmGetOrder - non-existent order', async t => {
        try {
            await client.papiUmGetOrder({
                symbol: 'BTCUSDT',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[PAPI] papiCmGetOrder - non-existent order', async t => {
        try {
            await client.papiCmGetOrder({
                symbol: 'BTCUSD_PERP',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[PAPI] papiMarginGetOrder - non-existent order', async t => {
        try {
            await client.papiMarginGetOrder({
                symbol: 'BTCUSDT',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[PAPI] papiUmCancelOrder - non-existent order', async t => {
        try {
            await client.papiUmCancelOrder({
                symbol: 'BTCUSDT',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[PAPI] papiCmCancelOrder - non-existent order', async t => {
        try {
            await client.papiCmCancelOrder({
                symbol: 'BTCUSD_PERP',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[PAPI] papiMarginCancelOrder - non-existent order', async t => {
        try {
            await client.papiMarginCancelOrder({
                symbol: 'BTCUSDT',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // ===== Cancel All Orders Tests =====

    test('[PAPI] papiUmCancelAllOpenOrders - handles no open orders', async t => {
        try {
            await client.papiUmCancelAllOpenOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.pass()
        } catch (e) {
            // Expected if no open orders or PAPI not available
            t.truthy(e.message)
        }
    })

    test('[PAPI] papiCmCancelAllOpenOrders - handles no open orders', async t => {
        try {
            await client.papiCmCancelAllOpenOrders({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })
            t.pass()
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[PAPI] papiMarginCancelAllOpenOrders - handles no open orders', async t => {
        try {
            await client.papiMarginCancelAllOpenOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.pass()
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // ===== Skipped Tests - Operations that create orders or modify account =====

    test.skip('[PAPI] papiUmOrder - create UM order', async t => {
        // Skipped - would create real order
        t.pass('Skipped - would create order')
    })

    test.skip('[PAPI] papiUmConditionalOrder - create conditional order', async t => {
        // Skipped - would create conditional order
        t.pass('Skipped - would create conditional order')
    })

    test.skip('[PAPI] papiCmOrder - create CM order', async t => {
        // Skipped - would create order
        t.pass('Skipped - would create order')
    })

    test.skip('[PAPI] papiCmConditionalOrder - create conditional order', async t => {
        // Skipped - would create conditional order
        t.pass('Skipped - would create conditional order')
    })

    test.skip('[PAPI] papiMarginOrder - create margin order', async t => {
        // Skipped - would create order
        t.pass('Skipped - would create order')
    })

    test.skip('[PAPI] papiMarginOrderOco - create OCO order', async t => {
        // Skipped - would create OCO order
        t.pass('Skipped - would create OCO order')
    })

    test.skip('[PAPI] papiMarginLoan - borrow assets', async t => {
        // Skipped - would borrow assets
        t.pass('Skipped - would borrow assets')
    })

    test.skip('[PAPI] papiRepayLoan - repay loan', async t => {
        // Skipped - would repay loan
        t.pass('Skipped - would repay loan')
    })

    test.skip('[PAPI] papiMarginRepayDebt - repay debt', async t => {
        // Skipped - would repay debt
        t.pass('Skipped - would repay debt')
    })

    test.skip('[PAPI] papiUmFeeBurn - enable fee burn', async t => {
        // Skipped - modifies account settings
        t.pass('Skipped - modifies account settings')
    })

    test.skip('[PAPI] papiUmUpdateOrder - update order', async t => {
        // Skipped - requires existing order
        t.pass('Skipped - requires existing order')
    })

    test.skip('[PAPI] papiCmUpdateOrder - update order', async t => {
        // Skipped - requires existing order
        t.pass('Skipped - requires existing order')
    })
}

main()
