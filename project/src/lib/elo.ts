const K_FACTOR = 32;

export function calculateEloChange(
  winnerRating: number,
  loserRating: number
): number {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  return Math.round(K_FACTOR * (1 - expectedWinner));
}

export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}
