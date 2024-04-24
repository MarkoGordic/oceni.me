import React, { useState, useEffect } from "react";
import './welcome.css';

function Welcome() {
    const fullText = [
        "Ja sam neko sasvim običan, manje bitan...",
        "Samo jedna mala duša na ovome svetu...",
        "Ali opet, ja sam neko, ko je ceo svoj svet",
        "video u tebi...",
        "💙"
    ];

    const [currentLine, setCurrentLine] = useState(0);
    const [linesToShow, setLinesToShow] = useState([]);
    const [showTab, setShowTab] = useState(false);
    const [fadeClass, setFadeClass] = useState("fade-in");

    useEffect(() => {
        const timer = setInterval(() => {
            if (currentLine < fullText.length) {
                setLinesToShow(prevLines => [...prevLines, fullText[currentLine]]);
                setCurrentLine(currentLine + 1);
            } else {
                clearInterval(timer);
                setTimeout(() => {
                    setFadeClass("fade-out");
                    setTimeout(() => {
                        setShowTab(true);
                        setFadeClass("fade-in");
                    }, 1000);
                }, 5000);
            }
        }, 3000);

        return () => clearInterval(timer);
    }, [currentLine]);

    if (showTab) {
        return (
            <div className={`other-tab ${fadeClass}`}>
                <div className="welcome-app">OCENI.ME</div>
                <div className="welcome-loader"></div>
            </div>
        );
    }

    return (
        <div className={`welcome-wrap ${fadeClass}`}>
            <div className="welcome-content">
                {linesToShow.map((line, index) => (
                    <div key={index} className="welcome-quote" style={{ animation: 'slideIn 0.5s ease forwards' }}>
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Welcome;
