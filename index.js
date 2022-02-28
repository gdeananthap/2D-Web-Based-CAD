var canvas;
var gl;
var state = "draw";
var currentShape = "line";
var isMovingControlPoint = false;
var controlPointId = -1;

var first = true;
var t, t1, t2, t3, t4;
var countPolygon = 0;
var countIndices = [0];
var start = [0];
var cIndex = 0;

var countShape = 0;
var shapeToDraw = [];
var selectedShapeId = 0;
var hoveredShapeId = 0;
var vertices = []
var vertexLeft = 2;
var colors; 

let mouseX = -1;
let mouseY = -1;
let oldPickNdx = -1;
let oldPickColor;
let frameCount = 0;

function main() {
    canvas = document.getElementById( "c" );
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    var gl = canvas.getContext("webgl");
    if (!gl) {
        alert("Sorry, Browser doesnt suppport webgl")
        return;
    }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1, 1, 1, 1 );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var program = initShaders( gl, "vertex-shader-2d", "fragment-shader-2d" );
    var selectProgram = initShaders( gl, "pick-vertex-shader", "pick-fragment-shader" );
    gl.useProgram( program );
    
    var verticesPosition = gl.getAttribLocation( program, "verticesPosition");
    var verticesColor = gl.getUniformLocation( program, "fragmentColor");
    gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(verticesPosition);

    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    

    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    
    function setFramebufferAttachmentSizes(width, height) {
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border,
                    format, type, data);
    
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }
    
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);
    
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    canvas.addEventListener("mousedown", function(event){
        if (state === "draw") {
            if(document.getElementById("line").checked){
                if(first) {
                    first = false;
                    t1 = vec2(2*event.clientX/canvas.width-1, 
                        2*(canvas.height-event.clientY)/canvas.height-1);
                    vertices.push(t1);
                }
                else {
                    first = true;
                    t2 = vec2(2*event.clientX/canvas.width-1, 
                        2*(canvas.height-event.clientY)/canvas.height-1);
                    vertices.push(t2);
                    colors = hexToVec4(document.getElementById("color").value);
                    t = vec4(colors);
                    countShape++;
                    var obj = new Shape(countShape, "line", vertices, t)
                    vertices = []
                    shapeToDraw.push(obj);
                }
            }else if (document.getElementById("square").checked) {
                if(first) {
                    first = false;
                    var x, y;
                    x = 2*event.clientX/canvas.width-1;
                    y = 2*(canvas.height-event.clientY)/canvas.height-1;
                    t1 = vec2(x,y);
                    vertices.push(t1);      
                }
                else {
                    first = true;
                    var xf, xx, yy;
                    yy = 2*(canvas.height-event.clientY)/canvas.height-1;
                    xf = 2*event.clientX/canvas.width-1;
                    xx = t1[0] > xf ? t1[0] - Math.abs(t1[1]-yy) : t1[0] + Math.abs(t1[1]-yy);
                    t2 = vec2(xx,yy);
                    t3 = vec2(t1[0], t2[1]);
                    t4 = vec2(t2[0], t1[1]);
    
                    vertices.push(t3);
                    vertices.push(t2);
                    vertices.push(t4);
                    colors = hexToVec4(document.getElementById("color").value);
                    t = vec4(colors);
                    countShape++;
                    var obj = new Shape(countShape, "square", vertices, t)
                    vertices = []
                    shapeToDraw.push(obj);
                }
            } else if (document.getElementById("rectangle").checked) {
                if(first) {
                    first = false;
                    t1 = vec2(2*event.clientX/canvas.width-1, 
                        2*(canvas.height-event.clientY)/canvas.height-1);
                    vertices.push(t1);    
                }
                else {
                    first = true;
                    t2 = vec2(2*event.clientX/canvas.width-1, 
                        2*(canvas.height-event.clientY)/canvas.height-1);
                    t3 = vec2(t1[0], t2[1]);
                    t4 = vec2(t2[0], t1[1]);
                    vertices.push(t3);
                    vertices.push(t2);
                    vertices.push(t4);
                    colors = hexToVec4(document.getElementById("color").value);
                    t = vec4(colors);
                    countShape++;
                    var obj = new Shape(countShape, "rectangle", vertices, t)
                    vertices = []
                    shapeToDraw.push(obj);
                }
            } else if (document.getElementById("polygon").checked) {
                t  = vec2(2*event.clientX/canvas.width-1, 2*(canvas.height-event.clientY)/canvas.height-1);
                vertices.push(t)
            }
        } else if(state == "select"){
            if(hoveredShapeId<=0){
                shapeToDraw.forEach(function (shape) {
                    if(shape.id === selectedShapeId){
                        shape.deselect();
                        selectedShapeId = 0;
                    }
                });
            }else if(!(selectedShapeId === hoveredShapeId)){
                shapeToDraw.forEach(function (shape) {
                    if(shape.id === selectedShapeId){
                        shape.deselect();
                    }
                    if(shape.id === hoveredShapeId){
                        shape.select();
                    }
                    console.log(shape);
                });
                selectedShapeId = hoveredShapeId;
            }else if(selectedShapeId>0){
                shapeToDraw.forEach(function (shape) {
                    if(shape.id === selectedShapeId){
                        controlPointId = shape.getCurrentControlPoint(mouseX, mouseY);
                        console.log(controlPointId);
                        if(controlPointId > -1){
                            isMovingControlPoint = true;
                        }
                    }
                });
            }
        }
    })
    
    canvas.addEventListener("mousemove", function(e){
        const rect = canvas.getBoundingClientRect();
        mouseX = (2*(e.clientX - rect.left)/canvas.width-1);
        mouseY = -1*(2*(e.clientY)/canvas.height-1);
        if(isMovingControlPoint){
            if(selectedShapeId>0 && isMovingControlPoint){
                shapeToDraw.forEach(function (shape) {
                    if(shape.id === selectedShapeId){
                        shape.movePoint(controlPointId, mouseX, mouseY)
                    }
                });
            }
        }
    })

    canvas.addEventListener("mouseup", function(e){
        isMovingControlPoint = false;
    })

    document.getElementById("PolygonEndButton")
            .addEventListener("click", function() {
                if (document.getElementById("polygon").checked) {
                    if(vertices.length>2){
                        colors = hexToVec4(document.getElementById("color").value);
                        t = vec4(colors);
                        countShape++;
                        var obj = new Shape(countShape, "polygon", vertices, t)
                        vertices = []
                        shapeToDraw.push(obj);
                    }
                }
    })

    document.getElementById("select")
            .addEventListener("click", function(){
                document.getElementById("line").checked = false;
                document.getElementById("square").checked = false;
                document.getElementById("rectangle").checked = false;
                document.getElementById("polygon").checked = false;
                state = "select";
            })

    document.getElementById("line").addEventListener('click', () => {
        state = "draw";
        currentShape = "line"
    })
    document.getElementById("square").addEventListener('click', () => {
        state = "draw";
        currentShape = "square"
    })
    document.getElementById("rectangle").addEventListener('click', () => {
        state = "draw";
        currentShape = "rectangle"
    })
    document.getElementById("polygon").addEventListener('click', () => {
        state = "draw";
        currentShape = "polygon"
    })
    
    function render() {
        gl.useProgram(selectProgram);
        setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport( 0, 0, canvas.width, canvas.height );
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        shapeToDraw.forEach(function (shape) {
            shape.drawID(gl, selectProgram);
        });
        const data = new Uint8Array(4);
        const rect = canvas.getBoundingClientRect();
        // mouseX = (2*(e.clientX - rect.left)/canvas.width-1);
        // mouseY = -1*(2*(e.clientY)/canvas.height-1);
        const pixelX = (mouseX+1) * canvas.width / 2;
        const pixelY = (mouseY+1)*canvas.height/2;
        gl.readPixels(
            pixelX,
            pixelY,
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            data
        );
        hoveredShapeId = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
        gl.useProgram( program );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport( 0, 0, canvas.width, canvas.height );
        gl.uniform4fv(verticesColor, hexToVec4(document.getElementById("color").value))
        if(state === "draw"){
            let vertexBuffer =  gl.createBuffer();
            if(currentShape == "line" && vertices.length > 0){
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten([vertices[0][0], vertices[0][1], mouseX, mouseY]), gl.STATIC_DRAW);
                gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.LINES, 0, 2);
            }else if(currentShape == "square" && vertices.length > 0){
                var x = vertices[0][0];
                var y = vertices[0][1];
                var xf, xx, yy;
                yy = mouseY;
                xf = mouseX;
                xx = x > xf ? x - Math.abs(y-yy) : t1[0] + Math.abs(y-yy);
                t2 = vec2(xx,yy);
                t3 = vec2(x, t2[1]);
                t4 = vec2(t2[0], y);
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten([x, y, t3[0], t3[1], t2[0], t2[1], t4[0], t4[1]]), gl.STATIC_DRAW);
                gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
            }else if(currentShape == "rectangle" && vertices.length > 0){
                var x = vertices[0][0];
                var y = vertices[0][1];
                t2 = vec2(mouseX, mouseY);
                t3 = vec2(x, t2[1]);
                t4 = vec2(t2[0], y);
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten([x, y, t3[0], t3[1], t2[0], t2[1], t4[0], t4[1]]), gl.STATIC_DRAW);
                gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
            }else if(currentShape == "polygon" && vertices.length > 0){
                var array = verticesMatrixToArray(vertices)
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten([...array, mouseX, mouseY]), gl.STATIC_DRAW);
                gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.LINE_LOOP, 0, array.length/2 + 1);
            }
        }
        window.requestAnimFrame(render);
        shapeToDraw.forEach(function (shape) {
            shape.draw(gl,program);
            if(shape.isSelected){
                shape.drawControlPoints(gl, program);
            }
        });
    }
    window.requestAnimFrame(render);
}

main();

