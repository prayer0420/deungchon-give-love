/* 등촌 GIVE LOVE · app.js (v15, rules in DESIGN.md)
   One screen, many scenes. Wheel, swipe, arrow keys and the next button change the scene in place;
   the page itself never scrolls. Without GSAP the page stays a plain stacked document,
   and reduced-motion users get short fades. */
(function () {
  'use strict';
  var d = document.documentElement;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var URL0 = 'https://prayer0420.github.io/deungchon-give-love/';

  /* ---------- toast + clipboard ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2400);
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

  /* ---------- share + calendar ---------- */
  var shareUrl = location.protocol === 'file:' ? URL0 : location.origin + location.pathname;
  var shareData = { title: '등촌 GIVE LOVE · 새생명축제에 초대합니다', text: '11월 15일 주일 오후 2시 30분, 등촌교회 본당에서 열리는 새생명축제에 초대해요. 같이 가요!', url: shareUrl };
  var shareBtn = $('#shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', function () {
    if (navigator.share) navigator.share(shareData).catch(function () {});
    else copyText(shareUrl).then(function (ok) { toast(ok ? '링크를 복사했어요. 카톡에 붙여 넣어 보내 주세요.' : shareUrl); });
  });
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
      var p = bgm.play();
      if (p && p.catch) p.catch(function () { setBgm(false); toast('음악을 재생하지 못했어요.'); });
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
  goBtn.addEventListener('click', function () {
    try { window.localStorage.setItem('gl-going', '1'); } catch (e) { /* storage blocked */ }
    setGoing();
    if (window.gsap && !calm) window.gsap.fromTo(goBtn, { scale: 0.92 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
  });

  /* ---------- live countdown to 2026-11-15 14:30 KST ---------- */
  var FE_S = Date.UTC(2026, 10, 15, 5, 30, 0), FE_E = Date.UTC(2026, 10, 15, 7, 30, 0), DAY = 86400000;
  var ddTxt = $('#ddTxt');
  function kstDay(t) { return Math.floor((t + 9 * 3600000) / DAY); }
  function dLabel() {
    var n = kstDay(FE_S) - kstDay(Date.now());
    return n > 0 ? 'D-' + n : n === 0 ? 'D-DAY' : 'D+' + (-n);
  }
  var rollBox = null, msgNow = '';
  function roll(b, v) {
    if (b.getAttribute('data-v') === v) return;
    b.setAttribute('data-v', v);
    var kids = Array.prototype.slice.call(b.children), old = kids.pop() || null;
    kids.forEach(function (k) { if (window.gsap) window.gsap.killTweensOf(k); k.remove(); });
    var nu = document.createElement('span');
    nu.textContent = v;
    b.appendChild(nu);
    if (old && window.gsap && !calm && !document.hidden && d.classList.contains('ready')) {
      window.gsap.fromTo(nu, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
      window.gsap.to(old, { yPercent: -100, duration: 0.5, ease: 'power3.out', onComplete: function () { old.remove(); } });
    } else if (old) {
      if (window.gsap) window.gsap.killTweensOf(old);
      old.remove();
    }
  }
  function renderDday() {
    if (!ddTxt) return;
    var now = Date.now();
    if (now < FE_S) {
      var s = Math.floor((FE_S - now) / 1000), dd = Math.floor(s / 86400); s -= dd * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      if (!rollBox) {
        msgNow = '';
        ddTxt.innerHTML = '<span class="cd"><b class="roll" data-k="d"></b><small>일</small><b class="roll" data-k="h"></b><small>시간</small><b class="roll" data-k="m"></b><small>분</small><b class="roll" data-k="s"></b><small>초</small></span><span class="cd-l">남았어요</span>';
        rollBox = {};
        $$('.roll', ddTxt).forEach(function (b) { rollBox[b.getAttribute('data-k')] = b; });
      }
      roll(rollBox.d, String(dd)); roll(rollBox.h, pad2(h)); roll(rollBox.m, pad2(m)); roll(rollBox.s, pad2(s));
    } else {
      var html = now < FE_E ? '<b>지금 새생명축제가 열리고 있어요.</b> 본당으로 오세요.' : '<b>함께해 주셔서 고마워요.</b> 주일 오후 2시 30분, 본당에서 또 만나요.';
      rollBox = null;
      if (msgNow !== html) { msgNow = html; ddTxt.innerHTML = html; }
    }
  }
  renderDday();
  setInterval(renderDday, 1000);

  /* ---------- table of contents ---------- */
  var menu = $('#menu'), menuBtn = $('#menuBtn'), menuX = $('#menuX'), menuTimer = 0, goStep = null;
  function menuOpen() { return !!menu && !menu.hidden; }
  function setMenu(open) {
    clearTimeout(menuTimer);
    if (open) {
      menu.hidden = false;
      d.classList.add('menu-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', '목차 닫기');
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('on'); menuX.focus(); }); });
    } else {
      menu.classList.remove('on');
      d.classList.remove('menu-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', '목차 열기');
      menuTimer = setTimeout(function () { menu.hidden = true; }, calm ? 0 : 280);
    }
  }
  menuBtn.addEventListener('click', function () { setMenu(!menuOpen()); });
  menuX.addEventListener('click', function () { setMenu(false); menuBtn.focus(); });
  $$('.menu-list a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!goStep) { setMenu(false); return; }
      e.preventDefault();
      var n = parseInt(a.getAttribute('data-step'), 10);
      setMenu(false);
      setTimeout(function () { goStep(n); }, calm ? 0 : 180);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (!menuOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); setMenu(false); menuBtn.focus(); return; }
    if (e.key === 'Tab') {
      var f = $$('button, a', menu), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- the deck ---------- */
  var gsap = window.gsap;
  if (!gsap || !d.classList.contains('deck')) { d.classList.remove('deck'); return; }
  gsap.defaults({ overwrite: 'auto' });

  var stage = $('#stage'), bar = $('.bar'), ctrl = $('.ctrl');
  var SCENES = ['cover', 'invite', 'about', 'when', 'prog', 'place', 'final'];
  var NAMES = ['표지', '초대', '새생명축제', '날짜', '프로그램', '오시는 길', '함께 가요'];
  var SC = {};
  SCENES.forEach(function (k) { SC[k] = $('#s-' + k); });
  /* where the tag hangs: hero = the cover spot, side = small at top right, left = small at top left,
     low = under the big date, fin = between the closing words and the buttons, up = pulled out of view */
  var STEPS = [
    { sc: 'cover', tag: 'hero', ink: 0 },
    { sc: 'invite', tag: 'side', ink: 1 },
    { sc: 'about', tag: 'left', ink: 2 },
    { sc: 'when', tag: 'low', ink: 3 },
    { sc: 'prog', tag: 'up', item: 0 },
    { sc: 'prog', tag: 'up', item: 1 },
    { sc: 'prog', tag: 'up', item: 2 },
    { sc: 'place', tag: 'side', ink: 4 },
    { sc: 'final', tag: 'fin', ink: 5 }
  ];
  var LAST = STEPS.length - 1;
  var INK = [
    { a: 'GIVE LOVE', b: '당신의<br>자리가<br>있어요', c: '11.15 SUN' },
    { a: 'INVITATION', b: '편히<br>오세요', c: '11.15 SUN' },
    { a: 'NEW LIFE', b: '처음<br>오셔도<br>좋아요', c: 'FESTIVAL' },
    { a: 'SUNDAY', b: null, c: '2:30 PM' },
    { a: 'PLACE', b: '여기서<br>만나요', c: '2:30 PM' },
    { a: 'SEE YOU', b: '그날<br>만나요', c: '11.15 SUN' },
    { a: 'SEE YOU', b: '기다리고<br>있을게요', c: '11.15 SUN' }
  ];
  var items = $$('#s-prog .it'), objs = $$('.obj img'), plis = $$('.pl li'), plBar = $('.pl-bar');
  var hang = $('#hang'), move = $('#hangMove'), drop = $('#hangDrop'), kick = $('#hangKick'), wind = $('#hangWind'), swing = $('#hangSwing'), tag = $('#tag'), ink = $('#ink');
  var inkA = $('#inkA'), inkB = $('#inkB'), inkC = $('#inkC');
  var cNow = $('#cNow'), rail = $('#railFill'), nextBtn = $('#nextBtn'), nextLabel = $('#nextLabel'), hint = $('#hint'), live = $('#live');
  var cur = 0, busy = false, inkNow = 0, tagMode = 'hero', hinted = false, geo = null, lay = { low: null, fin: null };

  function show(el, on) {
    el.style.visibility = on ? 'visible' : 'hidden';
    el.inert = !on;
    el.setAttribute('aria-hidden', on ? 'false' : 'true');
  }
  function lines(el) { return $$('.ln > span', el).filter(function (x) { return !x.closest('.it'); }); }
  function fades(el) { return $$('.fd', el).filter(function (x) { return !x.closest('.it'); }); }

  /* the tag: what it says, where it hangs */
  function inkFor(s) { return s.ink === 5 && goBtn.classList.contains('is-going') ? 6 : s.ink; }
  function setInk(i) {
    var f = INK[i];
    inkNow = i;
    inkA.textContent = f.a;
    inkC.textContent = f.c;
    if (f.b === null) {
      var lab = dLabel();
      inkB.textContent = lab;
      inkB.className = 'ink-b num' + (lab.length > 4 ? ' long' : '');
    } else {
      inkB.innerHTML = f.b;
      inkB.className = 'ink-b';
    }
  }
  function measure() {
    var hr = hang.getBoundingClientRect();
    geo = { holeX: hr.left + tag.offsetWidth * 0.432, holeY: hr.top + tag.offsetTop, w: tag.offsetWidth, h: tag.offsetHeight };
  }
  function split() { return window.innerWidth > window.innerHeight * 1.1; }
  function eff(mode) { return split() && mode === 'left' ? 'up' : mode; }
  function padPx() { return parseFloat(getComputedStyle(bar).paddingLeft) || 24; }
  var probe = document.createElement('i');
  probe.style.cssText = 'position:absolute;left:0;top:0;width:var(--tagW);height:0;visibility:hidden;pointer-events:none';
  stage.appendChild(probe);
  function sideW() { return probe.getBoundingClientRect().width || Math.min(window.innerWidth * 0.3, window.innerHeight * 0.125); }
  function pageY(el) { var y = 0; while (el && el !== stage) { y += el.offsetTop; el = el.offsetParent; } return y; }
  /* in the date and closing scenes the tag hangs where the words leave room, so measure the words.
     The card is 0.418 tw left of the string and 1.955 tw tall; the idle swing moves it about 0.038 px per px of height. */
  function layout() {
    if (split()) { SC.when.style.removeProperty('--infoMax'); SC.final.style.removeProperty('--finMax'); return; }
    var W = window.innerWidth, pad = padPx(), ft = window.innerHeight - ctrl.offsetHeight;
    var wd = $('.when-d', SC.when), dB = pageY(wd) + wd.offsetHeight;
    var tw = Math.max(64, Math.min(W * 0.32, (ft - 8 - dB - 14) / 2.043));
    lay.low = { cx: W - pad - tw * 0.568, cy: dB + 14, tw: tw };
    SC.when.style.setProperty('--infoMax', Math.round(Math.max(150, lay.low.cx - tw * 0.418 - ft * 0.0384 - 12 - pad)) + 'px');
    /* closing: if the tag fits above the full-width line, hang it there; otherwise let the line wrap beside it */
    var hf = $('.h-fin', SC.final), hB = pageY(hf) + hf.offsetHeight, aT = pageY($('.fin-b .acts', SC.final)), gp = $('#goTxt');
    SC.final.style.removeProperty('--finMax');
    var pT = pageY(gp), cap = W * 0.4;
    var tA = Math.min(cap, (pT - 12 - hB - 14) / 2.043), tB = Math.min(cap, (aT - 14 - hB - 14) / 2.043);
    var tf = Math.max(64, tA >= tB * 0.86 ? tA : tB);
    lay.fin = { cx: W - pad - tf * 0.568, cy: hB + 14, tw: tf };
    if (tf > tA + 0.5) SC.final.style.setProperty('--finMax', Math.round(Math.max(150, lay.fin.cx - tf * 0.418 - (hB + 14 + tf * 1.955) * 0.0384 - 12 - pad)) + 'px');
  }
  function at(cx, cy, tw) { return { x: cx - geo.holeX, y: cy - geo.holeY, scale: tw / geo.w }; }
  function upFrom(t) { t.y -= geo.holeY + t.y + geo.h * t.scale + 40; return t; }
  function target(mode) {
    mode = eff(mode);
    if (!geo || mode === 'hero') return { x: 0, y: 0, scale: 1 };
    if (split()) { var t0 = { x: 0, y: window.innerHeight * 0.02, scale: 0.86 }; return mode === 'up' ? upFrom(t0) : t0; }
    var W = window.innerWidth, pad = padPx(), top = bar.getBoundingClientRect().bottom + 8, tw = sideW();
    if (mode === 'left') return at(pad + tw * 0.432, top, tw);
    if (mode === 'low' && lay.low) return at(lay.low.cx, lay.low.cy, lay.low.tw);
    if (mode === 'fin' && lay.fin) return at(lay.fin.cx, lay.fin.cy, lay.fin.tw);
    var side = at(W - pad - tw * 0.568, top, tw);
    return mode === 'up' ? upFrom(side) : side;
  }
  function flipTo(i) {
    return gsap.timeline()
      .to(tag, { rotationY: 90, duration: 0.32, ease: 'power2.in', transformPerspective: 1000 })
      .call(setInk, [i])
      .set(tag, { rotationY: -90 })
      .to(tag, { rotationY: 0, duration: 0.62, ease: 'power3.out', transformPerspective: 1000 });
  }
  function nudge(dir) {
    return gsap.timeline()
      .to(kick, { rotation: -6 * dir, duration: 0.4, ease: 'power2.out' })
      .to(kick, { rotation: 0, duration: 2.6, ease: 'elastic.out(1, 0.3)' });
  }
  function tagTo(n, dir) {
    var s = STEPS[n], t = target(s.tag), tl = gsap.timeline(), mode = eff(s.tag), was = eff(tagMode);
    var ni = inkFor(s), newInk = ni !== undefined && ni !== inkNow;
    var W = window.innerWidth, H = window.innerHeight, wide = split();
    tagMode = s.tag;
    if (calm) {
      tl.set(move, { x: t.x, y: t.y, scale: t.scale });
      if (newInk) tl.to(ink, { opacity: 0, duration: 0.12 }, 0).call(setInk, [ni]).to(ink, { opacity: 1, duration: 0.18 });
      return tl;
    }
    if (was === 'up' && newInk) setInk(ni);
    /* on upright screens the tag never crosses words on its way. It leaves by an empty route (up from the top corners,
       out to the right from the spots beside words), changes its words out of sight, and comes back in from the right
       (spots beside words) or from above (top corners). */
    var tight = !wide && (mode === 'low' || mode === 'fin') && was !== mode;
    var back = !wide && (mode === 'side' || mode === 'left') && (was === 'low' || was === 'fin');
    var outUp = !wide && mode === 'up' && was === 'fin';
    if (tight || back || outUp) {
      var off = 0;
      if (was === 'side' || was === 'left') { tl.to(move, { y: '-=' + Math.round(H * 0.6), duration: 0.36, ease: 'power2.in' }, 0); off = 0.36; }
      else if (was !== 'up') { tl.to(move, { x: '+=' + Math.round(W * 0.7), duration: 0.36, ease: 'power2.in' }, 0); off = 0.36; }
      if (newInk && was !== 'up') tl.call(setInk, [ni], null, off);
      if (outUp) return tl.set(move, { x: t.x, y: t.y, scale: t.scale }, off);
      var at = Math.max(0.32, off + 0.04);
      if (tight) {
        tl.set(move, { x: t.x + W * 0.62, y: t.y, scale: t.scale }, off)
          .to(move, { x: t.x, duration: 0.95, ease: 'expo.out' }, at)
          .fromTo(kick, { rotation: -7 }, { rotation: 0, duration: 1.5, ease: 'power2.out' }, at);
      } else {
        tl.set(move, { x: t.x, y: t.y - H * 0.55, scale: t.scale }, off)
          .to(move, { y: t.y, duration: 0.9, ease: 'expo.out' }, at)
          .add(nudge(dir), at + 0.06);
      }
      return tl;
    }
    var big = mode === 'hero' || was === 'hero', lift = mode === 'up' || was === 'up';
    /* between scenes the tag is in place before the new words arrive */
    tl.to(move, { x: t.x, y: t.y, scale: t.scale, duration: big ? 1.05 : lift && !wide ? 0.95 : 0.55, ease: big ? 'expo.inOut' : lift && !wide ? 'power3.inOut' : 'power2.inOut' }, wide && was === 'up' ? 0.34 : 0);
    if (was !== 'up' && mode !== 'up' && newInk) tl.add(flipTo(ni), 0.16);
    if (mode === 'hero' && !wide) {
      /* phones: the way home crosses the title, so the card bows out to the right until it is below LOVE, and it does not swing toward the words */
      tl.to(drop, { x: Math.round(W * 0.12), duration: 0.4, ease: 'power2.out' }, 0)
        .to(drop, { x: 0, duration: 0.45, ease: 'power2.inOut' }, 0.8);
    } else tl.add(nudge(dir), 0.05);
    return tl;
  }

  /* about: the band runs on its own and leans into every scroll or swipe, in that direction */
  var bandT = $('#bandT'), band = { x: 0, v: 1, half: 0, live: false };
  function bandMeasure() { band.half = bandT.scrollWidth / 2; }
  gsap.ticker.add(function (time, dt) {
    if (!band.live || !band.half) return;
    band.x -= band.v * Math.max(36, window.innerWidth * 0.08) * Math.min(dt, 64) / 1000;
    if (band.x <= -band.half) band.x += band.half;
    else if (band.x > 0) band.x -= band.half;
    gsap.set(bandT, { x: band.x });
  });
  function bandPush(dv) {
    if (calm || !band.live) return;
    band.v = Math.max(-14, Math.min(14, band.v + dv));
    gsap.to(band, { v: band.v < 0 ? -1 : 1, duration: 1.6, ease: 'power2.out' });
  }

  /* when: each digit of 11.15 is a window onto a strip of digits that rolls into place */
  var dgs = $$('.dg', SC.when), dgReady = false;
  function buildDigits() {
    if (dgReady) return true;
    if (document.fonts && document.fonts.status !== 'loaded') return false;
    dgReady = true;
    dgs.forEach(function (g, i) {
      var v = +g.textContent, fs = parseFloat(getComputedStyle(g).fontSize) || 100, n = 11 + v + (i % 2 ? 10 : 0), h = '';
      g.style.width = (g.getBoundingClientRect().width / fs).toFixed(4) + 'em';
      for (var k = 0; k < n; k++) h += '<i>' + (k % 10) + '</i>';
      g.innerHTML = '<span class="st">' + h + '</span>';
      g.setAttribute('data-n', n);
    });
    return true;
  }
  function rollDate() {
    var tl = gsap.timeline(), dd = $('.dd', SC.when);
    if (!buildDigits()) return tl.fromTo(dd, { yPercent: 108 }, { yPercent: 0, duration: 1.05, ease: 'expo.out' }, 0);
    tl.fromTo(dd, { yPercent: 18 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 0);
    $$('.st', SC.when).forEach(function (st, i) {
      var n = +st.parentNode.getAttribute('data-n');
      tl.fromTo(st, { yPercent: 0 }, { yPercent: -100 * (n - 1) / n, duration: 1.1 + i * 0.12, ease: 'expo.out' }, i * 0.05);
    });
    return tl;
  }

  /* programme: the list marks where you are */
  function setList(i, instant) {
    plis.forEach(function (li, k) { if (k === i) li.setAttribute('aria-current', 'true'); else li.removeAttribute('aria-current'); });
    if (plBar && plis[i]) gsap.to(plBar, { y: plis[i].offsetTop, duration: instant || calm ? 0 : 0.7, ease: 'expo.out' });
  }

  /* scenes */
  function leaveScene(name, dir, step) {
    var el = SC[name], tl = gsap.timeline();
    if (calm) {
      tl.to(el, { opacity: 0, duration: 0.2 });
      if (name === 'prog') tl.add(leaveItem(step.item, dir), 0);
      return tl.call(show, [el, false]).set(el, { opacity: 1 });
    }
    if (name === 'cover') {
      tl.to('.cv-give .w', { xPercent: -14, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 0)
        .to('.cv-love .w', { xPercent: 12, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 0.03)
        .to('.cv-ko > span', { yPercent: -110 * dir, duration: 0.36, ease: 'power2.in' }, 0)
        .to($$('.cv-info .ln > span'), { yPercent: -110 * dir, duration: 0.36, ease: 'power2.in', stagger: 0.03 }, 0)
        .to($$('.cv-info .fd'), { autoAlpha: 0, duration: 0.28, ease: 'power2.in' }, 0);
    } else {
      var ls = lines(el), fs = fades(el);
      if (ls.length) tl.to(ls, { yPercent: -108 * dir, duration: 0.36, ease: 'power2.in', stagger: { amount: 0.07 } }, 0);
      if (fs.length) tl.to(fs, { autoAlpha: 0, y: -14 * dir, duration: 0.28, ease: 'power2.in', stagger: { amount: 0.06 } }, 0);
      if (name === 'prog') tl.add(leaveItem(step.item, dir), 0);
      if (name === 'about') {
        tl.to(band, { v: 12 * dir, duration: 0.4, ease: 'power2.in' }, 0)
          .to('.band', { autoAlpha: 0, duration: 0.32, ease: 'power2.in' }, 0)
          .call(function () { band.live = false; }, null, 0.42);
      }
      if (name === 'place') tl.to('.pc-line', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.3, ease: 'power2.in' }, 0);
    }
    return tl.call(show, [el, false]);
  }
  function enterScene(name, dir, step) {
    var el = SC[name], tl = gsap.timeline();
    gsap.set($('.sc-in', el), { y: 0 });
    tl.call(show, [el, true], null, 0);
    if (calm) {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
      if (name === 'prog') tl.add(enterItem(step.item, dir), 0);
      return tl;
    }
    if (name === 'cover') {
      tl.fromTo('.cv-give .w', { xPercent: -22, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out' }, 0)
        .fromTo('.cv-love .w', { xPercent: 18, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out' }, 0.05)
        .fromTo('.cv-ko > span', { yPercent: 110 * dir }, { yPercent: 0, duration: 1, ease: 'expo.out' }, 0)
        .fromTo($$('.cv-info .ln > span'), { yPercent: 110 * dir }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }, 0.1)
        .fromTo($$('.cv-info .fd'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0.2);
      return tl;
    }
    var ln = lines(el).filter(function (s) { return !s.classList.contains('dd') && !s.classList.contains('sr'); });
    var words = ln.filter(function (s) { return s.querySelector('.wd'); });
    var plain = ln.filter(function (s) { return !s.querySelector('.wd'); });
    var fd = fades(el), wds = $$('.wd', el);
    if (plain.length) tl.fromTo(plain, { yPercent: 108 * dir }, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.06 }, 0);
    /* the letter is read word by word */
    if (words.length) tl.set(words, { yPercent: 0 }, 0).fromTo(wds, { yPercent: 112 * dir }, { yPercent: 0, duration: 0.95, ease: 'expo.out', stagger: 0.085 }, 0.06);
    if (fd.length) tl.fromTo(fd, { autoAlpha: 0, y: 26 * dir }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 }, wds.length ? 0.5 : 0.12);
    if (name === 'invite') tl.fromTo('.lt-u', { scaleX: 0 }, { scaleX: 1, duration: 0.75, ease: 'power3.inOut' }, 0.62);
    if (name === 'about') {
      band.live = true;
      band.v = 10 * dir;
      tl.to(band, { v: dir, duration: 1.8, ease: 'power3.out' }, 0)
        .fromTo('.band', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: 'power1.out' }, 0);
    }
    if (name === 'when') tl.add(rollDate(), 0.02);
    if (name === 'place') tl.fromTo('.pc-line', { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 0.3);
    if (name === 'prog') tl.add(enterItem(step.item, dir), 0.04);
    return tl;
  }
  function enterItem(i, dir) {
    var it = items[i], o = objs[i], tl = gsap.timeline();
    tl.call(show, [it, true], null, 0).call(setList, [i], null, 0);
    if (calm) return tl.fromTo([it, o], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0);
    return tl.fromTo($$('.ln > span', it), { yPercent: 108 * dir }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07 }, 0)
      .fromTo($$('.fd', it), { autoAlpha: 0, y: 20 * dir }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.14)
      .fromTo(o, { autoAlpha: 0, y: 80 * dir, rotation: 9 * dir, scale: 0.9 }, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 1.15, ease: 'expo.out' }, 0.02);
  }
  function leaveItem(i, dir) {
    var it = items[i], o = objs[i], tl = gsap.timeline();
    if (calm) return tl.to([it, o], { autoAlpha: 0, duration: 0.2 }).call(show, [it, false]);
    return tl.to($$('.ln > span', it), { yPercent: -108 * dir, duration: 0.34, ease: 'power2.in', stagger: { amount: 0.05 } }, 0)
      .to($$('.fd', it), { autoAlpha: 0, y: -14 * dir, duration: 0.28, ease: 'power2.in' }, 0)
      .to(o, { autoAlpha: 0, y: -60 * dir, rotation: -6 * dir, scale: 0.94, duration: 0.38, ease: 'power2.in' }, 0)
      .call(show, [it, false]);
  }

  /* frame: counter, progress line, next button, screen-reader note, menu marker */
  function frame(n, dir) {
    var si = SCENES.indexOf(STEPS[n].sc), num = pad2(si + 1);
    if (cNow.textContent !== num) {
      if (calm) cNow.textContent = num;
      else gsap.timeline()
        .to(cNow, { yPercent: -70 * dir, autoAlpha: 0, duration: 0.22, ease: 'power2.in' })
        .call(function () { cNow.textContent = num; })
        .set(cNow, { yPercent: 70 * dir })
        .to(cNow, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'expo.out' });
    }
    gsap.to(rail, { scaleX: n / LAST, duration: calm ? 0 : 0.9, ease: 'expo.inOut' });
    nextLabel.textContent = n === 0 ? '초대장 열기' : n === LAST ? '처음으로' : '다음';
    nextBtn.classList.toggle('up', n === LAST);
    nextBtn.setAttribute('aria-label', n === LAST ? '처음 장면으로' : '다음 장면으로');
    if (n > 0 && !hinted) { hinted = true; gsap.to(hint, { autoAlpha: 0, duration: 0.4 }); }
    live.textContent = (si + 1) + ' / ' + SCENES.length + ', ' + NAMES[si];
    $$('.menu-list a').forEach(function (a, k) { if (k === si) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
  }

  function go(n) {
    n = Math.max(0, Math.min(LAST, n));
    if (n === cur || busy) return false;
    var dir = n > cur ? 1 : -1, a = STEPS[cur], b = STEPS[n], tl = gsap.timeline();
    busy = true;
    /* the old words are fully gone (about 0.43s) before the new ones start, so two texts never share the screen */
    if (a.sc === b.sc) tl.add(leaveItem(a.item, dir), 0).add(enterItem(b.item, dir), calm ? 0.1 : 0.42);
    else tl.add(leaveScene(a.sc, dir, a), 0).add(enterScene(b.sc, dir, b), calm ? 0.15 : 0.46);
    tl.add(tagTo(n, dir), 0);
    frame(n, dir);
    cur = n;
    gsap.delayedCall(calm ? 0.35 : 1, function () { busy = false; });
    return true;
  }
  goStep = function (n) {
    if (busy) { gsap.delayedCall(0.3, function () { goStep(n); }); return; }
    go(n);
  };
  function bump(dir) {
    if (calm) return;
    var el = $('.sc-in', SC[STEPS[cur].sc]);
    gsap.fromTo(el, { y: -16 * dir }, { y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  }
  function step(dir) { if (!go(cur + dir) && !busy) bump(dir); }

  /* input: wheel (trackpad momentum is swallowed until the hand pauses), swipe, keys, button */
  var quietUntil = 0, wheelAcc = 0, lastWheel = 0;
  window.addEventListener('wheel', function (e) {
    if (menuOpen()) return;
    e.preventDefault();
    var px = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? window.innerHeight : 1);
    if (STEPS[cur].sc === 'about') bandPush(px * 0.02);
    var now = performance.now();
    if (busy || now < quietUntil) { quietUntil = now + 200; wheelAcc = 0; return; }
    if (now - lastWheel > 260) wheelAcc = 0;
    lastWheel = now;
    wheelAcc += px;
    if (Math.abs(wheelAcc) >= 36) {
      var dir = wheelAcc > 0 ? 1 : -1;
      wheelAcc = 0;
      quietUntil = now + 200;
      step(dir);
    }
  }, { passive: false });

  var touch = null;
  stage.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { touch = null; return; }
    var p = e.touches[0];
    touch = { x: p.clientX, y: p.clientY, ly: p.clientY, t: performance.now(), el: $('.sc-in', SC[STEPS[cur].sc]) };
  }, { passive: true });
  stage.addEventListener('touchmove', function (e) {
    if (!touch) return;
    e.preventDefault();
    var y = e.touches[0].clientY;
    if (STEPS[cur].sc === 'about') bandPush((touch.ly - y) * 0.08);
    touch.ly = y;
    if (busy || calm) return;
    var dy = y - touch.y;
    gsap.set(touch.el, { y: Math.max(-40, Math.min(40, dy * 0.22)) });
  }, { passive: false });
  function endTouch(e) {
    if (!touch) return;
    var p = e.changedTouches && e.changedTouches[0], t = touch;
    touch = null;
    var dy = p ? t.y - p.clientY : 0, dx = p ? t.x - p.clientX : 0, dt = performance.now() - t.t;
    var swipe = Math.abs(dy) > Math.abs(dx) && (Math.abs(dy) > 44 || (Math.abs(dy) > 18 && dt < 220));
    var moved = swipe && go(cur + (dy > 0 ? 1 : -1));
    if (!moved && t.el && !calm) gsap.to(t.el, { y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
  }
  stage.addEventListener('touchend', endTouch);
  stage.addEventListener('touchcancel', endTouch);

  document.addEventListener('keydown', function (e) {
    if (menuOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
    var onCtl = t && t.closest && t.closest('button, a'), k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !onCtl && !e.shiftKey)) { e.preventDefault(); step(1); }
    else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && !onCtl && e.shiftKey)) { e.preventDefault(); step(-1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(LAST); }
  });
  nextBtn.addEventListener('click', function () { if (cur === LAST) go(0); else go(cur + 1); });
  tag.addEventListener('click', function () {
    if (calm) return;
    gsap.timeline()
      .to(kick, { rotation: Math.random() < 0.5 ? -14 : 14, duration: 0.25, ease: 'power2.out' })
      .to(kick, { rotation: 0, duration: 3, ease: 'elastic.out(1, 0.3)' });
  });
  /* 갈게요: the tag answers */
  goBtn.addEventListener('click', function () {
    if (STEPS[cur].sc !== 'final' || inkNow === 6) return;
    if (calm) { setInk(6); return; }
    gsap.timeline().add(flipTo(6), 0)
      .to(kick, { rotation: -9, duration: 0.3, ease: 'power2.out' }, 0.05)
      .to(kick, { rotation: 0, duration: 2.6, ease: 'elastic.out(1, 0.3)' }, 0.35);
  });

  /* on a computer the tag sways when the mouse moves past it, like a draft (wide layouts only, where it hangs far from the words) */
  if (!calm && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var wx = null, wt = 0, push = 0, ang = 0, vel = 0;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var t = performance.now();
      if (wx !== null && t > wt) push += (e.clientX - wx) / Math.max(8, t - wt);
      wx = e.clientX; wt = t;
    }, { passive: true });
    gsap.ticker.add(function () {
      if (!split() || menuOpen()) push = 0;
      if (!push && !ang && !vel) return;
      vel = (vel - push * 0.22 - ang * 0.035) * 0.9;
      push *= 0.6;
      ang = Math.max(-6, Math.min(6, ang + vel));
      if (Math.abs(ang) < 0.02 && Math.abs(vel) < 0.02 && Math.abs(push) < 0.01) { ang = 0; vel = 0; push = 0; }
      gsap.set(wind, { rotation: ang });
    });
  }

  var rT = 0;
  function relayout() { measure(); layout(); bandMeasure(); if (!busy) gsap.set(move, target(STEPS[cur].tag)); }
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(relayout, 120);
  });

  /* start */
  if (window.matchMedia('(pointer: fine)').matches) hint.textContent = '스크롤하면 다음 장면이 나와요';
  SCENES.forEach(function (k, i) { show(SC[k], i === 0); });
  items.forEach(function (it) { show(it, false); });
  gsap.set(objs, { autoAlpha: 0 });
  setInk(0);
  measure();
  layout();
  bandMeasure();
  setList(0, true);
  frame(0, 1);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  if (calm) {
    d.classList.add('ready');
  } else {
    gsap.set('.lt-u, .pc-line', { scaleX: 0 });
    gsap.set('.band', { autoAlpha: 0 });
    gsap.set($$('.cv-ko > span, .cv-en .c, .cv-info .ln > span'), { yPercent: 110 });
    gsap.set($$('.cv-info .fd'), { autoAlpha: 0, y: 14 });
    gsap.set(drop, { y: -window.innerHeight, rotation: -24 });
    gsap.set([bar, ctrl], { autoAlpha: 0 });
    d.classList.add('ready');
    gsap.timeline({ delay: 0.12, defaults: { ease: 'expo.out' } })
      .to('.cv-ko > span', { yPercent: 0, duration: 1.1 }, 0)
      .to('.cv-give .c', { yPercent: 0, duration: 1.25, stagger: 0.065 }, 0.1)
      .to('.cv-love .c', { yPercent: 0, duration: 1.25, stagger: 0.065 }, 0.26)
      .to(drop, { y: 0, rotation: 0, duration: 2.4, ease: 'elastic.out(1, 0.36)' }, 0.3)
      .to($$('.cv-info .ln > span'), { yPercent: 0, duration: 1, stagger: 0.08 }, 0.7)
      .to($$('.cv-info .fd'), { autoAlpha: 1, y: 0, duration: 0.9 }, 0.85)
      .to([bar, ctrl], { autoAlpha: 1, duration: 0.8 }, 0.9);
    gsap.fromTo(swing, { rotation: -2.2 }, { rotation: 2.2, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }
  var HASH = { 's-invite': 1, 's-about': 2, 's-when': 3, 's-prog': 4, 's-place': 7, 's-final': 8 };
  var h0 = location.hash.slice(1);
  if (HASH[h0]) gsap.delayedCall(calm ? 0.1 : 1.3, function () { go(HASH[h0]); });
  window.__deck = { go: go, cur: function () { return cur; }, busy: function () { return busy; }, steps: STEPS.length };
})();
