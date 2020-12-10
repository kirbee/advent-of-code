const fs = require('fs');
const readline = require('readline');

const BUILT_IN_ADAPTER_BUFF = 3;
const STARTING_JOLTAGE = 0;

const getAdapterDiffs = (adapterList) => {
  const diffs = adapterList.reduce(
    (acc, curr, index, array) => {
      const [countOneJoltDiffs, countThreeJoltDiffs] = acc;
      const diff = array[index + 1] - curr;
      if (diff === 1) {
        return [countOneJoltDiffs + 1, countThreeJoltDiffs];
      } else if (diff === 3) {
        return [countOneJoltDiffs, countThreeJoltDiffs + 1];
      }
      return acc;
    },
    [0, 0]
  );
  const [countOneJoltDiffs, countThreeJoltDiffs] = diffs;
  return [countOneJoltDiffs, countThreeJoltDiffs + 1]; // Always add the final diff
};

// We can re-use the number of paths from a certain value
const adapterToNumberValidPathsMap = {};
const getAdapterPossibilities = (adapterList, rating) => {
  const [currentAdapter, ...restAdapters] = adapterList;
  if (adapterToNumberValidPathsMap[currentAdapter]) {
    return adapterToNumberValidPathsMap[currentAdapter];
  } else if (adapterList.length === 1) {
    return Boolean(adapterList[0] === rating);
  }

  const possibleAdapters = restAdapters
    .slice(0, 3)
    .filter((adapter) => adapter - currentAdapter <= 3);

  const answer = possibleAdapters.reduce((acc, _, index) => {
    return acc + getAdapterPossibilities(restAdapters.slice(index), rating);
  }, 0);
  adapterToNumberValidPathsMap[currentAdapter] = answer;

  return answer;
};

async function doJoltage() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const adapters = [STARTING_JOLTAGE];

  for await (const line of rl) {
    adapters.push(parseInt(line, 10));
  }
  adapters.sort((a, b) => a - b);
  const rating = adapters[adapters.length - 1] + BUILT_IN_ADAPTER_BUFF;

  const diffs = getAdapterDiffs(adapters);
  const [countOneJoltDiffs, countThreeJoltDiffs] = diffs;

  const arrangements = getAdapterPossibilities([...adapters, rating], rating);

  return [countOneJoltDiffs * countThreeJoltDiffs, arrangements];
}

doJoltage().then((answer) => {
  console.log(`Part 1: ${answer[0]}`);
  console.log(`Part 2: ${answer[1]}`);
});
