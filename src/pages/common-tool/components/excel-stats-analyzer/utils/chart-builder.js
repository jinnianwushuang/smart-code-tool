/**
 * ECharts 图表配置构建器
 * 支持根据统计列数据生成图表 option，并适配暗色主题
 */

/**
 * 获取某列支持的图表类型选项
 */
export const getChartOptions = (col) => {
  if (!col) return []
  if (col.isNumeric) {
    return [
      { icon: 'bar_chart', label: '柱状图', value: 'bar' },
      { icon: 'show_chart', label: '折线图', value: 'line' },
      { icon: 'timeline', label: '平滑折线图', value: 'smooth-line' },
      { icon: 'pie_chart', label: '饼图', value: 'pie' },
      { icon: 'radar', label: '雷达图', value: 'radar' },
    ]
  }
  return [
    { icon: 'bar_chart', label: '柱状图', value: 'bar' },
    { icon: 'pie_chart', label: '饼图', value: 'pie' },
    { icon: 'grid_on', label: '矩形树图', value: 'treemap' },
    { icon: 'radar', label: '雷达图', value: 'radar' },
  ]
}

/**
 * 获取某列的默认图表类型
 */
export const getDefaultChartType = (col) => {
  return col?.isNumeric ? 'bar' : 'pie'
}

/**
 * 构建 ECharts option
 * @param {Object} col - 统计列信息
 * @param {string} chartType - 图表类型 bar/line/pie
 * @param {Array} rows - 解析后的数据行
 * @param {Array} headers - 表头数组
 * @param {boolean} isDark - 是否暗色主题
 */
export const buildChartOption = (col, chartType, rows, headers, isDark = false) => {
  if (!col) return {}

  const textColor = isDark ? '#e0e0e0' : '#333'
  const axisLineColor = isDark ? '#555' : '#ccc'
  const titleStyle = { color: textColor }

  // ─── 数值型列 ───
  if (col.isNumeric) {
    const labels = rows.map((r, i) => r[headers[0]] || `行${i + 1}`)
    const data = rows.map((r) => Number(r[col.name]) || 0)

    if (chartType === 'pie') {
      const topN = rows.slice(0, 30).map((r, i) => ({
        name: r[headers[0]] || `行${i + 1}`,
        value: Number(r[col.name]) || 0,
      }))
      return {
        title: { text: col.label, left: 'center', textStyle: titleStyle },
        tooltip: { trigger: 'item' },
        series: [{ type: 'pie', data: topN, radius: ['30%', '70%'] }],
      }
    }

    if (chartType === 'radar') {
      const maxVal = Math.max(...data) * 1.2
      const indicator = labels.slice(0, 20).map((name) => ({ name, max: maxVal || 100 }))
      return {
        title: { text: col.label, left: 'center', textStyle: titleStyle },
        tooltip: {},
        radar: { indicator, axisName: { color: textColor, fontSize: 10 } },
        series: [{ type: 'radar', data: [{ value: data.slice(0, 20), name: col.label }] }],
      }
    }

    if (chartType === 'smooth-line') {
      return {
        title: { text: col.label, left: 'center', textStyle: titleStyle },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { rotate: 30, fontSize: 11, color: textColor },
          axisLine: { lineStyle: { color: axisLineColor } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textColor },
          axisLine: { lineStyle: { color: axisLineColor } },
        },
        series: [{ type: 'line', data, smooth: true }],
        grid: { left: 60, right: 30, bottom: 70, top: 50 },
        dataZoom: [{ type: 'inside' }, { type: 'slider' }],
      }
    }

    // 柱状图 / 折线图（带面积）
    return {
      title: { text: col.label, left: 'center', textStyle: titleStyle },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { rotate: 30, fontSize: 11, color: textColor },
        axisLine: { lineStyle: { color: axisLineColor } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: axisLineColor } },
      },
      series: [
        { type: chartType, data, smooth: true, areaStyle: chartType === 'line' ? {} : undefined },
      ],
      grid: { left: 60, right: 30, bottom: 70, top: 50 },
      dataZoom: [{ type: 'inside' }, { type: 'slider' }],
    }
  }

  // ─── 分类型列 ───
  const dist = col.stats.distribution

  if (chartType === 'pie') {
    const pieData = dist.map((d) => ({ name: d.value, value: d.count }))
    return {
      title: { text: col.label, left: 'center', textStyle: titleStyle },
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', data: pieData, radius: ['30%', '70%'] }],
    }
  }

  if (chartType === 'treemap') {
    const treeData = dist.map((d) => ({ name: d.value, value: d.count }))
    return {
      title: { text: col.label, left: 'center', textStyle: titleStyle },
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [{ type: 'treemap', data: treeData, label: { show: true, fontSize: 12 } }],
    }
  }

  if (chartType === 'radar') {
    const maxCount = Math.max(...dist.map((d) => d.count)) * 1.2
    const indicator = dist.slice(0, 15).map((d) => ({ name: d.value, max: maxCount || 100 }))
    const values = dist.slice(0, 15).map((d) => d.count)
    return {
      title: { text: col.label, left: 'center', textStyle: titleStyle },
      tooltip: {},
      radar: { indicator, axisName: { color: textColor, fontSize: 10 } },
      series: [{ type: 'radar', data: [{ value: values, name: col.label }] }],
    }
  }

  // 柱状图
  return {
    title: { text: col.label, left: 'center', textStyle: titleStyle },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dist.map((d) => d.value),
      axisLabel: { rotate: 30, fontSize: 11, color: textColor },
      axisLine: { lineStyle: { color: axisLineColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: axisLineColor } },
    },
    series: [{ type: 'bar', data: dist.map((d) => d.count) }],
    grid: { left: 60, right: 30, bottom: 70, top: 50 },
  }
}
