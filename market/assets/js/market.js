/* 기부 러브 플리마켓 웹 초청장 v2 (/market/)
   화면 한 장이 고정되고, 휠·스와이프·키·다음 버튼으로 장면 일곱 개가 제자리에서 바뀐다(v1과 같은 엔진).
   떠나는 장면이 먼저 빠지고(0.36초) 새 장면이 들어와서, 두 장면의 글이 한 프레임에 겹치지 않는다.
   stage의 data-tone은 아래 버튼 줄, data-top은 위 줄의 글자색, data-scene은 지금 장면(표지에서는 위 줄을 숨김). */
(function () {
  'use strict';
  var d = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var URL0 = 'https://prayer0420.github.io/deungchon-give-love/market/';
  var stage = $('#stage'), scenes = $$('.sc'), N = scenes.length;
  var prog = $$('.prog button'), nextBtn = $('#next'), nextName = $('#nextName'), toastEl = $('#toast');
  var calm = d.classList.contains('calm');
  var cur = -1, busy = false, toastT = 0;
  window.__market = { go: function (n) { return go(n); }, cur: function () { return cur; }, busy: function () { return busy; } };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }
  function legacyCopy(v) {
    var t = document.createElement('textarea');
    t.value = v; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    t.remove();
    return ok;
  }
  function copyText(v) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(v).then(function () { return true; }, function () { return legacyCopy(v); });
    return Promise.resolve(legacyCopy(v));
  }

  /* ---------- D-day by the Korean calendar date ---------- */
  (function () {
    var el = $('#dday');
    if (!el) return;
    var k = new Date(Date.now() + 9 * 3600e3), today = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
    var n = Math.round((Date.UTC(2026, 10, 7) - today) / 864e5);
    el.textContent = n > 0 ? '· D-' + n : n === 0 ? '· 오늘이에요' : '';
  })();

  /* ---------- share: KakaoTalk ---------- */
  /* KAKAO_KEY is the JavaScript key of the Kakao Developers app (https://prayer0420.github.io registered as the SDK and web
     domain). With no key, or if the SDK fails, the button opens the phone's share sheet (KakaoTalk is one of the choices)
     and computers copy the link. */
  var KAKAO_KEY = '';
  var KAKAO_SDK = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js';
  var KAKAO_SRI = 'sha384-oroumrnFVE0xtgqyDZJARgERibXg2C28380uaUZz2kHDS5CR7tu20eGiOU6GkTpy';
  var shareData = { title: '기부 러브 플리마켓 · 2026 등촌교회', text: '11월 7일 토요일 낮 12시부터 오후 4시까지, 등촌교회 주차장에서 기부 러브 플리마켓이 열려요. 같이 가요!', url: URL0 };
  var shareBtn = $('#shareBtn'), copyBtn = $('#copyBtn'), kakaoWait = null;
  function kakaoReady() { return !!(window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()); }
  function loadKakao() {
    if (!KAKAO_KEY) return Promise.reject(new Error('no key'));
    if (kakaoReady()) return Promise.resolve(window.Kakao);
    if (!kakaoWait) kakaoWait = new Promise(function (done, fail) {
      var s = document.createElement('script');
      s.src = KAKAO_SDK; s.integrity = KAKAO_SRI; s.crossOrigin = 'anonymous'; s.async = true;
      s.onload = function () { try { if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_KEY); done(window.Kakao); } catch (e) { fail(e); } };
      s.onerror = function () { kakaoWait = null; s.remove(); fail(new Error('sdk')); };
      document.head.appendChild(s);
    });
    return kakaoWait;
  }
  function warmKakao() { if (KAKAO_KEY && !kakaoReady()) loadKakao().catch(function () {}); }
  function sendKakao(Kk) {
    Kk.Share.sendDefault({
      objectType: 'feed',
      content: { title: '기부 러브 플리마켓', description: '11.07 토 12:00–16:00 · 등촌교회 주차장', imageUrl: URL0 + 'assets/img/og.jpg', imageWidth: 1200, imageHeight: 630, link: { mobileWebUrl: URL0, webUrl: URL0 } },
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
  if (copyBtn) copyBtn.addEventListener('click', copyShare);

  /* ---------- calendar: .ics on Apple devices, Google Calendar elsewhere ---------- */
  if (!/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
    $$('[data-gcal]').forEach(function (a) {
      a.href = a.getAttribute('data-gcal');
      a.removeAttribute('download');
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  if (!d.classList.contains('deck')) return;

  /* ---------- scenes ---------- */
  function setLive(sc, on) { sc.setAttribute('aria-hidden', on ? 'false' : 'true'); if ('inert' in sc) sc.inert = !on; }
  scenes.forEach(function (sc) { setLive(sc, false); });
  var hooks = {};
  hooks[scenes[N - 1].id] = warmKakao;
  function enter(n, dir) {
    var sc = scenes[n];
    stage.classList.toggle('rev', dir < 0);
    void sc.offsetWidth;
    sc.classList.add('on');
    setLive(sc, true);
    var tone = sc.getAttribute('data-tone') || 'light';
    stage.setAttribute('data-tone', tone);
    stage.setAttribute('data-top', sc.getAttribute('data-top') || tone);
    stage.setAttribute('data-scene', sc.id);
    var last = n === N - 1;
    stage.classList.toggle('last', last);
    if (!last) nextName.textContent = scenes[n + 1].getAttribute('data-name');
    prog.forEach(function (b, i) { b.classList.toggle('cur', i === n); if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    if (hooks[sc.id]) hooks[sc.id](sc);
  }
  function go(n, dir) {
    if (busy || n === cur || n < 0 || n >= N) return false;
    dir = dir || (n > cur ? 1 : -1);
    busy = true;
    var prev = cur;
    cur = n;
    if (prev < 0) { enter(n, dir); setTimeout(function () { busy = false; }, 500); return true; }
    var p = scenes[prev];
    stage.classList.toggle('rev', dir < 0);
    p.classList.add('out');
    setTimeout(function () {
      p.classList.remove('on', 'out', 'again');
      setLive(p, false);
      enter(n, dir);
      setTimeout(function () { busy = false; }, calm ? 150 : 480);
    }, calm ? 140 : 360);
    return true;
  }
  function nudge() { if (calm) return; nextBtn.classList.remove('nudge'); void nextBtn.offsetWidth; nextBtn.classList.add('nudge'); }
  function step(dir) {
    if (busy) return;
    var n = cur + dir;
    if (n < 0) return;
    if (n >= N) { nudge(); return; }
    go(n, dir);
  }

  /* ---------- input: wheel (trackpad inertia swallowed), swipe, keys, buttons ---------- */
  var acc = 0, quiet = 0;
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;
    e.preventDefault();
    var now = Date.now();
    if (busy || now < quiet) { quiet = Math.max(quiet, now + 160); acc = 0; return; }
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    acc += e.deltaY;
    if (Math.abs(acc) >= 36) { var dir = acc > 0 ? 1 : -1; acc = 0; quiet = now + 650; step(dir); }
  }, { passive: false });
  var t0 = null;
  stage.addEventListener('touchstart', function (e) { t0 = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
  stage.addEventListener('touchmove', function (e) { if (t0 && e.touches.length === 1 && e.cancelable) e.preventDefault(); }, { passive: false });
  stage.addEventListener('touchend', function (e) {
    if (!t0) return;
    var t = e.changedTouches[0], dy = t0.y - t.clientY, dx = t0.x - t.clientX;
    t0 = null;
    if (Math.abs(dy) > 42 && Math.abs(dy) > Math.abs(dx) * 1.2) step(dy > 0 ? 1 : -1);
  });
  window.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key, onCtl = e.target && /^(BUTTON|A|INPUT|TEXTAREA)$/.test(e.target.tagName);
    if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !onCtl)) { e.preventDefault(); step(1); }
    else if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); step(-1); }
    else if (k === 'Home') { e.preventDefault(); go(0, -1); }
    else if (k === 'End') { e.preventDefault(); go(N - 1, 1); }
  });
  nextBtn.addEventListener('click', function () { if (cur === N - 1) go(0, -1); else step(1); });
  prog.forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });

  /* ---------- small taps: one moving thing at a time ---------- */
  function replay(el, cls) { if (calm || !el) return; el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); }
  var awn = $('.awn'), l0 = $('.l0');
  if (awn) awn.addEventListener('click', function () { replay(l0, 'tw'); });
  $$('.sw').forEach(function (g) {
    g.addEventListener('click', function () {
      if (calm || !g.animate) return;
      g.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(0deg)' }], { duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  });
  $$('.bl li').forEach(function (li) { li.addEventListener('click', function () { replay(li, 'pop'); }); });
  /* 희망상자를 누르면 물건이 하트가 되어 담기는 장면을 처음부터 다시 */
  var box = $('.box4');
  if (box) box.addEventListener('click', function () {
    if (calm || !box.getAnimations) return;
    box.getAnimations({ subtree: true }).forEach(function (a) { a.currentTime = 0; a.play(); });
  });
  var p4 = $('.svc .p4');
  if (p4) p4.addEventListener('click', function () { replay(p4, 'pulse'); });

  var m = /^#s(\d)$/.exec(location.hash);
  go(m && +m[1] < N ? +m[1] : 0, 1);
})();

