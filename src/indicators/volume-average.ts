import { forEach } from 'lodash';
import { Candle } from '../types';
import { Indicator } from '.';

export class VolumeAverage extends Indicator {
  private TotalVolume: number;
  
  setup( history: Candle[] ): void {
    let total = 0;
    forEach(history.slice(-(this.Count-1)), (candle: Candle) => {
      total += candle.volume;
    });
    this.TotalVolume = total;
  }
  
  calculate( mostRecentCandle: Candle ): number {
    const total = this.TotalVolume + mostRecentCandle.volume;
    const MA = total / (this.Count);
    if (mostRecentCandle.isClosed) {
      this.TotalVolume = total;
    }
    this.Value = MA;
    return MA;
  }

  removeCandle(candle: Candle) {
    this.TotalVolume -= candle.volume;
  }
}