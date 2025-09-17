/** AccessTokenRequest */
export interface AccessTokenRequest {
  /** Access Token */
  access_token: string;
}

/** AnalyticsResponse */
export interface AnalyticsResponse {
  /** Success */
  success: boolean;
  /** Analytics */
  analytics: Record<string, any> | null;
  /** Sample Size */
  sample_size: number;
  /** Analysis Date */
  analysis_date: string | null;
  /**
   * Data Completeness Score
   * @default 0
   */
  data_completeness_score?: number;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** SyncRequest */
export interface SyncRequest {
  /** Access Token */
  access_token: string;
  /**
   * Sample Size
   * @default 100
   */
  sample_size?: number;
}

/** SyncResponse */
export interface SyncResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Items Synced */
  items_synced?: number | null;
  /** Error */
  error?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** SyncStatusResponse */
export interface AppApisYoutubeSyncStatusResponse {
  /** Last Run */
  last_run?: string | null;
  /** Next Scheduled */
  next_scheduled?: string | null;
  /** Success */
  success?: boolean | null;
  /** Items Processed */
  items_processed?: number | null;
  /** Error */
  error?: string | null;
}

/** SyncStatusResponse */
export interface AppApisYtSyncSyncStatusResponse {
  /** Last Synced */
  last_synced: string | null;
  /** Total Videos */
  total_videos: number;
  /** Is Syncing */
  is_syncing: boolean;
  /**
   * Sample Size
   * @default 100
   */
  sample_size?: number;
  /**
   * Analytics Available
   * @default false
   */
  analytics_available?: boolean;
}

export type CheckHealthData = HealthResponse;

export type YoutubeGetSyncStatusData = AppApisYoutubeSyncStatusResponse;

export type YoutubeSyncWatchHistoryData = SyncResponse;

export type GetSyncStatusEndpointData = AppApisYoutubeSyncStatusResponse;

export type SyncWatchHistoryEndpointData = SyncResponse;

export type SyncWatchHistoryEndpointError = HTTPValidationError;

export type SyncLikedVideosData = any;

export type SyncLikedVideosError = HTTPValidationError;

export type GetSyncStatusData = AppApisYtSyncSyncStatusResponse;

export interface GetAnalyticsParams {
  /**
   * Sample Size
   * @default 100
   */
  sample_size?: number;
}

export type GetAnalyticsData = AnalyticsResponse;

export type GetAnalyticsError = HTTPValidationError;

export type GetUserSummaryData = any;
