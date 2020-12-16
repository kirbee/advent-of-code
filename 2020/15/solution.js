const input = [11, 18, 0, 20, 1, 7, 16];

const getNthSpoken = (startingNumbers, n) => {
  const lastSaid = {};

  const addToLastSaid = (number, turn) => {
    const lastSaidValue = lastSaid[number];
    if (lastSaidValue) {
      if (lastSaidValue.length === 2) {
        const [timeBefore, mostRecent] = lastSaidValue;
        lastSaid[number] = [mostRecent, turn];
      } else {
        lastSaid[number] = [...lastSaidValue, turn];
      }
    } else {
      lastSaid[number] = [turn];
    }
  };

  startingNumbers.forEach((item, i) => addToLastSaid(item, i));

  let last = startingNumbers.slice(-1).pop();
  for (let i = startingNumbers.length; i < n; i++) {
    let thisTurn = 0;
    if (lastSaid[last].length == 2) {
      const [timeBefore, lastTime] = lastSaid[last];
      thisTurn = lastTime - timeBefore;
    }
    addToLastSaid(thisTurn, i);
    last = thisTurn;
  }
  return last;
};

const getNthSpokenMap = (startingNumbers, n) => {
  const lastSaid = new Map();

  const addToLastSaid = (number, turn) => {
    const lastSaidValue = lastSaid.get(number);
    if (lastSaidValue) {
      if (lastSaidValue.length === 2) {
        const [timeBefore, mostRecent] = lastSaidValue;
        lastSaid.set(number, [mostRecent, turn]);
      } else {
        lastSaid.set(number, [...lastSaidValue, turn]);
      }
    } else {
      lastSaid.set(number, [turn]);
    }
  };

  startingNumbers.forEach((item, i) => addToLastSaid(item, i));

  let last = startingNumbers.slice(-1).pop();
  for (let i = startingNumbers.length; i < n; i++) {
    let thisTurn = 0;
    const lastSaidValue = lastSaid.get(last);
    if (lastSaidValue.length == 2) {
      const [timeBefore, lastTime] = lastSaidValue;
      thisTurn = lastTime - timeBefore;
    }
    addToLastSaid(thisTurn, i);
    last = thisTurn;
  }
  return last;
};

console.log('Part 1:', getNthSpoken(input, 2020));

// This takes forever, presumably because I'm storing a trillion keys in a single object
// ~500s
console.time('object');
console.log('Part 2:', getNthSpoken(input, 30000000));
console.timeEnd('object');

// Yes, the map is much faster (~30s)
console.time('map');
console.log('Part 2:', getNthSpokenMap(input, 30000000));
console.timeEnd('map');
