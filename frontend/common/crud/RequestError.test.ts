import { describe, expect, it } from 'vitest';
import { createRequestError } from './RequestError';

describe('createRequestError', () => {
  it('should create a RequestError for JSON responses', async () => {
    const responseBody = JSON.stringify({ error: 'Not found' });
    const response = new Response(responseBody, {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' },
    });

    const error = await createRequestError(response);
    expect(error.statusCode).toBe(404);
    expect(error.json).toEqual({ error: 'Not found' });
    expect(error.body).toEqual({ error: 'Not found' });
  });

  it('should create a RequestError for plain text responses', async () => {
    const response = new Response('Plain Error', {
      status: 500,
      statusText: 'Internal Error',
      headers: { 'Content-Type': 'text/plain' },
    });

    const error = await createRequestError(response);
    expect(error.statusCode).toBe(500);
    expect(error.details).toBe(undefined);
    expect(error.body).toBe('Plain Error');
  });

  it('should attempt to parse plain text as JSON if possible', async () => {
    const responseBody = '{"error": "Parsed Error"}';
    const response = new Response(responseBody, {
      status: 500,
      statusText: 'Parsed Error Message',
      headers: { 'Content-Type': 'text/plain' },
    });

    const error = await createRequestError(response);
    expect(error.statusCode).toBe(500);
    expect(error.json).toEqual({ error: 'Parsed Error' });
    expect(error.body).toEqual({ error: 'Parsed Error' });
  });

  it('should use statusText when available', async () => {
    const response = new Response('', {
      status: 403,
      statusText: 'Forbidden',
      headers: { 'Content-Type': 'text/plain' },
    });

    const error = await createRequestError(response);
    expect(error.message).toBe('Forbidden');
    expect(error.statusCode).toBe(403);
  });

  it('should fall back to HTTP_STATUS_TEXT when statusText is empty (HTTP/2)', async () => {
    const response = new Response('', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });

    const error = await createRequestError(response);
    expect(error.message).toBe('Not Found');
    expect(error.statusCode).toBe(404);
  });

  it.each([
    [400, 'Bad Request'],
    [401, 'Unauthorized'],
    [403, 'Forbidden'],
    [404, 'Not Found'],
    [405, 'Method Not Allowed'],
    [408, 'Request Timeout'],
    [409, 'Conflict'],
    [429, 'Too Many Requests'],
    [500, 'Internal Server Error'],
    [502, 'Bad Gateway'],
    [503, 'Service Unavailable'],
    [504, 'Gateway Timeout'],
  ])(
    'should map status %i to "%s" when statusText is empty',
    async (status: number, expectedText: string) => {
      const response = new Response(null, { status });

      const error = await createRequestError(response);
      expect(error.message).toBe(expectedText);
    }
  );

  it('should fall back to "Error <code>" for unmapped status codes with empty statusText', async () => {
    const response = new Response(null, { status: 418 });

    const error = await createRequestError(response);
    expect(error.message).toBe('Error 418');
    expect(error.statusCode).toBe(418);
  });
});
