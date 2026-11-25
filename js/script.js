(() => {
  const BASE_SIZE = 11, MAX_SIZE = 25;
  const $ = (id) => document.getElementById(id);
  const mazeEl = $("maze"), timeEl = $("time"), stepsEl = $("steps"),
    scoreEl = $("score"), messageEl = $("message"), numberEl = $("maze-number"),
    gridSizeEl = $("grid-size"), modal = $("level-modal");

  let size = BASE_SIZE, maze = [], player = { x: 1, y: 1 }, start = { x: 1, y: 1 },
    finish = { x: 1, y: 1 }, steps = 0, minSteps = 0, startedAt = null, timerId = null,
    won = false, lastLevelScore = 0, level = 1, totalScore = 0, visited = new Set(), finalTime = 0;

  const directions = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
  };

  const sizeForLevel = (lv) => Math.min(BASE_SIZE + (lv - 1) * 2, MAX_SIZE);

  function generateMaze() {
    maze = Array.from({ length: size }, () => Array(size).fill(1));
    const stack = [{ x: 1, y: 1 }];
    maze[1][1] = 0;
    while (stack.length) {
      const current = stack[stack.length - 1], options = [];
      for (const d of [{ x: 0, y: -2 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: -2, y: 0 }]) {
        const x = current.x + d.x, y = current.y + d.y;
        if (x > 0 && x < size - 1 && y > 0 && y < size - 1 && maze[y][x] === 1)
          options.push({ x, y, wallX: current.x + d.x / 2, wallY: current.y + d.y / 2 });
      }
      if (!options.length) { stack.pop(); continue; }
      const next = options[Math.floor(Math.random() * options.length)];
      maze[next.y][next.x] = 0;
      maze[next.wallY][next.wallX] = 0;
      stack.push({ x: next.x, y: next.y });
    }
    start = { x: 1, y: 1 };
    finish = { x: size - 2, y: size - 2 };
    maze[start.y][start.x] = 0;
    maze[finish.y][finish.x] = 0;
  }

  function shortestPath() {
    const queue = [{ ...start, distance: 0 }], seen = new Set([`${start.x},${start.y}`]);
    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      if (current.x === finish.x && current.y === finish.y) return current.distance;
      for (const d of Object.values(directions)) {
        const x = current.x + d.x, y = current.y + d.y, key = `${x},${y}`;
        if (x >= 0 && x < size && y >= 0 && y < size && maze[y][x] === 0 && !seen.has(key)) {
          seen.add(key);
          queue.push({ x, y, distance: current.distance + 1 });
        }
      }
    }
    return 0;
  }

  function render() {
    mazeEl.replaceChildren();
    mazeEl.style.setProperty("--n", size);
    mazeEl.setAttribute("aria-label", `Labirin ${size} kali ${size}`);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const cell = document.createElement("div");
        cell.className = "cell" + (maze[y][x] ? " wall" : "");
        cell.setAttribute("role", "gridcell");
        if (visited.has(`${x},${y}`)) cell.classList.add("trail");
        if (x === start.x && y === start.y) { cell.classList.add("start"); cell.setAttribute("aria-label", "Start"); }
        if (x === finish.x && y === finish.y) { cell.classList.add("finish"); cell.setAttribute("aria-label", "Finish"); }
        if (x === player.x && y === player.y) { cell.classList.add("player"); cell.setAttribute("aria-label", "Pemain"); }
        mazeEl.append(cell);
      }
  }

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const elapsed = () => (startedAt === null ? 0 : Math.floor((Date.now() - startedAt) / 1000));

  function updateStats() {
    timeEl.textContent = formatTime(won ? finalTime : elapsed());
    stepsEl.textContent = steps;
  }

  function move(direction) {
    if (won || modal.open) return;
    const d = directions[direction];
    if (!d) return;
    const x = player.x + d.x, y = player.y + d.y;
    if (x < 0 || x >= size || y < 0 || y >= size || maze[y][x] === 1) return;
    if (startedAt === null) {
      startedAt = Date.now();
      timerId = setInterval(updateStats, 250);
    }
    player = { x, y };
    visited.add(`${x},${y}`);
    steps++;
    render();
    updateStats();
    if (x === finish.x && y === finish.y) finishGame();
  }

  function starsFor(ratio) {
    return ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : 1;
  }

  function finishGame() {
    won = true;
    clearInterval(timerId);
    finalTime = elapsed();
    updateStats();
    const efficiency = Math.round(250 * Math.min(1, minSteps / Math.max(steps, minSteps, 1)));
    const timeBonus = Math.round(150 * Math.max(0, 1 - finalTime / 180));
    const difficulty = Math.round(100 * Math.max(0, Math.min(1, (minSteps - 20) / 100)));
    const levelScore = Math.min(1000, 500 + efficiency + timeBonus + difficulty);
    lastLevelScore = levelScore;
    totalScore += levelScore;
    scoreEl.textContent = totalScore.toLocaleString("id-ID");
    messageEl.className = "message win";
    messageEl.textContent = `Level ${level} selesai! +${levelScore} poin.`;
    $("announcement").textContent = `Selamat, level ${level} selesai. Skor level ${levelScore} poin.`;
    showModal(levelScore);
  }

  function showModal(levelScore) {
    const got = starsFor(minSteps / Math.max(steps, minSteps, 1));
    const nextSize = sizeForLevel(level + 1);
    $("modal-title").textContent = `Level ${level} selesai!`;
    $("modal-sub").textContent =
      got === 3 ? "Hampir sempurna, rutemu sangat efisien." :
      got === 2 ? "Bagus, masih ada rute yang lebih singkat." : "Berhasil keluar. Coba cari rute lebih pendek.";
    $("stars").innerHTML = [1, 2, 3].map((i) =>
      `<svg class="star${i <= got ? " on" : ""}" style="--i:${i - 1}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>`
    ).join("");
    $("r-time").textContent = formatTime(finalTime);
    $("r-steps").textContent = steps;
    $("r-min").textContent = minSteps;
    $("r-score").textContent = `+${levelScore.toLocaleString("id-ID")}`;
    $("next-level").textContent = `Lanjut ke level ${level + 1}`;
    $("next-info").textContent = `Level berikutnya: labirin ${nextSize} × ${nextSize}`;
    modal.showModal();
    $("next-level").focus();
  }

  function loadLevel(newMaze) {
    clearInterval(timerId);
    timerId = null; startedAt = null; steps = 0; won = false; finalTime = 0;
    if (newMaze) {
      size = sizeForLevel(level);
      generateMaze();
      minSteps = shortestPath();
    }
    player = { ...start };
    visited = new Set([`${start.x},${start.y}`]);
    numberEl.textContent = level;
    gridSizeEl.textContent = `${size} × ${size} grid`;
    scoreEl.textContent = totalScore.toLocaleString("id-ID");
    messageEl.className = "message";
    messageEl.textContent = "Tekan tombol arah untuk memulai.";
    timeEl.textContent = "00:00";
    stepsEl.textContent = "0";
    render();
  }

  document.addEventListener("keydown", (event) => {
    const map = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
    const dir = map[event.key.toLowerCase()];
    if (dir && !modal.open) { event.preventDefault(); move(dir); }
  });
  document.querySelectorAll("[data-dir]").forEach((b) => b.addEventListener("click", () => move(b.dataset.dir)));

  const undoScore = () => { if (won) { totalScore -= lastLevelScore; lastLevelScore = 0; } };
  $("new-game").addEventListener("click", () => { undoScore(); loadLevel(true); });
  $("restart").addEventListener("click", () => { undoScore(); loadLevel(false); });
  $("next-level").addEventListener("click", () => { modal.close(); level++; loadLevel(true); });
  $("replay-level").addEventListener("click", () => { modal.close(); undoScore(); loadLevel(false); });
  modal.addEventListener("cancel", (e) => e.preventDefault());

  loadLevel(true);
})();
