const swiperList = [
  './4.jpeg',
  './5.jpeg'
];

Page({
  data: {
    images: [
      './4.jpeg',
      './5.jpeg'
    ]
  },
  
  onSwiperChange(event) {
    console.log('Current swiper index:', event.detail.current);
  },

  onImageTap(event) {
    // const { current } = event.detail;
    // wx.previewImage({
    //   current: this.data.images[current], // 当前显示的图片
    //   urls: this.data.images // 需要预览的图片链接列表
    // });
  }
})
