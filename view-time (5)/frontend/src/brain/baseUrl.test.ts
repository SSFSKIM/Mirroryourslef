import assert from "node:assert/strict";
import test from "node:test";

import { resolveBrainBaseUrl } from "./baseUrl";

test("uses the local backend when the app runs on localhost preview", () => {
  const baseUrl = resolveBrainBaseUrl({
    apiHost: "",
    apiPath: "",
    apiPrefixPath: "/routes",
    apiUrl: "http://localhost:8000",
    origin: "http://localhost:4173",
    hostname: "localhost",
  });

  assert.equal(baseUrl, "http://localhost:8000/routes");
});

test("keeps same-origin routes for non-local deployments", () => {
  const baseUrl = resolveBrainBaseUrl({
    apiHost: "",
    apiPath: "",
    apiPrefixPath: "/routes",
    apiUrl: "http://localhost:8000",
    origin: "https://mirroryourself.app",
    hostname: "mirroryourself.app",
  });

  assert.equal(baseUrl, "https://mirroryourself.app/routes");
});
