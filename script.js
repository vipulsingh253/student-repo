// Student Registration System JavaScript

// Global variables to store student data and current editing index
let studentsData = [];
let editingIndex = -1;                                                    

// DOM elements - getting references to HTML elements
const studentForm = document.getElementById('studentForm');
const studentsTableBody = document.getElementById('studentsTableBody');
const noRecordsDiv = document.getElementById('noRecords');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    displayStudents();
       
    studentForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    searchInput.addEventListener('input', handleSearch);
});

// Function for form submission
function handleFormSubmit(e) {
    e.preventDefault(); // Stop form from submitting normally 
    
    // Get form data
    const formData = {
        name: document.getElementById('studentName').value.trim(),
        id: document.getElementById('studentId').value.trim(),
        email: document.getElementById('emailId').value.trim(),
        contact: document.getElementById('contactNo').value.trim()
    };

    
    if (!validateForm(formData)) {
        return; // Stop if validation fails
    }

    // Check if we're editing or adding new student
    if (editingIndex >= 0) {
        // Update existing student
        studentsData[editingIndex] = formData;
        editingIndex = -1;
        submitBtn.textContent = 'Add Student';
        cancelBtn.style.display = 'none';
        alert('Student record updated successfully!');
    } else {
        // Add new student
        studentsData.push(formData);
        alert('Student registered successfully!');
    }
    
    // Save to localStorage and refresh display
    saveDataToStorage();
    displayStudents();
    clearForm();
}


// Function to validate form inputs
function validateForm(data) {
    let isValid = true;
    
    // Clear previous error messages
    clearErrors();
    
    // Validate student name (only letters and spaces)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!data.name) {
        showError('nameError', 'Student name is required');
        isValid = false;
    } else if (!nameRegex.test(data.name)) {
        showError('nameError', 'Name should contain only letters and spaces');
        isValid = false;
    }
    
    // Validate student ID (only numbers)
    const idRegex = /^\d+$/;
    if (!data.id) {
        showError('idError', 'Student ID is required');
        isValid = false;
    } else if (!idRegex.test(data.id)) {
        showError('idError', 'Student ID should contain only numbers');
        isValid = false;
    } else if (isDuplicateId(data.id)) {
        showError('idError', 'Student ID already exists');
        isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(data.email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate contact number 
    const contactRegex = /^\d{10}$/;
    if (!data.contact) {
        showError('contactError', 'Contact number is required');
        isValid = false;
    } else if (!contactRegex.test(data.contact)) {
        showError('contactError', 'Contact number should be exactly 10 digits');
        isValid = false;
    }
    
    return isValid;
}

// Function to check if student ID already exists
function isDuplicateId(id) {
    return studentsData.some((student, index) => {
        return student.id === id && index !== editingIndex;
    });
}

// Function to show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    
    // Add error class to input field
    const inputElement = errorElement.previousElementSibling;
    inputElement.classList.add('error');
}

// Function to clear all error messages
function clearErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    // Remove error class from input fields
    const inputElements = document.querySelectorAll('.form-group input');
    inputElements.forEach(input => {
        input.classList.remove('error');
    });
}

// Function to display students in the table
function displayStudents(studentsToShow = studentsData) {
    // Clear existing table rows
    studentsTableBody.innerHTML = '';
    
    // Show/hide no records message
    if (studentsToShow.length === 0) {
        noRecordsDiv.style.display = 'block';
        return;
    } else {
        noRecordsDiv.style.display = 'none';
    }
    
    // Create table rows for each student
    studentsToShow.forEach((student, index) => {
        const row = document.createElement('tr');
        row.className = 'new-row'; // For animation
        
        // Find the original index in studentsData
        const originalIndex = studentsData.indexOf(student);
        
        row.innerHTML = `
            <td>${originalIndex + 1}</td>
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td>${student.email}</td>
            <td>${student.contact}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editStudent(${originalIndex})">Edit</button>
                    <button class="delete-btn" onclick="deleteStudent(${originalIndex})">Delete</button>
                </div>
            </td>
        `;
        
        studentsTableBody.appendChild(row);
    });
}

// Function to edit a student record
function editStudent(index) {
    const student = studentsData[index];
    
    // Fill form with student data
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentId').value = student.id;
    document.getElementById('emailId').value = student.email;
    document.getElementById('contactNo').value = student.contact;
    
    // Update UI for editing mode
    editingIndex = index;
    submitBtn.textContent = 'Update Student';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Function to cancel editing
function cancelEdit() {
    editingIndex = -1;
    submitBtn.textContent = 'Add Student';
    cancelBtn.style.display = 'none';
    clearForm();
}

// Function to delete a student record
function deleteStudent(index) {
    const student = studentsData[index];
    
    // Confirm deletion
    const confirmed = confirm(`Are you sure you want to delete ${student.name}'s record?`);
    
    if (confirmed) {
        // Remove student from array
        studentsData.splice(index, 1);
        
        // If we were editing this student, cancel edit mode
        if (editingIndex === index) {
            cancelEdit();
        } else if (editingIndex > index) {
            // Adjust editing index if needed
            editingIndex--;
        }
        
        // Save and refresh display
        saveDataToStorage();
        displayStudents();
        alert('Student record deleted successfully!');
    }
}

// Function to handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Show all students if search is empty
        displayStudents();
        return;
    }
    
    // Filter students based on search term
    const filteredStudents = studentsData.filter(student => {
        return student.name.toLowerCase().includes(searchTerm) ||
               student.id.includes(searchTerm) ||
               student.email.toLowerCase().includes(searchTerm);
    });
    
    displayStudents(filteredStudents);
}

// Function to clear the form
function clearForm() {
    studentForm.reset();
    clearErrors();
}

// Function to save data to localStorage
function saveDataToStorage() {
    try {
        localStorage.setItem('studentsData', JSON.stringify(studentsData));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Error saving data. Please try again.');
    }
}

// Function to load data from localStorage
function loadDataFromStorage() {
    try {
        const savedData = localStorage.getItem('studentsData');
        if (savedData) {
            studentsData = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        studentsData = []; // Reset to empty array if error
    }
}

// Additional utility functions

// Function to export data (bonus feature)
function exportData() {
    if (studentsData.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Student Name,Student ID,Email,Contact Number\n';
    studentsData.forEach(student => {
        csvContent += `${student.name},${student.id},${student.email},${student.contact}\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Function to clear all data (with confirmation)
function clearAllData() {
    const confirmed = confirm('Are you sure you want to delete ALL student records? This action cannot be undone!');
    
    if (confirmed) {
        studentsData = [];
        editingIndex = -1;
        cancelEdit();
        saveDataToStorage();
        displayStudents();
        alert('All student records have been cleared!');
    }
}

