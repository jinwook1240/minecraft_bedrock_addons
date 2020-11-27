"use strict";
/// <reference types="minecraft-scripting-types-server" />
Object.defineProperty(exports, "__esModule", { value: true });
// Console Output
console.log("From Script> Hello, World!");
// Addon Script
const bdsx_1 = require("bdsx");
const common_1 = require("bdsx/common");
const system = server.registerSystem(0, 0);
system.listenForEvent("minecraft:entity_created" /* EntityCreated */, ev => {
    console.log('entity created: ' + ev.data.entity.__identifier__);
    // Get extra informations from entity
    const actor = bdsx_1.Actor.fromEntity(ev.data.entity);
    if (actor) {
        console.log('entity dimension: ' + common_1.DimensionId[actor.getDimension()]);
        const level = actor.getAttribute(common_1.AttributeId.PlayerLevel);
        console.log('entity level: ' + level);
        if (actor.isPlayer()) {
            const ni = actor.getNetworkIdentifier();
            console.log('player IP: ' + ni.getAddress());
        }
    }
});
// Custom Command
const bdsx_2 = require("bdsx");
// this hooks all commands, even It will can run by command blocks
bdsx_2.command.hook.on((command, originName) => {
    if (command === '/test1') {
        console.log("test command 1");
        const cmd = 'fill 0 100 0 5 150 5 torch';
        system.executeCommand(cmd, result => {
            console.log(result);
        });
    }
    if (command === '/close') {
        bdsx_2.serverControl.stop(); // same with the stop command
        return 0;
    }
    if (command.startsWith('/>')) {
        try {
            console.log(eval(command.substr(2)));
            // run javacript
        }
        catch (err) {
            console.error(err.stack);
        }
        return 0;
    }
});
// Chat Listening
const bdsx_3 = require("bdsx");
bdsx_3.chat.on(ev => {
    ev.setMessage(ev.message.toUpperCase() + " YEY!");
});
// Network Hooking: Get login IP and XUID
const bdsx_4 = require("bdsx");
const connectionList = new Map();
bdsx_4.netevent.after(bdsx_4.PacketId.Login).on((ptr, networkIdentifier, packetId) => {
    const ip = networkIdentifier.getAddress();
    const [xuid, username] = bdsx_4.netevent.readLoginPacket(ptr);
    console.log(`${username}> IP=${ip}, XUID=${xuid}`);
    if (username)
        connectionList.set(networkIdentifier, username);
    // sendPacket
    setTimeout(() => {
        console.log('packet sended');
        // It uses C++ class packets. and they are not specified everywhere.
        const textPacket = bdsx_4.createPacket(bdsx_4.PacketId.Text);
        textPacket.setCxxString('[message packet from bdsx]', 0x50);
        bdsx_4.sendPacket(networkIdentifier, textPacket);
        textPacket.dispose(); // need to delete it. or It will make memory lyrics
    }, 10000);
});
// Network Hooking: Print all packets
const tooLoudFilter = new Set([
    bdsx_4.PacketId.UpdateBlock,
    bdsx_4.PacketId.ClientCacheBlobStatus,
    bdsx_4.PacketId.NetworkStackLatencyPacket,
    bdsx_4.PacketId.LevelChunk,
    bdsx_4.PacketId.ClientCacheMissResponse,
    bdsx_4.PacketId.MoveEntityDelta,
    bdsx_4.PacketId.SetEntityMotion,
    bdsx_4.PacketId.SetEntityData,
    bdsx_4.PacketId.NetworkChunkPublisherUpdate,
]);
for (let i = 2; i <= 136; i++) {
    if (tooLoudFilter.has(i))
        continue;
    bdsx_4.netevent.raw(i).on((ptr, size, networkIdentifier, packetId) => {
        console.assert(size !== 0, 'invalid packet size');
        console.log('RECV ' + bdsx_4.PacketId[packetId] + ': ' + ptr.readHex(Math.min(16, size)));
    });
    bdsx_4.netevent.send(i).on((ptr, networkIdentifier, packetId) => {
        console.log('SEND ' + bdsx_4.PacketId[packetId] + ': ' + ptr.readHex(16));
    });
}
// Network Hooking: disconnected
bdsx_4.netevent.close.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected`);
});
// Call Native Functions
const bdsx_5 = require("bdsx");
const kernel32 = new bdsx_5.NativeModule("Kernel32.dll");
const user32 = new bdsx_5.NativeModule("User32.dll");
const GetConsoleWindow = kernel32.get("GetConsoleWindow");
const SetWindowText = user32.get("SetWindowTextW");
const wnd = GetConsoleWindow();
SetWindowText(wnd, "BDSX Window!!!");
// Parse raw packet
// referenced from https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/MovePlayerPacket.php
bdsx_4.netevent.raw(bdsx_4.PacketId.MovePlayer).on((ptr, size, ni) => {
    console.log(`Packet Id: ${ptr.readUint8()}`);
    const runtimeId = ptr.readVarBin();
    const x = ptr.readFloat32();
    const y = ptr.readFloat32();
    const z = ptr.readFloat32();
    const pitch = ptr.readFloat32();
    const yaw = ptr.readFloat32();
    const headYaw = ptr.readFloat32();
    const mode = ptr.readUint8();
    const onGround = ptr.readUint8() !== 0;
    console.log(`move: ${bdsx_5.bin.toString(runtimeId, 16)} ${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)} ${pitch.toFixed(1)} ${yaw.toFixed(1)} ${headYaw.toFixed(1)} ${mode} ${onGround}`);
});
// referenced from https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/CraftingEventPacket.php
bdsx_4.netevent.raw(bdsx_4.PacketId.CraftingEvent).on((ptr, size, ni) => {
    console.log(`Packet Id: ${ptr.readUint8()}`);
    const windowId = ptr.readUint8();
    const type = ptr.readVarInt();
    const uuid1 = ptr.readUint32();
    const uuid2 = ptr.readUint32();
    const uuid3 = ptr.readUint32();
    const uuid4 = ptr.readUint32();
    console.log(`crafting: ${windowId} ${type} ${uuid1} ${uuid2} ${uuid3} ${uuid4}`);
    const size1 = ptr.readVarUint();
    // need to parse more
});
// Global Error Listener
const bdsx_6 = require("bdsx");
console.log('\nerror handling>');
bdsx_6.setOnErrorListener(err => {
    console.log('ERRMSG Example> ' + err.message);
    // return false; // Suppress default error outputs
});
console.log(eval("undefined_identifier")); // Make the error for this example
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhhbXBsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJleGFtcGxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMERBQTBEOztBQUUxRCxpQkFBaUI7QUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBRTFDLGVBQWU7QUFDZiwrQkFBNkI7QUFDN0Isd0NBQXVEO0FBQ3ZELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLE1BQU0sQ0FBQyxjQUFjLGlEQUEyQyxFQUFFLENBQUMsRUFBRTtJQUNqRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRWhFLHFDQUFxQztJQUNyQyxNQUFNLEtBQUssR0FBRyxZQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0MsSUFBSSxLQUFLLEVBQ1Q7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixHQUFHLG9CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLG9CQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUV0QyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFDcEI7WUFDSSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztTQUM5QztLQUNKO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxpQkFB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