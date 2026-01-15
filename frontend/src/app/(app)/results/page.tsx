'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import styles from '../../../styles/Results.module.css';
import { getAuthHeaders } from '../../../utils/getAuthHeaders';
import { File } from '../../../types/types';
import { getCentralServerBaseUrl, getPeerServiceBaseUrl } from '../../../utils/env';

const ResultsPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [votingFileIds, setVotingFileIds] = useState<Set<number>>(new Set());
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearchAgain = () => {
    router.push('/search');
  };

  const handleVote = async (fileId: number, voteType: 'upvote' | 'downvote') => {
    if (votingFileIds.has(fileId)) return;
    setVotingFileIds(prev => new Set(prev).add(fileId));
    try {
      const response = await fetch(`${getCentralServerBaseUrl()}/api/files/${fileId}/${voteType}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Vote failed (${response.status})`);
      }
      // Refresh the file list to reflect updated vote counts
      await fetchFiles();
    } catch (e) {
      console.error('Vote error:', e);
    } finally {
      setVotingFileIds(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const queryString = searchParams.toString();
      const response = await fetch(
        `${getCentralServerBaseUrl()}/api/files/filter${queryString ? `?${queryString}` : ''}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFiles(data);
    } catch (e) {
      console.error('Could not fetch files', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [searchParams]);


  if (isLoading) return <div>Loading...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src="/PeerNotes.png" alt="PeerNotes Logo" className={styles.logo} />
        <button onClick={handleSearchAgain} className={styles.searchAgainButton}>
          Search Again
        </button>
      </div>
      <div className={styles.resultsContainer}>
        {isLoading ? (
          <p>Loading...</p>
        ) : files.length ? (
          <table>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Topic</th>
                <th>Course</th>
                <th>Professor</th>
                <th>Semester</th>
                <th>Upvotes</th>
                <th>Downvotes</th>
                <th>Peers</th>
                <th>Original Author</th>
                <th>Actions</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.filename}</td>
                  <td>{file.topic?.name ?? ''}</td>
                  <td>
                    {file.course?.name ?? ''} {file.course?.number ?? ''}
                  </td>
                  <td>{file.professor?.name ?? ''}</td>
                  <td>{file.semester?.name ?? ''}</td>
                  <td>{file.upvotes?.length ?? 0}</td>
                  <td>{file.downvotes?.length ?? 0}</td>
                  <td>{file.peer_users?.filter(p => p.username !== file.original_author?.username).length ?? 0}</td>
                  <td>{file.original_author?.username ?? ''}</td>
                  <td>
                    <button
                      onClick={() => handleVote(file.id, 'upvote')}
                      disabled={votingFileIds.has(file.id)}
                      aria-label="Upvote"
                      style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleVote(file.id, 'downvote')}
                      disabled={votingFileIds.has(file.id)}
                      aria-label="Downvote"
                      style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                    >
                      👎
                    </button>
                  </td>
                  <td>
                    <DownloadButton file={file} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;

function DownloadButton({ file }: { file: File }) {
  const [success, setSuccess] = useState(false);

  const ip =
    // Prefer a peer host IP if provided by the filter endpoint
    file.peer_users?.find((p) => p?.ip_address)?.ip_address ??
    file.original_author?.ip_address;

  const handleDownload = () => {
    fetch(`${getPeerServiceBaseUrl()}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: file.id,
        filename: file.filename,
        ip: ip,
      }),
    })
      .then((response) => response.text())
      .then(() => {
        return fetch(`${getCentralServerBaseUrl()}/api/files/${file.id}/add-peer/`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add peer');
        }
        setSuccess(true);
      })
      .catch((error) => {
        console.error('Error:', error);
        setSuccess(false);
      });
  };

  return success ? (
    <Link href="/register">Downloaded!</Link>
  ) : (
    <button onClick={handleDownload} disabled={!ip}>
      Download
    </button>
  );
}
