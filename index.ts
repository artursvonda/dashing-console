#!/usr/bin/env node

import calculateRowsCols from './utils/calculate-partitions';
import blessed from 'post-blessed';

export default (commands: readonly string[]) => {
  const cwd = process.cwd();

  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
    ignoreDockContrast: true,
    width: '100%',
    height: '100%',
  });

  const offset = 3;
  const width = screen.width as number;
  const height = (screen.height as number) - offset;

  blessed
    .text({
      parent: screen,
      label: 'Help',
      height: 3,
      top: 0,
      left: 0,
      width: '100%',
      border: 'line',
      style: {
        fg: 'default',
        bg: 'default',
        focus: {
          border: {
            fg: 'green',
          },
        },
      },
    })
    .setContent(`CTRL+q to quit. Cmds: ${commands.join(', ')}`);

  const [rows, cols] = calculateRowsCols(commands.length, 1024, 640);
  const lastRowCols = commands.length - cols * (rows - 1);

  const terminals = commands.map((command, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    const isLastRow = row === rows - 1;
    const isLastCol = col === cols - 1;

    const boxWidth = Math.floor(width / (isLastRow ? lastRowCols : cols));
    const boxHeight = Math.floor(height / rows);

    const missingWidth = width - cols * boxWidth;

    const left = boxWidth * col;
    const top = boxHeight * row + offset;

    const terminal = blessed.terminal({
      parent: screen,
      cursor: 'line',
      cursorBlink: true,
      screenKeys: false,
      label: command,
      left: left,
      top: top,
      width: boxWidth + (isLastCol ? missingWidth : 0),
      height: boxHeight,
      border: 'line',
      style: {
        fg: 'default',
        bg: 'default',
        focus: {
          border: {
            fg: 'green',
          },
        },
      },
    });

    terminal.pty.write(`cd ${cwd}\n`);
    terminal.pty.write(`printf '\\33c\\e[3J'\n`);
    terminal.pty.write(`${command}\n`);

    return terminal;
  });

  terminals[0].focus();

  screen.key('C-q', () => {
    terminals.forEach((terminal) => {
      (terminal as any).kill();
    });

    return screen.destroy();
  });

  screen.program.key('S-tab', () => {
    screen.focusNext();
    screen.render();
  });

  screen.render();
};
