const MOVE_LIT_REG     = 0x10;
const MOVE_REG_REG     = 0x11;
const MOVE_REG_MEM     = 0x12;
const MOVE_MEM_REG     = 0x13;
const MOVE_LIT_MEM     = 0x1B;
const MOVE_REG_PRT_REG = 0x1C;
const MOVE_LIT_OFF_REG = 0x1D;

const ADD_REG_REG      = 0x14;
const ADD_LIT_REG      = 0x3F;
const SUB_LIT_REG      = 0x16;
const SUB_REG_LIT      = 0x1E;
const SUB_REG_REG      = 0x1F;
const INC_REG          = 0x35;
const DEC_REG          = 0x36;
const MUL_LIT_REG      = 0x20;
const MUL_REG_REG      = 0x21;

const LSF_REG_LIT     = 0x26;
const LSF_REG_REG     = 0x27;
const RSF_REG_LIT     = 0x2A;
const RSF_REG_REG     = 0x2B;
const AND_REG_LIT     = 0x2E;
const AND_REG_REG     = 0x2F;
const OR_REG_LIT      = 0x30;
const OR_REG_REG      = 0x31;
const XOR_REG_LIT     = 0x32;
const XOR_REG_REG     = 0x33;
const NOT             = 0x34;

const JMP_NOT_EQ       = 0x15;
const PSH_LIT_VAL      = 0x17;
const PSH_REG_VAL      = 0x18;
const POP              = 0x1A;
const CAL_LIT          = 0x5E;
const CAL_REG          = 0x5F;
const RET              = 0x60;
const HALT             = 0xFF;

globals = {
    IP: 0, ACC: 1, 
    R1: 2, R2: 3, R3: 4, R4: 5, R5: 6, R6: 7, R7: 8, R8: 9, 
    SP: 10, FP: 11
};

const ACC_LOC = 0x0100;

module.exports = {
    MOVE_LIT_REG, MOVE_REG_REG, MOVE_REG_MEM, MOVE_MEM_REG, MOVE_LIT_MEM, MOVE_REG_PRT_REG, MOVE_LIT_OFF_REG, 
    JMP_NOT_EQ, 
    ADD_REG_REG, ACC_LOC, ADD_LIT_REG,
    SUB_LIT_REG, SUB_REG_LIT, SUB_REG_REG,
    INC_REG,
    DEC_REG,
    LSF_REG_LIT, LSF_REG_REG,
    RSF_REG_LIT, RSF_REG_REG,
    AND_REG_LIT, AND_REG_REG,
    OR_REG_LIT, OR_REG_REG,
    XOR_REG_LIT, XOR_REG_REG,
    NOT,
    MUL_LIT_REG, MUL_REG_REG,
    PSH_LIT_VAL, PSH_REG_VAL, POP,
    CAL_LIT, CAL_REG,
    RET,
    HALT,
    globals
};