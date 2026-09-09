---
title: "表单与验证基础 [P4-P5]"
level: "junior"
tags: ["表单", "验证", "正则", "HTML5", "表单控件"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# 表单与验证基础 [P4-P5]

> 表单是用户与网站交互的主要方式。掌握表单控件、验证方法和正则表达式是前端的基本技能。

## 核心概念（What）

### 表单的作用

```
表单 = 用户输入数据 → 提交给服务器

常见场景：
├── 登录/注册
├── 搜索
├── 提交订单
├── 填写信息
└── 上传文件

表单流程：
├── 1. 用户填写表单
├── 2. 前端验证（格式检查）
├── 3. 提交到服务器
├── 4. 后端验证（安全检查）
└── 5. 返回结果
```

## 基础用法（How）

### 基础表单控件

```html
<!-- 文本输入 -->
<input type="text" name="username" placeholder="用户名">
<input type="password" name="password" placeholder="密码">
<input type="email" name="email" placeholder="邮箱">
<input type="number" name="age" placeholder="年龄" min="0" max="150">
<input type="tel" name="phone" placeholder="手机号">
<input type="url" name="website" placeholder="网站">
<input type="search" name="keyword" placeholder="搜索">

<!-- 日期时间 -->
<input type="date" name="birthday">
<input type="time" name="meeting-time">
<input type="datetime-local" name="event-time">

<!-- 选择控件 -->
<select name="city">
  <option value="">请选择</option>
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
</select>

<!-- 单选 -->
<input type="radio" name="gender" value="male" checked> 男
<input type="radio" name="gender" value="female"> 女

<!-- 多选 -->
<input type="checkbox" name="hobby" value="reading"> 阅读
<input type="checkbox" name="hobby" value="sports"> 运动

<!-- 文本域 -->
<textarea name="bio" rows="4" placeholder="个人简介"></textarea>

<!-- 文件上传 -->
<input type="file" name="avatar" accept="image/*">
<input type="file" name="docs" multiple> <!-- 多文件 -->

<!-- 隐藏字段 -->
<input type="hidden" name="token" value="abc123">

<!-- 提交按钮 -->
<button type="submit">提交</button>
<button type="reset">重置</button>
```

### HTML5 内置验证

```html
<!-- required 必填 -->
<input type="text" required>

<!-- pattern 正则验证 -->
<input type="text" pattern="[0-9]{6}" title="请输入6位数字">

<!-- minlength / maxlength -->
<input type="text" minlength="3" maxlength="20">

<!-- min / max -->
<input type="number" min="0" max="100">

<!-- email 自动验证邮箱格式 -->
<input type="email">

<!-- url 自动验证 URL 格式 -->
<input type="url">

<!-- 完整示例 -->
<form>
  <input type="text" name="username" required minlength="3" maxlength="20" placeholder="用户名（3-20字符）">
  <input type="email" name="email" required placeholder="邮箱">
  <input type="password" name="password" required minlength="8" placeholder="密码（至少8位）">
  <input type="tel" name="phone" pattern="1[3-9]\d{9}" placeholder="手机号">
  <button type="submit">提交</button>
</form>
```

### JavaScript 验证

```javascript
// 获取表单数据
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  e.preventDefault(); // 阻止默认提交

  const formData = new FormData(form);
  const username = formData.get('username');
  const email = formData.get('email');
  const password = formData.get('password');

  // 验证
  const errors = [];

  if (!username || username.length < 3) {
    errors.push('用户名至少3个字符');
  }

  if (!email || !email.includes('@')) {
    errors.push('请输入有效邮箱');
  }

  if (!password || password.length < 8) {
    errors.push('密码至少8位');
  }

  if (errors.length > 0) {
    alert(errors.join('\n'));
    return;
  }

  // 提交
  console.log('提交数据:', { username, email, password });
});
```

### 正则表达式基础

```javascript
// 常用正则

// 手机号
const phoneRegex = /^1[3-9]\d{9}$/;
phoneRegex.test('13800138000'); // true

// 邮箱
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
emailRegex.test('test@example.com'); // true

// 身份证号
const idCardRegex = /^\d{17}[\dXx]$/;

// 中文
const chineseRegex = /^[\u4e00-\u9fa5]+$/;
chineseRegex.test('张三'); // true

// 密码强度（至少包含数字和字母，8-20位）
const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,20}$/;

// 使用方法
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 实时验证
const input = document.querySelector('input[name="phone"]');
input.addEventListener('input', (e) => {
  const isValid = validatePhone(e.target.value);
  e.target.style.borderColor = isValid ? 'green' : 'red';
});
```

### 表单验证库

```javascript
// VeeValidate（Vue）
import { useField, useForm } from 'vee-validate';
import * as yup from 'yup';

const schema = yup.object({
  username: yup.string().required().min(3),
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
});

const { errors, handleSubmit } = useForm({ validationSchema: schema });
const { value: username } = useField('username');

// React Hook Form（React）
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  console.log(data);
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('username', { required: true, minLength: 3 })} />
  {errors.username && <span>用户名必填</span>}
  <button type="submit">提交</button>
</form>
```

## 常见面试题

### Q1: 前端验证和后端验证的区别？

```
前端验证：
├── 提升用户体验（即时反馈）
├── 减少无效请求
├── 可以被绕过（不安全）
└── 格式检查

后端验证：
├── 保证数据安全（必须）
├── 不可绕过
├── 业务逻辑验证
└── 权限检查

结论：
├── 前端验证：用户体验
├── 后端验证：安全保障
└── 两者缺一不可
```

### Q2: 如何实现实时表单验证？

```javascript
// 输入时验证
input.addEventListener('input', (e) => {
  const value = e.target.value;
  const isValid = validate(value);

  if (isValid) {
    e.target.classList.remove('error');
    e.target.classList.add('success');
  } else {
    e.target.classList.remove('success');
    e.target.classList.add('error');
  }
});

// 失焦时验证（更友好）
input.addEventListener('blur', (e) => {
  validate(e.target.value);
});

// 防抖（减少验证频率）
let timer;
input.addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    validate(e.target.value);
  }, 300);
});
```

### Q3: 如何处理文件上传？

```html
<!-- 单文件 -->
<form enctype="multipart/form-data">
  <input type="file" name="avatar" accept="image/*">
  <button type="submit">上传</button>
</form>
```

```javascript
// JS 处理
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData // 自动设置 Content-Type
});

// 预览
const reader = new FileReader();
reader.onload = (e) => {
  previewImg.src = e.target.result;
};
reader.readAsDataURL(file);
```

## 延伸练习

1. 创建一个注册表单（用户名、邮箱、密码、确认密码）
2. 用正则验证手机号和邮箱
3. 实现实时验证（输入时显示错误提示）
4. 用 FormData 提交表单
5. 实现文件上传和预览

## 参考资料

- [MDN 表单](https://developer.mozilla.org/zh-CN/docs/Learn/Forms)
- [MDN 正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)
