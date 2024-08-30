# Red OS Backend tutorial/docs

Your app is a 100% javascript program that can render stuff using the backend api. When it's run, your app is passed 2 values: backend(the instance of the backend class that runs the backend of the os) and windowId.

Backend properties:

## Button
### Class

### Arguments: x1, y1, x2, y2, radius, r, g, b, a, id, backend, onTrigger, offTrigger

x1 - Number, left side of the button
y1 - Number, bottom side
x2 - Number, right side
y2 - Number, top side
radius - Number, bezel
r - Number, red
g - Number, green
b - Number, blue
a - Number, alpha
id - String, the windowId to draw to when the render method is called on this class
backend - Backend, the backend instance to use internally
onTrigger - Function, an event to be run when the button is clicked
offTrigger - Function, an event to be run when the button is released

### Methods

update() - updates the button's trigger state and stuff
render() - renders the button


## drawCircle()

### Arguments: x, y, radius, r, g, b, a, id

x - Number, x pos
y - Number, y pos
radius - Number, radius of the circle
r - Number, red
g - Number, green
b - Number, blue
a - Number, alpha
id - String, windowId to draw to

## drawLine()

### Arguments: x1, y1, x2, y2, weight, r, g, b, a, id

x1 - Number, x of point 1
y1 - Number, y of point 1
x2 - Number, x of point 2
y2 - Number, y of point 2
weight - Number, thickness of line
r,g,b,a - Numbers, color
id - String, windowId to draw to

## drawRect()

### Arguments: x1, y1, x2, y2, radius, r, g, b, a, id

x1 - Number, left
y1 - Number, bottom
x2 - Number, right
y2 - Number, top
radius - Number, bezel
r,g,b,a - Numbers, color
id - String, windowId to draw to

## drawEllipse()

### Arguments: x, y, r1, r2, r, g, b, a, id

x - Number, x pos
y - Number, y pos
r1 - Number, radius on the x axis(i think, i don't remenmbr)
r2 - Number, other radius
r,g,b,a - Numbers, color
id - String, windowId to draw to

## drawText()

### Arguments: text, x, y, r, g, b, a, size, spacing, bold, align, maxWidth, id

text - String, text to draw
x - Number, x pos
y - Number, y pos
r,g,b,a - Numbers, color
size - Number, scale of the full size in scratch size percent
spacing - Number, multiplier of how far between the letters where 0 is no spacing and 1 is full spacing
bold - Boolean, whether the text is bold
align - String, center, left, right, where to align the text
maxWidth - If the width of the text exceeds this number it will wrap around
id - String, windowId to draw to

## loadImage()

### Arguments: url, name, id

url - URL, can be a DataURI or just a link to an image
name - String, the name that can be used by drawImage() to reference this image
id - String, windowId to draw to

You shouldn't use this function more than once per url in your program!

## drawImage()

### Arguments: name, x, y, width, height, id

name - String, name of the image to draw. Corresponds to the name argument of the loadImage function
x - Number, x pos
y - Number, y pos
width - Number, width in pixels
height - Number, height in pixels
id - String, windowId to draw to

## clearShapes()

### Arguments: id

id - String, windowId to clear shapes from

## onEvent()

### Arguments: event, func, id

event - String, currently the only event type is "tick" which is called every frame after the window has been rendered.
func - Function, function to be called every time the event is fired
id - String, the window id of your program



# that's all for app stuff, then there's file system stuff which you can read in the extension code

## updateSetting()

### Arguments: setting, value

setting - String, the name of the setting to change
value - Any, the value to set the setting to

this will set any setting in the os to any value
to read settings, use the readFile method

