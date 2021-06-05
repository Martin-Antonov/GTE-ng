import {Injectable} from '@angular/core';
import {IDraggableWindowCoords} from './IDraggableWindowCoords';

@Injectable({
  providedIn: 'root'
})
export class DraggableWindowService {
  private coords: Map<string, IDraggableWindowCoords>;

  constructor() {
    this.coords = new Map();
  }

  setCoords(title: string, width: string, height: string, top: string, right: string) {
    this.coords.set(title, {width, height, top, right});
  }

  getCoords(title: string) {
    return this.coords.get(title);
  }
}
