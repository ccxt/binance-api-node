import httpMethods from 'http-client'
import wsMethods from 'websocket'

export default (opts = {}) => ({
    ...httpMethods(opts),
    ws: wsMethods(opts),
})

export const ErrorCodes = {
    UNKNOWN: -1000,
    DISCONNECTED: -1001,
    UNAUTHORIZED: -1002,
    TOO_MANY_REQUESTS: -1003,
    UNEXPECTED_RESP: -1006,
    TIMEOUT: -1007,
    INVALID_MESSAGE: -1013,
    UNKNOWN_ORDER_COMPOSITION: -1014,
    TOO_MANY_ORDERS: -1015,
    SERVICE_SHUTTING_DOWN: -1016,
    UNSUPPORTED_OPERATION: -1020,
    INVALID_TIMESTAMP: -1021,
    INVALID_SIGNATURE: -1022,
    ILLEGAL_CHARS: -1100,
    TOO_MANY_PARAMETERS: -1101,
    MANDATORY_PARAM_EMPTY_OR_MALFORMED: -1102, // eslint-disable-line id-length
    UNKNOWN_PARAM: -1103,
    UNREAD_PARAMETERS: -1104,
    PARAM_EMPTY: -1105,
    PARAM_NOT_REQUIRED: -1106,
    NO_DEPTH: -1112,
    TIF_NOT_REQUIRED: -1114,
    INVALID_TIF: -1115,
    INVALID_ORDER_TYPE: -1116,
    INVALID_SIDE: -1117,
    EMPTY_NEW_CL_ORD_ID: -1118,
    EMPTY_ORG_CL_ORD_ID: -1119,
    BAD_INTERVAL: -1120,
    BAD_SYMBOL: -1121,
    INVALID_LISTEN_KEY: -1125,
    MORE_THAN_XX_HOURS: -1127,
    OPTIONAL_PARAMS_BAD_COMBO: -1128,
    INVALID_PARAMETER: -1130,
    BAD_API_ID: -2008,
    DUPLICATE_API_KEY_DESC: -2009,
    INSUFFICIENT_BALANCE: -2010,
    CANCEL_REJECTED: -2011,
    CANCEL_ALL_FAIL: -2012,
    NO_SUCH_ORDER: -2013,
    BAD_API_KEY_FMT: -2014,
    REJECTED_MBX_KEY: -2015,
}

export const CandleChartInterval = {
    ONE_MINUTE: '1m',
    THREE_MINUTES: '3m',
    FIVE_MINUTES: '5m',
    FIFTEEN_MINUTES: '15m',
    THIRTY_MINUTES: '30m',
    ONE_HOUR: '1h',
    TWO_HOURS: '2h',
    FOUR_HOURS: '4h',
    SIX_HOURS: '6h',
    EIGHT_HOURS: '8h',
    TWELVE_HOURS: '12h',
    ONE_DAY: '1d',
    THREE_DAYS: '3d',
    ONE_WEEK: '1w',
    ONE_MONTH: '1M',
}

export const DepositStatus = {
    PENDING: 0,
    SUCCESS: 1,
}

export const WithdrawStatus = {
    EMAIL_SENT: 0,
    CANCELLED: 1,
    AWAITING_APPROVAL: 2,
    REJECTED: 3,
    PROCESSING: 4,
    FAILURE: 5,
    COMPLETED: 6,
}

export const SavingsStatus = {
    HOLDING: 'HOLDING',
    REDEEMED: 'REDEEMED',
    TRANSFERRED: 'TRANSFERRED',
}

export const SavingsType = {
    FAST: 'FAST',
    NORMAL: 'NORMAL',
}

export const MiningAlgo = {
    SHA256: 'sha256',
    SCRYPT: 'scrypt',
    ETHASH: 'ethash',
    X11: 'x11',
}

export const MiningStatus = {
    HASH_RATE: 'hash_rate',
    REJECTED: 'rejected',
    EARNINGS: 'earnings',
}

export const ConvertStatus = {
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
}

export const PayStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
}
