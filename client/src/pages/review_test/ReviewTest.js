import React from "react";
import { useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import TestReviewHeader from "../../components/TestReview/TestReviewHeader/TestReviewHeader";
import CodePreview from "../../components/TestReview/CodePreview/CodePreview";
import './reviewTest.css';

const ReviewTest = () => {
    const { id, testid } = useParams();

    return (
        <div className='wrap'>
            <link href="https://cdn.jsdelivr.net/npm/prismjs@1.24.1/themes/prism.css" rel="stylesheet"/>
            <ToastContainer theme="dark" />
            <TestReviewHeader />
            <div className='review-content'>
                <div className="left-column">
                    <CodePreview />
                </div>

                <div className="right-column">

                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/prismjs@1.24.1/prism.js"></script>
        </div>
    );
}

export default ReviewTest;