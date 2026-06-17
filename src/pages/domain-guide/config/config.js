const raw_modules = import.meta.glob('./module/*.js', { eager: true })
import { map_glob_modules } from 'src/output/common/project-common.js'

const modules = map_glob_modules(raw_modules)

let all_tabs = [
  {
    name: '全部',
    key: 'all',
    order: 0,
  },
]

let all_docs = {}
let all_docs_list = []

Object.entries(modules).forEach(([key, value]) => {
  const { docs, tab_name, order } = value
  docs.forEach((doc) => {
    doc.tab_name = tab_name
  })
  all_docs[key] = docs

  all_tabs.push({
    name: tab_name,
    key,
    order,
  })
})
all_tabs.sort((a, b) => a.order - b.order)

all_tabs.map((x) => {
  all_docs_list.push(...(all_docs[x.key] || []))
})

all_docs['all'] = all_docs_list
export { all_docs, all_tabs }
