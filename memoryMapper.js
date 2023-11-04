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

    findRegion(address) {
        let region = this.regions.find(region => address >= region.start && address <= region.end);
        if (!region) throw new Error(`No memory region found for the address: ${address}`);
        return region;
    }

    getUint8(address) {
        const region = this.findRegion(address);
        const finalAddress = region.remap ? address - region.start : address;
        return region.device.getUint8(finalAddress);
    }

    getUint16(address) {
        const region = this.findRegion(address);
        const finalAddress = region.remap ? address - region.start : address;
        return region.device.getUint16(finalAddress);
    }

    setUint8(address, value) {
        const region = this.findRegion(address);
        const finalAddress = region.remap ? address - region.start : address;
        return region.device.setUint8(finalAddress, value);
    }

    setUint16(address, value) {
        const region = this.findRegion(address);
        const finalAddress = region.remap ? address - region.start : address;
        return region.device.setUint16(finalAddress, value);
    }
}

module.exports = MemoryMapper;