// storageManager is an object of functions

const storageManager = {

    saveTodos: (todosData) => {
        localStorage.setItem('todosData', JSON.stringify(todosData))
    },
    loadTodos: () => {
        const saved = localStorage.getItem('todosData')     
        return saved ? JSON.parse(saved) : {}
    }

}


document.addEventListener('DOMContentLoaded', function () {

    let todosData = storageManager.loadTodos()
    let currentDate = new Date();

    updateDateDisplay()
    changeTodosForCurrentDate()

    document.querySelector(".addEvent").addEventListener("click", addGeneralTodo)
    document.querySelector(".addCategory").addEventListener("click", addNewCategory)
        
    // going to prev date

    document.querySelector(".prevDate").addEventListener("click", function () {

        saveCurrentTodos()
        currentDate.setDate(currentDate.getDate() - 1)
        updateDateAndTodos()

    })

    // going to next date

    document.querySelector(".nextDate").addEventListener("click", function () {

        saveCurrentTodos()
        currentDate.setDate(currentDate.getDate() + 1)
        updateDateAndTodos()

    })

    document.querySelector(".currentDate").addEventListener('click', function () {
        
        document.querySelector(".calendar").showPicker()

    })

    document.querySelector(".calendar").addEventListener('change', function (e) {

        saveCurrentTodos()
        currentDate = new Date(e.target.value)
        updateDateAndTodos()
        
    })

    function updateDateAndTodos() {

        updateDateDisplay()
        changeTodosForCurrentDate()
        
    }

    // displays the date and day, corresponding to the date selected by the user

    function updateDateDisplay() {

        const options = { month: 'short', day: 'numeric' }
        document.querySelector(".currentDate").textContent = currentDate.toLocaleDateString('en-US', options)
        document.querySelector(".calendar").valueAsDate = currentDate

        const dayOptions = { weekday: 'long' }
        document.querySelector(".heading").textContent = currentDate.toLocaleDateString('en-US', dayOptions)

    }

    function getDateKey(date) {

        return date.toISOString().split('T')[0]

    }

    // Adding a general (non-categorized) to-do

    function addGeneralTodo() {

        const form = document.getElementById("general")
        const item = createTodoItem()
        form.appendChild(item)
        item.querySelector('input[type="text"]').focus()
        saveCurrentTodos()

    }

    // Adding a new category

    function addNewCategory() {
        const categoriesContainer = document.querySelector(".byCategory")
        const category = createCategoryElement("")
        categoriesContainer.appendChild(category)
        saveCurrentTodos()
    }

    function createCategoryElement(categoryName) {

        const category = document.createElement("div")
        category.className = "category"

        const field = document.createElement("fieldset")
        const legend = document.createElement("legend")
        const nameInput = document.createElement("input")
        nameInput.type = "text"
        nameInput.placeholder = "Category"
        nameInput.value = categoryName
        nameInput.addEventListener('input', saveCurrentTodos)

        const categorizedDiv = document.createElement("div")
        categorizedDiv.className = "categorized"

        const form = document.createElement("form")
        form.className = "custom-checkboxes listForCategory"

        const addButton = document.createElement("div")
        addButton.className = "add2"
        addButton.textContent = "+"
        addButton.addEventListener("click", function () {
            const item = createTodoItem()
            form.appendChild(item)
            item.querySelector('input[type="text"]').focus()
            saveCurrentTodos()
        })

        categorizedDiv.append(form, addButton)
        legend.appendChild(nameInput)
        field.append(legend, categorizedDiv)
        category.appendChild(field)

        return category
    }


    // Adding a to-do

    function createTodoItem(text = "", isChecked = false) {

        const item = document.createElement("div")
        item.className = "item"

        const label = document.createElement("label")
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.checked = isChecked
        checkbox.addEventListener('change', saveCurrentTodos)

        const customCheck = document.createElement("span")
        customCheck.className = "custom-check"

        const input = document.createElement("input")
        input.type = "text"
        input.placeholder = "To - Do"
        input.value = text
        input.addEventListener('input', saveCurrentTodos)
        
        label.append(checkbox, customCheck, input)
        
        const iconSpan = document.createElement("span")
        
        const editIcon = document.createElement("img")
        editIcon.src = "edit.svg"
        editIcon.addEventListener("click", function () {
            input.focus()
        })

        const deleteIcon = document.createElement("img")
        deleteIcon.src = "bin.svg"
        deleteIcon.addEventListener("click", function () {
            item.remove()
            saveCurrentTodos()
        })

        iconSpan.append(editIcon, deleteIcon)
        item.append(label, iconSpan)

        return item
    }

    // Saving a to-do at local storage

    function saveCurrentTodos() {
        const dateKey = getDateKey(currentDate)

        // To save general to-do
        const generalTodos = []
        document.querySelectorAll("#general .item").forEach(item => {
            const input = item.querySelector("input[type='text']")
            const checkbox = item.querySelector("input[type='checkbox']")
            if (input.value.trim() !== '') {
                generalTodos.push({
                    text: input.value.trim(),
                    checked: checkbox.checked
                })
            }
        })

        // To save a category to-do
        const categories = {}
        document.querySelectorAll(".byCategory .category").forEach(categoryEl => {
            const categoryName = categoryEl.querySelector("input[type='text']").value.trim()
            if (categoryName === '') return

            const items = []
            categoryEl.querySelectorAll(".item").forEach(item => {
                const input = item.querySelector("input[type='text']")
                const checkbox = item.querySelector("input[type='checkbox']")
                if (input.value.trim() !== '') {
                    items.push({
                        text: input.value.trim(),
                        checked: checkbox.checked
                    })
                }
            })

            categories[categoryName] = items
        })

        todosData[dateKey] = {
            general: generalTodos,
            categories: categories
        }

        storageManager.saveTodos(todosData)
    }

    // to change current to do list for corresponding date

    function changeTodosForCurrentDate() {
        const dateKey = getDateKey(currentDate)
        const todosForDate = todosData[dateKey] || { general: [], categories: {} }

        //setting the current html content as void
        document.getElementById("general").innerHTML = ''
        document.querySelector(".byCategory").innerHTML = ''

        // change general todos
        todosForDate.general.forEach(todo => {
            const item = createTodoItem(todo.text, todo.checked)
            document.getElementById("general").appendChild(item)
        })

        // change categories
        for (const [categoryName, items] of Object.entries(todosForDate.categories)) {
            const category = createCategoryElement(categoryName)
            const form = category.querySelector(".custom-checkboxes")

            items.forEach(todo => {
                const item = createTodoItem(todo.text, todo.checked)
                form.appendChild(item)
            })

            document.querySelector(".byCategory").appendChild(category)
        }
    }

    
})
