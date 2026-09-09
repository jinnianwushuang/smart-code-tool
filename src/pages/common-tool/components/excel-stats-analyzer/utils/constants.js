/**
 * 共享常量
 */

/** JS 合法键名正则 */
export const JS_KEY_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

/** 导出文件时间戳格式 */
export const TIMESTAMP_FORMAT = 'YYYY-MM-DD-HH-mm-ss'

/** 样例数据 */
export const SAMPLE_DATA = `姓名\t部门\t日期\t工时\t任务数\t完成率
张三\t前端组\t2025-01-06\t8\t5\t92%
李四\t后端组\t2025-01-06\t7.5\t3\t88%
王五\t前端组\t2025-01-07\t9\t6\t95%
赵六\t测试组\t2025-01-07\t6\t4\t78%
孙七\t后端组\t2025-01-08\t8\t5\t90%
周八\t前端组\t2025-01-08\t7\t4\t85%
吴九\t测试组\t2025-01-09\t8.5\t6\t93%
郑十\t后端组\t2025-01-09\t7\t3\t80%
张三\t前端组\t2025-01-10\t9\t7\t96%
李四\t后端组\t2025-01-10\t8\t5\t91%`

/** 分组统计表格列定义 */
export const GROUP_TABLE_COLUMNS = [
  { name: 'name', label: '分组值', field: 'name', align: 'left', sortable: true },
  { name: 'count', label: '数量', field: 'count', align: 'right', sortable: true },
  { name: 'sum', label: '总和', field: 'sum', align: 'right', sortable: true },
  { name: 'avg', label: '平均', field: 'avg', align: 'right', sortable: true },
  { name: 'max', label: '最大', field: 'max', align: 'right', sortable: true },
  { name: 'min', label: '最小', field: 'min', align: 'right', sortable: true },
]
