import { test, expect } from '@playwright/test';
const ExcelJS = require('exceljs');

const FILITER_DATE = new Date('2024-01-01');

//抓領股倉的資料 會export 一個 data.xlsx的檔案
test('get stock', async ({ page }) => {
  test.setTimeout(120000)

  await page.goto('https://stockhouse.com.tw/dantime.html');
  // await page.getByTitle('查詢', { exact: true }).click();

  await page.waitForLoadState('load');
  await page.getByLabel('顯示').selectOption('100');

  var getCount = await page.$$('.paginate_button');
  // console.dir(getCount.length)

  var countDom = await page.$$(`#dan-table_paginate > ul > li:nth-child(${getCount.length - 1}) > a`);
  const count = parseInt(await countDom[0]?.innerText()) ?? 1;
  console.dir(count)

  const data: string[][] = [["股號", "股名", "紀念品", "收購價", "委託條件", "截止日"]];

  for (let index = 0; index < count; index++) {
    const rows = await page.$$('tbody > tr');

    for (const row of rows) {
      // 在每个 <tr> 元素中找到所有的 <td> 元素
      const cells = await row.$$('td');
      const rowData: string[] = [];

      // 遍历每个 <td> 元素并获取文本内容
      cells.forEach(async (cell, index) => {
        const text = await cell.innerText();
        console.log(text);
        rowData.push(text);

        //日期比較 超過設定的 FILITER_DATE 才會把資料塞進 excel
        if (cells.length === index + 1) {
          if (new Date(text) >= FILITER_DATE) {
            data.push(rowData);
          }

        }

      })

      // for (const cell of cells) {
      //   const text = await cell.innerText();
      //   console.log(text);
      //   if(text === '')
      //     continue;

      //   rowData.push(text);
      // }
      console.log('----------------------------------------------------------------');
      // data.push(rowData);
    }
    var nextPageBtn = await page.getByRole('link', { name: '下一頁' }).click();

    // await page.getByRole('button').click();
  }



  await exportToExcel(data);

});

async function exportToExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // 将数据写入工作表
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // 将工作簿保存为 Excel 文件
  await workbook.xlsx.writeFile('data.xlsx');
  console.log('Excel 文件已生成');
}