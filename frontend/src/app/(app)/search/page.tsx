'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import '../../../styles/MainScreenWrapper.css';
import { getAuthHeaders } from '../../../utils/getAuthHeaders';
import { Professor, Course, Topic, Semester } from '../../../types/types';
import { getSessionCookie } from '../../../contexts/session';
import { getCentralServerBaseUrl } from '../../../utils/env';

interface Filters extends Record<string, string> {
  professor: string;
  course: string;
  topic: string;
  semester: string;
}

const MainSearchPage: React.FC = () => {
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
  const router = useRouter();

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
      const response = await fetch(`${getCentralServerBaseUrl()}/api/professors/`, {
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchParams = new URLSearchParams(filters);
    router.push(`/results?${searchParams.toString()}`);
  };

  return (
    <>
      <img src="/PeerNotes.png" alt="PeerNotes Logo" style={{ height: '100px' }} />
      <form onSubmit={handleSubmit} className="filter-container">
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
          <select id="semester" name="semester" value={filters.semester} onChange={handleChange}>
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
    </>
  );
};

export default MainSearchPage;
