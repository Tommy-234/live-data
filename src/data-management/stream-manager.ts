import {
  Operator,
  GlobalIndicator,
  IndicatorType,
  StreamPayload,
  GenericStream,
  Candle
} from '../types';
import { Stream } from './stream';
import { forEach, find, remove } from 'lodash';

export type NewNotificationInput = {
  streamName: string;
  dataPath: string;
  operator: Operator;
  value: number;
  callback: () => void;
}

export class StreamManager {
  dataStreamIn: GenericStream;
  streams: Stream[] = [];
  globalIndicators: GlobalIndicator[] = [];
  onUpdate: (data: any) => void;

  constructor(
    onUpdate: (data: any) => void,
    streamClass: typeof GenericStream,
    streamEndpoint: string
  ) {
    this.onUpdate = onUpdate;
    this.dataStreamIn = new streamClass(
      (data: StreamPayload) => this.onDataIn(data),
      streamEndpoint
    );
  }

  newStream = (name: string, history: Candle[]): Stream => {
    const newStream = new Stream(name, history, this.globalIndicators);
    this.streams.push(newStream);
    return newStream;
  }

  newGlobalIndicator = (type: IndicatorType, count: number): void => {
    if ( find( this.globalIndicators, ( indicator: GlobalIndicator ) =>
      indicator.count === count && indicator.type === type
    )) {return;}

    forEach(this.streams, (stream: Stream) => {
      stream.newIndicator(type, count);
    });

    this.globalIndicators.push({ type, count });
  }

  newNotification(input: NewNotificationInput): void {
    const { dataPath, operator, value, streamName, callback } = input;
    const stream = this.findStream(streamName);
    stream.notifications.push({
      conditions: [
        { dataPath, operator, value }
      ],
      callback
    });
  }

  findStream = (streamName: string): Stream => {
    return find( this.streams, ( stream: Stream ) =>
      stream.name === streamName
    )
  }

  deleteStream = (streamName: string): void => {
    this.streams = remove(this.streams, stream => stream.name === streamName);
  }

  resetStreams = (separator: string): void => {
    let streamsString = '';
    forEach(this.streams, (stream: Stream) => {
      streamsString = streamsString
        ? streamsString.concat(separator, stream.name)
        : stream.name;
    });
    this.dataStreamIn.reset(streamsString);
  }

  onDataIn = (payload: StreamPayload): void => {
    const findStream = this.findStream(payload.stream);
    findStream.historyManager.updateHistory(payload.candle);
    findStream.historyManager.updateIndicators(payload.candle);
    findStream.checkMarketConditions();
    this.onUpdate(this.getData());
  }

  getData(): any {
    let returnData = [];
    forEach(this.streams, (stream: Stream) => {
      // 2 decimals if base is USD, otherwise 8 decimals (for BTC base)
      // assume base is USD if stream name contains 'usd'
      const decimals = stream.name.search('usd') >= 0 ? 2 : 8;
      
      const indicatorValues = stream.historyManager.getIndicators(decimals);
      returnData.push({
        stream: stream.name,
        ...indicatorValues
      }); 
    });
    return returnData;
  }
}