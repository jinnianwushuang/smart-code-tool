import {
  HomeOutlined,
  CodeOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'
import { h } from 'vue'
// https://antdv.com/components/icon-cn

export const menuList = [
  {
    icon: () => h(HomeOutlined),
    key: 'domain-guide',
    label: '技术导航',
    separator: false,
  },

  {
    icon: () => h(CodeOutlined),
    key: 'code-tool',
    label: '代码工具',
    separator: true,
  },
  {
    icon: () => h(HomeOutlined),
    key: 'common-tool',
    label: '通用工具',
    separator: true,
  },
  {
    icon: () => h(CalendarOutlined),
    key: 'permanent-notice-calendar',
    label: '万年历',
    separator: true,
  },
]
