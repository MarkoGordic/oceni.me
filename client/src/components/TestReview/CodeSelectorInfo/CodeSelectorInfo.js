import React, { useEffect, useState } from "react";
import "./codeSelectorInfo.css";

function CodeSelectorInfo({ testData, codeTask, codeTest, grading, setStudentGradingResults, setTotalPoints, savePoints }) {
    const [maxPoints, setMaxPoints] = useState(0);
    const [currentPoints, setCurrentPoints] = useState(0);
    const [currentGrading, setCurrentGrading] = useState({});

    // Update component when testData, grading, codeTask, or codeTest changes
    useEffect(() => {
        if (testData && codeTask !== null && codeTest !== null) {
            const tasks = JSON.parse(testData.tasks);
            const task = tasks['z' + codeTask];
            setMaxPoints(task[codeTest] || 0); // Ensure a fallback if undefined
        }

        if (grading !== null && grading !== undefined && codeTask !== null && codeTest !== null) {
            const gradings = JSON.parse(grading.gradings);
            setCurrentGrading(gradings);
            const specificGrading = gradings['z' + codeTask] && gradings['z' + codeTask][codeTest];
            setCurrentPoints(specificGrading || 0); // Ensure a fallback if undefined
        }
    }, [testData, grading, codeTask, codeTest]);

    const updateAndSavePoints = () => {
        let updatedGrading = {...currentGrading}; // Clone to prevent direct mutation

        if (!updatedGrading['z' + codeTask]) {
            updatedGrading['z' + codeTask] = {};
        }

        updatedGrading['z' + codeTask][codeTest] = currentPoints;
        setStudentGradingResults(updatedGrading);

        // Calculate total points
        const totalPoints = Object.values(updatedGrading).reduce((acc, taskGrades) => {
            return acc + Object.values(taskGrades).reduce((sum, num) => sum + num, 0);
        }, 0);

        setTotalPoints(totalPoints);
        savePoints(); // Make sure savePoints properly manages asynchronous state updates
    }

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
                <p className="code-selector-info-maxpoints">{maxPoints || 0}</p>
                <button className="code-selector-info-save" onClick={updateAndSavePoints}>SAČUVAJ</button>
            </div>
        </div>
    );
}

export default CodeSelectorInfo;
