import Message from 'tdesign-miniprogram/message/index';

Page({
  data: {
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
  
  previewImage(event) {
    const current = event.currentTarget.dataset.src;
    console.log('current', current);
    console.log('imageList',  this.data.imageList);
    wx.previewImage({
      current: current,
      urls: this.data.imageList,
    });
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  onButtonClick() {
    const path = this.data.douyintuji;
    let valid = true;

    this.setData({
      showResult: false
    });
    
    if(path === undefined || path === '') {
      valid = false;
    }

    if(!(path.indexOf("https") === 0)) {
      valid = false;
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
          // console.log(JSON.stringify(res))
          this.setImageList(res?.data.data);
          this.setData({
            loading: false
          });
        },
        fail: (error) => {
          Message.error({
            context: this,
            offset: [20, 32],
            duration: 2000,
            // single: false, // 打开注释体验多个消息叠加效果
            content: '解析失败，请确实地址正确',
          });
          this.setData({
            loading: false
          });
        }
      });
    })
  },

  saveToAlbum () {
    console.log('in');
    wx.getSetting({
      success: (res) => {
        console.log('获取权限状态', res);
        if (!res.authSetting['scope.writePhotosAlbum']) {
          console.log('need permission');
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: ()=> {
              this.batchSaveImagesToAlbum(this.data.imageList);
            },
            fail: ()=> {
              // 用户拒绝授权，提示用户开启权限
              wx.showModal({
                title: '提示',
                content: '需要授权才能保存图片到相册，请在设置中开启相册写入权限。',
                showCancel: false
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
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
})
