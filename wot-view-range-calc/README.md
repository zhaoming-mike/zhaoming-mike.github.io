# 坦克世界视野计算器（简体中文版）

基于 [RedshiftOTF/WOT-view-range-calculator](https://github.com/redshiftotf/WOT-view-range-calculator) 的简体中文本地化版本。
原站：https://redshiftotf.github.io/WOT-view-range-calculator/

> **当前状态**：全站简体中文交付——界面文案、运行时输出、全部词条译名（`name`/`note`）、conditionalFootnote 与组标签均为中文；`lang="zh-CN"`。
> 译名集中维护于独立配置文件 `locales/zh-CN.js`，由 `index.html` 启动时经 `mergeLocales()` 运行时合入，改动无需动 `index.html` 的 CONFIG。

## 与原站的差异

- **全站汉化**：界面框架文案（面板标题、标签、按钮、运行时输出、脚注、免责声明、署名）与词条级译名全部为简体中文。
- **本地化架构**：词条译名不再散写在 `index.html` 的 CONFIG 中，统一集中到独立配置文件 `locales/zh-CN.js`（仅数据、无逻辑），由 `mergeLocales()` 按 id 启动时合并进 CONFIG；缺失译名的词条回退英文名。
- **移除 GoatCounter** 统计脚本（本地化工具不应向原站统计域上报数据）。
- **字体栈追加中文字体兜底**（`Microsoft YaHei` / `PingFang SC`），保留 Google Fonts 外链。
- **其余功能与原站完全一致**：公式、数值、渲染与交互逻辑、CONFIG 均为**零改动**；由 `verify/check.py` 三约束持续强制校验（见下）。

## 使用

静态部署或直接打开 `index.html` 均可，无需服务器（图片为相对路径）。两种方式任选：

- 双击 `index.html`（浏览器 `file://` 直开）
- 或放入任意静态托管，用 `python -m http.server` 等起一个本地服务

## 许可与署名

本项目由 [RedshiftOTF/WOT-view-range-calculator](https://github.com/redshiftotf/WOT-view-range-calculator) 派生，遵循 GNU GPL-2.0（见 `LICENSE`）。原站作者：RedshiftOTF。
游戏图片版权归 Wargaming.net 所有。
**简体中文汉化：阿明【北冥有鱼军团长】**

## 本地化说明

译名集中维护于 `locales/zh-CN.js`：词条级 `name`/`note`、`conditionalFootnote`、`groupLabels` 均在此文件；界面框架文案（面板标题、标签、按钮、运行时输出）在 `index.html` 中。

改动译名后运行约束校验：

```
python verify/check.py
```

三约束：
1. `index.html` 的 CONFIG 与英文原版完全一致（译名禁止写入 CONFIG）；
2. `locales/zh-CN.js` 覆盖 CONFIG 全部可译词条 id、无孤儿键、conditionalFootnote 非空、groupLabels 键完整；
3. 全部译名含中文字符（防漏译）。

## 翻译术语表

`locales/zh-CN.js` 全部 34 个词条 + `conditionalFootnote` + `groupLabels` 的译名与来源。词条顺序同 CONFIG 声明顺序。

| id | 英文（原站） | 中文 | 中文备注（译） | 来源 |
|---|---|---|---|---|
| bia | Brothers in Arms | 兄弟连 | 全体乘员训练至100% | 社区通译（WoT 全服通用标准译名；参见 [wiki.wargaming.net 乘员技能](https://wiki.wargaming.net/en/Commanders%27_skills) 概念对应） |
| vents | Ventilation | 通风 | 未安装在装备槽内 | 社区通译（标准译名；「通风」亦见 [wotgame.cn 配件指南](https://wotgame.cn/zh-cn/content/guide/general/equipment/)） |
| ventsSlot | Ventilation (equipment slot) | 通风（装备槽） | 安装在装备槽内 | 社区通译（同上套组；「（装备槽）」为 UI 限定语） |
| bountyVents | Bounty Ventilation | 赏金通风 | — | 社区通译（赏金系配件标准前缀「赏金」）+ [17173 报道](https://news.17173.com/content/01042026/024920019.shtml)（红/紫通风语境） |
| bondVents | Bond Ventilation | 债券通风 | — | 社区通译（债券系配件标准前缀「债券」） |
| ventPurge | Vent Purge directive | 净化通风 | 需要通风 | 官方中文 [steel-hunter 指令名单](https://wotgame.cn/zh-cn/news/news/steel-hunter-june_2026/)（其中「净化通风」提高改进型通风系统效率） |
| food | Food Consumable | 给养（大） | — | 社区通译（+10% 乘员给养，俗称「大补给/给养」） |
| fieldMod | View range field mod | 视野改装 | 各车数值不同，请以游戏内为准 | 社区通译（视野类改装标准说法） |
| optics | Coated Optics | 镀膜高光镜 | — | 社区通译（「高光」为社区简称；机制官方中文见 [17173 高级光学观察镜](https://wot.17173.com/content/07112023/140711678.shtml)，此处取亚服常用短名） |
| opticsSlot | Coated Optics (scouting slot) | 镀膜高光镜（侦察槽） | — | 社区通译（同上 + UI 限定语「（侦察槽）」） |
| bountyOptics | Bounty Optics | 赏金镀膜高光镜 | — | 社区通译（赏金前缀 + 高光镜，见 optics） |
| bondOptics | Bond Optics | 债券镀膜高光镜 | — | 社区通译（债券前缀 + 高光镜） |
| binocs | Binocular Telescope | 炮队镜 | 静止3秒后生效 | 社区通译（标准译名「炮队镜」，见 [3dmgame 配件对比](https://app.3dmgame.com/gl/573245.html)） |
| binocsSlot | Binoculars (scouting slot) | 炮队镜（侦察槽） | 静止3秒后生效 | 社区通译（同上 + UI 限定语） |
| bondBinocs | Bond Binoculars | 债券炮队镜 | 静止2秒后生效 | 社区通译（债券前缀 + 炮队镜；2 秒/3 秒机制差来自原站英文 note） |
| opticalCalibration | Optical Calibration directive | 光学校准 | 需要高光镜；游戏内标为2.5%，实测2.3% | 官方中文 [steel-hunter 指令名单](https://wotgame.cn/zh-cn/news/news/steel-hunter-june_2026/)（其中「光学校准」提高高级光学观察镜效率） |
| recon | Recon | 侦察 | 车长技能 | 社区通译（官方/玩家一致，见 [9game 车长技能](https://www.9game.cn/news/11834889.html)） |
| situationalAwareness | Situational Awareness | 态势感知 | 无线电操作员技能 | 社区通译（官方/玩家一致） |
| threatSearch | Threat Search | 威胁感应 | 第六感触发后持续5秒 | 官方中文（2.2 通讯兵新技能机制吻合）[搜狐报道](https://news.sohu.com/a/990291021_121738444)（灯泡后提升观察范围）；英语直译「搜寻威胁」亦见社区，本次取机制吻合的官方名 |
| emergency | Emergency | 紧急应对 | 本车受击15秒后 | 官方中文 [wotgame 乘员技能扩展](https://wotgame.cn/zh-cn/news/news/crew-perks-expansion-2026/)（「受到敌方造成的损伤后，乘员效率加成提高5%，持续15秒」） |
| holdTheLine | Hold the Line | 以寡敌众 | 敌方坦克数比己方多至少3辆时 | 官方中文（2.2 技能名单，机制吻合）[17173 报道](https://news.17173.com/content/03062026/164311351.shtml) |
| staySharp | Stay Sharp | 保持警惕 | 使用急救包15秒后 | 官方中文（机制吻合）同上 + [wotgame 乘员技能扩展](https://wotgame.cn/zh-cn/news/news/crew-perks-expansion-2026/) |
| bulletproof | Bulletproof | 钢筋铁骨 | 累计阻挡伤害超过本车血量后 | 官方中文（2.2 技师技能，机制吻合）同上 |
| sideBySide | Side by Side | 并肩作战 | 50米内有同类型友军时 | 社区通译（玩家加点稿「并肩作战」为通讯兵技能，见 [B站 加点稿](https://www.bilibili.com/opus/1128362941799727121)、[3dm M46 加点](https://3g.ali213.net/gl/html/1621295.html)） |
| communicationsExpert | Communications Expert | 通讯专家 | 累计协助伤害超过本车初始血量后 | 社区通译（英文直译 + 多点攻略确认通讯兵有该技能，见 [M46 加点](https://3g.ali213.net/gl/html/1621295.html)、[163 技能解析](https://m.163.com/dy/article/GVSSVKKN0546TXEK.html)） |
| cvsNone | No CVS | 无车长镜 | — | 社区通译（CVS 社区通用短名「车长镜」） |
| cvsStandard | Commander's Vision System | 车长镜 | — | 社区通译（「车长镜」更常见；「车长观瞄」为同义变体 [17173](https://wot.17173.com/content/07112023/140711678.shtml)） |
| cvsSlot | Commander's Vision System (scouting slot) | 车长镜（侦察槽） | — | 社区通译（同上 + UI 限定语） |
| cvsModNone | No CVS field mod | 无车长镜改装 | — | 社区通译（改装项的「无」选项） |
| panoramicTriplex | Panoramic Triplex | 全景三棱镜 | 仅部分10级战车 | 社区通译（⚠ 未获独立网页佐证，直译 triplex=三棱镜） |
| narrowAngle | Narrow Angle Observation Device | 窄角观察装置 | 仅部分10级战车 | 社区通译（⚠ 未获独立网页佐证，直译 Observation Device=观察装置） |
| spotBonusFoliage | Spotting Bonus: Foliage | 侦测强化：草丛 | 11级战车升级项 | 社区通译（⚠ 未获独立网页佐证；spotting=侦测/点亮） |
| spotBonusMovement | Spotting Bonus: Movement | 侦测强化：移动 | 11级战车升级项 | 社区通译（⚠ 未获独立网页佐证） |
| irst | IRST mode (WZ-219) - Experimental! | IRST模式（WZ-219）— 实验性！ | 11级战车，已完全升级，最窄波束 | 社区通译（IRST/WZ-219 为专名缩写；机制首见 [2.4 报道·红外搜索与跟踪系统](https://www.163.com/dy/article/L5EHLNRL05561I4V.html)，界面名保留 IRST） |
| conditionalFootnote | Crew skill percentage boosts these values however, only the base values of these skills are added to the Commander for view range calculations. These crew skills do not boost the Recon, Situational Awareness or Threat Search crew skills below | 乘员技能百分比可提升这些数值；不过计算视野时，只有这些技能的基础数值会计入车长。这些乘员技能不会提升下方列出的侦察、态势感知或威胁感应等技能。 | — | 官方中文（语义梳理：内嵌技能名随 threatSearch 统一为官方名「威胁感应」） |
| groupLabels.vents | No vents | 无通风 | — | 社区通译 |
| groupLabels.vision | No optics or binoculars | 无高光镜或炮队镜 | — | 社区通译 |

**来源说明**：本表未标注任何一条为「亚服客户端截图」级逐字证据——本次核查无法获得客户端截图；「官方中文」指 wotgame.cn 官方页面/官方新闻中的简体中文直引（Wargaming 简体中文本地化，亚服 SC 客户端同源），均附 URL 可查证；「社区通译」指中文社区通行标准译名或直译，标注 ⚠ 者为未获独立网页佐证、按直译采用的项。
