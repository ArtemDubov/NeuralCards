import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { cardSetsApi } from "../../../features/cardSets/api/cardSetsApi";
import { favoritesApi } from "../../../features/favorites";
import { trainingApi } from "../../../features/training/api/trainingApi";

/**
 * Custom hook for CardSetsListPage logic
 * Manages sets state, CRUD operations, favorites, search, import
 */
export function useCardSetsLogic() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [sets, setSets] = useState([]);
  const [officialSets, setOfficialSets] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState(null);
  // Состояния для модалки выбора режима тренировки
  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingSetId, setPendingSetId] = useState(null);

  useEffect(() => {
    loadSets();
    if (localStorage.getItem("openCreateModal") === "true") {
      localStorage.removeItem("openCreateModal");
      setShowCreateModal(true);
    }
  }, []);

  // Обновляем избранное при возврате на вкладку ИЛИ при фокусе окна
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSets();
      }
    };

    const handleFocus = () => {
      loadSets();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadSets = async () => {
    try {
      const [setsResponse, favResponse, officialResponse] = await Promise.all([
        cardSetsApi.getCardSets(true),
        favoritesApi.getList("card_set"),
        cardSetsApi.getOfficialSets().catch(() => ({ data: [] })),
      ]);
      setSets(setsResponse.data || []);
      setOfficialSets(officialResponse.data || []);
      // getList возвращает массив ID напрямую, не в поле data
      setFavoriteIds(new Set(favResponse || []));
    } catch (error) {
      console.error("Error loading sets:", error);
      setSets([]);
      setOfficialSets([]);
      setFavoriteIds(new Set());
    }
  };

  const handleCreate = (newSet) => {
    setSets([...sets, newSet]);
    setShowCreateModal(false);
  };

  const handleUpdate = (updatedSet) => {
    setSets(sets.map((s) => (s.id === updatedSet.id ? updatedSet : s)));
    setShowEditModal(false);
    setEditingSet(null);
  };

  const handleImport = async ({ file, importMode, setId, setName, description, frontLang, backLang }) => {
    try {
      let cards = [];
      const fileName = file.name.toLowerCase();
      
      // Excel файлы
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        const data = await readFileAsArrayBuffer(file);
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        cards = jsonData
          .map((row) => {
            if (row && row.length >= 2) {
              return {
                front: String(row[0]).trim(),
                back: String(row[1]).trim(),
                front_lang: frontLang,
                back_lang: backLang,
              };
            }
            return null;
          })
          .filter(Boolean);
      } 
      // CSV и TXT файлы
      else {
        const text = await readFileAsText(file);
        const lines = text.split("\n").filter((line) => line.trim());
        
        cards = lines.map((line) => {
          const parts = line.split(";").map((p) => p.trim());
          if (parts.length >= 2) {
            return {
              front: parts[0],
              back: parts[1],
              front_lang: frontLang,
              back_lang: backLang,
            };
          }
          return null;
        }).filter(Boolean);
      }

      if (cards.length === 0) {
        throw new Error("Не удалось распознать карточки в файле");
      }

      let targetSetId;

      // Импорт в существующий набор или создание нового
      if (importMode === "existing" && setId) {
        targetSetId = setId;
      } else {
        // Создаем новый набор (автоматически непубличный)
        const setResponse = await cardSetsApi.createCardSet({
          title: setName,
          description: description || "",
          is_public: false,
          tags: [],
        });
        targetSetId = setResponse.data.id;
      }

      // Добавляем карточки батчем
      await cardSetsApi.createCardsBatch(targetSetId, cards);

      toast.success(`Успешно импортировано ${cards.length} карточек`);
      loadSets();
      setShowImportModal(false);
    } catch (error) {
      console.error("Ошибка импорта:", error);
      throw new Error(error.response?.data?.detail || "Ошибка при импорте");
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleDelete = (setId) => {
    setDeleteTargetId(setId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await cardSetsApi.deleteCardSet(deleteTargetId);
      setSets(sets.filter((s) => s.id !== deleteTargetId));
      toast.success("Набор удален");
    } catch (error) {
      console.error("Error deleting set:", error);
      toast.error("Ошибка при удалении набора");
    } finally {
      setDeleteLoading(false);
      setDeleteTargetId(null);
    }
  };

  const startTraining = (setId) => {
    setPendingSetId(setId);
    setShowModeModal(true);
  };

  const handleModeSelect = async (mode) => {
    if (!pendingSetId) return;
    setTrainingLoading(true);
    try {
      localStorage.setItem("lastSelectedSetId", pendingSetId);
      
      // Practice mode - прямой переход без создания сессии
      if (mode === "practice") {
        navigate(`/training/practice/${pendingSetId}`);
        return;
      }

      // Quiz mode - прямой переход без создания сессии
      if (mode === "quiz") {
        navigate(`/training/quiz/${pendingSetId}`);
        return;
      }

      // Marathon mode - прямой переход без создания сессии
      if (mode === "marathon") {
        navigate(`/training/marathon/${pendingSetId}`);
        return;
      }

      // Dictation mode - прямой переход без создания сессии
      if (mode === "dictation") {
        navigate(`/training/dictation/${pendingSetId}`);
        return;
      }

      // Matching mode - прямой переход без создания сессии
      if (mode === "matching") {
        navigate(`/training/matching/${pendingSetId}`);
        return;
      }

      // Для других режимов создаем сессию
      const session = await trainingApi.createSession({
        card_set_id: parseInt(pendingSetId),
        mode: mode,
      });

      navigate(`/training/${mode}/${session.data.id}`);
    } catch (error) {
      console.error("Error starting training:", error);
      toast.error(
        "Ошибка при запуске тренировки: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setTrainingLoading(false);
      setShowModeModal(false);
      setPendingSetId(null);
    }
  };

  const handleCopySet = async (setId) => {
    try {
      const response = await cardSetsApi.copyCardSet(setId);
      setSets([...sets, response.data]);
      toast.success("Набор скопирован");
    } catch (error) {
      console.error("Error copying set:", error);
      toast.error("Ошибка при копировании набора");
    }
  };

  const toggleFavorite = async (setId) => {
    const isFav = favoriteIds.has(setId);
    try {
      if (isFav) {
        await favoritesApi.remove("card_set", setId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(setId);
          return next;
        });
      } else {
        await favoritesApi.add("card_set", setId);
        setFavoriteIds((prev) => new Set([...prev, setId]));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Filtered sets
  const mySets = sets.filter((s) => s.author_id === user?.id);
  const publicSets = sets.filter(
    (s) => s.author_id !== user?.id && !s.is_official,
  );

  const matchesSearch = (set) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      set.title.toLowerCase().includes(query) ||
      (set.description && set.description.toLowerCase().includes(query)) ||
      (set.tags &&
        set.tags.some((tag) => tag.name.toLowerCase().includes(query)))
    );
  };

  const filteredMySets = mySets.filter(matchesSearch);
  const filteredPublicSets = publicSets.filter(matchesSearch);
  const filteredOfficialSets = officialSets.filter(matchesSearch);

  return {
    // State
    sets,
    officialSets,
    favoriteIds,
    searchQuery,
    showCreateModal,
    showImportModal,
    editingSet,
    showEditModal,
    deleteTargetId,
    deleteLoading,
    trainingLoading,
    selectedSetId,
    showModeModal,
    pendingSetId,
    user,

    // Filtered data
    filteredMySets,
    filteredPublicSets,
    filteredOfficialSets,

    // Setters
    setSearchQuery,
    setShowCreateModal,
    setShowImportModal,
    setEditingSet,
    setShowEditModal,
    setDeleteTargetId,
    setShowModeModal,

    // Handlers
    handleCreate,
    handleUpdate,
    handleImport,
    handleDelete,
    confirmDelete,
    startTraining,
    handleModeSelect,
    handleCopySet,
    toggleFavorite,
    loadSets,
  };
}
