import axios from 'axios';
import { Item, ReorderUpdate } from '../types/types';

const BASE_URL = 'http://localhost:3001';

export const fetchItems = async (offset = 0, limit = 20, search = '') => {
  const res = await axios.get(`${BASE_URL}/items`, {
    params: { offset, limit, search },
  });
  return res.data as { items: Item[]; total: number };
};

export const selectItem = async (id: number, selected: boolean) => {
  return axios.post(`${BASE_URL}/select`, {
    id: [id],
    selected,
  });
};

export async function reorderItems(updates: ReorderUpdate[]) {
  try {
    await axios.post(`${BASE_URL}/reorder`, updates, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Ошибка при reorder:', error);
  }
}

