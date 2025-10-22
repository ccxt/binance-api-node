import Binance from 'index'


const client = Binance({
})

async function main() {
    const spotPrices = await client.prices()
    console.log('Spot Prices:', spotPrices)

    const futuresPrices = await client.futuresPrices()
    console.log('Futures Prices:', futuresPrices)
}

main()
//  node --require @babel/register examples/fetch-prices.js