import Message from 'tdesign-miniprogram/message/index';

Page({
  data: {
    marquee1: {
      speed: 80,
      loop: -1,
      delay: -50,
    },
    imageProps:{
      mode: 'aspectFit'
    },
    inputValue: '',
    current: 0,
    autoplay: false,
    navigation: { type: 'fraction' },
    paginationPosition: 'bottom-right',
    duration: 500,
    interval: 5000,
    showResult: false,
    loading: false,
    douyintuji:'',
    // 初始时不设置具体的图片列表，等待外部传入
    imageList: [],
    leftColumnImages: [],
    rightColumnImages: [],
  },
  onInputChange(event) {
    this.setData({
      douyintuji: event.detail.value,
    });
  },
    // 接收外部传入的图片列表并进行处理
  setImageList(list) {
    this.setData({
      imageList: list,
      leftColumnImages: [],
      rightColumnImages: [],
    });
    if (list.length > 0) {

      for (let i = 0; i < list.length; i++) {
        if (i % 2 === 0) {
          this.data.leftColumnImages.push(list[i]);
        } else {
          this.data.rightColumnImages.push(list[i]);
        }
      }
      this.setData({
        leftColumnImages: this.data.leftColumnImages,
        rightColumnImages: this.data.rightColumnImages,
        showResult: true
      });
    }
  },

  onSwiperChange (event) {
    this.setData({
      current: event.detail.current
    });
  },

  previewImage(event) {
    // console.log('current', current);
    // console.log('imageList',  this.data.imageList);
    wx.previewImage({
      current: this.data.imageList[this.data.current],
      urls: this.data.imageList,
    });
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let match;
    const urls = [];
    while ((match = urlRegex.exec(text))!== null) {
      urls.push(match[0]);
    }
    return urls;
  },

  clearInput() {
    this.setData({
      douyintuji: '',
    });
  },

  onButtonClick() {
    let path = this.data.douyintuji;
    let valid = true;

    this.setData({
      showResult: false
    });
    
    if(path === undefined || path === '') {
      valid = false;
    }


    const urls = this.extractUrls(path);
    if(urls[0] === undefined) {
      valid = false;
    }else {
      path = urls[0];
    }

    if(!valid) {
      Message.info({
        context: this,
        offset: [20, 32],
        duration: 2000,
        // single: false, // 打开注释体验多个消息叠加效果
        content: '请输入有效的链接地址',
      });
      return;
    }
    this.setData({
      current: 0,
      loading: true
    });

    this.sleep(1000).then(()=> {
      wx.request({
        url: 'https://releaseapi10.yiittou.com/short/shortChapterV2',
        method: 'POST',
        data: {
          path: path
        },
        success: (res) => {
          if(res?.data?.code === 0) {
            this.setImageList(res?.data?.data?.pictures)
          }else {
            Message.error({
              context: this,
              offset: [20, 32],
              duration: 2000,
              // single: false, // 打开注释体验多个消息叠加效果
              content: '解析失败,' + res?.data?.errorMsg,
            });
          }
          this.setData({
            loading: false
          });
        },
        fail: () => {
          Message.error({
            context: this,
            offset: [20, 32],
            duration: 2000,
            // single: false, // 打开注释体验多个消息叠加效果
            content: '解析失败，请稍后重试',
          });
          this.setData({
            loading: false
          });
        }
      });
    })
  },

  saveToAlbum () {
    wx.getSetting({
      success: (res) => {
        console.log('获取权限状态', res);
        if (!res.authSetting['scope.writePhotosAlbum']) {
          console.log('need permission');
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.batchSaveImagesToAlbum(this.data.imageList);
            },
            fail: () => {
              wx.showModal({
                title: '提示',
                content: '需要授权才能保存图片到相册, 否则请点击图片预览长按进行保存',
                showCancel: true,
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (resSetting) => {
                        if (resSetting.authSetting['scope.writePhotosAlbum']) {
                        } else {
                          wx.showModal({
                            title: '提示',
                            content: '如不打开相册授权，请点击图片预览长按进行保存',
                          })
                        }
                      },
                      fail: (err) => {
                        console.log(err);
                      },
                    });
                  }
                },
              });
            }
          });
        }else {
          this.batchSaveImagesToAlbum(this.data.imageList);
        }
      },
      fail: (err) => {
        console.log('获取权限状态失败', err);
      }
    });
  },
  saveImageToAlbum(imageUrl) {
    console.log(imageUrl);
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: imageUrl,
        success: function(res) {
          if (res.statusCode === 200) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function() {
                resolve();
              },
              fail: function(err) {
                reject(err);
              }
            });
          } else {
            reject(new Error('下载图片失败'));
          }
        },
        fail: function(err) {
          reject(err);
        }
      });
    });
  },
  async batchSaveImagesToAlbum(imageUrls) {
    try {
      await Promise.all(imageUrls.map(imageUrl => this.saveImageToAlbum(imageUrl)));
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } catch (error) {
      console.log(JSON.stringify(error))
      wx.showToast({
        title: '保存失败' + JSON.stringify(error),
        icon: 'none'
      });
    }
  }
})
