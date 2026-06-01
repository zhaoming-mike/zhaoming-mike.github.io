function initCanvas() {
  if (state.drawing) state.drawing.destroy();

  const img = document.getElementById('modalImage');
  const saveData = state.drawState[state.currentMapId];

  const drawing = new MapDrawing(canvas, canvasWrap, {
    onLoad: () => {
      if (saveData && saveData.ops.length) {
        drawing.loadOps(saveData.ops);
      }
    }
  });
  state.drawing = drawing;

  const resize = () => {
    const rect = canvasWrap.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawing.render();
  };

  img.addEventListener('load', resize);
  if (img.complete) resize();
  window.addEventListener('resize', resize);
  drawing._resizeHandler = resize;
}

function undoDraw() {
  if (state.drawing) state.drawing.undo();
}

class MapDrawing {
  constructor(canvas, container, opts = {}) {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d');
    this.ops = [];
    this.tool = null;
    this.dragging = false;
    this.startX = 0;
    this.startY = 0;
    this.curX = 0;
    this.curY = 0;
    this._bind();
    if (opts.onLoad) opts.onLoad();
  }

  _bind() {
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this.canvas.addEventListener('mousedown', this._onDown);
    this.canvas.addEventListener('mousemove', this._onMove);
    this.canvas.addEventListener('mouseup', this._onUp);
  }

  _pos(e) {
    const r = this.canvas.getBoundingClientRect();
    const sx = this.canvas.width / r.width;
    const sy = this.canvas.height / r.height;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  }

  _onDown(e) {
    const p = this._pos(e);
    if (this.tool === 'eraser') {
      this.eraseAt(p.x, p.y);
      return;
    }
    if (this.tool === 'text') {
      const text = prompt('输入文字标注:');
      if (text && text.trim()) this.addText(p.x, p.y, text.trim(), '#ffffff');
      return;
    }
    if (!this.tool) return;
    this.dragging = true;
    this.startX = p.x;
    this.startY = p.y;
    this.curX = p.x;
    this.curY = p.y;
  }

  _onMove(e) {
    if (!this.dragging) return;
    const p = this._pos(e);
    this.curX = p.x;
    this.curY = p.y;
    this.render();
    this._drawPreview();
  }

  _onUp(e) {
    if (!this.dragging) return;
    this.dragging = false;
    const p = this._pos(e);
    const dx = p.x - this.startX;
    const dy = p.y - this.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;
    this.ops.push({
      tool: this.tool,
      x1: this.startX, y1: this.startY,
      x2: p.x, y2: p.y
    });
    this._save();
    this.render();
  }

  _drawPreview() {
    const ctx = this.ctx;
    this._drawOp(ctx, {
      tool: this.tool,
      x1: this.startX, y1: this.startY,
      x2: this.curX, y2: this.curY
    });
  }

  _drawOp(ctx, op) {
    const isRed = op.tool.includes('red');
    ctx.strokeStyle = isRed ? '#e05555' : '#55b855';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    if (op.tool.startsWith('arrow')) {
      ctx.beginPath();
      ctx.moveTo(op.x1, op.y1);
      ctx.lineTo(op.x2, op.y2);
      ctx.stroke();
      const angle = Math.atan2(op.y2 - op.y1, op.x2 - op.x1);
      const len = 14;
      ctx.beginPath();
      ctx.moveTo(op.x2, op.y2);
      ctx.lineTo(op.x2 - len * Math.cos(angle - 0.45), op.y2 - len * Math.sin(angle - 0.45));
      ctx.lineTo(op.x2 - len * Math.cos(angle + 0.45), op.y2 - len * Math.sin(angle + 0.45));
      ctx.closePath();
      ctx.fill();
    } else if (op.tool.startsWith('circle')) {
      const rx = Math.abs(op.x2 - op.x1) / 2;
      const ry = Math.abs(op.y2 - op.y1) / 2;
      const cx = (op.x1 + op.x2) / 2;
      const cy = (op.y1 + op.y2) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ops.forEach(op => {
      if (op.tool === 'text-label') {
        ctx.fillStyle = op.color;
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(op.text, op.x, op.y);
      } else {
        this._drawOp(ctx, op);
      }
    });
  }

  setTool(tool) { this.tool = tool; }

  addText(x, y, text, color) {
    this.ops.push({ tool: 'text-label', x, y, text, color: color || '#ffffff' });
    this._save();
    this.render();
  }

  eraseAt(x, y) {
    const hitIdx = this.ops.findLastIndex(op => {
      if (op.tool === 'text-label') {
        return Math.abs(op.x - x) < 20 && Math.abs(op.y - y) < 20;
      }
      const cx = (op.x1 + op.x2) / 2;
      const cy = (op.y1 + op.y2) / 2;
      return Math.abs(cx - x) < 15 && Math.abs(cy - y) < 15;
    });
    if (hitIdx >= 0) {
      this.ops.splice(hitIdx, 1);
      this._save();
      this.render();
    }
  }

  undo() {
    this.ops.pop();
    this._save();
    this.render();
  }

  _save() {
    state.drawState[state.currentMapId] = { ops: [...this.ops] };
  }

  loadOps(ops) { this.ops = ops; this.render(); }
  getOps() { return this.ops; }

  destroy() {
    this.canvas.removeEventListener('mousedown', this._onDown);
    this.canvas.removeEventListener('mousemove', this._onMove);
    this.canvas.removeEventListener('mouseup', this._onUp);
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
