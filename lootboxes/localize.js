/* ============================================================
 * Pandora 界面文字本地化补丁
 *
 * 读取同目录 ui-text.json,把界面上的指定文字替换为配置值。
 * 该机制只改"显示层",不触碰掉落表配置与开箱逻辑,安全。
 *
 * 用法:
 *   1. 编辑 ui-text.json(text / contains / attributes 三个字典)
 *   2. 刷新页面(建议 Ctrl+F5 强制刷新)
 *
 * text        : 文本节点"完全匹配"才替换(键=原文,值=替换文)
 * contains    : 对整个可见文本做"子串替换"(适合带数字/变化的句子)
 * attributes  : 替换元素属性值,如 title / placeholder / aria-label
 * ============================================================ */
(function () {
  'use strict';

  var CONFIG_URL = 'ui-text.json';

  var cfg = { text: {}, contains: {}, attributes: {} };
  var applying = false;

  /* ---------- 文本节点替换 ---------- */
  function applyText(root) {
    if (applying) return;
    applying = true;
    try {
      var exact = cfg.text || {};
      var contains = cfg.contains || {};
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var v = node.nodeValue;
        if (!v || !v.trim()) continue;

        if (Object.prototype.hasOwnProperty.call(exact, v)) {
          node.nodeValue = exact[v];
          continue;
        }
        var out = v;
        for (var key in contains) {
          if (out.indexOf(key) !== -1) out = out.split(key).join(contains[key]);
        }
        if (out !== v) node.nodeValue = out;
      }
    } finally {
      applying = false;
    }
  }

  /* ---------- 属性值替换 ---------- */
  function applyAttributes(root) {
    var attrs = cfg.attributes || {};
    var els = (root && root.querySelectorAll) ? root.querySelectorAll('*') : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      for (var attr in attrs) {
        if (!el.hasAttribute(attr)) continue;
        var map = attrs[attr];
        var val = el.getAttribute(attr);
        var nv = val;
        if (Object.prototype.hasOwnProperty.call(map, val)) {
          nv = map[val];
        } else {
          for (var k in map) {
            if (nv && nv.indexOf(k) !== -1) nv = nv.split(k).join(map[k]);
          }
        }
        if (nv !== val) el.setAttribute(attr, nv);
      }
    }
  }

  function applyAll() {
    applyText(document.body);
    applyAttributes(document.body);
  }

  /* ---------- 初始化:应用一次 + 监听动态渲染 + 周期兜底 ---------- */
  function init() {
    applyAll();
    // 监听动态渲染:React 挂载、图表初始化、文本重设(characterData)都会触发重扫
    var attrKeys = Object.keys(cfg.attributes || {});
    var obsOpts = { childList: true, subtree: true, characterData: true };
    if (attrKeys.length) { obsOpts.attributes = true; obsOpts.attributeFilter = attrKeys; }
    var mo = new MutationObserver(applyAll);
    mo.observe(document.body, obsOpts);

    // 兜底:部分框架会延迟重渲染(如下拉/图表),周期补扫前 120 秒
    var swept = 0;
    var timer = setInterval(function () {
      applyAll();
      if (++swept >= 120) clearInterval(timer);
    }, 1000);
  }

  function load() {
    fetch(CONFIG_URL, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || typeof data !== 'object') throw new Error('bad config');
        cfg.text = data.text || {};
        cfg.contains = data.contains || {};
        cfg.attributes = data.attributes || {};
        init();
      })
      .catch(function (e) {
        console.warn('[localize] 加载 ' + CONFIG_URL + ' 失败:', e && e.message || e);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
