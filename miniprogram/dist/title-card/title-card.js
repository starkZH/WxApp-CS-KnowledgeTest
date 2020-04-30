// dist/cards/title-card/title-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    img: String,
    title: String,
    context: String,
    total_people: String,
    openTime: String,
    endTime: String,
    status:Number,
    exam_id:String,
    isShowBtns: {
      type: Boolean,
      value: false,
    },
    likeNumber: Number,
    isLiked: {
      type: Boolean,
      value: false,
      observer: function () { this.setData({ isLiked: this.properties.isLiked }); }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isLiked: false,
    statusText:{
      1:{text:'未开始',tag_type:'primary'},
      2:{text:'进行中',tag_type:'success'},
      3:{text:'已截止',tag_type:'success'}
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goPage(e){
      // console.log(e);
      // console.log(this.data.exam_id);
      // return ;
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
              wx.navigateTo({
                url: '/pages/bindUserInfo/index',
              })
            },500)
          }else{
            wx.navigateTo({
              url: '/pages/exam/index?exam_id='+this.data.exam_id,
            })
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
    }
    // handleLike() {
    //   this.setData({ isLiked: !this.data.isLiked });
    //   this.triggerEvent('like');
    // },
  }
})
