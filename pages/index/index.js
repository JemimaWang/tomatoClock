//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data:{
    time:'5',//滑动条的数值，以分钟为单位，默认为5
    mTime:300000,//以毫秒为单位
    timeStr:'',
    rate:'',
    clockShow:false,
    clockHeight:'0',
    cateActive:'0',
    returnShow:false,//任务完成，显示返回
    pauseShow:true,//显示暂停
    showCancelContinue:false,//显示继续和终止
    timer:null,
    cateArr:[
      {icon:'work',text:'办公'},
      {icon:'ABCword',text:'单词'},
      {icon:'read',text:'阅读'},
      {icon:'write',text:'写作'},
      {icon:'sports',text:'运动'},
      {icon:'coding',text:'编程'}
    ],
    cateActive:'0',//选中的任务，默认为第一个任务
  
  },
  onLoad: function () {//页面打开时执行的操作
    //每个手机的屏幕宽度是750rpx 分辨率不一致
    //所有手机在小程序中的宽:真实宽度=小程序在页面中的高度:真实高度
    var res = wx.getSystemInfoSync();
    var rate = 750/res.windowWidth;
    this.setData({
      rate:rate,
      clockHeight : rate*res.windowHeight
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  slideChange:function(e){
    //当滑动条变化时，获得滑动条的value
    this.setData({
      time:e.detail.value
    })
  },
  clickCate:function(e){
    //当点击到该分类时，将index改为当前点击的分类
    this.setData({
      cateActive:e.currentTarget.dataset.index
    })
  },
  start:function(e){
    //当按钮被点击时，设置clockShow的值为true
    this.setData({
      clockShow:true,
      mTime:this.data.time*60*1000,
      timeStr:parseInt(this.data.time)>10?this.data.time+':00':'0'+this.data.time+':00'
    })
    this.drawBg();
    this.drawActive();
  },
  drawBg:function(){
    var lineWidth = 6/this.data.rate;//px
    var ctx = wx.createCanvasContext('progress_bg');//不需要'#'
    ctx.setLineWidth(lineWidth);
    ctx.setStrokeStyle('white');
    ctx.setLineCap('round');
    ctx.beginPath();
    ctx.arc(400/this.data.rate/2,400/this.data.rate/2,400/this.data.rate/2-lineWidth,0,2*Math.PI,false);
    ctx.stroke();
    ctx.draw();
  },

  drawActive:function(){
    //设置定时器，一百毫秒执行一次
    //1.5PI-3.5PI
    //一百毫秒执行一次，要在mTime时间内画一整个圆
    //比如300000毫秒（5分钟）画一整个圆，要进行300000/100=3000次画，每次画的角度angle=2PI/3000
    //angle=2/(mTime/100) 每次执行的角度
    //sum_angle=1.5+200/mTime
    var this2 = this;
    var timer = setInterval(function(){
      
      var angle = 1.5 + 2*(this2.data.time*60*1000 - this2.data.mTime)/
      (this2.data.time*60*1000);
      var currentTime = this2.data.mTime - 100;
      this2.setData({
        mTime:currentTime
      });
      if(angle<3.5){
        var minute = parseInt(currentTime/1000/60);
        var second = parseInt(currentTime/1000%60);
        var minuteStr = '';
        var secondStr = '';
        if(minute>=10)
          minuteStr = ''+minute;
        else if(minute>1)
          minuteStr = '0'+minute;
        else
          minuteStr = '00';
        if(second>=10)
          secondStr = ''+second;
        else if(second>1)
          secondStr = '0'+second;
        else
          secondStr = '00';
        this2.setData({
          timeStr:minuteStr+':'+secondStr
        });
        var lineWidth = 6/this2.data.rate;//px
        var ctx = wx.createCanvasContext('progress_active');//不需要'#'
        ctx.setLineWidth(lineWidth);
        ctx.setStrokeStyle('#E7624F');
        ctx.setLineCap('round');
        ctx.beginPath();
        //计算角度，3点为0，6点为0.5，9点为1，12点为1.5
        ctx.arc(400/this2.data.rate/2,400/this2.data.rate/2,400/this2.data.rate/2-lineWidth,1.5*Math.PI,angle*Math.PI,false);
        ctx.stroke();
        ctx.draw();
      }else{
        var logs = wx.getStorageSync('logs')||[];
        logs.unshift({
          //利用util的工具类
          date:util.formatTime(new Date),
          //存入计时的类型
          cate:this2.data.cateActive,
          //存入计时的时长
          time:this2.data.time
        });
        //把记录塞到logs缓存中
        wx.setStorageSync('logs', logs);
        clearInterval(timer); 
        //时钟到达，显示返回按钮
        this2.setData({
          timeStr:'00:00',
          returnShow:true,
          pauseShow:false,
          showCancelContinue:false
        });
        
      }
    },100); 
    this2.setData({
      timer:timer
    })
  },

  pause:function(){
    clearInterval(this.data.timer);
    this.setData({
      pauseShow:false,
      showCancelContinue:true,
      returnShow:false
    })
  },
  continue:function(){
    this.drawActive();
    this.setData({
      pauseShow:true,
      showCancelContinue:false,
      returnShow:false
    })
  },
  cancel:function(){
    clearInterval(this.data.timer);
    this.setData({
      pauseShow:true,
      showCancelContinue:false,
      returnShow:false,
      clockShow:false
    })
  },
  return:function(){
    clearInterval(this.data.timer);
    this.setData({
      pauseShow:true,
      showCancelContinue:false,
      returnShow:false,
      clockShow:false
    })
  }


})
