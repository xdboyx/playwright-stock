import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createCanvas, registerFont } from 'canvas';

// 設定圖片大小
const WIDTH = 800;
const HEIGHT = 600;
const FONT_SIZE = 52;
const LINE_HEIGHT = FONT_SIZE * 1.2;

const rootDir = 'C:\\Users\\XD\\Desktop\\股東TEST';

// 資料夾名稱 做成 圖片
test('folder TextToImage', async ({ page }) => {
  generateImages();
  expect(true).toBe(true); // 確保測試通過
});

// 將文字繪製到圖片上
const drawTextOnCanvas = (ctx, textArray) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT); // 填滿背景顏色

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${FONT_SIZE}px`;
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
  fs.readdirSync(rootDir, { withFileTypes: true }).forEach(dirent => {
    if (dirent.isDirectory()) {
      const folderName = dirent.name;
      const folderPath = path.join(rootDir, folderName);

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
