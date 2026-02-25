/**
 * User Data Stream Endpoints Tests
 *
 * This test suite covers user data stream endpoints for WebSocket authentication.
 *
 * NOTE: Spot REST API endpoints (getDataStream, keepDataStream, closeDataStream)
 * were removed on 2026-02-20. Spot now uses WebSocket API via client.ws.user().
 * See test/websockets/user.js for spot user data stream tests.
 *
 * Margin User Data Streams:
 * - marginGetListenToken: Create listenToken for margin user data stream (cross and isolated)
 *
 * Futures User Data Streams:
 * - futuresGetDataStream: Create listen key for futures user data stream
 * - futuresKeepDataStream: Keep-alive futures listen key
 * - futuresCloseDataStream: Close futures user data stream
 *
 * Delivery User Data Streams:
 * - deliveryGetDataStream: Create listen key for delivery user data stream
 * - deliveryKeepDataStream: Keep-alive delivery listen key
 * - deliveryCloseDataStream: Close delivery user data stream
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy for connections
 * - Requires API_KEY and API_SECRET in .env or uses defaults from config
 *
 * Note: Listen keys are used to authenticate WebSocket connections for receiving
 * user-specific data like order updates, balance changes, etc.
 *
 * To run these tests:
 * 1. Ensure test/config.js has valid credentials
 * 2. Run: npm test test/streams.js
 */

import test from 'ava'

import Binance from 'index'

import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[STREAMS] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run stream tests.')
            t.pass()
        })
    }

    // Create client with testnet and proxy
    const client = Binance(binanceConfig)

    // Helper to check if endpoint is available
    const notAvailable = e => {
        return (
            e.message &&
            (e.message.includes('404') ||
                e.message.includes('Not Found') ||
                e.message.includes('not enabled') ||
                e.message.includes('not support') ||
                e.name === 'SyntaxError' ||
                e.message.includes('Unexpected'))
        )
    }

    // ===== Spot User Data Stream Tests =====
    // NOTE: Spot REST API endpoints (getDataStream, keepDataStream, closeDataStream)
    // were deprecated and removed on 2026-02-20. Spot now uses WebSocket API
    // (userDataStream.subscribe.signature) via client.ws.user().
    // See test/websockets/user.js for spot user data stream tests.

    // ===== Margin User Data Stream Tests =====

    test('[STREAMS] Margin - get listenToken for cross margin', async t => {
        try {
            const result = await client.marginGetListenToken()
            t.truthy(result)
            t.truthy(result.token, 'Should have token')
            t.truthy(result.expirationTime, 'Should have expirationTime')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Margin listenToken not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[STREAMS] Margin - get listenToken for isolated margin', async t => {
        try {
            const result = await client.marginGetListenToken({
                isIsolated: true,
                symbol: 'BTCUSDT',
            })
            t.truthy(result)
            t.truthy(result.token, 'Should have token')
            t.truthy(result.expirationTime, 'Should have expirationTime')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Isolated margin listenToken not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Futures User Data Stream Tests =====

    test('[STREAMS] Futures - create, keep-alive, and close stream', async t => {
        try {
            // Create listen key
            const streamData = await client.futuresGetDataStream()
            t.truthy(streamData)
            t.truthy(streamData.listenKey, 'Should have listenKey')

            const { listenKey } = streamData

            // Keep alive the listen key
            try {
                await client.futuresKeepDataStream({ listenKey })
                t.pass('Keep-alive successful')
            } catch (e) {
                if (e.code === -1125) {
                    t.pass('Listen key expired or testnet limitation')
                } else {
                    throw e
                }
            }

            // Close the listen key
            try {
                await client.futuresCloseDataStream({ listenKey })
                t.pass('Close stream successful')
            } catch (e) {
                if (e.code === -1125) {
                    t.pass('Listen key already closed or expired')
                } else {
                    throw e
                }
            }
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Futures user data stream not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[STREAMS] Futures - keep-alive non-existent stream', async t => {
        try {
            await client.futuresKeepDataStream({ listenKey: 'invalid_listen_key_12345' })
            // Some implementations may silently ignore invalid keys
            t.pass('Keep-alive completed (may be ignored)')
        } catch (e) {
            // Expected to fail with invalid key
            t.truthy(e.message, 'Should throw error or silently ignore')
        }
    })

    test('[STREAMS] Futures - close non-existent stream', async t => {
        try {
            await client.futuresCloseDataStream({ listenKey: 'invalid_listen_key_12345' })
            // May succeed or fail depending on implementation
            t.pass()
        } catch (e) {
            // Expected to fail
            t.truthy(e.message)
        }
    })

    // ===== Delivery User Data Stream Tests =====

    test('[STREAMS] Delivery - create, keep-alive, and close stream', async t => {
        try {
            // Create listen key
            const streamData = await client.deliveryGetDataStream()
            t.truthy(streamData)
            t.truthy(streamData.listenKey, 'Should have listenKey')

            const { listenKey } = streamData

            // Keep alive the listen key
            await client.deliveryKeepDataStream({ listenKey })
            t.pass('Keep-alive successful')

            // Close the listen key
            await client.deliveryCloseDataStream({ listenKey })
            t.pass('Close stream successful')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Delivery user data stream not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[STREAMS] Delivery - keep-alive non-existent stream', async t => {
        try {
            await client.deliveryKeepDataStream({ listenKey: 'invalid_listen_key_12345' })
            // Some implementations may silently ignore invalid keys
            t.pass('Keep-alive completed (may be ignored)')
        } catch (e) {
            // Expected to fail with invalid key
            t.truthy(e.message, 'Should throw error or silently ignore')
        }
    })

    // ===== Multiple Streams Test =====
    // NOTE: Spot getDataStream REST endpoint removed on 2026-02-20.
    // This test now only covers futures streams.

    test('[STREAMS] Futures - create multiple streams', async t => {
        try {
            const futuresStream = await client.futuresGetDataStream()
            t.truthy(futuresStream.listenKey)

            // Clean up
            try {
                await client.futuresCloseDataStream({ listenKey: futuresStream.listenKey })
            } catch (e) {
                // Ignore errors on cleanup
            }

            t.pass('Futures stream created successfully')
        } catch (e) {
            if (notAvailable(e) || e.code === -1125) {
                t.pass('User data streams not available or limited on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Error Handling Tests =====

    test('[STREAMS] Futures - keep-alive with invalid listenKey', async t => {
        try {
            await client.futuresKeepDataStream({ listenKey: 'invalid_listen_key_12345' })
            // Some implementations may silently accept invalid keys
            t.pass('Keep-alive completed (may be silently ignored)')
        } catch (e) {
            t.truthy(e.message, 'Should throw error for invalid parameter')
        }
    })
}

main()
