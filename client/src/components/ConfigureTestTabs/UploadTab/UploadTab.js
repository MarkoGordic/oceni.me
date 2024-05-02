import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';

const UploadTab = ({ setFileName, setTargetZIP, confirmUpload, isLoading, setConfigName, configName, setTestNo }) => {
    const [localFileName, setLocalFileName] = useState("");
    const fileInputRef = useRef(null);

    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        validateAndSetFile(file);
    };

    const validateAndSetFile = (file) => {
        if (file && /\.(zip)$/i.test(file.name)) {
            setTargetZIP(file);
            setFileName(file.name);
            setLocalFileName(file.name);
            toast.success("Datoteka uspešno učitana!");
        } else {
            toast.error("Molimo vas da izaberete ZIP datoteku.");
            setLocalFileName("");
        }
    };

    const handleConfigNameChange = (e) => {
        setConfigName(e.target.value);
    };

    const handleTestNoChange = (e) => {
        const newNo = parseInt(e.target.value, 10) || 0;
        setTestNo(newNo);
    };

    return (
        isLoading ? (
            <div className="loader"></div>
        ) : (
            <div className="newtest-wrap-config">
                <h1>Kreiranje nove konfiguracije</h1>
                <p className="newtest-info">Kako bi kreirali konfiguraciju za novi kolokvijum, molimo vas da unesete naziv ove konfiguracije i otpremite ZIP datoteku koja sadrži test primere.</p>
                <p className="newtest-info">Naziv konfiguracije treba da odgovara nazivu kolokvijuma.</p>
                
                <div className="newtest-config-inputs">
                    <div className="newtest-config-input">
                        <label className="newtest-config-name-label">Naziv konfiguracije:</label>
                        <input
                            type="text"
                            placeholder="Unesite naziv konfiguracije"
                            value={configName}
                            onChange={handleConfigNameChange}
                            className="newtest-config-name-input"
                            style={{ marginTop: "30px" }}
                        />
                    </div>

                    <div className="newtest-config-input">
                        <label className="newtest-config-name-label">Redni broj kolokvijuma:</label>
                        <input className="newtest-test-no-input" type='number' min='0' max='100' step='1' onChange={handleTestNoChange} />
                    </div>
                </div>
                
                <div className="drop-zone" onClick={openFileDialog}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        onChange={handleFileSelect}
                        accept=".zip"
                    />
                    {localFileName ? (
                        <p className="newtest-file-name-display">Izabrana datoteka: {localFileName}</p>
                    ) : (
                        <p className="newtest-file-name-display">Prevucite ZIP datoteku ovde ili kliknite za izbor</p>
                    )}
                </div>
                <button className="confirm-upload-btn" onClick={confirmUpload}>POTVRDI UČITAVANJE</button>
            </div> 
        )
    );
};

export default UploadTab;
