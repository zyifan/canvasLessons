util.getPosition = (event) =>{
    var e = event || window.event;
    return {
        x: e.pageX || e.clientX + document.documentElement.scrollLeft || document.body.scrollLeft,
        y: e.pageY || e.clientY + document.documentElement.scrollTop || document.body.scrollTop
    };
};
util.windowToCanvas = (canvas,x,y)=>{
    var bbox = canvas.getBoundingClientRect();
    return {
        x: x - bbox.left * (canvas.width /bbox.width), //将x坐标，根据 (canvas视图宽度/canvas实际宽度) 比例进行缩放
        y: y - bbox.top * (canvas.height /bbox.height) //将y坐标，根据 (canvas视图高度/canvas实际高度) 比例进行缩放
    }
 }