import axios from 'axios';
import { Item } from '../types/types';

const BASE_URL = 'http://localhost:3001';

export const fetchItems = async (offset = 0, limit = 20, search = '') => {
  const res = await axios.get(`${BASE_URL}/items`, {
    params: { offset, limit, search },
  });
  return res.data as { items: Item[]; total: number };
};

export const selectItem = async (id: number, selected: boolean) => {
  return axios.post(`${BASE_URL}/select`, {
    ids: [id],
    selected,
  });
};


export const reorderItems = async (newOrder: number[], search: string) => {
  // console.log('Sending search term:', search);
  return axios.post(`${BASE_URL}/reorder`, 
    { newOrder },
    { params: { search } }
  );
};


// export const clearSearch = async () => {
//   try {
//     const res = await axios.post(`${BASE_URL}/clear-search`, { search: '' });
//     return res.data; // обязательно вернем данные
//   } catch (error) {
//     console.error('Error clearing search:', error);
//     throw error;
//   }
// };

