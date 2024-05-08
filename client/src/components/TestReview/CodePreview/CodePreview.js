import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MonacoEditor from 'react-monaco-editor';
import { toast } from 'react-toastify';
import hljs from 'highlight.js/lib/core';
import x86asm from 'highlight.js/lib/languages/x86asm';
import c from 'highlight.js/lib/languages/c';
import shell from 'highlight.js/lib/languages/shell';
import 'highlight.js/styles/github.css';
import './codePreview.css';

hljs.registerLanguage('x86asm', x86asm);
hljs.registerLanguage('c', c);
hljs.registerLanguage('shell', shell);

const CodePreview = ({ taskNo, testNo, pc, lineNumber, debbugFile, setBreakpoints, isVariationModeActive, selectedVariationID, hasPendingChanges, setHasPendingChanges, codeText, setCodeText, selectedFile, setSelectedFile, pendingAction, setPendingAction, saveFileChanges, requestAction, confirmDiscardChanges, setConfirmDiscardChanges, mode, setMode, selectFile, showContent, setShowContent, showConfirmDialog, setShowConfirmDialog, pendingFileContent }) => {
    const { testid } = useParams();
    const [highlightedCode, setHighlightedCode] = useState(null);
    const [breakpoints, setLocalBreakpoints] = useState([]);
    const [taskFiles, setTaskFiles] = useState(null);
    const [containerHeight, setContainerHeight] = useState('100%');
    const editorRef = useRef(null)

    useEffect(() => {
        setSelectedFile(null);
        setTaskFiles(null);
        setHighlightedCode(null);
        setCodeText('');
        setMode('view');
    }, [isVariationModeActive]);

    useEffect(() => {
        setSelectedFile(null);
        setCodeText('');
        setHighlightedCode(null);
        setMode('view');
    }, [taskNo, testNo]);

    useEffect(() => {
        if (selectedFile) {
            selectFile(selectedFile);
        }
    }, [selectedFile]);

    const handleResize = () => {
      if (editorRef.current) {
        const parentHeight = editorRef.current.offsetHeight;
        setContainerHeight(parentHeight + 'px');
      }
    };
    
    useEffect(() => {
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDiscardChanges = () => {
        setHasPendingChanges(false);
        setConfirmDiscardChanges(false);
        selectFile(selectedFile);
    }

    const handleSaveChanges = () => {
        saveFileChanges();
        setHasPendingChanges(false);
        setConfirmDiscardChanges(false);
    }

    function updateMode(mode) {
        if (!isVariationModeActive && mode === 'edit') {
            toast.info("Režim izmene koda je trenutno onemogućen.");
            return;
        } else if (!selectedFile && mode === 'edit') {
            toast.info("Morate odabrati fajl pre nego što pređete u režim izmene koda.");
            return;
        } else
            requestAction({"type": "mode", "action": mode});
    }

    async function fetchTaskFiles() {
        try {
            const endpoint = isVariationModeActive && selectedVariationID
                ? `http://localhost:8000/review/edits/getfiles`
                : `http://localhost:8000/review/files/${testid}/${pc}/${taskNo}`;
    
            const response = await fetch(endpoint, {
                credentials: 'include',
                method: isVariationModeActive ? "POST" : "GET",
                headers: isVariationModeActive ? { "Content-Type": "application/json" } : undefined,
                body: isVariationModeActive ? JSON.stringify({ testId: testid, pc, taskNo, variationId: selectedVariationID }) : undefined
            });
    
            if (!response.ok) {
                toast.error("Došlo je do greške prilikom učitavanja fajlova.");
                return;
            }
    
            const data = await response.json();
            setTaskFiles(data || []);
        } catch (error) {
            console.error("Error fetching task files:", error);
            toast.error("Došlo je do greške prilikom učitavanja fajlova.");
        }
    }
    

    useEffect(() => {
        if (taskNo === null || pc === null) return;

        const initializeFiles = async () => {
            await fetchTaskFiles();
        };

        if (!isVariationModeActive || (isVariationModeActive && selectedVariationID !== null))
            initializeFiles();
    }, [taskNo, pc, testid, isVariationModeActive, selectedVariationID]);

    const getLanguageByExtension = (fileName) => {
        const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        switch (extension) {
            case 'c': return 'c';
            case 'S': return 'x86asm';
            case 'sh': return 'shell';
            default: return 'plaintext';
        }
    };

    const getMonacoMode = (fileName) => {
        const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        switch (extension) {
            case 'c': return 'c';
            case 'S': return 'assembly';
            case 'sh': return 'shell';
            default: return 'plaintext';
        }
    };

    useEffect(() => {
        if (!codeText || !selectedFile || !showContent) return;
        console.log("Highlighting code for file:", selectedFile);
        const fileName = selectedFile;
        const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        const allowedExtensions = ['c', 'S', 'sh'];

        if (!allowedExtensions.includes(extension)){
            setHighlightedCode(<div className="code-preview-blocked"><i class="fi fi-sr-cross-circle"></i><p>Nije moguće prikazati ovaj tip fajla.</p></div>);
            return;
        }

        const language = getLanguageByExtension(selectedFile);
        const highlighted = hljs.highlight(codeText, { language }).value;
        const lines = highlighted.split('\n').map((line, index) => {
            const currentLineNumber = index + 1;
            const isBreakpointSet = breakpoints[selectedFile]?.includes(currentLineNumber);

            return (
                <div className={`code-line ${currentLineNumber === lineNumber && selectedFile === debbugFile ? "highlighted-line" : ""} ${isBreakpointSet ? "breakpoint-set" : ""}`} key={index}>
                    <div className={`breakpoint-button ${isBreakpointSet ? "active-breakpoint" : ""}`}
                        onClick={() => toggleBreakpoint(currentLineNumber)}>
                    </div>
                    <span className="line-number">{currentLineNumber}</span>
                    {currentLineNumber === lineNumber && selectedFile === debbugFile && <div className="line-arrow"><i className="fi fi-br-arrow-right"></i></div>}
                    <span className="code-content" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                </div>
            );
        });
        setHighlightedCode(lines);
    }, [codeText, selectedFile, lineNumber, breakpoints, showContent]);

    const isBreakpointAllowed = (fileName) => {
        const allowedExtensions = ['.c', '.S'];
        const extension = fileName.substring(fileName.lastIndexOf('.'));
        return allowedExtensions.includes(extension);
    };

    const toggleBreakpoint = (lineNumber) => {
        if (!isBreakpointAllowed(selectedFile)) {
            toast.info("Nije dozvoljeno postaviti breakpoint u ovom fajlu.");
            return;
        }

        const fileBreakpoints = breakpoints[selectedFile] || [];
        const newBreakpoints = fileBreakpoints.includes(lineNumber)
            ? fileBreakpoints.filter(line => line !== lineNumber)
            : [...fileBreakpoints, lineNumber];

        setLocalBreakpoints({
            ...breakpoints,
            [selectedFile]: newBreakpoints
        });
    };

    useEffect(() => {
        setBreakpoints(breakpoints[selectedFile] || []);
    }, [breakpoints, selectedFile, setBreakpoints]);

    return (
        <div className="code-preview">
            {isVariationModeActive && !selectedVariationID ? (
                <div className="variation-select-message">
                    <p>Pregled koda je trenutno onemogućen.</p>
                    <p>Morate odabrati željenu varijaciju ili isključiti režim varijacija kako bi videli kod.</p>
                </div>
            ) : (
                <>
                    {showConfirmDialog && (
                        <div className='confirmation-dialog-overlay'>
                            <div className="confirmation-dialog">
                                <p>Ovaj fajl sadrži izraze koji mogu biti uvredljivi nekim korisnicima. Da li ste sigurni da želite da ga prikažete?</p>
                                <button onClick={() => {
                                    setCodeText(pendingFileContent);
                                    setShowContent(true);
                                    setShowConfirmDialog(false);
                                }}>PRIKAŽI FAJL</button>
                                <button onClick={() => {
                                    setShowConfirmDialog(false);
                                    setShowContent(false);
                                    setHighlightedCode(<div className="code-preview-blocked"><i class="fi fi-sr-cross-circle"></i><p>Fajl sadrži neprimerene izraze i neće biti prikazan.</p></div>);
                                }}>OTKAŽI</button>
                            </div>
                        </div>
                    )}
                    
                    {confirmDiscardChanges && (
                        <div className='confirmation-dialog-overlay'>
                            <div className="confirmation-dialog">
                                <p>Detektovane su promene koje nisu sačuvane. Da li želite da sačuvate ili odbacite promene?</p>
                                <button onClick={handleSaveChanges}>SAČUVAJ PROMENE</button>
                                <button onClick={handleDiscardChanges}>ODBACI PROMENE</button>
                            </div>
                        </div>
                    )}

                    <pre className="code-preview-code">
                        <div className='code-preview-files'>
                            {taskFiles && taskFiles.map((file, index) => (
                                <div key={index}
                                    className={`code-preview-file ${file === selectedFile ? 'selected-file' : ''}`}
                                    onClick={() => requestAction({"type": "file", "action": file})}>
                                    {file}
                                </div>
                            ))}
                        </div>
                        <div className='code-preview-code-lines' ref={editorRef}>
                            {mode === 'edit' ? (
                                <MonacoEditor
                                    language={getMonacoMode(selectedFile)}
                                    theme="vs-dark"
                                    value={codeText}
                                    onChange={(newCode) => {setCodeText(newCode); setHasPendingChanges(true);}}
                                    options={{ selectOnLineNumbers: true }}
                                    width="100%"
                                    height={containerHeight}
                                />
                            ) : (
                                <>{highlightedCode}</>
                            )}
                        </div>
                        <div className='code-preview-mode-select'>
                            <button className={mode === 'view' ? 'code-preview-mode-active' : ''} onClick={() => updateMode('view')}>
                                REŽIM GLEDANJA
                            </button>
                            <button className={mode === 'edit' ? 'code-preview-mode-active' : ''} onClick={() => updateMode('edit')}>
                                REŽIM IZMENE KODA
                            </button>
                        </div>
                    </pre>
                </>
            )}
        </div>
    );
}

export default CodePreview;