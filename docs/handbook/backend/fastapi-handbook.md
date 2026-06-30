# FastAPI 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-30  
> **适用对象**: Python 后端开发者、API 开发工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、路由和请求处理](#二路由和请求处理)
- [三、请求参数](#三请求参数)
- [四、请求体](#四请求体)
- [五、响应模型](#五响应模型)
- [六、依赖注入](#六依赖注入)
- [七、中间件](#七中间件)
- [八、异常处理](#八异常处理)
- [九、数据库集成](#九数据库集成)
- [十、认证和授权](#十认证和授权)
- [十一、文件上传](#十一文件上传)
- [十二、WebSocket](#十二websocket)
- [十三、后台任务](#十三后台任务)
- [十四、测试](#十四测试)
- [十五、部署](#十五部署)
- [十六、最佳实践](#十六最佳实践)

---

## 一、基础概念

### 1.1 什么是 FastAPI

FastAPI 是一个现代、快速（高性能）的 Web 框架，用于基于 Python 3.7+ 构建 API。它基于标准 Python 类型提示，具有自动交互式文档功能。

### 1.2 核心特性

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

### 1.3 项目结构

```
project/
├── app/
│   ├── __init__.py
│   ├── main.py              # 应用入口
│   ├── core/                # 核心配置
│   │   ├── config.py
│   │   └── security.py
│   ├── api/                 # API 路由
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── users.py
│   │   │   │   └── items.py
│   │   │   └── api.py
│   ├── models/              # 数据模型
│   │   ├── user.py
│   │   └── item.py
│   ├── schemas/             # Pydantic 模型
│   │   ├── user.py
│   │   └── item.py
│   ├── services/            # 业务逻辑
│   │   ├── user_service.py
│   │   └── item_service.py
│   ├── database.py          # 数据库连接
│   └── dependencies.py      # 依赖项
├── tests/                   # 测试
├── requirements.txt
└── README.md
```

### 1.4 运行应用

```bash
# 安装
pip install fastapi uvicorn

# 开发环境运行
uvicorn app.main:app --reload

# 生产环境运行
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 1.5 自动文档

```python
app = FastAPI(
    title="My API",
    description="API description",
    version="1.0.0",
    docs_url="/docs",        # Swagger UIx
    redoc_url="/redoc",      # ReDoc
    openapi_url="/openapi.json"
)
```

访问：

```text

- http://localhost:8000/docs - Swagger UI
- http://localhost:8000/redoc - ReDoc

```

---

## 二、路由和请求处理

### 2.1 HTTP 方法

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/")
def read_items():
    return {"method": "GET"}

@app.post("/items/")
def create_item():
    return {"method": "POST"}

@app.put("/items/{item_id}")
def update_item(item_id: int):
    return {"method": "PUT", "item_id": item_id}

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    return {"method": "DELETE", "item_id": item_id}

@app.patch("/items/{item_id}")
def patch_item(item_id: int):
    return {"method": "PATCH", "item_id": item_id}
```

### 2.2 路径参数

```python
@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}

@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}
```

### 2.3 查询参数

```python
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/items/")
def read_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    q: str = Query(None, min_length=0, max_length=50)
):
    return {"skip": skip, "limit": limit, "q": q}
```

### 2.4 请求头

```python
from fastapi import Header

@app.get("/items/")
def read_items(user_agent: str = Header(None)):
    return {"User-Agent": user_agent}

@app.get("/items/")
def read_items(x_token: str = Header(...)):
    return {"X-Token": x_token}
```

### 2.5 Cookie

```python
from fastapi import Cookie

@app.get("/items/")
def read_items(session_id: str = Cookie(None)):
    return {"session_id": session_id}
```

### 2.6 响应状态码

```python
from fastapi import status

@app.post("/items/", status_code=status.HTTP_201_CREATED)
def create_item():
    return {"message": "Item created"}

@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    return None
```

### 2.7 标签和分组

```python
@app.get("/items/", tags=["items"])
def read_items():
    return []

@app.get("/users/", tags=["users"])
def read_users():
    return []
```

---

## 三、请求参数

### 3.1 路径参数验证

```python
from fastapi import Path

@app.get("/items/{item_id}")
def read_item(
    item_id: int = Path(..., gt=0, description="The ID of the item")
):
    return {"item_id": item_id}

@app.get("/items/{item_id}")
def read_item(
    item_id: str = Path(..., min_length=3, max_length=50, pattern="^[a-z]+$")
):
    return {"item_id": item_id}
```

### 3.2 查询参数验证

```python
from typing import Optional, List
from fastapi import Query

@app.get("/items/")
def read_items(
    q: Optional[str] = Query(None, min_length=0, max_length=50),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    tags: Optional[List[str]] = Query(None)
):
    return {"q": q, "skip": skip, "limit": limit, "tags": tags}
```

### 3.3 必需和可选参数

```python
# 必需参数
@app.get("/items/")
def read_items(required_param: str):
    return {"required_param": required_param}

# 可选参数
@app.get("/items/")
def read_items(optional_param: str = None):
    return {"optional_param": optional_param}

# 带默认值
@app.get("/items/")
def read_items(default_param: str = "default"):
    return {"default_param": default_param}
```

### 3.4 别名参数

```python
@app.get("/items/")
def read_items(item_query: str = Query(..., alias="item-q")):
    return {"item_query": item_query}
```

---

## 四、请求体

### 4.1 Pydantic 模型

```python
from pydantic import BaseModel, Field
from typing import Optional

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be positive")
    tax: Optional[float] = None

    class Config:
        schema_extra = {
            "example": {
                "name": "Foo",
                "description": "An example item",
                "price": 35.4,
                "tax": 3.2
            }
        }

@app.post("/items/")
def create_item(item: Item):
    return item
```

### 4.2 嵌套模型

```python
class Address(BaseModel):
    street: str
    city: str
    country: str

class User(BaseModel):
    name: str
    age: int
    address: Address

@app.post("/users/")
def create_user(user: User):
    return user
```

### 4.3 列表和字典

```python
from typing import List, Dict

@app.post("/items/")
def create_items(items: List[Item]):
    return items

@app.post("/metadata/")
def create_metadata(metadata: Dict[str, Any]):
    return metadata
```

### 4.4 混合参数

```python
@app.put("/items/{item_id}")
def update_item(
    item_id: int,
    item: Item,
    q: str = None
):
    return {"item_id": item_id, "item": item, "q": q}
```

### 4.5 额外验证

```python
from pydantic import EmailStr, HttpUrl, validator

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    website: HttpUrl
    age: int = Field(..., ge=0, le=150)

    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'must be alphanumeric'
        return v

    @validator('age')
    def check_age(cls, v):
        if v < 18:
            raise ValueError('Must be 18 or older')
        return v
```

---

## 五、响应模型

### 5.1 响应模型

```python
from fastapi.responses import JSONResponse

@app.post("/items/", response_model=Item)
def create_item(item: Item):
    return item

@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: int):
    return {"name": "Foo", "price": 50.0}
```

### 5.2 排除字段

```python
class UserOut(BaseModel):
    username: str
    email: str

class UserInDB(UserOut):
    hashed_password: str

@app.get("/users/{user_id}", response_model=UserOut)
def read_user(user_id: int):
    # hashed_password 会被自动排除
    return {"username": "john", "email": "john@example.com", "hashed_password": "secret"}
```

### 5.3 自定义响应

```python
from fastapi.responses import HTMLResponse, PlainTextResponse, RedirectResponse

@app.get("/html/", response_class=HTMLResponse)
def read_html():
    return "<h1>Hello World</h1>"

@app.get("/text/", response_class=PlainTextResponse)
def read_text():
    return "Hello World"

@app.get("/redirect/")
def read_redirect():
    return RedirectResponse(url="/")
```

### 5.4 文件响应

```python
from fastapi.responses import FileResponse

@app.get("/file/")
def read_file():
    return FileResponse("myfile.pdf")
```

### 5.5 流式响应

```python
from fastapi.responses import StreamingResponse

async def generate_data():
    for i in range(10):
        yield f"data {i}\n"

@app.get("/stream/")
def stream_data():
    return StreamingResponse(generate_data())
```

### 5.6 响应头

```python
from fastapi import Response

@app.get("/headers/")
def get_headers(response: Response):
    response.headers["X-Custom-Header"] = "value"
    return {"message": "Hello"}
```

---

## 六、依赖注入

### 6.1 基本依赖

```python
from fastapi import Depends

def common_parameters(q: str = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
def read_items(commons: dict = Depends(common_parameters)):
    return commons
```

### 6.2 类依赖

```python
class CommonQueryParams:
    def __init__(self, q: str = None, skip: int = 0, limit: int = 100):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/items/")
def read_items(commons: CommonQueryParams = Depends()):
    return commons
```

### 6.3 子依赖

```python
def query_extractor(q: str = None):
    return q

def query_or_cookie_extractor(
    q: str = Depends(query_extractor),
    last_query: str = Cookie(None)
):
    if not q:
        return last_query
    return q

@app.get("/items/")
def read_items(q_or_cookie: str = Depends(query_or_cookie_extractor)):
    return {"q_or_cookie": q_or_cookie}
```

### 6.4 全局依赖

```python
app = FastAPI(dependencies=[Depends(verify_token)])

# 或在路由中
@app.get("/items/", dependencies=[Depends(verify_token)])
def read_items():
    return []
```

### 6.5 依赖覆盖

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 测试时覆盖
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
```

### 6.6 安全依赖

```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/users/me/")
def read_users_me(token: str = Depends(oauth2_scheme)):
    return {"token": token}
```

---

## 七、中间件

### 7.1 自定义中间件

```python
import time
from starlette.middleware.base import BaseHTTPMiddleware

class CustomMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

app.add_middleware(CustomMiddleware)
```

### 7.2 CORS 中间件

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或指定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 7.3 GZip 中间件

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### 7.4 HTTPSRedirect 中间件

```python
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
```

### 7.5 TrustedHost 中间件

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["example.com"])
```

---

## 八、异常处理

### 8.1 HTTPException

```python
from fastapi import HTTPException

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail=f"Item {item_id} not found",
            headers={"X-Error": "Item not found"}
        )
    return items[item_id]
```

### 8.2 自定义异常处理器

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class UnicornException(Exception):
    def __init__(self, name: str):
        self.name = name

@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    return JSONResponse(
        status_code=418,
        content={"message": f"Oops! {exc.name} did something."},
    )

@app.get("/unicorns/{name}")
def read_unicorn(name: str):
    if name == "yolo":
        raise UnicornException(name=name)
    return {"unicorn_name": name}
```

### 8.3 重写默认异常处理器

```python
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )
```

### 8.4 常用状态码

```python
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
422 Unprocessable Entity
500 Internal Server Error
```

---

## 九、数据库集成

### 9.1 SQLAlchemy 同步

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 依赖项
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 模型
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
```

### 9.2 SQLAlchemy 异步

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# 使用
@app.get("/users/")
async def read_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()
```

### 9.3 Tortoise ORM

```python
from tortoise.contrib.fastapi import register_tortoise
from tortoise.models import Model
from tortoise import fields

class User(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50)
    email = fields.CharField(max_length=100, unique=True)

register_tortoise(
    app,
    db_url="sqlite://db.sqlite3",
    modules={"models": ["app.models"]},
    generate_schemas=True,
)

@app.get("/users/")
async def read_users():
    return await User.all()
```

### 9.4 MongoDB (Motor)

```python
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.test_database

@app.get("/items/")
async def read_items():
    items = await db.items.find().to_list(100)
    return items

@app.post("/items/")
async def create_item(item: Item):
    result = await db.items.insert_one(item.dict())
    return {"id": str(result.inserted_id)}
```

---

## 十、认证和授权

### 10.1 OAuth2 Password Flow

```python
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### 10.2 Token 端点

```python
from fastapi import Depends, HTTPException, status
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    email: str

fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "email": "john@example.com",
        "hashed_password": "$2b$12$...",
    }
}

def authenticate_user(fake_db, username: str, password: str):
    user = fake_db.get(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}
```

### 10.3 获取当前用户

```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### 10.4 JWT 认证

```python
from fastapi_jwt_auth import AuthJWT

class Settings(BaseModel):
    authjwt_secret_key: str = "secret"

@AuthJWT.load_config
def get_config():
    return Settings()

@app.post('/login')
def login(auth: AuthJWT = Depends()):
    auth.set_access_cookies(jwt_token)
    return {"msg": "Successfully logged in"}

@app.get('/protected')
def protected(auth: AuthJWT = Depends()):
    auth.jwt_required()
    current_user = auth.get_jwt_subject()
    return {"user": current_user}
```

### 10.5 RBAC 权限控制

```python
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"

def require_role(role: Role):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    return role_checker

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_role(Role.ADMIN))
):
    return {"message": "User deleted"}
```

---

## 十一、文件上传

### 11.1 单文件上传

```python
from fastapi import UploadFile, File

@app.post("/upload/")
def upload_file(file: UploadFile = File(...)):
    return {"filename": file.filename, "content_type": file.content_type}
```

### 11.2 多文件上传

```python
from typing import List

@app.post("/upload/multiple/")
def upload_files(files: List[UploadFile] = File(...)):
    return {"filenames": [file.filename for file in files]}
```

### 11.3 保存文件

```python
import shutil
from pathlib import Path

@app.post("/upload/save/")
def upload_and_save(file: UploadFile = File(...)):
    file_path = Path(f"uploads/{file.filename}")
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename}
```

### 11.4 文件大小限制

```python
@app.post("/upload/")
def upload_file(file: UploadFile = File(..., max_size=10 * 1024 * 1024)):
    # 最大 10MB
    return {"filename": file.filename}
```

### 11.5 文件类型验证

```python
from fastapi import HTTPException

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}

@app.post("/upload/image/")
def upload_image(file: UploadFile = File(...)):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    return {"filename": file.filename}
```

---

## 十二、WebSocket

### 12.1 基本 WebSocket

```python
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message received: {data}")
```

### 12.2 WebSocket 广播

```python
from fastapi import WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"User says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("User left the chat")
```

### 12.3 JSON WebSocket

```python
@app.websocket("/ws/json")
async def websocket_json(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        await websocket.send_json({"response": data})
```

---

## 十三、后台任务

### 13.1 BackgroundTasks

```python
from fastapi import BackgroundTasks

def write_notification(email: str, message: str):
    with open("log.txt", mode="w") as f:
        f.write(f"Notification to {email}: {message}\n")

@app.post("/send-notification/{email}")
def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_notification, email, "Hello!")
    return {"message": "Notification sent in the background"}
```

### 13.2 Celery 集成

```python
from celery import Celery

celery_app = Celery('tasks', broker='redis://localhost:6379/0')

@celery_app.task
def long_task(data: dict):
    # 长时间运行的任务
    return {"result": "completed"}

@app.post("/tasks/")
def create_task(data: dict):
    task = long_task.delay(data)
    return {"task_id": task.id}

@app.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    task = long_task.AsyncResult(task_id)
    return {"status": task.status, "result": task.result}
```

### 13.3 APScheduler

```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

def scheduled_job():
    print("Running scheduled job")

scheduler.add_job(scheduled_job, 'interval', minutes=1)
scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
```

---

## 十四、测试

### 14.1 TestClient

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}

def test_create_item():
    response = client.post(
        "/items/",
        json={"name": "Test", "price": 10.5}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test"
```

### 14.2 异步测试

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_read_items():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/items/")
    assert response.status_code == 200
```

### 14.3 测试数据库

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
```

### 14.4 认证测试

```python
def test_protected_route():
    # 未认证
    response = client.get("/users/me/")
    assert response.status_code == 401

    # 已认证
    token = get_test_token()
    response = client.get(
        "/users/me/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
```

### 14.5 运行测试

```bash
# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest tests/

# 带覆盖率
pytest --cov=app tests/
```

---

## 十五、部署

### 15.1 Uvicorn + Gunicorn

```bash
# 安装
pip install gunicorn uvicorn

# 运行
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 15.2 Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  api:
    build: .
    ports:
      - '8000:8000'
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/dbname
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: dbname
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

### 15.3 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 15.4 环境变量配置

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "My API"
    admin_email: str
    database_url: str
    secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()
```

```bash
# .env
APP_NAME=My API
ADMIN_EMAIL=admin@example.com
DATABASE_URL=postgresql://user:pass@localhost/dbname
SECRET_KEY=your-secret-key
```

### 15.5 监控和健康检查

```python
@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/metrics")
def metrics():
    return {
        "uptime": time.time() - start_time,
        "requests": request_count
    }
```

---

## 十六、最佳实践

### 16.1 项目结构优化

```
app/
├── api/
│   └── v1/
│       ├── endpoints/
│       ├── routers/
│       └── dependencies.py
├── core/
│   ├── config.py
│   ├── security.py
│   └── database.py
├── models/
├── schemas/
├── services/
├── utils/
└── main.py
```

### 16.2 配置管理

```python
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI App"
    debug: bool = False
    database_url: str

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

### 16.3 日志记录

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/items/")
def read_items():
    logger.info("Reading items")
    try:
        items = get_items()
        logger.info(f"Found {len(items)} items")
        return items
    except Exception as e:
        logger.error(f"Error reading items: {e}")
        raise
```

### 16.4 速率限制

```python
from slowapi import Limiter, RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/items/")
@limiter.limit("5/minute")
def read_items(request: Request):
    return []

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded"}
    )
```

### 16.5 缓存

```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost", encoding="utf8")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

@app.get("/items/")
@cache(expire=60)
async def read_items():
    return await get_items_from_db()
```

### 16.6 API 版本控制

```python
from fastapi import APIRouter

api_v1 = APIRouter(prefix="/api/v1")
api_v2 = APIRouter(prefix="/api/v2")

@api_v1.get("/items/")
def read_items_v1():
    return {"version": "v1"}

@api_v2.get("/items/")
def read_items_v2():
    return {"version": "v2"}

app.include_router(api_v1)
app.include_router(api_v2)
```

### 16.7 性能优化

```python
# 1. 使用异步函数
@app.get("/items/")
async def read_items():
    return await fetch_items()

# 2. 数据库连接池
engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=0)

# 3. 响应压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 4. 缓存频繁访问的数据
@lru_cache(maxsize=128)
def get_config():
    return load_config()
```

### 16.8 安全建议

```python
# 1. CORS 配置
app.add_middleware(CORSMiddleware, allow_origins=["https://trusted-domain.com"])

# 2. HTTPS
app.add_middleware(HTTPSRedirectMiddleware)

# 3. 输入验证
# 使用 Pydantic 模型验证所有输入

# 4. SQL 注入防护
# 使用 ORM 或参数化查询

# 5. 密码哈希
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"])

# 6. JWT Token 过期
create_access_token(data, expires_delta=timedelta(minutes=30))
```

### 16.9 文档优化

```python
app = FastAPI(
    title="My API",
    description="""
    This is a comprehensive API documentation.

    ## Features
    - User management
    - Item CRUD operations
    - Authentication
    """,
    version="1.0.0",
    contact={
        "name": "API Support",
        "email": "support@example.com",
    },
    license_info={
        "name": "MIT",
    },
)
```

### 16.10 错误处理统一

```python
class AppException(Exception):
    def __init__(self, message: str, code: str, status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.code, "message": exc.message}
    )

# 使用
raise AppException("Item not found", "ITEM_NOT_FOUND", 404)
```

---

## 附录

### A. 常用命令

```bash
# 安装 FastAPI
pip install fastapi uvicorn

# 安装额外依赖
pip install python-multipart    # 文件上传
pip install python-jose[cryptography]  # JWT
pip install passlib[bcrypt]     # 密码哈希
pip install sqlalchemy          # ORM
pip install alembic             # 数据库迁移
pip install pytest httpx        # 测试

# 开发运行
uvicorn app.main:app --reload

# 生产运行
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# 生成 requirements
pip freeze > requirements.txt

# 数据库迁移
alembic init migrations
alembic revision --autogenerate -m "migration message"
alembic upgrade head
```

### B. 有用的资源

- **官方文档**: https://fastapi.tiangolo.com/
- **GitHub**: https://github.com/tiangolo/fastapi
- **Awesome FastAPI**: https://github.com/mjhea8/awesome-fastapi
- **FastAPI Users**: https://fastapi-users.github.io/fastapi-users/
- **SQLModel**: https://sqlmodel.tiangolo.com/

### C. 学习路线

```
Python 基础 → FastAPI 基础 → Pydantic → 数据库集成 → 认证授权 → 测试 → 部署

1. Python 3.7+ 和类型提示
2. FastAPI 核心概念（路由、参数、响应）
3. Pydantic 数据验证
4. 依赖注入系统
5. 数据库集成（SQLAlchemy/Tortoise）
6. 认证和授权（OAuth2/JWT）
7. 文件上传和 WebSocket
8. 测试（pytest/TestClient）
9. 部署（Docker/Nginx/Gunicorn）
10. 性能优化和监控
```

### D. 常见第三方库

```
认证:
- python-jose (JWT)
- passlib (密码哈希)
- fastapi-users (完整用户系统)

数据库:
- sqlalchemy (ORM)
- tortoise-orm (异步 ORM)
- motor (MongoDB)
- alembic (迁移)

缓存:
- redis
- fastapi-cache

任务队列:
- celery
- arq

测试:
- pytest
- httpx
- factory-boy

工具:
- python-dotenv (环境变量)
- slowapi (速率限制)
- sentry-sdk (错误追踪)
```

---

**祝您 FastAPI 开发愉快！** 🚀

如有问题，请查阅官方文档或社区论坛。
