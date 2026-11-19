export function sceneForQuery(query) {
  const scene = query.get('shot') || 'editor';
  const photo = query.get('photo') || (scene === 'cover' || scene === 'cover-square' ? 'boulevard' : 'pier');
  const caption = query.get('caption') || (scene === 'cover' ? 'BOULEVARD QUEEN' : scene === 'cover-square' ? 'NEON DRIVE' : 'SUNSET HEIST');
  if (scene === 'cover') return { scene, photo, caption, layout: 'trio', size: 'wide', grade: 'sunset', tagline: 'THE CITY NEVER SLEEPS', titlePosition: 'bottom' };
  if (scene === 'cover-portrait') return { scene, photo, caption, layout: 'key', size: 'portrait', grade: 'sunset', tagline: 'A NIGHT TO REMEMBER', titlePosition: 'bottom' };
  if (scene === 'cover-square') return { scene, photo, caption, layout: 'duo', size: 'square', grade: 'neon', tagline: 'CHASE THE AFTERGLOW', titlePosition: 'top' };
  return { scene: 'editor', photo: 'pier', caption, layout: 'key', size: 'square', grade: 'sunset', tagline: 'A NIGHT TO REMEMBER', titlePosition: 'bottom' };
}

export function isCoverScene(scene) {
  return scene !== 'editor' && scene !== 'selftest';
}
