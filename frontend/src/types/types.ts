export interface Item {
  id: number;
  selected: boolean;
  index: number;
}

export interface ReorderUpdate {
  id: number;
  selected: boolean;
  newIndex: number;
}