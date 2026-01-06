import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const API_URL = 'https://kiddsapp-backend.tecobit.cloud/api/v1/content';
const CACHE_PREFIX = 'CONTENT_CACHE_';

export interface ContentItem {
  _id: string;
  type: 'math' | 'letter' | 'animal' | 'number' | 'vegetable' | 'fruit';
  title: string;
  imageUrl: string;
  soundUrl?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
}

interface ContentState {
  items: ContentItem[];
  loading: boolean;
  activeType: string | null;
  completedCount: number;
  correctCount: number;
  wrongCount: number;
  lastReset: string;
  page: number;
  fetchByType: (type: string, reset?: boolean) => Promise<void>;
  fetchMore: (type: string) => Promise<void>;
  trackAnswer: (isCorrect: boolean) => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      activeType: null,
      completedCount: 0,
      correctCount: 0,
      wrongCount: 0,
      lastReset: new Date().toDateString(),
      page: 1,

      fetchByType: async (type, reset = false) => {
        if (get().loading || (!reset && get().activeType === type && get().items.length > 0)) return;
        set({ loading: true, activeType: type });
        if (reset) set({ items: [], page: 1 });

        if (type === 'math') {
          set({ items: generateMath(), loading: false });
          return;
        }

        try {
          const res = await axios.get(API_URL, { params: { type, page: 1, limit: 10 } });
          const content = res.data.content || [];
          await AsyncStorage.setItem(`${CACHE_PREFIX}${type}`, JSON.stringify(content));
          set({ items: content, loading: false, page: 2 });
        } catch (error) {
          console.error("Fetch Error:", error);
          const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${type}`);
          set({ items: cached ? JSON.parse(cached) : [], loading: false });
        }
      },

      fetchMore: async (type) => {
        if (get().loading) return;
        set({ loading: true });

        try {
          const res = await axios.get(API_URL, { params: { type, page: get().page, limit: 10 } });
          const newContent = res.data.content || [];
          if (newContent.length > 0) {
            const merged = [...get().items, ...newContent];
            await AsyncStorage.setItem(`${CACHE_PREFIX}${type}`, JSON.stringify(merged));
            set((s) => ({ items: merged, page: s.page + 1, loading: false }));
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error("Fetch More Error:", error);
          set({ loading: false });
        }
      },

      trackAnswer: (isCorrect) => {
        if (isCorrect) {
          set((s) => ({ correctCount: s.correctCount + 1, completedCount: s.completedCount + 1 }));
        } else {
          set((s) => ({ wrongCount: s.wrongCount + 1 }));
        }
      },
    }),
    {
      name: 'cosmic-kids-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        completedCount: s.completedCount,
        lastReset: s.lastReset,
        correctCount: s.correctCount,
        wrongCount: s.wrongCount,
      }),
    }
  )
);

// ---------------- Emoji-based math generator ----------------
const fruits = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝'];

// Show "0" when num = 0, else repeat emoji
const numberToEmoji = (num: number, emoji: string) => num === 0 ? '0' : emoji.repeat(num);

export const generateMath = (count: number = 8): ContentItem[] => {
  const operations: ('Add' | 'Subtract' | 'Multiply' | 'Divide')[] = ['Add', 'Subtract', 'Multiply', 'Divide'];
  const arr: ContentItem[] = [];

  for (let i = 0; i < count; i++) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a = Math.floor(Math.random() * 5) + 1;
    let b = Math.floor(Math.random() * 5) + 1;
    let answer = 0;

    const emojiA = fruits[Math.floor(Math.random() * fruits.length)];
    const emojiB = fruits[Math.floor(Math.random() * fruits.length)];

    let question = '';
    let title = '';
    let imageUrl = emojiA;

    switch (op) {
      case 'Add':
        answer = a + b;
        question = `What is ${a} ${emojiA}${a > 1 ? '' : ''} + ${b} ${emojiB}${b > 1 ? '' : ''}?`;
        title = `${a} + ${b}`;
        break;
      case 'Subtract':
        if (b > a) [a, b] = [b, a];
        answer = a - b;
        question = `What is ${a} ${emojiA}${a > 1 ? '' : ''} - ${b} ${emojiB}${b > 1 ? '' : ''}?`;
        title = `${a} - ${b}`;
        break;
      case 'Multiply':
        answer = a * b;
        question = `What is ${a} ${emojiA}${a > 1 ? '' : ''} × ${b} ${emojiB}${b > 1 ? '' : ''}?`;
        title = `${a} × ${b}`;
        break;
      case 'Divide':
        answer = a;
        const product = a * b;
        question = `What is ${product} ${emojiA}${product > 1 ? '' : ''} ÷ ${b} ${emojiB}${b > 1 ? '' : ''}?`;
        title = `${product} ÷ ${b}`;
        break;
    }

    arr.push({
      _id: `math-${Date.now()}-${i}`,
      type: 'math',
      title,
      imageUrl,
      soundUrl: `/uploads/math/sounds/${title.replace(/ /g,'')}.mp3`,
      question,
      options: [
        numberToEmoji(answer, emojiA),
        numberToEmoji(answer + 1, emojiA),
        numberToEmoji(Math.max(0, answer - 1), emojiA),
        numberToEmoji(answer + 2, emojiA),
      ],
      correctAnswer: numberToEmoji(answer, emojiA),
    });
  }

  return arr;
};
