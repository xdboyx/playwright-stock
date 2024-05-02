import { test, expect } from '@playwright/test';
const fs = require('fs');
const Tesseract = require('tesseract.js');

const SOURCE_IMG_FOLDER = './img';
const DESTINATION_FOLDER = './imgRecognize';

test('recognize image', async ({ page }) => {
  // test.setTimeout(120000)

  // await page.goto('https://stockhouse.com.tw/dantime.html');

  // await page.waitForLoadState('load');

  // 創建目標文件夾
  if (!fs.existsSync(DESTINATION_FOLDER)) {
    fs.mkdirSync(DESTINATION_FOLDER);
  }

  let files: string[] = [];
  fs.readdirSync(SOURCE_IMG_FOLDER).forEach(file => {
    // console.log(file);
    files.push(file);
  });

  // 遍歷每個文件
  for (let count = 0; count < files.length; count++) {
    const file = files[count];
    const filePath = `${SOURCE_IMG_FOLDER}/${file}`;
    console.dir(filePath)
    var recognizeFile = await recognizeText(filePath)
    console.dir(recognizeFile)

    // 讀取源文件
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('無法讀取源文件:', err);
        return;
      }


      // 寫入目標文件
      const destinationPath = `${DESTINATION_FOLDER}/${recognizeFile}.png`;

      fs.writeFile(destinationPath, data, (err) => {
        if (err) {
          console.error('無法寫入目標文件:', err);
          return;
        }
        console.log('圖片已成功複製到:', destinationPath);
      });
    });
  }



});

async function recognizeText(imagePath) {
  try {
    const result = await Tesseract.recognize(
      imagePath,
      'chi_tra', // 語言設置，這裡使用中文
      { logger: m => console.log(m) } // 可選的日誌函數
    );
    // console.log(result.data.text);
    console.log(result.data.text);
    const dataText = result.data.text

    const regexNumber = /下 列 為 貴 股東 對 (\d{4})/;
    const matchNumber = dataText.match(regexNumber);

    const regexName = /戶 名 : (.+)/;
    const matchName = dataText.match(regexName);

    const stamp = matchName ? matchName[1].replaceAll(' ', '') : getDateStamp()

    if (matchNumber) {
      console.log("找到匹配:", matchNumber[1]);
      return `${matchNumber[1]}_${stamp}`;
    } else {
      console.log("未找到匹配");
      return `${stamp}`;
    }

  } catch (error) {
    console.error(error);
  }
}

function getDateStamp() {
  const now = new Date();
  const hour = now.getHours(); // 獲取小時（24小時制）
  const minute = now.getMinutes(); // 獲取分鐘
  const second = now.getSeconds(); // 

  return `${hour}${minute}${second}`
}

