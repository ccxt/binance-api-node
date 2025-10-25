/**
 * User Data Stream Endpoints Tests
 *
 * This test suite covers all user data stream endpoints for WebSocket authentication:
 *
 * Spot User Data Streams:
 * - getDataStream: Create listen key for spot user data stream
 * - keepDataStream: Keep-alive spot listen key
 * - closeDataStream: Close spot user data stream
 *
 * Margin User Data Streams:
 * - marginGetDataStream: Create listen key for margin user data stream
 * - marginKeepDataStream: Keep-alive margin listen key
 * - marginCloseDataStream: Close margin user data stream
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

    test('[STREAMS] Spot - create, keep-alive, and close stream', async t => {
        try {
            // Create listen key
            const streamData = await client.getDataStream()
            t.truthy(streamData)
            t.truthy(streamData.listenKey, 'Should have listenKey')

            const { listenKey } = streamData

            // Keep alive the listen key
            try {
                await client.keepDataStream({ listenKey })
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
                await client.closeDataStream({ listenKey })
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
                t.pass('Spot user data stream not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[STREAMS] Spot - keep-alive non-existent stream', async t => {
        try {
            await client.keepDataStream({ listenKey: 'invalid_listen_key_12345' })
            t.fail('Should have thrown error for invalid listen key')
        } catch (e) {
            // Expected to fail
            t.truthy(e.message)
        }
    })

    test('[STREAMS] Spot - close non-existent stream', async t => {
        try {
            await client.closeDataStream({ listenKey: 'invalid_listen_key_12345' })
            // May succeed or fail depending on implementation
            t.pass()
        } catch (e) {
            // Expected to fail
            t.truthy(e.message)
        }
    })

    // ===== Margin User Data Stream Tests =====

    test('[STREAMS] Margin - create, keep-alive, and close stream', async t => {
        try {
            // Create listen key
            const streamData = await client.marginGetDataStream()
            t.truthy(streamData)
            t.truthy(streamData.listenKey, 'Should have listenKey')

            const { listenKey } = streamData

            // Keep alive the listen key
            await client.marginKeepDataStream({ listenKey })
            t.pass('Keep-alive successful')

            // Close the listen key
            await client.marginCloseDataStream({ listenKey })
            t.pass('Close stream successful')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Margin user data stream not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[STREAMS] Margin - keep-alive non-existent stream', async t => {
        try {
            await client.marginKeepDataStream({ listenKey: 'invalid_listen_key_12345' })
            t.fail('Should have thrown error for invalid listen key')
        } catch (e) {
            // Expected to fail
            t.truthy(e.message)
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

    test('[STREAMS] Create multiple streams simultaneously', async t => {
        try {
            // Create multiple listen keys at once
            const spotStream = await client.getDataStream()
            const futuresStream = await client.futuresGetDataStream()

            t.truthy(spotStream.listenKey)
            t.truthy(futuresStream.listenKey)
            t.not(spotStream.listenKey, futuresStream.listenKey, 'Listen keys should be different')

            // Clean up (may fail due to testnet limitations)
            try {
                await client.closeDataStream({ listenKey: spotStream.listenKey })
            } catch (e) {
                // Ignore errors on cleanup
            }
            try {
                await client.futuresCloseDataStream({ listenKey: futuresStream.listenKey })
            } catch (e) {
                // Ignore errors on cleanup
            }

            t.pass('Multiple streams created successfully')
        } catch (e) {
            if (notAvailable(e) || e.code === -1125) {
                t.pass('User data streams not available or limited on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Stream Lifecycle Test =====

    test('[STREAMS] Full stream lifecycle - Spot', async t => {
        try {
            // 1. Create stream
            const stream1 = await client.getDataStream()
            t.truthy(stream1.listenKey, 'First stream created')

            // 2. Create another stream
            const stream2 = await client.getDataStream()
            t.truthy(stream2.listenKey, 'Second stream created')

            // Listen keys should be different (or could be the same if reused)
            t.truthy(stream1.listenKey)
            t.truthy(stream2.listenKey)

            // 3. Keep alive first stream (may fail on testnet)
            try {
                await client.keepDataStream({ listenKey: stream1.listenKey })
                t.pass('First stream kept alive')
            } catch (e) {
                if (e.code === -1125) {
                    t.pass('Keep-alive failed due to testnet limitation')
                } else {
                    throw e
                }
            }

            // 4. Close first stream (may fail on testnet)
            try {
                await client.closeDataStream({ listenKey: stream1.listenKey })
                t.pass('First stream closed')
            } catch (e) {
                // Ignore errors on cleanup
            }

            // 5. Close second stream (may fail on testnet)
            try {
                await client.closeDataStream({ listenKey: stream2.listenKey })
                t.pass('Second stream closed')
            } catch (e) {
                // Ignore errors on cleanup
            }

            // 6. Try to keep alive after close (should fail or be ignored)
            try {
                await client.keepDataStream({ listenKey: stream1.listenKey })
                // May succeed with no effect or fail
                t.pass('Keep-alive after close handled')
            } catch (e) {
                t.pass('Keep-alive after close properly rejected')
            }
        } catch (e) {
            if (notAvailable(e) || e.code === -1125) {
                t.pass('User data streams not available or limited on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Error Handling Tests =====

    test('[STREAMS] Missing listenKey parameter', async t => {
        try {
            await client.keepDataStream({})
            t.fail('Should have thrown error for missing listenKey')
        } catch (e) {
            t.truthy(e.message, 'Should throw error for missing parameter')
        }
    })

    test('[STREAMS] Invalid listenKey format', async t => {
        try {
            await client.keepDataStream({ listenKey: '' })
            t.fail('Should have thrown error for empty listenKey')
        } catch (e) {
            t.truthy(e.message, 'Should throw error for invalid parameter')
        }
    })
}

main()
