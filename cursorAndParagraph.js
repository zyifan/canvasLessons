// Cursor.........................................................
// 光标对象
TextCursor = function (fillStyle, width) {
    this.fillStyle   = fillStyle || 'rgba(0, 0, 0, 0.7)';
    this.width       = width || 2; //关闭宽度
    this.left        = 0; //光标横坐标 x
    this.top         = 0; //光标纵坐标 top
 };
 
 TextCursor.prototype = {
    //  获取字体高度
    getHeight: function (context) {
       var w = context.measureText('W').width;
       return w + w/6;
    },
    // 创建光标方框
    createPath: function (context) {
       context.beginPath();
       context.rect(this.left, this.top,
                    this.width, this.getHeight(context));
    },
    // 绘制光标
    draw: function (context, left, bottom) {
       context.save();
 
       this.left = left;
       this.top = bottom - this.getHeight(context);
 
       this.createPath(context);
 
       context.fillStyle = this.fillStyle;
       context.fill();
          
       context.restore();
    },
    // 擦除光标
    erase: function (context, imageData) {
       context.putImageData(imageData, 0, 0,
          this.left, this.top,
          this.width, this.getHeight(context));
    }
 };
 
 // Text lines.....................................................
//  文本对象
 TextLine = function (x, y) {
    this.text = '';
    this.left = x;
    this.bottom = y;
    this.caret = 0;
 };
 
 TextLine.prototype = {
    //  在当前位置插入最新的text
    insert: function (text) {
       var first = this.text.slice(0, this.caret),
           last = this.text.slice(this.caret);
 
       first += text;
       this.text = first;
       this.text += last;
       this.caret += text.length;
    },
    // 获取当前位置之前字符串的宽度
    getCaretX: function (context) {
       var s = this.text.substring(0, this.caret),
           w = context.measureText(s).width;
 
       return this.left + w;
    },
    // 删除当前位置之前的字符
    removeCharacterBeforeCaret: function () {
       if (this.caret === 0)
          return;
 
       this.text = this.text.substring(0, this.caret-1) +
                   this.text.substring(this.caret); 
 
       this.caret--;
    },
    // 删除最后一个字符
    removeLastCharacter: function () {
       this.text = this.text.slice(0, -1);
    },
    // 获取字符串的宽度
    getWidth: function(context) {
       return context.measureText(this.text).width;
    },
    // 获取字符高度
    getHeight: function (context) {
       var h = context.measureText('W').width;
       return h + h/6;
    },
    // 绘制字符串
    draw: function(context) {
       context.save();
       context.textAlign = 'start';
       context.textBaseline = 'bottom';
        
       context.strokeText(this.text, this.left, this.bottom);
       context.fillText(this.text, this.left, this.bottom);
 
       context.restore();
    },
    // 擦除字符串
    erase: function (context, imageData) {
       context.putImageData(imageData, 0, 0);
    }
 };
 
 // Paragraphs.....................................................
 //  段落
 Paragraph = function (context, left, top, imageData, cursor) {
    this.context = context;
    this.drawingSurface = imageData;
    this.left = left;
    this.top = top;
    this.lines = [];//行数组，单个line是文本对象
    this.activeLine = undefined;
    this.cursor = cursor;
    this.blinkingInterval = undefined;
 };
 
 Paragraph.prototype = {
    // 判断当前坐标是否在段落范围内
    isPointInside: function (loc) {
       var c = this.context;
 
       c.beginPath();
       c.rect(this.left, this.top, this.getWidth(), this.getHeight());
 
       return c.isPointInPath(loc.x, loc.y);
    },
    // 获取段落总高度
    getHeight: function () {
       var h = 0;
 
       this.lines.forEach( function (line) {
          h += line.getHeight(this.context); 
       });
 
       return h;
    },
    // 获取所有行的最大宽度
    getWidth: function () {
       var w = 0,
           widest = 0;
 
       this.lines.forEach( function (line) {
          w = line.getWidth(this.context); 
          if (w > widest) {
             widest = w;
          }
       });
 
       return widest;
    },
    // 分别绘制每一行文本
    draw: function () {
       this.lines.forEach( function (line) {
          line.draw(this.context);
       });
    },
    // 擦除段落
    erase: function (context, imageData) {
       context.putImageData(imageData, 0, 0);
    },
    // 添加line对象到行数组
    addLine: function (line) {
       this.lines.push(line);
       this.activeLine = line;
       this.moveCursor(line.left, line.bottom);// 绘制闪烁光标
    },
    // 插入文本到段落的当前行
    insert: function (text) {
      this.erase(this.context, this.drawingSurface);
      this.activeLine.insert(text);//当前行插入文本
 
     // 获取当前行、当前位置之前的字符串的宽度
      var t = this.activeLine.text.substring(0, this.activeLine.caret),
          w = this.context.measureText(t).width;
       
      this.moveCursor(this.activeLine.left + w, this.activeLine.bottom);// 绘制闪烁光标
 
      this.draw(this.context);
    },
    // 为光标添加闪烁动效
    blinkCursor: function (x, y) {
       var self = this,
           BLINK_OUT = 200,
           BLINK_INTERVAL = 900;
 
       this.blinkingInterval = setInterval( function (e) {
          cursor.erase(context, self.drawingSurface);
       
          setTimeout( function (e) {
             cursor.draw(context, cursor.left,
                         cursor.top + cursor.getHeight(context));
          }, BLINK_OUT);
       }, BLINK_INTERVAL);
    },
    // 将光标移动到鼠标点击位置的字符处
    moveCursorCloseTo: function (x, y) {
       var line = this.getLine(y);//获取y坐标的所在的行
 
       if (line) {
          line.caret = this.getColumn(line, x);//获取x坐标的所在的字符的index位置
          this.activeLine = line;
          this.moveCursor(line.getCaretX(context), line.bottom);//getCaretX获取当前字符串宽度
       }
    },
    // 绘制闪烁光标
    moveCursor: function (x, y) {
       this.cursor.erase(this.context, this.drawingSurface);
       this.cursor.draw(this.context, x, y);
 
       if ( ! this.blinkingInterval)
          this.blinkCursor(x, y);
    },
    // 将当前行的bottom坐标下移一行
    moveLinesDown: function (start) {
       for (var i=start; i < this.lines.length; ++i) {
          line = this.lines[i];
          line.bottom += line.getHeight(this.context);
       }
    },
    // enter换行，添加新的行对象
    newline: function () {
       var textBeforeCursor = this.activeLine.text.substring(0, this.activeLine.caret),
           textAfterCursor = this.activeLine.text.substring(this.activeLine.caret),
           height = this.context.measureText('W').width +
                    this.context.measureText('W').width/6,
           bottom  = this.activeLine.bottom + height,
           activeIndex,
           line;
 
       this.erase(this.context, this.drawingSurface);     // Erase paragraph
       this.activeLine.text = textBeforeCursor;           // Set active line's text
 
       line = new TextLine(this.activeLine.left, bottom); // Create a new line
       line.insert(textAfterCursor);                      // containing text after cursor
 
       activeIndex = this.lines.indexOf(this.activeLine); // Splice in new line
       this.lines.splice(activeIndex+1, 0, line);
 
       this.activeLine = line;                            // New line is active with
       this.activeLine.caret = 0;                         // caret at first character
 
       activeIndex = this.lines.indexOf(this.activeLine); // Starting at the new line...
 
       for(var i=activeIndex+1; i < this.lines.length; ++i) { //...loop over remaining lines
          line = this.lines[i];
          line.bottom += height; // move line down one row
       }
 
       this.draw();
       this.cursor.draw(this.context, this.activeLine.left, this.activeLine.bottom);
    },
    // 判断y坐标位于哪一行文本内
    getLine: function (y) {
       var line;
       
       for (i=0; i < this.lines.length; ++i) {
          line = this.lines[i];
          if (y > line.bottom - line.getHeight(context) &&
              y < line.bottom) {
             return line;
          }
       }
       return undefined;
    },
    // 获取光标所在当前行的的字符的位置index
    getColumn: function (line, x) {
       var found = false,
           before,
           after,
           closest,
           tmpLine,
           column;
 
       tmpLine = new TextLine(line.left, line.bottom);
       tmpLine.insert(line.text);
          
       while ( ! found && tmpLine.text.length > 0) {
          before = tmpLine.left + tmpLine.getWidth(context);//getWidth获取字符串宽度
          tmpLine.removeLastCharacter();//删除最后一个字符
          after = tmpLine.left + tmpLine.getWidth(context);//获取删除一个字符后的字符串宽度
             
          //如何当前位置的字符串长度 小于 x坐标，则这个位置附近的字符为当前字符为closest
          if (after < x) {
             closest = x - after < before - x ? after : before;
             column = closest === before ?
                      tmpLine.text.length + 1 : tmpLine.text.length;
             found = true;
          }
       }
       return column;//返回字符串位置index
    },
    //判断当前行的字符长度是否为空
    activeLineIsOutOfText: function () {
       return this.activeLine.text.length === 0;
    },
    // 判断当前行是否是第一行
    activeLineIsTopLine: function () {
       return this.lines[0] === this.activeLine;
    },
    // textline上移一行
    moveUpOneLine: function () {
       var lastActiveText, line, before, after;
       
       lastActiveLine = this.activeLine;
       lastActiveText = '' + lastActiveLine.text;
             
       activeIndex = this.lines.indexOf(this.activeLine);
       this.activeLine = this.lines[activeIndex - 1];
       this.activeLine.caret = this.activeLine.text.length;
 
       this.lines.splice(activeIndex, 1);
             
       this.moveCursor(
          this.activeLine.left + this.activeLine.getWidth(this.context),
          this.activeLine.bottom);
 
       this.activeLine.text += lastActiveText;
 
       for (var i=activeIndex; i < this.lines.length; ++i) {
          line = this.lines[i];
          line.bottom -= line.getHeight(this.context);
       }
    },
    //删除一个字符
    backspace: function () {
       var lastActiveLine,
           activeIndex,
           t, w;
 
       this.context.save();
        
       // 如果不是第一行，则上移一行
       if (this.activeLine.caret === 0) {
          if ( ! this.activeLineIsTopLine()) {
             this.erase(this.context, this.drawingSurface);
             this.moveUpOneLine();
             this.draw();
          }
       } else {  // active line has text
          this.context.fillStyle = fillStyleSelect.value;
          this.context.strokeStyle = strokeStyleSelect.value;
 
          this.erase(this.context, this.drawingSurface);
          this.activeLine.removeCharacterBeforeCaret();
 
          t = this.activeLine.text.slice(0, this.activeLine.caret),
          w = this.context.measureText(t).width;
       
          this.moveCursor(this.activeLine.left + w,
                      this.activeLine.bottom);
 
          this.draw(this.context);
 
          context.restore();
       }
    }
 };