import Binance from 'index'


const client = Binance({
})

async function main() {
    const spotOb = await client.book({ symbol: 'BTCUSDT' })
    console.log('Spot Orderbook:', spotOb)

    const futuresOb = await client.futuresBook({ symbol: 'BTCUSDT' })
    console.log('Futures Orderbook:', futuresOb)
}

main()
//  node --require @babel/register examples/fetch-orderbook.js