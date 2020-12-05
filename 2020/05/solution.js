const fs = require('fs');
const readline = require('readline');

async function parseSeatsAndFindMissing() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Generate all possible seats and their ids
  const missingSeats = {};
  for (let i = 0; i < 128; i++) {
    for (let ii = 0; ii < 8; ii++) {
      missingSeats[i * 8 + ii] = [i, ii];
    }
  }

  let maxSeatId = 0;

  for await (const line of rl) {
    let rowArray = [...Array(128).keys()];
    const seat = line;

    // Parse the rows
    for (let i = 0; i < 7; i++) {
      if (seat[i] === 'F') {
        rowArray = rowArray.slice(0, rowArray.length / 2);
      } else {
        rowArray = rowArray.slice(rowArray.length / 2);
      }
    }

    // Parse the columns
    let colArray = [...Array(8).keys()];
    for (let i = 7; i < 10; i++) {
      if (seat[i] === 'R') {
        colArray = colArray.slice(colArray.length / 2);
      } else {
        // L (keep lower)
        colArray = colArray.slice(0, colArray.length / 2);
      }
    }

    const [row] = rowArray;
    const [col] = colArray;

    seatId = row * 8 + col;
    if (seatId > maxSeatId) {
      maxSeatId = seatId;
    }

    missingSeats[seatId] = false;
  }

  const mySeatId = Object.keys(missingSeats)
    .filter((id) => missingSeats[id] !== false)
    .filter((testId) => {
      const intId = parseInt(testId, 10);
      return !missingSeats[intId + 1] && !missingSeats[intId - 1];
    });

  return [maxSeatId, mySeatId];
}

parseSeatsAndFindMissing().then((answer) => {
  [maxSeatId, mySeatId] = answer;
  console.log(`Part 1: ${maxSeatId}`);
  console.log(`Part 2 ${mySeatId}`);
});
