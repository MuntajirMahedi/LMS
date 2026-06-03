import { useState, useEffect } from 'react';

// Format: { 'YYYY-MM-DD': { 'userId': boolean } }
type AttendanceRecord = Record<string, Record<string, boolean>>;

export const useStaffAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord>({});

  useEffect(() => {
    const loadAttendance = () => {
      const stored = localStorage.getItem('school_staff_attendance');
      if (stored) {
        try {
          setAttendance(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse attendance data");
        }
      }
    };
    loadAttendance();
  }, []);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const markPresent = (userId: string) => {
    const today = getTodayDateString();
    setAttendance((prev) => {
      const newAttendance = { ...prev };
      if (!newAttendance[today]) {
        newAttendance[today] = {};
      }
      newAttendance[today][userId] = true;
      localStorage.setItem('school_staff_attendance', JSON.stringify(newAttendance));
      return newAttendance;
    });
  };

  const isStaffPresent = (userId: string, date: string = getTodayDateString()) => {
    return attendance[date]?.[userId] || false;
  };

  const getAllAttendanceForDate = (date: string = getTodayDateString()) => {
    return attendance[date] || {};
  };

  return {
    markPresent,
    isStaffPresent,
    getAllAttendanceForDate,
    getTodayDateString,
  };
};
