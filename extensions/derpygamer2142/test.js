// Name: GPU.sb3
// ID: gpusb3
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
                id: "gpusb3",
                name: "GPU.sb3",

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
                        opcode: "runGPU",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Run [CODE] on the gpu",
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    },


                    {
                        blockType: "label",
                        text: "WGSL Blocks"
                    },


                    {
                        opcode: "declareVar",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "declare [VARTYPE] variable as [NAME] with value [VALUE]: [TYPE]",
                        arguments: {
                            VARTYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "VARTYPES",
                                defaultValue: "var"
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someVariable"
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 12
                            },
                            
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "TYPES",
                                defaultValue: "auto"
                            }
                        }
                    },
                    {
                        opcode: "getVar",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get variable [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someVariable"
                            }
                        }
                    },
                    {
                        opcode: "wgslFunc",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "WGSL builin [OPERATION] with args [VALUE]",
                        arguments: {
                            OPERATION: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "WGSLFUNCS",
                                defaultValue: "trunc"
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "12.345"
                            }
                        }
                    },
                    {
                        opcode: "funcArgs",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Func arg [ARG], next [NEXT]",
                        arguments: {
                            ARG: { // yee haw i'm a pirate
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "15"
                            },
                            NEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },

                    {
                        opcode: "computeFunc",
                        blockType: Scratch.BlockType.CONDITIONAL,
                        text: "Computer shader with workgroup size [WGSIZE]",
                        arguments: {
                            WGSIZE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: JSON.stringify([2, 3, 4])
                            }
                        },
                        branchCount: 1
                    }
                ],
                menus: {
                    TYPES: {
                        acceptReporters: true, // i don't like this, but with acceptReporters as false it shows up in fields and not inputs.
                        items: [
                            "i32",
                            "u32",
                            "f32",
                            "bool",
                            "auto"
                            // f16?
                        ]
                    },
                    VARTYPES: {
                        acceptReporters: true,
                        items: [
                            "var",
                            "let",
                            "const"
                        ]
                    },

                    VAROPS: {
                        acceptReporters: true,
                        items: [
                            "=",
                            "+=",
                            "-=",
                            "*=",
                            "/=",
                            "%=",
                            "&=",
                            "|=",
                            "^=",
                            ">>=",
                            "<<="
                        ]
                    },

                    WGSLFUNCS: {
                        // every WGSL builtin function
                        acceptReporters: true,
                        items: [
                            "all",
                            "any",
                            "arrayLength",
                            "asinh", // screw atomics, i can add them later
                            "bitcast",
                            "cosh",
                            "countLeadingZeros",
                            "countOneBits",
                            "countTrailingZeros",
                            "degrees",
                            "determinant",
                            /*"dpdx",
                            "dpdxCoarse",
                            "dpdxFine",
                            "dpdy",
                            "dpdyCoarse",
                            "dpdyFine",*/
                            "exp",
                            "exp2",
                            "firstLeadingBit",
                            "firstTrailingBit",
                            "fract",
                            "frexp",
                            "inverseSqrt",
                            "length",
                            "log",
                            "log2",
                            "modf",
                            "normalize",
                            "pack2x16float",
                            "pack2x16snorm",
                            "pack2x16unorm",
                            "pack4x8snorm",
                            "pack4x8unorm",
                            "quantizeToF16",
                            "radians",
                            "reverseBits",
                            "saturate",
                            "sign",
                            "sinh",
                            "tanh",
                            // textureDimensions?
                            "textureNumLayers",
                            "textureNumLevels",
                            "textureNumSamples",
                            "transpose",
                            "trunc",
                            "unpack2x16float",
                            "unpack2x16snorm",
                            "unpack2x16unorm",
                            "unpack4x8snorm",
                            "unpack4x8unorm"
                        ]
                    }
                    
                }
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
                    return _blocks[blob.id].fields.NUM.value
                    break;
                }
                case "gpusb3_menu_VARTYPES": {
                    return _blocks[blob.id].fields.VARTYPES.value
                    break;
                }
                case "gpusb3_menu_TYPES": {
                    return _blocks[blob.id].fields.TYPES.value
                    break;
                }

                case "gpusb3_menu_WGSLFUNCS": {
                    return _blocks[blob.id].fields.WGSLFUNCS.value
                    break;
                }
            }
        }

        findType(input) {
            switch (typeof input) {
                case "string": {
                    if (Number.isNaN(Number.parseFloat(input))) {
                        if (input.toLowerCase() === "true" || input.toLowerCase() === "false") {
                            return "boolean"
                        }
                        else if (input.toLowerCase() === "undefined") {
                            return "undefined"
                        }
                        else if (input.toLowerCase() === "null") {
                            return "null"
                        }
                        else {
                            return "Error!"
                        }
                    }
                    else {
                        return this.findType(Number.parseFloat(input))
                    }
                }
                case "number": {
                    if (Number.isInteger(input)) {
                        return "integer"
                    }
                    else if (Number.isNaN(input)) {
                        return "NaN"
                    }
                    else if (!Number.isFinite(input)) {
                        return "infinity"
                    }
                    else {
                        return "float"
                    }
                }
                case "boolean": {
                    return "boolean"
                }
                case "undefined": {
                    return "undefined"
                }
                case "object": {
                    if (input === null) {
                        return "null"
                    }
                }
            }
        }

        resolveInput(util, block) {
            return Array.isArray(block) ? this.genWGSL(util,block) : this.textFromOp(util,block)
        }

        isStringified(text) {
            console.log(typeof text)
            try {
                
                JSON.parse(text)
                console.log("whar")
                return true
            }
            catch {
                console.log(JSON.stringify(text) + " is not json.")
                return false
            }
            return false
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
                                code = code.concat(" (")
                                code = code.concat(this.resolveInput(util, blocks[i+1]))
                                code = code.concat(" == ") // temp
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_lt": {
                                code = code.concat(" (")
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" < ")
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_gt": {
                                code = code.concat(" (")
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" > ")
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_and": {
                                code = code.concat(" (")
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" && ")
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_or": {
                                code = code.concat(" (")
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" || ")
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_add": {
                                code = code.concat(" (")
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" + ")
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_subtract": {
                                code = code.concat(" (")
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" - ")
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_multiply": {
                                code = code.concat(" (")
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" * ")
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_divide": {
                                code = code.concat(" (")
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" / ")
                                code = code.concat(this.resolveInput(util, blocks[i+2]))
                                code = code.concat(") ")
                                i += 2
                                break;
                            }

                            case "operator_mod": {
                                code = code.concat(" (")
                                code = code.concat(this.resolveInput(util,blocks[i+1]))
                                code = code.concat(" % ")
                                code = code.concat(this.resolveInput(util,blocks[i+2]))
                                i += 2
                                break;
                            }
                            

                            case "operator_mathop": {
                                /*
                                from https://github.com/TurboWarp/scratch-vm/blob/11eec6604d766dc75fc5eb223b7bd31f167fee88/src/blocks/scratch3_operators.js

                                case 'abs': return Math.abs(n);
                                case 'floor': return Math.floor(n);
                                case 'ceiling': return Math.ceil(n);
                                case 'sqrt': return Math.sqrt(n);
                                case 'sin': return Math.round(Math.sin((Math.PI * n) / 180) * 1e10) / 1e10;
                                case 'cos': return Math.round(Math.cos((Math.PI * n) / 180) * 1e10) / 1e10;
                                case 'tan': return MathUtil.tan(n);
                                case 'asin': return (Math.asin(n) * 180) / Math.PI;
                                case 'acos': return (Math.acos(n) * 180) / Math.PI;
                                case 'atan': return (Math.atan(n) * 180) / Math.PI;
                                case 'ln': return Math.log(n);
                                case 'log': return Math.log(n) / Math.LN10;
                                case 'e ^': return Math.exp(n);
                                case '10 ^': return Math.pow(10, n);
                                */
                                let op = "How do you mess up this badly?"
                                let trad = false
                                let actualop = util.thread.blockContainer._blocks[b.id].fields.OPERATOR.value
                                switch (actualop) {
                                    case "abs": {
                                        op = "abs"
                                        break;
                                    }

                                    case "floor": {
                                        op = "floor"
                                        break;
                                    }

                                    case "ceiling": {
                                        op = "ceil"
                                        break;
                                    }

                                    case "sqrt": {
                                        op = "sqrt"
                                        break;
                                    }

                                    case "sin": {
                                        op = "sin"
                                        trad = true
                                        break;
                                    }

                                    case "cos": {
                                        op = "cos"
                                        trad = true
                                        break;
                                    }

                                    case "tan": {
                                        op = "tan"
                                        trad = true
                                        break;
                                    }

                                    case "asin": {
                                        op = "asin"
                                        trad = true
                                        break;
                                    }

                                    case "acos": {
                                        op = "acos"
                                        trad = true
                                        break;
                                    }

                                    case "atan": {
                                        op = "atan"
                                        trad = true
                                        break;
                                    }

                                    case "ln": {
                                        op = "log" // confusing
                                        break;
                                    }

                                    case "log": {
                                        op = "log" // special behavior below
                                        break;
                                    }

                                    case "e ^": {
                                        op = "exp"
                                        break;
                                    }

                                    case "10 ^": {
                                        op = "pow"
                                        break;
                                    }
                                }
                                code = code.concat(op)
                                code = code.concat(op === "pow" ? "(10.0, " : "(")
                                let num = Scratch.Cast.toNumber(this.textFromOp(util,blocks[i+1]))// * (trad ? Math.PI / 180 : 1)
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1]) : Number.isInteger(num) ? Scratch.Cast.toString(num) + ".0" : Scratch.Cast.toString(num))
                                console.warn("Converted integer to float!")
                                code = code.concat(actualop === "log" ? ") / " + Scratch.Cast.toString(Math.LN10) : ")")
                                i += 2
                                break;
                            }

                            case "gpusb3_wgslFunc": {
                                if (Array.isArray(blocks[i+1])) {
                                    console.error("Function should not have an input!")
                                    return "Unexpected input in function input!"
                                }
                                code = code.concat(Array.isArray(blocks[i+1]) ? "error!" : this.textFromOp(util,blocks[i+1]))
                                code = code.concat("(")
                                code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2]) : this.textFromOp(util, blocks[i+2]))
                                code = code.concat(")")
                                i += 2
                                break;
                            }

                            case "gpusb3_funcArgs": {
                                
                                code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util, blocks[i+1]) : this.textFromOp(util, blocks[i+1]))

                                if (Array.isArray(blocks[i+2])) {
                                    code = code.concat(", ")
                                    console.log(blocks[i+2].length)
                                    code = code.concat(this.genWGSL(util, blocks[i+2]))
                                }
                                else if (this.textFromOp(util,blocks[i+2]) !== "") {
                                    code = code.concat(", ")
                                    code = code.concat(this.textFromOp(util,blocks[i+2]))
                                }
                                i += 2
                                break;
                            }

                            default: {
                                console.warn("Invalid operator! Did you forget the i += (# of inputs)?")
                                return "Invalid operator!"
                            }
                        }
                    }
                    else {
                        switch (b) {
                            case "control_if": {
                                code = code.concat("if (")
                                code = code.concat(blocks[i+1].length > 0 ? this.genWGSL(util, blocks[i+1]) : "true")
                                if (blocks[i+1].length <= 0) {
                                    console.warn("If statement missing condition, defaulting to true!")
                                }
                                code = code.concat(") {\n")
                                if (blocks[i+2].length > 0) {
                                    code = code.concat(this.genWGSL(util, blocks[i+2]))
                                }
                                
                                code = code.concat("\n}") // newlines for some semblance of readability
                                i += 2
                                break;
                                // did i spell that right
                                /*
                                expected output:
                                if (condition) {
                                code
                                }
                                */
                            }

                            case "gpusb3_declareVar": {
                                code = code.concat(Array.isArray(blocks[i+1]) ? "var" : this.textFromOp(util,blocks[i+1]))
                                code = code.concat(" ")
                                code = code.concat(Array.isArray(blocks[i+2]) ? "_" : this.textFromOp(util,blocks[i+2]))
                                const t = Array.isArray(blocks[i+4]) ? "auto" : this.textFromOp(util,blocks[i+4])
                                if (t !== "auto") {
                                    code = code.concat(": ")
                                    code = code.concat(t)
                                }
                                code = code.concat(" = ")
                                code = code.concat(Array.isArray(blocks[i+3]) ? this.genWGSL(util, blocks[i+3]) : this.textFromOp(util,blocks[i+3]))
                                code = code.concat(";\n")
                                i += 4
                                break;
                            }

                            case "gpusb3_computeFunc": {
                                code = code.concat(`@compute @workgroup_size(${Array.isArray(blocks[i+1]) ? "64" : (this.isStringified(this.textFromOp(util, blocks[i+1])) ? JSON.parse(this.textFromOp(util, blocks[i+1])) : "64")}) fn computeShader(
@builtin(workgroup_id) workgroup_id : vec3<u32>,
@builtin(local_invocation_id) local_invocation_id : vec3<u32>,
@builtin(global_invocation_id) global_invocation_id : vec3<u32>,
@builtin(local_invocation_index) local_invocation_index: u32,
@builtin(num_workgroups) num_workgroups: vec3<u32>
                                ) {\n\n`)
                                    if (blocks[i+2].length > 0) {
                                        code = code.concat(this.genWGSL(util, blocks[i+2]))
                                    }
                                    else {
                                        code = code.concat("return;")
                                    }
                                    
                                    code = code.concat("\n}") // newlines for some semblance of readability
                                    i += 2
                                    break;
                                    // did i spell that right
                                    /*
                                    expected output:
                                    @compute @workgroup_size(workgroup size) fn computeShader(
                                    @builtin(workgroup_id) workgroup_id : vec3<u32>,
                                    @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
                                    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
                                    @builtin(local_invocation_index) local_invocation_index: u32,
                                    @builtin(num_workgroups) num_workgroups: vec3<u32>
                                    ) {

                                    code

                                    }
                                    */
                            }

                            default: {
                                console.warn("Invalid block! Did you forget the i += (# of inputs)?")
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
                if (JSON.stringify(heldInputs) != JSON.stringify({}) || blocks[held].opcode === "control_if" || blocks[held].opcode === "gpusb3_computeFunc") {
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
                if (blocks[held].inputs.hasOwnProperty("SUBSTACK") || blocks[held].opcode === "control_if" || blocks[held].opcode === "gpusb3_computeFunc") {
                    if ((blocks[held].opcode === "control_if" || blocks[held].opcode === "gpusb3_computeFunc") && !blocks[held].inputs.hasOwnProperty("SUBSTACK") && !blocks[held].inputs.hasOwnProperty("SUBSTACK2")) {
                        output.push([])
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
            let threads = util.startHats("gpusb3_compileHat") // this is cringe but idrc, it's temporary
            if (threads.length > 0) {
                threads.forEach((t) => {
                t.tryCompile()
                })
                console.log(util)
                const e = this.compile(util,threads[0],threads[0].blockContainer._blocks,threads[0].topBlock,false)
                console.log(e)
                console.log(this.genWGSL(util, e))
            }
            
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

        getVar(args, util) {
            return "This block lets you get variables in your function."
        }

        declareVar (args, util) {
            return 0 // command, so no return
        }

        wgslFunc(args,util) {
            return "This block has a bunch of WGSL builtin functions."
        }

        funcArgs(args,util) {
            return "Chain multiple of this block together to create function inputs."
        }

        computeFunc(args, util) {
            return 0 // conditional, no return
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new DerpysExtension())
})(Scratch);