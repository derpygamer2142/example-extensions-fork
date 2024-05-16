// Name: test
// ID: uhhhidk
// Description: your mother.
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT

(async function(Scratch) {
    'use strict';
    
    const vm = Scratch.vm
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must run unsandboxed.")
    }

    let tjson = {

    } // per-thread json data

    let gjson = {

    } // global json data

    let tarray = {

    }

    let garray = {

    } // gary real????!!!!!!


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
                        opcode: "debug",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "DEBUG"
                        
                    },

                    {
                        opcode: "tParseJ",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "T: Parse json [DATA] as [NAME]",
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
                        opcode: "tGetJ",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "T: Get [KEY] from [NAME]",
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
                        opcode: "tGetPath",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "T: Get path [KEY] from [NAME]",
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
                        opcode: "tSetJ",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "T: Set [KEY] to [VALUE] in [NAME]",
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
                            }
                        }
                    },

                    {
                        opcode: "tDelete",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "T: Delete [KEY] from [NAME]",
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
                        opcode: "tKeys",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "T: Get all keys from [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "tValues",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "T: Get all values from [NAME]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    },

                    {
                        opcode: "tHasKey",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "T: [NAME] has key [KEY]?",
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
                        opcode: "tRawJ",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "T: Get [NAME] as raw json",
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
                        opcode: "tParseArray",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "T: Parse [DATA] as [NAME]",
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
                        opcode: "tPush",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "T: In array [NAME] add [ITEM]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someID"
                            }
                        }
                    }
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
        tParseJ(args, util) {
            //console.log(Scratch, util, vm)
            const thread = util.thread.topBlock
            let parsed = {}
            try {
                // there's probably a more efficient way to do this part
                parsed = JSON.parse(Scratch.Cast.toString(args.DATA))
            }
            catch {
                // we don't care if it errors
            }
            if (!tjson.hasOwnProperty(thread)) {
                tjson[thread] = {}
            }
            tjson[thread][args.NAME] = parsed
            //return 1
        }

        tGetJ(args, util) {
            const thread = util.thread.topBlock
            if (!tjson.hasOwnProperty(thread)) {
                return "Thread not found!"
            }
            if (!tjson[thread].hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            const v = tjson[thread][args.NAME]
            if (v.hasOwnProperty([args.KEY])) {
                return v[args.KEY]
            }
        }

        tGetPath(args, util) {
            const thread = util.thread.topBlock
            if (!tjson.hasOwnProperty(thread)) {
                return "Thread not found!"
            }
            if (!tjson[thread].hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            let j = tjson[thread][args.NAME] // json thingy
            const p = args.KEY.split("/") // path
            p.forEach((i) => {
                if (j.hasOwnProperty(i)) {
                    j = j.i // go to the next part of the path
                }
                else {
                    return "Invalid path!"
                }
            })
            return j
        }
        
        tSetJ(args, util) {
            const thread = util.thread.topBlock
            let v = tjson[thread][args.NAME]
            v[args.KEY] = this.isJson(args.VALUE) ?? args.VALUE // the nullish coalescing operator scares me
            // spelled that first try 💪
            
            console.log(tjson)
        }

        tDelete(args, util) {
            const thread = util.thread.topBlock
            if (!tjson.hasOwnProperty(thread)) {
                return "Thread not found!"
            }
            if (!tjson[thread].hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            if (tjson[thread][args.NAME].hasOwnProperty(args.KEY)) {
                delete tjson[thread][args.NAME][args.KEY]
            }
        }

        tKeys(args, util) {
            const thread = util.thread.topBlock
            // noooo, you can't just not have error handling in your extension because that bricks project!
            // you need to have checks for this stuff that slows it down! - 🤓🤓🤓🤓🤓🤓🤓

            if (!tjson.hasOwnProperty(thread)) {
                return "Thread not found!"
            }
            if (!tjson[thread].hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            return JSON.stringify(Object.keys(tjson[thread][args.NAME]))
        }

        tValues(args, util) {
            const thread = util.thread.topBlock
            if (!tjson.hasOwnProperty(thread)) {
                return "Thread not found!"
            }
            if (!tjson[thread].hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            return JSON.stringify(Object.values(tjson[thread][args.NAME]))
        }

        tHasKey(args, util) {
            const thread = util.thread.topBlock
            if (!tjson.hasOwnProperty(thread)) {
                return "Thread not found!"
            }
            if (!tjson[thread].hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            return tjson[thread][args.NAME].hasOwnProperty(args.KEY)
        }

        tRawJ(args, util) {
            const thread = util.thread.topBlock
            if (!tjson.hasOwnProperty(thread)) {
                return "Thread not found!"
            }
            if (!tjson[thread].hasOwnProperty(args.NAME)) {
                return "JSON not found!"
            }
            return JSON.stringify(tjson[thread][args.NAME])
        }

        tParseArray(args, util) {
            // this is the same as tParseJ but with a different variable
            const thread = util.thread.topBlock
            let parsed = {}
            try {
                // there's probably a more efficient way to do this part
                parsed = JSON.parse(Scratch.Cast.toString(args.DATA))
            }
            catch {
                // we don't care if it errors
            }
            if (!tarray.hasOwnProperty(thread)) {
                tarray[thread] = {}
            }
            tarray[thread][args.NAME] = parsed
        }

        tPush(args, util) {
            const thread = util.thread.topBlock
            if (!tarray.hasOwnProperty(thread)) {
                tarray[thread] = {}
            }
            tjson[thread][args.NAME].push(args.ITEM)
        }

        debug(args, util) {
            console.log(tjson, tarray)
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new DerpysExtension())
})(Scratch);