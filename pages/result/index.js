// 在页面的js文件中
let videoAd = null
Page({

    onLoad: function (options) {
        // 若在开发者工具中无法预览广告，请切换开发者工具中的基础库版本
        // 在页面中定义激励视频广告

        // 在页面onLoad回调事件中创建激励视频广告实例
        if (wx.createRewardedVideoAd) {
            videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-b4465dc873f89a41'
            })

            videoAd.onClose((res) => {
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                    this.setData({
                        rewardNum: this.data.rewardNum+1
                    })
                }
            })


            videoAd.onLoad(() => {
                console.log('激励视频 广告加载成功 videoAd')

            })
            videoAd.onError((err) => {
                console.error('加载失败 videoAd', err)
            })

        }


        let res = JSON.parse(decodeURIComponent(options.res))
        //是视频
        console.log(res?.data?.data?.type)
        if(res?.data?.data?.type === 2) {
            this.setVideoUrl(res?.data?.data?.videoUrl, res?.data?.data?.downloadUrl);
        }else {
            this.setImageList(res?.data?.data?.pictures)
        }
    },

    data: {
        marquee1: {
            speed: 80,
            loop: -1,
            delay: -50,
        },
        rewardNum:0,
        showResult: true,
        resultType: 0,
        percentage: 0,
        downloadUrl: '',
        showUrl: '',
        imageList: ["https://tiqumini.oss-cn-beijing.aliyuncs.com/ddc7b4ad-6bf1-41d4-a962-e3e730812b61.jpeg", "https://tiqumini.oss-cn-beijing.aliyuncs.com/15287e9b-68c3-4944-bbc9-509a93392f4d.jpeg"],
        current: 0,
        autoplay: false,
        navigation: { type: 'fraction' },
        paginationPosition: 'bottom-right',
        duration: 500,
        interval: 5000,
        imageProps:{
            mode: 'aspectFit'
        },
    },

    setVideoUrl(videoUrl, downloadUrl) {
        this.setData({
            showUrl: videoUrl,
            downloadUrl: downloadUrl,
            showResult: true,
            resultType: 2
        });
    },

    setImageList(list) {
        this.setData({
            imageList: list,
            showResult: true,
            resultType: 1
        });
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

    setDownloadUrl(url) {
        this.setData({
            downloadUrl: url,
            showResult: true
        });
    },

    copyDownloadLink() {
        let that = this;
        if (this.data.rewardNum >0){
            wx.setClipboardData({
                data: this.data.downloadUrl,
                success() {
                    wx.showToast({
                        title: '已复制到剪切板',
                        icon: 'success'
                    });
                    that.setData({
                        rewardNum: this.data.rewardNum-1
                    })
                },
                fail(err) {
                    wx.showToast({
                        title: '复制失败',
                        icon: 'none'
                    });
                    console.log(err);
                }
            });
        }else {
            // 用户触发广告后，显示激励视频广告
            if (videoAd) {
                videoAd.show().catch(() => {
                    // 失败重试
                    videoAd.load()
                        .then(() => videoAd.show())
                        .catch(err => {
                            console.error('激励视频 广告显示失败', err)
                        })
                })
            }
        }
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
                        fail(err) {
                            console.log(JSON.stringify(err));
                            // 权限申请失败，可以提示用户手动开启权限
                            wx.showModal({
                                title: '提示',
                                content: '需要获取保存到相册的权限才能保存视频，否则请复制链接到浏览器中下载',
                                showCancel: true,
                                success(res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                            success: (resSetting) => {
                                                if (resSetting.authSetting['scope.writePhotosAlbum']) {
                                                    console.log('success')
                                                } else {
                                                    wx.showModal({
                                                        title: '提示',
                                                        content: '如不打开相册授权，请复制链接到浏览器中下载',
                                                    })
                                                }
                                            },
                                            fail: (err) => {
                                                console.log(err);
                                            },
                                        });
                                    } else if (res.cancel) {
                                        // 用户取消了，可根据情况处理
                                    }
                                },
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

    saveVideoToAlbum (url) {
        return new Promise((resolve, reject) => {
            const self = this;
            const task = wx.downloadFile({
                url: url,
                success: function(res) {
                    if (res.statusCode === 200) {
                        wx.saveVideoToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: function() {
                                resolve();
                            },
                            fail: function(err) {
                                reject(err);
                                wx.showToast({
                                    title: '该视频不支持保存相册，请复制下载链接打开后自行下载',
                                    icon: 'none'
                                });
                            }
                        });
                    } else {
                        reject();
                        wx.showToast({
                            title: '该视频不支持保存相册，请复制下载链接打开后自行下载',
                            icon: 'none'
                        });
                    }
                },
                fail: function(err) {
                    reject(err);
                    wx.showToast({
                        title: '该视频不支持保存相册，请复制下载链接打开后自行下载',
                        icon: 'none'
                    });
                },
            });
            task.onProgressUpdate((res)=> {
                if (res.progress === 100) {
                    self.setData({
                        percentage: 0
                    })
                } else {
                    self.setData({
                        percentage: res.progress,
                    })
                }
            })
        });
    },

    saveToAlbum () {
        if (this.data.rewardNum >0) {
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
                }
            });
        }
        else {
            if (videoAd) {
                videoAd.show().catch(() => {
                    // 失败重试
                    videoAd.load()
                        .then(() => videoAd.show())
                        .catch(err => {
                            console.error('激励视频 广告显示失败', err)
                        })
                })
            }
        }
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
                        wx.showToast({
                            title: '保存失败：请点击图片预览长按进行保存',
                            icon: 'none'
                        });
                    }
                },
                fail: function(err) {
                    reject(err);
                    wx.showToast({
                        title: '保存失败：请点击图片预览长按进行保存',
                        icon: 'none'
                    });
                }
            });
        });
    },
    async batchSaveImagesToAlbum(imageUrls) {
        try {
            await Promise.all(imageUrls.map(imageUrl => this.saveImageToAlbum(imageUrl)));
            this.setData({
                rewardNum: this.data.rewardNum-1
            })
            wx.showToast({
                title: '保存成功',
                icon: 'success'
            });
        } catch (error) {
            console.log(JSON.stringify(error))
            wx.showToast({
                title: '保存失败：请点击图片预览长按进行保存',
                icon: 'none'
            });
        }
    }
  
})
