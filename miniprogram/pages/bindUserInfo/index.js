// miniprogram/pages/bindUserInfo/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    casid:'',
    name:'',
    // hasUserInfo: false,
    // canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  nameChange(e)
  {
    // console.log(e.detail.value);
    this.data.name = e.detail.value;
    this.setData({
      name:this.data.name
    });
  },
  casidChange(e)
  {
    // console.log(e.detail.value);
    this.data.casid = e.detail.value;
    this.setData({
      casid:this.data.casid
    });
  },
  getUserInfo(e)
  {
    console.log(e.detail.userInfo);
    let pre_data = e.detail.userInfo;
    pre_data.casid = this.data.casid;
    pre_data.name = this.data.name;
    wx.cloud.callFunction({
      name: 'bindUserInfo',
      data: pre_data,
      success: res => {
        console.log('[云函数] [bindUserInfo] 调用成功：', res)
        if(res.result.updateRes)
        {
          wx.showToast({
            icon: 'none',
            title: '操作成功',
            duration:2000
          })
        }else{
          wx.showToast({
            icon: 'none',
            title: res.result.msg,
            duration:2000
          })
        }
        setTimeout(()=>{
          wx.redirectTo({
            url: '/pages/index/index',
          })
        },2000)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败'
        })
        console.error('[云函数] [bindUserInfo] 调用失败：', err)
      }
    })



  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (app.globalData.userInfo)
    {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
        this.data.userInfo = app.globalData.userInfo
        this.hasUserInfo=true
    }
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