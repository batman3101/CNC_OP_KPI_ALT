# ALMUS TECH CNC Worker KPI Management System

CNC 작업자 KPI 관리 시스템 - Next.js 14 기반 웹 애플리케이션

## 개요

ALMUS TECH의 CNC 가공 라인 작업자들의 생산성과 품질을 모니터링하고 관리하기 위한 KPI(핵심성과지표) 관리 시스템입니다.

## 주요 기능

### 대시보드
- 실시간 KPI 현황 (목표달성률, 불량률, 효율)
- 라인별/작업자별 생산량 시각화
- 게이지 차트를 통한 달성률 표시

### 리포트
- **일간 리포트**: 일일 생산 실적 및 최고 성과자
- **주간 리포트**: 주간 트렌드 분석
- **월간 리포트**: 월간 종합 분석
- **연간 리포트**: 연간 통계 및 추이

### 관리 기능
- **생산 실적 관리**: CRUD 작업, 날짜별 검색
- **작업자 관리**: 작업자 등록/수정/삭제
- **모델 관리**: 생산 모델 등록/삭제
- **사용자 관리**: 관리자/사용자 계정 관리
- **데이터 관리**: Excel 내보내기/가져오기

### 추가 기능
- 다크 모드 / 라이트 모드
- 다국어 지원 (한국어, 베트남어)
- Excel 내보내기
- 반응형 디자인

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Ant Design 5
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **State Management**: React Context API

### Backend
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes
- **Authentication**: Custom (Supabase)

### 개발 도구
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier

## 설치 및 실행

### 요구사항
- Node.js 18.0 이상
- npm 9.0 이상

### 설치

```bash
# 저장소 클론
git clone https://github.com/batman3101/CNC_OP_KPI_ALT.git
cd CNC_OP_KPI_ALT

# 패키지 설치
npm install
```

### 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 파일을 생성하고 Supabase 정보를 입력합니다:

```bash
cp .env.example .env.local
```

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Default Locale
NEXT_PUBLIC_DEFAULT_LOCALE=ko
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 페이지
│   │   └── login/
│   ├── (dashboard)/              # 대시보드 페이지
│   │   ├── admin/                # 관리자 관리
│   │   ├── data-sync/            # 데이터 관리
│   │   ├── models/               # 모델 관리
│   │   ├── production/           # 생산 실적
│   │   ├── reports/              # 리포트
│   │   │   ├── daily/
│   │   │   ├── weekly/
│   │   │   ├── monthly/
│   │   │   └── yearly/
│   │   └── workers/              # 작업자 관리
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── models/
│   │   ├── production/
│   │   └── workers/
│   ├── globals.css
│   └── layout.tsx
├── components/                   # React 컴포넌트
│   ├── charts/                   # 차트 컴포넌트
│   ├── dashboard/                # 대시보드 컴포넌트
│   └── layout/                   # 레이아웃 컴포넌트
├── contexts/                     # React Context
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── lib/                          # 유틸리티
│   ├── supabase/
│   └── utils/
├── locales/                      # 번역 파일
│   ├── ko.json
│   └── vi.json
├── theme/                        # 테마 설정
│   └── mui-dashboard-theme.json
└── types/                        # TypeScript 타입
```

## 데이터베이스 스키마

### Users (사용자)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | Primary Key |
| 이메일 | varchar | 이메일 (로그인 ID) |
| 비밀번호 | varchar | 비밀번호 |
| 이름 | varchar | 사용자 이름 |
| 권한 | varchar | 관리자/사용자 |

### Workers (작업자)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | Primary Key |
| 사번 | varchar | 사원번호 |
| 이름 | varchar | 작업자 이름 |
| 부서 | varchar | 부서 |
| 라인번호 | varchar | 라인 번호 |

### Model (생산 모델)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | Primary Key |
| model | varchar | 모델명 |
| process | varchar | 공정 |

### Production (생산 실적)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | Primary Key |
| 날짜 | date | 생산일 |
| 작업자 | varchar | 작업자 이름 |
| 라인번호 | varchar | 라인 번호 |
| 모델차수 | varchar | 모델명 |
| 목표수량 | int | 목표 수량 |
| 생산수량 | int | 생산 수량 |
| 불량수량 | int | 불량 수량 |
| 특이사항 | text | 비고 |

## KPI 지표

| 지표 | 목표 | 계산식 |
|------|------|--------|
| 목표달성률 | 96% | (생산수량 / 목표수량) × 100 |
| 불량률 | ≤ 2% | (불량수량 / 생산수량) × 100 |
| 효율 | 95% | ((생산수량 - 불량수량) / 목표수량) × 100 |

## 테마

MUI Dashboard 스타일 테마 적용:
- **Primary Color**: Navy Blue (#000080)
- **Light Mode**: 밝은 배경, 어두운 텍스트
- **Dark Mode**: 어두운 배경, 밝은 텍스트

## 라이선스

Private - ALMUS TECH

## 문의

개발 관련 문의사항은 관리자에게 연락해주세요.
