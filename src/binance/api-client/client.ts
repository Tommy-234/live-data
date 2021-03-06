import axios from 'axios';
import { CreateOrderInput } from './types';
import { toNumber, map, filter, get, includes } from 'lodash';
import { Candle, Info24Hour } from '../../types';
import { createHmac } from 'crypto';
import { encode } from 'querystring';

export type BinanceApiConfig = {
  endpoint: string;
  apiKey?: string;
  secretKey?: string;
}

export class BinanceApiClient {
  private config: BinanceApiConfig
  
  constructor(config: BinanceApiConfig) {
    this.config = config;
  }

  binanceRequest = async (uri: string): Promise<any> => {
    const url = this.config.endpoint + uri;
    return axios.get(
      url,
      {
        // TODO: Only provide apiKey for secure requests
        // headers: { 'X-MBX-APIKEY': this.config.apiKey }
      }
    )
      .then( (res) => {
        return res.data;
      })
      .catch( (error) => {
        console.log('binanceRequest error...');
        console.log(error.response.data);
        return {};
      })
    ;
  }

  generateRequestSignature = (URIparams: string) => {
    const timeStamp = Date.now();
    let result = URIparams ? URIparams.concat('&') : '';
    result = result.concat(`timestamp=${timeStamp}&recvWindow=10000`);
    const signature = createHmac('SHA256', this.config.secretKey)
      .update(result.slice(1))
      .digest('base64');
    return result.concat(`&signature=${signature}`); 
  }

  createOrder = async (params: CreateOrderInput) => {
    let paramString = this.generateRequestSignature(encode(params));
    const result = await this.binanceRequest(`/v3/order?${paramString}`);
    return result;
  }

  historicData = async ({ 
    symbol,
    interval,
    limit = 1,
    timeStamp = Date.now()
  }): Promise<Candle[]> => {
    const uri = `/v1/klines?interval=${interval}&symbol=${symbol}&limit=${limit}&endTime=${timeStamp}`;
    const candles = await this.binanceRequest(uri);
  
    return map(candles, (candle: string[]): Candle => ({
      openTime: toNumber(candle[0]),
      open: toNumber(candle[1]),
      high: toNumber(candle[2]),
      low: toNumber(candle[3]),
      close: toNumber(candle[4]),
      volume: toNumber(candle[5]),
      closeTime: toNumber(candle[6]),
      quoteAssetVolume: toNumber(candle[7]),
      numberTrades: toNumber(candle[8]),
      baseAssetBuyVolume: toNumber(candle[9]),
      quoteAssetBuyVolume: toNumber(candle[10]),
      isClosed: false
    }));
  }

  bitcoinPairings = async (): Promise<Info24Hour[]> => {
    const uri = '/v3/ticker/24hr';
    const allPairs = await this.binanceRequest(uri);

    return map(
      filter(
        allPairs,
        pair => 
          includes(get(pair, 'symbol'), 'BTC') &&
          toNumber(get(pair, 'lastPrice')) !== 0
      ),
      pair => ({
        symbol: pair.symbol,
        priceChange: toNumber(pair.priceChange),
        priceChangePercent: toNumber(pair.priceChangePercent),
        weightedAvgPrice: toNumber(pair.weightedAvgPrice),
        prevClosePrice: toNumber(pair.prevClosePrice),
        lastPrice: toNumber(pair.lastPrice),
        lastQty: toNumber(pair.lastQty),
        bidPrice: toNumber(pair.bidPrice),
        bidQty: toNumber(pair.bidQty),
        askPrice: toNumber(pair.askPrice),
        askQty: toNumber(pair.askQty),
        openPrice: toNumber(pair.openPrice),
        highPrice: toNumber(pair.highPrice),
        lowPrice: toNumber(pair.lowPrice),
        volume: toNumber(pair.volume),
        quoteVolume: toNumber(pair.quoteVolume),
        openTime: pair.openTime,
        closeTime: pair.closeTime,
        firstId: pair.firstId,
        lastId: pair.lastId,
        count: pair.count
      })
    );
  }
}
