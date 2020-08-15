import { box } from 'blessed';

type Boxes = [number, number]; // rows, columns

/**
 * Brute-force best layout for given number of boxes inside given rectangle
 */
export default (boxes: number, width: number, height: number): Boxes => {
  const best = { ratio: 100, boxes: [1, 1] as Boxes };
  for (let rows = 1; rows <= boxes; rows++) {
    const columns = Math.ceil(boxes / rows);
    const boxWidth = width / columns;
    const boxHeight = height / rows;
    const squareErr = Math.abs(1 - boxWidth / boxHeight);
    if (best.ratio > squareErr) {
      best.ratio = squareErr;
      best.boxes = [rows, columns];
    }
  }

  return best.boxes;
};
