import { FC } from 'react';
import { DraggableProvided } from '@hello-pangea/dnd';
import { Item } from '../types/types';
import './ItemRow.css'

interface Props {
  item: Item;
  index: number;
  provided: DraggableProvided;
  onSelect: (id: number, selected: boolean) => void;
}

export const ItemRow: FC<Props> = ({ item, provided, onSelect }) => (
  <div
    className="box"
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
  >
    <span>#{item.id}</span>
    <input
      type="checkbox"
      checked={item.selected}
      onChange={(e) => onSelect(item.id, e.target.checked)}
    />
  </div>
);
