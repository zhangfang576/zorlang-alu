/* Progressive enhancement only: the site is fully readable without this file. */
(function () {
  'use strict';

  var cfg = window.ZL || {};
  var hasGa = cfg.ga4 && cfg.ga4.indexOf('X') === -1;
  var hasAds = cfg.ads && cfg.ads.indexOf('X') === -1;

  function loadTag() {
    if (!hasGa && !hasAds) return;
    var id = hasGa ? cfg.ga4 : cfg.ads;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    if (hasGa) window.gtag('config', cfg.ga4, { anonymize_ip: true });
    if (hasAds) window.gtag('config', cfg.ads);
  }

  function params() {
    var q = new URLSearchParams(window.location.search);
    var out = {};
    ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
      if (q.get(k)) out[k] = q.get(k);
    });
    if (!out.gclid) {
      var c = document.cookie.match(/(?:^|;\s*)_gcl_aw=([^;]+)/);
      if (c) out.gclid = decodeURIComponent(c[1]).split('.').slice(2).join('.') || '';
    }
    return out;
  }

  function stampForms() {
    var p = params();
    document.querySelectorAll('form[data-inquiry]').forEach(function (form) {
      Object.keys(p).forEach(function (k) {
        var field = form.querySelector(k === 'gclid' ? '[data-gclid]' : '[data-utm="' + k + '"]');
        if (field) field.value = p[k];
      });
    });
  }

  function track(name, label) {
    if (window.gtag) {
      window.gtag('event', name, { event_category: 'lead', event_label: label || '' });
    }
    if (window.gtag && hasAds && label) {
      window.gtag('event', 'conversion', { send_to: cfg.ads + '/' + label });
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-conv]');
    if (!el) return;
    var kind = el.getAttribute('data-conv');
    if (kind === 'whatsapp') track('whatsapp_click', cfg.labels && cfg.labels.whatsapp);
    else if (kind === 'email') track('email_click', cfg.labels && cfg.labels.email);
    else if (kind === 'phone') track('phone_click', cfg.labels && cfg.labels.phone);
  }, { passive: true });

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-inquiry]');
    if (!form) return;
    stampForms();

    var action = form.getAttribute('action') || '';
    // mailto: 由邮件客户端接管，这里只记一次点击
    if (action.indexOf('mailto:') === 0) {
      track('generate_lead', cfg.labels && cfg.labels.form);
      return;
    }

    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = cfg.sendingText || 'Sending…'; }

    var payload = {};
    new FormData(form).forEach(function (v, k) { payload[k] = v; });

    function fail() {
      if (btn) { btn.disabled = false; btn.textContent = btnText; }
      var box = form.querySelector('.form__err');
      if (!box) {
        box = document.createElement('p');
        box.className = 'form__err';
        box.setAttribute('role', 'alert');
        form.appendChild(box);
      }
      box.innerHTML = (cfg.errorText || 'Something went wrong. Please email us instead.') +
        (cfg.mailto ? ' <a href="mailto:' + cfg.mailto + '">' + cfg.mailto + '</a>' : '');
    }

    fetch(action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && data.success) {
          track('generate_lead', cfg.labels && cfg.labels.form);
          var ok = document.createElement('p');
          ok.className = 'ok';
          ok.textContent = cfg.successText || 'Thanks — we will reply within one working day.';
          form.replaceWith(ok);
        } else {
          fail();
        }
      })
      .catch(fail);
  }, true);

  if (document.readyState !== 'loading') { loadTag(); stampForms(); }
  else document.addEventListener('DOMContentLoaded', function () { loadTag(); stampForms(); });
})();


/* 牌号应用图库：缩略图 + 左右箭头，循环切换。无 JS 时首图与缩略图链接依然可用 */
(function () {
  function slides(gal) { return gal.querySelectorAll('.gal__th'); }

  function show(gal, i) {
    var list = slides(gal);
    var n = list.length;
    if (!n) return;
    i = ((i % n) + n) % n;
    var th = list[i];
    var src = th.getAttribute('data-src');
    var img = gal.querySelector('[data-gal-main]');
    var webp = gal.querySelector('[data-gal-webp]');
    if (!src || !img) return;
    if (webp) webp.setAttribute('srcset', src.replace(/\.jpg$/, '.webp'));
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    var count = gal.querySelector('[data-gal-count]');
    if (count) count.textContent = (i + 1) + ' / ' + n;
    Array.prototype.forEach.call(list, function (x, k) {
      x.classList.toggle('is-on', k === i);
      if (k === i) x.setAttribute('aria-current', 'true');
      else x.removeAttribute('aria-current');
    });
  }

  function current(gal) {
    var list = slides(gal);
    for (var i = 0; i < list.length; i++) if (list[i].classList.contains('is-on')) return i;
    return 0;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var gal = t.closest('[data-gal]');
    if (!gal) return;

    if (t.closest('.gal__nav--prev')) { e.preventDefault(); show(gal, current(gal) - 1); return; }
    if (t.closest('.gal__nav--next')) { e.preventDefault(); show(gal, current(gal) + 1); return; }

    var th = t.closest('.gal__th');
    if (!th) return;
    e.preventDefault();
    show(gal, parseInt(th.getAttribute('data-i'), 10));
  });

  /* 键盘左右键切换 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var gal = document.querySelector('[data-gal]');
    if (!gal) return;
    var a = document.activeElement;
    if (!a || !gal.contains(a)) return;
    e.preventDefault();
    show(gal, current(gal) + (e.key === 'ArrowRight' ? 1 : -1));
  });
})();
