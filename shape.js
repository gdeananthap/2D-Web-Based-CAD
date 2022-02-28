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

    drawID(gl, program){
        var verticesPosition = gl.getAttribLocation( program, "verticesPosition");
        var idPosition = gl.getUniformLocation(program, "u_id");

        const u_id = [
            ((this.id >> 0) & 0xFF) / 0xFF,
            ((this.id >> 8) & 0xFF) / 0xFF,
            ((this.id >> 16) & 0xFF) / 0xFF,
            ((this.id >> 24) & 0xFF) / 0xFF,
        ];

        let vertexBuffer =  gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesMatrixToArray(this.vertices)), gl.STATIC_DRAW);
        gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
        gl.uniform4fv(idPosition, u_id);
        if(this.type === "line"){
            gl.drawArrays(gl.LINES, 0, 2);
        } else{
            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length);
        }
    }

    drawControlPoints(gl, program){
        if(this.isSelected){
            var verticesPosition = gl.getAttribLocation( program, "verticesPosition");
            var verticesColor = gl.getUniformLocation( program, "fragmentColor");
            let vertexBuffer =  gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesMatrixToArray(this.vertices)), gl.STATIC_DRAW);
            gl.vertexAttribPointer(verticesPosition, 2, gl.FLOAT, false, 0, 0);
            gl.uniform4fv(verticesColor, vec4( 1.0, 0.0, 1.0, 1.0 ));
            gl.drawArrays(gl.POINTS, 0, this.vertices.length);
        }
    }

    getCurrentControlPoint(x, y){
        let minDistance = Infinity;
        let pointIdx = -1;
        for(let i=0; i<this.vertices.length; i++){
            let currentDistance = Math.sqrt((this.vertices[i][0]-x)**2 + (this.vertices[i][1]-y)**2)
            if(currentDistance < minDistance){
                minDistance = currentDistance;
                pointIdx = i;
            }
        }
        if(minDistance <= 5){
            return pointIdx;
        }else{
            return -1;
        }
    }

    movePoint(idx, x, y){
        if(this.type==="line" || this.type==="polygon"){
            this.vertices[idx][0] = x;
            this.vertices[idx][1] = y;
        }
        else if (this.type==="rectangle") {
            this.vertices[idx][0] = x;
            this.vertices[idx][1] = y;
            if(idx === 0) {
                this.vertices[1][0] = x;
                this.vertices[3][1] = y;
            }
            else if(idx === 1) {
                this.vertices[0][0]= x;
                this.vertices[2][1] = y;
            }
            else if(idx ===3) {
                this.vertices[0][1] = y;
                this.vertices[2][0] = x;
            }
            else if(idx == 2) {
                this.vertices[1][1] = y;
                this.vertices[3][0] = x;
            }
        }
        else if (this.type==="square") {
            //this.vertices[idx][0] = x;
            this.vertices[idx][1] = y;
            if(idx === 0) {
                this.vertices[idx][0] = this.vertices[2][0] > x ? this.vertices[2][0] - Math.abs(this.vertices[2][1]-y) : this.vertices[2][0] + Math.abs(this.vertices[2][1]-y);
                this.vertices[1][0] = this.vertices[idx][0];
                this.vertices[3][1] = y;
            }
            else if(idx === 1) {
                this.vertices[idx][0] = this.vertices[3][0] > x ? this.vertices[3][0] - Math.abs(this.vertices[3][1]-y) : this.vertices[3][0] + Math.abs(this.vertices[3][1]-y);
                this.vertices[0][0]= this.vertices[idx][0];
                this.vertices[2][1] = y;
            }
            else if(idx ===3) {
                this.vertices[idx][0] = this.vertices[1][0] > x ? this.vertices[1][0] - Math.abs(this.vertices[1][1]-y) : this.vertices[1][0] + Math.abs(this.vertices[1][1]-y);
                this.vertices[0][1] = y;
                this.vertices[2][0] = this.vertices[idx][0];
            }
            else if(idx == 2) {
                this.vertices[idx][0] = this.vertices[0][0] > x ? this.vertices[0][0] - Math.abs(this.vertices[0][1]-y) : this.vertices[0][0] + Math.abs(this.vertices[0][1]-y);
                this.vertices[1][1] = y;
                this.vertices[3][0] = this.vertices[idx][0];
            }
        }
    }

    assignId(id) { this.id = id }
    setColor(color) { this.color = color }
    select() {
        this.isSelected = true;
    }
    deselect() {
        this.isSelected = false;
    }

    coloring(r, g, b, a) {
        this.setColor([r,g,b,a]);
    }    
}
