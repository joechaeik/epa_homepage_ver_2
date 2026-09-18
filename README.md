# EPA Lab website

Google Stitch 초안을 바탕으로 만든 EPA Lab 영문 홈페이지와 한국어 관리자입니다. 현재는 로컬 검토 단계이며 외부에 배포하지 않았습니다.

- 홈페이지: http://127.0.0.1:5173/
- 관리자: http://127.0.0.1:5173/admin
- 관리자 사용법: [ADMIN_GUIDE.ko.md](ADMIN_GUIDE.ko.md)
- 원본 자료: https://epa.kentech.ac.kr/home

## 다시 실행하기

상위 폴더의 `START-WEBSITE.cmd`를 실행하고 위 주소를 여세요. 실행 창을 닫으면 서버도 종료됩니다. 이미 같은 주소에서 실행 중이면 기존 창을 사용하세요.

터미널에서 실행하려면:

```powershell
cd C:\epa_homepage_ver02\website
npm run dev -- --hostname 127.0.0.1
```

Node.js 22.13 이상이 필요합니다. 이 컴퓨터에는 의존성과 로컬 데이터베이스가 준비되어 있습니다. 새 컴퓨터에서 소스만 설치할 때는 아래 순서로 초기화합니다. **기존 데이터베이스에 초기 스키마를 다시 적용하지 마세요.**

```powershell
npm --prefix . --workspaces=false run install:ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_familiar_boom_boom.sql
npm run dev -- --hostname 127.0.0.1
```

처음 방문할 때 초기 콘텐츠만 삽입합니다. 이후 관리자에서 수정한 내용을 원본 데이터로 덮어쓰지 않습니다.

## 구현 범위

공개 페이지는 Home, Research, Publications, People, News, Join us입니다. 반응형 메뉴, 논문 검색·연도 필터·정렬·페이지 이동·BibTeX 복사, 구성원 분류, 사진 확대, 뉴스 상세 페이지를 제공합니다.

관리자는 홈 문구와 히어로 이미지·가로 위치, 소개 사진·영상 링크, 연락처를 편집합니다. 논문·뉴스·구성원·연구 분야·사진·모집 안내를 추가하고 수정할 수 있습니다. 초안 저장, 공개 반영, 공개 해제, 보관과 복원, 변경 기록, 이미지·PDF 업로드를 지원합니다. 홈 초안 미리보기는 저장된 설정과 콘텐츠로 홈 화면을 보여 줍니다.

문의 폼은 이메일 초안을 사용자의 메일 앱에서 여는 방식입니다. 서버가 이메일을 발송하거나 지원자 정보를 수집하지 않습니다.

## 초기 자료와 출처

| 자료      | 반영 범위                                         |
| --------- | ------------------------------------------------- |
| 논문      | 기존 홈에 실린 최근 논문 10편, DOI·저자·서지 정보 |
| 구성원    | 교수 1명, 연구원 7명, 대학원생 2명                |
| 소식      | 기존 공지에 근거한 영문 요약 4건, 출처 링크       |
| 사진      | 기존 사이트의 연구실 사진 6장과 구성원 사진       |
| 연구 분야 | 기존 연구 소개를 바탕으로 정리한 4개 분야         |
| 모집 안내 | 확정된 모집 공고가 없어 비어 있음                 |

전체 과거 논문을 이관한 상태는 아닙니다. Publications의 전체 아카이브 링크가 기존 사이트로 연결됩니다. 히어로는 제공된 Stitch의 콘셉트 이미지이며, 실제 연구실 사진과 구분하는 캡션을 표시합니다. 연구 소개와 뉴스 요약은 공개 전 연구실의 최종 내용 검토가 필요합니다.

원본 HTML은 `source-data/`, 정리한 초기 자료는 `source-data/imported-records.json`, 이미지 출처는 `source-data/asset-provenance.json`과 `public/images/provenance.json`에 있습니다. 초기 설정과 영문 소개는 `lib/seed.ts`에 있습니다.

## 콘텐츠 보관과 백업

관리자에서 저장한 콘텐츠와 업로드는 브라우저 저장소가 아닌 로컬 D1·R2 저장소에 남습니다. 브라우저를 닫거나 서버를 재실행해도 유지됩니다.

- `.wrangler/state/`: 현재 로컬 데이터베이스와 업로드. 삭제하지 마세요.
- `public/images/`: 가져온 초기 이미지. 프로젝트와 함께 보관하세요.
- `drizzle/`: 버전 관리하는 데이터베이스 스키마 변경 파일.
- `backups/`: 로컬 백업. 소스 저장소에는 포함되지 않습니다.

중요한 편집 후에는 서버를 종료한 상태에서 백업하세요.

```powershell
npm run backup:local
```

날짜별 폴더에 `content.sql`과 업로드 저장소 `r2/`가 생성됩니다. 사이트 코드와 `public/images/`도 함께 보관해야 합니다. 백업은 로컬 전용이며 호스팅 데이터의 백업 기능은 아닙니다. 복원 시에는 빈 로컬 저장소에 SQL을 가져오고 `r2/`를 `.wrangler/state/v3/r2/`로 복원합니다. 기존 데이터와의 충돌을 피하도록 먼저 현재 저장소를 별도 보관하세요.

## 관리자 인증과 배포 준비

로컬 개발 서버에서는 Sites의 테스트 로그인으로 관리자 기능을 확인합니다. 비밀번호를 만들 필요가 없습니다. 서버는 이 컴퓨터의 `127.0.0.1`에서만 실행하세요.

Cloudflare 검토 배포는 한 명의 관리자가 비밀번호로 로그인합니다. Worker의 런타임 Secret `EPA_ADMIN_PASSWORD`에 16자 이상의 고유한 임의 비밀번호를 설정하세요. 값이 없거나 짧으면 원격 관리자 로그인이 비활성화됩니다. 비밀번호는 GitHub나 빌드 변수에 넣지 않습니다. 개발용 계정·인증 헤더는 운영 빌드에서 신뢰하지 않습니다.

로그인은 서명된 HttpOnly/Secure/SameSite 쿠키를 사용하며 세션은 7일 뒤 만료됩니다. 비밀번호 변경은 기존 세션을 무효화합니다. 서버에서 동일 출처 요청과 로그인 빈도를 검사합니다. Cloudflare Access는 교수님 검토 링크 자체를 제한해야 할 때 별도로 설정할 수 있습니다.

배포 시 남은 설정:

1. [CLOUDFLARE_REVIEW.ko.md](CLOUDFLARE_REVIEW.ko.md)에 따라 검토용 Worker와 D1을 연결하고 런타임 Secret을 설정.
2. 로컬 편집 자료와 업로드가 있다면 별도로 이관. R2는 보류 중이며 검토 배포에서는 새 파일 업로드가 비활성화됩니다.
3. 최종 도메인·내용·이미지 검토 후 `app/layout.tsx`의 검토용 `noindex` 변경.
4. 외부 환경에서 실제 로그인과 업로드를 최종 확인한 뒤 공개.

이 단계들은 아직 실행하지 않았습니다. 현재 `.openai/hosting.json`에는 호스팅 프로젝트 ID가 없습니다.

## 개발 및 검증

Sites의 portable Vinext 기반 React·TypeScript 앱입니다. Cloudflare D1에 콘텐츠를, R2에 업로드를 저장하고, Shadcn UI로 관리 화면을 구성합니다. 입력 검증, 요청 크기 제한, 파일 형식 검증, 동일 출처 쓰기 제한, 버전 충돌 검사를 서버에서 수행합니다.

```powershell
npm run typecheck
npm run lint
npm run build
# 운영 빌드를 별도 로컬 D1에서 검증. 원격 리소스/기존 로컬 데이터는 변경하지 않음.
npm run verify:review
# 개발 서버 실행 중, 로컬 테스트용 콘텐츠를 만들고 보관하는 검증
npm run verify:flows
```

`verify:flows`는 권한·초안 분리·공개/보관/복원·충돌·파일 업로드·페이지 응답 등 21개 흐름을 검사합니다. 기존 홈 설정은 복원하지만 검증용 보관 항목과 업로드가 남으므로 실제 운영 자료와 구분해서 실행하세요. 검증 결과는 `outputs/api-verification.json`에 남습니다.

브라우저 검증에서는 데스크톱과 390px 모바일 화면, 메뉴 이동, 논문 검색·복사·페이지 이동, 관리자 사진 선택·초안 저장·파일 업로드를 확인했습니다. 운영 빌드의 공개 페이지와 개발 계정 접근 차단도 로컬에서 확인했습니다. 외부 배포 테스트는 하지 않았습니다.
