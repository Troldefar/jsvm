const readline     = require('readline');
const createMemory = require('./createMemory');
const CPU          = require('./cpu');
const semantics    = require('./semantics');

const memory = createMemory(256*256);
const writeableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);
const subroutineAddress = 0x3000;
let i = 0;

writeableBytes[i++] = semantics.PSH_LIT_VAL;
writeableBytes[i++] = 0x33;
writeableBytes[i++] = 0x33;

writeableBytes[i++] = semantics.PSH_LIT_VAL;
writeableBytes[i++] = 0x22;
writeableBytes[i++] = 0x22;

writeableBytes[i++] = semantics.PSH_LIT_VAL;
writeableBytes[i++] = 0x11;
writeableBytes[i++] = 0x11;

writeableBytes[i++] = semantics.MOVE_LIT_REG;
writeableBytes[i++] = 0x12;
writeableBytes[i++] = 0x34;
writeableBytes[i++] = semantics.globals.R1;

writeableBytes[i++] = semantics.MOVE_LIT_REG;
writeableBytes[i++] = 0x56;
writeableBytes[i++] = 0x78;
writeableBytes[i++] = semantics.globals.R4;

writeableBytes[i++] = semantics.PSH_LIT_VAL;
writeableBytes[i++] = 0x00;
writeableBytes[i++] = 0x00;

writeableBytes[i++] = semantics.CAL_LIT;
writeableBytes[i++] = (subroutineAddress & 0xff00) >> 8;
writeableBytes[i++] = (subroutineAddress & 0xff00);

i = subroutineAddress;

writeableBytes[i++] = semantics.PSH_LIT_VAL;
writeableBytes[i++] = 0x01;
writeableBytes[i++] = 0x02;

writeableBytes[i++] = semantics.PSH_LIT_VAL;
writeableBytes[i++] = 0x03;
writeableBytes[i++] = 0x04;

writeableBytes[i++] = semantics.PSH_LIT_VAL;
writeableBytes[i++] = 0x05;
writeableBytes[i++] = 0x06;

writeableBytes[i++] = semantics.MOVE_LIT_REG;
writeableBytes[i++] = 0x08;
writeableBytes[i++] = 0x0B;
writeableBytes[i++] = semantics.globals.R1;

writeableBytes[i++] = semantics.MOVE_LIT_REG;
writeableBytes[i++] = 0x09;
writeableBytes[i++] = 0x0A;
writeableBytes[i++] = semantics.globals.R8;

writeableBytes[i++] = semantics.RET;

function debugVM(step = false) {
    if (step) cpu.step();
    cpu.log();
    cpu.inspect(cpu.getRegister('ip'));
    cpu.inspect(0xffff - 1 - 42, 44);
}

debugVM();

const lineReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

lineReader.on('line', function() {
    debugVM(true);
});

/**
 * Third test
 * Write values into first two general purpose registers
 * Use the stack to swap the values since we now have a low level hanging fruit stack

    writeableBytes[i++] = semantics.MOVE_LIT_REG;
    writeableBytes[i++] = 0x51;
    writeableBytes[i++] = 0x51;
    writeableBytes[i++] = semantics.globals.R1;

    writeableBytes[i++] = semantics.MOVE_LIT_REG;
    writeableBytes[i++] = 0x42;
    writeableBytes[i++] = 0x42;
    writeableBytes[i++] = semantics.globals.R2;

    writeableBytes[i++] = semantics.PSH_REG_VAL;
    writeableBytes[i++] = semantics.globals.R1;

    writeableBytes[i++] = semantics.PSH_REG_VAL;
    writeableBytes[i++] = semantics.globals.R2;

    writeableBytes[i++] = semantics.POP;
    writeableBytes[i++] = semantics.globals.R1;

    writeableBytes[i++] = semantics.POP;
    writeableBytes[i++] = semantics.globals.R2;
*/

/**
 * Second test
 * Add values to register
 * Jump if not equal to three
    writeableBytes[i++] = semantics.MOVE_MEM_REG;
    writeableBytes[i++] = 0x01;
    writeableBytes[i++] = 0x00;
    writeableBytes[i++] = semantics.globals.R1;

    writeableBytes[i++] = semantics.MOVE_LIT_REG;
    writeableBytes[i++] = 0x00;
    writeableBytes[i++] = 0x01;
    writeableBytes[i++] = semantics.globals.R2;

    writeableBytes[i++] = semantics.ADD_REG_REG;
    writeableBytes[i++] = semantics.globals.R1;
    writeableBytes[i++] = semantics.globals.R2;

    writeableBytes[i++] = semantics.MOVE_REG_MEM;
    writeableBytes[i++] = semantics.globals.ACC;
    writeableBytes[i++] = 0x01;
    writeableBytes[i++] = 0x00;

    writeableBytes[i++] = semantics.JMP_NOT_EQ;
    writeableBytes[i++] = 0x00;
    writeableBytes[i++] = 0x03;
    writeableBytes[i++] = 0x00;
    writeableBytes[i++] = 0x00;
*/

/**
 * First test
 * Add values to registers
 * Add registers
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
*/