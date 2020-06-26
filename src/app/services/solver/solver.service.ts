import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {INodeCoalitionSolution} from '../../gte-core/gte/src/Model/Algorithms/BFI/INodeCoalitionSolution';
import {Node} from '../../gte-core/gte/src/Model/Node';

@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private url = `http://test.api.logos.bg/api/solve/`;
  algorithmResult: string;

  constructor(private http: HttpClient) {
  }

  postMatrixAsText(matrix: string) {
    const data = new FormData();
    data.append('game_text', matrix);
    this.http.post(this.url, data).subscribe(
      (result: any) => {
        this.algorithmResult = result.solver_output;
        this.algorithmResult.replace(/(\r\n|\n|\r)/gm, '<br />');
        this.algorithmResult += '<br /><em>D. Avis, G. Rosenberg, R. Savani, and B. von Stengel (2010),</br>' +
          'Enumeration of Nash equilibria for two-player games.</br>' +
          'Economic Theory 42, 9-37</em>';
      },
      (err) => {
        console.log(err);
      }
    );
  }

  convertBFISolution(slnMap: Map<Node, Array<INodeCoalitionSolution>>) {
    let result = '';
    let nodeCounter = 0;
    slnMap.forEach((sln: Array<INodeCoalitionSolution>, n: Node) => {
      result += 'x<sub>' + (nodeCounter + 1) + '</sub><br />';
      nodeCounter++;
      let refCounter = 0;
      sln.forEach((singleSolution: INodeCoalitionSolution) => {
        const line1 = '   ' + (singleSolution.isBest ? '<strong>' : '') + 'r<sub>' + refCounter + '</sub>: ' + '{';
        const line2 = singleSolution.coalition.split(' ').join(',');
        const line3 = '} → ' + singleSolution.strategy;
        const line4 = ' (' + singleSolution.payoffs.toString() + ') ';
        const line5 = singleSolution.isRational ? ' IR' : '';
        result += line1 + line2 + line3 + line4 + line5;

        if (singleSolution.isBest) {
          result += '</strong>';
        }
        result += '<br />';
        refCounter++;
      });
      result += '<br />';
    });
    this.algorithmResult = result;
  }

}
