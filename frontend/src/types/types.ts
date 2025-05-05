import { DraggableProvided } from '@hello-pangea/dnd';

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

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface Props {
  item: Item;
  index: number;
  provided: DraggableProvided;
  onSelect: (id: number, selected: boolean) => void;
}