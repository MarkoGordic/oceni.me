import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';

const UploadTab = ({ setFileName, setTargetTAR, confirmUpload, isLoading }) => {
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
        if (file && /\.(tar)$/i.test(file.name)) {
            setTargetTAR(file);
            setFileName(file.name);
            setLocalFileName(file.name);
            toast.success("Datoteka uspešno učitana!");
        } else {
            toast.error("Molimo vas da izaberete .tar datoteku.");
            setLocalFileName("");
        }
    };

    return (
        isLoading ? (
            <div className="loader"></div>
        ) : (
            <div className="newtest-wrap-upload">
                <h1>Dodavanje novog kolokvijuma (2/2)</h1>

                    <p className="newtest-info">Dobro došli u čarobnjaka za dodavanje novog kolokvijuma. Ovaj čarobnjak će vas voditi kroz proces dodavanja svih neophodnih informacija o kolokvijumu.</p>
                    <p className="newtest-warning">UPOZORENJE: Ovaj proces može trajati nekoliko minuta. Molimo vas da ne zatvarate ovu stranicu dok se proces ne završi.</p>
                    <div className="drop-zone" onClick={openFileDialog}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            onChange={handleFileSelect}
                            accept=".tar"
                        />
                        {localFileName ? (
                            <p className="newtest-file-name-display">Izabrana datoteka: {localFileName}</p>
                        ) : (
                            <p className="newtest-file-name-display">Prevucite TAR datoteku ovde ili kliknite za izbor</p>
                        )}
                    </div>
                    <button className="confirm-upload-btn" onClick={confirmUpload}>POTVRDI UČITAVANJE</button>
            </div> 
        )
    );
};

export default UploadTab;
