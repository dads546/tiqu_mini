Page({
  onShareAppMessage(){//点亮发送给朋友
    return {
      title: '一键提取王：素材小助手',//标题
      path: 'pages/index/index'//路径
    }
  },
  onShareTimeline() {},
  onShareTimeline() {},
  navigateToDytj() {
    wx.navigateTo({
      url: '/pages/dytj/index',
    })
  },
  navigateToDysp() {
    wx.navigateTo({
      url: '/pages/dysp/index?type=dy',
    })
  },
  navigateToBl() {
    wx.navigateTo({
      url: '/pages/dysp/index?type=bl',
    })
  },
  navigateToks() {
    wx.navigateTo({
      url: '/pages/dysp/index?type=ks',
    })
  },
  navigateTotjxhs() {
    wx.navigateTo({
      url: '/pages/dytj/index?type=xhs',
    })
  },
  navigateTospxhs() {
    wx.navigateTo({
      url: '/pages/dysp/index?type=xhs',
    })
  }


})
