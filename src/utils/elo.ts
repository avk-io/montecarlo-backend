const K = 32;

export function calcEloChange(
    winnerElo: number,
    loserElo: number
): number {
    const expectedWinner =
        1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));

    const eloChange = Math.round(K * (1 - expectedWinner));

    return eloChange;
}