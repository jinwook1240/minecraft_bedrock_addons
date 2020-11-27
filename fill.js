"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const system = server.registerSystem(0, 0);
// Custom Command
const bdsx_1 = require("bdsx");
// this hooks all commands, even It will can run by command blocks
bdsx_1.command.hook.on((command, originName) => {
    let cmd = command.replace(/ +/g, " ").split(" ");
    if (cmd[0] === '/fill') {
        console.log("fill command");
        let size = 0;
        try {
            //determine size of fill
            const size_x = Math.abs(Number(cmd[1]) - Number(cmd[4])) + 1;
            const size_y = Math.abs(Number(cmd[2]) - Number(cmd[5])) + 1;
            const size_z = Math.abs(Number(cmd[3]) - Number(cmd[6])) + 1;
            size = size_x * size_y * size_z;
            //determine Coordinates of fill
            if (size > 32768) {
                let source_x, dest_x, source_y, dest_y, source_z, dest_z;
                if (Number(cmd[1]) > Number(cmd[4])) {
                    source_x = Number(cmd[4]);
                    dest_x = Number(cmd[1]);
                }
                else {
                    source_x = Number(cmd[1]);
                    dest_x = Number(cmd[4]);
                }
                if (Number(cmd[2]) > Number(cmd[5])) {
                    source_y = Number(cmd[5]);
                    dest_y = Number(cmd[2]);
                }
                else {
                    source_y = Number(cmd[2]);
                    dest_y = Number(cmd[5]);
                }
                if (Number(cmd[3]) > Number(cmd[6])) {
                    source_z = Number(cmd[6]);
                    dest_z = Number(cmd[3]);
                }
                else {
                    source_z = Number(cmd[3]);
                    dest_z = Number(cmd[6]);
                }
                //debug
                //console.log("[ADDON] x,y,z source and dest : ",source_x,dest_x,source_y,dest_y,source_z,dest_z);
                //determine size of fill(at once)
                let fill_x = 1, fill_y = 1, fill_z = 1;
                while (fill_x * fill_y * fill_z < 32768) {
                    //debug
                    //console.log(fill_x,fill_y,fill_z);
                    let test_x = false, test_y = false, test_z = false;
                    if (fill_x < size_x) {
                        fill_x += 1;
                        if (fill_x * fill_y * fill_z >= 32768) {
                            fill_x -= 1;
                            test_x = true;
                        }
                    }
                    else
                        test_x = true;
                    if (fill_y < size_y) {
                        fill_y += 1;
                        if (fill_x * fill_y * fill_z >= 32768) {
                            fill_y -= 1;
                            test_y = true;
                        }
                    }
                    else
                        test_y = true;
                    if (fill_z < size_z) {
                        fill_z += 1;
                        if (fill_x * fill_y * fill_z >= 32768) {
                            fill_z -= 1;
                            test_z = true;
                        }
                    }
                    else
                        test_z = true;
                    //debug
                    //console.log(fill_x,fill_y,fill_z);
                    if (test_x && test_y && test_z) {
                        break;
                    }
                }
                fill_x -= 1;
                fill_y -= 1;
                fill_z -= 1;
                //debug
                //console.log("[ADDON] fill unit : ",fill_x,fill_y,fill_z);
                let iter_x, iter_y, iter_z;
                iter_x = Math.ceil(size_x / fill_x);
                iter_y = Math.ceil(size_y / fill_y);
                iter_z = Math.ceil(size_z / fill_z);
                //debug
                //console.log("[ADDON] iter : ",iter_x,iter_y,iter_z);
                for (let loop_x = 0; loop_x < iter_x; loop_x++) {
                    for (let loop_y = 0; loop_y < iter_y; loop_y++) {
                        for (let loop_z = 0; loop_z < iter_z; loop_z++) {
                            const start_x = source_x + fill_x * loop_x;
                            const start_y = source_y + fill_y * loop_y;
                            const start_z = source_z + fill_z * loop_z;
                            const end_x = (source_x + (fill_x * (loop_x + 1)) > dest_x ? dest_x : source_x + (fill_x * (loop_x + 1)));
                            const end_y = (source_y + (fill_y * (loop_y + 1)) > dest_y ? dest_y : source_y + (fill_y * (loop_y + 1)));
                            const end_z = (source_z + (fill_z * (loop_z + 1)) > dest_z ? dest_z : source_z + (fill_z * (loop_z + 1)));
                            const exec_cmd = 'fill ' + start_x + ' ' + start_y + ' ' + start_z + ' ' + end_x + ' ' + end_y + ' ' + end_z + ' ' + cmd[7];
                            //debug
                            //console.log('[ADDON] command : ',start_x,start_y,start_z,end_x,end_y,end_z);
                            system.executeCommand(exec_cmd, result => {
                                //console.log(result);
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxpQkFBaUI7QUFDakIsK0JBQThDO0FBQzlDLGtFQUFrRTtBQUNsRSxjQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUMsRUFBRTtJQUNuQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakQsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsSUFBRztZQUNDLHdCQUF3QjtZQUN4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUE7WUFDeEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO1lBQ3hELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FB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