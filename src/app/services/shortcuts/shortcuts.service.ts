import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ShortcutsService {

  constructor(private http: HttpClient) {
  }

  getShortcuts(): Observable<Array<{ command: string, explanation: string, videoURL: string }>> {
    return this.http.get<Array<{ command: string, explanation: string, videoURL }>>('./assets/shortcuts.json');
  }
}
