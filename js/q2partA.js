<script type="text/javascript">
	var canvasA = document.getElementById("canvas-A");
	var ctxA = canvasA.getContext("2d");

	var imgDataA = ctxA.getImageData(0, 0, canvasA.width, canvasA.height);
	var dataA = imgDataA.data;

	circleA();
		  
	function circleA(){

		var radius = 80;
		// iterate over all pixels
		x0 = 150;
		y0 = 150;
		
		for (var x=0; x<canvasA.width; x++)
		{
			for (var y=0; y<canvasA.height; y++) 
			{
				var idx=4*(x+y*canvasA.height);
				var dist = Math.sqrt( Math.pow((x-x0),2)  + Math.pow((y-y0),2) );
				if(dist < radius)
				{//
					dataA[idx] = 0;
					dataA[idx+1] = 0;
					dataA[idx+2] = 0;
					dataA[idx+3] = 255;      
			   }  
			}
		} 
		ctxA.putImageData(imgDataA, 0, 0); 
	}
</script>