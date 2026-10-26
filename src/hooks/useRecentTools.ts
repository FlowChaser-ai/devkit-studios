import { useLocalStorage } from './useLocalStorage';

export function useRecentTools() {
  const [recentTools, setRecentTools] = useLocalStorage<string[]>('devkit_recents', [
    'json-formatter',
    'image-compressor',
    'color-palette',
  ]);

  const addRecent = (toolId: string) => {
    setRecentTools((prev) => {
      const filtered = prev.filter((id) => id !== toolId);
      return [toolId, ...filtered].slice(0, 6);
    });
  };

  const clearRecents = () => {
    setRecentTools([]);
  };

  return { recentTools, addRecent, clearRecents };
}
