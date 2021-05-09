import {
  MarketNotification,
  MarketCondition,
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
    const HM = new HistoryManager(historyData);
    forEach(indicatorList, (indicator: GlobalIndicator) => {
      HM.addIndicator(indicator.type, indicator.count);
    });
    this.historyManager = HM;
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