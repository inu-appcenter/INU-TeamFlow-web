export interface Department {
  value: string;
  name: string;
  note?: string;
}

export interface College {
  name: string;
  id: string;
  departments: Department[];
}
