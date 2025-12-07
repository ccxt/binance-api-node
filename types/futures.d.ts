import { BinanceRestClient, OrderSide, OrderStatus, OrderType, TimeInForce } from './base';

export interface FuturesEndpoints extends BinanceRestClient {
  futuresPing(): Promise<boolean>;
  futuresTime(): Promise<{
    serverTime: number;
  }>;
  futuresExchangeInfo(): Promise<any>;
  futuresBook(payload: { symbol: string; limit?: number }): Promise<{
    lastUpdateId: number;
    asks: Array<[string, string]>;
    bids: Array<[string, string]>;
  }>;
  futuresAggTrades(payload: { symbol: string; fromId?: number; startTime?: number; endTime?: number; limit?: number }): Promise<Array<{
    aggId: number;
    symbol: string;
    price: string;
    quantity: string;
    firstId: number;
    lastId: number;
    timestamp: number;
    isBuyerMaker: boolean;
    wasBestPrice?: boolean;
  }>>;
  futuresMarkPrice(payload: { symbol: string }): Promise<{
    symbol: string;
    markPrice: string;
    lastFundingRate: string;
    nextFundingTime: number;
    time: number;
  }>;
  futuresAllForceOrders(payload?: { symbol?: string; startTime?: number; endTime?: number; limit?: number }): Promise<Array<{
    orderId: number;
    symbol: string;
    status: OrderStatus;
    clientOrderId: string;
    price: string;
    avgPrice: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    timeInForce: TimeInForce;
    type: OrderType;
    reduceOnly: boolean;
    closePosition: boolean;
    side: OrderSide;
    positionSide: string;
    stopPrice: string;
    workingType: string;
    priceProtect: boolean;
    origType: string;
    time: number;
    updateTime: number;
  }>>;
  futuresLongShortRatio(payload: { symbol: string; period?: string; limit?: number; startTime?: number; endTime?: number }): Promise<Array<{
    symbol: string;
    longShortRatio: string;
    longAccount: string;
    shortAccount: string;
    timestamp: number;
  }>>;
  futuresCandles(payload: { symbol: string; interval: string; startTime?: number; endTime?: number; limit?: number }): Promise<Array<{
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteVolume: string;
    trades: number;
    baseAssetVolume: string;
    quoteAssetVolume: string;
  }>>;
  futuresMarkPriceCandles(payload: { symbol: string; interval: string; startTime?: number; endTime?: number; limit?: number }): Promise<Array<{
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteVolume: string;
    trades: number;
    baseAssetVolume: string;
    quoteAssetVolume: string;
  }>>;
  futuresIndexPriceCandles(payload: { pair: string; interval: string; startTime?: number; endTime?: number; limit?: number }): Promise<Array<{
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteVolume: string;
    trades: number;
    baseAssetVolume: string;
    quoteAssetVolume: string;
  }>>;
  futuresTrades(payload: { symbol: string; limit?: number }): Promise<Array<{
    id: number;
    price: string;
    qty: string;
    quoteQty: string;
    time: number;
    isBuyerMaker: boolean;
    isBestMatch: boolean;
    isRPITrade?: boolean;
  }>>;
  futuresDailyStats(payload?: { symbol?: string }): Promise<Array<{
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    prevClosePrice: string;
    lastQty: string;
    bidPrice: string;
    bidQty: string;
    askPrice: string;
    askQty: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    firstId: number;
    lastId: number;
    count: number;
  }>>;
  futuresPrices(payload?: { symbol?: string }): Promise<{
    [key: string]: string;
  }>;
  futuresAllBookTickers(): Promise<{
    [key: string]: {
      symbol: string;
      bidPrice: string;
      bidQty: string;
      askPrice: string;
      askQty: string;
    };
  }>;
  futuresFundingRate(payload: { symbol: string }): Promise<{
    symbol: string;
    fundingRate: string;
    fundingTime: number;
  }>;
  futuresOrder(payload: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity?: string;
    quoteOrderQty?: string;
    price?: string;
    newClientOrderId?: string;
    stopPrice?: string;
    trailingDelta?: number;
    trailingTime?: number;
    icebergQty?: string;
    newOrderRespType?: string;
    timeInForce?: TimeInForce;
  }): Promise<{
    symbol: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    status: OrderStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: OrderSide;
    marginBuyBorrowAmount: string;
    marginBuyBorrowAsset: string;
    fills: Array<{
      price: string;
      qty: string;
      commission: string;
      commissionAsset: string;
    }>;
  }>;
  futuresBatchOrders(payload: { batchOrders: Array<{
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity?: string;
    quoteOrderQty?: string;
    price?: string;
    newClientOrderId?: string;
    stopPrice?: string;
    trailingDelta?: number;
    trailingTime?: number;
    icebergQty?: string;
    newOrderRespType?: string;
    timeInForce?: TimeInForce;
  }> }): Promise<Array<{
    code: number;
    msg: string;
    symbol: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    status: OrderStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: OrderSide;
    marginBuyBorrowAmount: string;
    marginBuyBorrowAsset: string;
    fills: Array<{
      price: string;
      qty: string;
      commission: string;
      commissionAsset: string;
    }>;
  }>>;
  futuresGetOrder(payload: { symbol: string; orderId?: number; origClientOrderId?: string }): Promise<{
    symbol: string;
    orderId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    status: OrderStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: OrderSide;
    marginBuyBorrowAmount: string;
    marginBuyBorrowAsset: string;
    fills: Array<{
      price: string;
      qty: string;
      commission: string;
      commissionAsset: string;
    }>;
  }>;
  futuresCancelOrder(payload: { symbol: string; orderId?: number; origClientOrderId?: string }): Promise<{
    symbol: string;
    origClientOrderId: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    status: OrderStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: OrderSide;
  }>;
  futuresCancelAllOpenOrders(payload: { symbol: string }): Promise<Array<{
    symbol: string;
    origClientOrderId: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    status: OrderStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: OrderSide;
  }>>;
  futuresCancelBatchOrders(payload: { symbol: string; orderIdList: number[] }): Promise<Array<{
    code: number;
    msg: string;
    symbol: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    status: OrderStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: OrderSide;
  }>>;
  futuresOpenOrders(payload?: { symbol?: string }): Promise<Array<{
    symbol: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    status: OrderStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: OrderSide;
    marginBuyBorrowAmount: string;
    marginBuyBorrowAsset: string;
    fills: Array<{
      price: string;
      qty: string;
      commission: string;
      commissionAsset: string;
    }>;
  }>>;
  futuresAllOrders(payload: { symbol: string; orderId?: number; startTime?: number; endTime?: number; limit?: number }): Promise<Array<{
    symbol: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    cumQuote: string;
    status: OrderStatus;
    timeInForce: TimeInForce;
    type: OrderType;
    side: OrderSide;
    marginBuyBorrowAmount: string;
    marginBuyBorrowAsset: string;
    fills: Array<{
      price: string;
      qty: string;
      commission: string;
      commissionAsset: string;
    }>;
  }>>;
  futuresPositionRisk(payload?: { symbol?: string }): Promise<Array<{
    entryPrice: string;
    leverage: string;
    liquidationPrice: string;
    markPrice: string;
    maxNotionalValue: string;
    positionAmt: string;
    symbol: string;
    unRealizedProfit: string;
    isolatedMargin: string;
    isolatedWallet: string;
    isolatedUnrealizedProfit: string;
    isolatedMarginLevel: string;
    isolatedMaintMargin: string;
    isolatedMaxNotionalValue: string;
    notional: string;
    unrealizedPnl: string;
    marginLevel: string;
  }>>;
  futuresLeverageBracket(payload: { symbol: string }): Promise<Array<{
    symbol: string;
    brackets: Array<{
      bracket: number;
      initialLeverage: number;
      notionalCap: number;
      notionalFloor: number;
      maintMarginRatio: number;
      cum: number;
    }>;
  }>>;
  futuresAccountBalance(): Promise<Array<{
    accountAlias: string;
    asset: string;
    walletBalance: string;
    unrealizedProfit: string;
    marginBalance: string;
    initialMargin: string;
    positionInitialMargin: string;
    openOrderInitialMargin: string;
    maxWithdrawAmount: string;
    crossUnPnl: string;
    crossWalletBalance: string;
    crossMarginBalance: string;
    availableBalance: string;
    marginAvailable: boolean;
    updateTime: number;
  }>>;
  futuresAccountInfo(): Promise<{
    assets: Array<{
      asset: string;
      walletBalance: string;
      unrealizedProfit: string;
      marginBalance: string;
      initialMargin: string;
      positionInitialMargin: string;
      openOrderInitialMargin: string;
      maxWithdrawAmount: string;
      crossUnPnl: string;
      crossWalletBalance: string;
      crossMarginBalance: string;
      availableBalance: string;
      marginAvailable: boolean;
      updateTime: number;
    }>;
    positions: Array<{
      symbol: string;
      positionAmt: string;
      entryPrice: string;
      markPrice: string;
      unRealizedProfit: string;
      liquidationPrice: string;
      leverage: string;
      maxNotionalValue: string;
      marginType: string;
      isolatedMargin: string;
      isolatedWallet: string;
      isolatedUnrealizedProfit: string;
      isolatedMarginLevel: string;
      isolatedMaintMargin: string;
      isolatedMaxNotionalValue: string;
      notional: string;
      unrealizedPnl: string;
      marginLevel: string;
    }>;
    canDeposit: boolean;
    canTrade: boolean;
    canWithdraw: boolean;
    feeTier: number;
    updateTime: number;
    totalInitialMargin: string;
    totalMaintMargin: string;
    totalWalletBalance: string;
    totalUnrealizedProfit: string;
    totalMarginBalance: string;
    totalPositionInitialMargin: string;
    totalOpenOrderInitialMargin: string;
    totalCrossWalletBalance: string;
    totalCrossUnPnl: string;
    availableBalance: string;
    maxWithdrawAmount: string;
  }>;
  futuresUserTrades(payload: { symbol: string; startTime?: number; endTime?: number; fromId?: number; limit?: number }): Promise<Array<{
    symbol: string;
    id: number;
    orderId: number;
    side: OrderSide;
    price: string;
    qty: string;
    realizedPnl: string;
    marginAsset: string;
    baseQty: string;
    commission: string;
    commissionAsset: string;
    time: number;
    positionSide: string;
    buyer: boolean;
    maker: boolean;
  }>>;
  futuresPositionMode(payload: { dualSidePosition: boolean }): Promise<{
    code: number;
    msg: string;
  }>;
  futuresPositionModeChange(payload: { dualSidePosition: boolean }): Promise<{
    code: number;
    msg: string;
  }>;
  futuresLeverage(payload: { symbol: string; leverage: number }): Promise<{
    leverage: number;
    maxNotionalValue: string;
    symbol: string;
  }>;
  futuresMarginType(payload: { symbol: string; marginType: string }): Promise<{
    code: number;
    msg: string;
  }>;
  futuresPositionMargin(payload: { symbol: string; positionSide: string; amount: string; type: number }): Promise<{
    code: number;
    msg: string;
  }>;
  futuresMarginHistory(payload: { symbol: string }): Promise<Array<{
    symbol: string;
    positionSide: string;
    marginType: string;
    amount: string;
    asset: string;
    time: number;
  }>>;
  futuresIncome(payload?: { symbol?: string; incomeType?: string; startTime?: number; endTime?: number; limit?: number }): Promise<Array<{
    symbol: string;
    incomeType: string;
    income: string;
    asset: string;
    info: string;
    time: number;
    tradeId: string;
    infoDetail: string;
  }>>;
  getMultiAssetsMargin(payload: { multiAssetsMargin: boolean }): Promise<{
    code: number;
    msg: string;
  }>;
  setMultiAssetsMargin(payload: { multiAssetsMargin: boolean }): Promise<{
    code: number;
    msg: string;
  }>;
  futuresRpiDepth(payload: { symbol: string; limit?: number }): Promise<{
    lastUpdateId: number;
    asks: Array<[string, string]>;
    bids: Array<[string, string]>;
  }>;
  futuresSymbolAdlRisk(payload?: { symbol?: string }): Promise<Array<{
    symbol: string;
    adlLevel: number;
  }> | {
    symbol: string;
    adlLevel: number;
  }>;
  futuresCommissionRate(payload: { symbol: string }): Promise<{
    symbol: string;
    makerCommissionRate: string;
    takerCommissionRate: string;
    rpiCommissionRate?: string;
  }>;
} 