const fs = require('fs');
const readline = require('readline');

const EMPTY_SEAT = 'L';
const FILLED_SEAT = '#';
const FLOOR = '.';

const [one, two, inputFile] = process.argv;
const fileName = inputFile || 'input';

async function getSeatLayout() {
  const fileStream = fs.createReadStream(`./${fileName}.txt`);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const seats = [];

  for await (const line of rl) {
    seats.push(line.split(''));
  }

  return seats;
}

const getNumberAdjecentOccupiedSeats = (
  rowBefore,
  seatRow,
  rowAfter,
  seatIndex
) => {
  let result = 0;
  const minIndex = seatIndex - 1 > 0 ? seatIndex - 1 : 0;
  const maxIndex = seatIndex + 1;

  [rowBefore, rowAfter].forEach((row) => {
    if (row) {
      result += row
        .slice(minIndex, maxIndex + 1)
        .filter((char) => char === FILLED_SEAT).length;
    }
  });

  result += [seatIndex + 1, seatIndex - 1].reduce((acc, adjacentSeatIndex) => {
    return acc + countFilledSeat(seatRow[adjacentSeatIndex]);
  }, 0);

  return result;
};

const generateListOfVisibleSeats = (layout) => {
  return layout.map((row, rowIndex, wholeLayout) => {
    return row.map((seat, seatIndex, wholeRow) => {
      return getSeatsVisibleFromSeat(layout, rowIndex, seatIndex);
    });
  });
};

const getSeatsVisibleFromSeat = (layout, seatRow, seatIndex) => {
  const result = [];
  const rowLength = layout[0].length;
  const colLength = layout.length;

  const directions = {
    NORTH: [0, -1],
    SOUTH: [0, 1],
    EAST: [1, 0],
    WEST: [-1, 0],
    NE: [1, -1],
    SE: [1, 1],
    SW: [-1, 1],
    NW: [-1, -1],
  };

  const validSeat = (seatIndex, i, xFactor, yFactor) => {
    const x = seatIndex + i * xFactor;
    const y = seatRow + i * yFactor;
    return x < rowLength && x >= 0 && y < colLength && y >= 0;
  };

  Object.keys(directions).forEach((direction) => {
    const [xFactor, yFactor] = directions[direction];
    for (let i = 1; validSeat(seatIndex, i, xFactor, yFactor); i++) {
      const newX = seatIndex + i * xFactor;
      const newY = seatRow + i * yFactor;
      const currSeat = layout[newY][newX];
      if (isSeat(currSeat)) {
        result.push({ x: newX, y: newY });
        break;
      }
    }
  });

  return result;
};

const isSeat = (seat) => seat === FILLED_SEAT || seat === EMPTY_SEAT;

const countFilledSeat = (seat) => (seat && seat === FILLED_SEAT ? 1 : 0);

const getCountStableAdjecent = (layout) => {
  let prevHash;
  let currentLayout = layout;
  let unstable = true;

  while (true) {
    const newMap = currentLayout.map((row, rowIndex, wholeLayout) => {
      return row.map((seat, seatIndex, wholeRow) => {
        if (seat === FLOOR) return FLOOR;
        const numAdjacent = getNumberAdjecentOccupiedSeats(
          wholeLayout[rowIndex - 1] || [],
          wholeRow,
          wholeLayout[rowIndex + 1] || [],
          seatIndex
        );
        if (seat === EMPTY_SEAT) {
          return numAdjacent === 0 ? FILLED_SEAT : EMPTY_SEAT;
        } else {
          return numAdjacent >= 4 ? EMPTY_SEAT : FILLED_SEAT;
        }
      });
    });
    const newHash = newMap.toString();
    currentLayout = newMap;
    if (newHash === prevHash) {
      break;
    } else {
      prevHash = newHash;
    }
  }

  return currentLayout.reduce(
    (acc, row) => (acc += row.filter((item) => item === FILLED_SEAT).length),
    0
  );
};

const getCountStableVisible = (layout) => {
  const seatsVisibleFromMap = generateListOfVisibleSeats(layout);

  let prevHash;
  let currentLayout = layout;

  while (true) {
    const newMap = currentLayout.map((row, rowIndex, wholeLayout) => {
      return row.map((seat, seatIndex, wholeRow) => {
        if (seat === FLOOR) return FLOOR;
        const numVisible = seatsVisibleFromMap[rowIndex][seatIndex]
          .map((position) => {
            const { x, y } = position;
            return countFilledSeat(currentLayout[y][x]);
          })
          .reduce((acc, value) => acc + value, 0);
        if (seat === EMPTY_SEAT) {
          return numVisible === 0 ? FILLED_SEAT : EMPTY_SEAT;
        } else {
          return numVisible >= 5 ? EMPTY_SEAT : FILLED_SEAT;
        }
      });
    });
    const newHash = newMap.toString();
    currentLayout = newMap;
    if (newHash === prevHash) {
      break;
    }

    prevHash = newHash;
  }

  return currentLayout.reduce(
    (acc, row) => (acc += row.filter((item) => item === FILLED_SEAT).length),
    0
  );
};

// If a seat is empty (L) and there are no occupied seats adjacent to
// it, the seat becomes occupied.
// If a seat is occupied (#) and four or more seats adjacent to it are
// also occupied, the seat becomes empty.
getSeatLayout().then((layout) => {
  const countStableAdjacent = getCountStableAdjecent(layout);
  const countVisibleStable = getCountStableVisible(layout);
  console.log(
    `Part 1: ${countStableAdjacent}`,
    `Part 2: ${countVisibleStable}`
  );
});
