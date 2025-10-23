/**
 * Shared Test Configuration
 *
 * This file contains common configuration used across all test files.
 * It provides default test credentials for Binance testnet and proxy settings.
 *
 * Environment Variables (optional):
 * - API_KEY: Your Binance testnet API key
 * - API_SECRET: Your Binance testnet API secret
 * - PROXY_URL: Your proxy server URL
 *
 * If environment variables are not set, default test credentials will be used.
 */

import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

/**
 * Default proxy URL for tests
 */
export const proxyUrl = process.env.PROXY_URL || 'http://188.245.226.105:8911'

/**
 * Binance test configuration (without authentication)
 * Use this for public API tests that don't require API keys
 */
export const binancePublicConfig = {
    proxy: proxyUrl,
}

/**
 * Binance test configuration (with authentication)
 * Uses testnet for safe testing without affecting real accounts
 */
export const binanceConfig = {
    apiKey: process.env.API_KEY || 'tiNOK2SOi6RRGnvGrP606ZlrpvwHu5vVxbGB8G9RAWQlpDPwAhgZoYus7Dsscj7P',
    apiSecret:
        process.env.API_SECRET || 'rtIwFZWUY6cYwraGGdgoaKAhL87E5ycrgqewAe47YflfXHsiivfocbasCBD8j7Yc',
    proxy: proxyUrl,
    testnet: true,
}

/**
 * Check if test credentials are configured
 * @returns {boolean} True if either env vars or defaults are available
 */
export const hasTestCredentials = () => {
    return Boolean(binanceConfig.apiKey && binanceConfig.apiSecret)
}

/**
 * Check if using custom credentials (from env vars)
 * @returns {boolean} True if using environment variables
 */
export const isUsingCustomCredentials = () => {
    return Boolean(process.env.API_KEY && process.env.API_SECRET)
}
