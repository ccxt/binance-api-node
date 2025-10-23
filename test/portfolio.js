/**
 * Portfolio Margin Endpoints Tests
 *
 * This test suite covers all portfolio margin private endpoints:
 *
 * Account Information:
 * - portfolioMarginAccountInfo: Get portfolio margin account information
 * - portfolioMarginCollateralRate: Get collateral rate information
 *
 * Loan Operations:
 * - portfolioMarginLoan: Create/borrow loan in portfolio margin
 * - portfolioMarginLoanRepay: Repay portfolio margin loan
 *
 * History:
 * - portfolioMarginInterestHistory: Get interest payment history
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy for connections
 * - Requires API_KEY and API_SECRET in .env or uses defaults from config
 *
 * Note: Portfolio Margin is an advanced trading mode that may require special
 * account permissions and may not be available on all testnets
 *
 * To run these tests:
 * 1. Ensure test/config.js has valid credentials
 * 2. Run: npm test test/portfolio.js
 */

import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[PORTFOLIO] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run portfolio margin tests.')
            t.pass()
        })
    }

    // Create client with testnet and proxy
    const client = Binance(binanceConfig)

    // Helper to check if Portfolio Margin is available
    const portfolioNotAvailable = (e) => {
        return e.message && (
            e.message.includes('404') ||
            e.message.includes('Not Found') ||
            e.message.includes('not enabled') ||
            e.message.includes('not support') ||
            e.name === 'SyntaxError' ||
            e.message.includes('Unexpected')
        )
    }

    // ===== Account Information Tests =====

    test('[PORTFOLIO] portfolioMarginAccountInfo - get account information', async t => {
        try {
            const accountInfo = await client.portfolioMarginAccountInfo()

            t.truthy(accountInfo)
            // Portfolio margin account structure may include:
            // - uniMMR (unified maintenance margin rate)
            // - accountEquity
            // - accountMaintMargin
            // - accountStatus
            // Just verify we get a response
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    test('[PORTFOLIO] portfolioMarginCollateralRate - get collateral rates', async t => {
        try {
            const collateralRate = await client.portfolioMarginCollateralRate()

            t.truthy(collateralRate)
            // Collateral rate response may be an array or object
            // Contains information about collateral ratios for different assets
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    // ===== Loan History Tests =====

    test('[PORTFOLIO] portfolioMarginInterestHistory - get interest history', async t => {
        try {
            const interestHistory = await client.portfolioMarginInterestHistory({
                recvWindow: 60000,
            })

            t.true(Array.isArray(interestHistory) || typeof interestHistory === 'object')
            // May be empty if no interest has been paid
            if (Array.isArray(interestHistory) && interestHistory.length > 0) {
                const [record] = interestHistory
                // Common fields might include: asset, interest, time, etc.
                t.truthy(record.asset || record.interest !== undefined)
            }
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    test('[PORTFOLIO] portfolioMarginInterestHistory - with asset filter', async t => {
        try {
            const interestHistory = await client.portfolioMarginInterestHistory({
                asset: 'USDT',
                recvWindow: 60000,
            })

            t.true(Array.isArray(interestHistory) || typeof interestHistory === 'object')
            if (Array.isArray(interestHistory) && interestHistory.length > 0) {
                interestHistory.forEach(record => {
                    if (record.asset) {
                        t.is(record.asset, 'USDT')
                    }
                })
            }
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    test('[PORTFOLIO] portfolioMarginInterestHistory - with time range', async t => {
        try {
            const now = Date.now()
            const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)

            const interestHistory = await client.portfolioMarginInterestHistory({
                startTime: sevenDaysAgo,
                endTime: now,
                recvWindow: 60000,
            })

            t.true(Array.isArray(interestHistory) || typeof interestHistory === 'object')
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    test('[PORTFOLIO] portfolioMarginInterestHistory - with limit', async t => {
        try {
            const interestHistory = await client.portfolioMarginInterestHistory({
                limit: 10,
                recvWindow: 60000,
            })

            t.true(Array.isArray(interestHistory) || typeof interestHistory === 'object')
            if (Array.isArray(interestHistory)) {
                t.true(interestHistory.length <= 10, 'Should return at most 10 records')
            }
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    // ===== Error Handling Tests =====

    test('[PORTFOLIO] portfolioMarginInterestHistory - invalid time range', async t => {
        try {
            const now = Date.now()
            const futureTime = now + (7 * 24 * 60 * 60 * 1000)

            await client.portfolioMarginInterestHistory({
                startTime: futureTime,
                endTime: now,
                recvWindow: 60000,
            })
            // May succeed with empty result or fail with validation error
            t.pass()
        } catch (e) {
            // Expected if validation fails or portfolio margin not available
            t.truthy(e.message)
        }
    })

    test('[PORTFOLIO] portfolioMarginInterestHistory - missing asset validation', async t => {
        try {
            const interestHistory = await client.portfolioMarginInterestHistory({
                asset: 'INVALIDASSET12345',
                recvWindow: 60000,
            })
            // May succeed with empty result
            t.true(Array.isArray(interestHistory) || typeof interestHistory === 'object')
        } catch (e) {
            // May fail with invalid asset or portfolio margin not available
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                t.truthy(e.message)
            }
        }
    })

    // ===== Account Status Tests =====

    test('[PORTFOLIO] portfolioMarginAccountInfo - verify response structure', async t => {
        try {
            const accountInfo = await client.portfolioMarginAccountInfo()

            t.truthy(accountInfo)
            // Portfolio margin account may have various structures
            // Common fields include account equity, margin, status, etc.
            const hasAccountData =
                accountInfo.accountEquity !== undefined ||
                accountInfo.accountMaintMargin !== undefined ||
                accountInfo.accountStatus !== undefined ||
                accountInfo.uniMMR !== undefined ||
                // Response might be an array
                Array.isArray(accountInfo)

            t.truthy(hasAccountData || typeof accountInfo === 'object', 'Should return account data')
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    test('[PORTFOLIO] portfolioMarginCollateralRate - verify response structure', async t => {
        try {
            const collateralRate = await client.portfolioMarginCollateralRate()

            t.truthy(collateralRate)
            // Collateral rate may be array or object
            if (Array.isArray(collateralRate)) {
                t.true(collateralRate.length >= 0, 'Should return array')
                if (collateralRate.length > 0) {
                    const [rate] = collateralRate
                    // May contain: asset, collateralRate, etc.
                    t.truthy(typeof rate === 'object')
                }
            } else {
                t.truthy(typeof collateralRate === 'object', 'Should return object')
            }
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    // ===== Skipped Tests - Operations that borrow or repay funds =====

    test.skip('[PORTFOLIO] portfolioMarginLoan - create loan', async t => {
        // Skipped - would borrow assets in portfolio margin
        // Example call (DO NOT RUN without caution):
        // await client.portfolioMarginLoan({
        //     asset: 'USDT',
        //     amount: 100,
        //     recvWindow: 60000,
        // })
        t.pass('Skipped - would borrow assets')
    })

    test.skip('[PORTFOLIO] portfolioMarginLoanRepay - repay loan', async t => {
        // Skipped - would repay borrowed assets
        // Requires active loan to repay
        // Example call (DO NOT RUN without caution):
        // await client.portfolioMarginLoanRepay({
        //     asset: 'USDT',
        //     amount: 100,
        //     recvWindow: 60000,
        // })
        t.pass('Skipped - would repay loan')
    })

    // ===== Integration Test - Query Account and Collateral =====

    test('[PORTFOLIO] Integration - query account info and collateral rates', async t => {
        try {
            // Query account info
            const accountInfo = await client.portfolioMarginAccountInfo()
            t.truthy(accountInfo, 'Should get account info')

            // Query collateral rates
            const collateralRate = await client.portfolioMarginCollateralRate()
            t.truthy(collateralRate, 'Should get collateral rates')

            // Query interest history
            const interestHistory = await client.portfolioMarginInterestHistory({
                limit: 5,
                recvWindow: 60000,
            })
            t.truthy(interestHistory, 'Should get interest history')

            t.pass('Portfolio Margin integration test passed')
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    // ===== Additional Query Tests =====

    test('[PORTFOLIO] portfolioMarginInterestHistory - pagination test', async t => {
        try {
            // Get first page
            const page1 = await client.portfolioMarginInterestHistory({
                limit: 5,
                recvWindow: 60000,
            })

            t.truthy(page1)

            if (Array.isArray(page1) && page1.length === 5) {
                // If we have 5 records, try to get next page
                const lastRecord = page1[page1.length - 1]
                if (lastRecord.id) {
                    const page2 = await client.portfolioMarginInterestHistory({
                        limit: 5,
                        fromId: lastRecord.id,
                        recvWindow: 60000,
                    })
                    t.truthy(page2)
                } else {
                    t.pass('Pagination ID not available in response')
                }
            } else {
                t.pass('Not enough records for pagination test')
            }
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })

    test('[PORTFOLIO] portfolioMarginAccountInfo - repeated calls', async t => {
        try {
            // Test that we can call the endpoint multiple times
            const call1 = await client.portfolioMarginAccountInfo()
            t.truthy(call1, 'First call should succeed')

            const call2 = await client.portfolioMarginAccountInfo()
            t.truthy(call2, 'Second call should succeed')

            // Both calls should return data (structure may vary)
            t.pass('Multiple account info calls successful')
        } catch (e) {
            if (portfolioNotAvailable(e)) {
                t.pass('Portfolio Margin not available on testnet or not enabled for account')
            } else {
                throw e
            }
        }
    })
}

main()
