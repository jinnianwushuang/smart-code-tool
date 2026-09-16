import { Route } from 'react-router-dom'
import SingletonDemo from 'project/pages/singleton-demo/SingletonDemo'
import MultitonDemo from 'project/pages/multiton-demo/MultitonDemo'
import CompoundDemo from 'project/pages/compound-demo/CompoundDemo'
import HooksPipelineDemo from 'project/pages/hooks-pipeline/HooksPipelineDemo'
import ControlledDemo from 'project/pages/controlled-demo/ControlledDemo'
import ReactTestHome from 'project/pages/react-test/index'

/**
 * React 架构验证 - 路由配置（5 种范式）
 *
 * 对标 Vue 侧 vue-test-routes.js，但展示 React 独有的架构范式
 */
export const routes = (
  <>
    <Route path="/react-test" element={<ReactTestHome />} />
    <Route path="/react-test/singleton" element={<SingletonDemo />} />
    <Route path="/react-test/multiton" element={<MultitonDemo />} />
    <Route path="/react-test/compound" element={<CompoundDemo />} />
    <Route path="/react-test/hooks-pipeline" element={<HooksPipelineDemo />} />
    <Route path="/react-test/controlled" element={<ControlledDemo />} />
  </>
)
