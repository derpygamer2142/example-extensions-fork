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
    let shaders = {}
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
                        text: "uhhh idk name [NAME] other thing [GPUARGS]",
                        isEdgeActivated: false,
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "myGPUFunction"
                            },
                            GPUARGS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "placeholder"
                            }
                        }
                    },

                    {
                        opcode: "gpuFuncArgDef",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Def GPU func arg [ARGNAME] type [ARGTYPE] next [NEXT]", // argtype may or may not do anything in the future, i need to learn more about wgpu
                        arguments: {
                            ARGNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someArg"
                            },
                            ARGTYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "GPUFUNCARGTYPES",
                                defaultValue: "placeholder"
                            },
                            NEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },
                    {
                        opcode: "compileStart",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "run the compiley thingy "
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
                        opcode: "varOp",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Variable [VARNAME] [VAROP]  [INPUT]",
                        arguments: {
                            VARNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someVariable"
                            },
                            VAROP: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "VAROPS",
                                defaultValue: "+="
                            },
                            INPUT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "8"
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
                        text: "Func arg input [ARG], next [NEXT]",
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
                    },

                    {
                        opcode: "wgslForLoop",
                        blockType: Scratch.BlockType.CONDITIONAL, // this isn't a conditional :trol:
                        text: "For [VARNAME] in range [START], [END]",
                        arguments: {
                            VARNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "i"
                            },
                            START: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            END: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        },
                        branchCount: 1
                    },

                    {
                        opcode: "defFuncArgs",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Def arg [ARGNAME]: [ARGTYPE], next [NEXTARG]",
                        arguments: {
                            ARGNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someArg"
                            },
                            ARGTYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "RAWTYPES",
                                defaultValue: "i32"
                            },
                            NEXTARG: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },

                    {
                        opcode: "defFunc",
                        blockType: Scratch.BlockType.CONDITIONAL,
                        text: "Def function [FUNCNAME] that returns type [TYPE] with args [ARGS]",
                        arguments: {
                            FUNCNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "myFunc"
                            },
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "FUNCTYPES",
                                defaultValue: "void"
                            }/*,
                            ARGS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }*/
                        }
                    },

                    {
                        opcode: "getFuncArg",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Function arg [ARGNAME]",
                        arguments: {
                            ARGNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someArg"
                            }
                        }
                    },

                    {
                        opcode: "funcReturn",
                        blockType: Scratch.BlockType.COMMAND,
                        isTerminal: true,
                        text: "Return [TORETURN]",
                        arguments: {
                            TORETURN: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                            
                        }
                    },

                    {
                        opcode: "c_runFunc",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Run function [FUNCNAME] with args [ARGS]",
                        arguments: {
                            FUNCNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "myFunc"
                            },
                            ARGS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },

                    {
                        opcode: "r_runFunc",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Run function [FUNCNAME] with args [ARGS]",
                        arguments: {
                            FUNCNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "myFunc"
                            },
                            ARGS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
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
                            "bool",
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
                            "f32",
                            "firstLeadingBit",
                            "firstTrailingBit",
                            "fract",
                            "frexp",
                            "i32",
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
                            "u32",
                            "unpack2x16float",
                            "unpack2x16snorm",
                            "unpack2x16unorm",
                            "unpack4x8snorm",
                            "unpack4x8unorm"
                        ]
                    },

                    FUNCTYPES: {
                        acceptReporters: true,
                        items: [
                            "i32",
                            "u32",
                            "f32",
                            "bool",
                            "void"
                        ]
                    },
                    RAWTYPES: {
                        acceptReporters: true,
                        items: [
                            "i32",
                            "u32",
                            "f32",
                            "bool"
                        ]
                    },
                    GPUFUNCARGTYPES: {
                        acceptReporters: true,
                        items: [
                            "placeholder",
                            "placeholder",
                            "placeholder"
                        ]
                    }
                    
                }
            };

        }

        textFromOp(util, blob, unsafe) {
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
                case "gpusb3_menu_VAROPS": {
                    return _blocks[blob.id].fields.VAROPS.value
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
                case "gpusb3_menu_FUNCTYPES": {
                    return _blocks[blob.id].fields.FUNCTYPES.value
                    break;
                }
                case "gpusb3_menu_RAWTYPES": {
                    return _blocks[blob.id].fields.RAWTYPES.value
                    break;
                }

                case "gpusb3_menu_GPUFUNCARGTYPES": {
                    return _blocks[blob.id].fields.GPUFUNCARGTYPES.value
                    break;
                }

                default: {
                    if (unsafe) {
                        return false
                    }
                    console.warn("Input type not found, did you forget to add a menu?")
                    return "Input type not found!"
                    
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
            return Array.isArray(block) ? this.genWGSL(util,block, false, 0) : this.textFromOp(util,block,false)
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
    
        genWGSL(util, blocks, isGeneratingArgumentsBecauseTheOtherThingITriedDidntWork, recursionDepth) { // for those wondering about isGeneratingArgumentsBecauseTheOtherThingITriedDidntWork, see https://github.com/derpygamer2142/example-extensions-fork/commit/bed128377314a95f6cf2775ed4771cf08d3f3e7e
            let code = recursionDepth === 0 && isGeneratingArgumentsBecauseTheOtherThingITriedDidntWork ? "[" : ""
            for (let i = 0; i < blocks.length; i++) {
                //console.log(code)
                let b = blocks[i]
                if (Array.isArray(b)) {
                    code = code.concat(this.genWGSL(util, blocks[i], false, recursionDepth+1))
                }
                else {
                    if (isGeneratingArgumentsBecauseTheOtherThingITriedDidntWork) {
                        console.log("thing")
                        if (typeof b === "object") {
                            //const op = b.block

                            switch (b.block) {
                                case "gpusb3_gpuFuncArgDef": {
                                    if (Array.isArray(blocks[i+1]) || Array.isArray(blocks[i+2])) {
                                        console.warn("Unexpected input for Def gpu func args block!")
                                        return "Unexpected input for Def gpu func args block!"
                                    }
                                    let argobj = {}
                                    argobj.name = this.textFromOp(util, blocks[i+1], false)
                                    argobj.type = this.textFromOp(util, blocks[i+2], false)
                                    code = code.concat(JSON.stringify(argobj))
                                    if (Array.isArray(blocks[i+3])) {
                                        code = code.concat(",")
                                        console.log(recursionDepth)
                                        code = code.concat(this.genWGSL(util,blocks[i+3],isGeneratingArgumentsBecauseTheOtherThingITriedDidntWork,recursionDepth+1))
                                        
                                    }
                                    
                                    
                                    i += 3
                                    break;
                                }

                                default: {
                                    console.warn("Invalid operator! Did you forget the i += (# of inputs)?")
                                    return "Invalid operator!"
                                }
                            }

                            
                        }
                        else {
                            console.warn("you probably put the wrong block in the wrong place and bad things are happening")
                            // this shouldn't happen.
                            // if it did, everything is probably on fire.
                        }
                    }
                    else {
                        
                        if (typeof b === "object") {
                            console.log(b)
                            //const op = b.block

                            switch (b.block) {
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
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat(" < ")
                                    code = code.concat(this.resolveInput(util, blocks[i+2]))
                                    code = code.concat(") ")
                                    i += 2
                                    break;
                                }

                                case "operator_gt": {
                                    code = code.concat(" (")
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat(" > ")
                                    code = code.concat(this.resolveInput(util, blocks[i+2]))
                                    code = code.concat(") ")
                                    i += 2
                                    break;
                                }

                                case "operator_and": {
                                    code = code.concat(" (")
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat(" && ")
                                    code = code.concat(this.resolveInput(util, blocks[i+2]))
                                    code = code.concat(") ")
                                    i += 2
                                    break;
                                }

                                case "operator_or": {
                                    code = code.concat(" (")
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat(" || ")
                                    code = code.concat(this.resolveInput(util, blocks[i+2]))
                                    code = code.concat(") ")
                                    i += 2
                                    break;
                                }

                                case "operator_add": {
                                    code = code.concat(" (")
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat(" + ")
                                    code = code.concat(this.resolveInput(util, blocks[i+2]))
                                    code = code.concat(") ")
                                    i += 2
                                    break;
                                }

                                case "operator_subtract": {
                                    code = code.concat(" (")
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat(" - ")
                                    code = code.concat(this.resolveInput(util, blocks[i+2]))
                                    code = code.concat(") ")
                                    i += 2
                                    break;
                                }

                                case "operator_multiply": {
                                    code = code.concat(" (")
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat(" * ")
                                    code = code.concat(this.resolveInput(util, blocks[i+2]))
                                    code = code.concat(") ")
                                    i += 2
                                    break;
                                }

                                case "operator_divide": {
                                    code = code.concat(" (")
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util,blocks[i+1],false))
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
                                    let num = Scratch.Cast.toNumber(this.textFromOp(util,blocks[i+1],false))// * (trad ? Math.PI / 180 : 1)
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : Number.isInteger(num) ? Scratch.Cast.toString(num) + ".0" : Scratch.Cast.toString(num))
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
                                    code = code.concat(Array.isArray(blocks[i+1]) ? "error!" : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat("(")
                                    code = code.concat(Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2],false,recursionDepth+1) : this.textFromOp(util, blocks[i+2],false))
                                    code = code.concat(")")
                                    i += 2
                                    break;
                                }

                                case "gpusb3_funcArgs": {
                                    
                                    code = code.concat(Array.isArray(blocks[i+1]) ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : this.textFromOp(util, blocks[i+1],false))

                                    if (Array.isArray(blocks[i+2])) {
                                        code = code.concat(", ")
                                        code = code.concat(this.genWGSL(util,blocks[i+2],false,recursionDepth+1))
                                    }
                                    else if (this.textFromOp(util,blocks[i+2],false) !== "") {
                                        code = code.concat(", ")
                                        code = code.concat(this.textFromOp(util,blocks[i+2],false))
                                    }
                                    i += 2
                                    break;
                                }

                                case "gpusb3_getVar": {
                                    code = code.concat(Array.isArray(blocks[i+1]) ? "_" : this.textFromOp(util, blocks[i+1],false)) // if your variable name is invalid it's your own fault
                                    i += 1
                                    break;
                                }

                                case "gpusb3_defFuncArgs": {
                                    if (Array.isArray(blocks[i+1])) {
                                        console.warn("Unexpectecd input for function args definition!")
                                        return "Unexpectecd input for function args definition!"
                                    }
                                    if (Array.isArray(blocks[i+2])) {
                                        console.warn("Unexpected input for function args type!")
                                        return "Unexpected input for function args type!"
                                    }
                                    code = code.concat(`${this.textFromOp(util,blocks[i+1],false)}: ${this.textFromOp(util, blocks[i+2],false)}`)
                                    if (Array.isArray(blocks[i+3])) {
                                        code = code.concat(`, ${this.genWGSL(util,blocks[i+3],false,recursionDepth+1)}`)
                                    }
                                    i += 3
                                    break;
                                }

                                case "gpusb3_getFuncArg": {
                                    if (Array.isArray(blocks[i+1])) {
                                        console.warn("Unexpected input for arg name!")
                                        return "Unexpected input for arg name!"
                                    }
                                    code = code.concat(this.textFromOp(util, blocks[i+1],false))
                                    i += 1
                                    break;
                                }

                                case "gpusb3_r_runFunc": {
                                    if (Array.isArray(blocks[i+1])) {
                                        console.warn("Unexpected input for function name!")
                                        return "Unexpected input for function name!"
                                    }
                                    code = code.concat(this.textFromOp(util, blocks[i+1],false))
                                    code = code.concat(`(${Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2],false,recursionDepth+1) : this.textFromOp(util, blocks[i+2],false)})`)
                                    i += 2;
                                    break;
                                }

                                default: {
                                    console.warn("Invalid operator! Did you forget the i += (# of inputs)?") // this is to idiot proof it from myself, me am big smort
                                    return "Invalid operator!"
                                }
                            }
                        }
                        else {
                            switch (b) {
                                case "control_if": {
                                    code = code.concat("if (")
                                    code = code.concat(blocks[i+1].length > 0 ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : "true")
                                    if (blocks[i+1].length <= 0) {
                                        console.warn("If statement missing condition, defaulting to true!")
                                    }
                                    code = code.concat(") {\n")
                                    if (blocks[i+2].length > 0) {
                                        code = code.concat(this.genWGSL(util,blocks[i+2],false,recursionDepth+1))
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

                                case "control_if_else": {
                                    code = code.concat("if (")
                                    code = code.concat(blocks[i+1].length > 0 ? this.genWGSL(util,blocks[i+1],false,recursionDepth+1) : "true")
                                    if (blocks[i+1].length <= 0) {
                                        console.warn("If statement missing condition, defaulting to true!")
                                    }
                                    code = code.concat(") {\n")
                                    if (blocks[i+2].length > 0) {
                                        code = code.concat(this.genWGSL(util,blocks[i+2],false,recursionDepth+1))
                                    }
                                    
                                    code = code.concat("\n}\nelse {\n") // newlines for some semblance of readability
                                    if (blocks[i+3].length > 0) {
                                        code = code.concat(this.genWGSL(util,blocks[i+3],false,recursionDepth+1))
                                    }
                                    code = code.concat("\n}\n")
                                    i += 3
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
                                    code = code.concat(Array.isArray(blocks[i+1]) ? "var" : this.textFromOp(util,blocks[i+1],false))
                                    code = code.concat(" ")
                                    code = code.concat(Array.isArray(blocks[i+2]) ? "_" : this.textFromOp(util,blocks[i+2],false))
                                    const t = Array.isArray(blocks[i+4]) ? "auto" : this.textFromOp(util,blocks[i+4],false)
                                    if (t !== "auto") {
                                        code = code.concat(": ")
                                        code = code.concat(t)
                                    }
                                    code = code.concat(" = ")
                                    code = code.concat(Array.isArray(blocks[i+3]) ? this.genWGSL(util,blocks[i+3],false,recursionDepth+1) : this.textFromOp(util,blocks[i+3],false))
                                    code = code.concat(";\n")
                                    i += 4
                                    break;
                                }

                                case "gpusb3_varOp": {
                                    if (Array.isArray(blocks[i+1])) {
                                        console.warn("Unexpected input for variable name!")
                                        return "Unexpected input for variable name!"
                                    }
                                    if (Array.isArray(blocks[i+2])) {
                                        console.warn("Unexpected input for variable operation!")
                                        return "Unexpected input for variable operation!"
                                    }
                                    code = code.concat(this.textFromOp(util, blocks[i+1],false))
                                    code = code.concat(` ${this.textFromOp(util, blocks[i+2],false)} ${Array.isArray(blocks[i+3]) ? this.genWGSL(util,blocks[i+3],false,recursionDepth+1) : this.textFromOp(util, blocks[i+3],false)};\n`)

                                    i += 3
                                    break;
                                }

                                case "gpusb3_computeFunc": {
                                    code = code.concat(`@group(0) @binding(0) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(${Array.isArray(blocks[i+1]) ? "64" : (this.isStringified(this.textFromOp(util, blocks[i+1],false)) ? JSON.parse(this.textFromOp(util, blocks[i+1],false)) : "64")}) fn computeShader(
@builtin(workgroup_id) workgroup_id : vec3<u32>,
@builtin(local_invocation_id) local_invocation_id : vec3<u32>,
@builtin(global_invocation_id) global_invocation_id : vec3<u32>,
@builtin(local_invocation_index) local_invocation_index: u32,
@builtin(num_workgroups) num_workgroups: vec3<u32>
                                    ) {\n\n`)
                                        if (blocks[i+2].length > 0) {
                                            code = code.concat(this.genWGSL(util,blocks[i+2],false,recursionDepth+1))
                                        }
                                        else {
                                            code = code.concat("return;")
                                        }
                                        
                                        code = code.concat("}\n") // newlines for some semblance of readability
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

                                case "gpusb3_wgslForLoop": {
                                    if (Array.isArray(blocks[i+1])) {
                                        console.warn("Unexpected input for variable!")
                                        return "Unexpected input for variable!"
                                    }
                                    code = code.concat(`
    var ${Array.isArray(blocks[i+1]) ? "Error!" : this.textFromOp(util, blocks[i+1],false)} = ${this.resolveInput(util, blocks[i+2])};
    loop {
    ${Array.isArray(blocks[i+1]) ? "Error!" : this.textFromOp(util, blocks[i+1],false)}++;
    if (${Array.isArray(blocks[i+1]) ? "Error!" : this.textFromOp(util, blocks[i+1],false)} > ${this.resolveInput(util,blocks[i+3])}) {
    break;
    };

    ` // GOD FUCKING DAMN IT "break if (condition)" IS IN THE OFFICIAL SPEC WHY THE HELL IS IT INVALID THIS IS BULLSHIT
    // I HAD TO GO OUT OF MY WAY AND SPEND 15 SECONDS CHANGING THIS CODE
                                    )
                                        if (blocks[i+4].length > 0) {
                                            code = code.concat(this.genWGSL(util,blocks[i+4],false,recursionDepth+1))
                                        }
                                        else {
                                            code = code.concat("break;")
                                        }
                                        
                                        code = code.concat("}\n") // newlines for some semblance of readability
                                        i += 4
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
                                
                                case "gpusb3_defFunc": {
                                    if (Array.isArray(blocks[i+1])) {
                                        console.warn("Unexpected input for function name!")
                                        return "Unexpected input for function name!"
                                    }
                                    if (Array.isArray(blocks[i+2])) {
                                        console.warn("Unexpected input for function return type!")
                                        return "Unexpected input for function return type!"
                                    }
                                    code = code.concat(`fn ${this.textFromOp(util, blocks[i+1],false)}(`)
                                    if (blocks[i+3] !== null) {
                                        if (Array.isArray(blocks[i+3])) {
                                            code = code.concat(this.genWGSL(util,blocks[i+3],false,recursionDepth+1))
                                        }
                                        else {
                                            code = code.concat(this.textFromOp(util, blocks[i+3],false))
                                        }
                                    }
                                    code = code.concat(this.textFromOp(util, blocks[i+2],false) === "void" ? ") {\n" : `) -> ${this.textFromOp(util, blocks[i+2],false)} {\n`)
                                    if (blocks[i+4].length > 0) {
                                        code = code.concat(this.genWGSL(util,blocks[i+4],false,recursionDepth+1))
                                    }
                                    else {
                                        code = code.concat(`return ${this.textFromOp(util, blocks[i+2],false) === "void" ? "" : this.textFromOp(util, blocks[i+2],false)}();\n`) // return a constructor for whatever type it should return
                                    }
                                    
                                    code = code.concat("}\n") // newlines for some semblance of readability
                                    i += 4
                                    break;
                                }

                                case "gpusb3_funcReturn": {
                                    code = code.concat(`return`)
                                    if (Array.isArray(blocks[i+1])) {
                                        code = code.concat(" ")
                                        code = code.concat(this.genWGSL(util,blocks[i+1],false,recursionDepth+1))
                                    }
                                    else if (this.textFromOp(util, blocks[i+1],false) !== "") {
                                        code = code.concat(" ")
                                        code = code.concat(this.textFromOp(util, blocks[i+1],false))
                                    }
                                    code = code.concat(";\n")
                                    i += 1
                                    break;
                                }

                                case "gpusb3_c_runFunc": {
                                    if (Array.isArray(blocks[i+1])) {
                                        console.warn("Unexpected input for function name!")
                                        return "Unexpected input for function name!"
                                    }
                                    code = code.concat(this.textFromOp(util, blocks[i+1],false))
                                    code = code.concat(`(${Array.isArray(blocks[i+2]) ? this.genWGSL(util,blocks[i+2],false,recursionDepth+1) : this.textFromOp(util, blocks[i+2],false)});\n`)
                                    i += 2;
                                    break;
                                }

                                default: {
                                    console.warn("Invalid block! Did you forget the i += (# of inputs)?")
                                    return "Invalid opcode!"
                                }
                            }
                        }
                    }
                }
            }

            if (recursionDepth === 0 && isGeneratingArgumentsBecauseTheOtherThingITriedDidntWork) {
                code = code.concat("]")
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
            if (JSON.stringify(blocks[check].inputs) === JSON.stringify({})) { // i wrote this code like 2 months ago. i think it checks if all inputs are resolved and if it's a text block or something, but i can't remember
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
            if (["text", "math_number"].includes(blocks[block].opcode)) {
                return {
                    block: blocks[block].opcode,
                    id: blocks[block].id,
                    isRaw: (blocks[block].fields != {}) // i can't remember if this does anything. i don't think it does, but just i added it just in case
                }
            }
            if (!Object.prototype.hasOwnProperty.call(blocks[block],"inputs")) {
                return ""
            }
            let heldInputs = structuredClone(blocks[block].inputs)
            output.push(blocks[block].opcode)
            if (Object.prototype.hasOwnProperty.call(heldInputs,"SUBSTACK")) {
                delete heldInputs.SUBSTACK // this is a quick fix and probably won't play well with other extensions.
            }
            if (Object.prototype.hasOwnProperty.call(heldInputs,"SUBSTACK2")) {
                delete heldInputs.SUBSTACK2
            }
            if (JSON.stringify(heldInputs) != JSON.stringify({})) {
                // if the block takes inputs excluding SUBSTACK and SUBSTACK2, generate an input tree for it
                //output.push(Object.getOwnPropertyNames(heldInputs).length)
                for (let i = 0; i < Object.getOwnPropertyNames(heldInputs).length; i++) {
                    output.push(this.genInputTree(util,thread,blocks,heldInputs[Object.getOwnPropertyNames(heldInputs)[i]].block,true))
                }

                if (block.opcode === "gpusb3_defFunc" && (!Object.prototype.hasOwnProperty.call(heldInputs,"ARGS"))) {
                    output.push(null)
                }
            }
            else {
                console.log(JSON.stringify(heldInputs) + " does not require a tree")
            }
            if (Object.prototype.hasOwnProperty.call(blocks[block].inputs,"SUBSTACK")) {
                output.push(this.compile(util,thread,blocks,blocks[block].inputs.SUBSTACK.block,true))
            }
            if (Object.prototype.hasOwnProperty.call(blocks[block].inputs,"SUBSTACK2")) {
                // support for n-number of branches is cringe and we don't need that kind of negativity in here
                // also no extensions in my pristine compiled hats
                if (!Object.prototype.hasOwnProperty.call(blocks[block].inputs,"SUBSTACK")) {
                    output.push([])
                }
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
                
                if (Object.prototype.hasOwnProperty.call(heldInputs,"SUBSTACK")) {
                    delete heldInputs.SUBSTACK // this is a quick fix and probably won't play well with other extensions.
                    // i will make a custom math/block system later
                }
                if (Object.prototype.hasOwnProperty.call(heldInputs,"SUBSTACK2")) {
                    delete heldInputs.SUBSTACK2 // see previous comment
                }
                if (JSON.stringify(heldInputs) != JSON.stringify({}) || blocks[held].opcode === "control_if" || blocks[held].opcode === "control_if_else" || blocks[held].opcode === "gpusb3_computeFunc") {
                    // if the block takes inputs excluding SUBSTACK and SUBSTACK2, generate an input tree for it
                    //output.push(Object.getOwnPropertyNames(heldInputs).length)
                    if (Object.getOwnPropertyNames(heldInputs).length === 0) {
                        output.push([])
                    }
                    else {
                        for (let i = 0; i < Object.getOwnPropertyNames(heldInputs).length; i++) {
                            output.push(this.genInputTree(util,thread,blocks,heldInputs[Object.getOwnPropertyNames(heldInputs)[i]].block,true))
                        }
                        if (blocks[held].opcode === "gpusb3_defFunc" && (!Object.prototype.hasOwnProperty.call(heldInputs,"ARGS"))) {
                            output.push(null)
                        }
                    }
                }
                else {
                    console.log(JSON.stringify(heldInputs) + " does not require a tree")
                }
                if (Object.prototype.hasOwnProperty.call(blocks[held].inputs,"SUBSTACK") || blocks[held].opcode === "control_if" || blocks[held].opcode === "control_if_else" || blocks[held].opcode === "gpusb3_computeFunc" || blocks[held].opcode === "gpusb3_defFunc") {
                    if ((blocks[held].opcode === "control_if" || blocks[held].opcode === "gpusb3_computeFunc" || blocks[held].opcode === "gpusb3_defFunc" || blocks[held].opcode === "control_if_else") && !Object.prototype.hasOwnProperty.call(blocks[held].inputs,"SUBSTACK")) {
                        output.push([])
                    }
                    else {
                        output.push(this.compile(util,thread,blocks,blocks[held].inputs.SUBSTACK.block,true))
                    }
                    
                }
                if (Object.prototype.hasOwnProperty.call(blocks[held].inputs,"SUBSTACK2") || blocks[held].opcode === "control_if_else") {
                    // support for n-number of branches is cringe and we don't need that kind of negativity in here
                    // also no extensions in my pristine compiled hats
                    if ((blocks[held].opcode === "control_if_else" && !Object.prototype.hasOwnProperty.call(blocks[held].inputs,"SUBSTACK2"))) {
                        output.push([])
                    }
                    else {
                        output.push(this.compile(util,thread,blocks,blocks[held].inputs.SUBSTACK2.block,true))
                    }
                    
                }
                
            }
            return output
        }

        compileStart (args,util) {
            let threads = util.startHats("gpusb3_compileHat") // NOTE TO SELF: THIS DOESN'T START THE HATS(why is it named that then. this is stupid and i don't like it, i am going to complain on my twitter dot com (just kidding twitter is for nerds and i don't use it. also as of writing this comment for some it reason allows weird stuff now, what were they even thinking. twitter was bad to begin with but elon musk's midlife crisis ran it so far into the ground that it burned alive, also i'm not calling it x)), thanks sharkpool
            /*
                thanks sharkpool, very cool <3
                runtime.allScriptsByOpcodeDo(opcode, (script, target) => {
                        const thread = runtime._pushThread(script.blockId, target);
                        //...
                });
            */
            // vm.runtime.allScriptsByOpcodeDo("gpusb3_compileHat", (script, target) => {
            //     console.log("found a hat!")
            //     console.log(target)
            //     // @ts-ignore
            //     const thread = vm.runtime._pushThread(script.blockId, target);
            // });
            //console.log(threads.map((x) => x))
            //console.log(vm.runtime.threads[0].topBlock)
            let newthreads = []
            vm.runtime.threads.forEach((i) => {
                //console.log(i.topBlock)
                if (Object.prototype.hasOwnProperty.call(util.thread.blockContainer._blocks,i.topBlock)) {
                    if (util.thread.blockContainer._blocks[i.topBlock].opcode === "gpusb3_compileHat") {
                        newthreads.push(i)
                    }
                }
                
            })
            threads = newthreads
            //threads = vm.runtime.threads.filter((i) => util.thread.blockContainer._blocks[i.topBlock].opcode === "gpusb3_compileHat")
            console.log(threads)
            if (threads.length > 0) {
                threads.forEach((t) => {
                    t.tryCompile() // this doesn't do anything =D
                    //console.log(t.blockContainer._blocks[t.topBlock].inputs.GPUARGS.block)
                    //console.log(this.genInputTree(util, t, t.blockContainer._blocks, t.blockContainer._blocks[t.topBlock].inputs.GPUARGS.block, true))
                    // let farraycom = this.compile(util, t, t.blockContainer._blocks,t.blockContainer._blocks[t.topBlock].inputs.GPUARGS.block,true)
                    let farraycom = this.genInputTree(util, t, t.blockContainer._blocks, t.blockContainer._blocks[t.topBlock].inputs.GPUARGS.block, true) // farraycom = function array compiled
                    console.log(farraycom) 
                    let funcargs = this.genWGSL(util, farraycom, true, 0)
                    console.log(funcargs)
                })

                console.log(util)
                //console.log(threads)
                const e = this.compile(util,threads[0],threads[0].blockContainer._blocks,threads[0].topBlock,false)
                const compiled = this.genWGSL(util, e, false, 0)
                
                console.log(e)
                console.log(compiled)
                const BUFFER_SIZE = 1000;


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
                    code: compiled,
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
                        entryPoint: "computeShader",
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

        async compileHat(args, util) {
            console.log("the hat did the thing:")
            console.log(args)
            
        }

        getVar(args, util) {
            return "This block lets you get variables in your function."
        }

        declareVar (args, util) {
            return 0 // command, so no return
        }

        varOp(args, util) {
            return 0 // command
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

        wgslForLoop(args, util) {
            return 0 // technically a conditional, no return
        }

        defFunc(args, util) {
            return 0 // also technically a condition
        }

        defFuncArgs(args, util) {
            return "This is used to add arguments to your functions."
        }

        getFuncArg(args, util) {
            return "Use this block to get the value of an argument you defined using the def function arg block."
        }

        funcReturn(args, util) {
            return 0 // command block (MINECRAFT REFERENCE?????!!!!)
        }

        c_runFunc(args, util) {
            return 0 // also a command block
        }

        r_runFunc(args, util) {
            return "This block will run a given function and return the output."
        }

        gpuFuncArgDef(args, util) {
            return "This is used to add input arguments to your gpu functions."
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new DerpysExtension())
})(Scratch);