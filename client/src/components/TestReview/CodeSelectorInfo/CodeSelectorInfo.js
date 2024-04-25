import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./codeSelectorInfo.css";

function CodeSelectorInfo({ testData, codeTask, codeTest, grading, setStudentGradingResults, setTotalPoints, savePoints }) {
    const [maxPoints, setMaxPoints] = useState(0);
    const [currentPoints, setCurrentPoints] = useState(0);
    const [currentGrading, setCurrentGrading] = useState({});

    useEffect(() => {
        if (testData && codeTask !== null && codeTest !== null) {
            const tasks = JSON.parse(testData.tasks);
            const task = tasks['z' + codeTask];
            setMaxPoints(task[codeTest] || 0);
        }

        if (grading !== null && grading !== undefined && codeTask !== null && codeTest !== null) {
            try{
                console.log("GRADING", grading.gradings);
                const gradings = JSON.parse(grading.gradings);
                const currPoints = gradings['z' + codeTask][codeTest];
                setCurrentPoints(currPoints);
                setCurrentGrading(gradings);
            } catch (error) {}
        }
    }, [testData, grading, codeTask, codeTest]);

    const updateAndSavePoints = async () => {
        if (codeTask === null || codeTest === null) {
            toast.error("Niste odabrali zadatak/test!");
            return;
        }
    
        let updatedGrading = {...currentGrading};
    
        if (!updatedGrading['z' + codeTask]) {
            updatedGrading['z' + codeTask] = {};
        }
    
        updatedGrading['z' + codeTask][codeTest] = currentPoints;
    
        try {
            const totalPoints = Object.values(updatedGrading).reduce((acc, taskGrades) => {
                return acc + Object.values(taskGrades).reduce((sum, num) => sum + num, 0);
            }, 0);

            await savePoints(JSON.stringify(updatedGrading), totalPoints);
            setStudentGradingResults(updatedGrading);
            setCurrentGrading(updatedGrading);

            setTotalPoints(totalPoints);
    
            toast.success("Uspešno sačuvano!");
        } catch (error) {
            console.error("Failed to save points: ", error);
            toast.error("Greška pri čuvanju bodova! Pokušajte ponovo.");
        }
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
