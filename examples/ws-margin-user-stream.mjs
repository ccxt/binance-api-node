/**
 * WebSocket Margin User Data Stream Example
 *
 * Connects to the cross-margin user data stream via WebSocket API
 * (listenToken method), places a margin limit order, and logs
 * the execution reports received.
 *
 * Usage:
 *   export BINANCE_APIKEY="..."
 *   export BINANCE_SECRET="..."
 *   node examples/ws-margin-user-stream.mjs
 *
 * For isolated margin, use client.ws.isolatedMarginUser() instead:
 *   client.ws.isolatedMarginUser({ symbol: 'BTCUSDT' }, msg => { ... })
 */

import BinanceModule from '../dist/index.js'
const Binance = BinanceModule.default

const client = Binance({
    apiKey: process.env.BINANCE_APIKEY,
    apiSecret: process.env.BINANCE_SECRET,
})

const CONNECT_TIMEOUT_MS = 15000

async function main() {
    // 1. Connect to margin user data stream with a timeout
    console.log('Connecting to margin user data stream...')
    const clean = await Promise.race([
        client.ws.marginUser(msg => {
            console.log('\n--- Margin User Event ---')
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

    // 2. Check margin balances and pick a viable order
    //    Tries to sell an asset we hold; amount is kept small to avoid fills.
    console.log('Checking margin account balances...')
    const account = await client.marginAccountInfo()
    const nonZero = account.userAssets.filter(a => parseFloat(a.free) > 0)
    nonZero.forEach(a => console.log(`  ${a.asset}: free ${a.free}`))

    // Candidate pairs: prefer selling a non-USDT asset we hold against USDT.
    // Quantity must clear the $5 min notional filter.
    const MIN_NOTIONAL = 5.5

    let symbol, side, limitPrice, quantity
    const allPrices = await client.prices()
    const freeUsdt = parseFloat(nonZero.find(a => a.asset === 'USDT')?.free || '0')

    // Assets to try (order of preference)
    const assets = ['ETH', 'BTC', 'SOL', 'BNB']

    for (const asset of assets) {
        const pair = `${asset}USDT`
        const price = parseFloat(allPrices[pair] || '0')
        if (!price) continue

        const bal = nonZero.find(a => a.asset === asset)
        const free = parseFloat(bal?.free || '0')
        // Compute the smallest qty that clears min notional, rounded up to 4 decimals
        const minQty = Math.ceil((MIN_NOTIONAL / price) * 10000) / 10000

        if (free >= minQty) {
            symbol = pair
            side = 'SELL'
            quantity = minQty.toFixed(4)
            limitPrice = (price * 1.05).toFixed(2)
            console.log(`\n  ${asset} free: ${free} >= ${minQty} — SELL ${pair} @ ${limitPrice}`)
            break
        }

        if (freeUsdt >= price * 0.95 * minQty) {
            symbol = pair
            side = 'BUY'
            quantity = minQty.toFixed(4)
            limitPrice = (price * 0.95).toFixed(2)
            console.log(`\n  USDT free: ${freeUsdt} — BUY ${pair} @ ${limitPrice}`)
            break
        }
    }

    if (!symbol) {
        console.log('\nNo sufficient balance found for any candidate pair.')
        console.log('Stream connection was successful. Transfer funds to cross-margin and retry.')
        clean()
        process.exit(0)
    }

    console.log(`Placing margin limit ${side} ${quantity} ${symbol} @ ${limitPrice}...`)

    // 3. Place a margin limit order
    const order = await client.marginOrder({
        symbol,
        side,
        type: 'LIMIT',
        quantity,
        price: limitPrice,
    })
    console.log('Margin order placed:', {
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
        const cancelled = await client.marginCancelOrder({
            symbol,
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
