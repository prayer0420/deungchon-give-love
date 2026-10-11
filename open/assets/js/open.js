/* 등촌교회 2청년회 · 새생명축제 초대장 "열림" (/open/)
   Eight flat-colour scenes nested inside each other: a door, a clock, a letter, a mask, a drum, a gift box, the church
   and a chair. The page scroll (eight snap points) flies the camera into the opening of each object, where the next
   scene is already waiting. Everything is drawn as vectors on one 2D canvas, so edges stay sharp at any zoom. */
(function () {
  'use strict';
  var d = document.documentElement;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function eio(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eout(t) { return 1 - Math.pow(1 - t, 3); }
  function bump(x) { return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); }
  function bounce(x) {
    var n = 7.5625, k = 2.75;
    if (x < 1 / k) return n * x * x;
    if (x < 2 / k) { x -= 1.5 / k; return n * x * x + 0.75; }
    if (x < 2.5 / k) { x -= 2.25 / k; return n * x * x + 0.9375; }
    x -= 2.625 / k; return n * x * x + 0.984375;
  }
  var TAU = Math.PI * 2, RAD = Math.PI / 180;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var URL0 = 'https://prayer0420.github.io/deungchon-give-love/open/';

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
  var shareData = { title: '문은 늘 열려 있어요 · 2026 새생명축제', text: '11월 15일 주일 오후 2시 30분, 등촌교회 본당에서 열리는 새생명축제에 초대해요. 같이 가요!', url: URL0 };
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
        title: '문은 늘 열려 있어요 · 2026 새생명축제',
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
  var goBtn = $('#goBtn'), goTxt = $('#goTxt'), going = false;
  function setGoing() {
    going = true;
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
        cdEl.innerHTML = '<b data-k="d"></b><small>일</small><b data-k="h"></b><small>시간</small><b data-k="m"></b><small>분</small><b data-k="s"></b><small>초 남았어요</small>';
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
  var canvas = $('#cv'), g = canvas.getContext('2d', { alpha: false }), stage = $('#stage'), track = $('#track');
  var bar = $('#bar'), cue = $('#cue'), cueT = $('#cueT'), progI = $('#progI'), themeMeta = $('#themeColor');
  var secs = $$('.sc'), copies = secs.map(function (s) { return $('.copy', s); });
  var KIND = secs.map(function (s) { return s.getAttribute('data-obj'); });
  var TONE = secs.map(function (s) { return s.getAttribute('data-tone'); });
  var S = secs.length, LAST = S - 1;
  var LAND = window.matchMedia('(min-aspect-ratio: 11/10)');
  var C = {
    paper: '#f2eee6', paper2: '#e6dfd3', paper3: '#d3c9b9', white: '#fbf9f5', card: '#fffdf8',
    ink: '#1c1b1a', ink2: '#3a3733',
    cobalt: '#2d4f9e', cobalt2: '#223e7e', cobalt3: '#172d5e', cobaltL: '#5778c3',
    sky: '#bfd2e6', sky2: '#a6bed8',
    sand: '#e6d8c3',
    terra: '#d4633c', terra2: '#b14d2b', terra3: '#8f3c21',
    ochre: '#e2b24e', ochre2: '#b8892f'
  };
  var CFG = {
    door: { field: C.paper, asp: 0.64, fill: 0.94, cue: '스크롤하면 문이 열려요', pbox: [-21, -34, 21, 44] },
    clock: { field: C.cobalt, asp: 0.92, fill: 0.84, cue: '스크롤해서 시계 속으로', pbox: [-39, -39, 39, 39] },
    letter: { field: C.sand, asp: 1, fill: 0.94, cue: '스크롤해서 편지 열기', pbox: [-40, -56, 40, -20] },
    mask: { field: C.ink, asp: 0.94, fill: 0.86, cue: '스크롤해서 가면 너머로', pbox: [-32, -46, 32, 45] },
    drum: { field: C.terra, asp: 1.16, fill: 0.92, cue: '스크롤해서 북 속으로', pbox: [-41.6, -25.4, 41.6, -2.6] },
    gift: { field: C.ochre, asp: 0.9, fill: 0.9, cue: '스크롤해서 상자 열기', pbox: [-36.6, -28.9, 40.8, -7.1] },
    church: { field: C.sky, asp: 1, fill: 0.94, cue: '스크롤해서 본당으로', pbox: [-6, 24, 10, 44] },
    chair: { field: C.paper, asp: 0.62, fill: 0.92, cue: '', pbox: null }
  };

  /* ---------- drawing helpers: every object is drawn in its own units, 100 tall, centred on (0, 0) ---------- */
  function rgba(h, a) { return 'rgba(' + parseInt(h.slice(1, 3), 16) + ',' + parseInt(h.slice(3, 5), 16) + ',' + parseInt(h.slice(5, 7), 16) + ',' + a + ')'; }
  function mixc(h1, h2, t) {
    var r = [1, 3, 5].map(function (i) { return Math.round(lerp(parseInt(h1.slice(i, i + 2), 16), parseInt(h2.slice(i, i + 2), 16), t)); });
    return 'rgb(' + r[0] + ',' + r[1] + ',' + r[2] + ')';
  }
  function path(pts, open) {
    var P = new Path2D();
    for (var i = 0; i < pts.length; i += 2) { if (i) P.lineTo(pts[i], pts[i + 1]); else P.moveTo(pts[i], pts[i + 1]); }
    if (!open) P.closePath();
    return P;
  }
  function fillP(P, col) { g.fillStyle = col; g.fill(P); }
  function ell(x, y, rx, ry) { var P = new Path2D(); P.ellipse(x, y, Math.max(rx, 0.01), Math.max(ry, 0.01), 0, 0, TAU); return P; }
  function rect(x, y, w, h, r) { var P = new Path2D(); if (r && P.roundRect) P.roundRect(x, y, w, h, r); else P.rect(x, y, w, h); return P; }
  function seg(x0, y0, x1, y1, w, col) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.stroke(); }
  function soft(x, y, rx, ry, col, a) {
    g.save(); g.translate(x, y); g.scale(1, ry / rx);
    var rg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    rg.addColorStop(0, rgba(col, a)); rg.addColorStop(0.55, rgba(col, a * 0.5)); rg.addColorStop(1, rgba(col, 0));
    g.fillStyle = rg; g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill(); g.restore();
  }
  /* FA: the alpha the front layer of the current scene is drawn with (it fades out at the very end of a zoom) */
  var FA = 1;
  /* iris: clip away a growing circle so the next scene opens out of the middle of a surface */
  function iris(cx, cy, r) { var P = new Path2D(); P.rect(-500, -500, 1000, 1000); P.moveTo(cx + r, cy); P.arc(cx, cy, r, 0, TAU); g.clip(P, 'evenodd'); }
  function irisR(st, R, a, b) { return calm || !(st.dep > 0) ? 0 : R * eio(smooth(a, b, st.dep)); }
  var FONT = '"Wanted Sans", -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  /* canvas text is drawn ten times larger and scaled down, so tiny sizes in object units stay sharp */
  function txt(s, x, y, size, weight, col, align) {
    g.save(); g.scale(0.1, 0.1);
    g.font = weight + ' ' + (size * 10) + 'px ' + FONT;
    g.fillStyle = col; g.textAlign = align || 'center'; g.textBaseline = 'middle';
    g.fillText(s, x * 10, y * 10);
    g.restore();
  }
  function spaced(s, x, y, size, weight, col, track) {
    g.save(); g.scale(0.1, 0.1);
    g.font = weight + ' ' + (size * 10) + 'px ' + FONT;
    g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'middle';
    var ch = s.split(''), ws = ch.map(function (c) { return g.measureText(c).width; }), tr = track * size * 10, tw = tr * (ch.length - 1);
    ws.forEach(function (w) { tw += w; });
    var cx = x * 10 - tw / 2;
    ch.forEach(function (c, i) { g.fillText(c, cx, y * 10); cx += ws[i] + tr; });
    g.restore();
  }

  /* ---------- 1 door: arched double door that swings inward ---------- */
  function archP(hw, cy, bot) { var P = new Path2D(); P.moveTo(-hw, bot); P.lineTo(-hw, cy); P.arc(0, cy, hw, Math.PI, 0); P.lineTo(hw, bot); P.closePath(); return P; }
  var DOOR_OPEN = archP(21, -13, 44), DOOR_FRAME = archP(26.5, -13, 44);
  function dProj(x, y, z) { var f = 150 / (150 + z); return [x * f, 4 + (y - 4) * f, f]; }
  var LEAF = (function () {
    var pts = [[0, 44], [21, 44], [21, -34.6]], k, dd;
    for (k = 1; k <= 24; k++) { dd = 21 - 21 * k / 24; pts.push([dd, -13 - Math.sqrt(Math.max(0, 466 - (dd - 21) * (dd - 21)))]); }
    return pts;
  })();
  function leafPt(side, dd, y, c, s) { var hx = side < 0 ? -21 : 21, dir = side < 0 ? 1 : -1; return dProj(hx + dir * dd * c, y, dd * s); }
  function leafPath(side, c, s, pts) {
    var P = new Path2D();
    pts.forEach(function (q, i) { var v = leafPt(side, q[0], q[1], c, s); if (i) P.lineTo(v[0], v[1]); else P.moveTo(v[0], v[1]); });
    P.closePath();
    return P;
  }
  var JAMB = (function () {
    var out = [[-21, 44]], k, a, P = new Path2D();
    for (k = 0; k <= 16; k++) { a = Math.PI + Math.PI * k / 16; out.push([21 * Math.cos(a), -13 + 21 * Math.sin(a)]); }
    out.push([21, 44]);
    out.forEach(function (q, i) { if (i) P.lineTo(q[0], q[1]); else P.moveTo(q[0], q[1]); }); P.closePath();
    out.forEach(function (q, i) { var v = dProj(q[0], q[1], 10); if (i) P.lineTo(v[0], v[1]); else P.moveTo(v[0], v[1]); }); P.closePath();
    return P;
  })();
  function drawDoor(o, st, layer) {
    if (layer === 'back') {
      soft(st.sx * 2, 48.8, 40, 3.4, C.ink, 0.2);
      fillP(rect(-31, 44, 62, 4.8, 0.8), C.paper3);
      fillP(rect(-31, 44, 62, 1, 0), C.white);
      fillP(DOOR_FRAME, C.paper2);
      g.lineWidth = 0.6; g.strokeStyle = rgba(C.ink, 0.12); g.stroke(DOOR_FRAME);
      fillP(rect(-1.3, -50, 2.6, 8.6, 0.3), C.ink);
      fillP(rect(-4.3, -47.7, 8.6, 2.5, 0.3), C.ink);
      if (!st.inner) fillP(DOOR_OPEN, C.terra3);
      return;
    }
    var open = calm ? 0 : smooth(0, 0.34, st.dep || 0), th = (open * 80 + (o.peek || 0) * 18) * RAD, c = Math.cos(th), s = Math.sin(th);
    g.save(); g.clip(DOOR_OPEN);
    if (th > 0.002) { g.fillStyle = C.paper3; g.fill(JAMB, 'evenodd'); }
    [-1, 1].forEach(function (side) {
      fillP(leafPath(side, c, s, LEAF), mixc(C.terra, C.terra3, 0.75 * s));
      g.lineWidth = 0.9; g.strokeStyle = rgba(C.terra3, 0.55);
      g.stroke(leafPath(side, c, s, [[4, -15], [17, -15], [17, 8], [4, 8]]));
      g.stroke(leafPath(side, c, s, [[4, 15], [17, 15], [17, 38], [4, 38]]));
      var k = leafPt(side, 18.4, 11, c, s);
      fillP(ell(k[0], k[1], 1.5 * k[2] * Math.max(0.3, c), 1.5 * k[2]), C.ochre);
    });
    if (th < 0.3) seg(0, -33.6, 0, 44, 0.7, rgba(C.terra3, 0.6 * (1 - th / 0.3)));
    g.restore();
    g.lineWidth = 0.7; g.strokeStyle = rgba(C.ink, 0.18); g.stroke(DOOR_OPEN);
  }

  /* ---------- 2 clock: the hands sweep to 2:30 as you arrive ---------- */
  var CLOCK_FACE = ell(0, 0, 39, 39);
  function hand(a, len, w, tail, col) { g.save(); g.rotate(a); fillP(rect(-w / 2, -len, w, len + tail, w / 2), col); g.restore(); }
  function drawClock(o, st, layer) {
    if (layer === 'back') {
      fillP(ell(2.4 + st.sx, 3.4, 43.5, 43.5), 'rgba(9,20,52,0.32)');
      fillP(ell(0, 0, 43.5, 43.5), C.ink);
      g.lineWidth = 0.8; g.strokeStyle = C.ink2; g.stroke(ell(0, 0, 41, 41));
      return;
    }
    var ir = irisR(st, 80, 0.04, 0.42);
    if (ir >= 80) return;
    g.save();
    if (ir > 0) iris(st.ix, st.iy, ir);
    fillP(CLOCK_FACE, C.paper);
    g.lineWidth = 1.2; g.strokeStyle = rgba(C.ink, 0.07); g.stroke(ell(0, 0, 37.4, 37.4));
    for (var i = 0; i < 60; i++) {
      var a = i * TAU / 60, sn = Math.sin(a), cs = -Math.cos(a), big = i % 5 === 0, q = i % 15 === 0;
      var r0 = q ? 28.4 : big ? 30.4 : 33.6;
      seg(sn * r0, cs * r0, sn * 35, cs * 35, q ? 2.6 : big ? 1.7 : 0.55, big ? C.ink : rgba(C.ink, 0.42));
    }
    spaced('NEW LIFE', 0, -15.5, 3.1, 700, rgba(C.ink, 0.7), 0.24);
    var e = eout(smooth(0.35, 1, st.arr)), sp = o.spinE || 0;
    hand(75 * RAD * e + sp * TAU, 20, 4.4, 4, C.ink);
    hand(Math.PI * e + sp * 12 * TAU, 31, 2.6, 6.5, C.terra);
    fillP(ell(0, 0, 3.1, 3.1), C.ink);
    fillP(ell(0, 0, 1.15, 1.15), C.terra);
    g.restore();
  }

  /* ---------- 3 letter: the flap opens and the card slides out ---------- */
  var ENV = path([-46, -20, 0, 6, 46, -20, 46, 26, -46, 26]);
  var ENV_V = path([-46, -20, 46, -20, 0, 6]);
  function cardTop(st, o) { return -16 - 40 * (calm ? 0 : smooth(0.12, 0.42, st.dep || 0)) - (o.peek || 0) * 3.5; }
  function drawLetter(o, st, layer) {
    var dep = st.dep || 0, phi = (calm ? 0 : smooth(0, 0.2, dep)) * Math.PI + (o.peek || 0) * 0.6, cphi = Math.cos(phi), tipY = -20 + 30 * cphi;
    if (layer === 'back') {
      soft(st.sx * 2, 28.5, 54, 4.2, C.ink, 0.17);
      fillP(ENV_V, C.terra2);
      if (cphi < 0) fillP(path([-46, -20, 46, -20, 0, tipY]), C.terra);
      return;
    }
    var cy = cardTop(st, o), ir = irisR(st, 90, 0.4, 0.66);
    if (ir < 90) {
      g.save();
      if (ir > 0) iris(st.ix, st.iy, ir);
      fillP(rect(-40, cy, 80, 36, 1.2), C.card);
      txt('당신에게', -33, cy + 8, 4.4, 700, C.ink, 'left');
      seg(-33, cy + 16, 24, cy + 16, 1.1, rgba(C.ink, 0.16));
      seg(-33, cy + 21.5, 31, cy + 21.5, 1.1, rgba(C.ink, 0.16));
      seg(-33, cy + 27, 8, cy + 27, 1.1, rgba(C.ink, 0.16));
      txt('2청년회 드림', 33, cy + 30.5, 3, 600, rgba(C.ink, 0.55), 'right');
      g.restore();
    }
    fillP(ENV, '#f8f4ec');
    g.lineWidth = 0.7; g.strokeStyle = rgba(C.ink, 0.1);
    g.beginPath(); g.moveTo(-46, 26); g.lineTo(-7, 3); g.moveTo(46, 26); g.lineTo(7, 3); g.stroke();
    g.strokeStyle = rgba(C.ink, 0.14); g.stroke(rect(-46, -20, 92, 46, 0.6));
    if (cphi >= 0) {
      fillP(path([-46, -20, 46, -20, 0, tipY]), '#efe8dc');
      g.lineWidth = 0.7; g.strokeStyle = rgba(C.ink, 0.12); g.stroke(path([-46, -20, 0, tipY, 46, -20], true));
      var sy = -20 + 26 * cphi, sk = 1 + 0.18 * (o.seal || 0);
      g.save(); g.translate(0, sy); g.scale(sk, sk * Math.max(0.05, cphi));
      fillP(ell(0, 0, 6.6, 6.6), C.terra);
      g.lineWidth = 0.9; g.strokeStyle = C.terra2; g.stroke(ell(0, 0, 4.6, 4.6));
      fillP(rect(-0.6, -2.9, 1.2, 5.8, 0.2), C.terra2);
      fillP(rect(-2.1, -1.6, 4.2, 1.2, 0.2), C.terra2);
      g.restore();
    }
  }

  /* ---------- 4 mask: a mime's face that turns to smile when touched ---------- */
  var FACE = (function () {
    var P = new Path2D();
    P.moveTo(0, -46);
    P.bezierCurveTo(22, -46, 33, -30, 32, -10);
    P.bezierCurveTo(31, 10, 22, 31, 8, 42);
    P.bezierCurveTo(4, 45.5, -4, 45.5, -8, 42);
    P.bezierCurveTo(-22, 31, -31, 10, -32, -10);
    P.bezierCurveTo(-33, -30, -22, -46, 0, -46);
    P.closePath();
    return P;
  })();
  function drawMask(o, st, layer) {
    var fe = o.flipE || 0, kx = Math.max(0.04, Math.abs(Math.cos(Math.PI * fe))), smile = (fe < 0.5 ? o.face : 1 - o.face) === 1;
    var lift = -Math.sin(Math.PI * fe) * 3;
    if (layer === 'back') {
      soft(0, 2, 64, 64, '#ffffff', 0.09 * smooth(0.45, 1, st.arr));
      g.save(); g.translate(0, lift); g.scale(kx, 1);
      g.lineCap = 'round'; g.lineWidth = 2.2; g.strokeStyle = C.terra;
      [-1, 1].forEach(function (sd) {
        g.beginPath(); g.moveTo(sd * 31, -15); g.bezierCurveTo(sd * 40, -11, sd * 46, 0, sd * 41, 12); g.bezierCurveTo(sd * 38, 20, sd * 44, 28, sd * 47, 35); g.stroke();
      });
      g.restore();
      return;
    }
    /* going beyond the mask: it is lifted off and away, and the next scene shows in its place */
    var up = calm || !(st.dep > 0) ? 0 : eio(smooth(0.02, 0.4, st.dep));
    if (up >= 1) return;
    g.save(); g.translate(up * 16, lift - up * 130); g.rotate(-up * 0.32); g.scale(kx, 1);
    var lg = g.createLinearGradient(-32, 0, 32, 0);
    lg.addColorStop(0, '#fbf8f2'); lg.addColorStop(0.62, '#f2ede4'); lg.addColorStop(1, '#d9d0c1');
    g.fillStyle = lg; g.fill(FACE);
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = C.ink;
    if (!smile) {
      [-1, 1].forEach(function (sd) {
        var P = new Path2D(); P.moveTo(sd * 20, -7); P.quadraticCurveTo(sd * 12.5, -12.8, sd * 5, -7.2); P.quadraticCurveTo(sd * 12.5, -2.6, sd * 20, -7); fillP(P, C.ink);
        g.beginPath(); g.moveTo(sd * 21, -17); g.quadraticCurveTo(sd * 13, -25, sd * 5.5, -17.5); g.lineWidth = 1.3; g.stroke();
      });
      var T = new Path2D(); T.moveTo(-12.5, 0); T.quadraticCurveTo(-9.6, 5, -12.5, 7); T.quadraticCurveTo(-15.4, 5, -12.5, 0); fillP(T, C.terra);
      var L = new Path2D(); L.moveTo(-7, 24); L.quadraticCurveTo(-3.4, 20.6, 0, 22.6); L.quadraticCurveTo(3.4, 20.6, 7, 24); L.quadraticCurveTo(0, 28.6, -7, 24); fillP(L, C.terra);
    } else {
      [-1, 1].forEach(function (sd) {
        g.beginPath(); g.moveTo(sd * 19, -5.5); g.quadraticCurveTo(sd * 12.5, -12.5, sd * 6, -5.5); g.lineWidth = 2.2; g.stroke();
        g.beginPath(); g.moveTo(sd * 20.5, -19.5); g.quadraticCurveTo(sd * 13, -24.5, sd * 6, -20); g.lineWidth = 1.3; g.stroke();
      });
      var M = new Path2D(); M.moveTo(-11, 19.5); M.quadraticCurveTo(0, 33, 11, 19.5); M.quadraticCurveTo(0, 25.5, -11, 19.5); fillP(M, C.terra);
    }
    g.restore();
  }

  /* ---------- 5 drum: tap it and it sounds ---------- */
  var SHELL = (function () {
    var P = new Path2D();
    P.moveTo(-44, -14); P.lineTo(-44, 24); P.ellipse(0, 24, 44, 12.5, 0, Math.PI, 0, true); P.lineTo(44, -14); P.ellipse(0, -14, 44, 12.5, 0, 0, Math.PI, false); P.closePath();
    return P;
  })();
  var HEAD = ell(0, -14, 41.6, 11.4);
  var RODS = [-0.92, -0.56, 0, 0.56, 0.92];
  function stick(x0, y0, x1, y1, rot, fly) {
    g.save(); g.translate(x0, y0 - 70 * fly); g.rotate(rot); g.translate(-x0, -y0);
    seg(x0, y0, x1, y1, 3.6, C.ochre);
    fillP(ell(x1, y1, 2.5, 2.2), C.ochre2);
    g.restore();
  }
  function drawDrum(o, st, layer) {
    var h = o.hit || 0;
    g.save(); g.translate(0, 24); g.scale(1 + 0.022 * h, 1 - 0.055 * h); g.translate(0, -24);
    if (layer === 'back') {
      (o.rings || []).forEach(function (r0) {
        var a = (time - r0) / 1.15;
        if (a < 0 || a > 1) return;
        var e = eout(a);
        g.lineWidth = 1.6 * (1 - a) + 0.3; g.strokeStyle = rgba(C.paper, 0.6 * (1 - a));
        g.stroke(ell(0, -14, 46 + e * 78, 13 + e * 24));
      });
      soft(st.sx * 2, 37, 56, 7, C.terra3, 0.5);
      fillP(SHELL, C.cobalt);
      g.save(); g.clip(SHELL);
      fillP(rect(-34, -30, 9, 80, 0), rgba(C.cobaltL, 0.75));
      fillP(rect(31, -30, 14, 80, 0), C.cobalt2);
      g.restore();
      RODS.forEach(function (sx) {
        var x = 44 * sx, k = Math.sqrt(1 - sx * sx), yt = -14 + 12.5 * k, yb = 24 + 12.5 * k, w = 3.6 * k + 0.8;
        seg(x, yt + 2, x, yb - 2, 0.9, rgba(C.paper, 0.6));
        fillP(rect(x - w / 2, (yt + yb) / 2 - 5, w, 10, w / 2), C.paper2);
      });
      g.lineWidth = 3.4; g.strokeStyle = C.ink;
      g.beginPath(); g.ellipse(0, 24, 44, 12.5, 0, Math.PI, 0, true); g.stroke();
      g.restore();
      return;
    }
    var ir = irisR(st, 86, 0.06, 0.42);
    if (ir < 86) {
      g.save();
      if (ir > 0) iris(st.ix, st.iy, ir);
      fillP(HEAD, C.paper);
      g.lineWidth = 0.8; g.strokeStyle = rgba(C.ink, 0.1); g.stroke(ell(0, -14, 33, 9));
      var ha = (time - o.ht) / 0.6;
      if (ha >= 0 && ha < 1) { var e = eout(ha); g.lineWidth = 1.1; g.strokeStyle = rgba(C.ink, 0.25 * (1 - ha)); g.stroke(ell(0, -14, 8 + 32 * e, 2.2 + 8.8 * e)); }
      g.restore();
    }
    g.lineWidth = 3.6; g.strokeStyle = C.ink; g.stroke(ell(0, -14, 44, 12.5));
    var fly = calm ? 0 : smooth(0, 0.3, st.dep || 0), lift = o.lift || 0;
    if (fly < 1) {
      g.globalAlpha = FA * (1 - fly);
      stick(-52, -44, 14, -19, -0.3 * lift - 0.9 * fly, fly);
      stick(54, -42, -12, -18, 0.3 * lift + 0.9 * fly, fly);
      g.globalAlpha = FA;
    }
    g.restore();
  }

  /* ---------- 6 gift: a box tied with ribbon; the lid lifts and a card pops out ---------- */
  function lt(x, t) { return [x + 20 * t, -12 - 25 * t]; }
  var G_FRONT = rect(-38, -6, 62, 48, 0), G_RIGHT = path([24, -6, 43, -30, 43, 18, 24, 42]), G_TOP = path([-38, -6, 24, -6, 43, -30, -19, -30]);
  var G_OPEN = path([-36.6, -7.1, 22.6, -7.1, 40.8, -28.9, -17.4, -28.9]);
  var G_ABOVE = path([-90, -95, 95, -95, 95, -30, 43, -30, 24, -6, -38, -6, -90, -6]);
  function quad(a, b, c, e) { return path([a[0], a[1], b[0], b[1], c[0], c[1], e[0], e[1]]); }
  function bow(cx, cy) {
    g.lineJoin = 'round';
    [-1, 1].forEach(function (sd) {
      var P = new Path2D(); P.moveTo(cx, cy); P.bezierCurveTo(cx + sd * 4, cy - 12, cx + sd * 17, cy - 13, cx + sd * 15, cy - 3); P.bezierCurveTo(cx + sd * 13, cy + 2, cx + sd * 5, cy + 1.5, cx, cy); P.closePath();
      fillP(P, C.terra); g.lineWidth = 0.9; g.strokeStyle = C.terra2; g.stroke(P);
      var Q = new Path2D(); Q.moveTo(cx, cy); Q.lineTo(cx + sd * 7, cy + 9); Q.lineTo(cx + sd * 4.5, cy + 9.5); Q.lineTo(cx + sd * 3.6, cy + 12); Q.lineTo(cx - sd * 0.6, cy + 1.5); Q.closePath(); fillP(Q, C.terra2);
    });
    fillP(ell(cx, cy, 3, 2.6), C.terra2);
  }
  function drawGift(o, st, layer) {
    var dep = st.dep || 0, up = calm ? 0 : smooth(0.04, 0.36, dep);
    if (layer === 'back') {
      soft(6 + st.sx * 2, 44, 52, 5.2, C.ochre2, 0.6);
      fillP(G_RIGHT, C.cobalt2);
      fillP(G_FRONT, C.cobalt);
      fillP(rect(-11.5, -6, 9, 48, 0), C.terra);
      fillP(path([24 + 19 * 0.42, -6 - 24 * 0.42, 24 + 19 * 0.58, -6 - 24 * 0.58, 24 + 19 * 0.58, 42 - 24 * 0.58, 24 + 19 * 0.42, 42 - 24 * 0.42]), C.terra2);
      fillP(G_TOP, C.cobalt3);
      return;
    }
    var cd = o.card || 0, ir = irisR(st, 90, 0.1, 0.44);
    if (dep > 0 && ir < 90) { g.save(); if (ir > 0) iris(st.ix, st.iy, ir); fillP(G_OPEN, C.cobalt3); g.restore(); }
    if (cd > 0.001) {
      g.save(); g.clip(G_ABOVE);
      var cy = -10 - 22 * cd;
      fillP(rect(-13, cy, 32, 18, 1), C.card);
      txt('환영해요', 3, cy + 7.5, 4.6, 800, C.terra);
      seg(-5, cy + 13.5, 11, cy + 13.5, 0.9, rgba(C.ink, 0.18));
      g.restore();
    }
    var L = 48 * up + 38 * cd, rot = -0.34 * up - 0.2 * cd, dx = 18 * up + 8 * cd;
    var la = 1 - (calm ? 0 : smooth(0.3, 0.48, dep));
    if (la > 0.001) {
      g.save(); g.globalAlpha = FA * la; g.translate(3 + dx, -24.5 - L); g.rotate(rot); g.translate(-3, 24.5);
      fillP(path([26.5, -12, 46.5, -37, 46.5, -26, 26.5, -1]), C.cobalt2);
      fillP(rect(-40.5, -12, 67, 11, 0), C.cobalt);
      fillP(path([-40.5, -12, 26.5, -12, 46.5, -37, -20.5, -37]), '#4b6cb8');
      fillP(rect(-11.5, -12, 9, 11, 0), C.terra);
      fillP(quad(lt(-40.5, 0.42), lt(26.5, 0.42), lt(26.5, 0.58), lt(-40.5, 0.58)), C.terra);
      fillP(quad(lt(-11.5, 0), lt(-2.5, 0), lt(-2.5, 1), lt(-11.5, 1)), C.terra);
      fillP(path([26.5 + 20 * 0.42, -12 - 25 * 0.42, 26.5 + 20 * 0.58, -12 - 25 * 0.58, 26.5 + 20 * 0.58, -1 - 25 * 0.58, 26.5 + 20 * 0.42, -1 - 25 * 0.42]), C.terra2);
      bow(3, -24.5);
      g.restore();
    }
  }

  /* ---------- 7 church: 등촌교회, after the photo on deungchon.org (tower with the cross, blue glass band, sweeping roof) ---------- */
  var CH_BODY = (function () {
    var P = new Path2D();
    P.moveTo(-36, 44); P.lineTo(-36, -36); P.lineTo(-33, -50); P.lineTo(-11, -46.5);
    P.bezierCurveTo(-3, -44, 4, -34, 12, -25); P.bezierCurveTo(22, -13, 35, -6.5, 50, -4);
    P.lineTo(50, 44); P.closePath();
    return P;
  })();
  var CH_BAND = (function () {
    var P = new Path2D();
    P.moveTo(-12, -31); P.bezierCurveTo(-1, -26, 9, -17, 20, -10.5); P.bezierCurveTo(30, -4.5, 40, -1.5, 50, 0);
    P.lineTo(50, 11); P.bezierCurveTo(40, 9, 30, 6, 20, 0.5); P.bezierCurveTo(9, -6, -1, -14, -12, -19); P.closePath();
    return P;
  })();
  var CH_DOOR = rect(-6, 24, 16, 20, 0);
  function drawChurch(o, st, layer) {
    var dep = st.dep || 0, gl = o.glow || 0;
    if (layer === 'back') {
      fillP(rect(-60, 44, 120, 8, 0), C.paper2);
      soft(14 + st.sx * 2, 45, 52, 3, C.cobalt3, 0.18);
      fillP(CH_BODY, C.white);
      g.save(); g.clip(CH_BODY); fillP(rect(-12, -60, 70, 110, 0), rgba(C.sky2, 0.2)); g.restore();
      seg(-12, -46, -12, 44, 0.5, rgba(C.ink, 0.08));
      fillP(CH_BAND, C.cobalt);
      g.save(); g.clip(CH_BAND);
      g.lineWidth = 0.7; g.strokeStyle = rgba(C.cobaltL, 0.95);
      g.beginPath(); g.moveTo(-12, -27); g.bezierCurveTo(-1, -22, 9, -13, 20, -6.5); g.bezierCurveTo(30, -0.5, 40, 2.5, 50, 3.7); g.stroke();
      g.beginPath(); g.moveTo(-12, -23); g.bezierCurveTo(-1, -18, 9, -9.5, 20, -3); g.bezierCurveTo(30, 2.8, 40, 5.8, 50, 7.4); g.stroke();
      [-4, 6, 16, 26, 36, 46].forEach(function (x) { seg(x, -40, x - 3, 20, 0.6, rgba(C.cobaltL, 0.7)); });
      g.restore();
      fillP(rect(-36, -27, 4.2, 67, 0), C.cobalt);
      for (var y = -24; y < 40; y += 4.2) seg(-36, y, -31.8, y + 1.2, 0.5, rgba(C.white, 0.55));
      fillP(rect(-30.5, -44.5, 15, 14, 0), C.sky);
      if (gl > 0.01) soft(-22.5, -36.5, 17, 17, C.terra, 0.5 * gl);
      fillP(rect(-23.8, -44, 2.6, 15.6, 0.2), C.terra);
      fillP(rect(-27.6, -40.6, 10.2, 2.4, 0.2), C.terra);
      if (gl > 0.01) for (var r = 0; r < 6; r++) { var a = -Math.PI / 2 + (r - 2.5) * 0.52; seg(-22.5 + Math.cos(a) * 12, -36.5 + Math.sin(a) * 12, -22.5 + Math.cos(a) * (12 + 5 * gl), -36.5 + Math.sin(a) * (12 + 5 * gl), 0.9, rgba(C.terra, gl)); }
      for (var rr = 0; rr < 4; rr++) for (var cc = 0; cc < 8; cc++) fillP(ell(17 + cc * 4 + (rr % 2) * 2, 18 + rr * 4.4, 0.95, 0.95), C.paper3);
      fillP(rect(-9.5, 22.2, 23, 1.6, 0.3), C.ink);
      fillP(rect(-9, 44, 22, 1.6, 0), C.paper3);
      if (!st.inner) fillP(CH_DOOR, C.cobalt3);
      return;
    }
    var sl = 8 * (calm ? 0 : smooth(0, 0.3, dep));
    g.save(); g.clip(CH_DOOR);
    fillP(rect(-6 - sl, 24, 8, 20, 0), rgba(C.cobalt2, 0.9));
    fillP(rect(2 + sl, 24, 8, 20, 0), rgba(C.cobalt2, 0.9));
    seg(-5 - sl, 25.5, -5 - sl, 42, 0.5, rgba(C.white, 0.35));
    seg(3 + sl, 25.5, 3 + sl, 42, 0.5, rgba(C.white, 0.35));
    seg(0.8 - sl, 32, 0.8 - sl, 36, 0.8, C.paper2);
    seg(3.2 + sl, 32, 3.2 + sl, 36, 0.8, C.paper2);
    g.restore();
    g.lineWidth = 0.8; g.strokeStyle = C.ink; g.stroke(CH_DOOR);
  }

  /* ---------- 8 chair: your seat, with a reserved card on it ---------- */
  var CA = Math.cos(0.6), SA = Math.sin(0.6), CB = Math.cos(0.36), SB = Math.sin(0.36), KS = 0.82, LX = 20.5, LZ = 19.5;
  function cp(x, y, z) { var xr = x * CA + z * SA, zr = -x * SA + z * CA; return [0.4 + xr * KS, 38 - (y * CB + zr * SB) * KS]; }
  function cseg(a, b, w, col) { var u = cp(a[0], a[1], a[2]), v = cp(b[0], b[1], b[2]); seg(u[0], u[1], v[0], v[1], w, col); }
  function cpoly(pts) { var P = new Path2D(); pts.forEach(function (q, i) { var v = cp(q[0], q[1], q[2]); if (i) P.lineTo(v[0], v[1]); else P.moveTo(v[0], v[1]); }); P.closePath(); return P; }
  function zb(y) { return LZ + 3.5 * Math.max(0, y - 45) / 51; }
  function bw(x) { return 1.8 * (1 - (x / LX) * (x / LX)); }
  function drawChair(o, st, layer) {
    if (layer === 'back') return;
    var hop = o.hop || 0, f0 = cp(0, 0, 0);
    soft(f0[0] + 3 + st.sx * 2, f0[1] + 2.5, 34 - hop * 8, 5.5, C.ink, 0.18 - 0.08 * hop);
    g.save(); g.translate(0, -8 * hop);
    g.lineCap = 'round';
    cseg([-LX, 0, LZ], [-LX, 45, LZ], 1.9, C.cobalt2);
    cseg([-LX, 45, LZ], [-LX, 96, zb(96)], 1.9, C.cobalt2);
    cseg([-LX, 17, LZ], [LX, 17, LZ], 0.9, C.cobalt2);
    cseg([-LX, 20, -LZ], [-LX, 20, LZ], 0.9, C.cobalt2);
    var top = [], bot = [], k, x;
    for (k = 0; k <= 12; k++) { x = -LX + 2 * LX * k / 12; top.push([x, 95, zb(95) + bw(x)]); bot.push([x, 84, zb(84) + bw(x)]); }
    fillP(cpoly(top.concat(bot.slice().reverse())), C.cobalt);
    [-10, 0, 10].forEach(function (sx) { cseg([sx, 49, 21], [sx, 84, zb(84) + bw(sx)], 1.5, C.cobalt); });
    cseg([LX, 0, LZ], [LX, 45, LZ], 2, C.cobalt2);
    cseg([LX, 45, LZ], [LX, 96, zb(96)], 1.9, C.cobalt2);
    fillP(cpoly([[-23.5, 49, -23], [23.5, 49, -23], [23.5, 45, -23], [-23.5, 45, -23]]), C.terra2);
    fillP(cpoly([[23.5, 49, -23], [23.5, 49, 21.5], [23.5, 45, 21.5], [23.5, 45, -23]]), C.terra3);
    fillP(cpoly([[-23.5, 49, -23], [23.5, 49, -23], [23.5, 49, 21.5], [-23.5, 49, 21.5]]), C.terra);
    cseg([-LX, 0, -LZ], [-LX, 44, -LZ], 2.2, C.cobalt);
    cseg([LX, 0, -LZ], [LX, 44, -LZ], 2.3, C.cobalt);
    cseg([-LX, 17, -LZ], [LX, 17, -LZ], 1, C.cobalt);
    cseg([LX, 20, -LZ], [LX, 20, LZ], 1, C.cobalt);
    /* the reserved card stands on the seat, in the chair's own perspective */
    var drop = calm ? 1 : bounce(smooth(0.5, 1, st.arr)), fe = o.flipE || 0, ky = Math.max(0.05, Math.abs(Math.cos(Math.PI * fe)));
    var back = (fe < 0.5 ? o.side : 1 - o.side) === 1, b = cp(0, 49, -2);
    g.save();
    g.translate(b[0], b[1] - (1 - drop) * 34);
    g.transform(CA * KS, SA * SB * KS, 0, CB * KS, 0, 0);
    g.scale(1, ky);
    fillP(rect(-12, -15, 24, 15, 0.8), C.card);
    g.lineWidth = 0.3; g.strokeStyle = rgba(C.ink, 0.18); g.stroke(rect(-12, -15, 24, 15, 0.8));
    if (!back) {
      spaced('RESERVED', 0, -10.6, 2.5, 800, C.terra, 0.2);
      txt(going ? '자리 맡았어요' : '당신의 자리', 0, -5.2, 3.6, 700, C.ink);
    } else {
      txt('11.15 SUN', 0, -10, 3.6, 800, C.ink);
      txt('오후 2:30 · 본당', 0, -5, 2.8, 600, rgba(C.ink, 0.7));
    }
    g.restore();
    g.restore();
  }

  var OBJ = {
    door: { draw: drawDoor, portal: function () { return DOOR_OPEN; }, fin: function () { return DOOR_OPEN; } },
    clock: { draw: drawClock, portal: function () { return CLOCK_FACE; }, fin: function () { return CLOCK_FACE; } },
    letter: { draw: drawLetter, portal: function (st, o) { return rect(-40, cardTop(st, o), 80, 36, 1.2); }, fin: function () { return rect(-40, -56, 80, 36, 1.2); } },
    mask: { draw: drawMask, portal: function () { return FACE; }, fin: function () { return FACE; } },
    drum: { draw: drawDrum, portal: function () { return HEAD; }, fin: function () { return HEAD; } },
    gift: { draw: drawGift, portal: function () { return G_OPEN; }, fin: function () { return G_OPEN; } },
    church: { draw: drawChurch, portal: function () { return CH_DOOR; }, fin: function () { return CH_DOOR; } },
    chair: { draw: drawChair, portal: null, fin: null }
  };
  /* interaction state, one per object */
  var OS = {
    door: { peek: 0, kt: -99 },
    clock: { spinE: 0, st: -99 },
    letter: { peek: 0, seal: 0, kt: -99 },
    mask: { face: 0, flipE: 0, ft: -1 },
    drum: { hit: 0, lift: 0, ht: -99, rings: [] },
    gift: { card: 0, ct: -99 },
    church: { glow: 0, bt: -99 },
    chair: { side: 0, flipE: 0, ft: -1, hop: 0, ht: -99 }
  };

  /* ---------- layout: the object takes the space the words leave ---------- */
  var W = window.innerWidth, H = window.innerHeight, CW = W, CH = H, dpr = 1, BOX = [], PORT = [];
  var probe = document.createElement('canvas').getContext('2d');
  function sizeCanvas() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    CW = r.width || W; CH = r.height || H;
    var w = Math.round(CW * dpr), h = Math.round(CH * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }
  function fits(P, cx, cy, hw, hh) {
    for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) if (!probe.isPointInPath(P, cx + a * hw, cy + b * hh)) return false;
    return true;
  }
  /* the next scene lives inside this object's opening, scaled so that the screen rectangle fits inside the opening */
  function inscribe(s) {
    var B = BOX[s], cf = CFG[KIND[s]], P = OBJ[KIND[s]].fin(), bb = cf.pbox;
    probe.setTransform(B.u, 0, 0, B.u, B.cx, B.cy);
    var X0 = B.cx + bb[0] * B.u, Y0 = B.cy + bb[1] * B.u, X1 = B.cx + bb[2] * B.u, Y1 = B.cy + bb[3] * B.u;
    var cands = [], mx = 0, ix, iy, k;
    for (iy = 0; iy <= 10; iy++) for (ix = 0; ix <= 6; ix++) {
      var cx = lerp(X0, X1, 0.15 + 0.7 * ix / 6), cy = lerp(Y0, Y1, 0.1 + 0.8 * iy / 10);
      if (!probe.isPointInPath(P, cx, cy)) continue;
      var lo = 0, hi = 1;
      for (k = 0; k < 18; k++) { var m = (lo + hi) / 2; if (fits(P, cx, cy, W * m / 2, H * m / 2)) lo = m; else hi = m; }
      cands.push({ sig: lo, cx: cx, cy: cy });
      if (lo > mx) mx = lo;
    }
    /* of the (nearly) largest fits, take the one closest to the middle of the opening */
    var ccx = (X0 + X1) / 2, ccy = (Y0 + Y1) / 2, best = null, bd = 1e18;
    cands.forEach(function (c) { if (c.sig >= mx * 0.985) { var q = (c.cx - ccx) * (c.cx - ccx) + (c.cy - ccy) * (c.cy - ccy); if (q < bd) { bd = q; best = c; } } });
    if (!best) best = { sig: 0.01, cx: ccx, cy: ccy };
    return { sig: best.sig * 0.96, cx: best.cx, cy: best.cy };
  }
  function layout() {
    W = stage.clientWidth || window.innerWidth; H = stage.clientHeight || window.innerHeight;
    sizeCanvas();
    d.classList.add('measure');
    var rects = copies.map(function (c) { return c.getBoundingClientRect(); });
    var barB = bar.getBoundingClientRect().bottom, cueTop = cue.getBoundingClientRect().top;
    d.classList.remove('measure');
    var land = LAND.matches, pad = clamp(W * 0.058, 18, 72), gap = clamp(Math.min(W, H) * 0.035, 14, 36);
    for (var s = 0; s < S; s++) {
      var r = rects[s], cf = CFG[KIND[s]], x0, x1, y0, y1;
      if (!(land && r.right < W * 0.66)) { x0 = pad; x1 = W - pad; y0 = barB + gap * 0.6; y1 = r.top - gap; }
      else { x0 = r.right + gap * 2; x1 = W - pad; y0 = barB + gap * 0.6; y1 = cueTop - gap * 0.6; }
      if (y1 - y0 < 80) { y0 = barB + 4; y1 = Math.max(y0 + 80, r.top - 4); }
      var hh = Math.min(Math.min((x1 - x0) / cf.asp, y1 - y0) * cf.fill, 560);
      BOX[s] = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, u: hh / 100, w: hh * cf.asp, h: hh };
    }
    for (s = 0; s < LAST; s++) PORT[s] = inscribe(s);
  }

  /* ---------- camera ---------- */
  function cmp(A, B) { return { k: A.k * B.k, x: A.x + A.k * B.x, y: A.y + A.k * B.y }; }
  function setT(T) { g.setTransform(dpr * T.k, 0, 0, dpr * T.k, dpr * T.x, dpr * T.y); }
  var time = 0, last = 0, p = 0, pRaw = 0, introT = calm ? 9 : 0, fixedP = null;
  var par = { x: 0, y: 0, tx: 0, ty: 0 }, shake = { a: 0, x: 0, y: 0 };
  function renderScene(s, T, st, depth) {
    var B = BOX[s], kind = KIND[s], cf = CFG[kind], ob = OBJ[kind], ga = g.globalAlpha;
    setT(T);
    g.fillStyle = cf.field;
    g.fillRect(-W * 12, -H * 12, W * 25, H * 25);
    var f = depth ? 1 : st.fade, px = par.x * B.u * 3 * f, py = par.y * B.u * 2 * f;
    if (!depth && s === 0 && introT < 1.2) py += (1 - eout(clamp(introT / 1.1, 0, 1))) * B.u * 6;
    st.sx = -par.x * f;
    if (!depth && s < LAST && PORT[s]) { st.ix = (PORT[s].cx - B.cx) / B.u; st.iy = (PORT[s].cy - B.cy) / B.u; }
    var Ob = cmp(T, { k: B.u, x: B.cx + px, y: B.cy + py });
    setT(Ob);
    ob.draw(OS[kind], st, 'back');
    /* the next scene is drawn inside the opening while zooming, and also when a knock or a peek opens it a little */
    st.inner = !depth && s < LAST && (st.dep > 0 || (OS[kind].peek || 0) > 0.002);
    if (st.inner) {
      g.save();
      setT(Ob);
      g.clip(ob.portal(st, OS[kind]));
      var P = PORT[s];
      renderScene(s + 1, cmp(T, { k: P.sig, x: P.cx + px - P.sig * W / 2, y: P.cy + py - P.sig * H / 2 }), { arr: st.zp, dep: 0, zp: 0, fade: 1 }, 1);
      g.restore();
      setT(Ob);
    }
    FA = ga * (!depth && st.dep > 0 ? 1 - smooth(0.8, 0.96, st.dep) : 1);
    g.globalAlpha = FA;
    if (FA > 0.002) ob.draw(OS[kind], st, 'front');
    g.globalAlpha = ga; FA = ga;
  }
  function draw() {
    if (!BOX.length) return;
    var k = Math.floor(p), t = p - k;
    if (k >= LAST) { k = LAST; t = 0; }
    var ID = { k: 1, x: shake.x, y: shake.y };
    if (calm) {
      var e = t > 0 ? smooth(0.3, 0.7, t) : 0;
      renderScene(k, ID, { arr: 1, dep: 0, zp: 0, fade: 1 }, 0);
      if (e > 0) { g.globalAlpha = e; renderScene(k + 1, ID, { arr: 1, dep: 0, zp: 0, fade: 1 }, 0); g.globalAlpha = 1; }
      return;
    }
    var zp = t > 0 ? eio(t) : 0, T = ID;
    if (zp > 0) {
      var P = PORT[k], Z = Math.pow(P.sig, -zp);
      var qx = (P.cx - P.sig * W / 2) / (1 - P.sig), qy = (P.cy - P.sig * H / 2) / (1 - P.sig);
      T = { k: Z, x: qx * (1 - Z) + shake.x, y: qy * (1 - Z) + shake.y };
    }
    renderScene(k, T, { arr: 1, dep: t, zp: zp, fade: (1 - zp) * (1 - zp) }, 0);
  }

  /* ---------- sound (tiny synthesised effects, only after a tap) ---------- */
  var AC = null;
  function ac() {
    try {
      var A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      if (!AC) AC = new A();
      if (AC.state === 'suspended') AC.resume();
      return AC;
    } catch (e) { return null; }
  }
  function tone(a, type, f0, f1, t0, dur, vol) {
    var o = a.createOscillator(), gn = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur * 0.6);
    gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(vol, t0 + 0.006); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(gn); gn.connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(a, t0, dur, vol, type, freq, f1) {
    var len = Math.max(1, Math.floor(a.sampleRate * dur)), nb = a.createBuffer(1, len, a.sampleRate), cd = nb.getChannelData(0);
    for (var i = 0; i < len; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    var ns = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain();
    ns.buffer = nb; fl.type = type; fl.frequency.setValueAtTime(freq, t0); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t0 + dur); gn.gain.value = vol;
    ns.connect(fl); fl.connect(gn); gn.connect(a.destination); ns.start(t0);
  }
  var SND = {
    knock: function () { var a = ac(); if (!a) return; [0, 0.17].forEach(function (dt) { var t0 = a.currentTime + dt; tone(a, 'sine', 210, 120, t0, 0.12, 0.32); noise(a, t0, 0.05, 0.16, 'bandpass', 1100); }); },
    tick: function () { var a = ac(); if (!a) return; noise(a, a.currentTime, 0.03, 0.2, 'highpass', 3000); tone(a, 'sine', 1800, 1800, a.currentTime, 0.04, 0.06); },
    paper: function () { var a = ac(); if (!a) return; noise(a, a.currentTime, 0.22, 0.12, 'highpass', 2400); },
    whoosh: function () { var a = ac(); if (!a) return; noise(a, a.currentTime, 0.4, 0.22, 'bandpass', 320, 1800); },
    drum: function (xn) { var a = ac(); if (!a) return; var t0 = a.currentTime, base = 62 + xn * 80; tone(a, 'sine', base * 2.3, base, t0, 0.42, 0.5); noise(a, t0, 0.06, 0.2, 'highpass', 1500); },
    pop: function () { var a = ac(); if (!a) return; tone(a, 'sine', 520, 980, a.currentTime, 0.14, 0.18); noise(a, a.currentTime, 0.04, 0.08, 'bandpass', 2400); },
    bell: function () { var a = ac(); if (!a) return; var t0 = a.currentTime; [[784, 0.16], [1568, 0.06], [2164, 0.04], [4234, 0.02]].forEach(function (q) { tone(a, 'sine', q[0], q[0], t0, 1.8, q[1]); }); }
  };

  /* ---------- taps: every object answers ---------- */
  var ACT = {
    door: function () { OS.door.kt = time; SND.knock(); },
    clock: function () { if (time - OS.clock.st > 1.7) { OS.clock.st = time; setTimeout(SND.tick, 1550); } },
    letter: function () { OS.letter.kt = time; SND.paper(); },
    mask: function () { if (OS.mask.ft < 0) { OS.mask.ft = time; SND.whoosh(); } },
    drum: function (x) { var o = OS.drum; o.ht = time; o.rings.push(time); if (o.rings.length > 6) o.rings.shift(); SND.drum(clamp(x / W, 0, 1)); shake.a = 1; if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) { /* no haptics */ } },
    gift: function () { if (time - OS.gift.ct > 1.7) { OS.gift.ct = time; SND.pop(); } },
    church: function () { OS.church.bt = time; SND.bell(); },
    chair: function () { if (OS.chair.ft < 0) { OS.chair.ft = time; SND.paper(); } }
  };
  function updateObjects() {
    var o;
    OS.door.peek = calm ? 0 : bump((time - OS.door.kt) / 1.0);
    o = OS.clock; o.spinE = time - o.st < 1.6 ? eio(clamp((time - o.st) / 1.6, 0, 1)) : 0;
    o = OS.letter; o.peek = bump((time - o.kt) / 0.9); o.seal = bump((time - o.kt) / 0.45);
    o = OS.mask; if (o.ft >= 0) { o.flipE = clamp((time - o.ft) / 0.75, 0, 1); if (o.flipE >= 1) { o.face = 1 - o.face; o.ft = -1; o.flipE = 0; } }
    o = OS.drum; o.hit = Math.exp(-(time - o.ht) * 9); o.lift = bump((time - o.ht) / 0.32);
    o = OS.gift; var a = time - o.ct; o.card = a < 0 ? 0 : a < 0.35 ? eout(a / 0.35) : a < 1.2 ? 1 : a < 1.55 ? 1 - eio((a - 1.2) / 0.35) : 0;
    OS.church.glow = Math.exp(-(time - OS.church.bt) * 1.6);
    o = OS.chair; if (o.ft >= 0) { o.flipE = clamp((time - o.ft) / 0.7, 0, 1); if (o.flipE >= 1) { o.side = 1 - o.side; o.ft = -1; o.flipE = 0; } }
    o.hop = bump((time - o.ht) / 0.6);
  }

  /* ---------- words ---------- */
  var vis = copies.map(function () { return -1; }), lastP = -9, lastI = -9, scrCur = -1, cueOn = -1, dark = null;
  function words() {
    var ik = calm ? 1 : smooth(0.15, 0.7, introT);
    if (Math.abs(p - lastP) < 0.0004 && Math.abs(ik - lastI) < 0.002) return;
    lastP = p; lastI = ik;
    for (var s = 0; s < S; s++) {
      var l = p - s, v = l >= 0 ? 1 - smooth(0.02, 0.2, l) : smooth(-0.24, -0.04, l);
      if (s === 0) v *= ik;
      var el = copies[s];
      if (v < 0.002) { if (vis[s] !== 0) { el.style.visibility = 'hidden'; el.classList.remove('on'); vis[s] = 0; } continue; }
      if (vis[s] !== 1) { el.style.visibility = 'visible'; vis[s] = 1; }
      el.style.opacity = v.toFixed(3);
      if (!calm) el.style.scale = (l >= 0 ? 1 + l * 0.35 : 1 + l * 0.12).toFixed(4);
      el.classList.toggle('on', v > 0.5);
    }
  }
  function chrome() {
    var k = Math.floor(p), t = p - k, scr = clamp(t > 0.7 ? k + 1 : k, 0, LAST);
    if (scr !== scrCur) {
      scrCur = scr;
      var dk = TONE[scr] === 'dark';
      if (dk !== dark) { dark = dk; d.classList.toggle('dark', dk); }
      if (themeMeta) themeMeta.setAttribute('content', CFG[KIND[scr]].field);
      if (CFG[KIND[scr]].cue) cueT.textContent = CFG[KIND[scr]].cue;
      if (scr >= LAST - 1) warmKakao();
    }
    progI.style.transform = 'scaleX(' + (p / LAST).toFixed(4) + ')';
    var co = (calm ? 1 : smooth(0.9, 1.5, introT)) * (1 - smooth(LAST - 0.6, LAST - 0.2, p));
    co = Math.round(co * 100) / 100;
    if (co !== cueOn) { cueOn = co; cue.style.opacity = String(co); }
  }

  /* ---------- scroll, pointer, tilt, taps ---------- */
  function secH() { var t = track.firstElementChild; return (t && t.getBoundingClientRect().height) || window.innerHeight; }
  function readScroll() { pRaw = clamp((window.scrollY || window.pageYOffset || 0) / secH(), 0, LAST); }
  function goTo(n, instant) { window.scrollTo({ top: Math.round(n * secH()), behavior: instant || calm ? 'auto' : 'smooth' }); }
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    par.tx = clamp(e.clientX / W * 2 - 1, -1, 1); par.ty = clamp(e.clientY / H * 2 - 1, -1, 1);
  }, { passive: true });
  document.addEventListener('mouseleave', function () { par.tx = 0; par.ty = 0; });
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma === null || e.gamma === undefined || e.beta === null) return;
    par.tx = clamp(e.gamma / 30, -1, 1); par.ty = clamp((e.beta - 45) / 30, -1, 1);
  }, { passive: true });
  window.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('a,button')) return;
    var r = Math.round(p);
    if (Math.abs(p - r) > 0.06) return;
    ACT[KIND[r]](e.clientX, e.clientY);
  });
  goBtn.addEventListener('click', function () {
    try { window.localStorage.setItem('gl-going', '1'); } catch (e) { /* storage blocked */ }
    setGoing();
    OS.chair.ht = time;
    SND.pop();
  });
  var rsT = 0;
  window.addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(function () { layout(); lastP = -9; }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); lastP = -9; });

  /* ---------- loop ---------- */
  var ftimes = [];
  function frame(now) {
    window.requestAnimationFrame(frame);
    if (!last) last = now;
    var dt = clamp((now - last) / 1000, 0.001, 0.05);
    last = now;
    ftimes.push(dt); if (ftimes.length > 90) ftimes.shift();
    time += dt; introT += dt;
    readScroll();
    if (fixedP !== null) p = fixedP;
    else { p += (pRaw - p) * (calm ? 1 : 1 - Math.exp(-dt * 7)); if (Math.abs(pRaw - p) < 0.0005) p = pRaw; }
    var sk = 1 - Math.exp(-dt * 4);
    par.x += (par.tx - par.x) * sk; par.y += (par.ty - par.y) * sk;
    if (calm) { par.x = 0; par.y = 0; }
    shake.a *= Math.pow(0.86, dt * 60);
    shake.x = calm ? 0 : Math.sin(time * 73) * 3 * shake.a; shake.y = calm ? 0 : Math.cos(time * 57) * 2 * shake.a;
    updateObjects();
    draw();
    words();
    chrome();
  }

  /* ---------- start ---------- */
  layout();
  var HASH = {};
  secs.forEach(function (s, i) { HASH['#' + s.id] = i; });
  if (HASH[window.location.hash] !== undefined) goTo(HASH[window.location.hash], true);
  readScroll(); p = pRaw;
  window.requestAnimationFrame(frame);

  window.__open = {
    go: function (n) { goTo(n, true); readScroll(); p = pRaw; },
    p: function () { return p; },
    hold: function (v) { fixedP = v; if (v !== null) { p = v; draw(); } },
    ready: function () { return introT > 1.6; },
    boxes: function () { return BOX.map(function (b) { return b && { x0: b.cx - b.w / 2, x1: b.cx + b.w / 2, y0: b.cy - b.h / 2, y1: b.cy + b.h / 2 }; }); },
    ports: function () { return PORT.map(function (q) { return q && { sig: +q.sig.toFixed(4) }; }); },
    tap: function (n) { ACT[KIND[n]](W / 2, H / 2); },
    fps: function () { var s = 0; ftimes.forEach(function (x) { s += x; }); return ftimes.length ? Math.round(ftimes.length / s) : 0; }
  };
})();

