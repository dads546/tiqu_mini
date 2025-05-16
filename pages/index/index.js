Page({
  onShareAppMessage(){//点亮发送给朋友
    return {
      title: '一键提取王：素材小助手',//标题
      path: 'pages/index/index'//路径
    }
  },
  onShareTimeline() {},
  onShareTimeline() {},
  switchBar: function(e) {
    console.log(e.currentTarget.dataset.url)
    //跳转到指定tab，不支持参数传递。 navigateTo不能跳转tabbar里的路径，要使用navigateTo到页面后，在重定向到tab的路径
    wx.switchTab({
      url: e.currentTarget.dataset.url,
    })
  }
})
