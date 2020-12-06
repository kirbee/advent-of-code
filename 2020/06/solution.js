const fs = require('fs');
const readline = require('readline');

/**
 * Takes in an array of answers, returns the length of answers that are
 * found in all
 * @param {Array} groupAnswerArray
 * @returns {number}
 */
const countConsensusYesses = (groupAnswerArray) => {
  // Deal with group answers - "consensus" yesses only
  const consensusYesses = groupAnswerArray.reduce(
    (acc, personAnswer, index) => {
      if (index === 0) {
        return personAnswer;
      } else {
        let newAcc = acc;
        acc.split('').forEach((currentConsensusQuestion) => {
          if (personAnswer.indexOf(currentConsensusQuestion) === -1) {
            // This person doesn't have consensus on this answer, so remove
            newAcc = newAcc.split(currentConsensusQuestion).join('');
          }
        });
        return newAcc;
      }
    },
    ''
  );
  return consensusYesses.length;
};

async function parseQuestionnaire() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Add up our totals
  let numYesses = 0; // Part 1
  let numConsensusYesses = 0; // Part 2

  // Place to store the current group's info
  let groupYesses = new Set();
  let answerArr = [];

  for await (const line of rl) {
    if (line === '') {
      // end of group, let's add 'em up

      // Deal with number of total yesses
      numYesses += groupYesses.size;
      groupYesses = new Set();

      // Deal with consensus yesses
      numConsensusYesses += countConsensusYesses(answerArr);
      answerArr = [];
    } else {
      line.split('').forEach((char) => groupYesses.add(char));
      answerArr.push(line);
    }
  }
  // Add the last ones after exiting the loop
  numYesses += groupYesses.size;
  numConsensusYesses += countConsensusYesses(answerArr);

  return [numYesses, numConsensusYesses];
}

parseQuestionnaire().then((answer) => {
  console.log(`Part 1: ${answer[0]}`);
  console.log(`Part 2: ${answer[1]}`);
});
