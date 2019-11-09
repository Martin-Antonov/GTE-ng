import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private url = `http://test.api.logos.bg/api/solve/`;
  public matrixResult;

  constructor(private http: HttpClient) {
  }

  postMatrixAsText(matrix: string) {
    const data = new FormData();
    data.append('game_text', matrix);
    this.http.post(this.url, data).subscribe(
      (result: any) => {
        this.matrixResult = result.solver_output;
        this.matrixResult.replace(/(\r\n|\n|\r)/gm, '<br />');
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
