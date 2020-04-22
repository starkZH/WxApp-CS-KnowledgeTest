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
    password:'',
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
  passwordChange(e)
  {
    // console.log(e.detail.value);
    this.data.password = e.detail.value;
    this.setData({
      password:this.data.password
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
  async getUserInfo(e)
  {
    var username = this.data.casid;
    var password = this.data.password;
    let _token_data_={};
    wx.showLoading({
      title: '登陆中'
    })
    await wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'request',
      // 传递给云函数的参数
      data: {
        url:'http://css-exam.dgut.edu.cn/exam-manage/cas/token.php',
        method:'GET'
      }
    }).then(res=>{
      // console.log(res.result)
      console.log(JSON.parse(res.result.re_response.body))
      _token_data_ = JSON.parse(res.result.re_response.body);
    }).catch(err=>{

    })
    let {PHPSESSID,token} = _token_data_;
    // let info = '';
    await wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'request',
      // 传递给云函数的参数
      data: {
        url:'https://cas.dgut.edu.cn/home/Oauth/getToken/appid/cssexam',
        method:'POST',
        params:{
            username: username,
            password: password,
            __token__: token,
            wechat_verify: ''
        },
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': 'PHPSESSID=' + PHPSESSID + '; last_appid=; last_oauth_appid='
        }
      }
    }).then(res=>{
      // console.log(res.result)
      console.log(JSON.parse(res.result.re_response.body))
      _token_data_ = JSON.parse(res.result.re_response.body);
    }).catch(err=>{

    })
    let {code,info} = JSON.parse(_token_data_);
    if(code!=1||!info)
    {
      wx.hideLoading();
      wx.showToast({
        title: '登陆失败',
        icon:'none'
      });
      return ;
    }
    // console.log(info.split('token=')[1]);

    await wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'request',
      // 传递给云函数的参数
      data: {
        url:info,
        method:'GET'
      }
    }).then(res=>{
      console.log(JSON.parse(res.result.re_response.body))
      _token_data_ = JSON.parse(res.result.re_response.body);
    }).catch(err=>{

    })
    let {username:casid,name:name,faculty_title:institute} = _token_data_;
    // console.log(casid)
    // console.log(name)
    // console.log(institute)
    console.log(e.detail.userInfo);
    let pre_data = {
      ...e.detail.userInfo,
      casid:casid,
      name:name,
      institute:institute
    };
    wx.cloud.callFunction({
      name: 'bindUserInfo',
      data: pre_data,
      success: res => {
        console.log('[云函数] [bindUserInfo] 调用成功：', res)
        wx.hideLoading();
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
        wx.hideLoading();
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