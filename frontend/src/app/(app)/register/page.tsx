'use client';

import '../../../styles/RegisterFile.css';

import { RegisteredFile, Status, Professor, Course, Topic, Semester } from '../../../types/types';
import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../../utils/getAuthHeaders';
import { getSessionCookie } from '../../../contexts/session';
import { getCentralServerBaseUrl, getPeerServiceBaseUrl } from '../../../utils/env';
import Toast from '../../../components/Toast';

export default function RegisterFilePage() {
  const [serverFiles, setServerFiles] = useState<RegisteredFile[]>([]);
  const [registeredFiles, setRegisteredFiles] = useState<RegisteredFile[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchServerFiles();
  }, []);

  useEffect(() => {
    fetch(`${getPeerServiceBaseUrl()}/files`, {
      method: 'GET',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Peer service /files failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const files: string[] = (data.files ?? []).map((file: string) => {
          return file.replace(/\s/g, '_');
        });

        setRegisteredFiles(
          serverFiles.map((file) => {
            if (files.includes(file.filename)) {
              return { ...file, status: Status.HOSTED };
            }
            return { ...file, status: Status.PRIVATE };
          })
        );
      })
      .catch(() => {
        setRegisteredFiles(serverFiles.map((file) => ({ ...file, status: Status.PRIVATE })));
      });
  }, [serverFiles]);

  const fetchServerFiles = () => {
    fetch(`${getCentralServerBaseUrl()}/api/get-peer-files/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        setServerFiles(data);
      })
      .catch((error) => console.error(error));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fileInput = document.getElementById('file') as HTMLInputElement | null;
    const selectedFile = fileInput?.files?.[0] ?? null;
    if (!selectedFile) {
      setToast({ message: 'No file selected', type: 'error' });
      return;
    }

    const filename = selectedFile.name.replace(/\s/g, '_');
    const formData = new FormData(event.target as HTMLFormElement);
    const topic = formData.get('topic');
    if (!topic) {
      setToast({ message: 'Topic is required', type: 'error' });
      return;
    }

    try {
      const registerResponse = await fetch(`${getCentralServerBaseUrl()}/api/register/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          filename: filename,
          topic: topic,
          semester: formData.get('semester'),
          professor: formData.get('professor'),
          course: formData.get('course'),
        }),
      });

      if (!registerResponse.ok) {
        const errText = await registerResponse.text();
        throw new Error(`Register failed (${registerResponse.status}): ${errText}`);
      }

      const registerData = await registerResponse.json();
      const fileId = registerData?.id;
      if (!fileId) {
        throw new Error('Register response missing file id');
      }

      formData.append('file_id', String(fileId));

      const copyResponse = await fetch(`${getPeerServiceBaseUrl()}/copy-file`, {
        method: 'POST',
        body: formData,
      });

      if (!copyResponse.ok) {
        const errText = await copyResponse.text();
        throw new Error(`Peer copy-file failed (${copyResponse.status}): ${errText}`);
      }

      await copyResponse.text();
      setToast({ message: 'File uploaded successfully!', type: 'success' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error(error);
      setToast({ message: error.message || 'Upload failed', type: 'error' });
    }
  };

  interface Filters extends Record<string, string> {
    professor: string;
    course: string;
    topic: string;
    semester: string;
  }

  const [filters, setFilters] = useState<Filters>({
    professor: '',
    course: '',
    topic: '',
    semester: '',
  });
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    if (!getSessionCookie()) {
      return;
    }
    fetchProfessors();
    fetchCourses();
    fetchTopics();
    fetchSemesters();
  }, []);

  const fetchProfessors = async () => {
    try {
      const response = await fetch(`${getCentralServerBaseUrl()}/api/professors`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setProfessors(data);
      }
    } catch (error) {
      console.error('Error fetching professors:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${getCentralServerBaseUrl()}/api/courses`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch(`${getCentralServerBaseUrl()}/api/topics`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await fetch(`${getCentralServerBaseUrl()}/api/semesters`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setSemesters(data);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((prevFilters: Filters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="file-upload-card">
        <h1>Upload a File</h1>
        <p>Host a local file for the GT community!</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="file">File</label>
          <input type="file" name="file" id="file" />
          <div className="filter-item">
            <label htmlFor="professors">Professors:</label>
            <select
              id="professors"
              name="professor"
              value={filters.professor}
              onChange={handleChange}
            >
              <option value="">Select a Professor</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="courses">Course:</label>
            <select id="courses" name="course" value={filters.course} onChange={handleChange}>
              <option value="">Select a Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="topics">Topic:</label>
            <select id="topics" name="topic" value={filters.topic} onChange={handleChange}>
              <option value="">Select a Topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="semesters">Semester:</label>
            <select
              id="semester"
              name="semester"
              value={filters.semester}
              onChange={handleChange}
            >
              <option value="">Select a Semester</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
      <div>
        <h1>Registered Files</h1>
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Topic</th>
              <th>Course</th>
              <th>Original Author</th>
              <th>Professor</th>
              <th>Semester</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {registeredFiles.map((file) => (
              <tr key={file.id}>
                <td>{file.filename}</td>
                <td>{file.topic?.name ?? ''}</td>
                <td>{file.course?.name ?? ''}</td>
                <td>{file.original_author?.username ?? ''}</td>
                <td>{file.professor?.name ?? ''}</td>
                <td>{file.semester?.name ?? ''}</td>
                <td>{file.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
