import Message from 'tdesign-miniprogram/message';
import {extractUrls} from "../../utils/util";
Page({
  onLoad: function (options) {
  },
  link2ReadMe() {
    wx.navigateTo({
      url: '/pages/readme/index',
    })
  },
  onShareAppMessage(){//点亮发送给朋友
    return {
      title: '一键提取王：' + this.getShareTitleSuffix(),//标题
      path: 'pages/dysp/index?type' +this.data.type //路径
    }
  },
  onShareTimeline() {},
  getShareTitleSuffix() {
    if(this.data.type === 'bl') {
      return 'bilibili视频解析';
    }

    if(this.data.type === 'dy') {
      return 'dy视频解析';
    }

    if(this.data.type === 'xhs') {
      return '视频笔记解析';
    }

    return '解析小助手';
  },

  data: {
    clipboardContent: '',
    type: 1,
    loading: false,
    douyintuji:'',
    // 初始时不设置具体的图片列表，等待外部传入
  },

  // 获取剪切板内容
  getClipboardData:function() {
    wx.getClipboardData({
      success: (res) => {
        this.setData({
          clipboardContent: res.data
        })
        wx.showToast({
          title: '读取成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('读取剪切板失败:', err)
        wx.showToast({
          title: '读取失败',
          icon: 'none'
        })
      }
    })
  },

  onCopyClick: function() {
    this.getClipboardData();
    this.setData({
      douyintuji: this.data.clipboardContent,
    });
  },

  onInputChange(event) {
    this.setData({
      douyintuji: event.detail.value,
    });
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  clearInput() {
    this.setData({
      douyintuji: '',
    });
  },

  onButtonClick() {
    console.log(this.data.douyintuji)
    let path = this.data.douyintuji;
    let valid = true;

    this.setData({
      showResult: false
    });

    if (path === undefined || path === '') {
      valid = false;
    }

    const urls = extractUrls(path);
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
        // url: 'https://api.yiittou.com/short/shortChapterV2',
        url: 'https://www.xize.xyz/short/shortChapterV2',
        method: 'POST',
        data: {
          path: path
        },
        success: (res) => {
          // console.log(JSON.stringify(res))
          if(res?.data?.code === 0) {
            wx.navigateTo({
              url: '/pages/result/index?res='+encodeURIComponent(JSON.stringify(res))
            })
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
            content: '解析失败, 请重试'
          });
          this.setData({
            loading: false
          });
        },
        timeout: () => {
          Message.error({
            context: this,
            offset: [20, 32],
            duration: 2000,
            // single: false, // 打开注释体验多个消息叠加效果
            content: '请求超时，请稍后重试'
          });
          this.setData({
            loading: false
          });
        }
      });
    })
  },

})

