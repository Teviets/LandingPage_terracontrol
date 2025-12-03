const DEFAULT_BASE_URL = 'https://oz544h1nwc.execute-api.us-east-2.amazonaws.com/deploy';
const DEFAULT_TIMEOUT = 15000;
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

const isObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData;
const isBlob = (value) => typeof Blob !== 'undefined' && value instanceof Blob;
const isURLSearchParams = (value) =>
  typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;

const sanitizeBaseUrl = (baseUrl) => {
  if (!baseUrl) {
    return DEFAULT_BASE_URL;
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const findHeaderKey = (headers, targetKey) => {
  const normalized = targetKey.toLowerCase();
  return Object.keys(headers).find((key) => key.toLowerCase() === normalized);
};

const cloneHeaders = (headers) => {
  if (!headers) return {};

  if (headers instanceof Headers) {
    return Array.from(headers.entries()).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  return { ...headers };
};

const mergeHeaders = (baseHeaders, overrideHeaders) => ({
  ...cloneHeaders(baseHeaders),
  ...cloneHeaders(overrideHeaders)
});

const appendQueryParams = (url, query) => {
  if (!query) {
    return url;
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    params.append(key, value);
  });

  const queryString = params.toString();
  if (!queryString) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
};

const buildUrl = (baseUrl, path) => {
  if (!path) {
    return baseUrl;
  }

  if (typeof path === 'string' && path.startsWith('http')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

const maybeRemoveContentType = (method, body, headers) => {
  if (body) return;
  const normalizedMethod = (method || 'GET').toUpperCase();
  if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') {
    const headerKey = findHeaderKey(headers, 'Content-Type');
    if (headerKey) {
      delete headers[headerKey];
    }
  }
};

const serializeBody = (body, headers) => {
  if (!body) {
    return undefined;
  }

  if (isFormData(body) || isBlob(body) || body instanceof ArrayBuffer || isURLSearchParams(body)) {
    const headerKey = findHeaderKey(headers, 'Content-Type');
    if (headerKey) {
      delete headers[headerKey];
    }
    return body;
  }

  const headerKey = findHeaderKey(headers, 'Content-Type');
  const headerValue = headerKey ? headers[headerKey] : undefined;

  if (isObject(body) && headerValue && headerValue.includes('application/json')) {
    return JSON.stringify(body);
  }

  return body;
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => '');
  return text;
};

const createAbortController = (timeout, externalSignal) => {
  const controller = new AbortController();

  if (externalSignal?.aborted) {
    controller.abort();
  }

  let timeoutId = null;
  if (typeof timeout === 'number' && timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeout);
  }

  let externalCleanup = () => {};
  if (externalSignal) {
    const abortFromExternal = () => controller.abort();
    externalSignal.addEventListener('abort', abortFromExternal);
    externalCleanup = () => externalSignal.removeEventListener('abort', abortFromExternal);
  }

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    externalCleanup();
  };

  return { signal: controller.signal, cleanup };
};

const resolveBaseUrl = () => {
  const env = import.meta.env || {};
  const base =
    env.VITE_TERRACONTROL_EXTERNAL_API ||
    env.VITE_EXTERNAL_API_BASE ||
    env.VITE_EXTERNAL_API_URL ||
    DEFAULT_BASE_URL;

  return sanitizeBaseUrl(base);
};

/**
 * Cliente para la API externa de datos (no afecta el backend existente).
 * Ejemplo:
 *   import { externalApiClient } from '../utils/externalApiClient';
 *   const lotes = await externalApiClient.get('/lotes');
 */
export const createExternalApiClient = ({
  baseUrl = resolveBaseUrl(),
  timeout = DEFAULT_TIMEOUT,
  defaultHeaders = DEFAULT_HEADERS,
  fetchImplementation = (typeof fetch === 'function' ? fetch.bind(globalThis) : null)
} = {}) => {
  if (!fetchImplementation) {
    throw new Error('A fetch implementation is required to create the external API client.');
  }

  const state = {
    baseUrl: sanitizeBaseUrl(baseUrl),
    timeout,
    headers: mergeHeaders(DEFAULT_HEADERS, defaultHeaders)
  };

  const setHeader = (key, value) => {
    if (!key) return;
    state.headers[key] = value;
  };

  const removeHeader = (key) => {
    const headerKey = findHeaderKey(state.headers, key);
    if (headerKey) {
      delete state.headers[headerKey];
    }
  };

  const request = async (path, options = {}) => {
    const {
      method = 'GET',
      headers,
      body,
      query,
      timeout: requestTimeout,
      signal,
      rawResponse = false
    } = options;

    const urlWithPath = buildUrl(state.baseUrl, path);
    const finalUrl = appendQueryParams(urlWithPath, query);
    const mergedHeaders = mergeHeaders(state.headers, headers);
    maybeRemoveContentType(method, body, mergedHeaders);
    const payload = serializeBody(body, mergedHeaders);

    const effectiveTimeout =
      typeof requestTimeout === 'number' && requestTimeout > 0
        ? requestTimeout
        : state.timeout;

    const { signal: finalSignal, cleanup } = createAbortController(effectiveTimeout, signal);

    try {
      const response = await fetchImplementation(finalUrl, {
        method,
        headers: mergedHeaders,
        body: payload,
        signal: finalSignal
      });

      const payloadResponse = await parseResponseBody(response);

      if (!response.ok) {
        const error = new Error(
          (payloadResponse && payloadResponse.message) || 'La solicitud a la API externa falló.'
        );
        error.status = response.status;
        error.details = payloadResponse;
        throw error;
      }

      return rawResponse ? { data: payloadResponse, response } : payloadResponse;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud fue cancelada o excedió el tiempo de espera.');
      }
      throw error;
    } finally {
      cleanup();
    }
  };

  return {
    request,
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
    setHeader,
    removeHeader,
    setToken: (token) => {
      if (!token) {
        removeHeader('Authorization');
        return;
      }
      setHeader('Authorization', `Bearer ${token}`);
    }
  };
};

export const externalApiClient = createExternalApiClient();
