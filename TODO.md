# MarkSix App - 待辦事項

## 等待中

- [ ] **Google Play 身分驗證**完成（Google 會發 email 通知）
- [ ] **AdMob 帳號審核**通過（AdMob 後台狀態變為正常）
- [ ] **Apple Developer 帳號**確認可以用（已付 $99）

---

## iOS Build（現在可以做）

- [ ] 在終端機執行 iOS production build：
  ```bash
  eas build --platform ios --profile production
  ```
  （EAS 會引導你登入 Apple 帳號，自動管理憑證）
- [ ] 用 TestFlight 測試 iOS 版本
- [ ] 確認 iOS 廣告顯示正常

---

## AdMob 批准後

- [ ] 把 `src/utils/adConfig.ts` 的 `FORCE_TEST_ADS` 改為 `false`
- [ ] 填寫 AdMob **付款資料**（銀行帳號）
- [ ] 重新做 Android production build：
  ```bash
  eas build --platform android --profile production
  ```
- [ ] 重新做 iOS production build：
  ```bash
  eas build --platform ios --profile production
  ```

---

## Google Play 驗證後（Android 上架）

- [ ] 去 Google Play Console → **建立應用程式**
- [ ] 填寫 Store listing：
  - App 名稱、簡短描述、完整描述
  - 截圖（至少 2 張，建議 4-5 張）
  - Feature graphic（1024x500）
- [ ] 上傳 `.aab` 檔案（production build 產出的）
- [ ] 填寫**內容分級**問卷
- [ ] 填入隱私政策網址：`https://ahohty41.github.io/mark6-phone-app/privacy-policy.html`
- [ ] 選擇發布國家（建議先選香港）
- [ ] 提交審核

---

## App Store 上架（iOS）

- [ ] 去 App Store Connect 建立 app
- [ ] 填寫 Store listing（名稱、描述、截圖）
- [ ] 上傳 iOS build
- [ ] 填入隱私政策網址
- [ ] 提交審核

---

## 上架後

- [ ] 在 AdMob 把 Android app 連結到 Google Play Store
- [ ] 在 AdMob 把 iOS app 連結到 App Store
- [ ] 確認 Android/iOS 真實廣告正常顯示
- [ ] 設定 `app-ads.txt`（AdMob 要求，防止廣告欺詐）

---

## 功能開發（未完成）

- [ ] 其他想加的 features
