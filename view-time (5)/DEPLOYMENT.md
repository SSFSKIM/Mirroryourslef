# ViewTime (MirrorYourself) - Deployment Guide

이 문서는 ViewTime 애플리케이션을 Google Cloud Run에 배포하는 전체 프로세스를 설명합니다.

## 목차

1. [사전 요구사항](#사전-요구사항)
2. [환경 설정](#환경-설정)
3. [Docker 이미지 빌드](#docker-이미지-빌드)
4. [Artifact Registry에 푸시](#artifact-registry에-푸시)
5. [Cloud Run 배포](#cloud-run-배포)
6. [전체 배포 프로세스 (한 번에)](#전체-배포-프로세스-한-번에)
7. [환경 변수 관리](#환경-변수-관리)
8. [Secret Manager 사용](#secret-manager-사용)
9. [문제 해결](#문제-해결)

---

## 사전 요구사항

### 필수 도구 설치
- Docker Desktop
- Google Cloud SDK (gcloud CLI)
- Git

### gcloud CLI 설치 확인
```bash
gcloud --version
```

---

## 환경 설정

### 1. Google Cloud 프로젝트 설정

```bash
# 프로젝트 설정
gcloud config set project view-time-6ba20

# 현재 프로젝트 확인
gcloud config get-value project

# 리전 설정
gcloud config set compute/region us-central1
```

### 2. 필요한 API 활성화

```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### 3. Artifact Registry 저장소 생성 (최초 1회)

```bash
gcloud artifacts repositories create view-time \
  --repository-format=docker \
  --location=us-central1 \
  --description="ViewTime YouTube Analytics App"
```

### 4. Docker 인증 구성 (최초 1회)

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

## Docker 이미지 빌드

### 프로덕션 이미지 빌드

```bash
# 프로젝트 루트 디렉토리로 이동
cd "view-time (5)"

# Docker Compose를 사용한 빌드
docker compose build

# 또는 직접 Docker 명령어 사용
docker build -t view-time-prod:latest -f Dockerfile .
```

**빌드 시간**: 약 7-10분 (첫 빌드 시)

**빌드된 이미지 확인**:
```bash
docker images | grep view-time-prod
```

### 개발 환경 이미지 빌드

```bash
# 개발용 이미지 빌드 (백엔드 + 프론트엔드 분리)
docker compose -f docker-compose.dev.yml build
```

---

## Artifact Registry에 푸시

### 1. 이미지 태그 지정

```bash
# Artifact Registry 형식으로 태그
docker tag view-time-prod:latest \
  us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest
```

**태그 형식**: `[REGION]-docker.pkg.dev/[PROJECT_ID]/[REPOSITORY]/[IMAGE]:[TAG]`

### 2. 이미지 푸시

```bash
# Artifact Registry에 푸시
docker push us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest
```

**푸시 시간**: 약 2-5분 (네트워크 속도에 따라 다름)

### 3. 푸시된 이미지 확인

```bash
# Artifact Registry의 이미지 목록 확인
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/view-time-6ba20/view-time

# 또는 웹 콘솔에서 확인
# https://console.cloud.google.com/artifacts
```

---

## Cloud Run 배포

### 1. 첫 배포 (최초 1회)

```bash
gcloud run deploy view-time \
  --image us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 2Gi \
  --cpu 1 \
  --env-vars-file cloudrun.env.yaml
```

**배포 옵션 설명**:
- `--image`: 배포할 Docker 이미지 URL
- `--platform managed`: Cloud Run 관리형 플랫폼 사용
- `--region`: 배포 리전
- `--allow-unauthenticated`: 공개 접근 허용
- `--port 80`: 컨테이너 포트 (Nginx가 80 포트 사용)
- `--memory 2Gi`: 메모리 할당
- `--cpu 1`: CPU 할당 (1 vCPU)
- `--env-vars-file`: 환경 변수 YAML 파일

### 2. 기존 서비스 업데이트

```bash
# 새 이미지로 업데이트
gcloud run services update view-time \
  --image us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest \
  --region us-central1
```

### 3. 배포 상태 확인

```bash
# 서비스 상태 확인
gcloud run services describe view-time --region us-central1

# 서비스 URL 확인
gcloud run services describe view-time --region us-central1 --format="value(status.url)"

# 최근 리비전 확인
gcloud run revisions list --service view-time --region us-central1
```

### 4. 배포 테스트

```bash
# HTTP 상태 확인
curl -I https://view-time-938227880748.us-central1.run.app

# 또는 브라우저에서 직접 접속
# https://view-time-938227880748.us-central1.run.app
```

---

## 전체 배포 프로세스 (한 번에)

코드를 변경하고 배포하는 전체 프로세스를 한 번에 실행:

```bash
#!/bin/bash
# deploy.sh - 전체 배포 자동화 스크립트

set -e  # 에러 발생 시 중단

echo "🔨 Building Docker image..."
cd "view-time (5)"
docker compose build

echo "🏷️  Tagging image..."
docker tag view-time-prod:latest \
  us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest

echo "📤 Pushing to Artifact Registry..."
docker push us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest

echo "🚀 Deploying to Cloud Run..."
gcloud run services update view-time \
  --image us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest \
  --region us-central1

echo "✅ Deployment completed!"
echo "🌐 Service URL: https://view-time-938227880748.us-central1.run.app"
```

**스크립트 사용법**:
```bash
# 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

---

## 환경 변수 관리

### cloudrun.env.yaml 파일 구조

```yaml
# Application Configuration
NODE_ENV: "production"
PYTHONUNBUFFERED: "1"
DEBUG: "0"
LOG_LEVEL: "INFO"

# Firebase Configuration
FIREBASE_API_KEY: "your-api-key"
FIREBASE_AUTH_DOMAIN: "view-time-6ba20.firebaseapp.com"
FIREBASE_PROJECT_ID: "view-time-6ba20"
# ... 기타 환경 변수
```

### 환경 변수 업데이트

```bash
# 특정 환경 변수만 업데이트
gcloud run services update view-time \
  --region us-central1 \
  --set-env-vars "KEY=VALUE,KEY2=VALUE2"

# 환경 변수 제거
gcloud run services update view-time \
  --region us-central1 \
  --remove-env-vars KEY1,KEY2
```

---

## Secret Manager 사용

민감한 정보(API 키, 비밀번호 등)는 Secret Manager를 사용하여 관리합니다.

### 1. Secret 생성

```bash
# YouTube API Key를 Secret으로 생성
echo -n "your-api-key-here" | gcloud secrets create youtube-api-key --data-file=-

# 또는 파일에서 읽어오기
gcloud secrets create my-secret --data-file=/path/to/secret.txt
```

### 2. Cloud Run 서비스 계정에 권한 부여

```bash
# 서비스 계정 확인
gcloud run services describe view-time --region us-central1 \
  --format="value(spec.template.spec.serviceAccountName)"

# Secret 접근 권한 부여
gcloud secrets add-iam-policy-binding youtube-api-key \
  --member="serviceAccount:938227880748-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Cloud Run에서 Secret 사용

```bash
# Secret을 환경 변수로 마운트
gcloud run services update view-time \
  --region us-central1 \
  --update-secrets YOUTUBE_API_KEY=youtube-api-key:latest
```

### 4. Secret 관리

```bash
# Secret 목록 확인
gcloud secrets list

# Secret 값 확인 (권한 필요)
gcloud secrets versions access latest --secret="youtube-api-key"

# Secret 업데이트 (새 버전 추가)
echo -n "new-api-key" | gcloud secrets versions add youtube-api-key --data-file=-

# 특정 버전 사용
gcloud run services update view-time \
  --region us-central1 \
  --update-secrets YOUTUBE_API_KEY=youtube-api-key:2  # 버전 2 사용
```

---

## 문제 해결

### 로그 확인

```bash
# 최근 로그 확인 (50줄)
gcloud run services logs read view-time --region us-central1 --limit 50

# 실시간 로그 스트리밍
gcloud run services logs tail view-time --region us-central1

# 특정 리비전의 로그 확인
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=view-time" \
  --limit 50 --format json
```

### 일반적인 문제 및 해결

#### 1. 502 Bad Gateway 오류

**원인**: 애플리케이션이 시작되지 않거나 포트가 잘못 설정됨

**해결**:
```bash
# 포트 설정 확인 및 수정
gcloud run services update view-time \
  --region us-central1 \
  --port 80

# 로그에서 에러 확인
gcloud run services logs read view-time --region us-central1 --limit 50
```

#### 2. 이미지 푸시 권한 오류

**원인**: Docker 인증이 만료되거나 잘못 설정됨

**해결**:
```bash
# 재인증
gcloud auth login
gcloud auth configure-docker us-central1-docker.pkg.dev

# 권한 확인
gcloud projects get-iam-policy view-time-6ba20
```

#### 3. 빌드 실패

**원인**: 종속성 오류, 메모리 부족 등

**해결**:
```bash
# Docker 빌드 캐시 삭제
docker builder prune -a

# 메모리 할당 증가 (Docker Desktop 설정)
# Settings > Resources > Memory 조정

# 빌드 로그 자세히 확인
docker compose build --no-cache --progress=plain
```

#### 4. 환경 변수 오류

**원인**: cloudrun.env.yaml 형식 오류

**해결**:
```bash
# YAML 형식 검증
cat cloudrun.env.yaml | python -c "import yaml, sys; yaml.safe_load(sys.stdin)"

# 또는 온라인 YAML 검증기 사용
# https://www.yamllint.com/
```

### 서비스 롤백

문제가 발생한 경우 이전 버전으로 롤백:

```bash
# 이전 리비전 목록 확인
gcloud run revisions list --service view-time --region us-central1

# 특정 리비전으로 트래픽 전환
gcloud run services update-traffic view-time \
  --region us-central1 \
  --to-revisions view-time-00003-kkv=100
```

### 디버깅 모드

```bash
# 디버그 환경 변수 활성화
gcloud run services update view-time \
  --region us-central1 \
  --set-env-vars "DEBUG=1,LOG_LEVEL=DEBUG"

# Cloud Run 실행 중인 컨테이너에 접속 (불가능하지만 로그로 확인)
gcloud run services logs tail view-time --region us-central1
```

---

## 추가 리소스

### Cloud Run 설정 최적화

```bash
# 최소/최대 인스턴스 수 설정
gcloud run services update view-time \
  --region us-central1 \
  --min-instances 0 \
  --max-instances 10

# 동시 요청 수 설정
gcloud run services update view-time \
  --region us-central1 \
  --concurrency 80

# 타임아웃 설정 (최대 3600초)
gcloud run services update view-time \
  --region us-central1 \
  --timeout 300
```

### 커스텀 도메인 연결

```bash
# 도메인 매핑 추가
gcloud run domain-mappings create \
  --service view-time \
  --domain your-domain.com \
  --region us-central1

# DNS 설정 확인
gcloud run domain-mappings describe --domain your-domain.com --region us-central1
```

### 비용 모니터링

```bash
# Cloud Run 사용량 확인
gcloud run services describe view-time --region us-central1 \
  --format="value(status.traffic)"

# 예상 비용은 GCP Console에서 확인
# https://console.cloud.google.com/billing
```

---

## 배포 체크리스트

배포 전 확인 사항:

- [ ] 코드 변경사항이 Git에 커밋되어 있는가?
- [ ] 환경 변수 파일(`cloudrun.env.yaml`)이 최신 상태인가?
- [ ] 로컬에서 Docker 이미지가 정상적으로 빌드되는가?
- [ ] 민감한 정보가 코드에 하드코딩되어 있지 않은가?
- [ ] Secret Manager에 필요한 Secret이 모두 등록되어 있는가?
- [ ] 배포 후 테스트 계획이 있는가?

배포 후 확인 사항:

- [ ] 서비스가 정상적으로 응답하는가? (HTTP 200)
- [ ] 로그에 에러가 없는가?
- [ ] 주요 기능이 정상 작동하는가?
- [ ] 브라우저에서 제목과 파비콘이 올바르게 표시되는가?
- [ ] Firebase 인증이 정상 작동하는가?
- [ ] YouTube API 연동이 정상 작동하는가?

---

## 문의 및 지원

문제가 발생하거나 질문이 있는 경우:

1. **로그 확인**: `gcloud run services logs read view-time --region us-central1 --limit 50`
2. **Cloud Console 확인**: https://console.cloud.google.com/run
3. **GitHub Issues**: 프로젝트 저장소에 이슈 등록

---

**마지막 업데이트**: 2025-10-12
**버전**: 1.0.0
