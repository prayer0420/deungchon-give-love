/* 등촌 GIVE LOVE · site.js
   Motion: GSAP + ScrollTrigger (+ SplitText, DrawSVG), Lenis smooth wheel on desktop.
   Everything works without motion (prefers-reduced-motion or script failure). */
(function () {
  'use strict';
  var d = document.documentElement;
  window.__glReady = true;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canMotion = d.classList.contains('motion') && !reduce && window.gsap && window.ScrollTrigger;

  /* ---------- toast + clipboard ---------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2400);
  }
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return legacyCopy(t); });
    }
    return Promise.resolve(legacyCopy(t));
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

  /* ---------- address copy, share, calendar ---------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      copyText(b.getAttribute('data-copy')).then(function (ok) { toast(ok ? '주소를 복사했어요.' : '주소: ' + b.getAttribute('data-copy')); });
    });
  });
  var shareUrl = (location.protocol === 'file:') ? 'https://prayer0420.github.io/deungchon-give-love/' : location.origin + location.pathname;
  var shareData = {
    title: '등촌 GIVE LOVE · 11월 7일 플리마켓 & 새생명축제',
    text: '11월 7일 토요일 낮 12시, 등촌교회 교육관 1층에서 플리마켓 & 새생명축제가 열려요. 같이 가요!',
    url: shareUrl
  };
  var shareBtn = $('#shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', function () {
    if (navigator.share) {
      navigator.share(shareData).catch(function () {});
    } else {
      copyText(shareUrl).then(function (ok) { toast(ok ? '링크를 복사했어요. 카톡에 붙여 넣어 보내 주세요.' : shareUrl); });
    }
  });
  var copyBtn = $('#copyBtn');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    copyText(shareUrl).then(function (ok) { toast(ok ? '링크를 복사했어요.' : shareUrl); });
  });
  var calBtn = $('#calBtn');
  if (calBtn && !/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
    calBtn.href = calBtn.getAttribute('data-gcal');
    calBtn.removeAttribute('download');
    calBtn.target = '_blank';
    calBtn.rel = 'noopener';
  }

  /* ---------- background music ---------- */
  var bgm = $('#bgm');
  var bgmBtn = $('#bgmBtn');
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

  /* ---------- paper-doll video plays only while visible ---------- */
  var vid = $('#dolls');
  if (vid) {
    if (reduce) { vid.controls = true; }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (vid.dataset.user === 'paused') return; vid.preload = 'auto'; var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
          else vid.pause();
        });
      }, { threshold: 0.2 }).observe(vid);
    }
  }

  /* ---------- live D-day (event: 2026-11-07 12:00–16:00 KST) ---------- */
  var START = Date.UTC(2026, 10, 7, 3, 0, 0);
  var END = Date.UTC(2026, 10, 7, 7, 0, 0);
  var DAY = 86400000;
  var ddN = $('#ddN'), ddX = $('#ddX'), ddTxt = $('#ddTxt');
  var counting = false;
  function kstDay(t) { return Math.floor((t + 9 * 3600000) / DAY); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function daysLeft() { return kstDay(START) - kstDay(Date.now()); }
  var rollBox = null;
  function roll(b, v) {
    if (b.getAttribute('data-v') === v) return;
    b.setAttribute('data-v', v);
    var nu = document.createElement('span');
    nu.textContent = v;
    var old = b.firstElementChild;
    b.appendChild(nu);
    if (old && window.gsap && d.classList.contains('motion') && d.classList.contains('ready')) {
      window.gsap.fromTo(nu, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
      window.gsap.to(old, { yPercent: -100, duration: 0.5, ease: 'power3.out', onComplete: function () { old.remove(); } });
    } else if (old) { old.remove(); }
  }
  function setCountdown(dd, h, m, s) {
    if (!rollBox) {
      ddTxt.innerHTML = '축제까지 <b class="roll" data-k="d"></b>일 <b class="roll" data-k="h"></b>시간 <b class="roll" data-k="m"></b>분 <b class="roll" data-k="s"></b>초';
      rollBox = {};
      $$('.roll', ddTxt).forEach(function (b) { rollBox[b.getAttribute('data-k')] = b; });
    }
    roll(rollBox.d, String(dd)); roll(rollBox.h, h); roll(rollBox.m, m); roll(rollBox.s, s);
  }
  function renderDday() {
    var now = Date.now();
    if (now < START) {
      var s = Math.floor((START - now) / 1000);
      var dd = Math.floor(s / 86400); s -= dd * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      var cal = daysLeft();
      if (!counting) { ddX.textContent = '-'; ddN.textContent = cal > 0 ? String(cal) : 'DAY'; }
      setCountdown(dd, pad2(h), pad2(m), pad2(s));
    } else if (now < END) {
      ddX.textContent = '-'; ddN.textContent = 'DAY';
      rollBox = null; ddTxt.innerHTML = '<b>지금 장터가 열려 있어요.</b> 교육관 1층으로 오세요.';
    } else {
      ddX.textContent = '+'; ddN.textContent = String(Math.max(1, kstDay(now) - kstDay(START)));
      rollBox = null; ddTxt.innerHTML = '축제가 끝났어요. <b>함께해 주셔서 고마워요.</b>';
    }
  }
  renderDday();
  setInterval(renderDday, 1000);

  /* ---------- cross-stitch finale (L ♥ V E) ---------- */
  function buildStitch() {
    var svg = $('#stitch');
    if (!svg) return [];
    var P = {
      L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
      H: ['0110110', '1111111', '1111111', '1111111', '0111110', '0011100', '0001000'],
      V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
      E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111']
    };
    var cell = 10, col = 0, cells = [];
    ['L', 'H', 'V', 'E'].forEach(function (k) {
      P[k].forEach(function (row, r) {
        row.split('').forEach(function (ch, c) { if (ch === '1') cells.push({ x: col + c, y: r, red: k === 'H' }); });
      });
      col += P[k][0].length + 1;
    });
    var W = (col - 1) * cell, H = 7 * cell;
    svg.setAttribute('viewBox', '-3 -3 ' + (W + 6) + ' ' + (H + 6));
    cells.sort(function (a, b) { return a.x - b.x || (a.x % 2 ? b.y - a.y : a.y - b.y); });
    var ns = 'http://www.w3.org/2000/svg';
    return cells.map(function (cl) {
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 's ' + (cl.red ? 'red' : 'ink'));
      var x = cl.x * cell, y = cl.y * cell, p = 2;
      [[x + p, y + p, x + cell - p, y + cell - p], [x + cell - p, y + p, x + p, y + cell - p]].forEach(function (L) {
        var ln = document.createElementNS(ns, 'line');
        ln.setAttribute('x1', L[0]); ln.setAttribute('y1', L[1]); ln.setAttribute('x2', L[2]); ln.setAttribute('y2', L[3]);
        g.appendChild(ln);
      });
      svg.appendChild(g);
      return g;
    });
  }
  var stitches = buildStitch();

  /* ---------- red thread that sews the page together ---------- */
  function catmull(p) {
    var s = 'M' + p[0][0].toFixed(1) + ',' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      s += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return s;
  }
  var thread = { page: $('#page'), svg: $('#thread'), path: $('#threadPath'), total: 0, table: [], top: 0, animate: false };
  function buildThread() {
    var page = thread.page, W = page.clientWidth, H = page.scrollHeight;
    thread.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    thread.svg.setAttribute('width', W);
    thread.svg.setAttribute('height', H);
    thread.top = page.getBoundingClientRect().top + window.scrollY;
    var inset = Math.max(10, Math.min(W * 0.034, 34));
    var X = { L: inset, R: W - inset };
    var hero = $('.hero');
    var hb = hero.getBoundingClientRect().bottom + window.scrollY - thread.top;
    var pts = [[W * 0.72, hb - 24]];
    $$('[data-thread]').forEach(function (s) {
      var r = s.getBoundingClientRect();
      var t = r.top + window.scrollY - thread.top, b = t + r.height;
      var padTop = parseFloat(window.getComputedStyle(s).paddingTop) || 100;
      var x = X[s.getAttribute('data-thread')];
      pts.push([x, t + padTop * 0.78], [x, b - 4]);
    });
    var fin = $('.finale');
    var fr = fin.getBoundingClientRect();
    var ft = fr.top + window.scrollY - thread.top;
    pts.push([W * 0.5, ft + 30]);
    thread.path.setAttribute('d', catmull(pts));
    thread.total = thread.path.getTotalLength();
    var N = Math.max(240, Math.round(thread.total / 5)), maxY = -1e9, tb = [];
    for (var i = 0; i <= N; i++) {
      var l = thread.total * i / N;
      var pt = thread.path.getPointAtLength(l);
      if (pt.y > maxY) maxY = pt.y;
      tb.push(l, maxY);
    }
    thread.table = tb;
    if (thread.animate) {
      thread.path.style.strokeDasharray = thread.total + ' ' + thread.total;
      drawThread();
    } else {
      thread.path.style.strokeDasharray = 'none';
    }
  }
  function drawThread() {
    var tb = thread.table;
    if (!tb.length) return;
    var target = window.scrollY + window.innerHeight * 0.7 - thread.top;
    var lo = 0, hi = tb.length / 2 - 1;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (tb[mid * 2 + 1] < target) lo = mid + 1; else hi = mid; }
    var len = tb[1] >= target ? 0 : tb[lo * 2];
    thread.path.style.strokeDashoffset = (thread.total - len).toFixed(1);
    thread.path.style.opacity = len < 2 ? '0' : '1';
  }

  /* ---------- motion ---------- */
  function initMotion() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    window.__gl = window.__gl || {};
    window.__gl.toast = toast;
    window.__gl.setCounting = function (v) { counting = v; };
    var plugins = [ST];
    if (window.SplitText) plugins.push(window.SplitText);
    if (window.DrawSVGPlugin) plugins.push(window.DrawSVGPlugin);
    gsap.registerPlugin.apply(gsap, plugins);
    ST.config({ ignoreMobileResize: true });

    if (window.Lenis && window.matchMedia('(pointer: fine)').matches) {
      var lenis = new window.Lenis({ lerp: 0.12, wheelMultiplier: 0.95 });
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      window.__gl.lenis = lenis;
    }

    /* hero intro */
    var drop = $('.hang-drop'), swing = $('.hang-swing'), kick = $('.hang-kick');
    gsap.set($$('.ht-ko > span, .ht-en .c'), { yPercent: 110 });
    gsap.set(drop, { y: function () { return -window.innerHeight; }, rotation: -24 });
    gsap.set($$('.hero-kicker, .hero-info > *'), { autoAlpha: 0, y: 18 });
    d.classList.add('ready');
    var intro = gsap.timeline({ delay: 0.12, defaults: { ease: 'expo.out' } });
    intro.to('.ht-ko > span', { yPercent: 0, duration: 1.1 }, 0)
      .to('.ht-give .c', { yPercent: 0, duration: 1.25, stagger: 0.065 }, 0.1)
      .to('.ht-love .c', { yPercent: 0, duration: 1.25, stagger: 0.065 }, 0.26)
      .to(drop, { y: 0, rotation: 0, duration: 2.4, ease: 'elastic.out(1, 0.36)' }, 0.3)
      .to($$('.hero-kicker, .hero-info > *'), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.75);
    gsap.fromTo(swing, { rotation: -2.4 }, { rotation: 2.4, duration: 2.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    var kickTo = gsap.quickTo(kick, 'rotation', { duration: 1.2, ease: 'elastic.out(1, 0.28)' });
    var kickReset;
    ST.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: function (self) {
        kickTo(gsap.utils.clamp(-16, 16, -self.getVelocity() / 120));
        clearTimeout(kickReset);
        kickReset = setTimeout(function () { kickTo(0); }, 110);
      }
    });
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.35 } })
      .to('.ht-give', { xPercent: -16, ease: 'none' }, 0)
      .to('.ht-love', { xPercent: 12, ease: 'none' }, 0)
      .to('.ht-ko', { yPercent: -60, autoAlpha: 0, ease: 'none' }, 0)
      .to('.hang', { y: function () { return -window.innerHeight * 0.24; }, ease: 'none' }, 0)
      .to('.hero-info, .hero-kicker', { y: -60, autoAlpha: 0, ease: 'none' }, 0);

    /* envelope: the seal pops, the flap opens, the invitation card rises (pinned + scrubbed) */
    if ($('.env')) {
      var envTl = gsap.timeline({ scrollTrigger: { trigger: '.env', start: 'top top', end: '+=150%', pin: true, scrub: 0.6, anticipatePin: 1, refreshPriority: 3 } });
      envTl.to('.env-hint', { autoAlpha: 0, y: -12, duration: 0.1 }, 0)
        .to('.env-seal', { scale: 1.25, duration: 0.06, ease: 'power1.out' }, 0)
        .to('.env-seal', { scale: 0, rotation: 120, autoAlpha: 0, duration: 0.1, ease: 'back.in(2)' }, 0.06)
        .to('.env-flap', { rotationX: 180, duration: 0.3, ease: 'power2.inOut' }, 0.12)
        .set('.env-flap', { zIndex: 0 }, 0.27)
        .to('.env-card', { yPercent: -66, rotation: -2, duration: 0.32, ease: 'power2.out' }, 0.4)
        .to(['.env-back', '.env-front', '.env-flap'], { yPercent: 60, autoAlpha: 0, duration: 0.24, ease: 'power2.in' }, 0.76)
        .to('.env-card', { yPercent: -30, rotation: 0, scale: 1.14, duration: 0.24, ease: 'power2.inOut' }, 0.76);
      window.__gl.env = envTl;
    }

    /* market: giant kinetic words slide with the scroll (and back when scrolling up) */
    if ($('.kin')) {
      gsap.fromTo('.kin', { x: function () { return window.innerWidth * 0.5; } }, { x: function () { return -($('.kin').scrollWidth - window.innerWidth * 0.5); }, ease: 'none', scrollTrigger: { trigger: '.kin', start: 'top bottom', end: 'bottom top', scrub: 0.5, invalidateOnRefresh: true } });
    }

    /* reveal that remembers direction: scrolling down brings things in from below, scrolling up from above */
    function dirReveal(targets, trigger, o) {
      var prop = o.px ? 'y' : 'yPercent', Y = o.y, fade = !!o.fade, dur = o.d || 1.1, stg = o.stagger || 0;
      function from(v) { var r = {}; r[prop] = v; if (fade) r.autoAlpha = 0; return r; }
      function to(st) { var r = { duration: dur, ease: 'expo.out', overwrite: true, stagger: st }; r[prop] = 0; if (fade) r.autoAlpha = 1; return r; }
      function hide(v) { var r = { duration: 0.45, ease: 'power2.in', overwrite: true }; r[prop] = v; if (fade) r.autoAlpha = 0; return r; }
      gsap.set(targets, from(Y));
      ST.create({
        trigger: trigger, start: o.start || 'top 88%', end: o.end || 'bottom 4%',
        onEnter: function () { gsap.fromTo(targets, from(Y), to(stg)); },
        onEnterBack: function () { gsap.fromTo(targets, from(-Y), to({ each: stg, from: 'end' })); },
        onLeave: function () { gsap.to(targets, hide(-Y)); },
        onLeaveBack: function () { gsap.to(targets, hide(Y)); }
      });
    }

    /* headings: masked line reveal, direction-aware */
    $$('.h-txt').forEach(function (el) {
      if (!window.SplitText) return;
      var sp = window.SplitText.create(el, { type: 'lines', mask: 'lines' });
      dirReveal(sp.lines, el, { y: 110, stagger: 0.09, d: 1.15 });
    });
    $$('.sec-en').forEach(function (el) {
      gsap.from(el, { autoAlpha: 0, x: -16, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });
    $$('[data-up]').forEach(function (el) {
      dirReveal(el, el, { y: 34, px: true, fade: true, start: 'top 92%', d: 1 });
    });

    /* invitation letter */
    dirReveal($$('.letter p > span'), '.letter', { y: 115, stagger: 0.085, start: 'top 82%', end: 'bottom 6%', d: 1.2 });

    /* calendar + heart + D-day count */
    gsap.from('.cal-ym b', { yPercent: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.cal', start: 'top 85%' } });
    gsap.from('.cal-grid .d', { autoAlpha: 0, scale: 0.4, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.017, scrollTrigger: { trigger: '.cal-grid', start: 'top 85%' } });
    if (window.DrawSVGPlugin) {
      gsap.fromTo('.cal-heart path', { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: '.cal-grid', start: 'top 78%', end: 'center 52%', scrub: 0.6 } });
    }
    ST.create({
      trigger: '.dday', start: 'top 88%', once: true,
      onEnter: function () {
        var target = daysLeft();
        if (target <= 1 || Date.now() >= START) return;
        counting = true;
        var o = { v: 0 };
        gsap.to(o, { v: target, duration: 1.6, ease: 'power3.out', onUpdate: function () { ddN.textContent = String(Math.round(o.v)); }, onComplete: function () { counting = false; renderDday(); } });
      }
    });

    /* festival: words fill in as you read, clock hands wind to 2:30 */
    if (window.SplitText) {
      var fill = window.SplitText.create('#fillText', { type: 'words' });
      gsap.fromTo(fill.words, { color: '#d2cdc6' }, { color: '#151515', ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '#fillText', start: 'top 82%', end: 'bottom 48%', scrub: true } });
    }
    gsap.timeline({ scrollTrigger: { trigger: '.worship', start: 'top 92%', end: 'center 50%', scrub: 0.7 } })
      .fromTo('.c-m', { rotation: 0, svgOrigin: '100 100' }, { rotation: 900, svgOrigin: '100 100', ease: 'none' }, 0)
      .fromTo('.c-h', { rotation: 0, svgOrigin: '100 100' }, { rotation: 75, svgOrigin: '100 100', ease: 'none' }, 0);

    /* waffle miniature zooms in */
    gsap.fromTo('.mk-waffle img', { scale: 0.66, rotation: -9, yPercent: 10 }, { scale: 1.12, rotation: 0, yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.mk-waffle', start: 'top bottom', end: 'bottom top', scrub: 0.4 } });

    /* programs: pinned, four scenes */
    var groups = $$('.pg');
    if (groups.length) {
      var first = $$('.obj', groups[0]);
      gsap.from(first, { y: 160, rotation: function (i) { return i % 2 ? 18 : -18; }, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.prog', start: 'top 72%' } });
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.prog', start: 'top top', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 2,
          end: function () { return '+=' + Math.round(window.innerHeight * 0.95 * (groups.length - 1 + 0.4)); },
          snap: { snapTo: 'labels', inertia: false, duration: { min: 0.2, max: 0.55 }, delay: 0.12, ease: 'power2.inOut' }
        }
      });
      tl.addLabel('g0');
      groups.forEach(function (g, i) {
        if (!i) return;
        var prev = groups[i - 1];
        var po = $$('.obj', prev), no = $$('.obj', g);
        tl.to(prev.querySelector('.pg-head'), { yPercent: -24, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, '+=0.3')
          .to(po, { y: function () { return -window.innerHeight * 0.6; }, rotation: function (k) { return k % 2 ? 24 : -24; }, autoAlpha: 0, duration: 0.55, stagger: 0.05, ease: 'power2.in' }, '<')
          .set(g, { autoAlpha: 1 })
          .from(g.querySelector('.pg-head'), { yPercent: 36, autoAlpha: 0, duration: 0.5, ease: 'power3.out' })
          .from(no, { y: function () { return window.innerHeight * 0.65; }, rotation: function (k) { return k % 2 ? -26 : 26; }, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '<0.05')
          .from($$('figcaption', g), { autoAlpha: 0, scale: 0.6, duration: 0.25, stagger: 0.06, ease: 'back.out(2)' }, '-=0.2')
          .addLabel('g' + i);
      });
      tl.to({}, { duration: 0.3 });
    }

    /* give: tower builds from the bottom, highlight sweeps */
    gsap.fromTo('.stack', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.give-vis', start: 'top 84%', end: 'bottom 62%', scrub: 0.5 } });
    gsap.fromTo('.give-to mark', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 1, ease: 'power2.inOut', stagger: 0.35, scrollTrigger: { trigger: '.give-to', start: 'top 84%' } });

    /* welcome: coupons deal out of one pile */
    var cps = $$('.cp');
    if (cps.length) {
      gsap.timeline({ scrollTrigger: { trigger: '.coupons', start: 'top 85%', end: 'bottom 58%', scrub: 0.6, invalidateOnRefresh: true } })
        .from(cps, { y: function (i) { return -i * (cps[0].offsetHeight + 14) + i * 8; }, rotation: function (i) { return [-2, 5, -7][i] || 0; }, ease: 'power2.out', duration: 1 }, 0);
    }

    /* film frame opens up */
    gsap.fromTo('.film-frame', { scale: 0.78, borderRadius: 64 }, { scale: 1, borderRadius: 22, ease: 'none', scrollTrigger: { trigger: '.film-frame', start: 'top bottom', end: 'center 58%', scrub: 0.4 } });

    /* location big type */
    dirReveal($$('.map-big .m > span'), '.map-big', { y: 110, stagger: 0.1, start: 'top 86%', d: 1.2 });

    /* finale: stitches sew L♥VE, the last ones wait for "you" */
    if (stitches.length) {
      var tail = stitches.slice(-4), body = stitches.slice(0, -4);
      gsap.set(stitches, { transformOrigin: '50% 50%' });
      gsap.timeline({ scrollTrigger: { trigger: '.finale', start: 'top top', end: '+=140%', pin: true, scrub: 0.4, anticipatePin: 1, refreshPriority: 1 } })
        .from(body, { scale: 0, autoAlpha: 0, duration: 0.05, stagger: 0.6 / body.length, ease: 'back.out(3)' }, 0)
        .from('.fin-t .m:first-child > span', { yPercent: 110, duration: 0.14, ease: 'power3.out' }, 0.64)
        .from(tail, { scale: 0, autoAlpha: 0, duration: 0.05, stagger: 0.05, ease: 'back.out(4)' }, 0.8)
        .from('.fin-t .m:last-child > span', { yPercent: 110, duration: 0.14, ease: 'power3.out' }, 1.0)
        .from('.fin-s', { autoAlpha: 0, y: 14, duration: 0.12 }, 1.08)
        .from('.go-btn', { autoAlpha: 0, y: 18, scale: 0.9, duration: 0.12 }, 1.12)
        .to({}, { duration: 0.12 });
    }

    /* the thread */
    thread.animate = true;
    ST.addEventListener('refresh', buildThread);
    ST.create({ start: 0, end: 'max', onUpdate: drawThread });
    window.__gl.ready = true;
    try { document.dispatchEvent(new CustomEvent('gl:motion')); } catch (err) { if (window.console) console.error(err); }
    ST.sort();
    ST.refresh();
  }

  function startMotion() {
    try {
      initMotion();
    } catch (err) {
      if (window.console) console.error(err);
      d.classList.remove('motion');
      d.classList.add('ready');
      if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach(function (t) { t.kill(true); });
      if (window.gsap) window.gsap.set($$('[style]'), { clearProps: 'all' });
      thread.animate = false;
      buildThread();
    }
  }

  if (canMotion) {
    var started = false;
    var go = function () { if (!started) { started = true; startMotion(); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 1200);
  } else {
    d.classList.remove('motion');
    d.classList.add('ready');
    var once = function () { buildThread(); };
    if (document.readyState === 'complete') once(); else window.addEventListener('load', once);
    window.addEventListener('resize', function () { clearTimeout(once.t); once.t = setTimeout(buildThread, 200); });
  }
})();

