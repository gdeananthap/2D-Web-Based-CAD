window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             window.setTimeout(callback, 1000/60);
           };
  })();

function flatten( v ){
    if ( v.matrix === true ) {
        v = transpose( v );
    }

    var n = v.length;
    var elemsAreArrays = false;

    if ( Array.isArray(v[0]) ) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array( n );

    if ( elemsAreArrays ) {
        var idx = 0;
        for ( var i = 0; i < v.length; ++i ) {
            for ( var j = 0; j < v[i].length; ++j ) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for ( var i = 0; i < v.length; ++i ) {
            floats[i] = v[i];
        }
    }

    return floats;
}

function initShaders( gl, vertexShaderId, fragmentShaderId )
{
    var vertShdr;
    var fragShdr;

    var vertElem = document.getElementById( vertexShaderId );
    if ( !vertElem ) { 
        alert( "Unable to load vertex shader " + vertexShaderId );
        return -1;
    }
    else {
        vertShdr = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertShdr, vertElem.text );
        gl.compileShader( vertShdr );
        if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
            var msg = "Vertex shader failed to compile.  The error log is:"
        	+ "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
            alert( msg );
            return -1;
        }
    }

    var fragElem = document.getElementById( fragmentShaderId );
    if ( !fragElem ) { 
        alert( "Unable to load vertex shader " + fragmentShaderId );
        return -1;
    }
    else {
        fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragShdr, fragElem.text );
        gl.compileShader( fragShdr );
        if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
            var msg = "Fragment shader failed to compile.  The error log is:"
        	+ "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
            alert( msg );
            return -1;
        }
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return -1;
    }

    return program;
}

function _argumentsToArray( args )
{
    return [].concat.apply( [], Array.prototype.slice.apply(args) );
}

function vec2()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    }

    return result.splice( 0, 2 );
}

function vec4()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    case 3: result.push( 1.0 );
    }

    return result.splice( 0, 4 );
}

function hexToVec4(value) {
    var r = parseInt(value.slice(1,3), 16);
    var g = parseInt(value.slice(3,5), 16);
    var b = parseInt(value.slice(5,7), 16);
    return vec4(r/255, g/255, b/255, 1.0);
}

function verticesMatrixToArray(array) {
    var result = []
    for (let i = 0; i < array.length; i++) {
        result.push(array[i][0])
        result.push(array[i][1])
      }
    return result
}

function save() {
    exportShape(shapeToDraw)
}

function printSave(listShape) {
    var string = "";
    listShape.forEach(element => {
        string += element.id+";"+element.type+";"+element.vertices+";"+element.color+";"+element.isSelected+"\n";
    });
    return string;
}

function exportShape(listShape) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(printSave(listShape)));
    pom.setAttribute('download', "Untitled.txt");

    pom.style.display = 'none';
    document.body.appendChild(pom);

    pom.click();

    document.body.removeChild(pom);
}

function loadFile(file) {
    var listShape = [];
    var text = file.split("\n");
    text.pop();
    text.forEach(element => {
        var shape = element.split(";");
        console.log(shape);
        var vert = shape[2].split(",");
        
        var color = shape[3].split(",");
        var objShape;
        if (shape[1] == "line") {
            objShape = new Shape(shape[0], "line", [vec2(vert[0],vert[1]),vec2(vert[2],vert[3])],
                                vec4(color[0],color[1],color[2],color[3]));
        } else if (shape[1] == "square") {
            objShape = new Shape(shape[0], "square", [vec2(vert[0],vert[1]),vec2(vert[2],vert[3]),vec2(vert[4],vert[5]),vec2(vert[6],vert[7])],
                                vec4(color[0],color[1],color[2],color[3]));
        } else if (shape[1] == "rectangle") {
            objShape = new Shape(shape[0], "rectangle", [vec2(vert[0],vert[1]),vec2(vert[2],vert[3]),vec2(vert[4],vert[5]),vec2(vert[6],vert[7])],
                                vec4(color[0],color[1],color[2],color[3]));
        } else if (shape[1] ==  "polygon") {
            var arrVert = []
            for (let i = 0; i < color.length; i+=2) {
                arrVert.push(vec2(vert[i],vert[i+1]));
            }
            objShape = new Shape(shape[0], "rectangle", arrVert,
                                vec4(color[0],color[1],color[2],color[3]));
        }
        listShape.push(objShape);
    });
    return listShape;
}