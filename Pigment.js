<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>Pigmento — Dibuja libre</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#1B1A18;
    --graphite:#3A3733;
    --paper:#FFFFFF;
    --cobalt:#2F5FA8;
    --ochre:#D9A441;
    --vermilion:#C43E2E;
    --mist:#EDEBE7;
    --line: rgba(255,255,255,0.14);
  }
  *{ box-sizing:border-box; -webkit-tap-highlight-color: transparent; }
  html,body{
    margin:0; padding:0; height:100%; overflow:hidden;
    font-family:'Inter',sans-serif;
    background:var(--paper);
    overscroll-behavior:none;
  }
  #app{ position:fixed; inset:0; }

  canvas#draw{
    position:absolute; inset:0;
    width:100%; height:100%;
    touch-action:none;
    background:var(--paper);
    cursor:crosshair;
  }

  /* ---------- top mark ---------- */
  .brand{
    position:fixed; top:14px; left:16px;
    font-family:'Fraunces', serif;
    font-weight:600; font-size:15px;
    color: var(--graphite);
    letter-spacing:0.02em;
    opacity:0.55;
    pointer-events:none;
    user-select:none;
    z-index:5;
  }

  /* ---------- bottom toolbar ---------- */
  .toolbar{
    position:fixed;
    left:50%; bottom:16px;
    transform:translateX(-50%);
    display:flex;
    align-items:center;
    gap:6px;
    padding:8px;
    background:var(--ink);
    border-radius:28px;
    box-shadow:0 10px 30px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.2);
    z-index:20;
  }
  .tbtn{
    appearance:none; border:none; background:transparent;
    width:48px; height:48px; border-radius:20px;
    display:flex; align-items:center; justify-content:center;
    color:var(--mist);
    position:relative;
    transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
  }
  .tbtn:active{ transform:scale(0.92); }
  .tbtn.active{ background:var(--graphite); color:#fff; }
  .tbtn:disabled{ opacity:0.3; }
  .tbtn svg{ width:22px; height:22px; }

  .divider{
    width:1px; height:28px; background:var(--line); margin:0 2px;
  }

  #colorBtn{
    width:44px; height:44px; border-radius:50%;
    border:3px solid var(--mist);
    box-shadow:0 0 0 2px rgba(0,0,0,0.4) inset;
    padding:0; margin:0 2px;
    cursor:pointer;
  }

  .brushDot{
    border-radius:50%;
    background:var(--mist);
    display:block;
  }

  /* ---------- overlay shared ---------- */
  .overlay{
    position:fixed; inset:0;
    background:rgba(20,19,17,0.55);
    backdrop-filter: blur(2px);
    display:flex; align-items:flex-end; justify-content:center;
    z-index:50;
    opacity:0; pointer-events:none;
    transition:opacity 0.2s ease;
  }
  .overlay.show{ opacity:1; pointer-events:auto; }
  .overlay.center{ align-items:center; }

  .sheet{
    background:var(--ink);
    color:var(--mist);
    width:min(360px, 94vw);
    border-radius:24px;
    padding:20px 20px 22px;
    margin-bottom:16px;
    transform:translateY(16px);
    transition:transform 0.22s ease;
    box-shadow:0 20px 50px rgba(0,0,0,0.4);
  }
  .overlay.show .sheet{ transform:translateY(0); }
  .overlay.center .sheet{ margin-bottom:0; }

  .sheetHead{
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:14px;
  }
  .sheetTitle{
    font-family:'Fraunces', serif; font-weight:600; font-size:17px;
    color:#fff;
  }
  .closeBtn{
    width:32px; height:32px; border-radius:50%;
    background:var(--graphite); border:none; color:var(--mist);
    display:flex; align-items:center; justify-content:center;
  }

  /* ---------- color picker ---------- */
  .wheelWrap{
    display:flex; gap:16px; justify-content:center; align-items:center;
  }
  #wheelCanvas{
    border-radius:50%;
    touch-action:none;
    box-shadow:0 0 0 1px rgba(255,255,255,0.08);
  }
  .sliderCol{ display:flex; flex-direction:column; align-items:center; gap:8px; }
  #valCanvas{
    border-radius:10px;
    touch-action:none;
    box-shadow:0 0 0 1px rgba(255,255,255,0.08);
  }
  .valLabel{ font-size:10px; letter-spacing:0.1em; color:var(--mist); opacity:0.6; text-transform:uppercase; }

  .hexRow{
    display:flex; align-items:center; gap:10px;
    margin-top:16px;
  }
  .swatchPreview{
    width:36px; height:36px; border-radius:10px;
    border:2px solid rgba(255,255,255,0.15);
    flex-shrink:0;
  }
  #hexInput{
    flex:1;
    background:var(--graphite);
    border:none; border-radius:10px;
    color:#fff; font-family:'Inter',monospace;
    font-size:15px; letter-spacing:0.03em;
    padding:10px 12px;
    text-transform:uppercase;
  }
  #hexInput:focus{ outline:2px solid var(--cobalt); }

  .recentLabel{
    font-size:10px; letter-spacing:0.1em; color:var(--mist); opacity:0.6;
    text-transform:uppercase; margin:16px 0 8px;
  }
  .recentRow{
    display:flex; gap:8px; flex-wrap:wrap;
  }
  .recentSwatch{
    width:28px; height:28px; border-radius:8px;
    border:2px solid rgba(255,255,255,0.12);
  }

  /* ---------- size popover ---------- */
  .sizePreviewWrap{
    display:flex; align-items:center; justify-content:center;
    height:70px;
  }
  #sizePreview{ border-radius:50%; }
  #sizeSlider{
    width:100%; margin-top:14px; accent-color:var(--cobalt);
  }
  .sizeVal{
    text-align:center; font-size:13px; opacity:0.7; margin-top:6px;
  }

  /* ---------- confirm clear ---------- */
  .confirmRow{ display:flex; gap:10px; margin-top:4px; }
  .confirmBtn{
    flex:1; border:none; border-radius:14px; padding:12px;
    font-family:'Inter'; font-weight:600; font-size:14px;
  }
  .confirmBtn.cancel{ background:var(--graphite); color:var(--mist); }
  .confirmBtn.danger{ background:var(--vermilion); color:#fff; }

  @media (max-width:420px){
    #wheelCanvas{ width:200px; height:200px; }
  }
</style>
</head>
<body>
<div id="app">
  <canvas id="draw"></canvas>
  <div class="brand">PIGMENTO</div>

  <div class="toolbar">
    <button class="tbtn" id="undoBtn" title="Deshacer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>
    </button>
    <button class="tbtn" id="redoBtn" title="Rehacer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></svg>
    </button>

    <div class="divider"></div>

    <button class="tbtn" id="sizeBtn" title="Grosor del pincel">
      <span class="brushDot" id="sizeDot" style="width:10px;height:10px;"></span>
    </button>

    <button id="colorBtn" title="Elegir color"></button>

    <button class="tbtn" id="eraserBtn" title="Borrador">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H9L4 15c-1-1-1-2 0-3l9-9c1-1 2-1 3 0l5 5c1 1 1 2 0 3l-8 8"/><path d="M7 12l7 7"/></svg>
    </button>

    <div class="divider"></div>

    <button class="tbtn" id="clearBtn" title="Borrar todo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
    </button>
    <button class="tbtn" id="saveBtn" title="Descargar dibujo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>
    </button>
  </div>

  <!-- Color picker overlay -->
  <div class="overlay" id="colorOverlay">
    <div class="sheet">
      <div class="sheetHead">
        <div class="sheetTitle">Color</div>
        <button class="closeBtn" id="closeColor">✕</button>
      </div>

      <div class="wheelWrap">
        <canvas id="wheelCanvas" width="220" height="220"></canvas>
        <div class="sliderCol">
          <span class="valLabel">Brillo</span>
          <canvas id="valCanvas" width="30" height="180"></canvas>
        </div>
      </div>

      <div class="hexRow">
        <div class="swatchPreview" id="swatchPreview"></div>
        <input id="hexInput" maxlength="7" spellcheck="false" autocapitalize="off" autocomplete="off">
      </div>

      <div class="recentLabel">Recientes</div>
      <div class="recentRow" id="recentRow"></div>
    </div>
  </div>

  <!-- Size popover -->
  <div class="overlay" id="sizeOverlay">
    <div class="sheet">
      <div class="sheetHead">
        <div class="sheetTitle">Grosor</div>
        <button class="closeBtn" id="closeSize">✕</button>
      </div>
      <div class="sizePreviewWrap">
        <canvas id="sizePreview" width="70" height="70"></canvas>
      </div>
      <input type="range" id="sizeSlider" min="1" max="60" value="6">
      <div class="sizeVal" id="sizeVal">6 px</div>
    </div>
  </div>

  <!-- Clear confirm -->
  <div class="overlay center" id="clearOverlay">
    <div class="sheet" style="width:min(300px,90vw);">
      <div class="sheetTitle" style="margin-bottom:6px;">¿Borrar todo?</div>
      <div style="font-size:13px; opacity:0.65; line-height:1.4;">Esta acción no se puede deshacer una vez confirmada.</div>
      <div class="confirmRow">
        <button class="confirmBtn cancel" id="cancelClear">Cancelar</button>
        <button class="confirmBtn danger" id="confirmClear">Borrar</button>
      </div>
    </div>
  </div>
</div>

<script>
(function(){
  "use strict";

  // ---------- Canvas setup ----------
  const canvas = document.getElementById('draw');
  const ctx = canvas.getContext('2d', { willReadFrequently:true });
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  function resizeCanvas(preserve){
    const prevData = preserve && canvas.width > 0 ? canvas.toDataURL('image/png') : null;
    const w = window.innerWidth, h = window.innerHeight;
    dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0,w,h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if(prevData){
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, w, h); };
      img.src = prevData;
    }
  }
  resizeCanvas(false);
  window.addEventListener('resize', () => resizeCanvas(true));

  // ---------- State ----------
  let currentColor = '#2F5FA8';
  let brushSize = 6;
  let isEraser = false;
  let drawing = false;
  let lastX = 0, lastY = 0;
  const recent = [];

  const history = [];
  let historyIndex = -1;
  const MAX_HISTORY = 25;

  function pushHistory(){
    const w = window.innerWidth, h = window.innerHeight;
    const snap = ctx.getImageData(0,0, Math.round(w*dpr), Math.round(h*dpr));
    history.splice(historyIndex+1);
    history.push(snap);
    if(history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateUndoRedoButtons();
  }
  function restoreHistory(idx){
    if(idx < 0 || idx >= history.length) return;
    ctx.putImageData(history[idx], 0, 0);
    historyIndex = idx;
    updateUndoRedoButtons();
  }
  function updateUndoRedoButtons(){
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
  }

  // ---------- Drawing (smoothed with quadratic mid-point curves) ----------
  function getPos(e){
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function midpoint(a, b){
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  let points = [];

  function strokeStyleForCurrent(){
    ctx.strokeStyle = isEraser ? '#FFFFFF' : currentColor;
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = 'source-over';
  }

  function beginStroke(e){
    drawing = true;
    const p = getPos(e);
    points = [p];
    lastX = p.x; lastY = p.y;
    // dot for a simple tap
    ctx.beginPath();
    ctx.arc(p.x, p.y, brushSize/2, 0, Math.PI*2);
    ctx.fillStyle = isEraser ? '#FFFFFF' : currentColor;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fill();
  }

  function moveStroke(e){
    if(!drawing) return;
    const p = getPos(e);
    points.push(p);

    // Keep a short rolling buffer; smooth through the last three points
    if(points.length > 3) points.shift();

    if(points.length >= 3){
      const [p0, p1, p2] = points;
      const m1 = midpoint(p0, p1);
      const m2 = midpoint(p1, p2);
      strokeStyleForCurrent();
      ctx.beginPath();
      ctx.moveTo(m1.x, m1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, m2.x, m2.y);
      ctx.stroke();
    } else if(points.length === 2){
      strokeStyleForCurrent();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
    }

    lastX = p.x; lastY = p.y;
  }

  function endStroke(){
    if(!drawing) return;
    drawing = false;
    points = [];
    pushHistory();
  }

  canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); beginStroke(e); });
  canvas.addEventListener('pointermove', (e) => {
    if(!drawing) return;
    // Use coalesced events when available so fast strokes don't lose points
    const events = (typeof e.getCoalescedEvents === 'function') ? e.getCoalescedEvents() : null;
    if(events && events.length){
      events.forEach(moveStroke);
    } else {
      moveStroke(e);
    }
  });
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  canvas.addEventListener('pointerleave', (e) => { if(drawing) endStroke(); });

  // ---------- Toolbar buttons ----------
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');
  const colorBtn = document.getElementById('colorBtn');
  const sizeBtn = document.getElementById('sizeBtn');
  const sizeDot = document.getElementById('sizeDot');

  undoBtn.addEventListener('click', () => restoreHistory(historyIndex - 1));
  redoBtn.addEventListener('click', () => restoreHistory(historyIndex + 1));

  eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.classList.toggle('active', isEraser);
  });

  saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'pigmento-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  function setSwatchDisplay(){
    colorBtn.style.background = currentColor;
    sizeDot.style.background = isEraser ? '#FFFFFF' : currentColor;
  }

  // ---------- Clear confirm ----------
  const clearOverlay = document.getElementById('clearOverlay');
  clearBtn.addEventListener('click', () => clearOverlay.classList.add('show'));
  document.getElementById('cancelClear').addEventListener('click', () => clearOverlay.classList.remove('show'));
  document.getElementById('confirmClear').addEventListener('click', () => {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0,w,h);
    pushHistory();
    clearOverlay.classList.remove('show');
  });

  // ---------- Size popover ----------
  const sizeOverlay = document.getElementById('sizeOverlay');
  const sizeSlider = document.getElementById('sizeSlider');
  const sizeVal = document.getElementById('sizeVal');
  const sizePreview = document.getElementById('sizePreview');
  const spCtx = sizePreview.getContext('2d');

  function drawSizePreview(){
    spCtx.clearRect(0,0,70,70);
    spCtx.fillStyle = isEraser ? '#EDEBE7' : currentColor;
    spCtx.beginPath();
    spCtx.arc(35, 35, Math.min(brushSize,60)/2, 0, Math.PI*2);
    spCtx.fill();
  }

  sizeBtn.addEventListener('click', () => { sizeOverlay.classList.add('show'); drawSizePreview(); });
  document.getElementById('closeSize').addEventListener('click', () => sizeOverlay.classList.remove('show'));
  sizeSlider.addEventListener('input', () => {
    brushSize = parseInt(sizeSlider.value, 10);
    sizeVal.textContent = brushSize + ' px';
    sizeDot.style.width = Math.min(brushSize, 20) + 'px';
    sizeDot.style.height = Math.min(brushSize, 20) + 'px';
    drawSizePreview();
  });

  // ---------- Color picker: HSV wheel ----------
  const colorOverlay = document.getElementById('colorOverlay');
  const wheelCanvas = document.getElementById('wheelCanvas');
  const wCtx = wheelCanvas.getContext('2d');
  const valCanvas = document.getElementById('valCanvas');
  const vCtx = valCanvas.getContext('2d');
  const hexInput = document.getElementById('hexInput');
  const swatchPreview = document.getElementById('swatchPreview');
  const recentRow = document.getElementById('recentRow');

  let hue = 215, sat = 0.55, val = 0.66; // matches default #2F5FA8 approx

  function hsvToRgb(h, s, v){
    h = h % 360;
    const c = v * s;
    const x = c * (1 - Math.abs((h/60) % 2 - 1));
    const m = v - c;
    let r=0,g=0,b=0;
    if(h < 60){ r=c; g=x; b=0; }
    else if(h < 120){ r=x; g=c; b=0; }
    else if(h < 180){ r=0; g=c; b=x; }
    else if(h < 240){ r=0; g=x; b=c; }
    else if(h < 300){ r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }
    return [Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255)];
  }
  function rgbToHex(r,g,b){
    return '#' + [r,g,b].map(n => n.toString(16).padStart(2,'0')).join('').toUpperCase();
  }
  function hexToRgb(hex){
    hex = hex.replace('#','');
    if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const num = parseInt(hex, 16);
    return [(num>>16)&255, (num>>8)&255, num&255];
  }
  function rgbToHsv(r,g,b){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    const d = max - min;
    let h = 0;
    if(d !== 0){
      if(max === r) h = 60 * (((g-b)/d) % 6);
      else if(max === g) h = 60 * ((b-r)/d + 2);
      else h = 60 * ((r-g)/d + 4);
    }
    if(h < 0) h += 360;
    const s = max === 0 ? 0 : d/max;
    return [h, s, max];
  }

  const wheelSize = wheelCanvas.width; // 220
  const wheelRadius = wheelSize/2;
  let wheelImageData = null;

  function buildWheel(){
    const img = wCtx.createImageData(wheelSize, wheelSize);
    const cx = wheelRadius, cy = wheelRadius;
    for(let y=0; y<wheelSize; y++){
      for(let x=0; x<wheelSize; x++){
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const idx = (y*wheelSize + x) * 4;
        if(dist <= wheelRadius){
          let ang = Math.atan2(dy, dx) * 180/Math.PI;
          if(ang < 0) ang += 360;
          const s = Math.min(1, dist/wheelRadius);
          const [r,g,b] = hsvToRgb(ang, s, 1);
          img.data[idx]=r; img.data[idx+1]=g; img.data[idx+2]=b; img.data[idx+3]=255;
        } else {
          img.data[idx+3] = 0;
        }
      }
    }
    wheelImageData = img;
  }
  buildWheel();

  function drawWheel(){
    wCtx.putImageData(wheelImageData, 0, 0);
    // marker
    const rad = hue * Math.PI/180;
    const r = sat * wheelRadius;
    const mx = wheelRadius + Math.cos(rad) * r;
    const my = wheelRadius + Math.sin(rad) * r;
    wCtx.beginPath();
    wCtx.arc(mx, my, 8, 0, Math.PI*2);
    wCtx.strokeStyle = '#FFFFFF';
    wCtx.lineWidth = 3;
    wCtx.stroke();
    wCtx.beginPath();
    wCtx.arc(mx, my, 8, 0, Math.PI*2);
    wCtx.strokeStyle = 'rgba(0,0,0,0.35)';
    wCtx.lineWidth = 1;
    wCtx.stroke();
  }

  function drawValSlider(){
    const w = valCanvas.width, h = valCanvas.height;
    const [r,g,b] = hsvToRgb(hue, sat, 1);
    const grad = vCtx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0, `rgb(${r},${g},${b})`);
    grad.addColorStop(1, '#000000');
    vCtx.fillStyle = grad;
    vCtx.fillRect(0,0,w,h);
    // marker
    const my = (1 - val) * h;
    vCtx.beginPath();
    vCtx.moveTo(0, my); vCtx.lineTo(w, my);
    vCtx.strokeStyle = '#FFFFFF';
    vCtx.lineWidth = 3;
    vCtx.stroke();
    vCtx.beginPath();
    vCtx.moveTo(0, my); vCtx.lineTo(w, my);
    vCtx.strokeStyle = 'rgba(0,0,0,0.35)';
    vCtx.lineWidth = 1;
    vCtx.stroke();
  }

  function applyColor(pushRecent){
    const [r,g,b] = hsvToRgb(hue, sat, val);
    currentColor = rgbToHex(r,g,b);
    hexInput.value = currentColor;
    swatchPreview.style.background = currentColor;
    setSwatchDisplay();
    if(isEraser){ isEraser = false; eraserBtn.classList.remove('active'); }
    if(pushRecent) addRecent(currentColor);
  }

  function addRecent(hex){
    const i = recent.indexOf(hex);
    if(i !== -1) recent.splice(i,1);
    recent.unshift(hex);
    if(recent.length > 10) recent.pop();
    renderRecent();
  }
  function renderRecent(){
    recentRow.innerHTML = '';
    recent.forEach(hex => {
      const sw = document.createElement('button');
      sw.className = 'recentSwatch';
      sw.style.background = hex;
      sw.addEventListener('click', () => {
        const [r,g,b] = hexToRgb(hex);
        [hue, sat, val] = rgbToHsv(r,g,b);
        drawWheel(); drawValSlider(); applyColor(false);
      });
      recentRow.appendChild(sw);
    });
  }

  function wheelFromEvent(e){
    const rect = wheelCanvas.getBoundingClientRect();
    const scale = wheelSize / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    const dx = x - wheelRadius, dy = y - wheelRadius;
    let dist = Math.sqrt(dx*dx + dy*dy);
    let ang = Math.atan2(dy, dx) * 180/Math.PI;
    if(ang < 0) ang += 360;
    sat = Math.min(1, dist / wheelRadius);
    hue = ang;
    drawWheel(); drawValSlider(); applyColor(false);
  }
  function valFromEvent(e){
    const rect = valCanvas.getBoundingClientRect();
    const scale = valCanvas.height / rect.height;
    let y = (e.clientY - rect.top) * scale;
    y = Math.max(0, Math.min(valCanvas.height, y));
    val = 1 - (y / valCanvas.height);
    drawWheel(); drawValSlider(); applyColor(false);
  }

  let draggingWheel = false, draggingVal = false;
  wheelCanvas.addEventListener('pointerdown', (e) => { draggingWheel = true; wheelCanvas.setPointerCapture(e.pointerId); wheelFromEvent(e); });
  wheelCanvas.addEventListener('pointermove', (e) => { if(draggingWheel) wheelFromEvent(e); });
  wheelCanvas.addEventListener('pointerup', () => { draggingWheel = false; addRecent(currentColor); });

  valCanvas.addEventListener('pointerdown', (e) => { draggingVal = true; valCanvas.setPointerCapture(e.pointerId); valFromEvent(e); });
  valCanvas.addEventListener('pointermove', (e) => { if(draggingVal) valFromEvent(e); });
  valCanvas.addEventListener('pointerup', () => { draggingVal = false; addRecent(currentColor); });

  hexInput.addEventListener('change', () => {
    let v = hexInput.value.trim();
    if(!v.startsWith('#')) v = '#' + v;
    if(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)){
      const [r,g,b] = hexToRgb(v);
      [hue, sat, val] = rgbToHsv(r,g,b);
      drawWheel(); drawValSlider(); applyColor(true);
    } else {
      hexInput.value = currentColor;
    }
  });

  colorBtn.addEventListener('click', () => {
    colorOverlay.classList.add('show');
    drawWheel(); drawValSlider();
    hexInput.value = currentColor;
  });
  document.getElementById('closeColor').addEventListener('click', () => colorOverlay.classList.remove('show'));

  // close overlays on backdrop tap
  [colorOverlay, sizeOverlay, clearOverlay].forEach(ov => {
    ov.addEventListener('click', (e) => { if(e.target === ov) ov.classList.remove('show'); });
  });

  // ---------- init ----------
  setSwatchDisplay();
  drawSizePreview();
  addRecent(currentColor);
  pushHistory(); // initial blank state
})();
</script>
</body>
</html>
