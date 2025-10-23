import ws from 'isomorphic-ws'
import ReconnectingWebSocket from 'reconnecting-websocket'

// Robust environment detection for Node.js vs Browser
const isNode = (() => {
    if (
        typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null
    ) {
        return true
    }
    if (typeof Deno !== 'undefined' && Deno.version != null) {
        return true
    }
    return false
})()

export default (url, opts) => {
    // Create a custom WebSocket constructor with proxy support if needed
    let WebSocketConstructor = ws

    // If proxy is provided and we're in Node.js environment, create a custom WebSocket class
    if (opts && opts.proxy && isNode) {
        // Dynamically require https-proxy-agent only in Node.js
        const { HttpsProxyAgent } = require('https-proxy-agent')
        const agent = new HttpsProxyAgent(opts.proxy)

        // Create a custom WebSocket class that passes the agent to the constructor
        WebSocketConstructor = class ProxiedWebSocket extends ws {
            constructor(address, protocols) {
                super(address, protocols, { agent })
            }
        }
    }

    const wsOptions = {
        WebSocket: WebSocketConstructor,
        connectionTimeout: 4e3,
        debug: false,
        maxReconnectionDelay: 10e3,
        maxRetries: Infinity,
        minReconnectionDelay: 4e3,
        ...opts,
    }

    const rws = new ReconnectingWebSocket(url, [], wsOptions)

    const pong = () => rws._ws.pong(() => null)

    rws.addEventListener('open', () => {
        // .on only works in node env, not in browser. https://github.com/Ashlar/binance-api-node/issues/404#issuecomment-833668033
        if (rws._ws.on) {
            rws._ws.on('ping', pong)
        }
    })

    return rws
}
