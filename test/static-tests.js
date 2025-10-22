import test from 'ava'
import nock from 'nock';
import Binance, { ErrorCodes } from 'index'

// Warning: For now these tests can't run in parallel due to nock interceptors
const binance = Binance()

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