import { forEach } from 'lodash';
import { Candle } from '../types';
import { Indicator } from '.';

export class MovingAverage extends Indicator {
  private TotalPrice: number;
  
  setup( history: Candle[] ): void {
    let total = 0;
    forEach(history.slice(-(this.Count-1)), (candle: Candle) => {
      total += candle.close;
    });
    this.TotalPrice = total;
  }
  
  calculate( mostRecentCandle: Candle ): number {
    const total = this.TotalPrice + mostRecentCandle.close;
    const MA = total / (this.Count);
    if (mostRecentCandle.isClosed) {
      this.TotalPrice = total;
    }
    this.Value = MA;
    return MA;
  }

  removeCandle(candle: Candle) {
    this.TotalPrice -= candle.close;
  }
}