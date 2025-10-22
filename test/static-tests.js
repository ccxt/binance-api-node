import test from 'ava'
import nock from 'nock';
import Binance, { ErrorCodes } from 'index'

const binance = Binance()

let interceptedUrl = null;
let interceptedBody = null;

test.beforeEach(t => {

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

test('[REST] Prices no symbol', async t => {
    await binance.prices();
    t.is(interceptedUrl, 'https://api.binance.com/api/v3/ticker/price')
})