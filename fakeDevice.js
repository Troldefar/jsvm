const clearScreen = () => {
    process.stdout.write(`\x1b[23`);
}

const setBold = () => {
    process.stdout.write(`\x1b[1m`);
}

const setRegular = () => {
    process.stdout.write(`\x1b[0m`);
}

const moveTo = (x, y) => {
    process.stdout.write(`\x1b[${y};${x}H`);
}

const checkCmd = cmd => {
    if (cmd === 0xff) clearScreen();
    else if (cmd === 0x01) setBold();
    else if (cmd === 0x02) setRegular();
}

const fakeDevice = () => {
    return {
        getUint: (byte = 8) => 0,
        setUint: (address, data) => {
            const cmd = (data & 0xff00) >> 8;
            const characterValue = data & 0x00ff;
            checkCmd(cmd);
            const x = (address % 16) + 1;
            const y = Math.floor(address / 16) + 1;
            moveTo(x * 2, y);
            const character = String.fromCharCode(characterValue);
            process.stdout.write(character);
        }
    }
}

module.exports = fakeDevice;