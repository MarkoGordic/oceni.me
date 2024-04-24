import React, { useEffect, useState } from "react";
import "./codeSelectorInfo.css";

function CodeSelectorInfo({ testData, codeTask, codeTest, grading }) {
    const [maxPoints, setMaxPoints] = useState(0);
    const [currentPoints, setCurrentPoints] = useState(0);

    useEffect(() => {
        if (testData && codeTask !== null && codeTest !== null) {
            const tasks = JSON.parse(testData.tasks);
            const task = tasks['z' + codeTask];
            setMaxPoints(task[codeTest]);
        }

        if(grading !== null && grading !== undefined && codeTask !== null && codeTest !== null){
            console.log(grading, codeTask, codeTest);
            const gradings = JSON.parse(grading.gradings);
            setCurrentPoints(gradings['z' + codeTask][codeTest] || 0)
        }
    }, [codeTask, grading, codeTest, codeTask]);

    const savePoints = () => {
        console.log('Points saved:', currentPoints);
    };

    return (
        <div className="code-selector-info">
            <div className="code-selector-info-task">
                <p style={{marginRight: "auto"}}>ODABRANO : {'Z' + (codeTask || "?")} / {codeTest || "NA"}</p>
                <input
                        type="number"
                        value={currentPoints}
                        onChange={(e) => setCurrentPoints(Number(e.target.value))}
                        min="0"
                        max={maxPoints}
                        className="code-selector-info-input"
                    />
                <p className="code-selector-info-delim">/</p>
                <input
                        type="number"
                        value={maxPoints || 0}
                        readOnly
                        className="code-selector-info-input"
                    />
                <button className="code-selector-info-save" onClick={savePoints}>SAČUVAJ</button>
            </div>
        </div>
    );
}

export default CodeSelectorInfo;
