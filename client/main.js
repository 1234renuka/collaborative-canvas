window.addEventListener("DOMContentLoaded", () => {

    const joinBtn = document.getElementById("joinBtn");
    const roomInput = document.getElementById("roomId");
    const usernameInput = document.getElementById("username");

    const toolSelect = document.getElementById("toolSelect");
    const colorPicker = document.getElementById("colorPicker");
    const widthRange = document.getElementById("widthRange");

    const filterSelect = document.getElementById("filterSelect");
    const canvas = document.getElementById("drawCanvas");

    let socket = null;
    let controller = null;
    let roomId = null;

    joinBtn.addEventListener("click", async () => {

        roomId = (roomInput.value || "lobby").trim().toLowerCase();
        const username = (usernameInput.value || "Guest").trim() || "Guest";

        const resp = await WS.connect({ roomId, username });

        socket = resp.socket;
        controller = new CanvasController(canvas, socket, roomId);

        resp.meta.fullActions.forEach(a => controller.addRemoteStroke(a.payload));

        socket.on("action", (msg) => {
            if (msg.payload.type === "stroke") {
                controller.addRemoteStroke(msg.payload.payload);
            }
        });

        socket.on("actionUndo", ({ actionId }) => {
            controller.undo(actionId);
        });

        socket.on("strokeProgress", ({ userId, stroke }) => {
            if (controller && userId !== socket.id) {
                controller.drawLiveStroke(stroke);
            }
        });

        socket.on("users", (list) => {
            const ul = document.getElementById("userList");
            ul.innerHTML = "";

            list.forEach(u => {
                const li = document.createElement("li");
                li.textContent = u.username;
                ul.appendChild(li);
            });
        });

        // Simple filter: Everyone OR Me Only
        filterSelect.addEventListener("change", () => {
            if (controller) {
                controller.activeFilter = filterSelect.value;
                controller.redraw();
            }
        });

        document.querySelector(".join-panel").style.display = "none";
    });

    toolSelect.addEventListener("change", () => controller && (controller.tool = toolSelect.value));
    colorPicker.addEventListener("input", () => controller && (controller.color = colorPicker.value));
    widthRange.addEventListener("input", () => controller && (controller.width = parseInt(widthRange.value, 10)));

    document.getElementById("undoBtn").addEventListener("click", () => socket && socket.emit("undo", { roomId }));
    document.getElementById("redoBtn").addEventListener("click", () => socket && socket.emit("redo", { roomId }));
});
