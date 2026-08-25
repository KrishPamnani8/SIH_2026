/**
 * Canvas utility to render synthetic high-fidelity satellite imagery for demo modes.
 * Generates realistic earth observation visuals, SAR backscatter patterns, segmentation masks, and change heatmaps.
 */

export function renderOpticalSatelliteScene(
  canvas: HTMLCanvasElement,
  _mode: 'single' | 'cross_modal' | 'bi_temporal',
  isT2: boolean = false,
  cloudCover: number = 20
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Base background (Land terrain color)
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  if (isT2) {
    baseGrad.addColorStop(0, '#1c3d27');
    baseGrad.addColorStop(0.5, '#2e4c34');
    baseGrad.addColorStop(1, '#3b3223');
  } else {
    baseGrad.addColorStop(0, '#1b3b24');
    baseGrad.addColorStop(0.5, '#2d4b31');
    baseGrad.addColorStop(1, '#382f1f');
  }
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Agricultural fields grid
  ctx.fillStyle = isT2 ? 'rgba(74, 124, 89, 0.4)' : 'rgba(56, 102, 65, 0.4)';
  for (let x = 40; x < width * 0.45; x += 60) {
    for (let y = 40; y < height * 0.45; y += 50) {
      ctx.fillRect(x, y, 50, 40);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeRect(x, y, 50, 40);
    }
  }

  // Winding River / Water Body
  ctx.beginPath();
  ctx.moveTo(0, height * 0.3);
  ctx.bezierCurveTo(width * 0.3, height * 0.25, width * 0.4, height * 0.6, width * 0.85, height * 0.55);
  ctx.bezierCurveTo(width * 0.95, height * 0.53, width, height * 0.7, width, height * 0.85);
  ctx.lineTo(width, height);
  ctx.lineTo(width * 0.7, height);
  ctx.bezierCurveTo(width * 0.5, height * 0.75, width * 0.2, height * 0.45, 0, height * 0.5);
  ctx.closePath();

  const waterGrad = ctx.createLinearGradient(0, height * 0.3, width, height);
  waterGrad.addColorStop(0, '#0c4a6e');
  waterGrad.addColorStop(0.5, '#0284c7');
  waterGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = waterGrad;
  ctx.fill();

  // Dense Forest / Vegetation Cluster
  ctx.beginPath();
  ctx.ellipse(width * 0.25, height * 0.75, 120, 90, Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = '#065f46';
  ctx.fill();

  // Secondary Forest Patch
  ctx.beginPath();
  ctx.ellipse(width * 0.75, height * 0.25, 90, 70, Math.PI / 6, 0, Math.PI * 2);
  ctx.fillStyle = '#047857';
  ctx.fill();

  // Urban Fabric (Road network & Building blocks)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width * 0.45, 0);
  ctx.lineTo(width * 0.55, height);
  ctx.moveTo(width * 0.3, height * 0.15);
  ctx.lineTo(width * 0.85, height * 0.2);
  ctx.stroke();

  // Building blocks (More buildings in T2 if bi_temporal)
  const buildingCount = isT2 ? 35 : 20;
  ctx.fillStyle = isT2 ? '#94a3b8' : '#64748b';
  for (let i = 0; i < buildingCount; i++) {
    const bx = width * 0.48 + ((i * 19) % (width * 0.35));
    const by = height * 0.18 + ((i * 23) % (height * 0.4));
    ctx.fillRect(bx, by, 12, 10);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.strokeRect(bx, by, 12, 10);
  }

  // Cloud Canopy Layer (Simulates optical obscuration)
  if (cloudCover > 5) {
    ctx.save();
    ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;

    // Draw fluffy cloud formations over top left & center
    ctx.beginPath();
    ctx.arc(width * 0.35, height * 0.3, 75, 0, Math.PI * 2);
    ctx.arc(width * 0.45, height * 0.28, 90, 0, Math.PI * 2);
    ctx.arc(width * 0.52, height * 0.34, 65, 0, Math.PI * 2);
    ctx.fill();

    if (cloudCover > 30) {
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.45, 80, 0, Math.PI * 2);
      ctx.arc(width * 0.28, height * 0.52, 70, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function renderSARSatelliteScene(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // SAR Radar background (Grayscale backscatter values in dB)
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, width, height);

  // Generate SAR Speckle noise texture
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);

    // Calculate simulated SAR backscatter intensity
    let val = 40 + Math.random() * 30; // background speckle

    // Water body specular reflection -> low backscatter (Dark)
    const isWater = (y > height * 0.3 && y < height * 0.85 && x > width * 0.35 && x < width * 0.8);
    if (isWater) {
      val = 15 + Math.random() * 15;
    }

    // Urban structures -> double bounce corner reflections (Very Bright)
    const isUrban = (x > width * 0.45 && x < width * 0.85 && y > height * 0.15 && y < height * 0.6);
    if (isUrban && (x % 16 < 8 && y % 16 < 8)) {
      val = 210 + Math.random() * 45;
    }

    // Forest canopy -> volume scattering (Medium grey)
    const isForest = (Math.pow(x - width * 0.25, 2) + Math.pow(y - height * 0.75, 2) < 8000);
    if (isForest) {
      val = 90 + Math.random() * 40;
    }

    data[i] = val; // R
    data[i + 1] = val + 5; // G (slight greenish tint for SAR VV/VH composite)
    data[i + 2] = val + 10; // B
    data[i + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);

  // Overlay SAR annotation overlay line
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, width - 20, height - 20);
}

export function renderSegmentationMaskScene(canvas: HTMLCanvasElement, opacity: number = 0.65) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = opacity;

  // CORINE Land Cover Colors:
  // Water: #0284C7
  // Dense Veg: #10B981
  // Urban: #F43F5E
  // Agriculture: #F59E0B
  // Bare Soil: #D97706

  // 1. Water
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.3);
  ctx.bezierCurveTo(width * 0.3, height * 0.25, width * 0.4, height * 0.6, width * 0.85, height * 0.55);
  ctx.bezierCurveTo(width * 0.95, height * 0.53, width, height * 0.7, width, height * 0.85);
  ctx.lineTo(width, height);
  ctx.lineTo(width * 0.7, height);
  ctx.bezierCurveTo(width * 0.5, height * 0.75, width * 0.2, height * 0.45, 0, height * 0.5);
  ctx.closePath();
  ctx.fill();

  // 2. Dense Veg
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.ellipse(width * 0.25, height * 0.75, 125, 95, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(width * 0.75, height * 0.25, 95, 75, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // 3. Agriculture
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(40, 40, width * 0.38, height * 0.38);

  // 4. Urban
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(width * 0.45, height * 0.15, width * 0.4, height * 0.35);

  // 5. Bare Soil
  ctx.fillStyle = '#d97706';
  ctx.fillRect(width * 0.05, height * 0.52, width * 0.25, height * 0.18);

  ctx.globalAlpha = 1.0;
}

export function renderChangeHeatmapScene(canvas: HTMLCanvasElement, opacity: number = 0.7) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = opacity;

  // Highlighting Urban Expansion (Red Δ)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
  for (let i = 0; i < 15; i++) {
    const cx = width * 0.52 + (i * 17) % (width * 0.3);
    const cy = height * 0.22 + (i * 19) % (height * 0.25);
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Highlighting Water / Flood Gain (Blue Δ)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.beginPath();
  ctx.ellipse(width * 0.6, height * 0.65, 70, 40, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  // Vegetation Loss (Orange Δ)
  ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.beginPath();
  ctx.ellipse(width * 0.32, height * 0.72, 45, 30, Math.PI / 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1.0;
}
