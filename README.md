# 流利说在线录音打分网页版SDK介绍
网页版在线打分 sdk 支持对 readaloud 题型进行打分，录音结束后会提供打分报告，并返回音频blob数据(wav格式)。

运行环境：Chrome。由于chrome对getUserMedia方法的限制，需要在https环境下使用。

## DEMO
https://hybrid.liulishuo.com/lls-web-recorder/web.html

## 使用方法
### 引入sdk
在需要调用JS接口的页面引入如下JS文件:  https://cdn.llscdn.com/hybrid/lls-web-recorder/llsRecorder-v1.0.1.js

### 初始化
传入事先约定的appId和密码(secret)。
```
  llsRecorder.init({
    secret: 'xx',
    appId: 'xx'
  });
```

### 录音
需要传入题目，获得打分报告的回调和获得音频的回调。

由于SDK是通过边录制边上传的形式上传音频，若验证失败，SDK会立即停止录音（无论用户是否调用`stopRecord`），
并返回status= -20(验证失败)的打分报告。

| 参数名       | 类型    |  描述  |
|-------------|--------|--------|
|question|questionParam|不得为空|
|getResult|function(resp)|获得打分报告后的回调函数, 不得为空|
|getAudio|function(blob)|录音上传成功的回调，返回blob音频数据|

#### questionParam
| key         | 类型      | 说明       | 必填|
|-------------|----------|-----------|-----|
|type|string|题型，目前只支持'readaloud'|true|
|reftext|string|句子内容|true|
|targetAudience|number|针对用户。0: child; 1: adult; 默认是1|false|
```
  llsRecorder.startRecord({
    question: { // 题目信息，目前支持readaloud题型
      type: 'readaloud', // 题型
      reftext: 'Hope is a good thing' // 句子内容
    },
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

### 停止录音
若验证成功，停止录音后会调用`startRecord`中传入的回调返回音频数据以及打分报告。

若验证失败，停止录音后会调用`startRecord`中传入的getAudio返回空音频。
```
  llsRecorder.stopRecord();
```

### 重新上传录音
```
  llsRecorder.reupload({
    audioBlob: <audioBlob>, // 必填，需要重传的音频
    question: { ... }, // 必填，题目
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
