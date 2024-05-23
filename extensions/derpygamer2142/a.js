// Name: cooler json extension
// ID: coolerjson
// Description: your mother.
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT

(async function(Scratch) {
    'use strict';
    
    const vm = Scratch.vm
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must run unsandboxed.")
    }

    let gjson = {

    } // global json data




    let garray = {

    } // gary real????!!!!!!


    class DerpysExtension {

        getInfo() {
            return {
                id: "coolerjson",
                name: "the cooler json",

                color1: "#4287f5",
                color2: "#166af2",
                color3: "#032966",
                blocks: [
                    {
                        opcode: "debug",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "DEBUG"
                        
                    },

                    {
                        opcode: "clear",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Clear all data"
                        
                    },

                    {
                        opcode: "gParseJ",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: Parse json [DATA] as [NAME]",
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "{\"key\": \"value\"}"
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gGetJ",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Get [KEY] from [NAME]",
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "key"
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gGetPath",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Get path [KEY] from [NAME]",
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "key1/key2/key3"
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gSetPath",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: Set path [KEY] to [VALUE] in [NAME] | is json [ISJ]",
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "key1/key2/key3"
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "value"
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ISJ: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    },

                    {
                        opcode: "gSetJ",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: Set [KEY] to [VALUE] in [NAME] | is json [ISJ]",
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "key"
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "value"
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ISJ: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    },

                    {
                        opcode: "gDelete",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: Delete [KEY] from [NAME]",
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "key"
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gKeys",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Get all keys from [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gValues",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Get all values from [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gHasKey",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "G: [NAME] has key [KEY]?",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "key"
                            }
                        }
                    },

                    {
                        opcode: "gRawJ",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Get [NAME] as raw json",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        blockType: "label",
                        text: "Arrays"
                    },

                    {
                        opcode: "gParseArray",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: Parse [DATA] as [NAME]",
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "[\"item1\", \"item2\"]"
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gPush",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: In array [NAME] add [ITEM] | is json [ISJ]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "item3"
                            },
                            ISJ: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    },

                    {
                        opcode: "gConcat",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: In array [NAME] concat [NAME2]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            NAME2: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "anotherID"
                            }
                        }
                    },

                    {
                        opcode: "gGetA",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: In array [NAME] get [ITEM]", // this says item instead of index, idrc though
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 2
                            }
                        }
                    },

                    {
                        opcode: "gSetA",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: In array [NAME] set [INDEX] to [ITEM] | is json [ISJ]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "item"
                            },
                            INDEX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 2
                            },
                            ISJ: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    },

                    {
                        opcode: "gRawA",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Get raw array [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gDeleteA",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: In array [NAME] delete [INDEX]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            INDEX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 2
                            }
                        }
                    },

                    {
                        opcode: "gRawA",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Get array [NAME] as raw",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gLength",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Length of array [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "gIndexOf",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Index of [ITEM] in [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "item"
                            }
                        }
                    },

                    {
                        opcode: "gContains",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "G: Array [NAME] contains [ITEM]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "item"
                            }
                        }
                    },

                    {
                        opcode: "gSlice",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "G: Get from [INDEX1] to [INDEX2] in array [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            INDEX1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            INDEX2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 2
                            }
                        }
                    },

                    {
                        opcode: "gInsert",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "G: Insert [ITEM] at [INDEX] in array [NAME] | is json [ISJ]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "item"
                            },
                            INDEX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            ISJ: {
                                type: Scratch.ArgumentType.BOOLEAN,
                                defaultValue: false
                            }
                        }
                    }/*,

                    {
                        opcode: "nothing",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "do nothing"
                        
                    }*/
                ]
            };

        }


        isJson(value) {
            try {
                return JSON.parse(value)
            }
            catch {
                return null
            }
        }


        // make a hat block and get all the blocks under the script?
        gParseJ(args, util) {
            //console.log(Scratch, util, vm)
            
            let parsed = {"error":true}
            try {
                // there's probably a more efficient way to do this part
                parsed = JSON.parse(Scratch.Cast.toString(args.DATA))
            }
            catch {
                // we don't care if it errors
            }
            
            gjson[args.NAME] = parsed
            //return 1
        }

        gGetJ(args, util) {
            
            
            if (!gjson.hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            const v = gjson[args.NAME]
            if (v.hasOwnProperty(args.KEY)) {
                if (typeof v[args.KEY] === "object") {
                    return JSON.stringify(v[args.KEY])
                }
                return v[args.KEY]
            }
        }

        gGetPath(args, util) {
            
            
            if (!gjson.hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            let j = gjson[args.NAME] // json thingy
            const p = args.KEY.split("/") // path
            p.forEach((i) => {
                if (j.hasOwnProperty(i)) {
                    j = j[i] // go to the next part of the path
                }
                else {
                    return "Invalid path!"
                }
            })
            if (typeof j === "object") {
                return JSON.stringify(j)
            }
            return j
        }
        
        gSetJ(args, util) {
            
            let v = gjson[args.NAME]
            v[args.KEY] = args.ISJ ? this.isJson(args.VALUE) : args.VALUE
            //this.isJson(args.VALUE) ?? args.VALUE 
            // the nullish coalescing operator scares me
            // spelled that first try 💪
            
            //console.log(gjson)
        }

        gDelete(args, util) {
            
            
            if (!gjson.hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            if (gjson[args.NAME].hasOwnProperty(args.KEY)) {
                delete gjson[args.NAME][args.KEY]
            }
        }

        gKeys(args, util) {
            
            // noooo, you can't just not have error handling in your extension because that bricks project!
            // you need to have checks for this stuff that slows it down! - 🤓🤓🤓🤓🤓🤓🤓

            
            if (!gjson.hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            return JSON.stringify(Object.keys(gjson[args.NAME]))
        }

        gValues(args, util) {
            
            
            if (!gjson.hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            return JSON.stringify(Object.values(gjson[args.NAME]))
        }

        gHasKey(args, util) {
            
            
            if (!gjson.hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            return gjson[args.NAME].hasOwnProperty(args.KEY)
        }

        gRawJ(args, util) {
            
            
            if (!gjson.hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            return JSON.stringify(gjson[args.NAME])
        }

        gSetPath(args, util) {
            
            
            if (!gjson.hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            const e = args.KEY.split("/")
            const path = e.slice(0,e.length-1)
            let j = gjson[args.NAME]
            path.forEach((i) => {
                if (!j.hasOwnProperty(i)) {
                    return "Invalid path!"
                }
                j = j[i]
            })
            j[e[e.length-1]] = args.ISJ ? this.isJson(args.VALUE) : args.VALUE
        }

        gParseArray(args, util) {
            // this is the same as tParseJ but with a different variable
            
            let parsed = {}
            try {
                // there's probably a more efficient way to do this part
                parsed = JSON.parse(Scratch.Cast.toString(args.DATA))
            }
            catch {
                // we don't care if it errors
            }
            garray[args.NAME] = parsed
        }

        gPush(args, util) {
            
            
            garray[args.NAME].push(args.ISJ ? this.isJson(args.ITEM) : args.ITEM) // undefined is falsy i think, so i probably don't need to cast it
        }

        gConcat(args, util) {
            
            
            if ((!garray.hasOwnProperty(args.NAME)) || (!garray.hasOwnProperty(args.NAME2))) {
                return "Array not found!"
            }
            garray[args.NAME] = garray[args.NAME].concat(garray[args.NAME2])
        }

        gGetA(args, util) {
            
            
            if ((!garray.hasOwnProperty(args.NAME))) {
                return "Array not found!"
            }
            if (args.ITEM >= garray[args.NAME].length) {
                return "Out of range!"
            }
            let e = garray[args.NAME][args.ITEM]
            return (typeof e === "object") ? JSON.stringify(e) : e
        }

        gSetA(args, util) {
            
            
            if ((!garray.hasOwnProperty(args.NAME))) {
                return "Array not found!"
            }
            args.INDEX = Scratch.Cast.toNumber(args.INDEX)
            if (args.INDEX >= garray[args.NAME].length) {
                return "Out of range!"
            }
            garray[args.NAME][args.INDEX] = args.ISJ ? this.isJson(args.ITEM) : args.ITEM
        }

        debug(args, util) {
            console.log(gjson, garray)
        }

        nothing(args, util) {
            // nothing
        }

        gRawA(args, util) {
            
            
            if (!garray.hasOwnProperty(args.NAME)) {
                return "Array not found!"
            }
            return JSON.stringify(garray[args.NAME])
        }

        gDeleteA(args, util) {
            
            
            if (!garray.hasOwnProperty(args.NAME)) {
                return "Array not found!"
            }
            if (args.INDEX < garray[args.NAME].length) {
                delete garray[args.NAME][args.INDEX]
            }
        }

        gLength(args, util) {
            
            
            if (!garray.hasOwnProperty(args.NAME)) {
                return "Array not found!"
            }
            return garray[args.NAME].length
        }

        gIndexOf(args, util) {
            
            
            if (!garray.hasOwnProperty(args.NAME)) {
                return "Array not found!"
            }
            return garray[args.NAME].indexOf(args.ITEM) // this might be wrong 
        }

        gContains(args, util) {
            
            
            if (!garray.hasOwnProperty(args.NAME)) {
                return "Array not found!"
            }
            return garray[args.NAME].includes(args.ITEM)
        }

        gSlice(args, util) {
            
            
            if (!garray.hasOwnProperty(args.NAME)) {
                return "Array not found!"
            }
            return JSON.stringify(garray[args.NAME].slice(Scratch.Cast.toNumber(args.INDEX1),Scratch.Cast.toNumber(args.INDEX2)))
        }

        gInsert(args, util) {
            
            
            if (!garray.hasOwnProperty(args.NAME)) {
                return "Array not found!"
            }
            garray[args.NAME].splice(Scratch.Cast.toNumber(args.INDEX),0, args.ISJ ? this.isJson(args.ITEM) : args.ITEM)
        }


        clear(args, util) {
            gjson  = {}
            gjson  = {}
            garray = {}
            garray = {}
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new DerpysExtension())
})(Scratch);