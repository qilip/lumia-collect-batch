FROM node:14-alpine

LABEL repository https://github.com/qilip/lumia-collect-batch
LABEL maintainer qilip <qilip@qilip.io>

# 앱 디렉터리 생성
WORKDIR /usr/src/app

# Install the Doppler CLI
RUN (curl -Ls https://cli.doppler.com/install.sh || wget -qO- https://cli.doppler.com/install.sh) | sh

# 앱 의존성 설치
# 가능한 경우(npm@5+) package.json과 package-lock.json을 모두 복사하기 위해
# 와일드카드를 사용
COPY package*.json ./

RUN npm ci --only=production

# 앱 소스 추가
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
