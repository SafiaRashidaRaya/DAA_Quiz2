(() => {
  const SIZE = 15,
    mazeEl = document.getElementById("maze"),
    timeEl = document.getElementById("time"),
    stepsEl = document.getElementById("steps"),
    scoreEl = document.getElementById("score"),
    messageEl = document.getElementById("message"),
    numberEl = document.getElementById("maze-number");
  let maze = [],
    player = { x: 1, y: 1 },
    start = { x: 1, y: 1 },
    finish = { x: SIZE - 2, y: SIZE - 2 },
    steps = 0,
    minSteps = 0,
    startedAt = null,
    timerId = null,
    won = false,
    gameNumber = 0;
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  function generateMaze() {
    maze = Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
    // DFS backtracking membuka sel ganjil, sehingga setiap maze terhubung dan selalu memiliki solusi.
    const stack = [{ x: 1, y: 1 }];
    maze[1][1] = 0;
    while (stack.length) {
      const current = stack[stack.length - 1],
        options = [];
      for (const d of [
        { x: 0, y: -2 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: -2, y: 0 },
      ]) {
        const x = current.x + d.x,
          y = current.y + d.y;
        if (
          x > 0 &&
          x < SIZE - 1 &&
          y > 0 &&
          y < SIZE - 1 &&
          maze[y][x] === 1
        )
          options.push({
            x,
            y,
            wallX: current.x + d.x / 2,
            wallY: current.y + d.y / 2,
          });
      }
      if (!options.length) {
        stack.pop();
        continue;
      }
      const next = options[Math.floor(Math.random() * options.length)];
      maze[next.y][next.x] = 0;
      maze[next.wallY][next.wallX] = 0;
      stack.push({ x: next.x, y: next.y });
    }
    start = { x: 1, y: 1 };
    finish = { x: SIZE - 2, y: SIZE - 2 };
    maze[start.y][start.x] = 0;
    maze[finish.y][finish.x] = 0;
  }
  function shortestPath() {
    // BFS mengunjungi tiap sel terbuka per lapisan untuk mendapatkan jumlah langkah minimum.
    const queue = [{ ...start, distance: 0 }],
      seen = new Set([`${start.x},${start.y}`]);
    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      if (current.x === finish.x && current.y === finish.y)
        return current.distance;
      for (const d of Object.values(directions)) {
        const x = current.x + d.x,
          y = current.y + d.y,
          key = `${x},${y}`;
        if (
          x >= 0 &&
          x < SIZE &&
          y >= 0 &&
          y < SIZE &&
          maze[y][x] === 0 &&
          !seen.has(key)
        ) {
          seen.add(key);
          queue.push({ x, y, distance: current.distance + 1 });
        }
      }
    }
    return 0;
  }
  function render() {
    mazeEl.replaceChildren();
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        const cell = document.createElement("div");
        cell.className = "cell" + (maze[y][x] ? " wall" : "");
        cell.setAttribute("role", "gridcell");
        if (x === start.x && y === start.y) {
          cell.classList.add("start");
          cell.setAttribute("aria-label", "Start");
        }
        if (x === finish.x && y === finish.y) {
          cell.classList.add("finish");
          cell.setAttribute("aria-label", "Finish");
        }
        if (x === player.x && y === player.y) {
          cell.classList.add("player");
          cell.setAttribute("aria-label", "Pemain");
        }
        mazeEl.append(cell);
      }
  }
  function formatTime(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }
  function elapsed() {
    return startedAt === null
      ? 0
      : Math.floor((Date.now() - startedAt) / 1000);
  }
  function updateStats() {
    timeEl.textContent = formatTime(elapsed());
    stepsEl.textContent = steps;
  }
  function move(direction) {
    if (won) return;
    const d = directions[direction];
    if (!d) return;
    const x = player.x + d.x,
      y = player.y + d.y;
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE || maze[y][x] === 1)
      return;
    if (startedAt === null) {
      startedAt = Date.now();
      timerId = setInterval(updateStats, 250);
    }
    player = { x, y };
    steps++;
    render();
    updateStats();
    if (x === finish.x && y === finish.y) finishGame();
  }
  function finishGame() {
    won = true;
    clearInterval(timerId);
    updateStats();
    const efficiency = Math.round(
      250 * Math.min(1, minSteps / Math.max(steps, minSteps, 1)),
    );
    const timeBonus = Math.round(150 * Math.max(0, 1 - elapsed() / 180));
    const difficulty = Math.round(
      100 * Math.min(1, (minSteps - 20) / 100),
    );
    const total = Math.min(
      1000,
      500 + efficiency + timeBonus + difficulty,
    );
    scoreEl.textContent = total.toLocaleString("id-ID");
    messageEl.className = "message win";
    messageEl.textContent = `Labirin selesai! Skor akhir: ${total} poin.`;
    document.getElementById("announcement").textContent =
      `Selamat, labirin selesai. Skor akhir ${total} poin.`;
  }
  function reset(newMaze) {
    clearInterval(timerId);
    timerId = null;
    startedAt = null;
    steps = 0;
    won = false;
    player = { ...start };
    scoreEl.textContent = "—";
    messageEl.className = "message";
    messageEl.textContent = "Tekan tombol arah untuk memulai.";
    if (newMaze) {
      gameNumber++;
      generateMaze();
      minSteps = shortestPath();
      numberEl.textContent = `#${gameNumber}`;
    }
    timeEl.textContent = "00:00";
    stepsEl.textContent = "0";
    render();
  }
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase(),
      map = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };
    if (map[key]) {
      event.preventDefault();
      move(map[key]);
    }
  });
  document
    .querySelectorAll("[data-dir]")
    .forEach((button) =>
      button.addEventListener("click", () => move(button.dataset.dir)),
    );
  document
    .getElementById("new-game")
    .addEventListener("click", () => reset(true));
  document
    .getElementById("restart")
    .addEventListener("click", () => reset(false));
  reset(true);
})();
