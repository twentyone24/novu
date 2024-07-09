import { FeatureFlagsKeysEnum, getContextPath, NovuComponentEnum } from '@novu/shared';

function isBrowser() {
  return typeof window !== 'undefined';
}

declare global {
  interface Window {
    _env_: any;
  }
}

const isPlaywright = isBrowser() && (window as any).isPlaywright;

export const API_ROOT =
  window._env_.VITE_API_URL || isPlaywright
    ? window._env_.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:1336'
    : window._env_.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:3000';

export const WS_URL = isPlaywright
  ? window._env_.VITE_WS_URL || process.env.VITE_WS_URL || 'http://localhost:1340'
  : window._env_.VITE_WS_URL || process.env.VITE_WS_URL || 'http://localhost:3002';

export const SENTRY_DSN = window._env_.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN;

export const ENV = window._env_.VITE_ENVIRONMENT || process.env.VITE_ENVIRONMENT;

const blueprintApiUrlByEnv = ENV === 'production' || ENV === 'prod' ? 'https://api.novu.co' : 'https://dev.api.novu.co';

export const BLUEPRINTS_API_URL =
  window._env_.VITE_BLUEPRINTS_API_URL || isPlaywright
    ? window._env_.VITE_BLUEPRINTS_API_URL || process.env.VITE_BLUEPRINTS_API_URL || 'http://localhost:1336'
    : blueprintApiUrlByEnv;

export const APP_ID = window._env_.VITE_NOVU_APP_ID || process.env.VITE_NOVU_APP_ID;

export const WIDGET_EMBED_PATH =
  window._env_.VITE_WIDGET_EMBED_PATH || process.env.VITE_WIDGET_EMBED_PATH || 'http://localhost:4701/embed.umd.min.js';

export const IS_DOCKER_HOSTED =
  window._env_.VITE_DOCKER_HOSTED_ENV === 'true' || process.env.VITE_DOCKER_HOSTED_ENV === 'true';

export const VITE_VERSION = process.env.NOVU_VERSION;

export const INTERCOM_APP_ID = window._env_.VITE_INTERCOM_APP_ID || process.env.VITE_INTERCOM_APP_ID;

export const CONTEXT_PATH = getContextPath(NovuComponentEnum.WEB);

export const WEBHOOK_URL = isPlaywright
  ? window._env_.VITE_WEBHOOK_URL || process.env.VITE_WEBHOOK_URL || 'http://localhost:1341'
  : window._env_.VITE_WEBHOOK_URL || process.env.VITE_WEBHOOK_URL || 'http://localhost:3003';

export const MAIL_SERVER_DOMAIN =
  window._env_.VITE_MAIL_SERVER_DOMAIN || process.env.VITE_MAIL_SERVER_DOMAIN || 'dev.inbound-mail.novu.co';

export const LAUNCH_DARKLY_CLIENT_SIDE_ID =
  window._env_.VITE_LAUNCH_DARKLY_CLIENT_SIDE_ID || process.env.VITE_LAUNCH_DARKLY_CLIENT_SIDE_ID;

export const FEATURE_FLAGS = Object.values(FeatureFlagsKeysEnum).reduce((acc, key) => {
  const defaultValue = 'false';
  acc[key] = window._env_[key] || process.env[key] || defaultValue;

  return acc;
}, {} as Record<FeatureFlagsKeysEnum, string | undefined>);

export const HUBSPOT_PORTAL_ID = window._env_.VITE_HUBSPOT_EMBED || process.env.VITE_HUBSPOT_EMBED;

export const IS_EU_ENV = (ENV === 'production' || ENV === 'prod') && API_ROOT.includes('eu.api.novu.co');
