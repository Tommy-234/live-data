import { IndicatorType, Candle } from '../types';

export type IndicatorInput = {
  history: Candle[],
  type: IndicatorType,
  count: number
}

export class Indicator {
  Count: number;
  Type: IndicatorType;
  Cumulative: boolean = false;
  Value: number;

  constructor({
    history,
    type,
    count
  }: IndicatorInput ) {
    this.Type = type;
    this.Count = count;
    this.setup(history);
  }

  setup( history: Candle[] ): void {}
  calculate( mostRecentCandle: Candle ): number {return 0}
  removeCandle( candle: Candle ): void {}
};
