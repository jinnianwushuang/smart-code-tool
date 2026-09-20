import { Route } from 'react-router-dom'
import SingletonDemo from 'project/pages/singleton-demo/SingletonDemo'
import MultitonDemo from 'project/pages/multiton-demo/MultitonDemo'
import CompoundDemo from 'project/pages/compound-demo/CompoundDemo'
import HooksPipelineDemo from 'project/pages/hooks-pipeline/HooksPipelineDemo'
import ControlledDemo from 'project/pages/controlled-demo/ControlledDemo'
import RscParadigm from 'project/pages/rsc-paradigm'
import ZustandPattern from 'project/pages/zustand-pattern'
import ConcurrentRendering from 'project/pages/concurrent-rendering'
import ReactTestHome from 'project/pages/react-test/index'

/**
 * React 架构验证 - 路由配置（8 种范式）
 *
 * 5 种核心验证范式 + 3 种其他范式说明
 */
export const routes = (
  <>
    <Route path="/react-test" element={<ReactTestHome />} />
    <Route path="/react-test/singleton" element={<SingletonDemo />} />
    <Route path="/react-test/multiton" element={<MultitonDemo />} />
    <Route path="/react-test/compound" element={<CompoundDemo />} />
    <Route path="/react-test/hooks-pipeline" element={<HooksPipelineDemo />} />
    <Route path="/react-test/controlled" element={<ControlledDemo />} />
    {/* 其他范式说明 */}
    <Route path="/react-test/rsc" element={<RscParadigm />} />
    <Route path="/react-test/zustand" element={<ZustandPattern />} />
    <Route path="/react-test/concurrent" element={<ConcurrentRendering />} />
  </>
)
