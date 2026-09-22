# EPA 홈페이지 Hero·Typography 수정 결과

기존 콘텐츠, 카드, 본문 서체와 색상을 유지하면서 제목 서체를 Newsreader로 통일했습니다. Home의 섹션 이름은 News와 Lab Life로 변경했습니다.

## 관리 방법

`/admin` → **Hero·사이트 설정** → **Hero 페이지**에서 6개 페이지를 선택합니다. 제목·설명·이미지 URL·이미지 설명·가로/세로 위치를 편집할 수 있습니다. 이미지 선택·교체 및 연결 해제도 지원합니다. 초안 저장과 공개 반영은 선택한 Hero에만 적용됩니다.

연락처 영역의 **Google Map Embed URL**은 선택 항목입니다. 비워두면 기관명·주소로 지도를 표시합니다. Google Maps의 지도 퍼가기 코드에서 `src` 주소만 입력하면 그 지도로 대체됩니다. 자세한 사용법은 `ADMIN_GUIDE.ko.md`를 참고하세요.

## 데이터 보존

- DB 테이블과 마이그레이션은 변경하지 않았습니다.
- 기존 Home Hero 필드는 유지했습니다. 새 페이지별 설정은 기존 JSON 설정에 추가하며, 없는 필드에는 기본값을 적용합니다.
- 공개본과 초안을 별도로 병합하므로 Research를 공개해도 People의 초안이나 미저장 연락처를 함께 공개하지 않습니다.
- 기존 `/join-us`를 유지하면서 `/join`도 같은 페이지를 표시합니다.
- 브라우저 저장 검증에 사용한 Research 제목은 원래 값으로 복원했습니다.

## 검증

- TypeScript, ESLint, 운영 빌드 성공.
- 별도 로컬 D1에서 로그인·권한·위조 세션 거부·초안/공개 분리·동시 편집 충돌 검사 통과.
- 페이지별 Hero 초안 미리보기, 독립 공개, 이미지 제거, 지도 URL 검증, 기존 콘텐츠 레코드 보존 검사 통과.
- `npm run verify:review -- --with-r2`로 별도 로컬 R2에 이미지 업로드·원본 읽기 및 위조 파일 거부 확인. 원격 저장소에는 테스트 파일을 올리지 않았습니다.
- `/`, `/research`, `/people`, `/publications`, `/news`, `/join`, `/admin` 데스크톱 및 390px 모바일 화면 확인.
- 논문 검색·연도 필터·학술지 정렬, People 분류, News 상세, 모바일 메뉴, 관리자 초안 저장·미리보기·이미지 선택 동작 확인.
- 지도 높이는 데스크톱 440px, 모바일 320px이며 실제 KENTECH 지도 표시를 확인했습니다.

## R2 연결 상태

R2 구독이 활성화되었습니다. `epa-homepage-ver-2-media` 버킷을 생성해 Worker의 `BUCKET`으로 연결했습니다. 버킷은 Standard 등급이며 파일은 사이트의 미디어 경로로 제공합니다. 무료 제공량을 넘으면 사용료가 청구됩니다.

검토 사이트: https://epa-homepage-ver-2.joe-chaeik.workers.dev

2026-09-21 현재 로컬 콘텐츠 39건, 사이트 설정 1건, 업로드 2개, 변경 기록 36건을 비어 있던 온라인 저장소로 이관하고 배포했습니다. 온라인 7개 페이지, 관리자 로그인, 기존 업로드 원본 일치, 새 이미지 업로드·읽기를 확인했습니다. 검증용 임시 이미지는 제거했습니다. 원본 백업과 관리자 접속 정보는 Git에서 제외된 로컬 `backups/2026-09-21T04-50-03-230Z`에 있습니다.

## 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| `components/hero.tsx` | Home과 5개 내부 페이지에서 재사용하는 Hero 컴포넌트 추가. 이미지 없는 상태와 가로·세로 위치 지원. |
| `lib/heroes.ts` | 기존 Home 설정과 새 Hero 설정 변환, 페이지별 저장 범위 병합, 지도 주소 생성. |
| `lib/content-model.ts` | 페이지별 Hero·이미지 위치·지도 URL 검증 추가. 기존 설정에 기본값 적용. |
| `components/home-page.tsx` | 공통 Hero 사용, News·Lab Life 섹션 이름 변경. |
| `app/globals.css` | 제목 서체·계층, 공통 Hero 및 지도 반응형 스타일. |
| `app/research/page.tsx` | Research Hero 추가, 기존 연구 앵커·본문 유지. |
| `app/people/page.tsx` | People Hero 추가, 기존 구성원·사진 목록 유지. |
| `app/publications/page.tsx` | Publications Hero 추가, 검색·필터·정렬 유지. |
| `app/news/page.tsx` | News Hero 추가, 기존 뉴스 탐색 유지. |
| `app/join-us/page.tsx` | Join Our Lab Hero와 Location 아래 지도 추가. |
| `app/join/page.tsx` | 기존 Join 페이지에 대한 `/join` 경로 추가. |
| `components/location-map.tsx` | Google Maps iframe과 지도 열기 링크 추가. |
| `app/public.css` | 지도 추가 후 문의 양식이 불필요하게 늘어나지 않도록 배치 보정. |
| `components/admin/hero-editor.tsx` | 6개 Hero의 공통 편집·이미지 선택/제거·위치·미리보기·초안/공개 UI. |
| `components/admin/settings-editor.tsx` | Hero 편집기 재사용, 기본 설정 저장 분리, 지도 URL 편집 추가. |
| `components/admin/workspace.tsx` | 선택한 Hero 이미지 연결과 저장 처리, 다른 페이지의 미저장 편집 유지. |
| `app/admin.css` | Hero 관리자와 미리보기의 데스크톱·모바일 스타일. |
| `app/admin/preview/page.tsx` | 페이지별 인증된 Hero 초안 미리보기, 기존 Home 미리보기 유지. |
| `app/api/admin/content/route.ts` | 설정 저장 범위 검증 및 전달. |
| `lib/store.ts` | 초안·공개본을 선택한 범위만 병합해 기존 D1에 저장. |
| `scripts/verify-review.mjs` | Hero 독립 공개·지도·자료 보존·R2 업로드 회귀 검사 확장. |
| `ADMIN_GUIDE.ko.md` | Hero별 관리 및 지도 편집 사용법 갱신. |
| `HERO_UPDATE.ko.md` | 이번 변경 파일 목록·검증·R2 연결 및 배포 완료 상태 기록. |
| `wrangler.jsonc` | 실제 R2 버킷의 `BUCKET` 연결 추가. |
| `vite.config.ts` | 로컬/배포 바인딩 배열 중복 병합 방지. 로컬 저장소와 운영 저장소 분리 유지. |
| `CLOUDFLARE_REVIEW.ko.md` | R2 연결과 업로드 검증 방법 갱신. |
| `README.md` | R2 업로드 지원 상태 갱신. |
