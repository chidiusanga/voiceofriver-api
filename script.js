/* ══════════════════════════════════════════════════════
   SENSOR CONFIG
══════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════
   SENSOR CONFIGURATION — WFD-CALIBRATED THRESHOLDS
   Source: EPA Ireland / UKTAG WFD Environmental Standards (2008/2024)
           Ireland's National Water Quality Monitoring Programme 2022–2027
           EU Water Framework Directive Annex V — physico-chemical standards

   Five WFD ecological status classes:
     High     → reference condition, negligible human influence
     Good     → slight deviation from reference — the EU 2027 target
     Moderate → moderate deviation — regulatory action triggered
     Poor     → major deviation — urgent intervention needed
     Bad      → severe alteration — ecosystem at serious risk

   wfd property maps sensor readings to WFD 5-class status:
     [highMax, goodMax, moderateMax, poorMax]
     Values above poorMax = Bad status
   For parameters where lower = worse (pH outside range, temp extremes),
   the wfdLow array handles the lower boundary.
══════════════════════════════════════════════════════════════════════ */
const SENSORS = {
  temperature: {
    label: 'Water Temperature', friendlyName: 'Heat', unit: '°C',
    min: 0, max: 50,
    // WFD: UKTAG 2008 — thermal standard for salmonid rivers (Irish lowland type)
    // High: ≤20°C (salmonid reference), Good: ≤25°C, Moderate: ≤30°C, Poor: ≤35°C
    // Irish EPA data (River Avoca 2017): mean 14–17°C, max 19–19°C
    wfd: { high: 20, good: 25, moderate: 30, poor: 35 },
    good: [5, 25], warn: [3, 30],
    type: 'radial', majorTicks: ['0','10','20','30','40','50'],
    sim: () => +(12 + Math.random() * 26).toFixed(1)
  },
  turbidity: {
    label: 'Water Clarity', friendlyName: 'Clarity', unit: 'NTU',
    min: 0, max: 200,
    // WFD: No single numeric UKTAG standard but EPA Ireland uses turbidity
    // as physico-chemical supporting element. Reference Irish rivers: <5 NTU.
    // Good status rivers: <25 NTU. Moderate: <75 NTU. Poor: <150 NTU. Bad: ≥150.
    wfd: { high: 5, good: 25, moderate: 75, poor: 150 },
    good: [0, 25], warn: [0, 75],
    type: 'radial', majorTicks: ['0','50','100','150','200'],
    sim: () => +(Math.random() * 180).toFixed(1)
  },
  ph: {
    label: 'Water Acidity', friendlyName: 'Acidity', unit: 'pH',
    min: 0, max: 14,
    // WFD: UKTAG Table 8 — pH standard for rivers (England, Wales, N.Ireland)
    // High: 6.0–9.0 (5th–95th percentile within this range)
    // Good: 10th-percentile ≥6.0; Moderate: <6.0 or >9.0
    // Irish EPA River Avoca data: pH 6.95–8.18 = Good/High typical range
    // Using asymmetric WFD boundaries: lower boundary matters most
    wfd: { highLow: 6.5, highHigh: 8.5, goodLow: 6.0, goodHigh: 9.0,
           moderateLow: 5.5, moderateHigh: 9.5, poorLow: 5.0, poorHigh: 10.0 },
    good: [6.5, 8.5], warn: [6.0, 9.0],
    type: 'radial', majorTicks: ['0','2','4','6','8','10','12','14'],
    sim: () => +(4.5 + Math.random() * 6.5).toFixed(2)
  },
  tds: {
    label: 'Dissolved Solids', friendlyName: 'Saltiness', unit: 'ppm',
    min: 0, max: 1400,
    // WFD: Derived from EC standard (TDS ≈ EC × 0.65 for Irish rivers)
    // High: <130 ppm (ref. EC <200 µS/cm), Good: <520 ppm, Moderate: <780 ppm
    wfd: { high: 130, good: 520, moderate: 780, poor: 900 },
    good: [30, 520], warn: [0, 780],
    type: 'radial', majorTicks: ['0','200','400','600','800','1000','1200','1400'],
    sim: () => Math.round(60 + Math.random() * 820)
  },
  ec: {
    label: 'Conductivity', friendlyName: 'Electricity', unit: 'µS/cm',
    min: 0, max: 2500,
    // WFD: UKTAG lake salinity standard — Good: <1000 µS/cm.
    // For rivers, Irish EPA reference data: High-status Irish rivers typically
    // <200 µS/cm (River Avoca surveillance data: mean 3.3 µS/cm = very low,
    // typical reference). Irish lowland rivers in Good status: 50–500 µS/cm.
    // Above 800 µS/cm indicates anthropogenic ionic enrichment (EPA operational
    // monitoring threshold). Moderate: >800, Poor: >1200, Bad: >1600.
    wfd: { high: 200, good: 800, moderate: 1200, poor: 1600 },
    good: [50, 800], warn: [0, 1200],
    type: 'radial', majorTicks: ['0','500','1000','1500','2000','2500'],
    sim: () => Math.round(80 + Math.random() * 1700)
  },
  level: {
    label: 'Water Depth', friendlyName: 'Depth', unit: 'ft',
    min: 0, max: 16,
    // WFD: Hydromorphological element — no numeric threshold for absolute level.
    // Good status = natural flow regime maintained. Thresholds here are
    // ecologically derived reference ranges for a typical Irish lowland river.
    // Low level (<2 ft) stresses benthic habitat; very high (>14 ft) = flood risk.
    wfd: {highLow: 6, highHigh: 12, goodLow: 4, goodHigh: 14, moderateLow: 2, moderateHigh: 15, poorLow: 1, poorHigh: 16
},
    good: [3, 13], warn: [1.5, 15],
    type: 'radial', majorTicks: ['0','4','8','12','16'],
    sim: () => +(1.3 + Math.random() * 13.8).toFixed(1)
  },
};

const ENTITIES = {
  swan:  { name:'Swan',  label:'Swan Reporting',  accent:'#60c8f0', keys:['temperature','turbidity','level'],
    narrative:`<strong>The Swan speaks:</strong> I glide the surface and feel every shift — the warmth beneath my feet, the clarity of my reflection, the rise and fall of the water's embrace. These are the stories I carry.`,
    draw: drawSwanEntity },
  otter: { name:'Otter', label:'Otter Reporting', accent:'#c8a060', keys:['tds','ec'],
    narrative:`<strong>The Otter speaks:</strong> I dive deep and taste the water's invisible chemistry — the dissolved salts, the electric hum of conductivity. What flows through this river, I know in my bones.`,
    draw: drawOtterEntity },
  lily:  { name:'Lily',  label:'Lily Reporting',  accent:'#60c870', keys:['ph'],
    narrative:`<strong>The Lily speaks:</strong> I am rooted here, anchored in alkaline or acid. My petals open or wither with the pH of this world. Balance is everything — I am its living measure.`,
    draw: drawLilyEntity },
};

// Stop NaN from appearing anywhere
   function hasValidData(v) {
   return typeof v === 'number' && !isNaN(v);
   }

const PRISTINE = { temperature:18, turbidity:2, tds:120, ec:280, ph:7.2, level:8.5 };
const MAX_DEPTH = 17; // matches sketch scale

/* ── State ── */
let currentReadings = {};
let activeEntityKey = 'swan';
let activeGaugeKey  = 'temperature';
let conditionMode   = 'present'; // past | present | ideal | api
let gaugeType       = 'radial-full'; // radial-full | linear-vertical
let gaugeInstances  = {};
let animClock       = 0;
let entityAnimClock = 0;
let entityRafId     = null;
let levelSensorMissing = false;

// Initialise with midpoint placeholder values — stable display while
// waiting for the first real sensor reading from the ESP32.
// sim() is kept for the timeline's simulated history only.

// // ==== Replacing the below because this prints 000 when data is not yet available, which is fake data - 000 is data better no data at all.
Object.keys(SENSORS).forEach(k => {
  currentReadings[k] = NaN;
});


/* ── Fish ── */
const FISH_COLORS=[['#f4a942','#e07820'],['#e05050','#a02020'],['#50c0e0','#206080'],['#a0e060','#407020'],['#e0a0e0','#805080'],['#60e0c0','#207060']];
let fishArray=[];

function createFish(idx){
  const col=FISH_COLORS[idx%FISH_COLORS.length];
  const dir=Math.random()<.5?1:-1;
  return{x:dir===1?-60:WW+60,yFrac:.15+Math.random()*.65,spd:.3+Math.random()*.65,sz:11+Math.random()*13,dir,ph:Math.random()*Math.PI*2,col,wob:.01+Math.random()*.018,alpha:0};
}
function spawnFish(){
  fishArray=Array.from({length:5},(_,i)=>{const f=createFish(i);f.x=60+Math.random()*Math.max(200,(WW||800)-120);f.alpha=1;return f;});
}

/* ════════════════════════════════════════════════════
   WATER CANVAS
════════════════════════════════════════════════════ */
const waterWrap   = document.getElementById('waterWrap');
const waterCanvas = document.getElementById('waterCanvas');
let wctx, WW, WH, DPR;

let waterSurfaceFrac = 0.62;
let waveAmp = 5;
let waterR = 30, waterG = 100, waterB = 180;
let turbOpacity = 0;

function resizeWater() {
  const waterArea = document.getElementById('waterArea') || waterWrap;
  DPR = window.devicePixelRatio || 1;
  WW  = waterArea.clientWidth;
  WH  = waterArea.clientHeight;
  waterCanvas.width  = Math.round(WW * DPR);
  waterCanvas.height = Math.round(WH * DPR);
  waterCanvas.style.width  = WW + 'px';
  waterCanvas.style.height = WH + 'px';
  wctx = waterCanvas.getContext('2d');
  wctx.scale(DPR, DPR);
}

function applyReadings() {
  const r = conditionMode === 'ideal' ? PRISTINE : currentReadings;
  const s = SENSORS;
  // const lv = Math.max(0, Math.min(1, (r.level - s.level.min) / (s.level.max - s.level.min)));

const levelValue = hasValidData(r.level) ? r.level : PRISTINE.level;
const lv = Math.max(0, Math.min(1, (levelValue - s.level.min) / (s.level.max - s.level.min)));

   // =====================
   
  waterSurfaceFrac = 0.80 - lv * 0.60;
  if (conditionMode === 'ideal') {
    waterR=30; waterG=105; waterB=185; turbOpacity=0; waveAmp=4; return;
  }
  // const tf = Math.min(1, r.turbidity / s.turbidity.max);
   
   const turbidityValue = hasValidData(r.turbidity) ? r.turbidity : 0;
   const tf = Math.min(1, turbidityValue / s.turbidity.max);
   
  // const df = Math.min(1, (r.tds||0) / s.tds.max);

   const tdsValue = hasValidData(r.tds) ? r.tds : 0;
   const df = Math.min(1, tdsValue / s.tds.max);
   
  const cloudiness = tf*.6 + df*.4;
  waterR = Math.round(20 + cloudiness*140);
  waterG = Math.round(105 - cloudiness*70);
  waterB = Math.round(185 - cloudiness*80);
  turbOpacity = cloudiness * 0.55;
  // const tmpN = (r.temperature - s.temperature.min) / (s.temperature.max - s.temperature.min);

   const temperatureValue = hasValidData(r.temperature) ? r.temperature : PRISTINE.temperature;
   const tmpN = (temperatureValue - s.temperature.min) / (s.temperature.max - s.temperature.min);
   
  waterR = Math.min(255, waterR + Math.round(tmpN*60));
  waterB = Math.max(40,  waterB - Math.round(tmpN*60));
  // waveAmp = 3 + Math.min(1, (r.ec||0) / 2000) * 9;

   const ecValue = hasValidData(r.ec) ? r.ec : 0;
   waveAmp = 3 + Math.min(1, ecValue / 2000) * 9;
}

function surfY(x) {
  return waterSurfaceFrac * WH
    + Math.sin(x*.02  + animClock*1.8) * waveAmp
    + Math.sin(x*.035 - animClock*2.4) * waveAmp*.4
    + Math.sin(x*.009 + animClock*.8)  * waveAmp*.25;
}

function drawWater() {
  if (!wctx) return;
   
  wctx.clearRect(0, 0, WW, WH);

  // Sky
  const sky = wctx.createLinearGradient(0,0,0,waterSurfaceFrac*WH);
  sky.addColorStop(0,'#071020'); sky.addColorStop(1,'#1a3558');
  wctx.fillStyle = sky; wctx.fillRect(0,0,WW,WH);

  // Water body
  wctx.save(); wctx.beginPath(); wctx.moveTo(0,WH);
  for (let x=0;x<=WW;x+=3) wctx.lineTo(x, surfY(x));
  wctx.lineTo(WW,WH); wctx.closePath();
  const wg = wctx.createLinearGradient(0,waterSurfaceFrac*WH,0,WH);
  wg.addColorStop(0,`rgba(${waterR},${waterG},${waterB},.96)`);
  wg.addColorStop(.4,`rgba(${waterR},${waterG},${waterB},.72)`);
  wg.addColorStop(1,'rgba(5,14,26,.97)');
  wctx.fillStyle=wg; wctx.fill(); wctx.restore();

  // Turbidity tint
  if (turbOpacity > .04) {
    wctx.save(); wctx.beginPath(); wctx.moveTo(0,WH);
    for (let x=0;x<=WW;x+=3) wctx.lineTo(x,surfY(x));
    wctx.lineTo(WW,WH); wctx.closePath();
    wctx.fillStyle=`rgba(${Math.min(255,waterR+30)},${Math.max(0,waterG-10)},${Math.max(0,waterB-30)},${turbOpacity})`;
    wctx.fill(); wctx.restore();
  }

  // Surface sheen
  wctx.save(); wctx.beginPath();
  for (let x=0;x<=WW;x+=3){ const sy=surfY(x); x===0?wctx.moveTo(x,sy):wctx.lineTo(x,sy); }
  wctx.strokeStyle='rgba(180,230,255,.55)'; wctx.lineWidth=1.8; wctx.stroke(); wctx.restore();

  // Caustics
  wctx.save();
  for (let i=0;i<14;i++){
    const sd=i*97.3, px=((sd*13+animClock*28)%(WW+40))-10;
    const pSurf=surfY(px), py=pSurf+20+((sd*7.1)%Math.max(1,WH-pSurf-30));
    wctx.globalAlpha=.06;
    wctx.beginPath(); wctx.ellipse(px,py,10+Math.sin(sd+animClock)*4,3+Math.cos(sd+animClock*.7)*1.5,0,0,Math.PI*2);
    wctx.strokeStyle='#a0d8f0'; wctx.lineWidth=1; wctx.stroke();
  }
  wctx.globalAlpha=1; wctx.restore();

   if (levelSensorMissing && conditionMode !== 'ideal') {
      // wctx.save();
      // wctx.fillStyle = 'rgba(5,20,40,.70)';
      // wctx.fillRect(WW/2 - 170, WH/2 - 40, 340, 80);
      // wctx.strokeStyle = '#80d0ff';
      // wctx.lineWidth = 1;
      // wctx.strokeRect(WW/2 - 170, WH/2 - 40, 340, 80);
      // wctx.fillStyle = '#d8f0ff';
      // wctx.font = 'bold 18px sans-serif';
      // wctx.textAlign = 'center';
      // wctx.fillText('Water Level Sensor Offline', WW/2, WH/2 - 5);
      // wctx.font = '14px sans-serif';
      // wctx.fillText('Displaying default river depth', WW/2, WH/2 + 20);
      // wctx.restore();
   // REPLACED HERE TO MOVE "AWAITING WATER LEVEL DATA" DOWN

      wctx.save();
      const overlayY = WH - 175;
      wctx.fillStyle = 'rgba(180,20,20,.28)';
      wctx.strokeStyle = '#ff8080';
      wctx.lineWidth = 1;
      wctx.beginPath();
      wctx.roundRect( WW/2 - 180, overlayY, 360, 50, 5);
      wctx.fill();
      wctx.beginPath();
      wctx.roundRect(WW/2 - 180, overlayY, 360, 50, 5);
      wctx.stroke();
      wctx.fillStyle = '#ffe0e0';
      wctx.textAlign = 'center';
      wctx.font = 'bold 16px sans-serif';
      wctx.fillText('Water Level Sensor Offline', WW/2, overlayY + 20);
      wctx.font = '12px sans-serif';
      wctx.fillText('Displaying default river depth', WW/2, overlayY + 38); wctx.restore();
   }

  // Fish
  const FADE_ZONE = 100; // px from edge over which fish fade in/out
  fishArray.forEach(f=>{
    f.x+=f.dir*f.spd*.8;

    // Respawn fish that have fully left the screen
    if(f.dir===1  && f.x>WW+80){ Object.assign(f,createFish(0)); f.x=-50;    f.dir=1;  }
    if(f.dir===-1 && f.x<-80)  { Object.assign(f,createFish(0)); f.x=WW+50; f.dir=-1; }

    // Fade in as fish enters from the edge, fade out as it leaves
    if(f.dir===1){
      // Swimming right: fade in near left edge, fade out near right edge
      f.alpha = Math.min(1, Math.max(0,
        Math.min(f.x / FADE_ZONE,              // fade in from left
                 (WW - f.x) / FADE_ZONE)       // fade out toward right
      ));
    } else {
      // Swimming left: fade in near right edge, fade out near left edge
      f.alpha = Math.min(1, Math.max(0,
        Math.min((WW - f.x) / FADE_ZONE,       // fade in from right
                 f.x / FADE_ZONE)              // fade out toward left
      ));
    }

    const fy=f.yFrac*WH*.9;
    if(fy>surfY(f.x)+f.sz) drawFish(f);
  });

  // Riverbed - three layered bands
  wctx.save();
  wctx.beginPath(); wctx.moveTo(0,WH);
  for (let x=0;x<=WW;x+=6) wctx.lineTo(x,WH-18+Math.sin(x*.04)*6+Math.sin(x*.09+1.2)*4);
  wctx.lineTo(WW,WH); wctx.closePath(); wctx.fillStyle='#080f08'; wctx.fill();
  wctx.beginPath(); wctx.moveTo(0,WH);
  for (let x=0;x<=WW;x+=6) wctx.lineTo(x,WH-10+Math.sin(x*.04)*6+Math.sin(x*.09+1.2)*4);
  wctx.lineTo(WW,WH); wctx.closePath(); wctx.fillStyle='#0d1c0d'; wctx.fill();
  wctx.beginPath(); wctx.moveTo(0,WH);
  for (let x=0;x<=WW;x+=6) wctx.lineTo(x,WH-4+Math.sin(x*.04)*6+Math.sin(x*.09+1.2)*4);
  wctx.lineTo(WW,WH); wctx.closePath(); wctx.fillStyle='#112211'; wctx.fill();
  wctx.restore();
}

/* ── Draw one fish ── */
function drawFish(f){
  const wb=Math.sin(animClock*4+f.ph)*f.wob*16,tw=Math.sin(animClock*5+f.ph)*.32;
  wctx.save();
  wctx.globalAlpha = f.alpha ?? 1;   // fade in/out at screen edges
  wctx.translate(f.x,f.yFrac*WH*.9+wb);
  if(f.dir===-1)wctx.scale(-1,1);
  const s=f.sz;
  wctx.save();wctx.translate(-s*.6,0);wctx.rotate(tw);
  wctx.beginPath();wctx.moveTo(0,0);wctx.lineTo(-s*.7,-s*.38);wctx.lineTo(-s*.85,0);wctx.lineTo(-s*.7,s*.38);
  wctx.closePath();wctx.fillStyle=f.col[1];wctx.fill();wctx.restore();
  wctx.beginPath();wctx.ellipse(0,0,s,s*.4,0,0,Math.PI*2);wctx.fillStyle=f.col[0];wctx.fill();
  wctx.beginPath();wctx.ellipse(0,-s*.14,s*.78,s*.2,-.18,0,Math.PI*2);wctx.fillStyle=f.col[1];wctx.globalAlpha=f.alpha*.42;wctx.fill();wctx.globalAlpha=f.alpha;
  wctx.beginPath();wctx.moveTo(s*.1,-s*.36);wctx.lineTo(s*.38,-s*.36);wctx.lineTo(s*.24,-s*.13);
  wctx.closePath();wctx.fillStyle=f.col[0];wctx.fill();
  wctx.beginPath();wctx.arc(s*.54,-s*.07,s*.09,0,Math.PI*2);wctx.fillStyle='#111';wctx.fill();
  wctx.restore();
}

/* ════════════════════════════════════════════════════
   DEPTH SCALE
════════════════════════════════════════════════════ */
const scaleCanvas = document.getElementById('scaleCanvas');
const scaleCol    = document.getElementById('scaleCol');
let sctx, SW, SH;

function resizeScale() {
  const dpr = window.devicePixelRatio||1;
  SW = scaleCol.clientWidth;
  SH = scaleCol.clientHeight;
  scaleCanvas.width  = Math.round(SW*dpr);
  scaleCanvas.height = Math.round(SH*dpr);
  scaleCanvas.style.width  = SW+'px';
  scaleCanvas.style.height = SH+'px';
  sctx = scaleCanvas.getContext('2d');
  sctx.scale(dpr,dpr);
}

function drawScale() {
  if (!sctx || !WH) return;
  sctx.clearRect(0,0,SW,SH);

  // White background
  sctx.fillStyle='#f0f0f0'; sctx.fillRect(0,0,SW,SH);
  // Right border
  sctx.strokeStyle='#222'; sctx.lineWidth=1.5;
  sctx.beginPath(); sctx.moveTo(SW-1,0); sctx.lineTo(SW-1,SH); sctx.stroke();

  // ── Key geometry ────────────────────────────────────────────────
  // waveYS: the Y-pixel on the scale canvas where the water surface is.
  // This is derived from the animated wave position in the water canvas.
  const waveFrac = surfY(0) / WH;          // 0 = top, 1 = bottom
  const waveYS   = waveFrac * SH;          // pixel on scale canvas

  // Current depth reading in feet — this is what the surface label shows
   
   // =================
  // const levelFt = (conditionMode==='ideal' ? PRISTINE.level : currentReadings.level) || 0;

   const rawLevel = conditionMode === 'ideal' ? PRISTINE.level : currentReadings.level;
   const levelFt = hasValidData(rawLevel) ? rawLevel : PRISTINE.level;
   const scaleLevelFt = Math.max(levelFt, 4);
   const levelDisplayText = hasValidData(rawLevel) ? levelFt.toFixed(1) + 'ft' : 'Offline';
   // ======================

  // ── Pixels-per-foot ─────────────────────────────────────────────
  // We divide the canvas into two zones at waveYS:
  //   BELOW (water): from waveYS to SH — represents 0 ft down to levelFt
  //   ABOVE (sky):   from waveYS to 0  — represents levelFt up to some max
  //
  // To keep ticks evenly spaced across the whole ruler, we use a single
  // pxPerFt derived from the water zone (most important for accuracy).
  // If levelFt is very small, fall back to distributing evenly.
  const waterZonePx = SH - waveYS;                       // pixels available below surface
  // const pxPerFt = levelFt > 0.1
  //   ? waterZonePx / levelFt                               // calibrate from actual reading
  //   : (SH / 16);                                         // fallback: 16ft across full height

   // Above replaced with below to stop magnification of vertical water level ruler
   const pxPerFt = scaleLevelFt > 0.1
  ? waterZonePx / scaleLevelFt
  : (SH / 16);

  // How many feet of ruler are visible above the surface (sky zone)
  const ftAbove = waveYS / pxPerFt;
  // Highest foot mark visible above the surface
  const topFt   = Math.ceil(levelFt + ftAbove);

  // Blue tint: water zone
  sctx.fillStyle='rgba(80,140,200,.18)';
  sctx.fillRect(0, waveYS, SW-1, SH - waveYS);

  // ── Draw tick marks ──────────────────────────────────────────────
  // We iterate from 0 (bottom, deepest visible) up to topFt
  const fsize = 10;
  sctx.font = `600 ${fsize}px 'DM Sans',sans-serif`;

  for (let ft = 0; ft <= topFt + 1; ft += 0.5) {
    // Y pixel: surface at waveYS; each foot = pxPerFt px
    // ft=levelFt → waveYS (surface), ft=0 → waveYS + levelFt*pxPerFt (bottom)
    // ft=levelFt+1 → waveYS - pxPerFt (one foot above surface)
    const tickY = waveYS - (ft - levelFt) * pxPerFt;

    if (tickY < 0 || tickY > SH + 1) continue;

    const isWhole = ft % 1 === 0;
    const isEven  = ft % 2 === 0;

    sctx.strokeStyle = isWhole ? '#111' : '#555';
    sctx.lineWidth   = isWhole ? 1.2 : 0.6;
    const tickLen    = isWhole ? 10 : 5;
    sctx.beginPath();
    sctx.moveTo(SW - 1 - tickLen, tickY);
    sctx.lineTo(SW - 2, tickY);
    sctx.stroke();

    // Label every 2 whole feet, skip 0 (it's at the bottom, labelled separately)
    if (isWhole && isEven && ft > 0) {
      sctx.fillStyle = '#111';
      sctx.textAlign = 'right';
      sctx.fillText(ft + 'ft', SW - 14, tickY + Math.round(fsize * .38));
    }
  }

  // 0 ft label — at the bottom of the visible water
  const zeroY = waveYS + levelFt * pxPerFt;
  if (zeroY <= SH) {
    sctx.strokeStyle='#666'; sctx.lineWidth=0.8;
    sctx.beginPath(); sctx.moveTo(SW-12, zeroY); sctx.lineTo(SW-2, zeroY); sctx.stroke();
    sctx.fillStyle='#333'; sctx.textAlign='right';
    sctx.font=`600 ${fsize}px 'DM Sans',sans-serif`;
    sctx.fillText('0ft', SW-14, Math.min(SH-2, zeroY + fsize));
  }

  // ── Animated water-surface label ────────────────────────────────
  // const liveText = levelFt.toFixed(1) + 'ft';
   const liveText = levelDisplayText;
  const labelY   = Math.max(14, Math.min(SH - 4, waveYS));
  // Horizontal line at surface
  sctx.strokeStyle='#e05010'; sctx.lineWidth=2;
  sctx.beginPath(); sctx.moveTo(0,labelY); sctx.lineTo(SW-2,labelY); sctx.stroke();
  // Pill label
  const lfsize = 11;
  sctx.font = `700 ${lfsize}px 'DM Sans',sans-serif`;
  const lw = sctx.measureText(liveText).width;
  const lpad = 3, lh = lfsize + 5;
  sctx.fillStyle='rgba(255,255,255,.92)';
  sctx.beginPath(); sctx.roundRect(1, labelY-lh+2, lw+lpad*2+2, lh, 3); sctx.fill();
  sctx.strokeStyle='#e05010'; sctx.lineWidth=1;
  sctx.beginPath(); sctx.roundRect(1, labelY-lh+2, lw+lpad*2+2, lh, 3); sctx.stroke();
  sctx.fillStyle='#c03000'; sctx.textAlign='left';
  sctx.fillText(liveText, lpad+1, labelY-2);
}

/* ════════════════════════════════════════════════════
   GAUGES OVERLAID ON WATER
════════════════════════════════════════════════════ */
/* Build WFD 5-class colour bands on gauge dials
   Using official WFD colour palette:
   Blue=High, Green=Good, Yellow=Moderate, Orange=Poor, Red=Bad */
function buildGaugeHighlights(sensorDef) {
  const zones = [];
  const wfd   = sensorDef.wfd;

  if (
    sensorDef === SENSORS.ph || sensorDef === SENSORS.level) {
    // pH and Water Level: colour zones around the neutral range
    if (wfd.poorLow  > sensorDef.min) zones.push({from:sensorDef.min,to:wfd.poorLow,   color:'rgba(224,48,48,.45)'}); // Bad
    if (wfd.moderateLow > wfd.poorLow) zones.push({from:wfd.poorLow,  to:wfd.moderateLow,color:'rgba(240,112,48,.4)'}); // Poor
    if (wfd.goodLow > wfd.moderateLow) zones.push({from:wfd.moderateLow,to:wfd.goodLow, color:'rgba(240,192,48,.38)'}); // Moderate
    if (wfd.highLow > wfd.goodLow)     zones.push({from:wfd.goodLow,  to:wfd.highLow,   color:'rgba(48,192,96,.30)'}); // Good
    zones.push(                                   {from:wfd.highLow,  to:wfd.highHigh,  color:'rgba(74,144,217,.30)'}); // High
    if (wfd.highHigh < wfd.goodHigh)   zones.push({from:wfd.highHigh, to:wfd.goodHigh,  color:'rgba(48,192,96,.30)'}); // Good
    if (wfd.goodHigh < wfd.moderateHigh) zones.push({from:wfd.goodHigh,to:wfd.moderateHigh,color:'rgba(240,192,48,.38)'}); // Moderate
    if (wfd.moderateHigh < wfd.poorHigh) zones.push({from:wfd.moderateHigh,to:wfd.poorHigh,color:'rgba(240,112,48,.4)'}); // Poor
    if (wfd.poorHigh < sensorDef.max)  zones.push({from:wfd.poorHigh, to:sensorDef.max, color:'rgba(224,48,48,.45)'}); // Bad
    return zones.filter(z => z.from < z.to);
  }

  // All other sensors: one-directional (higher = worse)
  if (wfd.high   > sensorDef.min) zones.push({from:sensorDef.min, to:wfd.high,     color:'rgba(74,144,217,.30)'}); // High = Blue
  if (wfd.good   > wfd.high)      zones.push({from:wfd.high,      to:wfd.good,     color:'rgba(48,192,96,.28)'}); // Good = Green
  if (wfd.moderate > wfd.good)    zones.push({from:wfd.good,      to:wfd.moderate, color:'rgba(240,192,48,.35)'}); // Moderate = Yellow
  if (wfd.poor   > wfd.moderate)  zones.push({from:wfd.moderate,  to:wfd.poor,     color:'rgba(240,112,48,.40)'}); // Poor = Orange
  if (sensorDef.max > wfd.poor)   zones.push({from:wfd.poor,      to:sensorDef.max,color:'rgba(224,48,48,.45)'}); // Bad = Red

  return zones.filter(z => z.from < z.to);
}

/* ── Shared gauge appearance ── */
function sharedGaugeCfg(s, val) {
  return {
    colorPlate:'#d8e8f4', colorPlateEnd:'#c0d4e8',
    borders:true,
    borderOuterWidth:3, borderMiddleWidth:1, borderInnerWidth:3,
    colorBorderOuter:'#8aaccc', colorBorderOuterEnd:'#c0d8f0',
    colorBorderMiddle:'#9abcdc', colorBorderMiddleEnd:'#cce0f4',
    colorBorderInner:'#7a9cbc', colorBorderInnerEnd:'#b8d0e8',
    borderShadowWidth:6, colorBorderShadow:'rgba(0,0,0,.45)',
    colorMajorTicks:'#304050', colorMinorTicks:'#607080',
    colorTitle:'#203040', colorUnits:'#405060', colorNumbers:'#203040',
    colorNeedle:'#c01818', colorNeedleEnd:'#900808',
    colorValueBoxRect:'#405060', colorValueBoxRectEnd:'#506070',
    colorValueBoxBackground:'#182838', colorValueText:'#a0e0ff',
    colorValueTextShadow:'rgba(0,0,0,0)',
    fontNumbersSize:13, fontValueSize:20,
    minValue:s.min, maxValue:s.max, value:val,
    majorTicks:s.majorTicks, minorTicks:4, strokeTicks:true,
    highlights:buildGaugeHighlights(s),
    units:s.unit, title:'',
    valueBox:true, valueBoxStroke:0,
    animationDuration:800, animationRule:'elastic',
    animateOnInit: true,
  };
}

function buildGaugeOverlay() {
  const overlay    = document.getElementById('gaugeOverlay');
  const entityKeys = ENTITIES[activeEntityKey].keys;
  overlay.innerHTML = '';
  gaugeInstances   = {};

  // Compute gauge size from the waterArea element (now a real layout element)
  const waterArea = document.getElementById('waterArea');
  const aW = waterArea ? waterArea.clientWidth  - 52 : window.innerWidth  * 0.65;
  const aH = waterArea ? waterArea.clientHeight - 48 : window.innerHeight * 0.75;
  const byWidth  = Math.floor((aW - entityKeys.length * 20) / entityKeys.length);
  const byHeight = Math.floor(aH * 0.78);
  const sz = Math.max(80, Math.min(byWidth, byHeight, 280));

  entityKeys.forEach(key => {
    const s   = SENSORS[key];
    const val = conditionMode==='ideal' ? PRISTINE[key] : currentReadings[key];
    const st  = getStatus(key);

    const bubble = document.createElement('div');
    bubble.className = 'gauge-bubble' + (key===activeGaugeKey?' active':'');
    bubble.dataset.key = key;

    const labelEl = document.createElement('div');
    labelEl.className = 'gauge-label';
    labelEl.textContent = s.friendlyName;

    const wrapEl = document.createElement('div');
    wrapEl.className = 'gauge-canvas-wrap';

    const cvs = document.createElement('canvas');
    cvs.id = 'overlay-gauge-'+key;
    wrapEl.appendChild(cvs);


   const valTag = document.createElement('div');
   valTag.className = 'gauge-value-tag';
   
   // Display text content only if there's a data value, otherwise display "Sensor Offline..." instead of just 000.00 or NaN.
     if (!hasValidData(val)) {
     valTag.textContent = 'Sensor Offline...';
   } else {
     valTag.textContent = formatVal(val, s);
   }
    bubble.appendChild(labelEl);
    bubble.appendChild(wrapEl);
    bubble.appendChild(valTag);
    overlay.appendChild(bubble);

    const cfg = sharedGaugeCfg(s, val);

    try {
      if (gaugeType === 'linear-vertical') {
        const lw = Math.round(sz * 0.44);
        const lh = Math.round(sz * 1.05);
        gaugeInstances[key] = new LinearGauge(Object.assign({}, cfg, {
          renderTo: cvs, width: lw, height: lh,
          borderRadius: 12,
          barBeginCircle: 20, barProgress: true, barStrokeWidth: 0, barWidth: 9,
          colorBar: '#b0c0d0',
          colorBarProgress:    st==='good'?'#c01818':st==='warn'?'#d07010':'#6010b0',
          colorBarProgressEnd: st==='good'?'#e03030':st==='warn'?'#e89030':'#8030d0',
          tickSide:'both', numberSide:'both', needleSide:'left',
          ticksWidth:14, ticksWidthMinor:6, ticksPadding:3,
          fontNumbersSize:12,
          needle:true, needleType:'line', needleWidth:2,
          colorNeedle:'#c01818', colorNeedleEnd:'#a01010',
          valueBoxWidth:62, fontValueSize:18,
        })).draw();
      } else {
        // Default: radial-full (270° sweep)
        gaugeInstances[key] = new RadialGauge(Object.assign({}, cfg, {
          renderTo: cvs, width: sz, height: sz,
          startAngle:45, ticksAngle:270,
          needleType:'arrow', needleWidth:3,
          needleCircleSize:7, needleCircleOuter:true, needleCircleInner:false,
          colorNeedleCircleOuter:'#405060', colorNeedleCircleOuterEnd:'#607080',
          colorNeedleCircleInner:'#d8e8f4', colorNeedleCircleInnerEnd:'#d8e8f4',
          fontValueSize:22,
        })).draw();
      }
    } catch(gaugeErr) {
      console.warn('Gauge construction failed for', key, gaugeErr);
    }

    bubble.addEventListener('click', () => selectGauge(key));
  });
}

/* ── WFD 5-class ecological status classifier ──────────────────────────
   Returns one of: 'high' | 'good' | 'moderate' | 'poor' | 'bad'
   Maps to official WFD colour coding:
     High     → Blue   (#4a90d9)
     Good     → Green  (#30c060)
     Moderate → Yellow (#f0c030)
     Poor     → Orange (#f07030)
     Bad      → Red    (#e03030)
   Source: EU WFD Annex V + UKTAG 2008 standards + EPA Ireland thresholds  */
function getWFDStatus(sensorKey) {
  const sensorDef = SENSORS[sensorKey];
  const val       = conditionMode === 'ideal' ? PRISTINE[sensorKey] : currentReadings[sensorKey];
   
if (!hasValidData(val)) { // print Unknown when sensors are offline rather than NaN
   return 'unknown';
}
  const wfd       = sensorDef.wfd;
  if (!wfd) return 'good'; // fallback for sensors without WFD thresholds

  // pH uses asymmetric two-sided boundaries
  // if (sensorKey === 'ph') {
  //   if (val >= wfd.highLow  && val <= wfd.highHigh)     return 'high';
  //   if (val >= wfd.goodLow  && val <= wfd.goodHigh)     return 'good';
  //   if (val >= wfd.moderateLow && val <= wfd.moderateHigh) return 'moderate';
  //   if (val >= wfd.poorLow  && val <= wfd.poorHigh)     return 'poor';
  //   return 'bad';
  // }

   // Replaced above with the below for pH
   if (sensorKey === 'ph' || sensorKey === 'level') {

  if (
      val >= wfd.highLow &&
      val <= wfd.highHigh
     )
      return 'high';

  if (
      val >= wfd.goodLow &&
      val <= wfd.goodHigh
     )
      return 'good';

  if (
      val >= wfd.moderateLow &&
      val <= wfd.moderateHigh
     )
      return 'moderate';

  if (
      val >= wfd.poorLow &&
      val <= wfd.poorHigh
     )
      return 'poor';

  return 'bad';
}
   

  // Temperature: both low and high extremes can be Poor/Bad
  if (sensorKey === 'temperature') {
    const absVal = Math.abs(val - 12); // distance from optimal mid-range
    if (val <= wfd.high)    return 'high';
    if (val <= wfd.good)    return 'good';
    if (val <= wfd.moderate) return 'moderate';
    if (val <= wfd.poor)    return 'poor';
    return 'bad';
  }

  // All other parameters: higher value = worse status
  if (val <= wfd.high)     return 'high';
  if (val <= wfd.good)     return 'good';
  if (val <= wfd.moderate) return 'moderate';
  if (val <= wfd.poor)     return 'poor';
  return 'bad';
}

/* Legacy 3-class wrapper — maps WFD 5-class to dashboard traffic light */
function getStatus(sensorKey) {
  const wfdClass = getWFDStatus(sensorKey);
  if (wfdClass === 'high' || wfdClass === 'good')     return 'good';
  if (wfdClass === 'moderate')                         return 'warn';
  return 'bad'; // poor or bad
}

/* Colours matching official WFD palette */
const WFD_COLOURS = {
  high:     { bg: '#1a4a8a', fg: '#7bbfff', label: 'High',     icon: '⬤' },
  good:     { bg: '#1a6030', fg: '#40e080', label: 'Good',     icon: '⬤' },
  moderate: { bg: '#6a5000', fg: '#f0c030', label: 'Moderate', icon: '⬤' },
  poor:     { bg: '#7a2800', fg: '#f07030', label: 'Poor',     icon: '⬤' },
  bad:      { bg: '#7a0a0a', fg: '#e03030', label: 'Bad',      icon: '⬤' },
  unknown:  {bg: '#444444', fg: '#d0d0d0', label: 'Unknown', icon: '○'},
};

// // Stop NaN from appearing anywhere
//    function hasValidData(v) {
//    return typeof v === 'number' && !isNaN(v);
//    }

// ===== Used this to replace the formatVal function below to replace "NaN°C" beside the traffic light ========
function formatVal(v, s) {
  if (!hasValidData(v)) {
    return 'Awaiting Data';
  }
  if (v % 1 === 0) {
    return v + ' ' + s.unit;
  }
  return (v < 100 ? v.toFixed(2) : v.toFixed(1))
    + ' ' + s.unit;
}
// ===== Replaced with above to replace "NaN°C" under the gauges ========
// function formatVal(v, s) {
//   if (typeof v!=='number') return v;
//   if (v%1===0) return v+' '+s.unit;
//   return (v<100?v.toFixed(2):v.toFixed(1))+' '+s.unit;
// }


/* ════════════════════════════════════════════════════
   DYNAMIC NARRATIVE
════════════════════════════════════════════════════ */
function generateNarrative(entityKey, gaugeKey) {
  const s        = SENSORS[gaugeKey];
  const val      = conditionMode === 'ideal' ? PRISTINE[gaugeKey] : currentReadings[gaugeKey];
  const st       = getStatus(gaugeKey);
  const wfdClass = getWFDStatus(gaugeKey);
  const wfdInfo  = WFD_COLOURS[wfdClass];
  const fv  = typeof val==='number' && val%1!==0 ? (val<100?val.toFixed(2):val.toFixed(1)) : String(val);
  const voices = {swan:'The Swan speaks', otter:'The Otter speaks', lily:'The Lily speaks'};
  const v = voices[entityKey] || 'The River speaks';

// Friendly Swan/Otter/Lily apology narratives - when data is unavailable

if (!hasValidData(val)) {

  if (entityKey === 'swan') {
    return `
    <strong>The Swan speaks:</strong>
    I'm sorry, but I cannot currently sense this part of the river.
    One or more monitoring instruments are offline or disconnected.
    For instance, I cannot currently judge the river's depth because no recent observations have reached me.
    The river is still flowing beneath me, but I do not yet know how high or low the water stands.<br><br>
    My human and nonhuman partners are working together to restore the connection.
    Until then, I will continue watching over the river.
    Please check back soon.
    `;
  }

  if (entityKey === 'otter') {
    return `
    <strong>The Otter speaks:</strong>
    I've been searching for the latest river measurements, but the sensors have gone quiet.<br><br>
    This does not necessarily mean the river is unhealthy.<br><br>
    I simply do not yet have enough information to tell its story.
    `;
  }

  if (entityKey === 'lily') {
    return `
    <strong>The Lily whispers:</strong>
    The river is resting between conversations.<br><br>
    Fresh observations have not yet arrived, so I will wait patiently before sharing the next chapter of its story.
    `;
  }
}

   // Resume normal entity narrative - when data is available
  const t = {
    temperature:{
      good:`<strong>${v}:</strong> The warmth beneath me feels just right — <em>${fv}${s.unit}</em>. Under the EU Water Framework Directive's thermal standard for salmonid rivers, temperatures below 20°C represent High ecological status, and below 25°C represent Good status. This reading places the river in that favourable range, supporting the fish communities and invertebrates that the WFD seeks to protect. Ireland's EPA monitors temperature as a key physico-chemical element supporting biological quality. The river is thriving.`,
      warn:`<strong>${v}:</strong> Temperature is climbing to <em>${fv}${s.unit}</em>, beyond the WFD's Good status threshold of 25°C for salmonid rivers. The EU Water Framework Directive classifies this as Moderate status — a significant deviation from reference conditions that triggers operational monitoring review. Under Ireland's River Basin Management Plan 2022–2027, sustained elevated temperatures signal thermal pollution or climate pressure requiring investigation.`,
      bad:`<strong>${v}:</strong> At <em>${fv}${s.unit}</em>, this river has crossed into WFD Poor or Bad ecological status. The EU Water Framework Directive's thermal standard, derived from the habitat requirements of salmonid fish, is exceeded. Ireland must achieve Good status for all water bodies by 2027 — this reading demands urgent investigation under the EPA's investigative monitoring programme.`,
    },
    turbidity:{
      good:`<strong>${v}:</strong> The water runs beautifully clear — just <em>${fv} NTU</em>. Under EPA Ireland's physico-chemical assessment framework, turbidity below 5 NTU indicates High ecological status and below 25 NTU indicates Good status. Clear water is critical for aquatic macrophytes to photosynthesise, for fish to hunt, and for invertebrates to respire. The EU Green Deal's Zero Pollution Action Plan specifically targets turbidity-causing agricultural runoff — this reading suggests those pressures are well-managed here.`,
      warn:`<strong>${v}:</strong> This water is not clear at the moment. It is turbid, and the turbidity has reached <em>${fv} NTU</em>, placing this parameter in WFD Moderate status territory. Under the EPA's national monitoring programme, suspended particle loads at this level can impair light penetration, stress fish gills, and smother benthic invertebrate habitats. Ireland's National Biodiversity Action Plan identifies turbidity as a key pressure on freshwater ecosystems. Operational monitoring is warranted.`,
      bad:`<strong>${v}:</strong> At <em>${fv} NTU</em>, turbidity has reached WFD Poor or Bad status. The EPA identifies elevated suspended solids as one of Ireland's primary water quality pressures, predominantly from agricultural runoff and land drainage. The EU Water Framework Directive requires Member States to investigate and remediate such conditions. This level threatens the biological quality elements — invertebrates, macrophytes, and fish — that define a water body's ecological status.`,
    },
    level:{
      good:`<strong>${v}:</strong> The water level holds steady at <em>${fv} ft</em>. Under the EU Water Framework Directive's hydromorphological quality elements, a natural and stable flow regime is a prerequisite for High ecological status. Adequate depth supports the habitat diversity required by the biological communities that the WFD's Good status targets protect — salmonid refugia, invertebrate riffles, and macrophyte beds that form key biodiversity indicators under Ireland's National Biodiversity Action Plan.`,
      warn:`<strong>${v}:</strong> The water level is shifting to <em>${fv} ft</em>, approaching hydromorphological stress thresholds. The WFD classifies hydromorphological conditions as supporting elements that must be consistent with achieving the biological objectives of Good status. Abnormal water levels — whether from drought, abstraction, or drainage — are among the pressures tracked by Ireland's EPA Hydrometric Network and the national River Basin Management Plan.`,
      bad:`<strong>${v}:</strong> The water level at <em>${fv} ft</em> indicates a serious hydromorphological deviation. The EU Water Framework Directive requires that flow regimes support biological quality — at this level, benthic habitat is compromised. Under Ireland's Water Action Plan 2024, hydromorphological pressures from drainage and abstraction are prioritised measures. This reading should be flagged to the EPA's investigative monitoring programme.`,
    },
    ph:{
      good:`<strong>${v}:</strong> Water chemistry is perfectly balanced at <em>pH ${fv}</em>. The EU Water Framework Directive's physico-chemical standard, adopted by Ireland under UKTAG guidance, defines High status as pH 6.5–8.5 and Good status as pH 6.0–9.0. This reading sits squarely within the High status range — the reference condition for a healthy Irish river. The balanced pH supports the full suite of aquatic life, from the macroinvertebrates used in the EPA's Q-value biological assessment to the macrophytes monitored as WFD biological quality elements.`,
      warn:`<strong>${v}:</strong> Acidity is shifting to <em>pH ${fv}</em>, approaching the WFD's Good–Moderate status boundary of pH 6.0. The EPA Ireland uses pH as a primary physico-chemical quality element. Acidification below pH 6.0 is classified by UKTAG as Moderate status, triggering consideration under the Acidification standard for Irish rivers. The Eurasian Otter — an Annex II species under the EU Habitats Directive and a key biodiversity indicator — is sensitive to pH-driven fish population declines.`,
      bad:`<strong>${v}:</strong> At <em>pH ${fv}</em>, this water body has breached the WFD's Good status pH boundary. Under UKTAG's Environmental Standards for the Water Framework Directive (2008), pH outside the 6.0–9.0 range for 10th percentile samples indicates Moderate or worse status. In Ireland, the EPA classifies acidified rivers using biological Q-values alongside pH — this reading warrants immediate cross-referencing with macroinvertebrate data and an EPA investigative monitoring referral.`,
    },
    tds:{
      good:`<strong>${v}:</strong> Dissolved solids measure a healthy <em>${fv} ppm</em>. Under the WFD physico-chemical framework, total dissolved solids — primarily inorganic salts — relate directly to conductivity standards. The EPA Ireland monitors ionic strength as a key water quality indicator. This reading reflects the naturally low mineral content characteristic of Ireland's predominantly siliceous catchments in the west, which support distinctive High-status biological communities protected under both the WFD and Ireland's National Biodiversity Action Plan.`,
      warn:`<strong>${v}:</strong> Dissolved solids have risen to <em>${fv} ppm</em>, equivalent to conductivity levels that EPA Ireland associates with anthropogenic ionic enrichment. The EU Zero Pollution Action Plan targets reduction of ionic pollution from agricultural fertilisers and road runoff. At this level, the WFD's physico-chemical supporting elements begin to show deviation from reference conditions — warranting review under the operational monitoring stream of Ireland's National Water Quality Monitoring Programme 2022–2027.`,
      bad:`<strong>${v}:</strong> At <em>${fv} ppm</em>, dissolved solids are at a level indicating significant anthropogenic influence on the river's ionic chemistry. Under the WFD's one-out all-out classification principle, this physico-chemical failure would constrain the overall ecological status to Moderate or worse regardless of biological quality. The EPA Ireland identifies ionic enrichment as a growing pressure, particularly in agricultural catchments. Urgent source investigation is recommended.`,
    },
    ec:{
      good:`<strong>${v}:</strong> Conductivity reads <em>${fv} µS/cm</em> — within the EPA Ireland's reference range for Good status rivers. The EU Water Framework Directive uses conductivity as a salinity indicator under physico-chemical quality elements. Irish reference rivers in pristine catchments typically measure below 200 µS/cm. This reading reflects a well-buffered, healthy ionic balance — the kind that supports the diverse invertebrate communities assessed in the EPA's Q-value biological monitoring system and the fish populations that sustain Annex II Eurasian Otter populations.`,
      warn:`<strong>${v}:</strong> Conductivity has risen to <em>${fv} µS/cm</em>, above the EPA Ireland's operational threshold of 800 µS/cm that indicates anthropogenic ionic enrichment. Under the WFD, conductivity is a supporting physico-chemical element — its deviation towards Moderate status values here is a signal for investigation. Possible sources include agricultural drainage, road salt runoff, or wastewater influence, all of which are tracked under Ireland's River Basin Management Plan 2022–2027 and the Zero Pollution Action Plan.`,
      bad:`<strong>${v}:</strong> At <em>${fv} µS/cm</em>, conductivity has reached the WFD Poor or Bad status threshold. The EU Water Framework Directive's one-out all-out principle means this single parameter failure constrains the entire water body to that status class. The EPA identifies elevated conductivity as indicative of serious anthropogenic ionic pollution. Under Ireland's Water Action Plan 2024 this warrants immediate escalation to investigative monitoring and potential enforcement action.`,
    },
  };
  const tpl = t[gaugeKey];
  if (!tpl) return `<strong>${v}:</strong> ${s.label} is currently <em>${fv} ${s.unit}</em>. Normal range: ${s.good[0]}–${s.good[1]} ${s.unit}.`;
  return tpl[st] || tpl.good;
}

/* ════════════════════════════════════════════════════
   TRAFFIC LIGHT + RIGHT PANEL
════════════════════════════════════════════════════ */
function setTrafficLight(status) {
  const redEl   = document.getElementById('tl-red');
  const amberEl = document.getElementById('tl-amber');
  const greenEl = document.getElementById('tl-green');

  // Reset all
  redEl.className   = 'tl-bulb off-red';
  amberEl.className = 'tl-bulb off-amber';
  greenEl.className = 'tl-bulb off-green';

  if (status==='good')  greenEl.className = 'tl-bulb on-green blinking';
  if (status==='warn')  amberEl.className = 'tl-bulb on-amber blinking';
  if (status==='bad')   redEl.className   = 'tl-bulb on-red blinking';
}

function updateInfoPanel(sensorKey) {
  const sensorDef    = SENSORS[sensorKey];
  const displayValue = conditionMode === 'ideal' ? PRISTINE[sensorKey] : currentReadings[sensorKey];
  const trafficClass = getStatus(sensorKey);      // 3-class for traffic light
  const wfdClass     = getWFDStatus(sensorKey);   // 5-class WFD status
  const wfdInfo      = WFD_COLOURS[wfdClass];

  document.getElementById('sensorTitle').textContent = sensorDef.label;
  // Replace large panel reading to prevent NaN
   if (!hasValidData(displayValue)) {
      document.getElementById('sensorNum').textContent = 'Sensor Offline...';
      document.getElementById('sensorUnit').textContent = '';
} else {
      document.getElementById('sensorNum').textContent = displayValue % 1 !== 0 ? (displayValue < 100
          ? displayValue.toFixed(2)
          : displayValue.toFixed(1))
      : displayValue;
      document.getElementById('sensorUnit').textContent = ' ' + sensorDef.unit;
}

  // WFD status badge — shows official 5-class label with WFD colour
  const statusBadgeEl = document.getElementById('sensorStatus');

//    // Replace "statusBadgeEl.textContent   = wfdInfo.icon + ' WFD: ' + wfdInfo.label;" below to replace WFD: BAD when data is missing
if (!sensorAvailable(sensorKey)) {
   statusBadgeEl.textContent = '● WFD: Status Unknown';
   statusBadgeEl.style.background = 'rgba(120,120,120,.25)';
   statusBadgeEl.style.color = '#d0d0d0';
   statusBadgeEl.style.border = '1px solid rgba(220,220,220,.25)';
} else {
   statusBadgeEl.textContent = wfdInfo.icon + ' WFD: ' + wfdInfo.label;
   statusBadgeEl.style.background = wfdInfo.bg + '40';
   statusBadgeEl.style.color = wfdInfo.fg;
   statusBadgeEl.style.border = '1px solid ' + wfdInfo.fg + '60';
}

// ==== DELETE THIS REDUNDANCY
// statusBadgeEl.textContent   = wfdInfo.icon + ' WFD: ' + wfdInfo.label; 
//   statusBadgeEl.style.background = wfdInfo.bg + '40'; // translucent bg
//   statusBadgeEl.style.color      = wfdInfo.fg;
//   statusBadgeEl.style.border     = '1px solid ' + wfdInfo.fg + '60';
// ==== END OF REDUNDANCY

  statusBadgeEl.style.borderRadius = '8px';
  statusBadgeEl.className        = ''; // clear old class
  statusBadgeEl.style.display    = 'inline-flex';
  statusBadgeEl.style.alignSelf  = 'flex-start';
  statusBadgeEl.style.padding    = '2px 8px';

  document.getElementById('range-good').textContent = `${sensorDef.good[0]}–${sensorDef.good[1]} ${sensorDef.unit}`;
  document.getElementById('range-warn').textContent = `${sensorDef.warn[0]}–${sensorDef.warn[1]} ${sensorDef.unit}`;

  setTrafficLight(trafficClass);
  updateWFDStatusBar(sensorKey);
  document.getElementById('narrativeText').innerHTML = generateNarrative(activeEntityKey, sensorKey);
}

// Helper function to replace "WFD: BAD" on dashboard when data is missing
function sensorAvailable(sensorKey) {

  const val =
    conditionMode === 'ideal'
      ? PRISTINE[sensorKey]
      : currentReadings[sensorKey];

  return hasValidData(val);
}


function selectGauge(key) {
  activeGaugeKey = key;
  document.querySelectorAll('.gauge-bubble').forEach(b => {
    b.classList.toggle('active', b.dataset.key === key);
  });
  updateInfoPanel(key);
}

/* ════════════════════════════════════════════════════
   ENTITY ANIMATIONS — realistic line-art style
════════════════════════════════════════════════════ */
const entityCanvas = document.getElementById('entityCanvas');
let ectx, EW, EH;

function resizeEntityCanvas() {
  const wrap = document.getElementById('entityCanvasWrap');
  const dpr  = window.devicePixelRatio||1;
  EW = wrap.clientWidth; EH = wrap.clientHeight;
  entityCanvas.width  = Math.round(EW*dpr);
  entityCanvas.height = Math.round(EH*dpr);
  entityCanvas.style.width  = EW+'px';
  entityCanvas.style.height = EH+'px';
  ectx = entityCanvas.getContext('2d');
  ectx.scale(dpr,dpr);
}

function startEntityAnimation() {
  if (entityRafId) cancelAnimationFrame(entityRafId);
  function frame() {
    entityAnimClock += 0.02;
    if (ectx) ENTITIES[activeEntityKey].draw(ectx, EW, EH, entityAnimClock);
    entityRafId = requestAnimationFrame(frame);
  }
  frame();
}

/* ── Swan — realistic line-art ── */
function drawSwanEntity(c, W, H, t) {
  // Water background
  c.fillStyle = '#0d2040'; c.fillRect(0,0,W,H);
  for (let i=0;i<4;i++) {
    const wy = H*.6+i*10+Math.sin(t*1.1+i)*2.5;
    c.beginPath();
    for (let x=0;x<=W;x+=4) x===0?c.moveTo(x,wy+Math.sin(x*.05+t)*3):c.lineTo(x,wy+Math.sin(x*.05+t)*3);
    c.strokeStyle=`rgba(50,130,210,${.18-i*.04})`; c.lineWidth=1.2; c.stroke();
  }

  const cx = W * 0.52, cy = H * 0.62;
  const bob = Math.sin(t * 1.0) * 3.5;
  c.save();
  c.translate(cx, cy + bob);
  // Draw in right-facing coords, then flip to face LEFT.
  // After scale(-1,1):  positive X (front/head) → appears on the LEFT of screen
  //                     negative X (rear/tail)  → appears on the RIGHT of screen
  c.scale(-1, 1);

  // ── Body ─────────────────────────────────────────────────────
  c.beginPath();
  c.ellipse(0, 0, 58, 24, -0.12, 0, Math.PI*2);
  const bodyGrad = c.createRadialGradient(-8, -8, 2, 0, 0, 62);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.6, '#f0f4ff');
  bodyGrad.addColorStop(1, '#d8e4f0');
  c.fillStyle = bodyGrad; c.fill();
  c.strokeStyle = '#b8c8e0'; c.lineWidth = 1.2; c.stroke();

  // ── Tail feathers — at NEGATIVE X (rear, will appear on right after flip) ──
  c.save();
  c.strokeStyle = '#d8e4f4'; c.lineWidth = 2.5; c.lineCap = 'round';
  const tailSway = Math.sin(t * 1.4) * 0.04;
  [
    [-52,  8, -74, 18],
    [-55,  0, -80,  2],
    [-52, -8, -74,-16],
  ].forEach(([x1, y1, x2, y2]) => {
    c.save(); c.rotate(tailSway);
    c.beginPath();
    c.moveTo(x1, y1);
    c.quadraticCurveTo(x1 - 10, (y1 + y2) * 0.5, x2, y2);
    c.stroke();
    c.restore();
  });
  c.restore();

  // ── Wing fold lines across the back (mid-body toward tail) ───
  c.save(); c.globalAlpha = 0.28;
  c.strokeStyle = '#b8cce0'; c.lineWidth = 0.9;
  for (let i = 0; i < 4; i++) {
    const wx = -36 + i * 16; // negative = toward tail, positive = toward neck
    c.beginPath();
    c.moveTo(wx, -9);
    c.quadraticCurveTo(wx + 8, -19, wx + 16, -7);
    c.stroke();
  }
  c.restore();

  // ── Neck — rises from POSITIVE X (front, will appear on left after flip) ──
  const neckSway = Math.sin(t * 0.7) * 5;
  c.beginPath();
  c.moveTo(40, -12);
  c.bezierCurveTo(54 + neckSway, -30, 50 + neckSway, -58, 38 + Math.sin(t * 0.5) * 6, -72);
  const neckGrad = c.createLinearGradient(40, -12, 38, -72);
  neckGrad.addColorStop(0, '#f0f4ff');
  neckGrad.addColorStop(1, '#ffffff');
  c.strokeStyle = neckGrad; c.lineWidth = 14; c.lineCap = 'round'; c.stroke();
  c.strokeStyle = 'rgba(184,200,224,.4)'; c.lineWidth = 1; c.stroke();

  // ── Head ─────────────────────────────────────────────────────
  const hx = 38 + Math.sin(t * 0.5) * 6, hy = -74;
  c.beginPath();
  c.ellipse(hx, hy, 12, 10, 0.15, 0, Math.PI * 2);
  const headGrad = c.createRadialGradient(hx - 3, hy - 3, 1, hx, hy, 13);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(1, '#e8f0fc');
  c.fillStyle = headGrad; c.fill();
  c.strokeStyle = '#b8c8e0'; c.lineWidth = 1; c.stroke();

  // ── Beak — at the tip of the head, pointing in positive X direction ──
  // After the scale(-1,1) flip this will point LEFT (into the screen).
  const bkx = hx + 10;
  c.beginPath();
  c.moveTo(bkx - 2, hy - 3);
  c.lineTo(bkx + 16, hy + 1);
  c.lineTo(bkx - 2,  hy + 5);
  c.closePath();
  c.fillStyle = '#e07820'; c.fill();
  c.beginPath();
  c.ellipse(bkx - 1, hy, 3.5, 2.5, 0, 0, Math.PI * 2);
  c.fillStyle = '#b85010'; c.fill();

  // ── Eye ──────────────────────────────────────────────────────
  c.beginPath();
  c.arc(hx + 4, hy - 3, 3, 0, Math.PI * 2);
  c.fillStyle = '#1a1a2a'; c.fill();
  c.beginPath();
  c.arc(hx + 5, hy - 4, 1.2, 0, Math.PI * 2);
  c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();

  c.restore();
}

/* ── Otter — realistic floating on back ── */
function drawOtterEntity(c, W, H, t) {
  c.fillStyle='#12100a'; c.fillRect(0,0,W,H);
  c.fillStyle='#0a1c2e';
  c.beginPath(); c.rect(0,H*.5,W,H*.5); c.fill();
  for (let i=0;i<3;i++){
    const wy=H*.54+i*10;
    c.beginPath();
    for(let x=0;x<=W;x+=4) x===0?c.moveTo(x,wy+Math.sin(x*.05+t+i)*2.5):c.lineTo(x,wy+Math.sin(x*.05+t+i)*2.5);
    c.strokeStyle=`rgba(40,110,170,${.18-i*.05})`; c.lineWidth=1; c.stroke();
  }

  const ox=W*.5, oy=H*.46;
  const bob=Math.sin(t*.9)*2.5;
  c.save(); c.translate(ox,oy+bob); c.scale(-1,1);

  // Body with fur texture
  c.beginPath(); c.ellipse(0,0,46,18,.06,0,Math.PI*2);
  const bodyGrad=c.createRadialGradient(-8,-4,2,0,0,50);
  bodyGrad.addColorStop(0,'#8b5e2a'); bodyGrad.addColorStop(.5,'#6b3f18'); bodyGrad.addColorStop(1,'#4a2a0a');
  c.fillStyle=bodyGrad; c.fill();

  // Belly
  c.beginPath(); c.ellipse(4,4,30,12,.06,0,Math.PI*2);
  c.fillStyle='#d4a070'; c.fill();
  c.beginPath(); c.ellipse(4,4,22,8,.06,0,Math.PI*2);
  c.fillStyle='#e0b888'; c.fill();

  // Tail
  c.beginPath();
  c.moveTo(-42,0);
  c.bezierCurveTo(-54,4+Math.sin(t*1.3)*7,-62,-4+Math.sin(t*1.3)*5,-56,-12+Math.sin(t)*5);
  c.strokeStyle='#5a3010'; c.lineWidth=10; c.lineCap='round'; c.stroke();
  c.strokeStyle='#6b3f18'; c.lineWidth=6; c.stroke();

  // Head
  c.beginPath(); c.arc(48,-2,15,0,Math.PI*2);
  const headGrad=c.createRadialGradient(44,-5,2,48,-2,16);
  headGrad.addColorStop(0,'#8b5e2a'); headGrad.addColorStop(1,'#5a3010');
  c.fillStyle=headGrad; c.fill();

  // Muzzle
  c.beginPath(); c.ellipse(60,1,8,6,0,0,Math.PI*2); c.fillStyle='#c08060'; c.fill();
  c.beginPath(); c.ellipse(60,1,5,4,0,0,Math.PI*2); c.fillStyle='#b07050'; c.fill();
  // Nose
  c.beginPath(); c.ellipse(67,0,4,2.5,0,0,Math.PI*2); c.fillStyle='#1a0a00'; c.fill();
  // Whisker dots
  c.fillStyle='#d4a070';
  [[58,-2],[60,-1],[62,-2],[57,2],[59,3],[61,2]].forEach(([wx,wy])=>{
    c.beginPath(); c.arc(wx,wy,.8,0,Math.PI*2); c.fill();
  });

  // Eye
  c.beginPath(); c.arc(54,-6,3.5,0,Math.PI*2); c.fillStyle='#1a0a00'; c.fill();
  c.beginPath(); c.arc(55,-7,1.5,0,Math.PI*2); c.fillStyle='rgba(255,255,255,.6)'; c.fill();

  // Paws with stone
  const pawX=10+Math.sin(t*1.1)*3;
  c.beginPath(); c.ellipse(pawX,-14,8,5,-.4,0,Math.PI*2); c.fillStyle='#5a3010'; c.fill();
  c.beginPath(); c.ellipse(pawX+14,-14,8,5,.4,0,Math.PI*2); c.fillStyle='#5a3010'; c.fill();
  // Stone
  c.beginPath(); c.ellipse(pawX+7,-20,7,6,0,0,Math.PI*2);
  const stoneGrad=c.createRadialGradient(pawX+5,-22,1,pawX+7,-20,7);
  stoneGrad.addColorStop(0,'#aaa'); stoneGrad.addColorStop(1,'#666');
  c.fillStyle=stoneGrad; c.fill();
  c.strokeStyle='#444'; c.lineWidth=.5; c.stroke();

  c.restore();
}

/* ── Lily — detailed pad with flower ── */
function drawLilyEntity(c, W, H, t) {
  c.fillStyle='#061810'; c.fillRect(0,0,W,H);
  for(let i=0;i<5;i++){
    const wy=H*.18+i*14+Math.sin(t*.5+i)*2;
    c.beginPath();
    for(let x=0;x<=W;x+=4) x===0?c.moveTo(x,wy+Math.sin(x*.04+t+i)*2.5):c.lineTo(x,wy+Math.sin(x*.04+t+i)*2.5);
    c.strokeStyle=`rgba(20,100,60,${.14-i*.02})`; c.lineWidth=1; c.stroke();
  }

  const lx=W*.45, ly=H*.62;
  const bob=Math.sin(t*.7)*2.5;
  c.save(); c.translate(lx,ly+bob); c.scale(-1,1);

  // Pad — two-tone sectors
  const padR=38;
  for(let i=0;i<12;i++){
    const a=(i/12)*Math.PI*2;
    c.beginPath(); c.moveTo(0,0);
    c.arc(0,0,padR,a,a+Math.PI*2/12); c.closePath();
    const even=i%2===0;
    const padGrad=c.createRadialGradient(0,0,4,0,0,padR);
    padGrad.addColorStop(0, even?'#2a8040':'#226835');
    padGrad.addColorStop(.7,even?'#1e6030':'#1a5228');
    padGrad.addColorStop(1, even?'#154020':'#123418');
    c.fillStyle=padGrad; c.fill();
    c.strokeStyle='rgba(40,100,50,.4)'; c.lineWidth=.5; c.stroke();
  }
  // Pad veins
  c.save(); c.globalAlpha=.25; c.strokeStyle='#70d080'; c.lineWidth=.8;
  for(let i=0;i<8;i++){
    const a=(i/8)*Math.PI*2;
    c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(a)*padR,Math.sin(a)*padR); c.stroke();
  }
  c.restore();

  // Sheen
  c.beginPath(); c.ellipse(-8,-10,20,10,-.4,0,Math.PI*2);
  c.fillStyle='rgba(100,220,120,.15)'; c.fill();

  // Notch
  c.beginPath(); c.moveTo(0,0); c.lineTo(-padR-3,-3); c.lineTo(-padR-3,3); c.closePath();
  c.fillStyle='#061810'; c.fill();

  // Stem
  c.beginPath();
  c.moveTo(0,padR); c.bezierCurveTo(10+Math.sin(t*.5)*4,padR+18,4,padR+32,2+Math.sin(t*.4)*3,padR+46);
  c.strokeStyle='#1a5830'; c.lineWidth=3; c.lineCap='round'; c.stroke();

  // Flower petals — layered
  const fr=13+Math.sin(t*.8)*1.5;
  // Outer petals
  for(let i=0;i<8;i++){
    const a=(i/8)*Math.PI*2+t*.1;
    c.beginPath();
    c.ellipse(Math.cos(a)*fr*.7,Math.sin(a)*fr*.7,fr*.65,fr*.35,a,0,Math.PI*2);
    c.fillStyle=`rgba(250,200,220,${.75+Math.sin(t+i)*.08})`; c.fill();
  }
  // Inner petals
  for(let i=0;i<5;i++){
    const a=(i/5)*Math.PI*2+t*.15+.4;
    c.beginPath();
    c.ellipse(Math.cos(a)*fr*.35,Math.sin(a)*fr*.35,fr*.45,fr*.25,a,0,Math.PI*2);
    c.fillStyle=`rgba(255,220,240,${.85+Math.sin(t*1.2+i)*.08})`; c.fill();
  }
  // Stamens
  c.beginPath(); c.arc(0,0,7,0,Math.PI*2); c.fillStyle='#f8d030'; c.fill();
  c.beginPath(); c.arc(0,0,5,0,Math.PI*2); c.fillStyle='#e8a020'; c.fill();
  c.beginPath(); c.arc(0,0,3,0,Math.PI*2); c.fillStyle='#c07010'; c.fill();

  c.restore();

  // Expanding ripples
  for(let i=0;i<3;i++){
    const rp=((t*.3+i*.33)%1);
    const rr=padR+8+rp*28;
    c.beginPath(); c.ellipse(lx,ly+bob,rr,rr*.34,0,0,Math.PI*2);
    c.strokeStyle=`rgba(40,160,80,${(1-rp)*.2})`; c.lineWidth=1; c.stroke();
  }
}

/* ════════════════════════════════════════════════════
   ENTITY + MODE SWITCHING
════════════════════════════════════════════════════ */
function switchEntity(key) {
  activeEntityKey = key;
  document.querySelectorAll('.ebtn').forEach(b => b.classList.toggle('active', b.dataset.entity===key));
  const ent = ENTITIES[key];
  document.getElementById('entityLabel').textContent = ent.label;
  document.getElementById('entityLabel').style.color = ent.accent;
  // narrative updated via updateInfoPanel → generateNarrative
  // Rebuild gauges for this entity's sensors
  activeGaugeKey = ent.keys[0];
  buildGaugeOverlay();
  updateInfoPanel(activeGaugeKey);
}


/* ════════════════════════════════════════════════════════════════════════
   WFD OVERALL STATUS — One-Out All-Out principle (EU WFD Annex V)
   The overall ecological status is determined by the worst-performing
   quality element. This is the legally mandated classification method.
   Reference: EU Water Framework Directive 2000/60/EC, Annex V §1.4.2
════════════════════════════════════════════════════════════════════════ */
const WFD_STATUS_RANK = {
  unknown: 0,
  bad: 1,
  poor: 2,
  moderate: 3,
  good: 4,
  high: 5
};
const WFD_SDG_GOALS = {
  temperature: 'SDG 6.3', turbidity: 'SDG 6.6',
  ph: 'SDG 6.3', tds: 'SDG 6.3', ec: 'SDG 6.3', level: 'SDG 6.6'
};

function getOverallWFDStatus() {
  let worstStatus = null;
  let worstSensor = null;

  Object.keys(SENSORS).forEach(sensorKey => {
    if (!sensorAvailable(sensorKey)) {
      return;
    }
    const statusClass = getWFDStatus(sensorKey);

    if (
      worstStatus === null || WFD_STATUS_RANK[statusClass] < WFD_STATUS_RANK[worstStatus]
    ) {
      worstStatus = statusClass;
      worstSensor = sensorKey;
    }
  });

  // No live readings available
  if (worstStatus === null) {
    return {
      status: 'unknown',
      limitingSensor: null
    };
  }

  return {
    status: worstStatus,
    limitingSensor: worstSensor
  };
}

function countSDG6Compliance() {
  // SDG 6.3: proportion of water quality parameters meeting safe thresholds
  // SDG Target: substantially improve water quality globally by 2030
   
  // const passing  = Object.keys(SENSORS).filter(k => {
  //   const s = getWFDStatus(k);
  //   return s === 'high' || s === 'good';
  // }).length;
  // const total = Object.keys(SENSORS).length;
   
   const availableSensors = Object.keys(SENSORS) .filter(k => sensorAvailable(k));
   
   const passing = availableSensors.filter(k => {
      const s = getWFDStatus(k);
      return s === 'high' || s === 'good';
   }).length;
   
   const total = availableSensors.length;
   
   return {passing, total, pct: total > 0 ? Math.round((passing / total) * 100) : 0};
}

/* ════════════════════════════════════════════════════════════════════════
   WFD REPORT PANEL
   Opened by the new "WFD / ESG Report" bottom bar button.
   Shows: overall ecological status, per-parameter WFD class, SDG 6
   indicators, ESG environmental metrics, biodiversity proxy status,
   and a timestamp for regulatory audit trail.
════════════════════════════════════════════════════════════════════════ */
let wfdPanelOpen = false;


/* ── Update the WFD Status Bar under the narrative ────────────────────────── */
function updateWFDStatusBar(sensorKey) {
  const bar      = document.getElementById('wfdStatusBar');
  const textEl   = document.getElementById('wfdStatusText');
  if (!bar || !textEl) return;
   
   if (!sensorAvailable(sensorKey)) {
      bar.className = 'wfd-bar-unknown';
      textEl.textContent = 'WFD Status: Unknown — Awaiting sensor observations';
      return;
   }

  const wfdClass = getWFDStatus(sensorKey);

  const labels = {
    high:     'WFD Status: High — Unpolluted reference condition',
    good:     'WFD Status: Good — Slight deviation from reference (EU 2027 target)',
    moderate: 'WFD Status: Moderate — Significant human influence detected',
    poor:     'WFD Status: Poor — Major ecological deviation, action required',
    bad:      'WFD Status: Bad — Severely altered, ecosystem at serious risk',
  };

  // Remove all WFD bar classes then apply the correct one
  bar.className = 'wfd-bar-' + wfdClass;
  textEl.textContent = labels[wfdClass] || labels.good;
}

function openWFDReport() {
  let panel = document.getElementById('wfdReportPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'wfdReportPanel';
    document.getElementById('app').appendChild(panel);
  }

  const overall = getOverallWFDStatus();
  const sdg6    = countSDG6Compliance();
  const wfdInfo = WFD_COLOURS[overall.status];
  const now     = new Date();
  const timestamp = now.toLocaleDateString('en-IE', {
    day:'2-digit', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit', timeZoneName:'short'
  });

  // Build per-parameter WFD status rows
  const paramRows = Object.keys(SENSORS).map(key => {
    const sensorDef = SENSORS[key];
    const wfdClass  = getWFDStatus(key);
    const wfdCol    = WFD_COLOURS[wfdClass];
    const val       = conditionMode === 'ideal' ? PRISTINE[key] : currentReadings[key];
    // const displayVal = typeof val === 'number' && val % 1 !== 0
    //   ? (val < 100 ? val.toFixed(2) : val.toFixed(1)) : val;
     
     const displayVal = hasValidData(val) ? (val % 1 !== 0 ? (val < 100 ? val.toFixed(2) : val.toFixed(1)) : val) : 'Offline';
    return `
      <div class="wfd-param-row">
        <span class="wfd-param-name">${sensorDef.label}</span>
        <span class="wfd-param-val"> ${hasValidData(val) ? displayVal + ' ' + sensorDef.unit  : 'Offline'} </span>
        <span class="wfd-param-status" style="background:${wfdCol.bg}55;color:${wfdCol.fg};border:1px solid ${wfdCol.fg}60" title="WFD Ecological Status: ${wfdCol.label}. ${wfdClass === 'high' ? 'Reference condition — negligible human influence.' : wfdClass === 'good' ? 'Slight deviation from reference conditions. EU 2027 target class.' : wfdClass === 'moderate' ? 'Moderate deviation. Operational monitoring and action required.' : wfdClass === 'poor' ? 'Major deviation. Urgent remediation needed.' : 'Severe alteration. Ecosystem at serious risk.'}">
          ${wfdCol.icon} ${wfdCol.label}
        </span>
        <span class="wfd-param-sdg">${WFD_SDG_GOALS[key]}</span>
      </div>`;
  }).join('');

  // SDG 6 progress bar
  const sdgBarWidth = sdg6.pct;
  const sdgColour   = sdg6.pct >= 80 ? '#40e080' : sdg6.pct >= 50 ? '#f0c030' : '#e03030';

  // Biodiversity proxy — based on entity sensor status
const swanStatus  = ['temperature','turbidity','level'].map(k => getWFDStatus(k));
const otterStatus = ['tds','ec'].map(k => getWFDStatus(k));
const lilyStatus  = [getWFDStatus('ph')];

const bioIndicator = (statuses) => {

  const validStatuses =
    statuses.filter(s => s !== 'unknown');

  if (validStatuses.length === 0) {
    return WFD_COLOURS.unknown;
  }

  const worst =
    validStatuses.reduce(
      (w, s) =>
        WFD_STATUS_RANK[s] < WFD_STATUS_RANK[w]
          ? s
          : w,
      validStatuses[0]
    );

  return WFD_COLOURS[worst];
};

const swanInfo  = bioIndicator(swanStatus);
const otterInfo = bioIndicator(otterStatus);
const lilyInfo  = bioIndicator(lilyStatus);

  // Limiting factor note
const limitingNote = overall.status === 'unknown'
    ? 'No live environmental observations available' : overall.limitingSensor
    ? `Limiting factor: <strong>${SENSORS[overall.limitingSensor].label}</strong> (${WFD_COLOURS[getWFDStatus(overall.limitingSensor)].label})`
    : 'All parameters at High status';

  panel.innerHTML = `
    <div class="wfd-report-inner">
      <div class="wfd-report-header">
        <div class="wfd-report-title">
          <span class="wfd-report-icon">🌊</span>
          WFD Ecological Status Report
        </div>
        <button class="wfd-close-btn" onclick="closeWFDReport()">✕ Close</button>
      </div>

      <div class="wfd-report-body">

        <!-- ══ EU WATER FRAMEWORK DIRECTIVE PARENT BOX ══ -->
        <div class="wfd-framework-box" aria-label="EU Water Framework Directive Assessment">
          <div class="wfd-framework-header" title="EU Water Framework Directive 2000/60/EC — the legal basis for water quality classification in Ireland">
            🇪🇺 EU WATER FRAMEWORK DIRECTIVE
          </div>

          <!-- Overall Ecological Status -->
          <div class="wfd-subsection" aria-label="Overall Ecological Status">
            <div class="wfd-subsection-title">Overall Ecological Status
              <span class="wfd-info-tip" title="The WFD's One-Out All-Out principle: the overall status equals the worst-performing quality element. This is the legally binding classification method under EU WFD Annex V §1.4.2. Ireland's target is Good status for all water bodies by 2027.">ⓘ</span>
            </div>
            <div class="wfd-overall-status" style="background:${wfdInfo.bg}55;border-color:${wfdInfo.fg}60"
                 role="status" aria-label="WFD Overall Status: ${wfdInfo.label}">
              <div class="wfd-overall-class" style="color:${wfdInfo.fg}">${wfdInfo.icon} ${wfdInfo.label.toUpperCase()}</div>
              <div class="wfd-overall-note">${limitingNote}</div>
              <div class="wfd-overall-note" style="font-size:11px;margin-top:4px;opacity:.85">
                One-Out All-Out principle — EU WFD Annex V §1.4.2 | Ireland target: Good status by 2027
              </div>
            </div>
          </div>

          <!-- Physico-Chemical Quality Elements -->
          <div class="wfd-subsection" aria-label="Physico-Chemical Quality Elements">
            <div class="wfd-subsection-title">Physico-Chemical Quality Elements
              <span class="wfd-info-tip" title="Physico-chemical elements are supporting quality elements under WFD Annex V. They must be consistent with the achievement of Good ecological status for biological quality elements. Source: EPA Ireland / UKTAG WFD Environmental Standards 2008 / Ireland's National Water Quality Monitoring Programme 2022–2027.">ⓘ</span>
            </div>
            <div class="wfd-param-header" role="row">
              <span>Parameter</span><span>Reading</span><span>WFD Class</span><span>SDG Link</span>
            </div>
            ${paramRows}
            <div class="wfd-source-note">
              Source: EPA Ireland / UKTAG WFD Environmental Standards 2008 |
              Ireland's National Water Quality Monitoring Programme 2022–2027
            </div>
          </div>

        </div><!-- end WFD parent box -->

        <!-- SDG 6 INDICATORS -->
        <div class="wfd-section" aria-label="UN Sustainable Development Goals">
          <div class="wfd-section-title">UN Sustainable Development Goals — Water &amp; Biodiversity</div>
          <div class="wfd-sdg-row">
            <div class="wfd-sdg-goal" title="SDG 6.3: By 2030, improve water quality by reducing pollution, eliminating dumping and minimising release of hazardous chemicals and materials. Metric: proportion of water bodies with good ambient water quality.">SDG 6.3 — Water Quality</div>
            <div class="wfd-sdg-bar-wrap">
              <div class="wfd-sdg-bar" style="width:${sdgBarWidth}%;background:${sdgColour}"></div>
            </div>
            <div class="wfd-sdg-pct" style="color:${sdgColour}">${sdg6.pct}%</div>
            <div class="wfd-sdg-note">
            ${sdg6.total > 0 ? `${sdg6.passing}/${sdg6.total} parameters at Good or High status` :
              `No live environmental observations available`
            }
            </div>
          </div>
          <div class="wfd-sdg-row">
            <div class="wfd-sdg-goal" title="SDG 6.6: By 2020, protect and restore water-related ecosystems, including mountains, forests, wetlands, rivers, aquifers and lakes. Real-time monitoring directly supports reporting on this target.">SDG 6.6 — Ecosystem Protection</div>
            <div class="wfd-sdg-bar-wrap">
              <div class="wfd-sdg-bar" style="width:${Math.round((sdg6.pct+60)/1.6)}%;background:#4a90d9"></div>
            </div>
            <div class="wfd-sdg-pct" style="color:#4a90d9">Monitored</div>
            <div class="wfd-sdg-note">Continuous real-time ecosystem monitoring active</div>
          </div>
          <div class="wfd-sdg-row">
            <div class="wfd-sdg-goal" title="SDG 13: Take urgent action to combat climate change and its impacts. Water temperature trend data feeds into climate impact assessments on freshwater ecosystems.">SDG 13 — Climate Action</div>
            <div class="wfd-sdg-bar-wrap">
              <div class="wfd-sdg-bar" style="width:100%;background:#7060c0"></div>
            </div>
            <div class="wfd-sdg-pct" style="color:#a090e0">Active</div>
            <div class="wfd-sdg-note">Temperature & hydrology trend monitoring supports climate assessment</div>
          </div>
          <div class="wfd-sdg-row">
            <div class="wfd-sdg-goal" title="SDG 15.1: By 2020, ensure conservation, restoration and sustainable use of terrestrial and inland freshwater ecosystems. Biodiversity proxy indicators via Swan, Otter and Lily monitor freshwater ecosystem health.">SDG 15 — Life on Land</div>
            <div class="wfd-sdg-bar-wrap">
              <div class="wfd-sdg-bar" style="width:100%;background:#408040"></div>
            </div>
            <div class="wfd-sdg-pct" style="color:#60c060">Active</div>
            <div class="wfd-sdg-note">Freshwater biodiversity proxy monitoring via entity indicators</div>
          </div>
        </div>

        <!-- BIODIVERSITY PROXY INDICATORS -->
        <div class="wfd-section">
          <div class="wfd-section-title">Biodiversity Proxy Indicators — Ireland National Biodiversity Plan
            <span class="wfd-info-tip" title="Ireland's National Biodiversity Action Plan 2017–2021 (extended to 2025) identifies freshwater species as priority indicators. The Eurasian Otter (Lutra lutra) is protected under EU Habitats Directive Annex II. pH-sensitive macrophytes are WFD biological quality elements.">ⓘ</span>
          </div>
          <div class="wfd-bio-row">
            <span class="wfd-bio-icon">🦢</span>
            <div class="wfd-bio-info">
              <div class="wfd-bio-name">Mute Swan (<em>Cygnus olor</em>) — Waterfowl indicator</div>
              <div class="wfd-bio-desc">Sensitive to thermal stress, turbidity &amp; water level change</div>
            </div>
            <span class="wfd-bio-badge" style="background:${swanInfo.bg}55;color:${swanInfo.fg};border:1px solid ${swanInfo.fg}60">
              ${swanInfo.icon} ${swanInfo.label}
            </span>
          </div>
          <div class="wfd-bio-row">
            <span class="wfd-bio-icon">🦦</span>
            <div class="wfd-bio-info">
              <div class="wfd-bio-name">Eurasian Otter (<em>Lutra lutra</em>) — Annex II species indicator</div>
              <div class="wfd-bio-desc">Requires good ionic chemistry for fish populations (prey base)</div>
            </div>
            <span class="wfd-bio-badge" style="background:${otterInfo.bg}55;color:${otterInfo.fg};border:1px solid ${otterInfo.fg}60">
              ${otterInfo.icon} ${otterInfo.label}
            </span>
          </div>
          <div class="wfd-bio-row">
            <span class="wfd-bio-icon">🪷</span>
            <div class="wfd-bio-info">
              <div class="wfd-bio-name">White Water Lily (<em>Nymphaea alba</em>) — Macrophyte indicator</div>
              <div class="wfd-bio-desc">pH-sensitive aquatic macrophyte — key WFD biological quality element</div>
            </div>
            <span class="wfd-bio-badge" style="background:${lilyInfo.bg}55;color:${lilyInfo.fg};border:1px solid ${lilyInfo.fg}60">
              ${lilyInfo.icon} ${lilyInfo.label}
            </span>
          </div>
          <div class="wfd-source-note">
            EU Habitats Directive Annex II — Eurasian Otter (<em>Lutra lutra</em>) is a protected species.
            Ireland National Biodiversity Action Plan 2017–2021 (extended to 2025).
            EPA Q-value biological assessment framework.
          </div>
        </div>

        <!-- ESG METRICS -->
        <div class="wfd-section">
          <div class="wfd-section-title">ESG — Environmental, Social &amp; Governance Metrics
            <span class="wfd-info-tip" title="ESG (Environmental, Social and Governance) reporting framework. Environmental metrics here demonstrate compliance with EU Taxonomy Regulation environmental objectives, specifically climate change adaptation (E1) and protection of water and marine resources (E3).">ⓘ</span>
          </div>
          <div class="wfd-esg-grid">
            <div class="wfd-esg-card">
              <div class="wfd-esg-label">Monitoring Frequency</div>
              <div class="wfd-esg-value">Real-time</div>
              <div class="wfd-esg-note">vs EPA minimum 8×/yr</div>
            </div>
            <div class="wfd-esg-card">
              <div class="wfd-esg-label">Parameters Tracked</div>
              <div class="wfd-esg-value">6</div>
              <div class="wfd-esg-note">Physico-chemical QEs</div>
            </div>
            <div class="wfd-esg-card">
              <div class="wfd-esg-label">WFD Compliance</div>
              <div class="wfd-esg-value" style="color:${sdgColour}">${sdg6.pct}%</div>
              <div class="wfd-esg-note">Good or High status</div>
            </div>
            <div class="wfd-esg-card">
              <div class="wfd-esg-label">EU Green Deal</div>
              <div class="wfd-esg-value" style="color:#40e080">Active</div>
              <div class="wfd-esg-note">Zero Pollution Action Plan</div>
            </div>
          </div>
        </div>

        <!-- AUDIT FOOTER -->
        <div class="wfd-audit-footer">
          <span>📍 Station: Voice of the River</span>
          <span>🕐 ${timestamp}</span>
          <span>📋 EPA WFD Open Data API compatible</span>
        </div>

      </div><!-- end wfd-report-body -->
    </div><!-- end wfd-report-inner -->
  `;

  panel.style.display = 'flex';
  wfdPanelOpen = true;
}

function closeWFDReport() {
  const panel = document.getElementById('wfdReportPanel');
  if (panel) panel.style.display = 'none';
  wfdPanelOpen = false;
}

// Clicking outside the governance modal closes it
document.addEventListener('click', function(e) {
  if (!wfdPanelOpen) return;
  const panel = document.getElementById('wfdReportPanel');
  const inner = panel?.querySelector('.wfd-report-inner');
   
  if (!inner) return;

  // Ignore clicks on the button that opened the report
  if (e.target.closest('[data-action="wfd-report"]')) {
    return;
  }

  if (!inner.contains(e.target)) {
    closeWFDReport();
  }
});

// ESC key closes governance modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && wfdPanelOpen) {
    closeWFDReport();
  }
});

function switchMode(mode) {
  conditionMode = mode;
  document.querySelectorAll('.bbtn').forEach(b => b.classList.toggle('active', b.dataset.action==='mode-'+mode));
  applyReadings();
  buildGaugeOverlay();
  updateInfoPanel(activeGaugeKey);
}

/* ════════════════════════════════════════════════════
   ANIMATION LOOP
════════════════════════════════════════════════════ */
function loop() {
  animClock += 0.016;
  drawWater();
  drawScale();
  requestAnimationFrame(loop);
}

/* ════════════════════════════════════════════════════
   EVENT LISTENERS (data-action)
════════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const gtBtn = e.target.closest('[data-gauge-type]');
  if (gtBtn) {
    gaugeType = gtBtn.dataset.gaugeType;
    document.querySelectorAll('.gtbtn').forEach(b => b.classList.toggle('active', b.dataset.gaugeType === gaugeType));
    buildGaugeOverlay();
    return;
  }
  const btn = e.target.closest('[data-action],[data-entity]');
  if (!btn) return;
  if (btn.dataset.entity) { switchEntity(btn.dataset.entity); return; }
  const a = btn.dataset.action;
  if (a==='mode-past')    switchMode('past');
  if (a==='mode-present') switchMode('present');
  if (a==='mode-ideal')   switchMode('ideal');
  if (a==='mode-api')     switchMode('api');
  if (a==='refresh')      refreshSensors();
  if (a==='wfd-report')   openWFDReport();
});

/* ════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════ */
function refreshSensors() {
  if (conditionMode === 'ideal') return; // don't overwrite ideal values
  // Live version: do nothing here — refreshSensors() is overridden
  // by the sensor connection block below to call /readings instead.
  applyReadings();
  buildGaugeOverlay();
  updateInfoPanel(activeGaugeKey);
  // Brief flash on the button to confirm
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    btn.textContent = '✓ Updated';
    btn.style.color = 'var(--accent-green)';
    setTimeout(() => {
      btn.textContent = '⟳ Refresh Sensors';
      btn.style.color = '';
    }, 1200);
  }
}

function init() {
  resizeWater();
  spawnFish();
  resizeScale();
  resizeEntityCanvas();
  applyReadings();
  buildGaugeOverlay();
  updateInfoPanel(activeGaugeKey);
  switchEntity('swan');
  loop();
  startEntityAnimation();
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeWater(); spawnFish(); resizeScale(); resizeEntityCanvas();
    buildGaugeOverlay();
  }, 200);
});

init();


/* ══════════════════════════════════════════════════════
   TIMELINE — Past Conditions panel
══════════════════════════════════════════════════════ */
(function() {

  // ── Constants ──────────────────────────────────────
  const NOW_TS      = Date.now();
  const INSTALL_TS  = NOW_TS - 365 * 24 * 60 * 60 * 1000; // ~1 year of history
  const TOTAL_MS    = NOW_TS - INSTALL_TS;
  const PX_PER_DAY  = 28;          // ruler pixels per day
  const MS_PER_DAY  = 86400000;
  const TOTAL_DAYS  = Math.ceil(TOTAL_MS / MS_PER_DAY);
  const RULER_PX    = TOTAL_DAYS * PX_PER_DAY; // total ruler width in pixels

  const SENSOR_LABELS = {
    temperature:'Heat', turbidity:'Clarity', ph:'Acidity',
    tds:'Saltiness', ec:'Electricity', level:'Depth'
  };
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── State ──────────────────────────────────────────
  let tlOpen         = false;
  let tlSensorKey    = 'temperature';
  let tlOffsetMs     = 0;           // ms before NOW (0 = present, positive = back in time)
  let tlHistory      = {};          // sensorKey -> [{ts, val}]
  let tlCardGauge    = null;        // current mini gauge instance
  let tlPanelHeight  = 260;

  // ── DOM refs ───────────────────────────────────────
  const panel       = document.getElementById('timelinePanel');
  const rulerWrap   = document.getElementById('tlRulerWrap');
  const ruler       = document.getElementById('tlRuler');
  const needle      = document.getElementById('tlNeedle');
  const card        = document.getElementById('tlCard');
  const cardDisplay = document.getElementById('tlCardDisplay');
  const cardTs      = document.getElementById('tlCardTimestamp');
  const cardGWrap   = document.getElementById('tlCardGaugeWrap');
  const cardVal     = document.getElementById('tlCardValue');
  const cardUnit    = document.getElementById('tlCardUnit');
   const graphCanvas = document.getElementById('tlHistoryGraph');
   
   let graphCtx = null;

   // ── Load history from Supabase ─────────────────────
async function loadHistory() {
  const rows =
    await fetch('/api/history')
      .then(r => r.json());
   
  tlHistory = {
    temperature: [],
    turbidity: [],
    level: [],
    tds: [],
    ec: [],
    ph: []
  };

rows.sort(
   (a,b) =>
      new Date(a.created_at)
      - new Date(b.created_at)
);
   
  rows.forEach(row => {

    const ts =
      new Date(row.created_at).getTime();

if (row.temperature != null) {
  tlHistory.temperature.push({
    ts: ts,
    val: row.temperature
  });
}
    // tlHistory.temperature.push({
    //   ts: ts,
    //   val: row.temperature
    // });
     
if (row.turbidity != null) {
  tlHistory.turbidity.push({
    ts: ts,
    val: row.turbidity
  });
}

    // tlHistory.turbidity.push({
    //   ts: ts,
    //   val: row.turbidity
    // });


if (row.level != null) {
  tlHistory.level.push({
    ts: ts,
    val: row.level
  });
}
     
    // tlHistory.level.push({
    //   ts: ts,
    //   val: row.level
    // });

if (row.tds != null) {
  tlHistory.tds.push({
    ts: ts,
    val: row.tds
  });
}
    // tlHistory.tds.push({
    //   ts: ts,
    //   val: row.tds
    // });

if (row.ec != null) {
  tlHistory.ec.push({
    ts: ts,
    val: row.ec
  });
}

    // tlHistory.ec.push({
    //   ts: ts,
    //   val: row.ec
    // });

if (row.ph != null) {
  tlHistory.ph.push({
    ts: ts,
    val: row.ph
  });
}

    // tlHistory.ph.push({
    //   ts: ts,
    //   val: row.ph
    // });

  });

  console.log(
    'History loaded:',
    rows.length,
    'records'
  );

}


  // ── Simulated history ──────────────────────────────
  function generateHistory() {
    const step = 6 * 60 * 60 * 1000; // one point every 6 hours
    Object.keys(SENSORS).forEach(key => {
      const s    = SENSORS[key];
      const mid  = (s.good[0] + s.good[1]) / 2;
      const range = (s.max - s.min) * 0.55;
      let   val  = mid;
      let   seed = key.charCodeAt(0) * 137;
      const pts  = [];
      for (let ts = INSTALL_TS; ts <= NOW_TS; ts += step) {
        seed = (seed * 16807 + 7) & 0x7fffffff;
        val += (seed / 0x7fffffff - 0.5) * range * 0.08 - (val - mid) * 0.02;
        val  = Math.max(s.min, Math.min(s.max, val));
        pts.push({ ts, val: +val.toFixed(2) });
      }
      pts.push({ ts: NOW_TS, val: currentReadings[key] });
      tlHistory[key] = pts;
    });
  }

  // ── Interpolate value at a timestamp ──────────────
  function valueAt(key, ts) {
    const pts = tlHistory[key];
    if (!pts || !pts.length) return currentReadings[key];
    if (ts >= NOW_TS) return currentReadings[key];
    for (let i = pts.length - 2; i >= 0; i--) {
      if (pts[i].ts <= ts) {
        const a = pts[i], b = pts[i+1];
        const f = (ts - a.ts) / (b.ts - a.ts);
        return +(a.val + (b.val - a.val) * f).toFixed(2);
      }
    }
    return pts[0].val;
  }

   // Graph Sizing
   function resizeGraph() {
      if (!graphCanvas) return;
      
      graphCanvas.width = graphCanvas.clientWidth;
      
      graphCanvas.height = graphCanvas.clientHeight;
}

function drawHistoryGraph() {
   if (!graphCtx) return;
   const pts = tlHistory[tlSensorKey];

  if (!pts || pts.length < 2)
    return;

  const W = graphCanvas.width;
  const H = graphCanvas.height;

  graphCtx.clearRect(0, 0, W, H);

  let minVal = Infinity;
  let maxVal = -Infinity;

  pts.forEach(p => {

    minVal = Math.min(minVal, p.val);
    maxVal = Math.max(maxVal, p.val);

  });

  if (minVal === maxVal) {
    minVal--;
    maxVal++;
  }

  const colours = {
    temperature: '#ff9040',
    turbidity:   '#60d0ff',
    ph:          '#70ffb0',
    tds:         '#ffe060',
    ec:          '#d090ff',
    level:       '#70a0ff'
  };

  graphCtx.beginPath();

  pts.forEach((p, i) => {

    const x =
      ((p.ts - INSTALL_TS) / TOTAL_MS) * W;

    const y =
      H -
      ((p.val - minVal) /
      (maxVal - minVal))
      * (H * 0.8)
      - 10;

    if (i === 0)
      graphCtx.moveTo(x, y);
    else
      graphCtx.lineTo(x, y);

  });

  graphCtx.strokeStyle =
    colours[tlSensorKey] || '#60d0ff';

  graphCtx.lineWidth = 3;

  graphCtx.shadowColor =
    graphCtx.strokeStyle;

  graphCtx.shadowBlur = 12;

  graphCtx.stroke();

  graphCtx.shadowBlur = 0;
}
   
  // ── Build ruler tick marks ─────────────────────────
  function buildRuler() {
    ruler.style.width = RULER_PX + 'px';
    ruler.innerHTML   = '';

    // NOW marker (rightmost)
    const nowDiv = document.createElement('div');
    nowDiv.className = 'tl-now-marker';
    nowDiv.style.left = RULER_PX + 'px';
    ruler.appendChild(nowDiv);
    const nowLbl = document.createElement('div');
    nowLbl.className  = 'tl-now-label';
    nowLbl.style.left = RULER_PX + 'px';
    nowLbl.textContent = 'NOW';
    ruler.appendChild(nowLbl);

    // Day ticks from install date to now
    for (let d = 0; d <= TOTAL_DAYS; d++) {
      const ts   = INSTALL_TS + d * MS_PER_DAY;
      const xPx  = d * PX_PER_DAY;
      const date = new Date(ts);
      const day  = date.getDate();
      const mon  = date.getMonth();
      const yr   = date.getFullYear();

      const isMon1  = day === 1;          // 1st of month
      const isMon5  = day % 5 === 0;     // every 5th day gets a label

      const tick = document.createElement('div');
      tick.className = isMon1 ? 'tl-tick major' : 'tl-tick minor';
      tick.style.left = xPx + 'px';
      ruler.appendChild(tick);

      if (isMon1) {
        const lbl = document.createElement('div');
        lbl.className  = 'tl-tick-label';
        lbl.style.left = xPx + 'px';
        lbl.textContent = MONTH_NAMES[mon] + ' ' + yr;
        ruler.appendChild(lbl);
      } else if (isMon5 && xPx < RULER_PX - PX_PER_DAY) {
        const lbl = document.createElement('div');
        lbl.className  = 'tl-tick-label';
        lbl.style.left = xPx + 'px';
        lbl.textContent = day + '';
        ruler.appendChild(lbl);
      }
    }
  }

  // ── ts → ruler X pixel (rightmost = NOW) ──────────
  function tsToRulerX(ts) {
    const daysFromInstall = (ts - INSTALL_TS) / MS_PER_DAY;
    return daysFromInstall * PX_PER_DAY;
  }

  // ── Current scrub timestamp ────────────────────────
  function scrubTs() {
    return NOW_TS - tlOffsetMs;
  }

  // ── Format timestamp for card header ─────────────
  function fmtTs(ts) {
    const d = new Date(ts);
    return d.getDate() + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear()
      + '  ' + d.getHours().toString().padStart(2,'0') + ':00';
  }

  // ── Format sensor value ────────────────────────────
  function fmtVal(v) {
    if (typeof v !== 'number') return String(v);
    return v % 1 === 0 ? String(v) : v < 100 ? v.toFixed(2) : v.toFixed(1);
  }

  // ── Build / update mini gauge ──────────────────────
  function buildMiniGauge(key, val) {
    const s = SENSORS[key];
    const gaugeValue = hasValidData(val) ? val : s.min;
    // Destroy old
    if (tlCardGauge) {
        try { tlCardGauge.destroy(); } catch(e){} tlCardGauge = null;
    }
    cardGWrap.innerHTML = '';

const cvs = document.createElement('canvas');
cvs.id = 'tlMiniGaugeCvs';
cardGWrap.appendChild(cvs);

// Display Offline overlay on mini-gauge in timeline if sensors offline
if (!hasValidData(val)) {
  const off = document.createElement('div');
  off.className = 'tl-gauge-offline';
  off.textContent = 'OFFLINE';
  cardGWrap.appendChild(off);
}

    // Size gauge to fill the available display area
    const gArea = cardGWrap.getBoundingClientRect();
    const sz = Math.max(80, Math.min(Math.floor(gArea.width - 8), Math.floor(gArea.height - 8), 200));
    const highlights = [];
    if (s.good[0] > s.min) highlights.push({from:s.min,to:s.good[0],color:'rgba(240,80,80,.3)'});
    highlights.push({from:s.good[0],to:s.good[1],color:'rgba(40,200,100,.28)'});
    if (s.good[1] < s.warn[1]) highlights.push({from:s.good[1],to:s.warn[1],color:'rgba(240,165,40,.3)'});
    if (s.warn[1] < s.max) highlights.push({from:s.warn[1],to:s.max,color:'rgba(240,60,60,.32)'});

    tlCardGauge = null;
    try {
      tlCardGauge = new RadialGauge({
        renderTo: cvs,
        width: sz, height: sz,
        colorPlate:'#d8e8f4', colorPlateEnd:'#c0d4e8',
        borders:true,
        borderOuterWidth:2, borderMiddleWidth:1, borderInnerWidth:2,
        colorBorderOuter:'#8aaccc', colorBorderOuterEnd:'#c0d8f0',
        colorBorderMiddle:'#9abcdc', colorBorderMiddleEnd:'#cce0f4',
        colorBorderInner:'#7a9cbc', colorBorderInnerEnd:'#b8d0e8',
        borderShadowWidth:4, colorBorderShadow:'rgba(0,0,0,.5)',
        colorMajorTicks:'#304050', colorMinorTicks:'#607080',
        colorNumbers:'#203040',
        colorNeedle:'#c01818', colorNeedleEnd:'#900808',
        needleType:'arrow', needleWidth:2,
        needleCircleSize:5, needleCircleOuter:true, needleCircleInner:false,
        colorNeedleCircleOuter:'#405060', colorNeedleCircleOuterEnd:'#607080',
        colorNeedleCircleInner:'#d8e8f4', colorNeedleCircleInnerEnd:'#d8e8f4',
        colorValueBoxRect:'#405060', colorValueBoxRectEnd:'#506070',
        colorValueBoxBackground:'#182838', colorValueText:'#a0e0ff',
        colorValueTextShadow:'rgba(0,0,0,0)',
        fontNumbersSize:8, fontValueSize:12,
        startAngle:45, ticksAngle:270,
        minValue:s.min, maxValue:s.max, value:gaugeValue,
        majorTicks:s.majorTicks, minorTicks:2, strokeTicks:true,
        highlights, units:'', title:'',
        valueBox:false,
        animationDuration:600, animationRule:'elastic',
      }).draw();
    } catch(gaugeErr) {
      console.warn('Timeline mini gauge failed:', gaugeErr);
    }
  }

  // ── Update card display for current scrub position ─
  function sensorStatusCode(key, val) {
    const s = SENSORS[key];
    if (val >= s.good[0] && val <= s.good[1]) return 'good';
    if (val >= s.warn[0] && val <= s.warn[1]) return 'warn';
    return 'bad';
  }

  function updateCard() {

  const ts  = scrubTs();
  const val = valueAt(tlSensorKey, ts);
  const s   = SENSORS[tlSensorKey];

  const statusBarEl = document.getElementById('tlCardStatusBar');
  const statusLblEl = document.getElementById('tlCardStatusLabel');

  if (!hasValidData(val)) {

    cardVal.textContent  = 'OFFLINE';
    cardUnit.textContent = '';
    cardTs.textContent   = fmtTs(ts);

    if (statusBarEl) {
      statusBarEl.className = 'st-unknown';
    }

    if (statusLblEl) {
      statusLblEl.textContent = '● STATUS UNKNOWN';
    }

    return;
  }

  cardVal.textContent  = fmtVal(val);
  cardUnit.textContent = s.unit;
  cardTs.textContent   = fmtTs(ts);

  const st = sensorStatusCode(tlSensorKey, val);

  if (statusBarEl) {
    statusBarEl.className = 'st-' + st;
  }

  if (statusLblEl) {

    if (st === 'good') {
      statusLblEl.textContent = '● GOOD';
    }
    else if (st === 'warn') {
      statusLblEl.textContent = '● WARNING';
    }
    else {
      statusLblEl.textContent = '● BAD';
    }

  }

}

  // ── Position ruler so current ts appears at card's left edge ──
  // The ruler scrolls so that the scrub position is visible.
  // We keep the card visually fixed and scroll the ruler behind it.
  function updateRulerPosition() {
    const rulerWrapW = rulerWrap.clientWidth;
    const cardLeft   = parseFloat(card.style.left) || 20;
    const cardW      = card.offsetWidth || 320;

    // The needle always sits at the horizontal centre of the card
    const needleX = cardLeft + cardW * 0.5;
    needle.style.left = Math.round(needleX) + 'px';

    // Scroll the ruler so that the current scrub timestamp sits under the needle
    const needleRulerX   = tsToRulerX(scrubTs());
    const targetRulerLeft = needleX - needleRulerX;
    const clampedLeft     = Math.min(0, Math.max(rulerWrapW - RULER_PX, targetRulerLeft));
    ruler.style.transform = `translateX(${clampedLeft}px)`;
  }

  // ── Open / close timeline ──────────────────────────
  const tlOverlay = document.getElementById('tlOverlay');
  const tlCloseBtn = document.getElementById('tlCloseBtn');

  // async function openTimeline() {
  //   if (!Object.keys(tlHistory).length) {
  //   generateHistory();
  //      }

async function openTimeline() {

  if (
    !tlHistory.temperature?.length &&
    !tlHistory.turbidity?.length &&
    !tlHistory.level?.length &&
    !tlHistory.tds?.length &&
    !tlHistory.ec?.length &&
    !tlHistory.ph?.length
  ) {

    try {
      await loadHistory();
    } catch (err) {
      console.warn('History load failed', err);
      generateHistory();
    }

  }
     
    buildRuler();
    tlOpen = true;
    panel.classList.add('open');
    tlOverlay.classList.add('active');
    // Wait for the CSS slide-up transition (350ms) to finish before measuring
    // the card dimensions — otherwise getBoundingClientRect returns zero
    setTimeout(() => {
       // Added Graph Resizing
       graphCtx = graphCanvas.getContext('2d');
       resizeGraph();
       drawHistoryGraph();
       
      positionCard();
      buildMiniGauge(tlSensorKey, valueAt(tlSensorKey, scrubTs()));
      updateCard();
      updateRulerPosition();
    }, 380);
  }

  function closeTimeline() {
    tlOpen = false;
    panel.classList.remove('open');
    tlOverlay.classList.remove('active');
    // Destroy gauge to free memory
    if (tlCardGauge) { try { tlCardGauge.destroy(); } catch(e){} tlCardGauge = null; }
  }

  // Close button inside the ruler strip
  tlCloseBtn.addEventListener('click', closeTimeline);

  // Click anywhere above the panel (on the overlay) also closes it
  tlOverlay.addEventListener('click', closeTimeline);

  // ── Position card at current offset ───────────────
  // Card is "stuck" at left edge when dragging back in time (rightmost in ruler = NOW).
  // Card is "stuck" at right edge when at NOW (tlOffsetMs = 0).
  function positionCard() {
    const areaW  = card.parentElement.clientWidth;
    const cardW  = card.offsetWidth || 320;
    const margin = 20;
    // Fraction of timeline: 0 = NOW (right), 1 = oldest (left)
    const frac   = Math.max(0, Math.min(1, tlOffsetMs / TOTAL_MS));
    // Card moves from right (NOW) to left (oldest)
    const maxLeft = areaW - cardW - margin;
    const minLeft = margin;
    const rawLeft = maxLeft - frac * (maxLeft - minLeft);
    card.style.left = Math.round(Math.max(minLeft, Math.min(maxLeft, rawLeft))) + 'px';
  }

  // ── Drag logic ─────────────────────────────────────
  let dragStartX      = 0;
  let dragStartOffset = 0;
  let isDragging      = false;
  let rafId           = null;
  // Ruler scroll velocity when card is pinned at an edge
  let rulerScrolling  = false;
  let rulerScrollDir  = 0;  // -1 = going back in time, +1 toward now
  let rulerScrollRaf  = null;

  function stopRulerScroll() {
    rulerScrolling = false;
    if (rulerScrollRaf) { cancelAnimationFrame(rulerScrollRaf); rulerScrollRaf = null; }
  }

  function startRulerScroll(dir) {
    if (rulerScrolling && rulerScrollDir === dir) return;
    rulerScrolling = true;
    rulerScrollDir = dir;
    const MS_PER_PX_DRAG = TOTAL_MS / RULER_PX;
    function tick() {
      if (!rulerScrolling) return;
      // Scroll at ~120px/s equivalent
      tlOffsetMs += dir * MS_PER_PX_DRAG * (120 / 60);
      tlOffsetMs  = Math.max(0, Math.min(TOTAL_MS, tlOffsetMs));
      updateCard();
      updateRulerPosition();
      rulerScrollRaf = requestAnimationFrame(tick);
    }
    tick();
  }

  function onDragStart(clientX) {
    isDragging      = true;
    dragStartX      = clientX;
    dragStartOffset = tlOffsetMs;
    stopRulerScroll();
    card.classList.add('dragging');
    // Hide the drag hint permanently once the user starts dragging
    const hint = document.getElementById('tlDragHint');
    if (hint) hint.classList.add('hidden');
  }

  function onDragMove(clientX) {
    if (!isDragging) return;
    const dx       = clientX - dragStartX;
    const areaW    = card.parentElement.clientWidth;
    const cardW    = card.offsetWidth || 320;
    const margin   = 20;
    const maxLeft  = areaW - cardW - margin;
    const minLeft  = margin;
    // dx > 0 = dragging right = moving toward NOW (reduce offset)
    // dx < 0 = dragging left  = going back in time (increase offset)
    const MS_PER_PX = TOTAL_MS / (maxLeft - minLeft);
    let newOffset = dragStartOffset - dx * MS_PER_PX;
    newOffset = Math.max(0, Math.min(TOTAL_MS, newOffset));

    // Determine where the card WOULD be
    const frac      = newOffset / TOTAL_MS;
    const rawLeft   = maxLeft - frac * (maxLeft - minLeft);
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, rawLeft));

    if (clampedLeft <= minLeft && dx < 0) {
      // Card pinned at left edge — start ruler scrolling back in time
      tlOffsetMs = newOffset;
      card.style.left = minLeft + 'px';
      startRulerScroll(1);  // going further back
    } else if (clampedLeft >= maxLeft && dx > 0) {
      // Card pinned at right edge — we're at NOW, stop
      tlOffsetMs = 0;
      card.style.left = maxLeft + 'px';
      stopRulerScroll();
    } else {
      stopRulerScroll();
      tlOffsetMs = newOffset;
      card.style.left = Math.round(clampedLeft) + 'px';
    }

    // Throttle updates with rAF
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      updateCard();
      updateRulerPosition();
    });
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');
    stopRulerScroll();
    // Final update
    updateCard();
    updateRulerPosition();
  }

  // ── Pointer events (mouse + touch) on the DISPLAY side only ──
  cardDisplay.addEventListener('mousedown', e => { e.preventDefault(); onDragStart(e.clientX); });
  document.addEventListener('mousemove',   e => isDragging && onDragMove(e.clientX));
  document.addEventListener('mouseup',     onDragEnd);

  cardDisplay.addEventListener('touchstart', e => {
    e.preventDefault(); onDragStart(e.touches[0].clientX);
  }, { passive:false });
  document.addEventListener('touchmove', e => {
    if (isDragging) { e.preventDefault(); onDragMove(e.touches[0].clientX); }
  }, { passive:false });
  document.addEventListener('touchend', onDragEnd);

  // ── Sensor selector buttons ────────────────────────
  document.getElementById('tlCardSelector').addEventListener('click', e => {
    const btn = e.target.closest('[data-tl-sensor]');
    if (!btn) return;
    tlSensorKey = btn.dataset.tlSensor;
    document.querySelectorAll('.tl-sel-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.tlSensor === tlSensorKey)
    );
    // Rebuild gauge for new sensor
    const val = valueAt(tlSensorKey, scrubTs());
    buildMiniGauge(tlSensorKey, val);
    updateCard();
     drawHistoryGraph();
  });

  // ── Hook into Past Conditions button ──────────────
  // We intercept the switchMode call by listening for the mode change
  const _origSwitchMode = window.switchMode;  // won't work as it's local — use event instead

  // Instead, patch the click listener: intercept mode-past
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'mode-past') {
      if (!tlOpen) {
        openTimeline();
      } else {
        closeTimeline();
        // revert to present
        document.querySelector('[data-action="mode-present"]')?.click();
      }
    } else if (tlOpen) {
      // Any other mode button closes the timeline
      closeTimeline();
    }
  }, true); // capture phase so we run before switchMode

  // ── Resize handling ────────────────────────────────
  window.addEventListener('resize', () => {
    if (!tlOpen) return;
     resizeGraph();
drawHistoryGraph();
    positionCard();
    updateRulerPosition();
  });

})();


/* ══════════════════════════════════════════════════════════════════════
   LIVE SENSOR CONNECTION
   ── All connection parameters preserved from your original dashboard ──

   Endpoints  (defined in ESP32 firmware — DO NOT RENAME):
     /readings   → JSON object polled on demand
     /events     → Server-Sent Events stream

   SSE event name (defined in ESP32 firmware — DO NOT RENAME):
     new_readings

   JSON keys (defined in ESP32 firmware — DO NOT RENAME):
     Node1_TEMP        → temperature (°C)
     Node1_TURBIDITY   → turbidity  (NTU)
     Node1_WATERLEVEL  → level      (ft)
     Node2_TDS         → tds        (ppm)
     Node2_EC          → ec         (µS/cm)
     Node3_PH          → ph         (pH)
══════════════════════════════════════════════════════════════════════ */

/* ── Connection status badge helper ──────────────────────────────── */
function setConnectionStatus(state, label) {
  var badge = document.getElementById('connectionStatus');
  if (!badge) return;
  badge.className = 'cs-' + state;
  badge.querySelector('.cs-label').textContent = label;
}

/* ── Map ESP32 JSON keys → internal sensor keys ───────────────────
   This is the ONLY place that knows about Node/sensor naming.
   JSON key names must match the ESP32 firmware exactly.           */
function applyLiveSensorData(jsonData) {

  const DATA_TIMEOUT_MS = 30000;

  if (jsonData.created_at) {

      const ageMs =
          Date.now() -
          new Date(jsonData.created_at).getTime();

      if (ageMs > DATA_TIMEOUT_MS) {

          console.log(
              'STALE DATA DETECTED',
              ageMs
          );

          Object.keys(currentReadings).forEach(key => {
              currentReadings[key] = NaN;
          });

          levelSensorMissing = true;

          setConnectionStatus(
              'error',
              'Data Stale'
          );

          applyReadings();
          buildGaugeOverlay();
          updateInfoPanel(activeGaugeKey);

          return;
      }
  }

  currentReadings.temperature = NaN;
  currentReadings.turbidity   = NaN;
  currentReadings.level       = NaN;
  currentReadings.tds         = NaN;
  currentReadings.ec          = NaN;
  currentReadings.ph          = NaN;

  if (jsonData.Node1_TEMP != null)
      currentReadings.temperature =
          parseFloat(jsonData.Node1_TEMP);

  if (jsonData.Node1_TURBIDITY != null)
      currentReadings.turbidity =
          parseFloat(jsonData.Node1_TURBIDITY);

if (jsonData.Node1_WATERLEVEL != null) {
    currentReadings.level =
        parseFloat(jsonData.Node1_WATERLEVEL);

    levelSensorMissing = false;
}

if (jsonData.Node1_WATERLEVEL == null) {
    levelSensorMissing = true;
}

  if (jsonData.Node2_TDS != null)
      currentReadings.tds =
          parseFloat(jsonData.Node2_TDS);

  if (jsonData.Node2_EC != null)
      currentReadings.ec =
          parseFloat(jsonData.Node2_EC);

  if (jsonData.Node3_PH != null)
      currentReadings.ph =
          parseFloat(jsonData.Node3_PH);

  applyReadings();
  buildGaugeOverlay();
  updateInfoPanel(activeGaugeKey);
}

/* ── Override refreshSensors to hit the real /readings endpoint ───
   The bottom-bar "Read Sensors" button calls this.               */
function refreshSensors() {
  if (conditionMode === 'ideal') return;
  setConnectionStatus('connecting', 'Reading…');
  fetch('/api/latest?t=' + Date.now(), {
   cache: 'no-store'
   })
    .then(function(response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function(data) {
       applyLiveSensorData(data);

  if (!data.created_at || (Date.now() - new Date(data.created_at).getTime()) <= 30000) {
    setConnectionStatus('live', 'Live');
  };
      // Brief button feedback
      var btn = document.getElementById('refreshBtn');
      if (btn) {
        btn.textContent = '✓ Updated';
        btn.style.color = 'var(--accent-green)';
        setTimeout(function() {
          btn.textContent = '⟳ Read Sensors';
          btn.style.color = '';
        }, 1200);
      }
    })
    .catch(function(err) {
      console.warn('Sensor read failed:', err);
      setConnectionStatus('error', 'Read failed');
    });
}

/* ── Auto-update via Server-Sent Events (/events) ─────────────────
   Mirrors the SSE mechanism from your original dashboard exactly.
   EventSource retries the connection automatically on disconnect.  */
function initSensorSSE() {
  if (!window.EventSource) {
    console.warn('EventSource not supported in this browser');
    setConnectionStatus('error', 'No SSE');
    return;
  }

  setConnectionStatus('connecting', 'Connecting…');

  var sseSource = new EventSource('/events');

  sseSource.addEventListener('new_readings', function(event) {
    try {
      var data = JSON.parse(event.data);
      applyLiveSensorData(data);

      if (data.created_at &&
         (Date.now() - new Date(data.created_at).getTime()) <= 30000) {
         setConnectionStatus('live', 'Live');
      }
    } catch (parseError) {
      console.warn('SSE parse error:', parseError);
    }
  }, false);

  sseSource.onopen = function() {
    setConnectionStatus('live', 'Live');
  };

  sseSource.onerror = function() {
    setConnectionStatus('error', 'Disconnected');
    // EventSource will auto-retry — status updates when reconnected
  };
}

/* ── Start SSE after dashboard init, then do one immediate poll ─── */
// setTimeout(initSensorSSE, 150);
setInterval(refreshSensors, 10000);
setTimeout(function() {
  fetch('/api/latest?t=' + Date.now(), {
   cache: 'no-store'
   })
    .then(function(r){ return r.json(); })
    .then(applyLiveSensorData)
    .catch(function(){});
}, 300);
