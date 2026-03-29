import React, { useRef, useState } from "react";
import { Upload, Trash2, CheckCircle2, AlertCircle, Loader2, FileText, Download, ExternalLink } from "lucide-react";
import { EditorialPanel } from "components/EditorialPanel";
import { Button } from "components/Button";
import { Progress } from "@/components/ui/progress";
import useWatchHistoryStore from "utils/watchHistoryStore";

interface WatchHistoryUploadCardProps {
  className?: string;
}

const WatchHistoryUploadCard: React.FC<WatchHistoryUploadCardProps> = ({ className = "" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);

  const {
    status,
    isUploading,
    isLoadingStatus,
    error,
    uploadMessage,
    uploadTakeout,
    deleteHistory,
  } = useWatchHistoryStore();

  const validateFile = (file: File): string | null => {
    // Check file extension
    const validExtensions = ['.json', '.zip'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return "Please upload a .json or .zip file from Google Takeout";
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size too large. Maximum 500MB allowed.";
    }

    // Check minimum size (at least 1KB)
    if (file.size < 1024) {
      return "File seems too small. Please ensure it's a valid Takeout file.";
    }

    return null;
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    setFileValidationError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setFileValidationError(validationError);
      return;
    }

    await uploadTakeout(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete all watch history data? This cannot be undone.")) {
      await deleteHistory();
    }
  };

  const hasData = status && status.total_events && status.total_events > 0;

  return (
    <EditorialPanel tone="primary" className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <div className="section-eyebrow">
          <span className="flex items-center gap-2">
            <FileText aria-hidden="true" className="h-3.5 w-3.5" />
            Archive Intake
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
          Import Your Archive
        </h3>
        <p className="text-sm leading-6 text-muted-foreground max-w-xl">
          Upload your YouTube Takeout data to unlock a personalized behavior report with viewing analytics and insights.
        </p>
      </div>

      <div className="divider-rule" />

      {/* Status Display */}
      {isLoadingStatus ? (
        <div className="loading-state flex items-center gap-2 text-muted-foreground">
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading status...</span>
        </div>
      ) : hasData ? (
        <div className="rounded-lg border border-primary/20 bg-fog px-4 py-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-data text-lg font-semibold text-foreground">
                {status.total_events?.toLocaleString()} events
              </p>
              <p className="text-sm text-muted-foreground">processed successfully</p>
              {status.last_uploaded_at && (
                <p className="mt-1 text-xs text-ink-soft">
                  Last updated: {new Date(status.last_uploaded_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Error Display */}
      {(error || fileValidationError) && (
        <div className="error-state rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error || fileValidationError}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadMessage && !error && (
        <div className="rounded-lg border border-primary/20 bg-fog px-4 py-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground">{uploadMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="loading-state space-y-3" aria-live="polite">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing your watch history...</span>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-primary" />
          </div>
          <Progress value={undefined} className="h-1.5" />
          <p className="text-xs text-ink-soft text-center">
            This usually takes 2-5 minutes depending on file size.
          </p>
        </div>
      )}

      {/* Drag & Drop Zone */}
      {!isUploading && (
        <button
          type="button"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-rule hover:border-primary/40 hover:bg-paper'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
          onClick={handleFileSelect}
          aria-describedby="watch-history-upload-help"
          aria-busy={isUploading}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-fog'}`}>
              <Upload aria-hidden="true" className={`h-7 w-7 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>

            <div className="space-y-1">
              <p className="font-display text-base font-medium tracking-[-0.02em]">
                {isDragging ? 'Drop your file here' : 'Drop your Takeout file here'}
              </p>
              <p id="watch-history-upload-help" className="text-sm text-ink-soft">
                or click to browse &middot; Accepts .json or .zip files
              </p>
            </div>

            <Button type="button" variant="outline" size="sm" className="mt-2 pointer-events-none">
              <Upload aria-hidden="true" className="mr-2 h-3.5 w-3.5" />
              {hasData ? "Update Data" : "Choose File"}
            </Button>
          </div>
        </button>
      )}

      <input
        ref={fileInputRef}
        id="watch-history-file-input"
        name="watch-history-file"
        type="file"
        accept=".json,.zip"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Delete Button (only show if data exists) */}
      {hasData && !isUploading && (
        <Button
          variant="destructive"
          onClick={handleDelete}
          size="sm"
          className="w-full"
        >
          <Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
          Delete All Watch History Data
        </Button>
      )}

      {/* Step-by-Step Guide */}
      <div className="space-y-4">
        <div className="divider-rule" />

        <div className="flex items-center gap-2">
          <Download aria-hidden="true" className="h-4 w-4 text-primary" />
          <h4 className="section-eyebrow !mb-0">How to Get Your YouTube Takeout</h4>
        </div>

        <div className="space-y-3 pl-2">
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full border border-rule bg-paper flex items-center justify-center text-xs font-data font-semibold text-foreground">
              1
            </div>
            <div className="flex-1 text-sm space-y-1">
              <p className="font-medium">Visit Google Takeout</p>
              <a
                href="https://takeout.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal hover:underline flex items-center gap-1"
              >
                takeout.google.com
                <ExternalLink aria-hidden="true" className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full border border-rule bg-paper flex items-center justify-center text-xs font-data font-semibold text-foreground">
              2
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium mb-1">Select YouTube Data</p>
              <p className="text-ink-soft">Click "Deselect all" then check only "YouTube and YouTube Music"</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full border border-rule bg-paper flex items-center justify-center text-xs font-data font-semibold text-foreground">
              3
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium mb-1">Choose History Only</p>
              <p className="text-ink-soft">Click "All YouTube data included" then select only "watch-history.json"</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full border border-rule bg-paper flex items-center justify-center text-xs font-data font-semibold text-foreground">
              4
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium mb-1">Download & Upload</p>
              <p className="text-ink-soft">Click "Next step" then "Create export" then wait for email, download, and upload here</p>
            </div>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="editorial-note rounded-lg border border-rule bg-paper px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Expected time:</strong> Google Takeout preparation takes 15-30 minutes.
              You'll receive an email when ready. File processing takes 2-5 minutes after upload.
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-ink-soft border-t border-rule pt-3">
          <strong className="text-foreground">Privacy:</strong> Your watch history is processed and stored securely in your private account.
          We never share your data with third parties. You can delete it anytime using the button above.
        </p>
      </div>
    </EditorialPanel>
  );
};

export default WatchHistoryUploadCard;
