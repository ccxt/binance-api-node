import test from 'ava'
import { chromium } from 'playwright'

let browser
let context
let page

test.before(async () => {
    // Launch browser with proper settings for WebSocket
    browser = await chromium.launch({
        headless: true,
    })

    context = await browser.newContext({
        ignoreHTTPSErrors: true,
    })

    page = await context.newPage()

    // Navigate to example.com to have a secure context
    await page.goto('https://example.com')
})

test.after.always(async () => {
    if (context) await context.close()
    if (browser) await browser.close()
})

test.serial('[Browser WebSocket] Connect to Binance ticker stream', async t => {
    // Test WebSocket connection in browser
    const result = await page.evaluate(`
        (async function() {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: No message received within 10 seconds'))
                }, 10000)

                try {
                    // Check WebSocket API availability
                    if (typeof WebSocket === 'undefined') {
                        clearTimeout(timeout)
                        reject(new Error('WebSocket API not available'))
                        return
                    }

                    // Connect to Binance public WebSocket
                    const symbol = 'btcusdt'
                    const ws = new WebSocket('wss://stream.binance.com:9443/ws/' + symbol + '@ticker')

                    let messageReceived = false

                    ws.onopen = function() {
                        // Connection established
                    }

                    ws.onmessage = function(event) {
                        if (!messageReceived) {
                            messageReceived = true
                            clearTimeout(timeout)

                            try {
                                const data = JSON.parse(event.data)

                                // Validate data structure
                                const hasRequiredFields = !!(
                                    data.s && // symbol
                                    data.c && // close price
                                    data.h && // high price
                                    data.l && // low price
                                    data.v    // volume
                                )

                                ws.close(1000, 'Test completed')

                                resolve({
                                    success: true,
                                    symbol: data.s,
                                    lastPrice: data.c,
                                    high: data.h,
                                    low: data.l,
                                    volume: data.v,
                                    hasRequiredFields: hasRequiredFields,
                                    rawDataSample: {
                                        eventType: data.e,
                                        eventTime: data.E,
                                        symbol: data.s,
                                        priceChange: data.p,
                                        priceChangePercent: data.P
                                    }
                                })
                            } catch (error) {
                                ws.close()
                                reject(new Error('Failed to parse ticker data: ' + error.message))
                            }
                        }
                    }

                    ws.onerror = function(error) {
                        clearTimeout(timeout)
                        ws.close()
                        reject(new Error('WebSocket error: ' + (error.message || 'Unknown error')))
                    }

                    ws.onclose = function(event) {
                        if (!messageReceived) {
                            clearTimeout(timeout)
                            reject(new Error('Connection closed before receiving data'))
                        }
                    }
                } catch (error) {
                    clearTimeout(timeout)
                    reject(error)
                }
            })
        })()
    `)

    // Assertions
    t.truthy(result.success, 'WebSocket connection should succeed')
    t.truthy(result.symbol, 'Should receive symbol data')
    t.truthy(result.lastPrice, 'Should receive last price')
    t.truthy(result.high, 'Should receive high price')
    t.truthy(result.low, 'Should receive low price')
    t.truthy(result.volume, 'Should receive volume')
    t.true(result.hasRequiredFields, 'Should have all required ticker fields')

    // Log received data for verification
    t.log('Received ticker data:')
    t.log(`  Symbol: ${result.symbol}`)
    t.log(`  Last Price: ${result.lastPrice}`)
    t.log(`  24h High: ${result.high}`)
    t.log(`  24h Low: ${result.low}`)
    t.log(`  24h Volume: ${result.volume}`)
})

test.serial('[Browser WebSocket] Handle connection close gracefully', async t => {
    const result = await page.evaluate(`
        (async function() {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for close event'))
                }, 5000)

                const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker')

                let opened = false
                let closed = false

                ws.onopen = function() {
                    opened = true
                    // Close immediately after opening
                    ws.close(1000, 'Intentional close')
                }

                ws.onclose = function(event) {
                    closed = true
                    clearTimeout(timeout)
                    resolve({
                        opened: opened,
                        closed: closed,
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean
                    })
                }

                ws.onerror = function() {
                    clearTimeout(timeout)
                    resolve({
                        opened: opened,
                        closed: closed,
                        error: true
                    })
                }
            })
        })()
    `)

    t.true(result.opened, 'Connection should open')
    t.true(result.closed, 'Connection should close')
    t.is(result.code, 1000, 'Should close with normal closure code')
    t.true(result.wasClean, 'Should close cleanly')
})

test.serial('[Browser WebSocket] Receive multiple ticker updates', async t => {
    const result = await page.evaluate(`
        (async function() {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    ws.close()
                    reject(new Error('Timeout waiting for messages'))
                }, 15000)

                const messages = []
                const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker')

                ws.onmessage = function(event) {
                    try {
                        const data = JSON.parse(event.data)
                        messages.push({
                            symbol: data.s,
                            price: data.c,
                            timestamp: data.E
                        })

                        // Collect 3 messages then close
                        if (messages.length >= 3) {
                            clearTimeout(timeout)
                            ws.close(1000, 'Test completed')
                            resolve({
                                success: true,
                                messageCount: messages.length,
                                messages: messages,
                                pricesReceived: messages.map(function(m) { return m.price })
                            })
                        }
                    } catch (error) {
                        clearTimeout(timeout)
                        ws.close()
                        reject(error)
                    }
                }

                ws.onerror = function(error) {
                    clearTimeout(timeout)
                    reject(error)
                }
            })
        })()
    `)

    t.true(result.success, 'Should receive multiple messages')
    t.is(result.messageCount, 3, 'Should receive exactly 3 messages')
    t.is(result.pricesReceived.length, 3, 'Should have 3 price updates')
    t.truthy(result.messages[0].symbol, 'Each message should have symbol')
    t.truthy(result.messages[0].price, 'Each message should have price')
    t.truthy(result.messages[0].timestamp, 'Each message should have timestamp')

    t.log(`Received ${result.messageCount} ticker updates`)
    t.log(`Prices: ${result.pricesReceived.join(', ')}`)
})
