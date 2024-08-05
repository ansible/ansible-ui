const AWX_PROTOCOL = process.env.AWX_PROTOCOL || 'http';
const AWX_HOST = process.env.AWX_HOST || 'localhost:8043';
const AWX_SERVER =
  process.env.AWX_SERVER || process.env.CYPRESS_AWX_SERVER || `${AWX_PROTOCOL}://${AWX_HOST}`;
const AWX_USERNAME = process.env.AWX_USERNAME || process.env.CYPRESS_AWX_USERNAME || 'admin';
const AWX_PASSWORD = process.env.AWX_PASSWORD || process.env.CYPRESS_AWX_PASSWORD || 'password';
const AWX_API_PREFIX = process.env.AWX_API_PREFIX || '/api/v2';
const AWX_WEBSOCKET_PREFIX = process.env.AWX_WEBSOCKET_PREFIX || '/websocket/';

const EDA_PROTOCOL = process.env.EDA_PROTOCOL || 'http';
const EDA_HOST = process.env.EDA_HOST || 'localhost:8000';
const EDA_SERVER =
  process.env.EDA_SERVER || process.env.CYPRESS_EDA_SERVER || `${EDA_PROTOCOL}://${EDA_HOST}`;
const EDA_SERVER_UUID = process.env.EDA_SERVER_UUID || process.env.CYPRESS_EDA_SERVER_UUID || ``;
const EDA_WEBHOOK_SERVER =
  process.env.EDA_WEBHOOK_SERVER || process.env.CYPRESS_EDA_WEBHOOK_SERVER || ``;
const EDA_USERNAME = process.env.EDA_USERNAME || process.env.CYPRESS_EDA_USERNAME || 'admin';
const EDA_PASSWORD = process.env.EDA_PASSWORD || process.env.CYPRESS_EDA_PASSWORD || 'testpass';
const EDA_API_PREFIX = process.env.EDA_API_PREFIX || '/api/eda/v1';

const HUB_PROTOCOL = process.env.HUB_PROTOCOL || 'http';
const HUB_HOST = process.env.HUB_HOST || 'localhost:5001';
const HUB_SERVER =
  process.env.HUB_SERVER || process.env.CYPRESS_HUB_SERVER || `${HUB_PROTOCOL}://${HUB_HOST}`;
const HUB_USERNAME = process.env.HUB_USERNAME || process.env.CYPRESS_HUB_USERNAME || 'admin';
const HUB_PASSWORD = process.env.HUB_PASSWORD || process.env.CYPRESS_HUB_PASSWORD || 'password';
const HUB_API_PREFIX =
  process.env.HUB_API_PREFIX || process.env.HUB_API_BASE_PATH || '/api/galaxy';

const ROUTE_PREFIX = process.env.ROUTE_PREFIX || '/';

module.exports = {
  AWX_API_PREFIX,
  AWX_WEBSOCKET_PREFIX,
  AWX_PASSWORD,
  AWX_SERVER,
  AWX_USERNAME,
  EDA_API_PREFIX,
  EDA_PASSWORD,
  EDA_SERVER,
  EDA_SERVER_UUID,
  EDA_WEBHOOK_SERVER,
  EDA_USERNAME,
  HUB_API_PREFIX,
  HUB_PASSWORD,
  HUB_SERVER,
  HUB_USERNAME,
  ROUTE_PREFIX,
};
