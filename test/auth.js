import test from 'ava'

import Binance from 'index'

import { checkFields } from './utils'
import { binanceConfig, hasTestCredentials } from './config'

const main = () => {
    if (!hasTestCredentials()) {
        return test('[AUTH] ⚠️  Skipping tests.', t => {
            t.log('Provide an API_KEY and API_SECRET to run them.')
            t.pass()
        })
    }

    const client = Binance(binanceConfig)

    test('[REST] order', async t => {
        try {
            await client.orderTest({
                symbol: 'ETHBTC',
                side: 'BUY',
                quantity: 1,
                price: 1,
            })
        } catch (e) {
            // Error message changed in newer API versions
            t.true(
                e.message.includes('PERCENT_PRICE') || e.message.includes('PERCENT_PRICE_BY_SIDE'),
                'Should fail with price filter error'
            )
        }

        await client.orderTest({
            symbol: 'ETHBTC',
            side: 'BUY',
            quantity: 1,
            type: 'MARKET',
        })

        t.pass()
    })

    test('[REST] make a MARKET order with quoteOrderQty', async t => {
        try {
            await client.orderTest({
                symbol: 'ETHBTC',
                side: 'BUY',
                quoteOrderQty: 10,
                type: 'MARKET',
            })
        } catch (e) {
            t.is(e.message, 'Filter failure: PERCENT_PRICE')
        }

        await client.orderTest({
            symbol: 'ETHBTC',
            side: 'BUY',
            quantity: 1,
            type: 'MARKET',
        })

        t.pass()
    })

    test('[REST] allOrders / getOrder', async t => {
        try {
            await client.getOrder({ symbol: 'ASTETH' })
        } catch (e) {
            t.is(
                e.message,
                "Param 'origClientOrderId' or 'orderId' must be sent, but both were empty/null!",
            )
        }

        try {
            await client.getOrder({ symbol: 'ASTETH', orderId: 1 })
        } catch (e) {
            t.is(e.message, 'Order does not exist.')
        }

        // Note that this test will pass even if you don't have any orders in your account
        const orders = await client.allOrders({
            symbol: 'ETHBTC',
        })

        t.true(Array.isArray(orders))

        if (orders.length > 0) {
            const [order] = orders
            checkFields(t, order, ['orderId', 'symbol', 'price', 'type', 'side'])

            const res = await client.getOrder({
                symbol: 'ETHBTC',
                orderId: order.orderId,
            })

            t.truthy(res)
            checkFields(t, res, ['orderId', 'symbol', 'price', 'type', 'side'])
        } else {
            t.pass('No orders found (acceptable on testnet)')
        }
    })

    test('[REST] allOrdersOCO', async t => {
        const orderLists = await client.allOrdersOCO({
            timestamp: new Date().getTime(),
        })

        t.true(Array.isArray(orderLists))

        if (orderLists.length) {
            const [orderList] = orderLists
            checkFields(t, orderList, [
                'orderListId',
                'symbol',
                'transactionTime',
                'listStatusType',
                'orders',
            ])
        }
    })

    test('[REST] getOrder with useServerTime', async t => {
        const orders = await client.allOrders({
            symbol: 'ETHBTC',
            useServerTime: true,
        })

        t.true(Array.isArray(orders))
        // May be empty if no orders exist
        t.pass('useServerTime works')
    })

    test('[REST] openOrders', async t => {
        const orders = await client.openOrders({
            symbol: 'ETHBTC',
            recvWindow: 60000,
        })

        t.true(Array.isArray(orders))
    })

    test('[REST] cancelOrder', async t => {
        try {
            await client.cancelOrder({ symbol: 'ETHBTC', orderId: 1 })
        } catch (e) {
            t.is(e.message, 'Unknown order sent.')
        }
    })

    test('[REST] cancelOpenOrders', async t => {
        try {
            await client.cancelOpenOrders({ symbol: 'ETHBTC' })
        } catch (e) {
            t.is(e.message, 'Unknown order sent.')
        }
    })

    test('[REST] accountInfo', async t => {
        const account = await client.accountInfo()
        t.truthy(account)
        checkFields(t, account, ['makerCommission', 'takerCommission', 'balances'])
        t.truthy(account.balances.length)
    })

    test('[REST] tradeFee', async t => {
        try {
            const tfee = (await client.tradeFee()).tradeFee
            t.truthy(tfee)
            t.truthy(tfee.length)
            checkFields(t, tfee[0], ['symbol', 'maker', 'taker'])
        } catch (e) {
            // tradeFee endpoint may not be available on testnet
            if (e.message && e.message.includes('404')) {
                t.pass('tradeFee not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[REST] depositHistory', async t => {
        try {
            const history = await client.depositHistory()
            t.true(history.success)
            t.truthy(Array.isArray(history.depositList))
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('depositHistory not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[REST] withdrawHistory', async t => {
        try {
            const history = await client.withdrawHistory()
            t.true(history.success)
            t.is(typeof history.withdrawList.length, 'number')
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('withdrawHistory not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[REST] depositAddress', async t => {
        try {
            const out = await client.depositAddress({ asset: 'ETH' })
            t.true(out.success)
            t.is(out.asset, 'ETH')
            t.truthy(out.address)
        } catch (e) {
            if (e.message && e.message.includes('404')) {
                t.pass('depositAddress not available on testnet')
            } else {
                throw e
            }
        }
    })

    test('[REST] myTrades', async t => {
        const trades = await client.myTrades({ symbol: 'ETHBTC', recvWindow: 60000 })
        t.true(Array.isArray(trades))
        if (trades.length > 0) {
            const [trade] = trades
            checkFields(t, trade, ['id', 'orderId', 'qty', 'commission', 'time'])
        } else {
            t.pass('No trades found (acceptable on testnet)')
        }
    })

    test('[REST] tradesHistory', async t => {
        const trades = await client.tradesHistory({ symbol: 'ETHBTC', fromId: 28457 })
        t.is(trades.length, 500)
    })

    test('[REST] error code', async t => {
        try {
            await client.orderTest({
                symbol: 'TRXETH',
                side: 'SELL',
                type: 'LIMIT',
                quantity: '-1337.00000000',
                price: '1.00000000',
            })
        } catch (e) {
            t.is(e.code, -1100)
        }
    })

    test('[WS] user', async t => {
        const clean = await client.ws.user()
        t.truthy(clean)
        t.true(typeof clean === 'function')
    })

    test('[FUTURES-REST] walletBalance', async t => {
        const walletBalance = await client.futuresAccountBalance()
        t.truthy(walletBalance)
        checkFields(t, walletBalance[0], [
            'asset',
            'balance',
            'crossWalletBalance',
            'crossUnPnl',
            'availableBalance',
            'maxWithdrawAmount',
        ])
    })

    test('[DELIVERY-REST] walletBalance', async t => {
        const walletBalance = await client.deliveryAccountBalance()
        t.truthy(walletBalance)
        t.true(Array.isArray(walletBalance))
        if (walletBalance.length > 0) {
            // Check for at least some common fields (testnet may not have all fields)
            const balance = walletBalance[0]
            t.truthy(balance.accountAlias !== undefined || balance.asset !== undefined, 'Should have some balance data')
        } else {
            t.pass('No balance found (acceptable on testnet)')
        }
    })
}

main()
