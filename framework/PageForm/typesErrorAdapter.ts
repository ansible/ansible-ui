import React from 'react';

export interface GenericErrorDetail {
  message: string | React.ReactNode;
}

export interface FieldErrorDetail extends GenericErrorDetail {
  name: string;
}

export interface ErrorOutput {
  genericErrors: GenericErrorDetail[];
  fieldErrors: FieldErrorDetail[];
}

export type ErrorAdapter = (error: unknown, mappedKeys?: Record<string, string>) => ErrorOutput;
