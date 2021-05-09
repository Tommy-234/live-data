import axios from 'axios';
import { CreateOrderInput } from './types';
import { toNumber, map } from 'lodash';
import { Candle } from '../../types';
import { createHmac } from 'crypto';
import { encode } from 'querystring';

export type BinanceApiConfig = {
  endpoint: string;
  apiKey: string;
  secretKey: string;
}

export class BinanceApiClient {
  private config: BinanceApiConfig
  
  constructor(config: BinanceApiConfig) {
    this.config = config;
  }

  binanceRequest = async (uri: string): Promise<any> => {
    const url = this.config.endpoint + uri;
    return axios.get(url, { headers: { 'X-MBX-APIKEY': this.config.apiKey }})
      .then( (res) => {
        return res.data;
      })
      .catch( (error) => {
        console.log('getDataTest error...');
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
}
