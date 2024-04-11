// Name: test
// ID: uhhhidk
// Description: your mother.
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT

(function(Scratch) {
    'use strict';

    const vm = Scratch.vm
    
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must run unsandboxed.")
    }
    class DerpysExtension {
        getInfo() {
            this.runs = 1
            return {
                id: "yourmother",
                name: "uhhh idk",

                color1: "#4287f5",
                color2: "#166af2",
                color3: "#032966",
                blocks: [
                    {
                        opcode: "ablock",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "test block",
                        // arguments: {
                        //     URL: {
                        //         type: Scratch.ArgumentType.STRING
                        //     }
                        // }
                    },
                ]
            };

        }

        ablock(args, util) {
            console.log(Scratch, util, vm)
            util.thread.tryCompile()
            console.log(util)
            console.log()
            // thread is located under util.thread.blockContainer._blocks ?
            return 1
        }

        
    }

    Scratch.extensions.register(new DerpysExtension())
})(Scratch);