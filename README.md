# 알록 (Alog) - 알맹상점 스마트 영수증 시스템

<div align="center">

**알록**은 알맹상점을 위한 통합 POS 및 스마트 영수증 플랫폼입니다.

[기능 소개](#-주요-기능) • [시작하기](#-시작하기) • [프로젝트 구조](#-프로젝트-구조) • [API 문서](#-api-엔드포인트)

</div>

---

## 📋 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
  - [필수 요구사항](#필수-요구사항)
  - [설치](#설치)
  - [환경 변수 설정](#환경-변수-설정)
  - [개발 서버 실행](#개발-서버-실행)
- [프로젝트 구조](#-프로젝트-구조)
- [주요 페이지](#-주요-페이지)
- [API 엔드포인트](#-api-엔드포인트)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)

---

## 🌟 소개

**알록 (Alog)**은 알맹상점의 디지털 전환을 위한 통합 솔루션입니다. 기존의 종이 영수증을 대체하는 스마트 영수증 시스템과 함께, 매장 운영에 필요한 POS 시스템, 고객 관리, 매출 분석까지 제공하는 올인원 플랫폼입니다.

### 핵심 가치

- 🌱 **환경 친화적**: 디지털 영수증으로 종이 사용량 감소
- 📊 **데이터 기반 운영**: 실시간 매출 분석 및 상품 랭킹
- 🎮 **고객 참여**: 캐릭터 레벨업, 배지 시스템 등 재미있는 고객 경험
- 💳 **효율적인 POS**: 직관적이고 빠른 주문 처리

---

## ✨ 주요 기능

### 1. POS 시스템
- **상품 카탈로그 관리**: 카테고리별 상품 조회 및 검색
- **주문 관리**: 장바구니 기반 주문 처리
- **고객 연동**: 전화번호 기반 고객 식별 및 관리
- **결제 처리**: 결제 완료 및 영수증 발송

### 2. 스마트 영수증
- **디지털 영수증**: 구매 내역을 디지털 형태로 제공
- **환경 영향 정보**: 탄소 배출 감소량 등 환경 친화적 정보 표시
- **캐릭터 레벨 시스템**: 구매에 따른 캐릭터 성장
- **배지 시스템**: 다양한 배지 획득으로 고객 참여 유도

### 3. 관리자 대시보드
- **매출 통계**: 일별/주별/월별 매출 현황
- **상품 분석**: 인기 상품 랭킹 및 판매 트렌드
- **고객 관리**: 고객 정보 조회 및 구매 이력 관리
- **상품 관리**: 상품 정보 등록 및 수정

### 4. 마이페이지
- **개인 구매 내역**: 고객별 구매 기록 조회
- **환경 기여도**: 탄소 배출 감소 기여량 표시
- **캐릭터 상태**: 현재 레벨 및 경험치 확인
- **배지 컬렉션**: 획득한 배지 목록

### 5. 인증 시스템
- **카카오 로그인**: 카카오 계정 연동 로그인

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Database**: Supabase (PostgreSQL)
- **ORM/Client**: @supabase/supabase-js

### Development Tools
- **Linter**: ESLint
- **Formatter**: Prettier
- **Package Manager**: npm

---

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Supabase 계정 및 프로젝트

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd alog

# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 애플리케이션 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 카카오 로그인 (선택사항)
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
```

#### 환경 변수 설명

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ 필수 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | ✅ 필수 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (서버 전용) | ✅ 필수 |
| `NEXT_PUBLIC_BASE_URL` | 애플리케이션 베이스 URL | ⚠️ 권장 |
| `KAKAO_CLIENT_ID` | 카카오 개발자 앱 키 | 선택 |
| `KAKAO_CLIENT_SECRET` | 카카오 개발자 앱 시크릿 | 선택 |
| `KAKAO_REDIRECT_URI` | 카카오 OAuth 리다이렉트 URI | 선택 |

> ⚠️ **보안 주의사항**
> - `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 코드에 노출되지 않도록 주의하세요.
> - `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
> - 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요.

### 개발 서버 실행

```bash
# 개발 서버 시작 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 실행
npm run lint
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

---

## 📁 프로젝트 구조

```
alog/
├── public/                    # 정적 파일
│   ├── almang_logo.png       # 로고 이미지
│   ├── product/              # 상품 이미지
│   └── ...
│
├── src/
│   ├── app/                  # Next.js App Router 페이지
│   │   ├── admin/            # 관리자 페이지
│   │   │   └── dashboard/    # 대시보드
│   │   │       ├── analytics/      # 분석 페이지
│   │   │       ├── products/       # 상품 관리
│   │   │       ├── users/          # 고객 관리
│   │   │       └── settings/       # 설정
│   │   │
│   │   ├── api/              # API 라우트
│   │   │   ├── admin/        # 관리자 API
│   │   │   ├── auth/         # 인증 API
│   │   │   ├── pos/          # POS API
│   │   │   ├── customers/    # 고객 API
│   │   │   ├── products/     # 상품 API
│   │   │   └── receipt/      # 영수증 API
│   │   │
│   │   ├── login/            # 로그인 페이지
│   │   ├── mypage/           # 마이페이지
│   │   ├── pos/              # POS 시스템
│   │   │   ├── checkout/     # 결제 페이지
│   │   │   └── customer/     # 고객 입력 페이지
│   │   ├── receipt/          # 영수증 조회
│   │   ├── products/         # 상품 상세
│   │   ├── privacy/          # 개인정보처리방침
│   │   ├── term/             # 이용약관
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   ├── page.tsx          # 홈 페이지
│   │   └── globals.css       # 전역 스타일
│   │
│   ├── components/           # 재사용 컴포넌트
│   │   ├── POS/              # POS 전용 컴포넌트
│   │   │   ├── CatalogPanel.tsx
│   │   │   ├── CategorySidebar.tsx
│   │   │   ├── OrderPanel.tsx
│   │   │   └── ...
│   │   ├── Mypage/           # 마이페이지 컴포넌트
│   │   │   ├── HeaderSection.tsx
│   │   │   ├── CharacterSection.tsx
│   │   │   ├── BadgesSection.tsx
│   │   │   └── EnvironmentSection.tsx
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/               # UI 컴포넌트
│   │   │   ├── Card.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── Footer.tsx
│   │   └── FooterWrapper.tsx
│   │
│   ├── lib/                  # 유틸리티 및 라이브러리
│   │   ├── supabase/         # Supabase 관련
│   │   │   └── products.ts
│   │   ├── supabase-client.ts  # Supabase 클라이언트
│   │   ├── env.ts            # 환경 변수 유틸
│   │   ├── carbon-emission.ts  # 탄소 배출 계산
│   │   └── character-levels.ts  # 캐릭터 레벨 시스템
│   │
│   ├── types/                # TypeScript 타입 정의
│   │   ├── product.ts
│   │   ├── customer.ts
│   │   ├── receipt.ts
│   │   ├── badge.ts
│   │   └── ...
│   │
│   └── auth/                 # 인증 관련 컴포넌트
│       └── kakao-login.tsx
│
├── next.config.ts            # Next.js 설정
├── tsconfig.json             # TypeScript 설정
├── tailwind.config.js        # Tailwind CSS 설정
├── package.json              # 프로젝트 의존성
└── README.md                 # 프로젝트 문서
```

---

## 📄 주요 페이지

### 홈 페이지 (`/`)
- 애플리케이션의 진입점
- 주요 기능으로 빠르게 이동할 수 있는 네비게이션 제공
  - 소비자용 영수증 예시
  - 관리자 대시보드
  - POS 시스템
  - 마이페이지

### POS 시스템 (`/pos`)
- 매장에서 주문을 받고 결제를 처리하는 시스템
- 상품 카탈로그, 장바구니, 고객 관리 기능 제공

### 관리자 대시보드 (`/admin/dashboard`)
- 매출 통계 및 분석
- 상품 랭킹
- 고객 관리
- 최근 판매 내역

### 마이페이지 (`/mypage`)
- 고객 개인 구매 내역
- 캐릭터 레벨 및 경험치
- 배지 컬렉션
- 환경 기여도 (탄소 배출 감소량)

### 영수증 조회 (`/receipt/[id]`)
- 구매 영수증 디지털 조회
- 구매 상세 내역 및 환경 정보 표시

---

## 🔌 API 엔드포인트

### 인증 API

```
GET  /api/auth/kakao/login          # 카카오 로그인 시작
GET  /api/auth/kakao/callback       # 카카오 OAuth 콜백
```

### POS API

```
GET  /api/pos/products              # 상품 목록 조회
GET  /api/pos/customers             # 고객 정보 조회
POST /api/pos/customers             # 고객 정보 생성
POST /api/pos/payment               # 결제 처리
```

### 관리자 API

```
GET  /api/admin/dashboard/stats            # 대시보드 통계
GET  /api/admin/dashboard/sales-trend      # 매출 트렌드
GET  /api/admin/dashboard/product-ranking  # 상품 랭킹
GET  /api/admin/dashboard/recent-sales     # 최근 판매 내역
GET  /api/admin/products                   # 상품 목록
GET  /api/admin/products/[id]              # 상품 상세
GET  /api/admin/customers                  # 고객 목록
GET  /api/admin/customers/[id]/detail      # 고객 상세
GET  /api/admin/customers/[id]/receipts    # 고객 영수증 목록
GET  /api/admin/customers/[id]/stamps      # 고객 스탬프 정보
```

### 고객 API

```
GET  /api/customers/mypage         # 마이페이지 데이터
```

### 영수증 API

```
GET  /api/receipt/[id]             # 영수증 조회
```

### 상품 API

```
GET  /api/products/[id]            # 상품 상세
```

### 헬스체크

```
GET  /api/healthcheck              # 서버 상태 확인
```

---

## 💻 개발 가이드

### 코드 스타일

- TypeScript를 사용하며 strict 모드 활성화
- ESLint와 Prettier로 코드 포맷팅 및 린팅
- 컴포넌트는 함수형 컴포넌트 및 React Hooks 사용

### Supabase 클라이언트 사용

#### 클라이언트 사이드 (브라우저)

```typescript
import { supabaseClient } from '@/lib/supabase-client';

const { data, error } = await supabaseClient
  .from('products')
  .select('*');
```

#### 서버 사이드 (API Routes)

```typescript
import { supabaseServerClient } from '@/lib/supabase-client';

const { data, error } = await supabaseServerClient
  .from('products')
  .select('*');
```

> ⚠️ **중요**: `supabaseServerClient`는 서버 사이드에서만 사용해야 합니다. 클라이언트 번들에 포함되면 보안 위험이 있습니다.

### RLS (Row Level Security)

Supabase의 RLS 정책을 활성화하여 데이터 접근을 제한하는 것을 권장합니다:

1. Supabase 대시보드에서 각 테이블에 대해 RLS 활성화
2. 인증된 사용자별 접근 권한 정책 수립
3. Service Role Key는 서버 사이드에서만 사용 (RLS 우회)

### 새로운 페이지 추가

1. `src/app/[route]/page.tsx` 파일 생성
2. 필요시 `layout.tsx` 생성 (레이아웃 커스터마이징)
3. API 라우트가 필요한 경우 `src/app/api/[route]/route.ts` 생성

---

## 🚢 배포

### 빌드

```bash
npm run build
```

### 환경 변수 설정

프로덕션 환경에서도 `.env.local`과 동일한 환경 변수를 설정해야 합니다:

- Vercel: 프로젝트 설정 > Environment Variables
- 다른 플랫폼: 해당 플랫폼의 환경 변수 설정 방법 참조

### 배포 플랫폼

이 프로젝트는 Next.js 기반이므로 다음 플랫폼에 배포할 수 있습니다:

- **Vercel** (권장): Next.js 개발사가 제공하는 플랫폼
- **Netlify**: 정적 사이트 및 서버리스 함수 지원
- **AWS Amplify**: AWS 통합 가능
- **자체 서버**: Node.js 서버에서 실행 가능

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

<div align="center">

**Made with ❤️ for 알맹상점**

</div>