import { create } from 'zustand';

export const useDesignerStore = create((set) => ({
  selectedVehicle: null,
  setSelectedVehicle: (selectedVehicle) => set({ selectedVehicle })
}));
