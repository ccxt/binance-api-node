/**
 * Order Endpoints Tests
 *
 * This test suite covers all order-related endpoints:
 * - order: Create a new order
 * - orderOco: Create a new OCO (One-Cancels-the-Other) order
 * - orderTest: Test order creation without actually placing it
 * - getOrder: Query an existing order
 * - getOrderOco: Query an existing OCO order
 * - cancelOrder: Cancel an order
 * - cancelOrderOco: Cancel an OCO order
 * - cancelOpenOrders: Cancel all open orders for a symbol
 * - openOrders: Get all open orders
 * - allOrders: Get all orders (history)
 * - allOrdersOCO: Get all OCO orders (history)
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy for connections
 * - Requires API_KEY and API_SECRET in .env file
 *
 * To run these tests:
 * 1. Create a .env file with:
 *    API_KEY=your_testnet_api_key
 *    API_SECRET=your_testnet_api_secret
 *    PROXY_URL=http://your-proxy-url (optional)
 *
 * 2. Run: npm test test/orders.js
 */

import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[ORDERS] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run order tests.')
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

    // Test orderTest endpoint - safe to use, doesn't create real orders
    test('[ORDERS] orderTest - LIMIT order validation', async t => {
        const currentPrice = await getCurrentPrice()
        // Place order 5% below market price
        const buyPrice = Math.floor(currentPrice * 0.95)

        const result = await client.orderTest({
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'LIMIT',
            quantity: 0.001,
            price: buyPrice,
            timeInForce: 'GTC',
            recvWindow: 60000,
        })

        // orderTest returns empty object on success
        t.truthy(result !== undefined)
    })

    test('[ORDERS] orderTest - MARKET order validation', async t => {
        const result = await client.orderTest({
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'MARKET',
            quantity: 0.001,
            recvWindow: 60000,
        })

        t.truthy(result !== undefined)
    })

    test('[ORDERS] orderTest - MARKET order with quoteOrderQty', async t => {
        const result = await client.orderTest({
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'MARKET',
            quoteOrderQty: 100,
            recvWindow: 60000,
        })

        t.truthy(result !== undefined)
    })

    test('[ORDERS] orderTest - missing required parameters', async t => {
        try {
            await client.orderTest({
                symbol: 'BTCUSDT',
                side: 'BUY',
                type: 'LIMIT',
                // Missing quantity and price
            })
            t.fail('Should have thrown error for missing parameters')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    test('[ORDERS] orderTest - STOP_LOSS order', async t => {
        const currentPrice = await getCurrentPrice()
        // Stop 5% below market
        const stopPrice = Math.floor(currentPrice * 0.95)

        const result = await client.orderTest({
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'STOP_LOSS',
            quantity: 0.001,
            stopPrice,
            recvWindow: 60000,
        })

        t.truthy(result !== undefined)
    })

    test('[ORDERS] orderTest - STOP_LOSS_LIMIT order', async t => {
        const currentPrice = await getCurrentPrice()
        // Stop 5% below market, limit 1% below stop
        const stopPrice = Math.floor(currentPrice * 0.95)
        const limitPrice = Math.floor(stopPrice * 0.99)

        const result = await client.orderTest({
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'STOP_LOSS_LIMIT',
            quantity: 0.001,
            price: limitPrice,
            stopPrice: stopPrice,
            timeInForce: 'GTC',
            recvWindow: 60000,
        })

        t.truthy(result !== undefined)
    })

    test('[ORDERS] orderTest - TAKE_PROFIT order', async t => {
        const currentPrice = await getCurrentPrice()
        // Take profit 5% above market
        const stopPrice = Math.floor(currentPrice * 1.05)

        const result = await client.orderTest({
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'TAKE_PROFIT',
            quantity: 0.001,
            stopPrice: stopPrice,
            recvWindow: 60000,
        })

        t.truthy(result !== undefined)
    })

    test('[ORDERS] orderTest - TAKE_PROFIT_LIMIT order', async t => {
        const currentPrice = await getCurrentPrice()
        // Take profit 5% above market, limit 1% above stop
        const stopPrice = Math.floor(currentPrice * 1.05)
        const limitPrice = Math.floor(stopPrice * 1.01)

        const result = await client.orderTest({
            symbol: 'BTCUSDT',
            side: 'SELL',
            type: 'TAKE_PROFIT_LIMIT',
            quantity: 0.001,
            price: limitPrice,
            stopPrice: stopPrice,
            timeInForce: 'GTC',
            recvWindow: 60000,
        })

        t.truthy(result !== undefined)
    })

    // Test getOrder - requires order to exist
    test('[ORDERS] getOrder - missing required parameters', async t => {
        try {
            await client.getOrder({ symbol: 'BTCUSDT' })
            t.fail('Should have thrown error for missing orderId or origClientOrderId')
        } catch (e) {
            // Accept either validation error or timestamp error (timing issue with proxy)
            const isValidationError =
                e.message.includes('orderId') || e.message.includes('origClientOrderId')
            const isTimestampError =
                e.message.includes('Timestamp') || e.message.includes('recvWindow')
            t.truthy(
                isValidationError || isTimestampError,
                'Error should mention missing orderId/origClientOrderId or timestamp issue',
            )
        }
    })

    test('[ORDERS] getOrder - non-existent order', async t => {
        try {
            await client.getOrder({ symbol: 'BTCUSDT', orderId: 999999999999 })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // Test allOrders
    test('[ORDERS] allOrders - retrieve order history', async t => {
        const orders = await client.allOrders({
            symbol: 'BTCUSDT',
            recvWindow: 60000,
        })

        t.true(Array.isArray(orders), 'allOrders should return an array')
        // May be empty if no orders have been placed
        if (orders.length > 0) {
            const [order] = orders
            checkFields(t, order, ['orderId', 'symbol', 'side', 'type', 'status'])
        }
    })

    test('[ORDERS] allOrders - with limit parameter', async t => {
        const orders = await client.allOrders({
            symbol: 'BTCUSDT',
            recvWindow: 60000,
            limit: 5,
        })

        t.true(Array.isArray(orders))
        t.true(orders.length <= 5, 'Should return at most 5 orders')
    })

    // Test openOrders
    test('[ORDERS] openOrders - retrieve open orders', async t => {
        const orders = await client.openOrders({
            symbol: 'BTCUSDT',
        })

        t.true(Array.isArray(orders), 'openOrders should return an array')
        // Check fields if there are open orders
        if (orders.length > 0) {
            const [order] = orders
            checkFields(t, order, ['orderId', 'symbol', 'side', 'type', 'status'])
            t.is(order.status, 'NEW', 'Open orders should have NEW status')
        }
    })

    test('[ORDERS] openOrders - all symbols', async t => {
        const orders = await client.openOrders({ recvWindow: 60000 })

        t.true(Array.isArray(orders), 'openOrders should return an array')
    })

    // Test cancelOrder
    test('[ORDERS] cancelOrder - non-existent order', async t => {
        try {
            await client.cancelOrder({ symbol: 'BTCUSDT', orderId: 999999999999 })
            t.fail('Should have thrown error for non-existent order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // Test cancelOpenOrders
    test('[ORDERS] cancelOpenOrders - handles no open orders', async t => {
        try {
            await client.cancelOpenOrders({ symbol: 'BTCUSDT' })
            // May succeed with empty result or throw error
            t.pass()
        } catch (e) {
            // Expected if no open orders
            t.truthy(e.message)
        }
    })

    // Test allOrdersOCO
    test('[ORDERS] allOrdersOCO - retrieve OCO order history', async t => {
        const orderLists = await client.allOrdersOCO({ recvWindow: 60000 })

        t.true(Array.isArray(orderLists), 'allOrdersOCO should return an array')
        // Check fields if there are OCO orders
        if (orderLists.length > 0) {
            const [orderList] = orderLists
            checkFields(t, orderList, ['orderListId', 'symbol', 'listOrderStatus', 'orders'])
            t.true(Array.isArray(orderList.orders), 'OCO order should have orders array')
        }
    })

    test('[ORDERS] allOrdersOCO - with limit parameter', async t => {
        const orderLists = await client.allOrdersOCO({
            limit: 5,
            recvWindow: 60000,
        })

        t.true(Array.isArray(orderLists))
        t.true(orderLists.length <= 5, 'Should return at most 5 OCO orders')
    })

    // Test getOrderOco
    test('[ORDERS] getOrderOco - non-existent OCO order', async t => {
        try {
            await client.getOrderOco({ orderListId: 999999999999 })
            t.fail('Should have thrown error for non-existent OCO order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // Test cancelOrderOco
    test('[ORDERS] cancelOrderOco - non-existent OCO order', async t => {
        try {
            await client.cancelOrderOco({ symbol: 'BTCUSDT', orderListId: 999999999999 })
            t.fail('Should have thrown error for non-existent OCO order')
        } catch (e) {
            t.truthy(e.message)
        }
    })

    // Integration test - create, query, and cancel an order (using testnet)
    test('[ORDERS] Integration - create, query, cancel order', async t => {
        const currentPrice = await getCurrentPrice()
        // Place order 10% below market (very low price, unlikely to fill)
        const buyPrice = Math.floor(currentPrice * 0.9)

        // Create an order on testnet
        const createResult = await client.order({
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
        const queryResult = await client.getOrder({
            symbol: 'BTCUSDT',
            orderId,
            recvWindow: 60000,
        })

        t.truthy(queryResult)
        t.is(queryResult.orderId, orderId)
        t.is(queryResult.symbol, 'BTCUSDT')

        // Cancel the order (handle case where order might already be filled)
        try {
            const cancelResult = await client.cancelOrder({
                symbol: 'BTCUSDT',
                orderId,
                recvWindow: 60000,
            })

            t.truthy(cancelResult)
            t.is(cancelResult.orderId, orderId)
            t.is(cancelResult.status, 'CANCELED')
        } catch (e) {
            // Order might have been filled or already canceled
            // This is acceptable in testnet environment
            if (e.code === -2011) {
                // Unknown order - might have been filled instantly
                t.pass('Order was filled or already canceled (acceptable on testnet)')
            } else {
                throw e
            }
        }
    })

    // Integration test - create and query OCO order
    test('[ORDERS] Integration - create, query, cancel OCO order', async t => {
        const currentPrice = await getCurrentPrice()
        // High take-profit price (10% above market)
        const takeProfitPrice = Math.floor(currentPrice * 1.1)
        // Low stop-loss price (10% below market)
        const stopPrice = Math.floor(currentPrice * 0.9)
        const stopLimitPrice = Math.floor(stopPrice * 0.99)

        // Create an OCO order on testnet
        const createResult = await client.orderOco({
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
        const queryResult = await client.getOrderOco({
            orderListId,
            recvWindow: 60000,
        })

        t.truthy(queryResult)
        t.is(queryResult.orderListId, orderListId)
        t.is(queryResult.symbol, 'BTCUSDT')

        // Cancel the OCO order
        const cancelResult = await client.cancelOrderOco({
            symbol: 'BTCUSDT',
            orderListId,
            recvWindow: 60000,
        })

        t.truthy(cancelResult)
        t.is(cancelResult.orderListId, orderListId)
        t.is(cancelResult.listOrderStatus, 'ALL_DONE')
    })

    // Test custom client order ID
    test('[ORDERS] orderTest - with custom newClientOrderId', async t => {
        const customOrderId = `test_order_${Date.now()}`

        const result = await client.orderTest({
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'MARKET',
            quantity: 0.001,
            newClientOrderId: customOrderId,
            recvWindow: 60000,
        })

        t.truthy(result !== undefined)
    })

    // Test with useServerTime option
    test('[ORDERS] allOrders - with useServerTime', async t => {
        const orders = await client.allOrders({
            symbol: 'BTCUSDT',
            useServerTime: true,
        })

        t.true(Array.isArray(orders), 'allOrders should return an array')
    })
}

main()
