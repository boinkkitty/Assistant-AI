import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import {TokenProvider} from "../../src/components/TokenContext/TokenContext.jsx";
import AddEditTasks from '../../src/components/TaskModals/AddEditTasks.jsx'; // Adjust the path as per your file structure

describe('AddEditTasks Component', () => {
    it('renders Add mode on add correctly and loads details', () => {
        render(<AddEditTasks taskData={null} />, {
            wrapper: TokenProvider,
        });

        // Assert that the component renders correctly in Add mode

        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument()
        expect(titleInput).toHaveValue('');
        fireEvent.change(titleInput, { target: { value: 'Test Title' } });
        expect(titleInput).toHaveValue('Test Title');

        const descriptionInput = screen.getByLabelText('Description');
        expect(descriptionInput).toBeInTheDocument()
        expect(descriptionInput).toHaveValue('');
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        expect(descriptionInput).toHaveValue('Test Description');

        const categoryInput = screen.getByLabelText('Category');
        expect(categoryInput).toBeInTheDocument()
        expect(categoryInput).toHaveValue('');
        fireEvent.change(categoryInput, { target: { value: 'Test Cat' } });
        expect(categoryInput).toHaveValue('Test Cat');

        const priorityInput = screen.getByLabelText('Priority');
        expect(priorityInput).toBeInTheDocument()
        expect(priorityInput).toHaveValue('');
        fireEvent.change(priorityInput, { target: { value: 'Low' } });
        expect(priorityInput).toHaveValue('Low');

        const deadlineInput = screen.getByLabelText('Deadline:');
        expect(deadlineInput).toBeInTheDocument()
        expect(deadlineInput).toHaveValue('');
        fireEvent.change(deadlineInput, { target: { value: '2025-09-09' } });
        expect(deadlineInput).toHaveValue('2025-09-09');

        const reminderInput = screen.getByLabelText('Reminder Date:');
        expect(reminderInput).toBeInTheDocument()
        expect(reminderInput).toHaveValue('');
        fireEvent.change(reminderInput, { target: { value: '2025-08-08' } });
        expect(reminderInput).toHaveValue('2025-08-08');

        const addButton = screen.getByText('ADD')
        expect(addButton).toBeInTheDocument();
    });

    it('renders Edit mode correctly', () => {

        const mockTaskData = {
            id: '3',
            title: 'Mock Task',
            description: 'Mock Description',
            category: 'Mock Category',
            deadline: '2025-09-09',
            priority: 'Medium',
            reminder: '2025-07-08',
            completed: false,
            points: 0,
        };

        render(<AddEditTasks
            taskData={mockTaskData}
            type="edit"
            getAllTasks={() => {}}
            onClose={() => {}}
        />, {
            wrapper: TokenProvider,
        });

        // Assert that the component renders correctly in Add mode

        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument()
        expect(titleInput).toHaveValue('Mock Task');

        const descriptionInput = screen.getByLabelText('Description');
        expect(descriptionInput).toBeInTheDocument()
        expect(descriptionInput).toHaveValue('Mock Description');

        const categoryInput = screen.getByLabelText('Category');
        expect(categoryInput).toBeInTheDocument()
        expect(categoryInput).toHaveValue('Mock Category');

        const priorityInput = screen.getByLabelText('Priority');
        expect(priorityInput).toBeInTheDocument()
        expect(priorityInput).toHaveValue('Medium');

        const deadlineInput = screen.getByLabelText('Deadline:');
        expect(deadlineInput).toBeInTheDocument()
        expect(deadlineInput).toHaveValue('2025-09-09');

        const reminderInput = screen.getByLabelText('Reminder Date:');
        expect(reminderInput).toBeInTheDocument()
        expect(reminderInput).toHaveValue('2025-07-08');

        const updateButton = screen.getByText('UPDATE')
        expect(updateButton).toBeInTheDocument();
    });
});

