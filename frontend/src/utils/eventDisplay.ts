export function formatEventLabel(gameType: string, playFormat: string): string {
  return `${gameType} — ${playFormat}`;
}

export function buildEventDescription(
  gameType: string,
  playFormat: string,
  playerCapacity: number,
  minPlayers?: number,
  showMinPlayers?: boolean,
): string {
  let desc = `${formatEventLabel(gameType, playFormat)} trading card event. Capacity: ${playerCapacity} players.`;
  if (showMinPlayers && minPlayers !== undefined) {
    desc += ` Minimum ${minPlayers} players required.`;
  }
  return desc;
}
