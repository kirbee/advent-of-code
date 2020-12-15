const input = [11, 18, 0, 20, 1, 7, 16];

const getNthSpoken = (startingNumbers, n) => {
  const lastSaid = {};

  const addToLastSaid = (number, turn) => {
    if (lastSaid[number]) {
      if (lastSaid[number].length === 2) {
        const [timeBefore, mostRecent] = lastSaid[number];
        lastSaid[number] = [mostRecent, turn];
      } else {
        lastSaid[number] = [...lastSaid[number], turn];
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
    if (i % 100000 === 0) console.log(i, last, Object.keys(lastSaid).length);
  }
  return last;
};

console.log('Part 1:', getNthSpoken(input, 2020));
// This takes forever, presumably because I'm storing a trillion keys in a single object
console.log('Part 2:', getNthSpoken(input, 30000000));
