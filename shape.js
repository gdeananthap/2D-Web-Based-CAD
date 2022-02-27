class Shape {
    constructor(id, type, vertices, color) {
        this.id = id,
        this.type = type,
        this.vertices = vertices,
        this.color = color,
        this.isSelected = false
    }

    getData() {
        const shape = {
            id : this.id,
            type : this.type,
            vertices : this.vertices,
            color : this.color,
            isSelected : this.isSelected
        }
        return shape
    }

    setData(shape) {
        this.id = shape.id,
        this.type = shape.type,
        this.vertices = shape.vertices,
        this.color = shape.color,
        this.isSelected = shape.isSelected
    }
    
    computeAnchorPoint() {
        if (this.va && this.va.length % 2 === 0) {
            let sigmaX = 0
            let sigmaY = 0
            for (let i = 0; i < this.va.length; i += 2) {
                sigmaX += this.va[i]
                sigmaY += this.va[i+1]
            }
            this.anchorPoint = [sigmaX / (this.va.length/2), sigmaY / (this.va.length/2)]
        }
    }
    
    draw(gl, program){
        var verticesPosition = gl.getAttribLocation( program, "verticesPosition");
        var verticesColor = gl.getUniformLocation( program, "fragmentColor");
        let vertexBuffer =  gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.uniform4fv(verticesColor, this.color);
        gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
        if(this.type === "line"){
            gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesMatrixToArray(this.vertices)), gl.STATIC_DRAW);
            gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 2);
        } else{
            gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesMatrixToArray(this.vertices)), gl.STATIC_DRAW);
            gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length);
        }
    }

    assignId(id) { this.id = id }
    setColor(color) { this.color = color }
    setSelected(isSelected) {
        this.isSelected = isSelected
    }
    deselect() {
        this.isSelected = false
    }

    coloring(r, g, b, a) {
        this.setColor([r,g,b,a]);
    }
    
    // bind() {
    //     const gl = this.gl
    //     const buf = gl.createBuffer()
    //     gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.va), gl.STATIC_DRAW)
    //     this.vab = buf
    //     const indexBuffer = gl.createBuffer()
    //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    //     const indices = []
    //     if (this.type != gl.LINES) {
    //         for (let i = 2; i < this.va.length/2; i++) {
    //             indices.push(i-1)
    //             indices.push(i)
    //             indices.push(0)
    //         }
    //     } else {
    //         indices.push(0)
    //         indices.push(1)
    //     }
    //     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    //     this.ia_length = indices.length

    // }
    

    // draw(withProgram?: WebGLProgram) {
    //     this.bind()
    //     const program = withProgram || this.shader
    //     const gl = this.gl
    //     gl.useProgram(program)
    //     const vertexPos = gl.getAttribLocation(program, 'attrib_vertexPos')
    //     const uniformCol = gl.getUniformLocation(program, 'u_fragColor')
    //     const uniformPos = gl.getUniformLocation(program, 'u_pos')
    //     gl.uniformMatrix3fv(uniformPos, false, this.projectionMatrix)
    //     gl.vertexAttribPointer(
    //         vertexPos,
    //         2, // it's 2 dimensional    
    //         gl.FLOAT,
    //         false,
    //         0,
    //         0
    //     )
    //     gl.enableVertexAttribArray(vertexPos)
    //     if (this.color) {
    //         gl.uniform4fv(uniformCol, this.color)
    //     }
    //     gl.drawElements(this.type, this.ia_length, gl.UNSIGNED_SHORT, 0)
    // }

    // drawSelect(selectProgram: WebGLProgram) {
    //     this.bind()
    //     const gl = this.gl
    //     const id = this.id
    //     gl.useProgram(selectProgram)
    //     const vertexPos = gl.getAttribLocation(selectProgram, 'a_Pos')
    //     const uniformCol = gl.getUniformLocation(selectProgram, 'u_id')
    //     const uniformPos = gl.getUniformLocation(selectProgram, 'u_pos')
    //     gl.uniformMatrix3fv(uniformPos, false, this.projectionMatrix)
    //     gl.vertexAttribPointer(
    //         vertexPos,
    //         2, // it's 2 dimensional
    //         gl.FLOAT,
    //         false,
    //         0,
    //         0
    //     )
    //     gl.enableVertexAttribArray(vertexPos)
    //     const uniformId = [
    //         ((id >> 0) & 0xFF) / 0xFF,
    //         ((id >> 8) & 0xFF) / 0xFF,
    //         ((id >> 16) & 0xFF) / 0xFF,
    //         ((id >> 24) & 0xFF) / 0xFF,
    //     ]
    //     gl.uniform4fv(uniformCol, uniformId)
    //     gl.drawElements(this.type, this.ia_length, gl.UNSIGNED_SHORT, 0)
    // }

    // drawPoint(vertPointProgram: WebGLProgram) {
    //     this.bind()
    //     const program = vertPointProgram
    //     const gl = this.gl
    //     gl.useProgram(program)
    //     const vertexPos = gl.getAttribLocation(program, 'a_Pos')
    //     const uniformCol = gl.getUniformLocation(program, 'u_fragColor')
    //     const uniformPos = gl.getUniformLocation(program, 'u_pos')
    //     const resolutionPos = gl.getUniformLocation(program, 'u_resolution')
    //     gl.uniformMatrix3fv(uniformPos, false, this.projectionMatrix)
    //     gl.vertexAttribPointer(
    //         vertexPos,
    //         2, // it's 2 dimensional
    //         gl.FLOAT,
    //         false,
    //         0,
    //         0
    //     )
    //     gl.uniform2f(resolutionPos, gl.canvas.width, gl.canvas.height)
    //     gl.enableVertexAttribArray(vertexPos)
    //     if (this.color) {
    //         gl.uniform4fv(uniformCol, this.color)
    //     }
    //     gl.uniform4fv(uniformCol, [0.0, 0.0, 1.0, 1.0])
    //     if (this.ia_length > 3) {
    //         gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 2)
    //         gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 4)
    //         gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 0)
    //         for (let i = 3; i < this.ia_length; i+=3) {
    //             gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, (i+1)*2)
    //         }
    //     } else {
    //         gl.drawElements(gl.POINTS, 2, gl.UNSIGNED_SHORT, 0)
    //     }
    // }

    // drawPointSelect(selectProgram: WebGLProgram) {
    //     this.bind()
    //     const gl = this.gl
    //     gl.useProgram(selectProgram)
    //     const vertexPos = gl.getAttribLocation(selectProgram, 'a_Pos')
    //     const uniformCol = gl.getUniformLocation(selectProgram, 'u_id')
    //     const uniformPos = gl.getUniformLocation(selectProgram, 'u_pos')
    //     const resolutionPos = gl.getUniformLocation(selectProgram, 'u_resolution')
    //     gl.uniformMatrix3fv(uniformPos, false, this.projectionMatrix)
    //     gl.vertexAttribPointer(
    //         vertexPos,
    //         2, // it's 2 dimensional
    //         gl.FLOAT,
    //         false,
    //         0,
    //         0
    //     )
    //     gl.enableVertexAttribArray(vertexPos)
    //     gl.uniform2f(resolutionPos, gl.canvas.width, gl.canvas.height)
    //     if (this.ia_length > 3) {
    //         gl.uniform4fv(uniformCol, setElementId(2))
    //         gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 0)
    //         gl.uniform4fv(uniformCol, setElementId(3))
    //         gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 2)
    //         gl.uniform4fv(uniformCol, setElementId(1))
    //         gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 4)
    //         let lastVertId = 4
    //         for (let i = 3; i < this.ia_length; i+=3) {
    //             gl.uniform4fv(uniformCol, setElementId(lastVertId))
    //             gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, (i+1)*2)
    //             lastVertId++
    //         }
    //     } else {
    //         gl.uniform4fv(uniformCol, setElementId(1))
    //         gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 0)
    //         gl.uniform4fv(uniformCol, setElementId(2))
    //         gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 2)
    //     }        
    // }
}

// function setElementId(id: number) {
//     const uniformId = [
//         ((id >> 0) & 0xFF) / 0xFF,
//         ((id >> 8) & 0xFF) / 0xFF,
//         ((id >> 16) & 0xFF) / 0xFF,
//         0x69,
//     ]
//     return uniformId
// }