const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Псевдо-глобальный массив элементов с индексами
let globalItems = Array.from({ length: 1000000 }, (_, i) => ({
  id: i + 1,
  selected: false,
  index: i, // добавляем индекс в каждый элемент
}));

// Эндпоинт для получения элементов с фильтрацией и пагинацией
app.get('/items', (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';

  let filtered = globalItems;
  if (search) {
    filtered = filtered.filter((item) => item.id.toString().includes(search));
  }

  const items = filtered.slice(offset, offset + limit);
  res.json({ items, total: filtered.length });
});

// Эндпоинт для изменения состояния элемента (выбран/не выбран)
app.post('/select', (req, res) => {
  const { id, selected } = req.body;
  const index = globalItems.findIndex((i) => i.id === Number(id));
  if (index !== -1) {
    globalItems[index].selected = selected;
    console.log("Updated selected:", globalItems[index].selected);
  } else {
    console.log("Item not found!");
  }
  res.sendStatus(200);
});

app.post('/reorder', (req, res) => {
  const updates = req.body; // Ожидается [{ id, index }], но нас интересует только один перемещаемый элемент
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).send({ message: 'Нет обновлений' });
  }

  const movedUpdate = updates[0];
  console.log(movedUpdate)
  const movedItemIndex = globalItems.findIndex(i => i.id === movedUpdate.id);
  const movedItem = globalItems[movedItemIndex];
  console.log(movedItem)

  if (!movedItem) {
    return res.status(404).send({ message: 'Элемент не найден' });
  }

  // Обновляем selected
  movedItem.selected = movedUpdate.selected;

  // Находим целевой индекс
  const targetIndexValue = movedUpdate.newIndex; 
  let targetIndex = globalItems.findIndex(i => i.index === targetIndexValue);

  // Удаляем элемент из текущей позиции
  globalItems.splice(movedItemIndex, 1);

  

  // console.log(targetIndex)

  // Если индекс не найден (например, если последний элемент) — вставляем в конец
  const newInsertIndex = targetIndex >= 0 ? targetIndex : globalItems.length;
  globalItems.splice(newInsertIndex, 0, movedItem);

  // Переустанавливаем индексы всех элементов в массиве
  globalItems.forEach((item, idx) => {
    item.index = idx;
  });

  res.status(200).send({
    message: 'Порядок элементов обновлен',
    items: [movedItem],
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


