# Cloudflare 검토 사이트 설정

검토 사이트: https://epa-homepage-ver-2.joe-chaeik.workers.dev

관리자: https://epa-homepage-ver-2.joe-chaeik.workers.dev/admin

2026-09-21 로컬 콘텐츠 39건·업로드 2개를 이관하고 R2 업로드까지 온라인 검증했습니다. 이제 공유할 내용은 온라인 관리자에서 수정합니다. 관리자 비밀번호는 로컬 백업 폴더에 별도로 보관하며 저장소에 포함하지 않습니다.

## GitHub 연결 화면

| 항목 | 값 |
| --- | --- |
| 저장소 | `joechaeik/epa_homepage_ver_2` |
| 브랜치 | `main` |
| Worker 이름 | `epa-homepage-ver-2` |
| Root directory / Path | 비워두기 |
| Build command | `npm run build` |
| Deploy command | `npm run deploy:cloudflare` |

Deploy command는 이전 안내의 `npx wrangler deploy`에서 위 값으로 변경합니다. 이 명령은 검토 D1에 아직 적용하지 않은 스키마 변경을 적용한 뒤 명시적인 `wrangler.jsonc` 설정으로 배포합니다. 자동 생성된 `dist/server/wrangler.json`은 로컬 테스트용 D1/R2를 포함하므로 원격 배포에 사용하지 않습니다.

빌드 환경은 Node.js 22.13 이상이 필요합니다. 필요한 경우 **빌드 변수**에 `NODE_VERSION=22.16.0`을 지정합니다. 관리자 비밀번호는 빌드 변수가 아닙니다.

Cloudflare가 자동 생성한 빌드 API 토큰을 사용할 수 있습니다. 단, 기본 토큰의 권한에 D1이 없을 수 있으므로 My Profile → API Tokens에서 해당 빌드 토큰에 **Account → D1 → Edit** 권한을 추가해야 합니다. 이미 이 권한이 있다면 추가할 필요가 없습니다. 토큰이나 비밀번호를 GitHub/대화에 붙여 넣지 마세요.

공식 참고: [Workers Builds 설정](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## 배포 후 관리자 활성화

Worker → Settings → Variables and Secrets에서 **런타임 Secret**을 추가합니다.

- Type: Secret
- Name: `EPA_ADMIN_PASSWORD`
- Value: 비밀번호 관리자로 만든 16자 이상의 고유한 임의 비밀번호

변경을 저장·배포한 뒤 사이트 주소의 `/admin`에서 로그인하세요. 비밀번호가 아직 없으면 사이트 열람은 가능하고 관리자 쓰기는 잠겨 있습니다.

1. 논문이나 뉴스 초안을 저장하고 공개 화면에는 아직 나타나지 않는지 확인합니다.
2. 홈 초안 미리보기에서 문구·사진을 확인합니다.
3. 공개 반영 후 별도 브라우저에서 검토 링크를 새로고침합니다.

현재 설정에서 검토 링크는 주소를 아는 사람이 열 수 있습니다. `noindex`는 검색 노출 방지 요청이며 접근 제한이 아닙니다. 교수님에게만 접근을 허용하려면 Cloudflare Access를 추가해야 합니다.

## 데이터와 사진

- D1: `epa-homepage-ver-2-review` (`37834724-9c98-4fb7-bce5-4b8533497a4a`)
- R2: `epa-homepage-ver-2-media`, Worker 바인딩 이름 `BUCKET`. Standard 저장소를 사용하며 버킷 자체의 공개 접근은 비활성화합니다. 파일은 사이트의 `/api/media/:id` 경로로 제공됩니다.
- GitHub: 화면·기능 코드, 초기 콘텐츠, 포함된 사진을 보관합니다.
- 온라인 관리자 편집: D1에 저장되며 공개 반영만으로 링크에 반영됩니다.
- 로컬 관리자 편집: 이 컴퓨터의 D1에만 저장됩니다. Git push로 이관되지 않습니다.

처음 접속하면 소스에 포함된 초기 콘텐츠가 생성됩니다. 재배포해도 기존 온라인 편집 내용을 초기값으로 덮어쓰지 않습니다. 로컬에서 이미 편집한 콘텐츠나 업로드가 있다면 별도 이관 후 공유하세요.

## 로컬 운영 빌드 검증

`npm run build` 다음 `npm run verify:review -- --with-r2`를 실행합니다. 임시 비밀번호와 별도 로컬 D1·R2를 사용해 업로드까지 검사합니다. `npm run verify:review`는 R2가 없는 경우의 안내를 검사합니다. 테스트 서버는 종료 시 닫히며 원격 Cloudflare 리소스는 변경하지 않습니다.
