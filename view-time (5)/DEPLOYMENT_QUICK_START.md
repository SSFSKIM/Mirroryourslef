# 배포 빠른 시작 가이드

ViewTime 애플리케이션을 Cloud Run에 빠르게 배포하기 위한 간단한 가이드입니다.

## 🚀 빠른 배포 (3단계)

### 1️⃣ 사전 준비 (최초 1회만)

```bash
# Google Cloud 프로젝트 설정
gcloud config set project view-time-6ba20

# Docker 인증
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 2️⃣ 자동 배포 스크립트 실행

```bash
# 배포 스크립트에 실행 권한 부여 (최초 1회)
chmod +x deploy.sh

# 전체 배포 실행
./deploy.sh
```

**소요 시간**: 약 10-15분

### 3️⃣ 배포 확인

```bash
# 서비스 URL 확인
gcloud run services describe view-time --region us-central1 --format="value(status.url)"

# 또는 브라우저에서 직접 접속
# https://view-time-938227880748.us-central1.run.app
```

---

## 📋 수동 배포 (단계별)

자동 스크립트를 사용하지 않고 수동으로 배포하려면:

### 1. Docker 이미지 빌드

```bash
docker compose build
```

### 2. 이미지 태그 및 푸시

```bash
# 태그
docker tag view-time-prod:latest \
  us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest

# 푸시
docker push us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest
```

### 3. Cloud Run 배포

```bash
gcloud run services update view-time \
  --image us-central1-docker.pkg.dev/view-time-6ba20/view-time/view-time-prod:latest \
  --region us-central1
```

---

## 🔧 자주 사용하는 명령어

### 로그 확인

```bash
# 최근 로그
gcloud run services logs read view-time --region us-central1 --limit 50

# 실시간 로그
gcloud run services logs tail view-time --region us-central1
```

### 서비스 상태 확인

```bash
# 서비스 정보
gcloud run services describe view-time --region us-central1

# 리비전 목록
gcloud run revisions list --service view-time --region us-central1
```

### 환경 변수 업데이트

```bash
gcloud run services update view-time \
  --region us-central1 \
  --set-env-vars "KEY=VALUE"
```

---

## 🛠️ 스크립트 옵션

배포 스크립트는 다양한 옵션을 지원합니다:

```bash
# 빌드 단계 건너뛰기 (이미지가 있는 경우)
./deploy.sh --skip-build

# 푸시 단계 건너뛰기 (이미지가 이미 푸시된 경우)
./deploy.sh --skip-push

# 도움말
./deploy.sh --help
```

---

## ❗ 문제 해결

### 502 Bad Gateway

```bash
# 로그 확인
gcloud run services logs read view-time --region us-central1 --limit 50

# 포트 확인 및 재배포
gcloud run services update view-time --region us-central1 --port 80
```

### 인증 오류

```bash
# 재인증
gcloud auth login
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 빌드 실패

```bash
# 캐시 삭제 후 재빌드
docker builder prune -a
docker compose build --no-cache
```

---

## 📚 상세 문서

더 자세한 정보는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

---

## ✅ 배포 체크리스트

배포 전:
- [ ] 코드 변경사항 커밋 완료
- [ ] 환경 변수 파일 업데이트 완료
- [ ] 로컬 테스트 완료

배포 후:
- [ ] 서비스 정상 응답 확인 (HTTP 200)
- [ ] 로그 에러 확인
- [ ] 주요 기능 테스트

---

**현재 서비스 URL**: https://view-time-938227880748.us-central1.run.app
