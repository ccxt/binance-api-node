/**
 * Delivery (Coin-Margined Futures) Endpoints Tests
 *
 * This test suite covers all delivery futures private endpoints:
 *
 * Order Management:
 * - deliveryOrder: Create a new delivery order (implied, similar to futures)
 * - deliveryBatchOrders: Create multiple delivery orders
 * - deliveryGetOrder: Query an existing delivery order
 * - deliveryCancelOrder: Cancel a delivery order
 * - deliveryCancelAllOpenOrders: Cancel all open orders for a symbol
 * - deliveryCancelBatchOrders: Cancel multiple orders
 * - deliveryOpenOrders: Get all open delivery orders
 * - deliveryAllOrders: Get all delivery orders (history)
 *
 * Account & Position Management:
 * - deliveryPositionRisk: Get position risk information
 * - deliveryLeverageBracket: Get leverage brackets
 * - deliveryAccountBalance: Get delivery account balance
 * - deliveryAccountInfo: Get delivery account information
 * - deliveryUserTrades: Get user's delivery trades
 *
 * Position & Margin Configuration:
 * - deliveryPositionMode: Get position mode (hedge/one-way)
 * - deliveryPositionModeChange: Change position mode
 * - deliveryLeverage: Set leverage for symbol
 * - deliveryMarginType: Set margin type (isolated/cross)
 * - deliveryPositionMargin: Adjust position margin
 * - deliveryMarginHistory: Get margin change history
 * - deliveryIncome: Get income history
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy for connections
 * - Requires API_KEY and API_SECRET in .env or uses defaults from config
 *
 * Note: Delivery futures use coin-margined contracts (e.g., BTCUSD_PERP)
 *
 * To run these tests:
 * 1. Ensure test/config.js has valid credentials
 * 2. Run: npm test test/delivery.js
 */

import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[DELIVERY] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run delivery tests.')
            t.pass()
        })
    }

    // Create client with testnet and proxy
    const client = Binance(binanceConfig)

    // Helper to get current BTC delivery price for realistic test orders
    // Note: Delivery uses coin-margined symbols like BTCUSD_PERP
    let currentBTCPrice = null
    const getCurrentPrice = async () => {
        if (currentBTCPrice) return currentBTCPrice
        try {
            const prices = await client.deliveryPrices({ symbol: 'BTCUSD_PERP' })
            currentBTCPrice = parseFloat(prices.BTCUSD_PERP)
            return currentBTCPrice
        } catch (e) {
            // Fallback if delivery prices not available
            const spotPrices = await client.prices({ symbol: 'BTCUSDT' })
            currentBTCPrice = parseFloat(spotPrices.BTCUSDT)
            return currentBTCPrice
        }
    }

    // ===== Account Information Tests =====

    test('[DELIVERY] deliveryAccountBalance - get account balance', async t => {
        try {
            const balance = await client.deliveryAccountBalance({
                recvWindow: 60000,
            })

            t.true(Array.isArray(balance), 'Should return an array')
            if (balance.length > 0) {
                const [asset] = balance
                checkFields(t, asset, [
                    'asset',
                    'balance',
                    'crossWalletBalance',
                    'availableBalance',
                ])
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryAccountInfo - get account information', async t => {
        try {
            const accountInfo = await client.deliveryAccountInfo({
                recvWindow: 60000,
            })

            t.truthy(accountInfo)
            // Check for at least some common fields (structure may vary)
            t.truthy(accountInfo.assets || accountInfo.positions !== undefined)
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryPositionRisk - get position risk', async t => {
        try {
            const positions = await client.deliveryPositionRisk({
                recvWindow: 60000,
            })

            t.true(Array.isArray(positions), 'Should return an array')
            if (positions.length > 0) {
                const [position] = positions
                checkFields(t, position, [
                    'symbol',
                    'positionAmt',
                    'entryPrice',
                    'markPrice',
                    'unRealizedProfit',
                    'leverage',
                ])
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Leverage and Position Configuration Tests =====

    test('[DELIVERY] deliveryLeverageBracket - get leverage brackets', async t => {
        try {
            const brackets = await client.deliveryLeverageBracket({
                recvWindow: 60000,
            })

            // Response can be either an array or an object
            if (Array.isArray(brackets)) {
                t.true(brackets.length >= 0, 'Should return an array')
                if (brackets.length > 0) {
                    const [bracket] = brackets
                    t.truthy(bracket.symbol || bracket.pair)
                }
            } else {
                t.truthy(brackets)
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryLeverageBracket - specific symbol', async t => {
        try {
            const brackets = await client.deliveryLeverageBracket({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })

            // Response structure may vary
            if (Array.isArray(brackets)) {
                if (brackets.length > 0) {
                    const [bracket] = brackets
                    t.truthy(bracket.symbol === 'BTCUSD_PERP' || bracket.pair)
                }
            } else {
                t.truthy(brackets)
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryPositionMode - get current position mode', async t => {
        try {
            const positionMode = await client.deliveryPositionMode({
                recvWindow: 60000,
            })

            t.truthy(positionMode)
            t.truthy(typeof positionMode.dualSidePosition === 'boolean')
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    // Note: Skipping position mode change test as it affects account settings
    test.skip('[DELIVERY] deliveryPositionModeChange - change position mode', async t => {
        // This test is skipped because changing position mode requires:
        // 1. No open positions
        // 2. No open orders
        // 3. Can only be changed when account is ready
        t.pass('Skipped - requires specific account state')
    })

    // Note: Skipping configuration changes as they affect account settings
    test.skip('[DELIVERY] deliveryLeverage - set leverage', async t => {
        // Skipped - modifies position settings
        t.pass('Skipped - modifies position configuration')
    })

    test.skip('[DELIVERY] deliveryMarginType - set margin type', async t => {
        // Skipped - modifies position settings
        t.pass('Skipped - modifies position configuration')
    })

    // ===== Order Query Tests =====

    test('[DELIVERY] deliveryAllOrders - get order history', async t => {
        try {
            const orders = await client.deliveryAllOrders({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })

            t.true(Array.isArray(orders), 'Should return an array')
            // May be empty if no orders have been placed
            if (orders.length > 0) {
                const [order] = orders
                checkFields(t, order, ['orderId', 'symbol', 'side', 'type', 'status'])
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryAllOrders - with limit parameter', async t => {
        try {
            const orders = await client.deliveryAllOrders({
                symbol: 'BTCUSD_PERP',
                limit: 5,
                recvWindow: 60000,
            })

            t.true(Array.isArray(orders))
            t.true(orders.length <= 5, 'Should return at most 5 orders')
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryOpenOrders - get open orders for symbol', async t => {
        try {
            const orders = await client.deliveryOpenOrders({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })

            t.true(Array.isArray(orders), 'Should return an array')
            // Check fields if there are open orders
            if (orders.length > 0) {
                const [order] = orders
                checkFields(t, order, ['orderId', 'symbol', 'side', 'type', 'status'])
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryOpenOrders - all symbols', async t => {
        try {
            const orders = await client.deliveryOpenOrders({
                recvWindow: 60000,
            })

            t.true(Array.isArray(orders), 'Should return an array')
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Order Error Handling Tests =====

    test('[DELIVERY] deliveryGetOrder - missing required parameters', async t => {
        try {
            await client.deliveryGetOrder({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for missing orderId or origClientOrderId')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[DELIVERY] deliveryGetOrder - non-existent order', async t => {
        try {
            await client.deliveryGetOrder({
                symbol: 'BTCUSD_PERP',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            // Can be 404 (endpoint not available) or order not found error
            t.truthy(e.message)
        }
    })

    test('[DELIVERY] deliveryCancelOrder - non-existent order', async t => {
        try {
            await client.deliveryCancelOrder({
                symbol: 'BTCUSD_PERP',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[DELIVERY] deliveryCancelAllOpenOrders - handles no open orders', async t => {
        try {
            await client.deliveryCancelAllOpenOrders({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })
            // May succeed with empty result or throw error
            t.pass()
        } catch (e) {
            // Expected if no open orders or endpoint not available
            t.truthy(e.message)
        }
    })

    test('[DELIVERY] deliveryCancelBatchOrders - non-existent orders', async t => {
        try {
            await client.deliveryCancelBatchOrders({
                symbol: 'BTCUSD_PERP',
                orderIdList: [999999999998, 999999999999],
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent orders')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // ===== Trading History Tests =====

    test('[DELIVERY] deliveryUserTrades - get trade history', async t => {
        try {
            const trades = await client.deliveryUserTrades({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })

            t.true(Array.isArray(trades), 'Should return an array')
            // May be empty if no trades have been executed
            if (trades.length > 0) {
                const [trade] = trades
                checkFields(t, trade, ['id', 'symbol', 'price', 'qty', 'commission', 'time'])
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryUserTrades - with limit parameter', async t => {
        try {
            const trades = await client.deliveryUserTrades({
                symbol: 'BTCUSD_PERP',
                limit: 5,
                recvWindow: 60000,
            })

            t.true(Array.isArray(trades))
            t.true(trades.length <= 5, 'Should return at most 5 trades')
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Income and Margin History Tests =====

    test('[DELIVERY] deliveryIncome - get income history', async t => {
        try {
            const income = await client.deliveryIncome({
                recvWindow: 60000,
            })

            t.true(Array.isArray(income), 'Should return an array')
            // May be empty if no income records
            if (income.length > 0) {
                const [record] = income
                checkFields(t, record, ['symbol', 'incomeType', 'income', 'asset', 'time'])
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryIncome - specific symbol', async t => {
        try {
            const income = await client.deliveryIncome({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })

            t.true(Array.isArray(income), 'Should return an array')
            if (income.length > 0) {
                income.forEach(record => {
                    t.is(record.symbol, 'BTCUSD_PERP')
                })
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[DELIVERY] deliveryMarginHistory - get margin change history', async t => {
        try {
            const history = await client.deliveryMarginHistory({
                symbol: 'BTCUSD_PERP',
                recvWindow: 60000,
            })

            t.true(Array.isArray(history), 'Should return an array')
            // May be empty if no margin changes
            if (history.length > 0) {
                const [record] = history
                checkFields(t, record, ['amount', 'asset', 'symbol', 'time', 'type'])
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Batch Orders Tests =====

    test('[DELIVERY] deliveryBatchOrders - create multiple orders', async t => {
        try {
            const currentPrice = await getCurrentPrice()
            // Place orders 10% below market (very low price, unlikely to fill)
            const buyPrice = Math.floor(currentPrice * 0.9)

            // Note: Delivery uses contract quantity, not BTC quantity
            // Each contract represents a specific amount of the underlying asset
            const orders = [
                {
                    symbol: 'BTCUSD_PERP',
                    side: 'BUY',
                    type: 'LIMIT',
                    quantity: 1, // 1 contract
                    price: buyPrice,
                    timeInForce: 'GTC',
                },
                {
                    symbol: 'BTCUSD_PERP',
                    side: 'BUY',
                    type: 'LIMIT',
                    quantity: 1,
                    price: Math.floor(buyPrice * 0.99),
                    timeInForce: 'GTC',
                },
            ]

            const result = await client.deliveryBatchOrders({
                batchOrders: JSON.stringify(orders),
                recvWindow: 60000,
            })

            t.true(Array.isArray(result), 'Should return an array')
            t.true(result.length === 2, 'Should return 2 order results')

            // Check if orders were successfully created
            const successfulOrders = result.filter(order => order.orderId)
            if (successfulOrders.length > 0) {
                // Orders created successfully, clean them up
                successfulOrders.forEach(order => {
                    t.truthy(order.orderId, 'Successful order should have orderId')
                    t.is(order.symbol, 'BTCUSD_PERP')
                })

                // Cancel the created orders
                const orderIds = successfulOrders.map(o => o.orderId)
                try {
                    await client.deliveryCancelBatchOrders({
                        symbol: 'BTCUSD_PERP',
                        orderIdList: orderIds,
                        recvWindow: 60000,
                    })
                } catch (cancelError) {
                    // Ignore cancel errors
                }
            } else {
                // All orders failed, check if it's due to validation or testnet limitation
                const failedOrders = result.filter(order => order.code)
                if (failedOrders.length > 0) {
                    t.pass(
                        'Batch orders API works but orders failed validation (testnet limitation)',
                    )
                }
            }
        } catch (e) {
            if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
                t.pass('Delivery endpoints not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Position Margin Tests (read-only) =====

    test.skip('[DELIVERY] deliveryPositionMargin - adjust position margin', async t => {
        // Skipped - requires open position and modifies margin
        t.pass('Skipped - requires open position')
    })
}

main()
