// Name: test
// ID: uhhhidk
// Description: your mother.
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT

(function(Scratch) {
    'use strict';
    let toAdd = document.createElement("script")
    
    const vm = Scratch.vm
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must run unsandboxed.")
    }
    class DerpysExtension {
        getInfo() {
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
                    {
                        opcode: "compileHat",
                        blockType: Scratch.BlockType.EVENT,
                        text: "uhhh idk",
                        isEdgeActivated: false
                    },
                    {
                        opcode: "compileStart",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "run the compiley thingy"
                    },
                    {
                        opcode: "declareVar",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "declare variable [NAME] as [VALUE]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    }
                ]
            };

        }




        // make a hat block and get all the blocks under the script?
        ablock(args, util) {
            //console.log(Scratch, util, vm)
            util.thread.tryCompile()
            console.log(vm)
            let script = util.thread
            //console.log(script) // script[Object.getOwnPropertyNames(script)[0]].value.startingFunction
            return 1
        }

        genInputTree(util,thread,blocks,check,addCheck) {
            if (JSON.stringify(blocks[check].inputs) === JSON.stringify({})) {
                return {
                    block: blocks[check].opcode,
                    id: blocks[check].id,
                    isRaw: (blocks[check].fields != {})
                }
                // isRaw is whether it's a math_number or whatever
            }
            else {
                let finalinputs = []
                if (addCheck) {
                    finalinputs.push({
                        block: blocks[check].opcode,
                        id: blocks[check].id,
                        isRaw: (blocks[check].fields != {})
                    }) 
                }


                let inputs = Object.getOwnPropertyNames(blocks[check].inputs)
                finalinputs.push(inputs.length)
                for (let i = 0; i < inputs.length; i++) {
                    finalinputs.push(this.genInputTree(util, thread, blocks, blocks[check].inputs[inputs[i]].block,true))
                }
                return finalinputs
            }


        }

        genBlock (util,thread,blocks,block) {
            let output = []
            let heldInputs = structuredClone(blocks[block].inputs)
            output.push(blocks[block].opcode)
            if (heldInputs.hasOwnProperty("SUBSTACK")) {
                delete heldInputs.SUBSTACK // this is a quick fix and probably won't play well with other extensions.
                // i will make a custom math/block system later
            }
            if (heldInputs.hasOwnProperty("SUBSTACK2")) {
                delete heldInputs.SUBSTACK2 // see previous comment
            }
            if (JSON.stringify(heldInputs) != JSON.stringify({})) {
                // if the block takes inputs excluding SUBSTACK and SUBSTACK2, generate an input tree for it
                output.push(Object.getOwnPropertyNames(heldInputs).length)
                for (let i = 0; i < Object.getOwnPropertyNames(heldInputs).length; i++) {
                    output.push(this.genInputTree(util,thread,blocks,heldInputs[Object.getOwnPropertyNames(heldInputs)[i]].block,true))
                }
            }
            else {
                console.log(JSON.stringify(heldInputs) + " does not require a tree")
            }
            if (blocks[block].inputs.hasOwnProperty("SUBSTACK")) {
                output.push(this.compile(util,thread,blocks,blocks[block].inputs.SUBSTACK.block,true))
            }
            if (blocks[block].inputs.hasOwnProperty("SUBSTACK2")) {
                // support for n-number of branches is cringe and we don't need that kind of negativity in here
                // also no extensions in my pristine compiled hats
                if (!blocks[block].inputs.hasOwnProperty("SUBSTACK")) {
                    output.push([])
                }
                output.push("else")
                output.push(this.compile(util,thread,blocks,blocks[block].inputs.SUBSTACK2.block,true))
            }
            return output
        }

        compile (util,thread,blocks,firstblock,addStart) {
            let output = []
            let held = firstblock
            if (addStart) { output = output.concat(this.genBlock(util,thread,blocks,held)) }
            let next = blocks[held].next
            while (next != null) {
                held = next
                next = blocks[held].next
                output.push(blocks[held].opcode)
                let heldInputs = structuredClone(blocks[held].inputs)
                
                if (heldInputs.hasOwnProperty("SUBSTACK")) {
                    delete heldInputs.SUBSTACK // this is a quick fix and probably won't play well with other extensions.
                    // i will make a custom math/block system later
                }
                if (heldInputs.hasOwnProperty("SUBSTACK2")) {
                    delete heldInputs.SUBSTACK2 // see previous comment
                }
                if (JSON.stringify(heldInputs) != JSON.stringify({})) {
                    // if the block takes inputs excluding SUBSTACK and SUBSTACK2, generate an input tree for it
                    output.push(Object.getOwnPropertyNames(heldInputs).length)
                    for (let i = 0; i < Object.getOwnPropertyNames(heldInputs).length; i++) {
                        output.push(this.genInputTree(util,thread,blocks,heldInputs[Object.getOwnPropertyNames(heldInputs)[i]].block,true))
                    }
                }
                else {
                    console.log(JSON.stringify(heldInputs) + " does not require a tree")
                }
                if (blocks[held].inputs.hasOwnProperty("SUBSTACK")) {
                    output.push(this.compile(util,thread,blocks,blocks[held].inputs.SUBSTACK.block,true))
                }
                if (blocks[held].inputs.hasOwnProperty("SUBSTACK2")) {
                    // support for n-number of branches is cringe and we don't need that kind of negativity in here
                    // also no extensions in my pristine compiled hats
                    if (!blocks[held].inputs.hasOwnProperty("SUBSTACK")) {
                        output.push([])
                    }
                    output.push("else")
                    output.push(this.compile(util,thread,blocks,blocks[held].inputs.SUBSTACK2.block,true))
                }
                
            }
            return output
        }

        compileStart (args,util) {
            let threads = util.startHats("yourmother_compileHat") // this is cringe but idrc, it's temporary
            threads.forEach((t) => {
                t.tryCompile()
            })
            console.log(util)
            console.log(this.compile(util,threads[0],threads[0].blockContainer._blocks,threads[0].topBlock,false))
        }

        declareVar (args, util) {
            // this block does nothing <3
        }
        
    }
    Scratch.extensions.register(new DerpysExtension())
})(Scratch);