/**The class Player that stores the id, label and colour of the player */
export class Player {
  id: number;
  label: string;
  color: number;

  constructor(id?: number, label?: string, color?: number) {
    this.id = id || 0;
    this.label = label || '';
    this.color = color || 0x000000;
  }

  destroy() {
    this.label = null;
    this.id = null;
  }
}

