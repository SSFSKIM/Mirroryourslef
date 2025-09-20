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

/** Body_upload_watch_history_takeout */
export interface BodyUploadWatchHistoryTakeout {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** DeleteResponse */
export interface DeleteResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
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

/** UploadResponse */
export interface UploadResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Events Processed */
  events_processed: number;
  /** Analytics Generated */
  analytics_generated: boolean;
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

/** WatchHistoryAnalyticsResponse */
export interface WatchHistoryAnalyticsResponse {
  /** User Id */
  user_id: string;
  /** Generated At */
  generated_at: string;
  /** Total Events */
  total_events: number;
  /** Unique Videos */
  unique_videos: number;
  /** Unique Channels */
  unique_channels: number;
  /** Average Session Duration Minutes */
  average_session_duration_minutes: number;
  /** Average Videos Per Session */
  average_videos_per_session: number;
  /** Average Shorts Streak Minutes */
  average_shorts_streak_minutes: number;
  /** Algorithmic View Share */
  algorithmic_view_share: number;
  /** Intentional View Share */
  intentional_view_share: number;
  /** Recommendation Breakdown */
  recommendation_breakdown: Record<string, number>;
  /** Repeat Views */
  repeat_views: any[];
  /** Heatmap */
  heatmap: Record<string, Record<string, number>>;
  /** Daily Distribution */
  daily_distribution: Record<string, number>;
  /** Shorts Share */
  shorts_share: number;
  /** Daily Average Minutes */
  daily_average_minutes: number;
  /** Weekly Minutes */
  weekly_minutes: number;
}

/** WatchHistoryStatusResponse */
export interface WatchHistoryStatusResponse {
  /** Last Uploaded At */
  last_uploaded_at: string | null;
  /** Total Events */
  total_events: number;
  /** Processing State */
  processing_state: string;
  /** Updated At */
  updated_at: string | null;
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

export type GetWatchHistoryStatusData = WatchHistoryStatusResponse;

export type GetWatchHistoryAnalyticsData = WatchHistoryAnalyticsResponse;

export type UploadWatchHistoryTakeoutData = UploadResponse;

export type UploadWatchHistoryTakeoutError = HTTPValidationError;

export type DeleteWatchHistoryData = DeleteResponse;
