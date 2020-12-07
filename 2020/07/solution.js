const { Console } = require('console');
const fs = require('fs');
const readline = require('readline');

/**
 * Takes in an array of answers, returns the length of answers that are
 * found in all
 * @param {Array} groupAnswerArray
 * @returns {number}
 */
async function parseBagRules() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const bagRules = {};

  const findBagsWithGivenChild = (bagName, bagToFind, curr = []) => {
    let hasValidChildren = false;
    const [childBagNames] = bagRules[bagName];
    if (childBagNames) {
      if (childBagNames.includes(bagToFind)) {
        hasValidChildren = true;
        curr.push(bagName);
      } else {
        childBagNames.forEach((childBagName) => {
          if (findBagsWithGivenChild(childBagName, bagToFind, curr)) {
            curr.push(childBagName);
            hasValidChildren = true;
          }
        });
      }
      return hasValidChildren && curr;
    }
    return false;
  };

  const countNumberOfChildren = (bagName, curr = 0) => {
    const [childBagNames, childBagNumbers] = bagRules[bagName];
    curr += childBagNumbers.reduce((acc, number) => number + acc, 0);
    if (childBagNames) {
      childBagNames.forEach((childBagName, index) => {
        curr += childBagNumbers[index] * countNumberOfChildren(childBagName);
      });
    }
    return curr;
  };

  const calculateValidOuterBags = (bagToFind) => {
    let outerBags = new Set();
    // Check every bag and see if if ever comes across a shiny gold bag
    const combine = Object.keys(bagRules).forEach((bagName) => {
      const childBags = bagRules[bagName][0];
      let validOuterBags = [];
      if (findBagsWithGivenChild(bagName, bagToFind)) {
        validOuterBags.push(bagName);
      }
      childBags.forEach((childBagName) => {
        if (outerBags.has(childBagName)) {
          validOuterBags.push(bagName);
        } else {
          let answer = [];
          const result = findBagsWithGivenChild(childBagName, bagToFind);
          if (result) {
            answer = result;
          }
          validOuterBags = [...validOuterBags, ...answer];
        }
      });
      validOuterBags.forEach((item) => outerBags.add(item));
    });
    return outerBags.size;
  };

  const fullRuleRegex = /([\w\s]*) bags contain ([\w\s,]*)/;
  const innerBagRuleRegex = /\s?(\d*) ([\w\s^]*) bags?/;

  for await (const line of rl) {
    const [_, bagType, innerBagRules] = fullRuleRegex.exec(line);

    const innerBags = [];
    const numbers = [];
    innerBagRules.split(',').forEach((bagRule) => {
      const [_, numberString, innerBagType] = innerBagRuleRegex.exec(bagRule);
      const number = parseInt(numberString, 10);
      if (innerBagType !== 'other') {
        // "contain no other bags"
        innerBags.push(innerBagType);
        numbers.push(number);
      }
    });
    const bagArr = [innerBags, numbers];
    bagRules[bagType] = bagArr;
  }

  return [
    calculateValidOuterBags('shiny gold'),
    countNumberOfChildren('shiny gold'),
  ];
}

parseBagRules().then((answer) => {
  console.log(`Part 1: ${answer[0]}`);
  console.log(`Part 2: ${answer[1]}`);
});
