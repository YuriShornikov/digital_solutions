const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

let state = {
  selected: new Set(),

  // текущий порядок
  order: Array.from({ length: 1000000 }, (_, i) => i + 1),  
  
  // оригинальный порядок
  originalOrder: Array.from({ length: 1000000 }, (_, i) => i + 1),

  temporarySearchOrders: new Map(),
};

// GET /items — загрузка данных с пагинацией и поиском
app.get('/items', (req, res) => {
  const offset = parseInt(req.query.offset || '0');
  const limit = parseInt(req.query.limit || '20');
  const search = req.query.search || '';

  let filteredOrder;

  if (search) {
    filteredOrder = state.temporarySearchOrders.get(search);

    if (!filteredOrder) {
      filteredOrder = state.originalOrder.filter(id =>
        id.toString().includes(search)
      );
      state.temporarySearchOrders.set(search, [...filteredOrder]);
    }
  } else {
    filteredOrder = state.order;
  }

  if (!search || search === '') {
    filteredOrder = state.order;
    // console.log(filteredOrder);
  }

  const items = filteredOrder.slice(offset, offset + limit).map(id => ({
    id,
    selected: !!state.selected.has(id),
  }));

  res.json({
    items,
    total: filteredOrder.length,
  });
});

// POST /reorder — изменение порядка (глобально или внутри поиска)
app.post('/reorder', (req, res) => {
  const { newOrder } = req.body;
  const { search = '' } = req.query;

  if (search) {

    // Изменяем порядок только внутри временного списка для конкретного поиска
    const currentSearchOrder = state.temporarySearchOrders.get(search) || [];
    const visibleSet = new Set(newOrder);
    const remaining = currentSearchOrder.filter(id => !visibleSet.has(id));

    // Обновляем временный порядок для конкретного поиска
    state.temporarySearchOrders.set(search, [...newOrder, ...remaining]);
    // console.log(`state.temporarySearchOrders`, state.temporarySearchOrders)
  } else {

    // Изменяем глобальный порядок
    const visibleSet = new Set(newOrder);
    const remaining = state.order.filter(id => !visibleSet.has(id));
    state.order = [...newOrder, ...remaining];
    // console.log(`state.order`, state.order);
  }

  res.send({ success: true });
});

// POST /select — выбор (выделение) элементов
app.post('/select', (req, res) => {
  const { ids, selected } = req.body;

  ids.forEach(id => {
    if (selected) {
      state.selected.add(id);
    } else {
      state.selected.delete(id);
    }
  });

  res.sendStatus(200);
});

// POST /clear-search — сброс временного порядка по конкретному поиску
app.post('/clear-search', (req, res) => {
  const { search } = req.body;

  // if (!search) {
  //   // Полная очистка всех временных порядков
  //   state.temporarySearchOrders.clear();
  // } else {
  //   // Очистка только конкретного поиска
  //   state.temporarySearchOrders.delete(search);
  // }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
