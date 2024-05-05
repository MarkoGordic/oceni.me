import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './compilerTab.css';

const CompilerTab = ({ taskNo, testNo, pc, testId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [compilerData, setCompilerData] = useState(null);

    useEffect(() => {
        if (taskNo && testNo && pc && testId) {
            fetchCompilerData();
        }
    }, [taskNo, testNo, pc, testId]);

    const fetchCompilerData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/review/compiler/${testId}/${pc}/${taskNo}/${testNo}`, {
                credentials: 'include',
                method: 'GET',
            });
            if (!response.ok) {
                toast.error("Došlo je do greške prilikom učitavanja podataka.");
                throw new Error('Failed to fetch compiler data');
            }
            const data = await response.json();
            if (data.compile_output) {
                data.compile_output = atob(data.compile_output);
                console.log("Decoded compile output:", data.compile_output);
            }
            setCompilerData(data);
            console.log("Compiler data:", data);
        } catch (error) {
            console.error("Error fetching compiler data:", error);
            toast.error("Došlo je do greške prilikom učitavanja podataka.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!taskNo || !testNo || !pc || !testId) {
        return (
            <div className="compiler-tab">
                <p className='compiler-select-text'>Molimo izaberite zadatak i test primer da biste učitali podatke.</p>
            </div>
        );
    }

    return (
        <div className="compiler-tab">
            {isLoading ? (
                <p>Učitavanje...</p>
            ) : (
                compilerData ? (
                    <div className='compiler-data-wrap'>
                        <div className='compiler-outputs'>
                            <div className='compiler-error'>
                                <h3>GREŠKA</h3>
                                <pre>{compilerData.error_msg ? atob(compilerData.error_msg) : 'Nema greške'}</pre>
                            </div>

                            <div className='compiler-output'>
                                <h3>IZLAZ KOMPAJLERA</h3>
                                <pre>{compilerData.compile_output ? atob(compilerData.compile_output) : 'Nema izlaza'}</pre>
                            </div>
                        </div>

                        <div className='compiler-exit-codes'>
                            <div className='compiler-single-exit-code'>
                                <p>GDB</p>
                                <p>{compilerData.gdb_exit_code}</p>
                            </div>
                            <div className='compiler-single-exit-code'>
                                <p>PRG</p>
                                <p>{compilerData.program_exit_code}</p>
                            </div>
                            <div className='compiler-single-exit-code'>
                                <p>EXP</p>
                                <p>{compilerData.program_expected_code}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Nema podataka za prikaz. Proverite parametre ili osvežite stranicu.</p>
                )
            )}
        </div>
    );
};

export default CompilerTab;
