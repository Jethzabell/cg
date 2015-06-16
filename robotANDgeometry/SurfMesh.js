
// Constructor for 2D PlaneMesh object
function SurfMesh(shaderProgram, w,h,nx,ny) {
    this.program = shaderProgram
    this.buffers = {} // Initialized below
    
    this.w = w
    this.h = h
    this.nx = nx
    this.ny = ny
    
    this.X = []
    this.Y = []
    this.Z = []
    
    this.color = [0.5, 0.5, 0.5]
    
    this.initBuffers()
}

SurfMesh.prototype.initBuffers = function() {
        var buffers = this.buffers
        var nx = this.nx, ny = this.ny, w = this.w, h = this.h
        var nx1 = nx+1
            
        var sx = w/nx, sy = h/ny
        var offx = -(w)/2, offy = -(h)/2
        for (var y=0; y<=nx; y++) {
            for (var x=0; x<=nx; x++) {
                this.X[x+y*nx1] = x*sx + offx
                this.Y[x+y*nx1] = y*sy + offy
                this.Z[x+y*nx1] = 0
            }
        }
    
        buffers.position = gl.createBuffer();
        buffers.color = gl.createBuffer();
        buffers.index = gl.createBuffer();
        buffers.wireindex = gl.createBuffer();
        
        this.updateBuffers()
    }
    
SurfMesh.prototype.updateBuffers = function() {
        var buffers = this.buffers
        var nx = this.nx, ny = this.ny
        var nx1 = nx+1
        
        var N = (nx+1)*(ny+1);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        var vertices = []
        for (var y=0; y<=ny; y++) {
            for (var x=0; x<=nx; x++) {
                vertices[3*(x+y*nx1)  ] = this.X[x+y*nx1]
                vertices[3*(x+y*nx1)+1] = this.Y[x+y*nx1]
                vertices[3*(x+y*nx1)+2] = this.Z[x+y*nx1]
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        buffers.position.itemSize = 3;
        buffers.position.numItems = N;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        var colors = [];
        for (var i=0; i<N; i++) {
            colors[3*i  ] = this.color[0]
            colors[3*i+1] = this.color[1]
            colors[3*i+2] = this.color[2]
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        buffers.color.itemSize = 3;
        buffers.color.numItems = N;
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        var indices = []
        var id = 0;
        for (var y=0; y<ny; y++) {
            for (var x=0; x<nx; x++) {
                indices[id]   = x+y*nx1
                indices[id+1] = (x+1)+y*nx1
                indices[id+2] = (x+1)+(y+1)*nx1
                id += 3
                indices[id]   = x+y*nx1
                indices[id+1] = x+(y+1)*nx1
                indices[id+2] = (x+1)+(y+1)*nx1
                id += 3
            }
        }
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        buffers.index.itemSize = 1;
        buffers.index.numItems = id;
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireindex);
        var wireindices = []
        id = 0;
        for (var y=0; y<ny; y++) {
            for (var x=0; x<nx; x++) {
                wireindices[id]   = x+y*nx1
                wireindices[id+1] = (x+1)+y*nx1
                id+=2
                wireindices[id]   = x+y*nx1
                wireindices[id+1] = x+(y+1)*nx1
                id+=2
                wireindices[id]   = (x+1)+y*nx1
                wireindices[id+1] = (x+1)+(y+1)*nx1
                id+=2
                wireindices[id]   = x+(y+1)*nx1
                wireindices[id+1] = (x+1)+(y+1)*nx1
                id+=2
            }
        }
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireindices), gl.STATIC_DRAW);
        buffers.wireindex.itemSize = 1;
        buffers.wireindex.numItems = id;
    }

    // inputs:
    //   mMatrix (model Matrix)
    //   vMatrix (view matrix)
    //   pMatrix (projection matrix)
SurfMesh.prototype.draw = function(mMatrix, vMatrix, pMatrix) {
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
        gl.drawElements(gl.TRIANGLES, buffers.index.numItems, gl.UNSIGNED_SHORT, 0);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireindex);
        // gl.drawElements(gl.LINES, buffers.index.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
SurfMesh.prototype.drawWire = function(mMatrix, vMatrix, pMatrix) {
        var program = this.program;
        var buffers = this.buffers;
        
        gl.useProgram(program);

        var mvMatrix = mat4.create();
        mat4.multiply(mvMatrix, vMatrix, mMatrix);

        var tmp = mat4.create();
        var eps = 0.00001
        mat4.translate(tmp, tmp, [0, 0, -eps]);
        mat4.multiply(tmp, tmp, pMatrix);

        gl.uniformMatrix4fv(program.pMatrixUniform, false, tmp);
        gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(program.vertexPositionAttribute, buffers.position.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(program.vertexColorAttribute, buffers.color.itemSize, gl.FLOAT, false, 0, 0);

//        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
//        gl.drawElements(gl.TRIANGLES, buffers.index.numItems, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireindex);
        gl.drawElements(gl.LINES, buffers.wireindex.numItems, gl.UNSIGNED_SHORT, 0);
    }
    