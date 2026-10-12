// Vercel 빌드 때 실행: 배포 버전 값을 version.json에 쓰고 index.html의 APP_VERSION 상수에 같은 값을 넣는다.
// 값은 커밋 SHA(VERCEL_GIT_COMMIT_SHA), 없으면 빌드 시각이다.
const fs = require('fs');

const version = (process.env.VERCEL_GIT_COMMIT_SHA ||
  new Date().toISOString().replace(/[-:.TZ]/g, '')).slice(0, 40);

fs.writeFileSync('version.json', JSON.stringify({ version }) + '\n');

const html = fs.readFileSync('index.html', 'utf8');
const re = /const APP_VERSION = '[^']*';/;
if (re.test(html)) {
  fs.writeFileSync('index.html', html.replace(re, `const APP_VERSION = '${version}';`));
  console.log(`version ${version}: version.json 작성, index.html APP_VERSION 주입`);
} else {
  console.warn('index.html에서 APP_VERSION 상수를 찾지 못했습니다. version.json만 작성했습니다.');
}
