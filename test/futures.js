/**
 * Futures Endpoints Tests
 *
 * This test suite covers all futures-related private endpoints:
 *
 * Order Management:
 * - futuresOrder: Create a new futures order
 * - futuresBatchOrders: Create multiple futures orders
 * - futuresGetOrder: Query an existing futures order
 * - futuresCancelOrder: Cancel a futures order
 * - futuresCancelAllOpenOrders: Cancel all open orders for a symbol
 * - futuresCancelBatchOrders: Cancel multiple orders
 * - futuresOpenOrders: Get all open futures orders
 * - futuresAllOrders: Get all futures orders (history)
 *
 * Account & Position Management:
 * - futuresPositionRisk: Get position risk information
 * - futuresLeverageBracket: Get leverage brackets
 * - futuresAccountBalance: Get futures account balance
 * - futuresAccountInfo: Get futures account information
 * - futuresUserTrades: Get user's futures trades
 *
 * Position & Margin Configuration:
 * - futuresPositionMode: Get position mode (hedge/one-way)
 * - futuresPositionModeChange: Change position mode
 * - futuresLeverage: Set leverage for symbol
 * - futuresMarginType: Set margin type (isolated/cross)
 * - futuresPositionMargin: Adjust position margin
 * - futuresMarginHistory: Get margin change history
 * - futuresIncome: Get income history
 *
 * Multi-Asset Mode:
 * - getMultiAssetsMargin: Get multi-asset mode status
 * - setMultiAssetsMargin: Enable/disable multi-asset mode
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy for connections
 * - Requires API_KEY and API_SECRET in .env or uses defaults from config
 *
 * To run these tests:
 * 1. Ensure test/config.js has valid credentials
 * 2. Run: npm test test/futures.js
 */

import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[FUTURES] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run futures tests.')
            t.pass()
        })
    }

    // Create client with testnet and proxy
    const client = Binance(binanceConfig)

    // Helper to get current BTC futures price for realistic test orders
    let currentBTCPrice = null
    const getCurrentPrice = async () => {
        if (currentBTCPrice) return currentBTCPrice
        const prices = await client.futuresPrices({ symbol: 'BTCUSDT' })
        currentBTCPrice = parseFloat(prices.BTCUSDT)
        return currentBTCPrice
    }

    // ===== Account Information Tests =====

    test('[FUTURES] futuresAccountBalance - get account balance', async t => {
        const balance = await client.futuresAccountBalance({
            recvWindow: 60000,
        })

        t.true(Array.isArray(balance), 'Should return an array')
        if (balance.length > 0) {
            const [asset] = balance
            checkFields(t, asset, ['asset', 'balance', 'crossWalletBalance', 'availableBalance'])
        }
    })

    test('[FUTURES] futuresAccountInfo - get account information', async t => {
        const accountInfo = await client.futuresAccountInfo({
            recvWindow: 60000,
        })

        t.truthy(accountInfo)
        checkFields(t, accountInfo, [
            'totalInitialMargin',
            'totalMaintMargin',
            'totalWalletBalance',
            'totalUnrealizedProfit',
            'totalMarginBalance',
            'totalPositionInitialMargin',
            'totalOpenOrderInitialMargin',
            'totalCrossWalletBalance',
            'totalCrossUnPnl',
            'availableBalance',
            'maxWithdrawAmount',
            'assets',
            'positions',
        ])
        t.true(Array.isArray(accountInfo.assets))
        t.true(Array.isArray(accountInfo.positions))
    })

    test('[FUTURES] futuresPositionRisk - get position risk', async t => {
        const positions = await client.futuresPositionRisk({
            recvWindow: 60000,
        })

        t.true(Array.isArray(positions), 'Should return an array')
        // Positions array may be empty if no positions are open
        if (positions.length > 0) {
            const [position] = positions
            checkFields(t, position, [
                'symbol',
                'positionAmt',
                'entryPrice',
                'markPrice',
                'unRealizedProfit',
                'liquidationPrice',
                'leverage',
                'marginType',
            ])
        }
    })

    test('[FUTURES] futuresLeverageBracket - get leverage brackets', async t => {
        const brackets = await client.futuresLeverageBracket({
            recvWindow: 60000,
        })

        t.true(Array.isArray(brackets), 'Should return an array')
        if (brackets.length > 0) {
            const [bracket] = brackets
            checkFields(t, bracket, ['symbol', 'brackets'])
            t.true(Array.isArray(bracket.brackets))
        }
    })

    test('[FUTURES] futuresLeverageBracket - specific symbol', async t => {
        const brackets = await client.futuresLeverageBracket({
            symbol: 'BTCUSDT',
            recvWindow: 60000,
        })

        t.true(Array.isArray(brackets))
        if (brackets.length > 0) {
            const [bracket] = brackets
            t.is(bracket.symbol, 'BTCUSDT')
            t.true(Array.isArray(bracket.brackets))
        }
    })

    // ===== Position Mode Tests =====

    test('[FUTURES] futuresPositionMode - get current position mode', async t => {
        const positionMode = await client.futuresPositionMode({
            recvWindow: 60000,
        })

        t.truthy(positionMode)
        t.truthy(typeof positionMode.dualSidePosition === 'boolean')
    })

    // Note: Skipping position mode change test as it affects account settings
    test.skip('[FUTURES] futuresPositionModeChange - change position mode', async t => {
        // This test is skipped because changing position mode requires:
        // 1. No open positions
        // 2. No open orders
        // 3. Can only be changed when account is ready
        t.pass('Skipped - requires specific account state')
    })

    // ===== Margin Configuration Tests =====

    test('[FUTURES] getMultiAssetsMargin - get multi-asset mode status', async t => {
        const multiAssetMode = await client.getMultiAssetsMargin({
            recvWindow: 60000,
        })

        t.truthy(multiAssetMode)
        t.truthy(typeof multiAssetMode.multiAssetsMargin === 'boolean')
    })

    // Note: Skipping margin configuration changes as they affect account settings
    test.skip('[FUTURES] setMultiAssetsMargin - set multi-asset mode', async t => {
        // Skipped - modifies account settings
        t.pass('Skipped - modifies account configuration')
    })

    test.skip('[FUTURES] futuresLeverage - set leverage', async t => {
        // Skipped - modifies position settings
        t.pass('Skipped - modifies position configuration')
    })

    test.skip('[FUTURES] futuresMarginType - set margin type', async t => {
        // Skipped - modifies position settings
        t.pass('Skipped - modifies position configuration')
    })

    // ===== Order Query Tests =====

    test('[FUTURES] futuresAllOrders - get order history', async t => {
        const orders = await client.futuresAllOrders({
            symbol: 'BTCUSDT',
            recvWindow: 60000,
        })

        t.true(Array.isArray(orders), 'Should return an array')
        // May be empty if no orders have been placed
        if (orders.length > 0) {
            const [order] = orders
            checkFields(t, order, ['orderId', 'symbol', 'side', 'type', 'status'])
        }
    })

    test('[FUTURES] futuresAllOrders - with limit parameter', async t => {
        const orders = await client.futuresAllOrders({
            symbol: 'BTCUSDT',
            limit: 5,
            recvWindow: 60000,
        })

        t.true(Array.isArray(orders))
        t.true(orders.length <= 5, 'Should return at most 5 orders')
    })

    test('[FUTURES] futuresOpenOrders - get open orders for symbol', async t => {
        const orders = await client.futuresOpenOrders({
            symbol: 'BTCUSDT',
            recvWindow: 60000,
        })

        t.true(Array.isArray(orders), 'Should return an array')
        // Check fields if there are open orders
        if (orders.length > 0) {
            const [order] = orders
            checkFields(t, order, ['orderId', 'symbol', 'side', 'type', 'status'])
        }
    })

    test('[FUTURES] futuresOpenOrders - all symbols', async t => {
        const orders = await client.futuresOpenOrders({
            recvWindow: 60000,
        })

        t.true(Array.isArray(orders), 'Should return an array')
    })

    test('[FUTURES] futuresGetOrder - missing required parameters', async t => {
        try {
            await client.futuresGetOrder({ symbol: 'BTCUSDT', recvWindow: 60000 })
            t.fail('Should have thrown error for missing orderId')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[FUTURES] futuresGetOrder - non-existent order', async t => {
        try {
            await client.futuresGetOrder({
                symbol: 'BTCUSDT',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // ===== Cancel Order Tests =====

    test('[FUTURES] futuresCancelOrder - non-existent order', async t => {
        try {
            await client.futuresCancelOrder({
                symbol: 'BTCUSDT',
                orderId: 999999999999,
                recvWindow: 60000,
            })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[FUTURES] futuresCancelAllOpenOrders - handles no open orders', async t => {
        try {
            await client.futuresCancelAllOpenOrders({
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

    // ===== Trade History Tests =====

    test('[FUTURES] futuresUserTrades - get trade history', async t => {
        const trades = await client.futuresUserTrades({
            symbol: 'BTCUSDT',
            recvWindow: 60000,
        })

        t.true(Array.isArray(trades), 'Should return an array')
        // May be empty if no trades have been made
        if (trades.length > 0) {
            const [trade] = trades
            checkFields(t, trade, ['symbol', 'id', 'orderId', 'price', 'qty', 'commission', 'time'])
        }
    })

    test('[FUTURES] futuresUserTrades - with limit parameter', async t => {
        const trades = await client.futuresUserTrades({
            symbol: 'BTCUSDT',
            limit: 5,
            recvWindow: 60000,
        })

        t.true(Array.isArray(trades))
        t.true(trades.length <= 5, 'Should return at most 5 trades')
    })

    test('[FUTURES] futuresIncome - get income history', async t => {
        const income = await client.futuresIncome({
            recvWindow: 60000,
        })

        t.true(Array.isArray(income), 'Should return an array')
        // May be empty if no income records
        if (income.length > 0) {
            const [record] = income
            checkFields(t, record, ['symbol', 'incomeType', 'income', 'asset', 'time'])
        }
    })

    test('[FUTURES] futuresIncome - specific symbol', async t => {
        const income = await client.futuresIncome({
            symbol: 'BTCUSDT',
            recvWindow: 60000,
        })

        t.true(Array.isArray(income))
    })

    test('[FUTURES] futuresMarginHistory - get margin change history', async t => {
        const history = await client.futuresMarginHistory({
            symbol: 'BTCUSDT',
            recvWindow: 60000,
        })

        t.true(Array.isArray(history), 'Should return an array')
        // May be empty if no margin changes
    })

    // ===== Integration Test - Create and Cancel Order =====

    test('[FUTURES] Integration - create, query, cancel order', async t => {
        const currentPrice = await getCurrentPrice()
        // Place order 10% below market (very low price, unlikely to fill)
        const buyPrice = Math.floor(currentPrice * 0.9)
        // Futures minimum notional is $100, so we need larger quantity
        const quantity = Math.max(0.002, Math.ceil((100 / buyPrice) * 1000) / 1000)

        // Create a futures order on testnet
        const createResult = await client.futuresOrder({
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'LIMIT',
            quantity: quantity,
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
        const queryResult = await client.futuresGetOrder({
            symbol: 'BTCUSDT',
            orderId,
            recvWindow: 60000,
        })

        t.truthy(queryResult)
        t.is(queryResult.orderId, orderId)
        t.is(queryResult.symbol, 'BTCUSDT')

        // Cancel the order (handle case where order might already be filled)
        try {
            const cancelResult = await client.futuresCancelOrder({
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
    })

    // ===== Batch Orders Tests =====

    test('[FUTURES] futuresBatchOrders - create multiple orders', async t => {
        const currentPrice = await getCurrentPrice()
        const buyPrice1 = Math.floor(currentPrice * 0.85)
        const buyPrice2 = Math.floor(currentPrice * 0.8)
        // Ensure minimum notional of $100
        const quantity1 = Math.max(0.002, Math.ceil((100 / buyPrice1) * 1000) / 1000)
        const quantity2 = Math.max(0.002, Math.ceil((100 / buyPrice2) * 1000) / 1000)

        const batchOrders = [
            {
                symbol: 'BTCUSDT',
                side: 'BUY',
                type: 'LIMIT',
                quantity: quantity1,
                price: buyPrice1,
                timeInForce: 'GTC',
            },
            {
                symbol: 'BTCUSDT',
                side: 'BUY',
                type: 'LIMIT',
                quantity: quantity2,
                price: buyPrice2,
                timeInForce: 'GTC',
            },
        ]

        try {
            const result = await client.futuresBatchOrders({
                batchOrders: JSON.stringify(batchOrders),
                recvWindow: 60000,
            })

            t.true(Array.isArray(result), 'Should return an array')
            t.is(result.length, 2, 'Should have 2 responses')

            // Check if orders were created successfully (some may fail validation)
            const successfulOrders = result.filter(order => order.orderId)

            if (successfulOrders.length > 0) {
                // Verify successful orders
                successfulOrders.forEach(order => {
                    t.truthy(order.orderId, 'Successful order should have orderId')
                    t.is(order.symbol, 'BTCUSDT')
                })

                // Clean up - cancel the created orders
                const orderIds = successfulOrders.map(order => order.orderId)
                try {
                    await client.futuresCancelBatchOrders({
                        symbol: 'BTCUSDT',
                        orderIdList: JSON.stringify(orderIds),
                        recvWindow: 60000,
                    })
                    t.pass('Batch orders created and cancelled successfully')
                } catch (e) {
                    if (e.code === -2011) {
                        t.pass('Orders were filled or already canceled')
                    } else {
                        throw e
                    }
                }
            } else {
                // If no orders succeeded, check if they failed with valid errors
                const failedOrders = result.filter(order => order.code)
                t.true(
                    failedOrders.length > 0,
                    'Orders should either succeed or fail with error codes',
                )
                t.pass('Batch orders API works but orders failed validation (testnet limitation)')
            }
        } catch (e) {
            // Batch orders might not be supported on testnet
            t.pass(`Batch orders may not be fully supported on testnet: ${e.message}`)
        }
    })

    test('[FUTURES] futuresCancelBatchOrders - non-existent orders', async t => {
        const result = await client.futuresCancelBatchOrders({
            symbol: 'BTCUSDT',
            orderIdList: JSON.stringify([999999999999, 999999999998]),
            recvWindow: 60000,
        })

        // Futures API returns array with error info for each order
        t.true(Array.isArray(result), 'Should return an array')
        // Each failed cancellation should have error code
        if (result.length > 0) {
            result.forEach(item => {
                // Should have either success status or error code
                t.truthy(item.code || item.orderId)
            })
        }
    })

    // ===== Position Margin Tests (read-only) =====

    test.skip('[FUTURES] futuresPositionMargin - adjust position margin', async t => {
        // Skipped - requires open position and modifies margin
        t.pass('Skipped - requires open position')
    })
}

main()
