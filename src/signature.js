// Robust environment detection for Node.js vs Browser
const isNode = (() => {
    // Check for Node.js specific features
    if (
        typeof process !== 'undefined' &&
        process.versions !== null &&
        process.versions.node !== null
    ) {
        return true
    }
    // Check for Deno
    /* eslint-disable no-undef */
    if (typeof Deno !== 'undefined' && Deno.version !== null) {
        return true
    }
    /* eslint-enable no-undef */
    // Browser or Web Worker
    return false
})()

// Platform-specific imports
let nodeCrypto

if (isNode) {
    // Node.js environment
    nodeCrypto = require('crypto')
}

/**
 * Create HMAC-SHA256 signature - works in both Node.js and browsers
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {Promise<string>} Hex-encoded signature
 */
export const createHmacSignature = async (data, secret) => {
    if (isNode) {
        // Node.js - synchronous crypto
        return nodeCrypto.createHmac('sha256', secret).update(data).digest('hex')
    }
    // Browser - Web Crypto API (async)
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(data)

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    )

    const signature = await crypto.subtle.sign('HMAC', key, messageData)

    // Convert ArrayBuffer to hex string
    /* eslint-disable no-undef */
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    /* eslint-enable no-undef */
}
