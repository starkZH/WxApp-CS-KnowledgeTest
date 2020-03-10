// miniprogram/pages/exam/result/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    userInfo:{},
    exam_id:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.exam_id = options.exam_id;
    this.setData({
      exam_id:this.data.exam_id
    });

    var that = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          console.log('app')
          wx.getUserInfo({
            success: res => {
              // console.log(res)
              // 可以将 res 发送给后台解码出 unionId
              that.data.userInfo = res.userInfo
              that.setData({
                userInfo:that.data.userInfo
              });
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    // this.data.userInfo = app.globalData.userInfo;
    // console.log(this.data.userInfo)
    // this.setData({
    //   userInfo:this.data.userInfo
    // });
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '获取中',
    })
    wx.cloud.callFunction({
      name: 'getRank',
      data: {
        exam_id:this.data.exam_id
      },
      success: res => {
        console.log(res)
        this.data.rank_list = res.result.data;
        this.setData({
          rank_list:this.data.rank_list
        });
        wx.hideLoading()
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [getExam] 调用失败：', err)
        wx.hideLoading()
      }
    })
    

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