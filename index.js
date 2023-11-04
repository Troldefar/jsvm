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

const writett = (character, cmd, position) => {
    writeableBytes[i++] = semantics.MOVE_LIT_REG;
    writeableBytes[i++] = cmd;
    writeableBytes[i++] = character.charCodeAt(0);
    writeableBytes[i++] = semantics.globals.R1;

    writeableBytes[i++] = semantics.MOVE_REG_MEM;
    writeableBytes[i++] = semantics.globals.R1;
    writeableBytes[i++] = 0x30;
    writeableBytes[i++] = position;
};

writett(' ', 0xff, 0);

'Hello world!'.split('').forEach((c, i) => {
    const cmd = i % 2 === 0 ? 0x01 : 0x02;
    writett(c, cmd, i);
});

writeableBytes[i++] = semantics.HALT;

cpu.run();