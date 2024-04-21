import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './codePreview.css';
import { toast } from 'react-toastify';

const CodePreview = () => {
    const { id, testid, studentId } = useParams();
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const response = await fetch('http://localhost:8000/review/' + id + '/' + testid + '/' + studentId + '/code');
                const text = await response.text();
                const lines = text.split('\n');
                setLines(lines);
            } catch (error) {
                toast.error("Došlo je do greške prilikom učitavanja koda.")
            }
        };

        fetchCode();
    }, []);

    return (
        <div className="code-preview">
            <pre className='code-preview-code'><code class="language-assembly">
                {lines.map((line, index) => (
                    <p key={index} className="language-assembly">{line}</p>
                ))}
            </code></pre>
        </div>
    );
}

export default CodePreview;