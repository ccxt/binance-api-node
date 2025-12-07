export interface BinanceRestOptions {
  apiKey?: string;
  apiSecret?: string;

  httpBase?: string;
  httpFutures?: string;
  httpDelivery?: string;
  httpPortfolioMargin?: string;

  wsBase?: string;
  wsFutures?: string;
  wsDelivery?: string;

  timeout?: number;
  testnet?: boolean;
  proxy?: string;
  getTime?: () => number;
}

export enum RateLimitType {
  REQUEST_WEIGHT = 'REQUEST_WEIGHT',
  ORDERS = 'ORDERS',
  RAW_REQUESTS = 'RAW_REQUESTS'
}

export enum RateLimitInterval {
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY'
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
  LIMIT_MAKER = 'LIMIT_MAKER',
  STOP_MARKET = 'STOP_MARKET',
  TAKE_PROFIT_MARKET = 'TAKE_PROFIT_MARKET',
  TRAILING_STOP_MARKET = 'TRAILING_STOP_MARKET'
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum TimeInForce {
  GTC = 'GTC', // Good Till Cancel
  IOC = 'IOC', // Immediate or Cancel
  FOK = 'FOK'  // Fill or Kill
}

export enum OrderStatus {
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  PENDING_CANCEL = 'PENDING_CANCEL',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  ACCEPTED = 'ACCEPTED',
  TRIGGERING = 'TRIGGERING',
  TRIGGERED = 'TRIGGERED',
  FINISHED = 'FINISHED'
}

export enum TradingType {
  SPOT = 'SPOT',
  MARGIN = 'MARGIN'
}

export type TradingType_LT = 'SPOT' | 'MARGIN';

// Base interface that all endpoint interfaces will extend
export interface BinanceRestClient {
  // This interface is now empty as all methods are defined in their respective endpoint interfaces
} 