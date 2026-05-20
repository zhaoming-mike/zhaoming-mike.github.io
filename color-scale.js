/**
 * color-scale.js — Tomato.gg Wotlabs 色阶配置 (IMMUTABLE)
 *
 * 所有数值显示颜色统一由此文件管理，修改阈值或色值后全局生效。
 * 页面加载后所有配置对象被冻结，无法被外部代码篡改。
 *
 * 参考: https://tomato.gg/blog/posts/wnx
 * "We're still using the old Wotlabs colors."
 *
 * 用法:
 *   colorScale.get(值, 'wn8')       → { tier, hex, label, cssClass }
 *   colorScale.get(值, 'winrate')   → 同上
 *   colorScale.get(值, 'dpg')       → 同上 (DPG 使用 wn8 色阶)
 *   colorScale.get(值, 'survival')  → 同上
 *   colorScale.get(值, 'kd')        → 同上
 *   colorScale.get(值, 'rating')    → 同上 (Rating 使用 wn8 色阶)
 */

var colorScale = (function () {
  'use strict';

  // ── 色阶定义 (低→高, 10级) ──────────────────────────────────
  var TIERS = [
    { tier: 0,  name: 'very_bad',        label: 'Very Bad',        hex: '#FE0E00' },
    { tier: 1,  name: 'bad',             label: 'Bad',             hex: '#FE7903' },
    { tier: 2,  name: 'below_average',   label: 'Below Average',   hex: '#F8CE44' },
    { tier: 3,  name: 'average',         label: 'Average',         hex: '#FDFD4E' },
    { tier: 4,  name: 'above_average',   label: 'Above Average',   hex: '#94BF4B' },
    { tier: 5,  name: 'good',            label: 'Good',            hex: '#4A8C3F' },
    { tier: 6,  name: 'very_good',       label: 'Very Good',       hex: '#51A9C5' },
    { tier: 7,  name: 'great',           label: 'Great',           hex: '#3F7FB0' },
    { tier: 8,  name: 'unicum',          label: 'Unicum',          hex: '#7E4DBD' },
    { tier: 9,  name: 'super_unicum',    label: 'Super Unicum',    hex: '#512C80' },
  ];

  // ── 各统计类型的阈值上限 (每个区间 [thresholds[i], thresholds[i+1]) ) ──
  // 10个色阶 = 9个分割点。最后一个区间为 [thresholds[8], +∞)
  var SCALES = {

    // WN8 / WNX — 经典 Wotlabs 阈值
    wn8:        [300, 450, 650, 900, 1200, 1600, 2000, 2450, 2900],

    // WN8 / WNX 别名
    wnx:        [300, 450, 650, 900, 1200, 1600, 2000, 2450, 2900],

    // 胜率 (%) — 2025 tomato.gg 更新阈值
    winrate:    [44, 47, 49, 51, 53, 56, 60, 64, 68],

    // 场均伤害 — 使用和 WN8 相同的阈值 (tomato.gg 惯例)
    dpg:        [300, 450, 650, 900, 1200, 1600, 2000, 2450, 2900],

    // 存活率 (%)
    survival:   [15, 20, 25, 30, 35, 40, 45, 50, 55],

    // KD 比
    kd:         [0.5, 0.8, 1.0, 1.3, 1.6, 2.0, 2.5, 3.0, 4.0],

    // 场均击杀
    frags:      [0.3, 0.5, 0.7, 0.9, 1.2, 1.5, 1.8, 2.2, 2.8],

    // Global Rating — 使用和 WN8 相同的阈值
    rating:     [300, 450, 650, 900, 1200, 1600, 2000, 2450, 2900],
  };

  // ── 冻结配置数据 (防止运行时篡改) ──────────────────────────
  // 冻结每个 tier 对象
  TIERS.forEach(function (t) { Object.freeze(t); });
  // 冻结 TIERS 数组
  Object.freeze(TIERS);
  // 冻结每个 scale 的阈值数组 + 冻结顶层 SCALES
  Object.keys(SCALES).forEach(function (k) { Object.freeze(SCALES[k]); });
  Object.freeze(SCALES);

  // ── 查找函数 ──────────────────────────────────────────────
  function getTier(value, thresholds) {
    if (value == null || isNaN(value)) return TIERS[0]; // 无数据返回最低档
    for (var i = 0; i < thresholds.length; i++) {
      if (value < thresholds[i]) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  /**
   * get(value, scaleType)
   * 返回 { tier, name, label, hex, cssClass }
   * 返回值是一个新对象，调用方可自由使用但无法反向影响配置源。
   *
   * scaleType 可选: 'wn8' | 'wnx' | 'winrate' | 'dpg' | 'survival' | 'kd' | 'frags' | 'rating'
   */
  function get(value, scaleType) {
    var thresholds = SCALES[scaleType] || SCALES.wn8;
    var tier = getTier(value, thresholds);
    return {
      tier:   tier.tier,
      name:   tier.name,
      label:  tier.label,
      hex:    tier.hex,
      cssClass: 'tier-' + tier.name,
    };
  }

  /**
   * 批量生成 CSS 自定义属性并注入 <head>
   * 页面加载时自动调用一次，外部不应再次调用。
   */
  var _cssInjected = false;
  function injectCSS() {
    if (_cssInjected) return;
    _cssInjected = true;
    var rules = [];
    for (var i = 0; i < TIERS.length; i++) {
      var t = TIERS[i];
      rules.push('  --tier-' + t.name + ':' + t.hex + ';');
    }
    var style = document.createElement('style');
    style.id = 'color-scale-vars';
    style.textContent = ':root {\n' + rules.join('\n') + '\n}\n';
    document.head.appendChild(style);
  }

  /** 返回色阶定义快照 (浅拷贝)，外部可自由修改返回值但不影响配置源 */
  function allTiers() {
    return TIERS.map(function (t) { return Object.assign({}, t); });
  }

  /** 返回阈值配置快照 (浅拷贝) */
  function scales() {
    var copy = {};
    Object.keys(SCALES).forEach(function (k) { copy[k] = SCALES[k].slice(); });
    return copy;
  }

  // ── 冻结 API 对象 ────────────────────────────────────────
  var API = {
    get: get,
    injectCSS: injectCSS,
    allTiers: allTiers,
    scales: scales,
  };
  Object.freeze(API);
  return API;
})();

// 在浏览器环境下自动注入 CSS 变量，并锁定全局 colorScale 引用
if (typeof document !== 'undefined') {
  function _initColorScale() {
    if (colorScale.injectCSS) colorScale.injectCSS();
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'colorScale', {
        value: colorScale,
        writable: false,
        configurable: false,
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initColorScale);
  } else {
    _initColorScale();
  }
}
