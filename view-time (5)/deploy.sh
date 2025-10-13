#!/bin/bash

##############################################################################
# ViewTime (MirrorYourself) - Cloud Run Deployment Script
#
# This script automates the complete deployment process:
# 1. Build Docker image
# 2. Tag image for Artifact Registry
# 3. Push to Artifact Registry
# 4. Deploy to Cloud Run
#
# Usage: ./deploy.sh [options]
# Options:
#   --skip-build    Skip Docker build step
#   --skip-push     Skip push to Artifact Registry
#   --help          Show this help message
##############################################################################

set -e  # Exit on error

# Configuration
PROJECT_ID="view-time-6ba20"
REGION="us-central1"
SERVICE_NAME="view-time"
REPOSITORY="view-time"
IMAGE_NAME="view-time-prod"
IMAGE_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_BUILD=false
SKIP_PUSH=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-push)
            SKIP_PUSH=true
            shift
            ;;
        --help)
            echo "ViewTime Deployment Script"
            echo ""
            echo "Usage: ./deploy.sh [options]"
            echo ""
            echo "Options:"
            echo "  --skip-build    Skip Docker build step"
            echo "  --skip-push     Skip push to Artifact Registry"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Full image path
FULL_IMAGE_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  ViewTime (MirrorYourself) Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo -e "  Project ID:   ${PROJECT_ID}"
echo -e "  Region:       ${REGION}"
echo -e "  Service:      ${SERVICE_NAME}"
echo -e "  Image:        ${FULL_IMAGE_PATH}"
echo ""

# Verify gcloud is configured
echo -e "${YELLOW}🔍 Checking gcloud configuration...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: gcloud project is set to '${CURRENT_PROJECT}', expected '${PROJECT_ID}'${NC}"
    echo -e "${YELLOW}Run: gcloud config set project ${PROJECT_ID}${NC}"
    exit 1
fi
echo -e "${GREEN}✅ gcloud configured correctly${NC}"
echo ""

# Step 1: Build Docker image
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}🔨 Step 1: Building Docker image...${NC}"
    docker compose build
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
    echo ""
else
    echo -e "${YELLOW}⏭️  Skipping Docker build step${NC}"
    echo ""
fi

# Step 2: Tag image
echo -e "${YELLOW}🏷️  Step 2: Tagging image...${NC}"
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${FULL_IMAGE_PATH}
echo -e "${GREEN}✅ Image tagged: ${FULL_IMAGE_PATH}${NC}"
echo ""

# Step 3: Push to Artifact Registry
if [ "$SKIP_PUSH" = false ]; then
    echo -e "${YELLOW}📤 Step 3: Pushing to Artifact Registry...${NC}"
    docker push ${FULL_IMAGE_PATH}
    echo -e "${GREEN}✅ Image pushed to Artifact Registry${NC}"
    echo ""
else
    echo -e "${YELLOW}⏭️  Skipping push to Artifact Registry${NC}"
    echo ""
fi

# Step 4: Deploy to Cloud Run
echo -e "${YELLOW}🚀 Step 4: Deploying to Cloud Run...${NC}"
gcloud run services update ${SERVICE_NAME} \
    --image ${FULL_IMAGE_PATH} \
    --region ${REGION} \
    --quiet

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region ${REGION} \
    --format="value(status.url)")

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 Deployment Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}Service URL:${NC} ${SERVICE_URL}"
echo -e "${GREEN}Region:${NC}      ${REGION}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Test the deployment: curl -I ${SERVICE_URL}"
echo -e "  2. Check logs: gcloud run services logs read ${SERVICE_NAME} --region ${REGION}"
echo -e "  3. Open in browser: ${SERVICE_URL}"
echo ""
echo -e "${GREEN}✨ Happy deploying!${NC}"
