import { forEach } from 'lodash';
import { Candle } from '../types';
import { Indicator } from '.';

export class RSI extends Indicator {
  Cumulative = true;

  private AverageGain: number;
  private AverageLoss: number;
  private PrevClose: number;

  setup(history: Candle[]): void {
    let totalGains = 0;
    let totalLoss = 0;
    let prevClose = 0;
    forEach(history.slice(0, this.Count-1), (candle: Candle) => {
      prevClose = prevClose ? prevClose : candle.open;
      const change = candle.close - prevClose;
      if (change < 0) {
        totalLoss = totalLoss - change; 
      } else {
        totalGains = totalGains + change;
      }
      prevClose = candle.close;
    });
    let averageGain = totalGains / this.Count;
    let averageLoss = totalLoss / this.Count;
    let change = 0
    forEach(history.slice(this.Count), (candle: Candle) => {
      change = candle.close - prevClose;
      if (change < 0) {
        averageLoss = (averageLoss * (this.Count-1) - change) / this.Count; 
        averageGain = (averageGain * (this.Count-1)) / this.Count;
      } else {
        averageGain = (averageGain * (this.Count-1) + change) / this.Count;
        averageLoss = (averageLoss * (this.Count-1)) / this.Count; 
      }
      prevClose = candle.close;
    });
    this.AverageGain = averageGain;
    this.AverageLoss = averageLoss;
    this.PrevClose = prevClose;
  }

  calculate(mostRecentCandle: Candle): number {
    let RSI = 0;
    let averageLoss = this.AverageLoss;
    let averageGain = this.AverageGain;
    if (mostRecentCandle.close && this.PrevClose) {
      const change = mostRecentCandle.close - this.PrevClose;
      if (change < 0) {
        averageLoss = (averageLoss * (this.Count-1) - change) / this.Count;
        averageGain = (averageGain * (this.Count-1)) / this.Count;
      } else {
        averageGain = (averageGain * (this.Count-1) + change) / this.Count;
        averageLoss = (averageLoss * (this.Count-1)) / this.Count;
      }
      const RS = averageGain / averageLoss;
      RSI = 100 - (100 / (1 + RS));
    }
    if (mostRecentCandle.isClosed) {
      this.AverageGain = averageGain;
      this.AverageLoss = averageLoss;
      this.PrevClose = mostRecentCandle.close;
    }
    this.Value = RSI;
    return RSI;
  }
};
