// Name: RedOS Misc
// ID: redmisc
// Description: canvas stuff
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT

(async function(Scratch) {
    'use strict';
    
    const vm = Scratch.vm
    const runtime = vm.runtime;
    const renderer = vm.renderer
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must run unsandboxed.")
    }

    class Redmisc {

        getInfo() {
            return {
                id: "redmisc",
                name: "RedOS Misc",

                color1: "#4287f5",
                color2: "#166af2",
                color3: "#032966",
                blocks: [
                    {
                        opcode: "canvasResolution",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get [ATTRIBUTE] of the canvas",
                        arguments: {
                            ATTRIBUTE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "CANVASATTRIBUTES"
                            }
                        }
                    },

                    {
                        opcode: "toScreen",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Convert scratch position [POS] to screen with size [SCREENW], scratch size of [SCRATCHW]",
                        arguments: {
                            POS: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 150
                            },
                            SCREENW: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1920
                            },
                            SCRATCHW: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 480
                            }
                        }
                    }
                ],
                menus: {
                    CANVASATTRIBUTES: {
                        acceptReporters: false,
                        items: ["width","height"]
                    }
                }
                
            };

        }


        canvasResolution(args, util) {
            return renderer.canvas[args.ATTRIBUTE]
        }

        toScreen(args, util) {
            return (Scratch.Cast.toNumber(args.POS) / (Scratch.Cast.toNumber(args.SCRATCHW)/2)) * (Scratch.Cast.toNumber(args.SCREENW) / 2)
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new Redmisc())
})(Scratch);