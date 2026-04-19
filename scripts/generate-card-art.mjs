import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const outDir = path.join(root, 'public', 'assets', 'generated');

async function ensureOutDir() {
  await fs.mkdir(outDir, { recursive: true });
}

function sceneScript(kind, width, height) {
  return `
    const canvas = document.getElementById('card');
    const ctx = canvas.getContext('2d');
    const w = ${width};
    const h = ${height};

    function roundRect(x, y, width, height, radius, fillStyle) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    function grain(alpha = 0.06, amount = 2500) {
      for (let i = 0; i < amount; i += 1) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 2.2 + 0.3;
        ctx.fillStyle = \`rgba(255,255,255,\${Math.random() * alpha})\`;
        ctx.fillRect(x, y, size, size);
      }
    }

    function vignette(strength = 0.4) {
      const g = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.15, w * 0.5, h * 0.45, h * 0.9);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, \`rgba(16,18,20,\${strength})\`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    function sky(top, bottom) {
      const g = ctx.createLinearGradient(0, 0, 0, h * 0.62);
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    function sun(x, y, radius, color, glow) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.4);
      g.addColorStop(0, color);
      g.addColorStop(0.3, color);
      g.addColorStop(1, glow);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    function hill(points, fill) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, points[0][1]);
      points.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    function cloud(x, y, scale, alpha) {
      ctx.fillStyle = \`rgba(255,255,255,\${alpha})\`;
      [[0,0,34],[28,-12,22],[54,-4,28],[84,2,22]].forEach(([dx, dy, r]) => {
        ctx.beginPath();
        ctx.arc(x + dx * scale, y + dy * scale, r * scale, 0, Math.PI * 2);
        ctx.fill();
      });
      roundRect(x + 8 * scale, y - 4 * scale, 76 * scale, 24 * scale, 14 * scale, \`rgba(255,255,255,\${alpha})\`);
    }

    function pathRibbon(colorA, colorB, startX, widthA, widthB) {
      const g = ctx.createLinearGradient(0, h * 0.45, 0, h);
      g.addColorStop(0, colorA);
      g.addColorStop(1, colorB);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(startX, h);
      ctx.bezierCurveTo(startX + widthA * 0.12, h * 0.82, startX + widthA * 0.62, h * 0.62, startX + widthA * 0.4, h * 0.46);
      ctx.bezierCurveTo(startX + widthA * 0.22, h * 0.34, startX + widthA * 0.48, h * 0.2, startX + widthB, h * 0.08);
      ctx.lineTo(startX + widthB + 38, h * 0.13);
      ctx.bezierCurveTo(startX + widthA * 0.6, h * 0.28, startX + widthA * 0.42, h * 0.4, startX + widthA * 0.7, h * 0.56);
      ctx.bezierCurveTo(startX + widthA * 0.98, h * 0.73, startX + widthA * 0.46, h * 0.86, startX + 60, h);
      ctx.closePath();
      ctx.fill();
    }

    function torii(x, y, scale) {
      ctx.fillStyle = '#ae6846';
      roundRect(x - 8 * scale, y, 16 * scale, 94 * scale, 8 * scale, '#a76a4b');
      roundRect(x + 72 * scale, y, 16 * scale, 94 * scale, 8 * scale, '#a76a4b');
      roundRect(x - 26 * scale, y - 20 * scale, 126 * scale, 18 * scale, 9 * scale, '#bf7a57');
      roundRect(x - 10 * scale, y - 34 * scale, 94 * scale, 14 * scale, 7 * scale, '#bf7a57');
    }

    function lantern(x, y, scale) {
      roundRect(x - 4 * scale, y, 8 * scale, 56 * scale, 4 * scale, '#7f8e83');
      roundRect(x - 16 * scale, y - 26 * scale, 32 * scale, 26 * scale, 9 * scale, '#f0e2be');
      roundRect(x - 14 * scale, y - 21 * scale, 28 * scale, 20 * scale, 8 * scale, '#f6edd5');
      roundRect(x - 18 * scale, y - 29 * scale, 36 * scale, 5 * scale, 3 * scale, '#92a397');
    }

    function arch(x, y, scale) {
      roundRect(x, y, 20 * scale, 126 * scale, 10 * scale, '#d9b490');
      roundRect(x + 150 * scale, y, 20 * scale, 126 * scale, 10 * scale, '#d9b490');
      roundRect(x - 4 * scale, y - 18 * scale, 178 * scale, 22 * scale, 10 * scale, '#f2e5d2');
    }

    function lemonTree(x, y, scale) {
      roundRect(x - 6 * scale, y, 12 * scale, 80 * scale, 6 * scale, '#8d6b45');
      ctx.fillStyle = '#88a86f';
      ctx.beginPath();
      ctx.ellipse(x, y - 12 * scale, 46 * scale, 34 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f1d46f';
      [[-20,-14],[10,-22],[24,-6]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(x + dx * scale, y + dy * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function palm(x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.18);
      roundRect(-7 * scale, -10 * scale, 14 * scale, 132 * scale, 7 * scale, '#8f633a');
      ctx.restore();
      ctx.fillStyle = '#79a875';
      for (let i = 0; i < 5; i += 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-1.1 + i * 0.55);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12 * scale, -46 * scale, 18 * scale, -88 * scale);
        ctx.quadraticCurveTo(4 * scale, -68 * scale, -8 * scale, -22 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function bowlShadow(x, y, rx, ry, alpha = 0.12) {
      ctx.fillStyle = \`rgba(17, 19, 22, \${alpha})\`;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function japanPostcard() {
      sky('#87cfe7', '#d5ece6');
      sun(w * 0.8, h * 0.18, 44, '#f7e2a1', 'rgba(247,226,161,0)');
      cloud(110, 88, 1.1, 0.6);
      cloud(760, 96, 0.85, 0.52);
      hill([[0, 270],[170,230],[330,250],[520,214],[780,236],[1200,208]], '#b7d2bf');
      hill([[0, 356],[150,334],[350,344],[620,318],[880,336],[1200,320]], '#6f9f79');
      pathRibbon('#f0e5cf', '#e1d2b3', 370, 230, 660);
      torii(214, 286, 1.35);
      torii(420, 356, 0.74);
      lantern(888, 344, 1.2);
      lantern(958, 390, 0.9);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 14; i += 1) {
        ctx.beginPath();
        ctx.arc(120 + i * 70, 480 - Math.sin(i) * 30, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      vignette(0.18);
      grain(0.05, 3200);
    }

    function italyPostcard() {
      sky('#ffd7a7', '#f4eee1');
      sun(w * 0.78, h * 0.18, 46, '#ffe2a1', 'rgba(255,226,161,0)');
      hill([[0, 314],[150,290],[380,304],[620,276],[840,292],[1200,270]], '#cbb18e');
      hill([[0, 382],[160,358],[400,372],[640,338],[900,358],[1200,344]], '#a48568');
      ctx.fillStyle = '#8ec9c8';
      ctx.fillRect(0, 255, w, 86);
      ctx.fillStyle = '#f8efe2';
      ctx.fillRect(0, 338, w, h - 338);
      arch(138, 198, 1.1);
      arch(352, 186, 1.24);
      pathRibbon('#efe1c7', '#dbcbab', 456, 250, 720);
      lemonTree(910, 322, 1.1);
      roundRect(120, 376, 220, 24, 12, '#fff4de');
      roundRect(96, 404, 282, 24, 12, '#fff4de');
      roundRect(74, 432, 330, 24, 12, '#fff4de');
      vignette(0.15);
      grain(0.045, 2800);
    }

    function brazilPostcard() {
      sky('#89d4ef', '#e3f1e8');
      sun(w * 0.16, h * 0.15, 44, '#ffe4a4', 'rgba(255,228,164,0)');
      ctx.fillStyle = '#7fd3d8';
      ctx.fillRect(0, 238, w, 116);
      ctx.fillStyle = '#f0dfb8';
      ctx.fillRect(0, 352, w, h - 352);
      hill([[0, 330],[170,300],[380,324],[600,302],[820,326],[1200,314]], '#93c7c4');
      pathRibbon('#d9a46c', '#b5804d', 230, 340, 820);
      pathRibbon('#f0e3c4', '#e7d2a6', 280, 260, 740);
      palm(940, 350, 1.15);
      palm(1080, 326, 0.88);
      ctx.fillStyle = '#fff4dc';
      roundRect(210, 378, 524, 10, 5, '#fff4dc');
      roundRect(246, 412, 428, 10, 5, '#fff4dc');
      roundRect(290, 446, 354, 10, 5, '#fff4dc');
      vignette(0.14);
      grain(0.045, 2800);
    }

    function onigiriRecipe() {
      sky('#e7efe8', '#f7f3ea');
      sun(w * 0.76, h * 0.2, 34, '#f5e6b0', 'rgba(245,230,176,0)');
      bowlShadow(w * 0.5, h * 0.79, 180, 28);
      roundRect(190, 380, 520, 128, 48, '#fff7ee');
      ctx.fillStyle = '#fffdf9';
      ctx.beginPath();
      ctx.moveTo(450, 182);
      ctx.lineTo(676, 522);
      ctx.lineTo(224, 522);
      ctx.closePath();
      ctx.fill();
      roundRect(404, 422, 92, 92, 24, '#213730');
      ctx.fillStyle = '#dfc37a';
      [[406, 280],[448, 242],[490, 298],[534, 334]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
      });
      vignette(0.12);
      grain(0.05, 2200);
    }

    function pastaRecipe() {
      sky('#f6e7d1', '#faf4ea');
      bowlShadow(w * 0.5, h * 0.8, 190, 30);
      ctx.fillStyle = '#fbf2e5';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, 410, 220, 118, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ebc55f';
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      [[250,410,355,316,462,410],[332,450,450,356,570,450],[420,390,526,298,650,394]].forEach(([sx, sy, cx, cy, ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.stroke();
      });
      ctx.strokeStyle = '#d8a33f';
      ctx.lineWidth = 14;
      [[270,440,378,346,490,438],[364,400,468,320,590,402]].forEach(([sx, sy, cx, cy, ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.stroke();
      });
      ctx.fillStyle = '#8fb06e';
      [[612,308,16],[658,336,12],[576,344,10]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      vignette(0.1);
      grain(0.045, 2100);
    }

    function acaiRecipe() {
      sky('#e6eff4', '#f7f1e8');
      bowlShadow(w * 0.5, h * 0.81, 175, 28);
      ctx.fillStyle = '#efe2cf';
      ctx.beginPath();
      ctx.moveTo(278, 300);
      ctx.lineTo(622, 300);
      ctx.lineTo(560, 520);
      ctx.lineTo(340, 520);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#71466d';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, 302, 172, 56, 0, 0, Math.PI * 2);
      ctx.fill();
      ['#5f335d','#7a4477','#8b5686'].forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(380 + index * 72, 260 + (index % 2) * 18, 52, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#f0d870';
      [[626,256,22],[682,300,18],[590,226,16]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#88aa72';
      ctx.beginPath();
      ctx.moveTo(650, 200);
      ctx.quadraticCurveTo(716, 156, 780, 188);
      ctx.quadraticCurveTo(728, 234, 662, 234);
      ctx.closePath();
      ctx.fill();
      vignette(0.1);
      grain(0.045, 2200);
    }

    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;

    if ('${kind}' === 'japan-postcard') japanPostcard();
    if ('${kind}' === 'italy-postcard') italyPostcard();
    if ('${kind}' === 'brazil-postcard') brazilPostcard();
    if ('${kind}' === 'trail-onigiri') onigiriRecipe();
    if ('${kind}' === 'lemon-route-pasta') pastaRecipe();
    if ('${kind}' === 'acai-route-bowl') acaiRecipe();
  `;
}

async function renderAsset(page, kind, width, height, filename) {
  await page.setViewportSize({ width, height });
  await page.setContent(`
    <!doctype html>
    <html>
      <body style="margin:0;background:#f5efe3;">
        <canvas id="card" width="${width}" height="${height}" style="display:block"></canvas>
      </body>
    </html>
  `);
  await page.evaluate(sceneScript(kind, width, height));
  await page.locator('#card').screenshot({
    path: path.join(outDir, filename),
  });
}

async function main() {
  await ensureOutDir();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await renderAsset(page, 'japan-postcard', 1200, 640, 'japan-postcard.png');
  await renderAsset(page, 'italy-postcard', 1200, 640, 'italy-postcard.png');
  await renderAsset(page, 'brazil-postcard', 1200, 640, 'brazil-postcard.png');
  await renderAsset(page, 'trail-onigiri', 900, 620, 'trail-onigiri.png');
  await renderAsset(page, 'lemon-route-pasta', 900, 620, 'lemon-route-pasta.png');
  await renderAsset(page, 'acai-route-bowl', 900, 620, 'acai-route-bowl.png');

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
