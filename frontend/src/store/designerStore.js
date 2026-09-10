import { create } from 'zustand';

export const useDesignerStore = create((set) => ({
  selectedVehicle: null,
  placements: [],
  setSelectedVehicle: (selectedVehicle) => set({ selectedVehicle, placements: [] }),
  togglePlacement: (partId, zoneCode) => set((state) => ({
    placements: state.placements.some((placement) => placement.partId === partId)
      ? state.placements.filter((placement) => placement.partId !== partId)
      : [...state.placements, { partId, zoneCode }]
  }))
}));
