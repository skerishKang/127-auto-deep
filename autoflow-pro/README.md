# AutoFlow Pro

**지능형 업무 자동화 통합 플랫폼**

코드 기반 자동화와 비주얼 워크플로우를 결합한 하이브리드 자동화 플랫폼입니다. GPT-4, Claude 등의 AI 서비스를 네이티브 통합하여 지능형 자동화를 실현합니다.

## 🚀 주요 기능

### SP-01: 캔버스 코어 구현 ✅ 완료
- ✅ 드래그 & 드롭 워크플로우 에디터
- ✅ 5가지 노드 타입 (Trigger, Action, Logic, AI, Code)
- ✅ 엣지 연결 및 검증
- ✅ 워크플로우 저장/불러오기
- ✅ 실시간 캔버스 반응

### SP-02: Test Run + 로그 스트리밍 🔄 진행중
- ✅ 워크플로우 실행 API
- ✅ 실행 이력 추적
- 🔄 WebSocket 로그 스트리밍 (예정)

### SP-03: 코드 실행기 🔜 예정
- 샌드박스 환경
- Python/JavaScript 지원
- 패키지 관리

### SP-04: AI 노드 🔜 예정
- OpenAI/Anthropic/Google 연동
- 요약/분류/번역
- 프롬프트 템플릿

### SP-05: 템플릿 10종 🔜 예정
- 20개 검증된 비즈니스 시나리오
- 즉시 사용 가능한 템플릿
- 마켓플레이스 UI

## 📋 기술 스택

### Frontend
- **React 18** + TypeScript
- **Vite** (빌드 도구)
- **Ant Design** (UI 컴포넌트)
- **React Flow** (캔버스 에디터)
- **Monaco Editor** (코드 에디터)
- **Zustand** (상태관리)
- **Socket.io Client** (실시간 통신)

### Backend
- **NestJS** (Node.js 프레임워크)
- **TypeORM** (ORM)
- **PostgreSQL** (데이터베이스)
- **Redis** (캐시/세션)
- **Socket.io** (WebSocket)
- **Swagger** (API 문서화)

### Infrastructure
- **Docker** + **Docker Compose**
- **AWS** (배포 준비)

## 🏗️ 프로젝트 구조

```
autoflow-pro/
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── stores/        # Zustand Store
│   │   ├── types/         # TypeScript 타입
│   │   ├── utils/         # 유틸리티 함수
│   │   └── hooks/         # 커스텀 훅
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # NestJS Backend
│   ├── src/
│   │   ├── workflows/     # 워크플로우 모듈
│   │   │   ├── entities/  # TypeORM 엔티티
│   │   │   ├── dto/       # DTO
│   │   │   ├── controller/# API 컨트롤러
│   │   │   └── service/   # 비즈니스 로직
│   │   ├── common/        # 공통 모듈
│   │   └── config/        # 설정
│   ├── package.json
│   └── nest-cli.json
│
├── docker/                # Docker 설정
│   └── docker-compose.dev.yml
│
├── .env.example
├── package.json           # 루트 패키지
└── README.md
```

## 🐳 Docker로 실행하기

### 1. 환경변수 복사
```bash
cp .env.example .env
```

### 2. Docker 컨테이너 실행
```bash
npm run docker:dev
```

### 3. 접근
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 💻 로컬 개발

### Prerequiresites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Frontend 실행
```bash
cd frontend
npm install
npm run dev
```

### Backend 실행
```bash
cd backend
npm install
npm run dev
```

## 📊 API 엔드포인트

### Workflows
- `POST /api/v1/workflows` - 워크플로우 생성
- `GET /api/v1/workflows` - 워크플로우 목록
- `GET /api/v1/workflows/:id` - 워크플로우 상세
- `PUT /api/v1/workflows/:id` - 워크플로우 업데이트
- `POST /api/v1/workflows/:id:run` - 워크플로우 실행
- `GET /api/v1/workflows/:id/runs` - 실행 이력
- `GET /api/v1/workflows/runs/:runId` - 실행 상세

## 🎯 로드맵

### Phase 1 (완료 ✅)
- [x] 기본 프로젝트 구조
- [x] 캔버스 에디터
- [x] 워크플로우 CRUD
- [x] Docker 환경

### Phase 2 (진행중 🔄)
- [ ] Test Run + WebSocket
- [ ] 코드 실행기
- [ ] AI 노드 통합
- [ ] 템플릿 10종

### Phase 3 (예정 📅)
- [ ] AI 에이전트/RAG
- [ ] OAuth + RBAC
- [ ] 비밀금고(Vault) 연동
- [ ] 모니터링 대시보드

### Phase 4 (예정 📅)
- [ ] AWS 배포
- [ ] 다국어 지원
- [ ] 마켓플레이스
- [ ] 파트너십 프로그램

## 🤝 기여하기

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 라이센스

MIT

## 👥 팀

AutoFlow Pro Team

---

**AutoFlow Pro로 지능형 자동화의 미래를 만들어가세요!** 🚀
