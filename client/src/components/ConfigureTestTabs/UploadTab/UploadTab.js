import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';

const UploadTab = ({ setFileName, setTargetZIP, confirmUpload, isLoading }) => {
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

    return (
        isLoading ? (
            <div className="loader"></div>
        ) : (
            <div className="newtest-wrap">
                <h1>Kreiranje nove konfiguracije</h1>

                    <p className="newtest-info">Kako bi kreirali konfiguraciju za novi kolokvijum, molimo vas da otpremite ZIP datoteku koja sadrži test primere.</p>
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
