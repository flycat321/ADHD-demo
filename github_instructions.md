# 将ADHD助手应用推送到GitHub的步骤

## 1. 从Replit导出代码

1. 在Replit界面中，点击左上角的项目名称
2. 选择"下载为zip"选项，将代码下载到本地计算机

## 2. 在本地设置仓库

1. 解压下载的zip文件到一个文件夹
2. 打开命令行工具（如Terminal或Command Prompt）
3. 导航到解压后的文件夹：
   ```
   cd 路径/到/解压文件夹
   ```

## 3. 在GitHub创建新仓库

1. 登录您的GitHub账户
2. 点击右上角的"+"图标，然后选择"New repository"
3. 填写仓库名称，如"adhd-assistant-app"
4. 添加可选的描述信息
5. 选择仓库可见性（公开或私有）
6. 不要勾选"Initialize this repository with a README"
7. 点击"Create repository"按钮

## 4. 将本地代码推送到GitHub

在您的本地命令行中执行以下命令：

```bash
# 确认git已初始化（在Replit已完成）
git status

# 如果需要，设置用户信息
git config --global user.name "您的GitHub用户名"
git config --global user.email "您的GitHub邮箱"

# 添加GitHub仓库作为远程仓库
git remote add origin https://github.com/您的用户名/adhd-assistant-app.git

# 推送代码到GitHub
git push -u origin main
```

执行上述命令时，您可能需要输入GitHub的用户名和密码。推荐使用GitHub的个人访问令牌而不是密码，因为密码认证将被GitHub逐步淘汰。

## 5. 验证推送是否成功

1. 刷新您的GitHub仓库页面
2. 确认所有文件已成功上传
3. 查看README.md是否正确显示

## 6. 设置GitHub Pages（可选）

如果您想直接从GitHub托管您的应用：

1. 在GitHub仓库页面，点击"Settings"
2. 向下滚动到"GitHub Pages"部分
3. 在Source下拉菜单中选择"main"分支
4. 点击"Save"按钮
5. 等待几分钟，然后您可以通过显示的URL访问您的应用

## 注意事项

- 确保不要将包含敏感信息的文件（如含有真实密码的.env文件）推送到GitHub
- 定期更新您的仓库以反映最新的代码变更
- 考虑使用GitHub的Issues功能来跟踪问题和改进建议
