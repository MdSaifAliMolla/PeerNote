import React, { useState } from 'react';
import styles from '../styles/Admin.module.css';
import { getAuthHeaders } from '../utils/getAuthHeaders';
import { getCentralServerBaseUrl } from '../utils/env';

export default function MetadataManager() {
    const [resource, setResource] = useState('topics');
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!name) {
            setError('Name is required');
            return;
        }

        try {
            const url = `${getCentralServerBaseUrl()}/api/${resource}/`;
            const body: any = { name };
            if (resource === 'courses') {
                body.number = number;
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create resource');
            }

            setSuccess(`Successfully created ${resource.slice(0, -1)}: ${name}`);
            setName('');
            setNumber('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.card}>
            <h2 style={{ marginBottom: '20px' }}>Manage Metadata</h2>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Resource Type:</label>
                <select
                    value={resource}
                    onChange={(e) => setResource(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value="topics">Topic</option>
                    <option value="professors">Professor</option>
                    <option value="courses">Course</option>
                    <option value="semesters">Semester</option>
                </select>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        placeholder={`Enter ${resource.slice(0, -1)} name`}
                    />
                </div>

                {resource === 'courses' && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Course Number:</label>
                        <input
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            placeholder="e.g. 1331"
                        />
                    </div>
                )}

                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>{success}</div>}

                <button type="submit" className={`${styles.btn}`}>
                    Add {resource.charAt(0).toUpperCase() + resource.slice(1, -1)}
                </button>
            </form>
        </div>
    );
}
