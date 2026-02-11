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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-popup rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">Council Configuration</h2>

        <div className="mb-4 border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setCouncilExpanded(!councilExpanded)}
            className="w-full flex items-center justify-between p-4 bg-surface-elevated hover:bg-surface transition-colors"
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
                className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:opacity-90"
              >
                + Add Member
              </button>
            )}
          </button>

          {councilExpanded && (
            <div className="p-4 space-y-3 border-t border-border">
              {localCouncil.map((member, index) => {
                const greekName = GREEK_LETTERS[index] || `Member ${index + 1}`;
                return (
                  <div key={index} className="p-3 bg-surface rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary">
                        Axis {greekName}
                      </span>
                      {localCouncil.length > 2 && (
                        <button
                          onClick={() => removeMember(index)}
                          className="text-text-muted hover:text-error p-1"
                          title="Remove member"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-text-muted mb-1">Persona</label>
                        <PersonaSelect
                          value={member.personaId}
                          onChange={(value) => updateMember(index, 'personaId', value)}
                          personas={personas}
                          customPersona={localCustom}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-text-muted mb-1">Model</label>
                        <div className="flex gap-2">
                          <select
                            value={member.modelId}
                            onChange={(e) => updateMember(index, 'modelId', e.target.value)}
                            className="flex-1 p-2 border border-border rounded bg-surface text-text-primary text-sm"
                          >
                            {councilModels.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => randomizeCouncilMemberModel(index)}
                            className="px-3 py-2 bg-surface-elevated border border-border rounded text-text-primary text-sm hover:bg-surface transition-colors"
                            title="Random model"
                          >
                            🎲
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

        <div className="mb-4 border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setSenatorExpanded(!senatorExpanded)}
            className="w-full flex items-center gap-3 p-4 bg-surface-elevated hover:bg-surface transition-colors"
          >
            <ChevronIcon expanded={senatorExpanded} />
            <span className="font-semibold text-text-primary">Senator</span>
            <span className="text-sm text-text-muted ml-auto">
              {getPersonaName(localSenatorPersona)}
            </span>
          </button>

          {senatorExpanded && (
            <div className="p-4 border-t border-border">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-text-muted mb-1">Persona</label>
                  <PersonaSelect
                    value={localSenatorPersona}
                    onChange={(value) => setLocalSenatorPersona(value)}
                    personas={senatorPersonaOptions}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-text-muted mb-1">Model</label>
                  <div className="flex gap-2">
                    <select
                      value={localSenatorModel}
                      onChange={(e) => setLocalSenatorModel(e.target.value)}
                      className="flex-1 p-2 border border-border rounded bg-surface text-text-primary text-sm"
                    >
                      {senatorModels.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={randomizeSenatorModel}
                      className="px-3 py-2 bg-surface-elevated border border-border rounded text-text-primary text-sm hover:bg-surface transition-colors"
                      title="Random model"
                    >
                      🎲
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setCustomExpanded(!customExpanded)}
            className="w-full flex items-center gap-3 p-4 bg-surface-elevated hover:bg-surface transition-colors"
          >
            <ChevronIcon expanded={customExpanded} />
            <span className="font-semibold text-text-primary">Custom Persona</span>
            {localCustom && (
              <span className="text-sm text-text-muted ml-auto">{localCustom.name}</span>
            )}
          </button>

          {customExpanded && (
            <div className="p-4 border-t border-border space-y-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g., The Detective - Investigates claims methodically"
                  value={localCustom?.name || ''}
                  onChange={(e) =>
                    setLocalCustom({
                      name: e.target.value,
                      description: localCustom?.description || '',
                      temperature: localCustom?.temperature || 0.5,
                      modelId: localCustom?.modelId,
                    })
                  }
                  className="w-full p-2 border border-border rounded bg-surface text-text-primary text-sm"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Description</label>
                <textarea
                  placeholder="Describe this persona's personality, style, and approach..."
                  value={localCustom?.description || ''}
                  onChange={(e) =>
                    setLocalCustom({
                      name: localCustom?.name || '',
                      description: e.target.value,
                      temperature: localCustom?.temperature || 0.5,
                      modelId: localCustom?.modelId,
                    })
                  }
                  className="w-full p-2 border border-border rounded bg-surface text-text-primary text-sm h-20"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-text-muted mb-1">
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
                    className="w-full"
                  />
                  <p className="text-xs text-text-muted mt-1">Low = conservative | High = creative</p>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-text-muted mb-1">Model</label>
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
                      className="flex-1 p-2 border border-border rounded bg-surface text-text-primary text-sm"
                    >
                      {councilModels.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
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
                      className="px-3 py-2 bg-surface-elevated border border-border rounded text-text-primary text-sm hover:bg-surface transition-colors"
                      title="Random model"
                    >
                      🎲
                    </button>
                  </div>
                </div>
              </div>
              {localCustom?.name && localCustom?.description && (
                <p className="text-xs text-success">
                  Custom persona ready - select it in Council Members above
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-border rounded-lg font-medium text-text-muted hover:text-text-primary hover:bg-surface-elevated"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
