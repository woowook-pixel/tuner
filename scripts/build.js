// Vercel 빌드 때 실행 (vercel.json의 buildCommand).
// 1) 배포 버전을 version.json에 쓰고 index.html의 APP_VERSION 상수에 같은 값을 넣는다(값: 커밋 SHA, 없으면 빌드 시각).
// 2) design/shared/icons/apple-touch-icon.datauri.txt의 data 주소를 읽어 index.html의 apple-touch-icon 링크에 넣는다.
const fs = require('fs');
const path = require('path');

function fail(msg) { console.error('빌드 실패: ' + msg); process.exit(1); }

// ---- 1) 버전 ----
const version = (process.env.VERCEL_GIT_COMMIT_SHA ||
  new Date().toISOString().replace(/[-:.TZ]/g, '')).slice(0, 40);
fs.writeFileSync('version.json', JSON.stringify({ version }) + '\n');

let html = fs.readFileSync('index.html', 'utf8');
const verRe = /const APP_VERSION = '[^']*';/;
if (verRe.test(html)) {
  html = html.replace(verRe, `const APP_VERSION = '${version}';`);
  console.log(`version ${version}: version.json 작성, APP_VERSION 주입`);
} else {
  console.warn('index.html에서 APP_VERSION 상수를 찾지 못했습니다. version.json만 작성했습니다.');
}

// ---- 2) apple-touch-icon (data 주소를 파일에서 읽어 그대로 삽입) ----
const iconFile = path.join('design', 'shared', 'icons', 'apple-touch-icon.datauri.txt');
if (!fs.existsSync(iconFile)) {
  fail(`${iconFile} 가 없습니다. 공통 디자인 동기화(sync-shared) PR이 합쳐졌는지 확인하십시오.`);
}
const uri = fs.readFileSync(iconFile, 'utf8').trim();

// 삽입 전에 PNG가 온전한지 검사: 서명, 모든 청크 CRC, 180x180
const PREFIX = 'data:image/png;base64,';
if (!uri.startsWith(PREFIX)) fail('datauri.txt가 data:image/png;base64, 로 시작하지 않습니다.');
const raw = Buffer.from(uri.slice(PREFIX.length), 'base64');
if (!raw.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) fail('PNG 서명이 맞지 않습니다.');
const crcTable = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (buf) => { let c = -1; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
let pos = 8, width = 0, height = 0;
while (pos < raw.length) {
  const len = raw.readUInt32BE(pos);
  const type = raw.subarray(pos + 4, pos + 8);
  const body = raw.subarray(pos + 8, pos + 8 + len);
  if (crc32(Buffer.concat([type, body])) !== raw.readUInt32BE(pos + 8 + len)) fail(`PNG 청크 ${type} 의 CRC가 맞지 않습니다.`);
  if (type.toString() === 'IHDR') { width = body.readUInt32BE(0); height = body.readUInt32BE(4); }
  pos += 12 + len;
}
if (width !== 180 || height !== 180) fail(`아이콘 크기가 180x180이 아닙니다(${width}x${height}).`);

const linkRe = /<link rel="apple-touch-icon"[^>]*>/g;
if ((html.match(linkRe) || []).length !== 1) fail('index.html에 apple-touch-icon 링크가 정확히 1개가 아닙니다.');
html = html.replace(linkRe, () => `<link rel="apple-touch-icon" sizes="180x180" href="${uri}">`);
console.log(`apple-touch-icon: ${raw.length}바이트 PNG(180x180, CRC 정상)를 삽입했습니다.`);

fs.writeFileSync('index.html', html);
