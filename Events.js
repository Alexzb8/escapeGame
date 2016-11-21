var Events = function(canvasId){
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.stage = undefined;
    this.listening = false;
    // desktop flags
    this.mousePos = null;
    this.mouseDown = false;
    this.mouseUp = false;
    this.mouseOver = false;
    this.mouseMove = false;
    // region events
    this.currentRegion=null;
    this.regionIndex=0;
    this.lastRegionIndex = -1;
    this.mouseOverRegionIndex = -1;
};
Events.prototype.getContext = function(){
    return this.context;
};
Events.prototype.getCanvas = function(){
    return this.canvas;
};
Events.prototype.clear = function(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};
Events.prototype.getCanvasPos = function(){
    var obj = this.getCanvas();
    var top = 0;
    var left = 0;
    while (obj.tagName != "BODY") {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }
    return {
        top: top,
        left: left
    };
};
Events.prototype.setStage = function(func){
    this.stage = func;
    this.listen();
};
Events.prototype.reset = function(evt) {
    if (!evt) {
        evt = window.event;
    }
    this.setMousePosition(evt);
    this.regionIndex = 0;
    if (this.stage !== undefined) {
        this.stage();
    }
    // desktop flags
    this.mouseOver = false;
    this.mouseMove = false;
    this.mouseDown = false;
    this.mouseUp = false;
};
Events.prototype.listen = function() {
    var that = this;
    if (this.stage !== undefined) {
        this.stage();
    }
// desktop events
    this.canvas.addEventListener("mousedown", function (evt) {
        that.mouseDown = true;
        that.reset(evt);
    }, false);
    this.canvas.addEventListener("mousemove", function (evt) {
        that.reset(evt);
    }, false);
    this.canvas.addEventListener("mouseup", function (evt) {
        that.mouseUp = true;
        that.reset(evt);
    }, false);
    this.canvas.addEventListener("mouseover", function (evt) {
		that.reset(evt);
    }, false);
    this.canvas.addEventListener("mouseout", function (evt) {
		that.mousePos = null;
		
    }, false);
};
Events.prototype.getMousePos = function(evt){
    return this.mousePos;
};
Events.prototype.getTouchPos = function(evt){
    return this.touchPos;
};
Events.prototype.setMousePosition = function(evt){
    var mouseX = evt.clientX - this.getCanvasPos().left + window.pageXOffset;
    var mouseY = evt.clientY - this.getCanvasPos().top + window.pageYOffset;
    this.mousePos = {
        x: mouseX,
        y: mouseY
    };
};
Events.prototype.beginRegion = function(){
    this.currentRegion = {};
    this.regionIndex++;
};
Events.prototype.addRegionEventListener = function(type, func){
    var event = (type.indexOf('touch') == -1) ? 'on' + type : type;
    this.currentRegion[event] = func;
};
Events.prototype.closeRegion = function(){
    var pos = this.touchPos || this.mousePos;
    if (pos !== null && this.context.isPointInPath(pos.x, pos.y)) {
        if (this.lastRegionIndex != this.regionIndex) {
            this.lastRegionIndex = this.regionIndex;
        }
        // handle onmousedown
        if (this.mouseDown && this.currentRegion.onmousedown !== undefined) {
            this.currentRegion.onmousedown();
            this.mouseDown = false;
        }
        // handle onmouseup
        else if (this.mouseUp && this.currentRegion.onmouseup !== undefined) {
            this.currentRegion.onmouseup();
            this.mouseUp = false;
        }
        // handle onmouseover
        else if (!this.mouseOver && this.regionIndex != this.mouseOverRegionIndex &&
            this.currentRegion.onmouseover !== undefined) {
            this.currentRegion.onmouseover();
            this.mouseOver = true;
            this.mouseOverRegionIndex = this.regionIndex;
        }
        // handle onmousemove
        else if (!this.mouseMove && this.currentRegion.onmousemove !== undefined) {
            this.currentRegion.onmousemove();
            this.mouseMove = true;
        }        
    }
	// handle mouseout condition
        else if (this.currentRegion.onmouseout !== undefined) {
            this.currentRegion.onmouseout();
        }
};
