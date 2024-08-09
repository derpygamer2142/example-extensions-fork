// Name: RedOS Backend
// ID: redbackend
// Description: Window manager, script runner
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT


/*
TODO:
file system, methods for accessing
apps, methods for accessing/launching
settings, methods for accessing

*/

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

            this.fs = {
                // stuff goes here
                
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
                contents: [],
                commands: [],
                id: id,
                held: false
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
            this.windows[id].commands.push(this.windows[id].commands.length)
            this.windows[id].contents = this.windows[id].contents.concat([
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
            this.windows[id].commands.push(this.windows[id].commands.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "LINE",
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
        
        drawRect(x, y, width, height, r, g, b, a, id) {
            this.windows[id].commands.push(this.windows[id].commands.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "RECT",
                9,
                x,
                y,
                width,
                height,
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

        readFile(path) {
            if (path[0] === "/") path = path.slice(1)
            if (path[path.length - 1] === "/") path = path.slice(0, path.length - 1)
            let section = this.fs
            try {
                path.split("/").forEach((p) => {
                    console.log(section, p)
                    if (Object.prototype.hasOwnProperty.call(section, p)) {
                        section = section[p]
                    }
                    else {
                        throw new Error("Invalid")
                    }
                })
                return section?._content ?? section
            }
            catch {
                return "Invalid"
            }
            
        }

        writeFile(path, content) {
            if (path[0] === "/") path = path.slice(1)
            if (path[path.length - 1] === "/") path = path.slice(0, path.length - 1)
            let section = this.fs
            try {
                const apath = path.split("/")
                apath.pop()
                apath.forEach((p) => {
                    if (Object.prototype.hasOwnProperty.call(section, p)) {
                        section = section[p]
                    }
                    else {
                        throw new Error("Invalid")
                    }
                })
                section[path.split("/")[apath.length]] = this.newFilePoint(path, content)
            }
            catch {
                return "Invalid"
            }
        }

        rm(path) {
            if (path[0] === "/") path = path.slice(1)
            if (path[path.length - 1] === "/") path = path.slice(0, path.length - 1)
            let section = this.fs
            try {
                const apath = path.split("/")
                apath.pop()
                apath.forEach((p) => {
                    console.log(section, p)
                    if (Object.prototype.hasOwnProperty.call(section, p)) {
                        section = section[p]
                    }
                    else {
                        throw new Error("Invalid")
                    }
                })
                if (path === "") {
                    this.fs = {} // :trol:
                }
                else {
                    const s = path.split("/")
                    delete section[s[s.length - 1]]
                }
                
            }
            catch {
                return
            }
        }

        mkdir(path) {
            if (path[0] === "/") path = path.slice(1)
            if (path[path.length - 1] === "/") path = path.slice(0, path.length - 1)
            const apath = path.split("/")
            apath.shift()
            const object = this.newDirPoint()
            let bobject = object // ~~bob ject~~ b object
            apath.forEach((p) => {
                if (p[0] === "_") throw new Error("Invalid")
                bobject[p] = this.newDirPoint()
                bobject = bobject[p]
                
            })
            console.log(path.split("/")[0])
            this.fs[path.split("/")[0]] = object
        }
        
        ls(path) {
            if (path[0] === "/") path = path.slice(1)
            if (path[path.length - 1] === "/") path = path.slice(0, path.length - 1)
            let section = this.fs
            try {
                path.split("/").forEach((p) => {
                    if (Object.prototype.hasOwnProperty.call(section, p)) {
                        section = section[p]
                    }
                    else {
                        throw new Error("Invalid")
                    }
                })
                const ignoreKeys = Object.keys(this.newDirPoint())
                return Object.keys(section).filter((i) => !ignoreKeys.includes(i))
            }
            catch {
                return "Invalid"
            }
        }

        newDirPoint() {
            return {
                _isDir: true // more stuff goes here
            }
        }

        newFilePoint(fileName, content) {
            const split = fileName.split(".")
            const type = (split[split.length - 1] ?? "").includes(" ") ? "" : (split[split.length - 1] ?? "")
            
            return {
                _isDir: false,
                _name: split[split.length - 1],
                _content: content,
                _type: type
            }
        }

    }

    const backend = new Backend()
    let windowData = undefined;
    let drawCommand = undefined

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
                        opcode: "forWindow",
                        blockType: Scratch.BlockType.LOOP,
                        text: "For each window",
                        branchCount: 1
                    },

                    {
                        opcode: "windowData",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Current window's data"
                    },

                    {
                        opcode: "forWindowContents",
                        blockType: Scratch.BlockType.LOOP,
                        text: "For each draw command in window [ID]",
                        branchCount: 1,
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "1"
                            }
                        }
                    },

                    {
                        opcode: "drawCommand",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Draw command data"
                    },

                    {
                        opcode: "updateWindowStuff",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Update window [WINDOW] size and pos from mouse data: pos [X] [Y] down [DOWN] last [LAST] change in mouse pos [DX] [DY]",
                        arguments: {
                            WINDOW: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0"
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            DOWN: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                            LAST: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                            DX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            DY: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            }
                        }
                    },

                    {
                        opcode: "triggerEvent",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Trigger event [EVENT]",
                        arguments: {
                            EVENT: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    },
                    
                    {
                        opcode: "mkdir",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "mkdir [PATH]",
                        arguments: {
                            PATH: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "your/mother/"
                            }
                        }
                    },

                    {
                        opcode: "writeFile",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Write file at path [PATH] with content [CONTENT]",
                        arguments: {
                            PATH: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "your/mother/skibidi.txt"
                            },
                            CONTENT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "skibidi ohio sigma rizz"
                            }
                        }
                    },

                    {
                        opcode: "readFile",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Read file at path [PATH]",
                        arguments: {
                            PATH: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "your/mother/skibidi.txt"
                            }
                        }
                    },

                    {
                        opcode: "ls",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "List files in directory [PATH]",
                        arguments: {
                            PATH: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "your/mother/"
                            }
                        }
                    },
                    
                    {
                        opcode: "rm",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "remove path [PATH]",
                        arguments: {
                            PATH: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "your/mother/"
                            }
                        }
                    },

                    {
                        opcode: "debug",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "DEBUG"

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

        forWindow(args, util) {
            // loop from Extra-Controls by sharkpool
            if (typeof util.stackFrame.loopCounter === "undefined") util.stackFrame.loopCounter = Object.keys(backend.windows).length
            util.stackFrame.loopCounter--;
            
            windowData = backend.windows[Object.keys(backend.windows)[util.stackFrame.loopCounter]]

            if (util.stackFrame.loopCounter >= 0) util.startBranch(1, true);

            
        }

        forWindowContents(args, util) {
            if (typeof util.stackFrame.loopCounter === "undefined") util.stackFrame.loopCounter = backend.windows[Scratch.Cast.toString(args.ID)].commands.length
            util.stackFrame.loopCounter--;

            const a = backend.windows[Scratch.Cast.toString(args.ID)].commands[util.stackFrame.loopCounter]
            drawCommand = backend.windows[Scratch.Cast.toString(args.ID)].contents.slice(a, a + backend.windows[Scratch.Cast.toString(args.ID)].contents[a+1] + 1)

            if (util.stackFrame.loopCounter >= 0) util.startBranch(1, true);

        }

        windowData(args, util) {
            return JSON.stringify(windowData)
        }

        drawCommand(args, util) {
            return JSON.stringify(drawCommand)

        }

        updateWindowStuff(args, util) {
            const wx = backend.windows[Scratch.Cast.toString(args.WINDOW)].x
            const wy = backend.windows[Scratch.Cast.toString(args.WINDOW)].y
            const ww = backend.windows[Scratch.Cast.toString(args.WINDOW)].width
            const wh = backend.windows[Scratch.Cast.toString(args.WINDOW)].height
            args.X = Scratch.Cast.toNumber(args.X)
            args.Y = Scratch.Cast.toNumber(args.Y)

            if (backend.windows[Scratch.Cast.toString(args.WINDOW)].held || (Scratch.Cast.toBoolean(args.DOWN) && !Scratch.Cast.toBoolean(args.LAST) && ((args.X > wx - (ww/2)) && (args.X < wx + (ww/2)) && (args.Y > wy - (wh/2)) && (args.Y > wy - (wh*0.4))))) {
                backend.moveWindow(Scratch.Cast.toNumber(args.DX),Scratch.Cast.toNumber(args.DY),args.WINDOW)
                backend.windows[Scratch.Cast.toString(args.WINDOW)].held = true
            }
            else if (backend.windows[Scratch.Cast.toString(args.WINDOW)].held || (Scratch.Cast.toBoolean(args.DOWN) && !Scratch.Cast.toBoolean(args.LAST) && ((args.X > wx + (ww*0.48)) && (args.X < wx + (ww/2)) && (args.Y > wy + (wh*0.48)) && (args.Y > wy + (wh/2))))) {
                backend.resizeWindow(Scratch.Cast.toNumber(args.DX),Scratch.Cast.toNumber(args.DY),args.WINDOW)
                backend.windows[Scratch.Cast.toString(args.WINDOW)].held = true
            }
            else {
                backend.windows[Scratch.Cast.toString(args.WINDOW)].held = false
            }
        }

        triggerEvent(args, util) {
            backend.events[Scratch.Cast.toString(args.EVENT)].forEach((e) => {
                e()
            })
        }

        readFile(args) {
            const r = backend.readFile(Scratch.Cast.toString(args.PATH))

            if (typeof r === "object") return JSON.stringify(r)
            else return r
        }

        writeFile(args) {
            backend.writeFile(Scratch.Cast.toString(args.PATH),Scratch.Cast.toString(args.CONTENT))
        }

        rm(args) {
            backend.rm(Scratch.Cast.toString(args.PATH))
        }

        mkdir(args) {
            backend.mkdir(Scratch.Cast.toString(args.PATH))
        }

        ls(args) {
            return JSON.stringify(backend.ls(Scratch.Cast.toString(args.PATH)))
        }

        debug(args) {
            console.log(backend.fs)
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new RedBackend())
})(Scratch);