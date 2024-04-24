import {React, useEffect, useState} from "react";
import './codeSelector.css';

function CodeSelector({ testData, setCode, setCodeTest }) {
    const [data, setData] = useState({});

    useEffect(() => {
        if (testData) {
            setData(JSON.parse(testData.tasks));
        }
    }, [testData]);

    return (
        <div className="code-selector">
            {Object.entries(data).map(([zone, tasks]) => (
                <div key={zone} className="code-selector-single-task">
                    <div className="code-selector-single-task-no">{zone.toUpperCase()}</div>
                    {Object.entries(tasks).map(([taskNo, taskValue]) => (
                        <button 
                            key={taskNo}
                            className="code-selector-single-task-no-button"
                            onClick={() => {setCode(zone[1]);setCodeTest(taskNo);}}
                        >
                            {taskNo.toUpperCase()}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default CodeSelector;
