#!/bin/bash

# YouTube Stats App - Quick Setup Script
# 이 스크립트는 Docker 환경을 빠르게 설정하고 실행합니다.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        📊 YouTube Stats App - Docker Setup              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check Docker and Docker Compose
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo -e "${GREEN}✅ Docker Compose is installed${NC}"

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo -e "${YELLOW}⚠️  .env.docker file not found${NC}"
    echo -e "${BLUE}📝 Creating .env.docker from template...${NC}"
    
    if [ -f .env.docker.example ]; then
        cp .env.docker.example .env.docker
        echo -e "${GREEN}✅ Created .env.docker${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env.docker and add your API keys${NC}"
        echo -e "${YELLOW}Press Enter to continue after editing, or Ctrl+C to exit${NC}"
        read
    else
        echo -e "${RED}❌ .env.docker.example not found${NC}"
        exit 1
    fi
fi

# Ask for mode
echo -e "${BLUE}📋 Select mode:${NC}"
echo "1) Development (with hot reload)"
echo "2) Production"
echo -n "Enter your choice [1-2]: "
read mode_choice

case $mode_choice in
    1)
        MODE="development"
        COMMAND="docker-compose up youtube-stats-dev"
        ;;
    2)
        MODE="production"
        COMMAND="docker-compose --profile production up -d"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}Selected mode: $MODE${NC}"

# Ask to build
echo -e "${BLUE}🏗️  Do you want to build images? (recommended for first run)${NC}"
echo -n "Build images? [Y/n]: "
read build_choice

case $build_choice in
    [Nn]*)
        BUILD=false
        ;;
    *)
        BUILD=true
        ;;
esac

# Build if requested
if [ "$BUILD" = true ]; then
    echo -e "${GREEN}🏗️  Building Docker images...${NC}"
    
    if [ "$MODE" = "development" ]; then
        docker-compose build youtube-stats-dev
    else
        docker-compose --profile production build
    fi
    
    echo -e "${GREEN}✅ Build complete${NC}"
fi

# Start services
echo -e "${GREEN}🚀 Starting services...${NC}"
eval $COMMAND

# Wait for services to be ready
if [ "$MODE" = "production" ]; then
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    sleep 5
    
    # Health check
    MAX_ATTEMPTS=30
    ATTEMPT=1
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        if curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Services are healthy!${NC}"
            break
        fi
        
        echo -e "${YELLOW}⏳ Waiting for services... ($ATTEMPT/$MAX_ATTEMPTS)${NC}"
        sleep 2
        ATTEMPT=$((ATTEMPT + 1))
    done
    
    if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ Services failed to start properly${NC}"
        echo -e "${YELLOW}Check logs with: docker-compose logs${NC}"
        exit 1
    fi
fi

# Display access information
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║          🎉 Setup Complete!                          ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$MODE" = "development" ]; then
    echo -e "${BLUE}📍 Access your application:${NC}"
    echo -e "   🌐 Frontend:  ${GREEN}http://localhost:3000${NC}"
    echo -e "   🔧 Backend:   ${GREEN}http://localhost:8000${NC}"
    echo -e "   📚 API Docs:  ${GREEN}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo -e "   - Frontend and backend will auto-reload on changes"
    echo -e "   - Press Ctrl+C to stop services"
    echo -e "   - View logs: ${BLUE}docker-compose logs -f${NC}"
else
    echo -e "${BLUE}📍 Access your application:${NC}"
    echo -e "   🌐 App: ${GREEN}http://localhost:8080${NC}"
    echo ""
    echo -e "${YELLOW}💡 Useful commands:${NC}"
    echo -e "   - View logs: ${BLUE}docker-compose --profile production logs -f${NC}"
    echo -e "   - Stop services: ${BLUE}docker-compose --profile production down${NC}"
    echo -e "   - Restart: ${BLUE}docker-compose --profile production restart${NC}"
    echo -e "   - Health check: ${BLUE}curl http://localhost:8080/health${NC}"
fi

echo ""
echo -e "${BLUE}📚 For more commands, check:${NC}"
echo -e "   - ${GREEN}make help${NC} (if using Makefile)"
echo -e "   - ${GREEN}README.docker.md${NC} for detailed documentation"
echo ""

echo -e "${GREEN}Happy tracking! 📊✨${NC}"
