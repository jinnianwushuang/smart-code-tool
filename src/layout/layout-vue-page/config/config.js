import {
  HomeOutlined,
  UserOutlined,
  ShopOutlined,
  NotificationOutlined,
} from '@ant-design/icons-vue'
import { h } from 'vue'

export const sideMenuList = [
  {
    key: 'verification-explanation',
    label: 'verification-explanation',
    icon: () => h(NotificationOutlined),
  },
  {
    key: 'singleton-demo',
    label: 'singleton-demo',

    icon: () => h(UserOutlined),
    children: [
      { key: 'singleton-lv1', label: 'singleton-lv1' },
      { key: 'singleton-lv2', label: 'singleton-lv2' },
      { key: 'singleton-lv3', label: 'singleton-lv3' },
      { key: 'singleton-lv4', label: 'singleton-lv4' },
      { key: 'singleton-lv5', label: 'singleton-lv5' },
    ],
  },
  {
    key: 'multiton-demo',
    label: 'multiton-demo',

    icon: () => h(ShopOutlined),
    children: [
      { key: 'multiton-lv1', label: 'multiton-lv1' },
      { key: 'multiton-lv2', label: 'multiton-lv2' },
      { key: 'multiton-lv3', label: 'multiton-lv3' },
      { key: 'multiton-lv4', label: 'multiton-lv4' },
    ],
  },

  // {
  //   key: 'sub3',
  //   label: 'subnav 3',
  //   icon: 'NotificationOutlined',
  //   children: [
  //     { key: '9', label: 'option9' },
  //     { key: '10', label: 'option10' },
  //     { key: '11', label: 'option11' },
  //     { key: '12', label: 'option12' },
  //   ],
  // },
]
