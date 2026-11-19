const GRADES = {
  sunset: { top: 'rgba(255,145,86,.20)', bottom: 'rgba(93,22,117,.67)', edge: '#ff7b85', sun: '#ffd18a' },
  neon: { top: 'rgba(12,89,156,.29)', bottom: 'rgba(229,28,140,.65)', edge: '#62e7e0', sun: '#ff91bf' },
  candy: { top: 'rgba(255,204,127,.26)', bottom: 'rgba(144,47,173,.58)', edge: '#ffc7b0', sun: '#fff1b2' },
  noir: { top: 'rgba(118,72,78,.18)', bottom: 'rgba(13,20,49,.72)', edge: '#d39b9c', sun: '#e4bf9b' },
};

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

function drawSun(context, width, height, grade) {
  const portrait = height > width;
  const square = width === height;
  const centerX = width * (portrait ? .68 : square ? .60 : .82);
  const centerY = height * (portrait ? .10 : square ? .12 : .12);
  const radius = Math.min(width, height) * (portrait ? .052 : square ? .06 : .065);
  context.save();
  context.globalCompositeOperation = 'screen';
  const glow = context.createRadialGradient(centerX, centerY, radius * .2, centerX, centerY, radius * 1.65);
  glow.addColorStop(0, `${grade.sun}aa`);
  glow.addColorStop(.55, `${grade.sun}22`);
  glow.addColorStop(1, `${grade.sun}00`);
  context.fillStyle = glow;
  context.fillRect(centerX - radius * 2, centerY - radius * 2, radius * 4, radius * 4);
  context.fillStyle = grade.sun;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = .32;
  context.strokeStyle = '#fff0c8';
  context.lineWidth = Math.max(1, width * .0015);
  for (let ray = 0; ray < 14; ray += 1) {
    const angle = ray * Math.PI / 7;
    context.beginPath();
    context.moveTo(centerX + Math.cos(angle) * radius * 1.22, centerY + Math.sin(angle) * radius * 1.22);
    context.lineTo(centerX + Math.cos(angle) * radius * 1.5, centerY + Math.sin(angle) * radius * 1.5);
    context.stroke();
  }
  context.restore();
}

function drawPalm(context, width, height, side, grade) {
  const baseX = side === 'left' ? width * .02 : width * .98;
  const baseY = height * 1.02;
  const lean = side === 'left' ? 1 : -1;
  context.save();
  context.strokeStyle = 'rgba(17,10,32,.78)';
  context.fillStyle = 'rgba(17,10,32,.78)';
  context.lineCap = 'round';
  context.lineWidth = Math.max(2, width * .008);
  context.beginPath();
  context.moveTo(baseX, baseY);
  context.bezierCurveTo(baseX + lean * width * .015, height * .72, baseX + lean * width * .06, height * .48, baseX + lean * width * .04, height * .30);
  context.stroke();
  const crownX = baseX + lean * width * .04;
  const crownY = height * .30;
  for (let leaf = 0; leaf < 8; leaf += 1) {
    const angle = -Math.PI * .94 + leaf * Math.PI * .27;
    const tipX = crownX + Math.cos(angle) * width * .12;
    const tipY = crownY + Math.sin(angle) * height * .1;
    context.beginPath();
    context.moveTo(crownX, crownY);
    context.quadraticCurveTo(crownX + Math.cos(angle) * width * .055 + lean * width * .02, crownY - height * .05, tipX, tipY);
    context.stroke();
  }
  context.globalAlpha = .2;
  context.strokeStyle = grade.edge;
  context.lineWidth = Math.max(1, width * .002);
  context.beginPath();
  context.moveTo(baseX + lean * width * .01, baseY);
  context.bezierCurveTo(baseX + lean * width * .02, height * .72, baseX + lean * width * .07, height * .48, baseX + lean * width * .05, height * .31);
  context.stroke();
  context.restore();
}

function drawDecoration(context, width, height, state, grade) {
  if (state.effects.sun) drawSun(context, width, height, grade);
  if (state.effects.palms) {
    drawPalm(context, width, height, 'left', grade);
    drawPalm(context, width, height, 'right', grade);
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

function splitTitle(context, title, maxWidth) {
  const words = title.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (!words.length) return ['SUNSET'];
  if (words.length === 1) return words;
  let best = [words.join(' ')];
  let bestDifference = Infinity;
  for (let split = 1; split < words.length; split += 1) {
    const first = words.slice(0, split).join(' ');
    const second = words.slice(split).join(' ');
    const widest = Math.max(context.measureText(first).width, context.measureText(second).width);
    if (widest <= maxWidth && maxWidth - widest < bestDifference) {
      best = [first, second];
      bestDifference = maxWidth - widest;
    }
  }
  return best;
}

function drawLettering(context, width, height, state, grade) {
  const margin = width * .075;
  const maxWidth = width * .77;
  const size = Math.max(38, Math.min(width, height) * state.titleSize / 1000);
  context.save();
  context.font = `${size}px Anton, Impact, sans-serif`;
  context.textBaseline = 'top';
  context.letterSpacing = `${state.letterSpacing}px`;
  const lines = splitTitle(context, state.title, maxWidth);
  const lineHeight = size * .88;
  const titleHeight = lineHeight * lines.length;
  const titleY = state.titlePosition === 'top' ? height * .12 : height - titleHeight - height * .18;
  const titleX = margin;
  if (state.titleGlow) {
    context.shadowColor = state.titleFill === 'pink' ? '#ff3d9a' : '#ff8b80';
    context.shadowBlur = Math.max(8, size * .14);
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
  for (let index = 0; index < lines.length; index += 1) {
    const lineY = titleY + index * lineHeight;
    if (state.titleOutline) {
      context.lineWidth = Math.max(2, size * .035);
      context.strokeStyle = 'rgba(25,10,39,.9)';
      context.strokeText(lines[index], titleX, lineY, maxWidth);
    }
    context.fillText(lines[index], titleX, lineY, maxWidth);
  }
  context.shadowBlur = 0;
  context.font = `${Math.max(13, size * .18)}px Bebas, Arial, sans-serif`;
  context.letterSpacing = `${Math.max(1, state.letterSpacing * .7)}px`;
  context.fillStyle = '#fff4ea';
  context.globalAlpha = .92;
  const tagline = (state.tagline || 'A NIGHT TO REMEMBER').toUpperCase();
  const taglineY = state.titlePosition === 'top' ? titleY + titleHeight + size * .12 : titleY + titleHeight + size * .12;
  context.fillText(tagline, titleX, Math.min(taglineY, height - size * .05), maxWidth);
  context.globalAlpha = 1;
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
  drawLettering(context, width, height, state, grade);
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
