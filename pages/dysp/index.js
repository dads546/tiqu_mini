import Message from 'tdesign-miniprogram/message/index';

Page({
  data: {
    marquee1: {
      speed: 80,
      loop: -1,
      delay: -50,
    },
    showResult: false,
    loading: false,
    douyintuji:'',
    // 初始时不设置具体的图片列表，等待外部传入
    downloadUrl: '',
  },
  onInputChange(event) {
    this.setData({
      douyintuji: event.detail.value,
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

  setVideoUrl(url) {
    this.setData({
      downloadUrl: url,
      showResult: true
    });
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
          this.setVideoUrl(res?.data?.data?.downloadUrl);
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
            content: '解析失败,'+ res?.data?.errorMsg,
          });
          this.setData({
            loading: false
          });
        }
      });
    })
  },

  copyDownloadLink() {
    wx.setClipboardData({
      data: this.data.downloadUrl,
      success() {
        wx.showToast({
          title: '已复制到剪切板',
          icon: 'success'
        });
      },
      fail(err) {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
        console.log(err);
      }
    });
  },

  saveVideo () {
    // 先检查是否有保存到相册的权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 没有权限，申请权限
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              // 权限申请成功，执行保存视频的操作
              this.saveVideoToAlbum(this.data.downloadUrl);
            },
            fail() {
              // 权限申请失败，可以提示用户手动开启权限
              wx.showModal({
                title: '提示',
                content: '需要获取保存到相册的权限才能保存视频，请在设置中开启。',
                showCancel: false
              });
            }
          });
        } else {
          // 已有权限，直接执行保存视频的操作
          this.saveVideoToAlbum(this.data.downloadUrl);
        }
      },

    });
  },

  saveVideoToAlbum: (url) => {

    console.log(url);
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: url,
        success: function(res) {
          if (res.statusCode === 200) {
            wx.saveVideoToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function() {
                resolve();
              },
              fail: function(err) {
                reject(new Error('如下载视频失败，请复制下载链接到浏览器中自行下载'));
              }
            });
          } else {
            reject(new Error('如下载视频失败，请复制下载链接到浏览器中自行下载'));
          }
        },
        fail: function(err) {
          reject(err);
        }
      });
    });
  }

})

