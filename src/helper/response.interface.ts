import { Status } from "./status.enum";

export interface ResponseStructure {
  message: string;
  status: Status;
  data: Object;
}
