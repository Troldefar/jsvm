const moveTo = (x, y) => {
    process.stdout.write(`\x1b[${y};${x}]H`);
}

const fakeDevice = () => {
    return {
        getUint: (byte = 8) => 0,
        setUint: (address, data) => {
            const characterValue = data & 0x00ff;
            const x = (address % 16) + 1;
            const y = Math.floor(address / 16) + 1;
            moveTo(x * 2, y);
            const character = String.fromCharCode(characterValue);
            process.stdout.write(character);
        }
    }
}

module.exports = fakeDevice;