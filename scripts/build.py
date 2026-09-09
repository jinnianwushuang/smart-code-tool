#!/usr/bin/env python3
import subprocess
import sys

# 定义镜像名称和版本
IMAGE_NAME = "smart-code-tool-frontend"
VERSION = "latest"


def run_command(command, description):
    """运行终端命令并处理错误"""
    print(f"\n🚀 {description}...")
    try:
        # shell=True 允许直接运行整条命令字符串
        # check=True 会在命令执行失败（返回非0状态码）时直接抛出异常
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 错误: '{description}' 执行失败。")
        sys.exit(1)


def main():
    # 1. 前端打包
    # 如果你使用的是 pnpm 或 yarn，请将 'npm run build' 改为 'pnpm build' 或 'yarn build'
    run_command("npm run build", "开始本地前端项目打包 (npm run build)")

    # 2. 构建 Docker 镜像
    # --platform linux/amd64 确保在 Mac M系列芯片上打出的镜像能在线上 Linux 服务器正常跑
    docker_build_cmd = (
        f"docker build --platform linux/amd64 -t {IMAGE_NAME}:{VERSION} ."
    )
    run_command(docker_build_cmd, f"开始构建 Docker 镜像 [{IMAGE_NAME}:{VERSION}]")

    # 3. 大功告成
    print("\n" + "=" * 40)
    print("✅ 3. 镜像构建完成！")
    print(f"   你可以通过以下命令查看镜像:\n   docker images | grep {IMAGE_NAME}")
    print("=" * 40)


if __name__ == "__main__":
    main()