import axios from 'axios';
import { CustomDataType, WorkflowPreferences } from '@novu/shared';
import { API_ROOT } from '../config';
import { getToken } from '../components/providers/AuthProvider';
import { getEnvironmentId } from '../components/providers/EnvironmentProvider';

interface IOptions {
  absoluteUrl: boolean;
}

// @deprecated Migrate all api methods to the new buildApiHttpClient that allows runtime configuration on the client object.
export const api = {
  get(url: string, options: IOptions = { absoluteUrl: false }) {
    return axios
      .get(buildUrl(url, options.absoluteUrl), {
        headers: getHeaders(),
      })
      .then((response) => {
        return response.data?.data;
      })
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
  getFullResponse(url: string, params?: { [key: string]: string | string[] | number }) {
    return axios
      .get(`${API_ROOT}${url}`, {
        params,
        headers: getHeaders(),
      })
      .then((response) => response.data)
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
  put(url: string, payload) {
    return axios
      .put(`${API_ROOT}${url}`, payload, {
        headers: getHeaders(),
      })
      .then((response) => response.data?.data)
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
  post(url: string, payload, params?: CustomDataType) {
    return axios
      .post(`${API_ROOT}${url}`, payload, { params, headers: getHeaders() })
      .then((response) => response.data?.data)
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
  patch(url: string, payload) {
    return axios
      .patch(`${API_ROOT}${url}`, payload, {
        headers: getHeaders(),
      })
      .then((response) => response.data?.data)
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
  delete(url: string, payload = {}) {
    return axios
      .delete(`${API_ROOT}${url}`, {
        ...payload,
        headers: getHeaders(),
      })
      .then((response) => response.data?.data)
      .catch((error) => {
        return Promise.reject(error?.response?.data || error?.response || error);
      });
  },
};

function buildUrl(url: string, absoluteUrl: boolean) {
  return absoluteUrl ? url : `${API_ROOT}${url}`;
}

function getHeaders() {
  // TODO: change the way we get the clerk token
  const token = getToken();
  const lastEnvironmentId = getEnvironmentId();

  return token
    ? {
        Authorization: `Bearer ${token}`,
        'Novu-Environment-Id': lastEnvironmentId || '',
      }
    : {};
}

// WIP: The static API client needs to be replaced by a dynamic API client where api keys are injected.
export function buildApiHttpClient({
  baseURL = API_ROOT || 'https://api.novu.co',
  secretKey,
  jwt,
  environmentId,
}: {
  baseURL?: string;
  secretKey?: string;
  jwt?: string;
  environmentId?: string;
}) {
  if (!secretKey && !jwt) {
    throw new Error('A secretKey or jwt is required to create a Novu API client.');
  }

  const authHeader = jwt ? `Bearer ${jwt}` : `ApiKey ${secretKey}`;

  const httpClient = axios.create({
    baseURL,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      'Novu-Environment-Id': environmentId,
    },
  });

  const get = async (url, params?: Record<string, string | string[] | number>) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await httpClient.get(url, { params });

      return response.data;
    } catch (error) {
      // TODO: Handle error?.response?.data || error?.response || error;
      throw error;
    }
  };

  const post = async (url, data = {}) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await httpClient.post(url, data);

      return response.data;
    } catch (error) {
      // TODO: Handle error?.response?.data || error?.response || error;
      throw error;
    }
  };

  const del = async (url, data = {}) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await httpClient.delete(url, data);

      return response.data;
    } catch (error) {
      // TODO: Handle error?.response?.data || error?.response || error;
      throw error;
    }
  };

  return {
    async getNotifications(params?: { page?: number; transactionId?: string }) {
      return get(`/v1/notifications`, params);
    },

    async getNotification(notificationId: string) {
      return get(`/v1/notifications/${notificationId}`);
    },

    async getApiKeys() {
      return get(`/v1/environments/api-keys`);
    },

    async syncBridge(bridgeUrl: string) {
      return post(`/v1/bridge/sync?source=studio`, {
        bridgeUrl,
      });
    },

    async getPreferences(workflowId: string) {
      return get(`/v1/preferences?workflowId=${workflowId}`);
    },

    async upsertPreferences(workflowId: string, preferences: WorkflowPreferences) {
      return post('/v1/preferences', { workflowId, preferences });
    },

    async deletePreferences(workflowId: string) {
      return del(`/v1/preferences?workflowId=${workflowId}`);
    },

    async postTelemetry(event: string, data?: Record<string, unknown>) {
      return post('/v1/telemetry/measure', {
        event,
        data,
      });
    },
  };
}
