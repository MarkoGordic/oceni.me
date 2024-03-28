import React, { useState } from "react";
import { toast } from 'react-toastify';
import SingleTestConfig from "../SingleTestConfig/SingleTestConfig";

const ConfigureTab = ({ isLoading, testFiles, setTestsConfig, setConfigStatus }) => {
    const [testPoints, setTestPoints] = useState(testFiles.map(() => 0));

    const handlePointsChange = (points, index) => {
        setTestPoints(currentPoints => currentPoints.map((p, i) => i === index ? points : p));
    };

    function confirmTests() {
        const testsConfig = testFiles.map((file, index) => ({
            name: file.name,
            content: file.content,
            points: testPoints[index]
        }));

        setTestsConfig(testsConfig);
        setConfigStatus(true);
        toast.success("Test primeri uspešno konfigurisani!");
    }

    return (
        isLoading ? (
            <div className="loader">Loading...</div>
        ) : (
            <div className="newtest-wrap">
                <h1>Konfiguracija test primera</h1>
                <p className="newtest-info">U nastavku je potrebno da postavite bodovnu vrednost za svaki test primer koji je učitan.</p>
                <p className="newtest-info">Učitano testova: {testFiles.length}</p>
                
                <div className="newtest-configs">
                    {testFiles.map((file, index) => (
                        <SingleTestConfig
                            key={index}
                            testId={index + 1}
                            input={file.content}
                            filename={file.name}
                            onPointsChange={(points) => handlePointsChange(points, index)}
                        />
                    ))}
                </div>

                <button className="confirm-tests-btn" onClick={confirmTests}>NASTAVI KONFIGURACIJU</button>
            </div>
        )
    );
};

export default ConfigureTab;
