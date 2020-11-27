import { Actor } from "bdsx";
import { DimensionId, AttributeId } from "bdsx/common";
const system = server.registerSystem(0, 0);
// Custom Command
import { command, serverControl } from "bdsx";
// this hooks all commands, even It will can run by command blocks
command.hook.on((command, originName)=>{
    let cmd = command.replace(/ +/g, " ").split(" ");
    if (cmd[0] === '/fill'){
        console.log("fill command");
        let size = 0;
        try{
            //determine size of fill
            const size_x = Math.abs(Number(cmd[1])-Number(cmd[4]))+1
            const size_y = Math.abs(Number(cmd[2])-Number(cmd[5]))+1
            const size_z = Math.abs(Number(cmd[3])-Number(cmd[6]))+1
            size = size_x*size_y*size_z
            //determine Coordinates of fill
            if(size>32768){
                let source_x,dest_x,source_y,dest_y,source_z,dest_z;
                if(Number(cmd[1])>Number(cmd[4])){
                    source_x = Number(cmd[4]);
                    dest_x = Number(cmd[1]);
                }else{
                    source_x = Number(cmd[1]);
                    dest_x = Number(cmd[4]);
                }
                if(Number(cmd[2])>Number(cmd[5])){
                    source_y = Number(cmd[5]);
                    dest_y = Number(cmd[2]);
                }else{
                    source_y = Number(cmd[2]);
                    dest_y = Number(cmd[5]);
                }
                if(Number(cmd[3])>Number(cmd[6])){
                    source_z = Number(cmd[6]);
                    dest_z = Number(cmd[3]);
                }else{
                    source_z = Number(cmd[3]);
                    dest_z = Number(cmd[6]);
                }
                //debug
                //console.log("[ADDON] x,y,z source and dest : ",source_x,dest_x,source_y,dest_y,source_z,dest_z);
                
                //determine size of fill(at once)
                let fill_x=1,fill_y=1,fill_z=1;
                while(fill_x*fill_y*fill_z<32768){

                    //debug
                    //console.log(fill_x,fill_y,fill_z);

                    let test_x=false,test_y=false,test_z=false;
                    if(fill_x<size_x){
                        fill_x+=1;
                        if(fill_x*fill_y*fill_z>=32768){
                            fill_x-=1;
                            test_x=true;
                        }
                    }else test_x = true;
                    if(fill_y<size_y){
                        fill_y+=1;
                        if(fill_x*fill_y*fill_z>=32768){
                            fill_y-=1;
                            test_y=true;
                        }
                    }else test_y = true
                    if(fill_z<size_z){
                        fill_z+=1;
                        if(fill_x*fill_y*fill_z>=32768){
                            fill_z-=1;
                            test_z=true;
                        }
                    }else test_z = true;

                    //debug
                    //console.log(fill_x,fill_y,fill_z);

                    if(test_x&&test_y&&test_z){
                        break;
                    }
                }
                fill_x-=1;
                fill_y-=1;
                fill_z-=1;

                //debug
                //console.log("[ADDON] fill unit : ",fill_x,fill_y,fill_z);

                let iter_x,iter_y,iter_z;
                iter_x = Math.ceil(size_x/fill_x);
                iter_y = Math.ceil(size_y/fill_y);
                iter_z = Math.ceil(size_z/fill_z);

                //debug
                //console.log("[ADDON] iter : ",iter_x,iter_y,iter_z);
                
                for(let loop_x = 0;loop_x<iter_x;loop_x++){
                    for(let loop_y = 0;loop_y<iter_y;loop_y++){
                        for(let loop_z = 0;loop_z<iter_z;loop_z++){
                            const start_x = source_x+fill_x*loop_x;
                            const start_y = source_y+fill_y*loop_y;
                            const start_z = source_z+fill_z*loop_z;
                            const end_x = (source_x+(fill_x*(loop_x+1))>dest_x? dest_x : source_x+(fill_x*(loop_x+1)));
                            const end_y = (source_y+(fill_y*(loop_y+1))>dest_y? dest_y : source_y+(fill_y*(loop_y+1)));
                            const end_z = (source_z+(fill_z*(loop_z+1))>dest_z? dest_z : source_z+(fill_z*(loop_z+1)));
                            const exec_cmd = 'fill '+start_x+' '+start_y+' '+start_z+' '+end_x+' '+end_y+' '+end_z+' '+cmd[7];
                            
                            //debug
                            //console.log('[ADDON] command : ',start_x,start_y,start_z,end_x,end_y,end_z);
                            
                            system.executeCommand(exec_cmd,result=>{
                                //console.log(result);
                            });
                        }
                    }
                }
            }
        }catch(error){
            console.error(error);
        }
    }

});