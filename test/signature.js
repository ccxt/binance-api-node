import test from 'ava'
import { createHmacSignature } from 'signature'

test('[CRYPTO] createHmacSignature - basic signature generation', async t => {
    const data = 'symbol=BTCUSDT&timestamp=1234567890'
    const secret = 'test-secret'

    const signature = await createHmacSignature(data, secret)

    t.truthy(signature, 'Signature should be generated')
    t.is(typeof signature, 'string', 'Signature should be a string')
    t.is(signature.length, 64, 'SHA256 signature should be 64 hex characters')
    t.regex(signature, /^[0-9a-f]{64}$/, 'Signature should be hex encoded')
})

test('[CRYPTO] createHmacSignature - consistent output', async t => {
    const data = 'symbol=ETHBTC&side=BUY&quantity=1'
    const secret = 'my-api-secret'

    const signature1 = await createHmacSignature(data, secret)
    const signature2 = await createHmacSignature(data, secret)

    t.is(
        signature1,
        signature2,
        'Same input should always produce the same signature (deterministic)',
    )
})

test('[CRYPTO] createHmacSignature - different data produces different signature', async t => {
    const secret = 'test-secret'

    const signature1 = await createHmacSignature('data1', secret)
    const signature2 = await createHmacSignature('data2', secret)

    t.not(signature1, signature2, 'Different data should produce different signatures')
})

test('[CRYPTO] createHmacSignature - different secret produces different signature', async t => {
    const data = 'symbol=BTCUSDT&timestamp=1234567890'

    const signature1 = await createHmacSignature(data, 'secret1')
    const signature2 = await createHmacSignature(data, 'secret2')

    t.not(signature1, signature2, 'Different secrets should produce different signatures')
})

test('[CRYPTO] createHmacSignature - handles empty string', async t => {
    const signature = await createHmacSignature('', 'test-secret')

    t.truthy(signature, 'Should handle empty data string')
    t.is(signature.length, 64, 'Should still produce valid 64-char hex signature')
})

test('[CRYPTO] createHmacSignature - handles special characters', async t => {
    const data = 'symbol=BTC-USDT&special=!@#$%^&*()'
    const secret = 'test-secret-with-special-chars-!@#'

    const signature = await createHmacSignature(data, secret)

    t.truthy(signature, 'Should handle special characters')
    t.is(signature.length, 64, 'Should produce valid signature')
})

test('[CRYPTO] createHmacSignature - handles unicode characters', async t => {
    const data = 'symbol=BTCUSDT&note=こんにちは世界'
    const secret = 'test-secret'

    const signature = await createHmacSignature(data, secret)

    t.truthy(signature, 'Should handle unicode characters')
    t.is(signature.length, 64, 'Should produce valid signature')
})

test('[CRYPTO] createHmacSignature - known test vector', async t => {
    // Test with a known HMAC-SHA256 value to ensure correctness
    // This example is from RFC 4231 test case 2 (truncated key)
    const data = 'what do ya want for nothing?'
    const secret = 'Jefe'

    const signature = await createHmacSignature(data, secret)

    // Expected HMAC-SHA256 for this data+secret combination
    const expected = '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843'

    t.is(signature, expected, 'Should produce correct HMAC-SHA256 signature')
})

test('[CRYPTO] createHmacSignature - typical Binance query string', async t => {
    const data =
        'symbol=LTCBTC&side=BUY&type=LIMIT&timeInForce=GTC&quantity=1&price=0.1&recvWindow=5000&timestamp=1499827319559'
    const secret = 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j'

    const signature = await createHmacSignature(data, secret)

    // This is the expected signature from Binance API documentation example
    const expected = 'c8db56825ae71d6d79447849e617115f4a920fa2acdcab2b053c4b2838bd6b71'

    t.is(signature, expected, 'Should match Binance API documentation example')
})

test('[CRYPTO] createHmacSignature - returns promise', async t => {
    const result = createHmacSignature('test', 'secret')

    t.true(result instanceof Promise, 'Should return a Promise')

    const signature = await result
    t.truthy(signature, 'Promise should resolve to a signature')
})
