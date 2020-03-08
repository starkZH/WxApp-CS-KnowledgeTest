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
          this.data.exam_data = res.result.data;
          this.data.exam_id = options.exam_id;
          this.data.exam_data.openTime = new Date(this.data.exam_data.openTime).toLocaleString();
          this.data.exam_data.endTime = new Date(this.data.exam_data.endTime).toLocaleString();
          this.setData({
            exam_id:this.data.exam_id,
            exam_data:this.data.exam_data,
            showButton:true
          });
          wx.hideLoading()
          // wx.showModal({
          //   title: '获取成功',
          //   content: '答题加油',
          //   showCancel: false,
          // })
          // wx.showToast({
          //   title: '发送成功，请返回微信主界面查看',
          // })
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
    // if(!this.checkCanStart())
    // {
    //   console.log('cannot')
    // }
    wx.navigateTo({
      url: '/pages/exam/answer/index?exam_id='+this.data.exam_id,
    })
  },
  checkCanStart()
  {
    // console.log(this.data.exam_data.openTime);
    // console.log(this.data.exam_data.endTime);
    // console.log((new Date()).toLocaleString());
    if(this.data.exam_data.openTime>(new Date()).toLocaleString())
    {
      wx.showToast({
        title: '答题尚未未开放，请留意开放时间',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
    if(this.data.exam_data.endTime<(new Date()).toLocaleString())
    {
      wx.showToast({
        title: '本次答题已结束，感谢您的关注',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return false;
    }
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