// Constructor for RECTANGULOW object
RECTANGULOW = function (gl, shaderProgram) {
    // WebGL context
    this.gl      = gl
    this.program = shaderProgram
    
    // Parameters
    this.fancyArrow = false
    
    // Data buffers
    this.buffers = {} // Initialized below
    this.buffers.position = gl.createBuffer();
    this.buffers.color = gl.createBuffer();
    this.buffers.index = gl.createBuffer();
    
    this.updateBuffers()
}

RECTANGULOW.prototype.updateBuffers = function() {
    var gl      = this.gl
    var buffers = this.buffers        
    
    buffers.position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
     
     var vertices = [
         // Front face
           -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  2.0,  0.5,
            -0.5,  2.0,  0.5,

            // Back face
            -0.5, -0.5, -0.5,
            -0.5,  2.0, -0.5,
             0.5,  2.0, -0.5,
             0.5, -0.5, -0.5,

            // Top face
            -0.5,  2.0, -0.5,
            -0.5,  2.0,  0.5,
             0.5,  2.0,  0.5,
             0.5,  2.0, -0.5,

            // Bottom face
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,
            -0.5, -0.5,  0.5,

            // Right face
             0.5, -0.5, -0.5,
             0.5,  2.0, -0.5,
             0.5,  2.0,  0.5,
             0.5, -0.5,  0.5,

            // Left face
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5,  2.0,  0.5,
            -0.5,  2.0, -0.5
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
    buffers.position.numItems = 24;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
   var  colors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [0.0, 0.0, 1.0, 1.0]  // Left face
        ];
        
        var unpackedColors = [];
        for (var i in colors) {
            var color = colors[i];
            for (var j=0; j < 4; j++) {
                unpackedColors = unpackedColors.concat(color);
            }
        }
                 
    if (this.fancyArrow) {
        colors = colors.concat( [
             1.0,  0.0,  0.0, 1.0, // X: red
             1.0,  0.0,  0.0, 1.0,
             1.0,  0.0,  0.0, 1.0, // X: red
             1.0,  0.0,  0.0, 1.0,
             0.0,  1.0,  0.0, 1.0,// Y: green
             0.0,  1.0,  0.0, 1.0,
             0.0,  1.0,  0.0, 1.0, // Y: green
             0.0,  1.0,  0.0, 1.0,
             0.0,  0.0,  1.0, 1.0, // Z: blue
             0.0,  0.0,  1.0, 1.0,
             0.0,  0.0,  1.0, 1.0, // Z: blue
             0.0,  0.0,  1.0, 1.0
        ] )
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    buffers.color.itemSize = 4;
    buffers.color.numItems = 24;
    
    buffers.index = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        var Indices = [
           0,1,0,3,0,4,1,2,1,7,2,6,3,2,4,5,4,7,5,6,6,7,8,9
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Indices), gl.STATIC_DRAW);
        buffers.index.itemSize = 1;
        buffers.index.numItems = 24;
}

// inputs:
//   mMatrix (model Matrix)
//   vMatrix (view matrix)
//   pMatrix (projection matrix)
RECTANGULOW.prototype.draw = function(mMatrix, vMatrix, pMatrix) {
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
    
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
      
   	gl.drawElements(gl.LINES, buffers.index.numItems, gl.UNSIGNED_SHORT, 0);
    
}
   