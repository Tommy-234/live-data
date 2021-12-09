import { MovingAverage, RSI, VolumeAverage } from '../indicators';

export type Candle = {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteAssetVolume: number;
  numberTrades: number;
  baseAssetBuyVolume: number;
  quoteAssetBuyVolume: number;
  isClosed: Boolean;
}

export type Info24Hour = {
  symbol: string;
  priceChange: number;
  priceChangePercent: number;
  weightedAvgPrice: number;
  prevClosePrice: number;
  lastPrice: number;
  lastQty: number;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export type StreamPayload = {
  stream: string;
  candle: Candle;
}

export const IndicatorClassMap = {
  'RSI': RSI,
  'MovingAverage': MovingAverage,
  'VolumeAverage': VolumeAverage
}

export enum IndicatorType {
  RSI = 'RSI',
  MovingAverage = 'MovingAverage',
  VolumeAverage = 'VolumeAverage'
}

export enum IntervalType {
  Minute1 = '1m',
  Minute3 = '3m',
  Minute5 = '5m',
  Minute15 = '15m',
  Hour1 = '1h',
  Hour2 = '2h',
  Hour4 = '4h',
  Hour12 = '12h',
  Day1 = '1d',
  Week1 = '1w',
  Month1 = '1m'
}

export enum StreamType {
  KLINE = 'kline'
}

export type GlobalIndicator = {
  type: IndicatorType;
  count: number;
};
