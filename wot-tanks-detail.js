/* 共享的坦克详情渲染代码：wot-tanks.html 的模态详情与 wot-tanks-detail.html 独立页共同使用。
   依赖：tank-data/vehicles_data.js（定义 VEHICLES_JSON）、tank-data/tank_nicknames.js（定义 TANK_NICKNAMES）。 */

function toRoman(n) { return ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'][n]||n; }

function localImg(url) {
  if (!url) return '';
  var parts = url.split('/');
  var fname = parts[parts.length-1];
  if (url.indexOf('/small/') !== -1) return 'images/small_icon/'+fname;
  if (url.indexOf('/contour/') !== -1) return 'images/contour_icon/'+fname;
  return 'images/big_icon/'+fname;
}
const NATION_NAMES = {
  ussr:'苏联', germany:'德国', usa:'美国', france:'法国', uk:'英国',
  china:'中国', japan:'日本', czech:'捷克', sweden:'瑞典', poland:'波兰', italy:'意大利'
};
const NATION_FLAG = {
  ussr:'ru.png', germany:'de.png', usa:'us.png', france:'fr.png', uk:'gb.png',
  china:'cn.png', japan:'jp.png', czech:'cz.png', sweden:'se.png', poland:'pl.png', italy:'it.png'
};
const TYPE_NAMES = {
  heavyTank:'重型坦克', mediumTank:'中型坦克', lightTank:'轻型坦克', 'AT-SPG':'自行反坦克炮', SPG:'自行火炮'
};
const TYPE_ICON = { heavyTank:'HT.svg', mediumTank:'MT.svg', lightTank:'LT.svg', 'AT-SPG':'TD.svg', SPG:'SPG.svg' };

/* 构建一辆坦克的详情面板 HTML。v 为 vehicles_data 中的车辆对象。 */
function renderDetailHTML(v) {
  var p = v.default_profile || {};
  var html = '<div class="detail-header">';
  if (v.images && v.images.big_icon) html += '<img src="'+localImg(v.images.big_icon)+'" onerror="this.style.display=\'none\'">';
  html += '<div class="header-text">';
  html += '<h2>'+(TANK_NICKNAMES[v.tank_id]?'<span style="color:#f90;">'+TANK_NICKNAMES[v.tank_id]+'</span> ':'')+(v.short_name||v.name);
html += (v.short_name&&v.short_name!==v.name?' <span style="color:#888;font-weight:normal">|</span> <span style="color:#fff;font-weight:normal">'+v.name+'</span>':'');
html += ' <span style="color:#666;font-size:0.55em;font-weight:normal">#'+v.tank_id+'</span></h2>';
  html += '<div class="subtitle"><span style="display:inline-flex;align-items:center;gap:3px"><span style="display:inline-block;width:1.1em;height:0.75em;background:url(images/flags/'+(NATION_FLAG[v.nation]||'')+')center/contain no-repeat"></span>'+(NATION_NAMES[v.nation]||v.nation)+'</span> · '+toRoman(v.tier)+' · <span style="display:inline-flex;align-items:center;gap:2px"><img src="images/class-icons/'+(TYPE_ICON[v.type]||'')+'" style="height:0.9em;width:auto;opacity:0.6" alt="">'+(TYPE_NAMES[v.type]||v.type)+'</span> · ID: '+v.tank_id;
  html += (v.is_premium?' · 金币车':'')+(v.is_gift?' · 礼包车':'')+(v.is_wheeled?' · 轮式':'');
  html += ' · 价格: '+(v.price_credit?v.price_credit.toLocaleString()+' 银币':'无');
  html += (v.price_gold?' / '+v.price_gold+' 金币':'')+'</div>';
  if (v.description) html += '<p class="detail-desc">'+v.description+'</p>';
  html += '</div></div>';
  html += '<div class="three-col"><div class="section"><h3>基本性能</h3><table>';
  html += '<tr><th>生命值 (HP)</th><td>'+(p.hp||'无')+'</td><th>重量 (吨)</th><td>'+((p.weight||0)/1000).toFixed(1)+'</td></tr>';
  html += '<tr><th>极速 (km/h)</th><td>'+(p.speed_forward||'无')+' / '+(p.speed_backward||'无')+'</td><th>视野 (m)</th><td>'+(p.turret?p.turret.view_range||'无':'无')+'</td></tr>';
  html += '<tr><th>车体转向 (°/s)</th><td>'+(p.suspension?p.suspension.traverse_speed||'无':'无')+'</td><th>炮塔转向 (°/s)</th><td>'+(p.turret?p.turret.traverse_speed||'无':'无')+'</td></tr>';
  html += '<tr><th>电台 (m)</th><td>'+(p.radio?p.radio.signal_range||'无':'无')+'</td><th>备弹 (发)</th><td>'+(p.max_ammo||'无')+'</td></tr>';
  html += '</table></div>';
  if (p.armor) {
    var a = p.armor;
    html += '<div class="section"><h3>装甲 (mm)</h3><table><tr><th></th><th>车体</th><th>炮塔</th></tr>';
    html += '<tr><td>正面</td><td style="color:#f90;font-weight:bold">'+(a.hull&&a.hull.front!=null?a.hull.front:'无')+'</td><td style="color:#f90;font-weight:bold">'+(a.turret&&a.turret.front!=null?a.turret.front:'无')+'</td></tr>';
    html += '<tr><td>侧面</td><td>'+(a.hull&&a.hull.sides!=null?a.hull.sides:'无')+'</td><td>'+(a.turret&&a.turret.sides!=null?a.turret.sides:'无')+'</td></tr>';
    html += '<tr><td>后部</td><td>'+(a.hull&&a.hull.rear!=null?a.hull.rear:'无')+'</td><td>'+(a.turret&&a.turret.rear!=null?a.turret.rear:'无')+'</td></tr>';
    html += '</table></div>';
  }
  if (p.gun) {
    html += '<div class="section"><h3>主炮: '+(p.gun.name||'')+'</h3><table>';
    html += '<tr><th>口径 (mm)</th><td>'+(p.gun.caliber||'无')+'</td><th>射速 (发/分钟)</th><td>'+(p.gun.fire_rate?p.gun.fire_rate.toFixed(1):'无')+'</td></tr>';
    html += '<tr><th>装填 (s)</th><td>'+(p.gun.reload_time?p.gun.reload_time.toFixed(1):'无')+'</td><th>瞄准 (s)</th><td>'+(p.gun.aim_time?p.gun.aim_time.toFixed(1):'无')+'</td></tr>';
    html += '<tr><th>百米精度</th><td>'+(p.gun.dispersion?(p.gun.dispersion*100).toFixed(2):'无')+'</td><th>俯角 / 仰角</th><td>'+(p.gun.move_down_arc!=null?p.gun.move_down_arc+'°':'无')+' / '+(p.gun.move_up_arc!=null?p.gun.move_up_arc+'°':'无')+'</td></tr>';
    html += '</table></div>';
  }
  html += '</div>';
  html += '<div class="three-col">';
  if (p.ammo && p.ammo.length > 0) {
    var ammoLabels = {ARMOR_PIERCING:'AP', ARMOR_PIERCING_CR:'APCR', HOLLOW_CHARGE:'HEAT', HIGH_EXPLOSIVE:'HE'};
    var cls = ['ammo-lo','ammo-md','ammo-hi'];
    var tip = ['远距离 (75%)','标准 (100%)','近距离 (125%)'];
    html += '<div class="section"><h3>弹药</h3><table class="ammo-table">';
    html += '<tr><th class="ammo-label">弹药</th><th colspan="3">穿透 (mm) <span class="ammo-lo">−</span>/<span class="ammo-hi">+</span>25%</th><th colspan="3">伤害 (HP) <span class="ammo-lo">−</span>/<span class="ammo-hi">+</span>25%</th></tr>';
    var maxPen = 0;
    p.ammo.forEach(function(a){ var pn = (a.penetration||[])[1]||0; if (pn>maxPen) maxPen=pn; });
    p.ammo.forEach(function(a){
      var pen = a.penetration || [];
      var dmg = a.damage || [];
      var isTop = maxPen > 0 && pen[1] === maxPen;
      html += '<tr'+(isTop?' class="ammo-top"':'')+'><th class="ammo-label">'+(ammoLabels[a.type]||a.type)+'</th>';
      for (var i = 0; i < 3; i++) html += '<td class="'+cls[i]+'" title="'+tip[i]+'">'+(pen[i]||'无')+'</td>';
      for (var i = 0; i < 3; i++) html += '<td class="'+cls[i]+'" title="'+tip[i]+'">'+(dmg[i]||'无')+'</td>';
      html += '</tr>';
    });
    html += '</table></div>';
  }
  if (p.engine) {
    html += '<div class="section"><h3>发动机</h3><table>';
    html += '<tr><th>名称</th><td>'+(p.engine.name||'无')+'</td><th>功率 (匹)</th><td>'+(p.engine.power||'无')+'</td></tr>';
    html += '<tr><th>重量 (kg)</th><td>'+(p.engine.weight||'无')+'</td><th>着火率 (%)</th><td>'+(p.engine.fire_chance!=null?(p.engine.fire_chance*100).toFixed(0):'无')+'</td></tr>';
    html += '</table></div>';
  }
  if (v.crew && v.crew.length > 0) {
    var CREW_ROLES = {commander:'车长', gunner:'炮手', driver:'驾驶员', loader:'装填手', radioman:'通讯员'};
    html += '<div class="section"><h3>车组</h3><div class="crew-list">';
    v.crew.forEach(function(c){
      var roles = c.roles || {};
      var name = '';
      for (var k in CREW_ROLES) {
        if (roles[k]) { name = CREW_ROLES[k]; break; }
      }
      html += '<span>'+(name||c.member_id)+'</span>';
    });
    html += '</div></div>';
  }
  html += '</div>';
  return html;
}
