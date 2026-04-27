# Pixel Quiz Game

這是一個基於 React + Vite 打造的 2000s 復古街機風格測驗遊戲。後端與資料庫完全依賴 Google Apps Script (GAS) 與 Google Sheets。

## 🚀 快速開始

### 1. 安裝與執行
```bash
# 安裝相依套件 (請務必加上 --legacy-peer-deps 避免版本衝突)
npm install --legacy-peer-deps

# 啟動開發伺服器
npm run dev
```

### 2. 環境變數設定
請複製 `.env.example` 並重新命名為 `.env`，然後填入你的設定：
```env
# Google Apps Script 部署後的網址
VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# 每次遊戲的題目數量
VITE_QUESTION_COUNT=5

# 通關門檻 (答對幾題算過關)
VITE_PASS_THRESHOLD=3
```

---

## 📊 Google Sheets 資料庫配置

請建立一份新的 Google Sheets，並在下方建立兩個工作表 (Sheet)：

### 第一個工作表命名為：「題目」
請在第一列 (Row 1) 依序填入以下標題：
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| 題號 | 題目 | A | B | C | D | 解答 |

*(解答欄位請填入對應的選項文字，例如：Option A)*

### 第二個工作表命名為：「回答」
請在第一列 (Row 1) 依序填入以下標題：
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | 闖關次數 | 總分 | 最高分 | 第一次通關分數 | 花了幾次通關 | 最近遊玩時間 |

---

## 🛠️ Google Apps Script (GAS) 部署教學

1. 在你的 Google Sheets 畫面上方選單，點擊 **擴充功能 > Apps Script**。
2. 將以下程式碼完整複製並貼上到 `程式碼.gs` 中 (覆蓋原本的內容)。
3. 點擊上方的 **「部署」 > 「新增部署作業」**。
4. 類型選擇 **「網頁應用程式」**。
5. **執行身分** 選擇 **「我」**，**誰可以存取** 選擇 **「所有人」**。
6. 點擊「部署」，授權完成後，複製 **「網頁應用程式網址」** 並貼到你的 `.env` 檔案中的 `VITE_GOOGLE_APP_SCRIPT_URL`。

### GAS 程式碼 (`程式碼.gs`)
```javascript
const SHEET_QUESTIONS = "題目";
const SHEET_ANSWERS = "回答";

function doGet(e) {
  try {
    const count = parseInt(e.parameter.count) || 5;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_QUESTIONS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // 隨機打亂題目
    const shuffled = rows.sort(() => 0.5 - Math.random());
    const selectedRows = shuffled.slice(0, count);
    
    const questions = selectedRows.map(row => ({
      id: row[0],
      question: row[1],
      options: [row[2], row[3], row[4], row[5]]
      // 注意：回傳給前端時不包含「解答」欄位，以防作弊
    }));
    
    return ContentService.createTextOutput(JSON.stringify(questions))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === 'submitAnswers') {
      const { userId, answers, passThreshold } = payload;
      
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const qSheet = ss.getSheetByName(SHEET_QUESTIONS);
      const qData = qSheet.getDataRange().getValues();
      
      // 建立解答對照表 (題號 -> 解答)
      const answerMap = {};
      for (let i = 1; i < qData.length; i++) {
        answerMap[qData[i][0]] = qData[i][6]; // G欄是解答
      }
      
      // 批改成績
      let score = 0;
      answers.forEach(ans => {
        if (answerMap[ans.id] === ans.selected) {
          score += 1;
        }
      });
      
      const passed = score >= passThreshold;
      const timestamp = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
      
      const aSheet = ss.getSheetByName(SHEET_ANSWERS);
      const aData = aSheet.getDataRange().getValues();
      
      let userRowIdx = -1;
      for (let i = 1; i < aData.length; i++) {
        if (aData[i][0] == userId) {
          userRowIdx = i + 1; // Apps Script 的列數從 1 開始
          break;
        }
      }
      
      if (userRowIdx !== -1) {
        // 更新現有玩家資料
        const row = aData[userRowIdx - 1];
        let attempts = (parseInt(row[1]) || 0) + 1;
        let totalScore = (parseInt(row[2]) || 0) + score;
        let highestScore = Math.max((parseInt(row[3]) || 0), score);
        
        let firstPassScore = row[4];
        let passedAttempts = row[5];
        
        // 如果是第一次通關
        if (passed && !firstPassScore) {
          firstPassScore = score;
          passedAttempts = attempts;
        }
        
        aSheet.getRange(userRowIdx, 2, 1, 6).setValues([[
          attempts, totalScore, highestScore, firstPassScore || "", passedAttempts || "", timestamp
        ]]);
        
      } else {
        // 新玩家
        aSheet.appendRow([
          userId, 
          1, // 闖關次數
          score, // 總分
          score, // 最高分
          passed ? score : "", // 第一次通關分數
          passed ? 1 : "", // 花了幾次通關
          timestamp
        ]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        score: score,
        passed: passed
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 處理 CORS Preflight 請求
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}
```
