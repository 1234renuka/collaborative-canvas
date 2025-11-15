class DrawingState {
    constructor() {
        this.rooms = new Map();
    }

    _ensure(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                actions: [],   // list of strokes
                undone: []     // undo history stack
            });
        }
        return this.rooms.get(roomId);
    }

    addAction(roomId, action) {
        const room = this._ensure(roomId);

        room.actions.push(action);

        // IMPORTANT: when a new action is added, redo history resets
        room.undone = [];
    }

    undo(roomId) {
        const room = this._ensure(roomId);

        if (room.actions.length === 0) {
            return null;  // nothing to undo
        }

        const undone = room.actions.pop();
        room.undone.push(undone);

        return undone; // return the stroke we removed
    }

    redo(roomId) {
        const room = this._ensure(roomId);

        if (room.undone.length === 0) {
            return null;  // nothing to redo
        }

        const redone = room.undone.pop();
        room.actions.push(redone);

        return redone; // return the stroke we restored
    }

    getFullActions(roomId) {
        return this._ensure(roomId).actions;
    }
}

module.exports = new DrawingState();
