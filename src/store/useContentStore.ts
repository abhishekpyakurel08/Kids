// src/store/useContentStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ---------------- Backend API ----------------
export const API_URL = 'https://kiddsapp-backend.tecobit.cloud/api/v1/content/';
const CACHE_PREFIX = 'CONTENT_CACHE_';
const CACHE_INDEX_KEY = 'CACHE_INDEX';
const MAX_CACHE_MB = 50;
const MAX_CACHE_BYTES = MAX_CACHE_MB * 1024 * 1024;

// ---------------- Types ----------------
export interface ContentItem {
  _id: string;
  type:
    | 'letter' | 'number' | 'animal' | 'fruit' | 'flower' | 'vegetable'
    | 'addition' | 'subtraction' | 'multiplication' | 'division'
    | 'bird' | 'insect';
  title: string;
  imageUrl: string;
  soundUrl?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  value?: string | number;
  valueName?: string;
}

type CacheEntry = { size: number; lastAccess: number };
type CacheIndex = { totalSize: number; files: Record<string, CacheEntry> };

// ---------------- Cache Helpers ----------------
async function loadCacheIndex(): Promise<CacheIndex> {
  const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
  return raw ? JSON.parse(raw) : { totalSize: 0, files: {} };
}

async function saveCacheIndex(index: CacheIndex) {
  await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
}

async function registerCache(id: string, size: number) {
  const index = await loadCacheIndex();
  if (!index.files[id]) {
    index.files[id] = { size, lastAccess: Date.now() };
    index.totalSize += size;
  } else {
    index.files[id].lastAccess = Date.now();
  }
  await saveCacheIndex(index);
  await enforceCacheLimit();
}

async function enforceCacheLimit() {
  const index = await loadCacheIndex();
  if (index.totalSize <= MAX_CACHE_BYTES) return;

  const sorted = Object.entries(index.files).sort(
    (a, b) => a[1].lastAccess - b[1].lastAccess
  );

  for (const [id, file] of sorted) {
    if (index.totalSize <= MAX_CACHE_BYTES) break;
    await AsyncStorage.removeItem(id);
    index.totalSize -= file.size;
    delete index.files[id];
  }

  await saveCacheIndex(index);
}

// ---------------- Zustand State ----------------
interface ContentState {
  items: ContentItem[];
  loading: boolean;
  refreshing: boolean;
  activeType: ContentItem['type'] | null;
  page: number;
  hasMore: boolean;

  completedCount: number;
  correctCount: number;
  wrongCount: number;
  highScore: number; // ✅ Track high score

  scrollOffsets: Record<string, number>;
  fetchCount: Record<string, number>;

  fetchByType: (type: ContentItem['type'], reset?: boolean) => Promise<void>;
  fetchMore: (type: ContentItem['type']) => Promise<void>;
  refresh: (type: ContentItem['type']) => Promise<void>;
  trackAnswer: (isCorrect: boolean) => void;
  setScrollOffset: (type: ContentItem['type'], offset: number) => void;
  resetScores: () => void;
  clearItems: () => void;
  updateHighScore: (score: number) => void; // ✅ Action to update highScore
}

// ---------------- Store ----------------
export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      refreshing: false,
      activeType: null,
      page: 1,
      hasMore: true,

      completedCount: 0,
      correctCount: 0,
      wrongCount: 0,
      highScore: 0, // initial high score

      scrollOffsets: {},
      fetchCount: {},

      fetchByType: async (type, reset = false) => {
        if (get().loading) return;

        set({ loading: true, activeType: type });
        if (reset) set({ items: [], page: 1, hasMore: true });

        try {
          const res = await axios.get(API_URL, { params: { type, page: 1, limit: 26 } });
          const content: ContentItem[] = res.data.content || [];

          const key = `${CACHE_PREFIX}${type}`;
          const size = JSON.stringify(content).length;
          await AsyncStorage.setItem(key, JSON.stringify(content));
          await registerCache(key, size);

          set((s) => ({
            items: content,
            page: 2,
            hasMore: content.length === 20,
            loading: false,
            fetchCount: { ...s.fetchCount, [type]: (s.fetchCount[type] || 0) + 1 }
          }));
        } catch {
          const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${type}`);
          set({ items: cached ? JSON.parse(cached) : [], loading: false });
        }
      },

      fetchMore: async (type) => {
        if (get().loading || !get().hasMore) return;
        set({ loading: true });

        try {
          const res = await axios.get(API_URL, { params: { type, page: get().page, limit: 20 } });
          const newItems: ContentItem[] = res.data.content || [];
          const merged = [...get().items, ...newItems];

          const key = `${CACHE_PREFIX}${type}`;
          const size = JSON.stringify(merged).length;
          await AsyncStorage.setItem(key, JSON.stringify(merged));
          await registerCache(key, size);

          set((s) => ({
            items: merged,
            page: s.page + 1,
            hasMore: newItems.length === 20,
            loading: false,
            fetchCount: { ...s.fetchCount, [type]: (s.fetchCount[type] || 0) + 1 }
          }));
        } catch {
          set({ loading: false });
        }
      },

      refresh: async (type) => {
        set({ refreshing: true });
        await get().fetchByType(type, true);
        set({ refreshing: false });
      },

      trackAnswer: (isCorrect) =>
        set((s) => ({
          completedCount: s.completedCount + 1,
          correctCount: s.correctCount + (isCorrect ? 1 : 0),
          wrongCount: s.wrongCount + (isCorrect ? 0 : 1),
        })),

      setScrollOffset: (type, offset) =>
        set((s) => ({ scrollOffsets: { ...s.scrollOffsets, [type]: offset } })),

      // --- New Actions ---
      resetScores: () => set({ completedCount: 0, correctCount: 0, wrongCount: 0 }),
      clearItems: () => set({ items: [], page: 1, hasMore: true }),
      updateHighScore: (score: number) =>
        set((s) => ({ highScore: Math.max(s.highScore, score) })),
    }),
    {
      name: 'content-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        completedCount: s.completedCount,
        correctCount: s.correctCount,
        wrongCount: s.wrongCount,
        scrollOffsets: s.scrollOffsets,
        fetchCount: s.fetchCount,
        highScore: s.highScore, // ✅ persist highScore
      }),
    }
  )
);
