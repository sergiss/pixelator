export class Tools {

    constructor(app) {

        this.app = app;

        // Tool buttons
        this.toolButtons = document.querySelectorAll('#tools > .btn');

        // Toggle button selection state
        this.setToolSelection = (id) => {
            this.toolButtons.forEach(button => button.setSelected(button.id === id));
            this.app.toolSelection = id;
        }

        // Initialize tool buttons
        this.toolButtons.forEach(button => {
            button.setSelected = (b) => {
                button.classList[b ? 'add' : 'remove']('selected');
            }
            button.addEventListener('click', (e) => {
                this.setToolSelection(button.id);
            });
        });

        this.setToolSelection('rect');

    }

}