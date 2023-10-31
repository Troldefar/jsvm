const createMemory = require('./createMemory');
const CPU          = require('./cpu');
const semantics    = require('./semantics');

const memory = createMemory(256*256);
const writeableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

let i = 0;

writeableBytes[i++] = semantics.MOVE_LIT_REG;
writeableBytes[i++] = 0x12;
writeableBytes[i++] = 0x34;
writeableBytes[i++] = semantics.globals.R1;

writeableBytes[i++] = semantics.MOVE_LIT_REG;
writeableBytes[i++] = 0xAB;
writeableBytes[i++] = 0xCD;
writeableBytes[i++] = semantics.globals.R2;

writeableBytes[i++] = semantics.ADD_REG_REG;
writeableBytes[i++] = semantics.globals.R1;
writeableBytes[i++] = semantics.globals.R2;

writeableBytes[i++] = semantics.MOVE_REG_MEM;
writeableBytes[i++] = semantics.globals.ACC;
writeableBytes[i++] = 0x01;
writeableBytes[i++] = 0x00;

function runStep() {
    cpu.step();
    cpu.log();
    cpu.inspect(cpu.getRegister('ip'));
    cpu.inspect(0x0100);
}

cpu.log();
cpu.inspect(cpu.getRegister('ip'));
cpu.inspect(0x0100);

for(let s = 0; s < 5; s++) runStep();