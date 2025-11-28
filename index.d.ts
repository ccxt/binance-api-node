import { BinanceRestClient } from './types/base';
import { GenericEndpoints } from './types/generic';
import { MarketEndpoints } from './types/market';
import { OrderEndpoints } from './types/order';
import { AccountEndpoints } from './types/account';
import { StreamEndpoints } from './types/stream';
import { FuturesEndpoints } from './types/futures';
import { DeliveryEndpoints } from './types/delivery';
import { PAPIEndpoints } from './types/papi';
import { MarginEndpoints } from './types/margin';
import { PortfolioMarginEndpoints } from './types/portfolio-margin';
import { SavingsEndpoints } from './types/savings';
import { MiningEndpoints } from './types/mining';
import { UtilityEndpoints } from './types/utility';

export interface BinanceRest extends
  GenericEndpoints,
  MarketEndpoints,
  OrderEndpoints,
  AccountEndpoints,
  StreamEndpoints,
  FuturesEndpoints,
  DeliveryEndpoints,
  PAPIEndpoints,
  MarginEndpoints,
  PortfolioMarginEndpoints,
  SavingsEndpoints,
  MiningEndpoints,
  UtilityEndpoints {}

export * from './types/base';

export {
  BinanceRestOptions,
  RateLimitType,
  RateLimitInterval,
  OrderType,
  OrderSide,
  TimeInForce,
  TradingType
} from './types/base';

export * from './types/market';

export {
  Trade,
  Ticker,
  BookTicker,
  CandleChartResult,
  AggregatedTrade,
  MarketEndpoints
} from './types/market'

export * from './types/order';

export {
  OrderEndpoints,
} from './types/order';

export * from './types/account';

export {
  Account,
  AssetBalance,
  TradeFee,
  DepositAddress,
  WithdrawResponse,
  DepositStatus,
  DepositStatus_LT,
  UserAssetDribbletDetails,
  UserAssetDribblets,
  DustLog,
  DustTransfer,
  DustTransferResult,
  DepositHistoryResponse,
  WithdrawStatus,
  WithdrawStatus_LT,
  WithdrawHistoryResponse,
  AccountEndpoints
} from './types/account';

export * from './types/stream';

export {
  StreamEndpoints
} from './types/stream';

export * from './types/futures';

export {
  FuturesEndpoints,
} from './types/futures';

export * from './types/delivery';

export {
  DeliveryEndpoints
} from './types/delivery';

export * from './types/papi';

export {
  PAPIEndpoints,
} from './types/papi';

export * from './types/margin';

export {
  MarginAsset,
  MarginAccountInfo,
  MarginIsolatedAsset,
  MarginIsolatedSymbol,
  MarginIsolatedAccount,
  MarginMaxBorrow,
  MarginOrderParams,
  MarginOrderOcoParams,
  MarginEndpoints
} from './types/margin';

export * from './types/portfolio-margin';

export {
  PortfolioMarginEndpoints,
} from './types/portfolio-margin';

export * from './types/savings';

export {
  SavingsEndpoints,
} from './types/savings';

export * from './types/mining';

export {
  MiningEndpoints,
} from './types/mining';

export * from './types/utility';

// export {

// } from './types/utility';


declare function Binance(options?: BinanceRestClient.BinanceRestOptions): BinanceRest;
export default Binance;
