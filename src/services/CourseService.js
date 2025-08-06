import database from '@react-native-firebase/database';

class CourseService {
  constructor() {
    this.coursesRef = database().ref('courses');
    this.userCoursesRef = database().ref('userCourses');
  }

  // Get all courses
  async getAllCourses() {
    try {
      const snapshot = await this.coursesRef.once('value');
      const coursesData = snapshot.val();
      
      if (!coursesData) {
        return {
          success: true,
          courses: []
        };
      }

      // Convert Firebase object to array with IDs
      const courses = Object.entries(coursesData).map(([id, course]) => ({
        id,
        ...course
      }));

      return {
        success: true,
        courses: courses
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return {
        success: false,
        error: error.message,
        courses: []
      };
    }
  }

  // Get courses by category
  async getCoursesByCategory(category) {
    try {
      const result = await this.getAllCourses();
      if (!result.success) {
        return result;
      }

      const filteredCourses = result.courses.filter(course => 
        course.categories && course.categories.includes(category)
      );

      return {
        success: true,
        courses: filteredCourses
      };
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      return {
        success: false,
        error: error.message,
        courses: []
      };
    }
  }

  // Get course by ID
  async getCourseById(courseId) {
    try {
      const snapshot = await this.coursesRef.child(courseId).once('value');
      const courseData = snapshot.val();
      
      if (!courseData) {
        return {
          success: false,
          error: 'Course not found',
          course: null
        };
      }

      return {
        success: true,
        course: {
          id: courseId,
          ...courseData
        }
      };
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      return {
        success: false,
        error: error.message,
        course: null
      };
    }
  }

  // Get user's assigned courses
  async getUserCourses(userId) {
    try {
      const userCoursesSnapshot = await this.userCoursesRef.child(userId).once('value');
      const userCoursesData = userCoursesSnapshot.val();
      
      if (!userCoursesData) {
        return {
          success: true,
          courses: []
        };
      }

      // Get course details for each assigned course
      const courseIds = Object.keys(userCoursesData);
      const coursePromises = courseIds.map(courseId => this.getCourseById(courseId));
      const courseResults = await Promise.all(coursePromises);
      
      const courses = courseResults
        .filter(result => result.success)
        .map(result => ({
          ...result.course,
          assignmentData: userCoursesData[result.course.id]
        }));

      return {
        success: true,
        courses: courses
      };
    } catch (error) {
      console.error('Error fetching user courses:', error);
      return {
        success: false,
        error: error.message,
        courses: []
      };
    }
  }

  // Listen to courses changes (real-time)
  onCoursesChanged(callback) {
    const listener = this.coursesRef.on('value', (snapshot) => {
      const coursesData = snapshot.val();
      
      if (!coursesData) {
        callback([]);
        return;
      }

      const courses = Object.entries(coursesData).map(([id, course]) => ({
        id,
        ...course
      }));

      callback(courses);
    });

    // Return unsubscribe function
    return () => this.coursesRef.off('value', listener);
  }

  // Listen to user courses changes (real-time)
  onUserCoursesChanged(userId, callback) {
    const listener = this.userCoursesRef.child(userId).on('value', async (snapshot) => {
      const userCoursesData = snapshot.val();
      
      if (!userCoursesData) {
        callback([]);
        return;
      }

      try {
        // Get course details for each assigned course
        const courseIds = Object.keys(userCoursesData);
        const coursePromises = courseIds.map(courseId => this.getCourseById(courseId));
        const courseResults = await Promise.all(coursePromises);
        
        const courses = courseResults
          .filter(result => result.success)
          .map(result => ({
            ...result.course,
            assignmentData: userCoursesData[result.course.id]
          }));

        callback(courses);
      } catch (error) {
        console.error('Error in user courses listener:', error);
        callback([]);
      }
    });

    // Return unsubscribe function
    return () => this.userCoursesRef.child(userId).off('value', listener);
  }

  // Search courses
  async searchCourses(searchTerm) {
    try {
      const result = await this.getAllCourses();
      if (!result.success) {
        return result;
      }

      const searchLower = searchTerm.toLowerCase();
      const filteredCourses = result.courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        (course.introduction && course.introduction.toLowerCase().includes(searchLower)) ||
        (course.syllabus && course.syllabus.toLowerCase().includes(searchLower))
      );

      return {
        success: true,
        courses: filteredCourses
      };
    } catch (error) {
      console.error('Error searching courses:', error);
      return {
        success: false,
        error: error.message,
        courses: []
      };
    }
  }

  // Check if user is enrolled in a course
  async isUserEnrolledInCourse(userId, courseId) {
    try {
      const snapshot = await this.userCoursesRef.child(`${userId}/${courseId}`).once('value');
      return {
        success: true,
        isEnrolled: snapshot.exists()
      };
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return {
        success: false,
        error: error.message,
        isEnrolled: false
      };
    }
  }

  // Get course statistics
  async getCourseStatistics() {
    try {
      const coursesResult = await this.getAllCourses();
      if (!coursesResult.success) {
        return coursesResult;
      }

      const courses = coursesResult.courses;
      const total = courses.length;
      
      const categoryCounts = {
        coding: courses.filter(c => c.categories?.includes('coding')).length,
        business: courses.filter(c => c.categories?.includes('business')).length,
        designing: courses.filter(c => c.categories?.includes('designing')).length,
        digital_literacy: courses.filter(c => c.categories?.includes('digital_literacy')).length
      };

      return {
        success: true,
        statistics: {
          total,
          categoryCounts
        }
      };
    } catch (error) {
      console.error('Error getting course statistics:', error);
      return {
        success: false,
        error: error.message,
        statistics: null
      };
    }
  }
}

export default new CourseService();
