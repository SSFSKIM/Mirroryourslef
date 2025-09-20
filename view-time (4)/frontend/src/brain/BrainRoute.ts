import {
  AccessTokenRequest,
  BodyUploadWatchHistoryTakeout,
  CheckHealthData,
  DeleteWatchHistoryData,
  GetAnalyticsData,
  GetSyncStatusData,
  GetSyncStatusEndpointData,
  GetUserSummaryData,
  GetWatchHistoryAnalyticsData,
  GetWatchHistoryStatusData,
  SyncLikedVideosData,
  SyncRequest,
  SyncWatchHistoryEndpointData,
  UploadWatchHistoryTakeoutData,
  YoutubeGetSyncStatusData,
  YoutubeSyncWatchHistoryData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Get the status of the YouTube watch history sync process
   * @tags dbtn/module:youtube, dbtn/hasAuth
   * @name youtube_get_sync_status
   * @summary Youtube Get Sync Status
   * @request GET:/routes/youtube/sync-status
   */
  export namespace youtube_get_sync_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = YoutubeGetSyncStatusData;
  }

  /**
   * @description Synchronize the user's YouTube watch history (simulation)
   * @tags dbtn/module:youtube, dbtn/hasAuth
   * @name youtube_sync_watch_history
   * @summary Youtube Sync Watch History
   * @request POST:/routes/youtube/sync-watch-history
   */
  export namespace youtube_sync_watch_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = YoutubeSyncWatchHistoryData;
  }

  /**
   * @description Get the status of the YouTube watch history sync process
   * @tags dbtn/module:youtube_sync, dbtn/hasAuth
   * @name get_sync_status_endpoint
   * @summary Get Sync Status Endpoint
   * @request GET:/routes/youtube-sync/status
   */
  export namespace get_sync_status_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSyncStatusEndpointData;
  }

  /**
   * @description Synchronize the user's YouTube watch history using token
   * @tags dbtn/module:youtube_sync, dbtn/hasAuth
   * @name sync_watch_history_endpoint
   * @summary Sync Watch History Endpoint
   * @request POST:/routes/youtube-sync/watch-history
   */
  export namespace sync_watch_history_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccessTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SyncWatchHistoryEndpointData;
  }

  /**
   * @description Sync a user's YouTube liked videos using their OAuth access token
   * @tags dbtn/module:yt_sync, dbtn/hasAuth
   * @name sync_liked_videos
   * @summary Sync Liked Videos
   * @request POST:/routes/yt-sync/sync-liked-videos
   */
  export namespace sync_liked_videos {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SyncRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SyncLikedVideosData;
  }

  /**
   * @description Get the current sync status for a user's liked videos
   * @tags dbtn/module:yt_sync, dbtn/hasAuth
   * @name get_sync_status
   * @summary Get Sync Status
   * @request GET:/routes/yt-sync/sync-status
   */
  export namespace get_sync_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSyncStatusData;
  }

  /**
   * @description Get analytics for user's liked videos
   * @tags dbtn/module:yt_sync, dbtn/hasAuth
   * @name get_analytics
   * @summary Get Analytics
   * @request GET:/routes/yt-sync/analytics
   */
  export namespace get_analytics {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Sample Size
       * @default 100
       */
      sample_size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAnalyticsData;
  }

  /**
   * @description Get comprehensive user summary for liked videos
   * @tags dbtn/module:yt_sync, dbtn/hasAuth
   * @name get_user_summary
   * @summary Get User Summary
   * @request GET:/routes/yt-sync/summary
   */
  export namespace get_user_summary {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserSummaryData;
  }

  /**
   * @description Retrieve current ingest status for uploaded watch history.
   * @tags dbtn/module:watch_history, dbtn/hasAuth
   * @name get_watch_history_status
   * @summary Get Watch History Status
   * @request GET:/routes/status
   */
  export namespace get_watch_history_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetWatchHistoryStatusData;
  }

  /**
   * @description Retrieve stored watch history analytics.
   * @tags dbtn/module:watch_history, dbtn/hasAuth
   * @name get_watch_history_analytics
   * @summary Get Watch History Analytics
   * @request GET:/routes/analytics
   */
  export namespace get_watch_history_analytics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetWatchHistoryAnalyticsData;
  }

  /**
   * @description Upload a Google Takeout file to ingest watch history.
   * @tags dbtn/module:watch_history, dbtn/hasAuth
   * @name upload_watch_history_takeout
   * @summary Upload Watch History Takeout
   * @request POST:/routes/upload-takeout
   */
  export namespace upload_watch_history_takeout {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadWatchHistoryTakeout;
    export type RequestHeaders = {};
    export type ResponseBody = UploadWatchHistoryTakeoutData;
  }

  /**
   * @description Delete stored watch history events and analytics.
   * @tags dbtn/module:watch_history, dbtn/hasAuth
   * @name delete_watch_history
   * @summary Delete Watch History
   * @request DELETE:/routes/data
   */
  export namespace delete_watch_history {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteWatchHistoryData;
  }
}
