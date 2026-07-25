# 音视频与相机管线

> **定位**: 零散思考文档  
> **最后更新**: 2026-07-26  
> **核心观点**: 音视频是移动端技术含量最高的领域——涉及硬件采集、编解码、实时传输、渲染播放的完整管线。理解管线的每一环，才能做出流畅的音视频体验。Flutter 在此领域依赖原生能力桥接，理解原生管线是用好 Flutter 音视频插件的前提。

---

## 📑 目录

- [一、音视频基础概念](#一音视频基础概念)
- [二、相机管线：从光子到像素](#二相机管线从光子到像素)
- [三、编解码原理](#三编解码原理)
- [四、视频播放管线](#四视频播放管线)
- [五、音频管线](#五音频管线)
- [六、实时通信：WebRTC 架构](#六实时通信webrtc-架构)
- [七、直播架构](#七直播架构)
- [八、Flutter 音视频生态](#八flutter-音视频生态)
- [九、性能与体验优化](#九性能与体验优化)

---

## 一、音视频基础概念

### 1.1 视频的本质

```
视频 = 连续的图片序列 + 音频轨道 + 时间轴

核心参数：
├── 分辨率：1920×1080 (1080P) / 3840×2160 (4K)
├── 帧率 (FPS)：24(电影) / 30(常规) / 60(游戏/高帧率)
├── 码率 (Bitrate)：每秒数据量
│   ├── 1080P@30fps 常规 ~4-8 Mbps
│   ├── 码率决定画质上限（分辨率≠画质）
│   └── 自适应码率（ABR）：按网络动态切换
├── 色彩空间：YUV（压缩友好）vs RGB（显示用）
│   ├── YUV420：每 4 像素共享色度 → 体积减半
│   └── 10-bit HDR：色深提升（BT.2020）
└── 像素格式：NV12 / NV21 / I420（平台差异）
```

### 1.2 音频的本质

```
音频 = 声波的数字采样

核心参数：
├── 采样率：44.1kHz (CD) / 48kHz (视频标准)
├── 位深：16-bit (常规) / 24-bit (高保真)
├── 声道：单声道 / 立体声 / 5.1 环绕
└── 码率：
    ├── 未压缩 PCM：48kHz×16bit×2ch ≈ 1.5 Mbps
    └── 压缩后 AAC：128-320 kbps

数据量直觉：
1 分钟 1080P 视频（未压缩）≈ 1080×1920×4×30×60 ≈ 90GB
→ 压缩编码是音视频技术的核心
```

### 1.3 容器与编码的分离

```
容器（Container）≠ 编码（Codec）

容器：封装格式，组织音视频流 + 元数据
├── MP4：最通用（.mp4/.m4v）
├── MOV：Apple QuickTime
├── MKV：功能强大（多字幕轨）
├── FLV：直播流（历史）
├── WebM：Web 友好（VP9/AV1）
└── TS：流媒体分片（HLS）

编码：压缩算法
├── 视频：H.264 / H.265(HEVC) / VP9 / AV1
└── 音频：AAC / Opus / MP3

组合示例：
MP4 容器 + H.264 视频 + AAC 音频（最兼容）
WebM 容器 + VP9 视频 + Opus 音频（Web）
```

---

## 二、相机管线：从光子到像素

### 2.1 图像传感器原理

```
光子 → 电子 → 数字信号

┌─────────────────────────────────────────┐
│ 镜头（Lens）                               │
│   ↓ 聚焦光线                              │
│ 图像传感器（CMOS Sensor）                   │
│   ├── 拜耳阵列（Bayer Filter）             │
│   │   每个像素只感知 R/G/B 之一             │
│   │   RGGB 排列（绿色占 50%，人眼敏感）      │
│   ├── 光电转换：光子 → 电荷                 │
│   └── ADC：电荷 → 数字信号（RAW 数据）       │
│   ↓                                      │
│ ISP（图像信号处理器）                        │
│   ├── 去马赛克（Demosaic）：插值全彩         │
│   ├── 自动曝光（AE）/ 自动白平衡（AWB）       │
│   ├── 自动对焦（AF）                        │
│   ├── 降噪（NR）/ 锐化                      │
│   └── HDR 合成（多帧融合）                   │
│   ↓                                      │
│ 输出：YUV 帧流（30/60fps）                  │
└─────────────────────────────────────────┘

关键认知：
- "拍照"是计算摄影（多帧合成），不是单次曝光
- ISP 处理在专用硬件（DSP/ISP 芯片），不占 CPU
- 相机输出的是帧流，拍照是从流中取高质量帧
```

### 2.2 双平台相机 API

```
Android: Camera2 API
┌─────────────────────────────────────┐
│ CameraManager → CameraDevice          │
│   → CameraCaptureSession              │
│     → Surface（预览/录制/图像读取）      │
│ 特点：                                │
│ - 手动控制（曝光/ISO/对焦）              │
│ - 多 Surface 输出（预览+录制并行）        │
│ - HAL3 架构，Pipeline 可配置            │
└─────────────────────────────────────┘

iOS: AVFoundation
┌─────────────────────────────────────┐
│ AVCaptureDevice → AVCaptureSession    │
│   → AVCaptureOutput                   │
│     ├── VideoDataOutput（帧回调）       │
│     ├── PhotoOutput（拍照）            │
│     └── MovieFileOutput（录制）         │
│ 特点：                                │
│ - Session 统一管理输入输出               │
│ - 预设质量（.high/.hd1920x1080）        │
│ - 与 Core Image/Metal 无缝集成          │
└─────────────────────────────────────┘
```

### 2.3 Flutter 相机数据流

```
camera 插件架构：
┌─────────────────────────────────────┐
│ Dart 层                              │
│ CameraController                     │
│   ├── startImageStream() → 帧回调     │
│   ├── takePicture()                  │
│   └── startVideoRecording()          │
├─────────────────────────────────────┤
│ 原生层                               │
│ Android: Camera2 + SurfaceTexture    │
│ iOS: AVFoundation + CMSampleBuffer   │
├─────────────────────────────────────┤
│ 预览显示：纹理（Texture Widget）        │
│ 相机帧 → 外部纹理 → Flutter 渲染        │
└─────────────────────────────────────┘

预览为什么用纹理而非 Platform View：
- 相机预览 30-60fps 高频更新
- Platform View 合成开销大 → 卡顿
- 纹理直接进 Flutter 渲染管线 → 流畅
```

### 2.4 相机帧处理

```dart
// 实时帧处理（人脸检测/扫码/滤镜）
final controller = CameraController(camera, ResolutionPreset.high);
await controller.initialize();

controller.startImageStream((CameraImage image) async {
  // image: YUV420 格式原始帧
  // ⚠️ 回调在独立线程，处理必须快（<33ms@30fps）

  // 转换格式供 ML 库使用
  final input = convertToInputImage(image);

  // 异步处理（丢帧策略：上一帧未完成则跳过）
  if (_isProcessing) return;
  _isProcessing = true;
  try {
    final faces = await faceDetector.processImage(input);
    // 更新 UI（回到主 Isolate）
  } finally {
    _isProcessing = false;
  }
});

// 性能要点：
// 1. 帧处理用独立 Isolate（避免阻塞 UI）
// 2. 丢帧优于延迟（实时性优先）
// 3. 降低处理分辨率（检测不需要原图）
```

---

## 三、编解码原理

### 3.1 视频编码核心思想

```
为什么能压缩 100 倍？

① 空间冗余（帧内压缩，I 帧）
   相邻像素高度相关 → 变换 + 量化
   ├── DCT/离散余弦变换：空间域 → 频率域
   ├── 量化：丢弃高频细节（有损压缩核心）
   └── 熵编码：Huffman/算术编码（无损）

② 时间冗余（帧间压缩，P/B 帧）
   相邻帧高度相似 → 只存差异
   ├── 运动估计：找到宏块在参考帧的位置
   ├── 运动补偿：只编码残差 + 运动向量
   └── 100 帧画面可能只需几帧完整数据

③ 编码帧类型：
   I 帧：完整帧（关键帧，可独立解码）
   P 帧：参考前向帧（前向预测）
   B 帧：参考前后帧（双向预测，压缩率最高）
   GOP：I 帧间隔（如 250 帧一个 GOP）
```

### 3.2 编码标准演进

```
┌────────┬──────────┬───────────┬──────────────────┐
│ 标准    │ 年代      │ 压缩率提升  │ 特点              │
├────────┼──────────┼───────────┼──────────────────┤
│ H.264  │ 2003     │ 基准       │ 兼容性最好，硬件普及  │
│ H.265  │ 2013     │ ~50%      │ 专利费高，4K 常用    │
│ VP9    │ 2013     │ ~50%      │ Google，免版税      │
│ AV1    │ 2018     │ ~30%(vs265)│ 免版税，编码慢       │
└────────┴──────────┴───────────┴──────────────────┘

移动端选择：
- 录制：H.264（兼容）/ H.265（省空间，iOS 默认）
- 播放：H.264 兜底 + H.265/AV1（按设备能力）
- 实时通信：H.264（延迟低，硬解普及）
```

### 3.3 硬件编解码

```
软编软解（CPU）：
├── 灵活：任意参数、新标准快速支持
├── 代价：功耗高、4K 可能带不动
└── 库：FFmpeg (libx264/libaom)

硬编硬解（专用芯片 DSP/GPU）：
├── 优势：功耗低 10 倍+、4K 实时无压力
├── 限制：参数受限、并发数有限（通常 2-4 路）
└── API：
    Android: MediaCodec
    iOS: VideoToolbox

移动端原则：
- 默认硬解（省电），不支持时回退软解
- 录制必须硬编（实时性 + 功耗）
- 后台转码可软编（质量优先）

Flutter 插件底层均走平台硬解 API
```

### 3.4 音频编码

```
┌────────┬──────────┬─────────┬──────────────────┐
│ 编码    │ 码率      │ 延迟     │ 适用              │
├────────┼──────────┼─────────┼──────────────────┤
│ AAC-LC │ 128-256k │ 中      │ 通用音频/视频伴音    │
│ HE-AAC │ 32-80k   │ 中      │ 低码率流媒体        │
│ Opus   │ 6-510k   │ 极低(5ms)│ 实时通话（WebRTC）  │
│ MP3    │ 128-320k │ -       │ 历史兼容            │
└────────┴──────────┴─────────┴──────────────────┘

回声消除（AEC）与降噪（ANS）：
- 实时通话必备（否则啸叫/杂音）
- 平台提供：iOS Voice Processing / Android AcousticEchoCanceler
- WebRTC 内置 AEC3/NS（软件实现，跨平台一致）
```

---

## 四、视频播放管线

### 4.1 播放器完整管线

```
┌─ 解封装 (Demux) ─────────────────────────┐
│ MP4/FLV/HLS → 分离视频流 + 音频流           │
└──────────────┬───────────────────────────┘
               ↓
┌─ 解码 (Decode) ──────────────────────────┐
│ 视频：硬解（MediaCodec/VideoToolbox）       │
│ 音频：软解/硬解（AAC 解码）                 │
│ 输出：YUV 视频帧 + PCM 音频采样             │
└──────────────┬───────────────────────────┘
               ↓
┌─ 音视频同步 (A/V Sync) ──────────────────┐
│ 以音频时钟为基准（PTS 时间戳对齐）           │
│ 视频帧按 PTS 在正确时刻送显                 │
│ 音频连续播放（人耳对音频卡顿更敏感）          │
└──────────────┬───────────────────────────┘
               ↓
┌─ 渲染 (Render) ──────────────────────────┐
│ 视频：YUV → RGB → 纹理上屏                 │
│ 音频：PCM → AudioTrack/AVAudioEngine      │
└──────────────────────────────────────────┘
```

### 4.2 关键播放技术

```
① 音视频同步（PTS）：
   每帧携带 Presentation Timestamp
   音频时钟为主时钟（Audio Master Clock）
   视频帧：早了等，晚了丢（追帧）
   同步容差：±40ms 人眼不可感知

② 缓冲策略：
   ├── 起播缓冲：先下载 N 秒再播（减少卡顿）
   ├── 播放缓冲：环形缓冲区（边播边下）
   └── 缓冲水位：低 → 暂停播放加载；高 → 恢复

③ 自适应码率（ABR）：
   HLS/DASH：视频切成多码率分片
   播放器按实时带宽动态切换清晰度
   ├── 带宽估算：滑动窗口下载速度
   ├── 切换策略：保守升档、激进降档
   └── 无缝切换（同 GOP 对齐）

④ 首帧优化（秒开）：
   ├── 预加载：列表滑动提前缓冲下一视频
   ├── 起播码率：先用低码率快速起播
   ├── 预解析：提前 demux 获取元数据
   └── 复用播放器实例（避免重复初始化）
```

### 4.3 Flutter 视频播放

```dart
// video_player 插件（官方）
final controller = VideoPlayerController.networkUrl(
  Uri.parse('https://example.com/video.mp4'),
);
await controller.initialize();  // 解封装 + 准备解码

// 显示：Texture Widget（原生纹理桥接）
AspectRatio(
  aspectRatio: controller.value.aspectRatio,
  child: VideoPlayer(controller),
)

// 播放控制
controller.play();
controller.seekTo(Duration(seconds: 30));
controller.setPlaybackSpeed(1.5);

// 底层原理：
// Android: ExoPlayer → SurfaceTexture → Flutter Texture
// iOS: AVPlayer → AVPlayerLayer → Flutter Texture
// 解码在原生层，Flutter 仅消费纹理

// 高级需求：
// - 直播/HLS：video_player 支持 m3u8
// - 自定义 UI：chewie 封装层
// - 专业播放器：flutter_vlc_player / fvp（FFmpeg 系）
```

---

## 五、音频管线

### 5.1 音频播放架构

```
Android 音频链路：
App → AudioTrack → AudioFlinger（混音服务）
    → HAL → DSP → 扬声器/蓝牙耳机
特点：
- AudioFlinger 统一混音（多应用同时出声）
- 延迟：常规 50-100ms，低延迟模式 10-20ms
- 蓝牙额外延迟 100-300ms（SBC/AAC 编码）

iOS 音频链路：
App → AVAudioEngine/AVAudioPlayer → Core Audio
    → 硬件
特点：
- Core Audio 低延迟优化好
- 音频会话管理（Audio Session）：
  类别决定与应用/系统的交互行为
```

### 5.2 iOS 音频会话（关键概念）

```dart
// Audio Session Category 决定音频行为：
// playback：后台播放（音乐App），打断其他App音频
// playAndRecord：通话/录音，双向音频
// ambient：随静音键静音，不打断其他（游戏音效）
// soloAmbient：默认，打断其他

// Flutter 侧管理（audio_session 插件）
final session = await AudioSession.instance;
await session.configure(AudioSessionConfiguration(
  category: AudioSessionCategory.playback,
  options: AudioSessionOptions.mixWithOthers,
));

// 必须处理的音频事件：
// 1. 中断（来电/闹钟）→ 暂停，结束后恢复
// 2. 路由变化（拔耳机）→ 自动暂停（防外放尴尬）
// 3. 后台播放 → 声明 Background Modes: audio
// 4. 锁屏控制 → 媒体元数据 + 远程控制
```

### 5.3 Flutter 音频方案选型

```
┌──────────────────┬──────────────────────────────┐
│ 需求              │ 方案                          │
├──────────────────┼──────────────────────────────┤
│ 简单音效          │ audioplayers / flame_audio    │
│ 音乐播放（后台）   │ just_audio + audio_service    │
│ 录音             │ record                        │
│ 低延迟游戏音频     │ flame_audio / audioplayers     │
│ 实时处理/变声      │ 原生插件 / FlutterFFmpeg        │
│ 音频流（TTS/直播） │ just_audio (StreamAudioSource) │
└──────────────────┴──────────────────────────────┘

后台音乐播放完整方案：
just_audio（播放引擎）
  + audio_service（后台服务 + 锁屏控制 + 通知栏）
  + 媒体元数据（标题/封面/进度）
```

---

## 六、实时通信：WebRTC 架构

### 6.1 WebRTC 整体架构

```
┌─ 采集层 ──────────────────────────────────┐
│ 摄像头帧 + 麦克风采样                        │
├─ 编码层 ──────────────────────────────────┤
│ 视频：H.264/VP8/VP9 硬编                    │
│ 音频：Opus 编码 + AEC 回声消除 + ANS 降噪     │
├─ 传输层 ──────────────────────────────────┤
│ RTP/RTCP：媒体传输 + 质量控制                 │
│ SRTP：加密                                   │
│ ICE/STUN/TURN：NAT 穿透                      │
│ DTLS：密钥协商                               │
│ 全部基于 UDP（实时性优先）                     │
├─ 网络对抗 ────────────────────────────────┤
│ FEC 前向纠错 / NACK 重传 / Jitter Buffer     │
│ 带宽估计（GCC）→ 动态码率调整                  │
└───────────────────────────────────────────┘
```

### 6.2 连接建立流程

```
① 信令交换（SDP Offer/Answer）
   A → 服务器 → B：媒体能力描述（编码/分辨率/ICE候选）
   B → 服务器 → A：应答

② ICE 候选收集
   ├── Host 候选：本机 IP
   ├── Server Reflexive：STUN 探测公网 IP
   └── Relay：TURN 中继（NAT 对称型兜底）

③ 连通性检查（ICE Connectivity Check）
   候选地址两两组合探测 → 选择最优路径

④ DTLS 握手 + SRTP 加密
   → 媒体流开始传输

耗时：理想 100-500ms，TURN 中继场景更久
```

### 6.3 多人通话架构

```
Mesh（全互联）：
A↔B, A↔C, B↔C 两两直连
- 优势：无服务器媒体成本
- 劣势：N 人 = N×(N-1)/2 连接，上行带宽爆炸
- 适用：≤4 人

SFU（选择性转发单元）：
每个参与者上行 1 路 → SFU 选择性转发给其他人
- 优势：上行仅 1 路，服务器不解码（转发）
- 劣势：需自建/购买 SFU 服务
- 适用：5-50 人（主流方案）

MCU（多点控制单元）：
所有流 → MCU 解码-混合-重编码 → 下发 1 路
- 优势：客户端只处理 1 路（适合弱终端）
- 劣势：服务器算力成本高、延迟增加
- 适用：电话会议/录制场景

主流 SFU 服务：mediasoup / Janus / LiveKit / 声网
```

### 6.4 Flutter WebRTC

```dart
// flutter_webrtc 插件核心流程
// 1. 获取媒体流
final stream = await navigator.mediaDevices.getUserMedia({
  'video': {'width': 1280, 'height': 720},
  'audio': true,
});

// 2. 创建 PeerConnection
final pc = await createPeerConnection({
  'iceServers': [
    {'urls': 'stun:stun.l.google.com:19302'},
  ],
});

// 3. 添加轨道
for (final track in stream.getTracks()) {
  await pc.addTrack(track, stream);
}

// 4. 信令交换（通过自己的信令服务器）
final offer = await pc.createOffer();
await pc.setLocalDescription(offer);
// → WebSocket 发送 offer 给对端
// ← 接收 answer → pc.setRemoteDescription(answer)

// 5. 渲染远端流
RTCVideoRenderer _renderer = RTCVideoRenderer();
await _renderer.initialize();
pc.onTrack = (event) {
  _renderer.srcObject = event.streams[0];
};
// UI: RTCVideoView(_renderer)
```

---

## 七、直播架构

### 7.1 直播全链路

```
主播端 → 边缘节点 → CDN → 观众端

① 采集编码（主播端）：
   相机帧 → 美颜滤镜（GPU）→ H.264 硬编
   麦克风 → AEC/ANS → AAC/Opus 编码
   推流码率：2-4 Mbps（1080P）

② 推流协议：
   RTMP：经典推流协议（TCP，延迟 1-3s）
   SRT：低延迟可靠传输（新趋势）
   WebRTC：超低延迟推流（<500ms）

③ CDN 分发：
   边缘节点缓存 + 智能调度
   协议转换：RTMP → HLS/FLV/低延迟

④ 拉流播放（观众端）：
   ├── HLS：苹果标准，延迟 6-30s（分片机制）
   ├── HTTP-FLV：延迟 1-3s（国内主流）
   ├── 低延迟 HLS (LL-HLS)：2-5s
   └── WebRTC 拉流：<1s（互动直播）
```

### 7.2 延迟与协议选择

```
延迟来源拆解：
编码(50ms) + 推流(100ms) + 转码(200ms)
+ CDN 传输(100ms) + 拉流缓冲(1-3s) + 解码渲染(50ms)

各协议延迟对比：
┌──────────────┬──────────┬──────────────────┐
│ 协议          │ 延迟      │ 适用              │
├──────────────┼──────────┼──────────────────┤
│ WebRTC       │ <500ms   │ 连麦/PK/互动        │
│ HTTP-FLV     │ 1-3s     │ 常规直播（国内）      │
│ LL-HLS       │ 2-5s     │ 低延迟兼容方案       │
│ 标准 HLS      │ 6-30s    │ 点播/延迟不敏感      │
│ RTMP(拉流)    │ 1-3s     │ Flash 时代遗留      │
└──────────────┴──────────┴──────────────────┘

互动直播架构：
主播 ←WebRTC→ 服务器 ←WebRTC→ 连麦嘉宾
              ↓ 混流
           CDN ←HTTP-FLV→ 普通观众
```

### 7.3 直播首帧与卡顿优化

```
首帧优化（目标 <1s）：
① DNS 预解析 + 连接预建立
② 减小 GOP（快速遇到 I 帧起播）
③ 起播缓冲调小（牺牲少量卡顿换首帧）
④ CDN 边缘节点就近调度

卡顿优化：
① 自适应码率（带宽下降自动降清晰度）
② 缓冲水位动态调整
③ 丢帧策略（直播追帧：落后太多直接跳到最新）
④ 弱网降级（降帧率/降分辨率优先于卡顿）
```

---

## 八、Flutter 音视频生态

### 8.1 插件能力矩阵

| 插件 | 能力 | 底层 |
| ---- | ---- | ---- |
| camera | 拍照/录像/帧流 | Camera2/AVFoundation |
| video_player | 视频播放 | ExoPlayer/AVPlayer |
| chewie | 播放器 UI 封装 | video_player |
| just_audio | 音频播放 | ExoPlayer/AVPlayer |
| record | 录音 | MediaRecorder/AVAudioRecorder |
| flutter_webrtc | 实时通信 | Google WebRTC |
| livekit_client | 直播/通话 | LiveKit SDK |
| ffmpeg_kit_flutter | 转码/剪辑 | FFmpeg |
| image_picker | 相册选择 | 平台相册 API |
| photo_manager | 相册访问 | PhotoKit/MediaStore |

### 8.2 音视频处理的 Flutter 局限

```
Flutter 能做好：
✅ 播放（纹理桥接，性能足够）
✅ 采集（相机插件成熟）
✅ UI 层（播放器控件/美颜参数面板）
✅ 实时通信（WebRTC 插件）

Flutter 的局限（需原生/FFmpeg）：
❌ 视频剪辑/转码（CPU 密集 → FFmpeg Kit）
❌ 自定义滤镜/特效（需 GPU Shader → 原生或 texture 处理）
❌ 超低延迟处理（帧回调跨语言开销）
❌ 专业推流（建议原生 SDK：声网/腾讯云）

架构建议：
- 通用场景：Flutter 插件足够
- 重度音视频：原生 SDK + Flutter UI（混合架构）
- 帧级处理：原生处理 → 纹理输出给 Flutter 显示
```

---

## 九、性能与体验优化

### 9.1 相机性能优化

```
① 预览分辨率 ≠ 拍照分辨率
   预览用 720P/1080P（省电省带宽）
   拍照用最高分辨率

② 帧率控制
   预览 30fps 足够（60fps 耗电翻倍）
   慢动作才用 60/120fps

③ 对焦/曝光锁定
   扫码场景锁定对焦（避免反复拉风箱）

④ 纹理复用
   切换相机时复用 Texture（避免重建开销）

⑤ 权限预热
   进入相机页面前预申请权限（减少等待）
```

### 9.2 播放性能优化

```
① 列表视频（信息流）：
   - 仅播放可见项（VisibilityDetector）
   - 预缓冲下一项（提前 2-3 个）
   - 播放器实例池（复用，最多 2-3 个）
   - 离屏暂停 + 释放解码器

② 内存控制：
   - 解码缓冲上限（避免 4K 撑爆内存）
   - 及时 dispose 控制器（纹理泄漏）

③ 起播体验：
   - 封面图先行（解码完成前显示封面）
   - 首帧回调后再移除封面（防黑屏闪烁）

④ 电量：
   - 硬解优先（软解 4K 功耗 3-5 倍）
   - 后台停止视频渲染（仅保留音频）
```

### 9.3 实时通话体验优化

```
① 网络自适应：
   带宽估计 → 动态调整编码码率/帧率
   弱网策略：保音频、降视频（音频优先）

② 延迟控制：
   Jitter Buffer 动态调整（延迟 vs 流畅权衡）
   端到端延迟目标 <400ms（可对话）

③ 回声与噪声：
   必须启用 AEC（否则扬声器→麦克风啸叫）
   耳机模式自动切换 AEC 策略

④ 断线重连：
   ICE Restart（网络切换快速恢复）
   信令重连 + 媒体重协商
```

---

## 📎 参考资源

- [WebRTC for the Curious（中文）](https://webrtcforthecurious.com/zh/)
- [FFmpeg 官方文档](https://ffmpeg.org/documentation.html)
- [Android Camera2 API](https://developer.android.com/reference/android/hardware/camera2/package-summary)
- [AVFoundation Programming Guide](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/AVFoundationPG/)
