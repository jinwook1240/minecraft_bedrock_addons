"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bdsx_1 = require("bdsx");
const netevent_1 = require("bdsx/netevent");
async function testWithModule(name, module, cb, ...skipprefix) {
    try {
        await cb(await module);
    }
    catch (err) {
        if (err && err.message) {
            const msg = err.message + '';
            for (const [prefix, cb] of skipprefix) {
                if (msg.startsWith(prefix)) {
                    console.log(`${name}: skipped`);
                    return;
                }
            }
            if (err && msg.startsWith('Cannot find module')) {
                console.log(`${name}: skipped`);
            }
            else {
                console.error(`${name}: failed`);
                console.error(err.stack || msg);
            }
        }
        else {
            console.error(`${name}: failed`);
            console.error(err);
        }
    }
}
(async () => {
    console.log('JS Engine: ' + process['jsEngine']);
    for (const p in process.versions) {
        console.log(`${p}: ${process.versions[p]}`);
    }
    console.log('testing...');
    const nextTickPassed = await Promise.race([
        new Promise(resolve => process.nextTick(() => resolve(true))),
        new Promise(resolve => setTimeout(() => {
            console.error(Error('nexttick failed // I will fix it later').stack);
            resolve(false);
        }, 1000))
    ]);
    let idcheck = 0;
    for (let i = 0; i < 255; i++) {
        bdsx_1.netevent.raw(i).on((ptr, size, ni, packetId) => {
            idcheck = packetId;
        });
        bdsx_1.netevent.after(i).on((ptr, ni, packetId) => {
            console.assert(packetId === idcheck, 'different packetId');
        });
        bdsx_1.netevent.before(i).on((ptr, ni, packetId) => {
            console.assert(packetId === idcheck, 'different packetId');
        });
    }
    const conns = new Set();
    bdsx_1.netevent.after(bdsx_1.PacketId.Login).on((ptr, ni) => {
        console.assert(!conns.has(ni), 'logined without connected');
        conns.add(ni);
    });
    netevent_1.close.on(ni => {
        console.assert(conns.delete(ni), 'disconnected without connected');
    });
    // bin
    {
        console.assert(bdsx_1.bin.fromNumber(1) === bdsx_1.bin.ONE, 'bin.fromNumber(1) failed');
        console.assert(bdsx_1.bin.fromNumber(0) === bdsx_1.bin.ZERO, 'bin.fromNumber(0) failed');
        console.assert(bdsx_1.bin.fromNumber(-1) === bdsx_1.bin.ZERO, 'bin.fromNumber(-1) failed');
        const small = bdsx_1.bin.fromNumber(0x100);
        console.assert(small === '\u0100', 'bin.fromNumber(0x100) failed');
        const big = bdsx_1.bin.fromNumber(0x10002);
        console.assert(big === '\u0002\u0001', 'bin.fromNumber(0x10002) failed');
        console.assert(bdsx_1.bin.sub(big, small) === '\uff02', 'bin.sub() failed');
        const big2 = bdsx_1.bin.add(big, bdsx_1.bin.add(big, small));
        console.assert(big2 === '\u0104\u0002', 'bin.add() failed');
        const bigbig = bdsx_1.bin.add(bdsx_1.bin.add(bdsx_1.bin.muln(big2, 0x100000000), small), bdsx_1.bin.ONE);
        console.assert(bigbig === '\u0101\u0000\u0104\u0002', 'bin.muln() failed');
        const dived = bdsx_1.bin.divn(bigbig, 2);
        console.assert(dived[0] === '\u0080\u0000\u0082\u0001', 'bin.divn() failed');
        console.assert(dived[1] === 1, 'bin.divn() failed');
        console.assert(bdsx_1.bin.toString(dived[0], 16) === '1008200000080', 'bin.toString() failed');
    }
    // deprecated!! but for testing
    const fileiopath = __dirname + '\\test.txt';
    try {
        await bdsx_1.fs.writeFile(fileiopath, 'test');
    }
    catch (err) {
        console.error(`${fileiopath}: File writing failed: ${err.message}`);
        console.error('Is permission granted?');
    }
    try {
        console.assert(await bdsx_1.fs.readFile(fileiopath) === 'test', 'file reading failed');
    }
    catch (err) {
        console.error(`${fileiopath}: File reading failed`);
        console.error(err.stack);
    }
    try {
        console.assert(bdsx_1.fs.deleteFileSync(fileiopath), 'file deleting failed');
    }
    catch (err) {
        console.error(`${fileiopath}: File deleting failed`);
        console.error(err.stack);
    }
    bdsx_1.command.hook.on((cmd, origin) => {
        console.log({ cmd, origin });
        if (cmd === 'test') {
            bdsx_1.serverControl.stop();
        }
    });
    bdsx_1.command.net.on((ev) => {
        console.log('net: ' + ev.command);
    });
    try {
        const mariadb = new bdsx_1.MariaDB('localhost', 'test', '1234', 'test');
        await mariadb.execute('create table test(a int)');
        await mariadb.execute('insert into test values(1)');
        const v = await mariadb.execute('select * from test');
        await mariadb.execute('drop table test');
        console.assert(v[0][0] === '1', 'mariadb: select 1 failed');
    }
    catch (err) {
        const msg = (err.message) + '';
        if (msg.startsWith("Can't connect to MySQL server on ") ||
            msg.startsWith('Access denied for user ')) {
            console.log("bdsx's mariadb: The test is skipped.");
        }
        else {
            console.error(`bdsx's mariadb: failed`);
            console.error(err.stack);
        }
    }
    // npm module check
    if (nextTickPassed) {
        await testWithModule("npm's mariadb", Promise.resolve().then(() => require('mariadb')), async (db) => {
            const pool = db.createPool({ user: 'test', password: '1234', database: 'test', acquireTimeout: 1000, connectTimeout: 1000 });
            const conn = await pool.getConnection();
            await conn.query('create table test(a int)');
            await conn.query('insert into test values(1)');
            const v = await conn.query('select * from test');
            await conn.query('drop table test');
            console.assert(v[0][0] === '1', 'mariadb: select 1 failed');
        }, '(conn=-1, no: 45012, SQLState: 08S01) Connection timeout: failed to create socket after ');
    }
    await testWithModule('discord.js', Promise.resolve().then(() => require('discord.js')), async (DiscordJS) => {
        // empty
    });
    try {
        const ptr = bdsx_1.native.malloc(10);
        try {
            const bignum = bdsx_1.bin.fromNumber(123456789012345);
            ptr.clone().writeVarBin(bignum);
            console.assert(ptr.clone().readVarBin() === bignum, 'writevarbin / readvarbin failed');
        }
        finally {
            bdsx_1.native.free(ptr);
        }
    }
    catch (err) {
        console.error(err.stack);
    }
    console.log('test: done.');
})().catch(console.error);
let connectedNi;
bdsx_1.chat.on(ev => {
    if (ev.message == "est") {
        console.assert(connectedNi === ev.networkIdentifier, 'the network identifier does not matched');
        console.log('tested');
        return bdsx_1.CANCEL;
    }
});
bdsx_1.netevent.raw(bdsx_1.PacketId.Login).on((ptr, size, ni) => {
    connectedNi = ni;
});
const system = server.registerSystem(0, 0);
system.listenForEvent("minecraft:entity_created" /* EntityCreated */, ev => {
    try {
        const uniqueId = ev.data.entity.__unique_id__;
        const actor2 = bdsx_1.Actor.fromUniqueId(uniqueId["64bit_low"], uniqueId["64bit_high"]);
        const actor = bdsx_1.Actor.fromEntity(ev.data.entity);
        console.assert(actor === actor2, 'Actor.fromEntity is not matched');
        if (actor !== null) {
            const actualId = actor.getUniqueIdLow() + ':' + actor.getUniqueIdHigh();
            const expectedId = uniqueId["64bit_low"] + ':' + uniqueId["64bit_high"];
            console.assert(actualId === expectedId, `Actor uniqueId is not matched (actual=${actualId}, expected=${expectedId})`);
            if (ev.__identifier__ === 'minecraft:player') {
                console.assert(actor.getTypeId() == 0x13f, 'player type is not matched');
                console.assert(actor.isPlayer(), 'a player is not the player');
                console.assert(connectedNi === actor.getNetworkIdentifier(), 'the network identifier does not matched');
            }
            else {
                console.assert(!actor.isPlayer(), 'a not player is the player');
            }
        }
    }
    catch (err) {
        console.error(err.stack);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBb0k7QUFDcEksNENBQXNDO0FBRXRDLEtBQUssVUFBVSxjQUFjLENBQ3pCLElBQVcsRUFDWCxNQUFpQixFQUNqQixFQUE0QixFQUM1QixHQUFHLFVBQW1CO0lBRXRCLElBQ0E7UUFDSSxNQUFNLEVBQUUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxDQUFDO0tBQzFCO0lBQ0QsT0FBTyxHQUFHLEVBQ1Y7UUFDSSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUN0QjtZQUNJLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUMsRUFBRSxDQUFDO1lBQzNCLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxVQUFVLEVBQ3JDO2dCQUNJLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFDMUI7b0JBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLENBQUM7b0JBQ2hDLE9BQU87aUJBQ1Y7YUFDSjtZQUNELElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsRUFDL0M7Z0JBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLENBQUM7YUFDbkM7aUJBRUQ7Z0JBQ0ksT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksVUFBVSxDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQzthQUNuQztTQUNKO2FBRUQ7WUFDSSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQztZQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RCO0tBQ0o7QUFDTCxDQUFDO0FB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