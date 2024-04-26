import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import TestReviewHeader from "../../components/TestReview/TestReviewHeader/TestReviewHeader";
import CodePreview from "../../components/TestReview/CodePreview/CodePreview";
import CurrentStudentInfo from "../../components/TestReview/CurrentStudentInfo/CurrentStudentInfo";
import CodeSelector from "../../components/TestReview/CodeSelector/CodeSelector";
import CodeSelectorInfo from "../../components/TestReview/CodeSelectorInfo/CodeSelectorInfo";
import EmulatorDebuggerTab from "../../components/TestReview/EmulatorDebuggerTab/EmulatorDebuggerTab";
import './reviewTest.css';

const ReviewTest = () => {
    const { id, testid, studentId } = useParams();
    const [studentData, setStudentData] = React.useState(null);
    const [testData, setTestData] = React.useState(null);
    const [studentResult, setStudentResult] = React.useState(null);
    const [targetTaskNo, setTargetTaskNo] = React.useState(null);
    const [targetTestNo, setTargetTestNo] = React.useState(null);
    const [pc, setPc] = React.useState(null);

    const [studentGrading, setStudentGrading] = React.useState(null);
    const [maxPoints, setMaxPoints] = useState(0);
    const [currentPoints, setCurrentPoints] = useState(0);

    const [studentGradingResults, setStudentGradingResults] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    const [debbugLine, setDebbugLine] = useState([]);
    const [debbugFile, setDebbugFile] = useState(null);
    const [breakpoints, setBreakpoints] = useState([]);

    const [openTabs, setOpenTabs] = useState({});
    const tabComponents = {
        'EMULATOR & DEBUGGER': EmulatorDebuggerTab,
    };
    const tabProps = {
        'EMULATOR & DEBUGGER': { taskNo: targetTaskNo, testNo: targetTestNo, pc: pc, setDebbugLine: setDebbugLine, setDebbugFile: setDebbugFile, breakpoints: breakpoints},
    };

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
            console.log("STUDENT GRADING", studentGrading);
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

    const toggleTab = (tabName) => {
        setOpenTabs(prev => ({ ...prev, [tabName]: !prev[tabName] }));
    };


    if (isLoading) return <p>Loading...</p>;

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <TestReviewHeader />
            <div className='review-content'>
                <div className="left-column">
                    <CodePreview pc={pc} taskNo={targetTaskNo} testNo={targetTestNo} lineNumber={debbugLine} debbugFile={debbugFile} setBreakpoints={setBreakpoints} />
                </div>
                <div className="right-column">
                    <CurrentStudentInfo student={studentData} currentPoints={currentPoints} maxPoints={maxPoints}/>
                    <CodeSelectorInfo
                        testData={testData}
                        codeTask={targetTaskNo}
                        codeTest={targetTestNo}
                        grading={studentGrading}
                        savePoints={savePoints}
                        setStudentGradingResults={setStudentGradingResults}
                        setTotalPoints={setCurrentPoints}
                    />
                    <CodeSelector testData={testData} setCode={setTargetTaskNo} setCodeTest={setTargetTestNo}/>
    
                    {Object.entries(tabComponents).map(([tab, Component]) => (
                        <div className="review-tab-wrap" key={tab}>
                            <div className={`review-tab ${openTabs[tab] ? 'review-tab-active' : ''}`} onClick={() => toggleTab(tab)}>
                                <i className="fi fi-rr-angle-small-down"></i>
                                <h2 className="review-tab-name">{tab}</h2>
                                <i className="fi fi-rr-angle-small-down"></i>
                            </div>
                            {openTabs[tab] && (
                                <div className="tab-content">
                                    <Component {...tabProps[tab]} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ReviewTest;