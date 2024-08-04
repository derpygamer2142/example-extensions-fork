(function (Scratch) {
    'use strict';
    var scene = [
        {
            "stage": {
                "type": "frame",
                "x": -240,
                "y": 180,
                "width": 480,
                "height": 360,
                "contents": []
            }
        },
    ];
    var objectTags = ["stage"]

    class RedOS {
        getInfo() {
            return {
                id: 'redos',
                name: 'RedOS Utils',
                color1: '#ff1b2d',
                color2: '#da1928',
                color3: '#a31722',
                blocks: [
                    {
                        opcode: 'clearScene',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Clear scene',
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: Scratch.translate("Objects"),
                    },
                    {
                        opcode: 'new',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'New - object: [data] frame: [frame]',
                        arguments: {
                            data: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                            frame: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "stage"
                            },
                        }
                    },
                    {
                        opcode: 'frame',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Frame - id: [id] x: [x] y: [y] width: [w] height: [h]',
                        arguments: {
                            id: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "id"
                            },
                            x: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            w: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 240
                            },
                            h: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 180
                            },
                        },
                    },
                    {
                        opcode: 'sprite',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Sprite - id: [id] costume: [cost] x: [x] y: [y] width: [w] height: [h] direction: [dir]',
                        arguments: {
                            id: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                            x: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            w: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            h: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            cost: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'dango'
                            },
                            dir: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: '90'
                            }
                        }

                    },
                    {
                        opcode: 'text',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Text - id: [id] text: [text] x: [x] y: [y] width: [w] height: [h]',
                        arguments: {
                            id: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                            x: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            w: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            h: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            text: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'text'
                            },
                        }

                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: Scratch.translate("Properties"),
                    },
                    {
                        opcode: 'set',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set - id: [id] property: [property] value: [value]',
                        arguments: {
                            id: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                            property: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                            value: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },
                    {
                        opcode: 'get',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get - id: [id] property: [property]',
                        arguments: {
                            id: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                            property: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: Scratch.translate("Frames"),
                    },
                    {
                        opcode: 'getChild',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get child - id: [id] index: [index]',
                        arguments: {
                            id: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                            index: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: ""
                            }
                        }
                    },
                    {
                        opcode: 'getNumChildren',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get # of children - id: [id]',
                        arguments: {
                            id: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            },
                        }
                    },
                ]
            };
        }

        sprite({ id, x, y, w, h, cost, dir }) {
            let obj = {};
            obj[id] =  { "type": "sprite", "x": x, "y": y, "width": w, "height": h, "costume": cost, "direction": dir }; 
            return JSON.stringify(obj);
        }
        text({ id, x, y, w, h, text }) {
            let obj = {};
            obj[id] =  { "type": "text", "x": x, "y": y, "width": w, "height": h, "text": text }; 
            return JSON.stringify(obj);
        }
        frame({ id, x, y, w, h }) {
            let obj = {};
            obj[id] =  { "type": "frame", "x": x, "y": y, "width": w, "height": h, "contents": [] };
            return JSON.stringify(obj);
        }
        new({ data, frame }) {
            var obj = JSON.parse(data);
            var id = Object.keys(obj)[0];
            scene[objectTags.indexOf(frame)][frame]['contents'].push(id);
            objectTags.push(id);
            scene.push(obj);
        }
        set({id, property, value}) {
            scene[objectTags.indexOf(id)][id][property] = value;
        }
        get({id, property}) {
            return scene[objectTags.indexOf(id)][id][property];
        }
        getChild({id, index}) {
            return scene[objectTags.indexOf(id)][id]['contents'][index - 1];
        }
        getNumChildren({id}) {
            return scene[objectTags.indexOf(id)][id]['contents'].length;
        }
        clearScene() {
            scene = [
                {
                    "stage": {
                        "type": "frame",
                        "x": -240,
                        "y": 180,
                        "width": 480,
                        "height": 360,
                        "contents": []
                    }
                },
            ];
            objectTags = ["stage"]
        }
    }
    Scratch.extensions.register(new RedOS());
})(Scratch);