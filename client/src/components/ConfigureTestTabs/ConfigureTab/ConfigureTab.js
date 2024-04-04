import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import SingleTestConfig from "../SingleTestConfig/SingleTestConfig";

const ConfigureTab = ({ isLoading, testFiles, setTestsConfig, setConfigStatus }) => {
    const [testPoints, setTestPoints] = useState([]);

    useEffect(() => {
        const initialTestPoints = testFiles.flatMap(folder => folder.files.map(() => 0));
        setTestPoints(initialTestPoints);
    }, [testFiles]);

    const handlePointsChange = (points, globalIndex) => {
        setTestPoints(currentPoints => { return currentPoints.map((p, i) => i === globalIndex ? points : p); });
    };
    

    function confirmTests() {
        const updatedTestFiles = testFiles.map((folder, folderIndex) => ({
            ...folder,
            files: folder.files.map((file, fileIndex) => {
                const globalIndex = calculateGlobalIndex(folderIndex, fileIndex);
                const points = testPoints[globalIndex];
                return {
                    ...file,
                    points,
                };
            }),
        }));
    
        setTestsConfig(updatedTestFiles);
        setConfigStatus(true);
        toast.success("Test primeri uspešno konfigurisani!");
    }

    const calculateGlobalIndex = (folderIndex, fileIndex) => {
        let count = 0;
        for (let i = 0; i < folderIndex; i++) {
            count += testFiles[i].files.length;
        }
        return count + fileIndex;
    };

    return (
        isLoading ? (
            <div className="loader">Loading...</div>
        ) : (
            <div className="newtest-wrap">
                <h1>Konfiguracija test primera</h1>
                <p className="newtest-info">U nastavku je potrebno da postavite bodovnu vrednost za svaki test primer koji je učitan.</p>
                
                <div className="newtest-all-configurations">
                    {testFiles.map((folder, folderIndex) => (
                        <div key={folder.folder}>
                            <h2 style={{marginBottom: '0px'}}>{`Zadatak ${folder.folder[1]}`}</h2>

                            <div className="newtest-config-delim-wrap"><div className="newtest-config-delimeter"></div></div>
                            <div className="newtest-configs">
                                {folder.files.map((file, fileIndex) => (
                                    <SingleTestConfig
                                        key={file.name}
                                        testId={calculateGlobalIndex(folderIndex, fileIndex) + 1}
                                        input={file.content}
                                        filename={file.name}
                                        onPointsChange={(points) => handlePointsChange(points, calculateGlobalIndex(folderIndex, fileIndex))}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="confirm-tests-btn" onClick={confirmTests}>NASTAVI KONFIGURACIJU</button>
            </div>
        )
    );
};

export default ConfigureTab;
