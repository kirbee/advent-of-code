const fs = require('fs');
const readline = require('readline');

const ROW_SIZE = 128;
const COL_SIZE = 8;

const calculateSeatId = (row, col) => row * 8 + col;

async function parseSeatsAndFindMissing() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Generate all possible seats and their ids
  const missingSeats = {};
  for (let i = 0; i < ROW_SIZE; i++) {
    for (let ii = 0; ii < COL_SIZE; ii++) {
      missingSeats[i * 8 + ii] = [i, ii];
    }
  }

  let maxSeatId = 0;

  for await (const line of rl) {
    const seat = line;
    let row, col;

    // Parse the rows
    let rowLow = 0;
    let rowHigh = ROW_SIZE - 1;
    for (let i = 0; i < 7; i++) {
      let middle = Math.floor((rowLow + rowHigh) / 2);
      if (seat[i] === 'F') {
        rowHigh = middle;
      } else {
        rowLow = middle + 1;
      }
    }
    row = rowLow;

    // Parse the columns
    let colLow = 0;
    let colHigh = COL_SIZE - 1;
    for (let i = 7; i < 10; i++) {
      let middle = Math.floor((colLow + colHigh) / 2);
      if (seat[i] === 'R') {
        colLow = middle + 1;
      } else {
        // L (keep lower)
        colHigh = middle;
      }
    }
    col = colLow;

    seatId = calculateSeatId(row, col);
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
