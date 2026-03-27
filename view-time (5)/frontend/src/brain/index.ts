import { auth } from "app/auth";
import { API_HOST, API_PATH, API_PREFIX_PATH, API_URL } from "../constants";
import { Brain } from "./Brain";
import type { RequestParams } from "./http-client";
import { resolveBrainBaseUrl, usesCustomApiPath } from "./baseUrl";

const hasCustomApiPath = usesCustomApiPath(API_PREFIX_PATH, API_PATH);

type BaseApiParams = Omit<RequestParams, "signal" | "baseUrl" | "cancelToken">;

const constructBaseApiParams = (): BaseApiParams => {
  return {
    credentials: "include",
    secure: true,
  };
};

const constructClient = () => {
  const baseUrl = resolveBrainBaseUrl({
    apiHost: API_HOST,
    apiPath: API_PATH,
    apiPrefixPath: API_PREFIX_PATH,
    apiUrl: API_URL,
    origin: window.location.origin,
    hostname: window.location.hostname,
  });
  const baseApiParams = constructBaseApiParams();

  return new Brain({
    baseUrl,
    baseApiParams,
    customFetch: (url, options) => {
      if (hasCustomApiPath) {
        // Remove /routes/ segment from path if the api is deployed and made accessible through
        // another domain with custom path different from the databutton proxy path
        return fetch(url.replace(API_PREFIX_PATH + "/routes", API_PREFIX_PATH), options);
      }

      return fetch(url, options);
    },
    securityWorker: async () => {
      return {
        headers: {
          Authorization: await auth.getAuthHeaderValue(),
        },
      };
    },
  });
};

const brain = constructClient();

export default brain;
