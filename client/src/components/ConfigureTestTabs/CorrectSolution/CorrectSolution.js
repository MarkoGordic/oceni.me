import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

const CorrectSolution = ({ setFileName, setTargetZIP, confirmUpload, isLoading }) => {
    const [localFileName, setLocalFileName] = useState("");
    const fileInputRef = useRef(null);

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
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
            toast.error("Molimo vas da izaberete .zip datoteku.");
            setLocalFileName("");
        }
    };

    return (
        isLoading ? (
            <div className="loader">Loading...</div>
        ) : (
            <div className="newtest-wrap">
                <h1>Dodavanje tačnog rešenja</h1>
                <p className="newtest-info">Kako bi dodali tačno rešenje za kolokvijum, molimo vas da otpremite .zip datoteku koja sadrži rešenja zadataka.</p>
                <p className="newtest-warning">Napomena: Nemojte napuštati ovu stranicu dok ne završite konfiguraciju rešenja.</p>

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
                            <p className="newtest-file-name-display">Prevucite .zip datoteku ovde ili kliknite za izbor</p>
                        )}
                </div>

                <button className="confirm-tests-btn" onClick={confirmUpload}>ZAVRŠI KONFIGURACIJU</button>
            </div>
        )
    );
};

export default CorrectSolution;