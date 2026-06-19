# NestJS 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: Node.js 后端开发者、TypeScript 开发者

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、模块系统](#二模块系统)
- [三、控制器](#三控制器)
- [四、提供者](#四提供者)
- [五、依赖注入](#五依赖注入)
- [六、中间件](#六中间件)
- [七、异常过滤器](#七异常过滤器)
- [八、管道](#八管道)
- [九、守卫](#九守卫)
- [十、拦截器](#十拦截器)
- [十一、自定义装饰器](#十一自定义装饰器)
- [十二、数据库集成](#十二数据库集成)
- [十三、验证和序列化](#十三验证和序列化)
- [十四、认证和授权](#十四认证和授权)
- [十五、测试](#十五测试)
- [十六、最佳实践](#十六最佳实践)

---

## 一、基础概念

### 1.1 什么是 NestJS

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架。它使用 TypeScript 构建，结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数响应式编程）的元素。

### 1.2 核心特性

```typescript
// 基于装饰器的元数据编程
@Controller('users')
export class UsersController {
  @Get()
  findAll(): string {
    return 'This action returns all users'
  }
}

// 依赖注入
@Injectable()
export class UsersService {
  private readonly users: User[] = []

  create(user: User): void {
    this.users.push(user)
  }
}

// 模块化架构
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### 1.3 项目结构

```
src/
├── app.module.ts          # 根模块
├── main.ts                # 应用入口
├── users/                 # 功能模块
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   └── create-user.dto.ts
│   └── entities/
│       └── user.entity.ts
├── common/                # 共享模块
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── decorators/
└── config/                # 配置
    └── configuration.ts
```

### 1.4 生命周期

```typescript
@Injectable()
export class UserService implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    console.log('Module initialized')
  }

  onModuleDestroy() {
    console.log('Module destroyed')
  }
}
```

---

## 二、模块系统

### 2.1 基本模块

```typescript
import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 导出供其他模块使用
})
export class UsersModule {}
```

### 2.2 模块导入

```typescript
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './users/users.module'
import { User } from './users/entities/user.entity'

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User])],
})
export class AppModule {}
```

### 2.3 动态模块

```typescript
import { Module, DynamicModule } from '@nestjs/common'
import { ConfigModule } from './config.module'

@Module({})
export class DatabaseModule {
  static forRoot(options: any): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
      ],
      exports: ['DATABASE_OPTIONS'],
    }
  }
}
```

### 2.4 全局模块

```typescript
import { Global, Module } from '@nestjs/common'

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

### 2.5 模块引用

```typescript
// forwardRef 解决循环依赖
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class DogsModule {}
```

---

## 三、控制器

### 3.1 基本控制器

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'

@Controller('users')
export class UsersController {
  @Get()
  findAll(): string {
    return 'This action returns all users'
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `This action returns user #${id}`
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): string {
    return 'This action adds a new user'
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): string {
    return `This action updates user #${id}`
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return `This action removes user #${id}`
  }
}
```

### 3.2 请求装饰器

```typescript
import {
  Controller,
  Get,
  Req,
  Res,
  Headers,
  Query,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Controller('users')
export class UsersController {
  @Get()
  findAll(
    @Req() request: Request,
    @Res() response: Response,
    @Headers('authorization') auth: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return { page, limit }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return createUserDto
  }
}
```

### 3.3 路由通配符

```typescript
@Controller('ab*cd')
export class AbcdController {
  @Get()
  findAll() {
    return 'This route uses a wildcard'
  }
}
```

### 3.4 状态码和头部

```typescript
import { Controller, Post, HttpStatus, Header, Redirect } from '@nestjs/common'

@Controller('users')
export class UsersController {
  @Post()
  @HttpStatus(201)
  @Header('Cache-Control', 'none')
  create() {
    return 'This action adds a new user'
  }

  @Get('redirect')
  @Redirect('https://nestjs.com', 301)
  redirect() {
    return { url: 'https://nestjs.com', statusCode: 301 }
  }
}
```

### 3.5 异步控制器

```typescript
@Controller('users')
export class UsersController {
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id)
  }
}
```

### 3.6 流式响应

```typescript
import { Controller, Get, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { join } from 'path'

@Controller('files')
export class FilesController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'))
    return new StreamableFile(file)
  }
}
```

---

## 四、提供者

### 4.1 服务提供者

```typescript
import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {
  private readonly users: User[] = []

  create(user: User): User {
    this.users.push(user)
    return user
  }

  findAll(): User[] {
    return this.users
  }

  findOne(id: string): User {
    return this.users.find((user) => user.id === id)
  }
}
```

### 4.2 值提供者

```typescript
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: {
        apiKey: 'secret',
        apiUrl: 'https://api.example.com',
      },
    },
  ],
})
export class AppModule {}
```

### 4.3 类提供者

```typescript
@Module({
  providers: [
    {
      provide: UsersService,
      useClass: MockUsersService, // 用于测试
    },
  ],
})
export class TestModule {}
```

### 4.4 工厂提供者

```typescript
@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useFactory: (optionsProvider: OptionsProvider) => {
        const options = optionsProvider.get()
        return new DatabaseConnection(options)
      },
      inject: [OptionsProvider],
    },
  ],
})
export class DatabaseModule {}
```

### 4.5 异步提供者

```typescript
@Module({
  providers: [
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async () => {
        const connection = await createConnection()
        return connection
      },
    },
  ],
})
export class DatabaseModule {}
```

### 4.6 可选提供者

```typescript
@Injectable()
export class HttpService {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private readonly options: any) {}
}
```

---

## 五、依赖注入

### 5.1 构造函数注入

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}
}
```

### 5.2 属性注入

```typescript
@Injectable()
export class AppService {
  @Inject('CONFIG')
  private readonly config: any
}
```

### 5.3 Setter 注入

```typescript
@Injectable()
export class AppService {
  private _logger: Logger

  set logger(logger: Logger) {
    this._logger = logger
  }
}
```

### 5.4 循环依赖

```typescript
// forwardRef 解决循环依赖
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => DogsService))
    private readonly dogsService: DogsService,
  ) {}
}

@Injectable()
export class DogsService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private readonly catsService: CatsService,
  ) {}
}
```

### 5.5 作用域

```typescript
import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}

@Injectable({ scope: Scope.TRANSIENT })
export class DogsService {}
```

---

## 六、中间件

### 6.1 函数式中间件

```typescript
export function logger(req: Request, res: Response, next: Function) {
  console.log(`Request...`)
  next()
}

// 在模块中应用
@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes('cats')
  }
}
```

### 6.2 类中间件

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...')
    next()
  }
}
```

### 6.3 中间件配置

```typescript
@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'cats', method: RequestMethod.GET },
        { path: 'cats', method: RequestMethod.POST },
      )
      .forRoutes(CatsController)
  }
}
```

### 6.4 全局中间件

```typescript
const app = await NestFactory.create(AppModule)
app.use(logger)
await app.listen(3000)
```

---

## 七、异常过滤器

### 7.1 内置异常

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common'

throw new BadRequestException('Validation failed')
throw new UnauthorizedException('Invalid credentials')
throw new NotFoundException(`User #${id} not found`)
```

### 7.2 自定义异常

```typescript
import { HttpException, HttpStatus } from '@nestjs/common'

export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN)
  }
}

export class CustomHttpException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(
      {
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
      },
      status,
    )
  }
}
```

### 7.3 异常过滤器

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    })
  }
}
```

### 7.4 绑定过滤器

```typescript
// 方法级别
@UseFilters(HttpExceptionFilter)
@Get()
findAll() {
    throw new ForbiddenException();
}

// 控制器级别
@Controller('cats')
@UseFilters(HttpExceptionFilter)
export class CatsController {}

// 全局级别
app.useGlobalFilters(new HttpExceptionFilter());
```

### 7.5 捕获所有异常

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception instanceof Error ? exception.message : 'Internal server error',
    })
  }
}
```

---

## 八、管道

### 8.1 内置管道

```typescript
import { ValidationPipe, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';

// 全局使用
app.useGlobalPipes(new ValidationPipe());

// 参数级别
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catsService.findOne(id);
}

@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.catsService.findOne(id);
}
```

### 8.2 自定义管道

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!this.isObject(value)) {
      throw new BadRequestException('Validation failed')
    }
    return value
  }

  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object'
  }
}
```

### 8.3 类型验证管道

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    const object = plainToInstance(metatype, value)
    const errors = await validate(object)

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed')
    }

    return object
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }
}
```

### 8.4 绑定管道

```typescript
// 参数级别
@Post()
create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
}

// 方法级别
@Post()
@UsePipes(new ValidationPipe())
create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
}

// 控制器级别
@Controller('cats')
@UsePipes(new ValidationPipe())
export class CatsController {}

// 全局级别
app.useGlobalPipes(new ValidationPipe());
```

---

## 九、守卫

### 9.1 角色守卫

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export enum Role {
  User = 'user',
  Admin = 'admin',
}

export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some((role) => user.roles?.includes(role))
  }
}
```

### 9.2 JWT 守卫

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload = this.jwtService.verify(token)
      request['user'] = payload
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
```

### 9.3 绑定守卫

```typescript
// 方法级别
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
findAll() {
    return this.catsService.findAll();
}

// 控制器级别
@Controller('cats')
@UseGuards(JwtAuthGuard)
export class CatsController {}

// 全局级别
app.useGlobalGuards(new JwtAuthGuard());
```

---

## 十、拦截器

### 10.1 日志拦截器

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...')

    const now = Date.now()
    return next.handle().pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)))
  }
}
```

### 10.2 转换拦截器

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((data) => ({ data })))
  }
}
```

### 10.3 超时拦截器

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common'
import { Observable, throwError, TimeoutError } from 'rxjs'
import { timeout, catchError } from 'rxjs/operators'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => err)
      }),
    )
  }
}
```

### 10.4 缓存拦截器

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map()

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const key = this.trackBy(context)
    const cachedResponse = this.cache.get(key)

    if (cachedResponse) {
      return of(cachedResponse)
    }

    return next.handle().pipe(tap((response) => this.cache.set(key, response)))
  }

  private trackBy(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest()
    return request.url
  }
}
```

### 10.5 绑定拦截器

```typescript
// 方法级别
@Get()
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
findAll() {
    return this.catsService.findAll();
}

// 控制器级别
@Controller('cats')
@UseInterceptors(LoggingInterceptor)
export class CatsController {}

// 全局级别
app.useGlobalInterceptors(new LoggingInterceptor());
```

---

## 十一、自定义装饰器

### 11.1 参数装饰器

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

// 使用
@Get()
findAll(@User() user: UserEntity) {
    return this.catsService.findAllByUser(user);
}
```

### 11.2 方法装饰器

```typescript
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);

// 使用
@Get()
@Public()
findAll() {
    return this.catsService.findAll();
}
```

### 11.3 类装饰器

```typescript
import { applyDecorators, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from './auth.guard'
import { LoggingInterceptor } from './logging.interceptor'

export function Authenticated() {
  return applyDecorators(UseGuards(AuthGuard), UseInterceptors(LoggingInterceptor))
}

// 使用
@Controller('cats')
@Authenticated()
export class CatsController {}
```

### 11.4 属性装饰器

```typescript
import { applyDecorators } from '@nestjs/common'

export function ReadOnly() {
  return applyDecorators()
  // 可以组合多个装饰器
}

// 使用
export class User {
  @ReadOnly()
  id: string
}
```

---

## 十二、数据库集成

### 12.1 TypeORM 集成

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './users/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'password',
      database: 'test',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
})
export class AppModule {}
```

### 12.2 Entity 定义

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ unique: true })
  email: string

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

### 12.3 Repository 使用

```typescript
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id })
  }

  create(user: Partial<User>): Promise<User> {
    return this.usersRepository.save(user)
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, user)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id)
  }
}
```

### 12.4 Mongoose 集成

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/test'),
    MongooseModule.forFeature([{ name: 'Cat', schema: CatSchema }]),
  ],
})
export class AppModule {}

// cat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type CatDocument = Cat & Document

@Schema()
export class Cat {
  @Prop()
  name: string

  @Prop()
  age: number

  @Prop()
  breed: string
}

export const CatSchema = SchemaFactory.createForClass(Cat)
```

### 12.5 Prisma 集成

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany()
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data })
  }
}
```

---

## 十三、验证和序列化

### 13.1 DTO 定义

```typescript
import { IsString, IsInt, IsEmail, Min, Max, IsOptional } from 'class-validator'

export class CreateUserDto {
  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsEmail()
  email: string

  @IsInt()
  @Min(0)
  @Max(150)
  age: number

  @IsOptional()
  @IsString()
  bio?: string
}
```

### 13.2 验证管道

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 移除未装饰的属性
      forbidNonWhitelisted: true, // 抛出错误如果有未装饰的属性
      transform: true, // 自动转换类型
    }),
  )
  await app.listen(3000)
}
```

### 13.3 自定义验证

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class IsAlreadyExistConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // 检查值是否已存在
    return false
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} already exists`
  }
}

export function IsAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlreadyExistConstraint,
    })
  }
}
```

### 13.4 序列化

```typescript
import { Exclude, Expose, Transform } from 'class-transformer';

export class UserEntity {
    id: number;
    firstName: string;
    lastName: string;
    email: string;

    @Exclude()
    password: string;

    @Expose()
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    @Transform(({ value }) => value.toUpperCase())
    username: string;
}

// 使用
@Get()
@UseInterceptors(new ClassSerializerInterceptor())
findAll(): UserEntity[] {
    return this.usersService.findAll();
}
```

---

## 十四、认证和授权

### 14.1 Passport 策略

```typescript
// local.strategy.ts
import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super()
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
```

### 14.2 JWT 策略

```typescript
// jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey',
    })
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username }
  }
}
```

### 14.3 认证服务

```typescript
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username)
    if (user && user.password === pass) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
```

### 14.4 认证控制器

```typescript
import { Controller, Request, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user)
  }
}
```

### 14.5 RBAC 授权

```typescript
// rbac.decorator.ts
export enum Role {
    User = 'user',
    Admin = 'admin',
    Moderator = 'moderator',
}

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// rbac.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.roles?.includes(role));
    }
}

// 使用
@Post()
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
create(@Body() createDto: CreateDto) {
    return this.service.create(createDto);
}
```

---

## 十五、测试

### 15.1 单元测试

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { UsersRepository } from './users.repository'

describe('UsersService', () => {
  let service: UsersService
  let repository: UsersRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get<UsersRepository>(UsersRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return all users', async () => {
    const result = await service.findAll()
    expect(result).toEqual([])
  })
})
```

### 15.2 E2E 测试

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!')
  })
})
```

### 15.3 Mock 提供者

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UsersService,
      {
        provide: getRepositoryToken(User),
        useValue: mockRepository,
      },
    ],
  }).compile()

  service = module.get<UsersService>(UsersService)
})

it('should create a user', async () => {
  const createUserDto = { name: 'John', email: 'john@example.com' }
  mockRepository.save.mockResolvedValue(createUserDto)

  const result = await service.create(createUserDto)
  expect(result).toEqual(createUserDto)
  expect(mockRepository.save).toHaveBeenCalledWith(createUserDto)
})
```

---

## 十六、最佳实践

### 16.1 项目结构

```
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── configuration.ts
│   └── validation.schema.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── middleware/
├── modules/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── interfaces/
│   └── auth/
└── shared/
    ├── services/
    └── utils/
```

### 16.2 配置管理

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
})

// 使用 ConfigModule
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}
```

### 16.3 环境变量

```typescript
// .env
PORT = 3000
DATABASE_HOST = localhost
DATABASE_PORT = 5432
JWT_SECRET = secret
```

### 16.4 日志记录

```typescript
import { Logger } from '@nestjs/common'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  findAll() {
    this.logger.log('Finding all users')
    try {
      // logic
    } catch (error) {
      this.logger.error('Failed to find users', error.stack)
    }
  }
}
```

### 16.5 性能优化

```typescript
// 启用压缩
import { CompressionMiddleware } from '@nestjs/platform-express'
app.use(compression())

// 缓存
import { CacheModule } from '@nestjs/cache-manager'
@Module({
  imports: [
    CacheModule.register({
      ttl: 5, // seconds
      max: 10, // maximum number of items in cache
    }),
  ],
})
export class AppModule {}

// 速率限制
import { ThrottlerModule } from '@nestjs/throttler'
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
})
export class AppModule {}
```

### 16.6 安全建议

```typescript
// Helmet
import { helmet } from 'helmet'
app.use(helmet())

// CORS
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
})

// Rate limiting
// 见上面

// Input validation
// 使用 ValidationPipe

// SQL injection prevention
// 使用 ORM 或参数化查询
```

### 16.7 文档生成

```typescript
// Swagger
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('users')
    .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

// DTO 示例
@ApiProperty({ example: 'John Doe' })
name: string;

@ApiProperty({ example: 'john@example.com' })
email: string;
```

---

## 附录

### A. 常用命令

```bash
# 创建新项目
nest new project-name

# 生成模块
nest g module users

# 生成控制器
nest g controller users

# 生成服务
nest g service users

# 生成守卫
nest g guard auth

# 生成拦截器
nest g interceptor logging

# 生成管道
nest g pipe validation

# 生成过滤器
nest g filter http-exception

# 运行开发服务器
npm run start:dev

# 构建生产版本
npm run build

# 运行测试
npm run test
npm run test:e2e
npm run test:cov
```

### B. 有用的资源

- **官方文档**: https://docs.nestjs.com/
- **GitHub**: https://github.com/nestjs/nest
- **Awesome NestJS**: https://github.com/nestjs/awesome-nestjs
- **Discord**: https://discord.gg/nestjs

### C. 学习路线

```
Node.js 基础 → Express → TypeScript → NestJS 基础 → 高级特性 → 微服务

1. Node.js 和 Express 基础
2. TypeScript 进阶
3. NestJS 核心概念（模块、控制器、提供者）
4. 依赖注入和 IoC
5. 中间件、守卫、拦截器、管道
6. 数据库集成（TypeORM/Mongoose/Prisma）
7. 认证和授权
8. 测试（单元/E2E）
9. 微服务架构
10. 部署和监控
```

---

**祝您 NestJS 开发愉快！** 🚀

如有问题，请查阅官方文档或社区论坛。
