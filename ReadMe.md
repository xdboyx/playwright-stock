# 安裝手冊

## 環境安裝
#### node.js 
https://nodejs.org/en/download
#### vscode
https://code.visualstudio.com/

### vscode延伸模組
- 繁體中文語言套件
Chinese (Traditional) Language Pack for Visual Studio Code
- 畫面直接執行
Playwright Test for VSCode

### 使用套件
#### exceljs
輸出成 excel 檔案
https://www.npmjs.com/package/exceljs
`npm i exceljs`

#### tesseract
圖片辨識
https://www.npmjs.com/package/tesseract.js
`npm i tesseract.js`

### 怎麼使用
解壓縮後開啟vscode，開啟vscode的終端機，輸入以下指令
`npm install`  
`npx playwright install`  

原始圖片放在 img資料夾 (目前有放個 example.png)  
結果圖片輸出 imgRecognize資料夾  