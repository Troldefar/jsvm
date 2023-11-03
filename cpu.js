const createMemory = require('./createMemory');
const semantics    = require('./semantics');

class CPU {

    STACK_POINTER_DECEMENTER = 2;
    ONE_BYTE = 1;
    TWO_BYTES = 2;
    registerNames = ['ip', 'accumulator', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'sp', 'fp'];

    constructor(memory) {
        this.memory = memory;
        this.registers = createMemory(this.registerNames.length * 2);
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});
        this.setRegister('sp', memory.byteLength - this.ONE_BYTE - this.ONE_BYTE);
        this.setRegister('fp', memory.byteLength - this.ONE_BYTE - this.ONE_BYTE);
        this.stackFrameSize = 0;
    }

    log() {
        this.registerNames.forEach(name => {
            console.log(`Name: ${name} - Value: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`);
        });
    }

    inspect(address, n = 8) {
        const nextBytes = Array.from({length: n}, (_, i) => 
            this.memory.getUint8(address + i)
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
        return this.memory.getUint16(nextSpAddress);
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
            case semantics.MOVE_LIT_REG: {
                const literal = this.fetch(16);
                const register  = this.getNextRegister();
                this.registers.setUint16(register, literal);
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
                const value = this.memory.getUint16(address);
                this.registers.setUint16(registerTo, value);
                return;
            }
            case semantics.JMP_NOT_EQ: {
                const value = this.fetch(16);
                const address = this.fetch(16);
                if (value !== this.getRegister('accumulator')) this.setRegister('ip', address);
                return;
            }
            case semantics.ADD_REG_REG: {
                const r1 = this.getNextRegister();
                const r2 = this.getNextRegister();
                const registerValue1 = this.registers.getUint16(r1 * this.TWO_BYTES);
                const registerValue2 = this.registers.getUint16(r2 * this.TWO_BYTES);
                this.setRegister('accumulator', registerValue1 + registerValue2);
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
            default:
                break;
        }
    }
}

module.exports = CPU;