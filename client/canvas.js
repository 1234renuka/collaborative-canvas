class CanvasController {
    constructor(canvas, socket, roomId) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.socket = socket;
        this.roomId = roomId;

        this.tool = "brush";
        this.color = "#000000";
        this.width = 4;

        this.isDrawing = false;
        this.currentStroke = null;
        this.actions = [];

        this.activeFilter = "everyone"; // everyone | me

        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
        this.attachEvents();
    }

    resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * ratio;
        this.canvas.height = rect.height * ratio;
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.redraw();
    }

    attachEvents() {
        this.canvas.addEventListener("mousedown", e => this.startDraw(e));
        this.canvas.addEventListener("mousemove", e => this.moveDraw(e));
        window.addEventListener("mouseup", () => this.endDraw());

        this.canvas.addEventListener("touchstart", e => this.startDraw(e.touches[0]));
        this.canvas.addEventListener("touchmove", e => this.moveDraw(e.touches[0]));
        window.addEventListener("touchend", () => this.endDraw());
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    startDraw(e) {
        this.isDrawing = true;
        const pos = this.getPos(e);

        this.currentStroke = {
            id: Date.now(),
            userId: this.socket.id,
            tool: this.tool,
            color: this.color,
            width: this.width,
            points: [pos]
        };
    }

    moveDraw(e) {
        if (!this.isDrawing) return;

        const pos = this.getPos(e);
        this.currentStroke.points.push(pos);

        if (this.activeFilter === "everyone" || this.activeFilter === "me") {
            this.drawStroke(this.currentStroke);
        }

        this.socket.emit("clientStrokeProgress", {
            roomId: this.roomId,
            stroke: this.currentStroke
        });
    }

    endDraw() {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        this.actions.push(this.currentStroke);

        this.socket.emit("clientStrokeEnd", {
            roomId: this.roomId,
            stroke: this.currentStroke
        });

        this.currentStroke = null;
    }

    drawStroke(stroke) {
        const ctx = this.ctx;

        if (stroke.tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = "rgba(0,0,0,1)";
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = stroke.color;
        }

        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";

        const pts = stroke.points;
        if (!pts || pts.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
        }

        ctx.stroke();
    }

    drawLiveStroke(stroke) {
        if (this.activeFilter === "me" && stroke.userId !== this.socket.id)
            return;

        this.drawStroke(stroke);
    }

    addRemoteStroke(stroke) {
        this.actions.push(stroke);

        if (this.activeFilter === "everyone") {
            this.drawStroke(stroke);
        } else if (this.activeFilter === "me" && stroke.userId === this.socket.id) {
            this.drawStroke(stroke);
        }
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.actions.forEach(stroke => {
            if (this.activeFilter === "everyone") {
                this.drawStroke(stroke);
            } else if (this.activeFilter === "me" && stroke.userId === this.socket.id) {
                this.drawStroke(stroke);
            }
        });
    }

    undo(actionId) {
        this.actions = this.actions.filter(s => s.id !== actionId);
        this.redraw();
    }
}
