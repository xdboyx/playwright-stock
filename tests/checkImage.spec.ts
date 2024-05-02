import { test, expect } from '@playwright/test';
const fs = require('fs');
const Tesseract = require('tesseract.js');

const FILITER_DATE = new Date('2024-01-01');

test('get stock', async ({ page }) => {
  // test.setTimeout(120000)

  // await page.goto('https://stockhouse.com.tw/dantime.html');

  // await page.waitForLoadState('load');

  const filePath = './img/Screenshot_20240427_214621.jpg';

  var recognizeFile = await recognizeText(filePath)


  // 讀取源文件
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('無法讀取源文件:', err);
      return;
    }


    // 寫入目標文件
    const destinationFolder = './imgRecognize';
    const destinationPath = `${destinationFolder}/${recognizeFile}.png`;

    // 確認目標文件夾是否存在
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }

    fs.writeFile(destinationPath, data, (err) => {
      if (err) {
        console.error('無法寫入目標文件:', err);
        return;
      }
      console.log('圖片已成功複製到:', destinationPath);
    });
  });

});

async function recognizeText(imagePath) {
  try {
    const result = await Tesseract.recognize(
      imagePath,
      'chi_tra', // 語言設置，這裡使用英文
      { logger: m => console.log(m) } // 可選的日誌函數
    );
    // console.log(result.data.text);
    const dataText = result.data.text

    const regex = /證券 代號 : (\d{4})/;
    const match = dataText.match(regex);

    const stamp = getDateStamp()

    if (match) {
      console.log("找到匹配:", match[1]);
      return `${match[1]}_${stamp}`;
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

