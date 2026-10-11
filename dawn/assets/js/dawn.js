/* 등촌교회 2청년회 · 새생명축제 초대장 "새벽" (/dawn/)
   Light particles gather into a word, a date, an open door, a mask, a drum, a gift, a pin and a sunrise as you scroll.
   One fixed stage: the page scroll (eight snap points) only drives the morph. WebGL points, with a 2D canvas fallback. */
(function () {
  'use strict';
  var d = document.documentElement;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = r() || 1e-6, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v); }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none)').matches;
  var URL0 = 'https://prayer0420.github.io/deungchon-give-love/dawn/';

  /* ---------- toast + clipboard ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  function legacyCopy(t) {
    var ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return legacyCopy(t); });
    }
    return Promise.resolve(legacyCopy(t));
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy');
      copyText(v).then(function (ok) { toast(ok ? '주소를 복사했어요.' : '주소: ' + v); });
    });
  });

  /* ---------- share: KakaoTalk ---------- */
  /* KAKAO_KEY is the JavaScript key of the Kakao Developers app (https://prayer0420.github.io registered as the SDK and web
     domain). With no key, or if the SDK fails, the button opens the phone's share sheet (KakaoTalk is one of the choices)
     and computers copy the link. */
  var KAKAO_KEY = '';
  var KAKAO_SDK = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js';
  var KAKAO_SRI = 'sha384-oroumrnFVE0xtgqyDZJARgERibXg2C28380uaUZz2kHDS5CR7tu20eGiOU6GkTpy';
  var shareData = { title: '새생명축제에 초대합니다 · 등촌교회 2청년회', text: '11월 15일 주일 오후 2시 30분, 등촌교회 본당에서 열리는 새생명축제에 초대해요. 같이 가요!', url: URL0 };
  var shareBtn = $('#shareBtn'), kakaoWait = null;
  function kakaoReady() { return !!(window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()); }
  function loadKakao() {
    if (!KAKAO_KEY) return Promise.reject(new Error('no key'));
    if (kakaoReady()) return Promise.resolve(window.Kakao);
    if (!kakaoWait) kakaoWait = new Promise(function (done, fail) {
      var s = document.createElement('script');
      s.src = KAKAO_SDK;
      s.integrity = KAKAO_SRI;
      s.crossOrigin = 'anonymous';
      s.async = true;
      s.onload = function () {
        try { if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_KEY); done(window.Kakao); } catch (e) { fail(e); }
      };
      s.onerror = function () { kakaoWait = null; s.remove(); fail(new Error('sdk')); };
      document.head.appendChild(s);
    });
    return kakaoWait;
  }
  function warmKakao() { if (KAKAO_KEY && !kakaoReady()) loadKakao().catch(function () {}); }
  function sendKakao(K) {
    K.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '새생명축제에 초대합니다',
        description: '11월 15일 주일 오후 2:30 · 등촌교회 본당',
        imageUrl: URL0 + 'assets/img/og.jpg',
        imageWidth: 1200,
        imageHeight: 630,
        link: { mobileWebUrl: URL0, webUrl: URL0 }
      },
      buttons: [{ title: '초대장 열기', link: { mobileWebUrl: URL0, webUrl: URL0 } }]
    });
  }
  function copyShare() { copyText(URL0).then(function (ok) { toast(ok ? '링크를 복사했어요. 카카오톡 대화방에 붙여 넣어 주세요.' : URL0); }); }
  function shareSheet() {
    if (navigator.share) navigator.share(shareData).catch(function (e) { if (!e || e.name !== 'AbortError') copyShare(); });
    else copyShare();
  }
  if (shareBtn) {
    ['pointerenter', 'touchstart', 'focus'].forEach(function (ev) { shareBtn.addEventListener(ev, warmKakao, { passive: true }); });
    shareBtn.addEventListener('click', function () {
      if (kakaoReady()) { try { sendKakao(window.Kakao); } catch (e) { shareSheet(); } return; }
      if (KAKAO_KEY) loadKakao().then(sendKakao).catch(copyShare);
      else shareSheet();
    });
  }

  /* ---------- calendar ---------- */
  if (!/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
    $$('[data-gcal]').forEach(function (a) {
      a.href = a.getAttribute('data-gcal');
      a.removeAttribute('download');
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- background music ---------- */
  var bgm = $('#bgm'), bgmBtn = $('#bgmBtn');
  function setBgm(on) {
    bgmBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    bgmBtn.setAttribute('aria-label', on ? '배경음악 끄기' : '배경음악 켜기');
  }
  bgmBtn.addEventListener('click', function () {
    if (bgm.paused) {
      bgm.volume = 0.6;
      setBgm(true);
      var pr = bgm.play();
      if (pr && pr.catch) pr.catch(function () { setBgm(false); toast('음악을 재생하지 못했어요.'); });
    } else {
      bgm.pause();
      setBgm(false);
    }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !bgm.paused) { bgm.pause(); bgm.dataset.resume = '1'; }
    else if (!document.hidden && bgm.dataset.resume) { delete bgm.dataset.resume; bgm.play().catch(function () { setBgm(false); }); }
  });

  /* ---------- 갈게요 ---------- */
  var goBtn = $('#goBtn'), goTxt = $('#goTxt');
  function setGoing() {
    goBtn.classList.add('is-going');
    goBtn.querySelector('span').textContent = '11월 15일에 만나요';
    goTxt.textContent = '기다릴게요. 같이 올 사람에게도 초대장을 보내 주세요.';
  }
  try { if (window.localStorage.getItem('gl-going') === '1') setGoing(); } catch (e) { /* storage blocked */ }

  /* ---------- live countdown to 2026-11-15 14:30 KST ---------- */
  var FE_S = Date.UTC(2026, 10, 15, 5, 30, 0), FE_E = Date.UTC(2026, 10, 15, 7, 30, 0);
  var cdEl = $('#cd'), cdBox = null, cdMsg = '';
  function renderCd() {
    if (!cdEl) return;
    var now = Date.now();
    if (now < FE_S) {
      var s = Math.floor((FE_S - now) / 1000), dd = Math.floor(s / 86400); s -= dd * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      if (!cdBox) {
        cdMsg = '';
        cdEl.innerHTML = '<b data-k="d"></b><small>일</small><b data-k="h"></b><small>시간</small><b data-k="m"></b><small>분</small><b data-k="s"></b><small>초</small><span class="cd-l">남았어요</span>';
        cdBox = {};
        $$('b', cdEl).forEach(function (b) { cdBox[b.getAttribute('data-k')] = b; });
      }
      cdBox.d.textContent = String(dd); cdBox.h.textContent = pad2(h); cdBox.m.textContent = pad2(m); cdBox.s.textContent = pad2(s);
    } else {
      var msg = now < FE_E ? '지금 새생명축제가 열리고 있어요. 본당으로 오세요.' : '함께해 주셔서 고마워요. 주일 오후 2시 30분, 본당에서 또 만나요.';
      cdBox = null;
      if (cdMsg !== msg) { cdMsg = msg; cdEl.textContent = msg; }
    }
  }
  renderCd();
  setInterval(renderCd, 1000);

  /* ================= the stage ================= */
  var canvas = $('#gl'), stage = $('#stage'), track = $('#track'), bar = $('#bar'), cue = $('#cue'), fx = $('#fx');
  var themeMeta = $('#themeColor');
  var scenes = $$('.sc'), copies = scenes.map(function (s) { return $('.copy', s); });
  var S = scenes.length, LAST = S - 1;
  var KINDS = scenes.map(function (s) { return s.getAttribute('data-shape'); });
  var rail = $$('#rail button');
  var LAND = window.matchMedia('(min-aspect-ratio: 11/10)');

  function hex(h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; }
  /* night (0-5) to day (6-7): sky colours, two glows (around the shape, and the horizon), particle colour and blending */
  var LOOK = [
    { top: '#06070a', bot: '#0b0d13', g1: '#7d8fc8', g1i: 0.10, g2: '#1c2742', g2i: 0.00, pc: '#fff2df', tint: 0, over: 0, hard: 0.1, size: 1.5, alpha: 0.9, amb: 1, tilt: 0.1 },
    { top: '#06070b', bot: '#0c0f18', g1: '#7d8fc8', g1i: 0.12, g2: '#24304f', g2i: 0.20, pc: '#fff2df', tint: 0, over: 0, hard: 0.1, size: 1.5, alpha: 0.9, amb: 1, tilt: 0.1 },
    { top: '#07080d', bot: '#10131e', g1: '#ffb47c', g1i: 0.20, g2: '#2a3457', g2i: 0.26, pc: '#fff2df', tint: 0.75, over: 0, hard: 0.1, size: 1.5, alpha: 0.95, amb: 1, tilt: 0.3 },
    { top: '#080a10', bot: '#131726', g1: '#aab7e2', g1i: 0.13, g2: '#383f60', g2i: 0.32, pc: '#f4f2fb', tint: 0.2, over: 0, hard: 0.1, size: 1.5, alpha: 1, amb: 1, tilt: 0.36 },
    { top: '#090b12', bot: '#1b1b2a', g1: '#e0663e', g1i: 0.12, g2: '#4c3b48', g2i: 0.38, pc: '#fff2df', tint: 0.55, over: 0, hard: 0.1, size: 1.5, alpha: 1, amb: 1, tilt: 0.3 },
    { top: '#0c0e17', bot: '#2b2229', g1: '#ffb070', g1i: 0.15, g2: '#b2633d', g2i: 0.46, pc: '#fff2df', tint: 0.65, over: 0, hard: 0.1, size: 1.5, alpha: 1, amb: 1, tilt: 0.3 },
    { top: '#efe9df', bot: '#f3ddc3', g1: '#ffffff', g1i: 0.20, g2: '#f6b77c', g2i: 0.40, pc: '#1d1a16', tint: 1, over: 1, hard: 0.85, size: 1.02, alpha: 0.96, amb: 0.3, tilt: 0.14 },
    { top: '#f5f0e8', bot: '#f4e6d2', g1: '#ffe4c6', g1i: 0.26, g2: '#f3a868', g2i: 0.32, pc: '#e2552c', tint: 1, over: 1, hard: 0.85, size: 0.95, alpha: 0.92, amb: 0.3, tilt: 0 }
  ];
  LOOK.forEach(function (L) { ['top', 'bot', 'g1', 'g2', 'pc'].forEach(function (k) { L[k] = hex(L[k]); }); });
  var FILL = { title: 0.96, date: 0.9, door: 0.94, mask: 0.95, drum: 0.94, gift: 0.95, church: 0.96, sun: 0.98 };
  var CAP = { title: 150, date: 220, door: 430, mask: 450, drum: 340, gift: 430, church: 450, sun: 300 };
  var FALLBACK = { mask: '무언극', church: '등촌교회' };

  /* ---------- particles ---------- */
  var area = window.innerWidth * window.innerHeight;
  var N = Math.round(clamp(area / 68, 4400, 10000));
  if (touch) N = Math.min(N, 5800);
  var PX = new Float32Array(N), PY = new Float32Array(N), VX = new Float32Array(N), VY = new Float32Array(N);
  var Z = new Float32Array(N), DEL = new Float32Array(N), SW = new Float32Array(N), BR = new Float32Array(N), SZ = new Float32Array(N), AL = new Float32Array(N), GLW = new Float32Array(N);
  var F1 = new Float32Array(N), F2 = new Float32Array(N), PH = new Float32Array(N), AMB = new Uint8Array(N), DXn = new Float32Array(N), DYn = new Float32Array(N);
  var SEEDX = new Float32Array(N), SEEDY = new Float32Array(N);
  /* each particle is one point plus up to two fading copies behind it while it moves fast (light trails) */
  var BUF = new Float32Array(N * 21), DRAWN = N;
  var DELMAX = 0.36, SEED_HOLD = 0.8;
  (function () {
    var r = mulberry(20261115);
    for (var i = 0; i < N; i++) {
      Z[i] = r() * 2 - 1;
      DEL[i] = r() * DELMAX;
      SW[i] = r() * 2 - 1;
      BR[i] = 0.35 + r() * 1.1;
      var q = r(); SZ[i] = 1 + q * q * 2.4;
      AL[i] = 0.35 + r() * 0.65;
      F1[i] = 0.3 + r() * 0.9; F2[i] = 0.3 + r() * 0.9; PH[i] = r() * 6.2831853;
      AMB[i] = i % 9 === 4 ? 1 : 0;
      DXn[i] = r(); DYn[i] = r();
      SEEDX[i] = gauss(r); SEEDY[i] = gauss(r);
      if (AMB[i]) { SZ[i] *= 0.85; AL[i] *= 0.6; }
    }
  })();

  /* ---------- shapes: draw on a canvas, then sample its alpha as particle density ---------- */
  var SERIF = '"Hahmlet", "Noto Serif KR", "AppleMyungjo", serif';
  function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function textCanvas(str, weight, trackEm) {
    var size = 220, c = mk(8, 8), g = c.getContext('2d');
    g.font = weight + ' ' + size + 'px ' + SERIF;
    var chars = Array.from ? Array.from(str) : str.split('');
    var ws = chars.map(function (ch) { return g.measureText(ch).width; });
    var gap = size * trackEm, tw = gap * (chars.length - 1);
    ws.forEach(function (w) { tw += w; });
    var padX = size * 0.16, padY = size * 0.2;
    c = mk(Math.ceil(tw + padX * 2), Math.ceil(size * 1.06 + padY * 2));
    g = c.getContext('2d');
    g.font = weight + ' ' + size + 'px ' + SERIF; g.textBaseline = 'middle'; g.fillStyle = '#fff';
    g.shadowColor = 'rgba(255,255,255,0.14)'; g.shadowBlur = size * 0.1;
    var x = padX;
    chars.forEach(function (ch, k) { g.fillText(ch, x, c.height / 2 + size * 0.03); x += ws[k] + gap; });
    return c;
  }
  function doorCanvas() {
    var w = 600, h = 760, c = mk(w, h), g = c.getContext('2d');
    var x0 = 182, x1 = 418, top = 58, base = 588, r = (x1 - x0) / 2;
    function arch(dx) { g.beginPath(); g.moveTo(x0 + dx, base); g.lineTo(x0 + dx, top + r); g.arc(300, top + r, r - dx, Math.PI, 0); g.lineTo(x1 - dx, base); g.closePath(); }
    /* light inside the doorway, brightest at the floor, then spilling out of it */
    var lg = g.createLinearGradient(0, top, 0, base);
    lg.addColorStop(0, 'rgba(255,222,184,0.04)'); lg.addColorStop(0.6, 'rgba(255,212,166,0.17)'); lg.addColorStop(1, 'rgba(255,200,146,0.46)');
    arch(14); g.fillStyle = lg; g.fill();
    var fg = g.createLinearGradient(0, base, 0, h);
    fg.addColorStop(0, 'rgba(255,196,134,0.36)'); fg.addColorStop(1, 'rgba(255,196,134,0)');
    g.beginPath(); g.moveTo(x0 + 8, base); g.lineTo(x1 - 8, base); g.lineTo(x1 + 176, h); g.lineTo(x0 - 176, h); g.closePath(); g.fillStyle = fg; g.fill();
    g.lineCap = 'round';
    [-150, -70, 0, 70, 150].forEach(function (dx) { g.beginPath(); g.moveTo(300 + dx * 0.25, base + 8); g.lineTo(300 + dx * 1.35, h - 14); g.lineWidth = 3; g.strokeStyle = 'rgba(255,214,168,0.42)'; g.stroke(); });
    /* the door leaf, swung open toward us */
    g.beginPath(); g.moveTo(x0, top + r * 0.3); g.quadraticCurveTo(x0 - 66, top + r * 0.5, x0 - 108, top + r + 34); g.lineTo(x0 - 108, base + 50); g.lineTo(x0, base); g.closePath();
    g.fillStyle = 'rgba(255,243,226,0.06)'; g.fill(); g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = 'rgba(255,243,226,0.85)'; g.stroke();
    arch(0); g.lineWidth = 12; g.strokeStyle = 'rgba(255,246,232,1)'; g.stroke();
    arch(20); g.lineWidth = 3; g.strokeStyle = 'rgba(255,246,232,0.55)'; g.stroke();
    g.beginPath(); g.moveTo(x0 - 64, base); g.lineTo(x1 + 64, base); g.lineWidth = 5; g.strokeStyle = 'rgba(255,246,232,0.95)'; g.stroke();
    return c;
  }
  function drumCanvas() {
    var w = 640, h = 520, c = mk(w, h), g = c.getContext('2d');
    var cx = 320, top = 200, bot = 412, rx = 250, ry = 72, k, th;
    g.lineCap = 'round'; g.lineJoin = 'round';
    /* red shell, then the head, then the chrome hardware on top */
    g.beginPath(); g.moveTo(cx - rx, top); g.lineTo(cx - rx, bot); g.ellipse(cx, bot, rx, ry, 0, Math.PI, 0, true); g.lineTo(cx + rx, top); g.ellipse(cx, top, rx, ry, 0, 0, Math.PI, false); g.closePath();
    g.fillStyle = 'rgba(214,56,42,0.24)'; g.fill();
    g.beginPath(); g.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(255,244,226,0.14)'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,1)';
    g.beginPath(); g.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2); g.lineWidth = 10; g.stroke();
    g.beginPath(); g.ellipse(cx, top + 16, rx, ry, 0, 0, Math.PI, false); g.lineWidth = 5; g.globalAlpha = 0.8; g.stroke();
    g.beginPath(); g.ellipse(cx, bot - 16, rx, ry, 0, 0, Math.PI, false); g.lineWidth = 4; g.globalAlpha = 0.7; g.stroke();
    g.globalAlpha = 1;
    g.beginPath(); g.ellipse(cx, bot, rx, ry, 0, 0, Math.PI, false); g.lineWidth = 9; g.stroke();
    g.beginPath(); g.moveTo(cx - rx, top); g.lineTo(cx - rx, bot); g.moveTo(cx + rx, top); g.lineTo(cx + rx, bot); g.lineWidth = 6; g.stroke();
    for (k = 0; k < 6; k++) {
      th = Math.PI * (0.12 + k * 0.152);
      var lx = cx + rx * Math.cos(th), yt = top + ry * Math.sin(th) + 18, yb = bot + ry * Math.sin(th) - 18, ym = (yt + yb) / 2;
      g.beginPath(); g.moveTo(lx, yt); g.lineTo(lx, yb); g.lineWidth = 3; g.globalAlpha = 0.75; g.stroke();
      g.beginPath(); g.moveTo(lx, ym - 24); g.lineTo(lx, ym + 24); g.lineWidth = 13; g.globalAlpha = 1; g.stroke();
    }
    g.strokeStyle = 'rgba(242,202,146,1)'; g.fillStyle = 'rgba(242,202,146,1)'; g.lineWidth = 13;
    [[cx - 196, top - 128, cx + 150, top + 26], [cx + 204, top - 118, cx - 160, top + 30]].forEach(function (s) {
      g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(s[2], s[3]); g.stroke();
      g.beginPath(); g.arc(s[2], s[3], 11, 0, Math.PI * 2); g.fill();
    });
    return c;
  }
  /* 웰컴키트: a gift box with a lid and a red ribbon tied in a bow, seen a little from above */
  function giftCanvas() {
    var c = mk(420, 430), g = c.getContext('2d');
    var DX = 70, DY = -50, rw = 22;
    var bx0 = 120, bx1 = 400, by1 = 560, lx0 = 108, lx1 = 412, ly0 = 288, ly1 = 340, cx = 260;
    function poly(pts) { g.beginPath(); pts.forEach(function (q, k) { if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.closePath(); }
    function L(u) { return [lx0 + DX * u, ly0 + DY * u]; }
    function R(u) { return [lx1 + DX * u, ly0 + DY * u]; }
    g.translate(-88, -158);
    g.lineJoin = 'round'; g.lineCap = 'round';
    /* faces: front, side (darker), lid top */
    poly([[bx0, ly1], [bx1, ly1], [bx1, by1], [bx0, by1]]); g.fillStyle = 'rgba(244,226,196,0.07)'; g.fill();
    poly([[bx1, ly1 + DY * 0.24], [bx1 + DX, ly1 + DY], [bx1 + DX, by1 + DY], [bx1, by1]]); g.fillStyle = 'rgba(244,226,196,0.15)'; g.fill();
    poly([L(0), L(1), R(1), R(0)]); g.fillStyle = 'rgba(244,226,196,0.09)'; g.fill();
    poly([[lx0, ly0], [lx1, ly0], [lx1, ly1], [lx0, ly1]]); g.fillStyle = 'rgba(244,226,196,0.1)'; g.fill();
    poly([R(0), R(1), [lx1 + DX, ly1 + DY], [lx1, ly1]]); g.fillStyle = 'rgba(244,226,196,0.18)'; g.fill();
    /* ribbon: down the front, across the lid both ways, down the side */
    g.fillStyle = 'rgba(232,66,48,0.6)';
    poly([[cx - rw, ly0], [cx + rw, ly0], [cx + rw, by1], [cx - rw, by1]]); g.fill();
    poly([[cx - rw, ly0], [cx + rw, ly0], [cx + rw + DX, ly0 + DY], [cx - rw + DX, ly0 + DY]]); g.fill();
    poly([L(0.36), R(0.36), R(0.64), L(0.64)]); g.fill();
    poly([R(0.36), R(0.64), [lx1 + DX * 0.64, ly1 + DY * 0.64], [lx1 + DX * 0.36, ly1 + DY * 0.36]]); g.fill();
    poly([[bx1 + DX * 0.36, ly1 + DY * 0.36], [bx1 + DX * 0.64, ly1 + DY * 0.64], [bx1 + DX * 0.64, by1 + DY * 0.64], [bx1 + DX * 0.36, by1 + DY * 0.36]]); g.fill();
    /* box edges */
    g.strokeStyle = 'rgba(244,226,196,1)'; g.lineWidth = 9;
    poly([L(0), L(1), R(1), R(0)]); g.stroke();
    poly([[lx0, ly0], [lx1, ly0], [lx1, ly1], [lx0, ly1]]); g.stroke();
    poly([R(0), R(1), [lx1 + DX, ly1 + DY], [lx1, ly1]]); g.stroke();
    g.beginPath(); g.moveTo(bx0, ly1); g.lineTo(bx0, by1); g.lineTo(bx1, by1); g.lineTo(bx1 + DX, by1 + DY); g.lineTo(bx1 + DX, ly1 + DY + 2); g.moveTo(bx1, ly1); g.lineTo(bx1, by1); g.stroke();
    g.strokeStyle = 'rgba(232,66,48,1)'; g.lineWidth = 4;
    [[cx - rw, ly0, cx - rw, by1], [cx + rw, ly0, cx + rw, by1]].forEach(function (q) { g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[2], q[3]); g.stroke(); });
    /* the bow: two loops, two tails, a knot */
    var kx = cx + DX * 0.5, ky = ly0 + DY * 0.5;
    g.fillStyle = 'rgba(232,66,48,0.5)'; g.strokeStyle = 'rgba(236,74,54,1)'; g.lineWidth = 7;
    [-1, 1].forEach(function (sd) {
      g.beginPath(); g.moveTo(kx, ky - 4);
      g.bezierCurveTo(kx + sd * 45, ky - 92, kx + sd * 138, ky - 96, kx + sd * 124, ky - 30);
      g.bezierCurveTo(kx + sd * 114, ky + 10, kx + sd * 42, ky + 12, kx, ky + 2);
      g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(kx + sd * 6, ky - 6); g.quadraticCurveTo(kx + sd * 64, ky - 54, kx + sd * 104, ky - 30); g.lineWidth = 3; g.stroke(); g.lineWidth = 7;
      g.beginPath(); g.moveTo(kx - sd * 2, ky + 8); g.lineTo(kx + sd * 52, ky + 76); g.lineTo(kx + sd * 32, ky + 72); g.lineTo(kx + sd * 26, ky + 92); g.lineTo(kx + sd * 10, ky + 10); g.closePath(); g.fill(); g.stroke();
    });
    g.beginPath(); g.ellipse(kx, ky, 21, 16, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(236,74,54,0.95)'; g.fill(); g.stroke();
    return c;
  }
  function sunCanvas() {
    var w = 900, h = 470, c = mk(w, h), g = c.getContext('2d');
    var cx = 450, cy = 452, R = 292;
    g.save(); g.beginPath(); g.rect(0, 0, w, cy - 6); g.clip();
    for (var i = 0; i <= 16; i++) {
      var an = Math.PI + (i / 16) * Math.PI;
      g.beginPath(); g.moveTo(cx + Math.cos(an) * (R + 30), cy + Math.sin(an) * (R + 30)); g.lineTo(cx + Math.cos(an) * (R + 96), cy + Math.sin(an) * (R + 96));
      g.lineWidth = 6; g.lineCap = 'round'; g.strokeStyle = 'rgba(238,140,62,0.75)'; g.stroke();
    }
    var rg = g.createRadialGradient(cx, cy, 0, cx, cy, R);
    rg.addColorStop(0, 'rgba(222,74,36,1)'); rg.addColorStop(0.7, 'rgba(230,100,46,0.86)'); rg.addColorStop(1, 'rgba(240,148,66,0.6)');
    g.beginPath(); g.arc(cx, cy, R, Math.PI, 0); g.closePath(); g.fillStyle = rg; g.fill();
    g.restore();
    g.fillStyle = 'rgba(30,26,22,1)'; g.fillRect(24, cy - 2, w - 48, 4);
    return c;
  }
  function loadImg(src) { return new Promise(function (ok, no) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = no; im.src = src; }); }
  function imgCanvas(im) { var c = mk(im.naturalWidth, im.naturalHeight); c.getContext('2d').drawImage(im, 0, 0); return c; }
  function sample(c, n, r) {
    var w = c.width, h = c.height, data = c.getContext('2d').getImageData(0, 0, w, h).data;
    var cdf = new Float32Array(w * h), acc = 0, i, k;
    for (i = 0; i < w * h; i++) { acc += data[i * 4 + 3]; cdf[i] = acc; }
    if (acc <= 0) throw new Error('empty shape');
    var pts = new Float32Array(n * 2), col = new Float32Array(n * 3), ang = new Float32Array(n), idx = new Array(n);
    for (k = 0; k < n; k++) {
      var t = r() * acc, lo = 0, hi = w * h - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (cdf[mid] < t) lo = mid + 1; else hi = mid; }
      var x = lo % w, y = (lo / w) | 0, o = lo * 4;
      pts[k * 2] = (x + r() - w / 2) / h; pts[k * 2 + 1] = (y + r() - h / 2) / h;
      col[k * 3] = data[o] / 255; col[k * 3 + 1] = data[o + 1] / 255; col[k * 3 + 2] = data[o + 2] / 255;
      ang[k] = Math.atan2(pts[k * 2 + 1], pts[k * 2]); idx[k] = k;
    }
    /* sort by angle so particle i lands in the same direction in every shape: the morphs flow instead of criss-crossing */
    idx.sort(function (a, b) { return ang[a] - ang[b]; });
    var P = new Float32Array(n * 2), C = new Float32Array(n * 3);
    for (k = 0; k < n; k++) { var s = idx[k]; P[k * 2] = pts[s * 2]; P[k * 2 + 1] = pts[s * 2 + 1]; C[k * 3] = col[s * 3]; C[k * 3 + 1] = col[s * 3 + 1]; C[k * 3 + 2] = col[s * 3 + 2]; }
    return { p: P, c: C, asp: w / h };
  }

  var SH = new Array(S), SX = [], SY = [], BOX = new Array(S), ready = false;
  for (var s0 = 0; s0 < S; s0++) { SX.push(new Float32Array(N)); SY.push(new Float32Array(N)); }
  function buildShapes() {
    var fontP = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('700 100px Hahmlet', '새생명축제'), document.fonts.load('700 100px Hahmlet', '11.15')]).catch(function () {}) : Promise.resolve();
    var fontsReady = Promise.race([fontP, new Promise(function (ok) { setTimeout(ok, 2500); })]);
    var maps = ['mask', 'church'].map(function (k) { return loadImg('assets/img/map-' + k + '.webp?v=2').then(imgCanvas).catch(function () { return null; }); });
    return Promise.all([fontsReady].concat(maps)).then(function (res) {
      var M0 = { mask: res[1], church: res[2] }, r = mulberry(7);
      KINDS.forEach(function (k, s) {
        var c;
        if (k === 'title') c = textCanvas('새생명축제', 700, -0.03);
        else if (k === 'date') c = textCanvas('11.15', 700, -0.01);
        else if (k === 'door') c = doorCanvas();
        else if (k === 'drum') c = drumCanvas();
        else if (k === 'gift') c = giftCanvas();
        else if (k === 'sun') c = sunCanvas();
        else c = M0[k] || textCanvas(FALLBACK[k] || '빛', 700, 0);
        try { SH[s] = sample(c, N, r); } catch (e) { SH[s] = sample(textCanvas(FALLBACK[k] || '빛', 700, 0), N, r); }
      });
      ready = true;
      layout();
    });
  }

  /* ---------- layout: the shape fills the space the words leave ---------- */
  var Wd = window.innerWidth, Ht = window.innerHeight, cw = Wd, ch = Ht, dpr = 1;
  function sizeCanvas() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = r.width || Wd; ch = r.height || Ht;
    var w = Math.round(cw * dpr), h = Math.round(ch * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }
  function layout() {
    Wd = stage.clientWidth || window.innerWidth; Ht = stage.clientHeight || window.innerHeight;
    sizeCanvas();
    if (!ready) return;
    d.classList.add('measure');
    var rects = copies.map(function (c) { return c.getBoundingClientRect(); });
    var barB = bar.getBoundingClientRect().bottom, cueT = cue.getBoundingClientRect().top;
    var railL = rail.length ? rail[0].getBoundingClientRect().left : Wd;
    d.classList.remove('measure');
    var land = LAND.matches, pad = clamp(Wd * 0.058, 18, 72), gap = clamp(Math.min(Wd, Ht) * 0.04, 16, 40);
    /* keep the particle density close to what a phone shows: big screens get more particles, not thinner shapes */
    var dens = Math.sqrt(N / 5000);
    for (var s = 0; s < S; s++) {
      var r = rects[s], x0, x1, y0, y1;
      var side = land && r.right < Wd * 0.66;
      if (!side) { x0 = pad; x1 = Wd - pad; y0 = barB + gap * 0.5; y1 = r.top - gap; }
      else { x0 = r.right + gap * 1.5; x1 = Math.min(railL, Wd - pad) - gap * 0.5; y0 = barB + gap * 0.4; y1 = cueT - gap * 0.4; }
      if (y1 - y0 < 90) { y0 = barB + 6; y1 = Math.max(y0 + 90, r.top - 6); }
      if (x1 - x0 < 90) { x0 = pad; x1 = Wd - pad; }
      var sh = SH[s], k = KINDS[s];
      var sc = Math.min(Math.min((x1 - x0) / sh.asp, y1 - y0) * (FILL[k] || 0.9), (CAP[k] || 420) * dens);
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      if (k === 'sun') cy = y1 - sc / 2;
      BOX[s] = { cx: cx, cy: cy, sc: sc, w: sc * sh.asp, h: sc, x0: x0, x1: x1, y0: y0, y1: y1 };
      var P = sh.p, X = SX[s], Y = SY[s];
      for (var i = 0; i < N; i++) { X[i] = cx + P[i * 2] * sc; Y[i] = cy + P[i * 2 + 1] * sc; }
    }
  }

  /* ---------- renderer ---------- */
  var gl = null, g2 = null, bgProg, ptProg, bgBuf, ptBuf, U = {};
  function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function program(vs, fs, attrs) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    attrs.forEach(function (a, i) { gl.bindAttribLocation(p, i, a); });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  function initGL() {
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
      if (!gl) return false;
      bgProg = program('attribute vec2 aV;void main(){gl_Position=vec4(aV,0.,1.);}',
        ['precision mediump float;',
          'uniform vec2 uRes;uniform vec3 uTop,uBot,uG1c,uG2c,uG1;',
          'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
          'void main(){vec2 f=gl_FragCoord.xy;float y=1.-f.y/uRes.y;',
          'vec3 c=mix(uTop,uBot,smoothstep(0.,1.,y));',
          'vec2 q=(f-uG1.xy)/uG1.z;c+=uG1c*exp(-dot(q,q)*1.8);',
          'vec2 q2=vec2((f.x-uRes.x*.5)/(uRes.x*.9),(f.y+uRes.y*.14)/(uRes.y*.62));c+=uG2c*exp(-dot(q2,q2)*1.3);',
          'c+=(h(f)-.5)/255.;gl_FragColor=vec4(c,1.);}'].join('\n'), ['aV']);
      ptProg = program(['attribute vec2 aP;attribute float aS;attribute vec4 aC;uniform vec2 uRes;uniform float uDpr;varying vec4 vC;',
        'void main(){vec2 c=aP/uRes*2.-1.;gl_Position=vec4(c.x,-c.y,0.,1.);gl_PointSize=aS*uDpr;vC=aC;}'].join('\n'),
        ['precision mediump float;varying vec4 vC;uniform float uHard,uOver;',
          'void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;',
          'float a=mix(pow(1.-r,1.7),1.-smoothstep(.6,1.,r),uHard)*vC.a;gl_FragColor=vec4(vC.rgb*a,a*uOver);}'].join('\n'), ['aP', 'aS', 'aC']);
      ['uRes', 'uTop', 'uBot', 'uG1c', 'uG2c', 'uG1'].forEach(function (k) { U['bg' + k] = gl.getUniformLocation(bgProg, k); });
      ['uRes', 'uDpr', 'uHard', 'uOver'].forEach(function (k) { U['pt' + k] = gl.getUniformLocation(ptProg, k); });
      bgBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      ptBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf); gl.bufferData(gl.ARRAY_BUFFER, BUF.byteLength, gl.DYNAMIC_DRAW);
      canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); gl = null; d.classList.add('nogl'); });
      return true;
    } catch (e) { gl = null; return false; }
  }
  function renderGL(L) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.BLEND);
    gl.useProgram(bgProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf);
    gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(U.bguRes, canvas.width, canvas.height);
    gl.uniform3fv(U.bguTop, L.top); gl.uniform3fv(U.bguBot, L.bot);
    gl.uniform3f(U.bguG1c, L.g1[0] * L.g1i, L.g1[1] * L.g1i, L.g1[2] * L.g1i);
    gl.uniform3f(U.bguG2c, L.g2[0] * L.g2i, L.g2[1] * L.g2i, L.g2[2] * L.g2i);
    gl.uniform3f(U.bguG1, L.gx * dpr, (ch - L.gy) * dpr, Math.max(60, L.gr) * dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(ptProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, BUF.subarray(0, DRAWN * 7));
    gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 28, 0);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 28, 8);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 28, 12);
    gl.uniform2f(U.ptuRes, cw, ch); gl.uniform1f(U.ptuDpr, dpr);
    gl.uniform1f(U.ptuHard, L.hard); gl.uniform1f(U.ptuOver, L.over);
    gl.drawArrays(gl.POINTS, 0, DRAWN);
  }
  function rgb(c, a) { return 'rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + (a === undefined ? 1 : a) + ')'; }
  var N2 = Math.min(N, 2600);
  function render2D(L) {
    var g = g2;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    var grd = g.createLinearGradient(0, 0, 0, ch); grd.addColorStop(0, rgb(L.top)); grd.addColorStop(1, rgb(L.bot));
    g.fillStyle = grd; g.fillRect(0, 0, cw, ch);
    g.globalCompositeOperation = L.over < 0.5 ? 'lighter' : 'source-over';
    g.fillStyle = rgb(L.pc);
    var stp = N / N2;
    for (var k = 0; k < N2; k++) {
      var o = Math.floor(k * stp) * 7, s = Math.max(1, BUF[o + 2] * (L.over < 0.5 ? 0.6 : 0.8));
      g.globalAlpha = BUF[o + 6] * 0.9;
      g.fillRect(BUF[o] - s / 2, BUF[o + 1] - s / 2, s, s);
    }
    g.globalAlpha = 1;
  }

  /* ---------- motion ---------- */
  var time = 0, last = 0, p = 0, pRaw = 0, pv = 0, dirSign = 1, introT = calm ? 9 : 0, burst = calm, beat = 0, punch = 0, SPD = 0;
  var ptr = { x: -1e4, y: -1e4, on: false, nx: 0.5, ny: 0.5, sx: 0.5, sy: 0.5, dvx: 0, dvy: 0, lx: null, ly: null };
  var gyro = null, gyroS = { x: 0, y: 0 };
  var M = [{}, {}], TX = 0, TY = 0, TS = 1;
  var LM = { top: [0, 0, 0], bot: [0, 0, 0], g1: [0, 0, 0], g2: [0, 0, 0], pc: [0, 0, 0] };
  function mixLook(a, b, e) {
    var A = LOOK[a], B = LOOK[b];
    ['top', 'bot', 'g1', 'g2', 'pc'].forEach(function (k) { for (var j = 0; j < 3; j++) LM[k][j] = lerp(A[k][j], B[k][j], e); });
    ['g1i', 'g2i', 'tint', 'over', 'hard', 'size', 'alpha', 'amb'].forEach(function (k) { LM[k] = lerp(A[k], B[k], e); });
    var BA = BOX[a], BB = BOX[b];
    if (BA && BB) { LM.gx = lerp(BA.cx, BB.cx, e); LM.gy = lerp(BA.cy, BB.cy, e); LM.gr = lerp(BA.sc, BB.sc, e) * 0.85; }
    else { LM.gx = Wd / 2; LM.gy = Ht * 0.4; LM.gr = Math.min(Wd, Ht) * 0.4; }
    return LM;
  }
  function modFor(s, m) {
    var B = BOX[s], L = LOOK[s], k = KINDS[s];
    m.cx = B.cx; m.cy = B.cy; m.scale = 1; m.dy = 0;
    var amt = calm ? 0 : L.tilt, ax, ay;
    if (touch) {
      ax = gyro ? gyroS.x * 0.9 : (ptr.sx - 0.5) * 0.6;
      ay = gyro ? gyroS.y * 0.5 : 0;
    } else { ax = (ptr.sx - 0.5) * 1.15; ay = (ptr.sy - 0.5) * 0.6; }
    var th = ax * amt, ph = -ay * amt * 0.7;
    m.ct = Math.cos(th); m.st = Math.sin(th); m.cp = Math.cos(ph); m.sp = Math.sin(ph);
    m.depth = B.sc * 0.17;
    if (!calm) {
      if (k === 'drum') m.scale = 1 + 0.03 * beat + 0.08 * punch;
      else if (k === 'sun') m.scale = 1 + 0.05 * punch;
      else if (k === 'title') m.scale = 1 + Math.sin(time * 0.7) * 0.006;
    }
  }
  function project(m, x, y, z) {
    var X = (x - m.cx) * m.scale, Y = (y - m.cy) * m.scale, Zd = z * m.depth;
    var x1 = X * m.ct + Zd * m.st, z1 = -X * m.st + Zd * m.ct;
    var y1 = Y * m.cp - z1 * m.sp, z2 = Y * m.sp + z1 * m.cp;
    var f = 900 / (900 + z2);
    TX = m.cx + x1 * f; TY = m.cy + m.dy + y1 * f; TS = f;
  }
  function step(dt) {
    var f = Math.min(dt * 60, 3);
    var a = Math.floor(p), b = a + 1, t = p - a;
    if (b > LAST) { a = b = LAST; t = 0; }
    var L = mixLook(a, b, smooth(0.2, 0.8, t));
    var seed = !ready || introT < SEED_HOLD;
    if (!seed) { modFor(a, M[0]); modFor(b, M[1]); }
    var md = Math.min(Wd, Ht), night = L.over < 0.5;
    var damp = Math.pow(0.845, f), kk = 0.068 * f;
    /* in flight: a curved path whose turn follows the scroll direction, plus a burst away from the middle */
    var swAmp = calm ? 0 : 0.42 * dirSign, bAmp = calm ? 0 : md * 0.2;
    var bcx = seed ? 0 : (M[0].cx + M[1].cx) / 2, bcy = seed ? 0 : (M[0].cy + M[1].cy) / 2;
    /* only the cover breathes (a slow flowing field and a light sweep); every other scene holds its shape still */
    var w0 = calm ? 0 : 1 - smooth(0.04, 0.55, p);
    var flowA = 2.6 * w0, jit = calm ? 0 : 0.22 + 0.23 * w0;
    var restK = calm || seed ? 0 : 1 - smooth(0.03, 0.18, Math.min(t, 1 - t));
    var wb = BOX[0];
    var wPos = ((time % 3.6) / 3.6) * 1.5 - 0.25, wx0 = wb ? wb.cx - wb.w / 2 : 0, wW = wb ? Math.max(40, wb.w) : Wd;
    var wAmp = restK * 6 * w0, spd = 0;
    var pr = clamp(md * 0.2, 80, 200), pr2 = pr * pr, rep = touch ? 2.2 : 1.6, swr = 1.4, drag = 0.15;
    var pon = ptr.on && !calm && burst;
    var gd = Math.pow(0.9, f);
    var Ax = SX[a], Ay = SY[a], Bx = SX[b], By = SY[b];
    var CA = SH[a] ? SH[a].c : null, CB = SH[b] ? SH[b].c : null;
    var scx = BOX[0] ? BOX[0].cx : Wd / 2, scy = BOX[0] ? BOX[0].cy : Ht * 0.4;
    var rr = 3 + Math.min(introT, SEED_HOLD) * 18;
    var pcR = L.pc[0], pcG = L.pc[1], pcB = L.pc[2], tint = L.tint;
    var szF = L.size, alF = L.alpha * (calm ? 1 : smooth(0, 0.5, introT)), ambA = L.amb * 0.55;
    var fadeCalm = calm && a !== b ? Math.abs(t * 2 - 1) : 1;
    var M0 = M[0], M1 = M[1], go = N * 7, G = 0, trails = !calm;
    for (var i = 0, o = 0; i < N; i++, o += 7) {
      var tx, ty, ts = 1, cr = pcR, cg = pcG, cb = pcB, amb = !seed && AMB[i];
      if (seed) {
        tx = scx + SEEDX[i] * rr; ty = scy + SEEDY[i] * rr;
      } else if (amb) {
        /* dust: drifts up and moves past at its own depth as you scroll (parallax) */
        tx = DXn[i] * Wd + Math.sin(time * F1[i] * 0.25 + PH[i]) * 24;
        ty = DYn[i] * Ht - time * (3 + F2[i] * 6) - p * Ht * (0.3 + 0.22 * (Z[i] + 1));
        ty = (ty % Ht + Ht) % Ht;
      } else {
        var ti = (t - DEL[i]) / (1 - DELMAX); ti = ti < 0 ? 0 : ti > 1 ? 1 : ti;
        var ei = calm ? (t < 0.5 ? 0 : 1) : ti * ti * (3 - 2 * ti);
        project(M0, Ax[i], Ay[i], Z[i]); var ax = TX, ay = TY, as = TS;
        project(M1, Bx[i], By[i], Z[i]);
        tx = ax + (TX - ax) * ei; ty = ay + (TY - ay) * ei; ts = as + (TS - as) * ei;
        if (swAmp && ei > 0 && ei < 1) {
          var sn = Math.sin(3.1415927 * ei), sw = sn * SW[i] * swAmp;
          tx -= (TY - ay) * sw; ty += (TX - ax) * sw;
          var ox = tx - bcx, oy = ty - bcy, ol = Math.sqrt(ox * ox + oy * oy) + 1, bb = sn * bAmp * BR[i];
          tx += ox / ol * bb; ty += oy / ol * bb;
        }
        if (wAmp > 0.01) {
          var wd = (tx - wx0) / wW - wPos;
          if (wd > -0.07 && wd < 0.07) { var wa = 1 - (wd < 0 ? -wd : wd) / 0.07; ty -= wa * wAmp; var wg = wa * 0.55 * restK; if (wg > GLW[i]) GLW[i] = wg; }
        }
        var c3 = i * 3;
        cr += (CA[c3] + (CB[c3] - CA[c3]) * ei - pcR) * tint;
        cg += (CA[c3 + 1] + (CB[c3 + 1] - CA[c3 + 1]) * ei - pcG) * tint;
        cb += (CA[c3 + 2] + (CB[c3 + 2] - CA[c3 + 2]) * ei - pcB) * tint;
      }
      if (!amb && !calm) {
        if (flowA > 0.02) { tx += Math.sin(ty * 0.017 + time * 1.3 + PH[i] * 0.3) * flowA; ty += Math.cos(tx * 0.015 + time * 1.1 + PH[i] * 0.3) * flowA; }
        tx += Math.sin(time * F1[i] + PH[i]) * jit; ty += Math.cos(time * F2[i] + PH[i]) * jit;
      }
      var x = PX[i], y = PY[i], vx = VX[i], vy = VY[i];
      if (calm) { x = tx; y = ty; vx = 0; vy = 0; }
      else if (amb) {
        vx = (tx - x) / f; vy = (ty - y) / f;
        if (vy > Ht * 0.3 || vy < -Ht * 0.3) { vx = 0; vy = 0; }
        x = tx; y = ty;
      } else {
        vx += (tx - x) * kk; vy += (ty - y) * kk;
        if (pon) {
          /* the pointer pushes light away, stirs it round, and drags it along when it moves */
          var qx = x - ptr.x, qy = y - ptr.y, q2 = qx * qx + qy * qy;
          if (q2 < pr2) {
            var q = Math.sqrt(q2) + 0.5, fo = 1 - q / pr, f2 = fo * fo * f;
            if (fo > GLW[i]) GLW[i] = fo;
            vx += (qx * rep - qy * swr) / q * f2 + ptr.dvx * fo * drag * f;
            vy += (qy * rep + qx * swr) / q * f2 + ptr.dvy * fo * drag * f;
          }
        }
        vx *= damp; vy *= damp; x += vx * f; y += vy * f;
      }
      PX[i] = x; PY[i] = y; VX[i] = vx; VY[i] = vy;
      if (!amb) spd += (vx < 0 ? -vx : vx) + (vy < 0 ? -vy : vy);
      var gw = GLW[i] *= gd;
      var al = AL[i] * alF * (amb ? ambA : 1) * (1 + gw * 1.4) * fadeCalm;
      if (night && !calm) al *= 0.78 + 0.22 * Math.sin(time * F1[i] * 2.6 + PH[i]);
      if (al > 1) al = 1;
      var sz = SZ[i] * szF * ts * (1 + gw * 0.7);
      BUF[o] = x; BUF[o + 1] = y; BUF[o + 2] = sz; BUF[o + 3] = cr; BUF[o + 4] = cg; BUF[o + 5] = cb; BUF[o + 6] = al;
      if (trails) {
        var sp2 = vx * vx + vy * vy;
        if (sp2 > 1.6) {
          var sk = sp2 > 144 ? 1 : (Math.sqrt(sp2) - 1.26) / 10.74;
          BUF[go] = x - vx * 1.3; BUF[go + 1] = y - vy * 1.3; BUF[go + 2] = sz * 0.85; BUF[go + 3] = cr; BUF[go + 4] = cg; BUF[go + 5] = cb; BUF[go + 6] = al * 0.5 * sk;
          BUF[go + 7] = x - vx * 2.6; BUF[go + 8] = y - vy * 2.6; BUF[go + 9] = sz * 0.7; BUF[go + 10] = cr; BUF[go + 11] = cg; BUF[go + 12] = cb; BUF[go + 13] = al * 0.26 * sk;
          go += 14; G += 2;
        }
      }
    }
    DRAWN = N + G;
    SPD = spd / N;
    return L;
  }
  function doBurst() {
    burst = true;
    if (calm) return;
    var r = mulberry(99);
    for (var i = 0; i < N; i++) {
      var an = Math.atan2(SEEDY[i], SEEDX[i]) + (r() - 0.5) * 0.7, sp = 5 + r() * 24 * (0.45 + Math.abs(Z[i]));
      VX[i] += Math.cos(an) * sp; VY[i] += Math.sin(an) * sp;
    }
    if (BOX[0]) ring(BOX[0].cx, BOX[0].cy, true);
  }
  function ring(x, y, big) {
    if (calm || !fx) return;
    var r = document.createElement('i');
    r.className = 'ring' + (big ? ' big' : '');
    r.style.left = x + 'px'; r.style.top = y + 'px';
    fx.appendChild(r);
    setTimeout(function () { r.remove(); }, 1400);
  }
  var spin = 1;
  function shock(x, y, power) {
    if (calm || !burst) return;
    var R = Math.max(Wd, Ht) * 0.5 * power;
    spin = -spin;
    for (var i = 0; i < N; i++) {
      var qx = PX[i] - x, qy = PY[i] - y, q2 = qx * qx + qy * qy;
      if (q2 < R * R) {
        var q = Math.sqrt(q2) + 1, k = 1 - q / R; k = k * k * 32 * power * (0.55 + 0.45 * Math.abs(Z[i]));
        VX[i] += (qx - qy * 0.45 * spin) / q * k; VY[i] += (qy + qx * 0.45 * spin) / q * k;
        var gk = k / 24; if (gk > GLW[i]) GLW[i] = gk > 1 ? 1 : gk;
      }
    }
    ring(x, y, power > 1);
  }

  /* ---------- drum (난타): a short synthesised hit, pitch follows where you tap ---------- */
  var actx = null;
  function drumHit(xn) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) actx = new AC();
      if (actx.state === 'suspended') actx.resume();
      var t0 = actx.currentTime, base = 62 + xn * 80;
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(base * 2.3, t0); o.frequency.exponentialRampToValueAtTime(base, t0 + 0.12);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
      o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + 0.46);
      var len = Math.floor(actx.sampleRate * 0.06), nb = actx.createBuffer(1, len, actx.sampleRate), cd = nb.getChannelData(0);
      for (var i = 0; i < len; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      var ns = actx.createBufferSource(), hp = actx.createBiquadFilter(), ng = actx.createGain();
      ns.buffer = nb; hp.type = 'highpass'; hp.frequency.value = 1500; ng.gain.value = 0.2;
      ns.connect(hp); hp.connect(ng); ng.connect(actx.destination); ns.start(t0);
    } catch (e) { /* sound is optional */ }
  }

  /* ---------- words: each title condenses out of blur, letter by letter ---------- */
  var CH = copies.map(function (c) {
    var tt = $('.tt', c);
    if (!tt) return [];
    tt.setAttribute('aria-label', tt.textContent.replace(/\s+/g, ' ').trim());
    var wrap = document.createElement('span'), out = [];
    wrap.setAttribute('aria-hidden', 'true');
    Array.prototype.slice.call(tt.childNodes).forEach(function (nd) {
      if (nd.nodeType === 3) {
        nd.textContent.split(/([ \t\r\n]+)/).forEach(function (part) {
          if (!part) return;
          if (/^[ \t\r\n]+$/.test(part)) { wrap.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          (Array.from ? Array.from(part) : part.split('')).forEach(function (chr) { var sp = document.createElement('span'); sp.className = 'ch'; sp.textContent = chr; w.appendChild(sp); out.push(sp); });
          wrap.appendChild(w);
        });
      } else wrap.appendChild(nd.cloneNode(true));
    });
    tt.textContent = '';
    tt.appendChild(wrap);
    return out;
  });
  var vis = copies.map(function () { return -1; }), lastP = -1, lastIntro = -1, railCur = -1, isDay = null, cueOn = -1;
  function words() {
    var ik = calm ? 1 : smooth(SEED_HOLD + 0.45, SEED_HOLD + 1.35, introT);
    if (Math.abs(p - lastP) < 0.0004 && Math.abs(ik - lastIntro) < 0.001) return;
    lastP = p; lastIntro = ik;
    for (var s = 0; s < S; s++) {
      var l = p - s, v = 1 - smooth(0.14, 0.42, Math.abs(l));
      if (s === 0) v *= ik;
      var el = copies[s];
      if (v < 0.002) { if (vis[s] !== 0) { el.style.visibility = 'hidden'; el.classList.remove('on'); vis[s] = 0; } continue; }
      if (vis[s] !== 1) { el.style.visibility = 'visible'; vis[s] = 1; }
      el.style.opacity = v.toFixed(3);
      if (!calm) el.style.translate = '0 ' + (-l * Ht * 0.06).toFixed(1) + 'px';
      el.classList.toggle('on', v > 0.55);
      var cs = CH[s], n = cs.length;
      for (var j = 0; j < n; j++) {
        var q = calm ? 1 : clamp(v * 1.7 - (n > 1 ? j / (n - 1) : 0) * 0.7, 0, 1), c = cs[j];
        q = q * q * (3 - 2 * q);
        if (c._q === q) continue;
        c._q = q;
        c.style.opacity = q >= 1 ? '' : q.toFixed(3);
        c.style.translate = q >= 1 ? '' : '0 ' + ((1 - q) * 0.4).toFixed(3) + 'em';
        if (!touch) c.style.filter = q >= 1 ? '' : 'blur(' + ((1 - q) * 7).toFixed(1) + 'px)';
      }
    }
  }
  function chrome() {
    var cur = clamp(Math.round(p), 0, LAST);
    if (cur !== railCur) {
      railCur = cur;
      rail.forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      if (cur >= LAST - 1) warmKakao();
    }
    var day = p > 5.5;
    if (day !== isDay) { isDay = day; d.classList.toggle('day', day); if (themeMeta) themeMeta.setAttribute('content', day ? '#f4efe6' : '#07080b'); }
    var co = (calm ? 1 : smooth(SEED_HOLD + 1, SEED_HOLD + 1.8, introT)) * (1 - smooth(LAST - 0.7, LAST - 0.25, p));
    co = Math.round(co * 100) / 100;
    if (co !== cueOn) { cueOn = co; cue.style.opacity = String(co); }
  }

  /* ---------- scroll, pointer, tilt, taps ---------- */
  function secH() { var t = track.firstElementChild; return (t && t.getBoundingClientRect().height) || window.innerHeight; }
  function readScroll() { pRaw = clamp((window.scrollY || window.pageYOffset || 0) / secH(), 0, LAST); }
  function goTo(n, instant) { window.scrollTo({ top: Math.round(n * secH()), behavior: instant || calm ? 'auto' : 'smooth' }); }
  rail.forEach(function (b) { b.addEventListener('click', function () { goTo(+b.getAttribute('data-to')); }); });
  function setPtr(x, y) {
    if (ptr.lx !== null) { ptr.dvx = ptr.dvx * 0.4 + clamp(x - ptr.lx, -40, 40) * 0.6; ptr.dvy = ptr.dvy * 0.4 + clamp(y - ptr.ly, -40, 40) * 0.6; }
    ptr.lx = x; ptr.ly = y;
    ptr.x = x; ptr.y = y; ptr.on = true; ptr.nx = x / Wd; ptr.ny = y / Ht;
  }
  window.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') setPtr(e.clientX, e.clientY); }, { passive: true });
  document.addEventListener('mouseleave', function () { ptr.on = false; ptr.lx = null; ptr.nx = 0.5; ptr.ny = 0.5; });
  window.addEventListener('touchstart', function (e) { var t0 = e.touches && e.touches[0]; if (!t0) return; ptr.lx = null; setPtr(t0.clientX, t0.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) { var t0 = e.touches && e.touches[0]; if (t0) setPtr(t0.clientX, t0.clientY); }, { passive: true });
  window.addEventListener('touchend', function () { setTimeout(function () { ptr.on = false; ptr.lx = null; ptr.nx = 0.5; ptr.ny = 0.5; }, 140); }, { passive: true });
  /* phones that report tilt without asking (Android) turn the 3D shapes; others sway by themselves */
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma === null || e.gamma === undefined || e.beta === null) return;
    gyro = { x: clamp(e.gamma / 35, -1, 1), y: clamp((e.beta - 40) / 35, -1, 1) };
  }, { passive: true });
  window.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('a,button')) return;
    var drum = KINDS[clamp(Math.round(p), 0, LAST)] === 'drum';
    shock(e.clientX, e.clientY, drum ? 1.2 : 0.85);
    if (drum) {
      punch = 1;
      drumHit(clamp(e.clientX / Wd, 0, 1));
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (er) { /* no haptics */ }
    }
  });
  goBtn.addEventListener('click', function () {
    try { window.localStorage.setItem('gl-going', '1'); } catch (e) { /* storage blocked */ }
    setGoing();
    var r = goBtn.getBoundingClientRect();
    punch = 1;
    shock(r.left + r.width / 2, r.top + r.height / 2, 1.1);
  });
  var rsT = 0;
  window.addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(layout, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); lastP = -1; });

  /* ---------- loop ---------- */
  var ftimes = [];
  function frame(now) {
    window.requestAnimationFrame(frame);
    if (!last) last = now;
    var dt = clamp((now - last) / 1000, 0.001, 0.05);
    last = now;
    ftimes.push(dt); if (ftimes.length > 90) ftimes.shift();
    time += dt; introT += dt;
    if (!ready && introT > SEED_HOLD - 0.02) introT = SEED_HOLD - 0.02;
    if (!burst && ready && introT >= SEED_HOLD) doBurst();
    readScroll();
    var pp = p, f = dt * 60;
    p += (pRaw - p) * (calm ? 1 : 1 - Math.exp(-dt * 7.5));
    if (Math.abs(pRaw - p) < 0.0005) p = pRaw;
    pv = lerp(pv, (p - pp) / dt, 0.2);
    if (pv > 0.05) dirSign = 1; else if (pv < -0.05) dirSign = -1;
    var sk = 1 - Math.exp(-dt * 3);
    ptr.sx += (ptr.nx - ptr.sx) * sk; ptr.sy += (ptr.ny - ptr.sy) * sk;
    var dk = Math.pow(0.82, f); ptr.dvx *= dk; ptr.dvy *= dk;
    if (gyro) { gyroS.x += (gyro.x - gyroS.x) * sk * 2; gyroS.y += (gyro.y - gyroS.y) * sk * 2; }
    var ph = (time * 1.2) % 1;
    beat = Math.exp(-ph / 0.07) + (ph > 0.25 ? 0.6 * Math.exp(-(ph - 0.25) / 0.07) : 0);
    punch *= Math.pow(0.9, f);
    /* a few sparks flare up on the cover only */
    if (!calm && burst && p < 0.5) { var nsp = Math.round(N * 0.0022 * f * (1 - p * 2)); for (var k = 0; k < nsp; k++) { var ix = (Math.random() * N) | 0; GLW[ix] = 0.85 + Math.random() * 0.15; } }
    var L = step(dt);
    if (gl) renderGL(L); else if (g2) render2D(L);
    words();
    chrome();
  }

  /* ---------- start ---------- */
  sizeCanvas();
  if (!initGL()) { g2 = canvas.getContext('2d'); d.classList.add('nogl'); }
  (function () {
    var sx = window.innerWidth / 2, sy = window.innerHeight * 0.4;
    for (var i = 0; i < N; i++) { PX[i] = sx + SEEDX[i] * 2; PY[i] = sy + SEEDY[i] * 2; }
  })();
  var HASH = {};
  scenes.forEach(function (s, i) { HASH['#' + s.id] = i; });
  buildShapes().then(function () {
    var h = window.location.hash;
    if (HASH[h] !== undefined) { goTo(HASH[h], true); readScroll(); p = pRaw; }
  });
  readScroll(); p = pRaw;
  window.requestAnimationFrame(frame);

  window.__dawn = {
    go: function (n) { goTo(n, true); readScroll(); p = pRaw; },
    p: function () { return p; },
    ready: function () { return ready && burst && introT > SEED_HOLD + 1.6; },
    boxes: function () { return BOX.map(function (b) { return b && { x0: b.cx - b.w / 2, x1: b.cx + b.w / 2, y0: b.cy - b.h / 2, y1: b.cy + b.h / 2 }; }); },
    n: N,
    drawn: function () { return DRAWN; },
    speed: function () { return SPD; },
    renderer: function () { return gl ? 'webgl' : g2 ? '2d' : 'none'; },
    fps: function () { var s = 0; ftimes.forEach(function (x) { s += x; }); return ftimes.length ? Math.round(ftimes.length / s) : 0; }
  };
})();
