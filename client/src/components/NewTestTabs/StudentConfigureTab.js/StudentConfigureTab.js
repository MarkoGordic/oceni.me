import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import SingleMissingStudent from "../SingleMissingStudent/SingleMissingStudent";

const StudentConfigureTab = ({ isLoading, studentData, setStudentData, missingIndexes }) => {
    useEffect(() => {
        console.log("StudentConfigureTab.js: ", studentData, missingIndexes);
    }, [studentData, missingIndexes]);

    const handleAddStudent = async (student) => {
        const { index, pc, first_name, last_name } = student;
        
        const formData = new FormData();
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('index_number', index);
        formData.append('email', `${first_name}.${last_name}@uns.ac.rs`);
        formData.append('password', "DefaultPassword123!");
        formData.append('course_code', "IN"); // TODO: FIX COURSE CODE
        formData.append('gender', "NP");

        try {
            const response = await fetch('http://localhost:8000/students/new', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (response.ok) {
                toast.success("Uspešno kreiran nalog za studenta " + first_name + " " + last_name + "!");
                // REFRESH MISSING STUDENTS
            } else {
                toast.error("Došlo je do neočekivane greške prilikom kreiranja studentskog naloga.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const confirmMissingStudents = async () => {
    
    }

    return (
        isLoading ? (
            <div className="loader"></div>
        ) : (
            <div className="newtest-wrap">
                <h1>Konfiguracija novih studenata</h1>
                <p style={{maxWidth: "700px"}}>
                    U nastavku su prikazani svi studenti koji su evidentirani da su radili kolokvijum, 
                    a nisu evidentirani u bazi podataka. Klikom na plus pored njihovog imena ih možete dodati u bazu, 
                    ili klikom na dugme "DODAJ SVE" možete dodati sve studente odjednom.
                </p>

                {missingIndexes && missingIndexes.length > 0 && (
                    <div className="missing-students-list">
                        {missingIndexes.map((student, index) => (
                            <SingleMissingStudent key={index} student={student} addStudent={handleAddStudent} />
                        ))}
                    </div>
                )}

                {missingIndexes && missingIndexes.length === 0 && (
                    <p>Nema studenata za dodavanje.</p>
                )}

                <button className="confirm-missing-students-btn" onClick={confirmMissingStudents}>SAČUVAJ I NASTAVI</button>
            </div>
        )
    );
};

export default StudentConfigureTab;
