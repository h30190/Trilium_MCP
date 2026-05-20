# Trilium MCP Server - Changelog

## [1.1.0] - 2026-05-20
### New Tools
- **List Children (`list_children`)**: List all direct child notes of a parent note.
- **Delete Note (`delete_note`)**: Delete a note and all its children (irreversible).

### Error Handling Improvements
- **Categorized error messages**: Errors are now distinguished into three types:
  - **ETAPI Error** (4xx/5xx): Includes HTTP status code and server response details.
  - **Validation Error**: Shows exactly which parameter failed and why (Zod).
  - **Connection Error**: Indicates network issues (server unreachable, token problems, etc.).

## [1.0.1] - 2026-01-21
### 筆記讀取性能優化 (Note Reading Performance Optimization)
- **筆記讀取工具重構 (Note Reading Tool Refactoring)**：將 `read_note` 拆分為簡易內容讀取與完整元數據查詢，大幅減少 Token 消耗並優化 Context 空間。
- **新增元數據查詢工具 (Added Get Note Metadata Tool)**：提供獨立的 `get_note_metadata` 工具，用於獲取筆記的屬性、標籤與父子關係等詳細資訊。

## [1.0.0] - 2025-11-24
### 初始版本發布 (Initial Release)
- **筆記搜尋 (Note Search)**：支援在 Trilium 中搜尋筆記。
- **筆記讀取與更新 (Read & Update Notes)**：基本的筆記內容讀取與更新功能。
- **階層管理 (Hierarchy Management)**：支援筆記的建立、移動與基本屬性管理。
