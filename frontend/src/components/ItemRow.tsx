import { FC } from 'react';
import { Props } from '../types/types';
import './ItemRow.css'

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
