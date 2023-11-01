const MOVE_LIT_REG = 0x10;
const MOVE_REG_REG = 0x11;
const MOVE_REG_MEM = 0x12;
const MOVE_MEM_REG = 0x13;
const ADD_REG_REG  = 0x14;
const JMP_NOT_EQ   = 0x15;
const PSH_LIT_VAL  = 0x17;
const PSH_REG_VAL  = 0x18;
const POP          = 0x1A;

globals = {IP: 0, ACC: 1, R1: 2, R2: 3, R3: 4, R4: 5, R5: 6, R6: 7, R7: 8, R8: 9, SP: 10, FP: 11};

const ACC_LOC = 0x0100;

module.exports = {
    MOVE_LIT_REG, MOVE_REG_REG, MOVE_REG_MEM, MOVE_MEM_REG, 
    ADD_REG_REG, JMP_NOT_EQ, ACC_LOC, PSH_LIT_VAL, PSH_REG_VAL, POP, 
    globals
};