import test from 'ava'

import Binance from 'index'

const client = Binance({proxy: "http://188.245.226.105:8911"})

test('[WS] customSubStream - single stream', t => {
    return new Promise(resolve => {
        const clean = client.ws.customSubStream('ethbtc@ticker', data => {
            t.truthy(data)
            t.truthy(data.e || data.stream)
            clean()
            resolve()
        })
    })
})

test('[WS] customSubStream - multiple streams', t => {
    return new Promise(resolve => {
        const streams = ['ethbtc@ticker', 'btcusdt@ticker']

        const clean = client.ws.customSubStream(streams, data => {
            t.truthy(data)
            clean()
            resolve()
        })
    })
})

test('[WS] customSubStream - depth stream', t => {
    return new Promise(resolve => {
        const clean = client.ws.customSubStream('ethbtc@depth', data => {
            t.truthy(data)
            t.truthy(data.e || data.lastUpdateId)
            clean()
            resolve()
        })
    })
})

test('[WS] customSubStream - aggTrade stream', t => {
    return new Promise(resolve => {
        const clean = client.ws.customSubStream('ethbtc@aggTrade', data => {
            t.truthy(data)
            t.truthy(data.e || data.a)
            clean()
            resolve()
        })
    })
})

test('[WS] customSubStream - kline stream', t => {
    return new Promise(resolve => {
        const clean = client.ws.customSubStream('ethbtc@kline_1m', data => {
            t.truthy(data)
            t.truthy(data.e || data.k)
            clean()
            resolve()
        })
    })
})

test('[WS] customSubStream - cleanup function', t => {
    const clean = client.ws.customSubStream('ethbtc@ticker', () => {
        // Callback implementation
    })

    // Verify clean is a function
    t.is(typeof clean, 'function')

    // Clean up immediately
    clean()

    // Give it a moment and verify cleanup executed properly
    return new Promise(resolve => {
        setTimeout(() => {
            t.pass('Cleanup function executed without errors')
            resolve()
        }, 100)
    })
})

test('[WS] futuresCustomSubStream - single stream', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresCustomSubStream('btcusdt@ticker', data => {
            t.truthy(data)
            t.truthy(data.e || data.stream)
            clean()
            resolve()
        })
    })
})

test('[WS] futuresCustomSubStream - aggTrade stream', t => {
    return new Promise(resolve => {
        const clean = client.ws.futuresCustomSubStream('btcusdt@aggTrade', data => {
            t.truthy(data)
            t.truthy(data.e || data.a)
            clean()
            resolve()
        })
    })
})

test.skip('[WS] deliveryCustomSubStream - single stream', t => {
    return new Promise(resolve => {
        const clean = client.ws.deliveryCustomSubStream('trxusd_perp@ticker', data => {
            t.truthy(data)
            t.truthy(data.e || data.stream)
            clean()
            resolve()
        })
    })
})

test('[WS] futuresCustomSubStream - cleanup function', t => {
    const clean = client.ws.futuresCustomSubStream('btcusdt@ticker', () => {
        // Callback implementation
    })

    // Verify clean is a function
    t.is(typeof clean, 'function')

    // Clean up immediately
    clean()

    // Give it a moment and verify cleanup executed properly
    return new Promise(resolve => {
        setTimeout(() => {
            t.pass('Cleanup function executed without errors')
            resolve()
        }, 100)
    })
})
