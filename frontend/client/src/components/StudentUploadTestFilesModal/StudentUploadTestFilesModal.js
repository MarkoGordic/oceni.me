import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import './studentUploadTestFilesModal.css';

function StudentUploadTestFilesModal({ onClose, onUpload, testId, studentIndex, studentId, pc }) {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const onFileChange = event => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const onFileDrop = event => {
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            setFile(event.dataTransfer.files[0]);
        }
    };

    const uploadFile = async () => {
        if (!file) {
            toast.error('Morate izabrati fajl pre slanja.');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('zipFile', file);
        formData.append('testId', testId);
        formData.append('pc', pc);
        formData.append('studentId', studentId);

        try {
            const response = await fetch(`http://localhost:8000/tests/upload_student_files`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            setIsLoading(false);
            if (response.ok) {
                onUpload();
                toast.success('Svi fajlovi su uspešno otpremljeni.');
                onClose();
            } else {
                toast.error('Došlo je do greške prilikom slanja fajla.');
            }
        } catch (err) {
            setIsLoading(false);
            toast.error('Došlo je do greške prilikom slanja fajla.');
        }
    };

    const openFileSelector = () => {
        fileInputRef.current.click();
    };

    if (isLoading) {
        return (
            <div className="student-upload-test-files-modal" onClick={onClose}>
                <div className="student-upload-test-files-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="loader">Učitavanje...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-upload-test-files-modal" onClick={onClose}>
            <div className="student-upload-test-files-modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="student-upload-test-files-close" onClick={onClose}>&times;</span>
                <h3>Otpremite fajlove za {studentIndex}</h3>
                <div className="student-upload-test-files-drop-zone" onClick={openFileSelector} onDrop={onFileDrop} onDragOver={event => event.preventDefault()}>
                    {file ? file.name : "Prevucite fajl ovde ili kliknite da biste ga izabrali."}
                </div>
                <input ref={fileInputRef} type="file" onChange={onFileChange} style={{ display: 'none' }} accept=".tgz"/>
                <button className="student-upload-test-files-button" onClick={uploadFile}>OTPREMI</button>
            </div>
        </div>
    );
}

export default StudentUploadTestFilesModal;
