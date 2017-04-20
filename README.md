# 流利说在线录音打分网页版SDK介绍
网页版在线打分 sdk 支持对 readaloud 题型进行打分，录音结束后会提供打分报告，并返回音频blob数据(wav格式)。

运行环境：Chrome。由于chrome对getUserMedia方法的限制，需要在https环境下使用。

## 使用方法
### 引入sdk
在需要调用JS接口的页面引入如下JS文件:  https://cdn.llscdn.com/hybrid/lls-web-recorder/llsRecorder-0.0.1.js

### 初始化
```
  llsRecorder.init({
    secret: 'xx',
    appId: 'xx'
  });
```

### 录音
```
  llsRecorder.startRecord({ // 参数为题目信息，目前支持readaloud题型
    type: 'readaloud', // 题型
    reftext: 'Hope is a good thing' // 句子内容
  });
```

### 停止录音
```
  llsRecorder.stopRecord({
    getResult: function(resp) {
      if (resp.success) { // 打分成功
        var report = resp.report; // 打分报告
      } else {
        // 打分失败，可根据resp.status判断失败原因
      }
    },
    getAudio: function(blob) { // 返回音频数据
      var audioUrl = window.URL.createObjectURL(blob);
    }
  });
```
### 重新上传录音
```
  llsRecorder.reupload({
    audioBlob: <audioBlob>, // 必填，需要重传的音频
    question: , // 必填，题目
    getResult: function(resp) { // 打分报告回调
      if (resp.success) { // 打分成功
        var report = resp.report; // 打分报告
      } else {
        // 打分失败，可根据resp.status判断失败原因
      }
    }
  });
```

## 打分报告信息
```
{
    "fluency": 99,
    "integrity": 100,
    "locale": "en",
    "overall": 100,
    "pronunciation": 100,
    "version": "2.1.0",
    "words": [
        {
            "scores": {
                "pronunciation": 100
            },
            "word": "i"
        },
        ...
    ]
}
```

## 打分失败原因
```
-1 - 参数有误
-20 - 认证失败
-30 - 请求过于频繁
-31 - 余额不足
-41 - 排队超时(超过15秒)
-99 - 计算资源不可用
-100 - 未知错误
```
