/* 등촌 GIVE LOVE · play.js
   Interactions on top of the scroll motion: heart bursts, cursor, magnetic/ripple buttons,
   scroll-velocity reactions, draggable objects, tap-to-play pieces. Motion devices only. */
(function () {
  'use strict';
  var d = document.documentElement;
  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    if (!d.classList.contains('motion') || !window.gsap || !window.ScrollTrigger) return;
    try { init(); } catch (err) { if (window.console) console.error(err); }
  }
  if (window.__gl && window.__gl.ready) boot();
  else document.addEventListener('gl:motion', boot);

  function init() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    var plugins = [];
    ['Draggable', 'InertiaPlugin', 'Physics2DPlugin', 'ScrambleTextPlugin'].forEach(function (n) { if (window[n]) plugins.push(window[n]); });
    if (plugins.length) gsap.registerPlugin.apply(gsap, plugins);
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var GL = window.__gl || {};
    var toast = GL.toast || function () {};
    var R = gsap.utils.random, clamp = gsap.utils.clamp;

    /* ---------- heart bursts ---------- */
    var layer = document.createElement('div');
    layer.className = 'burst-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    var COLORS = ['#d33a2c', '#d33a2c', '#ea5a4c', '#c39b6c', '#151515'];
    var live = 0;
    function burst(x, y, n, o) {
      o = o || {};
      n = Math.min(n, 90 - live);
      for (var i = 0; i < n; i++) spawn(x, y, o);
    }
    function spawn(x, y, o) {
      var el = document.createElement('i');
      el.className = 'hb';
      el.textContent = '♥';
      el.style.color = COLORS[(Math.random() * COLORS.length) | 0];
      el.style.fontSize = R(o.min || 12, o.max || 26) + 'px';
      layer.appendChild(el);
      live++;
      var dur = o.dur || 1.3;
      gsap.set(el, { x: x, y: y, xPercent: -50, yPercent: -50, rotation: R(-30, 30), scale: 0 });
      gsap.timeline({ onComplete: function () { el.remove(); live--; } })
        .to(el, { scale: 1, duration: 0.16, ease: 'back.out(3)' }, 0)
        .to(el, { duration: dur, physics2D: { velocity: R(o.vmin || 240, o.vmax || 560), angle: R(o.a0 || 205, o.a1 || 335), gravity: o.g || 950 }, rotation: '+=' + R(-240, 240), ease: 'none' }, 0)
        .to(el, { autoAlpha: 0, duration: 0.3 }, dur - 0.3);
    }
    GL.burst = burst;
    function centerOf(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
    function pt(e, el) { return (e && typeof e.clientX === 'number' && (e.clientX || e.clientY)) ? [e.clientX, e.clientY] : centerOf(el); }

    /* ---------- custom cursor (mouse only) ---------- */
    var curLabel = $('.cur-label');
    if (fine && $('.cur')) {
      d.classList.add('cur-on');
      var cur = $('.cur'), dot = $('.cur-dot'), ring = $('.cur-ring');
      var xd = gsap.quickTo(dot, 'x', { duration: 0.08 }), yd = gsap.quickTo(dot, 'y', { duration: 0.08 });
      var xr = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' }), yr = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY);
      }, { passive: true });
      document.addEventListener('pointerover', function (e) {
        var t = e.target && e.target.closest ? e.target.closest('[data-cursor], a, button, [role="button"]') : null;
        cur.classList.remove('is-big', 'is-link');
        if (!t) { curLabel.textContent = ''; return; }
        var l = t.getAttribute('data-cursor');
        if (l) { curLabel.textContent = l; cur.classList.add('is-big'); }
        else { curLabel.textContent = ''; cur.classList.add('is-link'); }
      });
      document.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
      document.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
      d.addEventListener('mouseleave', function () { gsap.to(cur, { autoAlpha: 0, duration: 0.2 }); });
      d.addEventListener('mouseenter', function () { gsap.to(cur, { autoAlpha: 1, duration: 0.2 }); });
    }

    /* ---------- buttons: ripple everywhere, magnetic with a mouse ---------- */
    $$('.btn, .chip, .dock-btn').forEach(function (b) {
      b.addEventListener('pointerdown', function (e) {
        var r = b.getBoundingClientRect(), s = document.createElement('span'), D = Math.max(r.width, r.height) * 2.4;
        s.className = 'rp';
        s.style.width = s.style.height = D + 'px';
        s.style.left = (e.clientX - r.left - D / 2) + 'px';
        s.style.top = (e.clientY - r.top - D / 2) + 'px';
        b.appendChild(s);
        gsap.fromTo(s, { scale: 0, opacity: 0.32 }, { scale: 1, opacity: 0, duration: 0.75, ease: 'power2.out', onComplete: function () { s.remove(); } });
        gsap.fromTo(b, { scale: 0.93 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)' });
      });
      if (fine && !b.classList.contains('dock-btn')) {
        var mx = gsap.quickTo(b, 'x', { duration: 0.45, ease: 'power3' }), my = gsap.quickTo(b, 'y', { duration: 0.45, ease: 'power3' });
        b.addEventListener('pointermove', function (e) {
          var r = b.getBoundingClientRect();
          mx((e.clientX - r.left - r.width / 2) * 0.3);
          my((e.clientY - r.top - r.height / 2) * 0.45);
        });
        b.addEventListener('pointerleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' }); });
      }
    });
    $$('[data-copy], #copyBtn, #bgmBtn, #calBtn').forEach(function (b) {
      b.addEventListener('click', function (e) { var p = pt(e, b); burst(p[0], p[1], 8, { vmax: 420 }); });
    });

    /* ---------- scroll progress ring around the music button ---------- */
    var circ = $('.dock-ring circle');
    if (circ) {
      var C = 2 * Math.PI * 25;
      circ.style.strokeDasharray = C.toFixed(1);
      circ.style.strokeDashoffset = C.toFixed(1);
      ST.create({ start: 0, end: 'max', onUpdate: function (self) { circ.style.strokeDashoffset = (C * (1 - self.progress)).toFixed(1); } });
    }

    /* ---------- scroll velocity + direction drive the whole page ---------- */
    var target = 0, vel = 0, dir = 1;
    ST.create({ start: 0, end: 'max', onUpdate: function (self) { target = self.getVelocity(); dir = self.direction; } });
    var heads = $$('.sec-h'), imgs = $$('.obj-in img'), give = $('.give-vis'), heroEn = $$('.ht-en');
    if (give) gsap.set(give, { transformOrigin: '50% 100%' });
    if (heroEn.length) gsap.set(heroEn, { transformOrigin: '0% 100%' });
    var setSkew = heads.length ? gsap.quickSetter(heads, 'skewY', 'deg') : null;
    var setTilt = imgs.length ? gsap.quickSetter(imgs, 'rotation', 'deg') : null;
    var setSway = give ? gsap.quickSetter(give, 'skewX', 'deg') : null;
    var setStretch = heroEn.length ? gsap.quickSetter(heroEn, 'scaleY') : null;
    var track = $('.tape-track'), seq = $('.tape-seq'), tx = 0, seqW = 0, tapeBoost = 0;
    if (track && seq) { track.appendChild(seq.cloneNode(true)); track.appendChild(seq.cloneNode(true)); }
    function measureTape() { seqW = seq ? seq.getBoundingClientRect().width : 0; }
    measureTape();
    ST.addEventListener('refresh', measureTape);
    var setTape = track ? gsap.quickSetter(track, 'x', 'px') : null;
    gsap.ticker.add(function (time, dt) {
      target *= 0.88;
      vel += (target - vel) * 0.14;
      var n = clamp(-1, 1, vel / 2600);
      if (setSkew) setSkew(n * -7);
      if (setTilt) setTilt(n * 16);
      if (setSway) setSway(n * -10);
      if (setStretch) setStretch(1 + Math.abs(n) * 0.16);
      if (setTape && seqW) {
        tapeBoost *= 0.95;
        var speed = (70 + Math.abs(vel) * 0.35 + tapeBoost) * (dir > 0 ? -1 : 1);
        tx += speed * Math.min(dt, 50) / 1000;
        if (tx <= -seqW) tx += seqW;
        if (tx > 0) tx -= seqW;
        setTape(tx);
      }
    });
    var tape = $('.tape');
    if (tape) tape.addEventListener('click', function (e) { tapeBoost = 1800; burst(e.clientX, e.clientY, 10); });

    /* ---------- hero: draggable price tag, jelly letters, parallax ---------- */
    var tag = $('.hang-tag'), kick = $('.hang-kick');
    function swingImpulse(sign, amp) {
      gsap.killTweensOf(kick, 'rotation');
      gsap.timeline()
        .to(kick, { rotation: amp * sign, duration: 0.22, ease: 'power2.out' })
        .to(kick, { rotation: 0, duration: 3.2, ease: 'elastic.out(1, 0.32)' });
    }
    if (tag && kick && window.Draggable) {
      var proxy = document.createElement('div');
      var startRot = 0;
      window.Draggable.create(proxy, {
        trigger: tag, type: 'x', minimumMovement: 4,
        onPress: function () { gsap.killTweensOf(kick); startRot = gsap.getProperty(kick, 'rotation'); gsap.set(proxy, { x: 0 }); this.update(); },
        onDrag: function () { gsap.set(kick, { rotation: clamp(-70, 70, startRot - this.x * 0.32) }); },
        onDragEnd: function () { gsap.to(kick, { rotation: 0, duration: 3.2, ease: 'elastic.out(1, 0.3)' }); },
        onClick: function (e) { var p = pt(e, tag); swingImpulse(Math.random() < 0.5 ? -1 : 1, 32); burst(p[0], p[1], 14); }
      });
    }
    var chars = $$('.ht-en .c');
    function jelly(c, k) {
      gsap.timeline()
        .to(c, { yPercent: -16 * k, scaleY: 1.12, scaleX: 0.9, duration: 0.16, ease: 'power2.out', overwrite: 'auto' })
        .to(c, { yPercent: 0, scaleY: 1, scaleX: 1, duration: 1.1, ease: 'elastic.out(1, 0.28)' });
    }
    if (fine) chars.forEach(function (c) { c.addEventListener('pointerenter', function () { jelly(c, 1); }); });
    var title = $('.hero-title');
    if (title) title.addEventListener('click', function (e) {
      var p = pt(e, title);
      chars.forEach(function (c) {
        var q = centerOf(c), dist = Math.hypot(q[0] - p[0], q[1] - p[1]);
        gsap.delayedCall(dist / 1400, function () { jelly(c, 1.5); });
      });
      burst(p[0], p[1], 16, { vmax: 640 });
    });
    if (fine && $('.hero')) {
      var tX = gsap.quickTo('.hero-title', 'x', { duration: 0.8, ease: 'power3' }), tY = gsap.quickTo('.hero-title', 'y', { duration: 0.8, ease: 'power3' });
      var hX = gsap.quickTo('.hang-drop', 'x', { duration: 1, ease: 'power3' });
      $('.hero').addEventListener('pointermove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        tX(nx * -20); tY(ny * -12); hX(nx * 34);
      });
      $('.hero').addEventListener('pointerleave', function () { tX(0); tY(0); hX(0); });
    }
    var hd = $('.hi-date b');
    if (hd && window.ScrambleTextPlugin) {
      var scr = function () { gsap.to(hd, { duration: 0.9, scrambleText: { text: '2026.11.07', chars: '0123456789', speed: 0.5 }, overwrite: true }); };
      hd.parentElement.addEventListener(fine ? 'pointerenter' : 'click', scr);
    }

    /* ---------- envelope: click opens it by scrolling through its scene ---------- */
    var envBox = $('#envBox');
    if (envBox && GL.env && GL.env.scrollTrigger) {
      var openEnv = function (e) {
        var st = GL.env.scrollTrigger, p = pt(e, envBox);
        burst(p[0], p[1], 18, { vmax: 620 });
        var to = st.end - 2;
        if (window.scrollY >= to - 4) return;
        if (GL.lenis) GL.lenis.scrollTo(to, { duration: 2.2 });
        else window.scrollTo({ top: to, behavior: 'smooth' });
      };
      envBox.addEventListener('click', openEnv);
      envBox.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnv(e); } });
      var popped = false;
      ST.create({
        trigger: '.env', start: 'top top', end: '+=150%',
        onUpdate: function (self) {
          if (!popped && self.direction > 0 && self.progress > 0.44) {
            popped = true;
            var c = centerOf($('.env-card'));
            burst(c[0], c[1] - 30, 24, { vmin: 300, vmax: 760, a0: 215, a1: 325 });
          }
          if (self.progress < 0.3) popped = false;
        }
      });
    }

    /* ---------- calendar + D-day ---------- */
    $$('.cal-grid .d').forEach(function (cell) {
      cell.addEventListener('click', function (e) {
        if (cell.classList.contains('on')) {
          var p = pt(e, cell);
          burst(p[0], p[1], 22, { vmax: 640 });
          if (window.DrawSVGPlugin) gsap.fromTo('.cal-heart path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' });
          gsap.fromTo(cell.querySelector('b'), { scale: 1.8 }, { scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.3)' });
          toast('11월 7일 토요일, 이날 만나요!');
        } else {
          gsap.fromTo(cell, { x: -8 }, { x: 0, duration: 0.7, ease: 'elastic.out(1.2, 0.2)' });
          var on = $('.cal-grid .d.on b');
          if (on) gsap.fromTo(on, { scale: 1.6 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.3)' });
        }
      });
    });
    var big = $('#ddBig'), ddN = $('#ddN');
    if (big && ddN) big.addEventListener('click', function (e) {
      var target = parseInt(ddN.textContent, 10);
      if (isNaN(target)) return;
      if (GL.setCounting) GL.setCounting(true);
      var o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.3, ease: 'power3.out', onUpdate: function () { ddN.textContent = String(Math.round(o.v)); }, onComplete: function () { if (GL.setCounting) GL.setCounting(false); } });
      gsap.fromTo(big, { scale: 0.9 }, { scale: 1, duration: 1.1, ease: 'elastic.out(1, 0.3)' });
      var p = pt(e, big);
      burst(p[0], p[1], 12);
    });

    /* ---------- clock: tap to spin, it always lands on 2:30 ---------- */
    var clock = $('.clock');
    if (clock) clock.addEventListener('click', function (e) {
      var m = clock.querySelector('.c-m'), h = clock.querySelector('.c-h');
      var m0 = gsap.getProperty(m, 'rotation'), h0 = gsap.getProperty(h, 'rotation');
      gsap.timeline()
        .to(m, { rotation: m0 + 2160, svgOrigin: '100 100', duration: 1.5, ease: 'power3.inOut' }, 0)
        .to(h, { rotation: h0 + 360, svgOrigin: '100 100', duration: 1.5, ease: 'power3.inOut' }, 0)
        .set(m, { rotation: m0, svgOrigin: '100 100' })
        .set(h, { rotation: h0, svgOrigin: '100 100' })
        .fromTo(clock, { scale: 1.08 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
      var p = pt(e, clock);
      burst(p[0], p[1], 12);
      toast('주일 오후 2시 30분, 본당에서 만나요!');
    });

    /* ---------- programs: drag and throw the objects, tap to make them jump ---------- */
    var zTop = 5;
    $$('.obj-in').forEach(function (el) {
      var stage = el.closest('.pg-stage');
      var jump = function (e) {
        var p = pt(e, el);
        el.parentElement.style.zIndex = ++zTop;
        gsap.timeline()
          .to(el, { y: '-=48', rotation: '+=360', scale: 1.1, duration: 0.5, ease: 'power2.out' })
          .to(el, { y: '+=48', scale: 1, duration: 0.65, ease: 'bounce.out' });
        burst(p[0], p[1], 12);
        var cap = el.querySelector('figcaption');
        if (cap) gsap.fromTo(cap, { scale: 1.45 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.3)' });
      };
      if (window.Draggable) {
        window.Draggable.create(el, {
          type: fine ? 'x,y' : 'x', bounds: stage, inertia: !!window.InertiaPlugin, edgeResistance: 0.72, minimumMovement: 6,
          onPress: function () { el.parentElement.style.zIndex = ++zTop; gsap.to(el, { scale: 1.08, duration: 0.25, ease: 'power2.out' }); },
          onRelease: function () { gsap.to(el, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' }); },
          onDrag: function () { gsap.to(el, { rotation: clamp(-28, 28, this.deltaX * 2.4), duration: 0.3, overwrite: 'auto' }); },
          onDragEnd: function () { gsap.to(el, { rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.3)' }); },
          onClick: jump
        });
      } else {
        el.addEventListener('click', jump);
      }
    });

    /* ---------- give: tap the tower and it wobbles ---------- */
    var wob = $('.give-wob');
    if (wob) wob.addEventListener('click', function (e) {
      gsap.fromTo(wob, { skewX: R(-15, 15), scaleY: 0.92 }, { skewX: 0, scaleY: 1, duration: 1.9, ease: 'elastic.out(1, 0.14)', transformOrigin: '50% 100%' });
      var p = pt(e, wob);
      burst(p[0], p[1], 14, { vmax: 620 });
      gsap.fromTo('.give-to mark', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 0.9, stagger: 0.25, ease: 'power2.inOut' });
    });

    /* ---------- coupons: tap to tear off the stub and get a stamp ---------- */
    $$('.cp').forEach(function (cp) {
      var stub = cp.querySelector('.cp-stub'), stamp = cp.querySelector('.cp-stamp'), label = cp.querySelector('.cp-k');
      var text0 = label ? label.textContent : '';
      var toggle = function (e) {
        var torn = cp.classList.toggle('torn');
        if (torn) {
          gsap.to(stub, { x: R(30, 64), y: R(120, 180), rotation: R(18, 42), autoAlpha: 0, duration: 0.9, ease: 'power2.in' });
          gsap.fromTo(stamp, { scale: 2.8, autoAlpha: 0, rotation: -28 }, { scale: 1, autoAlpha: 1, rotation: -12, duration: 0.5, ease: 'back.out(2.6)', delay: 0.08 });
          gsap.fromTo(cp, { x: -9 }, { x: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
          if (label && window.ScrambleTextPlugin) gsap.to(label, { duration: 0.6, scrambleText: { text: text0, chars: 'GIVELOVE', speed: 0.6 }, overwrite: true });
          var p = pt(e, cp);
          burst(p[0], p[1], 12);
        } else {
          gsap.to(stub, { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.6)' });
          gsap.to(stamp, { autoAlpha: 0, scale: 0.6, duration: 0.3 });
        }
      };
      cp.addEventListener('click', toggle);
      cp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); } });
    });

    /* ---------- film: tap to pause/play, tilts with the mouse ---------- */
    var tilt = $('.film-tilt'), vid = $('#dolls'), badge = $('.film-badge');
    if (tilt && vid) {
      gsap.set(tilt, { transformPerspective: 900 });
      tilt.addEventListener('click', function (e) {
        var p;
        if (vid.paused) { vid.dataset.user = ''; p = vid.play(); if (p && p.catch) p.catch(function () {}); badge.textContent = '재생'; tilt.setAttribute('data-cursor', '멈춤'); }
        else { vid.dataset.user = 'paused'; vid.pause(); badge.textContent = '일시정지'; tilt.setAttribute('data-cursor', '재생'); }
        if (curLabel && fine) curLabel.textContent = tilt.getAttribute('data-cursor');
        gsap.fromTo(badge, { autoAlpha: 1, scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(2)', overwrite: true });
        gsap.to(badge, { autoAlpha: 0, duration: 0.4, delay: 0.9 });
        gsap.fromTo(tilt, { scale: 0.97 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
        var q = pt(e, tilt);
        burst(q[0], q[1], 10);
      });
      if (fine) {
        var rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.6, ease: 'power3' });
        tilt.addEventListener('pointermove', function (e) {
          var r = tilt.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 14);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
        });
        tilt.addEventListener('pointerleave', function () { rx(0); ry(0); });
      }
    }

    /* ---------- share: the icon flies off ---------- */
    var sb = $('#shareBtn');
    if (sb) sb.addEventListener('click', function (e) {
      var ic = sb.querySelector('.ic');
      if (ic) gsap.timeline()
        .to(ic, { x: 34, y: -26, rotation: 30, autoAlpha: 0, duration: 0.32, ease: 'power2.in' })
        .set(ic, { x: -26, y: 18, rotation: -10 })
        .to(ic, { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' });
      var p = pt(e, sb);
      burst(p[0], p[1], 14, { vmax: 600 });
    });

    /* ---------- finale: stitches ripple, "갈게요" celebrates ---------- */
    var stitch = $('#stitch');
    if (stitch) stitch.addEventListener('click', function (e) {
      $$('.s', stitch).forEach(function (g) {
        var q = centerOf(g), dd = Math.hypot(q[0] - e.clientX, q[1] - e.clientY);
        gsap.to(g, { y: -10, duration: 0.16, delay: dd / 900, yoyo: true, repeat: 1, ease: 'power2.out' });
      });
      burst(e.clientX, e.clientY, 12);
    });
    var go = $('#goBtn'), note = $('#goNote');
    if (go && note) {
      var setGoing = function () {
        go.querySelector('span').textContent = '11월 7일에 만나요 ♥';
        note.textContent = '기다릴게요. 같이 올 사람도 데려오세요!';
        go.classList.add('is-going');
      };
      try { if (window.localStorage.getItem('gl-going') === '1') setGoing(); } catch (err) { /* storage blocked */ }
      go.addEventListener('click', function () {
        try { window.localStorage.setItem('gl-going', '1'); } catch (err) { /* storage blocked */ }
        var c = centerOf(go);
        burst(c[0], c[1], 42, { vmin: 380, vmax: 1000, dur: 2.2, g: 760, a0: 190, a1: 350, max: 34 });
        gsap.delayedCall(0.28, function () {
          burst(window.innerWidth * 0.18, window.innerHeight * 0.45, 14, { vmax: 720 });
          burst(window.innerWidth * 0.82, window.innerHeight * 0.45, 14, { vmax: 720 });
        });
        gsap.fromTo(go, { scale: 0.86 }, { scale: 1, duration: 1.1, ease: 'elastic.out(1, 0.28)' });
        setGoing();
        gsap.fromTo(note, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      });
    }

    /* ---------- a few hearts wherever you tap on empty space ---------- */
    var down = null;
    document.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY, t: Date.now() }; }, { passive: true });
    document.addEventListener('pointerup', function (e) {
      if (!down) return;
      var mv = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = Date.now() - down.t;
      down = null;
      if (mv > 8 || dt > 450) return;
      if (e.target && e.target.closest && e.target.closest('a, button, [role="button"], [data-cursor], .obj-in, .hang-tag, input, textarea, .tape')) return;
      burst(e.clientX, e.clientY, 7, { vmin: 160, vmax: 380, max: 20 });
    }, { passive: true });
  }
})();

