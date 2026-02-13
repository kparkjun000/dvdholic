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
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_KAKAO_CLIENT_ID` | 카카오 REST API 키 (기존 KAKAO_CLIENT_ID 값과 동일) |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_KAKAO_CLIENT_SECRET` | 카카오 Client Secret (기존 KAKAO_CLIENT_SECRET 값과 동일) |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_KAKAO_REDIRECT_URI` | `https://dvdholic.herokuapp.com/login/oauth2/code/kakao` |
| `JWT_SECRET` | JWT 서명 시크릿 (32자 이상) |
| `AES_SECRET` | AES 암호화 시크릿 |

**카카오 관련:** Circular reference 방지를 위해 위 세 개의 **긴 이름(SPRING_SECURITY_...)** 으로 설정해야 합니다.

**DB 관련:** 로컬은 Docker MySQL(`localhost`) 그대로 사용. Heroku는 아래 5절처럼 add-on 추가 후 `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` 설정.

## 5. DB 연결 (Heroku용 MySQL – 로컬 Docker와 별도)

로컬은 Docker MySQL, Heroku는 클라우드 MySQL이 필요합니다 (Heroku dyno는 로컬 `localhost`에 접속 불가).

1. **JawsDB MySQL add-on 추가** (무료 플랜 있음):
   ```bash
   heroku addons:create jawsdb:kite -a dvdholic
   ```
2. **Config Vars 확인** 후 URL에서 값 추출:
   ```bash
   heroku config -a dvdholic
   ```
   `JAWSDB_URL` 이 생김 (형식: `mysql://사용자:비밀번호@호스트:3306/DB이름`).  
   이 값에서 아래처럼 Config Vars에 **추가/수정**:
   - `DB_HOST` = 호스트 부분 (예: `xxx.mysql.rds.amazonaws.com`)
   - `DB_PORT` = `3306`
   - `DB_NAME` = DB 이름 (예: `heroku_xxxx`)
   - `DB_USERNAME` = 사용자 (로컬용 root 대신 JawsDB 사용자로 변경)
   - `DB_PASSWORD` = 비밀번호 (JawsDB 비밀번호로 변경)
3. **(필요 시)** JawsDB에서 연결이 안 되면 SSL 사용:  
   `heroku config:set DB_USE_SSL=true -a dvdholic`
4. **코드 푸시** 후 재배포: `adapter-persistence-property.yml`에 `DB_HOST`, `DB_PORT`, `DB_NAME` 반영된 버전이 Heroku에 있어야 함.  
   `git push heroku main` 후 `heroku restart -a dvdholic`

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
