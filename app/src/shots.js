export function sceneForQuery(query) {
  const scene = query.get('shot') || 'editor';
  const requested = query.get('photo');
  const photo = ['pier', 'boulevard'].includes(requested) ? requested : (scene === 'cover' || scene === 'cover-square' ? 'boulevard' : 'pier');
  const alternate = photo === 'pier' ? 'boulevard' : 'pier';
  const caption = query.get('caption') || (scene === 'cover' ? 'BOULEVARD QUEEN' : scene === 'cover-square' ? 'NEON DRIVE' : 'SUNSET HEIST');
  const base = { scene, caption, titlePosition: 'bottom' };
  if (scene === 'cover') return { ...base, assignments: [photo, alternate, photo], layout: 'trio', size: 'wide', grade: 'sunset', tagline: 'THE CITY NEVER SLEEPS', pans: [{ zoom: 3.2, panX: -.5, panY: -.22 }, { panY: -.34 }, { panY: .35 }] };
  if (scene === 'cover-portrait') return { ...base, assignments: [alternate, photo, photo, alternate, alternate], layout: 'key', size: 'portrait', grade: 'sunset', tagline: 'A NIGHT TO REMEMBER', sunPosition: 'off', pans: { 3: { panX: .31 } } };
  if (scene === 'cover-square') return { ...base, assignments: [photo, alternate], layout: 'duo', size: 'square', grade: 'neon', tagline: 'CHASE THE AFTERGLOW' };
  return { ...base, scene: 'editor', samples: [photo, alternate], assignments: Array(5).fill(photo), layout: 'key', size: 'square', grade: 'sunset', tagline: 'A NIGHT TO REMEMBER', pans: { 3: { panX: .14 } } };
}

export function isCoverScene(scene) {
  return scene !== 'editor' && scene !== 'selftest';
}
