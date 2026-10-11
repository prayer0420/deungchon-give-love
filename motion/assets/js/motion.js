/* 등촌교회 2청년회 · 새생명축제 초대장 "모션 포스터" (/motion/)
   Eight flat posters on one still screen, after the motion templates on jitter.video. The camera never moves:
   scrolling cuts from one poster to the next, and each poster builds itself from short timed reveals. One red dot is
   the only thing tied to the scroll. It is the sun, the full stop, the red of the date, the marker of the programme
   list, the cross on the church and, at the end, your chair. */
(function () {
  'use strict';
  var d = document.documentElement;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pad3(n) { return ('00' + n).slice(-3); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lin(a, b, x) { return clamp((x - a) / (b - a), 0, 1); }
  function smooth(a, b, x) { var t = lin(a, b, x); return t * t * (3 - 2 * t); }
  function eio(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function ein(t) { return t * t * t; }
  function expo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function bump(x) { return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); }
  var raf = window.requestAnimationFrame.bind(window);
  function next2(fn) { raf(function () { raf(fn); }); }
  var calm = d.classList.contains('calm');
  var URL0 = 'https://prayer0420.github.io/deungchon-give-love/motion/';

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
  var shareData = { title: '새생명축제 · 11월 15일 주일 오후 2시 30분', text: '11월 15일 주일 오후 2시 30분, 등촌교회 본당에서 열리는 새생명축제에 초대해요. 같이 가요!', url: URL0 };
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
        title: '새생명축제 · 11.15 주일 오후 2:30',
        description: '등촌교회 본당에서 기다릴게요. 교회가 처음이어도, 오랜만이어도 괜찮아요.',
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

  /* ---------- calendar: .ics on Apple devices, Google Calendar elsewhere ---------- */
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
  var goBtn = $('#goBtn'), goTxt = $('#goTxt'), seatCap = $('#seatCap');
  function setGoing() {
    goBtn.classList.add('is-going');
    goBtn.querySelector('span').textContent = '11월 15일에 만나요';
    goTxt.textContent = '자리를 맡아 뒀어요. 같이 올 사람에게도 초대장을 보내 주세요.';
    seatCap.textContent = 'Reserved';
  }
  try { if (window.localStorage.getItem('gl-going') === '1') setGoing(); } catch (e) { /* storage blocked */ }

  /* ---------- live countdown to 2026-11-15 14:30 KST ---------- */
  var FE_S = Date.UTC(2026, 10, 15, 5, 30, 0), FE_E = Date.UTC(2026, 10, 15, 7, 30, 0);
  var cdEl = $('#cd'), cdMsg = '';
  function renderCd() {
    var now = Date.now(), msg;
    if (now < FE_S) {
      var s = Math.floor((FE_S - now) / 1000), dd = Math.floor(s / 86400); s -= dd * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      msg = (dd > 0 ? 'D-' + dd : 'D-DAY') + ' · ' + pad2(h) + ':' + pad2(m) + ':' + pad2(s);
    } else {
      msg = now < FE_E ? '지금 새생명축제가 열리고 있어요' : '함께해 주셔서 고마워요';
    }
    if (msg !== cdMsg) { cdMsg = msg; cdEl.textContent = msg; }
  }
  renderCd();
  setInterval(renderCd, 1000);

  /* ================= the stage ================= */
  var bgEl = $('#bg'), dotL = $('#dotL'), dA = $('#dA'), dB = $('#dB'), track = $('#track'), themeMeta = $('#themeColor');
  var secs = $$('.sc'), S = secs.length, LAST = S - 1;
  var TONE = secs.map(function (s) { return s.getAttribute('data-tone'); });
  var NAME = secs.map(function (s) { return s.getAttribute('data-name'); });
  var COL = { w: '#ffffff', g: '#ecebe8', r: '#d83a1f', k: '#0f0e10' };
  /* the date poster has no paper of its own: its red is the dot, grown to fill the screen */
  var BG = TONE.map(function (t) { return t === 'r' ? null : COL[t]; });
  var segB = $$('#segs b'), cntN = $('#cntN'), cntL = $('#cntL'), cue = $('#cue');
  var pidx = $('#pidx'), pBtns = $$('#pidx button'), mks = $$('#pidx .mk'), legs = $('#selLegs');
  var W = window.innerWidth, H = window.innerHeight;

  /* ---------- words into masks (split on ordinary spaces only, so &nbsp; stays glued) ---------- */
  function maskWord(t) {
    var m = document.createElement('span'), i = document.createElement('span');
    m.className = 'm'; i.className = 'mi'; i.textContent = t; m.appendChild(i);
    return m;
  }
  $$('[data-split]').forEach(function (el) {
    var out = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var parts = n.nodeValue.split(/[ \t\r\n]+/);
        parts.forEach(function (w, k) {
          if (w) out.appendChild(maskWord(w));
          if (k < parts.length - 1) out.appendChild(document.createTextNode(' '));
        });
      } else {
        if (n.classList && n.classList.contains('nw') && n.firstChild && n.firstChild.nodeType === 3) n.replaceChild(maskWord(n.firstChild.nodeValue), n.firstChild);
        out.appendChild(n);
      }
    });
    el.textContent = '';
    el.appendChild(out);
  });

  /* ---------- the date rolls like a counter ---------- */
  $$('.dg').forEach(function (g, i) {
    var v = +g.textContent, n = 7 + i * 2, h = '<span class="z">' + v + '</span><span class="st" aria-hidden="true">';
    for (var k = 0; k < n; k++) h += '<span>' + ((v - n + 1 + k + 100) % 10) + '</span>';
    g.innerHTML = h + '</span>';
    g.style.setProperty('--a', '-1');
    g.style.setProperty('--b', String(n - 1));
    g.style.setProperty('--d', (0.1 + i * 0.07).toFixed(2));
  });

  /* ---------- reveal order: every mask and fade-up gets its own delay ---------- */
  secs.concat([pidx]).forEach(function (s) {
    var t = 0.05;
    $$('.m > .mi, .fx', s).forEach(function (el) {
      el.style.setProperty('--d', t.toFixed(3));
      t += el.closest('[data-split]') ? 0.11 : 0.06;
    });
  });

  /* ---------- the red dot: two rounded bars. A circle is both bars on top of each other ---------- */
  function circ(x, y, r) { return { x: x, y: y, w: 2 * r, h: 2 * r, r: r }; }
  function barOf(q, k) { return { x: q.left + q.width / 2, y: q.top + q.height / 2, w: q.width, h: q.height, r: Math.min(q.width, q.height) * k }; }
  function mixB(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), r: lerp(a.r, b.r, t) }; }
  var AN = [], SUN = { x: 0, hy: 0, R: 10 }, SH = 0, dotKey = '', clipNow = '', legsNow = -1;
  function measure() {
    W = window.innerWidth; H = window.innerHeight; SH = 0;
    d.classList.add('measure');
    var a = $('#sunArt').getBoundingClientRect(), c;
    SUN = { x: a.left + a.width / 2, hy: a.bottom, R: Math.max(10, Math.min(a.width * 0.46, a.height * 0.5)) };
    var q = $('#aPeriod').getBoundingClientRect();
    c = circ(q.left + q.width / 2, q.top + q.height / 2, q.width / 2); AN[1] = { A: c, B: c };
    c = circ(W / 2, H / 2, Math.sqrt(W * W + H * H) / 2 + 4); AN[2] = { A: c, B: c };
    mks.forEach(function (m, i) {
      var r = m.getBoundingClientRect(), cc = circ(r.left + r.width / 2, r.top + r.height / 2, r.width / 2);
      AN[3 + i] = { A: cc, B: cc };
    });
    AN[6] = { A: barOf($('#crossV').getBoundingClientRect(), 0.16), B: barOf($('#crossH').getBoundingClientRect(), 0.16) };
    AN[7] = { A: barOf($('#seatBack').getBoundingClientRect(), 0.19), B: barOf($('#seatBase').getBoundingClientRect(), 0.4) };
    d.classList.remove('measure');
    dotKey = '';
  }
  /* the sun: hidden under the horizon at first, it rises once the cover has built */
  var time = 0, sunA = 0.55, sunDown = -9, sunFrom = 1;
  function sunE() {
    if (calm) return 1;
    if (time < sunA) return sunFrom * (1 - ein(lin(sunDown, sunDown + 0.45, time)));
    return expo(lin(sunA, sunA + 1.8, time));
  }
  function dotState(p) {
    var k = Math.floor(p), t = p - k, A, B, clip = null, e;
    if (calm) { k = Math.round(p); t = 0; }
    if (k >= LAST) { k = LAST; t = 0; }
    var sun0 = circ(SUN.x, SUN.hy + (SUN.R + 4) * (1 - sunE()), SUN.R);
    if (t === 0) return k === 0 ? { A: sun0, B: sun0, clip: SUN.hy } : { A: AN[k].A, B: AN[k].B, clip: null };
    switch (k) {
      case 0: /* the sun leaves the horizon, then shrinks into the full stop */
        var up = eio(lin(0, 0.24, t)), fly = eio(lin(0.24, 0.96, t)), shr = smooth(0, 0.8, fly);
        var s1 = circ(SUN.x, lerp(sun0.y, SUN.hy - SUN.R - 3, up), SUN.R), pd = AN[1].A;
        /* it shrinks faster than it travels, so it is already full-stop sized when it reaches the words */
        A = B = { x: lerp(s1.x, pd.x, fly), y: lerp(s1.y, pd.y, fly), w: lerp(s1.w, pd.w, shr), h: lerp(s1.h, pd.h, shr), r: lerp(s1.r, pd.r, shr) };
        clip = fly > 0 ? null : SUN.hy;
        break;
      case 1: /* the full stop grows until it is the whole screen, by the halfway point */
        e = ein(lin(0, 0.5, t)); A = B = mixB(AN[1].A, AN[2].A, e);
        break;
      case 2: /* the red collapses into the first programme marker */
        e = smooth(0, 0.56, t); A = B = mixB(AN[2].A, AN[3].A, e);
        break;
      case 3: case 4: /* marker to marker, stretching a little on the way */
        e = eio(lin(0.08, 0.92, t)); A = mixB(AN[k].A, AN[k + 1].A, e);
        var s = bump(e); A.h *= 1 + 1.1 * s; A.w *= 1 - 0.18 * s; A.r = Math.min(A.w, A.h) / 2; B = A;
        break;
      case 5: /* a dot flies to the tower and opens into the cross */
        e = eio(lin(0.06, 0.94, t));
        var rT = Math.max(AN[6].A.w, AN[6].B.h) * 0.9, m = smooth(0.62, 1, e);
        var C = circ(lerp(AN[5].A.x, AN[6].A.x, e), lerp(AN[5].A.y, AN[6].A.y, e), lerp(AN[5].A.r, rT, e));
        A = mixB(C, AN[6].A, m); B = mixB(C, AN[6].B, m);
        break;
      default: /* the cross becomes a chair: the upright turns into the back, the beam into the seat */
        e = eio(lin(0.06, 0.94, t)); A = mixB(AN[6].A, AN[7].A, e); B = mixB(AN[6].B, AN[7].B, e);
    }
    return { A: A, B: B, clip: clip };
  }
  function putBar(el, b) {
    el.style.width = b.w.toFixed(2) + 'px';
    el.style.height = b.h.toFixed(2) + 'px';
    el.style.borderRadius = Math.max(0, Math.min(b.r, b.w / 2, b.h / 2)).toFixed(2) + 'px';
    el.style.transform = 'translate3d(' + (b.x - b.w / 2).toFixed(2) + 'px,' + (b.y - b.h / 2).toFixed(2) + 'px,0)';
  }
  var p = 0, pRaw = 0, fixedP = null;
  function drawDot() {
    var s = dotState(p);
    var key = [s.A.x, s.A.y, s.A.w, s.A.h, s.B.x, s.B.y, s.B.w, s.B.h, s.clip === null ? -1 : s.clip].map(function (v) { return Math.round(v * 4); }).join(',');
    if (key !== dotKey) {
      dotKey = key;
      putBar(dA, s.A);
      putBar(dB, s.B);
      var cl = s.clip === null ? 'none' : 'inset(0 0 ' + Math.max(0, H - s.clip).toFixed(1) + 'px 0)';
      if (cl !== clipNow) { clipNow = cl; dotL.style.clipPath = cl; }
    }
    var lg = p >= LAST ? 1 : smooth(0.86, 1, p - (LAST - 1));
    lg = Math.round(lg * 100) / 100;
    if (lg !== legsNow) { legsNow = lg; legs.style.opacity = String(lg); }
  }

  /* ---------- hard cuts: the poster under the dot changes at the halfway point ---------- */
  var cur = -1, bgNow = '', liftKey = '', segNow = [];
  function activate(n) {
    if (n === cur) return;
    var old = cur;
    cur = n;
    if (old >= 0) {
      var o = secs[old];
      o.classList.add('cut');
      o.classList.remove('on', 'in');
      o.style.transform = '';
      o.style.opacity = '';
      void o.offsetWidth;
      o.classList.remove('cut');
      if (old === 5) tagEl.classList.remove('on');
    }
    var s = secs[n];
    s.classList.add('on');
    next2(function () { if (cur === n) s.classList.add('in'); });
    var prog = n >= 3 && n <= 5, was = old >= 3 && old <= 5;
    if (prog && !was) {
      pidx.classList.add('cut'); pidx.classList.remove('in'); void pidx.offsetWidth; pidx.classList.remove('cut');
      pidx.classList.add('on');
      next2(function () { if (cur === n) pidx.classList.add('in'); });
    }
    if (!prog) pidx.classList.remove('on', 'in');
    pBtns.forEach(function (b, i) {
      b.classList.toggle('cur', i === n - 3);
      if (i === n - 3) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    d.setAttribute('data-tone', TONE[n]);
    d.setAttribute('data-scene', String(n));
    if (themeMeta) themeMeta.setAttribute('content', COL[TONE[n]]);
    cntN.textContent = pad2(n + 1);
    cntL.textContent = NAME[n];
    cue.classList.toggle('off', n === LAST);
    liftKey = '';
    if (n >= LAST - 1) warmKakao();
  }
  function paintBg() {
    var c = BG[cur];
    if (c === null) c = p >= cur ? BG[cur + 1] : BG[cur - 1];
    if (c !== bgNow) { bgNow = c; bgEl.style.backgroundColor = c; d.style.backgroundColor = c; }
  }
  /* while you drag, the poster you are leaving lifts and dims a little; the next one settles into place */
  function lift() {
    if (calm) return;
    var dl = clamp(p - cur, -0.5, 0.5), u = Math.abs(dl) / 0.5;
    var y = (dl > 0 ? -1 : 1) * 16 * eio(u), op = 1 - 0.55 * u;
    var key = y.toFixed(1) + '|' + op.toFixed(2);
    if (key === liftKey) return;
    liftKey = key;
    var s = secs[cur];
    s.style.transform = u > 0.002 ? 'translate3d(0,' + y.toFixed(2) + 'px,0)' : '';
    s.style.opacity = u > 0.002 ? op.toFixed(3) : '';
  }
  function segs() {
    for (var i = 0; i < S; i++) {
      var v = Math.round(clamp(p - i + 1, 0, 1) * 1000) / 1000;
      if (v !== segNow[i]) { segNow[i] = v; segB[i].style.transform = 'scaleX(' + v + ')'; }
    }
  }

  /* ---------- sound: tiny synthesised effects, only after a tap ---------- */
  var AC = null;
  function ac() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!AC) AC = new Ctx();
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
  function noise(a, t0, dur, vol, type, freq) {
    var len = Math.max(1, Math.floor(a.sampleRate * dur)), nb = a.createBuffer(1, len, a.sampleRate), cd = nb.getChannelData(0);
    for (var i = 0; i < len; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    var ns = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain();
    ns.buffer = nb; fl.type = type; fl.frequency.value = freq; gn.gain.value = vol;
    ns.connect(fl); fl.connect(gn); gn.connect(a.destination); ns.start(t0);
  }
  var SND = {
    rise: function () { var a = ac(); if (!a) return; var t0 = a.currentTime + 0.45; [[523, 0.07], [784, 0.05], [1046, 0.025]].forEach(function (q, i) { tone(a, 'sine', q[0], q[0], t0 + i * 0.09, 1.4, q[1]); }); },
    roll: function () { var a = ac(); if (!a) return; var t = a.currentTime + 0.1, gap = 0.035; for (var i = 0; i < 11; i++) { noise(a, t, 0.02, 0.14, 'highpass', 3200); t += gap; gap *= 1.22; } },
    shutter: function () { var a = ac(); if (!a) return; var t0 = a.currentTime; noise(a, t0, 0.035, 0.24, 'highpass', 2600); noise(a, t0 + 0.07, 0.05, 0.16, 'bandpass', 1400); },
    drum: function (xn) { var a = ac(); if (!a) return; var t0 = a.currentTime, base = 62 + xn * 80; tone(a, 'sine', base * 2.3, base, t0, 0.42, 0.5); noise(a, t0, 0.06, 0.2, 'highpass', 1500); },
    pop: function () { var a = ac(); if (!a) return; tone(a, 'sine', 520, 980, a.currentTime, 0.14, 0.18); noise(a, a.currentTime, 0.04, 0.08, 'bandpass', 2400); },
    bell: function () { var a = ac(); if (!a) return; var t0 = a.currentTime; [[784, 0.16], [1568, 0.06], [2164, 0.04], [4234, 0.02]].forEach(function (q) { tone(a, 'sine', q[0], q[0], t0, 1.8, q[1]); }); }
  };

  /* ---------- taps: each poster answers once, briefly, then stays still ---------- */
  var dateT = $('.date-t'), mimeL = $$('#mimePh .ph-l'), mimeN = $('#mimeN'), mimeC = 0, mimeSpare = 1, mimeBusy = false;
  var stack = $('#stack'), sris = $$('.sri', stack), hitsEl = $('#hits'), hits = 0, taps = [];
  var tagEl = $('#tag'), churchEl = $('#church');
  mimeL[1].setAttribute('data-c', '0');
  function mimeNext() {
    if (mimeBusy) return;
    mimeBusy = true;
    mimeC = (mimeC + 1) % 3;
    var sp = mimeL[mimeSpare], fr = mimeL[1 - mimeSpare];
    sp.setAttribute('data-c', String(mimeC));
    sp.classList.add('nx');
    void sp.offsetWidth;
    sp.classList.add('go');
    mimeN.textContent = pad2(mimeC + 1) + '/03';
    SND.shutter();
    setTimeout(function () {
      fr.setAttribute('data-c', String(mimeC));
      sp.classList.remove('nx', 'go');
      mimeSpare = 1 - mimeSpare;
      mimeBusy = false;
    }, calm ? 30 : 840);
  }
  function nantaHit(x) {
    hits++;
    var now = window.performance.now();
    if (taps.length && now - taps[taps.length - 1] > 2500) taps = [];
    taps.push(now);
    if (taps.length > 6) taps.shift();
    var bpm = '---';
    if (taps.length >= 3) {
      var iv = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
      if (iv > 180 && iv < 2000) bpm = pad3(Math.round(60000 / iv));
    }
    hitsEl.textContent = 'Hits ' + pad3(hits) + ' · BPM ' + bpm;
    if (!calm) { stack.classList.add('hit'); void stack.offsetWidth; stack.classList.remove('hit'); }
    sris.forEach(function (s, i) { s.classList.remove('fl'); s.style.animationDelay = (i * 0.05) + 's'; });
    void stack.offsetWidth;
    sris.forEach(function (s) { s.classList.add('fl'); });
    SND.drum(clamp(x / W, 0, 1));
    if (navigator.vibrate) { try { navigator.vibrate(10); } catch (e) { /* no haptics */ } }
  }
  var ACT = {
    0: function () { if (!calm && time > sunA + 1.4) { sunFrom = sunE(); sunDown = time; sunA = time + 0.5; SND.rise(); } },
    2: function () { if (calm) return; dateT.classList.add('rr'); void dateT.offsetWidth; dateT.classList.remove('rr'); SND.roll(); },
    3: mimeNext,
    4: nantaHit,
    5: function () { tagEl.classList.toggle('on'); SND.pop(); },
    6: function () { churchEl.classList.remove('ring'); void churchEl.offsetWidth; churchEl.classList.add('ring'); SND.bell(); }
  };

  /* ---------- scroll, taps, resize ---------- */
  function secH() { if (!SH) { var t = track.firstElementChild; SH = (t && t.getBoundingClientRect().height) || window.innerHeight; } return SH; }
  function readScroll() { pRaw = clamp((window.scrollY || window.pageYOffset || 0) / secH(), 0, LAST); }
  function goTo(n, instant) { window.scrollTo({ top: Math.round(n * secH()), behavior: instant || calm ? 'auto' : 'smooth' }); }
  window.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('a,button')) return;
    if (cur < 0 || Math.abs(p - cur) > 0.06) return;
    var f = ACT[cur];
    if (f) f(e.clientX, e.clientY);
  });
  pBtns.forEach(function (b) { b.addEventListener('click', function () { goTo(+b.getAttribute('data-go')); }); });
  goBtn.addEventListener('click', function () {
    try { window.localStorage.setItem('gl-going', '1'); } catch (e) { /* storage blocked */ }
    setGoing();
    SND.pop();
  });
  var rsT = 0;
  window.addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(measure, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  /* ---------- loop ---------- */
  var last = 0, ftimes = [];
  function frame(now) {
    raf(frame);
    if (!last) last = now;
    var dt = clamp((now - last) / 1000, 0.001, 0.05);
    last = now;
    ftimes.push(dt); if (ftimes.length > 90) ftimes.shift();
    time += dt;
    readScroll();
    if (fixedP !== null) p = fixedP;
    else { p += (pRaw - p) * (calm ? 1 : 1 - Math.exp(-dt * 12)); if (Math.abs(pRaw - p) < 0.0005) p = pRaw; }
    if (cur < 0 || Math.abs(p - cur) > 0.52) activate(clamp(Math.round(p), 0, LAST));
    paintBg();
    lift();
    drawDot();
    segs();
  }

  /* ---------- start ---------- */
  measure();
  var HASH = {};
  secs.forEach(function (s, i) { HASH['#' + s.id] = i; });
  if (HASH[window.location.hash] !== undefined) goTo(HASH[window.location.hash], true);
  readScroll();
  p = pRaw;
  raf(frame);

  window.__motion = {
    go: function (n) { goTo(n, true); readScroll(); p = pRaw; },
    p: function () { return p; },
    cur: function () { return cur; },
    hold: function (v) { fixedP = v; if (v !== null) p = v; },
    ready: function () { return cur >= 0 && time > 2.2; },
    tap: function (n) { var f = ACT[n]; if (f) f(W / 2, H / 2); },
    sun: function () { var e = sunE(); return { x: SUN.x, hy: SUN.hy, R: SUN.R, top: SUN.hy + SUN.R * (1 - e) - SUN.R, e: e }; },
    dot: function () { var a = dA.getBoundingClientRect(), b = dB.getBoundingClientRect(); return { x0: Math.min(a.left, b.left), y0: Math.min(a.top, b.top), x1: Math.max(a.right, b.right), y1: Math.max(a.bottom, b.bottom) }; },
    fps: function () { var s = 0; ftimes.forEach(function (x) { s += x; }); return ftimes.length ? Math.round(ftimes.length / s) : 0; }
  };
})();
