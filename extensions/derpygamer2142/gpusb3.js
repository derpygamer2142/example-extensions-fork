// Name: GPU.sb3
// ID: derpygamergpusb3
// Description: Use WebGPU compute shaders to accelerate your projects.
// By: derpygamer2142 <https://scratch.mit.edu/users/insanetaco2000/>
// License: MIT

(function (Scratch) {
  "use strict";
  const vm = Scratch.vm;
  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This extension must run unsandboxed.");
  }

  let buffersExt;
  // load exposed extension stuff
  const onAdded = () => {
    buffersExt = Scratch.vm.runtime.ext_0znzwBuffers; // miyo's buffer extension exposes some stuff, you can use these in the arraybuffer blocks for convenience
    if (buffersExt) Scratch.vm.runtime.off("EXTENSION_ADDED", onAdded);
  };
  Scratch.vm.runtime.on("EXTENSION_ADDED", onAdded);

  let shaders = {};
  let error = {};
  let buffers = {},
    bindGroups = {},
    bindGroupLayouts = {},
    bufferRefs = {}, // deprecated, not used anywhere anymore
    arrayBuffers = {},
    views = {},
    textures = {}, // webgpu texture objects, actual images will be yoinked from ~~the pen+ costume library(if available)~~(scrapped idea, too complicated. i go into more detail elsewhere) and costume list
    samplers = {}; // this doesn't work with compute shaders but i kept it in case i lock in and add other stuff(extremely unlikely but deleting code causes me pain)

  let currentBindGroup = "";
  let currentBindGroupLayout = "";

  // GPU.sb3 blocks
  const BINDGROUPLAYOUTCOLOR = "#1d723e"; // orange
  const BINDGROUPCOLOR = "#e85009"; // reddish-orange
  const TEXTURECOLOR = "#0fb5d6"; // sky blue
  const BUFFERCOLOR = "#b31064"; // maroon
  const ARRAYBUFFERCOLOR = "#b31010"; // red similar to list blocks
  // WGSL blocks
  const VARIABLECOLOR = "#bfbf1b"; // yellow
  const OBJECTCOLOR = "#0c8a1d"; // dark green
  const TYPECOLOR = "#08856a"; // dark cyan
  const FUNCTIONCOLOR = "#9c1991"; // purple
  const CONTROLCOLOR = "#f5ca49"; // light brown
  const ATOMICCOLOR = "#e64e4e"; // light red
  const ARBWGSLCOLOR = "#3528bf"; // dark blue

  class GPUSb3 {
    constructor() {
      this.device = null;
      this.adapter = null;
    }
    /**
     * Reconnect to WebGPU and clear resources
     * @param {*} args Unused
     * @param {import("scratch-vm").BlockUtility} util util
     */
    async init(args, util) {
      buffers = {};
      bindGroups = {};
      bindGroupLayouts = {};
      bufferRefs = {}; // unused but we clear this just in case
      arrayBuffers = {};
      views = {};
      textures = {};
      samplers = {}; // also unused, clear just in case

      // @ts-ignore
      if (!navigator.gpu) {
        // why angry red lines >: (
        if (typeof scaffolding === "undefined")
          alert(
            "WebGPU is unavailable in the current context. Check https://webgpu.io for more information."
          );
        return this.throwError(
          "WebGPUUnavailable",
          "WebGPU is not supported",
          "Init",
          "WebGPU is unavailable in the current context"
        );
        // throw new Error("WebGPU is not supported.");
      }

      // @ts-ignore
      this.adapter = await navigator.gpu.requestAdapter();
      if (!this.adapter) {
        if (typeof scaffolding === "undefined")
          alert("Failed to get WebGPU adapter!");
        return this.throwError(
          "AdapterGetFail",
          "Failed to get adapter",
          "Init",
          "Failed to get a WebGPU adapter"
        );
        // throw Error("Failed to get WebGPU adapter.");
      }

      this.device = await this.adapter.requestDevice();

      this.device.lost.then((info) => {
        if (typeof scaffolding === "undefined") alert("WebGPU device lost!");
        this.throwError("DeviceLost", info.message, "WebGPU", info);
        this.device = null; // requestDevice will never return null so we need to account for that ourselves
      });

      // note to self: uncomment this on release
      this.device.addEventListener("uncapturederror", (event) => {
        this.throwError(
          "UnclassifiedError",
          // @ts-ignore
          event.error.message,
          "Unknown",
          // @ts-ignore
          event.error
        ); // this is literally in the spec and the mdn docs, idk why it's complaining about event.error being undefined https://www.w3.org/TR/webgpu/#eventdef-gpudevice-uncapturederror
      });
    }

    /**
     * Throw an error in such a way that it can be read from the project and not break stuff
     * @param {String} errorname The name of the error, in PascalCase
     * @param {String} errorbody A short version of the error, punctuated
     * @param {String} errorsource The source of the error(usually a block), in PascalCase
     * @param {String | Object} full The errorbody, but with more detail
     */
    throwError(errorname, errorbody, errorsource, full) {
      error = {
        name: errorname ?? "Undefined. This is an error, please report it!",
        body: errorbody ?? "Undefined. This is an error, please report it!",
        source: errorsource ?? "Undefined. This is an error, please report it!",
        full: full ?? "Undefined. This is an error, please report it!",
      };

      console.error(error);

      Scratch.vm.runtime.startHats("gpusb3_onError");
    }

    /**
     *
     * @param {"buffers" | "bindGroups" | "bindGroupLayouts" | "arrayBuffers" | "views" | "textures" | "samplers"} type
     */
    resourceFromType(type) {
      switch (type) {
        case "buffers":
          return buffers;
        case "bindGroups":
          return bindGroups;
        case "bindGroupLayouts":
          return bindGroupLayouts;
        case "arrayBuffers":
          return arrayBuffers;
        case "views":
          return views;
        case "textures":
          return textures;
        case "samplers":
          return samplers; // unused, returned anyways
        default:
          return null;
      }
    }

    getInfo() {
      // this.init(null, null);
      return {
        id: "gpusb3",
        name: Scratch.translate("GPU.sb3"),

        color1: "#27c90e",
        // color2: "#166af2",
        // color3: "#032966",
        docsURI: "https://extensions.derpygamer2142.com/docs/gpusb3",
        blocks: [
          {
            hideFromPalette: true,
            opcode: "debug",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("DEBUG"),
          },

          {
            opcode: "webgpuAvailable",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("WebGPU available?"),
          },
          {
            opcode: "adapterConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("connected to GPU?"),
          },

          {
            opcode: "compileHat", // all the shader code goes under these hats
            blockType: Scratch.BlockType.EVENT,
            text: Scratch.translate(
              "define shader [NAME] using bind group layout [BGL]"
            ),
            isEdgeActivated: false,
            arguments: {
              // all arguments here are grabbed using some workspace tomfoolery, hence why they don't support anything other than text
              // originally these were fetched using a modified version of the wgsl transpiler(generateWGSL) but i just had stupid idiot brain fungus
              // and thought that was a good idea despite it being horrible and the least efficient way to do it
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myShader"),
              },
              BGL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBindGroupLayout"),
              },
            },
          },

          {
            opcode: "compileStart", // this is what converts the hats into the juicy code
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("compile shaders"),
          },

          {
            opcode: "onError", // error handling system to prevent everything from exploding
            blockType: Scratch.BlockType.EVENT,
            text: Scratch.translate("when error thrown"),
            isEdgeActivated: false,
          },

          {
            opcode: "clearError",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("clear current error"),
          },

          {
            opcode: "error",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("error"),
          },

          {
            opcode: "init", // this is run when the extension is loaded and is used to reconnect to the gpu
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("connect to GPU"),
          },

          {
            opcode: "runGPU",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "run shader [GPUFUNC] using bind group [BINDGROUP] dimensions x: [X] y: [Y] z: [Z]"
            ),
            arguments: {
              GPUFUNC: {
                // GPUFUNC is an old name that i am to scared to change
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myShader"),
              },
              BINDGROUP: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBindGroup"),
              },
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              Z: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },

          {
            blockType: "label",
            text: Scratch.translate("Data input blocks"),
          },

          {
            // this is a bit complicated so i will point towards the docs
            // https://extensions.derpygamer2142.com/docs/gpusb3/blocks#bindGroupLayout
            opcode: "createBindGroupLayout",
            blockType: Scratch.BlockType.CONDITIONAL,
            text: Scratch.translate("create bind group layout called [NAME]"),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBindGroupLayout"),
              },
            },
            color1: BINDGROUPLAYOUTCOLOR,
          },

          {
            opcode: "bindGroupLayoutEntry",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "add bind group layout entry with binding [BINDING] for type [TYPE] and descriptor [DESC]"
            ),
            arguments: {
              BINDING: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "BGLENTRYTYPES",
                defaultValue: Scratch.translate("buffer"),
              },
              DESC: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: BINDGROUPLAYOUTCOLOR,
          },

          {
            opcode: "bufferEntryDescriptor",
            blockType: Scratch.BlockType.REPORTER,
            // note to self: this text is correct, there's a different descriptor for each type
            text: Scratch.translate(
              "buffer layout entry descriptor with usage type [TYPE]"
            ),
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "BUFFERENTRYTYPE",
              },
            },
            color1: BINDGROUPLAYOUTCOLOR,
          },

          {
            opcode: "textureEntryDescriptor",
            blockType: Scratch.BlockType.REPORTER,
            // note to self: this text is correct, there's a different descriptor for each type
            text: Scratch.translate(
              "texture layout entry descriptor with usage type [TYPE] and format [FORMAT]"
            ),
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TEXTUREENTRYTYPE",
              },
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: "TEXTURECOLORFORMATS",
              },
            },
            color1: BINDGROUPLAYOUTCOLOR,
          },

          {
            hideFromPalette: true,
            opcode: "samplerEntryDescriptor",
            blockType: Scratch.BlockType.REPORTER,
            // note to self: this text is correct, there's a different descriptor for each type
            text: Scratch.translate(
              "sampler layout entry descriptor with sample type [TYPE]"
            ),
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "SAMPLERENTRYTYPE",
              },
            },
          },

          {
            opcode: "createBindGroup",
            blockType: Scratch.BlockType.CONDITIONAL,
            text: Scratch.translate(
              "create bind group called [NAME] using layout [LAYOUT]"
            ),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBindGroup"),
              },
              LAYOUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBindGroupLayout"),
              },
            },
            color1: BINDGROUPCOLOR,
          },

          {
            opcode: "bindGroupEntry",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "add bind group entry with binding [BINDING] of type [TYPE] using resource named [RESOURCE]"
            ),
            arguments: {
              BINDING: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "BGLENTRYTYPES", // this is named badly ig?
                defaultValue: Scratch.translate("buffer"),
              },
              RESOURCE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer"),
              },
            },
            color1: BINDGROUPCOLOR,
          },

          {
            // this is technically just a binary or operator but it's what's used to join usage operators
            blockType: Scratch.BlockType.REPORTER,
            opcode: "binaryOr",
            text: Scratch.translate("usage [A] | [B]"),
            arguments: {
              A: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 128,
              },
              B: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 4,
              },
            },
            color1: BINDGROUPCOLOR,
          },

          {
            // this is a GPUBuffer, not an ArrayBuffer
            blockType: Scratch.BlockType.COMMAND,
            opcode: "createBuffer",
            text: Scratch.translate(
              "create buffer called [NAME] with size(in bytes) [SIZE] and usage flags [USAGE]"
            ),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer"),
              },
              SIZE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 8,
              },
              USAGE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 140, // GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
              },
            },
            color1: BUFFERCOLOR,
          },

          {
            // https://www.w3.org/TR/webgpu/#buffer-usage
            opcode: "bufferUsage",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("buffer usage [USAGE]"),
            arguments: {
              USAGE: {
                type: Scratch.ArgumentType.STRING,
                menu: "BUFFERUSAGE",
                defaultValue: "STORAGE",
              },
            },
            color1: BUFFERCOLOR,
          },

          {
            // this should be self explanatory
            opcode: "copyTextureToBuffer",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "copy texture [TEXTURE] to buffer [BUFFER] with dimensions [WIDTH] [HEIGHT]"
            ),
            arguments: {
              TEXTURE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myTexture"),
              },
              BUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer"),
              },
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 15,
              },
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 15,
              },
            },
            color1: BUFFERCOLOR,
          },

          {
            // this is pretty important cuz otherwise the extension is basically useless
            // you can write data from the cpu to the gpu which is pretty cool

            opcode: "writeBuffer",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "write [SIZE] elements of data from arraybuffer [ARRAY] to buffer [BUFFER] from offset [OFF1] to offset [OFF2]"
            ),
            arguments: {
              SIZE: {
                // https://www.w3.org/TR/webgpu/#dom-gpuqueue-writebuffer
                // in elements for typesarrays and bytes otherwise
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 3,
              },
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
              },
              BUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer"),
              },
              OFF1: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              OFF2: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
            color1: BUFFERCOLOR,
          },

          {
            // this is primarily used for transferring stuff to MAP_WRITE | COPY_DST buffers
            opcode: "copyBufferToBuffer",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "copy [NUMBYTES] bytes of data from buffer [BUF1] from  position [BUF1OFF] to buffer [BUF2] at position [BUF2OFF]"
            ),
            arguments: {
              NUMBYTES: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 256,
              },
              BUF1: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer1"),
              },
              BUF1OFF: {
                // IMPORTANT: THIS IS IN BYTES!!!!!!!!!
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              BUF2: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer2"),
              },
              BUF2OFF: {
                // IMPORTANT: THIS IS IN BYTES!!!!!!!!!
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
            color1: BUFFERCOLOR,
          },

          {
            // i don't remember why this is hidden but i think it was important
            hideFromPalette: true,
            opcode: "clearBuffer",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "clear [NUMBYTES] bytes(-1 for all) of buffer [BUFFER] from offset [OFFSET]"
            ),
            arguments: {
              NUMBYTES: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 128,
              },
              BUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer"),
              },
              OFFSET: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 128,
              },
            },
            color1: BUFFERCOLOR,
          },

          {
            // gotta have the MAP_READ thing here
            opcode: "readBuffer",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "read buffer [BUFFER] to arraybuffer [ARRAYBUFFER]"
            ),
            arguments: {
              BUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer"),
              },
              ARRAYBUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myArrayBuffer"),
              },
            },
            color1: BUFFERCOLOR,
          },

          {
            // this is different from WebGL textures, you can """technically""" transfer between the two but it's overly complicated
            // and would have a bunch of overhead from running like 2 shaders and a gpu write
            opcode: "createTexture",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "create texture called [NAME] width dimensions [WIDTH] [HEIGHT], color format [FORMAT] and usage [USAGE]"
            ),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myTexture"),
              },
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 150,
              },
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 150,
              },
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: "TEXTURECOLORFORMATS",
              },
              USAGE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 6,
              },
            },
            color1: TEXTURECOLOR,
          },

          {
            // https://www.w3.org/TR/webgpu/#texture-usage
            opcode: "textureUsage",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("texture usage [USAGE]"),
            arguments: {
              USAGE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TEXTUREUSAGE",
                defaultValue: "STORAGE_BINDING",
              },
            },
            color1: TEXTURECOLOR,
          },

          {
            // I found out after implementing this that texture samplers don't work in compute shaders :,)
            // this continues to exist in case i add other shader types, which is extremely unlikely
            hideFromPalette: true,
            opcode: "createSampler",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "create texture sampler called [NAME] with U address mode [UMODE] and v address mode [VMODE] and mag filter [MAGFILTER]"
            ),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("mySampler"),
              },
              UMODE: {
                menu: "ADDRESSMODES",
              },
              VMODE: {
                menu: "ADDRESSMODES",
              },
              MAGFILTER: {
                menu: "FILTERMODES",
              },
            },
          },

          {
            // this is unused, it's still here for the 2 people(more like 0) who might have projects using this from the month period when it was in use
            // https://webidl.spec.whatwg.org/#AllowSharedBufferSource
            opcode: "genF32",
            blockType: Scratch.BlockType.REPORTER,
            hideFromPalette: true,
            text: Scratch.translate("F32 array from array [ARRAY]"),
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: JSON.stringify([1, 2, 3]),
              },
            },
          },

          {
            // this copies data from a GPUBuffer to a texture
            // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/copyBufferToTexture
            opcode: "copyBufferToTexture",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "copy elements with dimensions [WIDTH], [HEIGHT] from offset [OFFSET] in buffer [BUFFER] to texture [TEXTURE]"
            ),
            arguments: {
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2,
              },
              OFFSET: {
                // in bytes!
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              BUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myBuffer"),
              },
              TEXTURE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myTexture"),
              },
            },
            color1: TEXTURECOLOR,
          },

          {
            // costume -> GPUTexture
            opcode: "writeTexture",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "write texture data from [IMAGE] to texture [TEXTURE]"
            ),
            arguments: {
              IMAGE: {
                type: Scratch.ArgumentType.STRING,
                menu: "IMAGELIST",
              },
              TEXTURE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myTexture"),
              },
            },
            color1: TEXTURECOLOR,
          },

          {
            blockType: "label",
            text: Scratch.translate("ArrayBuffer blocks"),
          },

          // this is just arraybuffer stuff

          {
            opcode: "listABs",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("list arraybuffers"),
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "createAB",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "create arraybuffer called [ARRAYBUFFER] with length [LENGTH]"
            ),
            arguments: {
              ARRAYBUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myArrayBuffer"),
              },

              LENGTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 16,
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "createABFromArray",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "create arraybuffer and view called [ARRAYBUFFER] from array [ARRAY] of type [TYPE]"
            ),
            arguments: {
              ARRAYBUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myArrayBuffer"),
              },
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "[1,2,3]",
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TYPEDARRAYTYPES",
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "deleteAB",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("delete arraybuffer [ARRAYBUFFER]"),
            arguments: {
              ARRAYBUFFER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myArrayBuffer"),
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "resizeAB",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "resize arraybuffer [ARRAYBUFFER] to [SIZE] bytes"
            ),
            arguments: {
              ARRAYBUFFER: {
                type: Scratch.ArgumentType.STRING,
                menu: "ARRAYBUFFERS",
              },
              SIZE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 16,
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "listViews",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("list views"),
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "createABView",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "view arraybuffer [ARRAYBUFFER] as [TYPE] called [NAME]"
            ),
            arguments: {
              ARRAYBUFFER: {
                type: Scratch.ArgumentType.STRING,
                menu: "ARRAYBUFFERS",
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TYPEDARRAYTYPES",
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "deleteView",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("delete view [NAME]"),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "setItemInView",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "set item [INDEX] of view [VIEW] to [VALUE]"
            ),
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              VIEW: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
              VALUE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 255,
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "setView",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "copy data from array [ARRAY] to view [VIEW] from index [INDEX]"
            ),
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "[1,2,3]",
              },
              VIEW: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "fillView",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "fill items [START] to [END] of view [VIEW] with [VALUE]"
            ),
            arguments: {
              START: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              END: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5,
              },
              VIEW: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
              VALUE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 3,
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "itemOfView",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("item [INDEX] of arraybuffer view [VIEW]"),
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              VIEW: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "sliceView",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("items [START] to [END] of view [VIEW]"),
            arguments: {
              START: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              END: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 3,
              },
              VIEW: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "viewToArray",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get view [VIEW] as array"),
            arguments: {
              VIEW: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            opcode: "propFromView",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("[PROP] of view [VIEW]"),
            arguments: {
              PROP: {
                type: Scratch.ArgumentType.STRING,
                menu: "TYPEDARRAYPROPS",
              },
              VIEW: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myView"),
              },
            },
            color1: ARRAYBUFFERCOLOR,
          },

          {
            blockType: "label",
            text: Scratch.translate("WGSL Blocks"),
          },

          // it would be unnecessarily time consuming to explain the ins and outs of wgsl/webgpu syntax
          // so this is left as an exercise for the reader
          // because i am nice i will provide useful links
          // https://www.w3.org/TR/WGSL/
          // https://www.w3.org/TR/webgpu/
          // https://google.github.io/tour-of-wgsl/
          // https://chatgpt.com/ chatgpt will be somewhat helpful because you won't need to read an entire spec to find a snippet of information
          // https://toji.dev/webgpu-best-practices/error-handling.html seems to be one of the only places to explain error handling in human readable terms
          // for the love of whatever deity you may or may not believe in, do not use mdn as a reference for webgpu. it has incorrect and outdated information

          {
            opcode: "declareVar",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "declare [VARTYPE] variable as [NAME] with value [VALUE]: [TYPE]"
            ),
            arguments: {
              VARTYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "VARTYPES",
                defaultValue: "var",
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("someVariable"),
              },
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 12,
              },

              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TYPES",
                defaultValue: "auto",
              },
            },
            color1: VARIABLECOLOR,
          },

          {
            opcode: "bindInput",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "bind shader resource # [BINDNUM] to variable [VARNAME] with settings [SETTINGS] type [INPUTTYPE]"
            ),
            arguments: {
              BINDNUM: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              VARNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "data",
              },
              SETTINGS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "storage, read_write",
              },
              INPUTTYPE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "array<f32>",
              },
            },
            color1: VARIABLECOLOR,
          },

          {
            opcode: "variableUsage",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("variable usage [USAGE] next [NEXT]"),
            arguments: {
              USAGE: {
                type: Scratch.ArgumentType.STRING,
                menu: "VARUSAGE",
                defaultValue: "read_write",
              },
              NEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: VARIABLECOLOR,
          },

          {
            opcode: "varOp",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("variable [VARNAME] [VAROP]  [INPUT]"), // this will look like "Variable (something) (+=) (12)"
            arguments: {
              VARNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("someVariable"),
              },
              VAROP: {
                type: Scratch.ArgumentType.STRING,
                menu: "VAROPS",
                defaultValue: "+=",
              },
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "8",
              },
            },
            color1: VARIABLECOLOR,
          },

          {
            opcode: "getVar",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get variable [NAME]"),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("someVariable"),
              },
            },
            color1: VARIABLECOLOR,
          },

          {
            opcode: "variablePointer",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("pointer to variable [VAR]"),
            arguments: {
              VAR: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myVariable"),
              },
            },
            color1: VARIABLECOLOR,
          },

          "---",

          {
            opcode: "typeConstructor",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "create type [TYPE] of [SUBTYPE], length(array only!) [LENGTH]"
            ),
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "CONSTRUCTABLETYPES",
                defaultValue: "vec3",
              },
              SUBTYPE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
              LENGTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "",
              },
            },
            color1: TYPECOLOR,
          },

          {
            opcode: "matrixType",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "matrix type with [COLUMNS] columns and [ROWS] rows"
            ),
            arguments: {
              COLUMNS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2,
              },
              ROWS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2,
              },
            },
            color1: TYPECOLOR,
          },

          {
            opcode: "textureType",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "texture type of [TYPE] with access [ACCESS]"
            ),
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TEXTURECOLORFORMATS",
              },
              ACCESS: {
                type: Scratch.ArgumentType.STRING,
                menu: "VARIABLEACCESSTYPES",
              },
            },
            color1: TYPECOLOR,
          },

          {
            opcode: "structType",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("type of struct [STRUCT]"),
            arguments: {
              STRUCT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("MyStruct"),
              },
            },
            color1: TYPECOLOR,
          },

          {
            hideFromPalette: true, // this doesn't work with compute shaders, but if i decide to get freaky and somehow add other shader types(i probably won't) why redo code
            opcode: "samplerType",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("Sampler type"),
          },

          {
            opcode: "rootType",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("base type [TYPE]"),
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "RAWTYPES",
                defaultValue: "f32",
              },
            },
            color1: TYPECOLOR,
          },

          "---",

          {
            opcode: "constructFromType",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "construct type [TYPE] with values [VALUES]"
            ),
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "RAWTYPES",
                defaultValue: "f32",
              },
              VALUES: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: OBJECTCOLOR,
          },

          {
            opcode: "declareStruct",
            blockType: Scratch.BlockType.CONDITIONAL,
            text: Scratch.translate("declare struct called [NAME]"),
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("MyStruct"),
              },
            },
            color1: OBJECTCOLOR,
          },

          {
            opcode: "structProperty",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "add property called [PROPERTY] with type [TYPE] to struct"
            ),
            arguments: {
              PROPERTY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("someProperty"),
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "f32",
                menu: "RAWTYPES",
              },
            },
            color1: OBJECTCOLOR,
          },

          {
            opcode: "indexObject",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("in object [ARRAY] get index [INDEX]"),
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("someArray"),
              },
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
            color1: OBJECTCOLOR,
          },

          {
            opcode: "getProp",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("in object [OBJECT] get property [PROP]"),
            arguments: {
              OBJECT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("someObject"),
              },
              PROP: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: OBJECTCOLOR,
          },

          "---",

          {
            opcode: "computeFunc",
            blockType: Scratch.BlockType.CONDITIONAL,
            text: Scratch.translate(
              "computer shader with workgroup size [WGSIZE]"
            ),
            arguments: {
              WGSIZE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: JSON.stringify([1]),
              },
            },
            branchCount: 1,
            color1: CONTROLCOLOR,
          },

          {
            opcode: "wgslForLoop",
            blockType: Scratch.BlockType.CONDITIONAL, // this isn't a conditional :trol:
            text: Scratch.translate("for [VARNAME] in range [START], [END]"),
            arguments: {
              VARNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "i",
              },
              START: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
              END: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10,
              },
            },
            branchCount: 1,
            color1: CONTROLCOLOR,
          },

          {
            opcode: "wgslWhileLoop",
            blockType: Scratch.BlockType.CONDITIONAL, // this isn't a conditional :trol:
            text: Scratch.translate("while [COND]"),
            arguments: {
              COND: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            branchCount: 1,
            color1: CONTROLCOLOR,
          },

          {
            opcode: "break",
            blockType: Scratch.BlockType.COMMAND,
            isTerminal: true,
            text: Scratch.translate("break"),
            color1: CONTROLCOLOR,
          },

          {
            opcode: "continue",
            blockType: Scratch.BlockType.COMMAND,
            isTerminal: true,
            text: Scratch.translate("continue"),
            color1: CONTROLCOLOR,
          },

          {
            opcode: "wgslFunc",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "WGSL builtin [OPERATION] with args [VALUE]"
            ),
            arguments: {
              OPERATION: {
                type: Scratch.ArgumentType.STRING,
                menu: "WGSLFUNCS",
                defaultValue: "trunc",
              },
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "12.345",
              },
            },
            color1: FUNCTIONCOLOR,
          },

          {
            opcode: "funcArgs",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("func arg input [ARG], next [NEXT]"),
            arguments: {
              ARG: {
                // yee haw i'm a pirate
                type: Scratch.ArgumentType.STRING,
                defaultValue: "15",
              },
              NEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: FUNCTIONCOLOR,
          },

          {
            opcode: "defFunc",
            blockType: Scratch.BlockType.CONDITIONAL,
            text: Scratch.translate(
              "def function [FUNCNAME] that returns type [TYPE] with args [ARGS]"
            ),
            arguments: {
              FUNCNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myFunc"),
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "FUNCTYPES",
                defaultValue: "void",
              } /*,
                            ARGS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }*/,
            },
            color1: FUNCTIONCOLOR,
          },

          {
            opcode: "defFuncArgs",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "def arg [ARGNAME]: [ARGTYPE], next [NEXTARG]"
            ),
            arguments: {
              ARGNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("someArg"),
              },
              ARGTYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "RAWTYPES",
                defaultValue: "i32",
              },
              NEXTARG: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: FUNCTIONCOLOR,
          },

          {
            opcode: "getFuncArg",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get function arg [ARGNAME]"),
            arguments: {
              ARGNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("someArg"),
              },
            },
            color1: FUNCTIONCOLOR,
          },

          {
            opcode: "funcReturn",
            blockType: Scratch.BlockType.COMMAND,
            isTerminal: true,
            text: Scratch.translate("return [TORETURN]"),
            arguments: {
              TORETURN: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: FUNCTIONCOLOR,
          },

          {
            opcode: "c_runFunc",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("run function [FUNCNAME] with args [ARGS]"),
            arguments: {
              FUNCNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myFunc"),
              },
              ARGS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: FUNCTIONCOLOR,
          },

          {
            opcode: "r_runFunc",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("run function [FUNCNAME] with args [ARGS]"),
            arguments: {
              FUNCNAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myFunc"),
              },
              ARGS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
            color1: FUNCTIONCOLOR,
          },

          {
            blockType: "label",
            text: Scratch.translate("thread safety"),
          },

          {
            opcode: "atomicType",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("create atomic of type [BASE]"),
            arguments: {
              BASE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "i32",
                menu: "ATOMICBASES",
              },
            },
            color1: TYPECOLOR,
          },

          {
            opcode: "atomicLoad",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("load atomic [ATOMIC]"),
            arguments: {
              ATOMIC: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myAtomic"),
              },
            },
            color1: ATOMICCOLOR,
          },

          {
            opcode: "c_atomicFunc",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "perform operation [OP] on atomic [ATOMIC] with value [VALUE]"
            ),
            arguments: {
              OP: {
                type: Scratch.ArgumentType.STRING,
                menu: "ATOMICFUNCTIONS",
                defaultValue: "atomicStore",
              },
              ATOMIC: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myAtomic"),
              },
              VALUE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 15,
              },
            },
            color1: ATOMICCOLOR,
          },

          {
            opcode: "r_atomicFunc",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "perform operation [OP] on atomic [ATOMIC] with value [VALUE]"
            ),
            arguments: {
              OP: {
                type: Scratch.ArgumentType.STRING,
                menu: "ATOMICFUNCTIONS",
                defaultValue: "atomicStore",
              },
              ATOMIC: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("myAtomic"),
              },
              VALUE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 15,
              },
            },
            color1: ATOMICCOLOR,
          },

          {
            opcode: "barrier",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("barrier [TYPE]"),
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "BARRIERFUNCTIONS",
              },
            },
            color1: ATOMICCOLOR,
          },

          "---",

          {
            opcode: "c_arbitraryWGSL",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("arbitrary WGSL [TEXT]"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
              },
            },
            color1: ARBWGSLCOLOR,
          },

          {
            opcode: "r_arbitraryWGSL",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("arbitrary WGSL [TEXT]"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
              },
            },
            color1: ARBWGSLCOLOR,
          },
        ],

        menus: {
          // webgpu/wgsl stuff intentionally not translated
          // https://discord.com/channels/837024174865776680/1132437506655268926/1345066146625491095

          // all menus have acceptReporters set to true as otherwise they are located in other places in the block data
          // and it causes all sorts of issues
          TYPES: {
            // types you can have variables as, auto is special and gets interpreted differently
            acceptReporters: true,
            items: [
              "i32",
              "u32",
              "f32",
              "bool",
              "auto",
              // f16?
            ],
          },
          VARTYPES: {
            // unlike javascript, let is kinda constant but var is variable and const is constant
            acceptReporters: true,
            items: ["var", "let", "const"],
          },

          VAROPS: {
            // same as javascript
            // if you are reviewing this i would be concerned if you didn't at least
            // know what the majority of these do
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
              "<<=",
            ],
          },

          WGSLFUNCS: {
            // every WGSL builtin function
            // (atomics are in a seperate thing)
            acceptReporters: true,
            items: [
              "all",
              "any",
              "arrayLength",
              "asinh",
              "bitcast",
              "bool",
              "cosh",
              "countLeadingZeros",
              "countOneBits",
              "countTrailingZeros",
              "degrees",
              "determinant",
              // only for fragment shaders
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
              "textureDimensions",
              "textureLoad",
              "textureStore",
              // only for fragment shaders
              //"textureSample",
              // "textureSampleBaseClampToEdge"
              // "textureSampleBias"
              // "textureSampleCompare"
              // "textureSampleCompareLevel"
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
              "unpack4x8unorm",
            ],
          },

          FUNCTYPES: {
            // types that functions can return as
            acceptReporters: true,
            items: ["i32", "u32", "f32", "bool", "void"],
          },
          RAWTYPES: {
            // base variable types
            acceptReporters: true,
            items: ["i32", "u32", "f32", "bool"],
          },
          BGLENTRYTYPES: {
            acceptReporters: true,
            items: [
              "buffer",
              "storageTexture",
              //"sampler"
              // samplers removed due to not being available in compute shaders
            ],
          },
          CONSTRUCTABLETYPES: {
            // so you can do freaky stuff like array<array<array<vec4<i32>>>> in your horribly optimized """voxel game"""(minecraft clone)
            acceptReporters: true,
            items: ["vec2", "vec3", "vec4", "array"],
          },
          BUFFERUSAGE: {
            acceptReporters: true,
            items: [
              "COPY_SRC",
              "COPY_DST",
              "MAP_READ",
              "MAP_WRITE",
              "QUERY_RESOLVE",
              "STORAGE",
              "UNIFORM",
            ],
          },
          BUFFERENTRYTYPE: {
            // why does one buffer need so much data man
            // https://www.w3.org/TR/webgpu/#enumdef-gpubufferbindingtype
            acceptReporters: true,
            items: ["read-only-storage", "storage", "uniform"],
          },
          VARUSAGE: {
            acceptReporters: true,
            // https://www.w3.org/TR/WGSL/#var-and-value
            // https://www.w3.org/TR/WGSL/#enumerant
            // i hate this documentation so much
            // it took me 20 minutes to find any explanations of what these enumerators do
            // even then they're pretty bad and don't give a concrete answer for each one
            // some of these are just here in case someone wants them
            // who understands how they work better than i do
            items: [
              "read",
              "write",
              "read_write",
              "function",
              "private",
              "workgroup",
              "uniform",
              "storage",
            ],
          },
          ATOMICBASES: {
            // atomics can either be i32 or u32
            acceptReporters: true,
            items: ["i32", "u32"],
          },
          ATOMICFUNCTIONS: {
            acceptReporters: true,
            items: [
              //https://www.w3.org/TR/WGSL/#atomic-builtin-functions
              // if you don't know what atomics are, google it and/or ask chatgpt
              // if you are too lazy to do that, it's a variable except read/write protected across multithreading
              "atomicStore",
              "atomicAdd",
              "atomicSub",
              "atomicMax",
              "atomicMin",
              "atomicAnd",
              "atomicOr",
              "atomicXor",
              "atomicExchange",
              "atomicCompareExchangeWeak",
            ],
          },

          BARRIERFUNCTIONS: {
            // https://www.w3.org/TR/WGSL/#sync-builtin-functions
            acceptReporters: true,
            items: ["storageBarrier", "workgroupBarrier", "textureBarrier"],
          },

          TYPEDARRAYTYPES: {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects
            acceptReporters: true,
            items: [
              "Int32Array",
              "Uint32Array",
              "Float32Array",
              // webgpu doesn't support types below this comment, but people may want to access them using those types anyways
              "Int8Array",
              "Uint8Array",
              "Uint8ClampedArray",
              "Int16Array",
              "Uint16Array",
              // "Float16Array",
              // float16array is only available in firefox so it is excluded for compatibility
              "BigInt64Array",
              "BigUint64Array",
              "Float64Array",
            ],
          },

          ARRAYBUFFERS: {
            acceptReporters: true,
            items: "getArrayBuffersMenu",
          },

          TYPEDARRAYPROPS: {
            // properties on a TypedArray
            acceptReporters: true,
            items: ["BYTES_PER_ELEMENT", "byteLength", "length"],
          },

          TEXTURECOLORFORMATS: {
            // https://www.w3.org/TR/webgpu/#enumdef-gputextureformat
            // some formats aren't supported(i think?), and depth textures aren't usable in compute shaders
            acceptReporters: true,
            items: [
              // 8-bit formats
              "r8unorm",
              "r8snorm",
              "r8uint",
              "r8sint",

              // 16-bit formats
              "r16uint",
              "r16sint",
              "r16float",
              "rg8unorm",
              "rg8snorm",
              "rg8uint",
              "rg8sint",

              // 32-bit formats
              "r32uint",
              "r32sint",
              "r32float",
              "rg16uint",
              "rg16sint",
              "rg16float",
              "rgba8unorm",
              //"rgba8unorm-srgb",
              "rgba8snorm",
              "rgba8uint",
              "rgba8sint",
              "bgra8unorm",
              "bgra8unorm-srgb",
              // Packed 32-bit formats
              // "rgb9e5ufloat",
              // "rgb10a2uint",
              // "rgb10a2unorm",
              // "rg11b10ufloat",

              // 64-bit formats
              "rg32uint",
              "rg32sint",
              "rg32float",
              "rgba16uint",
              "rgba16sint",
              "rgba16float",

              // 128-bit formats
              "rgba32uint",
              "rgba32sint",
              "rgba32float",
            ],
          },
          TEXTUREUSAGE: {
            // https://www.w3.org/TR/webgpu/#dom-gputextureusage-storage_binding
            acceptReporters: true,
            items: [
              "COPY_SRC",
              "COPY_DST",
              "TEXTURE_BINDING",
              "STORAGE_BINDING",
              // RENDER_ATTACHMENT intentionally excluded
            ],
          },

          IMAGELIST: {
            acceptReporters: true,
            items: "getImageList",
          },

          ADDRESSMODES: {
            // how to deal with querying out of texture boundaries
            acceptReporters: true,
            items: ["clamp-to-edge", "repeat", "mirror-repeat"],
          },

          FILTERMODES: {
            // filtering stuff
            acceptReporters: true,
            items: ["nearest", "filter"],
          },

          TEXTUREENTRYTYPE: {
            // similar to the buffer version of this
            acceptReporters: true,
            items: ["write-only", "read-only", "read-write"],
          },

          SAMPLERENTRYTYPE: {
            acceptReporters: true,
            items: ["float", "unfilterable-float", "sint", "uint"],
          },

          TEXTUREBASETYPES: {
            acceptReporters: true,
            items: ["f32", "i32", "u32"],
          },

          VARIABLEACCESSTYPES: {
            acceptReporters: true,
            items: [
              { text: Scratch.translate("read"), value: "read" },
              { text: Scratch.translate("write"), value: "write" },
              { text: Scratch.translate("read_write"), value: "read_write" },
            ],
          },
        },
      };
    }

    /*

    compiler stuff below this point v

    */

    /**
     * given the opcode of a "raw" input, (type of text, math_number, or an extension menu), get the value.
     * @param {import("scratch-vm").BlockUtility} util util
     * @param {String} id The field to get the data from
     * @param {Boolean} unsafe i don't remember :trol:
     * @returns
     */
    textFromOp(util, id, unsafe) {
      // IMPORTANT: All menus in this extension accept reporters because otherwise the field gets stored elsewhere
      // and it's a whole thing.
      const _blocks = util.thread.blockContainer._blocks;
      // blob.fields should have exactly one key, except in the case of raw blocks(see comment a little further down)

      const blob = _blocks[id];
      switch (blob.opcode) {
        case "text": {
          return blob.fields.TEXT.value;
        }
        case "math_number": {
          return blob.fields.NUM.value;
        }
        case "gpusb3_menu_VARTYPES": {
          return blob.fields.VARTYPES.value;
        }
        case "gpusb3_menu_VAROPS": {
          return blob.fields.VAROPS.value;
        }
        case "gpusb3_menu_TYPES": {
          return blob.fields.TYPES.value;
        }
        case "gpusb3_menu_WGSLFUNCS": {
          return blob.fields.WGSLFUNCS.value;
        }
        case "gpusb3_menu_FUNCTYPES": {
          return blob.fields.FUNCTYPES.value;
        }
        case "gpusb3_menu_RAWTYPES": {
          return blob.fields.RAWTYPES.value;
        }

        case "gpusb3_menu_BGLENTRYTYPES": {
          return blob.fields.BGLENTRYTYPES.value;
        }

        case "gpusb3_menu_CONSTRUCTABLETYPES": {
          return blob.fields.CONSTRUCTABLETYPES.value;
        }

        case "gpusb3_menu_BUFFERUSAGE": {
          return blob.fields.BUFFERUSAGE.value;
        }

        case "gpusb3_menu_BUFFERENTRYTYPE": {
          return blob.fields.BUFFERENTRYTYPE.value;
        }

        case "gpusb3_menu_VARUSAGE": {
          return blob.fields.VARUSAGE.value;
        }

        case "gpusb3_menu_ATOMICBASES": {
          return blob.fields.ATOMICBASES.value;
        }

        case "gpusb3_menu_ATOMICFUNCTIONS": {
          return blob.fields.ATOMICFUNCTIONS.value;
        }

        case "gpusb3_menu_BARRIERFUNCTIONS": {
          return blob.fields.BARRIERFUNCTIONS.value;
        }

        case "gpusb3_menu_TEXTUREBASETYPES": {
          return blob.fields.TEXTUREBASETYPES.value;
        }

        case "gpusb3_samplerType": {
          // v past me either didn't finish this comment or removed part of it, and i don't remember what it said
          // i am now reworking the compiler and i could probably fix whatever i was yapping about but i don't want to look through stuff to figure it out
          // the "solution" here is to just do whatever this case does and return the desired input if anyone ever decides to use this kind of block again

          // IMPORTANT: For blocks with no inputs, such as the scrapped sampler type block,
          return "sampler"; // the codesmell here is crazy but this should work well enough
        }

        case "gpusb3_menu_VARIABLEACCESSTYPES": {
          return blob.fields.VARIABLEACCESSTYPES.value;
        }

        case "gpusb3_menu_TEXTURECOLORFORMATS": {
          return blob.fields.TEXTURECOLORFORMATS.value;
        }

        default: {
          if (unsafe) {
            return "";
          }
          this.throwError(
            "MissingOp",
            "Input type not found, did you forget to add a menu?",
            "TextFromOp",
            "Input type not found, did you forget to add a menu?"
          );
          console.log(blob);

          return "Failed to get value";
        }
      }
    }

    /**
     *
     * @param {import("scratch-vm").BlockUtility} util util
     * @param {import("scratch-vm").Block} block The block to resolve
     * @returns {String} Compiled output
     */
    resolveInput(util, block) {
      return Scratch.Cast.toString(
        Array.isArray(block)
          ? this.genWGSL(util, block, 1)
          : this.textFromOp(util, block.id, false)
      );
    }

    /**
     * Resolve a possibly missing raw input block
     * @param {import("scratch-vm").BlockUtility} util util
     * @param {Object | undefined | null} block A possibly missing input block, such as with the operands in operator_and
     * @param {*} defaultValue The value to replace this input with in the event that it is invalid
     * @param {Number} recursionDepth Recursion depth
     * @returns {String}
     */
    resolvePossibleMissingInput(util, block, defaultValue, recursionDepth) {
      if (block) {
        return this.genWGSL(util, block, recursionDepth + 1);
      }
      this.throwError(
        "CompilationWarning",
        "Replacing missing input!",
        "WGSLGeneration",
        "Replacing a missing input with the default value " +
          Scratch.Cast.toString(defaultValue)
      );
      return defaultValue;
    }

    /**
     * Determine whether a string is a stringified object. Used for compute shader dimensions.
     * @param {String} text A maybe stringified object
     * @returns {Boolean}
     */
    isStringified(text) {
      try {
        JSON.parse(text);
        return true;
      } catch {
        return false;
      }
    }

    /**
     * Recursively generate WGSL from the provided shunting-yard esque array
     * @param {import("scratch-vm").BlockUtility} util util
     * @param {Array<*> | Object} blocks An array returned by this.compile()
     * @param {Number} recursionDepth Recursion depth, I think this is just used for debug stuff
     * @returns {String} WGSL code
     */
    genWGSL(util, blocks, recursionDepth) {
      // for those wondering about isGeneratingArgumentsBecauseTheOtherThingITriedDidntWork, see https://github.com/derpygamer2142/example-extensions-fork/commit/bed128377314a95f6cf2775ed4771cf08d3f3e7e

      // we read through the list of stuff to compile, and after compiling each section we're offset to the next block.
      // the output of the compilation is added to this code variable
      if (!Array.isArray(blocks) && blocks._value !== null)
        return blocks._value; // not an array = it's a raw input
      else if (blocks._value === null) blocks = [blocks]; // kinda hacky because i'm too lazy to change the tree format

      let code = "";
      for (let i = 0; i < blocks.length; i++) {
        //console.log(code)
        let b = blocks[i];
        // if the block we're reading is an object, it's a reporter block

        switch (
          b._opcode // based on the opcode do whatever is needed
        ) {
          case "operator_equals": {
            code = code.concat(
              ` (${this.genWGSL(util, b.OPERAND1, recursionDepth + 1)} == ${this.genWGSL(util, b.OPERAND2, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_lt": {
            code = code.concat(
              ` (${this.genWGSL(util, b.OPERAND1, recursionDepth + 1)} < ${this.genWGSL(util, b.OPERAND2, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_gt": {
            code = code.concat(
              ` (${this.genWGSL(util, b.OPERAND1, recursionDepth + 1)} > ${this.genWGSL(util, b.OPERAND2, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_and": {
            code = code.concat(
              ` (${this.resolvePossibleMissingInput(util, b.OPERAND1, true, recursionDepth + 1)} && ${this.resolvePossibleMissingInput(util, b.OPERAND2, true, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_or": {
            code = code.concat(
              ` (${this.resolvePossibleMissingInput(util, b.OPERAND1, true, recursionDepth + 1)} && ${this.resolvePossibleMissingInput(util, b.OPERAND2, true, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_add": {
            code = code.concat(
              ` (${this.genWGSL(util, b.NUM1, recursionDepth + 1)} + ${this.genWGSL(util, b.NUM2, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_subtract": {
            code = code.concat(
              ` (${this.genWGSL(util, b.NUM1, recursionDepth + 1)} - ${this.genWGSL(util, b.NUM2, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_multiply": {
            code = code.concat(
              ` (${this.genWGSL(util, b.NUM1, recursionDepth + 1)} * ${this.genWGSL(util, b.NUM2, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_divide": {
            code = code.concat(
              ` (${this.genWGSL(util, b.NUM1, recursionDepth + 1)} / ${this.genWGSL(util, b.NUM2, recursionDepth + 1)}) `
            );
            break;
          }

          case "operator_mod": {
            code = code.concat(
              ` (${this.genWGSL(util, b.NUM1, recursionDepth + 1)} % ${this.genWGSL(util, b.NUM2, recursionDepth + 1)}) `
            );
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
            let op = "How do you mess up this badly?"; // this shouldn't ever be present unless you intentionally do it
            let actualop =
              util.thread.blockContainer._blocks[b.id].fields.OPERATOR.value;
            switch (actualop) {
              case "abs": {
                op = "abs";
                break;
              }

              case "floor": {
                op = "floor";
                break;
              }

              case "ceiling": {
                op = "ceil";
                break;
              }

              case "sqrt": {
                op = "sqrt";
                break;
              }

              case "sin": {
                op = "sin";
                break;
              }

              case "cos": {
                op = "cos";
                break;
              }

              case "tan": {
                op = "tan";
                break;
              }

              case "asin": {
                op = "asin";
                break;
              }

              case "acos": {
                op = "acos";
                break;
              }

              case "atan": {
                op = "atan";
                break;
              }

              case "ln": {
                op = "log"; // confusing
                break;
              }

              case "log": {
                op = "log"; // special behavior below in the actualop check
                break;
              }

              case "e ^": {
                op = "exp";
                break;
              }

              case "10 ^": {
                op = "pow"; // this is slow!!!1!1!
                break;
              }
            }
            code = code.concat(op);
            code = code.concat(op === "pow" ? "(10.0, " : "(");
            code = code.concat(this.genWGSL(util, b.NUM, recursionDepth + 1));
            code = code.concat(
              actualop === "log"
                ? ") / " + Scratch.Cast.toString(Math.LN10)
                : ")"
            );
            break;
          }

          case "gpusb3_wgslFunc": {
            if (!b.OPERATION._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input",
                "WGSLBuiltinBlock",
                "Function input should not have an input"
              );
              return "Unexpected input";
            }
            code = code.concat(
              `${this.genWGSL(util, b.OPERATION, recursionDepth + 1)}(${this.genWGSL(util, b.VALUE, recursionDepth + 1)})`
            );
            break;
          }

          case "gpusb3_funcArgs": {
            code = code.concat(
              `${this.genWGSL(util, b.ARG, recursionDepth + 1)}, ${this.genWGSL(util, b.NEXT, recursionDepth + 1)}`
            );
            break;
          }

          case "gpusb3_getVar": {
            if (!b.NAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input",
                "GetVariableBlock",
                "Unexpected input in get variable block"
              );
              return "Unexpected input";
            }
            code = code.concat(this.genWGSL(util, b.NAME, recursionDepth + 1)); // if your variable name is invalid it's your own fault and you can cry about it
            break;
          }

          case "gpusb3_constructFromType": {
            code = code.concat(
              `${this.genWGSL(util, b.TYPE, recursionDepth + 1)}(${this.genWGSL(util, b.VALUES, recursionDepth + 1)})`
            );
            break;
          }

          case "gpusb3_getProp": {
            if (!b.PROP._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "GetPropertyBlock",
                "Unexpected input in Get Property block!"
              );
              return "Unexpected input";
            }
            code = code.concat(
              `${this.genWGSL(util, b.OBJECT, recursionDepth + 1)}.${this.genWGSL(util, b.PROP, recursionDepth + 1)}`
            );
            break;
          }

          case "gpusb3_indexObject": {
            // https://www.w3.org/TR/WGSL/#matrix-access-expr
            code = code.concat(
              `${this.genWGSL(util, b.ARRAY, recursionDepth + 1)}[${this.genWGSL(util, b.INDEX, recursionDepth + 1)}]`
            );
            break;
          }

          case "gpusb3_typeConstructor": {
            code = code.concat(
              `${this.genWGSL(util, b.TYPE, recursionDepth + 1)}<${this.genWGSL(util, b.SUBTYPE, recursionDepth + 1)}`
            );

            // this will be a<b,c> if d is undefined, and a<b,c,d> otherwise
            if (!b.LENGTH._raw || (b.LENGTH._raw && b.LENGTH._value !== "")) {
              code = code.concat(
                `, ${this.genWGSL(util, b.LENGTH, recursionDepth + 1)}`
              );
            }
            code = code.concat(">");
            break;
          }

          case "gpusb3_rootType": {
            if (!b.TYPE._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "RootTypeBlock",
                "Unexpected input in Root type block!"
              );
              return "Unexpected input";
            }
            code = code.concat(this.genWGSL(util, b.TYPE, recursionDepth + 1));
            break;
          }

          case "gpusb3_matrixType": {
            if (!b.COLUMNS._raw || !b.ROWS._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "MatrixTypeBlock",
                "Unexpected input in Root type block!"
              );
              return "Unexpected input";
            }
            code = code.concat(
              `mat${this.genWGSL(util, b.COLUMNS, recursionDepth + 1)}x${this.genWGSL(util, b.ROWS, recursionDepth + 1)}`
            );
            break;
          }

          case "gpusb3_defFuncArgs": {
            if (!b.ARGNAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "DefFuncArgsBlock",
                "Unexpected input in Def func args block!"
              );
              return "Unexpected input";
            }

            code = code.concat(
              `${this.genWGSL(util, b.ARGNAME, recursionDepth + 1)}: ${this.genWGSL(util, b.ARGTYPE, recursionDepth + 1)}`
            );

            if (
              !b.NEXTARG._raw ||
              (b.NEXTARG._raw && b.NEXTARG._value !== "")
            ) {
              code = code.concat(
                `, ${this.genWGSL(util, b.NEXTARG, recursionDepth + 1)}`
              );
            }

            break;
          }

          case "gpusb3_getFuncArg": {
            if (!b.ARGNAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "GetFuncArgBlock",
                "Unexpected input in Get func arg block!"
              );
              return "Unexpected input";
            }
            code = code.concat(this.textFromOp(util, b.ARGNAME, false));
            break;
          }

          case "gpusb3_r_runFunc": {
            if (!b.FUNCNAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "RunFuncBlock",
                "Unexpected input in Run func block!"
              );
              return "Unexpected input";
            }
            code = code.concat(
              `${this.genWGSL(util, b.FUNCNAME, recursionDepth + 1)}(${this.genWGSL(util, b.ARGS, recursionDepth + 1)})`
            );
            break;
          }

          case "gpusb3_variableUsage": {
            if (!b.USAGE._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "VariableUsageBlock",
                "Unexpected input in Variable block!"
              );
              return "Unexpected input";
            }
            code = code.concat(this.genWGSL(util, b.USAGE, recursionDepth + 1));

            if (!b.NEXT._raw) {
              code = code.concat(", ");
              code = code.concat(
                this.genWGSL(util, b.NEXT, recursionDepth + 1)
              );
            }
            break;
          }

          case "gpusb3_atomicLoad": {
            code = code.concat(
              "atomicLoad(" +
                this.genWGSL(util, b.ATOMIC, recursionDepth + 1) +
                ")"
            );

            break;
          }

          case "gpusb3_atomicType": {
            if (!b.BASE._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "AtomicTypeBlock",
                "Unexpected input in Variable block!"
              );
              return "Unexpected input in variable usage!";
            }
            code = code.concat(
              "atomic<" + this.genWGSL(util, b.BASE, recursionDepth + 1) + ">"
            );

            break;
          }

          case "gpusb3_r_atomicFunc": {
            if (!b.OP._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "AtomicFunctionBlock",
                "Unexpected input in Variable block!"
              );
              return "Unexpected input in atomic function!";
            }

            code = code.concat(
              `${this.genWGSL(util, b.OP, recursionDepth + 1)}(${this.genWGSL(util, b.ATOMIC, recursionDepth + 1)}, ${this.genWGSL(util, b.VALUE, recursionDepth + 1)})`
            );

            break;
          }

          case "gpusb3_variablePointer": {
            code = code.concat(
              "&" + this.genWGSL(util, b.VAR, recursionDepth + 1)
            );

            break;
          }

          case "gpusb3_textureType": {
            code = code.concat(
              `texture_storage_2d<${this.genWGSL(util, b.TYPE, recursionDepth + 1)}, ${this.genWGSL(util, b.ACCESS, recursionDepth + 1)}>`
            );

            break;
          }

          case "gpusb3_samplerType": {
            code = code.concat("sampler"); // probably one of the simplest blocks here

            break;
          }

          case "gpusb3_structType": {
            if (!b.STRUCT._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "StructTypeBlock",
                "Unexpected input in struct type block!"
              );
              return "Unexpected input in struct type";
            }

            code = code.concat(
              this.genWGSL(util, b.OBJECT, recursionDepth + 1)
            ); // this is the same as some other blocks, but for clarity reasons there are multiple

            break;
          }

          // non reporters

          case "control_if": {
            code = code.concat("if (");
            code = code.concat(
              this.resolvePossibleMissingInput(
                util,
                b.CONDITON,
                "true",
                recursionDepth
              )
            );
            code = code.concat(") {\n");
            if (b.SUBSTACK) {
              code = code.concat(
                this.genWGSL(util, b.SUBSTACK, recursionDepth + 1)
              );
            }

            code = code.concat("\n}\n"); // newlines for some semblance of readability
            break;
            // did i spell that right
          }

          case "control_if_else": {
            code = code.concat("if (");
            code = code.concat(
              this.resolvePossibleMissingInput(
                util,
                b.CONDITON,
                "true",
                recursionDepth
              )
            );
            code = code.concat(") {\n");
            if (b.SUBSTACK) {
              code = code.concat(
                this.genWGSL(util, b.SUBSTACK, recursionDepth + 1)
              );
            }

            code = code.concat("\n}\nelse {\n"); // newlines for some semblance of readability
            if (b.SUBSTACK2) {
              code = code.concat(
                this.genWGSL(util, b.SUBSTACK2, recursionDepth + 1)
              );
            }
            code = code.concat("\n}\n");
            break;
          }

          case "gpusb3_declareVar": {
            code = code.concat(
              !b.VARTYPE._raw
                ? `var<${this.genWGSL(util, b.VARTYPE, recursionDepth + 1)}>`
                : this.genWGSL(util, b.VARTYPE, recursionDepth + 1)
            );
            code = code.concat(" ");
            code = code.concat(
              !b.NAME._raw
                ? "_"
                : this.genWGSL(util, b.NAME, recursionDepth + 1)
            );

            const t = this.genWGSL(util, b.TYPE, recursionDepth + 1);
            if (t !== "auto") {
              code = code.concat(": ");
              code = code.concat(t);
            }
            if (b.VALUE._raw) {
              const t = this.genWGSL(util, b.VALUE, recursionDepth + 1);
              //console.log(JSON.stringify(t), t == "")
              if (t != "") {
                code = code.concat(" = ");
                code = code.concat(t);
              }
            } else {
              code = code.concat(" = ");
              code = code.concat(
                this.genWGSL(util, b.VALUE, recursionDepth + 1)
              );
            }

            code = code.concat(";\n");
            break;
          }

          case "gpusb3_varOp": {
            if (!b.VAROP._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input for block input!",
                "VarOpBlock",
                "Unexpected input in Variable operation block!"
              );
              return "Unexpected input";
            }
            code = code.concat(
              this.genWGSL(util, b.VARNAME, recursionDepth + 1)
            );
            code = code.concat(
              ` ${this.genWGSL(util, b.VAROP, recursionDepth + 1)} ${this.genWGSL(util, b.INPUT, recursionDepth + 1)};\n`
            );

            break;
          }

          case "gpusb3_computeFunc": {
            if (!b.WGSIZE._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "StructTypeBlock",
                "Unexpected input in struct type block!"
              );
              return "Unexpected input";
            }
            // isStringified is used here to determine if the provided shader dimensions are valid
            code = code.concat(`

@compute @workgroup_size(${this.isStringified(b.WGSIZE._value) ? JSON.parse(b.WGSIZE._value) : "64"}) fn computeShader(

@builtin(workgroup_id) workgroup_id : vec3<u32>,
@builtin(local_invocation_id) local_invocation_id : vec3<u32>,
@builtin(global_invocation_id) global_invocation_id : vec3<u32>,
@builtin(local_invocation_index) local_invocation_index: u32,
@builtin(num_workgroups) num_workgroups: vec3<u32>

                                ) {\n\n`);
            if (b.SUBSTACK) {
              code = code.concat(
                this.genWGSL(util, b.SUBSTACK, recursionDepth + 1)
              );
            } else {
              code = code.concat("return;\n");
            }

            code = code.concat("}\n");
            break;
          }

          case "gpusb3_wgslForLoop": {
            if (!b.VARNAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input for block input!",
                "ForLoopBlock",
                "Unexpected input in For loop block!"
              );
              return "Unexpected input";
            }
            code = code.concat(`
var ${this.genWGSL(util, b.VARNAME, recursionDepth + 1)} = ${this.genWGSL(util, b.START, recursionDepth + 1)};
loop {
if (${this.genWGSL(util, b.VARNAME, recursionDepth + 1)} > ${this.genWGSL(util, b.END, recursionDepth + 1)}) {
break;
};

`); // despite "break if (cond)" being in the spec, it does not work so we use a weird version instead
            // https://www.w3.org/TR/WGSL/#break-if-statement
            if (b.SUBSTACK) {
              code = code.concat(
                this.genWGSL(util, b.SUBSTACK, recursionDepth + 1)
              );
            } else {
              code = code.concat("break;\n");
            }

            code = code.concat(
              `${this.genWGSL(util, b.VARNAME, recursionDepth + 1)}++;\n}\n`
            ); // newlines for some semblance of readability
            break;
          }

          case "gpusb3_wgslWhileLoop": {
            code = code.concat(`
while (${this.genWGSL(util, b.COND, recursionDepth + 1)}) {

`);
            if (b.SUBSTACK) {
              code = code.concat(
                this.genWGSL(util, b.SUBSTACK, recursionDepth + 1)
              );
            } else {
              code = code.concat("break;\n");
            }

            code = code.concat(`}\n`); // newlines for some semblance of readability
            break;
          }

          case "gpusb3_break": {
            code = code.concat("break;\n");
            break;
          }

          case "gpusb3_continue": {
            code = code.concat("continue;\n");
            break;
          }

          case "gpusb3_bindInput": {
            if (!b.BINDNUM._raw || !b.VARNAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input for block input!",
                "BindResourceBlock",
                "Unexpected input in Bind resource block!"
              );
              return "Unexpected input";
            }
            if (b.SETTINGS._raw) {
              const t = b.SETTINGS._value;
              if (t == "") {
                code = code.concat(
                  `@group(0) @binding(${this.genWGSL(util, b.BINDNUM, recursionDepth + 1)}) var ${this.genWGSL(util, b.VARNAME, recursionDepth + 1)}: ${this.genWGSL(util, b.INPUTTYPE, recursionDepth + 1)};\n`
                );
              } else {
                code = code.concat(
                  `@group(0) @binding(${this.genWGSL(util, b.BINDNUM, recursionDepth + 1)}) var<${t}> ${this.genWGSL(util, b.VARNAME, recursionDepth + 1)}: ${this.genWGSL(util, b.INPUTTYPE, recursionDepth + 1)};\n`
                );
              }
            } else {
              code = code.concat(
                `@group(0) @binding(${this.genWGSL(util, b.BINDNUM, recursionDepth + 1)}) var<${this.genWGSL(util, b.SETTINGS, recursionDepth + 1)}> ${this.genWGSL(util, b.VARNAME, recursionDepth + 1)}: ${this.genWGSL(util, b.INPUTTYPE, recursionDepth + 1)};\n`
              );
            }

            break;
          }

          case "gpusb3_defFunc": {
            if (!b.FUNCNAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input for block input!",
                "DefFuncBlock",
                "Unexpected input in Function definition block!"
              );
              return "Unexpected input";
            }
            code = code.concat(
              `fn ${this.genWGSL(util, b.FUNCNAME, recursionDepth + 1)}(`
            );

            code = code.concat(this.genWGSL(util, b.ARGS, recursionDepth + 1));

            if (!b.TYPE._raw) {
              code = code.concat(
                `) -> ${this.genWGSL(util, b.TYPE, recursionDepth + 1)}`
              );
            } else {
              code = code.concat(
                b.TYPE._value === "void"
                  ? ") {\n"
                  : `) -> ${this.genWGSL(util, b.TYPE, recursionDepth + 1)} {\n`
              );
            }

            if (b.SUBSTACK) {
              code = code.concat(
                this.genWGSL(util, b.SUBSTACK, recursionDepth + 1)
              );
            }

            code = code.concat("}\n"); // newlines for some semblance of readability
            break;
          }

          case "gpusb3_funcReturn": {
            code = code.concat(`return`);
            if (!b.TORETURN._raw) {
              code = code.concat(
                " " + this.genWGSL(util, b.TORETURN, recursionDepth + 1)
              );
            } else if (b.TORETURN._value !== "") {
              code = code.concat(" ");
              code = code.concat(
                this.genWGSL(util, b.TORETURN, recursionDepth + 1)
              );
            }
            code = code.concat(";\n");
            break;
          }

          case "gpusb3_c_runFunc": {
            if (!b.FUNCNAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input for block input!",
                "RunFuncBlock",
                "Unexpected input in Run function block!"
              );
              return "Unexpected input";
            }
            code = code.concat(
              this.genWGSL(util, b.FUNCNAME, recursionDepth + 1)
            );
            code = code.concat(
              `(${this.genWGSL(util, b.ARGS, recursionDepth + 1)});\n`
            );

            break;
          }

          case "gpusb3_c_arbitraryWGSL": {
            code = code.concat(this.genWGSL(util, b.TEXT, recursionDepth + 1));

            break;
          }

          case "gpusb3_r_arbitraryWGSL": {
            code = code.concat(this.genWGSL(util, b.TEXT, recursionDepth + 1));

            break;
          }

          case "gpusb3_c_atomicFunc": {
            if (!b.OP._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "AtomicFunctionBlock",
                "Unexpected input in Variable block!"
              );
              return "Unexpected input";
            }
            code = code.concat(
              `${this.genWGSL(util, b.OP, recursionDepth + 1)}(${this.genWGSL(util, b.ATOMIC, recursionDepth + 1)}, ${this.genWGSL(util, b.VALUE, recursionDepth + 1)} );\n`
            );

            break;
          }

          case "gpusb3_barrier": {
            if (!b.TYPE._raw) {
              // barrier block minecraft??????
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "BarrierBlock",
                "Unexpected input in Barrier block!"
              );
              return "Unexpected input";
            }
            code = code.concat(
              this.genWGSL(util, b.TYPE, recursionDepth + 1) + "();\n"
            );

            break;
          }

          case "gpusb3_declareStruct": {
            if (!b.NAME._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "DeclareStructBlock",
                "Unexpected input in struct declaration block!"
              );
              return "Unexpected input";
            }

            code =
              code.concat(`struct ${this.genWGSL(util, b.NAME, recursionDepth + 1)} {
${b.SUBSTACK ? this.genWGSL(util, b.SUBSTACK, recursionDepth + 1) : ""}
};\n`); // this looks ugly but it formats the code correctly

            break;
          }

          case "gpusb3_structProperty": {
            if (!b.PROPERTY._raw) {
              this.throwError(
                "UnexpectedInput",
                "Unexpected input in block input!",
                "StructPropertyBlock",
                "Unexpected input in struct property block!"
              );
              return "Unexpected input";
            }

            code = code.concat(
              `${this.genWGSL(util, b.PROPERTY, recursionDepth + 1)}: ${this.genWGSL(util, b.TYPE, recursionDepth + 1)},\n`
            );

            break;
          }

          default: {
            this.throwError(
              "InvalidBlock",
              "Invalid block!",
              "genWGSL",
              "Invalid block, WGSL generation failed!"
            );
            console.error("Invalid block!", blocks.slice(i, i + 5), b);
            return "Invalid block";
          }
        }
      }

      return code;
    }

    /**
     * Get the id of an extension block given its BlockUtility. Used in a deperecated function.
     * @param {import("scratch-vm").BlockUtility} util util
     * @returns {String}
     */
    getBlockId(util) {
      // this function is by CST1229
      if (util.thread.isCompiled) {
        return util.thread.peekStack();
      } else {
        // @ts-ignore
        return util.thread.peekStackFrame().op.id;
      }
    }

    /**
     *
     * @param {import("scratch-vm").BlockUtility} util util
     * @param {import("scratch-vm").Blocks} blocks BlockContainer to grab blocks from
     * @param {String} check The block to generate an input tree for
     * @param {Boolean} addCheck Whether to add check to the input tree
     * @returns {Array | Object} Either a raw value object or an input tree
     */
    genInputTree(util, blocks, check, addCheck) {}

    /**
     * Generate a node in the abstract syntax tree for a given block or input
     * @param {import("scratch-vm").BlockUtility} util util
     * @param {import("scratch-vm").Thread} thread The thread to compile
     * @param {import("scratch-vm").Blocks} blocks BlockContainer
     * @param {String} block The id of the block to generate stuff for
     * @returns {Object} The node, see below comment
     */
    genBlock(util, thread, blocks, block) {
      let obj = {
        _opcode: blocks[block].opcode, // block opcode
        _id: block, // block id
        _raw: false, // whether this block is a raw input, where the opcode is "text", "math_number", "gpusb3_menu_TYPES", etc.
        _value: null, // if this block is a raw input, what its value is
      };
      const inputs = Object.keys(blocks[block].inputs);
      for (const input of inputs) {
        obj[input] = this.compile(
          util,
          util.thread,
          blocks,
          blocks[block].inputs[input].block,
          true,
          input.includes("SUBSTACK")
        );
      }

      if (
        inputs.length === 0 &&
        Object.keys(blocks[block].fields).length === 1
      ) {
        // this block is a raw input such as "text", "math_number", or a menu such as "gpusb3_menu_TYPES"
        obj._raw = true;
        obj._value = this.textFromOp(util, block, false);
      }

      return obj;
    }

    /*
    todo: super cool explanation goes here
    */

    /**
     * This recursively generates a collapsed abstract syntax tree(idk if this is the right term). See comment above this function for more information.
     * @param {import("scratch-vm").BlockUtility} util util
     * @param {import("scratch-vm").Thread} thread A thread to compile
     * @param {import("scratch-vm").Blocks} blocks BlockContainer, used to grab the blocks
     * @param {String} firstblock The id of the block to start compiling from, as this is recursive
     * @param {Boolean} addStart Whether to compile the first block in the thread
     * @param {Boolean} isStack Whether this segment is a stack of blocks. If it is, this function returns an array, otherwise it returns an object
     * @returns {Array | Object} Collapsed abstract syntax tree, see comment above this function
     */
    compile(util, thread, blocks, firstblock, addStart, isStack) {
      let output = isStack ? [] : {};
      let next = blocks[firstblock].next;
      if (addStart) {
        if (isStack) {
          output.push(this.genBlock(util, thread, blocks, firstblock));
        } else {
          output = this.genBlock(util, thread, blocks, firstblock);
        }
      }

      while (next) {
        // keep going until next becomes null, which means there's no more blocks
        output.push(this.genBlock(util, thread, blocks, next));
        next = blocks[next].next;
      }

      return output;
    }

    /**
     * Compiles all the shaders
     * @param {*} args
     * @param {import("scratch-vm").BlockUtility} util util
     */
    async compileStart(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "CompileShaders",
          "Failed to run block as the connection the GPU is invalid."
        );
      util.startHats("gpusb3_compileHat"); // NOTE TO SELF: THIS DOESN'T START THE HATS THEMSELVES(why is it named that then. this is stupid and i don't like it, i am going to complain on my twitter dot com), thanks sharkpool for providing this code
      let threads = vm.runtime.threads.filter(
        (i) =>
          util.thread.blockContainer._blocks[i.topBlock]?.opcode ===
          "gpusb3_compileHat"
      );

      if (threads.length > 0) {
        for (let i = 0; i < threads.length; i++) {
          let t = threads[i];
          const arraycompiled = this.compile(
            util,
            threads[i],
            // @ts-ignore
            threads[i].blockContainer._blocks,
            threads[i].topBlock,
            false,
            true
          );
          console.log(arraycompiled);
          const compiled = this.genWGSL(util, arraycompiled, 0);
          console.log(compiled);

          let bglInput =
            t.blockContainer._blocks[
              t.blockContainer._blocks[t.topBlock].inputs.BGL.block
            ];
          let nameInput =
            t.blockContainer._blocks[
              t.blockContainer._blocks[t.topBlock].inputs.NAME.block
            ];
          if (nameInput.opcode != "text" || bglInput.opcode != "text") {
            return this.throwError(
              "UnexpectedInput",
              "Unexpected input for block input!",
              "ShaderDefinition",
              "Shader name and bind group layout cannot have inputs!"
            );
          } else if (
            !Object.prototype.hasOwnProperty.call(
              bindGroupLayouts,
              bglInput.fields.TEXT.value
            ) &&
            bglInput.fields.TEXT.value !== ""
          ) {
            return this.throwError(
              "BindGroupLayoutNotFound",
              "Bind group layout not found!",
              `Shader "${nameInput.fields.TEXT.value}"`,
              `Couldn't find bind group layout"${bglInput.fields.TEXT.value}", make sure to define it before compiling!`
            );
          } else {
            let funcname = nameInput.fields.TEXT.value;

            this.device.pushErrorScope("internal");
            this.device.pushErrorScope("validation");

            const shaderModule = this.device.createShaderModule({
              label: `Shader "${funcname}"`,
              code: compiled,
            });
            let errored = false;

            await this.device.popErrorScope().then((error) => {
              if (error) {
                this.throwError(
                  "ShaderCreationError",
                  error.message,
                  "ShaderModuleCreation",
                  error
                );
                errored = true;
              }
            });
            await this.device.popErrorScope().then((error) => {
              if (error) {
                this.throwError(
                  "ShaderCreationError",
                  error.message,
                  "ShaderModuleCreation",
                  error
                );
                errored = true;
              }
            });

            shaders[funcname] = {
              name: funcname,
            };
            let shader = shaders[funcname];

            const compilationinfo = await shaderModule.getCompilationInfo();
            console.log(compilationinfo);

            for (const message of compilationinfo.messages) {
              this.throwError(
                "WGSLError",
                message.message,
                `ShaderCreation`,
                `Error parsing WGSL in shader "${funcname}": ${message.message} - Line ${message.lineNum}:${message.linePos} ${compiled.substring(Math.max(0, message.offset - 15), message.offset)}**${compiled.substring(message.offset, message.offset + message.length)}**${compiled.substring(message.offset + message.length, Math.min(compiled.length, message.offset + message.length + 15))}`
              );
              errored = true;
            }

            this.device.pushErrorScope("validation");
            this.device.pushErrorScope("internal");
            shader.computePipeline = this.device.createComputePipeline({
              layout: this.device.createPipelineLayout({
                bindGroupLayouts:
                  bglInput.fields.TEXT.value === ""
                    ? []
                    : [bindGroupLayouts[bglInput.fields.TEXT.value]],
              }),
              compute: {
                module: shaderModule,
                entryPoint: "computeShader",
              },
            });
            await this.device.popErrorScope().then((error) => {
              if (error) {
                this.throwError(
                  "ComputePipelineError",
                  error.message,
                  "ComputePipelineCreation",
                  error
                );
                errored = true;
              }
            });
            await this.device.popErrorScope().then((error) => {
              if (error) {
                this.throwError(
                  "ComputePipelineError",
                  error.message,
                  "ComputePipelineCreation",
                  error
                );
                errored = true;
              }
            });

            if (errored) delete shaders[funcname];
          }
        }
      }
    }

    /*
    
    compiler stuff above this point ^
    
    */

    runGPU(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "RunShader",
          "Failed to run block as the connection the GPU is invalid."
        );
      // run the given shader using a bind group
      if (!Object.prototype.hasOwnProperty.call(shaders, args.GPUFUNC)) {
        return this.throwError(
          "ShaderNotFound",
          "Couldn't find specified shader!",
          "RunShaderBlock",
          "Couldn't find shader \"" + Scratch.Cast.toString(args.GPUFUNC) + '"!'
        );
      }
      if (
        !Object.prototype.hasOwnProperty.call(
          bindGroups,
          Scratch.Cast.toString(args.BINDGROUP)
        )
      ) {
        return this.throwError(
          "BindGroupNotFound",
          "Couldn't find specified bind group!",
          "RunShaderBlock",
          "Couldn't find bind group \"" +
            Scratch.Cast.toString(args.BINDGROUP) +
            '"!'
        );
      }
      let shader = shaders[args.GPUFUNC];

      this.device.pushErrorScope("validation");
      this.device.pushErrorScope("internal");
      this.device.pushErrorScope("out-of-memory");
      const commandEncoder = this.device.createCommandEncoder();

      const passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(shader.computePipeline);
      passEncoder.setBindGroup(
        0,
        bindGroups[Scratch.Cast.toString(args.BINDGROUP)]
      );
      passEncoder.dispatchWorkgroups(
        Scratch.Cast.toNumber(args.X),
        Scratch.Cast.toNumber(args.Y),
        Scratch.Cast.toNumber(args.Z)
      );
      passEncoder.end();
      this.device.queue.submit([commandEncoder.finish()]);

      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "UnclassifiedRuntimeErrorOOM",
            error.message,
            "RunShaderBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "UnclassifiedRuntimeError",
            error.message,
            "RunShaderBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "UnclassifiedRuntimeError",
            error.message,
            "RunShaderBlock",
            error
          );
      });
    }

    compileHat(args, util) {}

    getVar(args, util) {
      return "This block lets you get variables in your shader.";
    }

    declareVar(args, util) {}

    varOp(args, util) {}

    wgslFunc(args, util) {
      return "This block has a bunch of WGSL builtin functions.";
    }

    funcArgs(args, util) {
      return "Chain multiple of this block together to create function inputs.";
    }

    computeFunc(args, util) {}

    wgslForLoop(args, util) {}

    defFunc(args, util) {}

    defFuncArgs(args, util) {
      return "This is used to add arguments to your functions.";
    }

    getFuncArg(args, util) {
      return "Use this block to get the value of an argument you defined using the def function arg block.";
    }

    funcReturn(args, util) {}

    c_runFunc(args, util) {}

    r_runFunc(args, util) {
      return "This block will run a given function and return the output.";
    }

    gpuFuncArgDef(args, util) {
      return "This is used to add input arguments to your shaders.";
    }

    bindInput(args, util) {}

    typeConstructor(args, util) {
      return "This block lets you constructor types. You can put this block inside of itself(with a base type at the end) to create complex types, for example an array of vec2s of f32.";
    }

    rootType(args, util) {
      return "This can be used with the above block for a root type.";
    }

    matrixType() {
      return "This block creates a type for a matrix with the dimensions specified.";
    }

    bufferUsage(args, util) {
      /* eslint-disable-next-line --
       * Eslint doesn't like WebGPU, there's a type module for this.
       */
      return GPUBufferUsage[Scratch.Cast.toString(args.USAGE)] ?? 1;
      //return "This is used by the def shader arg block to define inputs. It's different from the usage in the bind input block."
    }

    variableUsage(args, util) {
      return "This block can be used in the special variable declaration block or the buffer binding usage block to describe how the variable will be used.";
    }

    indexObject(args, util) {
      return 'This block can be used to index into an array. You can modify the returned value by putting it as the variable value in the "variable (operation) (value)" block';
    }

    getProp(args, util) {
      return "This can be used to get a component from a struct, or swizzle a vector.";
    }

    constructFromType(args, util) {
      return "This block is used to create something out of whatever type you defined.";
    }

    createBuffer(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "CreateBuffer",
          "Failed to run block as the connection the GPU is invalid."
        );
      // essentially just device.createBuffer but with some scratch stuff
      this.device.pushErrorScope("validation");
      this.device.pushErrorScope("internal");
      this.device.pushErrorScope("out-of-memory");
      // currentBindGroupLayout =
      buffers[Scratch.Cast.toString(args.NAME)] = this.device.createBuffer({
        label: Scratch.Cast.toString(args.NAME),
        size: Scratch.Cast.toNumber(args.SIZE),
        usage: Scratch.Cast.toNumber(args.USAGE),
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "BufferCreationErrorOOM",
            error.message,
            "BufferCreation",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "BufferCreationError",
            error.message,
            "BufferCreation",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "BufferCreationError",
            error.message,
            "BufferCreation",
            error
          );
      });
    }

    createBindGroupLayout(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "CreateBindGroupLayout",
          "Failed to run block as the connection the GPU is invalid."
        );
      // thanks to cst1229 for this section <3
      if (util.stackFrame.blockRanOnce) {
        this.device.pushErrorScope("validation");
        this.device.pushErrorScope("internal");
        this.device.pushErrorScope("out-of-memory");
        bindGroupLayouts[Scratch.Cast.toString(args.NAME)] =
          this.device.createBindGroupLayout({
            entries: bindGroupLayouts[Scratch.Cast.toString(args.NAME)],
            label: Scratch.Cast.toString(args.NAME),
          });
        this.device.popErrorScope().then((error) => {
          if (error)
            this.throwError(
              "BindGroupLayoutCreationErrorOOM",
              error.message,
              "BindGroupLayoutCreation",
              error
            );
        });
        this.device.popErrorScope().then((error) => {
          if (error)
            this.throwError(
              "BindGroupLayoutCreationError",
              error.message,
              "BindGroupLayoutCreation",
              error
            );
        });
        this.device.popErrorScope().then((error) => {
          if (error)
            this.throwError(
              "BindGroupLayoutCreationError",
              error.message,
              "BindGroupLayoutCreation",
              error
            );
        });
        return;
      }

      currentBindGroupLayout = Scratch.Cast.toString(args.NAME);
      bindGroupLayouts[Scratch.Cast.toString(args.NAME)] = []; // temporarily store a list of entries here, things will be added to it via the bindGroupLayoutEntry block
      util.startBranch(1, true);
      util.stackFrame.blockRanOnce = true;
    }

    bindGroupLayoutEntry(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "BindGroupLayoutEntry",
          "Failed to run block as the connection the GPU is invalid."
        );
      let parsed;
      try {
        parsed = JSON.parse(args.DESC);
        // if (!Object.prototype.hasOwnProperty.call(parsed,"type")) throw new Error("skibidi toilet ohio grimace shake rizz")
      } catch {
        return this.throwError(
          "InvalidEntryDescriptor",
          "Invalid bind group layout entry descriptor!",
          "BindGroupLayoutEntryBlock",
          "The recieved descriptor for the bind group layout entry block is invalid, did you use the wrong block?"
        );
      }
      let o = {
        binding: Scratch.Cast.toNumber(args.BINDING),
        // this extension only has compute shaders
        /* eslint-disable-next-line --
         * Eslint doesn't like WebGPU, there's a type module for this.
         */
        visibility: GPUShaderStage.COMPUTE,
      };
      o[args.TYPE] = parsed;
      bindGroupLayouts[currentBindGroupLayout].push(o);
    }

    createBindGroup(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "CreateBindGroup",
          "Failed to run block as the connection the GPU is invalid."
        );
      // thanks to cst1229 for part of this section <3

      if (util.stackFrame.blockRanOnce) {
        this.device.pushErrorScope("validation");
        this.device.pushErrorScope("internal");
        this.device.pushErrorScope("out-of-memory");
        bindGroups[Scratch.Cast.toString(args.NAME)] =
          this.device.createBindGroup({
            layout: bindGroupLayouts[Scratch.Cast.toString(args.LAYOUT)],
            entries: bindGroups[Scratch.Cast.toString(args.NAME)],
            label: Scratch.Cast.toString(args.NAME),
          });
        this.device.popErrorScope().then((error) => {
          if (error)
            this.throwError(
              "BindGroupCreationErrorOOM",
              error.message,
              "BindGroupCreation",
              error
            );
        });
        this.device.popErrorScope().then((error) => {
          if (error)
            this.throwError(
              "BindGroupCreationError",
              error.message,
              "BindGroupCreation",
              error
            );
        });
        this.device.popErrorScope().then((error) => {
          if (error)
            this.throwError(
              "BindGroupCreationError",
              error.message,
              "BindGroupCreation",
              error
            );
        });
        return;
      }

      currentBindGroup = Scratch.Cast.toString(args.NAME);
      bindGroups[Scratch.Cast.toString(args.NAME)] = []; // temporarily store a list of entries here, things will be added to it via the bindGroupLayoutEntry block
      util.startBranch(1, true);
      util.stackFrame.blockRanOnce = true;
    }

    bindGroupEntry(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "BindGroupEntry",
          "Failed to run block as the connection the GPU is invalid."
        );
      const kv = {
        buffer: "buffers",
        storageTexture: "textures",
        sampler: "samplers",
      }; // bind group entry type -> resources key

      // the object to bind to that slot. buffers are freaky and need a special object
      let o;
      const type = kv[args.TYPE] ?? "buffers";
      // console.log(this.device, !!this.device, args.TYPE)
      if (
        !Object.prototype.hasOwnProperty.call(
          this.resourceFromType(type),
          Scratch.Cast.toString(args.RESOURCE)
        )
      ) {
        return this.throwError(
          "ResourceNotFound",
          "The specified resource doesn't exist",
          "BindGroupEntryBlock",
          `Either the resource type is invalid or the provided resource name doesn't exist.`
        );
      }
      if (type == "buffers") {
        o = {
          buffer: buffers[args.RESOURCE],
        };
        //console.log(o)
      } else {
        o = this.resourceFromType(type)[args.RESOURCE];
        if (type == "textures") o = o.createView();
      }

      bindGroups[currentBindGroup].push({
        binding: Scratch.Cast.toNumber(args.BINDING),
        resource: o,
      });
    }

    bufferEntryDescriptor(args, util) {
      return JSON.stringify({
        type: args.TYPE,
      });
    }

    binaryOr(args, util) {
      return Scratch.Cast.toNumber(args.A) | Scratch.Cast.toNumber(args.B);
    }

    genF32(args, util) {
      // unusable
      let array;
      try {
        array = JSON.parse(args.ARRAY);
      } catch {
        array = [];
      }
      bufferRefs[this.getBlockId(util)] = new Float32Array(array);
      return this.getBlockId(util);
    }

    wgslWhileLoop(args, util) {}

    break(args, util) {}

    continue(args, util) {}

    writeBuffer(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "WriteBufferBlock",
          "Failed to run block as the connection the GPU is invalid."
        );
      if (
        !Object.prototype.hasOwnProperty.call(
          buffers,
          Scratch.Cast.toString(args.BUFFER)
        )
      ) {
        return this.throwError(
          "BufferNotFound",
          "The provided buffer doesn't exist",
          "WriteBufferBlock",
          `The buffer "${Scratch.Cast.toString(args.BUFFER)}" doesn't exist`
        );
      }
      if (
        !Object.prototype.hasOwnProperty.call(
          arrayBuffers,
          Scratch.Cast.toString(args.ARRAY)
        )
      ) {
        return this.throwError(
          "ArrayBufferNotFound",
          "The provided arraybuffer doesn't exist",
          "WriteBufferBlock",
          `The arraybuffer "${Scratch.Cast.toString(args.ARRAY)}" doesn't exist`
        );
      }

      this.device.pushErrorScope("internal");
      this.device.pushErrorScope("out-of-memory");
      this.device.pushErrorScope("validation");
      this.device.queue.writeBuffer(
        buffers[Scratch.Cast.toString(args.BUFFER)],
        Scratch.Cast.toNumber(args.OFF2),
        arrayBuffers[Scratch.Cast.toString(args.ARRAY)],
        Scratch.Cast.toNumber(args.OFF1),
        Scratch.Cast.toNumber(args.SIZE)
      );
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "BufferWriteError",
            error.message,
            "WriteBufferBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "BufferWriteError",
            error.message,
            "WriteBufferBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "BufferWriteError",
            error.message,
            "WriteBufferBlock",
            error
          );
      });
    }

    copyBufferToBuffer(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "CopyBufferToBufferBlock",
          "Failed to run block as the connection the GPU is invalid."
        );
      if (
        Scratch.Cast.toNumber(args.NUMBYTES) <= 0 ||
        args.BUF1 === args.BUF2 ||
        !Object.prototype.hasOwnProperty.call(buffers, args.BUF1) ||
        !Object.prototype.hasOwnProperty.call(buffers, args.BUF1)
      ) {
        return this.throwError(
          "InvalidInput",
          "Invalid input recieved when trying to copy data",
          "CopyBufferToBufferBlock",
          "Failed to copy data between buffers, check that the buffers exist, buffer 1 isn't the same as buffer 2, and the number of bytes is more than or equal to 0"
        );
      }
      const commandEncoder = this.device.createCommandEncoder({
        label: "copyBuffer encoder",
      });

      this.device.pushErrorScope("validation");
      this.device.pushErrorScope("internal");
      commandEncoder.copyBufferToBuffer(
        buffers[args.BUF1],
        Scratch.Cast.toNumber(args.BUF1OFF),
        buffers[args.BUF2],
        Scratch.Cast.toNumber(args.BUF2OFF),
        Scratch.Cast.toNumber(args.NUMBYTES)
      );
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "CopyBufferToBufferError",
            error.message,
            "CopyBufferToBufferBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "CopyBufferToBufferError",
            error.message,
            "CopyBufferToBufferBlock",
            error
          );
      });
      this.device.queue.submit([commandEncoder.finish()]);
    }

    clearBuffer(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "ClearBufferBlock",
          "Failed to run block as the connection the GPU is invalid."
        );
      if (
        Scratch.Cast.toNumber(args.NUMBYTES) <= 0 &&
        Scratch.Cast.toNumber(args.NUMBYTES) !== -1
      ) {
        return this.throwError(
          "InvalidInput",
          "Invalid number of bytes to clear",
          "ClearBuffer",
          `The provided number of bytes to clear, ${Scratch.Cast.toNumber(args.NUMBYTES)}, is invalid. Must be more than 0, or -1 to clear all.`
        );
      }
      if (
        !Object.prototype.hasOwnProperty.call(
          buffers,
          Scratch.Cast.toString(args.BUFFER)
        )
      ) {
        return this.throwError(
          "BufferNotFound",
          "The provided buffer doesn't exist",
          "ClearBuffer",
          `The buffer "${Scratch.Cast.toString(args.BUFFER)}" doesn't exist`
        );
      }
      const commandEncoder = this.device.createCommandEncoder({
        label: "clearBuffer encoder",
      });
      if (Scratch.Cast.toNumber(args.NUMBYTES) === -1) {
        commandEncoder.clearBuffer(buffers[Scratch.Cast.toString(args.BUFFER)]);
      } else {
        commandEncoder.clearBuffer(
          buffers[Scratch.Cast.toString(args.BUFFER)],
          Scratch.Cast.toNumber(args.OFFSET),
          Scratch.Cast.toNumber(args.NUMBYTES)
        );
      }
    }

    async readBuffer(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "ReadBufferBlock",
          "Failed to run block as the connection the GPU is invalid."
        );
      // WARNING:
      // MAY CONTAIN BAD IDEA JUICE
      // GPUMapMode.READ assumes no writing will be done
      // aka if you want to write to your mapped buffer you need to transfer it to the cpu, mess with it, then transfer it to a different buffer
      // and send it back to the gpu
      if (!Object.prototype.hasOwnProperty.call(buffers, args.BUFFER)) {
        return this.throwError(
          "BufferNotFound",
          "The buffer provided doesn't exist",
          "ReadBufferBlock",
          `Buffer "${args.BUFFER}" doesn't exist.`
        );
      }

      // let data = ["you done messed up"]
      this.device.pushErrorScope("validation");
      this.device.pushErrorScope("internal");
      await buffers[args.BUFFER].mapAsync(
        /* eslint-disable-next-line --
         * Eslint doesn't like WebGPU, there's a type module for this.
         */
        GPUMapMode.READ
        // 0,
        // shaders[args.SHADER].inputs[Scratch.Cast.toNumber(args.BINDING)].input.size,
      );

      const copyArrayBuffer = buffers[args.BUFFER]
        .getMappedRange(/*0, shaders[args.SHADER].inputs[Scratch.Cast.toNumber(args.BINDING)].input.size*/)
        .slice();
      console.log(copyArrayBuffer);
      views.testview = new Float32Array(copyArrayBuffer);
      buffers[args.BUFFER].unmap();
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "BufferReadError",
            error.message,
            "ReadBufferBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "BufferReadError",
            error.message,
            "ReadBufferBlock",
            error
          );
      });
      arrayBuffers[Scratch.Cast.toString(args.ARRAYBUFFER)] = copyArrayBuffer;
      // @ts-ignore
      //return JSON.stringify(Array.from(new Float32Array(data)));
    }

    error(args, util) {
      return JSON.stringify(error);
    }

    clearError() {
      error = {};
    }

    c_arbitraryWGSL() {}

    r_arbitraryWGSL() {
      return "This block allows you to add custom WGSL to your shaders.";
    }

    atomicType() {
      return "This block returns a type that can be used to declare an atomic variable.";
    }

    atomicLoad() {
      return "This block gets an atomic function";
    }

    c_atomicFunc() {}

    r_atomicFunc() {
      return "This block performs a thread safe operation on an atomic variable.";
    }

    barrier() {}

    variablePointer() {
      return "This block converts a variable to a pointer. Equivilant to *someVar in c.";
    }

    createAB(args, util) {
      arrayBuffers[Scratch.Cast.toString(args.ARRAYBUFFER)] = new ArrayBuffer(
        Scratch.Cast.toNumber(args.LENGTH)
      );
    }

    getArrayBuffers() {
      // note to self: the buffer object on view is views[key]
      // this code is bad and i hate it
      return Array.from((buffersExt?.views ?? new Map()).keys()).concat(
        Object.keys(arrayBuffers)
      );
    }

    getArrayBuffersMenu() {
      // note to self: the buffer object on view is views[key]
      // this code is bad and i hate it
      const a = Array.from((buffersExt?.views ?? new Map()).keys()).concat(
        Object.keys(arrayBuffers)
      );
      return a.length < 1 ? a.concat("Choose a buffer") : a;
    }

    createABView(args, util) {
      /*if (!Object.prototype.hasOwnProperty.call(arrayBuffers,Scratch.Cast.toString(args.ARRAYBUFFER))) {
                this.throwError("ArrayBufferNotFound", "Couldn't find array buffer", "CreateArrayBufferView", "The specified array buffer to view doesn't exist")
            }*/
      if (Scratch.Cast.toString(args.NAME) == "") return; // this looks weird in the list
      views[Scratch.Cast.toString(args.NAME)] = this.typedArrayFromType(
        Scratch.Cast.toString(args.TYPE),
        arrayBuffers[Scratch.Cast.toString(args.ARRAYBUFFER)]
      );
    }

    typedArrayFromType(type, data) {
      const t = {
        Int32Array: Int32Array,
        Uint32Array: Uint32Array,
        Float32Array: Float32Array,
        Int8Array: Int8Array,
        Uint8Array: Uint8Array,
        Uint8ClampedArray: Uint8ClampedArray,
        Int16Array: Int16Array,
        Uint16Array: Uint16Array,
        BigInt64Array: BigInt64Array,
        BigUint64Array: BigUint64Array,
        Float64Array: Float64Array,
      };
      if (!Object.prototype.hasOwnProperty.call(t, type)) type = "Int32Array";
      if (data) return new t[type](data);
      return new t[type]();
    }

    listABs() {
      return JSON.stringify(this.getArrayBuffers());
    }

    listViews() {
      return JSON.stringify(
        Array.from((buffersExt?.views ?? new Map()).keys()).concat(
          Object.keys(views)
        )
      );
    }

    createABFromArray(args, util) {
      if (Scratch.Cast.toString(args.NAME) == "") return; // this looks weird in the list
      let j;
      try {
        j = JSON.parse(args.ARRAY);
        if (!Array.isArray(j)) throw new Error("skibidi toilet ohio rizz");
      } catch {
        return this.throwError(
          "InvalidArray",
          "The provided array is invalid",
          "CreateArrayBufferFromArrayBlock",
          "The provided array is invalid, or isn't an array."
        );
      }
      const ta = this.typedArrayFromType(Scratch.Cast.toString(args.TYPE), j);
      arrayBuffers[Scratch.Cast.toString(args.ARRAYBUFFER)] = ta.buffer;
      views[Scratch.Cast.toString(args.ARRAYBUFFER)] = ta;
    }

    deleteAB(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          arrayBuffers,
          Scratch.Cast.toString(args.ARRAYBUFFER)
        )
      ) {
        delete arrayBuffers[Scratch.Cast.toString(args.ARRAYBUFFER)];
      } else {
        return this.throwError(
          "ArrayBufferNotFound",
          "Array buffer not found",
          "DeleteArrayBufferBlock",
          "The specified array buffer doesn't exist"
        );
      }
    }

    resizeAB(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          arrayBuffers,
          Scratch.Cast.toString(args.ARRAYBUFFER)
        )
      ) {
        arrayBuffers[Scratch.Cast.toString(args.ARRAYBUFFER)].resize(
          Scratch.Cast.toNumber(args.SIZE)
        );
      } else {
        return this.throwError(
          "ArrayBufferNotFound",
          "Array buffer not found",
          "ResizeArrayBufferBlock",
          "The specified array buffer doesn't exist"
        );
      }
    }

    deleteView(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          views,
          Scratch.Cast.toString(args.VIEW)
        )
      ) {
        delete views[Scratch.Cast.toString(args.VIEW)];
      } else {
        return this.throwError(
          "ViewNotFound",
          "View not found",
          "DeleteViewBlock",
          "The specified view doesn't exist"
        );
      }
    }

    setItemInView(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          views,
          Scratch.Cast.toString(args.VIEW)
        )
      ) {
        views[Scratch.Cast.toString(args.VIEW)][
          Scratch.Cast.toNumber(args.INDEX)
        ] = Scratch.Cast.toNumber(args.VALUE);
      } else {
        console.log("aaaaa");
        return this.throwError(
          "ViewNotFound",
          "View not found",
          "SetItemInViewBlock",
          "The specified view doesn't exist"
        );
      }
    }

    setView(args, util) {
      let j;
      try {
        j = JSON.parse(args.ARRAY);
        if (!Array.isArray(j))
          throw new Error("balkan rage winter arc jonkler trollge phonk"); // 🤫🧏
      } catch {
        return this.throwError(
          "InvalidArray",
          "The provided array is invalid",
          "SetViewBlock",
          "The provided array is invalid, or isn't an array."
        );
      }

      if (
        Object.prototype.hasOwnProperty.call(
          views,
          Scratch.Cast.toString(args.VIEW)
        )
      ) {
        views[Scratch.Cast.toString(args.VIEW)].set(
          j,
          Scratch.Cast.toNumber(args.INDEX)
        );
      } else {
        return this.throwError(
          "ViewNotFound",
          "View not found",
          "SetViewBlock",
          "The specified view doesn't exist"
        );
      }
    }

    fillView(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          views,
          Scratch.Cast.toString(args.VIEW)
        )
      ) {
        views[Scratch.Cast.toString(args.VIEW)].fill(
          Scratch.Cast.toNumber(args.VALUE),
          Scratch.Cast.toNumber(args.START),
          Scratch.Cast.toNumber(args.END)
        );
      } else {
        return this.throwError(
          "ViewNotFound",
          "View not found",
          "FillViewBlock",
          "The specified view doesn't exist"
        );
      }
    }

    itemOfView(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          views,
          Scratch.Cast.toString(args.VIEW)
        )
      ) {
        return views[Scratch.Cast.toString(args.VIEW)][
          Scratch.Cast.toNumber(args.INDEX)
        ];
      } else {
        return "";
      }
    }

    sliceView(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          views,
          Scratch.Cast.toString(args.VIEW)
        )
      ) {
        const a = Array.from(
          views[Scratch.Cast.toString(args.VIEW)].slice(
            Scratch.Cast.toNumber(args.START),
            Scratch.Cast.toNumber(args.END)
          )
        );
        console.log(a);
        return JSON.stringify(a);
      } else {
        return "";
      }
    }

    viewToArray(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          views,
          Scratch.Cast.toString(args.VIEW)
        )
      ) {
        return JSON.stringify(
          Array.from(views[Scratch.Cast.toString(args.VIEW)])
        );
      } else {
        return "";
      }
    }

    propFromView(args, util) {
      if (
        Object.prototype.hasOwnProperty.call(
          views,
          Scratch.Cast.toString(args.VIEW)
        )
      ) {
        return views[Scratch.Cast.toString(args.VIEW)][
          Scratch.Cast.toString(args.PROP)
        ];
      } else {
        return "";
      }
    }

    createTexture(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "CreateTextureBlock",
          "Failed to run block as the connection the GPU is invalid."
        );
      if (
        Scratch.Cast.toNumber(args.WIDTH) < 0 ||
        Scratch.Cast.toNumber(args.HEIGHT) < 0
      )
        return this.throwError(
          "InvalidDimensions",
          "Invalid dimensions",
          "CreateTextureBlock",
          "The provided dimensions are invalid"
        );
      this.device.pushErrorScope("validation");
      this.device.pushErrorScope("out-of-memory");
      textures[Scratch.Cast.toString(args.NAME)] = this.device.createTexture({
        size: [
          Scratch.Cast.toNumber(args.WIDTH),
          Scratch.Cast.toNumber(args.HEIGHT),
        ],
        // @ts-expect-error
        format: Scratch.Cast.toString(args.FORMAT),
        usage: Scratch.Cast.toNumber(args.USAGE),
        label: Scratch.Cast.toString(args.NAME),
      });
      // todo: forgetting a lot of error handling
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "CreateTextureError",
            error.message,
            "CreateTextureBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "CreateTextureError",
            error.message,
            "CreateTextureBlock",
            error
          );
      });
    }

    textureUsage(args, util) {
      /* eslint-disable-next-line --
       * Eslint doesn't like WebGPU, there's a type module for this.
       */
      return GPUTextureUsage[Scratch.Cast.toString(args.USAGE)];
    }

    /**
     *
     * @param {import("scratch-render").SVGSkin | import("scratch-render").BitmapSkin} skin
     */
    skinToArray(skin) {
      // https://stackoverflow.com/a/18804153/20805087
      // i was going to add support for the pen+ texture library but
      skin.updateSilhouette();
      console.log(skin._silhouette._colorData);
      return skin._silhouette._colorData;
    }

    /**
     *
     * @param {*} args
     * @param {import("scratch-vm").BlockUtility} util
     */
    writeTexture(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "WriteTextureBlock",
          "Failed to run block as the connection the GPU is invalid."
        );
      let textureData;
      // if (penPlus) {
      //  todo: pen+ costume library support?
      // }
      const i = util.target.getCostumeIndexByName(
        Scratch.Cast.toString(args.IMAGE)
      );
      if (i !== -1) {
        // not using the properties that are causing stupid errors so who cares

        textureData = this.skinToArray(
          // @ts-ignore
          vm.renderer._allSkins[util.target.sprite.costumes[i].skinId]
        );
      } else {
        throw new Error("Texture missing - " + args.IMAGE);
      }
      const t = textures[Scratch.Cast.toString(args.TEXTURE)];
      this.device.pushErrorScope("internal");
      this.device.pushErrorScope("out-of-memory");
      this.device.pushErrorScope("validation");
      this.device.queue.writeTexture(
        {
          texture: t,
        },
        textureData,
        { bytesPerRow: this.bytesFromFormat(t.format) * t.width }, // get the number of bytes per pixel, multiplied by the width of the row.
        { width: t.width, height: t.height }
      );
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "WriteTextureError",
            error.message,
            "WriteTextureBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "WriteTextureError",
            error.message,
            "WriteTextureBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "WriteTextureError",
            error.message,
            "WriteTextureBlock",
            error
          );
      });
    }

    getImageList() {
      return vm.editingTarget.sprite.costumes.map((v) => v.name);
    }

    createSampler(args, util) {
      samplers[Scratch.Cast.toString(args.NAME)] = this.device.createSampler({
        // @ts-expect-error
        addressModeU: Scratch.Cast.toString(args.UMODE),
        // @ts-expect-error
        addressModeV: Scratch.Cast.toString(args.VMODE),
        // @ts-expect-error
        magFilter: Scratch.Cast.toString(args.MAGFILTER),
      });
    }

    bytesFromFormat(format) {
      // returns the bytes per pixel of a given format
      return {
        r8unorm: 1,
        r8norm: 1,
        r8uint: 1,
        r8int: 1,
        r16uint: 2,
        r16sint: 2,
        r16float: 2,
        rg8unorm: 2,
        rg8snorm: 2,
        rg8uint: 2,
        rg8sint: 2,
        r32uint: 4,
        r32sint: 4,
        r32float: 4,
        rg16uint: 4,
        rg16sint: 4,
        rg16float: 4,
        rgba8unorm: 4,
        "rgba8unorm-srgb": 4,
        rgba8snorm: 4,
        rgba8uint: 4,
        bgra8unorm: 4,
        "bgra8unorm-srgb": 4,
        rgba10a2unorm: 4,
        rg11b10ufloat: 4,
        rgba9e5ufloat: 4,
        rg32uint: 8,
        rg32sint: 8,
        rg32float: 8,
        rgba16uint: 8,
        rgba16sint: 8,
        rgba16float: 8,
        rgba32uint: 16,
        rgba32sint: 16,
        rgba32float: 16,
      }[format];
    }

    textureType() {
      return "This block allows you to add texture types to your shaders";
    }

    samplerType() {
      return "This block allows you to add sampler types to your shaders";
    }

    textureEntryDescriptor(args, util) {
      return JSON.stringify({
        access: Scratch.Cast.toString(args.TYPE),
        format: Scratch.Cast.toString(args.FORMAT),
      });
    }

    samplerEntryDescriptor(args, util) {
      return JSON.stringify({
        samplerType: Scratch.Cast.toString(args.TYPE),
      });
    }

    copyTextureToBuffer(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "CopyTextureToBufferBlock",
          "Failed to run block as the connection the GPU is invalid."
        );
      if (
        !Object.prototype.hasOwnProperty.call(
          buffers,
          Scratch.Cast.toString(args.BUFFER)
        )
      ) {
        return this.throwError(
          "BufferNotFound",
          "Buffer not found",
          "CopyTextureToBufferBlock",
          "The specified buffer doesn't exist"
        );
      }
      if (
        !Object.prototype.hasOwnProperty.call(
          textures,
          Scratch.Cast.toString(args.TEXTURE)
        )
      ) {
        return this.throwError(
          "TextureNotFound",
          "Texture not found",
          "CopyTextureToBufferBlock",
          "The specified texture doesn't exist"
        );
      }
      if (
        Scratch.Cast.toNumber(args.WIDTH) < 0 ||
        Scratch.Cast.toNumber(args.HEIGHT) < 0
      ) {
        return this.throwError(
          "InvalidDimensions",
          "Invalid copy dimensions",
          "CopyTextureToBufferBlock",
          "The provided texture dimensions are invalid"
        );
      }

      this.device.pushErrorScope("internal");
      this.device.pushErrorScope("out-of-memory");
      this.device.pushErrorScope("validation");

      const commandEncoder = this.device.createCommandEncoder({
        label: "copyTextureToBuffer encoder",
      });

      commandEncoder.copyTextureToBuffer(
        {
          texture: textures[Scratch.Cast.toString(args.TEXTURE)],
        },
        {
          buffer: buffers[Scratch.Cast.toString(args.BUFFER)],
        },
        {
          width: Scratch.Cast.toNumber(args.WIDTH),
          height: Scratch.Cast.toNumber(args.HEIGHT),
        }
      );

      this.device.queue.submit([commandEncoder.finish()]);

      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "CopyTextureToBufferError",
            error.message,
            "CopyTextureToBufferBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "CopyTextureToBufferError",
            error.message,
            "CopyTextureToBufferBlock",
            error
          );
      });
      this.device.popErrorScope().then((error) => {
        if (error)
          this.throwError(
            "CopyTextureToBufferError",
            error.message,
            "CopyTextureToBufferBlock",
            error
          );
      });
    }

    declareStruct() {
      return;
    }
    structProperty() {
      return;
    }
    structType() {
      return "This block lets you use a struct as a type.";
    }

    webgpuAvailable() {
      return !!navigator.gpu; // this value will be undefined if webgpu is unavailable, which is then cast to a boolean(!!undefined === false)
      // i don't remember where i saw this so my source is "just trust me bro"
    }

    adapterConnected() {
      return !!this.device; // if device is undefined it means that we failed to get the adapter
    }

    copyBufferToTexture(args, util) {
      if (!this.device)
        return this.throwError(
          "InvalidDevice",
          "Cannot run block",
          "CopyBufferToTextureBlock",
          "Failed to run block as the connection the GPU is invalid."
        );
      args.BUFFER = Scratch.Cast.toString(args.BUFFER);
      args.TEXTURE = Scratch.Cast.toString(args.TEXTURE);
      args.OFFSET = Scratch.Cast.toNumber(args.OFFSET);
      args.WIDTH = Scratch.Cast.toNumber(args.WIDTH);
      args.HEIGHT = Scratch.Cast.toNumber(args.HEIGHT);

      if (
        !Object.prototype.hasOwnProperty.call(
          buffers,
          Scratch.Cast.toString(args.BUFFER)
        )
      )
        return this.throwError(
          "BufferNotFound",
          "Buffer not found",
          "CopyBufferToTextureBlock",
          "The specified buffer doesn't exist"
        );
      if (
        !Object.prototype.hasOwnProperty.call(
          textures,
          Scratch.Cast.toString(args.TEXTURE)
        )
      )
        return this.throwError(
          "TextureNotFound",
          "Texture not found",
          "CopyBufferToTextureBlock",
          "The specified texture doesn't exist"
        );
      if (args.OFFSET < 0)
        return this.throwError(
          "InvalidOffset",
          "Invalid offset",
          "CopyBufferToTextureBlock",
          "The provided offset is less than 0"
        );
      if (args.WIDTH <= 0 || args.HEIGHT <= 0)
        return this.throwError(
          "InvalidDimension",
          "Invalid width or height",
          "CopyBufferToTextureBlock",
          "The provided width or height is less than or equal to 0"
        );

      const commandEncoder = this.device.createCommandEncoder();
      this.device.pushErrorScope("validation");
      this.device.pushErrorScope("out-of-memory");
      this.device.pushErrorScope("internal");

      commandEncoder.copyBufferToTexture(
        {
          buffer: buffers[args.BUFFER],
          offset: args.OFFSET,
        },
        {
          texture: textures[args.TEXTURE],
        },
        [args.WIDTH, args.HEIGHT]
      );

      this.device.popErrorScope().then((error) => {
        if (error) {
          this.throwError(
            "BufferCopyToTextureError",
            error.message,
            "CopyBufferToTextureBlock",
            error
          );
        }
      });

      this.device.popErrorScope().then((error) => {
        if (error) {
          this.throwError(
            "BufferCopyToTextureError",
            error.message,
            "CopyBufferToTextureBlock",
            error
          );
        }
      });
    }

    /**
     *
     * @param {*} args
     * @param {import("scratch-vm").BlockUtility} util
     */
    debug(args, util) {
      console.log(util.thread);
      console.log(util.thread.blockContainer._blocks);

      const AST = this.compile(
        util,
        util.thread,
        // @ts-ignore
        util.thread.blockContainer._blocks,
        util.thread.blockContainer._blocks[util.thread.topBlock].next,
        true,
        true
      );

      console.log(AST);

      console.log(this.genWGSL(util, AST, 0));
    }
  }
  // @ts-ignore
  Scratch.extensions.register(new GPUSb3());
})(Scratch);
