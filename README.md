# Trilium MCP Server

[English](#english) | [繁體中文](#traditional-chinese)

<a name="english"></a>

## English

> [!WARNING]
> **Disclaimer & Backup Warning**
>
> This tool (MCP Server) has permissions to **write, modify** your Trilium notes.
> **Please ensure you backup your Trilium library before performing any operations with this tool.**
>
> The author is not responsible for any data loss, corruption, or unexpected consequences resulting from the use of this tool. Use at your own risk.

This is a Model Context Protocol (MCP) Server designed for [Trilium Notes](https://github.com/zadam/trilium). It allows AI agents (such as Claude Desktop, Gemini CLI, etc.) to interact directly with your Trilium notes library to search, read, write, and organize notes.

### Features

- **Search Notes (`search_notes`)**: Search notes by keywords.
- **Read Note (`read_note`)**: Read note content and metadata.
- **Create Note (`create_note`)**: Create new notes (supports text, code, etc.).
- **Update Note (`update_note`)**: Modify existing note content or attributes.
- **Move Note (`move_note`)**: Move notes to a new parent.
- **Manage Attributes (`manage_attributes`)**: Add, modify, or delete note attributes.

### Installation & Setup

#### 1. Install Dependencies

Ensure you have Node.js installed (v16+ recommended).

```bash
npm install
```

#### 2. Configure Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
TRILIUM_ETAPI_URL=http://localhost:8080/etapi
TRILIUM_ETAPI_TOKEN=your_token_here
```

- `TRILIUM_ETAPI_URL`: Your Trilium ETAPI URL. Usually your Trilium URL appended with `/etapi`.
- `TRILIUM_ETAPI_TOKEN`: The token created in Trilium's `Options` -> `ETAPI`.

#### 3. Build Project

```bash
npm run build
```

### Usage

#### Configuration for MCP Client

For Claude Desktop or Gemini CLI, add the following to your configuration file (e.g., `claude_desktop_config.json` or `settings.json`):

```json
{
  "mcpServers": {
    "trilium": {
      "command": "node",
      "args": ["/path/to/your/Trilium_MCP/dist/index.js"]
    }
  }
}
```

**Note**:
- Replace `/path/to/your/Trilium_MCP/dist/index.js` with the actual absolute path on your machine.
- The program automatically reads the `.env` file from the project directory, so you don't need to repeat environment variables in the config file.

### Development

- **Build**: `npm run build`
- **Test Connection**: `npx ts-node test-trilium.ts` (Requires `.env` setup)

### License

MIT

### About the Author



- Author: HJPLUS.DESIGN HAO.H
- Website: [HJPLUS.DESIGN](https://www.hjplusdesign.com/)
- Facebook Page: [HJPLUS.DESIGN](https://www.facebook.com/HJPLUS.DESIGN/)
- Email: info@hjplusdesign.com

We are external R&D partners for the design, architecture, and manufacturing industries. We specialize in helping companies without internal technical teams to implement digital workflows, tools, and AI, automating your knowledge and operational processes to supplement your team's skill upgrades.
We specialize in solving the following situations:
- Companies with design and manufacturing capabilities but lacking tools and processes for technical integration.
- Teams without technical personnel or teams that need automation or data integration.
- Complex projects with multiple data formats but lacking integration experience.
- Wanting to implement AI or BIM but not knowing where to start.
- Needing project-based digital consulting or tool development support.
- Needing complex geometric analysis modeling or BIM project consulting.
For more digital transformation consulting and service details, please contact us.

---

<a name="traditional-chinese"></a>

## 繁體中文 (Traditional Chinese)

> [!WARNING]
> **免責聲明與備份提醒**
>
> 本工具 (MCP Server) 具有對您的 Trilium 筆記庫進行**寫入、修改**的權限。
> **在使用本工具進行任何操作之前，請務必備份您的 Trilium 筆記庫。**
>
> 作者不對因使用本工具而導致的任何資料遺失、損壞或不可預期的後果負責。使用者需自行承擔使用風險。

這是一個為 [Trilium Notes](https://github.com/zadam/trilium) 設計的 Model Context Protocol (MCP) Server。它允許 AI 代理 (如 Claude Desktop, Gemini CLI 等) 直接與您的 Trilium 筆記庫互動，執行搜尋、讀取、寫入和整理筆記等操作。

### 功能

- **搜尋筆記 (`search_notes`)**: 透過關鍵字搜尋筆記。
- **讀取筆記 (`read_note`)**: 讀取筆記的內容與屬性 (Metadata)。
- **建立筆記 (`create_note`)**: 建立新的筆記 (支援文字、程式碼等各種類型)。
- **更新筆記 (`update_note`)**: 修改現有筆記的內容或屬性。
- **移動筆記 (`move_note`)**: 將筆記移動到新的父節點下。
- **管理屬性 (`manage_attributes`)**: 新增、修改或刪除筆記的屬性 (Attributes)。

### 安裝與設定

#### 1. 安裝依賴

確保您已安裝 Node.js (建議 v16 以上)。

```bash
npm install
```

#### 2. 設定環境變數

在專案根目錄建立 `.env` 檔案 (可參考 `.env.example`)：

```env
TRILIUM_ETAPI_URL=http://localhost:8080/etapi
TRILIUM_ETAPI_TOKEN=your_token_here
```

- `TRILIUM_ETAPI_URL`: 您的 Trilium ETAPI 網址。通常是您的 Trilium 網址加上 `/etapi`。
- `TRILIUM_ETAPI_TOKEN`: 在 Trilium 的 `Options` -> `ETAPI` 中建立的 Token。

#### 3. 編譯專案

```bash
npm run build
```

### 使用方法

#### 在 MCP Client 中設定

以 Claude Desktop 或 Gemini CLI 為例，請在設定檔 (如 `claude_desktop_config.json` 或 `settings.json`) 中加入以下設定：

```json
{
  "mcpServers": {
    "trilium": {
      "command": "node",
      "args": ["/path/to/your/Trilium_MCP/dist/index.js"]
    }
  }
}
```

**注意**：
- 請將 `/path/to/your/Trilium_MCP/dist/index.js` 替換為您實際的檔案路徑。
- 程式會自動讀取專案目錄下的 `.env` 檔案，因此不需要在設定檔中重複填寫環境變數。

### 開發

- **編譯**: `npm run build`
- **測試連線**: `npx ts-node test-trilium.ts` (需先設定好 `.env`)

### 授權

MIT

### 關於作者



- 作者: 加號設計數位工程有限公司 HAO.H
- 網站: [加號設計數位工程有限公司](https://www.hjplusdesign.com/)
- 粉絲專頁: [加號設計數位工程有限公司](https://www.facebook.com/HJPLUS.DESIGN/)
- 電子郵件: info@hjplusdesign.com

我們是設計、建築與製造產業的外部研發夥伴，專門協助缺乏內部技術團隊的公司導入數位工作流程、工具與 AI，自動化你的知識與作業流程，以補足團隊技能升級的能量。
我們專門解決以下情況：
- 公司有設計與製造能量，但缺乏技術整合的工具與流程
- 團隊中沒技術人員或團隊，卻需要自動化或資料串接
- 專案複雜、資料格式多，但缺乏整合經驗
- 想導入 AI 或 BIM，但不知道從哪開始
- 需要專案型的數位顧問或工具開發支援
- 需要處理複雜幾何分析建模或BIM專案顧問
更多數位轉型諮詢與服務內容歡迎與我們聯絡。
