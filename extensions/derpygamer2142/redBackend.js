// Name: RedOS Backend
// ID: redbackend
// Description: Window manager, script runner
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

    // if (!Scratch.vm.extensionManager.isExtensionLoaded("redrender")) {
    //     runtime.extensionManager.loadExtensionURL("https://raw.githubusercontent.com/derpygamer2142/example-extensions-fork/master/extensions/derpygamer2142/redRender.js");
    // }

    // if (!Scratch.vm.extensionManager.isExtensionLoaded("coolerjson")) {
    //     runtime.extensionManager.loadExtensionURL("https://raw.githubusercontent.com/derpygamer2142/example-extensions-fork/master/extensions/derpygamer2142/json.js");
    // }

    class Backend {
        constructor() {
            this.windows = {}

            this.events = {
                tick: []
            }
        }

        newWindow(x, y, width, height, id) {
            if (typeof id === "undefined") {
                let testid = 0
                while (Object.prototype.hasOwnProperty.call(this.windows, testid)) {
                    testid += 1
                }
                id = Scratch.Cast.toString(testid)
            }
            this.windows[id] = {
                x: x,
                y: y,
                width: width,
                height: height,
                contents: []
            }

            return id
        }

        resizeWindow(dw, dh, id) {
            this.windows[id].x -= dw/2
            this.windows[id].y -= dh/2

            this.windows[id].width += dw
            this.windows[id].height += dh
        }

        moveWindow(dx, dy, id) {
            this.windows[id].x += dx
            this.windows[dy].y += dy
        }

        drawCircle(x, y, radius, r, g, b, a, id) {
            this.windows[id].contents.concat([
                "CIRCLE",
                8,
                x,
                y,
                radius,
                r,
                g,
                b,
                a
            ])
        }

        drawLine(x1, y1, x2, y2, weight, r, g, b, a, id) {
            this.windows[id].concat([
                "LINE",,
                10,
                x1,
                y1,
                x2,
                y2,
                weight,
                r,
                g,
                b,
                a
            ])
        }

        onEvent(event, func) {
            switch (event) {
                case "tick": {
                    this.events.tick.push(func)

                    break;
                }
            }
        }
    }

    class Window {
        constructor(id) {
            this.id = id
        }
    }

    const backend = new Backend()
    let windowData = undefined;

    class RedBackend {

        getInfo() {
            return {
                id: "redbackend",
                name: "RedOS Backend",

                color1: "#4287f5",
                color2: "#166af2",
                color3: "#032966",
                blocks: [
                    {   
                        opcode: "runApp",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Run app [APP]",
                        arguments: {
                            APP: {
                                type: Scratch.ArgumentType.STRING,
                                // defaultValue of example goes here
                            }
                        }

                    },

                    {
                        opcode: "forTest",
                        blockType: Scratch.BlockType.LOOP,
                        text: "For each window",
                        branchCount: 1
                    },

                    {
                        opcode: "windowData",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Current window's data"
                    }
                    
                ]
                
            };

        }

        runApp(args, util) {
            const windowId = backend.newWindow(0, 0, 100, 100)
            const appFunction = new Function("windowId", "backend", args.APP)
            
            appFunction(windowId, backend)
            /*
                sandboxing is cringe, who needs that
            */
        }

        forTest(args, util) {
            // loop from Extra-Controls by sharkpool
            if (typeof util.stackFrame.loopCounter === "undefined") util.stackFrame.loopCounter = Object.keys(backend.windows).length
            util.stackFrame.loopCounter--;
            if (util.stackFrame.loopCounter >= 0) util.startBranch(1, true);

            windowData = backend.windows[Object.keys(backend.windows)[util.stackFrame.loopCounter]]
        }

        windowData(args, util) {
            return JSON.stringify(windowData)
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new RedBackend())
})(Scratch);