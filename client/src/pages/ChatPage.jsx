import React, { useState, useEffect, useRef, ReactNode } from "react";
import NavBar from "../components/NavBar/NavBar.jsx";
import { useTokenContext } from "../components/TokenContext/TokenContext";
import getCurrentPositionWeather from "../../../ChatBot/static/API Calls/weather";
import { getDDMM } from "../utilities/utilities.js";
import ChatBotResponseElement from "../components/MessageElement/ChatBotResponseElement.jsx";
import UserMessageElement from "../components/MessageElement/UserMessageElement.jsx";
import { correctDateFormat, dateAfterToday, reminderBeforeDeadline, wait, removeSpaces } from "../utilities/ChatPageUtilities.js";
import ListMessageElement from "../components/MessageElement/ListMessageElement.jsx";
import EditTaskElement from "../components/MessageElement/EditTaskElement.jsx";

/**
 * A React component that displays the page where users can interact and chat with the AI Assistant.
 * @component
 * @returns {ReactNode} A React element that renders the chatbot page.
 */
const ChatPage = () => {
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

    const [takingInput, setTakingInput] = useState(false)
    const [inConfirmation, setInConfirmation] = useState(false)
    const [input, setInput] = useState('')
    const [inputType, setInputType] = useState('')
    const [inputFlow, setInputFlow] = useState([])
    const [index, setIndex] = useState(0)
    const [taskData, setTaskData] = useState(null)
    const [tasks, setTasks] = useState([])
    const [chatMessages, setChatMessages] = useState([<ChatBotResponseElement response={`Hey${userData.username ? ' ' + userData.username : ''}! How can I help you today?`}/>])
    const lastMessage = useRef(null)

    /**
     * Array of inputs to indicate priority level.
     * @type {Array<String>}
     */
    const priorities = ['High', 'Medium', 'Low']

    /**
     * Array of inputs to quit input mode.
     * @type {Array<String>}
     */
    const quitInputs = ['quit', 'q', 'bye', 'stop', 'leave']

    /**
     * Array of inputs to go back to the previous input stage.
     * @type {Array<String>}
     */
    const backInputs = ['back', 'go back', 'previous']

    /**
     * Array of inputs to confirm.
     * @type {Array<String>}
     */
    const confirmInputs = ['confirm', 'yes', 'sure', 'okay', 'no problem']

    /**
     * Array of inputs to unconfirm.
     * @type {Array<String>}
     */
    const unconfirmInputs = ['no']

    /**
     * Array of strings to indicate each stage during addition of a new task.
     * @type {Array<String>}
     */
    const addTaskFlow = ['title', 'description', 'category', 'deadline', 'priority', 'reminder']

    /**
     * Array of strings to indicate each stage during editing of an existing task.
     * @type {Array<String>}
     */
    const editTaskFlow = ['select', 'edit']

    /**
     * A string of the quit inputs that dynamically changes depending on the quitInput array.
     * The string looks like this: 'quitInput(1), quitInput(2), ... , or quitInput(n)'
     * @type {string}
     */
    const quitInputsString = quitInputs.slice(0, -1).join(', ') + `, or ${quitInputs.slice(-1)}`

    /**
     * A string of the back inputs that dynamically changes depending on the backInput array.
     * The string looks like this: 'backInput(1), backInput(2), ... , or backInput(n)'
     * @type {string}
     */
    const backInputsString = backInputs.slice(0, -1).join(', ') + `, or ${backInputs.slice(-1)}`

    /**
     * A string of the confirm inputs that dynamically changes depending on the confirmInput array.
     * The string looks like this: 'confirmInput(1), confirmInput(2), ... , or confirmInput(n)'
     * @type {string}
     */
    const confirmInputsString = confirmInputs.slice(0, -1).join(', ') + `, or ${confirmInputs.slice(-1)}`

    /**
     * A string of the unconfirm inputs that dynamically changes depending on the unconfirmInput array.
     * The string looks like this: 'unconfirmInput(1), unconfirmInput(2), ... , or unconfirmInput(n)'
     * @type {string}
     */
    const unconfirmInputsString = `${unconfirmInputs.slice(-1)}`

    /**
     * An array of strings that shows the index, title, category and deadline in the DDMM format of each task.
     * @type {Array<string>}
     */
    const taskList = tasks.map((task, index) => {
        return `${(index + 1)}. ${task.title}, ${task.category}, ${getDDMM(task.deadline)}`
    })

    /**
     * The current task title and setter function to update it.
     * @type {[string, function]}
     */
    const [title, setTitle] = useState(taskData?.title || '');

    /**
     * The current task description and setter function to update it.
     * @type {[string, function]}
     */
    const [description, setDescription] = useState(taskData?.description || '');

    /**
     * The current task category and setter function to update it.
     * @type {[string, function]}
     */
    const [category, setCategory] = useState(taskData?.category || '');

    /**
     * The current task deadline and setter function to update it.
     * @type {[string, function]}
     */
    const [deadline, setDeadline] = useState(taskData?.deadline || '');

    /**
     * The current task priority and setter function to update it.
     * @type {[string, function]}
     */
    const [priority, setPriority] = useState(taskData?.priority || '');

    /**
     * The current task reminder date and setter function to update it.
     * @type {[string, function]}
     */
    const [reminderDate, setReminderDate] = useState(taskData?.reminderDate || '');

    /**
     * @function useEffect
     * @description Get User Info and User TaskModals if there is token.
     */
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token)
            getUserTasks()
        }
    }, [token])

    /**
     * @function useEffect
     * @description Scrolls the last message into view whenever there is a change in chatMessages.
     */
    useEffect(() => {
        lastMessage.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages])

    /**
     * Adds on the new chat bot response into the chat room.
     * @param {string} response The chat bot response.
     */
    const addNewChatBotResponse = async (response) => {
        await wait(800)
        setChatMessages(prevMessages => [...prevMessages, <ChatBotResponseElement response={response} />])
    }

    /**
     * Adds on the new user message into the chat room.
     * @param {string} message The new user message.
     */
    const addNewUserMessage = async (message) => {
        setChatMessages(prevMessages => [...prevMessages, <UserMessageElement message={message} />])
    }

    /**
     * POST Request to Add Task.
     * @async
     * @returns {Promise<void>} A promise that adds the user task.
     * @throws {Error} Throws an error if adding task fails.
     */
    const addNewTask = async () => {
        const newTask = {
            title: title,
            description: description,
            category: category,
            deadline: deadline,
            priority: priority,
            reminder: reminderDate,
            completed: false,
            points: 0,
        }

        /**
         * Data to post and make the API call.
         * @type {Object}
         */
        const dataToPost = {
            method: 'POST',
            body: JSON.stringify(newTask),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        fetch('http://localhost:5001/AddTask', dataToPost)
        .then(res => {
            if (res.ok) {
                console.log('Task Successfully Added!')
                return res.json()
            } else {
                console.error(err => 'Add Task Failed!', err)
            }
        })
        .then(task => {
            setTitle('')
            setDescription('')
            setCategory('')
            setDeadline('')
            setPriority('')
            setReminderDate('')
            getUserTasks()
        })
        .catch(err => {
            console.error('Error Adding Task: ', err.message)
        })
    }

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
                setTasks(data.tasks)
                console.log('task fetched!')
            }
        } catch (error) {
            console.error('Failed to Fetch TaskModals!', error)
        }
    }

    /**
     * DELETE Request to delete Task.
     * @async
     * @param {Number} taskId The task ID to post.
     * @returns {Promise<void>} A promise that deletes a task.
     * @throws {Error} Throws an error if deleting task fails.
     */
    const deleteTask = async (taskId) => {
        const dataToPost = {
            method: 'DELETE',
            body: JSON.stringify({taskId}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const res = await fetch('http://localhost:5001/DeleteTask', dataToPost)
            if(res) {
                await res.json()
                getUserTasks()
            }

        } catch (error) {
            console.error('Failed to Delete task!', error)
        }
    }

    /** 
     * POST Request to Edit Task.
     * @async
     * @returns {Promise<void>} A promise that edits the user task.
     * @throws {Error} Throws an error if editing task fails.
     */
   const editTask = async (editedTask) => {
       console.log('edited: ', JSON.stringify(editedTask))
       /**
        * Data to post and make the API call.
        * @type {Object}
        */
       const dataToPost = {
           method: 'PUT',
           body: JSON.stringify(editedTask),
           headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
           }
       };

       await fetch('http://localhost:5001/EditTask', dataToPost)
           .then(res => {
               if (res.ok) {
                    const editTaskSuccessMessage = 'Task has been successfully edited!'
                    addNewChatBotResponse(editTaskSuccessMessage)
                    return res.json()
               } else {
                   console.error(err => 'Edit Task Failed!', err)
               }
           })
           .then(task => {
                setTitle('')
                setDescription('')
                setCategory('')
                setDeadline('')
                setPriority('')
                setReminderDate('')
                getUserTasks()
           })
           .catch(err => {
               console.error('Error Editing Task: ', err.message)
           })
   }

    /**
     * @async
     * @returns {Promise<void>} A promise that returns a response.
     * @throws {Error} Throws an error if chatting fails.
     * @param {Object} dataToPost The data to post to the chatbot's back-end to obtain a response.
     */
    const fetchResponse = async (dataToPost) => {
        fetch('http://localhost:5500/startchat', dataToPost)
            .then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    console.log(res.statusText)
                }
            })
            .then(reply => {      
                const output = reply.response
                addNewChatBotResponse(output)
                
                handleResponseType(reply.type, reply.API_Key)
            })
            .catch(err => {
                console.error('Error Getting a Response: ', err)
            })
    }

    /** 
    * Handles user chat input and POST Request to Chat with the Assistant.
    * @async
    * @returns {void}
    */
    const handleInput = async () => {
        if (removeSpaces(input) == '') {
            setInput('')
            return
        }

        addNewUserMessage(input)
        setInput('')

        if (inConfirmation) {
            applyConfirmation(input)
            return
        }
        if (takingInput) {
            handleTakingInput(input)
            return
        }

        const model = 'model.tflearn'
        const dataToPost = {
            method: 'POST',
            body: JSON.stringify({input, model}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }

        fetchResponse(dataToPost)
        return
        
    }

    /**
     * Switches to input mode to take user inputs to add to database.
     * @param {string} inputType The input type to switch to.
     * @returns {void} Returns nothing.
     */
    const switchToInputMode = (inputType) => {
        setTakingInput(true)
        setInputType(inputType)
        setIndex(0)
        return
    }
    
    /**
     * Handles the specified response type and pass in an API key if it exists to receive a custom response from the chat bot.
     * @async
     * @param {string} responseType The response type to handle.
     * @param {string} apiKey The API Key to pass in to get certain information. 
     */
    const handleResponseType = async (responseType, apiKey) => {
        const obtainingTaskText = 'Obtaining all of your tasks...'
        const showTaskListText = `Please enter the index number of the task to ${responseType == 'DeleteTask' ? 'delete' : 'edit'} it (which means ${taskList.length == 1 ? 1 : `1 - ${taskList.length}`})!`
        const quitInstructionText = `Please say either of ${quitInputsString} to quit input mode!`
        const backInstructionText = `You can also say ${backInputsString} to go back to the previous field if you ever change your mind!`
        const titleInputText = 'Please start by entering the title of your new task~'
        const readyText = 'All set!'
        const addTaskResponseFlow = [quitInstructionText, backInstructionText, readyText, titleInputText]
        const editTaskResponseFlow = [quitInstructionText, backInstructionText, obtainingTaskText, readyText, showTaskListText, <ListMessageElement list={taskList} />]
        const deleteTaskResponseFlow = [obtainingTaskText, readyText, showTaskListText, <ListMessageElement list={taskList} />]

        switchToInputMode(responseType)
        switch (responseType) {
            case 'Weather':
                const weatherResponse = await getCurrentPositionWeather(apiKey)
                const createWeatherResponse = weatherResponse
                await addNewChatBotResponse(createWeatherResponse)
                break
            
            case 'AddTask':
                setInputFlow(addTaskFlow)
                
                for (const text of addTaskResponseFlow) {
                    await addNewChatBotResponse(text)
                }
                break
        
            case 'EditTask':
                setInputFlow(editTaskFlow)

                for (const text of editTaskResponseFlow) {
                    await addNewChatBotResponse(text)
                }
                break
            
            case 'DeleteTask':
                for (const text of deleteTaskResponseFlow) {
                    await addNewChatBotResponse(text)
                }
                break
            
            case 'Priority':

                break    
        }
    }

    /**
     * Handles user input during input mode.
     * @async
     * @param {string} input The user input.
     * @returns {void}
     */
    const handleTakingInput = async (input) => {
        if (quitInputs.includes(input.toLowerCase())) {
            setTakingInput(false)
            setInConfirmation(false)
            setIndex(0)
            await addNewChatBotResponse('Quitting input mode.')
            await addNewChatBotResponse('Back to normal! What would you like to do next?')
            return
        }

        if (index > 0 && backInputs.includes(input.toLowerCase())) {
            setIndex(index - 1)
            await addNewChatBotResponse('Understood!')

            switch (inputType) {
                case 'AddTask':
                    await addNewChatBotResponse(`Please re-input the value for the ${inputFlow[index - 1]}.`)
                    break
                
                case 'EditTask':
                    await addNewChatBotResponse('Let me get the list again...')
                    redirectInputToEditTask(input, index - 1)
                    break
            }
            return
        }

        if (index == 0 && backInputs.includes(input.toLowerCase())) {
            await addNewChatBotResponse('We are already at the beginning!')
            return
        }

        switch (inputType) {
            case 'AddTask':
                redirectInputToAddTask(input)
                break

            case 'EditTask':
                redirectInputToEditTask(input, index)
                break

            case 'DeleteTask':
                redirectInputToDeleteTask(input)
                break

            case 'Priority':

                break

        }
    }

    const processInputBasedOnStage = async (inputStage) => {
        switch (inputStage) {
            case 'title':
                setTitle(input)
                break

            case 'description':
                setDescription(input)
                break

            case 'category':
                setCategory(input)
                break

            case 'deadline':
                const isDeadlineValid = await checkDeadline(input)
                if (!isDeadlineValid) {
                    return false
                }    
                setDeadline(input)
                break

            case 'priority':
                const isPriorityValid = await checkPriority(input)
                if (!isPriorityValid) {
                    return false
                }
                setPriority(input)
                break

            case 'reminder':
                const isReminderValid = await checkReminder(input, deadline)
                if (!isReminderValid) {
                    return false
                }
                setReminderDate(input)
                break
        }
        return true
    }

    /**
     * Generates messages for the next stage of user input.
     * @param {string} nextStage The next stage in the current input flow.
     * @returns {void}
     */
    const generateNextStageMessage = async (nextStage) => {
        switch (nextStage) {
            case 'description':
                await addNewChatBotResponse(`Sweet! Please enter the ${inputFlow[index + 1]}.`)
                break

            case 'category':
                await addNewChatBotResponse(`Sweet! Please enter the ${inputFlow[index + 1]}.`)
                break
            
            case 'deadline':
                await addNewChatBotResponse('Great! Please enter the deadline in the format of YYYY-MM-DD.')
                break
            
            case 'priority':
                await addNewChatBotResponse('Nice! Please set a priority level of High, Medium or Low!')
                break
            
            case 'reminder':
                await addNewChatBotResponse('Great! Please enter the reminder date in the format of YYYY-MM-DD.')
                break
        }
        return
    }

    /**
     * Once in input mode, all user inputs are redirected here to set the inputs for adding a new task.
     * @async
     * @param {string} input The user input.
     * @returns {void}
     */
    const redirectInputToAddTask = async (input) => {
        const currFlowStage = inputFlow[index]
        console.log('index: ' + index)
        const inputAccepted = await processInputBasedOnStage(currFlowStage)

        if (inputAccepted) {
            const next = index + 1
            const nextStage = inputFlow[next]
            
            setIndex(next)
    
            index == inputFlow.length - 1 ? 
                await generateConfirmation(inputType) : 
                await generateNextStageMessage(nextStage)
        }
    } 

    /**
     * Once in input mode, all user inputs are redirected here to set the inputs for deleting an existing task.
     * @async
     * @param {string} input The user input.
     * @returns {void}
     */
    const redirectInputToDeleteTask = async (input) => {
        const isInputValid = await isInputNumberValid(input, tasks)
        if (!isInputValid) {
            return
        }

        setIndex(parseInt(input))
        await generateConfirmation(inputType, input)
        return
    }
    
    /**
     * Once in input mode, all user inputs are redirected here to set the inputs for editing an existing task.
     * @async
     * @param {string} input The user input.
     * @param {Number} index The current index that indicates the flow stage.
     * @returns {void}
     */
    const redirectInputToEditTask = async (input, index) => {
        const currFlowStage = inputFlow[index]

        switch (currFlowStage) {
            case 'select':
                const isInputValid = await isInputNumberValid(input, tasks)
                if (!isInputValid) {
                    return
                }
                
                const taskToEdit = tasks[input - 1]
                const selectFieldToEditText = 'Please select a field to edit!'

                await addNewChatBotResponse(<EditTaskElement applyConfirmation={applyConfirmation} taskToEdit={taskToEdit} />)
                await addNewChatBotResponse(selectFieldToEditText)
                break

            case 'edit':
                await addNewChatBotResponse('Use any of the quit or back commands to leave the session or go back a step!')               
                break
        }

        const next = index + 1
        setIndex(next)
        return
    }

    /**
     * Checks if the given input string is a number and is within the valid range.
     * @param {string} input The input number as a string.
     * @returns {boolean} true or false.
     */
    const isInputNumberValid = async (input, tasks) => {
        if (isNaN(input)) {
            const notANumberText = 'Input must be a number!'
            await addNewChatBotResponse(notANumberText)
            return false
        }
        if (input < 1 || input > tasks.length) {
            const indexOutOfRangeText = `Your index is out of range, please tell me a valid one to ${inputType == 'DeleteTask' ? 'delete' : 'edit'}.`
            await addNewChatBotResponse(indexOutOfRangeText)
            return false
        }
        return true
    }

    /**
     * Checks for the input priorty format.
     * @async
     * @param {string} priority The input priority.
     * @returns {boolean} true or false.
     */
    const checkPriority = async (priority) => {
        if (!priorities.includes(priority)) {
            await addNewChatBotResponse('For consistency please use the exact words for priority!')
            return false
        }
        return true
    }

    /**
     * Checks for the input reminder format.
     * @param {string} reminder The input reminder.
     * @returns {boolean} true or false.
     */
    const checkReminder = async (reminder, deadline) => {
        if (!correctDateFormat(reminder)) {
            await addNewChatBotResponse('Wrong format, please try again.')
            return false
        }
        if (!dateAfterToday(reminder)) {
            await addNewChatBotResponse('Reminder should not come before today you silly! Please try again.')
            return false
        }
        if (!reminderBeforeDeadline(reminder, deadline)) {
            await addNewChatBotResponse('I have to reminder you before the deadline remember? Please try again.')
            return false
        }
        return true
    }

    /**
     * Checks for the input deadline format.
     * @async
     * @param {string} deadline The input deadline.
     * @returns {boolean} true or false.
     */
    const checkDeadline = async (deadline) => {
        if (!correctDateFormat(deadline)) {
            await addNewChatBotResponse('Wrong format, please try again.')
            return false
        }
        if (!dateAfterToday(deadline)) {
            await addNewChatBotResponse('Deadline should not come before today you silly! Please try again.')
            return false
        }
        return true
    }

    /**
     * Generates the confirmation text and asks for confirmation from the user based on the input type.
     * @async
     * @param {string} inputType The input type (i.e. AddTask, EditTask, DeleteTask etc.).
     * @param {string} input The user input.
     */
    const generateConfirmation = async (inputType, input) => {
        setInConfirmation(true)
        await addNewChatBotResponse('Hold on a moment...')
        await wait(1000)

        const generalConfirmationText = [`Please enter ${confirmInputsString} to proceed.`, ` Or enter ${unconfirmInputsString} to leave.`]
        switch (inputType) {
            case 'AddTask':
                const summaryText = ['Your new task to be added will be:',
                `Title: ${title}`,
                `Description: ${description}`,
                `Category: ${category}`,
                `Deadline: ${deadline}`,
                `Priority: ${priority}`,
                `Reminder: ${reminderDate}`, 
                'Would that be okay?']


                await addNewChatBotResponse(<ListMessageElement list={summaryText} />)
                await addNewChatBotResponse(<ListMessageElement list={generalConfirmationText} />)
                setIndex(0)
                break

            case 'EditTask':
                break

            case 'DeleteTask':
                const taskIndex = input - 1
                const deleteTaskConfirmationText = `Task ${taskList[taskIndex]} will be deleted.`
                await addNewChatBotResponse(deleteTaskConfirmationText)
                await addNewChatBotResponse(generalConfirmationText)
                break

        }
        setTakingInput(false)
    }

    /**
     * Applies confirmation if the input exists in the confirmInput array and does different tasks based on the current input type.
     * @param {string} input The confirmation input.
     * @param {Object} data The data to be used in confirmation.
     * @returns {void}
     */
    const applyConfirmation = async (input, data) => {
        if (unconfirmInputs.includes(input.toLowerCase()) || quitInputs.includes(input.toLowerCase())) {
            setTakingInput(false)
            setInConfirmation(false)
            await addNewChatBotResponse('Leaving confirmation mode...')
            await addNewChatBotResponse('Back to normal! What would you like to do next?')
            return
        }

        if (!confirmInputs.includes(input.toLowerCase())) {
            await addNewChatBotResponse('Your confirmation is not clear enough, please try again.')
            return
        }
        switch (inputType) {
            case 'AddTask':
                await addNewTask()

                const addTaskSuccessMessage = 'Task has been successfully added!'
                await addNewChatBotResponse(addTaskSuccessMessage)
                break
            
            case 'DeleteTask':
                const taskId = tasks[index - 1].id
                await deleteTask(taskId)

                const deleteTaskSuccessMessage = 'Task has been successfully deleted!'
                await addNewChatBotResponse(deleteTaskSuccessMessage)
                break
            
            case 'EditTask':
                const editedTaskInfoValid = await checkEditedTaskInfo(data)
                if (editedTaskInfoValid) {
                    await editTask(data)
                } else {
                    const invalidEditTaskInfoText = 'Some fields are empty/ invalid! Please fill them out properly!'
                    await addNewChatBotResponse(invalidEditTaskInfoText)
                    break
                }
        }
        setInputType('')
        setIndex(0)
        setInConfirmation(false)
    }

    const checkEditedTaskInfo = async (data) => {
        return data.title != '' && data.description != '' && data.category != '' && data.deadline != '' && checkPriority(data.priority) && checkDeadline(data.deadline) && checkReminder(data.reminder, data.deadline)
    }
    return (
        <>
            <NavBar />
            <h1>Assistant Window</h1>
            <div className="chatpageContainer">

                <div className="chatroom" id="chatroom" ref={lastMessage}>
                    {...chatMessages}
                </div> 
                
                <div className="chatboxContainer">
                    <input 
                        id="chatbox" 
                        onChange={(e) => setInput(e.target.value)} 
                        value={input} 
                        placeholder="Enter an Input"
                        autoComplete="off"
                        onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                handleInput()
                            }
                        }}
                        >
                            
                    </input>
                    <button onClick= {() => handleInput()} className="sendButton"></button>
                    <span className="border"></span>
                </div>

            </div>

        </>
    )
}

export default ChatPage