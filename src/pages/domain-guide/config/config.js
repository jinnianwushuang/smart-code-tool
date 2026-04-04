const raw_modules = import.meta.glob('./module/*.js', { eager: true })
import { map_glob_modules } from 'src/output/common/project-common.js'

const modules = map_glob_modules(raw_modules)

let all_tabs = []

let all_docs = {}

Object.entries(modules).forEach(([key, value]) => {
  const { docs, tab_name, order } = value
  all_docs[key] = docs
  all_tabs.push({
    name: tab_name,
    key,
    order,
  })
})
all_tabs.sort((a, b) => a.order - b.order)

export { all_docs, all_tabs }
