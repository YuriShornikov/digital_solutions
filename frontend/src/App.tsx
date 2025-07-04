import { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchItems, selectItem, reorderItems } from './api/api';
import { Item, ReorderUpdate } from './types/types';
import { ItemRow } from './components/ItemRow';
import { SearchInput } from './components/SearchInput';
import './App.css';

const LIMIT = 20;

// --- Вот сюда вынесли чтение параметров ---
const params = new URLSearchParams(window.location.search);
const initialSearch = params.get('search') || '';

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // При первом рендере подтягиваем поиск из URL
  useEffect(() => {
    setSearch(initialSearch);
  }, []);

  // Подгружаем первые 20 элементов
  const fetchData = async (newOffset: number, append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchItems(newOffset, LIMIT, search);
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setTotal(data.total);
      setHasMore(newOffset + LIMIT < data.total);
      setOffset(newOffset);
    } finally {
      setLoading(false);
    }
  };

  // При изменении поиска — обновляем URL и перезапрашиваем данные
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);

    setItems([]);
    setOffset(0);
    fetchData(0, false);
  }, [search]);

  // Скролл, добавление 20 элементов
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;

    if (nearBottom) {
      fetchData(offset + LIMIT, true);
    }
  };

  // Выделение элементов
  const handleSelect = async (id: number, selected: boolean) => {
    await selectItem(id, selected);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected } : item))
    );
  };

  // Перемещение элементов
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
  
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
  
    if (sourceIndex === destinationIndex) return;
  
    // Копируем и переставляем элемент
    const reordered = Array.from(items);
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, moved);
    setItems(reordered);
  
    const updates: ReorderUpdate[] = [];
  
    const targetBeforeMove = items[destinationIndex];
    console.log(targetBeforeMove)

    // Обновляем элементы
    updates.push({
      id: moved.id,
      selected: moved.selected,
      newIndex: targetBeforeMove.index,
    });
  
    // Отправляем изменения на сервер
    try {
      await reorderItems(updates);
  
      // После успешного reorder — обновить данные с сервера
      const updated = await fetchItems(0, offset + LIMIT, search);
      setItems(updated.items);
      setTotal(updated.total);
      setHasMore(offset + LIMIT < updated.total);
    } catch (error) {
      console.error('Ошибка при reorder или fetch:', error);
    }
  };
  

  return (
    <div className="main">
      <SearchInput 
        value={search} 
        onChange={setSearch} 
      />
      <div className="total-count">Всего элементов: {total}</div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div
              className="scroll-list"
              ref={(el) => {
                scrollRef.current = el;
                provided.innerRef(el);
              }}
              {...provided.droppableProps}
              onScroll={handleScroll}
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                  {(provided) => (
                    <ItemRow
                      item={item}
                      index={index}
                      provided={provided}
                      onSelect={handleSelect}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {loading && <div>Загрузка...</div>}
              {!hasMore && !loading && <div>Конец списка</div>}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
