/**
 * WebSocket User Data Stream Example
 *
 * Connects to the spot user data stream via WebSocket API,
 * places a limit order, and logs the execution reports received.
 *
 * Usage:
 *   export BINANCE_APIKEY="..."
 *   export BINANCE_SECRET="..."
 *   node examples/ws-user-stream.mjs
 */

import BinanceModule from '../dist/index.js'
const Binance = BinanceModule.default

const client = Binance({
    apiKey: process.env.BINANCE_APIKEY,
    apiSecret: process.env.BINANCE_SECRET,
    httpBase: 'https://demo-api.binance.com',
    wsApi: 'wss://demo-ws-api.binance.com/ws-api/v3',
})

const CONNECT_TIMEOUT_MS = 15000

async function main() {
    // 1. Connect to user data stream with a timeout
    console.log('Connecting to user data stream...')
    const clean = await Promise.race([
        client.ws.user(msg => {
            console.log('\n--- User Event ---')
            console.log('Type:', msg.eventType || msg.type)
            console.log(JSON.stringify(msg, null, 2))
        }),
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error('Connection timed out after ' + CONNECT_TIMEOUT_MS + 'ms')),
                CONNECT_TIMEOUT_MS,
            ),
        ),
    ])
    console.log('Connected.\n')

    // 2. Get current price for BTCUSDT to set a limit price far from market
    const prices = await client.prices({ symbol: 'BTCUSDT' })
    const currentPrice = parseFloat(prices.BTCUSDT)
    // Set limit buy 5% below market so it won't fill immediately
    const limitPrice = (currentPrice * 0.95).toFixed(2)

    console.log(`BTCUSDT current price: ${currentPrice}`)
    console.log(`Placing limit BUY at ${limitPrice}...\n`)

    // 3. Place a limit order
    const order = await client.order({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'LIMIT',
        quantity: '0.001',
        price: limitPrice,
    })
    console.log('Order placed:', {
        orderId: order.orderId,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        price: order.price,
        status: order.status,
    })

    // 4. Wait for events to come through, then cancel and clean up
    console.log('\nWaiting 5s for WebSocket events...')
    await new Promise(r => setTimeout(r, 5000))

    console.log('\nCancelling order...')
    try {
        const cancelled = await client.cancelOrder({
            symbol: 'BTCUSDT',
            orderId: order.orderId,
        })
        console.log('Cancelled:', cancelled.status)
    } catch (e) {
        console.log('Cancel error (order may have already been filled):', e.message)
    }

    // 5. Wait a bit more for the cancel event
    await new Promise(r => setTimeout(r, 2000))

    console.log('\nClosing WebSocket...')
    clean()
    console.log('Done.')
    process.exit(0)
}

main().catch(err => {
    console.error('Error:', err.message || err)
    process.exit(1)
})
