const createMemory = require('./createMemory');
const semantics    = require('./semantics');

class CPU {

    STACK_POINTER_DECEMENTER = 2;
    ONE_BYTE = 1;
    TWO_BYTES = 2;
    HARDCODED_MEMORY_START = 0xffff;

    registerNames = ['ip', 'accumulator', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'sp', 'fp'];

    constructor(memory) {
        this.memory = memory;
        this.registers = createMemory(this.registerNames.length * 2);
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});
        this.setRegister('sp', this.HARDCODED_MEMORY_START - this.ONE_BYTE);
        this.setRegister('fp', this.HARDCODED_MEMORY_START - this.ONE_BYTE);
        this.stackFrameSize = 0;
    }

    log() {
        this.registerNames.forEach(name => {
            console.log(`Name: ${name} - Value: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`);
        });
    }

    inspect(address, n = 8) {
        const nextBytes = Array.from({length: n}, (_, i) => 
            this.memory.getUint(address + i)
        ).map(value => `0x${value.toString(16).padStart(2, '0')}`);

        console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextBytes.join(' ')}`);
    }

    getRegister(name) {
        if (!(name in this.registerMap)) throw new Error('Invalid register');
        return this.registers.getUint16(this.registerMap[name]);
    }

    setRegister(name, value) {
        if (!(name in this.registerMap)) throw new Error('No such register');
        return this.registers.setUint16(this.registerMap[name], value);
    }

    step() {
        const instruction = this.fetch();
        return this.execute(instruction);
    }

    fetch(bitSize = 8) {
        const eightBit = bitSize === 8;
        const nextInstruction = this.getRegister('ip');
        const instruction     = eightBit ? this.memory.getUint8(nextInstruction) : this.memory.getUint16(nextInstruction);
        this.setRegister('ip', nextInstruction + (eightBit ? 1 : 2));
        return instruction;
    }

    getNextRegister() {
        return (this.fetch() % this.registerNames.length) * 2;
    }

    push(value) {
        const spAddress = this.getRegister('sp');
        this.memory.setUint16(spAddress, value);
        this.setRegister('sp', spAddress - this.TWO_BYTES);
        this.stackFrameSize += 2;
    }
    
    pushState() {
        for (let i = 1; i < 9; i++) this.push(this.getRegister(`r${i}`));
        this.push(this.getRegister('ip'));
        this.push(this.stackFrameSize + 2);
        this.setRegister('fp', this.getRegister('sp'));
        this.stackFrameSize = 0;
    }

    pop() {
        const nextSpAddress = this.getRegister('sp') + this.TWO_BYTES;
        this.setRegister('sp', nextSpAddress);
        this.stackFrameSize -= 2;
        return this.memory.getUint(nextSpAddress, 16);
    }

    popState() {
        const framePointer = this.getRegister('fp');
        this.setRegister('sp', framePointer);
        this.stackFrameSize = this.pop();
        const stackFrameSize = this.stackFrameSize;
        this.setRegister('ip', this.pop());
        for (let i = 8; i > 0; i--) this.setRegister(`r${i}`, this.pop());
        const numberOfArguments = this.pop();
        for (let n = 0; n < numberOfArguments; n++) this.pop();
        this.setRegister('fp', framePointer + stackFrameSize);
    }

    execute(instruction) {
        switch (instruction) {
            case semantics.ADD_REG_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const registerValue1 = this.registers.getUint16(r1);
                const registerValue2 = this.registers.getUint16(r2);
                this.setRegister('accumulator', registerValue1 + registerValue2);
                return;
            }
            case semantics.ADD_LIT_REG: {
                const immediateValue = this.fetch(16);
                const r1 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister('accumulator', immediateValue + registerValue);
                return;
            }
            case semantics.INC_REG: {
                const r1 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                this.registers.setUint16(r1, (registerValue + 1));
                return;
            }
            case semantics.DEC_REG: {
                const r1 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                this.registers.setUint16(r1, (registerValue - 1));
                return;
            }
            /**
             * (* n^2 )
             */
            case semantics.LSF_REG_LIT: {
                const r1 = this.getNextRegister();
                const literal = this.fetch();
                const immediateValue = this.registers.getUint16(r1);
                this.registers.setUint32(r1, (immediateValue << literal));
                return;
            }
            case semantics.LSF_REG_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                const shiftBy = this.registers.getUint16(r2);
                this.setRegister(r1, (registerValue << shiftBy));
                return;
            }
            /**
             * (/ n^2 )
             */
            case semantics.RSF_REG_LIT: {
                const r1 = this.getNextRegister();
                const literal = this.fetch();
                const immediateValue = this.registers.getUint16(r1);
                this.registers.setUint32(r1, (immediateValue >> literal));
                return;
            }
            case semantics.RSF_REG_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                const shiftBy = this.registers.getUint16(r2);
                this.setRegister(r1, (registerValue >> shiftBy));
                return;
            }
            case semantics.AND_REG_REG: {
                const r1 = this.getNextRegister();
                const literal = this.fetch();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister(r1, (registerValue & literal));
                return;
            }
            case semantics.AND_REG_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                const shiftBy = this.registers.getUint16(r2);
                this.setRegister(r1, (registerValue & shiftBy));
                return;
            }
            case semantics.OR_REG_REG: {
                const r1 = this.getNextRegister();
                const literal = this.fetch();
                const registerValue = this.registers.getUint16(r1);
                this.registers.setUint16(r1, (registerValue | literal));
                return;
            }
            case semantics.OR_REG_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                const shiftBy = this.registers.getUint16(r2);
                this.setRegister(r1, (registerValue | shiftBy));
                return;
            }
            case semantics.XOR_REG_REG: {
                const r1 = this.getNextRegister();
                const literal = this.fetch();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister(r1, (registerValue ^ literal));
                return;
            }
            case semantics.XOR_REG_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                const shiftBy = this.registers.getUint16(r2);
                this.setRegister(r1, (registerValue ^ shiftBy));
                return;
            }
            case semantics.NOT: {
                const r1 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                /**
                 * Since the javascript engine turns our 16 bit number into a 32bit bit
                 * we need to remove the top part
                 */
                const calculated = (~registerValue & 0xffff);
                this.setRegister('accumulator', calculated);
                return;
            }
            case semantics.SUB_LIT_REG: {
                const immediateValue = this.fetch(16);
                const r1 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister('accumulator', immediateValue - registerValue);
                return; 
            }
            case semantics.SUB_REG_LIT: {
                const r1 = this.getNextRegister();
                const immediateValue = this.fetch(16);
                const registerValue = this.registers.getUint16(r1);
                this.setRegister('accumulator', immediateValue - registerValue);
                return; 
            }
            case semantics.SUB_REG_LIT: {
                const r1 = this.getNextRegister();
                const r2 = this.fetch(16);
                const register1Value = this.registers.getUint16(r1);
                const register2Value = this.registers.getUint16(r2);
                this.setRegister('accumulator', register1Value - register2Value);
                return; 
            }
            case semantics.MUL_LIT_REG: {
                const immediateValue = this.fetch(16);
                const r1 = this.getNextRegister();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister('accumulator', immediateValue * registerValue);
                return;
            }
            case semantics.MUL_REG_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.fetch(16);
                const register1Value = this.registers.getUint16(r1);
                const register2Value = this.registers.getUint16(r2);
                this.setRegister('accumulator', register1Value * register2Value); 
                return;
            }
            case semantics.MOVE_LIT_REG: {
                const immediateValue = this.fetch(16);
                const register  = this.getNextRegister();
                this.registers.setUint16(register, immediateValue);
                return;
            }
            case semantics.MOVE_REG_REG: {
                const registerFrom = this.getNextRegister();
                const registerTo = this.getNextRegister();
                const value = this.registers.getUint16(registerFrom);
                this.registers.setUint16(registerTo, value);
                return;
            }
            case semantics.MOVE_REG_MEM: {
                const registerFrom = this.getNextRegister();
                const address = this.fetch(16);
                const value = this.registers.getUint16(registerFrom);
                this.memory.setUint16(address, value);
                return;
            }
            case semantics.MOVE_MEM_REG: {
                const address = this.fetch(16);
                const registerTo = this.getNextRegister();
                const value = this.memory.getUint(address, 16);
                this.registers.setUint16(registerTo, value);
                return;
            }
            case semantics.MOVE_LIT_MEM: {
                const value = this.fetch(16);
                const address = this.fetch(16);
                this.memory.setUint16(address, value);
                return;
            }
            case semantics.MOVE_REG_PRT_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const pointer = this.registers.getUint16(r1);
                const value   = this.memory.getUint16(pointer);
                this.registers.setUint16(r2, value);
                return;
            }
            /**
             * Make memory regions relative to another another so that 
             * Allocted region will always start at 0x0100
             * Allocted region will always end at 0xffff
             */
            case semantics.MOVE_LIT_OFF_REG: {
                const baseAddress = this.fetch(16);
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const offset = this.registers.getUint16(r1);
                const value = this.memory.getUint16(baseAddress + offset);
                this.registers.setUint16(r2, value);
                return;
            }
            case semantics.JMP_NOT_EQ: {
                const value = this.fetch(16);
                const address = this.fetch(16);
                if (value !== this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JNE_REG: {
                const r1 = this.getNextRegister();
                const immediateValue = this.registers.getUint16(r1);
                const address = this.fetch(16);
                if (immediateValue !== this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JEQ_LIT: {
                const value = this.fetch(16);
                const address = this.fetch(16);
                if (value === this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JEQ_REG: {
                const r1 = this.getNextRegister();
                const immediateValue = this.registers.getUint16(r1);
                const address = this.fetch(16);
                if (immediateValue === this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JLT_LIT: {
                const value = this.fetch(16);
                const address = this.fetch(16);
                if (value < this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JLT_REG: {
                const r1 = this.getNextRegister();
                const immediateValue = this.registers.getUint16(r1);
                const address = this.fetch(16);
                if (immediateValue < this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JGT_LIT: {
                const value = this.fetch(16);
                const address = this.fetch(16);
                if (value > this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JGT_REG: {
                const r1 = this.getNextRegister();
                const immediateValue = this.registers.getUint16(r1);
                const address = this.fetch(16);
                if (immediateValue > this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JLE_LIT: {
                const value = this.fetch(16);
                const address = this.fetch(16);
                if (value <= this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JLE_REG: {
                const r1 = this.getNextRegister();
                const immediateValue = this.registers.getUint16(r1);
                const address = this.fetch(16);
                if (immediateValue <= this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JGE_LIT: {
                const value = this.fetch(16);
                const address = this.fetch(16);
                if (value >= this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.JGE_REG: {
                const r1 = this.getNextRegister();
                const immediateValue = this.registers.getUint16(r1);
                const address = this.fetch(16);
                if (immediateValue >= this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.PSH_LIT_VAL: {
                const value = this.fetch(16);
                this.push(value);
                return;
            }
            case semantics.PSH_REG_VAL: {
                const registerIndex = this.getNextRegister();
                this.push(this.registers.getUint16(registerIndex));
                return;
            }
            
            case semantics.POP: {
                const registerIndex = this.getNextRegister();
                const value = this.pop();
                this.registers.setUint16(registerIndex, value);
                return;
            }
            case semantics.CAL_LIT: {
                const address = this.fetch(16);
                this.pushState();
                this.setRegister('ip', address);
                return;
            }
            case semantics.CAL_REG: {
                const registerIndex = this.getNextRegister();
                const address = this.registers.getUint16(registerIndex);
                this.pushState();
                this.setRegister('ip', address);
                return;
            }
            case semantics.RET: {
                this.popState();
                return;
            }
            case semantics.HALT: {
                return true;
            }
            default:
                break;
        }
    }

    run() {
        const halt = this.step();
        if (halt) return;
        setImmediate(() => this.run());
    }
}

module.exports = CPU;