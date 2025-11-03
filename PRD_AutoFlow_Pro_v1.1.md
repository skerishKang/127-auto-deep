
# AutoFlow Pro — 제품 요구사항서(PRD) v1.1 (Implementation-Ready)

> 본 문서는 바로 이슈화/개발 착수에 사용할 수 있도록 **수행 기준(AC)**, **API/데이터 스키마 초안**, **모듈화 범위**, **릴리즈 체크리스트**를 보강했습니다.  
> 대상 리포지토리 예: `G:\Ddrive\BatangD\task\workdiary\125-build-automation-extend`

---

## 0. 용어
- **캔버스 에디터**: 노드 기반 시각 워크플로 편집기(Trigger/Logic/Action/AI/Code).
- **코드 에디터**: Monaco 기반 Python/JS 실행 모듈.
- **AI 레이어**: LLM/OCR/분류/요약/RAG/에이전트 기능.
- **런타임/엔진**: 워크플로 실행/스케줄/리트라이/로깅 담당 서비스.

## 1. 배경 & 목표
- 파편화된 자동화 도구를 **하이브리드 UI(캔버스+코드)**로 통합, 비개발자와 개발자가 함께 쓰는 **AI 중심 자동화 허브** 제공.
- 6개월 Beta(50개 기업/1,000 워크플로), 12개월 300개 기업 고객, SLA 99.9% 목표.

## 2. 범위 (MVP → GA)
### 2.1 MVP (12주)
1) **캔버스 에디터**: Trigger/Logic/Action/AI/Code 노드 배치, 연결, 저장/버전, 임시 실행(Test Run).
2) **코드 에디터**: Monaco, 패키지 관리(whitelist), 샌드박스 실행, 로그/Artifacts 다운로드.
3) **기본 AI 노드**: 요약/분류/번역 + 외부 OCR 연동(PDF/이미지 → JSON).
4) **템플릿 20종**: 메일, 파일, ETL, 크롤링, 협업, 회계/AP, HR, AI 응용(샘플 포함).
5) **모니터링**: 실행 이력, 성공/실패, 리트라이, 알림(Slack/Email).
6) **권한**: OAuth(Google/MS), RBAC(Owner/Admin/Editor/Viewer).

### 2.2 GA (추가)
- 승인 워크플로/감사로그, 에이전트/RAG, 고급 스케줄링/병렬, 비용/ROI 대시보드, 템플릿 36종 완성.

## 3. 페르소나 & 사용자 스토리
### 3.1 페르소나
- **업무담당자(비개발자)**: 템플릿 기반으로 빠르게 자동화 구축.
- **자동화 엔지니어/개발자**: 커스텀 코드/모듈 작성, 성능/에러 핸들링.
- **IT 관리자**: 권한/보안/감사, 리소스/비용 모니터링.

### 3.2 핵심 사용자 스토리 & 수용 기준(AC)
US-01 캔버스에서 워크플로 작성  
- **AC-01**: 노드 배치/연결/설정 저장이 가능하다(±50ms 내 드래그 반응).  
- **AC-02**: Validation 실패(미연결/필수값 누락) 시 저장 불가, 오류 표시.  
- **AC-03**: “Test Run” 실행 시 샘플 입력으로 단일 경로 실행 및 로그 조회.  

US-02 코드 노드에서 Python/JS 실행  
- **AC-01**: Monaco에서 Lint/IntelliSense 제공.  
- **AC-02**: 패키지 설치는 allowlist 내에서 즉시 사용(예: requests, pandas).  
- **AC-03**: 실행은 샌드박스에서 60초 타임아웃, 메모리/CPU 제한.  
- **AC-04**: 실행 로그/출력 파일(Artifacts) 다운로드 가능.  

US-03 AI 요약/분류/번역 노드  
- **AC-01**: 공급자(OpenAI/Anthropic/Google) 스위칭, 키 vault 연동.  
- **AC-02**: 프롬프트 템플릿 저장/버전, 샘플 입출력 미리보기.  
- **AC-03**: 실패 시 백오프/폴백 모델로 재시도(최대 3회).  

US-04 템플릿 라이브러리(20종)  
- **AC-01**: 카테고리/난이도/도입효과/전제조건 표시.  
- **AC-02**: “복제 후 매개변수만 설정 → 배포” 플로우 10분 내 완료.  
- **AC-03**: 템플릿 업데이트 시 하위 인스턴스 영향도 확인 팝업.  

US-05 실행 모니터링 & 알림  
- **AC-01**: 실행/단계별 로그, 예외 스택, 재시도 히스토리 제공.  
- **AC-02**: 실패/지연 임계치별 Slack/Email 알림.  
- **AC-03**: 워크플로별 성공률/평균 실행시간/최근 7일 트렌드.  

US-06 인증/권한  
- **AC-01**: OAuth 로그인, 조직/워크스페이스 개념.  
- **AC-02**: RBAC(Owner/Admin/Editor/Viewer)로 편집/실행/배포 권한 제어.  
- **AC-03**: 감사 로그에 설정 변경/배포 이력 남김.

## 4. 정보 구조 & 데이터 스키마(초안)
### 4.1 핵심 엔티티
- **Workspace**(id, name, owner_id, created_at)  
- **Project**(id, workspace_id, name, desc, created_at)  
- **Workflow**(id, project_id, name, version, status, graph_json, created_by, created_at)  
- **Run**(id, workflow_id, started_at, ended_at, status, metrics_json, logs_ptr)  
- **Node**(id, workflow_id, type, config_json, position, created_at)  
- **Connection**(id, workflow_id, from_node_id, to_node_id, cond_json)  
- **Template**(id, name, category, difficulty, roi_hint, graph_json)  
- **Secret**(id, workspace_id, provider, key_ref, scope, created_at, rotated_at)  
- **User**(id, email, name, role, provider, created_at)

> 스토리지: Postgres(메타), S3 호환(Artifacts/첨부), Redis(큐/세션).

### 4.2 인덱스/제약
- Workflow(workspace_id, project_id, name) unique.  
- Run(workflow_id, started_at desc) index.  
- Secret(workspace_id, provider) composite unique.

## 5. API 계약(초안, REST)
- `POST /api/v1/workflows` (Body: name, project_id, graph_json) → 201 {id}  
- `GET /api/v1/workflows/{id}` → 200 {workflow}  
- `POST /api/v1/workflows/{id}:run` (Body: input_json?) → 202 {run_id}  
- `GET /api/v1/runs/{id}` → 200 {status, logs_url, metrics_json}  
- `POST /api/v1/templates/{id}:instantiate` (Body: project_id, params) → 201 {workflow_id}  
- `POST /api/v1/secrets` (Body: provider, key_ref, scope) → 201  
- `GET /api/v1/monitor/summary?workflow_id=...` → 200 {success_rate, p90_duration,...}

> WS 이벤트: run.status, run.log, workflow.updated

## 6. 통합(Integrations) 범위
- **메일**: Gmail/Outlook(읽기/발송/첨부 저장).  
- **파일**: Google Drive/Dropbox/S3.  
- **협업**: Slack/Telegram 알림.  
- **DB/ETL**: Postgres/MySQL/CSV/Sheets.  
- **AI**: OpenAI/Anthropic/Google(LLM), OCR(API), Embeddings.  
- **웹**: HTTP(S) 호출, Webhook Trigger.

## 7. 보안/거버넌스
- Vault(비밀/키), KMS 연동, RBAC, 감사로그, IP 제한(옵션), 데이터 마스킹.  
- 서드파티 키는 사용자 워크스페이스 범위로 스코핑.  
- 실행 샌드박스: 네트워크/Egress 정책, 리소스 쿼터.

## 8. 모니터링 & SLO
- **지표**: 성공률, 평균/95p 실행시간, 실패원인 Top N, 재시도율, 비용(LLM 호출/분 단가).  
- **알림 룰**: 실패율>5%, p95>3분, 비용 급증>30%/일.  
- **SLA**: 콘솔 응답 <100ms(P95), 실행 엔진 가용성 99.9%.

## 9. 템플릿 20종(요약 스펙)
- 메일 첨부 저장/분류, 회의록 요약→메일, 엑셀 병합→Master, 가격 크롤링→변동 알림, OCR 인보이스→시트 적재, DB 백업→S3, 일일 리포트, 채용 공고 수집, 계약서 생성/보관 등.  
- 각 템플릿 공통 메타: 전제조건, 입력/출력, 설정 파라미터, 예외/에러, 기대효과, 테스트 케이스.

## 10. 성능/부하 기준
- 동시 1,000 워크플로 실행, 노드 평균 실행시간 < 300ms(내부 액션 기준), 큐 대기<2초.  
- 코드 실행 컨테이너 cold start < 2s, 패키지 캐시.

## 11. 배포/릴리즈 플랜
- **Phase 0 (4주)**: PoC — 에디터 뼈대, 5개 템플릿, 단일 런타임.  
- **Phase 1 (8주)**: MVP — 20개 템플릿, AI 노드, 모니터링, RBAC.  
- **Phase 2 (8~12주)**: GA — 승인/감사, 에이전트/RAG, 비용 대시보드.

## 12. 리스크 & 대응
- 외부 API/LLM 비용 변동 → 어댑터/폴백/쿼터/알림.  
- 프롬프트 품질 편차 → 템플릿/평가셋/AB 테스트.  
- 시크릿 누출 위험 → Vault/KMS/권한 분리/감사.

## 13. 엔지니어링 태스크(초기 백로그, 2스프린트 예시)
- SP-01 캔버스 Core(노드/엣지/검증/저장)  
- SP-02 Test Run + 로그 스트리밍(WS)  
- SP-03 코드 실행기(샌드박스/패키지 캐시)  
- SP-04 AI 노드(요약/분류/번역 + 공급자 스위치)  
- SP-05 템플릿 10종(1차) + 마켓 UI  
- SP-06 모니터링 API + 대시보드(성공률/지연)  
- SP-07 OAuth + RBAC + 감사로그  
- SP-08 비밀 금고(Vault) 연동

## 14. 릴리즈 체크리스트
- [ ] 보안 점검: Secrets 스캔, 최소권한, 감사로그  
- [ ] 성능: 부하테스트 보고서, 병목 제거  
- [ ] 문서: 템플릿 가이드/온보딩/운영 런북  
- [ ] 운영: 백업/복구 리허설, 알림 룰 세팅

---

### 부록 A. 템플릿 스펙 샘플(1종)
**템플릿: 메일 첨부 자동 저장/분류 (Gmail → Drive → Sheets)**  
- 전제: Gmail/Drive OAuth, 폴더ID 준비.  
- 입력: 라벨명, 확장자 필터, 수신기간.  
- 처리: 첨부 다운로드 → 폴더 이동 → 메타데이터 시트 기록.  
- 출력: 파일 저장 경로, 기록 시트 행ID.  
- 예외: 첨부 없음/중복 파일명/권한 오류.  
- 테스트: 샘플 메일 5건으로 End-to-End 성공률 100%.

