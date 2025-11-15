# 🏗️ Architecture Overview

This document explains the real-time architecture, data flow, WebSocket protocol, undo/redo system, and performance decisions.

---

# 📌 1. System Diagram

```
Client (Canvas)
     ↓ draw events
WebSocket (Socket.io)
     ↓ broadcast
Server (Node.js)
     ↓ actions saved per room
Other Clients (update in real-time)
```

---

# 📌 2. Data Flow

### 🎨 Drawing Flow
1. User moves mouse  
2. `mousemove` builds stroke → sent to server  
3. Server broadcasts stroke to all clients  
4. Clients render stroke immediately  

### 📤 On Stroke End
Client → server:
```json
{
  "type": "stroke-end",
  "roomId": "lobby",
  "stroke": {
    "id": 16999999,
    "userId": "socket123",
    "color": "#000",
    "width": 4,
    "points": [...]
  }
}
```

Server → all clients:
```json
{
  "type": "stroke",
  "payload": {...}
}
```

---

# 📌 3. WebSocket Protocol

### Events Sent by Client:
| Event | Description |
|------|-------------|
| `join` | Join a drawing room |
| `clientStrokeProgress` | Live stroke updates |
| `clientStrokeEnd` | Stroke finished |
| `cursor` | Show remote cursor |
| `undo` | Global undo |
| `redo` | Global redo |

### Events Sent by Server:
| Event | Description |
|------|-------------|
| `users` | Update online users list |
| `action` | A stroke added globally |
| `actionUndo` | Undo event propagated |
| `strokeProgress` | Live remote stroke |

---

# 📌 4. Global Undo / Redo Logic

### State per room:
```json
{
  "actions": [],   // list of strokes
  "undone": []     // stack of undone strokes
}
```

### Undo
1. Remove last action from `actions[]`  
2. Move it to `undone[]`  
3. Notify all clients to remove that stroke  

### Redo
1. Pop from `undone[]`  
2. Add back to `actions[]`  
3. Broadcast stroke back to clients  

Undo/Redo affects **everyone**, as required.

---

# 📌 5. Performance Decisions

### ✔ Canvas redraw strategy
- Entire canvas is re-rendered only when needed (undo/redo/resize)
- Strokes buffer in memory
- Smooth line drawing using point-to-point interpolation

### ✔ WebSocket Optimization
- Live strokes use batching (frequent small updates)
- Final strokes use structured action messages
- Only stroke deltas are transmitted

---

# 📌 6. Conflict Resolution

When multiple users draw at the same time:
- Each stroke is tracked independently using `stroke.id`
- No locking required
- Canvas simply overlays strokes in order received
- Undo removes the last action globally regardless of user

---

# 📌 7. Room Logic

Each room keeps:
- Users
- Actions (strokes)
- Undo/redo stacks

Switching rooms = loads its canvas state.

---

# 📌 8. Future Improvements
- Per-user private drawing mode  
- Persistent canvas saving  
- User authentication  
- WebRTC for low latency  
- Stroke smoothing (Bezier curve engine)  

