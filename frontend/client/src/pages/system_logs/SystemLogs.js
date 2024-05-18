import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import './systemLogs.css';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const pageSize = 15;
    const [hasMore, setHasMore] = useState(false);
    const [severity, setSeverity] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const tableContainerRef = useRef(null);

    useEffect(() => {
        const adjustTableHeight = () => {
            const contentHeight = document.querySelector('.content').clientHeight;
            const filtersHeight = document.querySelector('.filters').clientHeight;
            const paginationHeight = document.querySelector('.pagination').clientHeight;
            const availableHeight = contentHeight - filtersHeight - paginationHeight - 130;
            if (tableContainerRef.current) {
                tableContainerRef.current.style.height = `${availableHeight}px`;
            }
        };

        window.addEventListener('resize', adjustTableHeight);
        adjustTableHeight();

        return () => {
            window.removeEventListener('resize', adjustTableHeight);
        };
    }, []);

    useEffect(() => {
        fetchLogs(page);
    }, [page, severity, startDate, endDate]);

    const fetchLogs = async (page) => {
        const formatDate = (dateString) => {
            return dateString ? new Date(dateString).toISOString() : null;
        };
    
        await fetch('http://localhost:8000/logs/fetch_logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employeeId: null,
                offset: page * pageSize,
                limit: pageSize + 1,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                severity: severity
            }),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.logs.length > pageSize) {
                setHasMore(true);
                setLogs(data.logs.slice(0, pageSize));
            } else {
                setHasMore(false);
                setLogs(data.logs);
            }
        })
        .catch(error => {
            toast.error('Došlo je do greške prilikom preuzimanja istorije aktivnosti.');
        });
    };

    const handleNext = () => {
        setPage(page + 1);
    };

    const handlePrevious = () => {
        if (page > 0) setPage(page - 1);
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'DEBUG':
                return '#808080';
            case 'INFO':
                return '#007bff';
            case 'UPOZORENJE':
                return '#ffc107';
            case 'GREŠKA':
                return '#dc3545';
            case 'KRITIČNO':
                return '#ff00ff';
            default:
                return '#000';
        }
    };
    

    return (
        <div className='wrap'>
            <ToastContainer theme="dark" />
            <Sidebar />
            <div className='content'>
                <h1>Istorija Aktivnosti</h1>
                <div className="filters">
                    <select value={severity} onChange={e => setSeverity(e.target.value)}>
                        <option value="">Sve Ozbiljnosti</option>
                        <option value="DEBUG">DEBUG</option>
                        <option value="INFO">INFO</option>
                        <option value="UPOZORENJE">UPOZORENJE</option>
                        <option value="GREŠKA">GREŠKA</option>
                        <option value="KRITIČNO">KRITIČNO</option>
                    </select>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="date-picker"
                        placeholder="Početni datum"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="date-picker"
                        placeholder="Završni datum"
                    />
                </div>
                <div className="logs-table-container" ref={tableContainerRef}>
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Vreme</th>
                                <th>Poruka</th>
                                <th>Ozbiljnost</th>
                                <th>Tip</th>
                                <th>IP Adresa</th>
                                <th>Izvršio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <tr key={index}>
                                    <td>
                                        {new Intl.DateTimeFormat('sr-Latn-RS', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            timeZone: 'Europe/Belgrade'
                                        }).format(new Date(log.created_at))}
                                    </td>
                                    <td>{log.message}</td>
                                    <td style={{color: getSeverityColor(log.severity)}}>{log.severity}</td>
                                    <td>{log.log_type}</td>
                                    <td>{log.ip}</td>
                                    <td>{log.employee || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pagination">
                        <button onClick={handlePrevious} disabled={page <= 0}><i class="fi fi-rr-angle-double-left"></i></button>
                        <button onClick={handleNext} disabled={!hasMore}><i class="fi fi-rr-angle-double-right"></i></button>
                </div>
            </div>
        </div>
    );
}

export default SystemLogs;
