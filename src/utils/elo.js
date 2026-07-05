const k = 32;

function calcEloChange(winnerElo,loserElo){
    const expectedWinner = 1/(1+Math.pow(10,(loserElo-winnerElo)/400));

    const eloChange = Math.round(k*(1-expectedWinner));

    return eloChange;
}

module.exports = {calcEloChange};