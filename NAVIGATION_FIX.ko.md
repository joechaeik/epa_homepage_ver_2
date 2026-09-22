# 페이지 이동 오류 수정 (2026-09-22)

## 원인과 수정

공유 사이트에서 상단 Publications를 클릭했을 때 페이지가 그대로 남는 현상을 재현했습니다. 배포된 vinext의 `next/link` 모듈이 기본 이동을 취소한 뒤 클라이언트 이동 함수를 호출하다 `TypeError: e is not a function`을 발생시켰습니다. 미리 불러오기에서도 같은 종류의 오류가 있었습니다. 페이지 주소로 직접 접속하는 것은 정상이어서 이전 HTTP 응답 검사만으로는 잡히지 않았습니다.

페이지 이동은 공통 `SiteLink`의 표준 HTML 링크로 처리하도록 변경했습니다. 페이지 전체를 불러오는 방식이며, 주소·스타일·접근성 속성·모바일 메뉴 닫기·새 탭 열기는 유지합니다. 데이터와 관리자 저장 로직은 변경하지 않았습니다.

## 변경 파일

| 파일 | 수정 내용 |
| --- | --- |
| `components/site-link.tsx` | 브라우저 기본 이동을 사용하는 공통 링크 추가. |
| `components/site-chrome.tsx` | 로고, 상단 및 모바일 메뉴에 적용. |
| `components/site-frame.tsx` | 하단 메뉴와 Join 배너에 적용. |
| `components/home-page.tsx` | 논문·구성원·뉴스 이동 버튼에 적용. |
| `app/research/page.tsx` | Related publications 4개에 적용. |
| `app/news/[id]/page.tsx` | 뉴스 목록으로 돌아가기 링크에 적용. |
| `app/admin/page.tsx` | 관리자 로그인 화면의 홈페이지 복귀에 적용. |
| `app/admin/preview/page.tsx` | 관리자 복귀 링크에 적용. |
| `components/admin/workspace.tsx` | 로고·공개 화면·미리보기 링크에 적용. |
| `app/error.tsx`, `app/not-found.tsx` | 오류 화면의 홈페이지 복귀에 적용. |

## 검증

- TypeScript, ESLint, 운영 빌드 통과.
- 운영 빌드를 로컬 Worker로 실행하여 링크를 직접 클릭하고 도착 URL과 페이지 제목 확인.
- 상단 메뉴, Home의 표시된 5개 버튼, Research의 Related publications 4개, Join 배너, 하단 메뉴·로고 확인.
- 브라우저 뒤로/앞으로 이동 및 390px 모바일 메뉴 6개 경로 확인. 가로 넘침 없음.
- 링크 이동 후 Publications 검색 동작 확인.
- 별도 테스트 DB/R2에서 관리자 로그인·초안·공개·Hero별 독립 저장·업로드·로그아웃 검사 통과.
