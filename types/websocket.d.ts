export type CleanupFn = (options?: { keepClosed?: boolean; [key: string]: any }) => void;

// Price/quantity pair from orderbook
export interface OrderBookLevel {
  price: string;
  quantity: string;
}

// Spot depth event
export interface DepthEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  firstUpdateId: number;
  finalUpdateId: number;
  bidDepth: OrderBookLevel[];
  askDepth: OrderBookLevel[];
}

// Futures depth event
export interface FuturesDepthEvent {
  eventType: string;
  eventTime: number;
  transactionTime: number;
  symbol: string;
  firstUpdateId: number;
  finalUpdateId: number;
  prevFinalUpdateId: number;
  bidDepth: OrderBookLevel[];
  askDepth: OrderBookLevel[];
}

// Delivery depth event
export interface DeliveryDepthEvent extends FuturesDepthEvent {
  pair: string;
}

// Spot partial depth event
export interface PartialDepthEvent {
  symbol: string;
  level: number;
  lastUpdateId: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

// Futures partial depth event
export interface FuturesPartialDepthEvent {
  level: number;
  eventType: string;
  eventTime: number;
  transactionTime: number;
  symbol: string;
  firstUpdateId: number;
  finalUpdateId: number;
  prevFinalUpdateId: number;
  bidDepth: OrderBookLevel[];
  askDepth: OrderBookLevel[];
}

// Delivery partial depth event
export interface DeliveryPartialDepthEvent extends FuturesPartialDepthEvent {
  pair: string;
}

// Candle event (spot/futures)
export interface CandleEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  startTime: number;
  closeTime: number;
  firstTradeId: number;
  lastTradeId: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  trades: number;
  interval: string;
  isFinal: boolean;
  quoteVolume: string;
  buyVolume: string;
  quoteBuyVolume: string;
}

// Delivery candle event
export interface DeliveryCandleEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  startTime: number;
  closeTime: number;
  firstTradeId: number;
  lastTradeId: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  trades: number;
  interval: string;
  isFinal: boolean;
  baseVolume: string;
  buyVolume: string;
  baseBuyVolume: string;
}

// Book ticker event
export interface BookTickerEvent {
  updateId: number;
  symbol: string;
  bestBid: string;
  bestBidQnt: string;
  bestAsk: string;
  bestAskQnt: string;
}

// Mini ticker event
export interface MiniTickerEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  curDayClose: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  volumeQuote: string;
}

// Delivery mini ticker event
export interface DeliveryMiniTickerEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  pair: string;
  curDayClose: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  volumeBase: string;
}

// Spot ticker event
export interface TickerEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvg: string;
  prevDayClose: string;
  curDayClose: string;
  closeTradeQuantity: string;
  bestBid: string;
  bestBidQnt: string;
  bestAsk: string;
  bestAskQnt: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  volumeQuote: string;
  openTime: number;
  closeTime: number;
  firstTradeId: number;
  lastTradeId: number;
  totalTrades: number;
}

// Futures ticker event
export interface FuturesTickerEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvg: string;
  curDayClose: string;
  closeTradeQuantity: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  volumeQuote: string;
  openTime: number;
  closeTime: number;
  firstTradeId: number;
  lastTradeId: number;
  totalTrades: number;
}

// Delivery ticker event
export interface DeliveryTickerEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  pair: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvg: string;
  curDayClose: string;
  closeTradeQuantity: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  volumeBase: string;
  openTime: number;
  closeTime: number;
  firstTradeId: number;
  lastTradeId: number;
  totalTrades: number;
}

// Spot agg trade event
export interface AggTradeEvent {
  eventType: string;
  eventTime: number;
  timestamp: number;
  symbol: string;
  price: string;
  quantity: string;
  isBuyerMaker: boolean;
  wasBestPrice: boolean;
  aggId: number;
  firstId: number;
  lastId: number;
}

// Futures/delivery agg trade event
export interface FuturesAggTradeEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  aggId: number;
  price: string;
  quantity: string;
  firstId: number;
  lastId: number;
  timestamp: number;
  isBuyerMaker: boolean;
}

// Spot trade event
export interface TradeEvent {
  eventType: string;
  eventTime: number;
  tradeTime: number;
  symbol: string;
  price: string;
  quantity: string;
  isBuyerMaker: boolean;
  maker: boolean;
  tradeId: number;
  buyerOrderId: number;
  sellerOrderId: number;
}

// Futures liquidation event
export interface FuturesLiquidationEvent {
  symbol: string;
  price: string;
  origQty: string;
  lastFilledQty: string;
  accumulatedQty: string;
  averagePrice: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  time: number;
}

// Futures mark price event
export interface FuturesMarkPriceEvent {
  eventType: string;
  eventTime: number;
  symbol: string;
  markPrice: string;
  indexPrice: string;
  settlePrice: string;
  fundingRate: string;
  nextFundingRate: number;
}

// Partial depth payload
export interface PartialDepthPayload {
  symbol: string;
  level: number;
}

// Futures all mark prices payload
export interface FuturesAllMarkPricesPayload {
  updateSpeed?: '1s' | '3s';
}

export interface BinanceWebSocket {
  // Spot
  depth(payload: string | string[], cb: (data: DepthEvent) => void, transform?: boolean): CleanupFn;
  partialDepth(payload: PartialDepthPayload | PartialDepthPayload[], cb: (data: PartialDepthEvent) => void, transform?: boolean): CleanupFn;
  candles(payload: string | string[], interval: string, cb: (data: CandleEvent) => void, transform?: boolean): CleanupFn;
  trades(payload: string | string[], cb: (data: TradeEvent) => void, transform?: boolean): CleanupFn;
  aggTrades(payload: string | string[], cb: (data: AggTradeEvent) => void, transform?: boolean): CleanupFn;
  bookTicker(payload: string | string[], cb: (data: BookTickerEvent) => void, transform?: boolean): CleanupFn;
  ticker(payload: string | string[], cb: (data: TickerEvent) => void, transform?: boolean): CleanupFn;
  allTickers(cb: (data: TickerEvent[]) => void, transform?: boolean): CleanupFn;
  allTickersDeprecated(cb: (data: TickerEvent[]) => void, transform?: boolean): CleanupFn;
  miniTicker(payload: string | string[], cb: (data: MiniTickerEvent) => void, transform?: boolean): CleanupFn;
  allMiniTickers(cb: (data: MiniTickerEvent[]) => void, transform?: boolean): CleanupFn;
  customSubStream(payload: string | string[], cb: (data: any) => void): CleanupFn;
  user(cb: (data: any) => void, transform?: boolean): Promise<CleanupFn>;
  marginUser(cb: (data: any) => void, transform?: boolean): Promise<CleanupFn>;

  // Futures
  futuresDepth(payload: string | string[], cb: (data: FuturesDepthEvent) => void, transform?: boolean): CleanupFn;
  futuresRpiDepth(payload: string | string[], cb: (data: FuturesDepthEvent) => void, transform?: boolean): CleanupFn;
  futuresPartialDepth(payload: PartialDepthPayload | PartialDepthPayload[], cb: (data: FuturesPartialDepthEvent) => void, transform?: boolean): CleanupFn;
  futuresCandles(payload: string | string[], interval: string, cb: (data: CandleEvent) => void, transform?: boolean): CleanupFn;
  futuresTicker(payload: string | string[], cb: (data: FuturesTickerEvent) => void, transform?: boolean): CleanupFn;
  futuresAllTickers(cb: (data: FuturesTickerEvent[]) => void, transform?: boolean): CleanupFn;
  futuresAggTrades(payload: string | string[], cb: (data: FuturesAggTradeEvent) => void, transform?: boolean): CleanupFn;
  futuresLiquidations(payload: string | string[], cb: (data: FuturesLiquidationEvent) => void, transform?: boolean): CleanupFn;
  futuresAllLiquidations(cb: (data: FuturesLiquidationEvent) => void, transform?: boolean): CleanupFn;
  futuresUser(cb: (data: any) => void, transform?: boolean): Promise<CleanupFn>;
  futuresCustomSubStream(payload: string | string[], cb: (data: any) => void): CleanupFn;
  futuresAllMarkPrices(payload: FuturesAllMarkPricesPayload, cb: (data: FuturesMarkPriceEvent[]) => void): CleanupFn;

  // Delivery
  deliveryDepth(payload: string | string[], cb: (data: DeliveryDepthEvent) => void, transform?: boolean): CleanupFn;
  deliveryPartialDepth(payload: PartialDepthPayload | PartialDepthPayload[], cb: (data: DeliveryPartialDepthEvent) => void, transform?: boolean): CleanupFn;
  deliveryCandles(payload: string | string[], interval: string, cb: (data: DeliveryCandleEvent) => void, transform?: boolean): CleanupFn;
  deliveryTicker(payload: string | string[], cb: (data: DeliveryTickerEvent) => void, transform?: boolean): CleanupFn;
  deliveryAllTickers(cb: (data: DeliveryTickerEvent[]) => void, transform?: boolean): CleanupFn;
  deliveryAggTrades(payload: string | string[], cb: (data: FuturesAggTradeEvent) => void, transform?: boolean): CleanupFn;
  deliveryUser(cb: (data: any) => void, transform?: boolean): Promise<CleanupFn>;
  deliveryCustomSubStream(payload: string | string[], cb: (data: any) => void): CleanupFn;
}
