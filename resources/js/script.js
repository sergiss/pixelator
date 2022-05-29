var toolSelection = null;

// Tool buttons
const toolButtons = document.querySelectorAll('#tools > .btn');

// Initialize tool buttons
toolButtons.forEach(button => {
    button.setSelected = (b) => {
        button.classList[b ? 'add' : 'remove']('selected');
    }
    button.addEventListener('click', (e) => {
        setToolSelection(button.id);
    });
});


// Toggle button selection state
const setToolSelection = (id) => {
    toolButtons.forEach(button => button.setSelected(button.id === id));
    toolSelection = id;
}

// Set initial tool selection
setToolSelection('pencil');