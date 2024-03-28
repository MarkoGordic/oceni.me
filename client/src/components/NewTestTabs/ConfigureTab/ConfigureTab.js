import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';

const ConfigureTab = ({ isLoading }) => {
    return (
        isLoading ? (
            <div className="loader"></div>
        ) : (
            <div className="newtest-wrap">
                test1
            </div>
        )
    );
};

export default ConfigureTab;