   
function shadowImage(image) {

    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = image.width;
    offscreenCanvas.height = image.height;
    ctx = offscreenCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    var imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        if (data[i] != 0) data[i] = 0;
        if (data[i+1] != 0) data[i+1] = 0;
        if (data[i+2] != 0) data[i+2] = 0;
        if (data[i+3] != 0) data[i+3] = 128;
    }

    ctx.putImageData(imageData, 0, 0);
    return offscreenCanvas;

}
