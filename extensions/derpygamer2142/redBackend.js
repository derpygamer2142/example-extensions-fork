// Name: RedOS Backend
// ID: redbackend
// Description: Window manager, script runner
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT


/*
TODO:
file system, methods for accessing - done?
apps, methods for accessing/launching - done?
settings, methods for accessing
desktop

*/

function clamp(a,b,c) {
    return Math.min(Math.max(a,b),c)
}

function pointrect(x1,y1,x2,y2,px,py) {
    return (Math.min(Math.max(px,x1),x2) === px && Math.min(Math.max(py,y1),y2) === py)
}

const AsyncFunction = async function () {}.constructor;

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
            this.windowIds = []
            this.nextWindowIds = []

            this.events = {
                tick: []
            }

            this.fs = this.newDirPoint()

            
            this.mkdir("/system/apps")
            
            this.apps = {}

            this.mkdir("/system/settings")
            this.writeFile("/system/settings/settings.json",{
                ligma: "balls",
                skibidi: "ohio",
                aaa: "bbb"
            })

            this.settings = this.readFile("/system/settings/settings.json")

            // backend.onEvent("tick",()=>{backend.clearShapes(windowId);backend.drawCircle(0,Math.sin(Date.now() / 1000)*50,50,255,0,0,1,windowId);})
            // backend.onEvent("tick", ()=>{backend.clearShapes(windowId);backend.drawEllipse(0,Math.sin(Date.now() / 100)*50,100,50,255,0,0,1,windowId);},windowId);
            // backend.onEvent("tick",()=>{backend.clearShapes(windowId);backend.drawCircle(-65,-100,50,255,0,0,1,windowId);backend.drawCircle(65,-100,50,255,0,0,1,windowId);backend.drawLine(0,-100,0,100,35,255,0,0,1,windowId);},windowId);
            //backend.onEvent("tick",()=>{backend.clearShapes(windowId);backend.drawLine(0,-100,0,100,25,255,0,0,1,windowId);},windowId);
            //backend.onEvent("tick",()=>{backend.clearShapes(windowId);backend.drawCircle(-65,-100,50,255,0,0,1,windowId);backend.drawCircle(65,-100,50,255,0,0,1,windowId);backend.drawLine(0,-100,0,100,35,255,0,0,1,windowId);backend.drawText("red os best os",-100,110,100,1,0,255,255,255,windowId);},windowId);
            // backend.loadImage("https://i.ibb.co/qMBFBG9/find-ethan.jpg","find-ethan",windowId);backend.onEvent("tick", ()=>{backend.clearShapes(windowId);backend.drawImage("find-ethan",0,0,100,100,windowId);backend.drawRect(-50,-50,50,50,255,0,0,1,windowId);})
            // backend.loadImage("https://i.ibb.co/qMBFBG9/find-ethan.jpg","find-ethan",windowId);
            
            // const b = new backend.Button(100,-60,150,-30,255,0,0,1,windowId,backend, ()=>{console.log("click")},()=>{console.log("release")});
            // backend.loadImage("https://i.ibb.co/qMBFBG9/find-ethan.jpg","find-ethan",windowId);
            // backend.onEvent("tick", () => {
            //     backend.clearShapes(windowId);
            //     backend.drawImage("find-ethan",0,0,300,300,windowId);
            //     b.update(vm.runtime.ioDevices["mouse"]._scratchX,vm.runtime.ioDevices["mouse"]._scratchY,vm.runtime.ioDevices["mouse"]._isDown);
            //     b.render();
            // })


            // const b = new backend.Button(100,-60,150,-30,5, 255,0,0,1,windowId,backend, ()=>{console.log("click")},()=>{console.log("release")});
            // backend.loadImage("https://i.ibb.co/qMBFBG9/find-ethan.jpg","find-ethan",windowId);
            // backend.onEvent("tick", () => {
            //     backend.clearShapes(windowId);
            //     backend.drawImage("find-ethan",0,0,300,300,windowId);
            //     b.render();
            // })

            // let e = false;
            // const b = new backend.Button(50,-90,110,-30,5, 255,0,0,1,windowId,backend, ()=>{e=true;console.log("click");},()=>{console.log("release")});
            // backend.loadImage("https://i.ibb.co/qMBFBG9/find-ethan.jpg","find-ethan",windowId);
            // backend.onEvent("tick", () => {
            //     backend.clearShapes(windowId);
            //     backend.drawImage("find-ethan",0,0,300,300,windowId);
            //     b.update();
            //     if (e) {
            //         console.log("draw");
            //         backend.drawText("yay you found ethan good job", 0, 120, 0, 0, 0, 1, 35, 1, true, "center", 250, windowId);
            //     }
            //     /*b.render();*/
            // }, windowId)

            
            
            // backend.onEvent("tick",()=>{backend.drawRect(-100,-100,100,100,255,0,0,1,windowId)},windowId)

            //["IMAGE",6,0,0,300,300,"find-ethan","RECT",9,100,-60,150,-30,255,0,0,1]

            this.Button = class {
                constructor(x1, y1, x2, y2, radius, r, g, b, a, id, backend, onTrigger, offTrigger) {
                    this.x1 = x1
                    this.y1 = y1
                    this.x2 = x2
                    this.y2 = y2
                    this.radius = radius
                    this.r = r
                    this.g = g
                    this.b = b
                    this.a = a
                    this.id = id

                    this.backend = backend

                    this.triggered = false
                    this.onTrigger = onTrigger
                    this.offTrigger = offTrigger

                    this.lastMouse = false
                }

                toLocal(x, wx, ww, dim) {
                    return wx + ((x / (runtime[dim] / 2)) * ww)
                }
                
                update(/*mouseX, mouseY, mouseDown*/) {
                    const mouseX = vm.runtime.ioDevices["mouse"]._scratchX;
                    const mouseY = vm.runtime.ioDevices["mouse"]._scratchY;
                    const mouseDown = vm.runtime.ioDevices["mouse"]._isDown
                    const t = ((clamp(mouseX, this.toLocal(this.x1, this.backend.windows[this.id].x, this.backend.windows[this.id].width, "stageWidth"), this.toLocal(this.x2, this.backend.windows[this.id].x, this.backend.windows[this.id].width, "stageWidth")) === mouseX) && (clamp(mouseY,this.toLocal(this.y1, this.backend.windows[this.id].y, this.backend.windows[this.id].height, "stageHeight"),this.toLocal(this.y2, this.backend.windows[this.id].y, this.backend.windows[this.id].height, "stageHeight")) === mouseY) && mouseDown && !this.lastMouse && !this.triggered)
                    if (t) {
                        this.onTrigger(this)
                        this.triggered = true
                    }
                    else if (!t && this.triggered) {
                        this.offTrigger(this)
                        this.triggered = false
                    }
                    else {
                        this.triggered = false
                    }

                    this.lastMouse = mouseDown
                }

                render() {
                    this.backend.drawRect(this.x1, this.y1, this.x2, this.y2, this.radius, this.r, this.g, this.b, this.a, this.id)
                }
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
                held: false,
                sizing: false,
                minimized: false,
                maximized: false,
                oldw: -1,
                oldh: -1
            }
            this.windowIds.unshift(id)
            //this.nextWindowIds = this.windowIds.slice()

            return id
        }

        resizeWindow(dw, dh, id) {
            this.windows[id].x += dw/2
            this.windows[id].y += dh/2

            this.windows[id].width += dw
            this.windows[id].height -= dh

            if (this.windows[id].width < 320) {
                this.windows[id].x += (320 - this.windows[id].width) / 2
                this.windows[id].width = 320
            }
            if (this.windows[id].height < 180) {
                this.windows[id].y -= (180 - this.windows[id].height) / 2
                this.windows[id].height = 180
            }
            // this.windows[id].width = Math.max(this.windows[id].width, 320)
            // this.windows[id].height = Math.max(this.windows[id].height, 180)
        }

        moveWindow(dx, dy, id) {
            this.windows[id].x += dx
            this.windows[id].y += dy
        }


        drawCircle(x, y, radius, r, g, b, a, id) {
            this.windows[id].commands.push(this.windows[id].contents.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "CIRCLE",
                9,
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
            this.windows[id].commands.push(this.windows[id].contents.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "LINE",
                11,
                //clamp(x1,this.windows[id].x - this.windows[id].width/2, this.windows[id].x - this.windows[id].width/2),
                //clamp(y1,this.windows[id].y - this.windows[id].height/2, this.windows[id].y - this.windows[id].height/2),
                //clamp(x2,this.windows[id].x - this.windows[id].width/2, this.windows[id].x - this.windows[id].width/2),
                //clamp(y2,this.windows[id].y - this.windows[id].height/2, this.windows[id].y - this.windows[id].height/2),
                clamp(x1,-320,320),
                clamp(y1,-180,180),
                clamp(x2,-320,320),
                clamp(y2,-180,180),
                weight,
                r,
                g,
                b,
                a
            ])
        }
        
        drawRect(x1, y1, x2, y2, radius, r, g, b, a, id) {
            this.windows[id].commands.push(this.windows[id].contents.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "RECT",
                11,
                clamp(x1,this.windows[id].x - this.windows[id].width/2, this.windows[id].x + this.windows[id].width/2),
                clamp(y1,this.windows[id].y - this.windows[id].height/2, this.windows[id].y + this.windows[id].height/2),
                clamp(x2,this.windows[id].x - this.windows[id].width/2, this.windows[id].x + this.windows[id].width/2),
                clamp(y2,this.windows[id].y - this.windows[id].height/2, this.windows[id].y + this.windows[id].height/2),
                r,
                g,
                b,
                a,
                radius
            ])
        }

        drawEllipse(x, y, r1, r2, r, g, b, a, id) {
            this.windows[id].commands.push(this.windows[id].contents.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "ELLIPSE",
                10,
                x,
                y,
                r1,
                r2,
                r,
                g,
                b,
                a
            ])
        }

        drawText(text, x, y, r, g, b, a, size, spacing, bold, align, maxWidth, id) {
            this.windows[id].commands.push(this.windows[id].contents.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "TEXT",
                14,
                text,
                x,
                y,
                r,
                g,
                b,
                a,
                size,
                spacing,
                Scratch.Cast.toBoolean(bold),
                align,
                maxWidth
            ])
        }

        drawImage(name, x, y, width, height, id) {
            this.windows[id].commands.push(this.windows[id].contents.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "IMAGE",
                7,
                x,
                y,
                width,
                height,
                name
            ])
        }

        loadImage(url, name,id) {
            this.windows[id].commands.push(this.windows[id].contents.length)
            this.windows[id].contents = this.windows[id].contents.concat([
                "LOAD",
                4,
                url,
                name
            ])
        }

        clearShapes(id) {
            this.windows[id].contents = []
            this.windows[id].commands = []
        }

        onEvent(event, func, id) {
            switch (event) {
                case "tick": {
                    this.events.tick.push({
                        func: func,
                        src: id
                    })

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
                    if (Object.prototype.hasOwnProperty.call(section, p)) {
                        section = section[p]
                    }
                    else {
                        throw new Error("Invalid")
                    }
                })
                if (path === "") {
                    this.fs = this.newDirPoint() // :trol:
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
            const object = this.fs[apath[0]] ?? this.newDirPoint()
            apath.shift()
            let bobject = object // ~~bob ject~~ b object
            apath.forEach((p) => {
                if (p[0] === "_") throw new Error("Invalid")
                if (!Object.prototype.hasOwnProperty.call(bobject,p)) bobject[p] = this.newDirPoint()
                bobject = bobject[p]
                
            })
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
            const s = fileName.split("/")
            return {
                _isDir: false,
                _name: s[s.length - 1],
                _content: content,
                _type: type
            }
        }


        loadApp(appData) {
            if (
                typeof appData?.name === "string" &&
                typeof appData?.desktopIcon === "string" &&
                typeof appData?.code === "string" &&
                typeof appData?.id === "string" &&
                (appData?.name ?? [0])[0] !== "_"// && // app won't conflict with reserved words
                //!Object.prototype.hasOwnProperty.call(this.fs.system.apps, appData?.id ?? "") // app doesn't already exist
            ) {
                // probably valid ¯\_(ツ)_/¯
                const appPath = "/system/apps/" + appData.id
                this.mkdir(appPath)
                this.writeFile(appPath + "/app.json", appData)
                // note to self: if we add assets in the future add it here

                this.apps[appData.id] = appData
            }
            else {
                throw new Error("Invalid app!")
            }
        }

        deleteApp(id) {
            this.rm("/system/apps/" + id)
            delete this.apps[id]
        }

        loadOsFromFs(fs) {
            this.windows = {}
            this.apps = {}
            this.fs = fs
            this.events = {
                tick: []
            }

        }

        updateSetting(setting, value) {
            this.settings[setting] = value
            this.writeFile("/system/settings/settings.json",this.settings)
        }

        focusWindow(id) {
            this.nextWindowIds.splice(this.nextWindowIds.indexOf(id),1)
            this.nextWindowIds.unshift(id)
        }

        killWindow(id) {
            const i = this.nextWindowIds.indexOf(Scratch.Cast.toString(id))
            //console.log(this.nextWindowIds, this.windowIds, i)
            this.nextWindowIds.splice(i,1)
            //console.log(this.nextWindowIds, this.windowIds)
            //delete this.windows[id]
        }
    }

    const backend = new Backend()
    let windowData = undefined;
    let drawCommand = undefined
    let windowUpdated = false

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
                        opcode: "loadApp",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Load app from data [APPDATA]",
                        arguments: {
                            APPDATA: {
                                type: Scratch.ArgumentType.STRING,
                                // defaultValue of example goes here
                            }
                        }

                    },

                    {
                        opcode: "deleteApp",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Delete app [ID]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    },

                    {   
                        opcode: "debugApp",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Make a debug app from code [APP]",
                        arguments: {
                            APP: {
                                type: Scratch.ArgumentType.STRING,
                            }
                        }

                    },


                    {   
                        opcode: "runApp",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Run app [APP]",
                        arguments: {
                            APP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "skibidi"
                            }
                        }

                    },

                    {
                        opcode: "appLoaded",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "App [APP] loaded?",
                        arguments: {
                            APP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "skibidi"
                            }
                        }
                    },

                    {
                        opcode: "appRunning",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "App [APP] running?",
                        arguments: {
                            APP: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "skibidi"
                            }
                        }
                    },

                    {
                        opcode: "killAllWindows",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Kill all windows"
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
                        opcode: "clearListeners",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Clear all event listeners"
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
            const windowId = backend.newWindow(0, 0, 320, 180)
            // @ts-ignore
            const appFunction = new AsyncFunction("windowId", "backend", backend.apps[args.APP].code)
            
            appFunction(windowId, backend)
            /*
                sandboxing is cringe, who needs that
            */
        }

        loadApp(args, util) {
            backend.loadApp(JSON.parse(args.APPDATA))
        }

        debugApp(args, util) {
            return JSON.stringify({
                code: args.APP,
                desktopIcon: "ligma",
                name: "balls",
                id: "skibidi"
            })
        }

        deleteApp(args) {
            backend.deleteApp(Scratch.Cast.toString(args.ID))
        }

        forWindow(args, util) {
            // loop from Extra-Controls by sharkpool
            
            if (typeof util.stackFrame.loopCounter === "undefined") {
                backend.nextWindowIds = backend.windowIds.slice()
                windowUpdated = false
                util.stackFrame.loopCounter = backend.windowIds.length //Object.keys(backend.windows).length
            }
            util.stackFrame.loopCounter--;

            

            if (util.stackFrame.loopCounter >= 0) {
                windowData = backend.windows[Scratch.Cast.toString(backend.windowIds[util.stackFrame.loopCounter])]
                util.startBranch(1, true);
            }
            else {
                const a = JSON.stringify(backend.windowIds)
                const b = JSON.stringify(backend.nextWindowIds)
                if (a !== b) backend.windowIds = backend.nextWindowIds.slice()


                // const toRemove = backend.windowIds.filter((i) => !Object.prototype.hasOwnProperty.call(backend.windows,i))
                // toRemove.forEach((i) => {
                //     console.log(i)
                //     backend.windowIds.splice(backend.windowIds.indexOf(i),1)
                // })

                const toRemove = Object.keys(backend.windows)
                for (let i = 0; i < toRemove.length; i++) {
                    if (!backend.windowIds.includes(toRemove[i])) delete backend.windows[toRemove[i]]
                }
                
            }
            
        }

        forWindowContents(args, util) {
            if (typeof util.stackFrame.loopCounter === "undefined") util.stackFrame.loopCounter = backend.windows[Scratch.Cast.toString(args.ID)].commands.length
            util.stackFrame.loopCounter--;

           
            if (util.stackFrame.loopCounter >= 0) {
                const a = backend.windows[Scratch.Cast.toString(args.ID)].commands[(backend.windows[Scratch.Cast.toString(args.ID)].commands.length - 1) - util.stackFrame.loopCounter]
                drawCommand = backend.windows[Scratch.Cast.toString(args.ID)].contents.slice(a, a + backend.windows[Scratch.Cast.toString(args.ID)].contents[a+1])
                util.startBranch(1, true);
            }

        }

        windowData(args, util) {
            return JSON.stringify(windowData)
        }

        drawCommand(args, util) {
            return JSON.stringify(drawCommand)

        }

        updateWindowStuff(args, util) {
            args.WINDOW = Scratch.Cast.toString(args.WINDOW)
            const wx = backend.windows[args.WINDOW].x
            const wy = backend.windows[args.WINDOW].y
            const ww = backend.windows[args.WINDOW].width
            const wh = backend.windows[args.WINDOW].height
            args.X = Scratch.Cast.toNumber(args.X)
            args.Y = Scratch.Cast.toNumber(args.Y)
            args.DOWN = Scratch.Cast.toBoolean(args.DOWN)
            args.LAST = Scratch.Cast.toBoolean(args.LAST)


            if (!windowUpdated && pointrect((wx - (ww / 2) + 20) - 15, (wy + (wh / 2) - 17.5) - 15,(wx - (ww / 2) + 20) + 15, (wy + (wh / 2) - 17.5) + 15,args.X,args.Y) && args.DOWN && !args.LAST) { // minify button
                backend.windows[args.WINDOW].minimized = true
                windowUpdated = true
            }
            else if (!windowUpdated && pointrect((wx - (ww / 2) + 40) - 15, (wy + (wh / 2) - 17.5) - 15,(wx - (ww / 2) + 40) + 15, (wy + (wh / 2) - 17.5) + 15,args.X,args.Y) && args.DOWN && !args.LAST) { // minify button
                windowUpdated = true
                if (backend.windows[args.WINDOW].maximized) {
                    backend.windows[args.WINDOW].maximized = false
                    backend.windows[args.WINDOW].width = backend.windows[args.WINDOW].oldw
                    backend.windows[args.WINDOW].height = backend.windows[args.WINDOW].oldh
                    backend.focusWindow(args.WINDOW)
                    
                }
                else {
                    backend.windows[args.WINDOW].maximized = true
                    backend.windows[args.WINDOW].oldw = backend.windows[args.WINDOW].width
                    backend.windows[args.WINDOW].oldh = backend.windows[args.WINDOW].height
                    backend.windows[args.WINDOW].width = runtime.stageWidth
                    backend.windows[args.WINDOW].height = runtime.stageHeight
                    backend.windows[args.WINDOW].x = 0
                    backend.windows[args.WINDOW].y = 0
                    backend.focusWindow(args.WINDOW)
                }
                
            }
            else if (!windowUpdated && pointrect((wx - (ww / 2) + 60) - 15, (wy + (wh / 2) - 17.5) - 15,(wx - (ww / 2) + 60) + 15, (wy + (wh / 2) - 17.5) + 15,args.X,args.Y) && args.DOWN && !args.LAST) { // minify button
                Object.keys(backend.events).forEach((e) => {
                    backend.events[e] = backend.events[e].filter((i) => i.src != args.WINDOW)
                })
                //backend.windowIds.splice(backend.windowIds.indexOf(args.WINDOW), 1)
                //delete backend.windows[args.WINDOW]
                backend.killWindow(args.WINDOW)
                windowUpdated = true
                //console.log(args.WINDOW)
                return
            }
            
            

            if (!windowUpdated && (backend.windows[args.WINDOW].held && args.DOWN) || (args.DOWN && !args.LAST && ((args.X > wx - (ww/2)) && (args.X < wx + (ww/2)) && (args.Y < wy + (wh/2)) && (args.Y > wy + (wh*0.5) - 35)))) {
                backend.moveWindow(Scratch.Cast.toNumber(args.DX),Scratch.Cast.toNumber(args.DY),args.WINDOW)
                backend.windows[args.WINDOW].held = true
                backend.focusWindow(args.WINDOW)
                windowUpdated = true
            }
            else if (!windowUpdated && (backend.windows[args.WINDOW].sizing && args.DOWN) || (args.DOWN && !args.LAST && ((args.X > wx + (ww/2) - 15) && (args.X < wx + (ww/2)) && (args.Y <( wy - (wh*0.5)) + 15) && (args.Y > wy - (wh/2))))) {
                backend.resizeWindow(Scratch.Cast.toNumber(args.DX),Scratch.Cast.toNumber(args.DY),args.WINDOW)
                backend.windows[args.WINDOW].sizing = true
                backend.focusWindow(args.WINDOW)
                windowUpdated = true
            }
            else {
                backend.windows[args.WINDOW].held = false
                backend.windows[args.WINDOW].sizing = false
            }

        }

        async triggerEvent(args, util) {
            backend.events[Scratch.Cast.toString(args.EVENT)].forEach(async (e) => {
                await e.func()
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
            //console.log(backend.fs)
            console.log(backend.windowIds, backend.windows)
        }

        killAllWindows() {
            backend.windows = {}
            backend.windowIds = []
            backend.nextWindowIds = []
        }

        appLoaded(args) {
            return Object.prototype.hasOwnProperty.call(backend.apps, Scratch.Cast.toString(args.APP))
        }

        appRunning(args) {
            const keys = Object.keys(backend.events)
            for (let i = 0; i < keys.length; i++) {
                if (backend.events[keys[i]].filter((e) => e.src === Scratch.Cast.toString(args.APP))) return true
            }
            return false
        }

        clearListeners() {
            Object.keys(backend.events).forEach((e) => {
                backend.events[e] = []
            })
        }
    }
    // @ts-ignore
    Scratch.extensions.register(new RedBackend())
})(Scratch);