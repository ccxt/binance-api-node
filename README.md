# binance-api-node [![build](https://img.shields.io/github/actions/workflow/status/viewblock/binance-api-node/ci.yml?style=flat-square)](https://github.com/ViewBlock/binance-api-node/actions) [![bnb](https://img.shields.io/badge/binance-winner-yellow.svg?style=flat-square)](https://github.com/binance-exchange/binance-api-node)

> A complete API wrapper for the [Binance](https://binance.com) API.

Note: This wrapper uses Promises, if they are not supported in your environment, you might
want to add [a polyfill](https://github.com/stefanpenner/es6-promise) for them.

For PRs or issues, head over to the [source repository](https://github.com/Ashlar/binance-api-node).

### Installation

```
npm install binance-api-node
```
[![NPM](https://nodei.co/npm/binance-api-node.png?compact=false)](https://npmjs.org/package/binance-api-node)
<!-- [![npm install binance-api-node](https://nodei.co/npm/binance-api-node.png?mini=true)](https://npmjs.org/package/binance-api-node) -->

**This project is powered by** <a href="https://github.com/ccxt/ccxt"><img src="https://avatars.githubusercontent.com/u/31901609" width=4% height=4%></a>

### Getting started

Import the module and create a new client. Passing api keys is optional only if
you don't plan on doing authenticated calls. You can create an api key
[here](https://www.binance.com/userCenter/createApi.html).

```js
import Binance from 'binance-api-node'

const client = Binance()

// Authenticated client, can make signed calls
const client2 = Binance({
  apiKey: 'xxx',
  apiSecret: 'xxx',
  getTime: xxx,
})

client.time().then(time => console.log(time))
```

To use testnet, initialize it with the testnet boolean set to true.

```js
const client = Binance({
  apiKey: 'xxx',
  apiSecret: 'xxx',
  getTime: xxx,
  testnet: true,
})
```

### Browser vs Node.js

This library works in both browsers and Node.js environments:





### Proxy Support (Node.js only)

Proxy support for HTTP and WebSocket connections is available in Node.js:

```js
const client = Binance({
  apiKey: 'xxx',
  apiSecret: 'xxx',
  proxy: 'http://proxy-host:port',
})

// All HTTP requests and WebSocket connections will use the proxy
await client.time()
client.ws.ticker('BTCUSDT', ticker => console.log(ticker))
```

**Notes:**
- Proxy support is only available in Node.js environment
- Browsers use system/OS proxy settings automatically
- Supports HTTP and HTTPS proxies (use `http://` or `https://` protocol)
- Supports authenticated proxies: `http://username:password@proxy-host:port`

If you do not have an appropriate babel config, you will need to use the basic commonjs requires.

```js
const Binance = require('binance-api-node').default
```

Every REST method returns a Promise, making this library [async await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) ready.
Following examples will use the `await` form, which requires some configuration you will have to lookup.

### Table of Contents
- [binance-api-node  ](#binance-api-node--)
    - [Installation](#installation)
    - [Getting started](#getting-started)
    - [Browser vs Node.js](#browser-vs-nodejs)
    - [Proxy Support (Node.js only)](#proxy-support-nodejs-only)
    - [Table of Contents](#table-of-contents)
    - [Init](#init)
    - [Public REST Endpoints](#public-rest-endpoints)
      - [ping](#ping)
      - [time](#time)
      - [exchangeInfo](#exchangeinfo)
      - [book](#book)
      - [candles](#candles)
      - [aggTrades](#aggtrades)
      - [trades](#trades)
      - [dailyStats](#dailystats)
      - [avgPrice](#avgprice)
      - [prices](#prices)
      - [allBookTickers](#allbooktickers)
    - [Futures Public REST Endpoints](#futures-public-rest-endpoints)
      - [futures ping](#futures-ping)
      - [futures time](#futures-time)
      - [futures exchangeInfo](#futures-exchangeinfo)
      - [futures book](#futures-book)
      - [futures candles](#futures-candles)
      - [futures aggTrades](#futures-aggtrades)
      - [futures trades](#futures-trades)
      - [futures dailyStats](#futures-dailystats)
      - [futures prices](#futures-prices)
      - [futures allBookTickers](#futures-allbooktickers)
      - [futures markPrice](#futures-markprice)
      - [futures AllForceOrders](#futures-allforceorders)
    - [Delivery Public REST Endpoints](#delivery-public-rest-endpoints)
      - [delivery ping](#delivery-ping)
      - [delivery time](#delivery-time)
      - [delivery exchangeInfo](#delivery-exchangeinfo)
      - [delivery book](#delivery-book)
      - [delivery candles](#delivery-candles)
      - [delivery aggTrades](#delivery-aggtrades)
      - [delivery trades](#delivery-trades)
      - [delivery dailyStats](#delivery-dailystats)
      - [delivery prices](#delivery-prices)
      - [delivery allBookTickers](#delivery-allbooktickers)
      - [delivery markPrice](#delivery-markprice)
    - [Authenticated REST Endpoints](#authenticated-rest-endpoints)
      - [order](#order)
      - [orderTest](#ordertest)
      - [orderOco](#orderoco)
      - [getOrder](#getorder)
      - [getOrderOco](#getorderoco)
      - [cancelOrder](#cancelorder)
      - [cancelOrderOco](#cancelorderoco)
      - [cancelOpenOrders](#cancelopenorders)
      - [openOrders](#openorders)
      - [allOrders](#allorders)
      - [allOrdersOCO](#allordersoco)
      - [accountInfo](#accountinfo)
      - [myTrades](#mytrades)
      - [dailyAccountSnapshot](#dailyaccountsnapshot)
      - [tradesHistory](#tradeshistory)
      - [withdrawHistory](#withdrawhistory)
      - [withdraw](#withdraw)
      - [depositAddress](#depositaddress)
      - [depositHistory](#deposithistory)
      - [tradeFee](#tradefee)
      - [capitalConfigs](#capitalconfigs)
      - [universalTransfer](#universaltransfer)
      - [universalTransferHistory](#universaltransferhistory)
      - [assetDetail](#assetdetail)
      - [getBnbBurn](#getbnbburn)
      - [setBnbBurn](#setbnbburn)
      - [dustLog](#dustlog)
      - [dustTransfer](#dusttransfer)
      - [accountCoins](#accountcoins)
      - [lendingAccount](#lendingaccount)
      - [fundingWallet](#fundingwallet)
      - [apiPermission](#apipermission)
    - [Margin](#margin)
      - [marginAccountInfo](#marginaccountinfo)
      - [marginLoan](#marginloan)
      - [marginRepay](#marginrepay)
      - [marginIsolatedAccount](#marginisolatedaccount)
      - [disableMarginAccount](#disablemarginaccount)
      - [enableMarginAccount](#enablemarginaccount)
      - [marginMaxBorrow](#marginmaxborrow)
      - [marginCreateIsolated](#margincreateisolated)
      - [marginIsolatedTransfer](#marginisolatedtransfer)
      - [marginIsolatedTransferHistory](#marginisolatedtransferhistory)
      - [marginOrder](#marginorder)
      - [marginCancelOrder](#margincancelorder)
      - [marginOrderOco](#marginorderoco)
      - [marginOpenOrders](#marginopenorders)
      - [marginCancelOpenOrders](#margincancelopenorders)
      - [marginGetOrder](#margingetorder)
      - [marginGetOrderOco](#margingetorderoco)
    - [Portfolio Margin Endpoints](#portfolio-margin-endpoints)
      - [getPortfolioMarginAccountInfo](#getportfoliomarginaccountinfo)
    - [Futures Authenticated REST endpoints](#futures-authenticated-rest-endpoints)
      - [futuresGetOrder](#futuresgetorder)
      - [futuresAllOrders](#futuresallorders)
      - [futuresBatchOrders](#futuresbatchorders)
      - [futuresCancelBatchOrders](#futurescancelbatchorders)
      - [futuresLeverage](#futuresleverage)
      - [futuresMarginType](#futuresmargintype)
      - [futuresPositionMargin](#futurespositionmargin)
      - [futuresMarginHistory](#futuresmarginhistory)
      - [futuresIncome](#futuresincome)
      - [futuresAccountBalance](#futuresaccountbalance)
      - [futuresUserTrades](#futuresusertrades)
      - [futuresLeverageBracket](#futuresleveragebracket)
    - [Delivery Authenticated REST endpoints](#delivery-authenticated-rest-endpoints)
      - [deliveryGetOrder](#deliverygetorder)
      - [deliveryAllOrders](#deliveryallorders)
      - [deliveryBatchOrders](#deliverybatchorders)
      - [deliveryCancelBatchOrders](#deliverycancelbatchorders)
      - [deliveryLeverage](#deliveryleverage)
      - [deliveryMarginType](#deliverymargintype)
      - [deliveryPositionMargin](#deliverypositionmargin)
      - [deliveryMarginHistory](#deliverymarginhistory)
      - [deliveryIncome](#deliveryincome)
      - [deliveryAccountBalance](#deliveryaccountbalance)
      - [deliveryUserTrades](#deliveryusertrades)
      - [deliveryLeverageBracket](#deliveryleveragebracket)
    - [WebSockets](#websockets)
      - [depth](#depth)
      - [customSubStream](#customsubstream)
      - [partialDepth](#partialdepth)
      - [ticker](#ticker)
      - [allTickers](#alltickers)
      - [miniTicker](#miniticker)
      - [allMiniTickers](#allminitickers)
      - [bookTicker](#bookticker)
      - [candles](#candles-1)
      - [trades](#trades-1)
      - [aggTrades](#aggtrades-1)
      - [user](#user)
    - [Futures WebSockets](#futures-websockets)
      - [futuresDepth](#futuresdepth)
      - [futuresPartialDepth](#futurespartialdepth)
      - [futuresTicker](#futuresticker)
      - [futuresAllTickers](#futuresalltickers)
      - [futuresCandles](#futurescandles)
      - [futuresAggTrades](#futuresaggtrades)
      - [futuresLiquidations](#futuresliquidations)
      - [futuresAllLiquidations](#futuresallliquidations)
      - [futuresCustomSubStream](#futurescustomsubstream)
      - [futuresUser](#futuresuser)
    - [Delivery WebSockets](#delivery-websockets)
      - [deliveryDepth](#deliverydepth)
      - [deliveryPartialDepth](#deliverypartialdepth)
      - [deliveryTicker](#deliveryticker)
      - [deliveryAllTickers](#deliveryalltickers)
      - [deliveryCandles](#deliverycandles)
      - [deliveryAggTrades](#deliveryaggtrades)
      - [deliveryCustomSubStream](#deliverycustomsubstream)
      - [deliveryUser](#deliveryuser)
      - [Common](#common)
      - [getInfo](#getinfo)
    - [ErrorCodes](#errorcodes)

### Init

| Param       | Type     | Required | Info                                         |
| ----------- | -------- | -------- | -------------------------------------------- |
| apiKey      | String   | false    | Required when making private calls           |
| apiSecret   | String   | false    | Required when making private calls           |
| getTime     | Function | false    | Time generator, defaults to () => Date.now() |
| httpBase    | String   | false    | Changes the default endpoint                 |
| httpFutures | String   | false    | Changes the default endpoint                 |
| wsBase      | String   | false    | Changes the default endpoint                 |
| wsFutures   | String   | false    | Changes the default endpoint                 |

### Public REST Endpoints

#### ping

Test connectivity to the API.

```js
console.log(await client.ping())
```

#### time

Test connectivity to the Rest API and get the current server time.

```js
console.log(await client.time())
```

<details>
<summary>Output</summary>

```js
1508478457643
```

</details>

#### exchangeInfo

Get the current exchange trading rules and symbol information. You can optionally
pass a symbol to only retrieve info of this specific one.

```js
console.log(await client.exchangeInfo())
```

| Param  | Type   | Required | Default |
| ------ | ------ | -------- | ------- |
| symbol | String | false    |         |

<details>
<summary>Output</summary>

```js
{
  "timezone": "UTC",
  "serverTime": 1508631584636,
  "rateLimits": [
    {
      "rateLimitType": "REQUEST_WEIGHT",
      "interval": "MINUTE",
      "intervalNum": 1,
      "limit": 1200
    },
    {
      "rateLimitType": "ORDERS",
      "interval": "SECOND",
      "intervalNum": 1,
      "limit": 10
    },
    {
      "rateLimitType": "ORDERS",
      "interval": "DAY",
      "intervalNum": 1,
      "limit": 100000
    }
  ],
  "exchangeFilters": [],
  "symbols": [{
    "symbol": "ETHBTC",
    "status": "TRADING",
    "baseAsset": "ETH",
    "baseAssetPrecision": 8,
    "quoteAsset": "BTC",
    "quotePrecision": 8,
    "orderTypes": ["LIMIT", "MARKET"],
    "icebergAllowed": false,
    "filters": [{
      "filterType": "PRICE_FILTER",
      "minPrice": "0.00000100",
      "maxPrice": "100000.00000000",
      "tickSize": "0.00000100"
    }, {
      "filterType": "LOT_SIZE",
      "minQty": "0.00100000",
      "maxQty": "100000.00000000",
      "stepSize": "0.00100000"
    }, {
      "filterType": "MIN_NOTIONAL",
      "minNotional": "0.00100000"
    }]
  }]
}
```

</details>

#### book

Get the order book for a symbol.

```js
console.log(await client.book({ symbol: 'ETHBTC' }))
```

| Param  | Type   | Required | Default |
| ------ | ------ | -------- | ------- |
| symbol | String | true     |
| limit  | Number | false    | `100`   |

<details>
<summary>Output</summary>

```js
{
  lastUpdateId: 17647759,
  asks:
   [
     { price: '0.05411500', quantity: '5.55000000' },
     { price: '0.05416700', quantity: '11.80100000' }
   ],
  bids:
   [
     { price: '0.05395500', quantity: '2.70000000' },
     { price: '0.05395100', quantity: '11.84100000' }
   ]
}
```

</details>

#### candles

Retrieves Candlestick for a symbol. Candlesticks are uniquely identified by their open time.

```js
console.log(await client.candles({ symbol: 'ETHBTC' }))
```

| Param     | Type   | Required | Default | Description                                                                                    |
| --------- | ------ | -------- | ------- | ---------------------------------------------------------------------------------------------- |
| symbol    | String | true     |
| interval  | String | false    | `5m`    | `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`,<br>`4h`, `6h`, `8h`, `12h`, `1d`, `3d`, `1w`, `1M` |
| limit     | Number | false    | `500`   | Max `1000`                                                                                     |
| startTime | Number | false    |
| endTime   | Number | false    |

<details>
<summary>Output</summary>

```js
;[
  {
    openTime: 1508328900000,
    open: '0.05655000',
    high: '0.05656500',
    low: '0.05613200',
    close: '0.05632400',
    volume: '68.88800000',
    closeTime: 1508329199999,
    quoteAssetVolume: '2.29500857',
    trades: 85,
    baseAssetVolume: '40.61900000',
  },
]
```

</details>

#### aggTrades

Get compressed, aggregate trades. Trades that fill at the time, from the same order, with the same price will have the quantity aggregated.

```js
console.log(await client.aggTrades({ symbol: 'ETHBTC' }))
```

| Param     | Type   | Required | Default | Description                                              |
| --------- | ------ | -------- | ------- | -------------------------------------------------------- |
| symbol    | String | true     |
| fromId    | String | false    |         | ID to get aggregate trades from INCLUSIVE.               |
| startTime | Number | false    |         | Timestamp in ms to get aggregate trades from INCLUSIVE.  |
| endTime   | Number | false    |         | Timestamp in ms to get aggregate trades until INCLUSIVE. |
| limit     | Number | false    | `500`   | Max `500`                                                |

Note: If both `startTime` and `endTime` are sent, `limit` should not be sent AND the distance between `startTime` and `endTime` must be less than 1 hour.

Note: If `frondId`, `startTime`, and `endTime` are not sent, the most recent aggregate trades will be returned.

<details>
<summary>Output</summary>

```js
;[
  {
    aggId: 2107132,
    symbol: 'ETHBTC',
    price: '0.05390400',
    quantity: '1.31000000',
    firstId: 2215345,
    lastId: 2215345,
    timestamp: 1508478599481,
    isBuyerMaker: true,
    wasBestPrice: true,
  },
]
```

</details>

#### trades

Get recent trades of a symbol.

```js
console.log(await client.trades({ symbol: 'ETHBTC' }))
```

| Param  | Type   | Required | Default | Description |
| ------ | ------ | -------- | ------- | ----------- |
| symbol | String | true     |
| limit  | Number | false    | `500`   | Max `500`   |

<details>
<summary>Output</summary>

```js
;[
  {
    id: 28457,
    price: '4.00000100',
    qty: '12.00000000',
    time: 1499865549590,
    isBuyerMaker: true,
    isBestMatch: true,
  },
]
```

</details>

#### dailyStats

24 hour price change statistics, not providing a symbol will return all tickers and is resource-expensive.

```js
console.log(await client.dailyStats({ symbol: 'ETHBTC' }))
```

| Param  | Type   | Required |
| ------ | ------ | -------- |
| symbol | String | false    |

<details>
<summary>Output</summary>

```js
{
  symbol: 'ETHBTC',
  priceChange: '-0.00112000',
  priceChangePercent: '-1.751',
  weightedAvgPrice: '0.06324784',
  prevClosePrice: '0.06397400',
  lastPrice: '0.06285500',
  lastQty: '0.63500000',
  bidPrice: '0.06285500',
  bidQty: '0.81900000',
  askPrice: '0.06291900',
  askQty: '2.93800000',
  openPrice: '0.06397500',
  highPrice: '0.06419100',
  lowPrice: '0.06205300',
  volume: '126240.37200000',
  quoteVolume: '7984.43091340',
  openTime: 1521622289427,
  closeTime: 1521708689427,
  firstId: 45409308, // First tradeId
  lastId: 45724293, // Last tradeId
  count: 314986 // Trade count
}
```

</details>

#### avgPrice

Current average price for a symbol.

```js
console.log(await client.avgPrice({ symbol: 'ETHBTC' }))
```

| Param  | Type   | Required |
| ------ | ------ | -------- |
| symbol | String | true     |

<details>
<summary>Output</summary>

```js
{
  "mins": 5,
  "price": "9.35751834"
}
```

</details>

#### prices

Latest price for a symbol, not providing the symbol will return prices for all symbols.

```js
console.log(await client.prices())
```

| Param  | Type   | Required |
| ------ | ------ | -------- |
| symbol | String | false    |

<details>
<summary>Output</summary>

```js
{
  ETHBTC: '0.05392500',
  LTCBTC: '0.01041100',
  ...
}
```

</details>

#### allBookTickers

Best price/qty on the order book for all symbols.

```js
console.log(await client.allBookTickers())
```

<details>
<summary>Output</summary>

```js
{
  DASHBTC: {
    symbol: 'DASHBTC',
    bidPrice: '0.04890400',
    bidQty: '0.74100000',
    askPrice: '0.05230000',
    askQty: '0.79900000'
  },
  DASHETH: {
    symbol: 'DASHETH',
    bidPrice: '0.89582000',
    bidQty: '0.63300000',
    askPrice: '1.02328000',
    askQty: '0.99900000'
  }
  ...
}
```

</details>

### Futures Public REST Endpoints

#### futures ping

Test connectivity to the API.

```js
console.log(await client.futuresPing())
```

#### futures time

Test connectivity to the Rest API and get the current server time.

```js
console.log(await client.futuresTime())
```

<details>
<summary>Output</summary>

```js
1508478457643
```

</details>

#### futures exchangeInfo

Get the current exchange trading rules and symbol information.

```js
console.log(await client.futuresExchangeInfo())
```

<details>
<summary>Output</summary>

```js
{
  "timezone": "UTC",
  "serverTime": 1508631584636,
  "rateLimits": [
    {
      "rateLimitType": "REQUEST_WEIGHT",
      "interval": "MINUTE",
      "intervalNum": 1,
      "limit": 1200
    },
    {
      "rateLimitType": "ORDERS",
      "interval": "SECOND",
      "intervalNum": 1,
      "limit": 10
    },
    {
      "rateLimitType": "ORDERS",
      "interval": "DAY",
      "intervalNum": 1,
      "limit": 100000
    }
  ],
  "exchangeFilters": [],
  "symbols": [...]
}
```

</details>

#### futures book

Get the order book for a symbol.

```js
console.log(await client.futuresBook({ symbol: 'BTCUSDT' }))
```

| Param  | Type   | Required | Default |
| ------ | ------ | -------- | ------- |
| symbol | String | true     |
| limit  | Number | false    | `100`   |

<details>
<summary>Output</summary>

```js
{
  lastUpdateId: 17647759,
  asks:
   [
     { price: '8000.05411500', quantity: '54.55000000' },
     { price: '8000.05416700', quantity: '1111.80100000' }
   ],
  bids:
   [
     { price: '8000.05395500', quantity: '223.70000000' },
     { price: '8000.05395100', quantity: '1134.84100000' }
   ]
}
```

</details>

#### futures candles

Retrieves Candlestick for a symbol. Candlesticks are uniquely identified by their open time.

```js
console.log(await client.futuresCandles({ symbol: 'BTCUSDT' }))
```

| Param     | Type   | Required | Default | Description                                                                                    |
| --------- | ------ | -------- | ------- | ---------------------------------------------------------------------------------------------- |
| symbol    | String | true     |
| interval  | String | false    | `5m`    | `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`,<br>`4h`, `6h`, `8h`, `12h`, `1d`, `3d`, `1w`, `1M` |
| limit     | Number | false    | `500`   | Max `1000`                                                                                     |
| startTime | Number | false    |
| endTime   | Number | false    |

<details>
<summary>Output</summary>

```js
;[
  {
    openTime: 1508328900000,
    open: '0.05655000',
    high: '0.05656500',
    low: '0.05613200',
    close: '0.05632400',
    volume: '68.88800000',
    closeTime: 1508329199999,
    quoteAssetVolume: '2.29500857',
    trades: 85,
    baseAssetVolume: '40.61900000',
  },
]
```

</details>

#### futures aggTrades

Get compressed, aggregate trades. Trades that fill at the time, from the same order, with the same price will have the quantity aggregated.

```js
console.log(await client.futuresAggTrades({ symbol: 'ETHBTC' }))
```

| Param     | Type   | Required | Default | Description                                              |
| --------- | ------ | -------- | ------- | -------------------------------------------------------- |
| symbol    | String | true     |         |                                                          |
| fromId    | String | false    |         | ID to get aggregate trades from INCLUSIVE.               |
| startTime | Number | false    |         | Timestamp in ms to get aggregate trades from INCLUSIVE.  |
| endTime   | Number | false    |         | Timestamp in ms to get aggregate trades until INCLUSIVE. |
| limit     | Number | false    | `500`   | Max `500`                                                |

Note: If both `startTime` and `endTime` are sent, `limit` should not be sent AND the distance between `startTime` and `endTime` must be less than 24 hours.

Note: If `frondId`, `startTime`, and `endTime` are not sent, the most recent aggregate trades will be returned.

<details>
<summary>Output</summary>

```js
;[
  {
    aggId: 2107132,
    price: '0.05390400',
    quantity: '1.31000000',
    firstId: 2215345,
    lastId: 2215345,
    timestamp: 1508478599481,
    isBuyerMaker: true,
    wasBestPrice: true,
  },
]
```

</details>

#### futures trades

Get recent trades of a symbol.

```js
console.log(await client.futuresTrades({ symbol: 'ETHBTC' }))
```

| Param  | Type   | Required | Default | Description |
| ------ | ------ | -------- | ------- | ----------- |
| symbol | String | true     |
| limit  | Number | false    | `500`   | Max `500`   |

<details>
<summary>Output</summary>

```js
;[
  {
    id: 28457,
    price: '4.00000100',
    qty: '12.00000000',
    time: 1499865549590,
    isBuyerMaker: true,
    isBestMatch: true,
  },
]
```

</details>

#### futures dailyStats

24 hour price change statistics, not providing a symbol will return all tickers and is resource-expensive.

```js
console.log(await client.futuresDailyStats({ symbol: 'ETHBTC' }))
```

| Param  | Type   | Required |
| ------ | ------ | -------- |
| symbol | String | false    |

<details>
<summary>Output</summary>

```js
{
  symbol: 'BTCUSDT',
  priceChange: '-0.00112000',
  priceChangePercent: '-1.751',
  weightedAvgPrice: '0.06324784',
  prevClosePrice: '0.06397400',
  lastPrice: '0.06285500',
  lastQty: '0.63500000',
  bidPrice: '0.06285500',
  bidQty: '0.81900000',
  askPrice: '0.06291900',
  askQty: '2.93800000',
  openPrice: '0.06397500',
  highPrice: '0.06419100',
  lowPrice: '0.06205300',
  volume: '126240.37200000',
  quoteVolume: '7984.43091340',
  openTime: 1521622289427,
  closeTime: 1521708689427,
  firstId: 45409308, // First tradeId
  lastId: 45724293, // Last tradeId
  count: 314986 // Trade count
}
```

</details>

#### futures prices

Latest price for symbol, not providing a symbol will return latest price for all symbols and is resource-expensive.

```js
console.log(await client.futuresPrices())
```

| Param  | Type   | Required |
| ------ | ------ | -------- |
| symbol | String | false    |

<details>
<summary>Output</summary>

```js
{
  BTCUSDT: '8590.05392500',
  ETHUSDT: '154.1100',
  ...
}
```

</details>

#### futures allBookTickers

Best price/qty on the order book for all symbols.

```js
console.log(await client.futuresAllBookTickers())
```

<details>
<summary>Output</summary>

```js
{
  BTCUSDT: {
    symbol: 'BTCUSDT',
    bidPrice: '0.04890400',
    bidQty: '0.74100000',
    askPrice: '0.05230000',
    askQty: '0.79900000'
  },
  ETHUSDT: {
    symbol: 'ETHUSDT',
    bidPrice: '0.89582000',
    bidQty: '0.63300000',
    askPrice: '1.02328000',
    askQty: '0.99900000'
  }
  ...
}
```

</details>

#### futures markPrice

Mark Price and Funding Rate.

```js
console.log(await client.futuresMarkPrice())
```

<details>
<summary>Output</summary>

```js
{
    "symbol": "BTCUSDT",
    "markPrice": "11012.80409769",
    "lastFundingRate": "-0.03750000",
    "nextFundingTime": 1562569200000,
    "time": 1562566020000
}
```

</details>

#### futures AllForceOrders

Get all Liquidation Orders.

```js
console.log(await client.futuresAllForceOrders())
```

| Param     | Type   | Required |
| --------- | ------ | -------- |
| symbol    | String | false    |
| startTime | Long   | false    |
| endTime   | Long   | false    |
| limit     | Long   | false    |

<details>
<summary>Output</summary>

```js
;[
  {
    symbol: 'BTCUSDT', // SYMBOL
    price: '7918.33', // ORDER_PRICE
    origQty: '0.014', // ORDER_AMOUNT
    executedQty: '0.014', // FILLED_AMOUNT
    avragePrice: '7918.33', // AVG_PRICE
    status: 'FILLED', // STATUS
    timeInForce: 'IOC', // TIME_IN_FORCE
    type: 'LIMIT',
    side: 'SELL', // DIRECTION
    time: 1568014460893,
  },
]
```

</details>

### Delivery Public REST Endpoints

#### delivery ping

Test connectivity to the API.

```js
console.log(await client.deliveryPing())
```

#### delivery time

Test connectivity to the Rest API and get the current server time.

```js
console.log(await client.deliveryTime())
```

<details>
<summary>Output</summary>

```js
1508478457643
```

</details>

#### delivery exchangeInfo

Get the current exchange trading rules and symbol information.

```js
console.log(await client.deliveryExchangeInfo())
```

<details>
<summary>Output</summary>

```js
{
  timezone: 'UTC',
  serverTime: 1663099219744,
  rateLimits: [
    {
      rateLimitType: 'REQUEST_WEIGHT',
      interval: 'MINUTE',
      intervalNum: 1,
      limit: 2400
    },
    {
      rateLimitType: 'ORDERS',
      interval: 'MINUTE',
      intervalNum: 1,
      limit: 1200
    }
  ],
  exchangeFilters: [],
  symbols: [...]
}
```

</details>

#### delivery book

Get the order book for a symbol.

```js
console.log(await client.deliveryBook({ symbol: 'TRXUSD_PERP' }))
```

| Param  | Type   | Required | Default |
| ------ | ------ | -------- | ------- |
| symbol | String | true     |
| limit  | Number | false    | `500`   |

<details>
<summary>Output</summary>

```js
{
  lastUpdateId: 17647759,
  asks:
   [
     { price: '8000.05411500', quantity: '54.55000000' },
     { price: '8000.05416700', quantity: '1111.80100000' }
   ],
  bids:
   [
     { price: '8000.05395500', quantity: '223.70000000' },
     { price: '8000.05395100', quantity: '1134.84100000' }
   ]
}
```

</details>

#### delivery candles

Retrieves Candlestick for a symbol. Candlesticks are uniquely identified by their open time.

```js
console.log(await client.deliveryCandles({ symbol: 'TRXUSD_PERP' }))
```

| Param     | Type   | Required | Default | Description                                                                                    |
| --------- | ------ | -------- | ------- | ---------------------------------------------------------------------------------------------- |
| symbol    | String | true     |
| interval  | String | false    | `5m`    | `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`,<br>`4h`, `6h`, `8h`, `12h`, `1d`, `3d`, `1w`, `1M` |
| limit     | Number | false    | `500`   | Max `1000`                                                                                     |
| startTime | Number | false    |
| endTime   | Number | false    |

<details>
<summary>Output</summary>

```js
[
  {
    openTime: 1663104600000,
    open: '0.06091',
    high: '0.06091',
    low: '0.06086',
    close: '0.06090',
    volume: '7927',
    closeTime: 1663104899999,
    baseVolume: '1302212.12820796',
    trades: 75,
    quoteAssetVolume: '386',
    baseAssetVolume: '63382.78318786'
  }
]
```

</details>

#### delivery aggTrades

Get compressed, aggregate trades. Trades that fill at the time, from the same order, with the same price will have the quantity aggregated.

```js
console.log(await client.deliveryAggTrades({ symbol: 'TRXUSD_PERP' }))
```

| Param     | Type   | Required | Default | Description                                              |
| --------- | ------ | -------- | ------- | -------------------------------------------------------- |
| symbol    | String | true     |         |                                                          |
| fromId    | String | false    |         | ID to get aggregate trades from INCLUSIVE.               |
| startTime | Number | false    |         | Timestamp in ms to get aggregate trades from INCLUSIVE.  |
| endTime   | Number | false    |         | Timestamp in ms to get aggregate trades until INCLUSIVE. |
| limit     | Number | false    | `500`   | Max `1000`                                               |

Note: If both `startTime` and `endTime` are sent, `limit` should not be sent AND the distance between `startTime` and `endTime` must be less than 24 hours.

Note: If `fromId`, `startTime`, and `endTime` are not sent, the most recent aggregate trades will be returned.

Note : Only market trades will be aggregated and returned, which means the insurance fund trades and ADL trades won't be aggregated.

<details>
<summary>Output</summary>

```js
[
  {
    aggId: 14642023,
    symbol: 'TRXUSD_PERP',
    price: '0.06087',
    quantity: '50',
    firstId: 26319898,
    lastId: 26319898,
    timestamp: 1663105187120,
    isBuyerMaker: false,
  }
]
```

</details>

#### delivery trades

Get recent trades of a symbol.

```js
console.log(await client.deliveryTrades({ symbol: 'TRXUSD_PERP' }))
```

| Param  | Type   | Required | Default | Description |
| ------ | ------ | -------- | ------- | ----------- |
| symbol | String | true     |
| limit  | Number | false    | `500`   | Max `1000`  |

<details>
<summary>Output</summary>

```js
;[
  {
    id: 26319660,
    price: '0.06097',
    qty: '28',
    baseQty: '4592.42250287',
    time: 1663103746267,
    isBuyerMaker: true
  },
]
```

</details>

#### delivery dailyStats

24 hour price change statistics, not providing a symbol will return all tickers and is resource-expensive.

```js
console.log(await client.deliveryDailyStats({ symbol: 'TRXUSD_PERP' }))
```

| Param  | Type   | Required |
| ------ | ------ | -------- |
| symbol | String | false    |
| pair   | String | false    |

<details>
<summary>Output</summary>

```js
{
  symbol: 'TRXUSD_PERP',
  pair: 'TRXUSD',
  priceChange: '-0.00277',
  priceChangePercent: '-4.353',
  weightedAvgPrice: '0.06248010',
  lastPrice: '0.06087',
  lastQty: '4',
  openPrice: '0.06364',
  highPrice: '0.06395',
  lowPrice: '0.06069',
  volume: '545316',
  baseVolume: '87278342.48218514',
  openTime: 1663019640000,
  closeTime: 1663106045576,
  firstId: 26308774,
  lastId: 26320065,
  count: 11292
}
```

</details>

#### delivery prices

Latest price for all symbols.

```js
console.log(await client.futuresPrices())
```

<details>
<summary>Output</summary>

```js
{
  BTCUSDT: '8590.05392500',
  ETHUSDT: '154.1100',
  ...
}
```

</details>

#### delivery allBookTickers

Best price/qty on the order book for all symbols.

```js
console.log(await client.deliveryAllBookTickers())
```

<details>
<summary>Output</summary>

```js
{
  BTCUSD_PERP: {
    symbol: 'BTCUSD_PERP',
    pair: 'BTCUSD',
    bidPrice: '20120.9',
    bidQty: '13673',
    askPrice: '20121.0',
    askQty: '2628',
    time: 1663106372658
  },
  ETHUSD_PERP: {
    symbol: 'ETHUSD_PERP',
    pair: 'ETHUSD',
    bidPrice: '1593.63',
    bidQty: '7210',
    askPrice: '1593.64',
    askQty: '27547',
    time: 1663106372667
  }
  ...
}
```

</details>

#### delivery markPrice

Mark Price and Funding Rate.

```js
console.log(await client.deliveryMarkPrice())
```

<details>
<summary>Output</summary>

```js
[
  {
    symbol: 'BTCUSD_221230',
    pair: 'BTCUSD',
    markPrice: '20158.81560758',
    indexPrice: '20152.05327273',
    estimatedSettlePrice: '20147.96717735',
    lastFundingRate: '',
    interestRate: '',
    nextFundingTime: 0,
    time: 1663106459005
  },
  {
    symbol: 'FILUSD_PERP',
    pair: 'FILUSD',
    markPrice: '5.88720470',
    indexPrice: '5.89106242',
    estimatedSettlePrice: '5.89377086',
    lastFundingRate: '0.00010000',
    interestRate: '0.00010000',
    nextFundingTime: 1663113600000,
    time: 1663106459005
  }
  ...
]
```

</details>

### Authenticated REST Endpoints

Note that for all authenticated endpoints, you can pass an extra parameter
`useServerTime` set to `true` in order to fetch the server time before making
the request.

#### order

Creates a new order.

```js
console.log(
  await client.order({
    symbol: 'XLMETH',
    side: 'BUY',
    quantity: '100',
    price: '0.0002',
  }),
)
```

| Param            | Type   | Required | Default  | Description                                                         |
| ---------------- | ------ | -------- | -------- | ------------------------------------------------------------------- |
| symbol           | String | true     |          |                                                                     |
| side             | String | true     |          | `BUY`,`SELL`                                                        |
| type             | String | false    | `LIMIT`  | `LIMIT`, `MARKET`                                                   |
| quantity         | String | true     |          |                                                                     |
| price            | String | true     |          | Optional for `MARKET` orders                                        |
| timeInForce      | String | false    | `GTC`    | `FOK`, `GTC`, `IOC`                                                 |
| newClientOrderId | String | false    |          | A unique id for the order. Automatically generated if not sent.     |
| stopPrice        | Number | false    |          | Used with stop orders                                               |
| activationPrice  | Number | false    |          | Used with `TRAILING_STOP_MARKET`                                    |
| callbackRate     | Number | false    |          | Used with `TRAILING_STOP_MARKET`                                    |
| newOrderRespType | String | false    | `RESULT` | Returns more complete info of the order. `ACK`, `RESULT`, or `FULL` |
| icebergQty       | Number | false    |          | Used with iceberg orders                                            |
| recvWindow       | Number | false    |          |                                                                     |

Additional mandatory parameters based on `type`:

| Type                   | Additional mandatory parameters                 |
| -----------------------| ----------------------------------------------- |
| `LIMIT`                | `timeInForce`, `quantity`, `price`              |
| `MARKET`               | `quantity`                                      |
| `STOP`                 | `quantity`, `price`, `stopPrice`                |
| `STOP_LOSS_LIMIT`      | `timeInForce`, `quantity`, `price`, `stopPrice` |
| `STOP_LOSS_MARKET`     | `stopPrice`                                     |
| `TAKE_PROFIT`          | `quantity`, `price`, `stopPrice`                |
| `TAKE_PROFIT_MARKET`   | `stopPrice`                                     |
| `STOP_PROFIT_LIMIT`    | `timeInForce`, `quantity`, `price`, `stopPrice` |
| `LIMIT_MAKER`          | `quantity`, `price`                             |
| `TRAILING_STOP_MARKET` | `callbackRate`, `activationPrice`               |

- `LIMIT_MAKER` are `LIMIT` orders that will be rejected if they would immediately match and trade as a taker.
- `STOP` and `TAKE_PROFIT` will execute a `MARKET` order when the `stopPrice` is reached.
- Any `LIMIT` or `LIMIT_MAKER` type order can be made an iceberg order by sending an `icebergQty`.
- Any order with an `icebergQty` MUST have `timeInForce` set to `GTC`.

<details>
<summary>Output</summary>

```js
{
  symbol: 'XLMETH',
  orderId: 1740797,
  clientOrderId: '1XZTVBTGS4K1e',
  transactTime: 1514418413947,
  price: '0.00020000',
  origQty: '100.00000000',
  executedQty: '0.00000000',
  status: 'NEW',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY'
}
```

</details>

#### orderTest

Test new order creation and signature/recvWindow. Creates and validates a new order but does not send it into the matching engine.

Same API as above, but does not return any output on success.

#### orderOco

Creates a new OCO order.

```js
console.log(
  await client.orderOco({
    symbol: 'XLMETH',
    side: 'SELL',
    quantity: 100,
    price: 0.0002,
    stopPrice: 0.0001,
    stopLimitPrice: 0.0001,
  }),
)
```

| Param                | Type   | Required | Description
|----------------------|--------|----------|------------
| symbol               | String | true     |
| listClientOrderId    | String | false    | A unique Id for the entire orderList
| side                 | String | true     | `BUY`,`SELL`
| quantity             | Number | true     |
| limitClientOrderId   | String | false    | A unique Id for the limit order
| price                | Number | true     |
| limitIcebergQty      | Number | false    | Used to make the `LIMIT_MAKER` leg an iceberg order.
| stopClientOrderId    | String | false    | A unique Id for the stop loss/stop loss limit leg
| stopPrice            | Number | true
| stopLimitPrice       | Number | false    | If provided, `stopLimitTimeInForce` is required.
| stopIcebergQty       | Number | false    | Used with `STOP_LOSS_LIMIT` leg to make an iceberg order.
| stopLimitTimeInForce | String | false    | `FOK`, `GTC`, `IOC`
| newOrderRespType     | String | false    | Returns more complete info of the order. `ACK`, `RESULT`, or `FULL`
| recvWindow           | Number | false    | The value cannot be greater than `60000`

Additional Info:
- Price Restrictions:
    - `SELL`: Limit Price > Last Price > Stop Price
    - `BUY`: Limit Price < Last Price < Stop Price
- Quantity Restrictions:
    - Both legs must have the same quantity.
    - ```ICEBERG``` quantities however do not have to be the same

<details>
<summary>Output</summary>

```js
{
  "orderListId": 0,
  "contingencyType": "OCO",
  "listStatusType": "EXEC_STARTED",
  "listOrderStatus": "EXECUTING",
  "listClientOrderId": "JYVpp3F0f5CAG15DhtrqLp",
  "transactionTime": 1514418413947,
  "symbol": "XLMETH",
  "orders": [
    {
      "symbol": "XLMETH",
      "orderId": 1740797,
      "clientOrderId": "1XZTVBTGS4K1e"
    },
    {
      "symbol": "XLMETH",
      "orderId": 1740798,
      "clientOrderId": "1XZTVBTGS4K1f"
    }
  ],
  "orderReports": [
    {
      "symbol": "XLMETH",
      "orderId": 1740797,
      "orderListId": 0,
      "clientOrderId": "1XZTVBTGS4K1e",
      "transactTime": 1514418413947,
      "price": "0.000000",
      "origQty": "100",
      "executedQty": "0.000000",
      "cummulativeQuoteQty": "0.000000",
      "status": "NEW",
      "timeInForce": "GTC",
      "type": "STOP_LOSS",
      "side": "SELL",
      "stopPrice": "0.0001"
    },
    {
      "symbol": "XLMETH",
      "orderId": 1740798,
      "orderListId": 0,
      "clientOrderId": "1XZTVBTGS4K1f",
      "transactTime": 1514418413947,
      "price": "0.0002",
      "origQty": "100",
      "executedQty": "0.000000",
      "cummulativeQuoteQty": "0.000000",
      "status": "NEW",
      "timeInForce": "GTC",
      "type": "LIMIT_MAKER",
      "side": "SELL"
    }
  ]
}
```

</details>

#### getOrder

Check an order's status.

```js
console.log(
  await client.getOrder({
    symbol: 'BNBETH',
    orderId: 50167927,
  }),
)
```

| Param             | Type   | Required | Description                                 |
| ----------------- | ------ | -------- | ------------------------------------------- |
| symbol            | String | true     |
| orderId           | Number | true     | Not required if `origClientOrderId` is used |
| origClientOrderId | String | false    |
| recvWindow        | Number | false    |

<details>
<summary>Output</summary>

```js
{
  clientOrderId: 'NkQnNkdBV1RGjUALLhAzNy',
  cummulativeQuoteQty: '0.16961580',
  executedQty: '3.91000000',
  icebergQty: '0.00000000',
  isWorking: true,
  orderId: 50167927,
  origQty: '3.91000000',
  price: '0.04338000',
  side: 'SELL',
  status: 'FILLED',
  stopPrice: '0.00000000',
  symbol: 'BNBETH',
  time: 1547075007821,
  timeInForce: 'GTC',
  type: 'LIMIT',
  updateTime: 1547075016737
}

```

</details>

#### getOrderOco

Retrieves a specific OCO based on provided optional parameters

```js
console.log(
  await client.getOrderOco({
    orderListId: 27,
  }),
)
```

| Param             | Type   | Required | Description                                 |
| ----------------- | ------ | -------- | ------------------------------------------- |
| orderListId       | Number | true     | Not required if `listClientOrderId` is used |
| listClientOrderId | String | false    |
| recvWindow        | Number | false    |

<details>
<summary>Output</summary>

```js
{
  orderListId: 27,
  contingencyType: 'OCO',
  listStatusType: 'EXEC_STARTED',
  listOrderStatus: 'EXECUTING',
  listClientOrderId: 'h2USkA5YQpaXHPIrkd96xE',
  transactionTime: 1565245656253,
  symbol: 'LTCBTC',
  orders: [
    {
      symbol: 'LTCBTC',
      orderId: 4,
      clientOrderId: 'qD1gy3kc3Gx0rihm9Y3xwS'
    },
    {
      symbol: 'LTCBTC',
      orderId: 5,
      clientOrderId: 'ARzZ9I00CPM8i3NhmU9Ega'
    }
  ]
}
```

</details>

#### cancelOrder

Cancels an active order.

```js
console.log(
  await client.cancelOrder({
    symbol: 'ETHBTC',
    orderId: 1,
  }),
)
```

| Param             | Type   | Required | Description                                                                |
| ----------------- | ------ | -------- | -------------------------------------------------------------------------- |
| symbol            | String | true     |
| orderId           | Number | true     | Not required if `origClientOrderId` is used                                |
| origClientOrderId | String | false    |
| newClientOrderId  | String | false    | Used to uniquely identify this cancel. Automatically generated by default. |
| recvWindow        | Number | false    |

<details>
<summary>Output</summary>

```js
{
  symbol: 'ETHBTC',
  origClientOrderId: 'bnAoRHgI18gRD80FJmsfNP',
  orderId: 1,
  clientOrderId: 'RViSsQPTp1v3WmLYpeKT11'
}
```

</details>

#### cancelOrderOco

Cancel an entire Order List.

```js
console.log(
  await client.cancelOrderOco({
    symbol: 'ETHBTC',
    orderListId: 0,
  }),
)
```

| Param             | Type   | Required | Description                                                                |
| ----------------- | ------ | -------- | -------------------------------------------------------------------------- |
| symbol            | String | true     |
| orderListId       | Number | true     | Not required if `listClientOrderId` is used                                |
| listClientOrderId | String | false    |
| newClientOrderId  | String | false    | Used to uniquely identify this cancel. Automatically generated by default. |
| recvWindow        | Number | false    |

<details>
<summary>Output</summary>

```js
{
  orderListId: 0,
  contingencyType: 'OCO',
  listStatusType: 'ALL_DONE',
  listOrderStatus: 'ALL_DONE',
  listClientOrderId: 'C3wyj4WVEktd7u9aVBRXcN',
  transactionTime: 1574040868128,
  symbol: 'LTCBTC',
  orders: [
    {
      symbol: 'LTCBTC',
      orderId: 2,
      clientOrderId: 'pO9ufTiFGg3nw2fOdgeOXa'
    },
    {
      symbol: 'LTCBTC',
      orderId: 3,
      clientOrderId: 'TXOvglzXuaubXAaENpaRCB'
    }
  ],
  orderReports: [
    {
      symbol: 'LTCBTC',
      origClientOrderId: 'pO9ufTiFGg3nw2fOdgeOXa',
      orderId: 2,
      orderListId: 0,
      clientOrderId: 'unfWT8ig8i0uj6lPuYLez6',
      price: '1.00000000',
      origQty: '10.00000000',
      executedQty: '0.00000000',
      cummulativeQuoteQty: '0.00000000',
      status: 'CANCELED',
      timeInForce: 'GTC',
      type: 'STOP_LOSS_LIMIT',
      side: 'SELL',
      stopPrice: '1.00000000'
    },
    {
      symbol: 'LTCBTC',
      origClientOrderId: 'TXOvglzXuaubXAaENpaRCB',
      orderId: 3,
      orderListId: 0,
      clientOrderId: 'unfWT8ig8i0uj6lPuYLez6',
      price: '3.00000000',
      origQty: '10.00000000',
      executedQty: '0.00000000',
      cummulativeQuoteQty: '0.00000000',
      status: 'CANCELED',
      timeInForce: 'GTC',
      type: 'LIMIT_MAKER',
      side: 'SELL'
    }
  ]
}
```

</details>

#### cancelOpenOrders

Cancels all active orders on a symbol.
This includes OCO orders.

```js
console.log(
  await client.cancelOpenOrders({
    symbol: 'ETHBTC'
  }),
)
```
| Param      | Type     | Required  |
|------------|----------|-----------|
| symbol     | String   | true      |

<details>
<summary>Output</summary>

```js
[
  {
    symbol: 'ETHBTC',
    origClientOrderId: 'bnAoRHgI18gRD80FJmsfNP',
    orderId: 1,
    clientOrderId: 'RViSsQPTp1v3WmLYpeKT11'
  },
  {
    symbol: 'ETHBTC',
    origClientOrderId: 'IDbzcGmfwSCKihxILK1snu',
    orderId: 2,
    clientOrderId: 'HKFcuWAm9euMgRuwVGR8CL'
  }
]
```

</details>

#### openOrders

Get all open orders on a symbol.

```js
console.log(
  await client.openOrders({
    symbol: 'XLMBTC',
  }),
)
```

| Param      | Type   | Required |
| ---------- | ------ | -------- |
| symbol     | String | true     |
| recvWindow | Number | false    |

<details>
<summary>Output</summary>

```js
;[
  {
    symbol: 'XLMBTC',
    orderId: 11271740,
    clientOrderId: 'ekHkROfW98gBN80LTfufQZ',
    price: '0.00001081',
    origQty: '1331.00000000',
    executedQty: '0.00000000',
    status: 'NEW',
    timeInForce: 'GTC',
    type: 'LIMIT',
    side: 'BUY',
    stopPrice: '0.00000000',
    icebergQty: '0.00000000',
    time: 1522682290485,
    isWorking: true,
  },
]
```

</details>

#### allOrders

Get all account orders on a symbol; active, canceled, or filled.

```js
console.log(
  await client.allOrders({
    symbol: 'ETHBTC',
  }),
)
```

| Param      | Type   | Required | Default | Description                                                                            |
| ---------- | ------ | -------- | ------- | -------------------------------------------------------------------------------------- |
| symbol     | String | true     |
| orderId    | Number | false    |         | If set, it will get orders >= that orderId. Otherwise most recent orders are returned. |
| limit      | Number | false    | `500`   | Max `500`                                                                              |
| recvWindow | Number | false    |

<details>
<summary>Output</summary>

```js
;[
  {
    symbol: 'ENGETH',
    orderId: 191938,
    clientOrderId: '1XZTVBTGS4K1e',
    price: '0.00138000',
    origQty: '1.00000000',
    executedQty: '1.00000000',
    status: 'FILLED',
    timeInForce: 'GTC',
    type: 'LIMIT',
    side: 'SELL',
    stopPrice: '0.00000000',
    icebergQty: '0.00000000',
    time: 1508611114735,
    isWorking: true,
  },
]
```

</details>


#### allOrdersOCO

Retrieves all OCO based on provided optional parameters

```js
console.log(
  await client.allOrdersOCO({
    timestamp: 1565245913483,
  }),
)
```

| Param      | Type    | Required | Default | Description                                               |
|------------|---------|----------|---------|-----------------------------------------------------------|
| timestamp  | Number  | true     |         |                                                           |
| startTime  | Number  | false    |         |                                                           |
| endTime    | Number  | false    |         |                                                           |
| limit      | Integer | false    | `500`   | Max `1000`                                                |
| recvWindow | Number  | false    |         | The value cannot be greater than 60000                    |
| formId     | Number  | false    |         | If supplied, neither startTime or endTime can be provided |

<details>
<summary>Output</summary>

```js
;[
  {
    "orderListId": 29,
    "contingencyType": "OCO",
    "listStatusType": "EXEC_STARTED",
    "listOrderStatus": "EXECUTING",
    "listClientOrderId": "amEEAXryFzFwYF1FeRpUoZ",
    "transactionTime": 1565245913483,
    "symbol": "LTCBTC",
    "orders": [
      {
        "symbol": "LTCBTC",
        "orderId": 4,
        "clientOrderId": "oD7aesZqjEGlZrbtRpy5zB"
      },
      {
        "symbol": "LTCBTC",
        "orderId": 5,
        "clientOrderId": "Jr1h6xirOxgeJOUuYQS7V3"
      }
    ]
  },
  {
    "orderListId": 28,
    "contingencyType": "OCO",
    "listStatusType": "EXEC_STARTED",
    "listOrderStatus": "EXECUTING",
    "listClientOrderId": "hG7hFNxJV6cZy3Ze4AUT4d",
    "transactionTime": 1565245913407,
    "symbol": "LTCBTC",
    "orders": [
      {
        "symbol": "LTCBTC",
        "orderId": 2,
        "clientOrderId": "j6lFOfbmFMRjTYA7rRJ0LP"
      },
      {
        "symbol": "LTCBTC",
        "orderId": 3,
        "clientOrderId": "z0KCjOdditiLS5ekAFtK81"
      }
    ]
  }
]
```

</details>


#### accountInfo

Get current account information.

```js
console.log(await client.accountInfo())
```

| Param      | Type   | Required |
| ---------- | ------ | -------- |
| recvWindow | Number | false    |

<details>
<summary>Output</summary>

```js
{
  makerCommission: 10,
  takerCommission: 10,
  buyerCommission: 0,
  sellerCommission: 0,
  canTrade: true,
  canWithdraw: true,
  canDeposit: true,
  balances: [
    { asset: 'BTC', free: '0.00000000', locked: '0.00000000' },
    { asset: 'LTC', free: '0.00000000', locked: '0.00000000' },
  ]
}
```

</details>

#### myTrades

Get trades for the current authenticated account and symbol.

```js
console.log(
  await client.myTrades({
    symbol: 'ETHBTC',
  }),
)
```

| Param      | Type   | Required | Default | Description                                             |
| ---------- | ------ | -------- | ------- | ------------------------------------------------------- |
| symbol     | String | true     |
| limit      | Number | false    | `500`   | Max `1000`                                              |
| fromId     | Number | false    |         | TradeId to fetch from. Default gets most recent trades. |
| orderId    | Number | false    |         | This can only be used in combination with symbol.       |
| startTime  | Number | false    |         |                                                         |
| endTime    | Number | false    |         |                                                         |
| recvWindow | Number | false    | `5000`  | The value cannot be greater than `60000`.               |

<details>
<summary>Output</summary>

```js
;[
  {
    id: 9960,
    orderId: 191939,
    price: '0.00138000',
    qty: '10.00000000',
    commission: '0.00001380',
    commissionAsset: 'ETH',
    time: 1508611114735,
    isBuyer: false,
    isMaker: false,
    isBestMatch: true,
  },
]
```

</details>

#### dailyAccountSnapshot

Get asset snapshot for the current authenticated account.

```js
console.log(
  await client.accountSnapshot({
    "type": "SPOT"
  });
)
```

| Param      | Type   | Required | Default | Description                                             |
| ---------- | ------ | -------- | ------- | ------------------------------------------------------- |
| type       | String | true     |
| startTime  | Number | false    |
| endTime    | Number | false    |
| limit      | Number | false    | `5`     | min `5`, max `30`, default `5`                          |
| recvWindow | Number | false    |

<details>
<summary>Output</summary>

```js
{
   "code":200, // 200 for success; others are error codes
   "msg":"", // error message
   "snapshotVos":[
      {
         "data":{
            "balances":[
               {
                  "asset":"BTC",
                  "free":"0.09905021",
                  "locked":"0.00000000"
               },
               {
                  "asset":"USDT",
                  "free":"1.89109409",
                  "locked":"0.00000000"
               }
            ],
            "totalAssetOfBtc":"0.09942700"
         },
         "type":"spot",
         "updateTime":1576281599000
      }
   ]
}
```

</details>

#### tradesHistory

Lookup symbol trades history.

```js
console.log(await client.tradesHistory({ symbol: 'ETHBTC' }))
```

| Param  | Type   | Required | Default | Description                                             |
| ------ | ------ | -------- | ------- | ------------------------------------------------------- |
| symbol | String | true     |
| limit  | Number | false    | `500`   | Max `500`                                               |
| fromId | Number | false    | `null`  | TradeId to fetch from. Default gets most recent trades. |

<details>
<summary>Output</summary>

```js
;[
  {
    id: 28457,
    price: '4.00000100',
    qty: '12.00000000',
    time: 1499865549590,
    isBuyerMaker: true,
    isBestMatch: true,
  },
]
```

</details>

#### withdrawHistory

Get the account withdraw history.

```js
console.log(await client.withdrawHistory())
```

| Param      | Type   | Required | Description                                                                                                |
| ---------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| asset      | String | false    |                                                                                                            |
| status     | Number | false    | 0 (0: Email Sent, 1: Cancelled 2: Awaiting Approval, 3: Rejected, 4: Processing, 5: Failure, 6: Completed) |
| offset     | Number | false    |                                                                                                            |
| limit      | Number | false    |                                                                                                            |
| startTime  | Number | false    |                                                                                                            |
| endTime    | Number | false    |                                                                                                            |
| recvWindow | Number | false    |                                                                                                            |

<details>
<summary>Output</summary>

```js
[
    {
        "address": "0x94df8b352de7f46f64b01d3666bf6e936e44ce60",
        "amount": "8.91000000",
        "applyTime": "2019-10-12 11:12:02",
        "coin": "USDT",
        "id": "b6ae22b3aa844210a7041aee7589627c",
        "withdrawOrderId": "WITHDRAWtest123", // will not be returned if there's no withdrawOrderId for this withdraw.
        "network": "ETH",
        "transferType": 0,   // 1 for internal transfer, 0 for external transfer
        "status": 6,
        "txId": "0xb5ef8c13b968a406cc62a93a8bd80f9e9a906ef1b3fcf20a2e48573c17659268"
    },
    {
        "address": "1FZdVHtiBqMrWdjPyRPULCUceZPJ2WLCsB",
        "amount": "0.00150000",
        "applyTime": "2019-09-24 12:43:45",
        "coin": "BTC",
        "id": "156ec387f49b41df8724fa744fa82719",
        "network": "BTC",
        "status": 6,
        "txId": "60fd9007ebfddc753455f95fafa808c4302c836e4d1eebc5a132c36c1d8ac354"
    }
]
```

</details>

#### withdraw

Triggers the withdraw process.

```js
console.log(
  await client.withdraw({
    coin: 'ETH',
    network: 'ETH',
    address: '0xfa97c22a03d8522988c709c24283c0918a59c795',
    amount: 100,
    // addressTag: '' // MEMO
  }),
)
```

| Param      | Type   | Required | Description                |
| ---------- | ------ | -------- | -------------------------- |
| asset      | String | true     |
| address    | String | true     |
| amount     | Number | true     |
| name       | String | false    | Description of the address |
| recvWindow | Number | false    |

<details>
<summary>Output</summary>

```js
{
    "id":"7213fea8e94b4a5593d507237e5a555b"
}
```

</details>

#### depositAddress

Fetch deposit address with network.

```js
console.log(await client.depositAddress({ coin: 'NEO' }))
```

| Param    | Type   | Required | Description      |
| -------- | ------ | -------- | ---------------- |
| coin     | String | true     | The coin name    |
| network  | String | false    | The network name |

<details>
<summary>Output</summary>

```js
{
  address: 'AM6ytPW78KYxQCmU2pHYGcee7GypZ7Yhhc',
  coin: 'NEO',
  tag: '',
  url: 'https://neoscan.io/address/AM6ytPW78KYxQCmU2pHYGcee7GypZ7Yhhc'
}
```

</details>


#### depositHistory

Fetch deposit address with network.

```js
console.log(await client.depositHistory())
```

| Param      | Type   | Required | Description      |
| ---------- | ------ | -------- | ---------------- |
| coin       | String | false    | The coin name    |
| status     | Number | false    | 0 (0:pending, 6: credited but cannot withdraw, 1:success) |
| startTime  | Number | false    | Default: 90 days from current timestamp |
| endTime    | Number | false    | Default: present timestamp |
| offset     | Number | false    | default: 0       |
| limit      | Number | false    |                  |
| recvWindow | Number | false    |                  |

<details>
<summary>Output</summary>

```js
[
    {
        "amount": "0.00999800",
        "coin": "PAXG",
        "network": "ETH",
        "status": 1,
        "address": "0x788cabe9236ce061e5a892e1a59395a81fc8d62c",
        "addressTag": "",
        "txId": "0xaad4654a3234aa6118af9b4b335f5ae81c360b2394721c019b5d1e75328b09f3",
        "insertTime": 1599621997000,
        "transferType": 0,
        "confirmTimes": "12/12"
    },
    {
        "amount": "0.50000000",
        "coin": "IOTA",
        "network": "IOTA",
        "status": 1,
        "address": "SIZ9VLMHWATXKV99LH99CIGFJFUMLEHGWVZVNNZXRJJVWBPHYWPPBOSDORZ9EQSHCZAMPVAPGFYQAUUV9DROOXJLNW",
        "addressTag": "",
        "txId": "ESBFVQUTPIWQNJSPXFNHNYHSQNTGKRVKPRABQWTAXCDWOAKDKYWPTVG9BGXNVNKTLEJGESAVXIKIZ9999",
        "insertTime": 1599620082000,
        "transferType": 0,
        "confirmTimes": "1/1"
    }
]
```

</details>

#### tradeFee

Retrieve the account trade Fee per asset.

```js
console.log(await client.tradeFee())
```

<details>
<summary>Output</summary>

```js
[
    {
      "symbol": "ADABNB",
      "makerCommission": 0.9000,
      "takerCommission": 1.0000
    },
    {
      "symbol": "BNBBTC",
      "makerCommission": 0.3000,
      "takerCommission": 0.3000
    }
]

```

</details>

#### capitalConfigs

Get information of coins (available for deposit and withdraw) for user.

```js
console.log(await client.capitalConfigs())
```

<details>
<summary>Output</summary>

```js
[
  {
    'coin': 'CTR',
    'depositAllEnable': false,
    'free': '0.00000000',
    'freeze': '0.00000000',
    'ipoable': '0.00000000',
    'ipoing': '0.00000000',
    'isLegalMoney': false,
    'locked': '0.00000000',
    'name': 'Centra',
    'networkList': [
      {
        'addressRegex': '^(0x)[0-9A-Fa-f]{40}$',
        'coin': 'CTR',
        'depositDesc': 'Delisted, Deposit Suspended',
        'depositEnable': false,
        'isDefault': true,
        'memoRegex': '',
        'minConfirm': 12,
        'name': 'ERC20',
        'network': 'ETH',
        'resetAddressStatus': false,
        'specialTips': '',
        'unLockConfirm': 0,
        'withdrawDesc': '',
        'withdrawEnable': true,
        'withdrawFee': '35.00000000',
        'withdrawIntegerMultiple': '0.00000001',
        'withdrawMax': '0.00000000',
        'withdrawMin': '70.00000000'
      }
    ],
    'storage': '0.00000000',
    'trading': false,
    'withdrawAllEnable': true,
    'withdrawing': '0.00000000'
  }
]
```

</details>

#### universalTransfer

You need to enable Permits Universal Transfer option for the api key which requests this endpoint.

```js
console.log(await client.universalTransfer({ type: 'MAIN_C2C', asset: 'USDT', amount: '1000' }))
```

| Param      | Type   | Required | Description      |
| ---------- | ------ | -------- | ---------------- |
| type       | String | true     |
| asset      | String | true     |
| amount     | String | true     |
| recvWindow | Number | false    |

<details>
<summary>Output</summary>

```js
{
  tranId:13526853623
}
```

</details>

#### universalTransferHistory

```js
console.log(await client.universalTransferHistory({ type: 'MAIN_C2C' }))
```

| Param      | Type   | Required | Description         |
| ---------- | ------ | -------- | ------------------- |
| type       | String | true     |
| startTime  | Number | false    |
| endTime    | Number | false    |
| current    | Number | false    | Default 1           |
| size       | Number | false    | Default 10, Max 100 |
| recvWindow | Number | false    |

<details>
<summary>Output</summary>

```js
{
  "total": 2,
  "rows": [
    {
      "asset":"USDT",
      "amount":"1",
      "type":"MAIN_C2C"
      "status": "CONFIRMED",
      "tranId": 11415955596,
      "timestamp":1544433328000
    },
    {
      "asset":"USDT",
      "amount":"2",
      "type":"MAIN_C2C",
      "status": "CONFIRMED",
      "tranId": 11366865406,
      "timestamp":1544433328000
    }
  ]
}
```

</details>

#### assetDetail

```js
console.log(await client.assetDetail())
```

| Param      | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| recvWindow | Number   | false    |

<details>
<summary>Output</summary>

```js
{
        "CTR": {
            "minWithdrawAmount": "70.00000000", //min withdraw amount
            "depositStatus": false,//deposit status (false if ALL of networks' are false)
            "withdrawFee": 35, // withdraw fee
            "withdrawStatus": true, //withdraw status (false if ALL of networks' are false)
            "depositTip": "Delisted, Deposit Suspended" //reason
        },
        "SKY": {
            "minWithdrawAmount": "0.02000000",
            "depositStatus": true,
            "withdrawFee": 0.01,
            "withdrawStatus": true
        }
}
```

</details>

#### getBnbBurn

```js
console.log(await client.getBnbBurn())
```

| Param      | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| recvWindow | Number   | false    | No more than 60000  |

<details>
<summary>Output</summary>

```js
{
   "spotBNBBurn":true,
   "interestBNBBurn": false
}
```

</details>

#### setBnbBurn

```js
console.log(await client.setBnbBurn({ spotBNBBurn: "true" }))
```

| Param           | Type     | Required | Description         |
| --------------- | -------- | -------- | ------------------- |
| spotBNBBurn     | String   | false    | "true" or "false"; Determines whether to use BNB to pay for trading fees on SPOT |
| interestBNBBurn | String   | false    | "true" or "false"; Determines whether to use BNB to pay for margin loan's interest  |
| recvWindow      | Number   | false    | No more than 60000 |

<details>
<summary>Output</summary>

```js
{
   "spotBNBBurn":true,
   "interestBNBBurn": false
}
```

</details>

#### dustLog

```js
console.log(await client.dustLog())
```

| Param      | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| startTime  | Number   | false    |
| endTime    | Number   | false    |
| recvWindow | Number   | false    |

<details>
<summary>Output</summary>

```js
{
        "total": 8,   //Total counts of exchange
        "userAssetDribblets": [
            {
                "operateTime": 1615985535000,
                "totalTransferedAmount": "0.00132256",
                "totalServiceChargeAmount": "0.00002699",
                "transId": 45178372831,
                "userAssetDribbletDetails": [
                    {
                        "transId": 4359321,
                        "serviceChargeAmount": "0.000009",
                        "amount": "0.0009",
                        "operateTime": 1615985535000,
                        "transferedAmount": "0.000441",
                        "fromAsset": "USDT"
                    },
                    {
                        "transId": 4359321,
                        "serviceChargeAmount": "0.00001799",
                        "amount": "0.0009",
                        "operateTime": 1615985535000,
                        "transferedAmount": "0.00088156",
                        "fromAsset": "ETH"
                    }
                ]
            },
            {
                "operateTime":1616203180000,
                "totalTransferedAmount": "0.00058795",
                "totalServiceChargeAmount": "0.000012",
                "transId": 4357015,
                "userAssetDribbletDetails": [
                    {
                        "transId": 4357015,
                        "serviceChargeAmount": "0.00001",
                        "amount": "0.001",
                        "operateTime": 1616203180000,
                        "transferedAmount": "0.00049",
                        "fromAsset": "USDT"
                    },
                    {
                        "transId": 4357015,
                        "serviceChargeAmount": "0.000002",
                        "amount": "0.0001",
                        "operateTime": 1616203180000,
                        "transferedAmount": "0.00009795",
                        "fromAsset": "ETH"
                    }
                ]
            }
        ]
    }
}
```

</details>

#### dustTransfer

```js
console.log(await client.dustTransfer({ asset: ['ETH', 'LTC', 'TRX'] }))
```

| Param      | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| asset      | [String] | true     |
| recvWindow | Number   | false    |

<details>
<summary>Output</summary>

```js
{
    "totalServiceCharge":"0.02102542",
    "totalTransfered":"1.05127099",
    "transferResult":[
        {
            "amount":"0.03000000",
            "fromAsset":"ETH",
            "operateTime":1563368549307,
            "serviceChargeAmount":"0.00500000",
            "tranId":2970932918,
            "transferedAmount":"0.25000000"
        },
        {
            "amount":"0.09000000",
            "fromAsset":"LTC",
            "operateTime":1563368549404,
            "serviceChargeAmount":"0.01548000",
            "tranId":2970932918,
            "transferedAmount":"0.77400000"
        },
        {
            "amount":"248.61878453",
            "fromAsset":"TRX",
            "operateTime":1563368549489,
            "serviceChargeAmount":"0.00054542",
            "tranId":2970932918,
            "transferedAmount":"0.02727099"
        }
    ]
}
```

</details>

#### accountCoins

Retrieve account coins related information. Implemented as `getAll` in Binance Docs.

```js
console.log(await client.accountCoins())
```

| Param      | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| recvWindow | Number   | false    |

<details>
<summary>Output</summary>

```js
[
    {
        "coin": "BTC",
        "depositAllEnable": true,
        "free": "0.08074558",
        "freeze": "0.00000000",
        "ipoable": "0.00000000",
        "ipoing": "0.00000000",
        "isLegalMoney": false,
        "locked": "0.00000000",
        "name": "Bitcoin",
        "networkList": [
            {
                "addressRegex": "^(bnb1)[0-9a-z]{38}$",
                "coin": "BTC",
                "depositDesc": "Wallet Maintenance, Deposit Suspended", // shown only when "depositEnable" is false.
                "depositEnable": false,
                "isDefault": false,
                "memoRegex": "^[0-9A-Za-z\\-_]{1,120}$",
                "minConfirm": 1,  // min number for balance confirmation
                "name": "BEP2",
                "network": "BNB",
                "resetAddressStatus": false,
                "specialTips": "Both a MEMO and an Address are required to successfully deposit your BEP2-BTCB tokens to Binance.",
                "unLockConfirm": 0,  // confirmation number for balance unlock
                "withdrawDesc": "Wallet Maintenance, Withdrawal Suspended", // shown only when "withdrawEnable" is false.
                "withdrawEnable": false,
                "withdrawFee": "0.00000220",
                "withdrawMin": "0.00000440"
            },
            {
                "addressRegex": "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^(bc1)[0-9A-Za-z]{39,59}$",
                "coin": "BTC",
                "depositEnable": true,
                "insertTime": 1563532929000,
                "isDefault": true,
                "memoRegex": "",
                "minConfirm": 1,
                "name": "BTC",
                "network": "BTC",
                "resetAddressStatus": false,
                "specialTips": "",
                "unLockConfirm": 2,
                "updateTime": 1571014804000,
                "withdrawEnable": true,
                "withdrawFee": "0.00050000",
                "withdrawIntegerMultiple": "0.00000001",
                "withdrawMin": "0.00100000"
            }
        ],
        "storage": "0.00000000",
        "trading": true,
        "withdrawAllEnable": true,
        "withdrawing": "0.00000000"
    }
]
```

</details>

#### lendingAccount

Get information of lending assets for user.

```js
console.log(await client.lendingAccount())
```

<details>
<summary>Output</summary>

```js
{
    "positionAmountVos": [
        {
            "amount": "75.46000000",
            "amountInBTC": "0.01044819",
            "amountInUSDT": "75.46000000",
            "asset": "USDT"
        },
        {
            "amount": "1.67072036",
            "amountInBTC": "0.00023163",
            "amountInUSDT": "1.67289230",
            "asset": "BUSD"
        }
    ],
    "totalAmountInBTC": "0.01067982",
    "totalAmountInUSDT": "77.13289230",
    "totalFixedAmountInBTC": "0.00000000",
    "totalFixedAmountInUSDT": "0.00000000",
    "totalFlexibleInBTC": "0.01067982",
    "totalFlexibleInUSDT": "77.13289230"
 }
```

</details>

#### fundingWallet

Query funding wallet, includes Binance Pay, Binance Card, Binance Gift Card, Stock Token.

```js
console.log(await client.fundingWallet())
```

| Param      | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| asset      | String   | false    |
| needBtcValuation      | String   | false    | 'true' or 'false'

<details>
<summary>Output</summary>

```js
[
    {
        "asset": "USDT",
        "free": "1",
        "locked": "0",
        "freeze": "0",
        "withdrawing": "0",
        "btcValuation": "0.00000091"
    }
]
```

</details>

#### apiPermission

Get API Key Permission.

```js
console.log(await client.apiPermission())
```

| Param      | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| recvWindow      | Number   | false    |

<details>
<summary>Output</summary>

```js
{
   "ipRestrict": false,
   "createTime": 1623840271000,
   "enableWithdrawals": false,   // This option allows you to withdraw via API. You must apply the IP Access Restriction filter in order to withdrawals
   "enableInternalTransfer": true,  // This option authorizes this key to transfer funds between your master account and your sub account instantly
   "permitsUniversalTransfer": true,  // Authorizes this key to be used for a dedicated universal transfer API to transfer multiple supported currencies. Each business's own transfer API rights are not affected by this authorization
   "enableVanillaOptions": false,  //  Authorizes this key to Vanilla options trading
   "enableReading": true,
   "enableFutures": false,  //  API Key created before your futures account opened does not support futures API service
   "enableMargin": false,   //  This option can be adjusted after the Cross Margin account transfer is completed
   "enableSpotAndMarginTrading": false, // Spot and margin trading
   "tradingAuthorityExpirationTime": 1628985600000  // Expiration time for spot and margin trading permission
}
```

</details>

### Margin

#### marginAccountInfo

Query cross margin account details (USER_DATA)

```js
console.log(await client.marginAccountInfo());
```

| Param | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| recvWindow | Number | false     | No more than 60000 |

<details>
<summary>Output</summary>

```js
{
      "borrowEnabled": true,
      "marginLevel": "11.64405625",
      "totalAssetOfBtc": "6.82728457",
      "totalLiabilityOfBtc": "0.58633215",
      "totalNetAssetOfBtc": "6.24095242",
      "tradeEnabled": true,
      "transferEnabled": true,
      "userAssets": [
          {
              "asset": "BTC",
              "borrowed": "0.00000000",
              "free": "0.00499500",
              "interest": "0.00000000",
              "locked": "0.00000000",
              "netAsset": "0.00499500"
          },
          {
              "asset": "BNB",
              "borrowed": "201.66666672",
              "free": "2346.50000000",
              "interest": "0.00000000",
              "locked": "0.00000000",
              "netAsset": "2144.83333328"
          },
          {
              "asset": "ETH",
              "borrowed": "0.00000000",
              "free": "0.00000000",
              "interest": "0.00000000",
              "locked": "0.00000000",
              "netAsset": "0.00000000"
          },
          {
              "asset": "USDT",
              "borrowed": "0.00000000",
              "free": "0.00000000",
              "interest": "0.00000000",
              "locked": "0.00000000",
              "netAsset": "0.00000000"
          }
      ]
}
```

</details>


#### marginLoan

Create a loan for margin account.

```js
console.log(await client.marginLoan({ asset: 'BTC', amount:'0.0001' }));
```

| Param  | Type   | Required | Description    |
| ------ | ------ | -------- | -------------- |
| asset  | String | true     | The asset name |
| amount | Number | true     |


<details>
<summary>Output</summary>

```js
{
    "tranId": 100000001 //transaction id
}
```

</details>

#### marginRepay

Repay loan for margin account.

```js
console.log(await client.marginRepay({ asset: 'BTC', amount:'0.0001' }));
```

| Param  | Type   | Required | Description    |
| ------ | ------ | -------- | -------------- |
| asset  | String | true     | The asset name |
| amount | Number | true     |


<details>
<summary>Output</summary>

```js
{
    "tranId": 100000001 //transaction id
}
```

</details>

#### marginIsolatedAccount

Query Isolated Margin Account Info

```js
console.log(await client.marginIsolatedAccount({ symbols: 'BTCUSDT'}));
```

| Param | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| symbols | String | false     | Max 5 symbols can be sent; separated by "," |
| recvWindow | Number | false     | No more than 60000 |

<details>
<summary>Output</summary>

```js
{
   "assets":[
      {
        "baseAsset":
        {
          "asset": "BTC",
          "borrowEnabled": true,
          "borrowed": "0.00000000",
          "free": "0.00000000",
          "interest": "0.00000000",
          "locked": "0.00000000",
          "netAsset": "0.00000000",
          "netAssetOfBtc": "0.00000000",
          "repayEnabled": true,
          "totalAsset": "0.00000000"
        },
        "quoteAsset":
        {
          "asset": "USDT",
          "borrowEnabled": true,
          "borrowed": "0.00000000",
          "free": "0.00000000",
          "interest": "0.00000000",
          "locked": "0.00000000",
          "netAsset": "0.00000000",
          "netAssetOfBtc": "0.00000000",
          "repayEnabled": true,
          "totalAsset": "0.00000000"
        },
        "symbol": "BTCUSDT"
        "isolatedCreated": true,
        "marginLevel": "0.00000000",
        "marginLevelStatus": "EXCESSIVE", // "EXCESSIVE", "NORMAL", "MARGIN_CALL", "PRE_LIQUIDATION", "FORCE_LIQUIDATION"
        "marginRatio": "0.00000000",
        "indexPrice": "10000.00000000"
        "liquidatePrice": "1000.00000000",
        "liquidateRate": "1.00000000"
        "tradeEnabled": true
      }
    ],
    "totalAssetOfBtc": "0.00000000",
    "totalLiabilityOfBtc": "0.00000000",
    "totalNetAssetOfBtc": "0.00000000"
}
```

</details>

#### disableMarginAccount

Inactive Isolated Margin trading pair for symbol

```js
console.log(await client.disableMarginAccount({ symbol: 'BTCUSDT' }));
```

| Param | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| symbol | String | true     |  |
| recvWindow | Number | false     | No more than 60000 |

<details>
<summary>Output</summary>

```js
{
   "success": true,
   "symbol": "BTCUSDT"
}
```

</details>
#### enableMarginAccount

Active Isolated Margin trading pair for symbol

```js
console.log(await client.enableMarginAccount({ symbol: 'BTCUSDT' }));
```

| Param | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| symbol | String | true     |  |
| recvWindow | Number | false     | No more than 60000 |

<details>
<summary>Output</summary>

```js
{
   "success": true,
   "symbol": "BTCUSDT"
}
```

</details>

#### marginMaxBorrow

If isolatedSymbol is not sent, crossed margin data will be sent.

```js
console.log(await client.marginMaxBorrow({ asset: 'BTC', isolatedSymbol: 'BTCUSDT'}));
```

| Param | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| asset | String | true     |
| isolatedSymbol| String | false |
| recvWindow | Number | false     | No more than 60000 |

<details>
<summary>Output</summary>

```js
{
  "amount": "1.69248805", // account's currently max borrowable amount with sufficient system availability
  "borrowLimit": "60" // max borrowable amount limited by the account level
}
```

</details>

#### marginCreateIsolated

```js
console.log(await client.marginCreateIsolated({ base: 'BTC', quote: 'USDT'}));
```

| Param      | Type   | Required | Description           |
| ---------- | ------ | -------- | --------------------- |
| base       | String | true     | Base asset of symbol  |
| quote      | String | true     | Quote asset of symbol |
| recvWindow | Number | false    | No more than 60000    |

<details>
<summary>Output</summary>

```js
{
    "success": true,
    "symbol": "BTCUSDT"
}
```
</details>

#### marginIsolatedTransfer

```js
console.log(await client.marginIsolatedTransfer({ asset: 'USDT', symbol: 'BNBUSDT', transFrom: 'ISOLATED_MARGIN', transTo: 'SPOT', amount: 1}));
```

| Param      | Type   | Required | Description               |
| ---------- | ------ | -------- | ------------------------- |
| asset      | String | true     | asset,such as BTC         |
| symbol     | String | true     |
| transFrom  | String | true     | "SPOT", "ISOLATED_MARGIN" |
| transTo    | String | true     | "SPOT", "ISOLATED_MARGIN" |
| amount     | Number | true     |
| recvWindow | Number | false    | No more than 60000        |

<details>
<summary>Output</summary>

```js
{
    //transaction id
    "tranId": 100000001
}
```

</details>

#### marginIsolatedTransferHistory

```js
console.log(await client.marginIsolatedTransferHistory({ symbol: 'BNBUSDT'}));
```

| Param      | Type   | Required | Description               |
| ---------- | ------ | -------- | ------------------------- |
| asset      | String | false    | asset,such as BTC         |
| symbol     | String | true     |
| transFrom  | String | false    | "SPOT", "ISOLATED_MARGIN" |
| transTo    | String | false    | "SPOT", "ISOLATED_MARGIN" |
| startTime  | Number | false    |
| endTime    | Number | false    |
| current    | Number | false    | Current page, default 1   |
| size       | Number | false    | Default 10, max 100       |
| recvWindow | Number | false    | No more than 60000        |

<details>
<summary>Output</summary>

```js
{
  "rows": [
    {
      "amount": "0.10000000",
      "asset": "BNB",
      "status": "CONFIRMED",
      "timestamp": 1566898617000,
      "txId": 5240372201,
      "transFrom": "SPOT",
      "transTo": "ISOLATED_MARGIN"
    },
    {
      "amount": "5.00000000",
      "asset": "USDT",
      "status": "CONFIRMED",
      "timestamp": 1566888436123,
      "txId": 5239810406,
      "transFrom": "ISOLATED_MARGIN",
      "transTo": "SPOT"
    }
  ],
  "total": 2
}
```

</details>

#### marginOrder

```js
console.log(await client.marginOrder({
  symbol: 'BTCUSDT',
  type: 'MARKET',
  side: 'SELL',
  quantity: '10',
  }));
```

| Param             | Type    | Required | Description               |
| ----------------- | ------- | -------- | ------------------------- |
| symbol            | String  | true     | asset, such as `BTC`      |
| isIsolated        | String  | false    | for isolated margin or not, `TRUE`, `FALSE`, default `FALSE`
| side              | String  | true     | `BUY` `SELL` |
| type              | String  | true     |
| quantity          | String  | false    |
| quoteOrderQty     | String  | false    |
| price             | String  | false    |
| stopPrice         | String  | false    | Used with `STOP_LOSS`, `STOP_LOSS_LIMIT`, `TAKE_PROFIT`, and `TAKE_PROFIT_LIMIT` orders.
| newClientOrderId  | String  | false    | A unique id among open orders. Automatically generated if not sent.
| icebergQty        | Boolean | false    | Used with `LIMIT`, `STOP_LOSS_LIMIT`, and `TAKE_PROFIT_LIMIT` to create an iceberg order.
| newOrderRespType  | String  | false    | Set the response JSON. `ACK`, `RESULT`, or `FULL`; `MARKET` and `LIMIT` order types default to `FULL`, all other orders default to `ACK`.
| sideEffectType    | String  | false    | `NO_SIDE_EFFECT`, `MARGIN_BUY`, `AUTO_REPAY`; default `NO_SIDE_EFFECT`.
| timeInForce       | String  | false    | `GTC`,`IOC`,`FOK`        |
| recvWindow        | Number  | false    | No more than 60000        |

<details>
<summary>Output</summary>

```js
{
  "symbol": "BTCUSDT",
  "orderId": 28,
  "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
  "transactTime": 1507725176595,
  "price": "1.00000000",
  "origQty": "10.00000000",
  "executedQty": "10.00000000",
  "cummulativeQuoteQty": "10.00000000",
  "status": "FILLED",
  "timeInForce": "GTC",
  "type": "MARKET",
  "side": "SELL",
  "marginBuyBorrowAmount": 5,       // will not return if no margin trade happens
  "marginBuyBorrowAsset": "BTC",    // will not return if no margin trade happens
  "isIsolated": true,       // if isolated margin
  "fills": [
    {
      "price": "4000.00000000",
      "qty": "1.00000000",
      "commission": "4.00000000",
      "commissionAsset": "USDT"
    },
    {
      "price": "3999.00000000",
      "qty": "5.00000000",
      "commission": "19.99500000",
      "commissionAsset": "USDT"
    },
    {
      "price": "3998.00000000",
      "qty": "2.00000000",
      "commission": "7.99600000",
      "commissionAsset": "USDT"
    },
    {
      "price": "3997.00000000",
      "qty": "1.00000000",
      "commission": "3.99700000",
      "commissionAsset": "USDT"
    },
    {
      "price": "3995.00000000",
      "qty": "1.00000000",
      "commission": "3.99500000",
      "commissionAsset": "USDT"
    }
  ]
}
```

</details>

#### marginCancelOrder

Cancels an active margin order.

```js
console.log(
  await client.marginCancelOrder({
    symbol: 'ETHBTC',
    orderId: 1,
  }),
)
```

| Param             | Type   | Required | Description                                                                |
| ----------------- | ------ | -------- | -------------------------------------------------------------------------- |
| symbol            | String | true     |
| orderId           | Number | true     | Not required if `origClientOrderId` is used                                |
| origClientOrderId | String | false    |
| newClientOrderId  | String | false    | Used to uniquely identify this cancel. Automatically generated by default. |
| recvWindow        | Number | false    |

<details>
<summary>Output</summary>

```js
{
  symbol: "LTCBTC",
  orderId: 28,
  origClientOrderId: "myOrder1",
  clientOrderId: "cancelMyOrder1",
  price: "1.00000000",
  origQty: "10.00000000",
  executedQty: "8.00000000",
  cummulativeQuoteQty: "8.00000000",
  status: "CANCELED",
  timeInForce: "GTC",
  type: "LIMIT",
  side: "SELL"
}
```

</details>

#### marginOrderOco

```js
console.log(await client.marginOrderOco({
  symbol: 'AUDIOUSDT',
  type: 'MARKET',
  side: 'SELL',
  quantity: '10',
  }));
```

| Param             | Type    | Required | Description               |
| ----------------- | ------- | -------- | ------------------------- |
| symbol            | String  | true     | asset, such as `BTC`      |
| isIsolated        | String  | false    | for isolated margin or not, `TRUE`, `FALSE`, default `FALSE`
| side              | String  | true     | `BUY` `SELL` |
| type              | String  | true     |
| quantity          | String  | false    |
| quoteOrderQty     | String  | false    |
| price             | String  | false    |
| stopPrice         | String  | false    | Used with `STOP_LOSS`, `STOP_LOSS_LIMIT`, `TAKE_PROFIT`, and `TAKE_PROFIT_LIMIT` orders.
| stopLimitPrice    | String  | false    | Used with `STOP_LOSS_LIMIT` orders.
| newClientOrderId  | String  | false    | A unique id among open orders. Automatically generated if not sent.
| icebergQty        | Boolean | false    | Used with `LIMIT`, `STOP_LOSS_LIMIT`, and `TAKE_PROFIT_LIMIT` to create an iceberg order.
| newOrderRespType  | String  | false    | Set the response JSON. `ACK`, `RESULT`, or `FULL`; `MARKET` and `LIMIT` order types default to `FULL`, all other orders default to `ACK`.
| sideEffectType    | String  | false    | `NO_SIDE_EFFECT`, `MARGIN_BUY`, `AUTO_REPAY`; default `NO_SIDE_EFFECT`.
| timeInForce       | String  | false    | `GTC`,`IOC`,`FOK`        |
| recvWindow        | Number  | false    | No more than 60000        |

<details>
<summary>Output</summary>

```js
{
  "orderListId": 45514668,
  "contingencyType": 'OCO',
  "listStatusType": 'EXEC_STARTED',
  "listOrderStatus": 'EXECUTING',
  "listClientOrderId": 'CD9UzEJfmcGZ4kLfZT2ga2',
  "transactionTime": 1632192162785,
  "symbol": 'AUDIOUSDT',
  "isIsolated": true,
  "orders": [
    {
      "symbol": 'AUDIOUSDT',
      "orderId": 239313661,
      "clientOrderId": 'ZbUwgKv6UB8eMzf2yfXENl'
    },
    {
      "symbol": 'AUDIOUSDT',
      "orderId": 239313662,
      "clientOrderId": 'f5u1RIHAPRd4W3fFhFykBo'
    }
  ],
  "orderReports": [
    {
      "symbol": 'AUDIOUSDT',
      "orderId": 239313661,
      "orderListId": 45514668,
      "clientOrderId": 'ZbUwgKv6UB8eMzf2yfXENl',
      "transactTime": 1632192162785,
      "price": '2.20000000',
      "origQty": '12.80000000',
      "executedQty": '0',
      "cummulativeQuoteQty": '0',
      "status": 'NEW',
      "timeInForce": 'GTC',
      "type": 'STOP_LOSS_LIMIT',
      "side": 'SELL',
      "stopPrice": '2.20000000'
    },
    {
      "symbol": 'AUDIOUSDT',
      "orderId": 239313662,
      "orderListId": 45514668,
      "clientOrderId": 'f5u1RIHAPRd4W3fFhFykBo',
      "transactTime": 1632192162785,
      "price": '2.50000000',
      "origQty": '12.80000000',
      "executedQty": '0',
      "cummulativeQuoteQty": '0',
      "status": 'NEW',
      "timeInForce": 'GTC',
      "type": 'LIMIT_MAKER',
      "side": 'SELL'
    }
  ]
}
```

</details>

#### marginOpenOrders

Query Margin Account's Open Orders

```js
console.log(
  await client.marginOpenOrders({
    symbol: 'XLMBTC',
  }),
)
```

| Param      | Type   | Required |
| ---------- | ------ | -------- |
| symbol     | String | false    |
| isIsolated | String | false    |
| recvWindow | Number | false    |

<details>
<summary>Output</summary>

```js
;[
  {
    clientOrderId: "qhcZw71gAkCCTv0t0k8LUK",
    cummulativeQuoteQty: "0.00000000",
    executedQty: "0.00000000",
    icebergQty: "0.00000000",
    isWorking: true,
    orderId: 211842552,
    origQty: "0.30000000",
    price: "0.00475010",
    side: "SELL",
    status: "NEW",
    stopPrice: "0.00000000",
    symbol: "BNBBTC",
    isIsolated: true,
    time: 1562040170089,
    timeInForce: "GTC",
    type: "LIMIT",
    selfTradePreventionMode: "NONE",
    updateTime: 1562040170089
	}
]
```

</details>

#### marginCancelOpenOrders

Cancels all active orders on a symbol for margin account.
This includes OCO orders.

```js
console.log(
  await client.marginCancelOpenOrders({
    symbol: 'ETHBTC'
  }),
)
```
| Param      | Type     | Required  |
|------------|----------|-----------|
| symbol     | String   | true      |
| isIsolated | String   | false     |

<details>
<summary>Output</summary>

```js
[
  {
    symbol: 'ETHBTC',
    isIsolated: false,
    origClientOrderId: 'bnAoRHgI18gRD80FJmsfNP',
    orderId: 1,
    clientOrderId: 'RViSsQPTp1v3WmLYpeKT11'
  },
  {
    symbol: 'ETHBTC',
    isIsolated: false,
    origClientOrderId: 'IDbzcGmfwSCKihxILK1snu',
    orderId: 2,
    clientOrderId: 'HKFcuWAm9euMgRuwVGR8CL'
  }
]
```

</details>

#### marginGetOrder

Query Margin Account's Order

```js
console.log(await client.marginGetOrder({
  symbol: 'BNBBTC',
  orderId: '213205622',
  }));
```

| Param                | Type   | Required | Description               |
| -------------------- | ------ | -------- | ------------------------- |
| symbol               | String | true     | asset,such as BTC         |
| isIsolated           | String | false    | for isolated margin or not, `TRUE`, `FALSE`, default `FALSE`
| orderId              | String | false    |
| origClientOrderId    | String | false    |
| recvWindow           | Number | false    | The value cannot be greater than `60000`

<details>
<summary>Output</summary>

```js
{
   "clientOrderId": "ZwfQzuDIGpceVhKW5DvCmO",
   "cummulativeQuoteQty": "0.00000000",
   "executedQty": "0.00000000",
   "icebergQty": "0.00000000",
   "isWorking": true,
   "orderId": 213205622,
   "origQty": "0.30000000",
   "price": "0.00493630",
   "side": "SELL",
   "status": "NEW",
   "stopPrice": "0.00000000",
   "symbol": "BNBBTC",
   "isIsolated": true,
   "time": 1562133008725,
   "timeInForce": "GTC",
   "type": "LIMIT",
   "updateTime": 1562133008725
}
```

</details>

#### marginGetOrderOco

Retrieves a specific Margin OCO based on provided optional parameters

```js
console.log(
  await client.getMarginOrderOco({
    orderListId: 27,
  }),
)
```

| Param             | Type   | Required | Description                                 |
| ----------------- | ------ | -------- | ------------------------------------------- |
| orderListId       | Number | true     | Not required if `listClientOrderId` is used |
| symbol            | Boolean| false    | mandatory for isolated margin, not supported for cross margin
| isIsolated        | Boolean| false    |
| listClientOrderId | String | false    |
| recvWindow        | Number | false    |

<details>
<summary>Output</summary>

```js
{
  orderListId: 27,
  contingencyType: 'OCO',
  listStatusType: 'EXEC_STARTED',
  listOrderStatus: 'EXECUTING',
  listClientOrderId: 'h2USkA5YQpaXHPIrkd96xE',
  transactionTime: 1565245656253,
  symbol: 'LTCBTC',
  isIsolated: false,
  orders: [
    {
      symbol: 'LTCBTC',
      orderId: 4,
      clientOrderId: 'qD1gy3kc3Gx0rihm9Y3xwS'
    },
    {
      symbol: 'LTCBTC',
      orderId: 5,
      clientOrderId: 'ARzZ9I00CPM8i3NhmU9Ega'
    }
  ]
}
```
</details>

### Portfolio Margin Endpoints

Only Portfolio Margin Account is accessible to these endpoints.

#### getPortfolioMarginAccountInfo

Get a Portfolio Margin Account Info.

```js
console.log(await client.getPortfolioMarginAccountInfo())
```

<details>
<summary>Output</summary>

```js
{
    "uniMMR": "1.87987800",        // Portfolio margin account maintenance margin rate
    "accountEquity": "122607.35137903",   // Account equity, unit：USD
    "accountMaintMargin": "23.72469206", // Portfolio margin account maintenance margin, unit：USD
    "accountStatus": "NORMAL"   // Portfolio margin account status:"NORMAL", "MARGIN_CALL", "SUPPLY_MARGIN", "REDUCE_ONLY", "ACTIVE_LIQUIDATION", "FORCE_LIQUIDATION", "BANKRUPTED"
}
```
</details>

### Futures Authenticated REST endpoints

#### futuresGetOrder

Check an order's status.

- These orders will not be found
  - order status is CANCELED or EXPIRED, <b>AND</b>
  - order has NO filled trade, <b>AND</b>
  - created time + 7 days < current time


| Name              | Type   | Mandatory | Description      |
| ----------------- | ------ | --------  | ---------------- |
| symbol            | STRING | YES       | The pair name    |
| orderId           | LONG   | NO        |                  |
| origClientOrderId | STRING | NO        |                  |
| recvWindow        | LONG   | NO        |                  |


Either <b>orderId</b> or <b>origClientOrderId</b> must be sent.

```js
console.log(
  await client.futuresGetOrder({
    symbol: 'BNBETH',
    orderId: 50167927,
  })
)
```

<details>
<summary>Output</summary>

```js
{
    "avgPrice": "0.00000",
    "clientOrderId": "abc",
    "cumQuote": "0",
    "executedQty": "0",
    "orderId": 1917641,
    "origQty": "0.40",
    "origType": "TRAILING_STOP_MARKET",
    "price": "0",
    "reduceOnly": false,
    "side": "BUY",
    "positionSide": "SHORT",
    "status": "NEW",
    "stopPrice": "9300",                // please ignore when order type is TRAILING_STOP_MARKET
    "closePosition": false,             // if Close-All
    "symbol": "BTCUSDT",
    "time": 1579276756075,              // order time
    "timeInForce": "GTC",
    "type": "TRAILING_STOP_MARKET",
    "activatePrice": "9020",            // activation price, only return with TRAILING_STOP_MARKET order
    "priceRate": "0.3",                 // callback rate, only return with TRAILING_STOP_MARKET order
    "updateTime": 1579276756075,        // update time
    "workingType": "CONTRACT_PRICE",
    "priceProtect": false               // if conditional order trigger is protected
}
```
</details>

#### futuresAllOrders

Get all account orders; active, canceled, or filled.

- These orders will not be found
  - order status is CANCELED or EXPIRED, <b>AND</b>
  - order has NO filled trade, <b>AND</b>
  - created time + 7 days < current time

| Name              | Type   | Mandatory | Description            |
| ----------------- | ------ | --------  | ---------------------- |
| symbol            | STRING | YES       | The pair name          |
| orderId           | LONG   | NO        |                        |
| startTime         | LONG   | NO        |                        |
| endTime           | LONG   | NO        |                        |
| limit             | INT    | NO        | Default 500; max 1000. |
| recvWindow        | LONG   | NO        |                        |

If <b>orderId</b> is set, it will get orders >= that <b>orderId</b>. Otherwise most recent orders are returned.

```js
console.log(
  await client.futuresAllOrders({
    symbol: 'BNBETH',
    orderId: 50167927,
    startTime: 1579276756075,
    limit: 700,
  })
)
```

<details>
<summary>Output</summary>

```js
[
  {
    "avgPrice": "0.00000",
    "clientOrderId": "abc",
    "cumQuote": "0",
    "executedQty": "0",
    "orderId": 1917641,
    "origQty": "0.40",
    "origType": "TRAILING_STOP_MARKET",
    "price": "0",
    "reduceOnly": false,
    "side": "BUY",
    "positionSide": "SHORT",
    "status": "NEW",
    "stopPrice": "9300",                // please ignore when order type is TRAILING_STOP_MARKET
    "closePosition": false,             // if Close-All
    "symbol": "BTCUSDT",
    "time": 1579276756075,              // order time
    "timeInForce": "GTC",
    "type": "TRAILING_STOP_MARKET",
    "activatePrice": "9020",            // activation price, only return with TRAILING_STOP_MARKET order
    "priceRate": "0.3",                 // callback rate, only return with TRAILING_STOP_MARKET order
    "updateTime": 1579276756075,        // update time
    "workingType": "CONTRACT_PRICE",
    "priceProtect": false               // if conditional order trigger is protected
  }
]
```
</details>

#### futuresBatchOrders

Place multiple orders

| Name                  | Type   | Mandatory | Description                                                                               |
|-----------------------|--------|-----------|-------------------------------------------------------------------------------------------|
| batchOrders           | LIST   | YES       | order list. Max 5 orders                                                                             |



#### futuresCancelBatchOrders

Cancel multiple orders

| Name                  | Type   | Mandatory | Description                                                                               |
|-----------------------|--------|-----------|-------------------------------------------------------------------------------------------|
| symbol                | STRING | YES       | The pair name                                                                             |
| orderIdList           | STRING | NO        | max length 10<br/>e.g. `'[1234567,2345678]'`                                                |
| origClientOrderIdList | STRING | NO        | max length 10<br/> e.g. `'["my_id_1","my_id_2"]'`, encode the double quotes. No space after comma. |


#### futuresLeverage

Change user's initial leverage of specific symbol market.


| Name              | Type   | Mandatory | Description                                |
| ----------------- | ------ | --------  | ------------------------------------------ |
| symbol            | STRING | YES       | The pair name                              |
| leverage          | INT    | YES       | target initial leverage: int from 1 to 125 |
| recvWindow        | LONG   | NO        |                                            |

```js
console.log(
  await client.futuresLeverage({
    symbol: 'BTCUSDT',
    leverage: 21,
  })
)
```

<details>
<summary>Output</summary>

```js
{
    "leverage": 21,
    "maxNotionalValue": "1000000",
    "symbol": "BTCUSDT"
}
```
</details>

#### futuresMarginType

Change margin type.

| Name              | Type   | Mandatory | Description       |
| ----------------- | ------ | --------  | ----------------- |
| symbol            | STRING | YES       | The pair name     |
| marginType        | ENUM   | YES       | ISOLATED, CROSSED |
| recvWindow        | LONG   | NO        |                   |

```js
console.log(
  await client.futuresMarginType({
    symbol: 'BTCUSDT',
    marginType: 'ISOLATED',
  })
)
```

<details>
<summary>Output</summary>

```js
{
    "code": 200,
    "msg": "success"
}
```
</details>

#### futuresPositionMargin

Modify isolated position margin.

| Name              | Type    | Mandatory | Description                                       |
| ----------------- | ------- | --------  | ------------------------------------------------- |
| symbol            | STRING  | YES       | The pair name                                     |
| positionSide      | ENUM    | NO        | Default BOTH for One-way Mode; <br>LONG or SHORT for Hedge Mode. <br>It must be sent with Hedge Mode. |
| amount            | DECIMAL | YES       |                                                   |
| type              | INT     | YES       | 1: Add position margin，2: Reduce position margin |
| recvWindow        | LONG    | NO        |                                                   |

Only for isolated symbol.

```js
console.log(
  await client.futuresPositionMargin({
    symbol: 'BTCUSDT',
    amount: 100,
    type: 1,
  })
)
```

<details>
<summary>Output</summary>

```js
{
    "amount": 100.0,
    "code": 200,
    "msg": "Successfully modify position margin.",
    "type": 1
}
```
</details>

#### futuresMarginHistory

Get position margin change history.

| Name              | Type   | Mandatory | Description                                       |
| ----------------- | ------ | --------  | ------------------------------------------------- |
| symbol            | STRING | YES       | The pair name                                     |
| type              | INT    | NO        | 1: Add position margin，2: Reduce position margin |
| startTime         | LONG   | NO        |                                                   |
| endTime           | LONG   | NO        |                                                   |
| limit             | INT    | NO        | Default 500;                                      |
| recvWindow        | LONG   | NO        |                                                   |

```js
console.log(
  await client.futuresMarginHistory({
    symbol: 'BTCUSDT',
    type: 1,
    startTime: 1579276756075,
    limit: 700,
  })
)
```

<details>
<summary>Output</summary>

```js
[
    {
        "amount": "23.36332311",
        "asset": "USDT",
        "symbol": "BTCUSDT",
        "time": 1578047897183,
        "type": 1,
        "positionSide": "BOTH"
    },
    {
        "amount": "100",
        "asset": "USDT",
        "symbol": "BTCUSDT",
        "time": 1578047900425,
        "type": 1,
        "positionSide": "LONG"
    }
]
```
</details>

#### futuresIncome

Get income history.

| Name              | Type   | Mandatory | Description                                       |
| ----------------- | ------ | --------  | ------------------------------------------------- |
| symbol            | STRING | NO        | The pair name                                     |
| incomeType        | STRING | NO        | "TRANSFER"，"WELCOME_BONUS", "REALIZED_PNL"，<br>"FUNDING_FEE", "COMMISSION", and "INSURANCE_CLEAR" |
| startTime         | LONG   | NO        | Timestamp in ms to get funding from INCLUSIVE.    |
| endTime           | LONG   | NO        | Timestamp in ms to get funding until INCLUSIVE.   |
| limit             | INT    | NO        | Default 100; max 1000                             |
| recvWindow        | LONG   | NO        |                                                   |

- If incomeType is not sent, all kinds of flow will be returned
- "trandId" is unique in the same incomeType for a user

```js
console.log(
  await client.futuresIncome({
    symbol: 'BTCUSDT',
    startTime: 1579276756075,
    limit: 700,
  })
)
```

<details>
<summary>Output</summary>

```js
[
    {
        "symbol": "",                   // trade symbol, if existing
        "incomeType": "TRANSFER",       // income type
        "income": "-0.37500000",        // income amount
        "asset": "USDT",                // income asset
        "info":"TRANSFER",              // extra information
        "time": 1570608000000,
        "tranId":"9689322392",          // transaction id
        "tradeId":""                    // trade id, if existing
    },
    {
        "symbol": "BTCUSDT",
        "incomeType": "COMMISSION",
        "income": "-0.01000000",
        "asset": "USDT",
        "info":"COMMISSION",
        "time": 1570636800000,
        "tranId":"9689322392",
        "tradeId":"2059192"
    }
]
```
</details>

#### futuresAccountBalance

Get futures account balance

```js
console.log(await client.futuresAccountBalance());
```

<details>
<summary>Output</summary>

```js
[
  {
    "accountAlias": "SgsR",    // unique account code
    "asset": "USDT",    // asset name
    "balance": "122607.35137903", // wallet balance
    "crossWalletBalance": "23.72469206", // crossed wallet balance
    "crossUnPnl": "0.00000000"  // unrealized profit of crossed positions
    "availableBalance": "23.72469206",       // available balance
    "maxWithdrawAmount": "23.72469206"     // maximum amount for transfer out
  }
]
```

</details>

#### futuresUserTrades

Get trades for a specific account and symbol.

```js
console.log(
  await client.futuresUserTrades({
    symbol: 'ETHBTC',
  }),
)
```

| Param      | Type   | Mandatory | Description                                              |
| ---------- | ------ | --------- | -------------------------------------------------------- |
| symbol     | STRING | YES       |                                                          |
| startTime  | LONG   | NO        |                                                          |
| endTime    | LONG   | NO        |                                                          |
| limit      | INT    | NO        | Default 500; max 1000.                                   |
| fromId     | LONG   | NO        | Trade id to fetch from. Default gets most recent trades. |
| recvWindow | LONG   | NO        |                                                          |

<details>
<summary>Output</summary>

```js
[
  {
    "buyer": false,
    "commission": "-0.07819010",
    "commissionAsset": "USDT",
    "id": 698759,
    "maker": false,
    "orderId": 25851813,
    "price": "7819.01",
    "qty": "0.002",
    "quoteQty": "15.63802",
    "realizedPnl": "-0.91539999",
    "side": "SELL",
    "positionSide": "SHORT",
    "symbol": "BTCUSDT",
    "time": 1569514978020
  }
]
```

</details>

#### futuresLeverageBracket

Get notional and leverage brackets.

```js
console.log(
  await client.futuresLeverageBracket({
    symbol: 'ETHBTC', // Optional
  }),
)
```

| Param      | Type   | Mandatory | Description                                               |
| ---------- | ------ | --------- | ----------------------------------------------------------|
| symbol     | STRING | NO        | Use if you are only interested in brackets for one symbol |
| recvWindow | LONG   | NO        |                                                           |

<details>
<summary>Output</summary>

```js
[
    {
        "symbol": "ETHUSDT",
        "brackets": [
            {
                "bracket": 1,   // Notional bracket
                "initialLeverage": 75,  // Max initial leverage for this bracket
                "notionalCap": 10000,  // Cap notional of this bracket
                "notionalFloor": 0,  // Notional threshold of this bracket
                "maintMarginRatio": 0.0065, // Maintenance ratio for this bracket
                "cum":0 // Auxiliary number for quick calculation

            },
        ]
    }
]
```
</details>

### Delivery Authenticated REST endpoints

#### deliveryGetOrder

Check an order's status.

- These orders will not be found
  - order status is CANCELED or EXPIRED, <b>AND</b>
  - order has NO filled trade, <b>AND</b>
  - created time + 7 days < current time


| Name              | Type   | Mandatory | Description      |
| ----------------- | ------ | --------  | ---------------- |
| symbol            | STRING | YES       |                  |
| orderId           | LONG   | NO        |                  |
| origClientOrderId | STRING | NO        |                  |
| recvWindow        | LONG   | NO        |                  |


Either <b>orderId</b> or <b>origClientOrderId</b> must be sent.

```js
console.log(
  await client.deliveryGetOrder({
    symbol: 'BTCUSD_200925',
    orderId: 1917641,
  })
)
```

<details>
<summary>Output</summary>

```js
{
    "avgPrice": "0.0",
    "clientOrderId": "abc",
    "cumBase": "0",
    "executedQty": "0",
    "orderId": 1917641,
    "origQty": "0.40",
    "origType": "TRAILING_STOP_MARKET",
    "price": "0",
    "reduceOnly": false,
    "side": "BUY",
    "status": "NEW",
    "stopPrice": "9300",                // please ignore when order type is TRAILING_STOP_MARKET
    "closePosition": false,             // if Close-All
    "symbol": "BTCUSD_200925",
    "pair": "BTCUSD",
    "time": 1579276756075,              // order time
    "timeInForce": "GTC",
    "type": "TRAILING_STOP_MARKET",
    "activatePrice": "9020",            // activation price, only return with TRAILING_STOP_MARKET order
    "priceRate": "0.3",                 // callback rate, only return with TRAILING_STOP_MARKET order
    "updateTime": 1579276756075,        // update time
    "workingType": "CONTRACT_PRICE",
    "priceProtect": false               // if conditional order trigger is protected
}
```
</details>

#### deliveryAllOrders

Get all account orders; active, canceled, or filled.

- These orders will not be found
  - order status is CANCELED or EXPIRED, <b>AND</b>
  - order has NO filled trade, <b>AND</b>
  - created time + 7 days < current time

| Name              | Type   | Mandatory | Description            |
| ----------------- | ------ | --------  | ---------------------- |
| symbol            | STRING | YES       | The pair name          |
| orderId           | LONG   | NO        |                        |
| startTime         | LONG   | NO        |                        |
| endTime           | LONG   | NO        |                        |
| limit             | INT    | NO        | Default 500; max 1000. |
| recvWindow        | LONG   | NO        |                        |

If <b>orderId</b> is set, it will get orders >= that <b>orderId</b>. Otherwise most recent orders are returned.

```js
console.log(
  await client.deliveryAllOrders({ symbol: 'BTCUSD_200925' })
)
```

<details>
<summary>Output</summary>

```js
[
  {
    "avgPrice": "0.0",
    "clientOrderId": "abc",
    "cumBase": "0",
    "executedQty": "0",
    "orderId": 1917641,
    "origQty": "0.40",
    "origType": "TRAILING_STOP_MARKET",
    "price": "0",
    "reduceOnly": false,
    "side": "BUY",
    "positionSide": "SHORT",
    "status": "NEW",
    "stopPrice": "9300",                // please ignore when order type is TRAILING_STOP_MARKET
    "closePosition": false,             // if Close-All
    "symbol": "BTCUSD_200925",
    "pair": "BTCUSD",
    "time": 1579276756075,              // order time
    "timeInForce": "GTC",
    "type": "TRAILING_STOP_MARKET",
    "activatePrice": "9020",            // activation price, only return with TRAILING_STOP_MARKET order
    "priceRate": "0.3",                 // callback rate, only return with TRAILING_STOP_MARKET order
    "updateTime": 1579276756075,        // update time
    "workingType": "CONTRACT_PRICE",
    "priceProtect": false               // if conditional order trigger is protected
  }
  ...
]
```
</details>

#### deliveryBatchOrders

Place multiple orders

| Name                  | Type   | Mandatory | Description                                                                               |
|-----------------------|--------|-----------|-------------------------------------------------------------------------------------------|
| batchOrders           | LIST   | YES       | order list. Max 5 orders                                                                             |



#### deliveryCancelBatchOrders

Cancel multiple orders

| Name                  | Type   | Mandatory | Description                                                                               |
|-----------------------|--------|-----------|-------------------------------------------------------------------------------------------|
| symbol                | STRING | YES       | The pair name                                                                             |
| orderIdList           | STRING | NO        | max length 10<br/>e.g. `'[1234567,2345678]'`                                                |
| origClientOrderIdList | STRING | NO        | max length 10<br/> e.g. `'["my_id_1","my_id_2"]'`, encode the double quotes. No space after comma. |


#### deliveryLeverage

Change user's initial leverage of specific symbol market.


| Name              | Type   | Mandatory | Description                                |
| ----------------- | ------ | --------  | ------------------------------------------ |
| symbol            | STRING | YES       | The pair name                              |
| leverage          | INT    | YES       | target initial leverage: int from 1 to 125 |
| recvWindow        | LONG   | NO        |                                            |

```js
console.log(
  await client.deliveryLeverage({
    symbol: 'BTCUSD_200925',
    leverage: 21,
  })
)
```

<details>
<summary>Output</summary>

```js
{
    "leverage": 21,
    "maxQty": "1000",  // maximum quantity of base asset
    "symbol": "BTCUSD_200925"
}
```
</details>

#### deliveryMarginType

Change margin type.

| Name              | Type   | Mandatory | Description       |
| ----------------- | ------ | --------  | ----------------- |
| symbol            | STRING | YES       | The pair name     |
| marginType        | ENUM   | YES       | ISOLATED, CROSSED |
| recvWindow        | LONG   | NO        |                   |

```js
console.log(
  await client.futuresMarginType({
    symbol: 'BTCUSD_200925',
    marginType: 'ISOLATED',
  })
)
```

<details>
<summary>Output</summary>

```js
{
    "code": 200,
    "msg": "success"
}
```
</details>

#### deliveryPositionMargin

Modify isolated position margin.

| Name              | Type    | Mandatory | Description                                       |
| ----------------- | ------- | --------  | ------------------------------------------------- |
| symbol            | STRING  | YES       | The pair name                                     |
| positionSide      | ENUM    | NO        | Default BOTH for One-way Mode; <br>LONG or SHORT for Hedge Mode. <br>It must be sent with Hedge Mode. |
| amount            | DECIMAL | YES       |                                                   |
| type              | INT     | YES       | 1: Add position margin，2: Reduce position margin |
| recvWindow        | LONG    | NO        |                                                   |

Only for isolated symbol.

```js
console.log(
  await client.deliveryPositionMargin({
    symbol: 'BTCUSD_200925',
    amount: 100,
    type: 1,
  })
)
```

<details>
<summary>Output</summary>

```js
{
    "amount": 100.0,
    "code": 200,
    "msg": "Successfully modify position margin.",
    "type": 1
}
```
</details>

#### deliveryMarginHistory

Get position margin change history.

| Name              | Type   | Mandatory | Description                                       |
| ----------------- | ------ | --------  | ------------------------------------------------- |
| symbol            | STRING | YES       | The pair name                                     |
| type              | INT    | NO        | 1: Add position margin，2: Reduce position margin |
| startTime         | LONG   | NO        |                                                   |
| endTime           | LONG   | NO        |                                                   |
| limit             | INT    | NO        | Default 50;                                      |
| recvWindow        | LONG   | NO        |                                                   |

```js
console.log(
  await client.deliveryMarginHistory({
    symbol: 'BTCUSD_200925',
    type: 1,
    startTime: 1578047897180,
    limit: 10,
  })
)
```

<details>
<summary>Output</summary>

```js
[
    {
        "amount": "23.36332311",
        "asset": "BTC",
        "symbol": "BTCUSD_200925",
        "time": 1578047897183,
        "type": 1,
        "positionSide": "BOTH"
    },
    {
        "amount": "100",
        "asset": "BTC",
        "symbol": "BTCUSD_200925",
        "time": 1578047900425,
        "type": 1,
        "positionSide": "LONG"
    }
    ...
]
```
</details>

#### deliveryIncome

Get income history.

| Name              | Type   | Mandatory | Description                                       |
| ----------------- | ------ | --------  | ------------------------------------------------- |
| symbol            | STRING | NO        | The pair name                                     |
| incomeType        | STRING | NO        | "TRANSFER"，"WELCOME_BONUS", "REALIZED_PNL"，<br>"FUNDING_FEE", "COMMISSION", and "INSURANCE_CLEAR" |
| startTime         | LONG   | NO        | Timestamp in ms to get funding from INCLUSIVE.    |
| endTime           | LONG   | NO        | Timestamp in ms to get funding until INCLUSIVE.   |
| limit             | INT    | NO        | Default 100; max 1000                             |
| recvWindow        | LONG   | NO        |                                                   |

- If `incomeType` is not sent, all kinds of flow will be returned
- `trandId` is unique in the same incomeType for a user
- The interval between `startTime` and `endTime` can not exceed 200 days:
    - If `startTime` and `endTime` are not sent, the last 200 days will be returned

```js
console.log(
  await client.deliveryIncome({
    symbol: 'BTCUSD_200925',
    startTime: 1570608000000,
    limit: 700,
  })
)
```

<details>
<summary>Output</summary>

```js
[
    {
        "symbol": "",               // trade symbol, if existing
        "incomeType": "TRANSFER",   // income type
        "income": "-0.37500000",    // income amount
        "asset": "BTC",             // income asset
        "info":"WITHDRAW",          // extra information
        "time": 1570608000000,
        "tranId":"9689322392",      // transaction id
        "tradeId":""                // trade id, if existing
    },
    {
        "symbol": "BTCUSD_200925",
        "incomeType": "COMMISSION",
        "income": "-0.01000000",
        "asset": "BTC",
        "info":"",
        "time": 1570636800000,
        "tranId":"9689322392",
        "tradeId":"2059192"
    }
]
```
</details>

#### deliveryAccountBalance

Get delivery account balance

```js
console.log(await client.deliveryAccountBalance());
```

<details>
<summary>Output</summary>

```js
[
  {
    "accountAlias": "SgsR",    // unique account code
    "asset": "BTC",
    "balance": "0.00250000",
    "withdrawAvailable": "0.00250000",
    "crossWalletBalance": "0.00241969",
    "crossUnPnl": "0.00000000",
    "availableBalance": "0.00241969",
    "updateTime": 1592468353979
  }
  ...
]
```

</details>

#### deliveryUserTrades

Get trades for a specific account and symbol.

```js
console.log(
  await client.deliveryUserTrades({
    symbol: 'BTCUSD_200626',
  }),
)
```

| Param      | Type   | Mandatory | Description                                              |
| ---------- | ------ | --------- | -------------------------------------------------------- |
| symbol     | STRING | NO        |                                                          |
| pair       | STRING | NO        |                                                          |
| startTime  | LONG   | NO        |                                                          |
| endTime    | LONG   | NO        |                                                          |
| limit      | INT    | NO        | Default 50; max 1000.                                    |
| fromId     | LONG   | NO        | Trade id to fetch from. Default gets most recent trades. |
| recvWindow | LONG   | NO        |                                                          |

- Either symbol or pair must be sent
- Symbol and pair cannot be sent together
- Pair and fromId cannot be sent together
- If a pair is sent,tickers for all symbols of the pair will be returned
- The parameter `fromId` cannot be sent with `startTime` or `endTime`

<details>
<summary>Output</summary>

```js
[
  {
    'symbol': 'BTCUSD_200626',
    'id': 6,
    'orderId': 28,
    'pair': 'BTCUSD',
    'side': 'SELL',
    'price': '8800',
    'qty': '1',
    'realizedPnl': '0',
    'marginAsset': 'BTC',
    'baseQty': '0.01136364',
    'commission': '0.00000454',
    'commissionAsset': 'BTC',
    'time': 1590743483586,
    'positionSide': 'BOTH',
    'buyer': false,
    'maker': false
  }
    ...
]

```

</details>

#### deliveryLeverageBracket

Get the pair's default notional bracket list.

```js
console.log(
  await client.deliveryLeverageBracket({
    pair: 'BTCUSD', // Optional
  }),
)
```

| Param      | Type   | Mandatory | Description                                               |
| ---------- | ------ | --------- | ----------------------------------------------------------|
| symbol     | STRING | NO        | Use if you are only interested in brackets for one symbol |
| recvWindow | LONG   | NO        |                                                           |

<details>
<summary>Output</summary>

```js
[
    {
        "pair": "BTCUSD",
        "brackets": [
            {
                "bracket": 1,   // bracket level
                "initialLeverage": 125,  // the maximum leverage
                "qtyCap": 50,  // upper edge of base asset quantity
                "qtylFloor": 0,  // lower edge of base asset quantity
                "maintMarginRatio": 0.004 // maintenance margin rate
                "cum": 0.0  // Auxiliary number for quick calculation
            },
        ]
    }
]
```
</details>

### WebSockets

Every websocket utility returns a function you can call to close the opened
connection and avoid memory issues.

```js
const clean = client.ws.depth('ETHBTC', depth => {
  console.log(depth)
})

// After you're done
clean()
```

#### depth

Live depth market data feed. The first parameter can either
be a single symbol string or an array of symbols. If you wish
to specify the update speed (can either be `1000ms` or `100ms`)
of the stream then append the speed at the end of the symbol
string as follows: `ETHBTC@100ms`

```js
client.ws.depth('ETHBTC', depth => {
  console.log(depth)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'depthUpdate',
  eventTime: 1508612956950,
  symbol: 'ETHBTC',
  firstUpdateId: 18331140,
  finalUpdateId: 18331145,
  bidDepth: [
    { price: '0.04896500', quantity: '0.00000000' },
    { price: '0.04891100', quantity: '15.00000000' },
    { price: '0.04891000', quantity: '0.00000000' } ],
  askDepth: [
    { price: '0.04910600', quantity: '0.00000000' },
    { price: '0.04910700', quantity: '11.24900000' }
  ]
}
```

</details>

#### customSubStream

You can add custom sub streams by view [docs](#https://binance-docs.github.io/apidocs/futures/cn/#websocket)

```js
client.ws.customSubStream('!markPrice@arr@1s', console.log)
```

#### partialDepth

Top levels bids and asks, pushed every second. Valid levels are 5, 10, or 20.
Accepts an array of objects for multiple depths. If you wish
to specify the update speed (can either be `1000ms` or `100ms`)
of the stream then append the speed at the end of the symbol
string as follows: `ETHBTC@100ms`

```js
client.ws.partialDepth({ symbol: 'ETHBTC', level: 10 }, depth => {
  console.log(depth)
})
```

<details>
<summary>Output</summary>

```js
{
  symbol: 'ETHBTC',
  level: 10,
  bids: [
    { price: '0.04896500', quantity: '0.00000000' },
    { price: '0.04891100', quantity: '15.00000000' },
    { price: '0.04891000', quantity: '0.00000000' }
  ],
  asks: [
    { price: '0.04910600', quantity: '0.00000000' },
    { price: '0.04910700', quantity: '11.24900000' }
  ]
}
```

</details>

#### ticker

24hr Ticker statistics for a symbol pushed every second. Accepts an array of symbols.

```js
client.ws.ticker('HSRETH', ticker => {
  console.log(ticker)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: '24hrTicker',
  eventTime: 1514670820924,
  symbol: 'HSRETH',
  priceChange: '-0.00409700',
  priceChangePercent: '-11.307',
  weightedAvg: '0.03394946',
  prevDayClose: '0.03623500',
  curDayClose: '0.03213800',
  closeTradeQuantity: '7.02000000',
  bestBid: '0.03204200',
  bestBidQnt: '78.00000000',
  bestAsk: '0.03239800',
  bestAskQnt: '7.00000000',
  open: '0.03623500',
  high: '0.03659900',
  low: '0.03126000',
  volume: '100605.15000000',
  volumeQuote: '3415.49097353',
  openTime: 1514584420922,
  closeTime: 1514670820922,
  firstTradeId: 344803,
  lastTradeId: 351380,
  totalTrades: 6578
}
```

</details>

#### allTickers

Retrieves all the tickers.

```js
client.ws.allTickers(tickers => {
  console.log(tickers)
})
```
#### miniTicker

24hr Mini Ticker statistics for a symbol pushed every second. Accepts an array of symbols.

```js
client.ws.miniTicker('HSRETH', ticker => {
  console.log(ticker)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: '24hrMiniTicker',
  eventTime: 1514670820924,
  symbol: 'HSRETH',
  curDayClose: '0.03213800',
  open: '0.03623500',
  high: '0.03659900',
  low: '0.03126000',
  volume: '100605.15000000',
  volumeQuote: '3415.49097353'
}
```

</details>

#### allMiniTickers

Retrieves all the mini tickers.

```js
client.ws.allMiniTickers(tickers => {
  console.log(tickers)
})
```

#### bookTicker

Pushes any update to the best bid or ask's price or quantity in real-time for a specified symbol. Accepts a single symbol or an array of symbols.

```js
client.ws.bookTicker('BTCUSDT', ticker => {
  console.log(ticker)
})
```

<details>
<summary>Output</summary>

```js
{
  updateId: 23099391508,
  symbol: 'BTCUSDT',
  bestBid: '21620.03000000',
  bestBidQnt: '0.09918000',
  bestAsk: '21621.65000000',
  bestAskQnt: '0.06919000'
}
```

</details>

#### candles

Live candle data feed for a given interval. You can pass either a symbol string
or a symbol array.

```js
client.ws.candles('ETHBTC', '1m', candle => {
  console.log(candle)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'kline',
  eventTime: 1508613366276,
  symbol: 'ETHBTC',
  open: '0.04898000',
  high: '0.04902700',
  low: '0.04898000',
  close: '0.04901900',
  volume: '37.89600000',
  trades: 30,
  interval: '5m',
  isFinal: false,
  quoteVolume: '1.85728874',
  buyVolume: '21.79900000',
  quoteBuyVolume: '1.06838790'
}
```

</details>

#### trades

Live trade data feed. Pass either a single symbol string or an array of symbols. The trade streams push raw trade information; each trade has a unique buyer and seller.

```js
client.ws.trades(['ETHBTC', 'BNBBTC'], trade => {
  console.log(trade)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'trade',
  eventTime: 1508614495052,
  tradeTime: 1508614495050,
  symbol: 'ETHBTC',
  price: '0.04923600',
  quantity: '3.43500000',
  isBuyerMaker: true,
  maker: true,
  tradeId: 2148226,
  buyerOrderId: 390876,
  sellerOrderId: 390752
}
```

</details>

#### aggTrades

Live trade data feed. Pass either a single symbol string or an array of symbols. The aggregate trade streams push trade information that is aggregated for a single taker order.

```js
client.ws.aggTrades(['ETHBTC', 'BNBBTC'], trade => {
  console.log(trade)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'aggTrade',
  eventTime: 1508614495052,
  aggId: 2148226,
  price: '0.04923600',
  quantity: '3.43500000',
  firstId: 37856,
  lastId: 37904,
  timestamp: 1508614495050,
  symbol: 'ETHBTC',
  isBuyerMaker: false,
  wasBestPrice: true
}
```

</details>

#### user

Live user messages data feed.

**Requires authentication**

```js
const clean = await client.ws.user(msg => {
  console.log(msg)
})
```

There is also equivalent function to query the margin wallet:

```js
client.ws.marginUser()
```

Note that this method return a promise which will resolve the `clean` callback.

<details>
<summary>Output</summary>

```js
{
  eventType: 'account',
  eventTime: 1508614885818,
  balances: {
    '123': { available: '0.00000000', locked: '0.00000000' },
    '456': { available: '0.00000000', locked: '0.00000000' },
    BTC: { available: '0.00000000', locked: '0.00000000' },
  }
}
```

</details>

### Futures WebSockets

Every websocket utility returns a function you can call to close the opened
connection and avoid memory issues.

```js
const clean = client.ws.futuresDepth('ETHBTC', depth => {
  console.log(depth)
})

// After you're done
clean()
```

Each websocket utility supports the ability to get a clean callback without data transformation, for this, pass the third attribute FALSE.

```js
const clean = client.ws.futuresDepth('ETHBTC', depth => {
  console.log(depth)
}, false)
```

<details>
<summary>Output</summary>

```js
{
  "e": "depthUpdate", // Event type
  "E": 123456789,     // Event time
  "T": 123456788,     // transaction time
  "s": "BTCUSDT",      // Symbol
  "U": 157,           // First update ID in event
  "u": 160,           // Final update ID in event
  "pu": 149,          // Final update Id in last stream(ie `u` in last stream)
  "b": [              // Bids to be updated
    [
      "0.0024",       // Price level to be updated
      "10"            // Quantity
    ]
  ],
  "a": [              // Asks to be updated
    [
      "0.0026",       // Price level to be updated
      "100"          // Quantity
    ]
  ]
}
```
</details>

#### futuresDepth

Live futuresDepth market data feed. The first parameter can either
be a single symbol string or an array of symbols.

```js
client.ws.futuresDepth('ETHBTC', depth => {
  console.log(depth)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'depthUpdate',
  eventTime: 1508612956950,
  symbol: 'ETHBTC',
  firstUpdateId: 18331140,
  finalUpdateId: 18331145,
  bidDepth: [
    { price: '0.04896500', quantity: '0.00000000' },
    { price: '0.04891100', quantity: '15.00000000' },
    { price: '0.04891000', quantity: '0.00000000' } ],
  askDepth: [
    { price: '0.04910600', quantity: '0.00000000' },
    { price: '0.04910700', quantity: '11.24900000' }
  ]
}
```
</details>

#### futuresPartialDepth

Top levels bids and asks, pushed every second. Valid levels are 5, 10, or 20.
Accepts an array of objects for multiple depths.

```js
client.ws.futuresPartialDepth({ symbol: 'ETHBTC', level: 10 }, depth => {
  console.log(depth)
})
```

<details>
<summary>Output</summary>

```js
{

  eventType: 'depthUpdate',
  eventTime: 1508612956950,
  symbol: 'ETHBTC',
  level: 10,
  firstUpdateId: 18331140,
  finalUpdateId: 18331145,
  bidDepth: [
    { price: '0.04896500', quantity: '0.00000000' },
    { price: '0.04891100', quantity: '15.00000000' },
    { price: '0.04891000', quantity: '0.00000000' } ],
  askDepth: [
    { price: '0.04910600', quantity: '0.00000000' },
    { price: '0.04910700', quantity: '11.24900000' }
  ]
}
```
</details>

#### futuresTicker

24hr Ticker statistics for a symbol pushed every 500ms. Accepts an array of symbols.

```js
client.ws.futuresTicker('HSRETH', ticker => {
  console.log(ticker)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: '24hrTicker',
  eventTime: 123456789,
  symbol: 'BTCUSDT',
  priceChange: '0.0015',
  priceChangePercent: '250.00',
  weightedAvg: '0.0018',
  curDayClose: '0.0025',
  closeTradeQuantity: '10',
  open: '0.0010',
  high: '0.0025',
  low: '0.0010',
  volume: '10000',
  volumeQuote: '18',
  openTime: 0,
  closeTime: 86400000,
  firstTradeId: 0,
  lastTradeId: 18150,
  totalTrades: 18151,
}
```
</details>

#### futuresAllTickers

Retrieves all the tickers.

```js
client.ws.futuresAllTickers(tickers => {
  console.log(tickers)
})
```

#### futuresCandles

Live candle data feed for a given interval. You can pass either a symbol string
or a symbol array.

```js
client.ws.futuresCandles('ETHBTC', '1m', candle => {
  console.log(candle)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'kline',
  eventTime: 1508613366276,
  symbol: 'ETHBTC',
  open: '0.04898000',
  high: '0.04902700',
  low: '0.04898000',
  close: '0.04901900',
  volume: '37.89600000',
  trades: 30,
  interval: '5m',
  isFinal: false,
  quoteVolume: '1.85728874',
  buyVolume: '21.79900000',
  quoteBuyVolume: '1.06838790'
}
```
</details>

#### futuresAggTrades

Live trade data feed. Pass either a single symbol string or an array of symbols. The Aggregate Trade Streams push trade information that is aggregated for a single taker order every 100 milliseconds.

```js
client.ws.futuresAggTrades(['ETHBTC', 'BNBBTC'], trade => {
  console.log(trade)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'aggTrade',
  eventTime: 1508614495052,
  aggId: 2148226,
  price: '0.04923600',
  quantity: '3.43500000',
  firstId: 37856,
  lastId: 37904,
  timestamp: 1508614495050,
  symbol: 'ETHBTC',
  isBuyerMaker: false,
}
```
</details>


#### futuresLiquidations

Live liquidation data feed. Pass either a single symbol string or an array of symbols. The Liquidation Order Streams push force liquidation order information for specific symbol(s).

```js
client.ws.futuresLiquidations(['ETHBTC', 'BNBBTC'], liquidation => {
  console.log(liquidation)
})
```

<details>
<summary>Output</summary>

```js
{
  symbol: string
  price: '0.04923600',
  origQty: '3.43500000',
  lastFilledQty: '3.43500000',
  accumulatedQty: '3.43500000',
  averagePrice: '0.04923600',
  status: 'FILLED',
  timeInForce: 'IOC',
  type: 'LIMIT',
  side: 'SELL',
  time: 1508614495050
}
```

</details>

#### futuresAllLiquidations

Live liquidation data feed. Pass either a single symbol string or an array of symbols. The All Liquidation Order Streams push force liquidation order information for all symbols in the market.

```js
client.ws.futuresAllLiquidations(liquidation => {
  console.log(liquidation)
})
```

<details>
<summary>Output</summary>

```js
{
  symbol: string
  price: '0.04923600',
  origQty: '3.43500000',
  lastFilledQty: '3.43500000',
  accumulatedQty: '3.43500000',
  averagePrice: '0.04923600',
  status: 'FILLED',
  timeInForce: 'IOC',
  type: 'LIMIT',
  side: 'SELL',
  time: 1508614495050
}
```

</details>

#### futuresCustomSubStream

You can add custom sub streams by view [docs](#https://binance-docs.github.io/apidocs/futures/cn/#websocket)

```js
client.ws.futuresCustomSubStream(['!markPrice@arr','ETHBTC@markPrice@1s'], console.log)
```

#### futuresUser

Live user messages data feed.

**Requires authentication**

```js
const futuresUser = await client.ws.futuresUser(msg => {
  console.log(msg)
})
```

<details>
<summary>Output</summary>

```js
{
  eventTime: 1564745798939,
  transactionTime: 1564745798938,
  eventType: 'ACCOUNT_UPDATE',
  eventReasonType: 'ORDER',
  balances: [
    {
      asset:'USDT',
      walletBalance:'122624.12345678',
      crossWalletBalance:'100.12345678'
    },
    {
      asset:'BNB',
      walletBalance:'1.00000000',
      crossWalletBalance:'0.00000000'
    }
  ],
  positions: [
    {
      symbol:'BTCUSDT',
      positionAmount:'0',
      entryPrice:'0.00000',
      accumulatedRealized:'200',
      unrealizedPnL:'0',
      marginType:'isolated',
      isolatedWallet:'0.00000000',
      positionSide:'BOTH'
    },
    {
      symbol:'BTCUSDT',
      positionAmount:'20',
      entryPrice:'6563.66500',
      accumulatedRealized:'0',
      unrealizedPnL:'2850.21200',
      marginType:'isolated',
      isolatedWallet:'13200.70726908',
      positionSide:'LONG'
    }
  ],
}
```
</details>

### Delivery WebSockets

Every websocket utility returns a function you can call to close the opened
connection and avoid memory issues.

```js
const clean = client.ws.deliveryDepth('BTCUSD_200626', depth => {
  console.log(depth)
})

// After you're done
clean()
```

Each websocket utility supports the ability to get a clean callback without data transformation, for this, pass the third attribute FALSE.

```js
const clean = client.ws.deliveryDepth('BTCUSD_200626', depth => {
  console.log(depth)
}, false)
```

<details>
<summary>Output</summary>

```js
{
  "e": "depthUpdate",           // Event type
  "E": 1591270260907,           // Event time
  "T": 1591270260891,           // Transction time
  "s": "BTCUSD_200626",         // Symbol
  "ps": "BTCUSD",               // Pair
  "U": 17285681,                // First update ID in event
  "u": 17285702,                // Final update ID in event
  "pu": 17285675,               // Final update Id in last stream(ie `u` in last stream)
  "b": [                        // Bids to be updated
    [
      "9517.6",                 // Price level to be updated
      "10"                      // Quantity
    ]
  ],
  "a": [                        // Asks to be updated
    [
      "9518.5",                 // Price level to be updated
      "45"                      // Quantity
    ]
  ]
}
```
</details>

#### deliveryDepth

Live futuresDepth market data feed. The first parameter can either
be a single symbol string or an array of symbols.

```js
client.ws.deliveryDepth('TRXUSD_PERP', depth => {
  console.log(depth)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'depthUpdate',
  eventTime: 1663111254317,
  transactionTime: 1663111254138,
  symbol: 'TRXUSD_PERP',
  pair: 'TRXUSD',
  firstUpdateId: 558024151999,
  finalUpdateId: 558024152633,
  prevFinalUpdateId: 558024150524,
  bidDepth: [
    { price: '0.06052', quantity: '1805' },
    { price: '0.06061', quantity: '313' }
  ],
  askDepth: [
    { price: '0.06062', quantity: '314' },
    { price: '0.06063', quantity: '790' },
    { price: '0.06065', quantity: '1665' },
    { price: '0.06066', quantity: '2420' }
  ]
}
```
</details>

#### deliveryPartialDepth

Top bids and asks. Valid levels are 5, 10, or 20.
Update Speed : 250ms, 500ms or 100ms.
Accepts an array of objects for multiple depths.

```js
client.ws.deliveryPartialDepth({ symbol: 'TRXUSD_PERP', level: 10 }, depth => {
  console.log(depth)
})
```

<details>
<summary>Output</summary>

```js
{
  level: 10,
  eventType: 'depthUpdate',
  eventTime: 1663111554598,
  transactionTime: 1663111554498,
  symbol: 'TRXUSD_PERP',
  pair: 'TRXUSD',
  firstUpdateId: 558027933795,
  finalUpdateId: 558027935097,
  prevFinalUpdateId: 558027932895,
  bidDepth: [
    { price: '0.06063', quantity: '604' },
    { price: '0.06062', quantity: '227' },
    { price: '0.06061', quantity: '327' }
  ],
  askDepth: [
    { price: '0.06064', quantity: '468' },
    { price: '0.06065', quantity: '131' }
  ]
}
```
</details>

#### deliveryTicker

24hr rollwing window ticker statistics for a single symbol. These are NOT the statistics of the UTC day, but a 24hr rolling window from requestTime to 24hrs before.
Accepts an array of symbols.

```js
client.ws.deliveryTicker('BNBUSD_PERP', ticker => {
  console.log(ticker)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: '24hrTicker',
  eventTime: 1664834148221,
  symbol: 'BNBUSD_PERP',
  pair: 'BNBUSD',
  priceChange: '0.130',
  priceChangePercent: '0.046',
  weightedAvg: '286.02648763',
  curDayClose: '285.745',
  closeTradeQuantity: '1',
  open: '285.615',
  high: '289.050',
  low: '282.910',
  volume: '9220364',
  volumeBase: '322360.49452795',
  openTime: 1664747700000,
  closeTime: 1664834148215,
  firstTradeId: 179381113,
  lastTradeId: 179462069,
  totalTrades: 80957
}
```
</details>

#### deliveryAllTickers

Retrieves all the tickers.

```js
client.ws.deliveryAllTickers(tickers => {
  console.log(tickers)
})
```

#### deliveryCandles

Live candle data feed for a given interval. You can pass either a symbol string
or a symbol array.

```js
client.ws.deliveryCandles('ETHUSD_PERP', '1m', candle => {
  console.log(candle)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'kline',
  eventTime: 1664834318306,
  symbol: 'ETHUSD_PERP',
  startTime: 1664834280000,
  closeTime: 1664834339999,
  firstTradeId: 545784425,
  lastTradeId: 545784494,
  open: '1317.68',
  high: '1317.91',
  low: '1317.68',
  close: '1317.91',
  volume: '6180',
  trades: 70,
  interval: '1m',
  isFinal: false,
  baseVolume: '46.89730466',
  buyVolume: '5822',
  baseBuyVolume: '44.18040830'
}
```
</details>

#### deliveryAggTrades

Live trade data feed. Pass either a single symbol string or an array of symbols. The Aggregate Trade Streams push trade information that is aggregated for a single taker order every 100 milliseconds.

```js
client.ws.deliveryAggTrades(['ETHUSD_PERP', 'BNBUSD_PERP'], trade => {
  console.log(trade)
})
```

<details>
<summary>Output</summary>

```js
{
  eventType: 'aggTrade',
  eventTime: 1664834403682,
  symbol: 'ETHUSD_PERP',
  aggId: 216344302,
  price: '1317.57',
  quantity: '1318',
  firstId: 545784591,
  lastId: 545784591,
  timestamp: 1664834403523,
  isBuyerMaker: false
}
```
</details>


#### deliveryCustomSubStream

You can add custom sub streams by view [docs](https://binance-docs.github.io/apidocs/delivery/en/#websocket-market-streams)

```js
client.ws.deliveryCustomSubStream(['!miniTicker@arr','ETHUSD_PERP@markPrice@1s'], console.log)
```

#### deliveryUser

Live user messages data feed.
For different event types, see [official documentation](https://binance-docs.github.io/apidocs/delivery/en/#user-data-streams)

**Requires authentication**

```js
const deliveryUser = await client.ws.deliveryUser(msg => {
  console.log(msg)
})
```

<details>
<summary>Output</summary>

```js
{
  eventTime: 1664834883117,
  transactionTime: 1664834883101,
  eventType: 'ACCOUNT_UPDATE',
  eventReasonType: 'ORDER',
  balances: [
    {
      asset: 'BUSD',
      walletBalance: '123.45678901',
      crossWalletBalance: '123.45678901',
      balanceChange: '0'
    },
    {
      asset: 'BNB',
      walletBalance: '0.12345678',
      crossWalletBalance: '0.12345678',
      balanceChange: '0'
    }
  ],
  positions: [
    {
      symbol: 'ETHBUSD',
      positionAmount: '420.024',
      entryPrice: '1234.56789',
      accumulatedRealized: '9000.12345678',
      unrealizedPnL: '0.38498800',
      marginType: 'cross',
      isolatedWallet: '0',
      positionSide: 'BOTH'
    }
  ]
}
```
</details>

#### Common

#### getInfo

To get information about limits from response headers call getInfo()

```js
console.log(client.getInfo())
```

<details>
<summary>Output</summary>

```js
{
  futures: {
     futuresLatency: "2ms",
     orderCount1m: "10",
     usedWeigh1m: "1",
  },
  spot: {
     orderCount1d: "347",
     orderCount10s: "1",
     usedWeigh1m: "15",
  },
  delivery: {
    usedWeight1m: '13',
    responseTime: '4ms',
    orderCount1m: '1'
  }
}
```
</details>

### ErrorCodes

An utility error code map is also being exported by the package in order for you to make readable
conditionals upon specific errors that could occur while using the API.

```js
import Binance, { ErrorCodes } from 'binance-api-node'

console.log(ErrorCodes.INVALID_ORDER_TYPE) // -1116
```
