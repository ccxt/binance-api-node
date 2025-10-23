# WebSocket Browser Tests

These tests verify that WebSocket functionality works correctly in browser environments.

## Files

### 1. `test/test-websocket.html` (Manual Test)
Interactive HTML page to manually test WebSocket connections in a real browser.

**How to use:**
```bash
# Option 1: Open directly in browser
open test/test-websocket.html

# Option 2: Serve with a simple HTTP server
npx serve .
# Then navigate to http://localhost:3000/test/test-websocket.html
```

**What it tests:**
- ✅ WebSocket API availability
- ✅ Connection to Binance public ticker stream
- ✅ Receiving real-time price updates
- ✅ Data structure validation
- ✅ Clean connection closure

**Features:**
- Visual, color-coded output
- Real-time ticker data display
- Auto-closes after receiving first message
- Manual stop button for long-running tests

### 2. `test/websocket-browser.test.js` (Automated Test)
Automated tests using Playwright to verify WebSocket functionality.

**How to run:**
```bash
# Run WebSocket browser tests
npm test test/websocket-browser.test.js

# Run all tests including WebSocket tests
npm test
```

**What it tests:**
1. **Connect to ticker stream**: Connects, receives data, validates structure
2. **Graceful close**: Opens connection and closes it cleanly
3. **Multiple updates**: Receives and validates multiple ticker updates

**Test Output Example:**
```
✔ [Browser WebSocket] Connect to Binance ticker stream (1.3s)
  ℹ Received ticker data:
  ℹ   Symbol: BTCUSDT
  ℹ   Last Price: 110005.61000000
  ℹ   24h High: 111293.61000000
  ℹ   24h Low: 106996.16000000
  ℹ   24h Volume: 18008.12458000
✔ [Browser WebSocket] Handle connection close gracefully (3.5s)
✔ [Browser WebSocket] Receive multiple ticker updates (3.4s)
  ℹ Received 3 ticker updates
  ℹ Prices: 110005.61000000, 110005.61000000, 110005.62000000
```

## Why These Tests?

### Browser Compatibility
WebSockets work differently in browsers vs Node.js. These tests ensure:
- The library's WebSocket code works in browser environments
- Web Crypto API is properly integrated
- Real-time data streaming functions correctly

### No CORS Issues
Binance's WebSocket API doesn't have CORS restrictions, making it perfect for browser testing without needing a proxy.

### Real Data
Tests use real Binance ticker streams (BTCUSDT) to verify:
- Actual connectivity to Binance servers
- Real-time price updates
- Proper data format and structure

## Technical Details

### WebSocket Endpoint
- **URL**: `wss://stream.binance.com:9443/ws/btcusdt@ticker`
- **Type**: Public stream (no authentication required)
- **Data**: Real-time BTC/USDT ticker updates

### Data Structure
```javascript
{
  e: '24hrTicker',      // Event type
  E: 1234567890000,     // Event time
  s: 'BTCUSDT',         // Symbol
  c: '110005.61',       // Close price (last price)
  h: '111293.61',       // High price (24h)
  l: '106996.16',       // Low price (24h)
  v: '18008.12',        // Volume (24h)
  p: '3009.45',         // Price change
  P: '2.81',            // Price change percent
  // ... more fields
}
```

### Browser Requirements
- Modern browser with WebSocket support
- HTTPS context (for Web Crypto API in automated tests)
- No additional dependencies or bundling required

## Troubleshooting

### Test Timeout
If tests timeout, it may be due to network issues or Binance API being unavailable:
```bash
# Increase timeout
npm test test/websocket-browser.test.js -- --timeout=20s
```

### Connection Refused
If WebSocket connection fails:
1. Check network connectivity
2. Verify Binance WebSocket API is accessible: `wss://stream.binance.com:9443`
3. Check firewall/proxy settings

### No Messages Received
If connection opens but no data arrives:
1. Try a different symbol (e.g., `ethusdt` instead of `btcusdt`)
2. Check if the symbol is active on Binance
3. Verify WebSocket stream format in Binance documentation

## Adding More Tests

To add more WebSocket tests:

1. **Test different streams:**
   - Kline/Candlestick: `@kline_1m`
   - Trade: `@trade`
   - Depth: `@depth`

2. **Test multiple connections:**
   - Open multiple WebSocket connections simultaneously
   - Verify they work independently

3. **Test error handling:**
   - Invalid symbols
   - Malformed URLs
   - Network interruptions

Example:
```javascript
test.serial('[Browser WebSocket] Trade stream', async t => {
    const result = await page.evaluate(`
        (async function() {
            return new Promise((resolve, reject) => {
                const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade')
                ws.onmessage = function(event) {
                    const data = JSON.parse(event.data)
                    ws.close()
                    resolve({ price: data.p, quantity: data.q, time: data.T })
                }
                setTimeout(() => reject(new Error('Timeout')), 10000)
            })
        })()
    `)
    t.truthy(result.price)
})
```

## Related Documentation

- [Binance WebSocket API](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Playwright Documentation](https://playwright.dev/)
