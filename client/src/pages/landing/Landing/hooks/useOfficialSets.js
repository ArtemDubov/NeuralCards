import { useState, useEffect } from 'react';
import axiosClient from '../../../../shared/api/axiosClient';

/**
 * Хук для загрузки публичных наборов карточек на лендинге
 * Загружает все публичные наборы (не только официальные)
 */
export function useOfficialSets() {
  const [officialSets, setOfficialSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Сначала пробуем загрузить официальные наборы
        const res = await axiosClient.get('/api/card-sets/official/list');
        let sets = res.data || [];
        
        // Если официальных наборов нет или мало, загружаем публичные наборы
        if (sets.length < 3) {
          try {
            const publicRes = await axiosClient.get('/api/guest/sets');
            const publicSets = publicRes.data || [];
            
            // Объединяем официальные и публичные наборы, убираем дубликаты
            const combinedSets = [...sets];
            const existingIds = new Set(sets.map(s => s.id));
            
            publicSets.forEach(set => {
              if (!existingIds.has(set.id)) {
                combinedSets.push({
                  id: set.id,
                  title: set.title,
                  description: set.description,
                  cards_count: set.cards_count || 0,
                  is_public: true,
                  is_official: false
                });
              }
            });
            
            sets = combinedSets;
          } catch (publicError) {
            console.error('Failed to load public sets:', publicError);
          }
        }
        
        setOfficialSets(sets);
      } catch (error) {
        console.error('Failed to load official sets:', error);
        
        // Fallback: пробуем загрузить публичные наборы если официальные не загрузились
        try {
          const publicRes = await axiosClient.get('/api/guest/sets');
          setOfficialSets(publicRes.data || []);
        } catch (fallbackError) {
          console.error('Failed to load fallback sets:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, []);

  return {
    officialSets,
    loading
  };
}
