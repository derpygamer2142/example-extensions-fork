// Name: test
// ID: uhhhidk
// Description: your mother.
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT

(async function(Scratch) {
    'use strict';
    let toAdd = document.createElement("script")
    
    const vm = Scratch.vm
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must run unsandboxed.")
    }
    // @ts-ignore
    if (!navigator.gpu) { // why angry red lines >: (
        throw new Error("WebGPU is not supported.")
    }
    // @ts-ignore
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw Error("Failed to get WebGPU adapter.");
    }
    const device = await adapter.requestDevice();

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
                    },
                    {
                        opcode: "runGPU",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Run [CODE] on the gpu",
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    }
                ]
            };

        }

        textFromOp(util, blob) {
            // i can't remember if blocks is _blocks, so i'm just getting it again
            const _blocks = util.thread.blockContainer._blocks
            switch (blob.block) {
                case "text": {
                    return _blocks[blob.id].fields.TEXT.value
                    break;
                }
                case "math_number": {
                    return Scratch.Cast.toNumber(_blocks[blob.id].fields.NUM.value)
                    break;
                }
            }
        }

    
        genWGSL(util, blocks) {
            let code = ""
            for (let i = 0; i < blocks.length; i++) {
                //console.log(code)
                let b = blocks[i]

                if (Array.isArray(b)) {
                    code = code.concat(this.genWGSL(util, blocks[i]))
                }
                else {
                    if (typeof b === "object") {
                        const op = b.block
                        switch (op) {
                            case "operator_equals": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util, blocks[i+1]) : this.textFromOp(util, blocks[i+1]))
                                code = code.concat(" === ") // temp
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util, blocks[i+2]) : this.textFromOp(util, blocks[i+2]))
                                i += 2
                                break;
                            }

                            case "operator_lt": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" < ") // temp
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util,blocks[i+2]))
                                i += 2
                                break;
                            }

                            case "operator_gt": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" > ") // temp
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util,blocks[i+2]))
                                i += 2
                                break;
                            }

                            case "operator_and": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" && ") // temp
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util,blocks[i+2]))
                                i += 2
                                break;
                            }

                            case "operator_or": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" || ") // temp
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util,blocks[i+2]))
                                i += 2
                                break;
                            }

                            case "operator_add": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" + ")
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util,blocks[i+2]))
                                i += 2
                                break;
                            }

                            case "operator_subtract": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" - ")
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util,blocks[i+2]))
                                i += 2
                                break;
                            }

                            case "operator_multiply": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" + ")
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util,blocks[i+2]))
                                i += 2
                                break;
                            }

                            case "operator_divide": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" + ")
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util,blocks[i+2]))
                                i += 2
                                break;
                            }

                            default: {
                                console.warn("invalid")
                                return "Invalid operator!"
                            }
                        }
                    }
                    else {
                        switch (b) {
                            case "control_if": {
                                code = code.concat("if (")
                                code = code.concat(blocks[i+1].length > 0 ? this.genWGSL(util, blocks[i+1]) : "true")
                                code = code.concat(") {\n")
                                if (blocks[i+2].length > 0) {
                                    code = code.concat(this.genWGSL(util, blocks[i+2]))
                                }
                                
                                
                                code = code.concat("\n}") // newlines for some semblance of readability
                                i += 2
                                console.log(code)
                                break;
                                // did i spell that right
                                /*
                                expected output:
                                if (condition) {
                                code
                                }
                                */
                            }

                            default: {
                                console.warn("invalid")
                                return "Invalid opcode!"
                            }
                        }
                    }
                }
            }

            return code
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
                //finalinputs.push(inputs.length)
                for (let i = 0; i < inputs.length; i++) {
                    finalinputs.push(this.genInputTree(util, thread, blocks, blocks[check].inputs[inputs[i]].block,true))
                }
                return finalinputs
            }


        }

        genBlock (util,thread,blocks,block) {
            let output = []
            if (!blocks[block].hasOwnProperty("inputs")) {
                return ""
            }
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
                //output.push(Object.getOwnPropertyNames(heldInputs).length)
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
                if (JSON.stringify(heldInputs) != JSON.stringify({}) || blocks[held].opcode === "control_if") {
                    // if the block takes inputs excluding SUBSTACK and SUBSTACK2, generate an input tree for it
                    //output.push(Object.getOwnPropertyNames(heldInputs).length)
                    if (Object.getOwnPropertyNames(heldInputs).length === 0) {
                        output.push([])
                    }
                    else {
                        for (let i = 0; i < Object.getOwnPropertyNames(heldInputs).length; i++) {
                            output.push(this.genInputTree(util,thread,blocks,heldInputs[Object.getOwnPropertyNames(heldInputs)[i]].block,true))
                        }
                    }
                }
                else {
                    console.log(JSON.stringify(heldInputs) + " does not require a tree")
                }
                if (blocks[held].inputs.hasOwnProperty("SUBSTACK") || blocks[held].opcode === "control_if") {
                    if (blocks[held].opcode === "control_if" && !blocks[held].inputs.hasOwnProperty("SUBSTACK") && !blocks[held].inputs.hasOwnProperty("SUBSTACK2")) {
                        output.push([])
                        console.log("added []")
                    }
                    else {
                        output.push(this.compile(util,thread,blocks,blocks[held].inputs.SUBSTACK.block,true))
                    }
                    
                }
                if (blocks[held].inputs.hasOwnProperty("SUBSTACK2")) { // remember to check if it's an empty if-else
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
            const e = this.compile(util,threads[0],threads[0].blockContainer._blocks,threads[0].topBlock,false)
            console.log(e)
            console.log(this.genWGSL(util, e))
        }

        declareVar (args, util) {
            // this block does nothing <3
        }
        
        runGPU (args, util) {

                // Define global buffer size
            const BUFFER_SIZE = 1000;

            const shader = `
            @group(0) @binding(0)
            var<storage, read_write> output: array<f32>;

            @compute @workgroup_size(64)
            fn main(
            @builtin(global_invocation_id)
            global_id : vec3u,

            @builtin(local_invocation_id)
            local_id : vec3u,
            ) {
            // Avoid accessing the buffer out of bounds
            if (global_id.x >= ${BUFFER_SIZE}) {
                return;
            }

            output[global_id.x] =
                f32(global_id.x) * 1000. + f32(local_id.x);
            }
            `;
            const output = device.createBuffer({
                size: BUFFER_SIZE,
                // @ts-ignore
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            });
            
            const stagingBuffer = device.createBuffer({
                size: BUFFER_SIZE,
                // @ts-ignore
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });

            const shaderModule = device.createShaderModule({
                code: shader,
            })

            const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                binding: 0,
                // @ts-ignore
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                },
                },
            ],
            });

            const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                binding: 0,
                resource: {
                    buffer: output,
                },
                },
            ],
            });
            
            const computePipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
            }),
            compute: {
                module: shaderModule,
                entryPoint: "main",
            },
            });
            
            // @ts-ignore
            const commandEncoder = device.createCommandEncoder();
            // @ts-ignore
            const passEncoder = commandEncoder.beginComputePass()
            passEncoder.setPipeline(computePipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.dispatchWorkgroups(Math.ceil(BUFFER_SIZE / 64));

            passEncoder.end();

            // Copy output buffer to staging buffer
            commandEncoder.copyBufferToBuffer(
                output,
                0, // Source offset
                stagingBuffer,
                0, // Destination offset
                BUFFER_SIZE,
            );
            
            // End frame by passing array of command buffers to command queue for execution
            device.queue.submit([commandEncoder.finish()]);
    
            // map staging buffer to read results back to JS
            // let data = ["you done messed up"]
            // stagingBuffer.mapAsync(
            //     // @ts-ignore
            //     GPUMapMode.READ,
            //     0, // Offset
            //     BUFFER_SIZE, // Length
            // ).then((value) => {
            //     const copyArrayBuffer = stagingBuffer.getMappedRange(0, BUFFER_SIZE)
            //     data = copyArrayBuffer.slice()
            //     stagingBuffer.unmap();
            // },
            // (reason) => {
            //     console.log(reason)
            // })
            
            
            
            // console.log(new Float32Array(data));


            
            // map staging buffer to read results back to JS
            stagingBuffer.mapAsync(
                // @ts-ignore
                GPUMapMode.READ,
                0, // Offset
                BUFFER_SIZE, // Length
            ).then((value) => {
                const copyArrayBuffer = stagingBuffer.getMappedRange(0, BUFFER_SIZE)
                const data = copyArrayBuffer.slice();
                stagingBuffer.unmap();
                console.log(new Float32Array(data));
            });
            
            // const copyArrayBuffer = stagingBuffer.getMappedRange(0, BUFFER_SIZE);
            // const data = copyArrayBuffer.slice();
            // stagingBuffer.unmap();
            // console.log(new Float32Array(data));
            
  

            // notes:
            /*
            most of this can stay the same across multiple modules, the only things that might change
            are the different input buffers and their usage, but that can probably be generated
            fairly easily

            this documentation is horrible, i'm fairly sure the writer forgot they were writing about
            compute shaders halfway through and then just decided to talk about render shaders

            */
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new DerpysExtension())
})(Scratch);