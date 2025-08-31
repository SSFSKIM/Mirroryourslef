import {
  AccessTokenRequest,
  CheckHealthData,
  GetSyncStatusData,
  GetSyncStatusEndpointData,
  SyncRequest,
  SyncWatchHistoryData,
  SyncWatchHistoryEndpointData,
  SyncWatchHistoryEndpointError,
  SyncWatchHistoryError,
  YoutubeGetSyncStatusData,
  YoutubeSyncWatchHistoryData,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get the status of the YouTube watch history sync process
   *
   * @tags dbtn/module:youtube, dbtn/hasAuth
   * @name youtube_get_sync_status
   * @summary Youtube Get Sync Status
   * @request GET:/routes/youtube/sync-status
   */
  youtube_get_sync_status = (params: RequestParams = {}) =>
    this.request<YoutubeGetSyncStatusData, any>({
      path: `/routes/youtube/sync-status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Synchronize the user's YouTube watch history (simulation)
   *
   * @tags dbtn/module:youtube, dbtn/hasAuth
   * @name youtube_sync_watch_history
   * @summary Youtube Sync Watch History
   * @request POST:/routes/youtube/sync-watch-history
   */
  youtube_sync_watch_history = (params: RequestParams = {}) =>
    this.request<YoutubeSyncWatchHistoryData, any>({
      path: `/routes/youtube/sync-watch-history`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get the status of the YouTube watch history sync process
   *
   * @tags dbtn/module:youtube_sync, dbtn/hasAuth
   * @name get_sync_status_endpoint
   * @summary Get Sync Status Endpoint
   * @request GET:/routes/youtube-sync/status
   */
  get_sync_status_endpoint = (params: RequestParams = {}) =>
    this.request<GetSyncStatusEndpointData, any>({
      path: `/routes/youtube-sync/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Synchronize the user's YouTube watch history using token
   *
   * @tags dbtn/module:youtube_sync, dbtn/hasAuth
   * @name sync_watch_history_endpoint
   * @summary Sync Watch History Endpoint
   * @request POST:/routes/youtube-sync/watch-history
   */
  sync_watch_history_endpoint = (data: AccessTokenRequest, params: RequestParams = {}) =>
    this.request<SyncWatchHistoryEndpointData, SyncWatchHistoryEndpointError>({
      path: `/routes/youtube-sync/watch-history`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Sync a user's YouTube watch history using their OAuth access token
   *
   * @tags dbtn/module:yt_sync, dbtn/hasAuth
   * @name sync_watch_history
   * @summary Sync Watch History
   * @request POST:/routes/yt-sync/sync-watch-history
   */
  sync_watch_history = (data: SyncRequest, params: RequestParams = {}) =>
    this.request<SyncWatchHistoryData, SyncWatchHistoryError>({
      path: `/routes/yt-sync/sync-watch-history`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the current sync status for a user
   *
   * @tags dbtn/module:yt_sync, dbtn/hasAuth
   * @name get_sync_status
   * @summary Get Sync Status
   * @request GET:/routes/yt-sync/sync-status
   */
  get_sync_status = (params: RequestParams = {}) =>
    this.request<GetSyncStatusData, any>({
      path: `/routes/yt-sync/sync-status`,
      method: "GET",
      ...params,
    });
}
