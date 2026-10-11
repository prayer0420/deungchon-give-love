/* 등촌교회 2청년회 · 새생명축제 초대장 "체크" (/check/)
   An explainer in nine beats, after the Claude motion-graphics prompt shared on oaiwan.kr (question, model, proof,
   turn, payoff). One object stays alive the whole way: the list of worries about going to church. Each programme
   crosses one worry out. Every frame is a pure function of one number t, the scroll position counted in beats:
   paint(t) draws it, and window.seek(t) paints any frame on demand. */
(function () {
  'use strict';
  var d = document.documentElement;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lin(a, b, x) { return clamp((x - a) / (b - a), 0, 1); }
  function smooth(a, b, x) { var t = lin(a, b, x); return t * t * (3 - 2 * t); }
  function eio(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  /* custom ease: quick start, long settle, no overshoot */
  function ease(t) { return 1 - Math.pow(1 - t, 3.4); }
  function bump(x) { return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); }
  var raf = window.requestAnimationFrame.bind(window);
  var calm = d.classList.contains('calm');
  var URL0 = 'https://prayer0420.github.io/deungchon-give-love/check/';
  /* style writes go through a cache so a still frame costs nothing */
  var memo = typeof WeakMap === 'function' ? new WeakMap() : null;
  function css(el, prop, val) {
    if (memo) { var m = memo.get(el); if (!m) { m = {}; memo.set(el, m); } if (m[prop] === val) return; m[prop] = val; }
    if (prop.charAt(0) === '-') el.style.setProperty(prop, val); else el.style[prop] = val;
  }
  function f3(v) { return (Math.round(v * 1000) / 1000).toString(); }

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
  var shareData = { title: '교회는 처음이면 어색할 것 같죠? · 2026 새생명축제', text: '11월 15일 주일 오후 2시 30분, 등촌교회 본당. 걱정은 하나씩 지워 드릴게요. 같이 가요!', url: URL0 };
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
        title: '교회는 처음이면 어색할 것 같죠?',
        description: '2026 새생명축제 · 11.15 주일 오후 2:30 · 등촌교회 본당',
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
  ['pointerenter', 'touchstart', 'focus'].forEach(function (ev) { shareBtn.addEventListener(ev, warmKakao, { passive: true }); });
  shareBtn.addEventListener('click', function () {
    if (kakaoReady()) { try { sendKakao(window.Kakao); } catch (e) { shareSheet(); } return; }
    if (KAKAO_KEY) loadKakao().then(sendKakao).catch(copyShare);
    else shareSheet();
  });

  /* ---------- calendar: .ics on Apple devices, Google Calendar elsewhere ---------- */
  if (!/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
    $$('[data-gcal]').forEach(function (a) {
      a.href = a.getAttribute('data-gcal');
      a.removeAttribute('download');
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

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
      msg = now < FE_E ? '지금 열리고 있어요' : '함께해 주셔서 고마워요';
    }
    if (msg !== cdMsg) { cdMsg = msg; cdEl.textContent = msg; }
  }
  renderCd();
  setInterval(renderCd, 1000);

  /* ---------- sound: a quiet procedural bed at 72 BPM, and one motif that returns when a worry is crossed out ---------- */
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
  var BPM = 72, SPB = 60 / BPM;
  /* Dmaj9, Bm9, Gmaj9, A6/9, two bars each */
  var CHORDS = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 59], [45, 52, 59, 61, 66]];
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function padNote(a, out, m, t0, dur, g) {
    [-5, 5].forEach(function (c) {
      var o = a.createOscillator(), v = a.createGain();
      o.type = 'triangle'; o.frequency.value = hz(m); o.detune.value = c;
      v.gain.setValueAtTime(0, t0);
      v.gain.linearRampToValueAtTime(g, t0 + 1.4);
      v.gain.setValueAtTime(g, t0 + dur - 0.1);
      v.gain.linearRampToValueAtTime(0, t0 + dur + 2);
      o.connect(v); v.connect(out); o.start(t0); o.stop(t0 + dur + 2.05);
    });
  }
  function pluck(a, out, m, t0, g, len) {
    var o = a.createOscillator(), v = a.createGain();
    o.type = 'sine'; o.frequency.value = hz(m);
    v.gain.setValueAtTime(0.0001, t0);
    v.gain.exponentialRampToValueAtTime(g, t0 + 0.012);
    v.gain.exponentialRampToValueAtTime(0.0001, t0 + (len || 1.1));
    o.connect(v); v.connect(out); o.start(t0); o.stop(t0 + (len || 1.1) + 0.05);
  }
  /* schedules every bed event whose beat falls inside [from, to); used live and by the offline level check */
  function scheduleBed(a, out, origin, from, to) {
    var b0 = Math.ceil((from - origin) / SPB - 1e-6), b1 = Math.ceil((to - origin) / SPB - 1e-6) - 1;
    for (var b = Math.max(0, b0); b <= b1; b++) {
      var t = origin + b * SPB, beat = b % 4, bar = Math.floor(b / 4), ch = CHORDS[Math.floor(bar / 2) % 4];
      if (b % 8 === 0) ch.forEach(function (m) { padNote(a, out, m, t, 8 * SPB, 0.02); });
      if (beat === 0 || beat === 2) pluck(a, out, ch[0] + 12, t, beat === 0 ? 0.07 : 0.045);
      if (beat === 3 && bar % 2 === 1) pluck(a, out, ch[2] + 12, t + SPB / 2, 0.03);
    }
  }
  function motif(a, out, t0, full) {
    (full ? [86, 90, 93, 98] : [86, 90, 93]).forEach(function (m, i) {
      pluck(a, out, m, t0 + i * SPB / 4, 0.06, 1.6);
      pluck(a, out, m + 12, t0 + i * SPB / 4, 0.012, 0.9);
    });
  }
  var SND = { on: false, bus: null, timer: 0, origin: 0, until: 0 };
  function soundOn() {
    var a = ac();
    if (!a) return false;
    var lp = a.createBiquadFilter(), mix = a.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 1700; lp.Q.value = 0.4;
    mix.gain.value = 0;
    lp.connect(mix); mix.connect(a.destination);
    mix.gain.setTargetAtTime(1.8, a.currentTime, 0.5);
    SND.bus = { lp: lp, mix: mix };
    SND.origin = a.currentTime + 0.1; SND.until = SND.origin; SND.on = true;
    function tick() { var to = a.currentTime + 0.4; if (to > SND.until) { scheduleBed(a, lp, SND.origin, SND.until, to); SND.until = to; } }
    tick();
    SND.timer = setInterval(tick, 80);
    return true;
  }
  function soundOff() {
    if (!SND.bus) return;
    var a = ac(), bus = SND.bus;
    SND.on = false; clearInterval(SND.timer); SND.bus = null;
    bus.mix.gain.setTargetAtTime(0, a.currentTime, 0.2);
    setTimeout(function () { try { bus.mix.disconnect(); } catch (e) { /* already gone */ } }, 1500);
  }
  function cue(full) {
    if (!SND.on || !SND.bus) return;
    var a = ac(), e8 = SPB / 2, t0 = SND.origin + Math.ceil((a.currentTime + 0.03 - SND.origin) / e8) * e8;
    motif(a, SND.bus.mix, t0, full);
  }
  var sndBtn = $('#sndBtn'), sndT = $('#sndT');
  sndBtn.addEventListener('click', function () {
    var on = SND.on ? (soundOff(), false) : soundOn();
    sndBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    sndT.textContent = on ? '소리 끄기' : '소리 켜기';
    if (!on && !SND.on && sndBtn.getAttribute('aria-pressed') === 'false' && !AC) toast('이 브라우저에서는 소리를 낼 수 없어요.');
  });
  document.addEventListener('visibilitychange', function () {
    if (!AC) return;
    if (document.hidden) AC.suspend(); else if (SND.on) AC.resume();
  });
  function noiseHit(a, t0, dur, vol, type, freq) {
    var len = Math.max(1, Math.floor(a.sampleRate * dur)), nb = a.createBuffer(1, len, a.sampleRate), cd = nb.getChannelData(0);
    var seed = 7;
    for (var i = 0; i < len; i++) { seed = (seed * 16807) % 2147483647; cd[i] = ((seed / 2147483647) * 2 - 1) * Math.pow(1 - i / len, 2); }
    var ns = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain();
    ns.buffer = nb; fl.type = type; fl.frequency.value = freq; gn.gain.value = vol;
    ns.connect(fl); fl.connect(gn); gn.connect(a.destination); ns.start(t0);
  }
  var FX = {
    kick: function (a, t0) { var o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(48, t0 + 0.18); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.55, t0 + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + 0.45); },
    snare: function (a, t0) { noiseHit(a, t0, 0.16, 0.32, 'bandpass', 1900); pluck(a, a.destination, 57, t0, 0.12, 0.12); },
    shutter: function () { var a = ac(); if (!a) return; noiseHit(a, a.currentTime, 0.035, 0.22, 'highpass', 2600); noiseHit(a, a.currentTime + 0.07, 0.05, 0.15, 'bandpass', 1400); },
    pop: function () { var a = ac(); if (!a) return; var o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime; o.frequency.setValueAtTime(520, t0); o.frequency.exponentialRampToValueAtTime(980, t0 + 0.09); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + 0.2); },
    bell: function () { var a = ac(); if (!a) return; var t0 = a.currentTime; [[784, 0.14], [1568, 0.05], [2164, 0.035], [4234, 0.018]].forEach(function (q) { pluck(a, a.destination, 69 + 12 * Math.log(q[0] / 440) / Math.LN2, t0, q[1], 1.8); }); }
  };

  /* ================= the stage ================= */
  var stage = $('#stage'), frames = $$('.fr'), N = frames.length, LAST = N - 1, track = $('#track');
  var list = $('#list'), cells = $$('.cell', list), cntEl = $('#cnt'), progI = $('#progI');
  var cntN = $('#cntN'), cntL = $('#cntL'), cueEl = $('#cue');
  var slots = frames.map(function (f) { return $('.slot', f); });
  var NAMES = ['걱정', '새생명축제', '무언극', '난타', '웰컴키트', '2청년회', '본당', '괜찮아요', '갈게요'];
  stage.appendChild(list);

  /* the whole film in one place: what each beat teaches, which worry it crosses out, and the windows of every move
     inside a step from one beat to the next (0 = leaving the last beat, 1 = arriving) */
  var TIMELINE = {
    beats: [
      { id: 'question', teaches: '교회는 처음이면 어색할 것 같다' },
      { id: 'model', teaches: '이날은 처음 오는 사람을 위해 준비한 날이다' },
      { id: 'mime', teaches: '말을 몰라도 볼 수 있다' },
      { id: 'nanta', teaches: '노래를 몰라도 즐길 수 있다' },
      { id: 'kit', teaches: '준비물 없이 와도 된다' },
      { id: 'people', teaches: '아는 사람이 없어도 된다' },
      { id: 'place', teaches: '앉을 자리는 맡아 둔다' },
      { id: 'turn', teaches: '처음이든 오랜만이든 같다' },
      { id: 'payoff', teaches: '필요한 건 오는 것뿐이다' }
    ],
    move: { exit: [0, 0.32], reframe: [0.06, 0.7], visual: [0.3, 0.78], words: [0.48, 0.98], strike: [0.66, 0.97] },
    cue: { strike: 'motif', last: 'motif with the octave' }
  };
  var ITEM_BEAT = cells.map(function (c) { return +c.getAttribute('data-go'); });
  ITEM_BEAT.forEach(function (b, i) { TIMELINE.beats[b].strikes = i; });

  /* frames: every [data-r] element reveals in order, every [data-v] picture opens from the bottom */
  var FR = frames.map(function (f, b) {
    return {
      el: f, b: b, on: null, hold: null,
      items: $$('[data-r]', f).map(function (el) { return { el: el, lines: el.getAttribute('data-r') === 'lines' ? $$('.mi', el) : null }; }),
      vis: $$('[data-v]', f).filter(function (v) { return v.getAttribute('data-v') !== 'draw'; })
    };
  });

  /* ---------- layout: measure where the list sits in every beat ---------- */
  var W = 0, H = 0, SH = 0, wide = false, G = [];
  var WIDE = window.matchMedia('(min-aspect-ratio: 11/10)');
  function measure() {
    W = window.innerWidth; H = window.innerHeight; SH = 0; wide = WIDE.matches;
    css(list, '--k', '0'); var h0 = list.offsetHeight;
    css(list, '--k', '1'); var h1 = list.offsetHeight;
    slots.forEach(function (s, b) {
      var k = !wide && b >= 1 && b <= 7 ? 1 : 0;
      s.style.height = (k ? h1 : h0) + 'px';
      s.setAttribute('data-k', String(k));
    });
    slots.forEach(function (s, b) {
      var r = s.getBoundingClientRect();
      G[b] = { x: r.left, y: r.top, w: r.width, k: +s.getAttribute('data-k') };
    });
    /* pictures with a natural size are scaled down to fit their box, never up */
    $$('.fit').forEach(function (el) {
      el.style.setProperty('--fit', '1');
      var box = el.parentNode, s = Math.min(1, box.clientHeight / Math.max(1, el.offsetHeight), box.clientWidth / Math.max(1, el.offsetWidth));
      el.style.setProperty('--fit', s.toFixed(4));
    });
    lastT = null;
  }

  /* ---------- the list ---------- */
  var lastDone = -1;
  function paintList(t) {
    var g, intro = t < 0 ? smooth(-0.9, -0.3, t) : 1;
    if (t <= 0) g = G[0];
    else if (t >= LAST) g = G[LAST];
    else {
      var b = Math.floor(t), e = eio(lin(TIMELINE.move.reframe[0], TIMELINE.move.reframe[1], t - b)), A = G[b], C = G[b + 1];
      g = { x: lerp(A.x, C.x, e), y: lerp(A.y, C.y, e), w: lerp(A.w, C.w, e), k: lerp(A.k, C.k, e) };
    }
    css(list, 'width', Math.round(g.w) + 'px');
    css(list, '--k', f3(g.k));
    css(list, 'transform', 'translate3d(' + Math.round(g.x) + 'px,' + Math.round(g.y + (1 - intro) * 24) + 'px,0)');
    css(list, 'opacity', f3(intro));
    var done = 0, sw = TIMELINE.move.strike;
    cells.forEach(function (c, i) {
      var B = ITEM_BEAT[i], s = lin(B - 1 + sw[0], B - 1 + sw[1], t);
      if (s >= 1) done++;
      css(c, '--s', f3(eio(lin(0, 0.62, s))));
      css(c, '--tk', f3(1 - lin(0.38, 0.9, s)));
      css(c, '--f', f3(lin(0.3, 0.6, s)));
      css(c, '--a', f3(lin(0.55, 1, s)));
      css(c, '--h', f3(bump(s) * 0.95));
      c.setAttribute('aria-label', c.querySelector('.lab').textContent + (s >= 1 ? ', 해결: ' + c.querySelector('.ann').textContent : ''));
    });
    if (done !== lastDone) {
      if (lastDone >= 0 && done > lastDone) cue(done === cells.length);
      lastDone = done;
      cntEl.textContent = done + '/' + cells.length;
    }
  }

  /* ---------- frames ---------- */
  function paintFrames(t) {
    var mv = TIMELINE.move;
    FR.forEach(function (F) {
      var dl = t - F.b, on = dl > -1 && dl < 1, hold = Math.abs(dl) < 0.04;
      if (on !== F.on) { F.on = on; F.el.classList.toggle('on', on); }
      if (hold !== F.hold) { F.hold = hold; F.el.classList.toggle('hold', hold); }
      if (!on) return;
      var uin = dl < 0 ? 1 + dl : 1, uout = dl > 0 ? dl : 0;
      F.items.forEach(function (it, j) {
        var a0 = Math.min(mv.words[0] + j * 0.06, 0.7), x = smooth(mv.exit[0] + j * 0.012, mv.exit[1] + j * 0.012, uout);
        if (it.lines) {
          it.lines.forEach(function (ln, q) {
            var r = ease(lin(a0 + q * 0.05, Math.min(a0 + q * 0.05 + 0.28, mv.words[1]), uin));
            css(ln, 'transform', 'translate3d(0,' + ((1 - r) * 108 - x * 108).toFixed(2) + '%,0)');
          });
        } else {
          var r = ease(lin(a0, Math.min(a0 + 0.28, mv.words[1]), uin));
          css(it.el, 'opacity', f3(r * (1 - x)));
          css(it.el, 'transform', r * (1 - x) >= 0.999 ? 'none' : 'translate3d(0,' + ((1 - r) * 14 - x * 10).toFixed(2) + 'px,0)');
        }
      });
      F.vis.forEach(function (v) {
        var rv = ease(lin(mv.visual[0], mv.visual[1], uin)), xv = ease(lin(0, mv.exit[1] + 0.04, uout));
        css(v, 'clipPath', rv >= 1 && xv <= 0 ? 'none' : 'inset(' + ((1 - rv) * 100).toFixed(2) + '% 0 ' + (xv * 100).toFixed(2) + '% 0)');
      });
    });
  }

  /* ---------- pictures that move with t ---------- */
  var KICK = [1, 0, 0, 1, 0, 0, 1, 0], SNARE = [0, 0, 1, 0, 1, 0, 0, 1];
  var rhCells = $$('#rh .sc'), rhPh = $('#rhPh'), rhPlay = 0;
  function paintRhythm(t, now) {
    var dl = t - 3;
    if (dl <= -1 || dl >= 1) return;
    var pos = dl < 0 ? ease(lin(0.42, 0.96, 1 + dl)) : 1;
    if (rhPlay) pos = clamp((now - rhPlay) / 1600, 0, 1);
    var x = 62 + pos * 255;
    css(rhPh, 'transform', 'translateX(' + (x - 62).toFixed(2) + 'px)');
    css(rhPh, 'opacity', f3(1 - smooth(0.9, 1, pos)));
    rhCells.forEach(function (c) {
      var lit = x >= 62 + (+c.getAttribute('data-s')) * 33 + 12;
      if (c._lit !== lit) { c._lit = lit; c.classList.toggle('lit', lit); }
    });
  }
  var calSun = $$('.cal-d[data-sun]'), calFest = $('.cal-d.fest');
  function paintCal(t) {
    var dl = t - 5;
    if (dl <= -1 || dl >= 1) return;
    var u = dl < 0 ? 1 + dl : 1;
    calSun.forEach(function (c) { var k = +c.getAttribute('data-sun'); css(c, '--dot', f3(ease(lin(0.5 + k * 0.06, 0.62 + k * 0.06, u)))); });
    var ring = ease(lin(0.8, 0.97, u));
    css(calFest, '--ring', f3(ring));
    if (calFest._lit !== ring > 0.5) { calFest._lit = ring > 0.5; calFest.classList.toggle('lit', ring > 0.5); }
  }
  var church = $('#church'), chPaths = $$('#church .ln > *'), chDots = $$('#church .pf circle'), chCross = $('#church .cr');
  chDots.forEach(function (c) { c.style.setProperty('--i', c.getAttribute('data-i')); });
  function paintChurch(t) {
    var dl = t - 6;
    if (dl <= -1 || dl >= 1) return;
    var u = dl < 0 ? 1 + dl : 1, x = smooth(0, 0.34, dl > 0 ? dl : 0);
    chPaths.forEach(function (p, k) { css(p, 'strokeDashoffset', f3(1 - ease(lin(0.3 + k * 0.035, 0.78 + k * 0.02, u)))); });
    chDots.forEach(function (c) { var i = +c.getAttribute('data-i'); css(c, 'opacity', f3(lin(0.72 + i * 0.006, 0.8 + i * 0.006, u))); });
    var cv = ease(lin(0.84, 0.97, u));
    css(chCross, 'opacity', f3(cv));
    css(chCross, 'transform', 'scale(' + f3(0.6 + 0.4 * cv) + ')');
    css(church, 'opacity', f3(1 - x));
  }
  var segI = $('#segI'), segBtns = $$('#seg button'), resT = $('#resT'), choice = 0, resIdx = -1, segTw = null;
  var RES = ['처음 오신 분께 웰컴키트를 드려요', '다시 오신 걸 반갑게 맞을게요', '친구와 함께 오면 더 좋아요'];
  function paintSeg(t, now) {
    var dl = t - 7;
    if (dl <= -1 || dl >= 1) return;
    /* the turn: on the way in the variable runs through its values, the crossed-out worry stays crossed out */
    var x = lerp(2, choice, eio(lin(0.36, 0.92, dl < 0 ? 1 + dl : 1)));
    if (segTw) { var k = clamp((now - segTw.t0) / 420, 0, 1); x = lerp(segTw.from, choice, ease(k)); if (k >= 1) segTw = null; }
    css(segI, '--x', f3(x));
    var near = Math.round(x);
    segBtns.forEach(function (b, i) { if (b._cur !== (i === near)) { b._cur = i === near; b.classList.toggle('cur', i === near); } });
    if (near !== resIdx) { resIdx = near; resT.textContent = RES[near]; }
  }

  /* ---------- chrome ---------- */
  var lastBeat = -1;
  function paintChrome(t) {
    css(progI, 'transform', 'scaleX(' + f3(clamp(t / LAST, 0, 1)) + ')');
    var b = clamp(Math.round(t), 0, LAST);
    if (b !== lastBeat) { lastBeat = b; cntN.textContent = pad2(b + 1); cntL.textContent = NAMES[b]; if (b >= LAST - 1) warmKakao(); }
    css(cueEl, 'opacity', f3((t < -0.3 ? 0 : 1) * (1 - smooth(LAST - 0.6, LAST - 0.15, t))));
  }

  var lastT = null;
  function paint(t, now) {
    if (t !== lastT) { lastT = t; paintList(t); paintFrames(t); paintCal(t); paintChurch(t); paintChrome(t); }
    paintRhythm(t, now);
    paintSeg(t, now);
  }

  /* ---------- taps ---------- */
  var mimePh = $('#mimePh'), tagEl = $('#tag');
  var TAP = {
    mime: function () { mimePh.setAttribute('data-c', String((+mimePh.getAttribute('data-c') + 1) % 3)); FX.shutter(); },
    nanta: function () {
      if (rhPlay) return;
      rhPlay = window.performance.now();
      var a = ac();
      if (a) for (var i = 0; i < 8; i++) { var t0 = a.currentTime + 0.02 + i * 0.2; if (KICK[i]) FX.kick(a, t0); if (SNARE[i]) FX.snare(a, t0); }
      setTimeout(function () { rhPlay = 0; lastT = null; }, 1700);
    },
    kit: function () { tagEl.classList.toggle('on'); FX.pop(); },
    church: function () { church.classList.remove('ring'); void church.offsetWidth; church.classList.add('ring'); FX.bell(); }
  };
  $$('[data-tap]').forEach(function (v) {
    v.addEventListener('click', function () { var f = TAP[v.getAttribute('data-tap')]; if (f) f(); });
  });
  segBtns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      if (i === choice) return;
      segTw = { from: +segI.style.getPropertyValue('--x') || choice, t0: window.performance.now() };
      choice = i;
      segBtns.forEach(function (o, k) { o.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
      FX.pop();
    });
  });
  cells.forEach(function (c) { c.addEventListener('click', function () { goTo(+c.getAttribute('data-go')); }); });
  var goBtn = $('#goBtn'), goT = $('#goT'), goS = $('#goS');
  function setGoing(on) {
    goBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    goT.textContent = on ? '11월 15일에 만나요' : '갈게요';
    goS.textContent = on ? '같이 올 사람에게도 초대장을 보내 주세요' : '11.15 주일 오후 2:30 · 등촌교회 본당';
  }
  try { if (window.localStorage.getItem('gl-going') === '1') setGoing(true); } catch (e) { /* storage blocked */ }
  goBtn.addEventListener('click', function () {
    var on = goBtn.getAttribute('aria-pressed') !== 'true';
    setGoing(on);
    try { window.localStorage.setItem('gl-going', on ? '1' : '0'); } catch (e) { /* storage blocked */ }
    if (on) { if (SND.on) cue(true); else FX.pop(); }
  });

  /* ---------- scroll ---------- */
  function secH() { if (!SH) { var t = track.firstElementChild; SH = (t && t.getBoundingClientRect().height) || window.innerHeight; } return SH; }
  function readScroll() { return clamp((window.scrollY || window.pageYOffset || 0) / secH(), 0, LAST); }
  function goTo(n, instant) { window.scrollTo({ top: Math.round(n * secH()), behavior: instant || calm ? 'auto' : 'smooth' }); }
  var rsT = 0;
  window.addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(measure, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  /* ---------- loop: t comes from the scroll; before the first scroll a short intro runs t from -1 to 0 ---------- */
  var p = 0, fixedT = null, time = 0, last = 0, ftimes = [], introDone = calm;
  function frame(now) {
    raf(frame);
    if (!last) last = now;
    var dt = clamp((now - last) / 1000, 0.001, 0.05);
    last = now; time += dt;
    ftimes.push(dt); if (ftimes.length > 90) ftimes.shift();
    var pr = readScroll();
    p += (pr - p) * (calm ? 1 : 1 - Math.exp(-dt * 10));
    if (Math.abs(pr - p) < 0.0005) p = pr;
    var t;
    if (fixedT !== null) t = fixedT;
    else if (calm) t = Math.round(p);
    else {
      if (!introDone && (p > 0.02 || time > 1.6)) introDone = true;
      t = introDone ? p : -1 + ease(lin(0.15, 1.5, time));
    }
    paint(Math.round(t * 10000) / 10000, now);
  }

  /* ---------- start ---------- */
  measure();
  var HASH = { '#ask': 0, '#day': 1, '#mime': 2, '#nanta': 3, '#kit': 4, '#people': 5, '#place': 6, '#turn': 7, '#go': 8 };
  if (HASH[window.location.hash] !== undefined) { goTo(HASH[window.location.hash], true); introDone = true; }
  p = readScroll();
  raf(frame);

  /* render contract: seek(t) paints the frame at t right away and holds it; seek(null) hands t back to the scroll */
  window.seek = function (t) { fixedT = t === null ? null : +t; if (fixedT !== null) { lastT = null; paint(fixedT, window.performance.now()); } };
  window.__check = {
    go: function (n) { goTo(n, true); p = readScroll(); introDone = true; },
    p: function () { return p; },
    ready: function () { return introDone || time > 1.7; },
    timeline: function () { return TIMELINE; },
    geo: function () { return G; },
    fps: function () { var s = 0; ftimes.forEach(function (x) { s += x; }); return ftimes.length ? Math.round(ftimes.length / s) : 0; },
    bed: function (seconds) {
      /* renders the bed offline and returns its peak and RMS in dBFS, for the level check */
      var R = 44100, OC = window.OfflineAudioContext || window.webkitOfflineAudioContext, oc = new OC(2, Math.round(R * seconds), R);
      var lp = oc.createBiquadFilter(), mix = oc.createGain();
      lp.type = 'lowpass'; lp.frequency.value = 1700; lp.Q.value = 0.4; mix.gain.value = 1.8;
      lp.connect(mix); mix.connect(oc.destination);
      scheduleBed(oc, lp, 0, 0, seconds);
      motif(oc, mix, 4, false); motif(oc, mix, 12, true);
      return oc.startRendering().then(function (buf) {
        var pk = 0, sum = 0, n = 0;
        for (var c = 0; c < buf.numberOfChannels; c++) { var dd = buf.getChannelData(c); for (var i = 0; i < dd.length; i++) { var v = Math.abs(dd[i]); if (v > pk) pk = v; sum += v * v; n++; } }
        return { peakDb: +(20 * Math.log10(pk)).toFixed(1), rmsDb: +(10 * Math.log10(sum / n)).toFixed(1) };
      });
    }
  };
})();
