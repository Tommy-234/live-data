import { IndicatorClassMap, IndicatorType, Candle } from '../types';
import { Indicator } from '../indicators';
import { concat, forEach, find } from 'lodash';

export class HistoryManager {
  History: Candle[];
  MostRecentCandle: Candle;
  IsNewCandle: boolean = false;

  // TODO - (scaling) - maybe move these out - move data to client?
  Indicators: Array<Indicator> = [];
  // Notifications: MarketNotification[] = [];

  constructor(history: Candle[]) {
    this.History = history.slice(0, -1);
    this.MostRecentCandle = history[history.length-1];
  }
  
  updateHistory(streamPayload: Candle): void {
    if (this.IsNewCandle) {
      this.History = concat(this.History.slice(1), this.MostRecentCandle);
      this.MostRecentCandle = {} as Candle;
      this.IsNewCandle = false;
    }
    this.MostRecentCandle = streamPayload;
    if (streamPayload.isClosed) {
      this.IsNewCandle = true;
    }
  }
  
  updateIndicators(streamPayload: Candle): void {
    const history = this.History;
    forEach(this.Indicators, (indicator: Indicator) => {
      indicator.calculate(streamPayload);
      if (streamPayload.isClosed && !indicator.Cumulative) {
        const index = history.length - indicator.Count + 1;
        indicator.removeCandle(history[index]);
      }
    });
  }

  addIndicator(type: IndicatorType, count: number): Indicator {
    const indicatorClass = IndicatorClassMap[type];
    const newIndicator = new indicatorClass({ history: this.History, type, count });
    this.Indicators.push(newIndicator);
    return newIndicator;
  }

  findIndicator = (type: IndicatorType, count: number): Indicator => {
    return find( this.Indicators, ( indicator: Indicator ) =>
      indicator.Count === count && indicator.Type === type
    );
  }

  getIndicators(decimals: number = 8) {
    const indicators = {};
    forEach(this.Indicators, (indicator: Indicator) => {
      const key = `${indicator.Type}_${indicator.Count}`;
      indicators[key] = indicator.Value ? indicator.Value.toFixed(decimals) : 0;
    });
    const returnData = {
      indicators,
      currentCandle: this.MostRecentCandle
    };
    return returnData;
  }
};