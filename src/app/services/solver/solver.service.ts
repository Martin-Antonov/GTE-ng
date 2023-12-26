import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {INodeCoalitionSolution} from '../../gte-core/gte/src/Model/Algorithms/BFI/INodeCoalitionSolution';
import {Node} from '../../gte-core/gte/src/Model/Node';

@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private url = `http://localhost:8000/api/solve/`;
  private se_url = `http://localhost:8000/api/seqsolve/solve`;
  private se_url_read = `http://localhost:8000/api/seqsolve/read`;
  private se_url_status = `http://localhost:8000/api/seqsolve/status`;
  algorithmResult: string;
  variableNames: string;
  seqSolverId: string;
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
          'Economic Theory 42, 9-37 </em>';
      },
      (err) => {
        console.log(err);
      }
    );
  }

  postGameToRead(efFile:string) {
    const data = new FormData();
    data.append('game_text', efFile);
    this.http.post(this.se_url_read, data).subscribe(
      (result: any) => {
        this.variableNames = result.variable_names;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  postGameTree(efFile: string, variable_overwrites : string, config : string) {
    const data = new FormData();
    data.append('game_text', efFile);
    data.append('variable_overwrites', variable_overwrites)
    data.append('config', config)
    this.http.post(this.se_url, data).subscribe(
      (result: any) => {
        this.seqSolverId = result.id
        this.postStatusRequest()
      },
      (err) => {
        console.log(err);
      }
    );
  }

  postStatusRequest() {
    const data = new FormData();
    data.append('id', this.seqSolverId);
    this.http.post(this.se_url_status, data).subscribe(
      (result: any) => {
        this.algorithmResult = result.solver_output;
        this.algorithmResult.replace(/(\r\n|\n|\r)/gm, '<br />');
        if(result.solver_status == "Completed") {
          this.algorithmResult += '<br /><em>M. Graf, T. Engesser, and B.Nebel,</br>' +
            'Symbolic Computation of Sequential Equilibria.</br>' +
            'Proceedings of AAMAS 2024.</br></em>';
        }
        if(result.solver_active && this.seqSolverId == result.expected_id)
          this.postStatusRequest();
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
    result += '<br /><br /><em>Ismail, Mehmet <br/>The Story of Conflict and Cooperation (May 28, 2020).' +
     ' <br/>Available at SSRN: https://ssrn.com/abstract=3234963</em>';
    this.algorithmResult = result;
  }

}
