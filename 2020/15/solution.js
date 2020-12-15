const input = [11, 18, 0, 20, 1, 7, 16];
//const input = [2, 3, 1];
// If that was the first time the number has been spoken, the current player says 0.
// Otherwise, the number had been spoken before; the current player announces how
// many turns apart the number is from when it was previously spoken.
const result = [...input];
let last = input.slice(-1).pop();
for (let i = input.length; i < 2020; i++) {
  let thisTurn = 0;
  const lastTimeSaid = result
    .map((item, index) => {
      if (last === item) {
        return index;
      }
      return null;
    })
    .filter((item) => item !== null);
  // console.log(lastTimeSaid);
  if (lastTimeSaid.length > 1) {
    const [timeBefore, last] = lastTimeSaid.slice(-2);
    thisTurn = last - timeBefore;
  }
  last = thisTurn;
  result.push(thisTurn);
  // console.log(result);
}

console.log(result.slice(-1).pop());
