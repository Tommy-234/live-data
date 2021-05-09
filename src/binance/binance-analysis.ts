import { IntervalType, StreamType } from '../types';
import { StreamManager } from '../data-management'
import { BinanceStream, BinanceApiClient, BinanceApiConfig } from './api-client';
import { toLower } from 'lodash';

const HISTORY_LIMIT = 200;
const BINANCE_STREAM_SEPARATOR = '/';

export type BinanceAnalysisConfig = {
  apiConfig: BinanceApiConfig;
  streamConfig: {
    endpoint: string;
  }
}

export class BinanceAnalysis {
  streamManager: StreamManager;
  apiClient: BinanceApiClient;

  constructor({ onUpdate, config }: {
    onUpdate: (data: any) => void,
    config: BinanceAnalysisConfig
  }) {
    this.streamManager = new StreamManager(
      onUpdate,
      BinanceStream,
      config.streamConfig.endpoint
    );
    this.apiClient = new BinanceApiClient(config.apiConfig);
  }

  newStream = async (
    symbol: string,
    type: StreamType,
    interval: IntervalType
  ): Promise<void> => {
    const name = `${toLower(symbol)}@${type}_${interval}`;
    if ( this.streamManager.findStream(name) ) {return;}
    
    const historyData = await this.apiClient.historicData({
      symbol,
      interval,
      limit: HISTORY_LIMIT
    });
    this.streamManager.newStream(name, historyData)
  }

  resetStream = (): void => {
    this.streamManager.resetStreams(BINANCE_STREAM_SEPARATOR);
  }
};
  