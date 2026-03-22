import { useState, useEffect } from 'react';

import { useSettingsStore } from '../../stores/settingsStore';
import { PERSONAS, NEUTRAL_SENATOR, GREEK_LETTERS, type CustomPersona, type CouncilMemberSelection } from '../../types';
import { PersonaSelect } from './PersonaSelect';

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function SettingsPopup() {
  const {
    councilMembers,
    senatorPersona,
    senatorModel,
    customPersona,
    showSettingsPopup,
    councilModels,
    senatorModels,
    personas: fetchedPersonas,
    senatorPersonas: fetchedSenatorPersonas,
    setCouncilMembers,
    setSenatorPersona,
    setSenatorModel,
    setCustomPersona,
    setShowSettingsPopup,
    fetchConfig,
  } = useSettingsStore();

  const [localCouncil, setLocalCouncil] = useState<CouncilMemberSelection[]>(councilMembers);
  const [localSenatorPersona, setLocalSenatorPersona] = useState<string>(senatorPersona);
  const [localSenatorModel, setLocalSenatorModel] = useState<string>(senatorModel);
  const [localCustom, setLocalCustom] = useState<CustomPersona | null>(customPersona);

  const [councilExpanded, setCouncilExpanded] = useState(false);
  const [senatorExpanded, setSenatorExpanded] = useState(false);
  const [customExpanded, setCustomExpanded] = useState(false);

  const personas = fetchedPersonas.length > 0 ? fetchedPersonas : PERSONAS;
  const senatorPersonaOptions = fetchedSenatorPersonas.length > 0 
    ? fetchedSenatorPersonas 
    : [NEUTRAL_SENATOR, ...PERSONAS.filter(p => ['analyst', 'pragmatist', 'historian', 'explainer'].includes(p.id))];

  useEffect(() => {
    if (showSettingsPopup) {
      fetchConfig();
      setLocalCouncil(councilMembers);
      setLocalSenatorPersona(senatorPersona);
      setLocalSenatorModel(senatorModel);
      setLocalCustom(customPersona);
    }
  }, [showSettingsPopup]);

  if (!showSettingsPopup) return null;

  const addMember = () => {
    if (localCouncil.length < 8) {
      const defaultModel = 'gpt-4o';
      setLocalCouncil([...localCouncil, { 
        personaId: 'none', 
        modelId: defaultModel 
      }]);
    }
  };

  const getRandomCouncilModel = () => {
    if (councilModels.length === 0) return 'gpt-4o';
    const randomIndex = Math.floor(Math.random() * councilModels.length);
    return councilModels[randomIndex].id;
  };

  const getRandomSenatorModel = () => {
    if (senatorModels.length === 0) return 'gpt-4o';
    const randomIndex = Math.floor(Math.random() * senatorModels.length);
    return senatorModels[randomIndex].id;
  };

  const randomizeCouncilMemberModel = (index: number) => {
    const randomModel = getRandomCouncilModel();
    updateMember(index, 'modelId', randomModel);
  };

  const randomizeSenatorModel = () => {
    const randomModel = getRandomSenatorModel();
    setLocalSenatorModel(randomModel);
  };

  const removeMember = (index: number) => {
    if (localCouncil.length > 2) {
      setLocalCouncil(localCouncil.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: 'personaId' | 'modelId', value: string) => {
    const updated = [...localCouncil];
    updated[index] = { ...updated[index], [field]: value };
    setLocalCouncil(updated);
  };

  const handleApply = () => {
    setCouncilMembers(localCouncil);
    setSenatorPersona(localSenatorPersona);
    setSenatorModel(localSenatorModel);
    setCustomPersona(localCustom);
    setShowSettingsPopup(false);
  };

  const handleCancel = () => {
    setLocalCouncil(councilMembers);
    setLocalSenatorPersona(senatorPersona);
    setLocalSenatorModel(senatorModel);
    setLocalCustom(customPersona);
    setShowSettingsPopup(false);
  };

  const getPersonaName = (personaId: string) => {
    if (personaId === 'custom') return localCustom?.name || 'Custom';
    const persona = personas.find(p => p.id === personaId);
    return persona?.name || personaId;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-elevated rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-surface-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">Council Configuration</h2>

        <div className="mb-4 border border-surface-border rounded-xl overflow-hidden">
          <button
            onClick={() => setCouncilExpanded(!councilExpanded)}
            className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <ChevronIcon expanded={councilExpanded} />
              <span className="font-semibold text-text-primary">
                Council Members ({localCouncil.length}/8)
              </span>
            </div>
            {localCouncil.length < 8 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addMember();
                }}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-glow transition-all"
              >
                + Add
              </button>
            )}
          </button>

          {councilExpanded && (
            <div className="p-4 space-y-3 border-t border-surface-border bg-bg-tertiary">
              {localCouncil.map((member, index) => {
                const greekName = GREEK_LETTERS[index] || `Member ${index + 1}`;
                return (
                  <div key={index} className="p-4 bg-bg-secondary rounded-xl border border-surface-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-text-primary">
                        {greekName}
                      </span>
                      {localCouncil.length > 2 && (
                        <button
                          onClick={() => removeMember(index)}
                          className="text-text-muted hover:text-status-error p-1.5 rounded-lg hover:bg-status-error/10 transition-all"
                          title="Remove member"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-text-muted mb-1.5 font-medium">Persona</label>
                        <PersonaSelect
                          value={member.personaId}
                          onChange={(value) => updateMember(index, 'personaId', value)}
                          personas={personas}
                          customPersona={localCustom}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-text-muted mb-1.5 font-medium">Model</label>
                        <div className="flex gap-2">
                          <select
                            value={member.modelId}
                            onChange={(e) => updateMember(index, 'modelId', e.target.value)}
                            className="flex-1 p-2.5 border border-surface-border rounded-lg bg-bg-primary text-text-primary text-sm focus:outline-none focus:border-primary"
                          >
                            {councilModels.map((m) => (
                              <option key={m.id} value={m.id} style={{background: '#1a1a24', color: '#f4f4f5'}}>{m.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => randomizeCouncilMemberModel(index)}
                            className="px-3 py-2 bg-bg-secondary border border-surface-border rounded-lg text-text-primary text-sm hover:bg-surface transition-all"
                            title="Random model"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-4 border border-surface-border rounded-xl overflow-hidden">
          <button
            onClick={() => setSenatorExpanded(!senatorExpanded)}
            className="w-full flex items-center gap-3 p-4 bg-bg-secondary hover:bg-surface transition-colors"
          >
            <ChevronIcon expanded={senatorExpanded} />
            <span className="font-semibold text-text-primary">Senator</span>
            <span className="text-sm text-text-muted ml-auto">
              {getPersonaName(localSenatorPersona)}
            </span>
          </button>

          {senatorExpanded && (
            <div className="p-4 border-t border-surface-border bg-bg-tertiary space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">Persona</label>
                  <PersonaSelect
                    value={localSenatorPersona}
                    onChange={(value) => setLocalSenatorPersona(value)}
                    personas={senatorPersonaOptions}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">Model</label>
                  <div className="flex gap-2">
                    <select
                      value={localSenatorModel}
                      onChange={(e) => setLocalSenatorModel(e.target.value)}
                      className="flex-1 p-2.5 border border-surface-border rounded-lg bg-bg-primary text-text-primary text-sm focus:outline-none focus:border-primary"
                    >
                      {senatorModels.map((m) => (
                        <option key={m.id} value={m.id} style={{background: '#1a1a24', color: '#f4f4f5'}}>{m.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={randomizeSenatorModel}
                      className="px-3 py-2 bg-bg-secondary border border-surface-border rounded-lg text-text-primary text-sm hover:bg-surface transition-all"
                      title="Random model"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 border border-surface-border rounded-xl overflow-hidden">
          <button
            onClick={() => setCustomExpanded(!customExpanded)}
            className="w-full flex items-center gap-3 p-4 bg-bg-secondary hover:bg-surface transition-colors"
          >
            <ChevronIcon expanded={customExpanded} />
            <span className="font-semibold text-text-primary">Custom Persona</span>
            {localCustom && (
              <span className="text-sm text-text-muted ml-auto">{localCustom.name}</span>
            )}
          </button>

          {customExpanded && (
            <div className="p-4 border-t border-surface-border space-y-4 bg-bg-tertiary">
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">Name</label>
                <input
                  type="text"
                  placeholder="e.g., The Detective"
                  value={localCustom?.name || ''}
                  onChange={(e) =>
                    setLocalCustom({
                      name: e.target.value,
                      description: localCustom?.description || '',
                      temperature: localCustom?.temperature || 0.5,
                      modelId: localCustom?.modelId,
                    })
                  }
                  className="w-full p-2.5 border border-surface-border rounded-lg bg-bg-primary text-text-primary text-sm placeholder:text-text-disabled focus:outline-none focus:border-primary"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">Description</label>
                <textarea
                  placeholder="Describe this persona's personality..."
                  value={localCustom?.description || ''}
                  onChange={(e) =>
                    setLocalCustom({
                      name: localCustom?.name || '',
                      description: e.target.value,
                      temperature: localCustom?.temperature || 0.5,
                      modelId: localCustom?.modelId,
                    })
                  }
                  className="w-full p-2.5 border border-surface-border rounded-lg bg-bg-primary text-text-primary text-sm h-20 resize-none placeholder:text-text-disabled focus:outline-none focus:border-primary"
                  maxLength={500}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">
                    Temperature: {localCustom?.temperature || 0.5}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={localCustom?.temperature || 0.5}
                    onChange={(e) =>
                      setLocalCustom({
                        name: localCustom?.name || '',
                        description: localCustom?.description || '',
                        temperature: parseFloat(e.target.value),
                        modelId: localCustom?.modelId,
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-text-muted mt-1">Low = conservative | High = creative</p>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">Model</label>
                  <div className="flex gap-2">
                    <select
                      value={localCustom?.modelId || 'gpt-4o'}
                      onChange={(e) =>
                        setLocalCustom({
                          name: localCustom?.name || '',
                          description: localCustom?.description || '',
                          temperature: localCustom?.temperature || 0.5,
                          modelId: e.target.value,
                        })
                      }
                      className="flex-1 p-2.5 border border-surface-border rounded-lg bg-bg-primary text-text-primary text-sm focus:outline-none focus:border-primary"
                    >
                      {councilModels.map((m) => (
                        <option key={m.id} value={m.id} style={{background: '#1a1a24', color: '#f4f4f5'}}>{m.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        setLocalCustom({
                          name: localCustom?.name || '',
                          description: localCustom?.description || '',
                          temperature: localCustom?.temperature || 0.5,
                          modelId: getRandomCouncilModel(),
                        })
                      }
                      className="px-3 py-2 bg-bg-secondary border border-surface-border rounded-lg text-text-primary text-sm hover:bg-surface transition-all"
                      title="Random model"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {localCustom?.name && localCustom?.description && (
                <p className="text-xs text-status-success font-medium">
                  Custom persona ready - select it in Council Members above
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 border border-surface-border rounded-xl font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-glow transition-all"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
