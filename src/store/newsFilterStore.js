import create from "zustand";

const useNewsFilterStore = create((set) => ({
  filters: { sentiment: [], entities: [] },
  setFilters: (filters) => set({ filters }),
  setEntitiesFilter: (entities) =>
    set((state) => ({ filters: { ...state.filters, entities } })),
}));

export default useNewsFilterStore;
