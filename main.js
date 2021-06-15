
const lowerCanvas = document.getElementById('lower-canvas');
const lowerCanvasContext = lowerCanvas.getContext('2d');
const canvasOffset = lowerCanvas.getBoundingClientRect();
let canvasObjects = [];

function init(){
	let activeObject = {};
	const upperCanvas = document.createElement('canvas');
	const upperCanvasContext = upperCanvas.getContext('2d');
	styleUpperCanvas();

	const canvasContainer = document.getElementById('canvas-container');
	canvasContainer.style.position = 'relative';
	canvasContainer.appendChild(upperCanvas);

	
	let isDrawingModeOn = false;
	let startX = 0;
	let startY = 0;
	const offsetX = canvasOffset.top;
	const offsetY = canvasOffset.left;

	function doubleClickOnCanvas(event){
		event.preventDefault();
    	event.stopPropagation();
		const isObjectSelected = getActiveObject(event);

		if(isObjectSelected){
			removeSelectedObjectAndRedraw(false);
		}
	}

	function mouseUp(event){
		event.preventDefault();
    	event.stopPropagation();
		if(isDrawingModeOn){
			lowerCanvasContext.drawImage(upperCanvas, 0 , 0);
		    upperCanvasContext.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
		    canvasObjects.push(activeObject);
		  	isDrawingModeOn = false;
		  	discardActiveObject();
		}else if(activeObject.isSelected){
			lowerCanvasContext.drawImage(upperCanvas, 0 , 0);
		    upperCanvasContext.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
			discardActiveObject();
		}
		console.log(canvasObjects)
	}

	function mouseMove (event) {
		event.preventDefault();
    	event.stopPropagation();
		const { pointX, pointY} = getMouseDownPointer(event);
		const movementX = pointX - startX;
	  	const movementY = pointY - startY;	

		if(isDrawingModeOn){
		    upperCanvasContext.clearRect(0, 0, upperCanvas.width, upperCanvas.height);	   
		    upperCanvasContext.fillRect(startX, startY, movementX, movementY);
		    if(movementX < 0){
		    	activeObject.top = pointX;
		    }
		    if(movementY < 0){
		    	activeObject.left = pointY;
		    }
		    activeObject.width = Math.abs(movementX);
		    activeObject.height = Math.abs(movementY);
		}else if(activeObject.isSelected){
			const newTop = activeObject.top + movementX;
			const newLeft = activeObject.left + movementY;
			upperCanvasContext.clearRect(0, 0, upperCanvas.width, upperCanvas.height);	   
		    upperCanvasContext.fillRect(newTop, newLeft, activeObject.width, activeObject.height);
			canvasObjects[activeObject.id].top = newTop;
			canvasObjects[activeObject.id].left = newLeft;
		}
	}

	function mouseDown (event) {
		event.preventDefault();
    	event.stopPropagation();
		const isObjectSelected = getActiveObject(event);
		const { pointX, pointY} = getMouseDownPointer(event);
		startX = pointX;
	    startY = pointY;

		if(!isObjectSelected){
			const fillColor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');

		    isDrawingModeOn = true;

		    upperCanvasContext.fillStyle = fillColor;
		    activeObject = { id:canvasObjects.length, type : 'rect', top: startX, left: startY, fill: fillColor, height: 0, width: 0, isSelected: true};
		}else{
			removeSelectedObjectAndRedraw();
			
			upperCanvasContext.fillStyle = activeObject.fill;
			upperCanvasContext.fillRect(activeObject.top, activeObject.left, activeObject.width, activeObject.height);
		}
	}

	function getActiveObject(event){
		const { pointX, pointY} = getMouseDownPointer(event);
		if(canvasObjects.length){
			for (let index = canvasObjects.length - 1; index >= 0; index--) {
				if((pointX >= canvasObjects[index].top && pointY >= canvasObjects[index].left) && (pointX <= canvasObjects[index].width + canvasObjects[index].top && pointY <= canvasObjects[index].height + canvasObjects[index].left)){
					canvasObjects[index].isSelected = true;
					activeObject = Object.assign({}, canvasObjects[index]);
					return true;
				}
			}	
		}
		return false;
	}

	function removeSelectedObjectAndRedraw(pushRemovedObject = true){
		canvasObjects.splice(activeObject.id,1);
		activeObject.id = canvasObjects.length;
		if(pushRemovedObject){
			canvasObjects.push(Object.assign({}, activeObject));
		}else{
			activeObject={}
		}
		lowerCanvasContext.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
		for(const index in canvasObjects){
			if(!canvasObjects[index].isSelected){
				canvasObjects[index].id = index;
				lowerCanvasContext.fillStyle = canvasObjects[index].fill;
				lowerCanvasContext.fillRect(canvasObjects[index].top, canvasObjects[index].left, canvasObjects[index].width, canvasObjects[index].height);		
			}
		}
	}

	function discardActiveObject(){
		canvasObjects[activeObject.id].isSelected = false;  
		activeObject = {};
	}

	function styleUpperCanvas(){
		upperCanvas.height = lowerCanvas.height;
		upperCanvas.width = lowerCanvas.width;
		upperCanvas.style.position = 'absolute'; 
		upperCanvas.style.top = '1px';
		upperCanvas.style.left = '1px'; 
	}

	function getMouseDownPointer(mouseEvent){
		const pointX = mouseEvent.clientX - offsetX;
		const pointY = mouseEvent.clientY - offsetY;

		return { pointX: pointX, pointY: pointY};
	}

	upperCanvas.addEventListener('mousedown', mouseDown);
	upperCanvas.addEventListener('mousemove', mouseMove);
	upperCanvas.addEventListener('mouseup', mouseUp);
	upperCanvas.addEventListener('dblclick', doubleClickOnCanvas);
}

function clearCanvas(){
	lowerCanvasContext.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
	canvasObjects = [];
}