import React, { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./emulatorDebuggerTab.css";

const EmulatorDebuggerTab = ({taskNo, testNo, pc, setDebbugLine, setDebbugFile, breakpoints}) => {
    const { id, testid, studentId } = useParams();

    const [gdbData, setGdbData] = useState(null);
    const [debuggerRunning, setDebuggerRunning] = useState(false);
    const [currentInstruction, setCurrentInstruction] = useState(0);
    const [currentRegisterValues, setCurrentRegisterValues] = useState(null);
    const [currentStringRegisterValues, setCurrentStringRegisterValues] = useState(null);
    const [registerTypes, setRegisterTypes] = useState({
        eax: "auto",
        ebx: "auto",
        ecx: "auto",
        edx: "auto",
        esp: "auto",
        ebp: "auto",
        esi: "auto",
        edi: "auto"
    });

    useEffect(() => {
        console.log(gdbData, debuggerRunning, currentInstruction, currentRegisterValues);
        if (gdbData === null) return;
    
        if (!debuggerRunning) {
            setCurrentInstruction(0);
            setCurrentRegisterValues(null);
            setCurrentStringRegisterValues(null);
            setDebbugLine(null);
            setDebbugFile(null);
        } else {
            const currentInst = gdbData[currentInstruction];
            if (currentInst) {
                setCurrentRegisterValues(currentInst.registers);
                setCurrentStringRegisterValues(currentInst.register_strings);
                setDebbugLine(currentInst.source.line);
                setDebbugFile(currentInst.source.file);
            }
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

    const handleTypeChange = (register, type) => {
        setRegisterTypes(prev => ({ ...prev, [register]: type }));
      };

    const formatValueByType = (register, type) => {
        if (type === "string") {
            return currentStringRegisterValues && currentStringRegisterValues[register] ? currentStringRegisterValues[register] : "N/A";
        } else {
            const value = currentRegisterValues ? currentRegisterValues[register] : "N/A";
            switch (type) {
            case "int":
                return parseInt(value).toString();
            case "float":
                return parseFloat(value).toFixed(2);
            case "hex":
                return "0x" + parseInt(value).toString(16);
            default:
                return value;
            }
        }
    };
    
    const runToBreakpoint = () => {
        if (!gdbData || !breakpoints || breakpoints.length === 0) {
            toast.info("Nema postavljenih tačaka prekida ili podataka.");
            return;
        }
    
        if (!debuggerRunning) {
            toast.info("Debugger nije pokrenut.");
            return;
        }
    
        const breakpointLines = breakpoints.flat();
    
        const startSearchIndex = currentInstruction + 1;
        const breakpointIndex = gdbData.slice(startSearchIndex).findIndex(instruction => 
            breakpointLines.includes(instruction.source.line)
        );
    
        if (breakpointIndex !== -1) {
            const realIndex = startSearchIndex + breakpointIndex;
            setCurrentInstruction(realIndex);
            setCurrentRegisterValues(gdbData[realIndex].registers);
            setDebbugLine(gdbData[realIndex].source.line);
            setDebbugFile(gdbData[realIndex].source.file);
            toast.success(`Tačka prekida dostignuta na liniji ${gdbData[realIndex].source.line}`);
        } else {
            toast.info("Nema dodatnih tačaka prekida do kraja izvršenja.");
        }
    };

    const handleNextInstruction = () => {
        if (currentInstruction < gdbData.length - 1) {
            setCurrentInstruction(prev => prev + 1);
        } else {
            toast.info("Dostignut je kraj instrukcija.");
        }
    };
    
    const handlePrevInstruction = () => {
        if (currentInstruction > 0) {
            setCurrentInstruction(prev => Math.max(0, prev - 1));
        } else {
            toast.info("Već ste na prvoj instrukciji.");
        }
    };    

    return (
        <div className="emuldbg-tab-wrap">
            <div className="dbg-controls-wrap">
                <div className="dbg-controls">
                    <button className="dbg-run-btn" onClick={() => {if(testNo !== null && taskNo !== null){setDebuggerRunning(true);} else toast.error("Morate odabrati test primer.");}}>POKRENI</button>
                    <button className="dbg-stop-btn" onClick={() => {setDebuggerRunning(false);}}>ZAUSTAVI</button>
                    <button className="dbg-step-btn" onClick={handleNextInstruction}>KORAK</button>
                    <button className="dbg-step-back-btn" onClick={handlePrevInstruction}>KORAK UNAZAD</button>
                    <button className="dbg-run-to-brk-btn" onClick={runToBreakpoint}>POKRENI DO TAČKE PREKIDA</button>
                </div>

                <div className="gdb-registers">
                    <div className="gdb-register-pair">
                        <p className="gdb-register">EAX: {formatValueByType('eax', registerTypes.eax)}</p>
                        <p className="gdb-register">EBX: {formatValueByType('ebx', registerTypes.ebx)}</p>
                    </div>
                    <div className="gdb-register-pair">
                        <p className="gdb-register">ECX: {formatValueByType('ecx', registerTypes.ecx)}</p>
                        <p className="gdb-register">EDX: {formatValueByType('edx', registerTypes.edx)}</p>
                    </div>
                    <div className="gdb-register-pair">
                        <p className="gdb-register">ESP: {formatValueByType('esp', registerTypes.esp)}</p>
                        <p className="gdb-register">EBP: {formatValueByType('ebp', registerTypes.ebp)}</p>
                    </div>
                    <div className="gdb-register-pair">
                        <p className="gdb-register">ESI: {formatValueByType('esi', registerTypes.esi)}</p>
                        <p className="gdb-register">EDI: {formatValueByType('edi', registerTypes.edi)}</p>
                    </div>
                </div>

                <div className="gdb-register-types">
                    <div className="div-register-type-select-row">
                        <p className="gdb-register-type">EAX</p>
                        <select className="gdb-register-type-select" value={registerTypes.eax} onChange={(e) => handleTypeChange('eax', e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="int">Int</option>
                            <option value="float">Float</option>
                            <option value="hex">Hex</option>
                            <option value="string">String</option>
                        </select>

                        <p className="gdb-register-type">EBX</p>
                        <select className="gdb-register-type-select" value={registerTypes.ebx} onChange={(e) => handleTypeChange('ebx', e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="int">Int</option>
                            <option value="float">Float</option>
                            <option value="hex">Hex</option>
                            <option value="string">String</option>
                        </select>

                        <p className="gdb-register-type">ECX</p>
                        <select className="gdb-register-type-select" value={registerTypes.ecx} onChange={(e) => handleTypeChange('ecx', e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="int">Int</option>
                            <option value="float">Float</option>
                            <option value="hex">Hex</option>
                            <option value="string">String</option>
                        </select>

                        <p className="gdb-register-type">EDX</p>
                        <select className="gdb-register-type-select" value={registerTypes.edx} onChange={(e) => handleTypeChange('edx', e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="int">Int</option>
                            <option value="float">Float</option>
                            <option value="hex">Hex</option>
                            <option value="string">String</option>
                        </select>
                    </div>

                    <div className="div-register-type-select-row">
                        <p className="gdb-register-type">ESP</p>
                        <select className="gdb-register-type-select" value={registerTypes.esp} onChange={(e) => handleTypeChange('esp', e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="int">Int</option>
                            <option value="float">Float</option>
                            <option value="hex">Hex</option>
                            <option value="string">String</option>
                        </select>

                        <p className="gdb-register-type">EBP</p>
                        <select className="gdb-register-type-select" value={registerTypes.ebp} onChange={(e) => handleTypeChange('ebp', e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="int">Int</option>
                            <option value="float">Float</option>
                            <option value="hex">Hex</option>
                            <option value="string">String</option>
                        </select>

                        <p className="gdb-register-type">ESI</p>
                        <select className="gdb-register-type-select" value={registerTypes.esi} onChange={(e) => handleTypeChange('esi', e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="int">Int</option>
                            <option value="float">Float</option>
                            <option value="hex">Hex</option>
                            <option value="string">String</option>
                        </select>

                        <p className="gdb-register-type">EDI</p>
                        <select className="gdb-register-type-select" value={registerTypes.edi} onChange={(e) => handleTypeChange('edi', e.target.value)}>
                            <option value="auto">Auto</option>
                            <option value="int">Int</option>
                            <option value="float">Float</option>
                            <option value="hex">Hex</option>
                            <option value="string">String</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmulatorDebuggerTab;