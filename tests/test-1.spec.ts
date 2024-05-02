import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  await page.goto('https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=7463574&Area=search&mdiv=403&oid=1_29&cid=index&kw=%E8%86%A0%E5%9B%8A%20%E5%92%96%E5%95%A1');
  await page.screenshot({ path: 'coffee.png', fullPage: true });
  
});

test('govement', async ({ page }) => {

  await page.goto('https://web.pcc.gov.tw/prkms/tender/common/basic/indexTenderBasic');
  await page.getByTitle('查詢', { exact: true }).click();

  await page.waitForLoadState('load');

  const rows = await page.$$('#tpam > tbody > tr');
  
   for (const row of rows) {
    // 在每个 <tr> 元素中找到所有的 <td> 元素
    const cells = await row.$$('td');

    // 遍历每个 <td> 元素并获取文本内容
    for (const cell of cells) {
      const text = await cell.innerText();
      console.log(text);
    }
    console.log('----------------------------------------------------------------');
  }

  
});