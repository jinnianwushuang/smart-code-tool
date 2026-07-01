# Django 开发手册

## 概述

Django 是一个高级 Python Web 框架,鼓励快速开发和干净、实用的设计。由经验丰富的开发者构建,它处理了 Web 开发的许多麻烦,因此你可以专注于编写应用程序,而无需重新发明轮子。

### 核心特性

- **完整的 MVC 架构**: MTV(Model-Template-View) 模式
- **ORM 系统**: 强大的数据库抽象层
- **Admin 后台**: 自动生成管理界面
- **表单处理**: 内置表单验证和处理
- **认证系统**: 用户认证和授权
- **安全性**: CSRF、XSS、SQL 注入防护
- **可扩展性**: 丰富的第三方包生态

## 快速开始

### 安装

```bash
# 创建虚拟环境
python -m venv myproject_env
source myproject_env/bin/activate  # Linux/Mac
# myproject_env\Scripts\activate   # Windows

# 安装 Django
pip install django

# 验证安装
django-admin --version
```

### 创建项目

```bash
# 创建新项目
django-admin startproject myproject

# 项目结构
myproject/
├── manage.py
└── myproject/
    ├── __init__.py
    ├── settings.py
    ├── urls.py
    ├── asgi.py
    └── wsgi.py
```

### 创建应用

```bash
cd myproject
python manage.py startapp blog

# 应用结构
blog/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── tests.py
├── views.py
└── migrations/
    └── __init__.py
```

### 运行开发服务器

```bash
python manage.py runserver

# 指定端口
python manage.py runserver 8080

# 允许外部访问
python manage.py runserver 0.0.0.0:8000
```

访问 http://127.0.0.1:8000 查看结果

## 核心概念

### 1. Models(模型)

定义数据结构和数据库表。

```python
# blog/models.py
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = '分类'
        verbose_name_plural = '分类'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class Post(models.Model):
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='posts/%Y/%m/', blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 关系字段
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='posts')
    tags = models.ManyToManyField('Tag', related_name='posts', blank=True)

    class Meta:
        verbose_name = '文章'
        verbose_name_plural = '文章'
        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('blog:post_detail', kwargs={'slug': self.slug})

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author_name = models.CharField(max_length=100)
    author_email = models.EmailField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.author_name} on {self.post}'
```

### 2. Views(视图)

处理业务逻辑和返回响应。

#### 函数视图

```python
# blog/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from django.core.paginator import Paginator
from .models import Post, Category, Tag
from .forms import CommentForm

def post_list(request):
    """文章列表页"""
    posts = Post.objects.filter(status='published')

    # 分页
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'posts': page_obj,
        'page_obj': page_obj,
    }
    return render(request, 'blog/post_list.html', context)

def post_detail(request, slug):
    """文章详情页"""
    post = get_object_or_404(Post, slug=slug, status='published')

    # 获取相关文章
    related_posts = Post.objects.filter(
        category=post.category,
        status='published'
    ).exclude(pk=post.pk)[:5]

    # 处理评论
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.save()
            return redirect('blog:post_detail', slug=slug)
    else:
        form = CommentForm()

    context = {
        'post': post,
        'related_posts': related_posts,
        'form': form,
    }
    return render(request, 'blog/post_detail.html', context)

def category_list(request, slug):
    """分类文章列表"""
    category = get_object_or_404(Category, slug=slug)
    posts = Post.objects.filter(category=category, status='published')

    context = {
        'category': category,
        'posts': posts,
    }
    return render(request, 'blog/category_list.html', context)
```

#### 类视图(CBV)

```python
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Post
from .forms import PostForm

class PostListView(ListView):
    model = Post
    template_name = 'blog/post_list.html'
    context_object_name = 'posts'
    paginate_by = 10

    def get_queryset(self):
        return Post.objects.filter(status='published').order_by('-published_at')

class PostDetailView(DetailView):
    model = Post
    template_name = 'blog/post_detail.html'
    context_object_name = 'post'

    def get_queryset(self):
        return Post.objects.filter(status='published')

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    form_class = PostForm
    template_name = 'blog/post_form.html'

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

class PostUpdateView(LoginRequiredMixin, UpdateView):
    model = Post
    form_class = PostForm
    template_name = 'blog/post_form.html'

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)

class PostDeleteView(LoginRequiredMixin, DeleteView):
    model = Post
    template_name = 'blog/post_confirm_delete.html'
    success_url = '/blog/'

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)
```

### 3. URLs(路由)

定义 URL 到视图的映射。

```python
# blog/urls.py
from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('post/<slug:slug>/', views.post_detail, name='post_detail'),
    path('category/<slug:slug>/', views.category_list, name='category_list'),
    path('tag/<slug:slug>/', views.tag_list, name='tag_list'),
    path('create/', views.PostCreateView.as_view(), name='post_create'),
    path('post/<slug:slug>/edit/', views.PostUpdateView.as_view(), name='post_update'),
    path('post/<slug:slug>/delete/', views.PostDeleteView.as_view(), name='post_delete'),
]

# myproject/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('blog/', include('blog.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
]
```

### 4. Templates(模板)

HTML 模板文件。

```html
<!-- blog/templates/blog/base.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{% block title %}博客{% endblock %}</title>
    {% load static %}
    <link rel="stylesheet" href="{% static 'css/style.css' %}" />
  </head>
  <body>
    <header>
      <nav>
        <a href="{% url 'blog:post_list' %}">首页</a>
        {% if user.is_authenticated %}
        <a href="{% url 'blog:post_create' %}">新建文章</a>
        <span>{{ user.username }}</span>
        <form action="{% url 'logout' %}" method="post">
          {% csrf_token %}
          <button type="submit">退出</button>
        </form>
        {% else %}
        <a href="{% url 'login' %}">登录</a>
        {% endif %}
      </nav>
    </header>

    <main>{% block content %}{% endblock %}</main>

    <footer>
      <p>&copy; 2024 我的博客</p>
    </footer>
  </body>
</html>

<!-- blog/templates/blog/post_list.html -->
{% extends "blog/base.html" %} {% block title %}文章列表{% endblock %} {% block content %}
<h1>最新文章</h1>

<div class="posts">
  {% for post in posts %}
  <article class="post-card">
    <h2><a href="{{ post.get_absolute_url }}">{{ post.title }}</a></h2>
    <p class="meta">
      作者: {{ post.author.username }} | 分类: {{ post.category.name }} | 发布时间: {{
      post.published_at|date:"Y-m-d" }}
    </p>
    <p>{{ post.excerpt|truncatewords:30 }}</p>
    <a href="{{ post.get_absolute_url }}" class="read-more">阅读全文</a>
  </article>
  {% empty %}
  <p>暂无文章</p>
  {% endfor %}
</div>

<!-- 分页 -->
{% if page_obj.has_other_pages %}
<nav class="pagination">
  {% if page_obj.has_previous %}
  <a href="?page={{ page_obj.previous_page_number }}">上一页</a>
  {% endif %}

  <span>第 {{ page_obj.number }} / {{ page_obj.paginator.num_pages }} 页</span>

  {% if page_obj.has_next %}
  <a href="?page={{ page_obj.next_page_number }}">下一页</a>
  {% endif %}
</nav>
{% endif %} {% endblock %}
```

### 5. Forms(表单)

```python
# blog/forms.py
from django import forms
from .models import Post, Comment

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'excerpt', 'cover_image', 'category', 'tags', 'status']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 10}),
            'excerpt': forms.Textarea(attrs={'rows': 3}),
        }

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['author_name', 'author_email', 'content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 5}),
        }
```

## 数据库操作

### ORM 查询

```python
from blog.models import Post, Category, User

# 基本查询
Post.objects.all()
Post.objects.filter(status='published')
Post.objects.exclude(status='draft')

# 链式查询
Post.objects.filter(status='published').order_by('-published_at')[:10]

# 关联查询
Post.objects.filter(author__username='admin')
Post.objects.filter(category__name='技术')

# 聚合查询
from django.db.models import Count, Avg

Post.objects.values('category__name').annotate(count=Count('id'))
Post.objects.aggregate(avg_length=Avg('content__length'))

# Q 对象(复杂查询)
from django.db.models import Q

Post.objects.filter(
    Q(title__icontains='Django') | Q(content__icontains='Django'),
    status='published'
)

# F 对象(字段比较)
from django.db.models import F

Post.objects.filter(published_at__gt=F('created_at'))
```

### 事务处理

```python
from django.db import transaction

@transaction.atomic
def create_post_with_tags(title, content, tag_names):
    """原子操作:创建文章和标签"""
    post = Post.objects.create(
        title=title,
        content=content,
        author=request.user
    )

    for tag_name in tag_names:
        tag, created = Tag.objects.get_or_create(name=tag_name)
        post.tags.add(tag)

    return post
```

### 性能优化

```python
# select_related (ForeignKey)
posts = Post.objects.select_related('author', 'category').all()

# prefetch_related (ManyToMany)
posts = Post.objects.prefetch_related('tags').all()

# 只获取需要的字段
posts = Post.objects.only('title', 'excerpt').all()

# 延迟加载大字段
posts = Post.objects.defer('content').all()

# 使用 values 减少内存占用
posts = Post.objects.values('id', 'title').all()
```

## Admin 后台

### 注册模型

```python
# blog/admin.py
from django.contrib import admin
from .models import Category, Post, Tag, Comment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'published_at']
    list_filter = ['status', 'category', 'published_at']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    raw_id_fields = ['author']
    date_hierarchy = 'published_at'
    actions = ['make_published', 'make_draft']

    def make_published(self, request, queryset):
        queryset.update(status='published')
    make_published.short_description = "标记为已发布"

    def make_draft(self, request, queryset):
        queryset.update(status='draft')
    make_draft.short_description = "标记为草稿"

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['post', 'author_name', 'created_at', 'is_approved']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['author_name', 'author_email', 'content']
    actions = ['approve_comments']

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "批准选中的评论"
```

### 自定义 Admin

```python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'slug', 'author', 'category')
        }),
        ('内容', {
            'fields': ('content', 'excerpt', 'cover_image')
        }),
        ('状态', {
            'fields': ('status', 'published_at'),
            'classes': ('collapse',)
        }),
        ('标签', {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']
```

## 认证与授权

### 用户模型

```python
from django.contrib.auth.models import User

# 创建用户
user = User.objects.create_user(
    username='john',
    email='john@example.com',
    password='password123'
)

# 超级用户
superuser = User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin123'
)

# 认证
from django.contrib.auth import authenticate, login, logout

user = authenticate(username='john', password='password123')
if user is not None:
    login(request, user)
else:
    # 认证失败
    pass

# 注销
logout(request)
```

### 权限装饰器

```python
from django.contrib.auth.decorators import login_required, permission_required

@login_required
def my_view(request):
    # 需要登录才能访问
    pass

@permission_required('blog.add_post')
def create_post(request):
    # 需要特定权限
    pass
```

### 自定义用户模型

```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    bio = models.TextField(blank=True)

    class Meta:
        db_table = 'custom_user'
```

```python
# settings.py
AUTH_USER_MODEL = 'accounts.CustomUser'
```

## REST API (Django REST Framework)

### 安装

```bash
pip install djangorestframework
```

### 序列化器

```python
# blog/serializers.py
from rest_framework import serializers
from .models import Post, Category, Tag, Comment

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'content', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt',
            'cover_image', 'status', 'published_at',
            'created_at', 'updated_at',
            'author', 'category', 'tags', 'comments_count'
        ]

    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()
```

### 视图集

```python
# blog/views.py
from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Category, Tag
from .serializers import PostSerializer, CategorySerializer, TagSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(status='published')
    serializer_class = PostSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['published_at', 'created_at']
    ordering = ['-published_at']

    def get_queryset(self):
        queryset = Post.objects.all()

        # 按分类过滤
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        # 按标签过滤
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__slug=tag)

        return queryset

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        # 点赞逻辑
        return Response({'status': 'liked'})

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
```

### 路由

```python
# blog/urls.py
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CategoryViewSet, TagViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = router.urls
```

### 权限控制

```python
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated

class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
```

## 中间件

### 自定义中间件

```python
# blog/middleware.py
import time

class RequestTimeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        response = self.get_response(request)

        duration = time.time() - start_time
        response['X-Request-Time'] = str(duration)

        return response
```

```python
# settings.py
MIDDLEWARE = [
    # ...
    'blog.middleware.RequestTimeMiddleware',
]
```

## 信号(Signals)

```python
# blog/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Post

@receiver(post_save, sender=Post)
def post_saved(sender, instance, created, **kwargs):
    if created:
        print(f"新文章创建: {instance.title}")
    else:
        print(f"文章更新: {instance.title}")

@receiver(post_delete, sender=Post)
def post_deleted(sender, instance, **kwargs):
    print(f"文章删除: {instance.title}")
```

```python
# blog/apps.py
from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog'

    def ready(self):
        import blog.signals
```

## 缓存

### 配置缓存

```python
# settings.py

# 内存缓存
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Redis 缓存
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### 使用缓存

```python
from django.core.cache import cache

# 设置缓存
cache.set('key', 'value', timeout=300)  # 5分钟

# 获取缓存
value = cache.get('key')

# 删除缓存
cache.delete('key')

# 缓存装饰器
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 缓存15分钟
def my_view(request):
    pass
```

## 测试

### 单元测试

```python
# blog/tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Post, Category

class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )

    def test_post_creation(self):
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user,
            category=self.category,
            status='published'
        )
        self.assertEqual(post.title, 'Test Post')
        self.assertEqual(str(post), 'Test Post')

    def test_post_absolute_url(self):
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user,
            category=self.category,
            slug='test-post'
        )
        self.assertEqual(post.get_absolute_url(), '/blog/post/test-post/')

class PostViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user,
            status='published'
        )

    def test_post_list_view(self):
        response = self.client.get('/blog/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Post')

    def test_post_detail_view(self):
        response = self.client.get(f'/blog/post/{self.post.slug}/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Post')
```

### 运行测试

```bash
# 运行所有测试
python manage.py test

# 运行特定应用测试
python manage.py test blog

# 运行特定测试类
python manage.py test blog.tests.PostModelTest

# 显示详细输出
python manage.py test -v 2
```

## 部署

### 生产环境配置

```python
# settings.py
import os

DEBUG = False

ALLOWED_HOSTS = ['example.com', 'www.example.com']

# 数据库
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
    }
}

# 静态文件
STATIC_ROOT = '/var/www/static/'
STATIC_URL = '/static/'

# 媒体文件
MEDIA_ROOT = '/var/www/media/'
MEDIA_URL = '/media/'

# 安全设置
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### Gunicorn + Nginx

```bash
# 安装 Gunicorn
pip install gunicorn

# 运行
gunicorn myproject.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name example.com;

    location /static/ {
        alias /var/www/static/;
    }

    location /media/ {
        alias /var/www/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker 部署

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - '8000:8000'
    environment:
      - DEBUG=0
      - DB_NAME=mydb
      - DB_USER=myuser
      - DB_PASSWORD=mypassword
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=myuser
      - POSTGRES_PASSWORD=mypassword
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 最佳实践

### 1. 项目结构

```
myproject/
├── config/              # 配置目录
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py
│   └── wsgi.py
├── apps/                # 应用目录
│   ├── accounts/
│   ├── blog/
│   └── api/
├── templates/           # 全局模板
├── static/              # 全局静态文件
├── media/               # 用户上传文件
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── tests/               # 测试目录
├── docs/                # 文档
└── manage.py
```

### 2. 环境变量管理

```python
# 使用 django-environ
pip install django-environ

# config/settings/base.py
import environ

env = environ.Env(
    DEBUG=(bool, False)
)

environ.Env.read_env()

DEBUG = env('DEBUG')
SECRET_KEY = env('SECRET_KEY')
DATABASE_URL = env('DATABASE_URL')
```

```bash
# .env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
```

### 3. 代码规范

```python
# 使用 flake8 和 black
pip install flake8 black

# 检查代码
flake8 .

# 格式化代码
black .
```

### 4. 日志配置

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django.log',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'blog': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
        },
    },
}
```

## 常用第三方包

### 推荐包列表

```txt
# requirements/base.txt
django>=4.2
djangorestframework
django-cors-headers
django-filter
pillow
celery
redis
psycopg2-binary

# requirements/development.txt
-r base.txt
pytest
pytest-django
factory-boy
faker
coverage
ipython

# requirements/production.txt
-r base.txt
gunicorn
whitenoise
sentry-sdk
django-redis
```

### 常用包说明

- **django-cors-headers**: CORS 支持
- **django-filter**: API 过滤
- **celery**: 异步任务队列
- **django-allauth**: 社交登录
- **django-debug-toolbar**: 调试工具栏
- **drf-yasg**: API 文档生成

## 学习资源

### 官方文档

- [Django 官方文档](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django Packages](https://djangopackages.org/)

### 社区资源

- [Django Forum](https://forum.djangoproject.com/)
- [Reddit r/django](https://www.reddit.com/r/django/)
- [Awesome Django](https://github.com/wsvincent/awesome-django)

### 教程推荐

1. **官方教程**: Django 官方入门教程
2. **Django Girls**: 适合初学者的教程
3. **Two Scoops of Django**: Django 最佳实践
4. **Django for Beginners**: William S. Vincent

## 版本更新

### Django 4.x 主要特性

- 异步视图支持
- 改进的表单渲染
- 更好的错误页面
- ZoneInfo 时区支持

### 迁移指南

```python
# Django 3.x
from django.utils.timezone import utc

# Django 4.x
from zoneinfo import ZoneInfo
```

## 总结

Django 提供了完整的 Web 开发解决方案:

1. **开箱即用**: 内置 Admin、Auth、ORM 等
2. **安全可靠**: 内置多种安全防护
3. **可扩展**: 丰富的第三方包生态
4. **文档完善**: 优秀的官方文档和社区

掌握 Django 可以帮助你:

- 快速构建 Web 应用
- 保证代码质量和安全性
- 利用成熟的生态系统
- 降低开发和维护成本

Django 遵循 " batteries included" 哲学,是 Python Web 开发的首选框架之一。建议从官方教程开始,逐步深入各个模块。
