import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';

const FinalStudentsTab = ({ isLoading, studentList = [], testID }) => {

    const confirmFinalStudents = async () => {
        try {
            const response = await fetch('http://localhost:8000/tests/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    testId: testID,
                    finalStudents: studentList,
                }),
                credentials: 'include',
            });
            if (response.ok) {
                toast.success("Uspešno kreiran kolokvijum!");
            } else {
                toast.error("Došlo je do neočekivane greške prilikom kreiranja kolokvijuma.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        isLoading ? (
            <div className="loader"></div>
        ) : (
            <div className="newtest-wrap">
                <h1>Konfiguracija finalnih studenata</h1>
                <p style={{maxWidth: "900px"}}>
                    U nastavku su prikazani svi studenti koji su evidentirani da su radili kolokvijum. Molimo vas da proverite ovu listu.
                </p>

                <table className="subject-students-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Ime</th>
                            <th>Prezime</th>
                            <th>Broj indeksa</th>
                            <th>Računar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentList.map((student, index) => (
                            <tr key={student.index}>
                                <td>{index + 1}</td>
                                <td>{student.firstName}</td>
                                <td>{student.lastName}</td>
                                <td>{student.index}</td>
                                <td>{student.pc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button className="confirm-missing-students-btn" onClick={confirmFinalStudents}>KREIRAJ KOLOKVIJUM</button>
            </div>
        )
    );
};

export default FinalStudentsTab;
