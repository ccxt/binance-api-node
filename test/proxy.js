const { default: Binance } = require('../dist')

async function main() {
    // Test proxy configuration
    const binanceConfig = {
        apiKey: process.env.API_KEY || 'test_api_key',
        apiSecret: process.env.API_SECRET || 'test_api_secret',
        proxy: process.env.PROXY_URL || 'http://188.245.226.105:8911',
        testnet: true,
    }

    console.log('Testing Binance API with proxy configuration:')
    console.log('Proxy URL:', binanceConfig.proxy)
    console.log('---')

    try {
        const binanceClient = Binance(binanceConfig)

        console.log('Attempting to ping Binance API through proxy...')
        const pingResult = await binanceClient.ping()
        console.log('Ping successful:', pingResult)

        console.log('\nAttempting to get server time through proxy...')
        const time = await binanceClient.time()
        console.log('Server time:', time)
        console.log('Local time:', Date.now())
        console.log('Time difference (ms):', Math.abs(Date.now() - time))

        // If API keys are provided, test a private endpoint
        if (process.env.API_KEY && process.env.API_SECRET) {
            console.log('\nAttempting to get account info through proxy...')
            const accountInfo = await binanceClient.accountInfo()
            console.log('Account info retrieved successfully')
            console.log('Account balances count:', accountInfo.balances.length)

            console.log('\nAttempting to get deposit history through proxy...')
            const deposits = await binanceClient.depositHistory({ limit: 100 })
            console.log('Deposit history retrieved successfully')
            console.log('Deposits count:', deposits.length)
        } else {
            console.log('\nSkipping authenticated endpoints (no API keys provided)')
            console.log(
                'To test authenticated endpoints, set API_KEY and API_SECRET environment variables',
            )
        }

        console.log('\n✓ All proxy tests passed!')
    } catch (error) {
        console.error('\n✗ Proxy test failed:')
        console.error('Error message:', error.message)
        console.error('Error code:', error.code)
        if (error.stack) {
            console.error('\nStack trace:')
            console.error(error.stack)
        }
        process.exit(1)
    }
}

main().catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
})
