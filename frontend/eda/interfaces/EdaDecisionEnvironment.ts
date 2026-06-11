import { DecisionEnvironment, DecisionEnvironmentRead } from './generated/eda-api';

export interface EdaDecisionEnvironment extends DecisionEnvironment {
  pull_policy?: string;
}

export interface EdaDecisionEnvironmentRead extends DecisionEnvironmentRead {
  pull_policy?: string;
}
