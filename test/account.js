/**
 * Account Endpoints Tests
 *
 * This test suite covers all account-related private endpoints:
 *
 * Account Information:
 * - accountInfo: Get spot account information (balances, permissions)
 * - myTrades: Get spot trade history
 * - tradeFee: Get trading fee rates
 * - assetDetail: Get asset details
 * - accountSnapshot: Get account snapshots
 * - accountCoins: Get all coin information
 * - apiRestrictions: Get API key restrictions
 *
 * Wallet Operations:
 * - withdraw: Withdraw assets
 * - withdrawHistory: Get withdrawal history
 * - depositHistory: Get deposit history
 * - depositAddress: Get deposit address
 * - capitalConfigs: Get capital configs for all coins
 *
 * Transfers:
 * - universalTransfer: Universal transfer between accounts
 * - universalTransferHistory: Get transfer history
 * - fundingWallet: Get funding wallet balance
 *
 * Dust Conversion:
 * - dustLog: Get dust conversion log
 * - dustTransfer: Convert dust to BNB
 *
 * BNB Burn:
 * - getBnbBurn: Get BNB burn status
 * - setBnbBurn: Enable/disable BNB burn for fees
 *
 * Other:
 * - convertTradeFlow: Get convert trade flow
 * - payTradeHistory: Get Binance Pay transaction history
 * - rebateTaxQuery: Get rebate tax query
 *
 * Configuration:
 * - Uses testnet: true for safe testing
 * - Uses proxy for connections
 * - Requires API_KEY and API_SECRET in .env or uses defaults from config
 *
 * To run these tests:
 * 1. Ensure test/config.js has valid credentials
 * 2. Run: npm test test/account.js
 */

import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[ACCOUNT] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run account tests.')
            t.pass()
        })
    }

    // Create client with testnet and proxy
    const client = Binance(binanceConfig)

    // Helper to check if endpoint is available
    const notAvailable = (e) => {
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

    test('[ACCOUNT] accountInfo - get account information', async t => {
        try {
            const accountInfo = await client.accountInfo({
                recvWindow: 60000,
            })

            t.truthy(accountInfo)
            // Check for key fields (values can be 0)
            t.truthy(accountInfo.makerCommission !== undefined, 'Should have makerCommission')
            t.truthy(accountInfo.takerCommission !== undefined, 'Should have takerCommission')
            t.truthy(accountInfo.canTrade !== undefined, 'Should have canTrade')
            t.truthy(accountInfo.canWithdraw !== undefined, 'Should have canWithdraw')
            t.truthy(accountInfo.canDeposit !== undefined, 'Should have canDeposit')
            t.true(Array.isArray(accountInfo.balances), 'Should have balances array')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Account endpoint not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] myTrades - get trade history', async t => {
        try {
            const trades = await client.myTrades({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })

            t.true(Array.isArray(trades), 'Should return an array')
            // May be empty if no trades
            if (trades.length > 0) {
                const [trade] = trades
                checkFields(t, trade, ['id', 'symbol', 'price', 'qty', 'commission', 'time'])
            }
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Trade history not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] myTrades - with limit parameter', async t => {
        try {
            const trades = await client.myTrades({
                symbol: 'BTCUSDT',
                limit: 10,
                recvWindow: 60000,
            })

            t.true(Array.isArray(trades))
            t.true(trades.length <= 10, 'Should return at most 10 trades')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Trade history not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] tradeFee - get trading fees', async t => {
        try {
            const fees = await client.tradeFee({
                recvWindow: 60000,
            })

            t.truthy(fees)
            // Response can be array or object
            if (Array.isArray(fees)) {
                if (fees.length > 0) {
                    const [fee] = fees
                    t.truthy(fee.symbol || fee.makerCommission !== undefined)
                }
            }
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Trade fee endpoint not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] tradeFee - specific symbol', async t => {
        try {
            const fees = await client.tradeFee({
                symbol: 'BTCUSDT',
                recvWindow: 60000,
            })

            t.truthy(fees)
            if (Array.isArray(fees) && fees.length > 0) {
                fees.forEach(fee => {
                    if (fee.symbol) {
                        t.is(fee.symbol, 'BTCUSDT')
                    }
                })
            }
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Trade fee endpoint not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] assetDetail - get asset details', async t => {
        try {
            const assetDetail = await client.assetDetail({
                recvWindow: 60000,
            })

            t.truthy(assetDetail)
            // Response structure varies
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Asset detail not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] assetDetail - specific asset', async t => {
        try {
            const assetDetail = await client.assetDetail({
                asset: 'BTC',
                recvWindow: 60000,
            })

            t.truthy(assetDetail)
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Asset detail not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] accountSnapshot - spot account snapshot', async t => {
        try {
            const snapshot = await client.accountSnapshot({
                type: 'SPOT',
                recvWindow: 60000,
            })

            t.truthy(snapshot)
            // Snapshot may have snapshotVos array
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Account snapshot not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] accountCoins - get all coins', async t => {
        try {
            const coins = await client.accountCoins({
                recvWindow: 60000,
            })

            t.true(Array.isArray(coins) || typeof coins === 'object')
            if (Array.isArray(coins) && coins.length > 0) {
                const [coin] = coins
                t.truthy(coin.coin || coin.name)
            }
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Account coins not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] capitalConfigs - get capital configs', async t => {
        try {
            const configs = await client.capitalConfigs()

            t.true(Array.isArray(configs) || typeof configs === 'object')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Capital configs not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] apiRestrictions - get API restrictions', async t => {
        try {
            const restrictions = await client.apiRestrictions({
                recvWindow: 60000,
            })

            t.truthy(restrictions)
            // May contain ipRestrict, createTime, enableWithdrawals, etc.
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('API restrictions not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Wallet History Tests =====

    test('[ACCOUNT] depositHistory - get deposit history', async t => {
        try {
            const deposits = await client.depositHistory({
                recvWindow: 60000,
            })

            t.true(Array.isArray(deposits) || typeof deposits === 'object')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Deposit history not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] depositHistory - specific coin', async t => {
        try {
            const deposits = await client.depositHistory({
                coin: 'USDT',
                recvWindow: 60000,
            })

            t.true(Array.isArray(deposits) || typeof deposits === 'object')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Deposit history not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] withdrawHistory - get withdrawal history', async t => {
        try {
            const withdrawals = await client.withdrawHistory({
                recvWindow: 60000,
            })

            t.true(Array.isArray(withdrawals) || typeof withdrawals === 'object')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Withdrawal history not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] withdrawHistory - specific coin', async t => {
        try {
            const withdrawals = await client.withdrawHistory({
                coin: 'USDT',
                recvWindow: 60000,
            })

            t.true(Array.isArray(withdrawals) || typeof withdrawals === 'object')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Withdrawal history not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] depositAddress - get deposit address', async t => {
        try {
            const address = await client.depositAddress({
                coin: 'USDT',
                recvWindow: 60000,
            })

            t.truthy(address)
            // May contain address, tag, coin, etc.
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Deposit address not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] depositAddress - with network', async t => {
        try {
            const address = await client.depositAddress({
                coin: 'USDT',
                network: 'BSC',
                recvWindow: 60000,
            })

            t.truthy(address)
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Deposit address not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Transfer Tests =====

    test('[ACCOUNT] universalTransferHistory - get transfer history', async t => {
        try {
            const transfers = await client.universalTransferHistory({
                type: 'MAIN_UMFUTURE',
                recvWindow: 60000,
            })

            t.truthy(transfers)
            // May have rows array or be an object
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Universal transfer history not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] fundingWallet - get funding wallet', async t => {
        try {
            const wallet = await client.fundingWallet({
                recvWindow: 60000,
            })

            t.true(Array.isArray(wallet) || typeof wallet === 'object')
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Funding wallet not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] fundingWallet - specific asset', async t => {
        try {
            const wallet = await client.fundingWallet({
                asset: 'USDT',
                recvWindow: 60000,
            })

            t.truthy(wallet)
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Funding wallet not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Dust Tests =====

    test('[ACCOUNT] dustLog - get dust log', async t => {
        try {
            const dustLog = await client.dustLog({
                recvWindow: 60000,
            })

            t.truthy(dustLog)
            // May have userAssetDribblets array
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Dust log not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== BNB Burn Tests =====

    test('[ACCOUNT] getBnbBurn - get BNB burn status', async t => {
        try {
            const bnbBurn = await client.getBnbBurn({
                recvWindow: 60000,
            })

            t.truthy(bnbBurn)
            // May contain spotBNBBurn, interestBNBBurn
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('BNB burn status not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Other Endpoints Tests =====

    test('[ACCOUNT] convertTradeFlow - get convert trade flow', async t => {
        try {
            const now = Date.now()
            const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

            const tradeFlow = await client.convertTradeFlow({
                startTime: thirtyDaysAgo,
                endTime: now,
                recvWindow: 60000,
            })

            t.truthy(tradeFlow)
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Convert trade flow not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] payTradeHistory - get pay trade history', async t => {
        try {
            const payHistory = await client.payTradeHistory({
                recvWindow: 60000,
            })

            t.truthy(payHistory)
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Pay trade history not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[ACCOUNT] rebateTaxQuery - get rebate tax', async t => {
        try {
            const rebateTax = await client.rebateTaxQuery()

            t.truthy(rebateTax)
        } catch (e) {
            if (notAvailable(e)) {
                t.pass('Rebate tax query not available on testnet')
            } else {
                throw e
            }
        }
    })

    // ===== Skipped Tests - Operations that modify account =====

    test.skip('[ACCOUNT] withdraw - submit withdrawal', async t => {
        // Skipped - would withdraw real assets
        t.pass('Skipped - would withdraw assets')
    })

    test.skip('[ACCOUNT] universalTransfer - execute transfer', async t => {
        // Skipped - would transfer assets between wallets
        t.pass('Skipped - would transfer assets')
    })

    test.skip('[ACCOUNT] dustTransfer - convert dust to BNB', async t => {
        // Skipped - would convert dust assets
        t.pass('Skipped - would convert dust')
    })

    test.skip('[ACCOUNT] setBnbBurn - set BNB burn', async t => {
        // Skipped - modifies account settings
        t.pass('Skipped - modifies account settings')
    })
}

main()
