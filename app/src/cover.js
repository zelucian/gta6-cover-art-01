const GRADES = {
  sunset: { top: 'rgba(255,145,86,.20)', bottom: 'rgba(93,22,117,.45)', edge: '#ff7b85', sun: '#ffd18a' },
  neon: { top: 'rgba(12,89,156,.29)', bottom: 'rgba(229,28,140,.44)', edge: '#62e7e0', sun: '#ff91bf' },
  candy: { top: 'rgba(255,204,127,.26)', bottom: 'rgba(144,47,173,.39)', edge: '#ffc7b0', sun: '#fff1b2' },
  noir: { top: 'rgba(118,72,78,.18)', bottom: 'rgba(13,20,49,.48)', edge: '#d39b9c', sun: '#e4bf9b' },
};
const TITLE_PANEL = { key: 2, duo: 0, trio: 2, solo: 0 };
const PALM = new Path2D(`
  M -11 3 C -7 -23 0 -51 17 -71 L 22 -70 C 9 -49 4 -24 4 3 Z
  M 20 -69 C 8 -84 -9 -88 -30 -77 C -10 -80 5 -74 20 -69 Z
  M 20 -69 C 6 -80 -15 -77 -25 -63 C -13 -70 3 -70 20 -69 Z
  M 20 -70 C 18 -83 6 -94 -9 -94 C 2 -89 9 -76 20 -70 Z
  M 19 -70 C 25 -88 42 -93 60 -88 C 43 -88 35 -80 19 -70 Z
  M 19 -70 C 40 -88 75 -84 93 -68 C 67 -79 43 -72 19 -70 Z
  M 19 -70 C 50 -80 87 -70 100 -51 C 81 -62 48 -69 19 -70 Z
  M 19 -71 C 48 -72 64 -59 68 -43 C 53 -56 34 -63 19 -71 Z
  M 18 -71 C 38 -66 41 -52 36 -40 C 33 -55 24 -60 18 -71 Z`);

export function getPanelRects(layout, width, height) {
  const gap = Math.max(7, Math.round(Math.min(width, height) * 0.009));
  if (layout === 'duo') {
    const panelWidth = (width - gap * 3) / 2;
    return [{ x: gap, y: gap, w: panelWidth, h: height - gap * 2 }, { x: panelWidth + gap * 2, y: gap, w: panelWidth, h: height - gap * 2 }];
  }
  if (layout === 'trio') {
    const panelHeight = (height - gap * 4) / 3;
    return [0, 1, 2].map(index => ({ x: gap, y: gap + index * (panelHeight + gap), w: width - gap * 2, h: panelHeight }));
  }
  if (layout === 'solo') return [{ x: gap, y: gap, w: width - gap * 2, h: height - gap * 2 }];
  const sideWidth = width * .225;
  const centerX = sideWidth + gap * 2;
  const centerWidth = width - sideWidth * 2 - gap * 4;
  const smallHeight = (height - gap * 3) / 2;
  return [
    { x: gap, y: gap, w: sideWidth, h: smallHeight },
    { x: gap, y: smallHeight + gap * 2, w: sideWidth, h: smallHeight },
    { x: centerX, y: gap, w: centerWidth, h: height - gap * 2 },
    { x: centerX + centerWidth + gap, y: gap, w: sideWidth, h: smallHeight },
    { x: centerX + centerWidth + gap, y: smallHeight + gap * 2, w: sideWidth, h: smallHeight },
  ];
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawImageCover(context, image, panel, transform) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (!imageWidth || !imageHeight) return;
  const fillScale = Math.max(panel.w / imageWidth, panel.h / imageHeight);
  const fitScale = Math.min(panel.w / imageWidth, panel.h / imageHeight);
  const scale = (transform.fit ? fitScale : fillScale) * transform.zoom;
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = panel.x + (panel.w - drawWidth) / 2 + transform.panX * (panel.w - drawWidth);
  const drawY = panel.y + (panel.h - drawHeight) / 2 + transform.panY * (panel.h - drawHeight);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawPanel(context, panel, image, transform, grade, index) {
  context.save();
  roundedRect(context, panel.x, panel.y, panel.w, panel.h, Math.max(4, panel.w * .008));
  context.clip();
  context.fillStyle = '#21142d';
  context.fillRect(panel.x, panel.y, panel.w, panel.h);
  if (image) drawImageCover(context, image, panel, transform);
  else {
    const placeholder = context.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
    placeholder.addColorStop(0, '#28203d');
    placeholder.addColorStop(1, '#111322');
    context.fillStyle = placeholder;
    context.fillRect(panel.x, panel.y, panel.w, panel.h);
  }
  const shade = context.createLinearGradient(0, panel.y, 0, panel.y + panel.h);
  shade.addColorStop(0, grade.top);
  shade.addColorStop(.48, 'rgba(27,9,45,.06)');
  shade.addColorStop(1, grade.bottom);
  context.fillStyle = shade;
  context.fillRect(panel.x, panel.y, panel.w, panel.h);
  context.fillStyle = index % 2 ? 'rgba(255,164,113,.08)' : 'rgba(105,233,232,.07)';
  context.fillRect(panel.x, panel.y, panel.w, panel.h);
  context.restore();
}

function drawSun(context, width, height, grade, position) {
  const radius = Math.min(width, height) * .026;
  const centerX = width * (position === 'top-left' ? .052 : .948);
  const centerY = radius * 2.2;
  const glowRadius = radius * 1.8;
  context.save();
  const glow = context.createRadialGradient(centerX, centerY, radius * .5, centerX, centerY, glowRadius);
  glow.addColorStop(0, `${grade.sun}70`);
  glow.addColorStop(.55, `${grade.sun}26`);
  glow.addColorStop(1, `${grade.sun}00`);
  context.fillStyle = glow;
  context.fillRect(centerX - glowRadius, centerY - glowRadius, glowRadius * 2, glowRadius * 2);
  context.fillStyle = grade.sun;
  context.globalAlpha = .85;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawPalm(context, width, height, side) {
  const left = side === 'left';
  context.save();
  context.translate(width * (left ? .013 : .993), height * 1.005);
  context.scale(width * (left ? .00092 : -.00106), height * (left ? .00325 : .00305));
  context.fillStyle = 'rgba(18,9,29,.90)';
  context.fill(PALM);
  context.restore();
}

function drawDecoration(context, width, height, state, grade) {
  if (state.sunPosition !== 'off') drawSun(context, width, height, grade, state.sunPosition);
  if (state.effects.palms) {
    drawPalm(context, width, height, 'left');
    drawPalm(context, width, height, 'right');
  }
  context.save();
  context.globalAlpha = .14;
  context.strokeStyle = grade.edge;
  context.lineWidth = Math.max(1, width * .001);
  for (let line = 0; line < 7; line += 1) {
    const y = height * (.58 + line * .045);
    context.beginPath();
    context.moveTo(width * .03, y);
    context.lineTo(width * .97, y - height * .08);
    context.stroke();
  }
  context.restore();
  if (state.effects.grain) {
    context.save();
    context.globalAlpha = .055;
    context.fillStyle = '#fff';
    let seed = 19;
    for (let speck = 0; speck < 2400; speck += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const dotX = (seed / 4294967296) * width;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const dotY = (seed / 4294967296) * height;
      context.fillRect(dotX, dotY, Math.max(1, width * .0007), Math.max(1, width * .0007));
    }
    context.restore();
  }
}

function titleOptions(title) {
  const cleaned = title.trim().toUpperCase() || 'SUNSET';
  const explicitLines = cleaned.split(/\n+/).map(line => line.trim()).filter(Boolean);
  if (explicitLines.length === 2) return [explicitLines];
  const words = cleaned.split(/\s+/);
  return [[words.join(' ')], ...words.slice(1).map((_, index) => [words.slice(0, index + 1).join(' '), words.slice(index + 1).join(' ')])];
}

function measureLine(context, text) {
  const metrics = context.measureText(text);
  return { text, left: metrics.actualBoundingBoxLeft, width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
    ascent: metrics.actualBoundingBoxAscent, height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent };
}

function drawLettering(context, panel, width, height, state) {
  const padX = Math.max(12, Math.min(panel.w * .075, width * .06));
  const padY = Math.max(12, Math.min(panel.h * .10, height * .085));
  const maxWidth = panel.w - padX * 2;
  const maxHeight = Math.min(panel.h - padY * 2, panel.h * .55);
  const desired = Math.min(width, height) * state.titleSize / 1000;
  const options = titleOptions(state.title);
  const tagline = (state.tagline.trim() || 'A NIGHT TO REMEMBER').toUpperCase().replace(/\s+/g, ' ');
  const setTitleFont = size => {
    context.font = `${size}px Anton, Impact, sans-serif`;
    context.letterSpacing = `${state.letterSpacing * size / desired}px`;
  };
  const setTagFont = size => {
    context.font = `${size}px Bebas, Arial, sans-serif`;
    context.letterSpacing = `${Math.max(1, state.letterSpacing * .7) * size / Math.max(13, desired * .22)}px`;
  };
  context.save();
  context.textBaseline = 'alphabetic';
  context.beginPath();
  context.rect(panel.x + 4, panel.y + 4, panel.w - 8, panel.h - 8);
  context.clip();
  let size = desired;
  let tagSize, tag, lines, titleHeight;
  const lineGap = () => size * .11;
  const tagGap = () => Math.max(5, size * .14);
  while (size >= 1) {
    tagSize = Math.max(10, size * .22);
    setTagFont(tagSize);
    tag = measureLine(context, tagline);
    while (tag.width > maxWidth) {
      tagSize *= .92;
      setTagFont(tagSize);
      tag = measureLine(context, tagline);
    }
    setTitleFont(size);
    lines = undefined;
    let narrowest = Infinity;
    for (const option of options) {
      const measured = option.map(line => measureLine(context, line));
      const widest = Math.max(...measured.map(line => line.width));
      const inkHeight = measured.reduce((sum, line) => sum + line.height, 0) + (measured.length - 1) * lineGap();
      if (widest > maxWidth || widest >= narrowest || inkHeight + tagGap() + tag.height > maxHeight) continue;
      lines = measured;
      titleHeight = inkHeight;
      narrowest = widest;
      if (measured.length === 1) break;
    }
    if (lines) break;
    size *= .93;
  }
  if (!lines) { context.restore(); return; }
  const blockHeight = titleHeight + tagGap() + tag.height;
  const titleX = panel.x + padX;
  const titleY = state.titlePosition === 'top' ? panel.y + padY : panel.y + panel.h - padY - blockHeight;
  if (state.titleGlow) {
    context.shadowColor = state.titleFill === 'pink' ? '#ff3d9a' : '#ff8b80';
    context.shadowBlur = Math.min(padX, size * .14);
  }
  if (state.titleFill === 'white') context.fillStyle = '#fff8f0';
  else if (state.titleFill === 'pink') context.fillStyle = '#ff5ca8';
  else {
    const fill = context.createLinearGradient(0, titleY, 0, titleY + titleHeight);
    fill.addColorStop(0, '#fff7e7');
    fill.addColorStop(.42, '#ffbd82');
    fill.addColorStop(1, '#ff619e');
    context.fillStyle = fill;
  }
  let textY = titleY;
  for (const line of lines) {
    if (state.titleOutline) {
      context.lineWidth = Math.max(2, size * .035);
      context.strokeStyle = 'rgba(25,10,39,.9)';
      context.lineJoin = 'round';
      context.strokeText(line.text, titleX + line.left, textY + line.ascent);
    }
    context.fillText(line.text, titleX + line.left, textY + line.ascent);
    textY += line.height + lineGap();
  }
  context.shadowBlur = 0;
  setTagFont(tagSize);
  context.fillStyle = '#fff4ea';
  context.globalAlpha = .92;
  context.fillText(tag.text, titleX + tag.left, titleY + titleHeight + tagGap() + tag.ascent);
  context.restore();
}

export function drawCover(canvas, state, options = {}) {
  const width = canvas.width;
  const height = canvas.height;
  const context = canvas.getContext('2d');
  const grade = GRADES[state.grade] || GRADES.sunset;
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#fff8ef';
  context.fillRect(0, 0, width, height);
  const panels = getPanelRects(state.layout, width, height);
  panels.forEach((panel, index) => drawPanel(context, panel, state.photos[state.assignments[index] ?? 0]?.image, state.transforms[index] || { zoom: 1, panX: 0, panY: 0, fit: false }, grade, index));
  drawDecoration(context, width, height, state, grade);
  drawLettering(context, panels[TITLE_PANEL[state.layout] ?? TITLE_PANEL.key] || panels[0], width, height, state);
  context.save();
  context.strokeStyle = 'rgba(255,248,239,.84)';
  context.lineWidth = Math.max(4, Math.min(width, height) * .007);
  context.strokeRect(context.lineWidth / 2, context.lineWidth / 2, width - context.lineWidth, height - context.lineWidth);
  context.restore();
  if (options.showSelection !== false) {
    const selected = panels[state.selectedPanel];
    if (selected) {
      context.save();
      context.strokeStyle = '#ff6cab';
      context.lineWidth = Math.max(3, Math.min(width, height) * .006);
      context.setLineDash([Math.max(8, width * .012), Math.max(5, width * .006)]);
      context.strokeRect(selected.x + context.lineWidth, selected.y + context.lineWidth, selected.w - context.lineWidth * 2, selected.h - context.lineWidth * 2);
      context.restore();
    }
  }
  return panels;
}
