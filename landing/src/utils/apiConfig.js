const stripTrailingSlash = (value) => (value.endsWith('/') ? value.slice(0, -1) : value);

const getEnvBase = () =>
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API ||
  '';

const normalizeAbsoluteBase = (raw) => {
  try {
    const url = new URL(raw);

    if (typeof window !== 'undefined') {
      const shouldSwapHost =
        url.hostname &&
        url.hostname !== 'localhost' &&
        !url.hostname.includes('.') &&
        url.hostname !== window.location.hostname;

      if (shouldSwapHost) {
        const fallbackHost = window.location.hostname || 'localhost';
        return stripTrailingSlash(
          `${url.protocol}//${fallbackHost}${url.port ? `:${url.port}` : ''}${url.pathname}`
        );
      }
    }

    return stripTrailingSlash(`${url.origin}${url.pathname}`);
  } catch {
    return stripTrailingSlash(raw);
  }
};

const resolveApiBase = () => {
  const envBase = getEnvBase();

  if (!envBase) {
    return '/api';
  }

  if (envBase.startsWith('http')) {
    return normalizeAbsoluteBase(envBase);
  }

  return stripTrailingSlash(envBase);
};

export const getApiEndpoint = (path) => {
  const base = resolveApiBase();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
