/** AccessTokenRequest */
export interface AccessTokenRequest {
  /** Access Token */
  access_token: string;
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
}

export type CheckHealthData = HealthResponse;

export type YoutubeGetSyncStatusData = AppApisYoutubeSyncStatusResponse;

export type YoutubeSyncWatchHistoryData = SyncResponse;

export type GetSyncStatusEndpointData = AppApisYoutubeSyncStatusResponse;

export type SyncWatchHistoryEndpointData = SyncResponse;

export type SyncWatchHistoryEndpointError = HTTPValidationError;

export type SyncWatchHistoryData = any;

export type SyncWatchHistoryError = HTTPValidationError;

export type GetSyncStatusData = AppApisYtSyncSyncStatusResponse;
