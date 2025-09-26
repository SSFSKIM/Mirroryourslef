#!/bin/bash

# YouTube Stats App Docker Entrypoint Script
# 컨테이너 시작 시 실행되는 초기화 스크립트

set -e  # 에러 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    if [ "${DEBUG:-0}" = "1" ]; then
        echo -e "${CYAN}[DEBUG]${NC} $1"
    fi
}

# 배너 출력
print_banner() {
    echo -e "${MAGENTA}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        📊 YouTube Stats App - Docker Container          ║
║                                                          ║
║           Track, Analyze, and Optimize                  ║
║              Your YouTube Usage Time                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# 환경 변수 기본값 설정
export PYTHONPATH="${PYTHONPATH:-/app/backend}"
export PYTHONUNBUFFERED="${PYTHONUNBUFFERED:-1}"
export NODE_ENV="${NODE_ENV:-production}"

print_banner
log_info "🚀 YouTube Stats App을 시작합니다..."
log_info "환경: $NODE_ENV"
log_info "Python Path: $PYTHONPATH"

# 환경별 설정
if [ "$NODE_ENV" = "development" ]; then
    log_info "🔧 개발 환경으로 설정됩니다"
    export DEBUG=1
    export FASTAPI_ENV=development
    export LOG_LEVEL=DEBUG
else
    log_info "🏭 프로덕션 환경으로 설정됩니다"
    export DEBUG=0
    export FASTAPI_ENV=production
    export LOG_LEVEL=INFO
fi

# 필수 디렉토리 생성
log_info "📁 필요한 디렉토리를 생성합니다..."
mkdir -p /app/logs
mkdir -p /app/data
mkdir -p /app/data/cache
mkdir -p /app/data/exports
mkdir -p /var/log/nginx
mkdir -p /var/log/supervisor

# 권한 설정
chmod -R 755 /app/logs 2>/dev/null || true
chmod -R 755 /app/data 2>/dev/null || true

log_success "✅ 디렉토리 설정 완료"

# 서비스 연결 대기 함수
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=${4:-30}
    local attempt=1

    log_info "⏳ $service_name 서비스 연결을 기다립니다 ($host:$port)..."

    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            log_success "✅ $service_name 서비스가 준비되었습니다!"
            return 0
        fi
        
        log_debug "⏳ $service_name 연결 시도 $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "❌ $service_name 서비스에 연결할 수 없습니다"
    return 1
}

# 외부 서비스 연결 확인
check_external_services() {
    log_info "🔍 외부 서비스 연결을 확인합니다..."

    # PostgreSQL 연결 확인
    if [ -n "$DATABASE_URL" ]; then
        if [[ $DATABASE_URL =~ postgresql://[^@]*@([^:]+):([0-9]+)/ ]]; then
            DB_HOST="${BASH_REMATCH[1]}"
            DB_PORT="${BASH_REMATCH[2]}"
            wait_for_service "$DB_HOST" "$DB_PORT" "PostgreSQL" 30
        fi
    fi

    # Redis 연결 확인
    if [ -n "$REDIS_URL" ]; then
        if [[ $REDIS_URL =~ redis://([^:]+):([0-9]+) ]]; then
            REDIS_HOST="${BASH_REMATCH[1]}"
            REDIS_PORT="${BASH_REMATCH[2]}"
            wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis" 15
        fi
    fi

    log_success "✅ 외부 서비스 확인 완료"
}

# 데이터베이스 마이그레이션 실행
run_migrations() {
    if [ "$NODE_ENV" = "production" ] && [ -n "$DATABASE_URL" ]; then
        log_info "🗄️  데이터베이스 마이그레이션을 실행합니다..."
        cd /app/backend
        
        # Alembic 마이그레이션
        if [ -f "alembic.ini" ]; then
            python -m alembic upgrade head && log_success "✅ Alembic 마이그레이션 완료" || log_warning "⚠️  Alembic 마이그레이션 중 오류 발생"
        fi
    fi
}

# 정적 파일 확인
check_static_files() {
    if [ "$NODE_ENV" = "production" ]; then
        log_info "📦 정적 파일을 확인합니다..."
        
        if [ ! -d "/app/frontend/dist" ] || [ -z "$(ls -A /app/frontend/dist)" ]; then
            log_warning "⚠️  프론트엔드 빌드 파일이 없습니다!"
            
            if [ -d "/app/frontend" ] && [ -f "/app/frontend/package.json" ]; then
                log_info "📦 프론트엔드 빌드를 실행합니다..."
                cd /app/frontend
                yarn install --immutable && yarn build || log_error "프론트엔드 빌드 실패"
            fi
        else
            log_success "✅ 프론트엔드 빌드 파일 확인 완료"
        fi
    fi
}

# 환경 변수 검증
validate_env() {
    log_info "🔍 환경 변수를 검증합니다..."
    
    local required_vars=(
        "FIREBASE_PROJECT_ID"
        "FIREBASE_API_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warning "⚠️  다음 환경 변수가 설정되지 않았습니다: ${missing_vars[*]}"
        log_warning "일부 기능이 제한될 수 있습니다."
    else
        log_success "✅ 필수 환경 변수 확인 완료"
    fi
}

# 헬스 체크
health_check() {
    log_info "🏥 서비스 헬스 체크를 수행합니다..."
    
    # 백엔드 서비스가 시작될 때까지 대기
    sleep 5
    
    if curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
        log_success "✅ 서비스 정상"
    else
        log_warning "⚠️  헬스 체크 실패 (서비스가 시작 중일 수 있습니다)"
    fi
}

# 시그널 핸들러
cleanup() {
    log_info "🛑 종료 시그널을 받았습니다. 정리 작업을 수행합니다..."
    
    # 실행 중인 프로세스 종료
    if [ -n "$FRONTEND_PID" ]; then
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    if [ -n "$BACKEND_PID" ]; then
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
    fi
    
    log_success "👋 정리 작업 완료. 종료합니다."
    exit 0
}

trap cleanup SIGTERM SIGINT

# 메인 실행 로직
main() {
    # 환경 변수 검증
    validate_env
    
    # 외부 서비스 확인
    check_external_services
    
    # 정적 파일 확인
    check_static_files
    
    # 데이터베이스 마이그레이션
    run_migrations
    
    # 실행 모드에 따른 분기
    case "${1:-production}" in
        "dev"|"development")
            log_info "🔧 개발 모드로 실행합니다..."
            
            # 개발 환경: 프론트엔드와 백엔드를 병렬로 실행
            cd /app/frontend
            if [ ! -d "node_modules" ] || [ ! -d ".yarn" ]; then
                log_info "📦 프론트엔드 의존성을 설치합니다..."
                corepack enable && yarn install
            fi
            
            yarn dev --host 0.0.0.0 --port 3000 &
            FRONTEND_PID=$!
            
            cd /app/backend
            uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
            BACKEND_PID=$!
            
            log_success "✅ 개발 서버가 시작되었습니다!"
            log_info "🌐 프론트엔드: http://localhost:3000"
            log_info "🔧 백엔드: http://localhost:8000"
            log_info "📚 API 문서: http://localhost:8000/docs"
            
            # 프로세스들이 실행 중인지 확인
            wait $FRONTEND_PID $BACKEND_PID
            ;;
            
        "backend")
            log_info "🔧 백엔드만 실행합니다..."
            cd /app/backend
            
            if [ "$NODE_ENV" = "development" ]; then
                exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
            else
                exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
            fi
            ;;
            
        "frontend")
            log_info "🌐 프론트엔드만 실행합니다..."
            cd /app/frontend
            
            if [ "$NODE_ENV" = "development" ]; then
                exec yarn dev --host 0.0.0.0 --port 3000
            else
                exec npx serve -s dist -l 3000
            fi
            ;;
            
        "migrate")
            log_info "🗄️  데이터베이스 마이그레이션만 실행합니다..."
            cd /app/backend
            
            if [ -f "alembic.ini" ]; then
                exec python -m alembic upgrade head
            else
                log_error "Alembic 설정 파일을 찾을 수 없습니다"
                exit 1
            fi
            ;;
            
        "test")
            log_info "🧪 테스트를 실행합니다..."
            
            cd /app/backend && python -m pytest -v &
            BACKEND_TEST_PID=$!
            
            if [ -d "/app/frontend" ] && [ -f "/app/frontend/package.json" ]; then
                cd /app/frontend && yarn test &
                FRONTEND_TEST_PID=$!
            fi
            
            wait $BACKEND_TEST_PID $FRONTEND_TEST_PID
            ;;
            
        "shell")
            log_info "🐚 셸을 시작합니다..."
            exec /bin/bash
            ;;
            
        *)
            # 기본값: 프로덕션 모드 (Supervisor로 실행)
            log_info "🏭 프로덕션 모드로 실행합니다..."
            
            # Nginx 설정 파일 검증
            if ! nginx -t; then
                log_error "❌ Nginx 설정 파일에 오류가 있습니다!"
                exit 1
            fi
            
            log_success "✅ Nginx 설정 검증 완료"
            
            # Supervisor 설정 파일 검증
            if [ ! -f "/etc/supervisor/conf.d/supervisord.conf" ]; then
                log_error "❌ Supervisor 설정 파일이 없습니다!"
                exit 1
            fi
            
            log_success "✅ Supervisor 설정 확인 완료"
            log_success "🎉 모든 서비스를 시작합니다!"
            
            # Supervisor 실행
            exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
            ;;
    esac
}

# 메인 함수 실행
main "$@"
