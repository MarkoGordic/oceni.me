import React, { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./emulatorDebuggerTab.css";

const EmulatorDebuggerTab = ({taskNo, testNo, pc, setDebbugLine}) => {
    const { id, testid, studentId } = useParams();

    const [gdbData, setGdbData] = useState(null);
    const [debuggerRunning, setDebuggerRunning] = useState(false);
    const [currentInstruction, setCurrentInstruction] = useState(0);
    const [currentRegisterValues, setCurrentRegisterValues] = useState(null);

    useEffect(() => {
        console.log(gdbData, debuggerRunning, currentInstruction, currentRegisterValues);
        if(gdbData === null) return;
    
        if (!debuggerRunning) {
            setCurrentInstruction(0);
            setCurrentRegisterValues(null);
        } else {
            setCurrentRegisterValues(gdbData[currentInstruction].registers);
            setDebbugLine(gdbData[currentInstruction].source.line);
        }
    }, [gdbData, debuggerRunning, currentInstruction]);

    useEffect(() => {
        if (taskNo === null || pc === null || testNo === null || testid === null) return;

        const fetchDebuggerData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/review/debugger/${testid}/${pc}/${taskNo}/${testNo}`, {
                    credentials: 'include',
                });
                const data = await response.json();
                setGdbData(data);
            } catch (error) {
                toast.error("Došlo je do greške prilikom učitavanja gdb podataka.");
            }
        };

        fetchDebuggerData();
    }, [taskNo, pc, testid, testNo]);

    return (
        <div className="emuldbg-tab-wrap">
            <div className="dbg-controls-wrap">
                <div className="dbg-controls">
                    <button className="dbg-run-btn" onClick={() => {setDebuggerRunning(true);}}>POKRENI</button>
                    <button className="dbg-stop-btn" onClick={() => {setDebuggerRunning(false);}}>ZAUSTAVI</button>
                    <button className="dbg-step-btn" onClick={() => {setCurrentInstruction(prev => prev + 1);}}>KORAK</button>
                    <button className="dbg-step-back-btn" onClick={() => setCurrentInstruction(prev => Math.max(0, prev - 1))}>KORAK UNAZAD</button>
                </div>

                <div className="gdb-registers">
                    <p>EAX: {currentRegisterValues && currentRegisterValues['eax'] ? currentRegisterValues['eax'] : '/'}</p>
                    <p>EBX: {currentRegisterValues && currentRegisterValues['ebx'] ? currentRegisterValues['ebx'] : '/'}</p>
                    <p>ECX: {currentRegisterValues && currentRegisterValues['ecx'] ? currentRegisterValues['ecx'] : '/'}</p>
                    <p>EDX: {currentRegisterValues && currentRegisterValues['edx'] ? currentRegisterValues['edx'] : '/'}</p>
                    <p>ESP: {currentRegisterValues && currentRegisterValues['esp'] ? currentRegisterValues['esp'] : '/'}</p>
                    <p>EBP: {currentRegisterValues && currentRegisterValues['ebp'] ? currentRegisterValues['ebp'] : '/'}</p>
                    <p>ESI: {currentRegisterValues && currentRegisterValues['esi'] ? currentRegisterValues['esi'] : '/'}</p>
                    <p>EDI: {currentRegisterValues && currentRegisterValues['edi'] ? currentRegisterValues['edi'] : '/'}</p>
                </div>
            </div>
        </div>
    );
};

export default EmulatorDebuggerTab;