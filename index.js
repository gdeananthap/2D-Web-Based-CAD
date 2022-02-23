var canvas;
var gl;

var maxNumLines = 200;  
var maxNumVertices  = 2 * maxNumLines;
var index = 0;
var first = true;

var t1, t2;
var cIndex = 0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

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
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );


    //
    //  Load shaders and initialize attribute buffers
    //
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
    
    // var m = document.getElementById("mymenu");
    
    // m.addEventListener("click", function() {
    //    cIndex = m.selectedIndex;
    //     });

    
    canvas.addEventListener("mousedown", function(event){
        gl.bindBuffer( gl.ARRAY_BUFFER, verticesBuffer);
        if(first) {
            first = false;
            gl.bindBuffer( gl.ARRAY_BUFFER, verticesBuffer)
            t1 = vec2(2*event.clientX/canvas.width-1, 
                2*(canvas.height-event.clientY)/canvas.height-1);
            
        }
        else {
            first = true;
            t2 = vec2(2*event.clientX/canvas.width-1, 
                2*(canvas.height-event.clientY)/canvas.height-1);

            gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t1));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+1), flatten(t2));
            gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer);
            index += 2;
            
            t = vec4(colors[cIndex]);

            gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-2), flatten(t));
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-1), flatten(t));
        }
    } );

    render();

    function render() {
    
        gl.clear( gl.COLOR_BUFFER_BIT );
    
        for(var i = 0; i<index; i+=2)
            gl.drawArrays( gl.LINE_STRIP, i, 2 );
    
        window.requestAnimFrame(render);
    
    }
}

