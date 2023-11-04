/**
 * Memory mapper
 * Will control the memory based on IO
 */

class MemoryMapper {
    constructor() {
        this.regions = [];
    }

    mapDevice(device, start, end, remap = true) {
        const region = {device, start, end, remap};
        this.regions.unshift(region);
        return () => this.regions = this.regions.filter(x => x !== region);
    }

    getRegion(address) {
        let region = this.regions.find(region => address >= region.start && address <= region.end);
        if (!region) throw new Error(`No memory region found for the address: ${address}`);
        return region;
    }

    getUint(address, byte = 8) {
        const region = this.getRegion(address);
        const calculatedAddress = region.remap ? address - region.start : address;
        return byte === 8 ? 
            region.device.getUint8(calculatedAddress)
            :
            region.device.getUint16(calculatedAddress);
    }

    setUint(address, value, byte = 8) {
        const region = this.getRegion(address);
        const calculatedAddress = region.remap ? address - region.start : address;
        return byte === 8 ? 
            region.device.setUint(calculatedAddress, value)
            :
            region.device.setUint(calculatedAddress, value, 16);
    }
}

module.exports = MemoryMapper;