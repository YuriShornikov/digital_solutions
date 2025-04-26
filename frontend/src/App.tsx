import { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchItems, selectItem, reorderItems } from './api/api';
import { Item } from './types/types';
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

  // Скролл
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;

    if (nearBottom) {
      fetchData(offset + LIMIT, true);
    }
  };

  const handleSelect = async (id: number, selected: boolean) => {
    await selectItem(id, selected);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected } : item))
    );
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);

    // console.log('Search term before sending:', search);
    await reorderItems(reordered.map((i) => i.id), search);
  };

  return (
    <div className="main">
      <SearchInput 
        value={search} 
        onChange={setSearch} 
      />
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
