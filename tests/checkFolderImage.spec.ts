import { test, expect } from '@playwright/test';
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const xlsx = require('xlsx');
import { createCanvas, registerFont } from 'canvas';

const BASE_FOLDER = 'C:\\Users\\XD\\Desktop\\股東TEST\\2025上傳區-0217';
const BASE_FOLDER_OUTPUT = `${BASE_FOLDER}\\Output`;
const UNRECOGNIZE_IMG_FOLDER = `${BASE_FOLDER}\\Output\\無法辨識圖片`;

interface DataItem {
  id: string;
  folderName: string;
}

//step1: 拿excel 建資料夾
test('create folder', async ({ page }) => {
  // 讀取 Excel 檔案
  const workbook = xlsx.readFile(`${BASE_FOLDER}\\2025股東會紀念品.xlsx`);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // 遍歷每一列，從第2列開始（跳過標題）
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    const folderName = row[5]; // 第六欄

    // 檢查 folderName 是否為空（空字串、null 或 undefined）
    if (folderName.trim() === '') {
      continue; // 跳過本次迴圈，進入下一次迴圈
    }

    // 檢查資料是否存在
    if (folderName) {
      const folderPath = path.join(BASE_FOLDER_OUTPUT, folderName);
      console.log(`建立資料夾: ${folderPath}`);

      // 檢查資料夾是否已存在，若不存在則建立
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`已建立資料夾: ${folderPath}`);
      } else {
        console.log(`資料夾已存在: ${folderPath}`);
      }
    }
  }
});

//step2: 圖片判斷
test('recognize image', async ({ page }) => {
  // 讀取 Excel 檔案
  const workbook = xlsx.readFile(`${BASE_FOLDER}\\2025股東會紀念品.xlsx`);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  console.dir(jsonData)

  let dataList: DataItem[] = [];
  // 遍歷每一列，從第2列開始（跳過標題）
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    const id = row[0]; // 第一欄
    const folderName = row[5]; // 第六欄

    if (folderName.trim() === '') {
      continue; // 跳過本次迴圈，進入下一次迴圈
    }
    dataList.push({ id, folderName });
  }

  console.dir(dataList)


  // 遞迴取得所有圖片檔案
  const files = getAllFiles(BASE_FOLDER).filter(file =>
    file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
  );

  // 遍歷每個文件
  for (let count = 0; count < files.length; count++) {
    const filePath = files[count];
    console.dir(filePath);

    try {
      var recognizeFile = await recognizeText(filePath);
      console.dir(`recognizeFile: ${recognizeFile}`);

      // 從辨識結果中取得號碼部分
      const numberPart = recognizeFile.split('_')[0]; // 取得 "2890"
      console.log('辨識號碼:', numberPart);

      // 從 dataList 中找到對應的 folderName
      const folderName = findFolderNameById(numberPart, dataList);
      console.dir(`folderName: ${folderName}`);

      if (folderName) {
        // 使用找到的 folderName 來尋找對應的 Output 資料夾
        const targetFolder = findMatchingFolder(BASE_FOLDER_OUTPUT, folderName);
        console.dir(`targetFolder: ${targetFolder}`)

        if (targetFolder) {
          // 確保目標文件夾存在
          if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
          }

          // 讀取源文件
          const data = fs.readFileSync(filePath);

          // 寫入目標文件
          const destinationPath = `${targetFolder}/${recognizeFile}.png`;
          fs.writeFileSync(destinationPath, data);
          console.log('圖片已成功複製到:', destinationPath);

          // 刪除原圖片
          // fs.unlinkSync(filePath);
        } else {
          console.log('未找到對應的資料夾，跳過:', recognizeFile);
          unrecognizeImgCopy(filePath);

        }
      } else {
        console.log('未在 Excel 中找到對應的資料，跳過:', recognizeFile);
        unrecognizeImgCopy(filePath);
      }


    } catch (err) {
      console.error('處理圖片時出錯:', err);
      unrecognizeImgCopy(filePath);
    }
  }

  function unrecognizeImgCopy(filePath: never) {
    const data = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    if (!fs.existsSync(UNRECOGNIZE_IMG_FOLDER)) {
      fs.mkdirSync(UNRECOGNIZE_IMG_FOLDER, { recursive: true });
    }

    const destinationPath = `${UNRECOGNIZE_IMG_FOLDER}/${fileName}`;
    fs.writeFileSync(destinationPath, data);
  }
});

// 遞迴取得所有檔案
function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath)); // 遞迴進入子目錄
    } else {
      results.push(filePath);
    }
  });
  return results;
}

// 從 dataList 中尋找對應的 folderName
function findFolderNameById(id: string, dataList: DataItem[]): string | null {
  const matchedItem = dataList.find(item => item.id == id);
  return matchedItem ? matchedItem.folderName : null;
}

// 尋找以 folderName 開頭的資料夾
function findMatchingFolder(baseDir, folderName) {
  const folders = fs.readdirSync(baseDir);

  for (let i = 0; i < folders.length; i++) {
    const currentFolderName = folders[i];
    const folderPath = path.join(baseDir, currentFolderName);

    // 確認是否為目錄，且名稱與 folderName 相符
    if (fs.statSync(folderPath).isDirectory() && currentFolderName.startsWith(folderName)) {
      console.log('找到對應資料夾:', folderPath);
      return folderPath;
    }
  }

  console.log('未找到對應資料夾');
  return null;
}


async function recognizeText(imagePath) {
  try {
    const result = await Tesseract.recognize(
      imagePath,
      'chi_tra', // 語言設置，這裡使用中文
      // { logger: m => console.log(m) } // 可選的日誌函數
    );
    //辨識log
    // console.log(result.data.text);
    const dataText = result.data.text;

    const regexNumber = /下 列 為 貴 股東 對 (\d{4})/;
    const matchNumber = dataText.match(regexNumber);

    const regexName = /戶 名 : (.+)/;
    const matchName = dataText.match(regexName);

    const stamp = matchName ? matchName[1].replaceAll(' ', '') : getDateStamp();

    if (matchNumber) {
      // console.log("找到匹配:", matchNumber[1]);
      return `${matchNumber[1]}_${stamp}`;
    } else {
      // console.log("未找到匹配");
      return `${stamp}`;
    }
  } catch (error) {
    console.error('識別文字時出錯:', error);
  }
}

function getDateStamp() {
  const now = new Date();
  const hour = now.getHours(); // 獲取小時（24小時制）
  const minute = now.getMinutes(); // 獲取分鐘
  const second = now.getSeconds(); // 

  return `${hour}${minute}${second}`;
}

//step3: 資料夾名稱 做成 圖片
test('folder TextToImage', async ({ page }) => {
  generateImages();
  expect(true).toBe(true); // 確保測試通過
});

// 設定圖片大小
const WIDTH = 800;
const HEIGHT = 600;
const FONT_SIZE = 50;
const LINE_HEIGHT = FONT_SIZE * 1.2;

// 將文字繪製到圖片上
const drawTextOnCanvas = (ctx, textArray) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT); // 填滿背景顏色

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${FONT_SIZE}px Microsoft YaHei`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  textArray.forEach((line, index) => {
    const x = WIDTH / 2;
    const y = (HEIGHT / 2 - (textArray.length / 2) * LINE_HEIGHT) + index * LINE_HEIGHT;
    ctx.fillText(line, x, y);
  });
};

// 取得資料夾名稱並生成圖片
const generateImages = () => {
  fs.readdirSync(BASE_FOLDER_OUTPUT, { withFileTypes: true }).forEach(dirent => {
    if (dirent.isDirectory()) {
      const folderName = dirent.name;
      const folderPath = path.join(BASE_FOLDER_OUTPUT, folderName);

      // 將資料夾名稱依空格分成多行
      const textArray = folderName.split(/\s+/);

      const canvas = createCanvas(WIDTH, HEIGHT);
      const ctx = canvas.getContext('2d');
      drawTextOnCanvas(ctx, textArray);

      const outputPath = path.join(folderPath, '0.png');
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);

      console.log(`圖片已生成：${outputPath}`);
    }
  });
};


