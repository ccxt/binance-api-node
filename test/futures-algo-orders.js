import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[FUTURES ALGO] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run futures algo order tests.')
            t.pass()
        })
    }

    // Create client with testnet and proxy
    const client = Binance(binanceConfig)

    // Helper to get current LTC futures price for realistic test orders
    let currentLTCPrice = null
    const getCurrentPrice = async () => {
        if (currentLTCPrice) return currentLTCPrice
        const prices = await client.futuresPrices({ symbol: 'LTCUSDT' })
        currentLTCPrice = parseFloat(prices.LTCUSDT)
        return currentLTCPrice
    }

    // Helper to get position information
    const getPositionSide = async () => {
        const positions = await client.futuresPositionRisk({ symbol: 'LTCUSDT' })
        return positions[0]?.positionSide || 'BOTH'
    }

    // ===== Explicit Algo Order Methods Tests =====

    test('[FUTURES ALGO] futuresCreateAlgoOrder - create a STOP_MARKET algo order', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()
        const triggerPrice = currentPrice * 2.0

        const order = await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'STOP_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: triggerPrice.toFixed(2),
        })

        t.truthy(order)
        checkFields(t, order, ['symbol', 'algoId', 'clientAlgoId', 'algoType'])
        t.is(order.symbol, 'LTCUSDT')
        t.is(order.algoType, 'CONDITIONAL')

        // Clean up - cancel the algo order, ignore errors if already cancelled
        try {
            await client.futuresCancelAlgoOrder({
                symbol: 'LTCUSDT',
                algoId: order.algoId,
            })
        } catch (e) {
            // Ignore if order already cancelled, triggered, or filled
        }
    })

    test('[FUTURES ALGO] futuresCreateAlgoOrder - create a TAKE_PROFIT_MARKET algo order', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()
        const triggerPrice = currentPrice * 0.2

        const order = await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'TAKE_PROFIT_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: triggerPrice.toFixed(2),
        })

        t.truthy(order)
        checkFields(t, order, ['symbol', 'algoId', 'clientAlgoId', 'algoType'])
        t.is(order.symbol, 'LTCUSDT')

        // Clean up - try to cancel but don't fail test if it doesn't exist
        try {
            await client.futuresCancelAlgoOrder({
                symbol: 'LTCUSDT',
                algoId: order.algoId,
            })
        } catch (e) {
            // Ignore if order no longer exists
        }
    })

    test('[FUTURES ALGO] futuresGetAlgoOrder - query a specific algo order', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()

        // Create an algo order first
        const createOrder = await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'STOP_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: (currentPrice * 2.0).toFixed(2),
        })

        try {
            // Query the order
            const order = await client.futuresGetAlgoOrder({
                symbol: 'LTCUSDT',
                algoId: createOrder.algoId,
            })

            t.truthy(order)
            checkFields(t, order, ['symbol', 'algoId', 'clientAlgoId'])
            t.is(order.algoId.toString(), createOrder.algoId.toString())
            t.is(order.symbol, 'LTCUSDT')
        } finally {
            // Clean up - try to cancel even if query fails
            try {
                await client.futuresCancelAlgoOrder({
                    symbol: 'LTCUSDT',
                    algoId: createOrder.algoId,
                })
            } catch (e) {
                // Ignore if already cancelled
            }
        }
    })

    test('[FUTURES ALGO] futuresCancelAlgoOrder - cancel an algo order', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()

        // Create an algo order
        const order = await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'STOP_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: (currentPrice * 2.0).toFixed(2),
        })

        // Cancel the order
        try {
            const result = await client.futuresCancelAlgoOrder({
                symbol: 'LTCUSDT',
                algoId: order.algoId,
            })

            t.truthy(result)
            checkFields(t, result, ['algoId'])
            t.is(result.algoId.toString(), order.algoId.toString())
        } catch (e) {
            // If order was already triggered/cancelled, just verify we got the right error
            t.is(e.code, -2011)
        }
    })

    test('[FUTURES ALGO] futuresGetOpenAlgoOrders - get all open algo orders', async t => {
        const orders = await client.futuresGetOpenAlgoOrders({
            symbol: 'LTCUSDT',
        })

        t.true(Array.isArray(orders))
        // Orders array may be empty if no open algo orders
        if (orders.length > 0) {
            const [order] = orders
            checkFields(t, order, ['symbol', 'algoId', 'clientAlgoId', 'side', 'type', 'algoType'])
        }
    })

    test('[FUTURES ALGO] futuresGetAllAlgoOrders - get algo orders history', async t => {
        const orders = await client.futuresGetAllAlgoOrders({
            symbol: 'LTCUSDT',
        })

        t.true(Array.isArray(orders))
        // History may be empty if no algo orders have been placed
    })

    test('[FUTURES ALGO] futuresCancelAllAlgoOpenOrders - cancel all open algo orders', async t => {
        // Create a couple of algo orders first
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()

        await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'STOP_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: (currentPrice * 2.0).toFixed(2),
        })

        await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'TAKE_PROFIT_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: (currentPrice * 0.2).toFixed(2),
        })

        // Cancel all algo orders
        const result = await client.futuresCancelAllAlgoOpenOrders({
            symbol: 'LTCUSDT',
        })

        t.truthy(result)
        // Should return success response
        t.true('code' in result || 'msg' in result)
    })

    // ===== Auto-Routing Tests =====

    test('[FUTURES ALGO] futuresOrder - auto-routes STOP_MARKET to algo endpoint', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()

        // Create a conditional order using the regular futuresOrder method
        // It should automatically route to algo endpoint
        const order = await client.futuresOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'STOP_MARKET',
            quantity: '1',
            stopPrice: (currentPrice * 2.0).toFixed(2),
        })

        t.truthy(order)
        // Should have algoId instead of orderId because it was routed to algo endpoint
        t.truthy(order.algoId)
        t.is(order.symbol, 'LTCUSDT')

        // Clean up - ignore errors if order no longer exists
        try {
            await client.futuresCancelAlgoOrder({
                symbol: 'LTCUSDT',
                algoId: order.algoId,
            })
        } catch (e) {
            // Ignore if order already cancelled, triggered, or filled
        }
    })

    test('[FUTURES ALGO] futuresOrder - auto-routes TAKE_PROFIT_MARKET to algo endpoint', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()

        const order = await client.futuresOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'TAKE_PROFIT_MARKET',
            quantity: '1',
            stopPrice: (currentPrice * 0.2).toFixed(2),
        })

        t.truthy(order)
        t.truthy(order.algoId)

        // Clean up - ignore errors if order no longer exists
        try {
            await client.futuresCancelAlgoOrder({
                symbol: 'LTCUSDT',
                algoId: order.algoId,
            })
        } catch (e) {
            // Ignore if order already cancelled, triggered, or filled
        }
    })

    test('[FUTURES ALGO] futuresGetOrder with conditional=true - query algo order', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()

        // Create an algo order
        const createOrder = await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'STOP_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: (currentPrice * 2.0).toFixed(2),
        })

        try {
            // Query using futuresGetOrder with conditional=true
            const order = await client.futuresGetOrder({
                symbol: 'LTCUSDT',
                algoId: createOrder.algoId,
                conditional: true,
            })

            t.truthy(order)
            t.is(order.algoId.toString(), createOrder.algoId.toString())
        } finally {
            // Clean up - try to cancel even if query fails
            try {
                await client.futuresCancelAlgoOrder({
                    symbol: 'LTCUSDT',
                    algoId: createOrder.algoId,
                })
            } catch (e) {
                // Ignore if already cancelled
            }
        }
    })

    test('[FUTURES ALGO] futuresOpenOrders with conditional=true - get open algo orders', async t => {
        const orders = await client.futuresOpenOrders({
            symbol: 'LTCUSDT',
            conditional: true,
        })

        t.true(Array.isArray(orders))
    })

    test('[FUTURES ALGO] futuresAllOrders with conditional=true - get algo orders history', async t => {
        const orders = await client.futuresAllOrders({
            symbol: 'LTCUSDT',
            conditional: true,
        })

        t.true(Array.isArray(orders))
    })

    test('[FUTURES ALGO] futuresCancelOrder with conditional=true - cancel algo order', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()

        // Create an algo order
        const order = await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'STOP_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: (currentPrice * 2.0).toFixed(2),
        })

        // Cancel using futuresCancelOrder with conditional=true
        try {
            const result = await client.futuresCancelOrder({
                symbol: 'LTCUSDT',
                algoId: order.algoId,
                conditional: true,
            })

            t.truthy(result)
            t.is(result.algoId.toString(), order.algoId.toString())
        } catch (e) {
            // If order was already triggered/cancelled, just verify we got the right error
            t.is(e.code, -2011)
        }
    })

    test('[FUTURES ALGO] futuresCancelAllOpenOrders with conditional=true', async t => {
        const currentPrice = await getCurrentPrice()
        const positionSide = await getPositionSide()

        // Create a couple of algo orders
        await client.futuresCreateAlgoOrder({
            symbol: 'LTCUSDT',
            side: 'BUY',
            positionSide,
            type: 'STOP_MARKET',
            algoType: 'CONDITIONAL',
            quantity: '1',
            triggerPrice: (currentPrice * 2.0).toFixed(2),
        })

        // Cancel all using futuresCancelAllOpenOrders with conditional=true
        const result = await client.futuresCancelAllOpenOrders({
            symbol: 'LTCUSDT',
            conditional: true,
        })

        t.truthy(result)
    })
}

main()
