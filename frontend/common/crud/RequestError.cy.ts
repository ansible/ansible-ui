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
    expect(error.statusCode).equal(404);
    expect(error.json).to.deep.equal({ error: 'Not found' });
    expect(error.body).to.deep.equal({ error: 'Not found' });
  });

  it('should create a RequestError for plain text responses', async () => {
    const response = new Response('Plain Error', {
      status: 500,
      statusText: 'Internal Error',
      headers: { 'Content-Type': 'text/plain' },
    });

    const error = await createRequestError(response);
    expect(error.statusCode).equal(500);
    expect(error.details).equal(undefined);
    expect(error.body).equal('Plain Error');
  });

  it('should attempt to parse plain text as JSON if possible', async () => {
    const responseBody = '{"error": "Parsed Error"}';
    const response = new Response(responseBody, {
      status: 500,
      statusText: 'Parsed Error Message',
      headers: { 'Content-Type': 'text/plain' },
    });

    const error = await createRequestError(response);
    expect(error.statusCode).equal(500);
    expect(error.json).to.deep.equal({ error: 'Parsed Error' });
    expect(error.body).to.deep.equal({ error: 'Parsed Error' });
  });
});
