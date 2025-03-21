import React from "react";
import RecurringTasks from "./RecurringTasks.jsx";

const RecurringTasksTable = ({recurringTasks, onEdit, onDelete}) => {
    return (
        <div className="recurringTasksTable">
            <div className="recTableHeader">
                <div className="recTableColumn recTableTitle">Title</div>
                <div className="recTableColumn">Category</div>
                <div className="recTableColumn">Priority</div>
                <div className="recTableColumn">Last Created</div>
                <div className="recTableColumn">Last Deadline</div>
                <div className="recTableColumn">Next Creation</div>
                <div className="recTableColumn">Next Deadline</div>
                <div className="recTableColumn">Interval</div>
                <div className="recTableColumn">Reminder</div>
                <div className="recTableColumn recTableActions">Actions</div>
            </div>
            <div className="recTableBody">
                {recurringTasks.map((recTask, index) => (
                    <RecurringTasks key={index} recurringTask={recTask} onEdit={() => onEdit(recTask)} onDelete={() => onDelete(recTask)}/>
                ))}
            </div>
        </div>
    )
}

export default RecurringTasksTable