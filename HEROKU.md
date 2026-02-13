# Heroku 배포 (dvdholic)

## 1. 사전 준비

- Heroku CLI 설치 및 `heroku login`
- 앱 이름: **dvdholic** (이미 생성했다면 생략)

## 2. Heroku 앱 생성 및 Git 연결

```bash
cd C:\Users\USER\fcss-project
heroku create dvdholic
# 또는 이미 만들었다면: heroku git:remote -a dvdholic
git remote -v   # heroku가 있는지 확인
```

## 3. 빌드 설정

Heroku에서 API jar를 만들려면 **stage** 태스크를 써야 합니다. Config Vars에 추가:

- **Key:** `GRADLE_TASK`  
- **Value:** `stage`

또는 터미널에서:

```bash
heroku config:set GRADLE_TASK=stage -a dvdholic
```

## 4. 필수 환경 변수 (Config Vars)

Heroku 대시보드 → dvdholic → Settings → Config Vars 에서 아래 추가.

| Key | 설명 |
|-----|------|
| `DB_PASSWORD` | MySQL 비밀번호 |
| `DB_USERNAME` | MySQL 사용자 (기본 root) |
| `TMDB_API_KEY` | TMDB API 키 |
| `KAKAO_CLIENT_ID` | 카카오 앱 클라이언트 ID |
| `KAKAO_CLIENT_SECRET` | 카카오 앱 시크릿 |
| `KAKAO_REDIRECT_URI` | `https://dvdholic.herokuapp.com/login/oauth2/code/kakao` |
| `JWT_SECRET` | JWT 서명 시크릿 (32자 이상) |
| `AES_SECRET` | AES 암호화 시크릿 |

DB/Redis는 Heroku add-on 사용 시 URL이 자동으로 설정되는 경우가 있음. MySQL은 ClearDB 등 add-on 추가 후 `DATABASE_URL` 또는 별도 호스트/비밀번호 변수로 설정.

## 5. DB 연결 (Heroku에서 MySQL 쓰는 경우)

- ClearDB MySQL add-on 추가: `heroku addons:create cleardb:ignite -a dvdholic`
- 추가 후 `heroku config -a dvdholic` 에서 `CLEARDB_DATABASE_URL` 확인
- Spring은 `spring.datasource.url` 등으로 연결. ClearDB URL 형식에 맞게 `jdbc-url`를 환경 변수로 넣거나, adapter-persistence에서 `DATABASE_URL` 파싱하도록 설정 가능.

로컬 MySQL을 그대로 쓰려면 Heroku Config Vars에 `DB_HOST`, `DB_PORT`, `DB_NAME` 등을 로컬/원격 DB 정보로 넣으면 됨. (보안상 프로덕션은 Heroku add-on 권장)

## 6. Redis (필요 시)

- `heroku addons:create heroku-redis:mini -a dvdholic`
- 추가 후 `REDIS_URL` 등이 설정됨. adapter-redis에서 `REDIS_HOST` / `REDIS_PORT` 또는 `REDIS_URL` 사용하도록 되어 있으면 해당 변수 설정.

## 7. 배포

```bash
cd C:\Users\USER\fcss-project
git add .
git commit -m "Heroku deploy"
git push heroku main
```

(기본 브랜치가 `master`면 `git push heroku master`)

## 8. 배포 후 확인

- 앱 URL: https://dvdholic.herokuapp.com
- 로그: `heroku logs --tail -a dvdholic`
- 카카오 로그인: developer.kakao.com Redirect URI에 `https://dvdholic.herokuapp.com/login/oauth2/code/kakao` 등록 확인

## 9. 프론트엔드 (별도 배포 시)

프론트를 Vercel/Netlify 등에 올릴 때 빌드 시 API 주소 지정:

```bash
cd netplix-frontend
REACT_APP_API_URL=https://dvdholic.herokuapp.com npm run build
```

그 다음 해당 빌드 결과물을 배포하면 됨.
