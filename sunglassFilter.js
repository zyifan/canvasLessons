onmessage = function (event) {
    var imagedata = event.data,

        data = imagedata.data,
        length = data.length,
        width = imagedata.width;
 
    for (i=0; i < length; ++i) {
       // 如果不是透明度
       if ((i+1) % 4 != 0) { 
          // 如果是一行中的最后一组数据，即最后的一个像素，则复制前一个像素的数据
          if ((i+4) % (width*4) == 0) { 
             data[i] = data[i-4];
             data[i+1] = data[i-3];
             data[i+2] = data[i-2];
             data[i+3] = data[i-1];
             i+=4;
          } else {
            //墨镜算法：2*curDataPixel - 3*nextPixel/2
            data[i] = 2*data[i] - data[i+4] - 0.5*data[i+4];
          }
       }
    }
    
    // 对imagedata进行墨镜处理之后，将imagedata发送回去
    postMessage(imagedata);
 };