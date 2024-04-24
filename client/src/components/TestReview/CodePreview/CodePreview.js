import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import hljs from 'highlight.js/lib/core';
import x86asm from 'highlight.js/lib/languages/x86asm';
import 'highlight.js/styles/github.css';
import './codePreview.css';

hljs.registerLanguage('x86asm', x86asm);

const CodePreview = ({ taskNo, pc }) => {
    const { testid } = useParams();
    const [code, setCode] = useState('');

    useEffect(() => {
        if (taskNo === null || pc === null) return;

        const fetchCode = async () => {
            try {
                const response = await fetch(`http://localhost:8000/review/code/${testid}/${pc}/${taskNo}`, {
                    credentials: 'include',
                });
                const text = await response.text();
                const highlighted = hljs.highlight(text, { language: 'x86asm' }).value;
                const lines = highlighted.split('\n').map((line, index) => {
                    const lineNumber = index + 1;
                    const isSyntaxOnly = line.trim().startsWith('<span class="hljs');
                    const isEmpty = line.trim() === '';
                    
                    return (
                        <div className="code-line" key={index}>
                            <span className="line-number">{lineNumber}</span>
                            {!isSyntaxOnly && !isEmpty && <div className="breakpoint-button"></div>}
                            <span className="code-content" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                        </div>
                    );
                });
                setCode(lines);
            } catch (error) {
                toast.error("Došlo je do greške prilikom učitavanja koda.");
            }
        };

        fetchCode();
    }, [taskNo, pc, testid]);

    return (
        <div className="code-preview">
            <pre className="code-preview-code">
                {code}
            </pre>
        </div>
    );
}

export default CodePreview;
