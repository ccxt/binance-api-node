import Binance from 'index'

const client = Binance({
    apiKey: 'your_api_key_here',
    apiSecret: 'your_api_secret_here',
})


async function main() {
    try {
        const order = await client.order({
            symbol: 'LTCUSDT',
            side: 'BUY',
            type: 'LIMIT',
            quantity: 0.1,
            price:90,
            timeInForce: 'GTC'
        })
        console.log(order.id)

        // will cancel the order
        const result = await client.cancelOrder({
            symbol: 'LTCUSDT',
            orderId: order.id,
        })
        console.log(result)
    } catch (error) {
        console.error(error)
    }
}

main()
//  node --require @babel/register examples/create-order.js