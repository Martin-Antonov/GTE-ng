export interface ISolveRequest {
  id: string;
}

export interface IReadResponse {
  variable_names: string;
}

export interface IStatusResponse {
  expected_id: string;
  solver_active: boolean;
  solver_output: string;
  solver_status: string;
}
