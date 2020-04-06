// miniprogram/pages/exam/index.js
var util = require('../../utils/utils.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    cardCur: 0,
    showButton:false,
    swiperList: [{
      id: 0,
        type: 'image',
        // url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84001.jpg',
        url: '../../images/wadt.png',
    }],
    exam_id:"",
    exam_data:{}

  },
  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  toResultPage()
  {
    wx.navigateTo({
      url: '/pages/exam/result/index?exam_id='+this.data.exam_id,
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log('Ready|exam_id:'+options.exam_id);
      wx.showLoading({title: '加载中', icon: 'loading', duration: 10000});
      wx.cloud.callFunction({
        name: 'getExam',
        data: {
          exam_id:options.exam_id
        },
        success: res => {
          console.warn('[云函数] [getExam] 调用成功：', res)
          console.log(res)
          if(res.result.errcode&&res.result.errcode==1)
          {
            wx.hideLoading();
            wx.navigateBack();
            wx.showToast({
              icon: 'none',
              title: '该测试尚未开放',
            })
            return ;
          }
          this.data.exam_data = res.result.data;
          let endtime = this.data.exam_data.endTime;
          this.data.exam_id = options.exam_id;
          this.data.exam_data.openTime = util.formatTime(new Date(this.data.exam_data.openTime));
          this.data.exam_data.endTime = util.formatTime(new Date(endtime));
          this.data.exam_data.deadline = util.formatTime(new Date(new Date(endtime).getTime()-1800000));
          this.setData({
            exam_id:this.data.exam_id,
            exam_data:this.data.exam_data,
            showButton:true,
          });
          let img_id = this.data.exam_data.img_id;
          if(img_id)
          {
            this.data.swiperList.push({
              id:1,
              type: 'image',
              url: img_id,
            });
            this.setData({
              swiperList:this.data.swiperList
            });
          }
          wx.hideLoading()
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '调用失败',
          })
          console.error('[云函数] [getExam] 调用失败：', err)
        }
      })
  },
  startAnswer:function(e)
  {
    console.log(e)
    this.checkCanStart().then((res)=>{
      if(res)
      {
        wx.navigateTo({
          url: '/pages/exam/answer/index?exam_id='+this.data.exam_id,
        })
      }
    });
    return ;
    // if(!this.checkCanStart())
    // {
    //   return ;
    // }
    // wx.navigateTo({
    //   url: '/pages/exam/answer/index?exam_id='+this.data.exam_id,
    // })
  },
  async checkCanStart()
  {
    // console.log(this.data.exam_data.openTime);
    // console.log(this.data.exam_data.deadline);
    // console.log((new Date()).toLocaleString());
    var re = {};
    await wx.cloud.callFunction({
      name: 'checkSubmited',
      data: {
        exam_id: this.data.exam_id
      }}).then(res=>{
        wx.hideLoading();
        console.log('[云函数] [checkSubmited] 调用成功：', res);
        re = res
      }).catch(res=>{
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        });
        console.error('[云函数] [checkSubmited] 调用失败：', err);
        re = res;
      });
    if(re.result.data)
    {
      wx.showToast({
        title: '你已完成答题',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      setTimeout(()=>{
        wx.navigateTo({
          url: '/pages/exam/result/index?exam_id='+this.data.exam_id,
        })
      },1500)
      return false;
    }
    if(this.data.exam_data.openTime>util.formatTime(new Date()))
    {
      wx.showToast({
        title: '答题尚未未开放，请留意开放时间',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
    if(this.data.exam_data.deadline<util.formatTime(new Date()))
    {
      wx.showToast({
        title: '本次答题已结束，感谢您的关注',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
    // return false;
    return true;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.cloud.callFunction({
      name: 'checkBinded',
      data: {},
      success: res => {
        console.log('[云函数] [checkBinded] 调用成功：', res)
        if(!res.result.status)
        {
          wx.showToast({
            icon: 'none',
            title: '请先进行学生认证',
            mask:true
          })
          setTimeout(()=>{
            wx.redirectTo({
              url: '/pages/bindUserInfo/index',
            })
          },1000)
        }
        
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败'
        })
        console.error('[云函数] [checkBinded] 调用失败：', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})