import Binance from 'index'


// proxies can be useful to bypass geo-restrictions/rate-limits
const client = Binance({
    proxy: 'YOUR_PROXY_URL', // replace with your proxy URL or remove this line if not using a proxy
})

async function main() {
    const spotPrices = await client.prices()
    console.log('Spot Prices:', spotPrices)

    const futuresPrices = await client.futuresPrices()
    console.log('Futures Prices:', futuresPrices)
}

main()
//  node --require @babel/register examples/fetch-prices.js