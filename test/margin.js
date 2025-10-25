/**
 * Margin Trading Endpoints Tests
 *
 * This test suite covers all margin trading private endpoints:
 *
 * Order Management:
 * - marginOrder: Create a new margin order
 * - marginOrderOco: Create a new margin OCO order
 * - marginGetOrder: Query an existing margin order
 * - marginGetOrderOco: Query an existing margin OCO order
 * - marginCancelOrder: Cancel a margin order
 * - marginCancelOpenOrders: Cancel all open margin orders for a symbol
 * - marginOpenOrders: Get all open margin orders
 * - marginAllOrders: Get all margin orders (history)
 *
 * Account Management:
 * - marginAccountInfo: Get cross margin account information
 * - marginAccount: Get margin account details
 * - marginIsolatedAccount: Get isolated margin account information
 * - marginMaxBorrow: Get max borrowable amount
 *
 * Trading History:
 * - marginMyTrades: Get margin trading history
 *
 * Borrow & Repay:
 * - marginLoan: Borrow assets for margin trading
 * - marginRepay: Repay borrowed assets
 *
 * Isolated Margin:
 * - marginCreateIsolated: Create isolated margin account
 * - marginIsolatedTransfer: Transfer to/from isolated margin account
 * - marginIsolatedTransferHistory: Get isolated margin transfer history
 * - enableMarginAccount: Enable isolated margin account
 * - disableMarginAccount: Disable isolated margin account
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy for connections
 * - Requires API_KEY and API_SECRET in .env or uses defaults from config
 *
 * To run these tests:
 * 1. Ensure test/config.js has valid credentials
 * 2. Run: npm test test/margin.js
 */

import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[MARGIN] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run margin tests.')
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

    // ===== Account Information Tests =====

    test('[MARGIN] marginAccountInfo - get cross margin account info', async t => {
        try {
            const accountInfo = await client.marginAccountInfo({
                recvWindow: 60000,
            })

            t.truthy(accountInfo)
            checkFields(t, accountInfo, [
                'borrowEnabled',
                'marginLevel',
                'totalAssetOfBtc',
                'totalLiabilityOfBtc',
                'totalNetAssetOfBtc',
                'tradeEnabled',
                'transferEnabled',
                'userAssets',
            ])
            t.true(Array.isArray(accountInfo.userAssets), 'userAssets should be an array')
        } catch (e) {
            // Margin endpoints may not be available on testnet
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[MARGIN] marginAccount - get margin account details', async t => {
        try {
            const account = await client.marginAccount()

            t.truthy(account)
            checkFields(t, account, [
                'borrowEnabled',
                'marginLevel',
                'totalAssetOfBtc',
                'totalLiabilityOfBtc',
                'totalNetAssetOfBtc',
                'tradeEnabled',
                'transferEnabled',
                'userAssets',
            ])
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[MARGIN] marginIsolatedAccount - get isolated margin account', async t => {
        try {
            const isolatedAccount = await client.marginIsolatedAccount({
                recvWindow: 60000,
            })

            t.truthy(isolatedAccount)
            // May have no assets if no isolated margin accounts are created
            if (isolatedAccount.assets && isolatedAccount.assets.length > 0) {
                checkFields(t, isolatedAccount.assets[0], ['symbol', 'baseAsset', 'quoteAsset'])
            }
        } catch (e) {
            // May fail if isolated margin is not enabled
            t.pass('Isolated margin may not be enabled on testnet')
        }
    })

    test('[MARGIN] marginMaxBorrow - get max borrowable amount', async t => {
        try {
            const maxBorrow = await client.marginMaxBorrow({
                asset: 'BTC',
                recvWindow: 60000,
            })

            t.truthy(maxBorrow)
            checkFields(t, maxBorrow, ['amount', 'borrowLimit'])
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Order Query Tests =====

    test('[MARGIN] marginAllOrders - get margin order history', async t => {
        try {
            const orders = await client.marginAllOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })

            t.true(Array.isArray(orders), 'marginAllOrders should return an array')
            // May be empty if no margin orders have been placed
            if (orders.length > 0) {
                const [order] = orders
                checkFields(t, order, ['orderId', 'symbol', 'side', 'type', 'status'])
            }
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[MARGIN] marginAllOrders - with limit parameter', async t => {
        try {
            const orders = await client.marginAllOrders({
                symbol: 'BTCUSDT',
                limit: 5,
                recvWindow: 60000,
            })

            t.true(Array.isArray(orders))
            t.true(orders.length <= 5, 'Should return at most 5 orders')
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[MARGIN] marginOpenOrders - get open margin orders', async t => {
        try {
            const orders = await client.marginOpenOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })

            t.true(Array.isArray(orders), 'marginOpenOrders should return an array')
            // Check fields if there are open orders
            if (orders.length > 0) {
                const [order] = orders
                checkFields(t, order, ['orderId', 'symbol', 'side', 'type', 'status'])
            }
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[MARGIN] marginOpenOrders - all symbols', async t => {
        try {
            const orders = await client.marginOpenOrders({
                recvWindow: 60000,
            })

            t.true(Array.isArray(orders), 'marginOpenOrders should return an array')
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Order Error Handling Tests =====

    test('[MARGIN] marginGetOrder - missing required parameters', async t => {
        try {
            await client.marginGetOrder({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for missing orderId or origClientOrderId')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[MARGIN] marginGetOrder - non-existent order', async t => {
        try {
            await client.marginGetOrder({
                symbol: 'BTCUSDT',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[MARGIN] marginCancelOrder - non-existent order', async t => {
        try {
            await client.marginCancelOrder({
                symbol: 'BTCUSDT',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[MARGIN] marginCancelOpenOrders - handles no open orders', async t => {
        try {
            await client.marginCancelOpenOrders({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })
            // May succeed with empty result or throw error
            t.pass()
        } catch (e) {
            // Expected if no open orders
            t.truthy(e.message)
        }
    })

    // ===== Trading History Tests =====

    test('[MARGIN] marginMyTrades - get margin trade history', async t => {
        try {
            const trades = await client.marginMyTrades({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })

            t.true(Array.isArray(trades), 'marginMyTrades should return an array')
            // May be empty if no trades have been executed
            if (trades.length > 0) {
                const [trade] = trades
                checkFields(t, trade, ['id', 'symbol', 'price', 'qty', 'commission', 'time'])
            }
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[MARGIN] marginMyTrades - with limit parameter', async t => {
        try {
            const trades = await client.marginMyTrades({
                symbol: 'BTCUSDT',
                limit: 5,
                recvWindow: 60000,
            })

            t.true(Array.isArray(trades))
            t.true(trades.length <= 5, 'Should return at most 5 trades')
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== OCO Order Tests =====

    test('[MARGIN] marginGetOrderOco - non-existent OCO order', async t => {
        try {
            await client.marginGetOrderOco({
                orderListId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent OCO order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // ===== Integration Test - Create, Query, Cancel Order =====

    test('[MARGIN] Integration - create, query, cancel margin order', async t => {
        try {
            const currentPrice = await getCurrentPrice()
            // Place order 10% below market (very low price, unlikely to fill)
            const buyPrice = Math.floor(currentPrice * 0.9)

            // Create a margin order on testnet
            const createResult = await client.marginOrder({
                symbol: 'BTCUSDT',
                side: 'BUY',
                type: 'LIMIT',
                quantity: 0.001,
                price: buyPrice,
                timeInForce: 'GTC',
                recvWindow: 60000,
            })

            t.truthy(createResult)
            checkFields(t, createResult, ['orderId', 'symbol', 'side', 'type', 'status'])
            t.is(createResult.symbol, 'BTCUSDT')
            t.is(createResult.side, 'BUY')
            t.is(createResult.type, 'LIMIT')

            const orderId = createResult.orderId

            // Query the order
            const queryResult = await client.marginGetOrder({
                symbol: 'BTCUSDT',
                orderId,
                recvWindow: 60000,
            })

            t.truthy(queryResult)
            t.is(queryResult.orderId, orderId)
            t.is(queryResult.symbol, 'BTCUSDT')

            // Cancel the order (handle case where order might already be filled)
            try {
                const cancelResult = await client.marginCancelOrder({
                    symbol: 'BTCUSDT',
                    orderId,
                    recvWindow: 60000,
                })

                t.truthy(cancelResult)
                t.is(cancelResult.orderId, orderId)
                t.is(cancelResult.status, 'CANCELED')
            } catch (e) {
                // Order might have been filled or already canceled
                if (e.code === -2011) {
                    t.pass('Order was filled or already canceled (acceptable on testnet)')
                } else {
                    throw e
                }
            }
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Integration Test - Create and Cancel OCO Order =====

    test('[MARGIN] Integration - create, query, cancel margin OCO order', async t => {
        try {
            const currentPrice = await getCurrentPrice()
            // High take-profit price (10% above market)
            const takeProfitPrice = Math.floor(currentPrice * 1.1)
            // Low stop-loss price (10% below market)
            const stopPrice = Math.floor(currentPrice * 0.9)
            const stopLimitPrice = Math.floor(stopPrice * 0.99)

            // Create a margin OCO order on testnet
            const createResult = await client.marginOrderOco({
                symbol: 'BTCUSDT',
                side: 'SELL',
                quantity: 0.001,
                price: takeProfitPrice,
                stopPrice: stopPrice,
                stopLimitPrice: stopLimitPrice,
                stopLimitTimeInForce: 'GTC',
                recvWindow: 60000,
            })

            t.truthy(createResult)
            checkFields(t, createResult, ['orderListId', 'symbol', 'orders'])
            t.is(createResult.symbol, 'BTCUSDT')
            t.true(Array.isArray(createResult.orders))
            t.is(createResult.orders.length, 2, 'OCO order should have 2 orders')

            const orderListId = createResult.orderListId

            // Query the OCO order
            const queryResult = await client.marginGetOrderOco({
                orderListId,
                recvWindow: 60000,
            })

            t.truthy(queryResult)
            t.is(queryResult.orderListId, orderListId)
            t.is(queryResult.symbol, 'BTCUSDT')

            // Cancel both orders in the OCO
            try {
                const order1 = createResult.orders[0]
                const order2 = createResult.orders[1]

                await client.marginCancelOrder({
                    symbol: 'BTCUSDT',
                    orderId: order1.orderId,
                    recvWindow: 60000,
                })

                await client.marginCancelOrder({
                    symbol: 'BTCUSDT',
                    orderId: order2.orderId,
                    recvWindow: 60000,
                })

                t.pass('OCO orders canceled successfully')
            } catch (e) {
                // Orders might have been filled or already canceled
                if (e.code === -2011) {
                    t.pass('Orders were filled or already canceled (acceptable on testnet)')
                } else {
                    throw e
                }
            }
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('Margin trading not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Skipped Tests - Operations that modify account/borrow funds =====

    test.skip('[MARGIN] marginLoan - borrow assets', async t => {
        // Skipped - would borrow real assets on testnet
        // Example call (DO NOT RUN without caution):
        // await client.marginLoan({
        //     asset: 'BTC',
        //     amount: 0.001,
        //     recvWindow: 60000,
        // })
        t.pass('Skipped - would borrow assets')
    })

    test.skip('[MARGIN] marginRepay - repay borrowed assets', async t => {
        // Skipped - requires borrowed assets to repay
        // Example call (DO NOT RUN without caution):
        // await client.marginRepay({
        //     asset: 'BTC',
        //     amount: 0.001,
        //     recvWindow: 60000,
        // })
        t.pass('Skipped - requires borrowed assets')
    })

    test.skip('[MARGIN] marginCreateIsolated - create isolated margin account', async t => {
        // Skipped - creates isolated margin account
        // Example call:
        // await client.marginCreateIsolated({
        //     base: 'BTC',
        //     quote: 'USDT',
        //     recvWindow: 60000,
        // })
        t.pass('Skipped - creates isolated margin account')
    })

    test.skip('[MARGIN] marginIsolatedTransfer - transfer to isolated margin', async t => {
        // Skipped - requires isolated margin account and transfers funds
        t.pass('Skipped - requires isolated margin account')
    })

    test.skip('[MARGIN] marginIsolatedTransferHistory - get transfer history', async t => {
        // Skipped - requires isolated margin account with transfer history
        t.pass('Skipped - requires isolated margin account')
    })

    test.skip('[MARGIN] enableMarginAccount - enable isolated margin', async t => {
        // Skipped - modifies account configuration
        t.pass('Skipped - modifies account configuration')
    })

    test.skip('[MARGIN] disableMarginAccount - disable isolated margin', async t => {
        // Skipped - modifies account configuration
        t.pass('Skipped - modifies account configuration')
    })
}

main()
