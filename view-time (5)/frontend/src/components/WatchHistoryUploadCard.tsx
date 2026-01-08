import React, { useRef, useState } from "react";
import { Upload, Trash2, CheckCircle2, AlertCircle, Loader2, FileText, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <CardContent className="space-y-6">
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
        ) : null}

        {/* Error Display */}
        {(error || fileValidationError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || fileValidationError}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {uploadMessage && !error && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{uploadMessage}</AlertDescription>
          </Alert>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing your watch history...</span>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
            <Progress value={undefined} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              ⏱️ This usually takes 2-5 minutes depending on file size
            </p>
          </div>
        )}

        {/* Drag & Drop Zone */}
        {!isUploading && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${isDragging
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-muted hover:border-primary/50 hover:bg-accent/50'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            `}
            onClick={handleFileSelect}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
                <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>

              <div className="space-y-1">
                <p className="text-lg font-medium">
                  {isDragging ? 'Drop your file here' : 'Drop your Takeout file here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • Accepts .json or .zip files
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileSelect();
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                {hasData ? "Update Data" : "Choose File"}
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
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
            <Trash2 className="mr-2 h-4 w-4" />
            Delete All Watch History Data
          </Button>
        )}

        {/* Step-by-Step Guide */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">How to Get Your YouTube Takeout</h4>
          </div>

          <div className="space-y-3 pl-6">
            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div className="flex-1 text-sm space-y-1">
                <p className="font-medium">Visit Google Takeout</p>
                <a
                  href="https://takeout.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  takeout.google.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium mb-1">Select YouTube Data</p>
                <p className="text-muted-foreground">Click "Deselect all" → Check only "YouTube and YouTube Music"</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium mb-1">Choose History Only</p>
                <p className="text-muted-foreground">Click "All YouTube data included" → Select only "watch-history.json"</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium mb-1">Download & Upload</p>
                <p className="text-muted-foreground">Click "Next step" → "Create export" → Wait for email → Download → Upload here</p>
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>⏱️ Expected time:</strong> Google Takeout preparation takes 15-30 minutes.
              You'll receive an email when ready. File processing takes 2-5 minutes after upload.
            </AlertDescription>
          </Alert>

          {/* Privacy Note */}
          <p className="text-xs text-muted-foreground border-t pt-3">
            <strong>🔒 Privacy:</strong> Your watch history is processed and stored securely in your private account.
            We never share your data with third parties. You can delete it anytime using the button above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchHistoryUploadCard;
