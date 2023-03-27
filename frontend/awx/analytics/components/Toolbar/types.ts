import { SelectOptionObject } from '@patternfly/react-core';

export type AttributeType =
  | string
  | string[]
  | SelectOptionObject
  | SelectOptionObject[]
  | boolean;

export interface SelectOptionProps {
  value: string;
  description: string;
  key: string;
}

export type SetValue = (value: AttributeType | undefined) => void;
export type SetValues = (
  type: string | undefined,
  value: AttributeType | undefined
) => void;
export type ApiOptionsType = Record<
  string,
  { key: string; value: AttributeType }[]
>;

export interface User {
  uuid: string;
  name: string;
  emails: string[];
  usernames: string[];
}
