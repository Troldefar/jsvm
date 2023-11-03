const createMemory = require('./createMemory');
const CPU          = require('./cpu');
const semantics    = require('./semantics');
const MemoryMapper = require('./memoryMapper');
const fakeDevice   = require('./fakeDevice');

const iMemoryMapper = new MemoryMapper();
const memory = createMemory(256*256);

iMemoryMapper.mapDevice(memory, 0, 0xffff);
iMemoryMapper.mapDevice(fakeDevice(), 0x3000, 0x30ff, true);

const writeableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(iMemoryMapper);
let i = 0;

const writett = (character, position) => {
    writeableBytes[i++] = semantics.MOVE_LIT_REG;
    writeableBytes[i++] = 0x00;
    writeableBytes[i++] = character.charCodeAt(0);
    writeableBytes[i++] = semantics.globals.R1;

    writeableBytes[i++] = semantics.MOVE_REG_MEM;
    writeableBytes[i++] = semantics.globals.R1;
    writeableBytes[i++] = 0x30;
    writeableBytes[i++] = position;
};

'Hello world!'.split('').forEach((c, i) => {
    writett(c, i);
});

writeableBytes[i++] = semantics.HALT;

cpu.run();