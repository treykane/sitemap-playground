function parseRobots(body) {
  const disallow = [];
  const lines = body.split(/\r?\n/);
  let applies = false;

  for (const rawLine of lines) {
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;

    const [keyRaw, ...rest] = line.split(':');
    const key = keyRaw.trim().toLowerCase();
    const value = rest.join(':').trim();

    if (key === 'user-agent') {
      applies = value === '*';
      continue;
    }

    if (key === 'disallow' && applies && value) {
      disallow.push(value);
    }
  }

  return disallow;
}

module.exports = {
  parseRobots
};
