export const tab_name = 'Linux'
export const order = 90
export const docs = [
  {
    category: 'Linux 发行版',
    color: 'orange',
    items: [
      {
        name: 'Ubuntu',
        url: 'https://ubuntu.com/',
        tag: 'Debian',
        desc: '最流行的 Linux 发行版之一,适合初学者和服务器部署,社区支持强大。',
      },
      {
        name: 'CentOS / Rocky Linux',
        url: 'https://rockylinux.org/',
        tag: 'RHEL',
        desc: '企业级 Linux 发行版,CentOS 的替代品,提供长期稳定支持。',
      },
      {
        name: 'Debian',
        url: 'https://www.debian.org/',
        tag: 'Stable',
        desc: '以稳定性著称的 Linux 发行版,Ubuntu 的基础,适合生产环境。',
      },
      {
        name: 'Arch Linux',
        url: 'https://archlinux.org/',
        tag: 'Rolling',
        desc: '滚动更新的轻量级发行版,高度可定制,适合高级用户。',
      },
      {
        name: 'Fedora',
        url: 'https://fedoraproject.org/',
        tag: 'Innovation',
        desc: 'Red Hat 赞助的社区发行版,集成最新技术,是 RHEL 的上游。',
      },
    ],
  },
  {
    category: '命令行与 Shell',
    color: 'green',
    items: [
      {
        name: 'Bash Handbook',
        url: 'https://github.com/denysdovhan/bash-handbook',
        tag: 'Shell',
        desc: '简洁实用的 Bash 脚本编程指南,适合初学者快速入门。',
      },
      {
        name: 'Shell Scripting Tutorial',
        url: 'https://www.shellscript.sh/',
        tag: 'Tutorial',
        desc: '全面的 Shell 脚本教程,从基础语法到高级技巧,配有丰富示例。',
      },
      {
        name: 'Oh My Zsh',
        url: 'https://ohmyz.sh/',
        tag: 'Zsh',
        desc: 'Zsh 配置框架,提供丰富的主题和插件,提升终端使用体验。',
      },
      {
        name: 'tmux',
        url: 'https://github.com/tmux/tmux/wiki',
        tag: 'Terminal',
        desc: '终端复用器,支持会话管理、窗口分割,远程开发必备工具。',
      },
      {
        name: 'WindTerm',
        url: 'https://github.com/kingToolbox/WindTerm',
        tag: 'SSH Client',
        desc: '跨平台的 SSH/Telnet/Serial/Shell/Sftp 客户端,功能强大且免费开源。',
      },
      {
        name: 'The Art of Command Line',
        url: 'https://github.com/jlevy/the-art-of-command-line',
        tag: 'Guide',
        desc: '命令行艺术指南,汇总了高效使用 Linux 命令行的技巧和最佳实践。',
      },
      {
        name: 'Explainshell',
        url: 'https://explainshell.com/',
        tag: 'Helper',
        desc: '在线工具,逐段解释 shell 命令的含义,帮助理解复杂命令。',
      },
      {
        name: 'Command Line Power User',
        url: 'https://commandlinepoweruser.com/',
        tag: 'Video',
        desc: 'Wes Bos 出品的命令行进阶视频教程,提升终端工作效率。',
      },
      {
        name: 'Linux Command Library',
        url: 'https://linuxcommandlibrary.com/',
        tag: 'Reference',
        desc: 'Linux 命令速查库,提供详细的命令用法、参数说明和示例。',
      },
    ],
  },
  {
    category: '系统管理与监控',
    color: 'blue',
    items: [
      {
        name: 'systemd',
        url: 'https://systemd.io/',
        tag: 'Init',
        desc: '现代 Linux 系统的初始化系统和服务管理器,取代传统的 SysVinit。',
      },
      {
        name: 'htop',
        url: 'https://htop.dev/',
        tag: 'Monitor',
        desc: '交互式进程查看器,top 命令的增强版,提供更直观的系統资源监控。',
      },
      {
        name: 'netdata',
        url: 'https://www.netdata.cloud/',
        tag: 'Monitoring',
        desc: '实时性能监控工具,可视化展示系统指标,支持告警和仪表板。',
      },
      {
        name: 'Logrotate',
        url: 'https://github.com/logrotate/logrotate',
        tag: 'Logs',
        desc: '日志轮转工具,自动管理日志文件的大小和保留策略。',
      },
    ],
  },
  {
    category: '网络与安全',
    color: 'red',
    items: [
      {
        name: 'iptables / nftables',
        url: 'https://www.netfilter.org/',
        tag: 'Firewall',
        desc: 'Linux 内核级的数据包过滤框架,用于配置防火墙规则。',
      },
      {
        name: 'OpenSSH',
        url: 'https://www.openssh.com/',
        tag: 'SSH',
        desc: '安全的远程登录协议实现,Linux 服务器管理的核心工具。',
      },
      {
        name: 'WireGuard',
        url: 'https://www.wireguard.com/',
        tag: 'VPN',
        desc: '现代 VPN 协议,简单、快速且安全,易于配置的虚拟专用网络方案。',
      },
      {
        name: 'fail2ban',
        url: 'https://www.fail2ban.org/',
        tag: 'Security',
        desc: '入侵防御框架,通过监控日志自动封禁恶意 IP 地址。',
      },
    ],
  },
  {
    category: '存储与文件系统',
    color: 'purple',
    items: [
      {
        name: 'LVM (Logical Volume Manager)',
        url: 'https://sourceware.org/lvm2/',
        tag: 'Storage',
        desc: '逻辑卷管理工具,提供灵活的磁盘分区管理和动态扩容能力。',
      },
      {
        name: 'ZFS',
        url: 'https://openzfs.org/',
        tag: 'Filesystem',
        desc: '先进的文件系统,支持快照、数据完整性校验和 RAID-Z。',
      },
      {
        name: 'Btrfs',
        url: 'https://btrfs.wiki.kernel.org/',
        tag: 'Filesystem',
        desc: 'Linux 原生的高级文件系统,支持快照、子卷和数据压缩。',
      },
      {
        name: 'rsync',
        url: 'https://rsync.samba.org/',
        tag: 'Sync',
        desc: '快速、灵活的文件同步工具,支持增量备份和远程传输。',
      },
    ],
  },
  {
    category: '容器与虚拟化',
    color: 'cyan',
    items: [
      {
        name: 'Docker',
        url: 'https://www.docker.com/',
        tag: 'Container',
        desc: '容器化平台的标准,简化应用打包、分发和部署流程。',
      },
      {
        name: 'Podman',
        url: 'https://podman.io/',
        tag: 'Container',
        desc: '无守护进程的容器引擎,Docker 的替代品,更注重安全性。',
      },
      {
        name: 'KVM',
        url: 'https://www.linux-kvm.org/',
        tag: 'Virtualization',
        desc: 'Linux 内核级的虚拟化模块,提供高性能的硬件辅助虚拟化。',
      },
      {
        name: 'LXC/LXD',
        url: 'https://linuxcontainers.org/',
        tag: 'Container',
        desc: '系统容器解决方案,提供类似虚拟机的体验但更轻量。',
      },
    ],
  },
  {
    category: '自动化与配置管理',
    color: 'magenta',
    items: [
      {
        name: 'Ansible',
        url: 'https://www.ansible.com/',
        tag: 'Automation',
        desc: '无代理的自动化配置管理工具,使用 YAML 编写 playbook。',
      },
      {
        name: 'Terraform',
        url: 'https://www.terraform.io/',
        tag: 'IaC',
        desc: '基础设施即代码工具,用声明式配置管理云资源和服务器。',
      },
      {
        name: 'Puppet',
        url: 'https://puppet.com/',
        tag: 'Configuration',
        desc: '成熟的配置管理工具,适合大规模基础设施的自动化管理。',
      },
      {
        name: 'Chef',
        url: 'https://www.chef.io/',
        tag: 'Configuration',
        desc: '基于 Ruby 的配置管理框架,支持复杂的基础设施编排。',
      },
    ],
  },
  {
    category: '包管理器',
    color: 'teal',
    items: [
      {
        name: 'apt (Advanced Package Tool)',
        url: 'https://wiki.debian.org/Apt',
        tag: 'Debian',
        desc: 'Debian/Ubuntu 系列的包管理工具,处理依赖关系和软件安装。',
      },
      {
        name: 'yum / dnf',
        url: 'https://dnf.readthedocs.io/',
        tag: 'RHEL',
        desc: 'Red Hat/CentOS/Fedora 系列的包管理器,dnf 是 yum 的下一代版本。',
      },
      {
        name: 'pacman',
        url: 'https://wiki.archlinux.org/title/Pacman',
        tag: 'Arch',
        desc: 'Arch Linux 的包管理器,简洁高效,支持 AUR 社区仓库。',
      },
      {
        name: 'snap',
        url: 'https://snapcraft.io/',
        tag: 'Universal',
        desc: 'Canonical 开发的通用包格式,跨发行版兼容,自动更新。',
      },
    ],
  },
  {
    category: '学习资源与文档',
    color: 'indigo',
    items: [
      {
        name: 'Linux Documentation Project',
        url: 'https://tldp.org/',
        tag: 'Docs',
        desc: 'Linux 文档计划,提供全面的 HOWTO 指南和技术文档。',
      },
      {
        name: 'Arch Wiki',
        url: 'https://wiki.archlinux.org/',
        tag: 'Wiki',
        desc: '最详尽的 Linux Wiki,即使不使用 Arch 也是极佳的学习资源。',
      },
      {
        name: 'Linux Journey',
        url: 'https://linuxjourney.com/',
        tag: 'Tutorial',
        desc: '互动式 Linux 学习平台,从基础到高级的系统管理课程。',
      },
      {
        name: 'OverTheWire Bandit',
        url: 'https://overthewire.org/wargames/bandit/',
        tag: 'Practice',
        desc: 'Linux 命令行和安全技能的闯关练习,通过游戏化方式学习。',
      },
      {
        name: 'Linux 命令大全',
        url: 'https://man7.org/linux/man-pages/index.html',
        tag: 'Manual',
        desc: '在线 Linux 手册页,查询命令用法和参数的权威参考。',
      },
      {
        name: 'Ubuntu Manpages',
        url: 'https://manpages.ubuntu.com/',
        tag: 'Manual',
        desc: 'Ubuntu 官方在线手册页,提供完整的命令文档和示例,支持多版本查询。',
      },
    ],
  },
  {
    category: '服务器管理与建站工具',
    color: 'gold',
    items: [
      {
        name: '宝塔面板',
        url: 'https://www.bt.cn/',
        tag: 'Panel',
        desc: '简单易用的 Linux/Windows 服务器管理面板,可视化部署网站、数据库和运维工具。',
      },
      {
        name: '1Panel',
        url: 'https://1panel.cn/',
        tag: 'Panel',
        desc: '新一代开源 Linux 服务器运维管理面板,现代化界面,支持 Docker 应用一键部署。',
      },
      {
        name: 'WordPress',
        url: 'https://wordpress.org/',
        tag: 'CMS',
        desc: '全球最流行的内容管理系统,基于 PHP 和 MySQL,适合快速搭建博客和企业网站。',
      },
      {
        name: 'Typecho',
        url: 'https://typecho.org/',
        tag: 'Blog',
        desc: '轻量级博客程序,简洁高效,适合个人博客和内容创作平台。',
      },
      {
        name: 'Halo',
        url: 'https://halo.run/',
        tag: 'Blog',
        desc: '现代化的开源博客系统,基于 Java/Spring Boot,主题丰富且易于扩展。',
      },
      {
        name: '站长工具',
        url: 'https://tool.chinaz.com/',
        tag: 'SEO',
        desc: '综合性的站长工具平台,提供域名查询、SEO 分析、网站速度测试等服务。',
      },
    ],
  },
  {
    category: '桌面环境与工具',
    color: 'volcano',
    items: [
      {
        name: 'GNOME',
        url: 'https://www.gnome.org/',
        tag: 'Desktop',
        desc: '现代化的 Linux 桌面环境,注重用户体验和简洁设计。',
      },
      {
        name: 'KDE Plasma',
        url: 'https://kde.org/plasma-desktop/',
        tag: 'Desktop',
        desc: '高度可定制的桌面环境,功能丰富且性能优秀。',
      },
      {
        name: 'i3 / sway',
        url: 'https://i3wm.org/',
        tag: 'Window Manager',
        desc: '平铺式窗口管理器,键盘驱动,适合追求效率的高级用户。',
      },
      {
        name: 'Neovim',
        url: 'https://neovim.io/',
        tag: 'Editor',
        desc: 'Vim 的现代重构版本,支持 Lua 配置和丰富的插件生态。',
      },
    ],
  },
]
