# 🎨 Real-Time Collaborative Drawing Canvas

A multi-user real-time drawing canvas built with **Vanilla JavaScript**, **HTML5 Canvas**, **Node.js**, and **WebSockets**.  
Multiple users can draw together, see each other's strokes live, and use global undo/redo across shared rooms.

---

## 🚀 Features

### ✏️ Drawing Tools  
- Brush  
- Eraser  
- Color picker  
- Stroke width control  

### 👥 Real-Time Multi-User Sync  
- Every stroke is sent in real-time via Socket.io  
- Smooth drawing sync  
- Remote stroke progress  
- Live updating “Users Online” list  

### ↩️ Global Undo / Redo  
- Fully synced across all connected clients  
- Undo removes last global action  
- Redo restores the removed action  

### 🎭 User Filter (Optional)  
- **Everyone** → show all user drawings  
- **Me Only** → show only your strokes (local filter)

### 🏠 Rooms  
- Join any room (e.g., `lobby`, `office`, `team123`)  
- Each room has its own canvas state  

### 📱 Touch Support  
- Works on mobile for drawing  

---

## 📁 Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html
│   ├── style.css
│   ├── main.js
│   ├── canvas.js
│   └── websocket.js
├── server/
│   ├── server.js
│   ├── rooms.js
│   └── drawing-state.js
├── package.json
├── README.md
└── ARCHITECTURE.md
```

---

## 🛠️ Installation & Setup

### 1️⃣ Install dependencies
```
npm install
```

### 2️⃣ Start the server
```
npm start
```

The app will automatically open:
```
http://localhost:3000
```

---

## 🧪 Testing With Multiple Users

Open multiple tabs:

- Tab 1: http://localhost:3000  
- Tab 2: http://localhost:3000  
- Tab 3: http://localhost:3000  

Each tab appears as a separate user.

Try drawing on one tab → others update instantly.

---

## ⚙️ Known Limitations

- Refreshing a tab resets user identity (new socket ID)  
- "Me Only" filter hides strokes locally only  
- No authentication system  
- Undo/redo works globally, not per-user  

---

## ⏱️ Time Spent

- **Frontend:** ~6 hours  
- **Backend:** ~5 hours  
- **WebSockets & Sync:** ~4 hours  
- **UI/Styling:** ~2 hours  
- **Docs & Setup:** ~2 hours  

**Total: ~19 hours**

---

## 📜 License
MIT License
