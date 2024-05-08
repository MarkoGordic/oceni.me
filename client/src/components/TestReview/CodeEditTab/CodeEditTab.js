import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import Select from 'react-select';
import "./codeEditTab.css";

const customSelectStyles = {
    control: (styles, { isFocused }) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        borderColor: isFocused ? '#1993F0' : 'white',
        color: '#F7F7FF',
        width: '300px',
        minHeight: '40px',
        '&:hover': { borderColor: '#1993F0' },
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    }),
    menu: (styles) => ({
        ...styles,
        backgroundColor: '#1C1B1B',
        color: '#F7F7FF',
        width: 300,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.25)',
    }),
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        backgroundColor: isSelected ? '#1993F0' : isFocused ? '#2C2B2B' : undefined,
        color: isSelected ? '#F7F7FF' : '#F7F7FF',
        '&:active': { backgroundColor: '#1993F0' },
    }),
    singleValue: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        color: '#F7F7FF',
        '&:hover': { color: '#F7F7FF' },
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        backgroundColor: '#1993F0',
    }),
    placeholder: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
    input: (styles) => ({
        ...styles,
        color: '#F7F7FF',
    }),
};

const CodeEditTab = ({ testId, taskNo, testNo, pc, setIsVariationModeActive, setVariationName, hasPendingChanges, saveFileChanges, selectedVariationId, setSelectedVariationId }) => {
    const [isActivated, setIsActivated] = useState(false);
    const [variations, setVariations] = useState([]);
    const [newVariationName, setNewVariationName] = useState('');
    const [dockerStatus, setDockerStatus] = useState('SPREMAN');
    const [results, setResults] = useState([]);

    const setVariationActive = (status) => {
        setIsVariationModeActive(status);
        setIsActivated(status);
    };

    const setVariation = (variationId, variationName) => {
        setVariationName(variationName);
        setSelectedVariationId(variationId);
    };

    const getStatusClass = () => {
        switch (dockerStatus) {
            case 'TESTIRANJE':
                return "TESTIRANJE";
            case 'PRIPREMLJEN':
                return "PRIPREMLJEN";
            case 'AT OCENJEN':
                return "AT_OCENJEN";
            case 'OCENJEN':
                return "OCENJEN";
            default:
                return "";
        }
    };

    useEffect(() => {
        if (!taskNo || !testNo) {
            return;
        }

        const fetchVariations = async () => {
            try {
                const response = await fetch('http://localhost:8000/review/edits/get', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ testId, taskNo, pc }),
                    credentials: 'include'
                });

                if (!response.ok) {
                    toast.error("Došlo je do greške prilikom dobijanja varijacija.");
                    return;
                }

                const data = await response.json();
                setVariations(data.variations || []);
            } catch (error) {
                console.error('Error fetching variations:', error);
                toast.error('Došlo je do greške prilikom dobijanja varijacija.');
                setVariations([]);
            }
        };

        fetchVariations();
    }, [testId, taskNo, testNo, pc]);

    const handleCreateNewVariation = async () => {
        if (!newVariationName) {
            toast.error('Morate uneti ime nove varijacije.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/review/edits/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId, taskNo, pc, variationName: newVariationName }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || "Došlo je do greške prilikom kreiranja nove varijacije.");
                return;
            }

            const { variationId } = await response.json();
            setVariations(prev => [...prev, { id: variationId, name: newVariationName }]);
            setNewVariationName('');
            toast.success(`Varijacija "${newVariationName}" je uspešno kreirana.`);
        } catch (error) {
            console.error('Error creating variation:', error);
            toast.error('Došlo je do serverske greške prilikom kreiranja nove varijacije.');
        }
    };

    const handleDeleteVariation = async () => {
        if (!selectedVariationId) {
            toast.error("Morate izabrati varijaciju za brisanje.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/review/edits/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variationId: selectedVariationId, pc }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || "Došlo je do greške prilikom brisanja varijacije.");
                return;
            }

            setVariations(prev => prev.filter(variation => variation.id !== selectedVariationId));
            setSelectedVariationId(null);
            toast.success("Varijacija je uspešno obrisana.");
        } catch (error) {
            console.error('Error deleting variation:', error);
            toast.error('Došlo je do serverske greške prilikom brisanja varijacije.');
        }
    };

    const handleStartTesting = async () => {
        if (!selectedVariationId) {
          toast.error("Morate izabrati varijaciju za testiranje.");
          return;
        }
    
        setResults([]);

        try {
          const response = await fetch('http://localhost:8000/autotest/run/variation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variationId: selectedVariationId, testId, pc }),
            credentials: 'include'
          });
    
          if (!response.ok) {
            if(response.status === 409) {
                toast.error("Testiranje je već u toku.");
            } else {
                toast.error("Došlo je do greške prilikom pokretanja testiranja.");
            }
            return;
          }
    
          toast.success('Testiranje je uspešno započeto.');
          setDockerStatus('TESTIRANJE');
        } catch (error) {
          console.error('Error starting testing:', error);
          toast.error('Došlo je do serverske greške prilikom pokretanja testiranja.');
        }
    };

    const handleRefreshStatus = async () => {
        if (!selectedVariationId) {
          toast.error("Morate izabrati varijaciju za osvežavanje statusa.");
          return;
        }
      
        try {
          const response = await fetch('http://localhost:8000/autotest/progress/variation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variationId: selectedVariationId, testId }),
            credentials: 'include'
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.error || "Došlo je do greške prilikom osvežavanja statusa.");
            return;
          }
      
          const progressData = await response.json();

          if (progressData != null) {
            setDockerStatus(progressData.status);
            toast.success("Status osvežen.");
          } else {
            setDockerStatus('SPREMAN');
            toast.info("Testiranje nije u toku ili nema rezultata za ovu varijaciju.");
          }
        } catch (error) {
          console.error('Error refreshing variation progress:', error);
          toast.error("Došlo je do serverske greške prilikom osvežavanja statusa.");
        }
      };

    const fetchVariationResults = async () => {
        if (!selectedVariationId) {
        toast.error("Morate izabrati varijaciju za prikaz rezultata.");
        return;
        }

        try {
        const response = await fetch('http://localhost:8000/review/edits/get_variation_results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variationId: selectedVariationId }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.error || "Došlo je do greške prilikom preuzimanja rezultata.");
            return;
        }

        const data = await response.json();
        setResults(JSON.parse(data.results) || []);
        } catch (error) {
        console.error("Error fetching variation results:", error);
        toast.error("Došlo je do serverske greške prilikom preuzimanja rezultata.");
        }
    };

    const areTasksSelected = taskNo && testNo;

    const selectOptions = variations.map(({ id, name }) => ({ value: id, label: name }));

    return (
        <div className="code-edit-tab">
            {areTasksSelected ? (
                isActivated ? (
                    <>
                        <div className="code-edit-tab-row">
                            <div className="select-container">
                                <Select
                                    value={selectOptions.find(option => option.value === selectedVariationId)}
                                    onChange={option => {
                                        const selected = variations.find(variation => variation.id === option.value);
                                        setVariation(option.value, selected.name);
                                    }}
                                    options={selectOptions}
                                    placeholder="-- Izaberite varijaciju --"
                                    styles={customSelectStyles}
                                />
                            </div>

                            <div className="new-variation">
                                <input
                                    type="text"
                                    value={newVariationName}
                                    onChange={e => setNewVariationName(e.target.value)}
                                    placeholder="Unesite ime nove varijacije"
                                    className="new-variation-input"
                                />
                            </div>
                        </div>

                        <div className="code-edit-tab-row">
                            <button className="code-edit-delete-btn" onClick={handleDeleteVariation}>
                                <i className="fi fi-rr-trash"></i> OBRIŠI VARIJACIJU
                            </button>

                            <button className="code-edit-deactivate-button" onClick={() => setVariationActive(false)}>
                                <i className="fi fi-br-stop-circle"></i> DEAKTIVIRAJ
                            </button>

                            <button className="code-edit-new-btn" onClick={handleCreateNewVariation}>
                                <i className="fi fi-rs-add"></i> DODAJ NOVU VARIJACIJU
                            </button>
                        </div>

                        <div className="code-edit-tab-row">
                            {hasPendingChanges ? <p className="code-edit-pending-changes">DETEKTOVANE SU NESAČUVANE PROMENE!</p> : <p className="code-edit-no-changes">NEMA PROMENA</p>}
                            <button className="code-edit-save-btn" onClick={() => saveFileChanges()}>
                                <i className="fi fi-rr-save"></i> SAČUVAJ PROMENE
                            </button>
                        </div>

                        <div className="code-edit-tab-row">
                            <p className={`code-edit-docker-status ${getStatusClass()}`}>STATUS: {dockerStatus}</p>
                            
                            <div className="code-edit-docker-buttons">
                                <button className="code-edit-save-btn" onClick={handleStartTesting}>ZAPOČNI TESTIRANJE</button>
                                <button className="code-edit-save-btn" onClick={() => { handleRefreshStatus(); fetchVariationResults(); }}>OSVEŽI STATUS</button>
                            </div>
                        </div>

                        <div className="code-edit-tab-row">
                            <div className="code-edit-results">
                                {Object.keys(results).length > 0 ? (
                                    Object.keys(results).sort().map((key, index) => {
                                        const result = results[key];
                                        return (
                                            <div className="code-edit-single-result" key={index}>
                                                {key}: {result}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>Nema rezultata za prikaz.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <button className="code-edit-activate-button" onClick={() => setVariationActive(true)}>
                        <i className="fi fi-rs-add"></i> AKTIVIRAJ
                    </button>
                )
            ) : (
                <p>Molimo vas da prvo izaberete zadatak i primer testiranja.</p>
            )}
        </div>
    );
};

export default CodeEditTab;
