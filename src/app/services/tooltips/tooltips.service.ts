import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ITooltips} from './tooltips';

@Injectable({
  providedIn: 'root'
})
export class TooltipsService {
  constructor(private http: HttpClient) {  }

  getTooltips(): Observable<ITooltips> {
    return this.http.get<ITooltips>('./assets/tooltips.json');
  }
}
