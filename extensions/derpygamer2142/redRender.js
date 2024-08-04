// Name: RedOS Renderer
// ID: redrender
// Description: I was going to put something funny here but then i didn't
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


    if (!Scratch.vm.extensionManager.isExtensionLoaded("pen")) {
        runtime.extensionManager.loadExtensionIdSync("pen");
    }


    let commandLists = {

    }


    // from stretch.js, MIT and MPL-2.0
    const STRETCH_X = Symbol("stretch.x");
    const STRETCH_Y = Symbol("stretch.y");

    /**
     * @param {VM.RenderedTarget} target
     * @param {VM.RenderedTarget} [originalTarget] If target is a clone, the original to copy from.
     */
    const implementStretchForTarget = (target, originalTarget) => {
        if (STRETCH_X in target) {
        // Target already has stretch. Don't implement again.
        return;
        }

        target[STRETCH_X] = originalTarget ? originalTarget[STRETCH_X] : 100;
        target[STRETCH_Y] = originalTarget ? originalTarget[STRETCH_Y] : 100;

        const original = target._getRenderedDirectionAndScale;
        target._getRenderedDirectionAndScale = function () {
        const result = original.call(this);

        result.scale[0] *= this[STRETCH_X] / 100;
        result.scale[1] *= this[STRETCH_Y] / 100;

        return result;
        };
    };
    vm.runtime.targets.forEach((target) => implementStretchForTarget(target));
    vm.runtime.on("targetWasCreated", (target, originalTarget) =>
        implementStretchForTarget(target, originalTarget)
    );
    vm.runtime.on("PROJECT_LOADED", () => {
        vm.runtime.targets.forEach((target) => implementStretchForTarget(target));
    });

    /**
     * @param {VM.RenderedTarget} target
     */
    const forceUpdateDirectionAndScale = (target) => {
        target.setDirection(target.direction);
    };

    class RedRender {

        getInfo() {
            return {
                id: "redrender",
                name: "RedOS Renderer",

                color1: "#4287f5",
                color2: "#166af2",
                color3: "#032966",
                blocks: [

                    {
                        opcode: "debug",
                        text: "DEBUG",
                        blockType: Scratch.BlockType.COMMAND
                    },
                    // {
                    //     opcode: "renderLine",
                    //     text: "super cool line test",
                    //     blockType: Scratch.BlockType.COMMAND
                    // }
                    {
                        opcode: "initializeList",
                        text: "Initialize draw list with name [LIST]",
                        blockType: Scratch.BlockType.COMMAND,
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someList"
                            }
                        }
                    },

                    {
                        opcode: "stringifyList",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get list [LIST]",
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someList"
                            }
                        }
                    },

                    {   
                        blockType: Scratch.BlockType.COMMAND,
                        opcode: "addCircle",
                        text: "Add circle at [X], [Y] with radius [RADIUS] color [R] [G] [B] [A] to draw list [LIST]",
                        arguments: {
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            RADIUS: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            },
                            R: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            G: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            B: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 255
                            },
                            A: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 255
                            },
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someList"
                            }
                        }
                    },

                    {   
                        blockType: Scratch.BlockType.COMMAND,
                        opcode: "addLine",
                        text: "Add line from [X1], [Y1] to [X2], [Y2] with weight [WEIGHT] color [R] [G] [B] [A] to draw list [LIST]",
                        arguments: {
                            X1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            X2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            Y2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            WEIGHT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 15
                            },
                            R: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            G: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            B: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 255
                            },
                            A: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 255
                            },
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someList"
                            }
                        }
                    },

                    {
                        blockType: Scratch.BlockType.COMMAND,
                        opcode: "addCostumeImage",
                        text: "Add stamp of costume [COSTUME] at [X] [Y] with dimensions [WIDTH] [HEIGHT](blank for defaults) to draw list [LIST]",
                        arguments: {
                            COSTUME: {
                                type: Scratch.ArgumentType.COSTUME
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            WIDTH: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: ""
                            },
                            HEIGHT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: ""
                            },
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someList"
                            }
                        }
                    },


                    {
                        opcode: "renderCommands",
                        text: "Render draw commands from list [LIST] centered at [X], [Y] size [WIDTH], [HEIGHT]",
                        blockType: Scratch.BlockType.COMMAND,
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "someList"
                                //menu: "get_lists"
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            WIDTH: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            HEIGHT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    }
                ],
                menus: {
                    get_lists: {
                        acceptReporters: true,
                        items: "getLists"
                    }
                }
            };

        }

        debug(args, util) {
            console.log(util)
            // @ts-ignore
            Scratch.vm.runtime.renderer.penStamp(Scratch.vm.renderer._penSkinId,util.target.sprite.costumes[0].skinId) // util.thread.target.sprite.costumes[0].skinId
        }

        initializeList(args, util) {
            commandLists[Scratch.Cast.toString(args.LIST)] = []
            console.log(commandLists)
        }

        stringifyList(args, util) {
            return JSON.stringify(commandLists[Scratch.Cast.toString(args.LIST)])
        }

        addCircle(args, util) {
            commandLists[Scratch.Cast.toString(args.LIST)] = commandLists[Scratch.Cast.toString(args.LIST)].concat([
                "CIRCLE",
                8,
                Scratch.Cast.toNumber(args.X),
                Scratch.Cast.toNumber(args.Y),
                Scratch.Cast.toNumber(args.RADIUS),
                Scratch.Cast.toNumber(args.R),
                Scratch.Cast.toNumber(args.G),
                Scratch.Cast.toNumber(args.B),
                Scratch.Cast.toNumber(args.A)
            ])
        }

        addLine(args, util) {
            commandLists[Scratch.Cast.toString(args.LIST)] = commandLists[Scratch.Cast.toString(args.LIST)].concat([
                "LINE",
                10,
                Scratch.Cast.toNumber(args.X1),
                Scratch.Cast.toNumber(args.Y1),
                Scratch.Cast.toNumber(args.X2),
                Scratch.Cast.toNumber(args.Y2),
                Scratch.Cast.toNumber(args.WEIGHT),
                Scratch.Cast.toNumber(args.R),
                Scratch.Cast.toNumber(args.G),
                Scratch.Cast.toNumber(args.B),
                Scratch.Cast.toNumber(args.A)
            ])
        }

        addCostumeImage(args, util) {
            commandLists[Scratch.Cast.toString(args.LIST)] = commandLists[Scratch.Cast.toString(args.LIST)].concat([
                "STAMP",
                6,
                util.target.getCostumeIndexByName(args.COSTUME),
                Scratch.Cast.toNumber(args.X),
                Scratch.Cast.toNumber(args.Y),
                args.WIDTH === "" ? "d" : Scratch.Cast.toNumber(args.WIDTH),
                args.HEIGHT === "" ? "d" : Scratch.Cast.toNumber(args.HEIGHT)

            ])
        }



        getLists() {
            // from Skyhigh173/json.js
            const globalLists = Object.values(
              vm.runtime.getTargetForStage().variables
            ).filter((x) => x.type == "list");
            const localLists = Object.values(vm.editingTarget.variables).filter(
              (x) => x.type == "list"
            );
            const uniqueLists = [...new Set([...globalLists, ...localLists])];
            if (uniqueLists.length === 0) {
              return [
                {
                  text: "select a list",
                  value: "select a list",
                },
              ];
            }
            return uniqueLists.map((i) => ({
              text: i.name,
              value: i.id,
            }));
          }

        renderLine(args, util) {
            renderer.penLine(
                // @ts-ignore
                Scratch.vm.renderer._penSkinId,
                {
                    color4f: [0, 0, 1, 1],
                    diameter: 1,
                },
                0,
                0,
                100,
                100
            )
        }

        lookupList(list, util) {
            // from Skyhigh173/json.js
            const byId = util.target.lookupVariableById(list);
            if (byId && byId.type === "list") {
              return byId;
            }
            const byName = util.target.lookupVariableByNameAndType(list, "list");
            if (byName) {
              return byName;
            }
            return null;
          }


        /*
          Draw command list format:

          COMMAND
          LENGTH(COMMAND index + LENGTH + 1= next COMMAND index)
          arg1
          arg2
          ...
          argN


          Commands:

          CIRCLE
          LENGTH
          x
          y
          radius
          r
          g
          b
          a

          LINE
          10
          x1
          y1
          x2
          y2
          weight
          r
          g
          b
          a

          STAMP
          6
          image
          x
          y
          width(d for default)
          height(d for default)

        */

        toLocalX(x, commandInfo) {
            return ((x / 240) * commandInfo.WIDTH) + commandInfo.X
        }

        toLocalY(y, commandInfo) {
            return ((y / 180) * commandInfo.HEIGHT) + commandInfo.Y
        }

        fixedSetCostume(target, index) {
            target.currentCostume = index
            target.renderer.updateDrawableSkinId(target.drawableID, target.sprite.costumes[index].skinId)
        }

        draw(util, command, args, commandInfo) {
            switch (command) {
                case "CIRCLE": {
                    renderer.penLine(
                        // @ts-ignore
                        Scratch.vm.renderer._penSkinId,
                        {
                            color4f: [args[3] / 255, args[4] / 255, args[5] / 255, args[6] / 255],
                            diameter: args[2] * 2,
                        },
                        this.toLocalX(args[0],commandInfo),
                        this.toLocalY(args[1],commandInfo),
                        this.toLocalX(args[0],commandInfo),
                        this.toLocalY(args[1],commandInfo)
                    )

                    break;
                }

                case "LINE": {
                    renderer.penLine(
                        // @ts-ignore
                        Scratch.vm.renderer._penSkinId,
                        {
                            color4f: [args[5] / 255, args[6] / 255, args[7] / 255, args[8] / 255],
                            diameter: args[4] * 2,
                        },
                        this.toLocalX(args[0],commandInfo),
                        this.toLocalY(args[1],commandInfo),
                        this.toLocalX(args[2],commandInfo),
                        this.toLocalY(args[3],commandInfo)
                    )

                    break;
                }

                case "STAMP": {
                    const oldx = util.target.x
                    const oldy = util.target.y
                    const oldi = util.target.currentCostume
                    //console.log(args[0])
                    //util.target.setCostume(args[0])
                    this.fixedSetCostume(util.target, args[0])
                    // util.target.sprite.x = Scratch.Cast.toNumber(args[1])
                    // util.target.sprite.y = Scratch.Cast.toNumber(args[2])
                    util.target.renderer.updateDrawablePosition(util.target.drawableID,[args[1], args[2]])
                    
                    const oldw = util.target[STRETCH_X]
                    const oldh = util.target[STRETCH_Y]
                    
                    
                    
                    if (args[3] !== "d") {
                        util.target[STRETCH_X] = Math.round((args[3] / util.target.sprite.costumes[args[0]].size[0]) * 100);
                    }
                    console.log(args[4])
                    if (args[4] !== "d") {
                        util.target[STRETCH_Y] = Math.round((args[4] / util.target.sprite.costumes[args[0]].size[1]) * 100);
                        
                    }
                    forceUpdateDirectionAndScale(util.target)


                    // vm.runtime.renderer.penStamp(
                    //     // @ts-ignore
                    //     vm.runtime.renderer._penSkinId,
                    //     util.target.sprite.costumes[args[0]].skinId,
                    // )
                    // @ts-ignore
                    Scratch.vm.runtime.renderer.penStamp(Scratch.vm.renderer._penSkinId,util.target.drawableID)

                    util.target.renderer.updateDrawablePosition(util.target.drawableID, [oldx, oldy])
                    util.target[STRETCH_X] = oldw
                    util.target[STRETCH_Y] = oldh
                    forceUpdateDirectionAndScale(util.target)

                    //util.target.setCostume(oldi)
                    this.fixedSetCostume(util.target, oldi)
                }

                
            }
        }

        renderCommands(args, util) {
            // let list
            // try {
            //     list = this.lookupList(args.LIST, util);
            // } catch (e) {
            //     console.log("errored")
            //     return
            // }
            // if (!list) {
            //     console.log("failed,", list)
            //     return
            // }
            // list = list.value
            const list = commandLists[args.LIST]
            for (let i = 0; i < list.length; i++) {
                // console.log(list.slice(i+2,i+(list[i+1])),args)
                this.draw(util, list[i], list.slice(i+2,i+list[i+1]+1),args)
                i += list[i+1]
            }
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new RedRender())
})(Scratch);