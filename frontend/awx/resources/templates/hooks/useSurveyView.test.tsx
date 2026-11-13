import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { Spec } from '../../../interfaces/Survey';
import { useSurveyView } from './useSurveyView';

const surveySpec: Spec[] = [
  {
    question_name: 'Question 1',
    question_description: '',
    variable: 'q1',
    type: 'text',
    required: true,
    min: 0,
    max: 0,
    default: '',
    choices: [],
    new_question: false,
  },
];

const server = setupServer(
  http.get(awxAPI`/job_templates/:id/survey_spec/`, () => HttpResponse.json({ spec: surveySpec }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );
}

describe('useSurveyView', () => {
  it('loads survey spec items and exposes item count', async () => {
    const { result } = renderHook(
      () => useSurveyView({ url: awxAPI`/job_templates/1/survey_spec/` }),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.itemCount).toBe(1));
    expect(result.current.pageItems).toEqual(surveySpec);
  });

  it('updates a survey item in local state', async () => {
    const { result } = renderHook(
      () => useSurveyView({ url: awxAPI`/job_templates/1/survey_spec/` }),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.pageItems?.length).toBe(1));

    result.current.updateItem({
      ...surveySpec[0],
      question_name: 'Updated question',
    });

    await waitFor(() =>
      expect(result.current.pageItems?.[0]?.question_name).toBe('Updated question')
    );
  });
});
