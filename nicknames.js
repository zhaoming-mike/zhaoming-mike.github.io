/**
 * nicknames.js — 军团成员中文昵称映射 (IMMUTABLE)
 *
 * account_id → display_name（中文昵称），供荣誉榜等页面关联展示。
 * 来源：users_*.txt 导出数据，抽取关键信息后源文件已删除。
 * 更新方式：重新导出 users_*.txt 后，按其 account_id / display_name
 * 两列格式更新下方 MAP 即可（display_name 为空的条目不收录）。
 *
 * 用法：
 *   nicknames.get(account_id)  → '阿明' | null
 */
var nicknames = (function () {
  'use strict';

  // account_id → display_name
  var MAP = {
    "3003591154": "阿明",
    "3012429987": "阿明",
    "3002353252": "老猫",
    "3011851906": "阿飒",
    "3002916712": "申宇",
    "2030508428": "张兴",
    "2025124839": "天空",
    "2025413392": "匹诺曹",
    "3014048007": "少不入川",
    "3003880959": "红星小号",
    "3003962708": "红星",
    "3005134909": "深蓝",
    "2045926150": "尤可莉莉",
    "2047553109": "海狼",
    "2005334503": "高旷",
    "3007815623": "鎏星",
    "2033355828": "克莱",
    "2006087444": "阿柒",
    "2051541655": "P1ck",
    "2031666919": "月怜风",
    "3016581628": "艾伦",
    "2011072346": "阿柒",
    "2014034336": "大头的司機",
    "3011369238": "栀虞",
    "2026085642": "腿腿",
  };

  function get(accountId) {
    if (accountId == null) return null;
    return MAP[String(accountId)] || null;
  }

  var API = { get: get };
  Object.freeze(API);
  return API;
})();
