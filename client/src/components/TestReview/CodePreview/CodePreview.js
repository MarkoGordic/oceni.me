import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

const CodePreview = ({ taskNo, testNo, pc, lineNumber, debbugFile, setBreakpoints }) => {
    const { testid } = useParams();
    const [codeText, setCodeText] = useState('');
    const [highlightedCode, setHighlightedCode] = useState(null);
    const [breakpoints, setLocalBreakpoints] = useState([]);
    const [taskFiles, setTaskFiles] = React.useState(null);
    const [selectedFile, setSelectedFile] = React.useState(null);

    useEffect(() => {
        console.log(taskFiles);
    }, [taskFiles]);

    async function fetchTaskFiles() {
        try {
            const response = await fetch(`http://localhost:8000/review/files/${testid}/${pc}/${taskNo}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                toast.error("Došlo je do greške prilikom učitavanja fajlova.");
            }
            const data = await response.json();
            setTaskFiles(data);
        } catch (error) {
            console.error("Error fetching task files:", error);
            toast.error("Došlo je do greške prilikom učitavanja fajlova.");
        }
    }

    const selectFile = async (fileName) => {
        setSelectedFile(fileName);
        try {
            const response = await fetch(`http://localhost:8000/review/code/${testid}/${pc}/${taskNo}/${fileName}`, {
                credentials: 'include',
            });
            const text = await response.text();
            setCodeText(text);
        } catch (error) {
            console.error("Error fetching code for file:", error);
            toast.error("Došlo je do greške prilikom učitavanja koda.");
        }
    };    

    useEffect(() => {
        if (taskNo === null || pc === null) return;
    
        const initializeFiles = async () => {
            await fetchTaskFiles();
        };
    
        initializeFiles();
    }, [taskNo, pc, testid]);

    useEffect(() => {
        if (taskNo === null || pc === null || !selectedFile) return;
    
        const fileName = selectedFile;
        const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        const allowedExtensions = ['c', 'S', 'sh'];
        if (!allowedExtensions.includes(extension)){
            setHighlightedCode(<div className="code-preview-blocked"><i class="fi fi-sr-cross-circle"></i><p>Nije moguće prikazati ovaj tip fajla.</p></div>);
            return;
        }

        console.log("Selected file PASS:", selectedFile);
        selectFile(selectedFile);
    }, [taskNo, pc, testid, selectedFile]);

    const getLanguageByExtension = (fileName) => {
        const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        switch(extension) {
            case 'c': return 'c';
            case 'S': return 'x86asm';
            case 'sh': return 'shell';
            default: return 'plaintext';
        }
    };

    useEffect(() => {
        if (!codeText || !selectedFile) return;
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
                    <span className="line-number">{currentLineNumber}</span>
                    <div className={`breakpoint-button ${isBreakpointSet ? "active-breakpoint" : ""}`}
                         onClick={() => toggleBreakpoint(currentLineNumber)}>
                    </div>
                    {currentLineNumber === lineNumber && selectedFile === debbugFile && <div className="line-arrow"><i className="fi fi-br-arrow-right"></i></div>}
                    <span className="code-content" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                </div>
            );
        });
        setHighlightedCode(lines);
    }, [codeText, selectedFile, lineNumber, breakpoints]);    

    const isBreakpointAllowed = (fileName) => {
        const allowedExtensions = ['.c', '.S'];
        const extension = fileName.substring(fileName.lastIndexOf('.'));
        return allowedExtensions.includes(extension);
    };

    const toggleBreakpoint = (lineNumber) => {
        if (!isBreakpointAllowed(selectedFile)) {
            toast.info("Nije dozvoljeno postaviti breakpoint u ovom fajlu.")
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
        console.log("Breakpoints for files:", breakpoints);
        setBreakpoints(breakpoints[selectedFile] || []);
    }, [breakpoints, selectedFile, setBreakpoints]);

    return (
        <div className="code-preview">
            <pre className="code-preview-code">
                <div className='code-preview-files'>
                    {taskFiles && taskFiles.map((file, index) => (
                        <div key={index}
                            className={`code-preview-file ${file === selectedFile ? 'selected-file' : ''}`}
                            onClick={() => setSelectedFile(file)}>
                            {file}
                        </div>
                    ))}
                </div>

                {highlightedCode}
            </pre>
        </div>
    );
}

export default CodePreview;
