Dim fso, shell, tempPath, outputPath
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
tempPath = shell.ExpandEnvironmentStrings("%TEMP%") & "\\tc-vbs-save"
If Not fso.FolderExists(tempPath) Then fso.CreateFolder tempPath
outputPath = tempPath & "\\blank.xlsx"
If fso.FileExists(outputPath) Then fso.DeleteFile outputPath, True

Dim excel, workbook
Set excel = CreateObject("Excel.Application")
excel.Visible = False
excel.DisplayAlerts = False
Set workbook = excel.Workbooks.Add()
workbook.Worksheets(1).Cells(1,1).Value = "hello"
On Error Resume Next
workbook.SaveAs outputPath, 51
If Err.Number <> 0 Then
  WScript.StdErr.WriteLine "SaveAs failed: " & Err.Description
  WScript.Quit 1
End If
workbook.Close False
excel.Quit
WScript.Echo outputPath
