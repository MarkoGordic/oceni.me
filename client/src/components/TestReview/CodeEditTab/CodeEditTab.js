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

const CodeEditTab = ({ testId, taskNo, testNo, pc, setIsVariationModeActive, setVariationName, hasPendingChanges, saveFileChanges }) => {
    const [isActivated, setIsActivated] = useState(false);
    const [variationNames, setvariationNames] = useState([]);
    const [newVariationName, setnewVariationName] = useState('');
    const [selectedVariation, setselectedVariation] = useState('');

    const setVariationActive = (status) => {
        setIsVariationModeActive(status);
        setIsActivated(status);
    }

    const setVariation = (variationName) => {
        setVariationName(variationName);
        setselectedVariation(variationName);
    }

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
                    toast.error("Došlo je do greške prilikom dobijanja imena varijacija.");
                    return;
                }

                const data = await response.json();
                setvariationNames(data.variations || []);
            } catch (error) {
                console.error('Error fetching varijation names:', error);
                toast.error('Došlo je do greške prilikom dobijanja imena varijacija.');
                setvariationNames([]);
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
                body: JSON.stringify({ testId, taskNo, pc, varijationName: newVariationName }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || "Došlo je do greške prilikom kreiranja nove varijacije.");
                return;
            }

            setvariationNames(prev => [...prev, newVariationName]);
            setnewVariationName('');
            toast.success(`Varijacija "${newVariationName}" je uspešno kreirana.`);
        } catch (error) {
            console.error('Error creating varijation:', error);
            toast.error('Došlo je do serverske greške prilikom kreiranja nove varijacije.');
        }
    };

    const handleDeleteVarijation = async () => {
        if (!selectedVariation) {
            toast.error("Morate izabrati varijaciju za brisanje.");
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8000/review/edits/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId, taskNo, pc, varijationName: selectedVariation }),
                credentials: 'include'
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || "Došlo je do greške prilikom brisanja varijacije.");
                return;
            }
    
            setvariationNames(prev => prev.filter(name => name !== selectedVariation));
            setselectedVariation('');
            toast.success(`Varijacija "${selectedVariation}" je uspešno obrisana.`);
        } catch (error) {
            console.error('Error deleting varijation:', error);
            toast.error('Došlo je do serverske greške prilikom brisanja varijacije.');
        }
    };    

    const areTasksSelected = taskNo && testNo;

    const selectOptions = variationNames.map(name => ({ value: name, label: name }));

    return (
        <div className="code-edit-tab">
            {areTasksSelected ? (
                isActivated ? (
                    <>
                        <div className="code-edit-tab-row">
                            <div className="select-container">
                                <Select
                                    value={selectOptions.find(option => option.value === selectedVariation)}
                                    onChange={option => setVariation(option ? option.value : '')}
                                    options={selectOptions}
                                    placeholder="-- Izaberite varijaciju --"
                                    styles={customSelectStyles}
                                />
                            </div>

                            <div className="new-variation">
                                <input
                                    type="text"
                                    value={newVariationName}
                                    onChange={e => setnewVariationName(e.target.value)}
                                    placeholder="Unesite ime nove varijacije"
                                    className="new-variation-input"
                                />  
                            </div>
                        </div>

                        <div className="code-edit-tab-row">
                            <button className="code-edit-delete-btn" onClick={handleDeleteVarijation}>
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
                            {hasPendingChanges ? <p className="code-edit-pending-changes">DETEKTOVANE SU NESAČUVANE PROMENE!</p> : <p className="code-edit-no-changes">NEMA PROMENA</p> }
                            <button className="code-edit-save-btn" onClick={() => {saveFileChanges();}}>
                                <i className="fi fi-rr-save"></i> SAČUVAJ PROMENE
                            </button>
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
