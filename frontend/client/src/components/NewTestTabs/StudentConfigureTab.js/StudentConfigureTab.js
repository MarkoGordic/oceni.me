import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import SingleMissingStudent from "../SingleMissingStudent/SingleMissingStudent";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";

const StudentConfigureTab = ({ isLoading, missingIndexes, subjectID, setMissingStudents, confirmMissingStudents }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const handleBulkAddStudents = () => {
        setShowConfirmationModal(true);
    };

    const confirmBulkAddStudents = async () => {
        setShowConfirmationModal(false);
        await addAllStudents();
    };

    const addAllStudents = async () => {
        const formattedStudents = missingIndexes.map(student => ({
            first_name: student.first_name,
            last_name: student.last_name,
            index_number: student.index,
            email: `${student.first_name.toLowerCase()}.${student.last_name.toLowerCase()}@uns.ac.rs`,
            password: "DefaultPassword123!",
            subject_id: subjectID,
            gender: "NP"
        }));
    
        const response = await fetch('http://localhost:8000/students/add-multiple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ students: formattedStudents, subject_id: subjectID }),
            credentials: 'include',
        });
    
        if (response.ok) {
            const results = await response.json();
            const successEntries = results.filter(result => result.success);
            const failedEntries = results.filter(result => !result.success);
    
            if (failedEntries.length > 0) {
                failedEntries.forEach(entry => {
                    toast.error(`Došlo je do greške, ${entry.index_number}: ${entry.error}`);
                });
            }
    
            if (successEntries.length > 0) {
                toast.success(`Uspešno kreiranje naloga za sve studente. (${successEntries.length})`);
                setMissingStudents(missingIndexes.filter(index => !successEntries.some(entry => entry.index_number === index.index)));
            }
        } else {
            toast.error("Došlo je do greške prilikom dodavanja studenata.");
        }
    };
    

    const handleAddStudent = async (student) => {
        const { index, pc, first_name, last_name } = student;
        
        const formData = new FormData();
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('index_number', index);
        formData.append('email', `${first_name}.${last_name}@uns.ac.rs`);
        formData.append('password', "DefaultPassword123!");
        formData.append('subject_id', subjectID);
        formData.append('gender', "NP");

        try {
            const response = await fetch('http://localhost:8000/students/new', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (response.ok) {
                toast.success(`Uspešno kreiranje naloga za studenta ${first_name} ${last_name}.`);
                setMissingStudents(prev => prev.filter(s => s.index !== student.index));
            } else {
                toast.error("Došlo je do neočekivane greške prilikom dodavanja studenta.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Došlo je do greške prilikom dodavanja studenta.");
        }
    };

    return (
        isLoading ? (
            <div className="loader"></div>
        ) : (
            <div className="newtest-wrap">
                <h1>Konfiguriši nove studente</h1>
                <p style={{ maxWidth: "900px" }}>
                    U nastavku možete dodati studente koji nisu registrovani na platformi. Studenti će automatski biti prijavljeni na test.
                </p>

                {missingIndexes && missingIndexes.length > 0 && (
                    <div className="missing-students-list">
                        {missingIndexes.map((student, index) => (
                            <SingleMissingStudent key={index} student={student} addStudent={handleAddStudent} />
                        ))}
                        <button className="confirm-missing-students-btn" onClick={handleBulkAddStudents}>DODAJ SVE</button>
                    </div>
                )}

                {missingIndexes && missingIndexes.length === 0 && (
                    <p>Svi studenti su registrovani na platformi.</p>
                )}

                <button className="confirm-missing-students-btn" onClick={confirmMissingStudents}>SACUVAJ I NASTAVI</button>
                <ConfirmationModal
                    isOpen={showConfirmationModal}
                    onClose={() => setShowConfirmationModal(false)}
                    onConfirm={confirmBulkAddStudents}
                    message="Da li ste sigurni da želite da dodate sve studente odjednom?"
                />
            </div>
        )
    );
};

export default StudentConfigureTab;
