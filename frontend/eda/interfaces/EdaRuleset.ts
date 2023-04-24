import { RulesetOut } from './generated/eda-api';

export interface EdaRuleset extends Omit<RulesetOut, 'fired_stats'> {
  fired_stats: {
    fired_count: number;
  };
}
