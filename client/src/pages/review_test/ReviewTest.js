import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import TestReviewHeader from "../../components/TestReview/TestReviewHeader/TestReviewHeader";
import CodePreview from "../../components/TestReview/CodePreview/CodePreview";
import CurrentStudentInfo from "../../components/TestReview/CurrentStudentInfo/CurrentStudentInfo";
import CodeSelector from "../../components/TestReview/CodeSelector/CodeSelector";
import CodeSelectorInfo from "../../components/TestReview/CodeSelectorInfo/CodeSelectorInfo";
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

    const [isLoading, setIsLoading] = useState(false);

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

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <TestReviewHeader />
            <div className='review-content'>
                <div className="left-column">
                    <CodePreview pc={pc} taskNo={targetTaskNo} />
                </div>

                <div className="right-column">
                    <CurrentStudentInfo student={studentData} currentPoints={currentPoints} maxPoints={maxPoints}/>
                    <CodeSelectorInfo testData={testData} codeTask={targetTaskNo} codeTest={targetTestNo} grading={studentGrading}/>
                    <CodeSelector testData={testData} setCode={setTargetTaskNo} setCodeTest={setTargetTestNo}/>

                    <div className="review-tab">
                        <i className="fi fi-rr-angle-small-down"></i>
                        <h2>EMULATOR & DEBUGGER</h2>
                        <i className="fi fi-rr-angle-small-down"></i>
                    </div>

                    <div className="review-tab">
                        <i className="fi fi-rr-angle-small-down"></i>
                        <h2>SISTEMSKI REGISTRI & FLAGOVI</h2>
                        <i className="fi fi-rr-angle-small-down"></i>
                    </div>

                    <div className="review-tab">
                        <i className="fi fi-rr-angle-small-down"></i>
                        <h2>SISTEMSKI POZIVI</h2>
                        <i className="fi fi-rr-angle-small-down"></i>
                    </div>

                    <div className="review-tab">
                        <i className="fi fi-rr-angle-small-down"></i>
                        <h2>PLAGIJAT PROVERA</h2>
                        <i className="fi fi-rr-angle-small-down"></i>
                    </div>

                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/prismjs@1.24.1/prism.js"></script>
        </div>
    );
}

export default ReviewTest;