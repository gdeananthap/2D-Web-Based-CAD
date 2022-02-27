var canvas;
var gl;
var state = "draw";

var maxNumLines = 200;  
var maxNumVertices  = 2 * maxNumLines;
var index_line = 0;
var index_polygon = 0;
var first = true;

var t, t1, t2;
var countPolygon = 0;
var countIndices = [0];
var start = [0];
var cIndex = 0;

var countShape = 0;
var shapeToDraw = [];
var vertices = []
var vertexLeft = 2;
var colors; 

window.onload = function init() {
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
    gl.clear( gl.COLOR_BUFFER_BIT );

    var program = initShaders( gl, "vertex-shader-2d", "fragment-shader-2d" );
    gl.useProgram( program );
    
    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);
    
    var verticesPosition = gl.getAttribLocation( program, "verticesPosition");
    gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(verticesPosition);
    
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    
    var verticesColor = gl.getAttribLocation( program, "verticesColor");
    gl.vertexAttribPointer(verticesColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(verticesColor);

    canvas.addEventListener("mousedown", function(event){
        if (state === "draw") {
            if(document.getElementById("line").checked){
                gl.bindBuffer( gl.ARRAY_BUFFER, verticesBuffer);
                if(first) {
                    first = false;
                    gl.bindBuffer( gl.ARRAY_BUFFER, verticesBuffer)
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
                    console.log(shapeToDraw);
    
                    gl.bufferSubData(gl.ARRAY_BUFFER, 8*index_line, flatten(t1));
                    gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index_line+1), flatten(t2));
                    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer);
    
                    index_line += 2;
                    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index_line-2), flatten(t));
                    gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index_line-1), flatten(t));
                    render();
                }
            // } else if (document.getElementById("square").checked ) {
                // function square
            // } else if (document.getElementById("rectangle").checked) {
                //function rectangle
            }
            else if (document.getElementById("polygon").checked ) {
                t  = vec2(2*event.clientX/canvas.width-1, 2*(canvas.height-event.clientY)/canvas.height-1);
                gl.bindBuffer( gl.ARRAY_BUFFER, verticesBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 8*index_polygon, flatten(t));
    
                colors = hexToVec4(document.getElementById("color").value);
        
                t = vec4(colors);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                gl.bufferSubData(gl.ARRAY_BUFFER, 16*index_polygon, flatten(t));
    
                countIndices[countPolygon]++;
                index_polygon++;
            }
        }else if(state = "select"){
            //
        }
    })
    
    document.getElementById("PolygonEndButton")
            .addEventListener("click", function() {
                if (document.getElementById("polygon").checked) {
                    countPolygon++;
                    countIndices[countPolygon] = 0;
                    start[countPolygon] = index_polygon;
                    render();
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
        vertexLeft = 2;
    })
    document.getElementById("square").addEventListener('click', () => {
        state = "draw";
    })
    document.getElementById("rectangle").addEventListener('click', () => {
        state = "draw";
    })
    document.getElementById("polygon").addEventListener('click', () => {
        state = "draw";
    })

    function render() {
        // gl.clear( gl.COLOR_BUFFER_BIT );
        // for (shape in shapeToDraw){
        //     const data = shape.getData();
        //     if(data.type === "line"){
                
        //     }
        // }
        if (document.getElementById("line").checked) {

            for(var i = 0; i<index_line; i+=2)
                gl.drawArrays( gl.LINE_STRIP, i, 2 );
        
            window.requestAnimFrame(render);
        } else if (document.getElementById("square").checked) {
            
        } else if (document.getElementById("rectangle").checked) {
            
        } else if (document.getElementById("polygon").checked) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            for (let i = 0; i < countPolygon; i++) {
                gl.drawArrays(gl.TRIANGLE_FAN, start[i], countIndices[i]);    
            }
        }
    }
}

