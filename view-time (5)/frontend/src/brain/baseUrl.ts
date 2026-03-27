type ResolveBrainBaseUrlParams = {
  apiHost: string;
  apiPath: string;
  apiPrefixPath: string;
  apiUrl: string;
  origin: string;
  hostname: string;
};

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const joinUrl = (base: string, path: string): string => {
  const normalizedBase = trimTrailingSlash(base);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export const usesCustomApiPath = (apiPrefixPath: string, apiPath: string): boolean =>
  apiPrefixPath !== apiPath;

export const isLocalFrontendHost = (hostname: string): boolean =>
  LOCAL_HOSTNAMES.has(hostname);

export const resolveBrainBaseUrl = ({
  apiHost,
  apiPath,
  apiPrefixPath,
  apiUrl,
  origin,
  hostname,
}: ResolveBrainBaseUrlParams): string => {
  if (isLocalFrontendHost(hostname) && apiUrl) {
    return joinUrl(apiUrl, apiPrefixPath);
  }

  if (usesCustomApiPath(apiPrefixPath, apiPath)) {
    const domain = origin || (apiHost ? `https://${apiHost}` : "");
    return joinUrl(domain, apiPrefixPath);
  }

  if (apiHost) {
    return joinUrl(`https://${apiHost}`, apiPath);
  }

  return joinUrl(origin, apiPath);
};
