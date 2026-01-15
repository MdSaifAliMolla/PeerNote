'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import styles from '../../../styles/Admin.module.css';
import { getAuthHeaders } from '../../../utils/getAuthHeaders';
import { getCentralServerBaseUrl } from '../../../utils/env';
import MetadataManager from '../../../components/MetadataManager';

interface User {
  id: number;
  username: string;
  email: string;
  ip_address: string | null;
  last_poll: string;
  points: number;
  is_admin: boolean;
  is_banned: boolean;
  createdAt: string;
}

interface File {
  id: number;
  filename: string;
  author: string;
  topic: string;
  created_at: string;
  is_disabled: boolean;
  report_count: number;
}

interface Stats {
  totalUsers: number;
  totalFiles: number;
  activePeers: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      let url = '';
      if (tab === 'users') url = `${getCentralServerBaseUrl()}/api/admin/users/`;
      else if (tab === 'files') url = `${getCentralServerBaseUrl()}/api/admin/files/`;
      else if (tab === 'stats') url = `${getCentralServerBaseUrl()}/api/admin/stats/`;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (res.status === 403) setError('Admin access required');
        else setError('Failed to fetch data');
        return;
      }
      const data = await res.json();

      if (tab === 'users') setUsers(data);
      else if (tab === 'files') setFiles(data);
      else if (tab === 'stats') setStats(data);

    } catch (e) {
      if(tab!='metadata')
        setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: number, isBanned: boolean) => {
    if (isBanned) {
      await fetch(`${getCentralServerBaseUrl()}/api/admin/users/${userId}/unban/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } else {
      const reason = prompt('Reason for banning:');
      if (!reason) return;
      await fetch(`${getCentralServerBaseUrl()}/api/admin/users/${userId}/ban/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
    }
    fetchData('users');
  };

  const handleToggleAdmin = async (userId: number) => {
    if (!confirm("Are you sure you want to toggle admin status?")) return;
    await fetch(`${getCentralServerBaseUrl()}/api/admin/users/${userId}/toggle-admin/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    fetchData('users');
  };

  const handleFileAction = async (fileId: number, action: 'disable' | 'enable' | 'delete') => {
    const headers = getAuthHeaders();
    if (action === 'delete') {
      if (!confirm('Are you sure? This cannot be undone.')) return;
      await fetch(`${getCentralServerBaseUrl()}/api/admin/files/${fileId}/`, { method: 'DELETE', headers });
    } else if (action === 'disable') {
      const reason = prompt('Reason for disabling:');
      if (!reason) return;
      await fetch(`${getCentralServerBaseUrl()}/api/admin/files/${fileId}/disable/`, {
        method: 'POST', headers, body: JSON.stringify({ reason })
      });
    } else {
      await fetch(`${getCentralServerBaseUrl()}/api/admin/files/${fileId}/enable/`, { method: 'POST', headers });
    }
    fetchData('files');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src="/PeerNotes.png" alt="PeerNotes Logo" className={styles.logo} />
      </div>

      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.tabs}>
          {['users', 'files', 'stats', 'metadata'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            {activeTab === 'users' && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>Username</th>
                    <th className={styles.th}>Email</th>
                    <th className={styles.th}>Points</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className={styles.td}>{user.id}</td>
                      <td className={styles.td}>
                        {user.username} {user.is_admin && '🛡️'}
                      </td>
                      <td className={styles.td}>{user.email}</td>
                      <td className={styles.td}>{user.points}</td>
                      <td className={styles.td}>
                        {user.is_banned ? (
                          <span className={styles.statusBanned}>BANNED</span>
                        ) : (
                          <span className={styles.statusActive}>Active</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <button onClick={() => handleBanUser(user.id, user.is_banned)} className={`${styles.btn} ${styles.btnSmall} ${user.is_banned ? styles.btnSuccess : styles.btnWarning}`}>
                          {user.is_banned ? 'Unban' : 'Ban'}
                        </button>
                        <button onClick={() => handleToggleAdmin(user.id)} className={`${styles.btn} ${styles.btnSmall} ${styles.btnPrimary}`} style={{ marginLeft: '5px' }}>
                          Toggle Admin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'files' && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>Filename</th>
                    <th className={styles.th}>Author</th>
                    <th className={styles.th}>Topic</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => (
                    <tr key={file.id}>
                      <td className={styles.td}>{file.id}</td>
                      <td className={styles.td}>{file.filename}</td>
                      <td className={styles.td}>{file.author}</td>
                      <td className={styles.td}>{file.topic}</td>
                      <td className={styles.td}>
                        {file.is_disabled ? 'Disabled' : 'Good'}
                      </td>
                      <td className={styles.td}>
                        {file.is_disabled ? (
                          <button onClick={() => handleFileAction(file.id, 'enable')} className={`${styles.btn} ${styles.btnSmall} ${styles.btnSuccess}`}>Enable</button>
                        ) : (
                          <button onClick={() => handleFileAction(file.id, 'disable')} className={`${styles.btn} ${styles.btnSmall} ${styles.btnWarning}`}>Disable</button>
                        )}
                        <button onClick={() => handleFileAction(file.id, 'delete')} className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`} style={{ marginLeft: '5px' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'stats' && stats && (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3>Total Users</h3>
                  <p>{stats.totalUsers}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Files</h3>
                  <p>{stats.totalFiles}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Active Peers (1h)</h3>
                  <p>{stats.activePeers}</p>
                </div>
              </div>
            )}

            {activeTab === 'metadata' && (
              <MetadataManager />
            )}
          </>
        )}

      </div>
    </div>
  );
}
