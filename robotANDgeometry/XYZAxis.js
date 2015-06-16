// Constructor for XYZAxis object
XYZAxis = function (gl, shaderProgram) {
    // WebGL context
    this.gl      = gl
    this.program = shaderProgram
    
    // Parameters
    this.fancyArrow = false
    
    // Data buffers
    this.buffers = {} // Initialized below
    this.buffers.position = gl.createBuffer();
    this.buffers.color = gl.createBuffer();
    this.updateBuffers()
}

XYZAxis.prototype.updateBuffers = function() {
    var gl      = this.gl
    var buffers = this.buffers        
    
    buffers.position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    var vertices = [
         0.0,  0.0,  0.0, // X axis: (0,0,0)-(1,0,0)
         1.0,  0.0,  0.0,
         0.0,  0.0,  0.0, // Y axis: (0,0,0)-(0,1,0)
         0.0,  1.0,  0.0,
         0.0,  0.0,  0.0, // Z axis: (0,0,0)-(0,0,1)
         0.0,  0.0,  1.0,
    ];
    if (this.fancyArrow) {
        // Add fancy arrows
        vertices = vertices.concat( [
            1.0, 0.0, 0.0,    0.8, 0.05, 0.0,  
            1.0, 0.0, 0.0,    0.8, 0.0, 0.05,
            0.0, 1.0, 0.0,    0.05, 0.8, 0.0,  
            0.0, 1.0, 0.0,    0.0, 0.8, 0.05,
            0.0, 0.0, 1.0,    0.05, 0.0, 0.8,  
            0.0, 0.0, 1.0,    0.0, 0.05, 0.8
        ] )
    }
    var N = vertices.length / 3; // 1 vertex = 3 coordinates
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    buffers.position.itemSize = 3;
    buffers.position.numItems = N;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    var colors = [
         1.0,  0.0,  0.0, // X: red
         1.0,  0.0,  0.0,
         0.0,  1.0,  0.0, // Y: green
         0.0,  1.0,  0.0,
         0.0,  0.0,  1.0, // Z: blue
         0.0,  0.0,  1.0,
    ];
    if (this.fancyArrow) {
        colors = colors.concat( [
             1.0,  0.0,  0.0, // X: red
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0, // X: red
             1.0,  0.0,  0.0,
             0.0,  1.0,  0.0, // Y: green
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0, // Y: green
             0.0,  1.0,  0.0,
             0.0,  0.0,  1.0, // Z: blue
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0, // Z: blue
             0.0,  0.0,  1.0,
        ] )
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    buffers.color.itemSize = 3;
    buffers.color.numItems = N;
}

// inputs:
//   mMatrix (model Matrix)
//   vMatrix (view matrix)
//   pMatrix (projection matrix)
XYZAxis.prototype.draw = function(mMatrix, vMatrix, pMatrix) {
    var gl      = this.gl
    var program = this.program;
    var buffers = this.buffers;
    
    gl.useProgram(program);

    var mvMatrix = mat4.create();
    mat4.multiply(mvMatrix, vMatrix, mMatrix);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(program.vertexPositionAttribute, buffers.position.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(program.vertexColorAttribute, buffers.color.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, buffers.position.numItems);
}
