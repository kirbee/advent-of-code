const fs = require('fs');
const readline = require('readline');

const getInstructionsCopy = (instructions) => [
  ...instructions.map((item) => ({ ...item })),
];

const executeInstructions = (instr) => {
  let currentLine = 0;
  let acc = 0;
  let isSuccessfullyTerminated = false;

  while (true) {
    const currentInstruction = instr[currentLine];
    if (currentInstruction.visited) break;
    const instructionNumber = parseInt(currentInstruction.number, 10);
    const instructionValue =
      currentInstruction.sign === '-'
        ? -1 * instructionNumber
        : instructionNumber;
    currentInstruction.visited = true;
    switch (currentInstruction.name) {
      case 'acc':
        acc += instructionValue;
        currentLine++;
        break;
      case 'jmp':
        currentLine += instructionValue;
        break;
      case 'nop':
        currentLine++;
        break;
    }
    if (currentLine >= instr.length) {
      isSuccessfullyTerminated = true;
      break;
    }
  }
  return [acc, isSuccessfullyTerminated];
};

// Swap nop, acc
const swapInstructionsAndTest = (instructions) => {
  const instructionsToSwap = instructions
    .map((item, index) =>
      item.name === 'jmp' || item.name === 'nop' ? index : false
    )
    .filter((item) => item !== false);

  for (let i = 0; i < instructionsToSwap.length; i++) {
    const newInstructions = getInstructionsCopy(instructions);
    const instructionToSwap = newInstructions[instructionsToSwap[i]];
    const instructionAfterSwap =
      instructionToSwap.name === 'jmp' ? 'nop' : 'jmp';
    newInstructions[instructionsToSwap[i]].name = instructionAfterSwap;
    const [acc, terminated] = executeInstructions(newInstructions);
    if (terminated) {
      return acc;
    }
  }
  return 0;
};

async function parseInstructionsAndFindSolutions() {
  const fileStream = fs.createReadStream('./input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const parsedInstructions = [];
  const instructionRegex = /^(\w*) ([+|-])(\d*)/;

  // Create instructions
  for await (const line of rl) {
    const [_, name, sign, number] = instructionRegex.exec(line);
    parsedInstructions.push({ name, sign, number });
  }

  // Part 1
  const [originalInstructionsAcc] = executeInstructions(
    getInstructionsCopy(parsedInstructions)
  );

  // Part 2
  const terminatedAcc = swapInstructionsAndTest(
    getInstructionsCopy(parsedInstructions)
  );

  return [originalInstructionsAcc, terminatedAcc];
}

parseInstructionsAndFindSolutions().then((answer) => {
  console.log(`Part 1: ${answer[0]}`);
  console.log(`Part 2: ${answer[1]}`);
});
