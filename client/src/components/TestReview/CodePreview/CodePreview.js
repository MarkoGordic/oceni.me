import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import hljs from 'highlight.js/lib/core';
import x86asm from 'highlight.js/lib/languages/x86asm';
import 'highlight.js/styles/github.css';
import './codePreview.css';

hljs.registerLanguage('x86asm', x86asm);

const CodePreview = ({ taskNo, pc, lineNumber }) => {
    const { testid } = useParams();
    const [codeText, setCodeText] = useState('');
    const [highlightedCode, setHighlightedCode] = useState(null);

    useEffect(() => {
        if (taskNo === null || pc === null) return;

        const fetchCode = async () => {
            try {
                const response = await fetch(`http://localhost:8000/review/code/${testid}/${pc}/${taskNo}`, {
                    credentials: 'include',
                });
                const text = await response.text();
                setCodeText(text);
            } catch (error) {
                toast.error("Došlo je do greške prilikom učitavanja koda.");
            }
        };

        fetchCode();
    }, [taskNo, pc, testid]);

    useEffect(() => {
        if (!codeText) return;

        const highlighted = hljs.highlight(codeText, { language: 'x86asm' }).value;
        const lines = highlighted.split('\n').map((line, index) => {
            const currentLineNumber = index + 1;
            const isSyntaxOnly = line.trim().startsWith('<span class="hljs');
            const isEmpty = line.trim() === '';

            return (
                <div className={`code-line ${currentLineNumber === lineNumber ? "highlighted-line" : ""}`} key={index}>
                    <span className="line-number">{currentLineNumber}</span>
                    {!isSyntaxOnly && !isEmpty && <div className="breakpoint-button"></div>}
                    {currentLineNumber === lineNumber && <div className="line-arrow"></div>}
                    <span className="code-content" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                </div>
            );
        });
        setHighlightedCode(lines);
    }, [codeText, lineNumber]);

    return (
        <div className="code-preview">
            <pre className="code-preview-code">
                {highlightedCode}
            </pre>
        </div>
    );
}

export default CodePreview;
