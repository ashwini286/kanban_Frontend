# Cibanna Kanban Board - Rebuilt from Scratch Summary

This document provides a comprehensive technical overview of the premium Kanban Board system rebuilt entirely from scratch (Frontend and Backend). All messy, unused legacy files have been cleared, leaving a clean, highly structured glassmorphism workspace.

---

## 1. Core Visual Architecture (Design & Theme)
*   **Google Fonts Integration:** Switched typography to **Inter** (`font-family: 'Inter', sans-serif`), which is served dynamically.
*   **Modern Theme Tokens:** Set dynamic HSL custom properties inside `index.css` supporting frosted backdrop blurs, customizable border highlights, and glowing badges.
*   **Dynamic Visual Elements:** Styled scrollbars and glowing keyframe animations (`fadeIn` and `pulseGlow` for Critical priority cards).

---

## 2. Frontend Layout & Components (`D:\kanban_Frontend`)

### A. collapsible Workspace Sidebar (`Components/Sidebar`)
*   Collapses to `72px` (desktop) and hides completely to `0px` (mobile viewport) to maximize board canvas.
*   Displays workspace avatar, board selector, quick logout, and inline creation box for new boards.
*   Includes a backdrop overlay on mobile to slide-out sidebar when clicking outside the panel.

### B. Workspace Navbar (`Components/Navbar`)
*   Includes hamburger toggle button on mobile to slide-in/expand workspace options.
*   Displays active board title, dynamic client task search filter, active presence collaborator avatars, and share triggers.

### C. Board canvas (`Components/Board/BoardArea`)
*   Main workspace mapping columns horizontally with custom swipe scrolls.
*   Includes a glassmorphic `+ Add Column` trigger allowing horizontal workflow extensions.

### D. Status Columns (`Components/Board/Column`)
*   Supports inline header title renaming, deletion prompts, and card listings.
*   **WIP Limit alerts:** Users click the card counter to define limits. If columns exceed limits, the header borders outline in glowing amber/red.

### E. Task Cards (`Components/Board/TaskCard`)
*   Equipped with HTML5 drag start/enter events mapping positions.
*   Features color-coded priority alerts, due dates, description highlights, and subtask progress trackers.

### F. Task Details Panel (`Components/Board/TaskModal`)
*   A premium backdrop blur overlay panel grouping task specifications:
    *   **Description Area:** Markdown text fields.
    *   **Checklist Steps:** Dynamic subtasks checklists allowing check/uncheck status updates, creations, and removals.
    *   **Drag-and-Drop Dropzone:** File attachments uploader. Serves static file thumbnails for images (`image/*`) and icons for documents.
    *   **Chronological Activity Audit Trail:** Timelines showing actions (card creations, title edits, priority changes, due dates modifications, column movements).
    *   **Comments Feed:** Collaborative comments history listing authors and timestamps.

---

## 3. Backend Framework & Services (`D:\kanbanProject_Backend`)

### A. Database Schemas (`models/`)
*   **`Board.js`:** Board title, owner, members access list, and background tokens.
*   **`Column.js`:** References parent board, vertical reorder index position, and WIP limits.
*   **`Task.js`:** References column and board, holds Markdown, priority enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), due dates, assignees, checklists array, embedded comments list, uploaded attachments, and activity history.

### B. Business Logic & Controllers (`services/` & `controllers/`)
*   **Auto Columns Seeding (`boardService.js`):** Creating any board automatically seeds default columns (*To Do*, *In Progress*, *Done*).
*   **Multer File Upload Middleware (`uploadMiddleware.js`):** Intercepts file forms, renames files safely, stores files locally in `/uploads`, and static serves them. Deletions trigger physical file cleanup (`fs.unlinkSync`).
*   **Change-Logger Hook (`taskService.js`):** compares task update payloads with current DB state, generating activity entries.
*   **Drag-and-Drop Columns Movement Tracker:** Iterates reorder parameters. If column ids change, it fetches name tags and saves `"MOVE"` activities.

### C. WebSockets & Collaboration (`server.js`)
*   Enforces board room joins. Broad-scale socket changes trigger active board refreshes (`board-changed`) only to users sharing that workspace.

---

## 4. Verification Details
*   **Backend Server:** Connected to Atlas Cluster, running on `http://localhost:8000`.
*   **Frontend Server:** Deployed on `http://localhost:3001` and compiled successfully.
*   **Responsive Viewports:** Fully responsive for mobile browsers and tablets with blur backdrops and toggle menu bars.
