const MOVE_LIT_REG = 0x10;
const MOVE_REG_REG = 0x11;
const MOVE_REG_MEM = 0x12;
const MOVE_MEM_REG = 0x13;
const ADD_REG_REG  = 0x14;

globals = {IP: 0, ACC: 1, R1: 2, R2: 3};

module.exports = {MOVE_LIT_REG, MOVE_REG_REG, MOVE_REG_MEM, MOVE_MEM_REG, ADD_REG_REG, globals};