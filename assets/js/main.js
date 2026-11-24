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

  var ATTR = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var ATTR_KEY = 'zl_attr';

  function params() {
    var q = new URLSearchParams(window.location.search);
    var live = {};
    ATTR.forEach(function (k) {
      if (q.get(k)) live[k] = q.get(k);
    });
    if (!live.gclid) {
      var c = document.cookie.match(/(?:^|;\s*)_gcl_aw=([^;]+)/);
      if (c) live.gclid = decodeURIComponent(c[1]).split('.').slice(2).join('.') || '';
    }

    // 广告参数只出现在落地页 URL 上，站内一跳就丢，客户翻两页再填表就归因不上。
    // 存进 sessionStorage 兜住整个会话，落地页的新值永远覆盖旧值。
    var saved = {};
    try { saved = JSON.parse(window.sessionStorage.getItem(ATTR_KEY) || '{}') || {}; } catch (e) { saved = {}; }
    var merged = {};
    ATTR.forEach(function (k) { if (saved[k]) merged[k] = saved[k]; });
    ATTR.forEach(function (k) { if (live[k]) merged[k] = live[k]; });
    if (Object.keys(live).length) {
      try { window.sessionStorage.setItem(ATTR_KEY, JSON.stringify(merged)); } catch (e) { /* 隐私模式忽略 */ }
    }
    return merged;
  }

  function stampForms() {
    var p = params();
    document.querySelectorAll('form[data-inquiry]').forEach(function (form) {
      Object.keys(p).forEach(function (k) {
        var field = form.querySelector(k === 'gclid' ? '[data-gclid]' : '[data-utm="' + k + '"]');
        if (field) field.value = p[k];
      });
      // 记录真实提交页，而不是语种首页：广告优化靠这个分辨哪个落地页出单
      var page = form.querySelector('[name="page"]');
      if (page) page.value = window.location.pathname + window.location.search;
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

  // 邮箱两次输入不一致就地拦下：拦在提交前，客户还能改；发出去才发现就打水漂了
  function emailGuard(form) {
    var main = form.querySelector('[data-email-main]');
    var again = form.querySelector('[data-email-confirm]');
    if (!main || !again) return true;
    var box = again.parentNode.querySelector('.field__err');
    if (!box) {
      box = document.createElement('span');
      box.className = 'field__err';
      box.setAttribute('role', 'alert');
      again.parentNode.appendChild(box);
    }
    var same = main.value.trim().toLowerCase() === again.value.trim().toLowerCase();
    box.textContent = same ? '' : (cfg.emailMismatchText || 'The two email addresses do not match.');
    if (!same) {
      again.setAttribute('aria-invalid', 'true');
      if (!again.value.trim()) box.textContent = cfg.emailMismatchText || 'The two email addresses do not match.';
      return false;
    }
    again.removeAttribute('aria-invalid');
    return true;
  }

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (!t.closest('[data-email-main],[data-email-confirm]')) return;
    var form = t.closest('form[data-inquiry]');
    if (form) emailGuard(form);
  }, true);

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-inquiry]');
    if (!form) return;

    if (!emailGuard(form)) {
      e.preventDefault();
      var bad = form.querySelector('[data-email-confirm]');
      if (bad) bad.focus();
      return;
    }

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

/* WhatsApp 悬浮按钮避让：一旦压住询价表单（含提交按钮）就淡出，避免挡住字段和误点 */
(function () {
  var wa = document.querySelector('.wa');
  if (!wa) return;
  var cards = document.querySelectorAll('form[data-inquiry]');
  if (!cards.length) return;

  function overlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  var pending = false;
  function layout() {
    pending = false;
    var r = wa.getBoundingClientRect();
    var hide = false;
    for (var i = 0; i < cards.length; i++) {
      var b = cards[i].getBoundingClientRect();
      if (b.width && b.height && overlap(r, b)) { hide = true; break; }
    }
    wa.classList.toggle('is-away', hide);
  }
  function schedule() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(layout);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  schedule();
})();
