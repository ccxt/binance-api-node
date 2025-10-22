import test from 'ava'
import nock from 'nock';
import Binance, { ErrorCodes } from 'index'

// Warning: For now these tests can't run in parallel due to nock interceptors
const binance = Binance({
    apiKey: 'testkey',
    apiSecret: 'test'
})
const demoBinance = Binance({
    testnet: true,
});

function urlToObject(queryString) {
    const params = new URLSearchParams(queryString);
    const obj = Object.fromEntries(params.entries());
    return obj;
}


let interceptedUrl = null;
let interceptedBody = null;

test.serial.beforeEach(t => {
    interceptedUrl = null;
    interceptedBody = null;
    nock(/.*/)
        .get(/.*/)
        .reply(200, function (uri, requestBody) {
            interceptedUrl =  `${this.req.options.proto}://${this.req.options.hostname}${uri}`;
            interceptedBody = requestBody;
            return { success: true };
        });
    nock(/.*/)
        .post(/.*/)
        .reply(200, function (uri, requestBody) {
            interceptedUrl =  `${this.req.options.proto}://${this.req.options.hostname}${uri}`;
            interceptedBody = requestBody;
            return { success: true };
        });
    nock(/.*/)
        .delete(/.*/)
        .reply(200, function (uri, requestBody) {
            interceptedUrl =  `${this.req.options.proto}://${this.req.options.hostname}${uri}`;
            interceptedBody = requestBody;
            return { success: true };
    });
});

test.serial('[Rest] Spot demo url', async t => {
    await demoBinance.time();
    t.is(interceptedUrl, 'https://demo-api.binance.com/api/v3/time')
})

test.serial('[Rest] Futures demo url', async t => {
    await demoBinance.futuresTime();
    t.is(interceptedUrl, 'https://demo-fapi.binance.com/fapi/v1/time')
})

test.serial('[REST] Prices no symbol', async t => {
    await binance.prices();
    t.is(interceptedUrl, 'https://api.binance.com/api/v3/ticker/price')
})

test.serial('[REST] Futures Prices no symbol', async t => {
    await binance.futuresPrices();
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/ticker/price')
})


test.serial('[REST] Orderbook', async t => {
    try {
        await binance.book({ symbol: 'BTCUSDT' });
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://api.binance.com/api/v3/depth?symbol=BTCUSDT')
})

test.serial('[REST] Futures Orderbook', async t => {
    try {
        await binance.futuresBook({ symbol: 'BTCUSDT' });
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT')
})

test.serial('[REST] OHLCVS', async t => {
  try {
      await binance.candles({ symbol: 'BTCUSDT' })
  } catch (e) {
      // it can throw an error because of the mocked response
  }
  t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/klines?interval=5m&symbol=BTCUSDT'))
})

test.serial('[REST] Futures OHLCVS', async t => {
  try {
      await binance.futuresCandles({ symbol: 'BTCUSDT', interval: '30m' })
  } catch (e) {
      // it can throw an error because of the mocked response
  }
  t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/klines?interval=30m&symbol=BTCUSDT')
})

test.serial('[REST] Recent Trades', async t => {
  await binance.trades({ symbol: 'BTCUSDT', limit: 500 })
  t.is(interceptedUrl, 'https://api.binance.com/api/v3/trades?symbol=BTCUSDT&limit=500')
})

test.serial('[REST] Agg Trades', async t => {
  try {
      await binance.aggTrades({ symbol: 'BTCUSDT' })
  } catch (e) {
        // it can throw an error because of the mocked response
  }
  t.is(interceptedUrl, 'https://api.binance.com/api/v3/aggTrades?symbol=BTCUSDT')
})

test.serial('[REST] FuturesTrades', async t => {
    try {
        await binance.futuresTrades({ symbol: 'BTCUSDT' })
    } catch (e) {
        // it can throw an error because of the mocked response
    }
    t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/trades?symbol=BTCUSDT')
})

test.serial('[REST] FuturesAggTrades', async t => {
  try {
        await binance.futuresAggTrades({ symbol: 'BTCUSDT' })
  } catch (e) {
    // it can throw an error because of the mocked response
  }
  t.is(interceptedUrl, 'https://fapi.binance.com/fapi/v1/aggTrades?symbol=BTCUSDT')
})

test.serial('[REST] PositionRisk V2', async t => {
  await binance.futuresPositionRisk()
  t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v2/positionRisk'))
})


test.serial('[REST] CancelOrder', async t => {
  await binance.cancelOrder({ symbol: 'LTCUSDT', orderId: '34234234' })
  t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
  const obj = urlToObject(interceptedUrl.replace('https://api.binance.com/api/v3/order', ''))
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.orderId, '34234234')
})

test.serial('[REST] Futures CancelOrder', async t => {
  await binance.futuresCancelOrder({ symbol: 'LTCUSDT', orderId: '34234234' })
  t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
  const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order', ''))
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.orderId, '34234234')
})


test.serial('[REST] MarketBuy', async t => {
  await binance.order({ symbol: 'LTCUSDT', side: 'BUY', type: 'MARKET', quantity: 0.5 })
  t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
  const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
  const obj = urlToObject(body)
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'BUY')
  t.is(obj.type, 'MARKET')
  t.is(obj.quantity, '0.5')
})

test.serial('[REST] MarketSell', async t => {
  await binance.order({ symbol: 'LTCUSDT', side: 'SELL', type: 'MARKET', quantity: 0.5 })
    t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
    const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
  const obj = urlToObject(body)
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'SELL')
  t.is(obj.type, 'MARKET')
  t.is(obj.quantity, '0.5')
})

test.serial('[REST] LimitBuy', async t => {
  await binance.order({ symbol: 'LTCUSDT', side: 'BUY', type: 'LIMIT', quantity: 0.5, price: 100 })
  t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
  const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
  const obj = urlToObject(body)
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'BUY')
  t.is(obj.type, 'LIMIT')
  t.is(obj.quantity, '0.5')
})

test.serial('[REST] LimitSell', async t => {
  await binance.order({ symbol: 'LTCUSDT', side: 'SELL', type: 'LIMIT', quantity: 0.5, price: 100 })
  t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order'))
  const body = interceptedUrl.replace('https://api.binance.com/api/v3/order', '')
  const obj = urlToObject(body)
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'SELL')
  t.is(obj.type, 'LIMIT')
  t.is(obj.quantity, '0.5')
})


test.serial('[REST] Futures MarketBuy', async t => {
  await binance.futuresOrder({ symbol: 'LTCUSDT', side: 'BUY', type: 'MARKET', quantity: 0.5 })
  t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
  const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'BUY')
  t.is(obj.type, 'MARKET')
  t.is(obj.quantity, '0.5')
})

test.serial('[REST] Futures MarketSell', async t => {
  await binance.futuresOrder({ symbol: 'LTCUSDT', side: 'SELL', type: 'MARKET', quantity: 0.5 })
  t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
  const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'SELL')
  t.is(obj.type, 'MARKET')
  t.is(obj.quantity, '0.5')
})

test.serial('[REST] Futures LimitBuy', async t => {
  await binance.futuresOrder({ symbol: 'LTCUSDT', side: 'BUY', type: 'LIMIT', quantity: 0.5, price: 100 })
  t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
  const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'BUY')
  t.is(obj.type, 'LIMIT')
  t.is(obj.quantity, '0.5')
})

test.serial('[REST] Futures LimitSell', async t => {
  await binance.futuresOrder({ symbol: 'LTCUSDT', side: 'SELL', type: 'LIMIT', quantity: 0.5, price: 100 })
  t.true(interceptedUrl.startsWith('https://fapi.binance.com/fapi/v1/order'))
  const obj = urlToObject(interceptedUrl.replace('https://fapi.binance.com/fapi/v1/order?', ''))
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'SELL')
  t.is(obj.type, 'LIMIT')
  t.is(obj.quantity, '0.5')
})


test.serial('[REST] Futures cancel order', async t => {
  await binance.futuresCancelOrder({ symbol: 'LTCUSDT', orderId: '34234234' })
  const url = 'https://fapi.binance.com/fapi/v1/order'
  t.true(interceptedUrl.startsWith(url))
  const obj = urlToObject(interceptedUrl.replace(url, ''))
  t.is(obj.orderId, '34234234')
  t.is(obj.symbol, 'LTCUSDT')
})

test.serial('[REST] MarketBuy test', async t => {
  await binance.orderTest({ symbol: 'LTCUSDT', side: 'BUY', type: 'MARKET', quantity: 0.5 })
  t.true(interceptedUrl.startsWith('https://api.binance.com/api/v3/order/test'))
  const body = interceptedUrl.replace('https://api.binance.com/api/v3/order/test', '')
  const obj = urlToObject(body)
  t.is(obj.symbol, 'LTCUSDT')
  t.is(obj.side, 'BUY')
  t.is(obj.type, 'MARKET')
  t.is(obj.quantity, '0.5')
})
