import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import TestReviewHeader from "../../components/TestReview/TestReviewHeader/TestReviewHeader";
import CodePreview from "../../components/TestReview/CodePreview/CodePreview";
import CurrentStudentInfo from "../../components/TestReview/CurrentStudentInfo/CurrentStudentInfo";
import CodeSelector from "../../components/TestReview/CodeSelector/CodeSelector";
import CodeSelectorInfo from "../../components/TestReview/CodeSelectorInfo/CodeSelectorInfo";
import EmulatorDebuggerTab from "../../components/TestReview/EmulatorDebuggerTab/EmulatorDebuggerTab";
import CompilerTab from "../../components/TestReview/CompilerTab/CompilerTab";
import RealtimeInterpreterTab from "../../components/TestReview/RealtimeInterpreterTab/RealtimeInterpreterTab";
import CodeEditTab from "../../components/TestReview/CodeEditTab/CodeEditTab";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import './reviewTest.css';
import { useNavigate } from 'react-router-dom';

const ReviewTest = () => {
    const { id, testid, studentId } = useParams();
    const [studentData, setStudentData] = React.useState(null);
    const [testData, setTestData] = React.useState(null);
    const [studentResult, setStudentResult] = React.useState(null);
    const [targetTaskNo, setTargetTaskNo] = React.useState(null);
    const [targetTestNo, setTargetTestNo] = React.useState(null);
    const [pc, setPc] = React.useState(null);

    // Nadja variables
    const [studentIndex, setStudentIndex] = React.useState("");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const quotes = [
        "Kada ti kažem da te volim, ne kažem to iz navike. Kažem to da te podsetim da si ti najbolja stvar koja mi se ikada dogodila.",
        "Čudne su te emocije. Otkriješ kutak u sebi za koji nisi niti znao da postoji i još shvatiš da je tamo neko danima, mesecima, godinama spavao, a nije plaćao stanarinu.",
        "I uvek ostaje ona osoba koje ćeš ostati željan celog života i onaj strah dok brojiš pobede i poraze. Nekim pričama o ljubavi uvek fale poslednje stranice.",
        "Kad bi ona bila pahuljica, ja bih sigurno bio januar. I ne bi nas mogli zamisliti jedno bez drugoga.",
        "Ljudi su kao školjke -moraš ih otvoriti na hiljade da bi pronašao biser",
        "Ne sine, ljubav ne pobeđuje… Ona je samo… Nepobediva… Pa to ponekad brkaju.",
        "Saznao sam u koje doba godine je ovde najlepše… U ono doba godine kad si ti tu…",
        "Sto hiljada reči znam, al' jedna mi fali da nju kako treba opišem…",
        "Od nakita je nosila samo OČI!",
        "I onda će znati da je jedina koju sam ikad voleo. Da sam sve druge voleo tamnom stranom srca. Štedeći se… Učeći se kako ću najbolje voleti nju… Kada je konačno nađem…"
    ]

    const [studentGrading, setStudentGrading] = React.useState(null);
    const [maxPoints, setMaxPoints] = useState(0);
    const [currentPoints, setCurrentPoints] = useState(0);

    const [studentGradingResults, setStudentGradingResults] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    const [codeText, setCodeText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const [debbugLine, setDebbugLine] = useState([]);
    const [debbugLineContent, setDebbugLineContent] = useState('');
    const [debbugFile, setDebbugFile] = useState(null);
    const [breakpoints, setBreakpoints] = useState([]);

    const [isVariationModeActive, setIsVariationModeActive] = useState(false);
    const [selectedVariationName, setSelectedVariationName] = useState('');
    const [selectedVariationId, setSelectedVariationId] = useState(null);
    const [openTabs, setOpenTabs] = useState({
        "PRIKAZ UŽIVO": true,
        'EMULATOR & DEBUGGER': false,
        'COMPILER': false,
        "VARIJACIJE KODA": false
    });
    const [hasPendingChanges, setHasPendingChanges] = useState(false);

    // CodePreview variables
    const [pendingFileContent, setPendingFileContent] = useState('');
    const [showContent, setShowContent] = useState(false);
    const [pendingAction, setPendingAction] = useState({});
    const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
    const [mode, setMode] = useState('view'); // view, edit
    const [showConfirmInappropriateDialog, setShowConfirmInappropriateDialog] = useState(false);
    const navigate = useNavigate();

    const tabComponents = {
        "PRIKAZ UZIVO": RealtimeInterpreterTab,
        'EMULATOR & DEBUGGER': EmulatorDebuggerTab,
        'COMPILER': CompilerTab,
        "VARIJACIJE KODA": CodeEditTab,
    };
    const tabHeights = {
        "PRIKAZ UZIVO": "50px",
        'EMULATOR & DEBUGGER': "310px",
        'COMPILER': "200px",
        "VARIJACIJE KODA": "260px",

    };
    const tabProps = {
        "PRIKAZ UZIVO": { currentDebbugLine: debbugLineContent },
        'EMULATOR & DEBUGGER': { taskNo: targetTaskNo, testNo: targetTestNo, pc: pc, setDebbugLine: setDebbugLine, setDebbugFile: setDebbugFile, breakpoints: breakpoints, setDebbugLineContent: setDebbugLineContent, isVariationModeActive: isVariationModeActive, selectedVariationID: selectedVariationId},
        'COMPILER': { taskNo: targetTaskNo, testNo: targetTestNo, pc: pc, testId: testid },
        "VARIJACIJE KODA": { taskNo: targetTaskNo, testNo: targetTestNo, pc: pc, testId: testid, setIsVariationModeActive: setIsVariationModeActive, setVariationName: setSelectedVariationName, hasPendingChanges: hasPendingChanges, saveFileChanges: saveFileChanges, selectedVariationId: selectedVariationId, setSelectedVariationId: setSelectedVariationId},
    };

    const requestAction = (requestedAction) => {
        if (hasPendingChanges) {
            setPendingAction(requestedAction);
            setConfirmDiscardChanges(true);
        } else {
            switch (requestedAction.type) {
                case 'mode':
                    setMode(requestedAction.action);
                    break;
                case 'file':
                    selectFile(requestedAction.action);
                    break;
                case 'task':
                    selectTaskAndTest(requestedAction.action.task, requestedAction.action.test);
                    break;
                default:
                    console.table("Unknown action requested:", requestedAction);
            }
        }
    }

    useEffect(() => {
        setSelectedVariationId(null);
        setSelectedVariationName('');
    }, [targetTaskNo]);

    useEffect(() => {
        if(studentId)
            fetchStudentData(studentId);
        if(testid)
            fetchTestData(testid);

        if(studentId !== undefined && testid !== undefined)
            fetchGradingData();
    }, [studentId, testid]);

    useEffect(() => {
        if (testData) {
            const final_students = JSON.parse(testData.final_students);
            const currentStudent = final_students.find(s => s.index === studentData.index_number);
            setPc(currentStudent.pc);
            setMaxPoints(testData.total_points);
        }
    }, [testData]);

    useEffect(() => {
        if(studentGrading){
            setCurrentPoints(studentGrading.total_points);
        }
    }, [studentGrading]);

    useEffect(() => {
        if (studentGradingResults) {
            let grading = studentGrading;
            let updatedGrading = JSON.stringify(studentGradingResults);
            grading.gradings = updatedGrading;
            console.log("UPDATED GRADING", grading.gradings);
            const totalPoints = Object.values(studentGradingResults).reduce((acc, taskGrades) => {
                return acc + Object.values(taskGrades).reduce((sum, num) => sum + num, 0);
            }, 0);
            setCurrentPoints(totalPoints);
            setStudentGrading(grading);
        }
    }, [studentGradingResults]);

    useEffect(() => {
        if(studentData){
            setStudentIndex(studentData.index_number);
            if(studentData.index_number === "IN 033/2023"){
                setShowConfirmationModal(true);
            }
        }
    }, [studentData]);

    useEffect(() => {
        if (studentIndex === "IN 033/2023") {
            const showRandomQuote = () => {
                const randomIndex = Math.floor(Math.random() * quotes.length);
                const randomQuote = quotes[randomIndex];
                toast.info(randomQuote, {
                    position: "top-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: 'quote-toast'
                });
            };
    
            const intervalId = setInterval(showRandomQuote, 60000);
    
            return () => clearInterval(intervalId);
        }
    }, [studentIndex]);

    async function fetchStudentData() {
        setIsLoading(true);
        setStudentData(null);
        try {
            const response = await fetch(`http://localhost:8000/students/get/${studentId}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setStudentData(data);
        } catch (error) {
            console.error("Error fetching student data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchTestData() {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/tests/get?testId=${testid}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                toast.error("Došlo je do greške prilikom učitavanja testa.");
            }
            const data = await response.json();
            setTestData(data);
        } catch (error) {
            toast.error("Došlo je do greške prilikom učitavanja testa.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchGradingData() {
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8000/review/grading`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testId: parseInt(testid), studentId: parseInt(studentId) }),
            });
            if (!response.ok) {
                toast.error("Došlo je do greške prilikom učitavanja  1 AT ocene.", response.type);
            }
            const data = await response.json();
            setStudentGrading(data);
        } catch (error) {
            console.log("Error fetching grading data:", error);
            toast.error("Došlo je do greške prilikom učitavanja 2 AT ocene.", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function savePoints(updatedGrading, totalPoints) {
        try {
            const response = await fetch(`http://localhost:8000/review/grading/save`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testId: parseInt(testid), studentId: parseInt(studentId), grading: updatedGrading, total_points: totalPoints }),
            });
            if (!response.ok) {
                toast.error("Došlo je do greške prilikom čuvanja ocene.", response.type);
            }
            const data = await response.json();
            setStudentGrading(data);
        } catch (error) {
            console.log("Error saving grading data:", error);
            toast.error("Došlo je do greške prilikom čuvanja ocene.", error);
        } 
   }

   const selectFile = async (fileName) => {
        setSelectedFile(fileName);
        try {
            const endpoint = isVariationModeActive
                ? `http://localhost:8000/review/edits/getfile`
                : `http://localhost:8000/review/code/${testid}/${pc}/${targetTaskNo}/${fileName}`;

            const response = await fetch(endpoint, {
                credentials: 'include',
                method: isVariationModeActive ? "POST" : "GET",
                headers: isVariationModeActive ? { "Content-Type": "application/json" } : undefined,
                body: isVariationModeActive
                    ? JSON.stringify({ testId: testid, pc, taskNo: targetTaskNo, variationId: selectedVariationId, fileName })
                    : undefined
            });

            if (!response.ok) {
                toast.error("Došlo je do greške prilikom učitavanja koda.");
                return;
            }

            const text = await response.text();
            const blacklistedWords = ['kurac', 'kurčina', 'kurčić', 'govno', 'jebem', 'jebati', 'jebote', 'penis', 'pička', 'pizda', 'sranje', 'kurvin', 'kurva', 'drolja', 'pickica', 'picka', 'drkadzija', 'drkadžija', 'drkati', 'pičkin', 'jebac', 'jebač', 'jebanje', 'jebiga', 'jebala', 'jebeno', 'jebeni', 'jebačina', 'jebach', 'jebachina', 'pičketina', 'pičkica', 'šupak', 'supak', 'šupčić', 'šupcic', 'supčić', 'kurvetina', 'kurvetina', 'muda', 'budala', 'idiot', 'glupan', 'glupson', 'kreten', 'debil', 'prokletnik', 'gnjida', 'govno', 'seronja', 'usrani', 'prcati', 'džukela', 'dzukela', 'čmar', 'šupčina', 'proseravanje', 'prosrati', 'usrati', 'čmarina', 'cmarina'];

            const words = text.toLowerCase().split(/\s+/);
            const containsBlacklisted = words.some(word => blacklistedWords.includes(word));

            if (containsBlacklisted) {
                setPendingFileContent(text);
                setShowConfirmInappropriateDialog(true);
                return;
            }

            setShowContent(true);
            setCodeText(text);
        } catch (error) {
            console.error("Error fetching code for file:", error);
            toast.error("Došlo je do greške prilikom učitavanja koda.");
        }
    };

    async function saveFileChanges() {
        try {
            const response = await fetch(`http://localhost:8000/review/edits/updatefile`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testId: testid, taskNo: targetTaskNo, pc, variationId: selectedVariationId, newContent: codeText, fileName: selectedFile }),
            });
            if (!response.ok) {
                toast.error("Došlo je do greške prilikom čuvanja promena u fajlu.");
                return;
            }
            toast.success("Promene su uspešno sačuvane.");
            setHasPendingChanges(false);
        } catch (error) {
            console.log("Error saving file changes:", error);
            toast.error("Došlo je do greške prilikom čuvanja promena u fajlu.");
        }
    }

    const toggleTab = (tabName) => {
        setOpenTabs(prev => ({ ...prev, [tabName]: !prev[tabName] }));
    };

    const selectTaskAndTest = (task, test) => {
        if (hasPendingChanges) {
            setPendingAction({ type: 'task', action: {task, test}});
            setConfirmDiscardChanges(true);
            return;
        }

        setTargetTaskNo(task);
        setTargetTestNo(test);
    };

    const saveAndExit = () => {
        if (hasPendingChanges) {
            setPendingAction({ type: 'mode', action: 'save' });
            setConfirmDiscardChanges(true);
            return;
        }

        const totalPoints = Object.values(JSON.parse(studentGrading.gradings)).reduce((acc, taskGrades) => {
            return acc + Object.values(taskGrades).reduce((sum, num) => sum + num, 0);
        }, 0);

        savePoints(studentGrading.gradings, totalPoints);
        navigate('./../../');
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />

            <ConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => navigate("./../../")}
                onConfirm={() => setShowConfirmationModal(false)}
                message="Pristupate pregledanju kolokvijuma jednoj meni vrlo posebnoj osobi. Molim Vas da budete pažljivi i strpljivi prilikom pregledanja. Hvala Vam! ~ Gordic"
            />

            <TestReviewHeader />
            <div className='review-content'>
                <div className="left-column">
                    <CodePreview pc={pc} taskNo={targetTaskNo} testNo={targetTestNo} lineNumber={debbugLine} debbugFile={debbugFile} setBreakpoints={setBreakpoints} isVariationModeActive={isVariationModeActive} selectedVariationID={selectedVariationId} hasPendingChanges={hasPendingChanges} setHasPendingChanges={setHasPendingChanges} codeText={codeText} setCodeText={setCodeText} selectedFile={selectedFile} setSelectedFile={setSelectedFile} pendingAction={pendingAction} setPendingAction={setPendingAction} saveFileChanges={saveFileChanges} requestAction={requestAction} confirmDiscardChanges={confirmDiscardChanges} setConfirmDiscardChanges={setConfirmDiscardChanges} mode={mode} setMode={setMode} selectFile={selectFile} showContent={showContent} setShowContent={setShowContent} showConfirmDialog={showConfirmInappropriateDialog} setShowConfirmDialog={setShowConfirmInappropriateDialog} pendingFileContent={pendingFileContent} />
                </div>
                <div className="right-column">
                    <CurrentStudentInfo student={studentData} currentPoints={currentPoints} maxPoints={maxPoints} pc={pc} />
                    <CodeSelectorInfo
                        testData={testData}
                        codeTask={targetTaskNo}
                        codeTest={targetTestNo}
                        grading={studentGrading}
                        savePoints={savePoints}
                        setStudentGradingResults={setStudentGradingResults}
                        setTotalPoints={setCurrentPoints}
                    />
                    <CodeSelector testData={testData} selectTaskAndTest={selectTaskAndTest} />

                    <button className="test-review-grade-button" onClick={() => saveAndExit()}>OCENI I SAČUVAJ</button>

                    {Object.entries(tabComponents).map(([tab, Component]) => (
                        <div className="review-tab-wrap" key={tab}>
                            <div className={`review-tab ${openTabs[tab] ? 'review-tab-active' : ''}`} onClick={() => toggleTab(tab)}>
                                <i className="fi fi-rr-angle-small-down"></i>
                                <h2 className="review-tab-name">{tab}</h2>
                                <i className="fi fi-rr-angle-small-down"></i>
                            </div>
                            <div className="tab-content" style={{ display: openTabs[tab] ? 'block' : 'none', height: tabHeights[tab] }}>
                                <Component {...tabProps[tab]} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ReviewTest;