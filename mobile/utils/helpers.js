export function inferCategory(task) {
  const text = (task.title + ' ' + task.description).toLowerCase();
  
  if (text.includes('sunum') || text.includes('tabak') || text.includes('jüri') || text.includes('yerleştir') || text.includes('boşluk')) {
    return 'sunum';
  }
  if (text.includes('masterchef') || text.includes('monolog') || text.includes('rol')) {
    return 'rol';
  }
  if (text.includes('şarkı') || text.includes('dans') || text.includes('gül') || text.includes('tezahürat') || text.includes('komik') || text.includes('anı') || text.includes('tsm') || text.includes('nağme')) {
    return 'eglence';
  }
  return 'dikkat';
}