import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CouncilConfig, CouncilMemberSelection, CustomPersona, AvailableModel, Persona } from '../types';

const DEFAULT_MODEL = 'gpt-4o';

const DEFAULT_COUNCIL: CouncilMemberSelection[] = [
  { personaId: 'skeptic', modelId: DEFAULT_MODEL },
  { personaId: 'explainer', modelId: DEFAULT_MODEL },
  { personaId: 'pragmatist', modelId: DEFAULT_MODEL },
];
const DEFAULT_SENATOR = 'neutral';

interface SettingsStore {
  councilMembers: CouncilMemberSelection[];
  senatorPersona: string;
  senatorModel: string;
  customPersona: CustomPersona | null;
  showSettingsPopup: boolean;
  availableModels: AvailableModel[];
  personas: Persona[];
  senatorPersonas: Persona[];
  isLoadingConfig: boolean;

  setCouncilMembers: (members: CouncilMemberSelection[]) => void;
  addCouncilMember: (personaId: string, modelId: string) => void;
  removeCouncilMember: (index: number) => void;
  updateCouncilMember: (index: number, member: CouncilMemberSelection) => void;
  setSenatorPersona: (persona: string) => void;
  setSenatorModel: (model: string) => void;
  setCustomPersona: (persona: CustomPersona | null) => void;
  setShowSettingsPopup: (show: boolean) => void;
  getCouncilConfig: () => CouncilConfig;
  resetToDefaults: () => void;
  fetchConfig: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      councilMembers: DEFAULT_COUNCIL,
      senatorPersona: DEFAULT_SENATOR,
      senatorModel: DEFAULT_MODEL,
      customPersona: null,
      showSettingsPopup: false,
      availableModels: [{ id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' }],
      personas: [],
      senatorPersonas: [],
      isLoadingConfig: false,

      setCouncilMembers: (members) => set({ councilMembers: members }),

      addCouncilMember: (personaId, modelId) => {
        const { councilMembers } = get();
        if (councilMembers.length < 8) {
          set({ councilMembers: [...councilMembers, { personaId, modelId }] });
        }
      },

      removeCouncilMember: (index) => {
        const { councilMembers } = get();
        if (councilMembers.length > 2) {
          set({ councilMembers: councilMembers.filter((_, i) => i !== index) });
        }
      },

      updateCouncilMember: (index, member) => {
        const { councilMembers } = get();
        const updated = [...councilMembers];
        updated[index] = member;
        set({ councilMembers: updated });
      },

      setSenatorPersona: (persona) => set({ senatorPersona: persona }),
      setSenatorModel: (model) => set({ senatorModel: model }),
      setCustomPersona: (persona) => set({ customPersona: persona }),
      setShowSettingsPopup: (show) => set({ showSettingsPopup: show }),

      getCouncilConfig: () => ({
        councilMembers: get().councilMembers,
        senatorPersona: get().senatorPersona,
        senatorModel: get().senatorModel,
        customPersona: get().customPersona,
      }),

      resetToDefaults: () =>
        set({
          councilMembers: DEFAULT_COUNCIL,
          senatorPersona: DEFAULT_SENATOR,
          senatorModel: DEFAULT_MODEL,
          customPersona: null,
        }),

      fetchConfig: async () => {
        set({ isLoadingConfig: true });
        try {
          const [modelsRes, personasRes] = await Promise.all([
            fetch('/api/council/config/models'),
            fetch('/api/council/config/personas'),
          ]);

          if (modelsRes.ok) {
            const modelsData = await modelsRes.json();
            set({ availableModels: modelsData.models });
          }

          if (personasRes.ok) {
            const personasData = await personasRes.json();
            set({
              personas: personasData.personas,
              senatorPersonas: personasData.senator_personas,
            });
          }
        } catch (error) {
          console.error('Failed to fetch config:', error);
        } finally {
          set({ isLoadingConfig: false });
        }
      },
    }),
    {
      name: 'axis-council-settings',
      partialize: (state) => ({
        councilMembers: state.councilMembers,
        senatorPersona: state.senatorPersona,
        senatorModel: state.senatorModel,
        customPersona: state.customPersona,
      }),
    }
  )
);
