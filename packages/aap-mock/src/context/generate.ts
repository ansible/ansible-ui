/* eslint-disable no-empty */
/* eslint-disable no-console */
import { writeFileSync } from 'fs';
import setValue from 'set-value';
import { dotPath } from '../utils/dot-path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const server = process.env.PLATFORM_SERVER;

async function generate() {
  // export TOKEN=$(curl -ks -X POST "$PLATFORM_SERVER/api/gateway/v1/tokens/" \
  //   --user "$PLATFORM_USERNAME:$PLATFORM_PASSWORD" \
  //   | jq -r '.token')

  const token = await getToken();
  const data: Record<string, unknown> = {};
  await generateFromAPI('/api/gateway/v1/', data, token);
  await generateFromAPI('/api/controller/v2/', data, token);
  await generateFromAPI('/api/eda/v1/', data, token);

  setValue(data, 'data.api.gateway.v1.activitystream', []);
  setValue(data, 'data.api.gateway.v1.me', []);
  setValue(data, 'data.api.gateway.v1.tokens', {});
  // todo iterate over settings
  setValue(data, 'data.api.gateway.v1.settings', {});

  // Controller Overrides
  setValue(
    data,
    'data.' + dotPath('/api/gateway/v1/legacy_auth/'),
    await get<Record<string, string>>(server + '/api/gateway/v1/legacy_auth/', '')
  );
  setValue(data, 'data.api.controller.v2.me', []);
  // todo iterate over settings
  setValue(data, 'data.api.controller.v2.settings', {});

  // Gateway Overrides
  setValue(
    data,
    'data.' + dotPath('/api/galaxy/_ui/v1/settings/'),
    await get<Record<string, string>>(server + '/api/galaxy/_ui/v1/settings/', token)
  );

  writeFileSync('./src/context/context.json', JSON.stringify(data, null, 2));
}

async function getToken() {
  const token = await fetch(server + '/api/gateway/v1/tokens/', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        process.env.PLATFORM_USERNAME + ':' + process.env.PLATFORM_PASSWORD
      ).toString('base64')}`,
    },
  })
    .then((response) => response.json())
    .then((response) => (response as { token: string }).token);
  return token;
}

async function generateFromAPI(path: string, data: Record<string, unknown>, token: string) {
  const api = await get<Record<string, string>>(server + path, token);
  for (let [, value] of Object.entries(api)) {
    if (value.startsWith('http')) {
      value = '/' + value.split('/').slice(3).join('/');
    }
    console.log(value);

    // Data
    try {
      const response = await get<Record<string, string>>(server + value, token);
      if ('results' in response && Array.isArray(response.results)) {
        const results = response.results.map((result: Record<string, string>) => {
          if ('related' in result) {
            delete result.related;
          }
          if ('summary_fields' in result) {
            delete result.summary_fields;
          }
          return result;
        });
        setValue(data, 'data.' + dotPath(value), results);
      } else {
        setValue(data, 'data.' + dotPath(value), response);
      }
    } catch {}

    // Options
    try {
      const response = await options<Record<string, string>>(server + value, token);
      setValue(data, 'options.' + dotPath(value), response);
    } catch {}
  }
}

async function get<T>(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json() as T;
}

async function options<T>(url: string, token: string) {
  const response = await fetch(url, {
    method: 'OPTIONS',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json() as T;
}

void generate();
