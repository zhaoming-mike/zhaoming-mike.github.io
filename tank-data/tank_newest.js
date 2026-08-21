// 新增坦克批次记录，按时间倒序排列（最新在前）
// 每次 WG 新增坦克时，在此追加一个批次即可
const NEWEST_TANK_BATCHES = [
    {
        date: "2026-08-21",
        label: "2026年8月更新",
        short: "8月",
        color: "#fa0",   // 批次专属色
        ids: [
            43809,  // 美国 VIII Ironclad Guardian 坦歼
            67377,  // 中国 VIII Bull Demon King 重坦
            68401,  // 中国 X Waffentrager 15 坦歼
            69441,  // 法国 IX M47 Chevalier 中坦
        ]
    },
    {
        date: "2026-07-27",
        label: "2026年7月更新",
        short: "7月",
        color: "#0cf",   // 批次专属色
        ids: [
            68929,  // 法国 X Durendal 中坦
            70145,  // 苏联 X T-13 重坦
            25681,  // 英国 IX Headshaker 坦歼
            26449,  // 英国 IX Pike 重坦
            66609,  // 中国 IX PGZ-70 中坦
            67617,  // 美国 IX M-VII-Y 重坦
            69921,  // 美国 IX Ares MTB 中坦
            54161,  // 波兰 VIII Krazownik 重坦
            67857,  // 德国 VII Chi-Go 中坦
        ]
    },
    {
        date: "2026-05-14",
        label: "2026年5月更新",
        short: "5月",
        color: "#5f5",   // 批次专属色
        ids: [
            67137,  // 法国 VIII Lorraine 120 Alby 坦歼
            53649,  // 波兰 X Wz. 64GC Bzyg 重坦
            54305,  // 美国 VIII Chrysler MTC 2TC 中坦
            53409,  // 意大利 VIII Prototipo 6 中坦
            51857,  // 波兰 VIII SDP wz 66 Grom 坦歼
            66113,  // 法国 IX Sentinelle 重坦
            63025,  // 中国 IX WZ-120G FT 坦歼
            26641,  // 德国 IX Kpz. Erich Konzept I 中坦
            66625,  // 法国 IX VCS 6x6 TS 90 轻坦
            66097,  // 中国 IX Yong Bing 重坦
            8305,   // 捷克 IX ZTS Vz.63-1 Ogar 中坦
            65601,  // 法国 VIII SFAC 105 坦歼
            66369,  // 法国 IX Vercingétorix 中坦
            15441,  // 英国 VIII Chieftain/T95 中坦
            53665,  // 意大利 IX Serpente 中坦
            31249,  // 德国 X Schwertwal 重坦
            33825,  // 美国 X MBT-B 重坦
        ]
    }
];

// 由批次自动生成：快速查询 Set（用于 O(1) 过滤）
const NEWEST_TANK_IDS = new Set(NEWEST_TANK_BATCHES.flatMap(function(b) { return b.ids; }));

// tank_id → 所属批次信息数组 [{short, color}, ...]（用于卡片徽章和发光色）
var NEWEST_BATCH_MAP = {};
NEWEST_TANK_BATCHES.forEach(function(b) {
    b.ids.forEach(function(id) {
        if (!NEWEST_BATCH_MAP[id]) NEWEST_BATCH_MAP[id] = [];
        NEWEST_BATCH_MAP[id].push({ short: b.short, color: b.color });
    });
});
