# DAA_Quiz2 - Maze Solver

A small maze game we built for our Design and Analysis of Algorithms quiz. You move a ball from the start tile to the finish tile in a random 15x15 maze, and you get a score based on how well you did.

## How it works

The maze is generated with DFS (recursive backtracker). It starts at the top-left cell, jumps two cells at a time to a random unvisited neighbor, and knocks down the wall in between. When it gets stuck it backs up and tries somewhere else. Since every cell gets connected, there is always a way out.

To score the player, BFS runs from start to finish to find the shortest possible path. That number is compared with how many steps the player actually took.

Both algorithms run in O(V + E) time and O(V) space, where V is the number of cells.

## Scoring

Max score is 1000:

- 500 for finishing
- up to 250 for efficiency (fewer wasted steps = more points)
- up to 150 time bonus, which drops to zero after 3 minutes
- up to 100 for how long the shortest path is, so harder mazes are worth more

## Running it

No install needed. Clone the repo and open `index.html` in a browser.

```
git clone https://github.com/SafiaRashidaRaya/DAA_Quiz2.git
```

## Controls

Arrow keys or WASD. On a phone there are on-screen arrow buttons. "New maze" generates a fresh one, "Restart" resets the current one.

## Files

```
index.html
css/style.css
js/script.js
```

Plain HTML, CSS and JavaScript, no libraries.

## Team

- Rokhmatul Ilma Khanifa (5053251001)
- Aurelia Nurdiansyah Putri (5053251006)
- Safia Rashida Raya (5053251026)