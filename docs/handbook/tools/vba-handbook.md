# Excel VBA 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-07-01  
> **适用对象**: Excel 用户、数据分析师、办公自动化开发者

---

## 目录

1. [VBA 基础](#1-vba-基础)
2. [Excel 对象模型](#2-excel-对象模型)
3. [工作表操作](#3-工作表操作)
4. [单元格操作](#4-单元格操作)
5. [数据处理](#5-数据处理)
6. [批量生成报表](#6-批量生成报表)
7. [图表操作](#7-图表操作)
8. [用户窗体](#8-用户窗体)
9. [事件处理](#9-事件处理)
10. [错误处理](#10-错误处理)
11. [性能优化](#11-性能优化)
12. [实用案例](#12-实用案例)

---

## 1. VBA 基础

### 1.1 变量和数据类型

```vb
' 变量声明
Dim name As String
Dim age As Integer
Dim salary As Double
Dim isActive As Boolean
Dim birthDate As Date
Dim rng As Range
Dim ws As Worksheet
Dim wb As Workbook

' 常量声明
Const MAX_ROWS As Integer = 1000
Const APP_NAME As String = "Report Generator"

' 数组
Dim scores(1 To 10) As Integer
Dim names() As String
ReDim names(1 To 5)

' Variant 类型（通用类型）
Dim value As Variant
value = "Text"
value = 123
value = True
```

### 1.2 条件语句

```vb
' If-ElseIf-Else
If score >= 90 Then
    grade = "A"
ElseIf score >= 80 Then
    grade = "B"
ElseIf score >= 70 Then
    grade = "C"
Else
    grade = "D"
End If

' Select Case
Select Case dayOfWeek
    Case 1
        dayName = "Monday"
    Case 2
        dayName = "Tuesday"
    Case 3 To 5
        dayName = "Weekday"
    Case 6, 7
        dayName = "Weekend"
    Case Else
        dayName = "Invalid"
End Select
```

### 1.3 循环结构

```vb
' For 循环
For i = 1 To 10
    Cells(i, 1).Value = i
Next i

' For Each 循环
Dim cell As Range
For Each cell In Range("A1:A10")
    If cell.Value > 100 Then
        cell.Interior.Color = RGB(255, 0, 0)
    End If
Next cell

' Do While 循环
Dim count As Integer
count = 1
Do While count <= 10
    Cells(count, 1).Value = count
    count = count + 1
Loop

' Do Until 循环
count = 1
Do Until count > 10
    Cells(count, 1).Value = count
    count = count + 1
Loop

' Exit 退出循环
For i = 1 To 100
    If Cells(i, 1).Value = "" Then
        Exit For
    End If
Next i
```

### 1.4 函数和子过程

```vb
' 子过程（无返回值）
Sub GreetUser(name As String)
    MsgBox "Hello, " & name & "!"
End Sub

' 函数（有返回值）
Function CalculateArea(radius As Double) As Double
    CalculateArea = 3.14159 * radius ^ 2
End Function

' 可选参数
Sub PrintReport(Optional title As String = "Report", _
                Optional showDate As Boolean = True)
    Debug.Print title
    If showDate Then
        Debug.Print Date
    End If
End Sub

' 调用
Call GreetUser("Alice")
area = CalculateArea(5)
PrintReport "Sales Report", True
```

---

## 2. Excel 对象模型

### 2.1 工作簿操作

```vb
' 引用当前工作簿
Dim wb As Workbook
Set wb = ThisWorkbook          ' 包含代码的工作簿
Set wb = ActiveWorkbook        ' 活动工作簿

' 打开工作簿
Set wb = Workbooks.Open("C:\Data\report.xlsx")

' 创建工作簿
Set wb = Workbooks.Add

' 保存工作簿
wb.Save
wb.SaveAs "C:\Data\new_report.xlsx"

' 关闭工作簿
wb.Close SaveChanges:=True
wb.Close SaveChanges:=False

' 遍历所有工作簿
Dim book As Workbook
For Each book In Workbooks
    Debug.Print book.Name
Next book
```

### 2.2 工作表操作

```vb
' 引用工作表
Dim ws As Worksheet
Set ws = ThisWorkbook.Sheets("Sheet1")
Set ws = ActiveSheet

' 通过索引引用
Set ws = ThisWorkbook.Sheets(1)

' 创建工作表
Set ws = ThisWorkbook.Sheets.Add
ws.Name = "New Sheet"

' 删除工作表
Application.DisplayAlerts = False
ThisWorkbook.Sheets("Sheet2").Delete
Application.DisplayAlerts = True

' 复制工作表
ThisWorkbook.Sheets("Sheet1").Copy After:=ThisWorkbook.Sheets("Sheet2")

' 重命名工作表
ThisWorkbook.Sheets("Sheet1").Name = "Data"

' 隐藏/显示工作表
ws.Visible = xlSheetHidden      ' 隐藏
ws.Visible = xlSheetVeryHidden  ' 深度隐藏
ws.Visible = xlSheetVisible     ' 显示

' 遍历工作表
For Each ws In ThisWorkbook.Sheets
    Debug.Print ws.Name
Next ws
```

---

## 3. 工作表操作

### 3.1 行列操作

```vb
' 插入行/列
Rows(5).Insert
Columns(3).Insert

' 删除行/列
Rows(5).Delete
Columns(3).Delete

' 隐藏行/列
Rows(5).Hidden = True
Columns(3).Hidden = True

' 调整行高/列宽
Rows(5).RowHeight = 30
Columns(3).ColumnWidth = 15

' 自动调整
Columns("A:D").AutoFit
Rows("1:10").AutoFit
```

### 3.2 筛选和排序

```vb
' 启用自动筛选
Range("A1:D100").AutoFilter

' 按条件筛选
Range("A1:D100").AutoFilter Field:=2, Criteria1:">100"

' 多条件筛选
Range("A1:D100").AutoFilter Field:=2, Criteria1:=">=100", _
                              Operator:=xlAnd, Criteria2:="<=500"

' 清除筛选
ActiveSheet.AutoFilterMode = False

' 排序
Range("A1:D100").Sort Key1:=Range("B1"), Order1:=xlAscending, _
                      Header:=xlYes
```

### 3.3 冻结窗格

```vb
' 冻结首行
ActiveWindow.FreezePanes = False
Rows("2:2").Select
ActiveWindow.FreezePanes = True

' 冻结首列
Columns("B:B").Select
ActiveWindow.FreezePanes = True

' 冻结行列
Range("B2").Select
ActiveWindow.FreezePanes = True
```

---

## 4. 单元格操作

### 4.1 读写单元格

```vb
' 读取单元格值
Dim value As Variant
value = Range("A1").Value
value = Cells(1, 1).Value

' 写入单元格
Range("A1").Value = "Hello"
Cells(1, 1).Value = 123

' 批量写入
Range("A1:A10").Value = 100

' 公式
Range("C1").Formula = "=A1+B1"
Range("C1:C10").Formula = "=A1*B1"

' 绝对引用
Range("C1").Formula = "=$A$1+$B$1"
```

### 4.2 单元格格式

```vb
' 字体格式
With Range("A1").Font
    .Name = "Arial"
    .Size = 12
    .Bold = True
    .Color = RGB(255, 0, 0)
End With

' 背景色
Range("A1").Interior.Color = RGB(200, 200, 200)
Range("A1").Interior.Pattern = xlSolid

' 边框
With Range("A1:D10").Borders
    .LineStyle = xlContinuous
    .Weight = xlThin
    .Color = RGB(0, 0, 0)
End With

' 对齐方式
With Range("A1")
    .HorizontalAlignment = xlCenter
    .VerticalAlignment = xlCenter
    .WrapText = True
End With

' 数字格式
Range("A1").NumberFormat = "#,##0.00"
Range("B1").NumberFormat = "yyyy-mm-dd"
Range("C1").NumberFormat = "0%"
```

### 4.3 合并单元格

```vb
' 合并
Range("A1:C1").Merge

' 取消合并
Range("A1:C1").UnMerge

' 合并后居中
With Range("A1:C1")
    .Merge
    .HorizontalAlignment = xlCenter
End With
```

### 4.4 查找和替换

```vb
' 查找
Dim found As Range
Set found = Range("A1:A100").Find(What:="Apple", LookAt:=xlWhole)
If Not found Is Nothing Then
    Debug.Print "Found at: " & found.Address
End If

' 查找所有
Dim firstAddress As String
Dim searchRange As Range
Set searchRange = Range("A1:A100")
Set found = searchRange.Find(What:="Apple", LookAt:=xlWhole)

If Not found Is Nothing Then
    firstAddress = found.Address
    Do
        Debug.Print found.Address
        Set found = searchRange.FindNext(found)
    Loop While Not found Is Nothing And found.Address <> firstAddress
End If

' 替换
Range("A1:A100").Replace What:="Old", Replacement:="New", _
                         LookAt:=xlPart, MatchCase:=False
```

---

## 5. 数据处理

### 5.1 数据验证

```vb
' 添加下拉列表
With Range("A1").Validation
    .Delete
    .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, _
         Operator:=xlBetween, Formula1:="Option1,Option2,Option3"
    .IgnoreBlank = True
    .InCellDropdown = True
End With

' 添加数字范围验证
With Range("B1").Validation
    .Delete
    .Add Type:=xlValidateWholeNumber, AlertStyle:=xlValidAlertStop, _
         Operator:=xlBetween, Formula1:="1", Formula2:="100"
    .InputTitle = "输入提示"
    .InputMessage = "请输入 1-100 之间的整数"
    .ErrorTitle = "输入错误"
    .ErrorMessage = "数值超出范围！"
End With

' 清除验证
Range("A1:B10").Validation.Delete
```

### 5.2 条件格式

```vb
' 添加条件格式
Dim cf As FormatCondition
Set cf = Range("A1:A100").FormatConditions.Add( _
    Type:=xlCellValue, Operator:=xlGreater, Formula1:="100")

With cf
    .Interior.Color = RGB(255, 200, 200)
    .Font.Color = RGB(255, 0, 0)
End With

' 数据条
Range("A1:A100").FormatConditions.AddDatabar
Range("A1:A100").FormatConditions(1).BarColor.Color = RGB(0, 120, 215)

' 清除条件格式
Range("A1:A100").FormatConditions.Delete
```

### 5.3 数据透视表

```vb
' 创建数据透视表
Dim ptCache As PivotCache
Dim pt As PivotTable
Dim ptRange As Range

Set ptRange = Sheets("Data").Range("A1:D100")
Set ptCache = ThisWorkbook.PivotCaches.Create( _
    SourceType:=xlDatabase, SourceData:=ptRange)

Set pt = ptCache.CreatePivotTable( _
    TableDestination:=Sheets("Summary").Range("A3"), _
    TableName:="SalesPivot")

' 配置字段
With pt
    .PivotFields("Region").Orientation = xlRowField
    .PivotFields("Product").Orientation = xlRowField
    .PivotFields("Sales").Orientation = xlDataField
    .PivotFields("Sales").Function = xlSum
End With

' 刷新数据透视表
pt.RefreshTable
```

---

## 6. 批量生成报表

### 6.1 根据模板生成单人报表

**场景说明**：根据 A 表的员工数据和个人信息，结合模板表批量生成每个人的独立报表。

#### 数据结构示例

**A表（员工数据表）**：
| A列 | B列 | C列 | D列 | E列 |
|-----|-----|-----|-----|-----|
| 姓名 | 部门 | 销售额 | 完成率 | 评级 |

**模板表**：包含固定格式的报表模板，使用占位符标记需要填充的位置

#### 完整代码实现

```vb
Option Explicit

' ============================================
' 主过程：批量生成员工报表
' ============================================
Sub GenerateEmployeeReports()
    Dim wsData As Worksheet
    Dim wsTemplate As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim empName As String

    ' 设置工作表
    Set wsData = ThisWorkbook.Sheets("员工数据")
    Set wsTemplate = ThisWorkbook.Sheets("报表模板")

    ' 获取最后一行
    lastRow = wsData.Cells(wsData.Rows.Count, "A").End(xlUp).Row

    ' 检查是否有数据
    If lastRow < 2 Then
        MsgBox "员工数据表中没有数据！", vbExclamation
        Exit Sub
    End If

    ' 禁用屏幕更新以提高性能
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    On Error GoTo ErrorHandler

    ' 循环处理每个员工
    For i = 2 To lastRow
        empName = wsData.Cells(i, 1).Value

        ' 跳过空行
        If empName <> "" Then
            Call CreateIndividualReport(wsData, wsTemplate, i, empName)
        End If
    Next i

    ' 恢复设置
    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic

    MsgBox "报表生成完成！共生成 " & (lastRow - 1) & " 份报表。", vbInformation
    Exit Sub

ErrorHandler:
    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic
    MsgBox "生成报表时出错：" & Err.Description, vbCritical
End Sub

' ============================================
' 创建单个员工报表
' ============================================
Sub CreateIndividualReport(wsData As Worksheet, wsTemplate As Worksheet, _
                          rowNum As Long, empName As String)
    Dim wsNew As Worksheet
    Dim dept As String
    Dim sales As Double
    Dim completionRate As Double
    Dim rating As String

    ' 读取员工数据
    dept = wsData.Cells(rowNum, 2).Value
    sales = wsData.Cells(rowNum, 3).Value
    completionRate = wsData.Cells(rowNum, 4).Value
    rating = wsData.Cells(rowNum, 5).Value

    ' 复制模板
    wsTemplate.Copy After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)
    Set wsNew = ActiveSheet

    ' 重命名工作表
    On Error Resume Next
    wsNew.Name = empName & "_报表"
    If Err.Number <> 0 Then
        wsNew.Name = empName & "_报表_" & rowNum
        Err.Clear
    End If
    On Error GoTo 0

    ' 填充数据到模板
    Call FillTemplateData(wsNew, empName, dept, sales, completionRate, rating)

    ' 可选：导出为 PDF
    ' Call ExportToPDF(wsNew, empName)
End Sub

' ============================================
' 填充模板数据
' ============================================
Sub FillTemplateData(ws As Worksheet, empName As String, dept As String, _
                    sales As Double, completionRate As Double, rating As String)

    ' 方法1：直接指定单元格
    ws.Range("B2").Value = empName
    ws.Range("B3").Value = dept
    ws.Range("B4").Value = sales
    ws.Range("B5").Value = completionRate
    ws.Range("B6").Value = rating

    ' 方法2：使用占位符替换（如果模板中使用 {{}} 标记）
    Call ReplacePlaceholders(ws, "{{姓名}}", empName)
    Call ReplacePlaceholders(ws, "{{部门}}", dept)
    Call ReplacePlaceholders(ws, "{{销售额}}", sales)
    Call ReplacePlaceholders(ws, "{{完成率}}", completionRate & "%")
    Call ReplacePlaceholders(ws, "{{评级}}", rating)

    ' 添加生成日期
    ws.Range("B7").Value = "生成日期：" & Format(Date, "yyyy-mm-dd")

    ' 根据评级设置颜色
    Call ApplyRatingColor(ws, rating)
End Sub

' ============================================
' 替换占位符
' ============================================
Sub ReplacePlaceholders(ws As Worksheet, placeholder As String, newValue As Variant)
    Dim cell As Range
    Dim usedRange As Range

    Set usedRange = ws.UsedRange

    For Each cell In usedRange
        If InStr(cell.Value, placeholder) > 0 Then
            cell.Value = Replace(cell.Value, placeholder, newValue)
        End If
    Next cell
End Sub

' ============================================
' 根据评级应用颜色
' ============================================
Sub ApplyRatingColor(ws As Worksheet, rating As String)
    Dim colorRGB As Long

    Select Case rating
        Case "优秀", "A"
            colorRGB = RGB(0, 176, 80)    ' 绿色
        Case "良好", "B"
            colorRGB = RGB(0, 112, 192)   ' 蓝色
        Case "一般", "C"
            colorRGB = RGB(255, 192, 0)   ' 橙色
        Case "较差", "D"
            colorRGB = RGB(255, 0, 0)     ' 红色
        Case Else
            colorRGB = RGB(128, 128, 128) ' 灰色
    End Select

    ws.Range("B6").Interior.Color = colorRGB
    ws.Range("B6").Font.Color = RGB(255, 255, 255)
    ws.Range("B6").Font.Bold = True
End Sub

' ============================================
' 导出为 PDF（可选）
' ============================================
Sub ExportToPDF(ws As Worksheet, empName As String)
    Dim pdfPath As String

    pdfPath = ThisWorkbook.Path & "\报表\" & empName & "_报表.pdf"

    ' 确保目录存在
    If Dir(ThisWorkbook.Path & "\报表\", vbDirectory) = "" Then
        MkDir ThisWorkbook.Path & "\报表\"
    End If

    ' 导出为 PDF
    ws.ExportAsFixedFormat _
        Type:=xlTypePDF, _
        Filename:=pdfPath, _
        Quality:=xlQualityStandard, _
        IncludeDocProperties:=True, _
        IgnorePrintAreas:=False, _
        OpenAfterPublish:=False
End Sub
```

### 6.2 根据多个条件生成汇总报表

```vb
' ============================================
' 按部门生成分部门汇总报表
' ============================================
Sub GenerateDepartmentReports()
    Dim wsData As Worksheet
    Dim wsSummary As Worksheet
    Dim dict As Object
    Dim lastRow As Long
    Dim i As Long
    Dim dept As String
    Dim key As Variant

    Set wsData = ThisWorkbook.Sheets("员工数据")
    lastRow = wsData.Cells(wsData.Rows.Count, "A").End(xlUp).Row

    ' 创建字典存储部门数据
    Set dict = CreateObject("Scripting.Dictionary")

    ' 收集各部门数据
    For i = 2 To lastRow
        dept = wsData.Cells(i, 2).Value
        If dept <> "" Then
            If Not dict.Exists(dept) Then
                dict.Add dept, CreateDepartmentData()
            End If

            ' 累加数据
            dict(dept)("Count") = dict(dept)("Count") + 1
            dict(dept)("TotalSales") = dict(dept)("TotalSales") + wsData.Cells(i, 3).Value
        End If
    Next i

    ' 创建汇总表
    Set wsSummary = ThisWorkbook.Sheets.Add
    wsSummary.Name = "部门汇总"

    ' 写入表头
    wsSummary.Range("A1").Value = "部门"
    wsSummary.Range("B1").Value = "人数"
    wsSummary.Range("C1").Value = "总销售额"
    wsSummary.Range("D1").Value = "平均销售额"

    ' 写入数据
    Dim row As Long
    row = 2

    For Each key In dict.Keys
        wsSummary.Cells(row, 1).Value = key
        wsSummary.Cells(row, 2).Value = dict(key)("Count")
        wsSummary.Cells(row, 3).Value = dict(key)("TotalSales")
        wsSummary.Cells(row, 4).Formula = "=C" & row & "/B" & row
        row = row + 1
    Next key

    ' 格式化
    wsSummary.Range("A1:D1").Font.Bold = True
    wsSummary.Columns("A:D").AutoFit
    wsSummary.Range("C2:C" & row - 1).NumberFormat = "#,##0.00"
    wsSummary.Range("D2:D" & row - 1).NumberFormat = "#,##0.00"

    MsgBox "部门汇总报表生成完成！", vbInformation
End Sub

' ============================================
' 创建部门数据结构
' ============================================
Function CreateDepartmentData() As Object
    Dim data As Object
    Set data = CreateObject("Scripting.Dictionary")
    data.Add "Count", 0
    data.Add "TotalSales", 0
    Set CreateDepartmentData = data
End Function
```

### 6.3 批量生成带图表的报表

```vb
' ============================================
' 生成带图表的个人业绩报表
' ============================================
Sub GenerateReportWithChart()
    Dim wsData As Worksheet
    Dim wsTemplate As Worksheet
    Dim lastRow As Long
    Dim i As Long

    Set wsData = ThisWorkbook.Sheets("月度数据")
    Set wsTemplate = ThisWorkbook.Sheets("图表模板")
    lastRow = wsData.Cells(wsData.Rows.Count, "A").End(xlUp).Row

    Application.ScreenUpdating = False

    For i = 2 To lastRow
        Call CreateChartReport(wsData, wsTemplate, i)
    Next i

    Application.ScreenUpdating = True
    MsgBox "图表报表生成完成！", vbInformation
End Sub

' ============================================
' 创建带图表的报表
' ============================================
Sub CreateChartReport(wsData As Worksheet, wsTemplate As Worksheet, rowNum As Long)
    Dim wsNew As Worksheet
    Dim empName As String
    Dim chartObj As ChartObject
    Dim chartRange As Range

    empName = wsData.Cells(rowNum, 1).Value

    ' 复制模板
    wsTemplate.Copy After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)
    Set wsNew = ActiveSheet
    wsNew.Name = empName & "_业绩图"

    ' 填充基础数据
    wsNew.Range("B2").Value = empName
    wsNew.Range("B3").Value = wsData.Cells(rowNum, 2).Value

    ' 准备图表数据（假设第3-14列是12个月的数据）
    Set chartRange = wsNew.Range("D2:O2")
    Dim month As Integer
    For month = 1 To 12
        wsNew.Cells(2, 3 + month).Value = wsData.Cells(rowNum, 2 + month).Value
    Next month

    ' 创建柱状图
    Set chartObj = wsNew.ChartObjects.Add(Left:=50, Top:=100, Width:=600, Height:=300)

    With chartObj.Chart
        .SetSourceData Source:=chartRange
        .ChartType = xlColumnClustered
        .HasTitle = True
        .ChartTitle.Text = empName & " 月度业绩趋势"

        ' 设置坐标轴
        .Axes(xlCategory).HasTitle = True
        .Axes(xlCategory).AxisTitle.Text = "月份"
        .Axes(xlValue).HasTitle = True
        .Axes(xlValue).AxisTitle.Text = "销售额"

        ' 美化图表
        .ApplyChartStyle (8)
    End With
End Sub
```

---

## 7. 图表操作

### 7.1 创建基本图表

```vb
' 创建柱状图
Sub CreateBarChart()
    Dim chartObj As ChartObject
    Dim ws As Worksheet

    Set ws = ActiveSheet

    ' 创建图表对象
    Set chartObj = ws.ChartObjects.Add(Left:=100, Top:=50, Width:=500, Height:=300)

    With chartObj.Chart
        .SetSourceData Source:=ws.Range("A1:B10")
        .ChartType = xlColumnClustered
        .HasTitle = True
        .ChartTitle.Text = "销售数据"
    End With
End Sub

' 创建折线图
Sub CreateLineChart()
    Dim chartObj As ChartObject

    Set chartObj = ActiveSheet.ChartObjects.Add(Left:=100, Top:=50, Width:=500, Height:=300)

    With chartObj.Chart
        .SetSourceData Source:=Range("A1:C20")
        .ChartType = xlLine
        .HasTitle = True
        .ChartTitle.Text = "趋势分析"
    End With
End Sub

' 创建饼图
Sub CreatePieChart()
    Dim chartObj As ChartObject

    Set chartObj = ActiveSheet.ChartObjects.Add(Left:=100, Top:=50, Width:=400, Height:=300)

    With chartObj.Chart
        .SetSourceData Source:=Range("A1:B5")
        .ChartType = xlPie
        .HasTitle = True
        .ChartTitle.Text = "占比分析"
        .ApplyDataLabels
    End With
End Sub
```

### 7.2 图表格式化

```vb
' 高级图表格式化
Sub FormatChart()
    Dim chartObj As ChartObject
    Dim cht As Chart
    Dim srs As Series

    Set chartObj = ActiveSheet.ChartObjects(1)
    Set cht = chartObj.Chart

    With cht
        ' 标题格式
        .HasTitle = True
        With .ChartTitle.Format.TextFrame2.TextRange.Font
            .Size = 14
            .Bold = msoTrue
            .Fill.ForeColor.RGB = RGB(0, 0, 0)
        End With

        ' 图例
        .HasLegend = True
        .Legend.Position = xlLegendPositionBottom

        ' 网格线
        .Axes(xlValue).MajorGridlines.Format.Line.ForeColor.RGB = RGB(200, 200, 200)

        ' 数据系列
        For Each srs In .SeriesCollection
            With srs.Format.Fill
                .ForeColor.RGB = RGB(0, 120, 215)
                .Transparency = 0.3
            End With
            srs.HasDataLabels = True
        Next srs
    End With
End Sub
```

---

## 8. 用户窗体

### 8.1 创建简单窗体

```vb
' 在 VBA 编辑器中插入 UserForm，然后添加以下代码

' 显示窗体
Sub ShowInputForm()
    UserForm1.Show
End Sub

' 窗体初始化
Private Sub UserForm_Initialize()
    ' 填充下拉列表
    ComboBox1.AddItem "选项1"
    ComboBox1.AddItem "选项2"
    ComboBox1.AddItem "选项3"

    ' 设置默认值
    TextBox1.Value = ""
    CheckBox1.Value = False
End Sub

' 确定按钮
Private Sub cmdOK_Click()
    Dim ws As Worksheet
    Dim nextRow As Long

    Set ws = ThisWorkbook.Sheets("数据")
    nextRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1

    ' 写入数据
    ws.Cells(nextRow, 1).Value = TextBox1.Value
    ws.Cells(nextRow, 2).Value = ComboBox1.Value
    ws.Cells(nextRow, 3).Value = CheckBox1.Value

    MsgBox "数据已保存！", vbInformation
    Unload Me
End Sub

' 取消按钮
Private Sub cmdCancel_Click()
    Unload Me
End Sub
```

### 8.2 动态控件

```vb
' 动态添加控件
Sub AddDynamicControls()
    Dim frm As UserForm
    Dim lbl As MSForms.Label
    Dim txt As MSForms.TextBox
    Dim i As Integer

    Set frm = UserForm1

    For i = 1 To 5
        ' 添加标签
        Set lbl = frm.Controls.Add("Forms.Label.1", "Label" & i)
        With lbl
            .Caption = "字段" & i & ":"
            .Left = 10
            .Top = 20 + (i - 1) * 30
            .Width = 80
        End With

        ' 添加文本框
        Set txt = frm.Controls.Add("Forms.TextBox.1", "TextBox" & i)
        With txt
            .Left = 100
            .Top = 20 + (i - 1) * 30
            .Width = 150
        End With
    Next i

    frm.Height = 200
    frm.Show
End Sub
```

---

## 9. 事件处理

### 9.1 工作表事件

```vb
' 在工作表代码模块中

' 单元格改变事件
Private Sub Worksheet_Change(ByVal Target As Range)
    ' 监控特定区域
    If Not Intersect(Target, Range("A1:A100")) Is Nothing Then
        Dim cell As Range
        For Each cell In Target
            If cell.Value > 1000 Then
                cell.Interior.Color = RGB(255, 200, 200)
            Else
                cell.Interior.ColorIndex = xlNone
            End If
        Next cell
    End If
End Sub

' 双击事件
Private Sub Worksheet_BeforeDoubleClick(ByVal Target As Range, Cancel As Boolean)
    If Not Intersect(Target, Range("B1:B100")) Is Nothing Then
        Cancel = True
        Target.Value = Date
    End If
End Sub

' 选择改变事件
Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    ' 高亮当前行
    Cells.Interior.ColorIndex = xlNone
    Target.EntireRow.Interior.Color = RGB(230, 230, 250)
End Sub
```

### 9.2 工作簿事件

```vb
' 在 ThisWorkbook 代码模块中

' 工作簿打开事件
Private Sub Workbook_Open()
    MsgBox "欢迎使用本工作簿！", vbInformation
    Application.StatusBar = "工作簿已加载"
End Sub

' 工作簿关闭前事件
Private Sub Workbook_BeforeClose(Cancel As Boolean)
    Dim response As VbMsgBoxResult
    response = MsgBox("是否保存更改？", vbYesNoCancel + vbQuestion)

    Select Case response
        Case vbYes
            ThisWorkbook.Save
        Case vbNo
            ThisWorkbook.Saved = True
        Case vbCancel
            Cancel = True
    End Select
End Sub

' 新工作表创建事件
Private Sub Workbook_NewSheet(ByVal Sh As Object)
    Sh.Name = "新工作表_" & Format(Now, "yyyymmdd_hhmmss")
End Sub
```

---

## 10. 错误处理

### 10.1 基本错误处理

```vb
' 错误处理模式
Sub ErrorHandlingExample()
    On Error GoTo ErrorHandler

    ' 可能出错的代码
    Dim result As Double
    result = 100 / 0

    Exit Sub

ErrorHandler:
    MsgBox "发生错误：" & Err.Description & vbCrLf & _
           "错误号：" & Err.Number, vbCritical

    ' 记录错误日志
    LogError Err.Number, Err.Description
End Sub

' 忽略错误继续执行
Sub IgnoreErrors()
    On Error Resume Next

    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("不存在的工作表")

    If Err.Number <> 0 Then
        MsgBox "工作表不存在，创建新工作表"
        Set ws = ThisWorkbook.Sheets.Add
        ws.Name = "新工作表"
        Err.Clear
    End If

    On Error GoTo 0  ' 恢复正常错误处理
End Sub
```

### 10.2 错误日志

```vb
' 记录错误到日志文件
Sub LogError(errorNum As Long, errorDesc As String)
    Dim logFile As String
    Dim fileNum As Integer

    logFile = ThisWorkbook.Path & "\error_log.txt"
    fileNum = FreeFile

    Open logFile For Append As #fileNum
    Print #fileNum, Format(Now, "yyyy-mm-dd hh:mm:ss") & _
              " | 错误号：" & errorNum & _
              " | 描述：" & errorDesc
    Close #fileNum
End Sub
```

---

## 11. 性能优化

### 11.1 加速技巧

```vb
' 优化设置
Sub OptimizePerformance()
    ' 禁用屏幕更新
    Application.ScreenUpdating = False

    ' 禁用自动计算
    Application.Calculation = xlCalculationManual

    ' 禁用状态栏更新
    Application.DisplayStatusBar = False

    ' 禁用事件
    Application.EnableEvents = False

    ' ===== 执行你的代码 =====

    ' 恢复设置
    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic
    Application.DisplayStatusBar = True
    Application.EnableEvents = True
End Sub
```

### 11.2 批量操作

```vb
' 批量写入（比逐单元格快）
Sub BatchWrite()
    Dim data(1 To 1000, 1 To 5) As Variant
    Dim i As Long, j As Long

    ' 准备数据
    For i = 1 To 1000
        For j = 1 To 5
            data(i, j) = i * j
        Next j
    Next i

    ' 一次性写入
    Range("A1:E1000").Value = data
End Sub

' 使用数组读取
Sub BatchRead()
    Dim data As Variant
    data = Range("A1:E1000").Value

    ' 处理数组
    Dim i As Long
    For i = 1 To UBound(data, 1)
        data(i, 1) = data(i, 1) * 2
    Next i

    ' 写回
    Range("A1:E1000").Value = data
End Sub
```

### 11.3 避免 Select 和 Activate

```vb
' 不好的做法
Sub BadPractice()
    Sheets("Sheet1").Select
    Range("A1").Select
    Selection.Value = "Hello"
    Selection.Copy
    Sheets("Sheet2").Select
    Range("B1").Select
    ActiveSheet.Paste
End Sub

' 好的做法
Sub GoodPractice()
    ThisWorkbook.Sheets("Sheet2").Range("B1").Value = _
        ThisWorkbook.Sheets("Sheet1").Range("A1").Value
End Sub
```

---

## 12. 实用案例

### 12.1 合并多个工作簿

```vb
' 合并同一文件夹下的所有 Excel 文件
Sub MergeWorkbooks()
    Dim folderPath As String
    Dim fileName As String
    Dim wbSource As Workbook
    Dim wsTarget As Worksheet
    Dim lastRow As Long
    Dim sourceLastRow As Long

    folderPath = "C:\Data\Reports\"
    fileName = Dir(folderPath & "*.xlsx")

    Set wsTarget = ThisWorkbook.Sheets.Add
    wsTarget.Name = "合并数据"

    Application.ScreenUpdating = False

    Do While fileName <> ""
        Set wbSource = Workbooks.Open(folderPath & fileName)

        ' 复制数据
        sourceLastRow = wbSource.Sheets(1).Cells(Rows.Count, 1).End(xlUp).Row
        lastRow = wsTarget.Cells(wsTarget.Rows.Count, 1).End(xlUp).Row

        If lastRow = 1 And wsTarget.Cells(1, 1).Value = "" Then
            wbSource.Sheets(1).Range("A1").CurrentRegion.Copy _
                wsTarget.Range("A1")
        Else
            wbSource.Sheets(1).Range("A2").CurrentRegion.Copy _
                wsTarget.Cells(lastRow + 1, 1)
        End If

        wbSource.Close SaveChanges:=False
        fileName = Dir()
    Loop

    Application.ScreenUpdating = True
    MsgBox "合并完成！", vbInformation
End Sub
```

### 12.2 数据清洗

```vb
' 清理数据：去除空格、统一格式
Sub CleanData()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim cell As Range

    Set ws = ActiveSheet
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    Application.ScreenUpdating = False

    ' 去除前后空格
    For Each cell In ws.Range("A1:D" & lastRow)
        If Not IsEmpty(cell) Then
            cell.Value = Trim(cell.Value)
        End If
    Next cell

    ' 统一日期格式
    For Each cell In ws.Range("E1:E" & lastRow)
        If IsDate(cell.Value) Then
            cell.Value = CDate(cell.Value)
            cell.NumberFormat = "yyyy-mm-dd"
        End If
    Next cell

    ' 删除空行
    For i = lastRow To 2 Step -1
        If Application.WorksheetFunction.CountA(ws.Rows(i)) = 0 Then
            ws.Rows(i).Delete
        End If
    Next i

    Application.ScreenUpdating = True
    MsgBox "数据清洗完成！", vbInformation
End Sub
```

### 12.3 自动生成目录

```vb
' 创建工作表目录
Sub CreateTableOfContents()
    Dim wsTOC As Worksheet
    Dim ws As Worksheet
    Dim row As Long

    ' 删除旧目录
    On Error Resume Next
    Application.DisplayAlerts = False
    ThisWorkbook.Sheets("目录").Delete
    Application.DisplayAlerts = True
    On Error GoTo 0

    ' 创建新目录
    Set wsTOC = ThisWorkbook.Sheets.Add(Before:=ThisWorkbook.Sheets(1))
    wsTOC.Name = "目录"

    wsTOC.Range("A1").Value = "序号"
    wsTOC.Range("B1").Value = "工作表名称"
    wsTOC.Range("C1").Value = "链接"

    row = 2

    For Each ws In ThisWorkbook.Sheets
        If ws.Name <> "目录" Then
            wsTOC.Cells(row, 1).Value = row - 1
            wsTOC.Cells(row, 2).Value = ws.Name

            ' 添加超链接
            wsTOC.Hyperlinks.Add _
                Anchor:=wsTOC.Cells(row, 3), _
                Address:="", _
                SubAddress:="'" & ws.Name & "'!A1", _
                TextToDisplay:="跳转到 " & ws.Name

            row = row + 1
        End If
    Next ws

    wsTOC.Columns("A:C").AutoFit
    MsgBox "目录生成完成！", vbInformation
End Sub
```

### 12.4 邮件批量发送

```vb
' 通过 Outlook 批量发送邮件
Sub SendEmails()
    Dim outlookApp As Object
    Dim mailItem As Object
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long

    Set ws = ThisWorkbook.Sheets("邮件列表")
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    ' 创建 Outlook 对象
    Set outlookApp = CreateObject("Outlook.Application")

    For i = 2 To lastRow
        Set mailItem = outlookApp.CreateItem(0)

        With mailItem
            .To = ws.Cells(i, 1).Value           ' 收件人
            .Subject = ws.Cells(i, 2).Value      ' 主题
            .Body = ws.Cells(i, 3).Value         ' 正文

            ' 添加附件
            If ws.Cells(i, 4).Value <> "" Then
                .Attachments.Add ws.Cells(i, 4).Value
            End If

            .Send  ' 或使用 .Display 预览
        End With

        Set mailItem = Nothing
    Next i

    Set outlookApp = Nothing
    MsgBox "邮件发送完成！", vbInformation
End Sub
```

### 12.5 数据备份

```vb
' 自动备份当前工作簿
Sub AutoBackup()
    Dim backupPath As String
    Dim timestamp As String
    Dim originalName As String

    timestamp = Format(Now, "yyyymmdd_hhmmss")
    originalName = Left(ThisWorkbook.Name, InStrRev(ThisWorkbook.Name, ".") - 1)
    backupPath = ThisWorkbook.Path & "\Backup\"

    ' 创建备份目录
    If Dir(backupPath, vbDirectory) = "" Then
        MkDir backupPath
    End If

    ' 另存为备份
    ThisWorkbook.SaveCopyAs backupPath & originalName & "_" & timestamp & ".xlsm"

    MsgBox "备份完成！" & vbCrLf & "路径：" & backupPath, vbInformation
End Sub
```

---

## 附录

### A. 常用快捷键

```
Alt + F11       打开 VBA 编辑器
F5              运行宏
F8              单步执行
Ctrl + Break    中断执行
Ctrl + G        打开立即窗口
Ctrl + R        打开工程资源管理器
```

### B. 常用常量

```vb
' 颜色
RGB(255, 0, 0)      ' 红色
RGB(0, 255, 0)      ' 绿色
RGB(0, 0, 255)      ' 蓝色

' 对齐
xlCenter            ' 居中
xlLeft              ' 左对齐
xlRight             ' 右对齐

' 边框样式
xlContinuous        ' 实线
xlDash              ' 虚线
xlDot               ' 点线

' 图表类型
xlColumnClustered   ' 簇状柱形图
xlLine              ' 折线图
xlPie               ' 饼图
```

### C. 有用的资源

- **微软官方文档**: https://docs.microsoft.com/zh-cn/office/vba/api/overview/excel
- **Excel VBA 参考**: https://learn.microsoft.com/zh-cn/office/vba/api/excel
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/vba
- **Excel Easy**: https://www.excel-easy.com/vba.html

---

**祝您 Excel VBA 编程愉快！** 📊

如有问题，请查阅官方文档或社区论坛。
