
// Constructor for 2D PlaneMesh object
PlaneMesh = function (gl, shaderProgram, w,h,nx,ny) {
    // WebGL context
    this.gl = gl                    
    this.program = shaderProgram
    
    // Parameters
    this.w = w;   this.h = h;
    this.nx = nx; this.ny = ny;
    
    // Data buffers
    this.buffers = {}
    this.buffers.position = gl.createBuffer()
    this.buffers.color = gl.createBuffer()
    this.updateBuffers()
}

PlaneMesh.prototype.updateBuffers = function() {
    var buffers = this.buffers
    var w = this.w, h = this.h, nx = this.nx, ny = this.ny
    
    var N = 2*(nx+1)+2*(ny+1)

    /* Fill buffers with data */

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    var vertices = []
    var sx = w/nx, sy = h/ny
    var id = 0
    for (var i=0; i<=nx; i++) {
        // X lines: (x,-h/2)-(x,h/2)
        vertices[id++] = i*sx - w/2   // Line start
        vertices[id++] = -h/2
        vertices[id++] = 0
        vertices[id++] = i*sx - w/2   // Line end
        vertices[id++] = h/2
        vertices[id++] = 0
    }
    for (var i=0; i<=ny; i++) {
        // Y lines: (-w/2,y)-(w/2,y)
        vertices[id++] = -w/2
        vertices[id++] = i*sy - h/2
        vertices[id++] = 0
        vertices[id++] = w/2
        vertices[id++] = i*sy - h/2
        vertices[id++] = 0
    }
    // At this point, id is supposed to be equal to 3*N (N vertices with 3 coordinates)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    buffers.position.itemSize = 3;
    buffers.position.numItems = N;

    /* Vertex colors */

    buffers.color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    var colors = [];
    for (var i=0; i<N; i++) {
        colors[3*i  ] = 0.5
        colors[3*i+1] = 0.5
        colors[3*i+2] = 0.5
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    buffers.color.itemSize = 3;
    buffers.color.numItems = N;
}

// inputs:
//   mMatrix (model Matrix)
//   vMatrix (view matrix)
//   pMatrix (projection matrix)
PlaneMesh.prototype.draw = function(mMatrix, vMatrix, pMatrix) {
    var gl      = this.gl       // aliases to simplify code
    var program = this.program; 
    var buffers = this.buffers;
    
    gl.useProgram(program); // Set up program in case there are several programs

    /* Set uniforms */

    var mvMatrix = mat4.create();
    mat4.multiply(mvMatrix, vMatrix, mMatrix);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);

    /* Declare buffers */

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(program.vertexPositionAttribute, buffers.position.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(program.vertexColorAttribute, buffers.color.itemSize, gl.FLOAT, false, 0, 0);
    
    /* Draw */

    gl.drawArrays(gl.LINES, 0, buffers.position.numItems);
}
