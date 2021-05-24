import {
  MarketNotification,
  MarketCondition,
  IndicatorType,
  Operator,
  GlobalIndicator,
  Candle
} from '../types';
import { HistoryManager } from './history-manager';
import { forEach, filter } from 'lodash';

export class Stream {
  name: string;
  historyManager: HistoryManager;
  notifications: MarketNotification[] = [];

  constructor(
    name: string,
    historyData: Candle[],
    indicatorList: GlobalIndicator[]
  ) {
    this.name = name;
    this.historyManager = new HistoryManager(historyData);
    
    forEach(indicatorList, (indicator: GlobalIndicator) => {
      this.newIndicator(indicator.type, indicator.count);
    });
  }

  newIndicator = (type: IndicatorType, count: number) => {
    this.historyManager.addIndicator(type, count);
  }

  checkMarketConditions(): void {
    const indicatorValues = this.historyManager.getIndicators();
    this.notifications = filter(this.notifications, (notification: MarketNotification) => {
      let conditionsFalse = true;
      forEach(notification.conditions, (condition: MarketCondition) => {
        const liveValue = this.resolveDataPath(condition.dataPath, indicatorValues);
        if (
          (
            condition.operator === Operator.GREATER_THAN && 
            liveValue > condition.value
          ) || (
            condition.operator === Operator.LESS_THAN && 
            liveValue < condition.value
          )
        ) {
          conditionsFalse = false;
        } else {
          conditionsFalse = true;
        }
      });
      !conditionsFalse && notification.callback();
      return conditionsFalse;
    });
  }

  resolveDataPath(dataPath: string, data: unknown) {
    let resolvedData = data;
    forEach(dataPath.split('.'), (pathSegment: string) => {
      resolvedData = resolvedData ? resolvedData[pathSegment] : {};
    });
    return resolvedData;
  }
}