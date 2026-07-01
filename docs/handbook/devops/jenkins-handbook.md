# Jenkins 手册

> **版本**: 1.0  
> **最后更新**: 2026-07-02  
> **适用对象**: DevOps 工程师、CI/CD 管理员、后端开发人员

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、安装与配置](#二安装与配置)
- [三、核心概念](#三核心概念)
- [四、Pipeline 语法](#四pipeline-语法)
- [五、常用插件](#五常用插件)
- [六、凭证管理](#六凭证管理)
- [七、构建触发器](#七构建触发器)
- [八、通知与报告](#八通知与报告)
- [九、最佳实践](#九最佳实践)
- [十、故障排查](#十故障排查)
- [十一、实用示例](#十一实用示例)

---

## 一、基础概念

### 1.1 Jenkins 是什么

Jenkins 是一个开源的自动化服务器，用于构建、测试和部署软件。

**特点**：

- 🔄 持续集成/持续部署 (CI/CD)
- 🔌 丰富的插件生态系统（1500+ 插件）
- 💻 跨平台支持
- 📊 可视化构建流程
- 🛠️ 高度可定制

### 1.2 架构模型

```
Developer → Git Repository
                ↓
        Jenkins Master
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
 Agent 1   Agent 2   Agent 3
    ↓         ↓         ↓
 Build     Test     Deploy
```

**关键组件**：

- **Master**：控制中心，管理任务和调度
- **Agent/Node**：执行构建任务的工作节点
- **Job/Pipeline**：定义构建流程的任务
- **Plugin**：扩展功能的插件

### 1.3 工作流程

```mermaid
graph LR
    A[代码提交] --> B[触发构建]
    B --> C[拉取代码]
    C --> D[编译构建]
    D --> E[运行测试]
    E --> F{测试通过?}
    F -->|是| G[部署]
    F -->|否| H[通知失败]
    G --> I[验证部署]
```

---

## 二、安装与配置

### 2.1 Docker 安装

```bash
# 启动 Jenkins LTS 版本
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# 查看初始密码
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 2.2 Docker Compose 安装

```yaml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    ports:
      - '8080:8080'
      - '50000:50000'
    volumes:
      - jenkins_data:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false
    restart: unless-stopped

volumes:
  jenkins_data:
```

### 2.3 系统配置

**访问地址**：`http://localhost:8080`

**初始设置步骤**：

1. 输入初始管理员密码
2. 选择安装推荐插件或自定义插件
3. 创建第一个管理员用户
4. 配置 Jenkins URL

### 2.4 全局工具配置

进入 **Manage Jenkins → Global Tool Configuration**：

```
JDK:
  - Name: JDK 17
  - Install automatically: ✓
  - Version: AdoptOpenJDK 17

Git:
  - Name: Default
  - Path to Git executable: git

Maven:
  - Name: Maven 3.9
  - Install automatically: ✓
  - Version: 3.9.6

NodeJS:
  - Name: Node 18
  - Install automatically: ✓
  - Version: 18.x
```

---

## 三、核心概念

### 3.1 Job 类型

| 类型                     | 描述               | 适用场景        |
| ------------------------ | ------------------ | --------------- |
| **Freestyle Project**    | 传统自由风格项目   | 简单构建任务    |
| **Pipeline**             | 流水线项目（推荐） | 复杂 CI/CD 流程 |
| **Multibranch Pipeline** | 多分支流水线       | 多分支项目管理  |
| **Folder**               | 文件夹             | 组织相关任务    |

### 3.2 Pipeline 类型

**Declarative Pipeline（声明式）**：

```groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
    }
}
```

**Scripted Pipeline（脚本式）**：

```groovy
node {
    stage('Build') {
        echo 'Building...'
    }
}
```

> **推荐**：使用声明式 Pipeline，更易读和维护

### 3.3 关键术语

- **Stage**：流水线中的逻辑阶段
- **Step**：单个操作单元
- **Agent**：执行任务的节点
- **Post Actions**：阶段完成后执行的操作
- **Environment**：环境变量
- **Parameters**：构建参数
- **Triggers**：触发条件

---

## 四、Pipeline 语法

### 4.1 基本结构

```groovy
pipeline {
    agent any

    environment {
        APP_NAME = 'my-app'
        VERSION = '1.0.0'
    }

    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch')
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Deploy environment')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'test-results/*.xml'
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            cleanWs()
        }
    }
}
```

### 4.2 常用指令

**agent 指定**：

```groovy
// 任意可用节点
agent any

// 指定标签的节点
agent { label 'linux' }

// Docker 容器
agent {
    docker {
        image 'node:18-alpine'
        args '-u root'
    }
}

// Kubernetes Pod
agent {
    kubernetes {
        yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:18
    command:
    - cat
    tty: true
'''
    }
}
```

**when 条件**：

```groovy
when {
    branch 'main'                    // 分支匹配
    tag 'v*'                         // 标签匹配
    changeRequest()                  // PR/MR
    expression { env.BRANCH_NAME == 'develop' }
    allOf {                          // 所有条件
        branch 'main'
        changelog '.*fix.*'
    }
    anyOf {                          // 任一条件
        branch 'main'
        branch 'release/*'
    }
    not {                            // 取反
        branch 'develop'
    }
}
```

**parallel 并行执行**：

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit Tests') {
            steps {
                sh 'npm run test:unit'
            }
        }
        stage('Integration Tests') {
            steps {
                sh 'npm run test:integration'
            }
        }
        stage('E2E Tests') {
            steps {
                sh 'npm run test:e2e'
            }
        }
    }
}
```

### 4.3 共享库

**目录结构**：

```
vars/
  ├── deploy.groovy
  ├── notify.groovy
src/
  └── com/
      └── example/
          └── Utils.groovy
```

**使用示例**：

```groovy
// vars/deploy.groovy
def call(String environment) {
    echo "Deploying to ${environment}"
    sh "./deploy.sh ${environment}"
}

// Pipeline 中使用
@Library('shared-library') _

pipeline {
    stages {
        stage('Deploy') {
            steps {
                deploy('production')
            }
        }
    }
}
```

---

## 五、常用插件

### 5.1 必装插件

| 插件名称                 | 功能         | 安装命令               |
| ------------------------ | ------------ | ---------------------- |
| **Git Plugin**           | Git 集成     | 默认安装               |
| **Pipeline**             | 流水线支持   | 默认安装               |
| **Blue Ocean**           | 现代化 UI    | `blueocean`            |
| **Docker Plugin**        | Docker 集成  | `docker-plugin`        |
| **Kubernetes Plugin**    | K8s 集成     | `kubernetes`           |
| **Credentials Binding**  | 凭证管理     | 默认安装               |
| **Config File Provider** | 配置文件管理 | `config-file-provider` |

### 5.2 推荐插件

| 插件名称               | 功能            |
| ---------------------- | --------------- |
| **GitHub Integration** | GitHub 深度集成 |
| **GitLab Plugin**      | GitLab 集成     |
| **SonarQube Scanner**  | 代码质量扫描    |
| **JaCoCo**             | 代码覆盖率      |
| **Slack Notification** | Slack 通知      |
| **Email Extension**    | 邮件通知增强    |
| **Build Timeout**      | 构建超时控制    |
| **Workspace Cleanup**  | 工作空间清理    |
| **Timestamper**        | 日志时间戳      |
| **AnsiColor**          | 彩色日志输出    |

### 5.3 插件管理

```bash
# 通过 CLI 安装插件
java -jar jenkins-cli.jar -s http://localhost:8080 install-plugin plugin-name

# 重启 Jenkins
java -jar jenkins-cli.jar -s http://localhost:8080 safe-restart
```

---

## 六、凭证管理

### 6.1 凭证类型

| 类型                                       | 用途            |
| ------------------------------------------ | --------------- |
| **Username with password**                 | 用户名密码      |
| **SSH Username with private key**          | SSH 密钥        |
| **Secret text**                            | API Token、密钥 |
| **Certificate**                            | SSL 证书        |
| **Docker Host Certificate Authentication** | Docker 认证     |

### 6.2 添加凭证

**通过 UI**：

1. 进入 **Manage Jenkins → Credentials**
2. 选择作用域（System/Global）
3. 点击 **Add Credentials**
4. 选择类型并填写信息

**通过 Pipeline**：

```groovy
// 使用用户名密码
withCredentials([usernamePassword(
    credentialsId: 'github-creds',
    usernameVariable: 'GIT_USER',
    passwordVariable: 'GIT_PASS'
)]) {
    sh 'git clone https://${GIT_USER}:${GIT_PASS}@github.com/repo.git'
}

// 使用 Secret Text
withCredentials([string(credentialsId: 'api-token', variable: 'API_TOKEN')]) {
    sh 'curl -H "Authorization: Bearer ${API_TOKEN}" https://api.example.com'
}

// 使用 SSH 密钥
withCredentials([sshUserPrivateKey(
    credentialsId: 'ssh-key',
    keyFileVariable: 'SSH_KEY',
    usernameVariable: 'SSH_USER'
)]) {
    sh 'scp -i ${SSH_KEY} file.txt ${SSH_USER}@server:/path/'
}
```

### 6.3 凭证绑定

```groovy
environment {
    DOCKER_CREDS = credentials('docker-hub-creds')
}

steps {
    sh 'echo $DOCKER_CREDS_USR'  // 用户名
    sh 'echo $DOCKER_CREDS_PSW'  // 密码
}
```

---

## 七、构建触发器

### 7.1 定时触发

```groovy
triggers {
    // Cron 表达式：分 时 日 月 周
    cron('H */4 * * *')           // 每4小时
    cron('0 2 * * *')             // 每天凌晨2点
    cron('H 9-17/2 * * 1-5')      // 工作日9-17点每2小时
    cron('@daily')                // 每天
    cron('@weekly')               // 每周
}
```

### 7.2 SCM 轮询

```groovy
triggers {
    pollSCM('H/5 * * * *')  // 每5分钟检查代码变更
}
```

### 7.3 Webhook 触发

**GitHub Webhook**：

1. 在 GitHub 仓库设置中添加 Webhook
2. Payload URL: `http://jenkins-url/github-webhook/`
3. Content type: `application/json`
4. 选择触发事件：Push, Pull Request 等

**GitLab Webhook**：

1. 安装 GitLab Plugin
2. 在 GitLab 项目设置中配置 Webhook
3. URL: `http://jenkins-url/project/<job-name>`
4. Trigger: Push events, Merge request events

### 7.4 上游/下游触发

```groovy
// 上游任务完成后触发
triggers {
    upstream(upstreamProjects: 'build-job', threshold: hudson.model.Result.SUCCESS)
}

// 触发下游任务
post {
    success {
        build job: 'deploy-job', wait: false
    }
}
```

### 7.5 参数化触发

```groovy
parameters {
    string(name: 'VERSION', defaultValue: 'latest', description: 'Version to deploy')
    choice(name: 'ENV', choices: ['dev', 'prod'], description: 'Environment')
    booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run tests')
}

steps {
    echo "Version: ${params.VERSION}"
    echo "Environment: ${params.ENV}"
    echo "Run Tests: ${params.RUN_TESTS}"
}
```

---

## 八、通知与报告

### 8.1 邮件通知

```groovy
post {
    failure {
        mail to: 'team@example.com',
             subject: "Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
             body: "Check console: ${env.BUILD_URL}"
    }
    success {
        mail to: 'team@example.com',
             subject: "Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
             body: "Build successful!"
    }
}
```

### 8.2 Slack 通知

```groovy
post {
    failure {
        slackSend channel: '#ci-cd',
                   color: 'danger',
                   message: "❌ Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
    }
    success {
        slackSend channel: '#ci-cd',
                   color: 'good',
                   message: "✅ Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
    }
}
```

### 8.3 钉钉通知

```groovy
post {
    failure {
        sh """
        curl -X POST 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN' \\
        -H 'Content-Type: application/json' \\
        -d '{
            "msgtype": "markdown",
            "markdown": {
                "title": "构建失败",
                "text": "### ❌ 构建失败\\n- 任务: ${env.JOB_NAME}\\n- 编号: #${env.BUILD_NUMBER}\\n- [查看详情](${env.BUILD_URL})"
            }
        }'
        """
    }
}
```

### 8.4 测试报告

```groovy
post {
    always {
        // JUnit 测试报告
        junit testResults: '**/test-results/*.xml', allowEmptyResults: true

        // JaCoCo 覆盖率报告
        jacoco sourcePattern: '**/src/main/java',
              exclusionPattern: '**/test/**',
              minimumInstructionCoverage: '80',
              minimumBranchCoverage: '70'

        // HTML 报告
        publishHTML target: [
            reportDir: 'coverage-report',
            indexFiles: 'index.html',
            reportName: 'Code Coverage'
        ]
    }
}
```

---

## 九、最佳实践

### 9.1 Pipeline 设计原则

✅ **推荐做法**：

1. **单一职责**：每个 Stage 只做一件事
2. **可重复性**：构建应该是幂等的
3. **快速反馈**：尽早发现错误
4. **并行执行**：充分利用资源
5. **清理资源**：及时清理临时文件
6. **版本控制**：Jenkinsfile 纳入 Git 管理
7. **文档化**：注释关键步骤

❌ **避免做法**：

1. 硬编码敏感信息
2. 过长的单一流水线
3. 忽略错误处理
4. 不清理工作空间
5. 手动修改服务器配置

### 9.2 安全性最佳实践

```groovy
// ✅ 使用凭证管理
withCredentials([string(credentialsId: 'api-key', variable: 'API_KEY')]) {
    sh 'curl -H "Authorization: ${API_KEY}" https://api.example.com'
}

// ❌ 避免硬编码
sh 'curl -H "Authorization: sk-123456" https://api.example.com'

// ✅ 限制并发构建
properties([
    disableConcurrentBuilds()
])

// ✅ 设置构建超时
options {
    timeout(time: 30, unit: 'MINUTES')
}

// ✅ 隐藏敏感输出
wrap([$class: 'MaskPasswordsBuildWrapper']) {
    sh 'echo "Password: ${PASSWORD}"'
}
```

### 9.3 性能优化

**并行构建**：

```groovy
stage('Tests') {
    parallel {
        stage('Unit') { steps { sh 'npm run test:unit' } }
        stage('Integration') { steps { sh 'npm run test:integration' } }
        stage('Lint') { steps { sh 'npm run lint' } }
    }
}
```

**缓存依赖**：

```groovy
stage('Build') {
    steps {
        script {
            def cacheKey = checksum('package-lock.json')
            if (!fileExists("cache/node_modules-${cacheKey}")) {
                sh 'npm ci'
                sh "cp -r node_modules cache/node_modules-${cacheKey}"
            } else {
                sh "cp -r cache/node_modules-${cacheKey} node_modules"
            }
        }
    }
}
```

**增量构建**：

```groovy
stage('Build') {
    when {
        changeset 'src/**'
    }
    steps {
        sh 'npm run build'
    }
}
```

### 9.4 日志管理

```groovy
options {
    // 保留最近 10 次构建
    buildDiscarder(logRotator(numToKeepStr: '10'))

    // 超时设置
    timeout(time: 30, unit: 'MINUTES')

    // 禁用并发
    disableConcurrentBuilds()

    // 添加时间戳
    timestamps()
}
```

---

## 十、故障排查

### 10.1 常见问题

**问题 1：构建卡住**

```bash
# 查看构建日志
tail -f /var/jenkins_home/jobs/<job>/builds/<number>/log

# 检查系统资源
docker stats jenkins

# 重启 Jenkins
docker restart jenkins
```

**问题 2：插件冲突**

```bash
# 安全模式启动
docker exec jenkins java -jar /usr/share/jenkins/jenkins.war --sessionTimeout=60

# 卸载问题插件
java -jar jenkins-cli.jar -s http://localhost:8080 uninstall-plugin plugin-name
```

**问题 3：磁盘空间不足**

```bash
# 清理旧构建
find /var/jenkins_home/jobs -type d -name builds -exec rm -rf {}/*/archive \;

# 清理工作空间
java -jar jenkins-cli.jar -s http://localhost:8080 clean-workspace -job <job-name>

# 清理 Docker 镜像
docker system prune -a
```

**问题 4：权限错误**

```bash
# 检查文件权限
ls -la /var/jenkins_home

# 修复权限
chown -R 1000:1000 /var/jenkins_home

# 检查 Docker socket 权限
chmod 666 /var/run/docker.sock
```

### 10.2 调试技巧

**启用详细日志**：

```groovy
pipeline {
    options {
        // 输出详细日志
        ansiColor('xterm')
    }

    stages {
        stage('Debug') {
            steps {
                // 打印环境变量
                sh 'env | sort'

                // 打印工作目录
                sh 'pwd && ls -la'

                // 打印 Git 信息
                sh 'git log -1'
            }
        }
    }
}
```

**Pipeline 语法检查**：

1. 访问 `http://jenkins-url/pipeline-syntax/`
2. 使用 **Snippet Generator** 生成代码
3. 使用 **Replay** 功能测试修改

### 10.3 备份与恢复

**备份**：

```bash
# 备份 Jenkins Home
docker cp jenkins:/var/jenkins_home ./jenkins-backup-$(date +%Y%m%d)

# 或使用 rsync
rsync -avz /var/jenkins_home/ /backup/jenkins/
```

**恢复**：

```bash
# 停止 Jenkins
docker stop jenkins

# 恢复数据
docker cp ./jenkins-backup jenkins:/var/jenkins_home

# 启动 Jenkins
docker start jenkins
```

---

## 十一、实用示例

### 11.1 Node.js 项目 CI/CD

```groovy
pipeline {
    agent {
        docker {
            image 'node:18-alpine'
        }
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                cache(paths: ['node_modules'], key: "${checksum('package-lock.json')}") {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --coverage'
            }
            post {
                always {
                    junit 'test-results/*.xml'
                    publishHTML([
                        reportDir: 'coverage',
                        indexFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.build("myapp:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry('https://registry.example.com', 'docker-creds') {
                        docker.image("myapp:${env.BUILD_NUMBER}").push()
                    }
                }
            }
        }
    }

    post {
        success {
            slackSend channel: '#deployments',
                       color: 'good',
                       message: "✅ ${env.JOB_NAME} #${env.BUILD_NUMBER} deployed successfully"
        }
        failure {
            slackSend channel: '#deployments',
                       color: 'danger',
                       message: "❌ ${env.JOB_NAME} #${env.BUILD_NUMBER} failed"
        }
        cleanup {
            cleanWs()
        }
    }
}
```

### 11.2 Java/Spring Boot 项目

```groovy
pipeline {
    agent {
        docker {
            image 'maven:3.9-eclipse-temurin-17'
        }
    }

    tools {
        maven 'Maven 3.9'
        jdk 'JDK 17'
    }

    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit '**/surefire-reports/*.xml'
                    jacoco()
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'mvn sonar:sonar'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build & Push') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.build("springboot-app:${env.BUILD_NUMBER}").push()
                }
            }
        }
    }
}
```

### 11.3 Python 项目

```groovy
pipeline {
    agent {
        docker {
            image 'python:3.11-slim'
        }
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'pip install -r requirements.txt'
            }
        }

        stage('Lint') {
            steps {
                sh 'flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics'
                sh 'black --check .'
            }
        }

        stage('Test') {
            steps {
                sh 'pytest --junitxml=test-results.xml --cov=. --cov-report=html'
            }
            post {
                always {
                    junit 'test-results.xml'
                    publishHTML([
                        reportDir: 'htmlcov',
                        indexFiles: 'index.html',
                        reportName: 'Python Coverage'
                    ])
                }
            }
        }

        stage('Security Scan') {
            steps {
                sh 'pip install safety'
                sh 'safety check'
            }
        }
    }
}
```

### 11.4 多环境部署

```groovy
pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Deployment environment')
    }

    stages {
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to Dev') {
            when {
                expression { params.ENVIRONMENT == 'dev' }
            }
            steps {
                sh './deploy.sh dev'
            }
        }

        stage('Deploy to Staging') {
            when {
                expression { params.ENVIRONMENT == 'staging' }
            }
            steps {
                input message: 'Approve staging deployment?', ok: 'Deploy'
                sh './deploy.sh staging'
            }
        }

        stage('Deploy to Production') {
            when {
                expression { params.ENVIRONMENT == 'prod' }
            }
            steps {
                input message: '⚠️ Approve PRODUCTION deployment?', ok: 'Deploy to Prod'
                sh './deploy.sh prod'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }
    }
}
```

### 11.5 Kubernetes 部署

```groovy
pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
'''
        }
    }

    environment {
        KUBECONFIG = credentials('kube-config')
    }

    stages {
        stage('Deploy to K8s') {
            steps {
                container('kubectl') {
                    sh '''
                    kubectl set image deployment/myapp myapp=myapp:${BUILD_NUMBER}
                    kubectl rollout status deployment/myapp
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                container('kubectl') {
                    sh '''
                    kubectl get pods -l app=myapp
                    kubectl describe deployment myapp
                    '''
                }
            }
        }

        stage('Rollback if Failed') {
            when {
                expression { currentBuild.result == 'FAILURE' }
            }
            steps {
                container('kubectl') {
                    sh 'kubectl rollout undo deployment/myapp'
                }
            }
        }
    }
}
```

### 11.6 Vue 3 项目构建（Jenkins 网页端配置）

**适用场景**：Vue 3 + Vite 项目的自动化构建和部署

**前置条件**：

- Jenkins 已安装 NodeJS Plugin
- 全局工具配置中已添加 Node.js 版本

**Jenkins Job 配置步骤**：

1. **新建任务** → 选择 "Freestyle project"
2. **源码管理** → Git → 填写仓库地址和凭证
3. **构建环境** → 勾选 "Provide Node & npm bin/ folder to PATH"
4. **构建步骤** → Add build step → Execute shell

**Shell 脚本内容**：

```bash
#!/bin/bash
set -e

# 打印环境信息
echo "===== 构建环境信息 ====="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Workspace: $(pwd)"
echo "Branch: ${GIT_BRANCH:-unknown}"
echo "Build Number: ${BUILD_NUMBER}"
echo "========================"

# 清理并安装依赖
echo "📦 清理 node_modules..."
rm -rf node_modules dist

echo "📦 安装依赖..."
npm ci --prefer-offline

# 代码检查
echo "🔍 运行 ESLint..."
npm run lint || {
    echo "❌ ESLint 检查失败"
    exit 1
}

# 单元测试
echo "🧪 运行单元测试..."
npm run test:unit || {
    echo "❌ 单元测试失败"
    exit 1
}

# 构建生产版本
echo "🏗️  开始构建..."
npm run build

# 验证构建产物
echo "✅ 验证构建产物..."
if [ ! -d "dist" ]; then
    echo "❌ 构建产物不存在"
    exit 1
fi

echo "📊 构建产物大小:"
du -sh dist/
ls -lh dist/

echo "✅ Vue 项目构建成功！"
```

5. **构建后操作** → Archive the artifacts → Files to archive: `dist/**/*`

**高级配置（多环境部署）**：

在 Execute shell 中使用参数化构建：

```bash
#!/bin/bash
set -e

# 根据环境变量选择配置文件
ENV=${DEPLOY_ENV:-production}

echo "🎯 部署环境: ${ENV}"

# 复制对应的环境配置
cp .env.${ENV} .env.production

# 构建
npm run build

# 上传到对应环境的服务器
if [ "$ENV" = "production" ]; then
    echo "🚀 部署到生产环境..."
    scp -r dist/* user@prod-server:/var/www/html/
elif [ "$ENV" = "staging" ]; then
    echo "🚀 部署到预发布环境..."
    scp -r dist/* user@staging-server:/var/www/html/
else
    echo "🚀 部署到开发环境..."
    scp -r dist/* user@dev-server:/var/www/html/
fi

echo "✅ 部署完成！"
```

### 11.7 NestJS 项目构建（Jenkins 网页端配置）

**适用场景**：NestJS + TypeScript 后端项目的自动化构建和部署

**前置条件**：

- Jenkins 已安装 NodeJS Plugin
- 全局工具配置中已添加 Node.js 版本
- 如需 Docker 部署，需安装 Docker Plugin

**Jenkins Job 配置步骤**：

1. **新建任务** → 选择 "Freestyle project"
2. **源码管理** → Git → 填写仓库地址和凭证
3. **构建环境** → 勾选 "Provide Node & npm bin/ folder to PATH"
4. **构建步骤** → Add build step → Execute shell

**基础构建脚本**：

```bash
#!/bin/bash
set -e

# 打印环境信息
echo "===== NestJS 构建环境 ====="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "TypeScript version: $(npx tsc -v)"
echo "Workspace: $(pwd)"
echo "==========================="

# 清理并安装依赖
echo "📦 清理并安装依赖..."
rm -rf node_modules dist
npm ci --prefer-offline

# 代码检查
echo "🔍 运行 ESLint..."
npm run lint || {
    echo "❌ 代码检查失败"
    exit 1
}

# 单元测试
echo "🧪 运行单元测试..."
npm run test:cov || {
    echo "❌ 单元测试失败"
    exit 1
}

# 编译 TypeScript
echo "🏗️  编译 TypeScript..."
npm run build

# 验证构建产物
echo "✅ 验证构建产物..."
if [ ! -f "dist/main.js" ]; then
    echo "❌ 构建产物不存在"
    exit 1
fi

echo "📊 构建产物:"
ls -lh dist/

echo "✅ NestJS 项目构建成功！"
```

**Docker 构建和部署脚本**：

```bash
#!/bin/bash
set -e

# 配置变量
APP_NAME="nestjs-app"
IMAGE_TAG="${BUILD_NUMBER}"
REGISTRY="registry.example.com"
DOCKERFILE_PATH="Dockerfile"

# 构建阶段
echo "📦 阶段 1: 安装依赖和测试"
npm ci --prefer-offline
npm run lint
npm run test:cov

echo "🏗️  阶段 2: 编译项目"
npm run build

echo "🐳 阶段 3: 构建 Docker 镜像"
docker build -t "${APP_NAME}:${IMAGE_TAG}" -f ${DOCKERFILE_PATH} .

# 可选：推送到镜像仓库
echo "📤 阶段 4: 推送镜像到仓库"
docker tag "${APP_NAME}:${IMAGE_TAG}" "${REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
docker tag "${APP_NAME}:${IMAGE_TAG}" "${REGISTRY}/${APP_NAME}:latest"
docker push "${REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
docker push "${REGISTRY}/${APP_NAME}:latest"

# 部署阶段（SSH 远程执行）
echo "🚀 阶段 5: 部署应用"
ssh user@server """
    # 停止旧容器
    docker stop ${APP_NAME} || true
    docker rm ${APP_NAME} || true

    # 拉取新镜像
    docker pull ${REGISTRY}/${APP_NAME}:${IMAGE_TAG}

    # 启动新容器
    docker run -d \
        --name ${APP_NAME} \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e DATABASE_URL=postgresql://user:pass@db:5432/mydb \
        --restart unless-stopped \
        ${REGISTRY}/${APP_NAME}:${IMAGE_TAG}

    # 清理旧镜像
    docker image prune -f

    # 检查健康状态
    sleep 5
    docker ps | grep ${APP_NAME}
"""

echo "✅ NestJS 项目构建和部署成功！"
```

**使用 PM2 部署脚本**：

```bash
#!/bin/bash
set -e

# 构建阶段
echo "📦 安装依赖..."
npm ci --prefer-offline

echo "🔍 代码检查..."
npm run lint

echo "🧪 运行测试..."
npm run test:cov

echo "🏗️  编译项目..."
npm run build

# 部署阶段
echo "🚀 部署到服务器..."

# 打包构建产物
cd dist
tar -czf ../app.tar.gz .
cd ..

# 上传到服务器
scp app.tar.gz user@server:/opt/nestjs-app/
scp ecosystem.config.js user@server:/opt/nestjs-app/

# 远程部署
ssh user@server """
    cd /opt/nestjs-app

    # 解压文件
    tar -xzf app.tar.gz
    rm app.tar.gz

    # 安装生产依赖
    npm ci --only=production

    # 使用 PM2 重启应用
    pm2 reload ecosystem.config.js --env production

    # 查看状态
    pm2 status
    pm2 logs --lines 20
"""

echo "✅ 部署完成！"
```

**PM2 配置文件 (ecosystem.config.js)**：

```javascript
module.exports = {
  apps: [
    {
      name: 'nestjs-app',
      script: './dist/main.js',
      instances: 'max', // 使用所有 CPU 核心
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
}
```

### 11.8 Vue + NestJS 全栈项目构建

**适用场景**：前后端分离的全栈项目一体化构建

**Jenkins Job 配置**：

```bash
#!/bin/bash
set -e

echo "===== 全栈项目构建 ====="
echo "前端: Vue 3 + Vite"
echo "后端: NestJS + TypeScript"
echo "========================"

# ==================== 前端构建 ====================
echo ""
echo "🎨 === 前端构建开始 ==="
cd frontend

echo "📦 安装前端依赖..."
rm -rf node_modules dist
npm ci --prefer-offline

echo "🔍 前端代码检查..."
npm run lint

echo "🧪 前端单元测试..."
npm run test:unit

echo "🏗️  前端构建..."
npm run build

echo "✅ 前端构建完成"
cd ..

# ==================== 后端构建 ====================
echo ""
echo "⚙️  === 后端构建开始 ==="
cd backend

echo "📦 安装后端依赖..."
rm -rf node_modules dist
npm ci --prefer-offline

echo "🔍 后端代码检查..."
npm run lint

echo "🧪 后端单元测试..."
npm run test:cov

echo "🏗️  后端编译..."
npm run build

echo "✅ 后端构建完成"
cd ..

# ==================== 集成部署 ====================
echo ""
echo "🚀 === 部署阶段 ==="

# 创建部署包
DEPLOY_DIR="deploy-${BUILD_NUMBER}"
mkdir -p ${DEPLOY_DIR}

# 复制前端构建产物
cp -r frontend/dist ${DEPLOY_DIR}/frontend

# 复制后端构建产物
cp -r backend/dist ${DEPLOY_DIR}/backend
cp backend/package.json ${DEPLOY_DIR}/backend/
cp backend/package-lock.json ${DEPLOY_DIR}/backend/

# 创建 Docker Compose 配置
cat > ${DEPLOY_DIR}/docker-compose.yml <<EOF
version: '3.8'

services:
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# 创建 Nginx 配置
cat > ${DEPLOY_DIR}/nginx.conf <<EOF
server {
    listen 80;
    server_name localhost;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 创建后端 Dockerfile
cat > ${DEPLOY_DIR}/backend/Dockerfile <<EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "dist/main.js"]
EOF

echo "📦 部署包已创建: ${DEPLOY_DIR}"
echo "📊 部署包大小:"
du -sh ${DEPLOY_DIR}

# 上传并部署
scp -r ${DEPLOY_DIR} user@server:/opt/apps/

ssh user@server """
    cd /opt/apps/${DEPLOY_DIR}

    # 停止旧服务
    docker-compose down || true

    # 启动新服务
    docker-compose up -d --build

    # 等待服务启动
    sleep 10

    # 检查服务状态
    docker-compose ps
    docker-compose logs --tail=20

    # 清理旧部署
    cd /opt/apps
    ls -dt deploy-* | tail -n +4 | xargs rm -rf 2>/dev/null || true
"""

echo "✅ 全栈项目构建和部署成功！"
```

---

## 附录：常用命令速查

### Jenkins CLI

```bash
# 连接 Jenkins
java -jar jenkins-cli.jar -s http://localhost:8080

# 列出所有任务
list-jobs

# 触发构建
build <job-name>

# 查看构建日志
console <job-name> <build-number>

# 安装插件
install-plugin <plugin-name>

# 重启 Jenkins
safe-restart

# 重新加载配置
reload-configuration
```

### Docker 管理

```bash
# 查看 Jenkins 日志
docker logs -f jenkins

# 进入容器
docker exec -it jenkins bash

# 备份数据
docker cp jenkins:/var/jenkins_home ./backup

# 更新 Jenkins
docker pull jenkins/jenkins:lts
docker stop jenkins
docker rm jenkins
docker run -d --name jenkins -p 8080:8080 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

### 系统维护

```bash
# 清理旧构建
find /var/jenkins_home/jobs -type f -name "*.xml" -mtime +30 -delete

# 清理工作空间
rm -rf /var/jenkins_home/workspace/*

# 查看磁盘使用
du -sh /var/jenkins_home/*

# 导出配置
java -jar jenkins-cli.jar -s http://localhost:8080 list-plugins > plugins.txt
```

---

## 参考资源

- **官方文档**: [https://www.jenkins.io/doc/](https://www.jenkins.io/doc/)
- **Pipeline 语法参考**: [https://www.jenkins.io/doc/book/pipeline/syntax/](https://www.jenkins.io/doc/book/pipeline/syntax/)
- **插件列表**: [https://plugins.jenkins.io/](https://plugins.jenkins.io/)
- **最佳实践**: [https://www.jenkins.io/doc/book/pipeline/jenkinsfile/](https://www.jenkins.io/doc/book/pipeline/jenkinsfile/)
- **社区论坛**: [https://community.jenkins.io/](https://community.jenkins.io/)

---

> 📌 **提示**：本手册涵盖了 Jenkins 的核心功能和最佳实践，建议结合实际项目需求进行调整和优化。定期更新 Jenkins 和插件以获取最新功能和安全补丁。
