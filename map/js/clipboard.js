function drawWatermark(ctx, width, height) {
  const text = '北冥有鱼战术板';
  const fontSize = Math.max(14, Math.round(width / 80));
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = `bold ${fontSize}px sans-serif`;
  const m = ctx.measureText(text);
  ctx.fillText(text, 12, height - 12);
}

async function copyToClipboard() {
  const drawing = state.drawing;
  if (!drawing) return;

  const img = document.getElementById('modalImage');
  if (!img.complete) return showToast('图片加载中，请稍候', true);

  const ops = drawing.getOps();

  try {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    if (ops.length) {
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      ops.forEach(op => {
        ctx.strokeStyle = op.tool.includes('red') ? '#e05555' : '#55b855';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        const x1 = op.x1 * scaleX, y1 = op.y1 * scaleY;
        const x2 = op.x2 * scaleX, y2 = op.y2 * scaleY;

        if (op.tool.startsWith('arrow')) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const len = 20;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - len * Math.cos(angle - 0.45), y2 - len * Math.sin(angle - 0.45));
          ctx.lineTo(x2 - len * Math.cos(angle + 0.45), y2 - len * Math.sin(angle + 0.45));
          ctx.closePath();
          ctx.fill();
        } else if (op.tool.startsWith('circle')) {
          const rx = Math.abs(x2 - x1) / 2;
          const ry = Math.abs(y2 - y1) / 2;
          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (op.tool === 'text-label') {
          ctx.fillStyle = op.color;
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(op.text, x1, y1);
        }
      });
    }

    drawWatermark(ctx, c.width, c.height);

    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('已复制到剪贴板');
  } catch {
    showToast('复制失败，请检查浏览器权限', true);
  }
}

function showToast(msg, isError) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  setTimeout(() => t.classList.add('show'), 10);
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2000);
}
