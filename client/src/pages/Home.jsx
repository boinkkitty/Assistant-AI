import React, { useCallback, useEffect, useState, ReactNode } from 'react'
import NavBar from "../components/NavBar/NavBar.jsx"
import TasksBox from "../components/TasksCardsAndBox/TasksBox"
import Modal from 'react-modal';
import { useTokenContext } from "../components/TokenContext/TokenContext"
import AddEditTasks from "../components/TaskModals/AddEditTasks"
import CompleteDeleteTasks from "../components/TaskModals/CompleteDeleteTasks"
import ProductivityBar from "../components/ProductivityBar/ProductivityBar.jsx"
import { isTaskOverdue, isTaskNeededToBeReminded, isTaskUpcoming, isTodayBirthday, isTodayNextDayOfBirthday, compareTasksPriority, compareTasksDeadline, calculateTaskProductivity } from "../utilities/utilities.js"
import AIBox from '../components/AIBox/AIBox.jsx'
import BirthdayCard from '../components/Birthday/BirthdayCard.jsx'
import ChatRoom from '../components/ChatRoom/ChatRoom.jsx'
import { wait } from '../utilities/ChatPageUtilities.js';

/**
 * A React component that displays the home page and a brief layout of the current user tasks, including the navigation bar, 4 task boxes, and the modal to add or edit tasks.
 * @component
 * @returns {ReactNode} A React element that renders the home page.
 */
const Home = () => {
    const {tokenStatus, userInfo} = useTokenContext()
    /**
     * The current token and setter function to update it.
     * @type {[string, function]}
     */
    const [token, setToken] = tokenStatus

    /**
     * The current user data and setter function to update it.
     * @type {[Object, function]}
     */
    const [userData, setUserData] = userInfo

    /**
     * The current user tasks and setter function to update it.
     * @type {[Array<Object>, function]}
     */
    const [tasks, setTasks] = useState([])

    /**
     * Filters the uncompleted task and sort them by the deadline.
     * @type {Array<Object>} The list of uncompleted tasks sorted by deadline.
     */
    const uncompletedTasks = tasks.filter(task => !task.completed).sort(compareTasksDeadline) || []
    const productivity = calculateTaskProductivity(tasks)

    /**
     * @function useEffect
     * @description Get User Info and User TaskModals if there is token
     */
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            getUserInfo()
            getUserTasks()
        }
    }, [token]);

    /**
     * Async GET method to get user tasks.
     * @async
     * @returns {Promise<void>} A promise that gets the current user's tasks.
     * @throws {Error} Throws an error if getting user tasks fails.
     */
    const getUserTasks = async () => {
        const dataToPost = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const res = await fetch('http://localhost:5001/Tasks', dataToPost)
            if (res.ok) {
                console.log("TaskModals successfully retrieved")
            } else {
                console.log("Invalid User/TaskModals")
            }

            const data = await res.json()
            if (data) {
                console.log('Type of TaskModals: ' + typeof data.tasks + ', TaskModals: ' + data.tasks + ', isArray? ' + Array.isArray(data.tasks))
                setTasks(data.tasks)
                console.log(data.tasks)
            }
        } catch (error) {
            console.error('Failed to Fetch TaskModals!', error)
        }
    }

    /**
     * Async GET method to get user data.
     * @async
     * @returns {Promise<void>} A promise that gets the current user's data.
     * @throws {Error} Throws an error if getting user data fails.
     */
    const getUserInfo = async () => {
        const dataToPost = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const res = await fetch('http://localhost:5001/GetUserInfo', dataToPost)
            if (res.ok) {
                console.log("UserInfo successfully retrieved")
            } else {
                console.log("Invalid User/Info")
            }

            const data = await res.json()
            if (data) {
                console.log(data)
                setUserData(data)
            }
        } catch (error) {
            console.error('Failed to Fetch User Info!', error)
        }
    }

    /**
     * The current state of AddEditModal and setter function to update it.
     * @type {[Object, function]}
     */
    const[addEditModalOpen, setAddEditModalOpen] = useState({
        isShown: false,
        type: "add",
        data: null,
    })

    /**
     * The current state of CompleteDeleteModal and setter function to update it.
     * @type {[Object, function]}
     */
    const[compDelModalOpen, setCompDelModalOpen] = useState({
        isShown: false,
        type: "del",
        data: null,
    })

     /**
     * The current state of BirthdayModal and setter function to update it.
     * @type {[Object, function]}
     */
    const [birthdayModalOpen, setBirthdayModalOpen] = useState({
        isShown: false,
    })

    /**
     * The current state of ChatRoomModal and setter function to update it.
     * @type {[Object, function]}
     */
    const [chatRoomModalOpen, setChatRoomModalOpen] = useState({
        isShown: false,
        data: {
            overduewdTasks: [],
            remindersTasks: [],
            upcomingTasks: [],
            priorityTasks: [],
        },
    })
    
    /**
     * Closes the Add Edit Task Modal.
     */
    const closeAddEditModal = () => {
        setAddEditModalOpen({
            isShown: false,
            type: "add",
            data: null,
        })
    }

    /**
     * Closes the Complete Delete Task Modal.
     */
    const closeCompDelModal = () => {
        setCompDelModalOpen({
            isShown: false,
            type: "del",
            data: null,
        })
    }

    /**
     * Closes the Birthday Modal.
     */
    const closeBirthdayModal = () => {
        setBirthdayModalOpen({
            isShown: false,
        })
        localStorage.setItem('birthdayShown', true)
    }

    /**
     * Closes the Chat Room Modal.
     */
    const closeChatRoomModal = () => {
        setChatRoomModalOpen({
            isShown: false,
            data: {
                overduedTasks: [],
                remindersTasks: [],
                upcomingTasks: [],
                priorityTasks: [],
            },
        })
    }

    /**
     * Open Modal when user wants to add task, to load empty page.
     */
    const handleAddTask = () => {
        setAddEditModalOpen({
            isShown: true,
            type: "add",
            data: null, //To add data
        })
    }

    /** 
     * Open Modal when user wants to edit, to load current note data.
     * @param {Object} taskData Data of current task.
     */
    const handleEditTask = (taskData) => {
        // To receive data
        setAddEditModalOpen({
            isShown: true,
            type: "edit",
            data: taskData, //To add data
        })
    }

    /**
     * Open Modal when user wants to delete task.
     * @param {Object} taskData Data of current task.
     */
    const handleDeleteTask = (taskData) => {
        setCompDelModalOpen({
            isShown: true,
            type: "del",
            data: taskData,
        })
    }

    /** 
     * Open Modal when user wants to complete task.
     * @param {Object} taskData Data of current task.
     */
    const handleCompleteTask = (taskData) => {
        setCompDelModalOpen({
            isShown: true,
            type: "comp",
            data: taskData,
        })
    }

    /**
     * Open modal when it's the user's birthday.
     */
    const handleBirthday = () => {
        setBirthdayModalOpen({
            isShown: true,
        })
    }

    /**
     * Open modal for daily reminder.
     */
    const handleDailyReminder = () => {
        setChatRoomModalOpen({
            isShown: true,
            data: {
                overduedTasks: overduedTasks,
                remindersTasks: remindersTasks,
                upcomingTasks: upcomingTasks,
                priorityTasks: priorityTasks,
            }
        })
    }

    /** 
     * Array of Overdued TaskModals.
     * @type {Array<Object>}
     */
    const overduedTasks = uncompletedTasks.filter(each => isTaskOverdue(each))

    /**
     * Array of tasks with reminders before or equals to current date and isn't overdue.
     * @type {Array<Object>}
     */
    const remindersTasks = uncompletedTasks.filter(each => isTaskNeededToBeReminded(each) && !isTaskOverdue(each))

    /** 
     * Array of upcoming tasks.
     * @type {Array<Object>}
     */
    const upcomingTasks = uncompletedTasks.filter(each => isTaskUpcoming(each));

    /**
     * Array of tasks sorted from high to low priority.
     * @type {Array<Object>}
     */
    const priorityTasks = uncompletedTasks.sort(compareTasksPriority)

    /**
     * @function useEffect
     * @description Checks if birthdayShown exists in the local storage, sets it if not.
     */
    useEffect(() => {
        const birthdayShownStored = localStorage.getItem('birthdayShown')

        if (!birthdayShownStored) {
            localStorage.setItem('birthdayShown', false)
        }
    }, [])

    /**
     * @function useEffect
     * @description Checks whether today is user's birthday and shows the birthday card if it is.
     */
    useEffect(() => {
        const birthday = userData.dateOfBirth
        if (!birthday) {
            return
        }

        const birthdayShown = JSON.parse(localStorage.getItem('birthdayShown'))
        if (isTodayBirthday(birthday) && !birthdayShown) {
            handleBirthday()
        }
    }, [userData])

    /**
     * @function useEffect
     * @description Resets birthdayShown state the next day after user's birthday.
     */
    useEffect(() => {
        const birthday = userData.dateOfBirth
        //const birthday = 'Thu Jul 03 2024 17:46:09 GMT+0800 (Malaysia Time)'
        if (isTodayNextDayOfBirthday(birthday)) {
            localStorage.setItem('birthdayShown', false)
        }
    }, [])

    /**
     * @function useEffect
     * @description Opens the Chat Room modal everyday for the daily reminder.
     */
    useEffect(() => {
        const waitForABit = async () => {
            await wait(5000)
            handleDailyReminder()
        }
        waitForABit()
    }, [])

    return (
        <>
        <NavBar />
        <div className="homepageContainer">
            <div className="overdueAndRemindersBox">
                <TasksBox id="overdueBox" key="Overdued" title="Overdued" tasks={tasks} tasksToShow={overduedTasks} onEdit={handleEditTask} onComplete={handleCompleteTask}  onDelete={handleDeleteTask}/>
                <TasksBox key="Reminders" title="Reminders" tasks={tasks} tasksToShow={remindersTasks} onEdit={handleEditTask} onComplete={handleCompleteTask}  onDelete={handleDeleteTask} />
            </div>
            <div className="upcomingAndPriorityBox">
                <TasksBox key="Upcoming" title="Upcoming" tasks={tasks} tasksToShow={upcomingTasks} onEdit={handleEditTask} onComplete={handleCompleteTask}  onDelete={handleDeleteTask}/>
                <TasksBox key="Priority" title="Priority" tasks={tasks} tasksToShow={priorityTasks} onEdit={handleEditTask} onComplete={handleCompleteTask}  onDelete={handleDeleteTask}/>
            </div>

                {!token ? (
                    <div className="assistantCharacterBox">
                        <div>
                            <h2>Please Log In or Sign Up to Add Tasks!</h2>
                        </div>
                    </div>
                        ) : (
                        <div className="assistantCharacterBox">
                            <div className="addButtonBox">
                                <button className="addTaskBtn" onClick={handleAddTask}>Add Task</button>
                            </div>
                            <div className="userDisplayBox">
                                <div>Points: {userData?.points || 0}</div>
                                <div className="productivityBox">
                                    <h3>Productivity Report</h3>
                                    <ProductivityBar percentage={productivity}/>
                                    <h3>{productivity}%</h3>
                                </div>
                            </div>

                            <AIBox stylingCondition={'Home'}/>

                        </div>
                        )}

                    </div>
                    <Modal
                    isOpen={addEditModalOpen.isShown}
            onRequestClose={closeAddEditModal}
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)"
                },
            }}
            contentLabel=""
            className="AddEditTaskModal"
        >
            <AddEditTasks
                type={addEditModalOpen.type}
                taskData={addEditModalOpen.data}
                onClose={closeAddEditModal}
                getAllTasks={getUserTasks}
            />
        </Modal>
        <Modal
            isOpen={compDelModalOpen.isShown}
            onRequestClose={closeCompDelModal}
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)"
                },
            }}
            contentLabel=""
            className="CompDelTaskModal"
        >
            <CompleteDeleteTasks
                type={compDelModalOpen.type}
                taskData={compDelModalOpen.data}
                onClose={closeCompDelModal}
                getAllTasks={getUserTasks}
                getUserInfo={getUserInfo}
            />
        </Modal>
        <Modal
            isOpen = {birthdayModalOpen.isShown}
            onRequestClose={closeBirthdayModal}
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)"
                }
            }}
            className="BirthdayCardModal"
            >
            <BirthdayCard 
                onClose={closeBirthdayModal}
            />
        </Modal>
        <Modal
            isOpen = {chatRoomModalOpen.isShown}
            onRequestClose={closeChatRoomModal}
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)"
                }
            }}
            className="ChatRoomModal"
        >

            <ChatRoom 
                closeChatRoomModal={closeChatRoomModal} 
                taskData={chatRoomModalOpen.data}
            />
        </Modal>
        </>
    )
    
}
            
    


export default Home;