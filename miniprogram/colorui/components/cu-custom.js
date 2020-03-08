const app = getApp();
Component({
  /**
   * 组件的一些选项
   */
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的对外属性
   */
  properties: {
    bgColor: {
      type: String,
      default: ''
    }, 
    isCustom: {
      type: [Boolean, String],
      default: false
    },
    isBack: {
      type: [Boolean, String],
      default: false
    },
    bgImage: {
      type: String,
      default: ''
    },
    CustomBar_status:{
      type: [Boolean, String],
      default: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    // CustomBar: 50,
    Custom: app.globalData.Custom
  },
  /**
   * 组件的方法列表
   */
  attached:function(e)
  {
    // console.log(this.properties.CustomBar_status)
    if(this.properties.CustomBar_status==true||this.properties.CustomBar_status=="true")
    {
      this.data.CustomBar=50;
      this.setData({
        CustomBar:50
      })
    }
  },
  methods: {
    
    BackPage() {
      wx.navigateBack({
        delta: 1
      });
    },
    toHome(){
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  }
})