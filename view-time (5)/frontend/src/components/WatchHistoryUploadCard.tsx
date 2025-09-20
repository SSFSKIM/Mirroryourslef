import React, { useRef } from "react";
import { Upload, Trash2, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useWatchHistoryStore from "utils/watchHistoryStore";

interface WatchHistoryUploadCardProps {
  className?: string;
}

const WatchHistoryUploadCard: React.FC<WatchHistoryUploadCardProps> = ({ className = "" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    status,
    isUploading,
    isLoadingStatus,
    error,
    uploadMessage,
    uploadTakeout,
    deleteHistory,
  } = useWatchHistoryStore();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadTakeout(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete all watch history data? This cannot be undone.")) {
      await deleteHistory();
    }
  };

  const hasData = status && status.total_events && status.total_events > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Watch History Import
        </CardTitle>
        <CardDescription>
          Upload your YouTube takeout data to unlock personalized viewing analytics and insights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {isLoadingStatus ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading status...</span>
          </div>
        ) : hasData ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>{status.total_events?.toLocaleString()} events</strong> processed successfully
              {status.last_uploaded_at && (
                <span className="block text-sm text-muted-foreground mt-1">
                  Last updated: {new Date(status.last_uploaded_at).toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No watch history data found. Upload your YouTube takeout to get started with personalized analytics.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {uploadMessage && !error && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{uploadMessage}</AlertDescription>
          </Alert>
        )}

        {/* Upload Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleFileSelect}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Takeout...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {hasData ? "Replace Data" : "Process Takeout"}
              </>
            )}
          </Button>
          
          {hasData && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isUploading}
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete History
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.zip"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>How to get your YouTube takeout:</strong></p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Go to <a href="https://takeout.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Takeout</a></li>
            <li>Select "YouTube and YouTube Music"</li>
            <li>Choose "watch-history.json" only</li>
            <li>Download and upload the file here</li>
          </ol>
          <p className="text-xs mt-2">
            <strong>Privacy:</strong> Your data is processed and stored securely. You can delete it anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchHistoryUploadCard;
