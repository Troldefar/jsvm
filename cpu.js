const createMemory = require('./createMemory');
const semantics    = require('./semantics');

class CPU {
    constructor(memory) {
        this.memory = memory;
        this.registerNames = ['instructionPointer', 'accumulator', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'];
        this.registers = createMemory(this.registerNames.length * 2);
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});
    }

    log() {
        this.registerNames.forEach(name => {
            console.log(`Name: ${name} - Value: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`);
        });
    }

    inspect(address) {
        const nextBytes = Array.from({length: 8}, (_, i) => 
            this.memory.getUint8(address + 1)
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
        const nextInstruction = this.getRegister('instructionPointer');
        const instruction     = eightBit ? this.memory.getUint8(nextInstruction) : this.memory.getUint16(nextInstruction);
        this.setRegister('instructionPointer', nextInstruction + (eightBit ? 1 : 2));
        return instruction;
    }

    getNextRegister() {
        return (this.fetch() % this.registerNames.length) * 2;
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
            case semantics.ADD_REG_REG: {
                const r1 = this.fetch();
                const r2 = this.fetch();
                const registerValue1 = this.registers.getUint16(r1 * 2);
                const registerValue2 = this.registers.getUint16(r2 * 2);
                this.setRegister('accumulator', registerValue1 + registerValue2);
                return;
            }
            default:
                break;
        }
    }
}

module.exports = CPU;