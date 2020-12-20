const fs = require('fs');
const readline = require('readline');

const [one, two, inputFile] = process.argv;
let fileName = inputFile || './input.txt';


const START_BRACKET = '(';
const END_BRACKET = ')';

const addBracketSpaces = (string) => {
  const step1 = string.split(START_BRACKET).join(`${START_BRACKET} `);
  return step1.split(END_BRACKET).join(` ${END_BRACKET}`);
}

const solveAntiBedmas = (args, useWeirdPrecidenceLevels = false) => {
  if (args.length === 0) {
    return;
  }

  const lastStartingBracket = args.map((arg, index) => arg === START_BRACKET ? index : null).filter(item => item !== null).pop();
  const firstEndingBracket = args.map((arg, index) => arg === END_BRACKET ? index : null).filter(item => item !== null && item > lastStartingBracket).shift();

  if (!lastStartingBracket && !firstEndingBracket) {
    if (useWeirdPrecidenceLevels) {
      return doOppositeMaths(args);
    } else {
      return doMaths(args);
    }
  } else {
    const resolvedBrackets = solveAntiBedmas(args.slice(lastStartingBracket + 1, firstEndingBracket), useWeirdPrecidenceLevels);
    const newArgs = [...args.slice(0, lastStartingBracket), resolvedBrackets, ...args.slice(firstEndingBracket + 1)]
    return solveAntiBedmas(newArgs, useWeirdPrecidenceLevels);
  }
}

const doMaths = (args) => {
  if (args.length === 0) {
    return;
  }
  let firstInt;
  let operator;
  let secondInt;
  let rest;
  if (args.length > 2) {
    [firstInt, operator, secondInt, ...rest] = args;
  } else {
    [firstInt] = args;
    return firstInt;
  }

  const calulation = doCalculation(firstInt, operator, secondInt);

  return doMaths([calulation, ...rest])
}

const doOppositeMaths = (args) => {
  if (args.length === 0) {
    return;
  } else if (args.length === 1) {
    return args[0];
  }
  const additionIndex = args.map((arg, index) => arg === '+' ? index : null).filter(arg => arg !== null).pop();
  if (additionIndex) {
    return doOppositeMaths([
      ...args.slice(0, additionIndex - 1),
       doCalculation(args[additionIndex - 1], args[additionIndex], args[additionIndex + 1]), 
       ...args.slice(additionIndex + 2)
    ])
  }
  return doMaths(args)
}

const doCalculation = (firstInt, operator, secondInt) => {
  firstInt = parseInt(firstInt, 10);
  secondInt = parseInt(secondInt, 10);
  switch (operator) {
    case '+':
      return firstInt + secondInt;
    case '*':
      return firstInt * secondInt;
  }
}

async function doWeirdMath() {
  const fileStream = fs.createReadStream(`${fileName}`);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const lineResultsPart1 = [];
  const lineResultsPart2 = [];
  for await (const line of rl) {
    const withSpaces = addBracketSpaces(line);
    const split = withSpaces.split(' ');
    const resultPart1 = solveAntiBedmas(split);
    const resultPart2 = solveAntiBedmas(split, true);
    lineResultsPart1.push(resultPart1);
    lineResultsPart2.push(resultPart2);
  }

  const part1Answer = lineResultsPart1.reduce((acc, value) => (acc + value), 0);
  const part2Answer = lineResultsPart2.reduce((acc, value) => (acc + value), 0);
  console.log(`Part 1: ${part1Answer}`);
  console.log(`Part 2: ${part2Answer}`);
}

doWeirdMath();
